import { Database, Pages } from "../../../interfacies";

const page: Pages = {
	method: "WS",
	async execute(client, username, message, reply, send) {
		try {
			if (!message.args) {
				reply("Error", "Missing args");
				return;
			}
			const profil: Database["accounts"][""] | null = await client.database.get(`/accounts/${message.args}`);
			if (!profil) {
				reply("Error", "Can't find the user wanted");
				return;
			}
			if (profil.blocked && profil.blocked.find(name => name == username)) {
				reply("Error", "Can't find the user wanted");
				return;
			}
			reply("Success", {
				username: message.args,
				avatar: profil.avatar || null,
				admin: profil.admin,
				friend: (() => {
					if (!profil.friends) return false;
					if (profil.friends.list && Object.entries(profil.friends.list).find(([name]) => name === username)) return "Requested";
					if (profil.friends.request && profil.friends.request.find((user) => user === username)) return true;
					return false;
				})(),
				online: profil.online
			});
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;