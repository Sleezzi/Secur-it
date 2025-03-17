import bcrypt from "bcrypt";
import { Database, Pages } from "../../interfacies";

const page: Pages = {
	method: "PUT",
	async execute(request, response, client) {
		try {
			const body: {
				username: string,
				password: string
			} | null = request.body;
			if (!body) {
				response.status(400).json({
					code: 400,
					message: "Invalid auth"
				});
				return;
			}
			if (!body.username || typeof body.username !== "string") {
				response.status(400).json({
					code: 400,
					message: "Invalid auth"
				});
				return;
			}
			if (!body.password || typeof body.password !== "string") {
				response.status(400).json({
					code: 400,
					message: "Invalid auth"
				});
				return;
			}
			const account = await client.database.get(`/accounts/${body.username.toLowerCase()}`) as Database["accounts"][""];
			
			if (!account) {
				response.status(400).json({
					code: 400,
					message: "Invalid username or password"
				});
				return;
			}
			if (!bcrypt.compareSync(body.password, account.mdp)) {
				response.status(400).json({
					code: 400,
					message: "Invalid username or password"
				});
				return;
			}
			
			response.status(200).json({
				code: 200,
				message: "Success",
				args: {
					token: account.jwt
				}
			});
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;