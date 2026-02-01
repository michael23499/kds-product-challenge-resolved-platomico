import {
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react"
import { useOrders } from "@/contexts/Orders.context"
import { useToast } from "@/contexts/Toast.context"
import { getRandomInterval } from "@/helpers/utilities"

type RiderData = {
	orderWanted: string
}

type ModalState = {
	isOpen: boolean
	orderId: string | null
	orderState: string | null
}

export type RidersContextProps = {
	riders: Array<RiderData>
	pickupOrder: (orderId: string) => void
	modal: ModalState
	closeModal: () => void
}

export const RidersContext = createContext<RidersContextProps>(
	{} as RidersContextProps,
)

export type RidersProviderProps = {
	children: ReactNode
}

export function RidersProvider(props: RidersProviderProps) {
	const [riders, setRiders] = useState<Array<RiderData>>([])
	const [assignedOrders, setAssignedOrders] = useState<string[]>([])
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		orderId: null,
		orderState: null,
	})
	const { orders, pickup } = useOrders()
	const { showWarning } = useToast()

	const ordersRef = useRef(orders)
	ordersRef.current = orders

	const pickupRef = useRef(pickup)
	pickupRef.current = pickup

	const showWarningRef = useRef(showWarning)
	showWarningRef.current = showWarning

	// Limpiar órdenes asignadas que ya no existen (fueron entregadas)
	useEffect(() => {
		const currentOrderIds = orders.map((o) => o.id)
		setAssignedOrders((prev) =>
			prev.filter((id) => currentOrderIds.includes(id))
		)
	}, [orders])

	// Asignar rider a nuevas órdenes
	useEffect(() => {
		const order = orders.find((order) => !assignedOrders.includes(order.id))
		if (order) {
			setAssignedOrders((prev) => [...prev, order.id])
			setTimeout(
				() => {
					// Verificar que la orden aún existe antes de crear el rider
					if (ordersRef.current.some((o) => o.id === order.id)) {
						setRiders((prev) => [
							...prev,
							{ orderWanted: order.id },
						])
						showWarningRef.current(`Rider esperando orden #${order.id.slice(0, 8)}`)
					}
				},
				getRandomInterval(4000, 10000),
			)
		}
	}, [orders, assignedOrders])

	const pickupOrder = useCallback((orderId: string) => {
		const currentOrder = ordersRef.current.find((o) => o.id === orderId)
		if (currentOrder && currentOrder.state === "READY") {
			pickupRef.current(currentOrder, `rider-${Date.now()}`)
			setRiders((prev) => prev.filter((r) => r.orderWanted !== orderId))
		} else {
			const state = currentOrder?.state || "PENDING"
			setModal({
				isOpen: true,
				orderId: orderId.slice(0, 8),
				orderState: state === "PENDING" ? "Pendiente" : "En preparacion",
			})
		}
	}, [])

	const closeModal = useCallback(() => {
		setModal({ isOpen: false, orderId: null, orderState: null })
	}, [])

	const context = { riders, pickupOrder, modal, closeModal }
	return (
		<RidersContext.Provider value={context}>
			{props.children}
		</RidersContext.Provider>
	)
}

export const useRiders = () => useContext(RidersContext)
