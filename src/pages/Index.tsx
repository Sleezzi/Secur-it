import { Link } from "react-router-dom";
import styles from "../assets/css/index.module.css";
import { useEffect, useState } from "react";

function Index({ login }: { login: boolean }) {
	const [target, setTarget] = useState(0);
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "instant" });
		const handleScroll = (e: WheelEvent) => {
			e.stopPropagation();
			setTarget((oldTarget: number) => {
				if (e.deltaY > 0 && target < document.querySelectorAll("section").length) {
					return oldTarget + 1;
				}
				if (oldTarget > 0) {
					return oldTarget - 1;
				}
				return 0;
			});
		}
		window.addEventListener("wheel", handleScroll);
		return () => {
			window.removeEventListener("wheel", handleScroll);
		}
	}, []);
	useEffect(() => {
		if (!document.querySelector(`[id="${target}"]`)) return;
		document.querySelector(`[id="${target}"]`)?.scrollIntoView({ behavior: "smooth" });
	}, [target]);
	return (
		<div id={styles.content}>
			<header>
				<div id="0">
					<div className={styles.margin}/>
					
					<div className={styles.margin}/>
				</div>
				<div className={styles.floating}>
					<Link to="/">
						<h1>Secur'it</h1>
					</Link>
					<Link className={styles.start} to={login ? "/app" : "/register"}>Commencer à discuter</Link>
				</div>
			</header>
			<section>
				<div id={styles.background}>
					<span
						style={{
							fontSize: "3rem",
							top: "1%",
							left: "2%",
							transform: "rotate(350deg)",
							animationDelay: `${Math.random()}s`
						}}
						className="material-symbols-outlined"
					>keyboard</span>
					<span
						style={{
							fontSize: "3rem",
							top: "2.5%",
							left: "10%",
							transform: "rotate(350deg)",
							animationDelay: `${Math.random()}s`
						}}
						className="material-symbols-outlined"
					>crown</span>
					<span
						style={{
							fontSize: "1.75rem",
							top: "7%",
							left: "7%",
							transform: "rotate(240deg)",
							animationDelay: `${Math.random()}s`
						}}
						className="material-symbols-outlined"
					>send</span>
					<span
						style={{
							fontSize: "3.5rem",
							top: "15%",
							left: "1.5%",
							transform: "rotate(350deg)",
							animationDelay: `${Math.random()}s`
						}}
						className="material-symbols-outlined"
					>shield</span>
					<span
						style={{
							fontSize: "2.75rem",
							top: "2%",
							right: "11%",
							transform: "rotate(40deg)",
							animationDelay: `${Math.random()}s`
						}}
						className="material-symbols-outlined"
					>lock</span>
					<span
						style={{
							fontSize: "4rem",
							top: "8%",
							right: "5%",
							transform: "rotate(60deg)",
						}}
						className="material-symbols-outlined"
					>trophy</span>
					<span
						style={{
							fontSize: "2rem",
							top: "15%",
							right: "15%",
							transform: "rotate(40deg)",
							animationDelay: `${Math.random()}s`
						}}
						className="material-symbols-outlined"
					>mouse</span>
					<span
						style={{
							fontSize: "1.5rem",
							top: "10%",
							right: "25%",
							transform: "rotate(40deg)",
							animationDelay: `${Math.random()}s`
						}}
						className="material-symbols-outlined"
					>vpn_lock_2</span>
				</div>
				<img src="" alt="Logo" />
				<h1>Secur'it</h1>
				<p>La seul messagerie 100% sécurisée</p>
			</section>
			<section id="1">
				<img src="" alt="connection sécurisée" />
				<div>
					<h2>Un chriffrage des messages</h2>
					<p>Un chiffrement de bout-en-bout des messages pour que vos conversations reste entre vous et votre destinataire</p>
				</div>
			</section>
			<section id="2">
				<img src="" alt="suppression des données" />
				<div>
					<h2>Suppression des données</h2>
					<p>Vous pouvez rapidement supprimer vos toutes données pour que plus personne ne puisse vous retrouver.</p>
					<i style={{fontSize: ".75rem", color: "var(--alt-color)"}}>Attention a ne pas supprimer accidentelement votre compte</i>
				</div>
			</section>
			<section id="3">
				<img src="" alt="interface" />
				<div>
					<h2>Une interface simple</h2>
					<p>L'interface de cette messagerie est pensée pour qu'elle soit le plus simple et fonctionnel possible car nous pensons que la confidentialité et la sécurité doivent être accessible à tous.</p>
				</div>
			</section>
			<footer id="4">
				<Link className={styles.start} to={login ? "/app" : "/register"}>Commencer à discuter</Link>
			</footer>
		</div>
	);
}
export default Index;