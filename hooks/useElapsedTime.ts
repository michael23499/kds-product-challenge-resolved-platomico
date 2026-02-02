import { useEffect, useState } from "react"

export function useElapsedTime(startTime: string | Date | undefined) {
	const [elapsed, setElapsed] = useState("")

	useEffect(() => {
		if (!startTime) {
			setElapsed("")
			return
		}

		const calculateElapsed = () => {
			const start = new Date(startTime).getTime()
			const now = Date.now()
			const diff = Math.floor((now - start) / 1000)

			const minutes = Math.floor(diff / 60)
			const seconds = diff % 60

			if (minutes > 0) {
				setElapsed(`${minutes}m ${seconds.toString().padStart(2, "0")}s`)
			} else {
				setElapsed(`${seconds}s`)
			}
		}

		calculateElapsed()
		const interval = setInterval(calculateElapsed, 1000)

		return () => clearInterval(interval)
	}, [startTime])

	return elapsed
}
