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
			const user: Database["accounts"][""] | null = await client.database.get(`/accounts/${message.args}`);
			if (!user) {
				reply("Error", "The requested user does not exist.");
				return;
			}
			const account: Database["accounts"][""] = await client.database.get(`/accounts/${username}`);
			if (!account.friends?.request.find((friend) => friend === message.args)) {
				reply("Error", "Internal error, request");
				return;
			}
			if (Object.entries(account.friends?.list || {}).find(([friend, mp]) => friend === message.args)) {
				reply("Error", "Internal error, list");
				return;
			}
			client.database.delete(`/accounts/${username}/friends/request/${account.friends.request.indexOf(message.args)}`);

			const mp = uuid();

			client.database.set(`/accounts/${username}/friends/list/${message.args}`, mp);
			client.database.set(`/accounts/${message.args}/friends/list/${username}`, mp);
			
			client.database.set(`/mp/${mp}/0`, {
				user: "System",
				message: `${username} accepted ${message.args}`,
				date: Math.floor(Date.now() / 1000)
			} as Database["mp"][""][""]);

			send(message.args, {
				id: "Friend accepted",
				args: {
					user: username,
					mp
				}
			})
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;