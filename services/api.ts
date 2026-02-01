import { io, Socket } from "socket.io-client"
import { Order } from "@/dtos/Order.dto"
import {
	AppError,
	ErrorCode,
	ErrorType,
	createLogger,
	parseHttpError,
	parseNetworkError,
	withRetry,
} from "./errorHandler"

/**
 * API Configuration
 *
 * NEXT_PUBLIC_API_URL: URL of the backend server
 * Default: http://localhost:4000
 *
 * To override, create a .env.local file with:
 * NEXT_PUBLIC_API_URL=http://your-backend-url:port
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const logger = createLogger("API")

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 5000

/**
 * Fetch wrapper with timeout and error handling
 */
async function fetchWithTimeout(
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		})
		return response
	} finally {
		clearTimeout(timeoutId)
	}
}

/**
 * Process API response and handle errors
 */
async function handleResponse<T>(response: Response, errorCode: ErrorCode): Promise<T> {
	if (!response.ok) {
		const error = parseHttpError(response.status)
		logger.error(`HTTP ${response.status} error`, error)
		throw new AppError(errorCode, ErrorType.API, { status: response.status })
	}
	return response.json()
}

/**
 * Execute API request with retry logic
 */
async function apiRequest<T>(
	operation: () => Promise<T>,
	errorCode: ErrorCode,
	retryEnabled: boolean = true,
): Promise<T> {
	try {
		if (retryEnabled) {
			return await withRetry(operation, { maxRetries: 3 }, logger)
		}
		return await operation()
	} catch (error) {
		if (error instanceof AppError) {
			throw error
		}
		const networkError = parseNetworkError(error)
		logger.error(`Request failed`, networkError)
		throw new AppError(errorCode, ErrorType.NETWORK, error)
	}
}

export const api = {
	orders: {
		getAll: async (): Promise<Order[]> => {
			logger.debug("Fetching all orders")
			return apiRequest(
				async () => {
					const response = await fetchWithTimeout(`${API_URL}/orders`)
					return handleResponse<Order[]>(response, ErrorCode.ORDER_FETCH_FAILED)
				},
				ErrorCode.ORDER_FETCH_FAILED,
			)
		},

		getById: async (id: string): Promise<Order> => {
			logger.debug(`Fetching order ${id}`)
			return apiRequest(
				async () => {
					const response = await fetchWithTimeout(`${API_URL}/orders/${id}`)
					return handleResponse<Order>(response, ErrorCode.ORDER_NOT_FOUND)
				},
				ErrorCode.ORDER_FETCH_FAILED,
			)
		},

		updateState: async (id: string, state: Order["state"]): Promise<Order> => {
			logger.info(`Updating order ${id} to state ${state}`)
			return apiRequest(
				async () => {
					const response = await fetchWithTimeout(`${API_URL}/orders/${id}/state`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ state }),
					})
					return handleResponse<Order>(response, ErrorCode.ORDER_UPDATE_FAILED)
				},
				ErrorCode.ORDER_UPDATE_FAILED,
				false, // No retry for state updates to avoid duplicate transitions
			)
		},

		pickup: async (id: string, riderId: string): Promise<Order> => {
			logger.info(`Picking up order ${id} by rider ${riderId}`)
			return apiRequest(
				async () => {
					const response = await fetchWithTimeout(`${API_URL}/orders/${id}/pickup`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ riderId }),
					})
					return handleResponse<Order>(response, ErrorCode.ORDER_PICKUP_FAILED)
				},
				ErrorCode.ORDER_PICKUP_FAILED,
				false, // No retry to avoid duplicate pickups
			)
		},

		create: async (items: Array<{ name: string; priceAmount: number; priceCurrency?: string; quantity?: number }>): Promise<Order> => {
			logger.info("Creating new order", { itemCount: items.length })
			return apiRequest(
				async () => {
					const response = await fetchWithTimeout(`${API_URL}/orders`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ items }),
					})
					return handleResponse<Order>(response, ErrorCode.ORDER_CREATE_FAILED)
				},
				ErrorCode.ORDER_CREATE_FAILED,
			)
		},

		getHistory: async (): Promise<Order[]> => {
			logger.debug("Fetching order history")
			return apiRequest(
				async () => {
					const response = await fetchWithTimeout(`${API_URL}/orders/history`)
					return handleResponse<Order[]>(response, ErrorCode.ORDER_HISTORY_FAILED)
				},
				ErrorCode.ORDER_HISTORY_FAILED,
			)
		},

		recover: async (id: string): Promise<Order> => {
			logger.info(`Recovering order ${id}`)
			return apiRequest(
				async () => {
					const response = await fetchWithTimeout(`${API_URL}/orders/${id}/recover`, {
						method: "POST",
					})
					return handleResponse<Order>(response, ErrorCode.ORDER_RECOVER_FAILED)
				},
				ErrorCode.ORDER_RECOVER_FAILED,
				false, // No retry to avoid duplicate recoveries
			)
		},

		update: async (id: string, items: Array<{ name: string; priceAmount: number; priceCurrency?: string; quantity?: number }>): Promise<Order> => {
			logger.info(`Updating order ${id}`, { itemCount: items.length })
			return apiRequest(
				async () => {
					const response = await fetchWithTimeout(`${API_URL}/orders/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ items }),
					})
					return handleResponse<Order>(response, ErrorCode.ORDER_EDIT_FAILED)
				},
				ErrorCode.ORDER_EDIT_FAILED,
				false, // No retry to avoid duplicate edits
			)
		},
	},

}

// WebSocket Management
let socket: Socket | null = null
const wsLogger = createLogger("WebSocket")

export const getSocket = (): Socket => {
	if (!socket) {
		wsLogger.info(`Connecting to ${API_URL}`)
		socket = io(API_URL, {
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
		})

		socket.on("connect", () => {
			wsLogger.info("Connected successfully")
		})

		socket.on("disconnect", (reason) => {
			wsLogger.warn(`Disconnected: ${reason}`)
		})

		socket.on("connect_error", (error) => {
			wsLogger.error("Connection error", error)
		})

		socket.on("reconnect", (attemptNumber) => {
			wsLogger.info(`Reconnected after ${attemptNumber} attempts`)
		})

		socket.on("reconnect_error", (error) => {
			wsLogger.error("Reconnection error", error)
		})

		socket.on("reconnect_failed", () => {
			wsLogger.error("Reconnection failed after all attempts")
		})
	}
	return socket
}

export const disconnectSocket = () => {
	if (socket) {
		wsLogger.info("Disconnecting...")
		socket.disconnect()
		socket = null
	}
}

// Export API URL for reference
export const getApiUrl = () => API_URL
