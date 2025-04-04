import { useEffect } from "react";
import styles from "../assets/css/settings.module.css";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { disconnect } from "../components/Accounts";

function Settings() {
	const navigate = useNavigate();
	useEffect(() => {
		document.addEventListener("keydown", (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			window.scrollTo(0, 0);
			navigate("/app");
		});
		return () => {
			document.removeEventListener("keydown", () => {});
		}
	}, []);

	return ( 
		<main id={styles.content}>
			<ul id={styles.selection}>{/* Selection */}
				<Link to={"/app/settings/profil"}>
					<span className={`${styles.icon} material-symbols-outlined`}>face</span>
					<span>Profil</span>
				</Link>
				<Link to="" style={{color: "red"}} onClick={() => {
					disconnect().then(() => {
						window.location.reload();
					});
				}}>
					<span className={`${styles.icon} material-symbols-outlined`}>logout</span>
					<span>Deconnexion</span>
				</Link>
			</ul>
			<div id={styles.page}>
				<Outlet />
			</div>
			<div id={styles.close_container}>
				<Link id={styles.close} to="/app">X</Link>
			</div>
		</main>
	);
}

export default Settings;