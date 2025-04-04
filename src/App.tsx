import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./assets/css/main.css";

import { getCookie, verify, disconnect } from "./components/Accounts";

import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from './pages/Login';
import AppIndex from "./pages/App";
import Settings from "./pages/Settings";
import MP from "./components/pages/MP";
import Group from "./components/pages/Group";
import Friends from "./components/pages/Friends";
import Profil from "./components/pages/settings/Profil";

function App() {
	const location = useLocation();
	useEffect(() => {
		if (location.pathname.split("/").pop()?.length as number > 0) {
			if (document.querySelector("body > #root > #ERROR_404")) {
				document.title = `Secur'it - Unable to find the requested page`;
			} else {
				const Text = location.pathname.split("/").pop()?.replace(/-/g, " ");
				document.title = `Secur'it - ${Text?.toUpperCase()[0]}${Text?.slice(1, Text.length)}`;
			}
		} else {
			document.title = `Secur'it`;
		}
	}, [location.pathname]);

	const [token] = useState<null | string>(getCookie("token") || null);
	const [username] = useState<null | string>(getCookie("username") || null);


	useEffect(() => {
		if (token) {
			verify(token).then(result => {
				if (!result) {
					disconnect().then(() => window.location.reload());
				}
			});
			if (!username) {
				disconnect().then(() => window.location.reload());
			}
		}
	}, []);


	if (!token || !username) {
		return (
			<Routes>
				<Route path="" element={<Index login={false} />}/>
				<Route path="*" element={<Index login={false} />}/>
				<Route path="login" element={<Login />}/>
				<Route path="register" element={<Register />}/>
			</Routes>
		);
	}

	return (
		<Routes>
			<Route path="" element={<Index login={true}/>} />
			<Route path="app" element={<AppIndex username={username} token={token} />}>
				<Route path="" element={<Friends />}/>
				<Route path="friends" element={<Friends />}/>
				<Route path="mp/:id" element={<MP username={username} />} />
				<Route path="group/:id" element={<Group />} />
			</Route>
			<Route path="app/settings" element={<Settings />} >
				<Route path="" element={<Profil />} />
				<Route path="profil" element={<Profil />} />
			</Route>
		</Routes>
	);
}

export default App;