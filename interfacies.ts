import { database as FIREDB } from "firebase-admin";
import { Request, Response } from "express"; 

type RegexMatchedString<Pattern extends string> = `${string & { __brand: Pattern }}`;

export interface PagesExpress {
	method: "GET" | "POST" | "PUT" | "DELETE"
	execute: (request: Request, response: Response, client: Client) => any
}
export interface PagesWS {
	method: "WS";
	name: string,
	execute: (client: Client, username: string, message: string, reply: (message: string, value?: any) => void, value?: any) => void;
}

export type Pages = PagesWS | PagesExpress;

export interface Database {
	accounts: {
		[username: string] : {
			mdp: string,
			killer: string,
			jwt: string,
			status: 0 | 1 | 2
		},
	},
	mp: {
		[name: RegexMatchedString<"[a-zA-Z]{1,10}-[a-zA-Z]{1,10}">]: {
			[id: RegexMatchedString<"[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}">]: {
				message: string,
				user: string,
				saved: boolean
			}
		}
	},
	servers: {
		[server_name: RegexMatchedString<"[a-zA-Z]{1,10}-[a-zA-Z]{1,10}">]: {
			members: {
				user: string,
				status: 0 | 1 | 2 | 3
			}[],
			messages: {
				[id: RegexMatchedString<"[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}">]: {
					message: string,
					user: string,
					saved: boolean
				}
			}
		}
	}
}
export interface Config {
	token: string,
	port: number;
	database?: {
		credentials: {
			type: "service_account";
			project_id: string;
			private_key_id: string;
			private_key: string;
			client_email: string;
			client_id: string;
			auth_uri: "https://accounts.google.com/o/oauth2/auth";
			token_uri: "https://oauth2.googleapis.com/token";
			auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs";
			client_x509_cert_url: string;
			universe_domain: string;
		}
		url: string
	};
};

export class Client {
	config: Config = {
		token: "",
		port: 8080,
		database: {
			credentials: {
				type: "service_account",
				project_id: "",
				private_key_id: "",
				private_key: "",
				client_email: "",
				client_id: "",
				auth_uri: "https://accounts.google.com/o/oauth2/auth",
				token_uri: "https://oauth2.googleapis.com/token",
				auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
				client_x509_cert_url: "",
				universe_domain: "googleapis.com"
			},
			url: ""
		}
	};
	database: {
		database?: FIREDB.Database,
		get: (path: string) => any,
		set: (path: string, data: any) => void,
		delete: (path: string) => void
	} = {
		get: async (path: string) => {
			try {
				if (!this.database.database) return;
				let currentObj = (await this.database.database?.ref("/").once("value")).val();
				for (const name of path.split("/").filter((part: string) => part !== "")) {
					if (!currentObj[name]) {
						currentObj[name] = {}; // If the element does not exist, we give it a default value
					}
					currentObj = currentObj[name]
				};
				return currentObj; // Return the data
			} catch (err) { console.error(err); }
		},
		set: async (path: string, newData: any) => {
			try {
				if (!this.database.database) return;
				await this.database.database?.ref((path.startsWith("/") ? path : `/${path}`)).set(newData);
			} catch (err) { console.error(err); }
		},
		delete: async (path: string) => {
			try {
				if (!this.database.database) return;
				this.database.database?.ref((path.startsWith("/") ? path : `/${path}`)).remove(); // Delete the item on the remote database (firebase)
			} catch (err) { console.error(err); }
		}
	};
}