import { grenerateToken } from "../../components";
import { Pages } from "../../interfacies";
import bcrypt from "bcrypt";

const page: Pages = {
	method: "POST",
	async execute(request, response, client) {
		try {
			const admin_token = request.headers.authorization;
			if (!admin_token || admin_token !== `Bearer ${client.config.token}`) {
				console.log(!admin_token, admin_token, `Bearer ${client.config.token}`);
				
				response.status(400).json({
					code: 400,
					message: "Unauthorized",
				});
				return;
			}

			const body: {
				username?: string,
				password?: string
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
			if (!body.password || typeof body.password !== "string") {
				response.status(400).json({
					code: 400,
					message: "Invalid password"
				});
				return;
			}
			const hash = await bcrypt.hash(body.password, await bcrypt.genSalt(10));
			const token = grenerateToken(25);
			client.database.set(`/accounts/${body.username.toLowerCase()}`, {
				hash,
				token
			});

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