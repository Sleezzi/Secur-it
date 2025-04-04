import { DetailedHTMLProps, JSX } from "react";
import styles from "../assets/css/components/aria-label.module.css";

type Attributes = DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
	parent: string | JSX.Element
	value: string | JSX.Element
}

function AriaLabel({parent, value, ...attributes}: Attributes) {
	return (
		<div {...attributes} id={styles.container}>
			<div id={styles.parent}>{parent}</div>
			<div id={styles.text}>{value}</div>
		</div>
	);
}

export default AriaLabel;