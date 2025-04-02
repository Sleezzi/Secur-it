import { Log, navigate } from "./components"
import { Pages } from "./interfacies";
import Client from "./client";
import firebase from "firebase-admin";
import express, { Express, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { json as BodyParserJSON, urlencoded } from "body-parser";
import { Server as WebSocketServer } from "ws";
import handleConnectionWS from "./handleConnectionWS";

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
app.set("trust proxy", 1);

const wss = new WebSocketServer({ port: client.config.port.ws });

wss.on("connection", async (ws, request) => {
	try {
		handleConnectionWS(client, wss, ws, request);
	} catch (err) {
		console.error(err);
	}
});

const pagesFolder = "./pages";

navigate(pagesFolder, (path: string) => {
	try {
		const url_path = path.replace(pagesFolder, "").replace(/\.(ts|js)$/, "");
		const file = path.split("/")[path.split("/").length-1].replace(/\.(ts|js)$/, "");
		
		const page: Pages = require(path); // Get the contents of the file
		
		if (page.method && page.execute as any) { // Check if the file is valid
			if (page.method === "WS") {
				Log(`Page %italic%%orange%${page.method}%reset% %green%${file}%reset% %gray%(ws://localhost:${client.config.port.ws}; message=${url_path})%reset% loaded`); // Log
				client.WSMessages.push({
					name: url_path,
					execute: page.execute
				});
			} else {
				Log(`Page %italic%%orange%${page.method}%reset% %green%${file}%reset% %gray%(http://localhost:${client.config.port.express}/http${url_path.startsWith("/") ? "" : "/"}${url_path}${url_path})%reset% loaded`); // Log
				app[page.method.toLowerCase() as keyof Express](`/http${url_path.startsWith("/") ? "" : "/"}${url_path}`, (request: Request, response: Response) => {
					try {
						page.execute(request, response, client);
						Log(`Page %orange%${page.method}%reset% "%green%${file}%reset%" %gray%(http://localhost:${client.config.port.express}/http${url_path.startsWith("/") ? "" : "/"}${url_path}${url_path})%reset% used (ip: ${request.ip})`)
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
	Log(`Bot API is running at %gray%http://localhost:${client.config.port.express}/http/%reset%`);
});