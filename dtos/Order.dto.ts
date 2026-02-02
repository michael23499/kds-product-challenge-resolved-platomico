import { Item } from "@/dtos/Item.dto"

// Order States
export const ORDER_STATES = {
	PENDING: "PENDING",
	IN_PROGRESS: "IN_PROGRESS",
	READY: "READY",
	DELIVERED: "DELIVERED",
} as const

export type OrderState = (typeof ORDER_STATES)[keyof typeof ORDER_STATES]

export type Order = {
	id: string
	state: OrderState
	riderId?: string | null
	photoEvidence?: string | null
	items: Array<Item>
	createdAt: Date | string
	updatedAt: Date | string
}
