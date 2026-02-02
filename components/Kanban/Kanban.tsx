import { useState } from "react"
import s from "./Kanban.module.scss"
import Column from "@/components/Column/Column"
import EditOrderModal from "@/components/EditOrderModal/EditOrderModal"
import PhotoEvidenceModal from "@/components/PhotoEvidenceModal/PhotoEvidenceModal"
import { useOrders } from "@/contexts/Orders.context"
import { useToast } from "@/contexts/Toast.context"
import {
	getNextState,
	isValidStateTransition,
	createLogger,
} from "@/services/errorHandler"
import { Order } from "@/dtos/Order.dto"

const logger = createLogger("Kanban")

export default function Kanban() {
	const { orders, loading, updateOrderState, addPhotoEvidence } = useOrders()
	const { showError } = useToast()
	const [editingOrder, setEditingOrder] = useState<Order | null>(null)
	const [photoOrder, setPhotoOrder] = useState<Order | null>(null)

	const pendingOrders = orders.filter((o) => o.state === "PENDING")
	const inProgressOrders = orders.filter((o) => o.state === "IN_PROGRESS")
	const readyOrders = orders.filter((o) => o.state === "READY")

	const handleStateTransition = async (order: Order) => {
		const nextState = getNextState(order.state)

		if (!nextState) {
			logger.warn(`No valid transition from state: ${order.state}`)
			return
		}

		if (!isValidStateTransition(order.state, nextState)) {
			logger.error(`Invalid transition: ${order.state} -> ${nextState}`)
			showError(`Transicion no permitida: ${order.state} -> ${nextState}`)
			return
		}

		logger.info(`Transitioning order ${order.id.slice(0, 8)}: ${order.state} -> ${nextState}`)
		await updateOrderState(order.id, nextState)
	}

	const handlePendingClick = async (order: Order) => {
		await handleStateTransition(order)
	}

	const handleInProgressClick = async (order: Order) => {
		await handleStateTransition(order)
	}

	const handleEdit = (order: Order) => {
		setEditingOrder(order)
	}

	const handleCloseEdit = () => {
		setEditingOrder(null)
	}

	const handleCameraClick = (order: Order) => {
		setPhotoOrder(order)
	}

	const handleClosePhoto = () => {
		setPhotoOrder(null)
	}

	const handleCapturePhoto = async (photoEvidence: string) => {
		if (photoOrder) {
			await addPhotoEvidence(photoOrder.id, photoEvidence)
			setPhotoOrder(null)
		}
	}

	if (loading) {
		return (
			<section className={s["pk-kanban"]}>
				<p>Cargando ordenes...</p>
			</section>
		)
	}

	return (
		<section className={s["pk-kanban"]}>
			<Column
				title="Pendiente"
				orders={pendingOrders}
				onClick={handlePendingClick}
				onEdit={handleEdit}
				showEditButton
			/>
			<Column
				title="En preparacion"
				orders={inProgressOrders}
				onClick={handleInProgressClick}
				onEdit={handleEdit}
				showEditButton
			/>
			<Column
				title="Listo"
				orders={readyOrders}
				onCameraClick={handleCameraClick}
				showCameraButton
			/>

			<EditOrderModal
				isOpen={editingOrder !== null}
				order={editingOrder}
				onClose={handleCloseEdit}
			/>

			{photoOrder && (
				<PhotoEvidenceModal
					order={photoOrder}
					onCapture={handleCapturePhoto}
					onClose={handleClosePhoto}
				/>
			)}
		</section>
	)
}
