import { useEffect, useRef, useState } from "react";
import * as account from "../components/Accounts";
import styles from "../assets/css/login.module.css";
import { Link, useNavigate } from "react-router-dom";

function Login() {
	const [visible, setVisible] = useState(false);
	const username = useRef<HTMLInputElement | null>(null);
	const password = useRef<HTMLInputElement | null>(null);
	useEffect(() => {
		if (!username.current) return;
		username.current.focus();
	}, []);

	const navigate = useNavigate();
	return ( 
		<main id={styles.container}>
			<div id={styles.form}>
				<h1>Login</h1>
				<input ref={username} max={15} type="text" placeholder="Username" />
				<div className={styles.flex}>
					<input ref={password} min={8} type={visible ? "text" : "password"} placeholder="Password" />
					<button onClick={() => setVisible(!visible)} className="material-symbols-outlined">visibility</button>
				</div>
				<p>You doesn't have account yet? Register<Link to="/register">here</Link></p>
				<button id={styles.login} type="submit" onClick={async () => {
					if (!username.current || !password.current) return;
					const response = await account.login(
						username.current.value,
						password.current.value
					);
					if (!response.success) {
						return;
					}
					document.cookie = `token=${response.message};`;
					document.cookie = `username=${username.current.value.toLowerCase()};`;
					navigate("/app");
				}} >Login</button>
			</div>
		</main>
	);
}

export default Login;