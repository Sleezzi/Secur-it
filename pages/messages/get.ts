import { Pages, Database } from "../../interfacies";
import { v4 as uuid } from "uuid";

const page: Pages = {
	method: "WS",
	async execute(client, username, message, reply, send) {
		try {
			if (!message.args) {
				reply("Error", "Missing args");
				return;
			}
			const { type, recipent }: {
				type: "SERVER" | "MP",
				recipent: string,
			} = message.args;

			if (!type || (type.toUpperCase() !== "SERVER" && type.toUpperCase() !== "MP")) {
				reply("Error", "Invalid \"to\" type");
				return;
			}
			if (!recipent || typeof recipent !== "string") {
				reply("Error", "Invalid \"id\" type");
				return;
			}
			if (type.toUpperCase() === "SERVER") {
				// const server: Database["servers"][""] = await client.database.get(`/servers/${channel.recipent}`);
				// if (!server) {
				// 	reply("Error", "Server not found");
				// 	return;
				// }
				// if (!server.members.find((user) => user.username === username.toLowerCase())) {
				// 	reply("Error", "Server not found");
				// 	return;
				// }
				// client.database.set(`/servers/${channel.recipent}/messages/${uuid()}`, {
				// 	message: content,
				// 	user: username.toLowerCase(),
				// 	date: Date.now() / 1000
				// } as Database["servers"][""]["messages"][""]);
				return;
			}
			if (type.toUpperCase() === "MP") {
				const [friendName] = Object.entries(
					(await client.database.get(`/accounts/${username.toLowerCase()}/friends/list`) as string[]) || {}
				).find(([user, mp]) => mp === recipent) || [null];
				if (!friendName) {
					reply("Error", "Channel not found");
					return;
				}
				const friend: Database["accounts"][""] = await client.database.get(`/accounts/${friendName.toLowerCase()}`);
				if (!friend) {
					reply("Error", "Channel not found");
					return;
				}

				const messages: Database["mp"][""] = await client.database.get(`/mp/${recipent}`);
				if (!messages) {
					reply("Error", "Channel not found");
					return;
				}
				const account: Database["accounts"][""] = await client.database.get(`/accounts/${username.toLowerCase()}`);
				reply("Success", {
					members: [
						{
							username: friendName.toLowerCase(),
							avatar: friend.avatar || null,
							online: friend.online,
							verified: friend.verified || false,
						},
						{
							username,
							avatar: account.avatar || null,
							online: account.online,
							verified: account.verified || false,
						}
					],
					messages: messages
				});
				return;
			}
			reply("Success", "Message posted");
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;