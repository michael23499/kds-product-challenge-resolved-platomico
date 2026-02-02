/**
 * Centralized Error Handler for KDS Application
 *
 * This module provides a unified approach to error handling,
 * logging, and user feedback across the application.
 */

// Error Types
export enum ErrorType {
	NETWORK = "NETWORK",
	API = "API",
	VALIDATION = "VALIDATION",
	WEBSOCKET = "WEBSOCKET",
	UNKNOWN = "UNKNOWN",
}

// Error Codes
export enum ErrorCode {
	// Network Errors
	NETWORK_OFFLINE = "NETWORK_OFFLINE",
	NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
	NETWORK_REFUSED = "NETWORK_REFUSED",

	// API Errors
	API_NOT_FOUND = "API_NOT_FOUND",
	API_BAD_REQUEST = "API_BAD_REQUEST",
	API_SERVER_ERROR = "API_SERVER_ERROR",
	API_UNAUTHORIZED = "API_UNAUTHORIZED",

	// Order Errors
	ORDER_NOT_FOUND = "ORDER_NOT_FOUND",
	ORDER_INVALID_STATE_TRANSITION = "ORDER_INVALID_STATE_TRANSITION",
	ORDER_FETCH_FAILED = "ORDER_FETCH_FAILED",
	ORDER_UPDATE_FAILED = "ORDER_UPDATE_FAILED",
	ORDER_PICKUP_FAILED = "ORDER_PICKUP_FAILED",
	ORDER_CREATE_FAILED = "ORDER_CREATE_FAILED",
	ORDER_HISTORY_FAILED = "ORDER_HISTORY_FAILED",
	ORDER_RECOVER_FAILED = "ORDER_RECOVER_FAILED",
	ORDER_EDIT_FAILED = "ORDER_EDIT_FAILED",
	ORDER_PHOTO_FAILED = "ORDER_PHOTO_FAILED",

	// WebSocket Errors
	WEBSOCKET_CONNECTION_FAILED = "WEBSOCKET_CONNECTION_FAILED",
	WEBSOCKET_DISCONNECTED = "WEBSOCKET_DISCONNECTED",

	// Generic
	UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Error Messages (Spanish for UI)
export const ErrorMessages: Record<ErrorCode, string> = {
	[ErrorCode.NETWORK_OFFLINE]: "Sin conexion a internet. Verifica tu conexion.",
	[ErrorCode.NETWORK_TIMEOUT]: "La solicitud tardo demasiado. Intenta de nuevo.",
	[ErrorCode.NETWORK_REFUSED]: "No se pudo conectar al servidor. Verifica que el backend este corriendo.",

	[ErrorCode.API_NOT_FOUND]: "El recurso solicitado no fue encontrado.",
	[ErrorCode.API_BAD_REQUEST]: "Solicitud invalida. Verifica los datos enviados.",
	[ErrorCode.API_SERVER_ERROR]: "Error en el servidor. Intenta mas tarde.",
	[ErrorCode.API_UNAUTHORIZED]: "No tienes permisos para esta accion.",

	[ErrorCode.ORDER_NOT_FOUND]: "La orden no fue encontrada.",
	[ErrorCode.ORDER_INVALID_STATE_TRANSITION]: "Transicion de estado no permitida.",
	[ErrorCode.ORDER_FETCH_FAILED]: "Error al cargar las ordenes.",
	[ErrorCode.ORDER_UPDATE_FAILED]: "Error al actualizar la orden.",
	[ErrorCode.ORDER_PICKUP_FAILED]: "Error al procesar la entrega.",
	[ErrorCode.ORDER_CREATE_FAILED]: "Error al crear la orden.",
	[ErrorCode.ORDER_HISTORY_FAILED]: "Error al cargar el historial de ordenes.",
	[ErrorCode.ORDER_RECOVER_FAILED]: "Error al recuperar la orden.",
	[ErrorCode.ORDER_EDIT_FAILED]: "Error al editar la orden.",
	[ErrorCode.ORDER_PHOTO_FAILED]: "Error al agregar la evidencia fotografica.",

	[ErrorCode.WEBSOCKET_CONNECTION_FAILED]: "Error al conectar con el servidor en tiempo real.",
	[ErrorCode.WEBSOCKET_DISCONNECTED]: "Conexion perdida. Reconectando...",

	[ErrorCode.UNKNOWN_ERROR]: "Ocurrio un error inesperado.",
}

// Application Error Class
export class AppError extends Error {
	public readonly type: ErrorType
	public readonly code: ErrorCode
	public readonly userMessage: string
	public readonly originalError?: unknown
	public readonly timestamp: Date

	constructor(
		code: ErrorCode,
		type: ErrorType = ErrorType.UNKNOWN,
		originalError?: unknown,
	) {
		const userMessage = ErrorMessages[code]
		super(userMessage)
		this.name = "AppError"
		this.type = type
		this.code = code
		this.userMessage = userMessage
		this.originalError = originalError
		this.timestamp = new Date()
	}
}

// Logger Levels
export enum LogLevel {
	DEBUG = "DEBUG",
	INFO = "INFO",
	WARN = "WARN",
	ERROR = "ERROR",
}

// Logger Configuration
const LOG_COLORS: Record<LogLevel, string> = {
	[LogLevel.DEBUG]: "\x1b[36m", // Cyan
	[LogLevel.INFO]: "\x1b[32m",  // Green
	[LogLevel.WARN]: "\x1b[33m",  // Yellow
	[LogLevel.ERROR]: "\x1b[31m", // Red
}

const RESET_COLOR = "\x1b[0m"

// Environment check
const isDevelopment = process.env.NODE_ENV !== "production"

// Logger Class
class Logger {
	private context: string

