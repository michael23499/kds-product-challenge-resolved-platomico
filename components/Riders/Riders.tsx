import s from "./Riders.module.scss"
import Rider from "@/bases/Rider/Rider"
import Modal from "@/components/Modal/Modal"
import { useRiders } from "@/contexts/Riders.context"

export default function Riders() {
	const { riders, pickupOrder, modal, closeModal } = useRiders()
	return (
		<section className={s["pk-riders"]}>
			<h3>Repartidores ({riders.length})</h3>
			{riders.map((rider, index) => (
				<Rider
					key={`rider-${index}`}
					orderWanted={rider.orderWanted}
					onPickup={() => pickupOrder(rider.orderWanted)}
				/>
			))}

			<Modal
				isOpen={modal.isOpen}
				onClose={closeModal}
				title="Orden no lista"
			>
				<p>
					La orden <strong>#{modal.orderId}</strong> aun no esta lista para ser recogida.
				</p>
				<p>
					Estado actual: <strong>{modal.orderState}</strong>
				</p>
				<p style={{ color: "#888", fontSize: "13px", marginTop: "12px" }}>
					Haz clic en la tarjeta de la orden para avanzar su estado hasta "Listo".
				</p>
			</Modal>
		</section>
	)
}
