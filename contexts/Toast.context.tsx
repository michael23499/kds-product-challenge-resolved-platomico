import {
	ReactNode,
	createContext,
	useCallback,
	useContext,
	useState,
} from "react"
import ToastContainer from "@/components/Toast/ToastContainer"
import { ToastData, ToastType } from "@/components/Toast/Toast"

type ToastContextProps = {
	showToast: (message: string, type?: ToastType) => void
	showSuccess: (message: string) => void
	showInfo: (message: string) => void
	showWarning: (message: string) => void
	showError: (message: string) => void
}

const ToastContext = createContext<ToastContextProps>({} as ToastContextProps)

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastData[]>([])

	const showToast = useCallback((message: string, type: ToastType = "info") => {
		const id = `toast-${Date.now()}-${Math.random()}`
		setToasts((prev) => [...prev, { id, message, type }])
	}, [])

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id))
	}, [])

	const showSuccess = useCallback((message: string) => showToast(message, "success"), [showToast])
	const showInfo = useCallback((message: string) => showToast(message, "info"), [showToast])
	const showWarning = useCallback((message: string) => showToast(message, "warning"), [showToast])
	const showError = useCallback((message: string) => showToast(message, "error"), [showToast])

	return (
		<ToastContext.Provider value={{ showToast, showSuccess, showInfo, showWarning, showError }}>
			{children}
			<ToastContainer toasts={toasts} onClose={removeToast} />
		</ToastContext.Provider>
	)
}

export const useToast = () => useContext(ToastContext)
