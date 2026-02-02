import { useState } from "react"
import s from "./History.module.scss"
import { useOrders } from "@/contexts/Orders.context"
import { Order } from "@/dtos/Order.dto"

export default function History() {
	const { history, historyLoading, recoverOrder } = useOrders()
	const [viewingPhoto, setViewingPhoto] = useState<Order | null>(null)
	const [viewingItems, setViewingItems] = useState<Order | null>(null)

	const handleRecover = async (orderId: string) => {
		await recoverOrder(orderId)
	}

	const formatTime = (date: Date | string) => {
		const d = new Date(date)
		return d.toLocaleTimeString("es-ES", {
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	return (
		<section className={s["pk-history"]}>
			<div className={s["pk-history__header"]}>
				<h3>Historial ({history.length})</h3>
				<span className={s["pk-history__subtitle"]}>Últimas 2 horas</span>
			</div>

			{historyLoading ? (
				<p className={s["pk-history__loading"]}>Cargando...</p>
			) : history.length === 0 ? (
				<p className={s["pk-history__empty"]}>No hay ordenes entregadas</p>
			) : (
				<div className={s["pk-history__list"]}>
					{history.map((order) => (
						<div key={order.id} className={s["pk-history__card"]}>
							<div className={s["pk-history__card-header"]}>
								<span className={s["pk-history__order-id"]}>
									#{order.id.slice(0, 8)}
								</span>
								<div className={s["pk-history__header-right"]}>
									{order.photoEvidence && (
										<button
											className={s["pk-history__photo-indicator"]}
											onClick={() => setViewingPhoto(order)}
											title="Ver evidencia fotografica"
										>
											Foto
										</button>
									)}
									<span className={s["pk-history__time"]}>
										{formatTime(order.updatedAt)}
									</span>
								</div>
							</div>
							<div className={s["pk-history__items"]}>
								{order.items.slice(0, 2).map((item) => (
									<span key={item.id} className={s["pk-history__item"]}>
										{item.quantity}x {item.name}
									</span>
								))}
								{order.items.length > 2 && (
									<button
										className={s["pk-history__more"]}
										onClick={() => setViewingItems(order)}
										title={order.items.slice(2).map((item) => `${item.quantity}x ${item.name}`).join(", ")}
									>
										+{order.items.length - 2} mas
									</button>
								)}
							</div>
							<button
								className={s["pk-history__recover-btn"]}
								onClick={() => handleRecover(order.id)}
								title="Devolver esta orden al estado Pendiente para reprocesarla"
							>
								Recuperar
							</button>
						</div>
					))}
				</div>
			)}

			{viewingPhoto && viewingPhoto.photoEvidence && (
				<div
					className={s["pk-history__photo-modal-overlay"]}
					onClick={() => setViewingPhoto(null)}
				>
					<div
						className={s["pk-history__photo-modal"]}
						onClick={(e) => e.stopPropagation()}
					>
						<div className={s["pk-history__photo-modal-header"]}>
							<h4>Evidencia - Orden #{viewingPhoto.id.slice(0, 8)}</h4>
							<button onClick={() => setViewingPhoto(null)}>&times;</button>
						</div>
						<div className={s["pk-history__photo-modal-content"]}>
							<img src={viewingPhoto.photoEvidence} alt="Evidencia fotografica" />
						</div>
					</div>
				</div>
			)}

			{viewingItems && (
				<div
					className={s["pk-history__items-modal-overlay"]}
					onClick={() => setViewingItems(null)}
				>
					<div
						className={s["pk-history__items-modal"]}
						onClick={(e) => e.stopPropagation()}
					>
						<div className={s["pk-history__items-modal-header"]}>
							<h4>Orden #{viewingItems.id.slice(0, 8)}</h4>
							<button onClick={() => setViewingItems(null)}>&times;</button>
						</div>
						<div className={s["pk-history__items-modal-content"]}>
							{viewingItems.items.map((item) => (
								<div key={item.id} className={s["pk-history__items-modal-item"]}>
									<span className={s["pk-history__items-modal-qty"]}>{item.quantity}x</span>
									<span className={s["pk-history__items-modal-name"]}>{item.name}</span>
									<span className={s["pk-history__items-modal-price"]}>
										{item.price.amount.toFixed(2)} {item.price.currency}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</section>
	)
}
