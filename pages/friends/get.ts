import { Database, Pages } from "../../interfacies";
import { v4 as uuid } from "uuid";

const page: Pages = {
	method: "WS",
	async execute(client, username, message, reply, send) {
		try {
			const friends_list: Database["accounts"][""]["friends"] | null = await client.database.get(`/accounts/${username.toLowerCase()}/friends`);
			if (!friends_list) {
				reply("Friends list", null);
				return;
			}
			if ((!friends_list.request || friends_list.request.length === 0) && !friends_list.list) {
				reply("Friends list", null);
				return;
			}

			const friends: {
				friends: {
					username: string,
					avatar: string | null,
					verified: boolean,
					mp: string,
					online: boolean,
				}[],
				request: {
					username: string,
					avatar: string | null,
					verified: boolean,
					online: boolean,
				}[]
			} = {
				friends: [],
				request: []
			};

			const accounts: Database["accounts"] = await client.database.get(`/accounts`);

			Object.entries(friends_list.list || {}).forEach(([name, mp]) => {
				const friend = accounts[name.toLowerCase()];
				if (!friend) {
					console.log("Can't find", name, friends_list);
					return;
				}
				friends.friends.push({
					username: name,
					mp,
					online: friend.online,
					verified: friend.verified || false,
					avatar: friend.avatar || null
				});
			});
			(friends_list.request || []).forEach((name) => {
				const friend = accounts[name.toLowerCase()];
				if (!friend) {
					console.log("Can't find", name, friends_list);
					return;
				}
				friends.request.push({
					username: name,
					online: friend.online,
					verified: friend.verified || false,
					avatar: friend.avatar || null
				});
			});

			reply("Friend list", friends);
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;