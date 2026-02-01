import { useEffect } from "react"
import s from "./Toast.module.scss"

export type ToastType = "success" | "info" | "warning" | "error"

export type ToastData = {
	id: string
	message: string
	type: ToastType
}

type ToastProps = ToastData & {
	onClose: (id: string) => void
	duration?: number
}

export default function Toast({ id, message, type, onClose, duration = 4000 }: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(() => {
			onClose(id)
		}, duration)

		return () => clearTimeout(timer)
	}, [id, onClose, duration])

	return (
		<div className={`${s["pk-toast"]} ${s[`pk-toast--${type}`]}`}>
			<span className={s["pk-toast__icon"]}>
				{type === "success" && "✓"}
				{type === "info" && "ℹ"}
				{type === "warning" && "⚠"}
				{type === "error" && "✕"}
			</span>
			<span className={s["pk-toast__message"]}>{message}</span>
			<button className={s["pk-toast__close"]} onClick={() => onClose(id)}>
				×
			</button>
		</div>
	)
}
