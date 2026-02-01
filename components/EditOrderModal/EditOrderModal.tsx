import { useEffect } from "react"
import s from "../CreateOrderModal/CreateOrderModal.module.scss"
import { api } from "@/services/api"
import { useToast } from "@/contexts/Toast.context"
import { createLogger } from "@/services/errorHandler"
import { useOrderForm, OrderFormItem } from "@/hooks/useOrderForm"
import { Order } from "@/dtos/Order.dto"

const logger = createLogger("EditOrderModal")

type EditOrderModalProps = {
	isOpen: boolean
	order: Order | null
	onClose: () => void
}

export default function EditOrderModal({ isOpen, order, onClose }: EditOrderModalProps) {
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
			showSuccess("Orden actualizada exitosamente")
			onClose()
		},
	})

	// Load order items when modal opens
	useEffect(() => {
		if (isOpen && order) {
			const orderItems: OrderFormItem[] = order.items.map((item) => ({
				id: item.id,
				name: item.name,
				quantity: item.quantity,
				priceAmount: item.price.amount,
			}))
			resetItems(orderItems)
		}
	}, [isOpen, order, resetItems])

	const onSubmit = async () => {
		if (!order) return

		await handleSubmit(async () => {
			try {
				await api.orders.update(order.id, getFormattedItems())
			} catch (error) {
				logger.error("Error updating order", error)
				showError("Error al actualizar la orden")
				throw error
			}
		})
	}

	const handleClose = () => {
		if (!isSubmitting) {
			onClose()
		}
	}

	if (!isOpen || !order) return null

	return (
		<div className={s["pk-modal__overlay"]} onClick={handleClose}>
			<div className={s["pk-modal"]} onClick={(e) => e.stopPropagation()}>
				<div className={s["pk-modal__header"]}>
					<h3>Editar Orden #{order.id.slice(0, 8)}</h3>
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
						{isSubmitting ? "Guardando..." : "Guardar Cambios"}
					</button>
				</div>
			</div>
		</div>
	)
}
