import { grenerateToken } from "../../components";
import { Database, Pages } from "../../interfacies";
import bcrypt from "bcrypt";

const page: Pages = {
	method: "POST",
	async execute(request, response, client) {
		try {
			const body: {
				username?: string,
				valid_password?: string
				killer_password?: string
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
					message: "Invalid username"
				});
				return;
			}
			if (!body.valid_password || typeof body.valid_password !== "string") {
				response.status(400).json({
					code: 400,
					message: "Invalid password"
				});
				return;
			}
			if (!body.killer_password || typeof body.killer_password !== "string") {
				response.status(400).json({
					code: 400,
					message: "Invalid password"
				});
				return;
			}
			const valid_hash = await bcrypt.hash(body.valid_password, await bcrypt.genSalt(10));
			const killer_hash = await bcrypt.hash(body.killer_password, await bcrypt.genSalt(10));
			const token = grenerateToken(25);
			client.database.set(`/accounts/${body.username.toLowerCase()}`, {
				friends: [],
				mdp: {
					valid: valid_hash,
					killer: killer_hash
				},
				online: true,
				token,
			} as Database["accounts"][""]);

			response.status(200).json({
				code: 200,
				message: "Account created",
				args: {
					token: token
				}
			});
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;