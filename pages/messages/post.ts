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
			const { content, channel }: { content: string, channel: {
				type: "SERVER" | "MP",
				recipent: string
			}} = message.args;
			if (typeof content !== "string" || /[a-zA-Z0-9²°#@&~""\{\(\\\[\`\]\)\}\-\.\|_,;:\/\*§%^¨îïôöêëéèçù<>!?\$€£]{1,150}/.test(content)) {
				reply("Error", "Invalid message content");
				return;
			}
			if (!channel.type || channel.type.toUpperCase() !== "SERVER" && channel.type.toUpperCase() !== "MP") {
				reply("Error", "Invalid \"to\" type");
				return;
			}
			if (!channel.recipent || typeof channel.recipent !== "string") {
				reply("Error", "Invalid \"id\" type");
				return;
			}
			if (channel.type.toUpperCase() === "SERVER") {
				const server: Database["servers"][""] = await client.database.get(`/servers/${channel.recipent}`);
				if (!server) {
					reply("Error", "Server not found");
					return;
				}
				if (!server.members.find((user) => user.username === username.toLowerCase())) {
					reply("Error", "Server not found");
					return;
				}
				client.database.set(`/servers/${channel.recipent}/messages/${uuid()}`, {
					message: content,
					user: username.toLowerCase(),
					date: Date.now() / 1000
				} as Database["servers"][""]["messages"][""]);
				return;
			}
			if (channel.type.toUpperCase() === "MP") {
				const friend = Object.entries(
					(await client.database.get(`/accounts/${username.toLowerCase()}/friends/list`) as string[]) || {}
				).find(([user, mp]) => mp === channel.recipent);
				if (!friend) {
					reply("Error", "Channel not found");
					return;
				}
				const recipent: Database["mp"][""] = await client.database.get(`/mp/${channel.recipent}`);
				if (!recipent) {
					reply("Error", "Channel not found");
					return;
				}
				const id = uuid();
				client.database.set(`/mp/${channel.recipent}/${id}`, {
					message: content,
					user: username.toLowerCase(),
					date: Math.floor(Date.now() / 1000)
				} as Database["mp"][""][""]);
				send(friend[0].toLowerCase(), {
					id: `New message: ${channel.recipent}`,
					args: {
						id,
						message: content,
						user: username.toLowerCase(),
						date: Date.now() / 1000
					}
				});
				reply("Success", {
					user: username,
					id,
					content: content,
					date: Date.now() / 1000
				});
				return;
			}
			reply("Error", "Unknow");
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;