import s from "./History.module.scss"
import { useOrders } from "@/contexts/Orders.context"

export default function History() {
	const { history, historyLoading, recoverOrder } = useOrders()

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
				<span className={s["pk-history__subtitle"]}>Ultimas 2 horas</span>
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
								<span className={s["pk-history__time"]}>
									{formatTime(order.updatedAt)}
								</span>
							</div>
							<div className={s["pk-history__items"]}>
								{order.items.slice(0, 2).map((item) => (
									<span key={item.id} className={s["pk-history__item"]}>
										{item.quantity}x {item.name}
									</span>
								))}
								{order.items.length > 2 && (
									<span className={s["pk-history__more-container"]}>
										<span className={s["pk-history__more"]}>
											+{order.items.length - 2} mas
										</span>
										<span className={s["pk-history__tooltip"]}>
											{order.items.slice(2).map((item) => (
												<span key={item.id}>
													{item.quantity}x {item.name}
												</span>
											))}
										</span>
									</span>
								)}
							</div>
							<button
								className={s["pk-history__recover-btn"]}
								onClick={() => handleRecover(order.id)}
							>
								Recuperar
							</button>
						</div>
					))}
				</div>
			)}
		</section>
	)
}
