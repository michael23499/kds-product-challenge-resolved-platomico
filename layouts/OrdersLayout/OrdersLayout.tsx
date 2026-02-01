import { useState } from "react"
import Logo from "@/bases/Logo/Logo"
import s from "./OrdersLayout.module.scss"
import Riders from "@/components/Riders/Riders"
import History from "@/components/History/History"
import Kanban from "@/components/Kanban/Kanban"
import OrderSimulator from "@/components/OrderSimulator/OrderSimulator"
import CreateOrderModal from "@/components/CreateOrderModal/CreateOrderModal"

export default function OrdersLayout() {
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

	return (
		<main className={s["pk-layout"]}>
			<nav className={s["pk-layout__navbar"]}>
				<Logo size="M" />
				<strong>KDS: Krazy Display Service</strong>
				<button
					className={s["pk-layout__create-btn"]}
					onClick={() => setIsCreateModalOpen(true)}
				>
					+ Crear Orden
				</button>
				<OrderSimulator />
			</nav>

			<CreateOrderModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
			<article className={s["pk-layout__app"]}>
				<Kanban />
				<aside className={s["pk-layout__sidebar"]}>
					<Riders />
					<History />
				</aside>
			</article>
		</main>
	)
}
