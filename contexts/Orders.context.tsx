import { Order } from "@/dtos/Order.dto"
import { api, getSocket, disconnectSocket } from "@/services/api"
import { useToast } from "@/contexts/Toast.context"
import { useNotificationSound } from "@/hooks/useNotificationSound"
import { createLogger } from "@/services/errorHandler"
import {
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"

const logger = createLogger("OrdersContext")

export type OrdersContextProps = {
	orders: Array<Order>
	history: Array<Order>
	loading: boolean
	historyLoading: boolean
	updateOrderState: (orderId: string, newState: Order["state"]) => Promise<void>
	pickup: (order: Order, riderId: string) => Promise<void>
	recoverOrder: (orderId: string) => Promise<void>
	refreshHistory: () => Promise<void>
	addPhotoEvidence: (orderId: string, photoEvidence: string) => Promise<void>
}

export const OrdersContext = createContext<OrdersContextProps>(
	{} as OrdersContextProps,
)

export type OrdersProviderProps = {
	children: ReactNode
}

export function OrdersProvider(props: OrdersProviderProps) {
	const [orders, setOrders] = useState<Array<Order>>([])
	const [history, setHistory] = useState<Array<Order>>([])
	const [loading, setLoading] = useState(true)
	const [historyLoading, setHistoryLoading] = useState(true)
	const { showInfo, showSuccess, showWarning } = useToast()
	const { playSound } = useNotificationSound()

	const showInfoRef = useRef(showInfo)
	const showSuccessRef = useRef(showSuccess)
	const showWarningRef = useRef(showWarning)
	const playSoundRef = useRef(playSound)

	showInfoRef.current = showInfo
	showSuccessRef.current = showSuccess
	showWarningRef.current = showWarning
	playSoundRef.current = playSound

	const fetchHistory = useCallback(async () => {
		try {
			setHistoryLoading(true)
			const data = await api.orders.getHistory()
			setHistory(data)
		} catch (error) {
			logger.error("Error fetching history", error)
		} finally {
			setHistoryLoading(false)
		}
	}, [])

	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [ordersData, historyData] = await Promise.all([
					api.orders.getAll(),
					api.orders.getHistory(),
				])
				setOrders(ordersData)
				setHistory(historyData)
			} catch (error) {
				logger.error("Error fetching initial data", error)
			} finally {
				setLoading(false)
				setHistoryLoading(false)
			}
		}

		fetchInitialData()

		const socket = getSocket()

		socket.on("order:new", (order: Order) => {
			setOrders((prev) => [...prev, order])
			showInfoRef.current(`Nueva orden #${order.id.slice(0, 8)}`)
			playSoundRef.current()
		})

		socket.on("order:updated", (updatedOrder: Order) => {
			setOrders((prev) =>
				prev.map((order) =>
					order.id === updatedOrder.id ? updatedOrder : order,
				),
			)
		})

		socket.on("order:picked", (pickedOrder: Order) => {
			setOrders((prev) => prev.filter((order) => order.id !== pickedOrder.id))
			setHistory((prev) => [pickedOrder, ...prev])
			showSuccessRef.current(`Orden #${pickedOrder.id.slice(0, 8)} entregada`)
		})

		socket.on("order:recovered", (recoveredOrder: Order) => {
			setHistory((prev) => prev.filter((order) => order.id !== recoveredOrder.id))
			setOrders((prev) => [...prev, recoveredOrder])
			showWarningRef.current(`Orden #${recoveredOrder.id.slice(0, 8)} recuperada`)
		})

		socket.on("order:photo-added", (updatedOrder: Order) => {
			setOrders((prev) =>
				prev.map((order) =>
					order.id === updatedOrder.id ? updatedOrder : order,
				),
			)
			showSuccessRef.current(`Foto agregada a orden #${updatedOrder.id.slice(0, 8)}`)
		})

		return () => {
			socket.off("order:new")
			socket.off("order:updated")
			socket.off("order:picked")
			socket.off("order:recovered")
			socket.off("order:photo-added")
			disconnectSocket()
		}
	}, [fetchHistory])

	const updateOrderState = useCallback(
		async (orderId: string, newState: Order["state"]) => {
			try {
				await api.orders.updateState(orderId, newState)
			} catch (error) {
				logger.error("Error updating order state", error)
			}
		},
		[],
	)

	const pickup = useCallback(async (order: Order, riderId: string) => {
		try {
			await api.orders.pickup(order.id, riderId)
		} catch (error) {
			logger.error("Error picking up order", error)
		}
	}, [])

	const recoverOrder = useCallback(async (orderId: string) => {
		try {
			await api.orders.recover(orderId)
		} catch (error) {
			logger.error("Error recovering order", error)
		}
	}, [])

	const addPhotoEvidence = useCallback(async (orderId: string, photoEvidence: string) => {
		try {
			await api.orders.addPhotoEvidence(orderId, photoEvidence)
		} catch (error) {
			logger.error("Error adding photo evidence", error)
		}
	}, [])

	const context = useMemo(() => ({
		orders,
		history,
		loading,
		historyLoading,
		updateOrderState,
		pickup,
		recoverOrder,
		refreshHistory: fetchHistory,
		addPhotoEvidence,
	}), [orders, history, loading, historyLoading, updateOrderState, pickup, recoverOrder, fetchHistory, addPhotoEvidence])

	return (
		<OrdersContext.Provider value={context}>
			{props.children}
		</OrdersContext.Provider>
	)
}

export const useOrders = () => useContext(OrdersContext)
