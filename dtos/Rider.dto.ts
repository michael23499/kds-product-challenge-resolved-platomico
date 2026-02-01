/**
 * Frontend Rider representation
 * This represents a rider waiting to pick up an order in the UI.
 * Different from the backend Rider entity which is the database model.
 */
export type Rider = {
	orderWanted: string
}

/**
 * Backend Rider Status (for reference)
 */
export const RIDER_STATUS = {
	AVAILABLE: "AVAILABLE",
	BUSY: "BUSY",
	OFFLINE: "OFFLINE",
} as const

export type RiderStatus = (typeof RIDER_STATUS)[keyof typeof RIDER_STATUS]

/**
 * Full Rider type (matches backend entity)
 */
export type RiderEntity = {
	id: string
	name: string
	status: RiderStatus
	currentOrderId: string | null
	createdAt: Date | string
}
