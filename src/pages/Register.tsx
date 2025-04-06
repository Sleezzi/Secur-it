import { useEffect, useRef, useState } from "react";
import { register } from "../components/Accounts";
import styles from "../assets/css/login.module.css";
import { Link, useNavigate } from "react-router-dom";
import AriaLabel from "../components/AriaLabel";

function Register() {
	const [visible, setVisible] = useState(false);
	const username = useRef<HTMLInputElement | null>(null);
	const valid_password = useRef<HTMLInputElement | null>(null);
	const killer_password = useRef<HTMLInputElement | null>(null);
	useEffect(() => {
		if (!username.current) return;
		username.current.focus();
	}, []);

	const navigate = useNavigate();
	return ( 
		<main id={styles.container}>
			<div id={styles.form} style={{height: "25rem"}}>
				<h1>Register</h1>
				<input ref={username} max={15} type="text" placeholder="Username" />
				<div className={styles.flex}>
					<input ref={valid_password} min={8} type={visible ? "text" : "password"} placeholder="Password" />
					<button onClick={() => setVisible(!visible)} className="material-symbols-outlined">visibility</button>
				</div>
				<div className={styles.flex}>
					<input ref={killer_password} min={8} type={visible ? "text" : "password"} placeholder="Killer password" />
					<AriaLabel style={{padding: ".5rem"}} parent={<span className="material-symbols-outlined">help</span>} value="When you enter your password on the login page, your account and conversations will be deleted.
This provides better security, if you're forced to give out a password, give it this one." />
				</div>
				<p>You already have a account? Login<Link to="/login">here</Link></p>
				<button id={styles.register} type="submit" onClick={async () => {
					if (!username.current || !valid_password.current || !killer_password.current) return;
					const response = await register(
						username.current.value,
						{
							valid: valid_password.current.value,
							killer: killer_password.current.value
						}
					);
					if (!response.success) {
						return;
					}
					document.cookie = `token=${response.message};`;
					document.cookie = `username=${username.current.value.toLowerCase()};`;
					navigate("/app");
				}} >Register</button>
			</div>
		</main>
	);
}

export default Register;