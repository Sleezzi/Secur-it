import { Pages, Database } from "../../interfacies";

const page: Pages = {
	method: "WS",
	name: "messages/post",
	async execute(client, username, message, reply) {
		try {
			if (!message.args) {
				reply("Error", "Missing args");
				return;
			}
			const { content, channel }: { content: string, channel: {
				type: "SERVER" | "MP",
				recipent: string,
				id: string
			}} = message.args;
			if (typeof content !== "string" || content.length > 250) {
				reply("Error", "Invalid message content");
				return;
			}
			if (!channel.type || channel.type.toUpperCase() !== "SERVER" && channel.type.toUpperCase() !== "MP") {
				reply("Error", "Invalid \"to\" type");
				return;
			}
			if (!channel.id || typeof channel.id !== "string" || !channel.recipent || typeof channel.recipent !== "string") {
				reply("Error", "Invalid \"to\" type");
				return;
			}
			if (channel.type === "SERVER") {
				const server: Database["servers"][""] = await client.database.get(`/servers/${channel.recipent}`);
				if (!server) {
					reply("Error", "Server not found");
					return;
				}
				if (!server.members.find((user) => user.username === username)) {
					reply("Error", "Server not found");
					return;
				}
			}
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;