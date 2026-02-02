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
	const [initialLoadDone, setInitialLoadDone] = useState(false)
	const [modal, setModal] = useState<ModalState>({
		isOpen: false,
		orderId: null,
		orderState: null,
	})
	const { orders, loading, pickup } = useOrders()
	const { showWarning } = useToast()

	const ordersRef = useRef(orders)
	ordersRef.current = orders

	const pickupRef = useRef(pickup)
	pickupRef.current = pickup

	const showWarningRef = useRef(showWarning)
	showWarningRef.current = showWarning

	// Carga inicial: crear riders para órdenes existentes inmediatamente
	useEffect(() => {
		if (!loading && orders.length > 0 && !initialLoadDone) {
			setInitialLoadDone(true)
			// Crear riders para todas las órdenes existentes al cargar
			const existingOrderIds = orders.map((o) => o.id)
			setAssignedOrders(existingOrderIds)
			setRiders(existingOrderIds.map((id) => ({ orderWanted: id })))
		} else if (!loading && orders.length === 0 && !initialLoadDone) {
			setInitialLoadDone(true)
		}
	}, [orders, loading, initialLoadDone])

	// Limpiar órdenes asignadas y riders cuyas órdenes ya no existen (fueron entregadas)
	useEffect(() => {
		if (!initialLoadDone) return
		const currentOrderIds = orders.map((o) => o.id)
		setAssignedOrders((prev) =>
			prev.filter((id) => currentOrderIds.includes(id))
		)
		// También limpiar riders de órdenes que ya no existen
		setRiders((prev) =>
			prev.filter((rider) => currentOrderIds.includes(rider.orderWanted))
		)
	}, [orders, initialLoadDone])

	// Asignar rider a nuevas órdenes (solo después de la carga inicial)
	useEffect(() => {
		if (!initialLoadDone) return
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
	}, [orders, assignedOrders, initialLoadDone])

	const pickupOrder = useCallback((orderId: string) => {
		const currentOrder = ordersRef.current.find((o) => o.id === orderId)

		// Si la orden ya no existe, eliminar el rider silenciosamente
		if (!currentOrder) {
			setRiders((prev) => prev.filter((r) => r.orderWanted !== orderId))
			return
		}

		if (currentOrder.state === "READY") {
			pickupRef.current(currentOrder, `rider-${Date.now()}`)
			setRiders((prev) => prev.filter((r) => r.orderWanted !== orderId))
		} else {
			setModal({
				isOpen: true,
				orderId: orderId.slice(0, 8),
				orderState: currentOrder.state === "PENDING" ? "Pendiente" : "En preparacion",
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
