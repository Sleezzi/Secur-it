import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import Client from "./client";

async function handleConnectionWS(client: Client, wss: WebSocketServer, ws: WebSocket, request: IncomingMessage) {
	try {
		const params = request.url?.split("?")[1];
		if (!params) {
			ws.close();
			return;
		}
		const username = new URLSearchParams(params).get("username");
		if (!username) {
			ws.close();
			return;
		}
		if (!request.headers.authorization) {
			ws.close();
			return;
		}
		const isValid = await client.authenticate(username, request.headers.authorization);
		if (!isValid.success) {
			ws.close();
			return;
		}
		const account = isValid.account;
		client.database.set(`/accounts/${username}/online`, true);

		ws.on("message", (raw) => {
			try {
				const message: {
					id: string,
					args?: any
				} = JSON.parse(raw.toString());
				
				if (!message.id) {
					ws.send(JSON.stringify({
						id: "error",
						args: "Invalid message"
					}));
					return;
				}
				const file = client.WSMessages.find((f) => f.name === message.id || f.name === `/${message.id}`);
				if (!file) {
					ws.send(JSON.stringify({
						id: "error",
						args: "Invalid message"
					}));
					return;
				}
				file.execute(client, username, message, (id, args) => {
					try {
						ws.send(
							JSON.stringify({
								id,
								args,
								origin: file.name
							})
						);
					} catch (err) {
						console.error(err);
					}
				}, (recipent, content) => {
					try {
						wss.clients.forEach((user) => {
							const params = user.url?.split("?")[1];
							const username = new URLSearchParams(params).get("username");
							if (username !== recipent) return;
							user.send(
								JSON.stringify({
									content
								})
							);
						});
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
				client.database.set(`/accounts/${username}/online`, false);
			} catch (err) {
				console.error(err);
			}
		});
	} catch (err) {
		console.error(err);
	}
}

export default handleConnectionWS;