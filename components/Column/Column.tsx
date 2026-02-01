import s from "./Column.module.scss"
import { Order } from "@/dtos/Order.dto"
import Timer from "@/components/Timer/Timer"

export type ColumnProps = {
	orders: Array<Order>
	title: string
	onClick?: (order: Order) => void
	onEdit?: (order: Order) => void
	showEditButton?: boolean
}

export default function Column(props: ColumnProps) {
	const handleEditClick = (e: React.MouseEvent, order: Order) => {
		e.stopPropagation()
		props.onEdit?.(order)
	}

	return (
		<div className={s["pk-column"]}>
			<div className={s["pk-column__title"]}>
				<h3>
					{props.title} ({props.orders.length})
				</h3>
			</div>
			{props.orders.map((order) => (
				<div
					key={order.id}
					onClick={() => props.onClick && props.onClick(order)}
					className={s["pk-card"]}
					style={{ cursor: props.onClick ? "pointer" : "default" }}
				>
					<div className={s["pk-card__header"]}>
						<span>
							Orden: <b>#{order.id.slice(0, 8)}</b>
						</span>
						<div className={s["pk-card__actions"]}>
							{props.showEditButton && (
								<button
									className={s["pk-card__edit-btn"]}
									onClick={(e) => handleEditClick(e, order)}
									title="Editar orden"
								>
									Editar
								</button>
							)}
							<Timer startTime={order.createdAt} />
						</div>
					</div>
					<div className={s["pk-card__items"]}>
						{order.items.map((item) => (
							<div key={item.id} className={s["pk-card__item"]}>
								<span className={s["pk-card__item-qty"]}>{item.quantity}x</span>
								<span className={s["pk-card__item-name"]}>{item.name}</span>
								<span className={s["pk-card__item-price"]}>
									{item.price.amount.toFixed(2)} {item.price.currency}
								</span>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	)
}
