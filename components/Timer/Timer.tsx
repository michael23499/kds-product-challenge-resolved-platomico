import { useElapsedTime } from "@/hooks/useElapsedTime"
import s from "./Timer.module.scss"

type TimerProps = {
	startTime: string | undefined
	warning?: number
	danger?: number
}

export default function Timer({ startTime, warning = 180, danger = 300 }: TimerProps) {
	const elapsed = useElapsedTime(startTime)

	if (!startTime || !elapsed) return null

	const start = new Date(startTime).getTime()
	const now = Date.now()
	const seconds = Math.floor((now - start) / 1000)

	let status = "normal"
	if (seconds >= danger) {
		status = "danger"
	} else if (seconds >= warning) {
		status = "warning"
	}

	return (
		<span className={`${s["pk-timer"]} ${s[`pk-timer--${status}`]}`}>
			{elapsed}
		</span>
	)
}
