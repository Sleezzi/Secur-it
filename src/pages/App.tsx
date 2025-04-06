import { v4 as uuid } from "uuid";
import { useState } from "react";

import styles from "../assets/css/app.module.css";


import { Outlet } from "react-router-dom";
import { MessageBase, ReciveMessage, SendMessage } from "../interfacies";
import Loading from "./Loading";
import Channels from "../components/Channels";
import { disconnect } from "../components/Accounts";

function App({ username, token }: { username: string, token: string }) {
	const [ws, setWs] = useState<WebSocket | null | "Loading">(null);
	const [messages, setMessages] = useState<{
		[id: string]: SendMessage
	}>({});
	const [messagesListeners, setMessagesListeners] = useState<{
		[id: string]: {
			search: string,
			callback: SendMessage
		}
	}>({});
	if (!ws) {
		const socket = new WebSocket(`wss://api.sleezzi.fr/ws/?username=${username.toLowerCase()}&token=${token}`);
		setWs("Loading");
		socket.onmessage = (raw) => {
			if (typeof raw.data !== "string") {
				console.log("Unhandled message recieved from server", raw);
				return;
			}
			const message: MessageBase = JSON.parse(raw.data);
			if (message.id.toLowerCase() === "error") {
				disconnect().then(() => {
					window.location.href = "/login";
					window.location.reload();
				});
				return;
			}
			setWs(socket);
		}
		return (<Loading step={{current: 0, max: 2}} message="Connection au serveur" />);
	}
	if (ws === "Loading") {
		return (<Loading step={{current: 1, max: 2}} message="Connection au serveur" />);
	}
	ws.onmessage = (e) => {
		if (!e.data) return;
		const data: ReciveMessage = JSON.parse(e.data);
		if (!data.id) {
			console.error("Invalid message format: missing id", data);
			return;
		}
		
		if (data.request_id) {
			const request = messages[data.request_id];
			if (!request) {
				console.error("Can't find", data.request_id);
				return;
			}
			
			request(data.id, data.args);
			const newMessages = {...messages};
			delete newMessages[data.request_id];
			setMessages(newMessages);
		} else {
			const listeners = Object.entries(messagesListeners).filter(([, listener]) => listener.search === data.id);
			if (listeners.length === 0) return;
			listeners.forEach(([, listener]) => {
				listener.callback(data.id, data.args);
			});
		}
	}
	ws.onclose = () => {
		setMessages({});
		window.location.reload();
	}

	const sendMessage: SendMessage = (id, args) => {
		ws.send(JSON.stringify({
			id,
			args
		}));
	}
	const listenForMessage = (id: string, callback: SendMessage) => {
		const listenerId = uuid();
		setMessagesListeners((oldListeners) => ({
			...oldListeners,
			[listenerId]: {
				search: id,
				callback
			}
		}));
		return {
			remove: () => {
				const listeners = {...messagesListeners};
				delete listeners[listenerId];
				setMessagesListeners(listeners);
			}
		}
	}
	const sendMessageWithResponse = (id: string, args?: any) => {
		return new Promise<{
			id: string,
			args: string
		}>((resolve) => {
			const request_id = uuid();
			ws.send(JSON.stringify({
				request_id: request_id,
				id,
				args
			}));
			setMessages((oldData) => (
				{
					...oldData,
					[request_id]: (id, args) => resolve({id, args})
				}
			));
		});
	}
	return (
		<div id={styles.content}>
			<Channels listen={listenForMessage} sendMessageWithResponse={sendMessageWithResponse} />
			<div id={styles.container}>
				<Outlet context={{
					sendMessage,
					sendMessageWithResponse,
					listen: listenForMessage
				}} />
			</div>
		</div>
	);
}
export default App;