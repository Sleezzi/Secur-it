import { Database, Pages } from "../../interfacies";
import { v4 as uuid } from "uuid";

const page: Pages = {
	method: "WS",
	async execute(client, username, message, reply, send) {
		try {
			if (!message.args) {
				reply("Error", "Missing args.");
				return;
			}
			if (typeof message.args !== "string") {
				reply("Error", "Invalid name format.");
				return;
			}
			const mp: Database["accounts"][""]["friends"]["list"] | null = await client.database.get(`/accounts/${username.toLowerCase()}/friends/list/${message.args.toLowerCase()}`);
			if (!mp) {
				reply("Error", "The requested user does not exist.");
				return;
			}
			client.database.delete(`/accounts/${username.toLowerCase()}/friends/list/${message.args.toLowerCase()}`);
			client.database.set(`/mp/${mp}`, {
				"0": {
					user: "System",
					message: `${username} removed ${message.args}`,
					date: Math.floor(Date.now() / 1000),
					saved: true
				}
			} as Database["mp"][""]);

			send(message.args.toLowerCase(), { id: "Friend removed" });
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;