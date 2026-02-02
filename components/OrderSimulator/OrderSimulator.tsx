import { useEffect, useRef, useState } from "react"
import s from "./OrderSimulator.module.scss"
import { createLogger } from "@/services/errorHandler"

const logger = createLogger("OrderSimulator")

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const SAMPLE_ITEMS = [
	{ name: "Hamburguesa Clasica", priceAmount: 8.99, priceCurrency: "EUR" },
	{ name: "Pizza Margherita", priceAmount: 12.5, priceCurrency: "EUR" },
	{ name: "Ensalada Caesar", priceAmount: 7.99, priceCurrency: "EUR" },
	{ name: "Papas Fritas", priceAmount: 3.5, priceCurrency: "EUR" },
	{ name: "Refresco", priceAmount: 2.5, priceCurrency: "EUR" },
	{ name: "Helado", priceAmount: 4.99, priceCurrency: "EUR" },
	{ name: "Tacos al Pastor", priceAmount: 9.99, priceCurrency: "EUR" },
	{ name: "Burrito de Pollo", priceAmount: 10.5, priceCurrency: "EUR" },
	{ name: "Nachos con Queso", priceAmount: 6.99, priceCurrency: "EUR" },
	{ name: "Agua Mineral", priceAmount: 1.99, priceCurrency: "EUR" },
]

function getRandomItems() {
	const numItems = Math.floor(Math.random() * 4) + 1
	const items = []
	for (let i = 0; i < numItems; i++) {
		const randomItem = SAMPLE_ITEMS[Math.floor(Math.random() * SAMPLE_ITEMS.length)]
		items.push({
			...randomItem,
			quantity: Math.floor(Math.random() * 3) + 1,
		})
	}
	return items
}

async function createOrder() {
	const response = await fetch(`${API_URL}/orders`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ items: getRandomItems() }),
	})
	if (!response.ok) {
		throw new Error("Failed to create order")
	}
	return response.json()
}

export default function OrderSimulator() {
	const [isRunning, setIsRunning] = useState(false)
	const [ordersCreated, setOrdersCreated] = useState(0)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const startSimulation = () => {
		setIsRunning(true)
		intervalRef.current = setInterval(async () => {
			try {
				await createOrder()
				setOrdersCreated((prev) => prev + 1)
			} catch (error) {
				logger.error("Error creating order", error)
			}
		}, 5000)
	}

	const stopSimulation = () => {
		setIsRunning(false)
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}

	const createSingleOrder = async () => {
		try {
			await createOrder()
			setOrdersCreated((prev) => prev + 1)
		} catch (error) {
			logger.error("Error creating order", error)
		}
	}

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [])

	return (
		<div className={s["pk-simulator"]}>
			<h4>Simulador Glovo</h4>
			<div className={s["pk-simulator__controls"]}>
				<button
					onClick={createSingleOrder}
					className={s["pk-simulator__btn"]}
					title="Crear un pedido aleatorio de prueba al instante"
				>
					+ Nuevo Pedido
				</button>
				{isRunning ? (
					<button
						onClick={stopSimulation}
						className={`${s["pk-simulator__btn"]} ${s["pk-simulator__btn--stop"]}`}
						title="Detener la generacion automatica de pedidos"
					>
						Detener Auto
					</button>
				) : (
					<button
						onClick={startSimulation}
						className={`${s["pk-simulator__btn"]} ${s["pk-simulator__btn--start"]}`}
						title="Generar pedidos automaticamente cada 5 segundos"
					>
						Iniciar Auto
					</button>
				)}
			</div>
			<span className={s["pk-simulator__count"]}>Pedidos: {ordersCreated}</span>
		</div>
	)
}
