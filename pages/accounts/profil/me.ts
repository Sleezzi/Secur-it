import { Database, Pages } from "../../../interfacies";

const page: Pages = {
	method: "WS",
	async execute(client, username, message, reply, send) {
		try {
			const profil: Database["accounts"][""] | null = await client.database.get(`/accounts/${username}`);
			if (!profil) {
				reply("Error", "Can't find the user wanted");
				return;
			}
			reply("Success", {
				username: username,
				avatar: profil.avatar || null,
				verified: profil.verified || false,
			});
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;