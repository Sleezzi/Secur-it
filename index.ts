import { Log, navigate, authenticate } from "./components"
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
app.enable("trust proxy");
app.set("etag", false);


const wss = new WebSocketServer({ port: client.config.port });

const validMessageWS: {
	name: string,
	execute: PagesWS["execute"]
}[] = [];

wss.on("connection", async (ws, request) => {
	const isValid = await authenticate(client, request.headers.authorization);
	if (!isValid) {
		ws.close(403, "Invalid auth");
	}
	ws.on("message", (message) => {

	});
});

navigate("./pages", (path: string) => {
	try {
		const file = path.split("/")[path.split("/").length].split(".").slice(0, path.split("/")[path.split("/").length].split(".").length - 1);
		const page: Pages = require(path); // Get the contents of the file
		if (page.method && page.execute as any) { // Check if the file is valid
			if (page.method === "WS") {
				validMessageWS.push({
					name: page.name,
					execute: page.execute
				});
			} else {
				Log(`Page %italic%%orange%${page.method}%reset% %green%${file}%reset% %gray%(http://localhost:${client.config.port}${path})%reset% loaded`); // Log
				app[page.method.toLowerCase() as keyof Express](`${path}`, (request: Request, response: Response) => {
					try {
						page.execute(request, response, client);
						Log(`Page %orange%${page.method}%reset% "%green%${file}%reset%" %gray%(http://localhost:${client.config.port}${path})%reset% used (ip: ${request.ip})`)
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

app.listen(client.config.port, () => {
	Log(`Bot API is running at %gray%http://localhost:${client.config.port}%reset%`);
});