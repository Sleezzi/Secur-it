import { Database, Pages } from "../../interfacies";

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
			const user: Database["accounts"][""] | null = await client.database.get(`/accounts/${message.args.toLowerCase()}`);
			if (!user) {
				reply("Error", "The requested user does not exist.");
				return;
			}
			if (user.blocked && user.blocked.find(name => name === username.toLowerCase())) {
				reply("Error", "The requested user does not exist.");
				return;
			}
			if (user.friends?.request.find((friend) => friend === username.toLowerCase())) {
				reply("Error", "You've already friend requested this person. Wait for them to accept your request.");
				return;
			}
			if (Object.entries(user.friends?.list || {}).find(([friend]) => friend === username)) {
				reply("Error", "You are already friends with this person.");
				return;
			}
			let list: string[] | null = await client.database.get(`/accounts/${message.args.toLowerCase()}/friends/request`);
			if (list?.length) list = [];
			client.database.set(`/accounts/${message.args.toLowerCase()}/friends/request/${list?.length || 0}`, username.toLowerCase());
			
			const account: Database["accounts"][""] = await client.database.get(`/accounts/${username.toLowerCase()}`);
			send(message.args.toLowerCase(), {
				id: "Friend request",
				args: {
					user: username,
					avatar: account.avatar || null,
					online: account.online,
					verified: account.verified || false
				}
			});
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;