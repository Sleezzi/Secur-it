import styles from "../assets/css/loading.module.css";

function Loading({ step, message }: { step: {
	current: number,
	max: number
},
message?: string
}) {
	return (
		<div className={styles.content}>
			<div className={styles.loading}></div>
			<h1>Chargement en cours</h1>
			<h2>{step.current} sur {step.max}</h2>
			<h3>{message || "Please wait a few seconds"}</h3>
		</div>
	);
}
export default Loading;