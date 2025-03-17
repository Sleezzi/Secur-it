import { grenerateToken } from "../components";
import { Pages } from "../interfacies";
import { v4 as uuid } from "uuid";

const moduleExport: Pages = {
	name: "cookies",
	method: "POST",
	url: "/cookies",
	async execute(request, response, client) {
		try {
			const name = request.query.name;
			if (!name || typeof name !== "string" || !/[a-zA-Z0-9\-]{1, 20}/.test(name)) {
				response.status(400).json({
					message: "Invalid name"
				});
				return;
			}
			const body = request.body;
			if (Object.keys(body).length === 0) {
				response.status(400).json({
					message: "Invalid body"
				});
				return;
			}
			
			client.database.set(`${name}\\${grenerateToken(4)}`, body);
			
			response.json({
				success: true
			});
		} catch (err) {
			console.error(err);
		}
	}
}

module.exports = moduleExport;