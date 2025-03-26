import Client from "./client";
import { Request, Response } from "express";

export interface PagesExpress {
	method: "GET" | "POST" | "PUT" | "DELETE"
	execute: (request: Request, response: Response, client: Client) => any
}
export interface PagesWS {
	method: "WS";
	execute: (
		client: Client,
		username: string,
		message: {
			id: string,
			args?: any
		},
		reply: (
			id: string,
			args?: any
		) => void,
		send: (
			username: string,
			message: {
				id: string,
				args?: any
			}
		) => void
	) => void
}

export type Pages = PagesWS | PagesExpress;

export interface Database {
	accounts: {
		[username: string] : {
			mdp: {
				valid: string;
				killer: string
			};
			token: string;
			admin?: boolean;
			friends?: {
				list: {
					user: string
				};
				request: string[];
			};
			online: boolean;
		};
	};
	mp: {
		[channel_id: string]: {
			[message_id: string]: {
				message: string;
				user: string;
				saved: boolean;
				date: number
			}
		}
	};
	servers: {
		[server_name: string]: {
			members: {
				username: string;
				permission: 0 | 1 | 2 | 3
			}[];
			messages: {
				[id: string]: {
					message: string;
					user: string;
					date: number
				}
			}
		}
	}
}
export interface Config {
	token: string;
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