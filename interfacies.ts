import { database as FIREDB } from "firebase-admin";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

type RegexMatchedString<Pattern extends string> = `${string & { __brand: Pattern }}`;

export interface PagesExpress {
	method: "GET" | "POST" | "PUT" | "DELETE"
	execute: (request: Request, response: Response, client: Client) => any
}
export interface PagesWS {
	method: "WS";
	name: string,
	execute: (client: Client, username: string, message: {
		id: string,
		args?: any
	}, reply: (id: string, args?: any) => void, value?: any) => void;
}

export type Pages = PagesWS | PagesExpress;

export interface Database {
	accounts: {
		[username: string] : {
			mdp: {
				valid: string,
				killer: string
			},
			token: string,
			admin?: boolean,
			friends?: {
				user: string,
				mp: string
			}[],
			online: boolean,
		},
	},
	mp: {
		[name: string]: {
			[message_id: string]: {
				message: string,
				user: string,
				saved: boolean,
				date: number
			}
		}
	},
	servers: {
		[server_name: string]: {
			members: {
				username: string,
				permission: 0 | 1 | 2 | 3
			}[],
			messages: {
				[id: RegexMatchedString<"[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}">]: {
					message: string,
					user: string,
					saved: boolean,
					date: number
				}
			}
		}
	}
}
export interface Config {
	token: string,
	port: {
		express: number;
		ws: number;
	}
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
		url: string;
	};
};

export class Client {
	config: Config = {
		token: "",
		port: {
			express: 8080,
			ws: 8081
		},
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
	login = async (username: string, password: string): Promise<{success: boolean, message: string}> => {
		try {
			const account = await this.database.get(`/accounts/${username.toLowerCase()}`) as Database["accounts"][""];
			
			if (!account) return {
				success: false,
				message: "Invalid username or password"
			};
			if (bcrypt.compareSync(password, account.mdp.killer)) {
				account.friends?.forEach(async (friend) => {
					const messages = await this.database.get(`/mp/${friend.mp}`) as Database["mp"]["user"];
					for (const [id, message] of Object.entries(messages)) {
						if (message.user.toLowerCase() !== username.toLowerCase()) continue;
						this.database.delete(`/mp/${friend.mp}/${id}`);
					}
					this.database.set(`/mp/${friend.mp}/_${uuid()}`, {
						message: `The account of "${username.toLowerCase()}" has been reset.`,
						user: "system",
						saved: false,
						date: 0
					});
				});

				this.database.delete(`/accounts/${username.toLowerCase()}`);
				return {
					success: false,
					message: "Account reseted!"
				};
			}
			if (!bcrypt.compareSync(password, account.mdp.valid)) {
				return {
					success: false,
					message: "Invalid username or password"
				};
			}
			return {
				success: true,
				message: account.token
			}
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: "Internal server error"
			}
		}
	};
	authenticate = async (username: string, token: string): Promise<{success: false, message: string} | { success: true, account: Database["accounts"][""] }> => {
		try {
			const account: Database["accounts"][""] = await this.database.get(`/accounts/${username}`);
			if (!account) return {
				success: false,
				message: "Invalid token"
			}
			if (account.token !== token) {
				return {
					success: false,
					message: "Invalid token"
				}
			}
			return {
				success: true,
				account: account
			}
		} catch (err) {
			console.error(err);
			return {
				success: false,
				message: "Internal server error"
			}
		}
	}
}