	constructor(context: string) {
		this.context = context
	}

	private formatMessage(level: LogLevel, message: string, data?: unknown): string {
		const timestamp = new Date().toISOString()
		const color = LOG_COLORS[level]
		const prefix = `${color}[${level}]${RESET_COLOR} [${timestamp}] [${this.context}]`

		if (data) {
			return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
		}
		return `${prefix} ${message}`
	}

	debug(message: string, data?: unknown): void {
		if (isDevelopment) {
			console.log(this.formatMessage(LogLevel.DEBUG, message, data))
		}
	}

	info(message: string, data?: unknown): void {
		console.log(this.formatMessage(LogLevel.INFO, message, data))
	}

	warn(message: string, data?: unknown): void {
		console.warn(this.formatMessage(LogLevel.WARN, message, data))
	}

	error(message: string, error?: unknown): void {
		console.error(this.formatMessage(LogLevel.ERROR, message))
		if (error) {
			if (error instanceof AppError) {
				console.error(`  Code: ${error.code}`)
				console.error(`  Type: ${error.type}`)
				console.error(`  User Message: ${error.userMessage}`)
				if (error.originalError) {
					console.error(`  Original Error:`, error.originalError)
				}
			} else if (error instanceof Error) {
				console.error(`  ${error.message}`)
				if (error.stack) {
					console.error(`  Stack: ${error.stack}`)
				}
			} else {
				console.error(`  `, error)
			}
		}
	}
}

// Logger Factory
export function createLogger(context: string): Logger {
	return new Logger(context)
}

// HTTP Error Parser
export function parseHttpError(status: number, originalError?: unknown): AppError {
	switch (status) {
		case 400:
			return new AppError(ErrorCode.API_BAD_REQUEST, ErrorType.API, originalError)
		case 401:
		case 403:
			return new AppError(ErrorCode.API_UNAUTHORIZED, ErrorType.API, originalError)
		case 404:
			return new AppError(ErrorCode.API_NOT_FOUND, ErrorType.API, originalError)
		case 500:
		case 502:
		case 503:
			return new AppError(ErrorCode.API_SERVER_ERROR, ErrorType.API, originalError)
		default:
			return new AppError(ErrorCode.UNKNOWN_ERROR, ErrorType.API, originalError)
	}
}

// Network Error Parser
export function parseNetworkError(error: unknown): AppError {
	if (error instanceof TypeError && error.message.includes("fetch")) {
		return new AppError(ErrorCode.NETWORK_REFUSED, ErrorType.NETWORK, error)
	}
	if (error instanceof Error) {
		if (error.name === "AbortError") {
			return new AppError(ErrorCode.NETWORK_TIMEOUT, ErrorType.NETWORK, error)
		}
		if (error.message.includes("network") || error.message.includes("offline")) {
			return new AppError(ErrorCode.NETWORK_OFFLINE, ErrorType.NETWORK, error)
		}
	}
	return new AppError(ErrorCode.UNKNOWN_ERROR, ErrorType.NETWORK, error)
}

// Retry Configuration
export interface RetryConfig {
	maxRetries: number
	baseDelay: number
	maxDelay: number
	backoffMultiplier: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
	maxRetries: 2,
	baseDelay: 500,
	maxDelay: 3000,
	backoffMultiplier: 2,
}

// Check if error is a connection refused error (server not available)
function isConnectionRefusedError(error: unknown): boolean {
	if (error instanceof TypeError && error.message.includes("fetch")) {
		return true
	}
	if (error instanceof Error && error.message.includes("Failed to fetch")) {
		return true
	}
	return false
}

// Retry with Exponential Backoff
export async function withRetry<T>(
	operation: () => Promise<T>,
	config: Partial<RetryConfig> = {},
	logger?: Logger,
): Promise<T> {
	const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = {
		...DEFAULT_RETRY_CONFIG,
		...config,
	}

	let lastError: unknown
	let delay = baseDelay

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation()
		} catch (error) {
			lastError = error

			// Don't retry if server is not available - it's pointless
			if (isConnectionRefusedError(error)) {
				logger?.warn("Server not available - skipping retries")
				throw error
			}

			if (attempt === maxRetries) {
				logger?.error(`Operation failed after ${maxRetries} attempts`, error)
				throw error
			}

			logger?.warn(`Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`)

			await new Promise((resolve) => setTimeout(resolve, delay))
			delay = Math.min(delay * backoffMultiplier, maxDelay)
		}
	}

	throw lastError
}

// Order State Transition Validator
export type OrderState = "PENDING" | "IN_PROGRESS" | "READY" | "DELIVERED"

const VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
	PENDING: ["IN_PROGRESS"],
	IN_PROGRESS: ["READY"],
	READY: ["DELIVERED"],
	DELIVERED: [],
}

export function isValidStateTransition(
	currentState: OrderState,
	newState: OrderState,
): boolean {
	return VALID_TRANSITIONS[currentState]?.includes(newState) ?? false
}

export function validateStateTransition(
	currentState: OrderState,
	newState: OrderState,
): void {
	if (!isValidStateTransition(currentState, newState)) {
		throw new AppError(
			ErrorCode.ORDER_INVALID_STATE_TRANSITION,
			ErrorType.VALIDATION,
			{ currentState, newState },
		)
	}
}

export function getNextState(currentState: OrderState): OrderState | null {
	const validTransitions = VALID_TRANSITIONS[currentState]
	return validTransitions.length > 0 ? validTransitions[0] : null
}
