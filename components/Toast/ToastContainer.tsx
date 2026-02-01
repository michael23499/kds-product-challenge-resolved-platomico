import Toast, { ToastData } from "./Toast"
import s from "./ToastContainer.module.scss"

type ToastContainerProps = {
	toasts: ToastData[]
	onClose: (id: string) => void
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
	if (toasts.length === 0) return null

	return (
		<div className={s["pk-toast-container"]}>
			{toasts.map((toast) => (
				<Toast key={toast.id} {...toast} onClose={onClose} />
			))}
		</div>
	)
}
