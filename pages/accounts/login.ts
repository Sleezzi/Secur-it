import { Pages } from "../../interfacies";

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
			const account = await client.login(body.username, body.password);
			if (!account.success) {
				response.status(400).json({
					code: 400,
					message: account.message,
				});
			}
			
			response.status(200).json({
				code: 200,
				message: "Success",
				args: account.message
			});
		} catch (err) {
			console.error(err);
		}
	},
}

module.exports = page;