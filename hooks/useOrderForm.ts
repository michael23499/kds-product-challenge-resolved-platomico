import { useState, useCallback } from "react"
import { useToast } from "@/contexts/Toast.context"

export type OrderFormItem = {
	id: string
	name: string
	quantity: number
	priceAmount: number
}

type UseOrderFormOptions = {
	initialItems?: OrderFormItem[]
	onSuccess?: () => void
}

const generateId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2)}`

export const createEmptyItem = (): OrderFormItem => ({
	id: generateId(),
	name: "",
	quantity: 1,
	priceAmount: 0,
})

export function useOrderForm(options: UseOrderFormOptions = {}) {
	const { initialItems, onSuccess } = options
	const [items, setItems] = useState<OrderFormItem[]>(
		initialItems?.length ? initialItems : [createEmptyItem()]
	)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { showError } = useToast()

	const resetItems = useCallback((newItems?: OrderFormItem[]) => {
		setItems(newItems?.length ? newItems : [createEmptyItem()])
	}, [])

	const addItem = useCallback(() => {
		setItems((prev) => [...prev, createEmptyItem()])
	}, [])

	const removeItem = useCallback((id: string) => {
		setItems((prev) => {
			if (prev.length === 1) return prev
			return prev.filter((item) => item.id !== id)
		})
	}, [])

	const updateItem = useCallback(
		(id: string, field: keyof Omit<OrderFormItem, "id">, value: string | number) => {
			setItems((prev) =>
				prev.map((item) =>
					item.id === id ? { ...item, [field]: value } : item
				)
			)
		},
		[]
	)

	const validateItems = useCallback((): boolean => {
		for (const item of items) {
			if (!item.name.trim()) {
				showError("Todos los items deben tener nombre")
				return false
			}
			if (item.priceAmount <= 0) {
				showError("El precio debe ser mayor a 0")
				return false
			}
			if (item.quantity < 1) {
				showError("La cantidad debe ser al menos 1")
				return false
			}
		}
		return true
	}, [items, showError])

	const getFormattedItems = useCallback(() => {
		return items.map(({ name, quantity, priceAmount }) => ({
			name: name.trim(),
			quantity,
			priceAmount,
			priceCurrency: "EUR",
		}))
	}, [items])

	const total = items.reduce(
		(sum, item) => sum + item.priceAmount * item.quantity,
		0
	)

	const handleSubmit = useCallback(
		async (submitFn: () => Promise<void>) => {
			if (!validateItems()) return

			setIsSubmitting(true)
			try {
				await submitFn()
				onSuccess?.()
			} finally {
				setIsSubmitting(false)
			}
		},
		[validateItems, onSuccess]
	)

	return {
		items,
		isSubmitting,
		total,
		addItem,
		removeItem,
		updateItem,
		resetItems,
		validateItems,
		getFormattedItems,
		handleSubmit,
	}
}
