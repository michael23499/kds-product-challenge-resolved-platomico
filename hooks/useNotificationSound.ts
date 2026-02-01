import { useCallback, useRef } from "react"

export function useNotificationSound() {
	const audioContextRef = useRef<AudioContext | null>(null)

	const playSound = useCallback(() => {
		try {
			if (!audioContextRef.current) {
				audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
			}

			const ctx = audioContextRef.current

			// Create oscillator for notification sound
			const oscillator = ctx.createOscillator()
			const gainNode = ctx.createGain()

			oscillator.connect(gainNode)
			gainNode.connect(ctx.destination)

			// Configure sound - friendly notification beep
			oscillator.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
			oscillator.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1) // C#6 note
			oscillator.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.2) // E6 note

			oscillator.type = "sine"

			// Volume envelope
			gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
			gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

			oscillator.start(ctx.currentTime)
			oscillator.stop(ctx.currentTime + 0.4)
		} catch (error) {
			console.warn("Could not play notification sound:", error)
		}
	}, [])

	return { playSound }
}
