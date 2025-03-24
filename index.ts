import { Log, navigate } from "./components"
import { Client, Pages, PagesWS } from "./interfacies";
import firebase from "firebase-admin";
import express, { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { json as BodyParserJSON, urlencoded } from "body-parser";
import { Server as WebSocketServer } from "ws";

const client = new Client();

client.config = require("./config.json");

firebase.initializeApp({
	credential: firebase.credential.cert(client.config.database?.credentials as any),
	databaseURL: client.config.database?.url // The database URL
});
client.database.database = firebase.database();

Log("The database has been initialized");

const app = express();
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});
app.use(BodyParserJSON());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(rateLimit({
	windowMs: 5000,
	max: 5,
	message: {
		code: 429,
		msg: "Too many request"
	}
})),
app.set("etag", false);

const wss = new WebSocketServer({ port: client.config.port.ws });

const WSMessages: {
	name: string,
	execute: PagesWS["execute"]
}[] = [];

wss.on("connection", async (ws, request) => {
	try {
		const params = request.url?.split("?")[1];
		if (!params) {
			ws.close();
			return;
		}
		const username = new URLSearchParams(params).get("username");
		if (!username) {
			ws.close();
			return;
		}
		if (!request.headers.authorization) {
			ws.close();
			return;
		}
		const isValid = await client.authenticate(username, request.headers.authorization);
		if (!isValid.success) {
			ws.close();
			return;
		}
		const account = isValid.account;
		client.database.set(`/accounts/${username}/online`, true);

		ws.on("message", (raw) => {
			try {
				const message: {
					id: string,
					args?: any
				} = JSON.parse(raw.toString());

				if (!message.id) {
					ws.send(JSON.stringify({
						id: "error",
						args: "Invalid message"
					}));
					return;
				}
				const file = WSMessages.find((f) => f.name === message.id || f.name === `/${message.id}`);
				if (!file) {
					ws.send(JSON.stringify({
						id: "error",
						args: "Invalid message"
					}));
					return;
				}
				file.execute(client, username, message, (id, args) => {
					ws.send(
						JSON.stringify({
							id,
							args,
							origin: file.name
						})
					);
				});
			} catch (err) {
				console.error(err);
			}
		});
		ws.once("close", () => {
			try {
				client.database.set(`/accounts/${username}/online`, false);
			} catch (err) {
				console.error(err);
			}
		});
	} catch (err) {
		console.error(err);
	}
});

const pagesFolder = "./pages";

navigate(pagesFolder, (path: string) => {
	try {
		const url_path = path.replace(pagesFolder, "").replace(/\.[t|j]s$/, "");
		const file = path.split("/")[path.split("/").length-1].replace(/\.[t|j]s$/, "");
		
		const page: Pages = require(path); // Get the contents of the file
		
		if (page.method && page.execute as any) { // Check if the file is valid
			if (page.method === "WS") {
				Log(`Page WS %italic%%orange%${page.method}%reset% %green%${file}%reset% loaded`); // Log
				WSMessages.push({
					name: page.name,
					execute: page.execute
				});
			} else {
				Log(`Page %italic%%orange%${page.method}%reset% %green%${file}%reset% %gray%(http://localhost:${client.config.port.express}${url_path})%reset% loaded`); // Log
				app[page.method.toLowerCase() as keyof Express](`${url_path}`, (request: Request, response: Response) => {
					try {
						page.execute(request, response, client);
						Log(`Page %orange%${page.method}%reset% "%green%${file}%reset%" %gray%(http://localhost:${client.config.port.express}${url_path})%reset% used (ip: ${request.ip})`)
					} catch (err) {
						console.error(err);
					}
				});
			}
		} else {
			Log(`%red%[WARNING] Something missing with ${path.split("/")[path.split("/").length - 1]} page`);
		}
	} catch (err) {
		console.error(err);
	}
});

app.listen(client.config.port.express, () => {
	Log(`Bot API is running at %gray%http://localhost:${client.config.port.express}%reset%`);
});