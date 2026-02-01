import s from "./Rider.module.scss"
import RiderSvg from "./RiderSvg"

type RiderProps = {
	orderWanted: string
	onPickup: () => void
}

export default function Rider(props: RiderProps) {
	return (
		<div onClick={props.onPickup} className={s["pk-rider__container"]}>
			<div className={s["pk-rider__order"]}>
				<b>#{props.orderWanted.slice(0, 8)}</b>
			</div>
			<RiderSvg className={s["pk-rider"]} />
		</div>
	)
}
