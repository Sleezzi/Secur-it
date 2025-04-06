import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import Client from "./client";
import { Log } from "./components";

async function handleConnectionWS(client: Client, wss: WebSocketServer, ws: WebSocket & { href?: string }, request: IncomingMessage) {
	try {
		if (!request.url?.split("?")[1]) {
			ws.close(3000, "Missing params");
			return;
		}
		ws.href = request.url;
		const params = new URLSearchParams(request.url?.split("?")[1])
		const username = params.get("username");
		if (!username) {
			ws.send(JSON.stringify({
				id: "error",
				args: "Invalid auth: missing username param",
			}));
			ws.close(3000, "Missing \"username\" param");
			return;
		}
		const token = params.get("token");
		if (!token) {
			ws.send(JSON.stringify({
				id: "error",
				args: "Invalid auth: missing token param",
			}));
			ws.close(3000, "Missing \"token\" param");
			return;
		}
		const isValid = await client.authenticate(username, token);
		if (!isValid.success) {
			ws.send(JSON.stringify({
				id: "error",
				args: "Invalid auth",
			}));
			ws.close(3000, "Invalid token or username");
			return;
		}
		client.database.set(`/accounts/${username.toLowerCase()}/online`, true);

		ws.send(JSON.stringify({
			id: "Connection",
			args: "Success"
		}));
		
		Log(`%green%${username}%reset% connected`);

		ws.on("message", (raw) => {
			try {
				const message: {
					id: string,
					args?: any,
					request_id?: string
				} = JSON.parse(raw.toString());
				
				if (!message.id) {
					ws.send(JSON.stringify({
						id: "error",
						args: "Invalid message",
						request_id: message.request_id || null
					}));
					return;
				}
				const file = client.WSMessages.find((f) => f.name === message.id || f.name === `/${message.id}`);
				if (!file) {
					ws.send(JSON.stringify({
						id: "error",
						args: "Invalid message",
						request_id: message.request_id || null
					}));
					return;
				}
				file.execute(client, username, message, (id, args) => {
					try {
						ws.send(
							JSON.stringify({
								id,
								args,
								request_id: message.request_id || null,
								origin: file.name
							})
						);
					} catch (err) {
						console.error(err);
					}
				}, (recipent, content) => {
					try {
						
						const user = Array.from((wss as any).clients as (WebSocket & { href: string })[]).find(user => {
							if (!user.href) return false;
							const option = user.href.split("?")[1];
							const username = new URLSearchParams(option).get("username");
							
							if (!username || username.toLowerCase() !== recipent.toLowerCase()) return false;
							return true;
						})
						if (!user) return;
						
						user.send(JSON.stringify(content));
					} catch (err) {
						console.error(err);
					}
				});
			} catch (err) {
				console.error(err);
			}
		});
		ws.once("close", () => {
			try {
				client.database.set(`/accounts/${username.toLowerCase()}/online`, false);
			} catch (err) {
				console.error(err);
			}
		});
	} catch (err) {
		console.error(err);
	}
}

export default handleConnectionWS;