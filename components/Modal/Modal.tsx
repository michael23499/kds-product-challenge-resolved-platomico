import { ReactNode } from "react"
import s from "./Modal.module.scss"

type ModalProps = {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
	if (!isOpen) return null

	return (
		<div className={s["pk-modal__overlay"]} onClick={onClose}>
			<div className={s["pk-modal"]} onClick={(e) => e.stopPropagation()}>
				{title && (
					<div className={s["pk-modal__header"]}>
						<h3>{title}</h3>
						<button className={s["pk-modal__close"]} onClick={onClose}>
							&times;
						</button>
					</div>
				)}
				<div className={s["pk-modal__content"]}>{children}</div>
				<div className={s["pk-modal__footer"]}>
					<button className={s["pk-modal__btn"]} onClick={onClose}>
						Entendido
					</button>
				</div>
			</div>
		</div>
	)
}
