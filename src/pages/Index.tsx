import { Link } from "react-router-dom";
import styles from "../assets/css/index.module.css";

function Index({ login }: { login: boolean }) {
	return (
		<div id={styles.content}>
			<Link to={login ? "/app" : "/register"}>Commencer à discuter</Link>
			<div id="background">
				
			</div>
			<section>
				<div>
					<h1>Secur'it</h1>
					<p>La seul messagerie 100% sécurisée</p>
				</div>
				<img src="" alt="Secur'it" />
			</section>
		</div>
	);
}
export default Index;