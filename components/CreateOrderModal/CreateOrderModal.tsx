import { useEffect } from "react"
import s from "./CreateOrderModal.module.scss"
import { api } from "@/services/api"
import { useToast } from "@/contexts/Toast.context"
import { createLogger } from "@/services/errorHandler"
import { useOrderForm, createEmptyItem } from "@/hooks/useOrderForm"

const logger = createLogger("CreateOrderModal")

type CreateOrderModalProps = {
	isOpen: boolean
	onClose: () => void
}

export default function CreateOrderModal({ isOpen, onClose }: CreateOrderModalProps) {
	const { showSuccess, showError } = useToast()

	const {
		items,
		isSubmitting,
		total,
		addItem,
		removeItem,
		updateItem,
		resetItems,
		getFormattedItems,
		handleSubmit,
	} = useOrderForm({
		onSuccess: () => {
			showSuccess("Orden creada exitosamente")
			resetItems()
			onClose()
		},
	})

	// Reset form when modal closes
	useEffect(() => {
		if (!isOpen) {
			resetItems([createEmptyItem()])
		}
	}, [isOpen, resetItems])

	const onSubmit = async () => {
		await handleSubmit(async () => {
			try {
				await api.orders.create(getFormattedItems())
			} catch (error) {
				logger.error("Error creating order", error)
				showError("Error al crear la orden")
				throw error
			}
		})
	}

	const handleClose = () => {
		if (!isSubmitting) {
			resetItems()
			onClose()
		}
	}

	if (!isOpen) return null

	return (
		<div className={s["pk-modal__overlay"]} onClick={handleClose}>
			<div className={s["pk-modal"]} onClick={(e) => e.stopPropagation()}>
				<div className={s["pk-modal__header"]}>
					<h3>Crear Orden Manual</h3>
					<button
						className={s["pk-modal__close"]}
						onClick={handleClose}
						disabled={isSubmitting}
					>
						&times;
					</button>
				</div>

				<div className={s["pk-modal__content"]}>
					<div className={s["pk-items"]}>
						{items.map((item, index) => (
							<div key={item.id} className={s["pk-item"]}>
								<div className={s["pk-item__header"]}>
									<span className={s["pk-item__number"]}>Item {index + 1}</span>
									{items.length > 1 && (
										<button
											type="button"
											className={s["pk-item__remove"]}
											onClick={() => removeItem(item.id)}
											disabled={isSubmitting}
										>
											Eliminar
										</button>
									)}
								</div>

								<div className={s["pk-item__fields"]}>
									<div className={s["pk-field"]}>
										<label>Nombre</label>
										<input
											type="text"
											placeholder="Ej: Hamburguesa"
											value={item.name}
											onChange={(e) => updateItem(item.id, "name", e.target.value)}
											disabled={isSubmitting}
										/>
									</div>

									<div className={s["pk-field__row"]}>
										<div className={s["pk-field"]}>
											<label>Cantidad</label>
											<input
												type="number"
												min="1"
												value={item.quantity}
												onChange={(e) =>
													updateItem(item.id, "quantity", parseInt(e.target.value) || 1)
												}
												disabled={isSubmitting}
											/>
										</div>

										<div className={s["pk-field"]}>
											<label>Precio (EUR)</label>
											<input
												type="number"
												min="0"
												step="0.01"
												placeholder="0.00"
												value={item.priceAmount || ""}
												onChange={(e) =>
													updateItem(item.id, "priceAmount", parseFloat(e.target.value) || 0)
												}
												disabled={isSubmitting}
											/>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<button
						type="button"
						className={s["pk-add-btn"]}
						onClick={addItem}
						disabled={isSubmitting}
					>
						+ Agregar Item
					</button>

					<div className={s["pk-total"]}>
						<span>Total:</span>
						<span className={s["pk-total__amount"]}>{total.toFixed(2)} EUR</span>
					</div>
				</div>

				<div className={s["pk-modal__footer"]}>
					<button
						className={s["pk-btn--secondary"]}
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Cancelar
					</button>
					<button
						className={s["pk-btn--primary"]}
						onClick={onSubmit}
						disabled={isSubmitting || items.length === 0}
					>
						{isSubmitting ? "Creando..." : "Crear Orden"}
					</button>
				</div>
			</div>
		</div>
	)
}
