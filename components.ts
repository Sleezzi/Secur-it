import { readdirSync } from "fs";
import { Database } from "./interfacies";
import Client from "./client";

export const Log = (...args: Array<any>) => {
	args.forEach((log: any) => {
		if (log === "" || log  === "\n") {
			console.log(" ");
		} else {
			if (typeof log === "string") {
				log = ParseColor(log);
			}
			console.log(`  ↪ [\x1b[90m${(new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate())}/${(new Date().getMonth()+1 < 10 ? `0${new Date().getMonth()+1}` : new Date().getMonth()+1)}/${(new Date().getFullYear() < 10 ? `0${new Date().getFullYear()}` : new Date().getFullYear())} ${(new Date().getHours() < 10 ? `0${new Date().getHours()}` : new Date().getHours())}:${(new Date().getMinutes() < 10 ? `0${new Date().getMinutes()}` : new Date().getMinutes())}:${(new Date().getSeconds() < 10 ? `0${new Date().getSeconds()}` : new Date().getSeconds())}\x1b[0m] ${log}\x1b[0m`);
		}
	});
}

export function ParseColor(log: string) {
	return log
	.replace(/\%reset\%/g, "\x1b[0m")
	.replace(/\%italic\%/g, "\x1b[3m")
	.replace(/\%underline\%/g, "\x1b[4m")
	.replace(/\%blinking\%/g, "\x1b[5m")
	.replace(/\%white_bg\%/g, "\x1b[7m")
	.replace(/\%red_bg\%/g, "\x1b[41m")
	.replace(/\%green_bg\%/g, "\x1b[42m")
	.replace(/\%orange_bg\%/g, "\x1b[43m")
	.replace(/\%blue_bg\%/g, "\x1b[44m")
	.replace(/\%purple_bg\%/g, "\x1b[45m")
	.replace(/\%aqua_bg\%/g, "\x1b[46m")
	.replace(/\%double_underline\%/g, "\x1b[21m")
	.replace(/\%red\%/g, "\x1b[31m")
	.replace(/\%green\%/g, "\x1b[32m")
	.replace(/\%orange\%/g, "\x1b[33m")
	.replace(/\%blue\%/g, "\x1b[34m")
	.replace(/\%purple\%/g, "\x1b[35m")
	.replace(/\%aqua\%/g, "\x1b[36m")
	.replace(/\%gray\%/g, "\x1b[90m")
	.replace(/\%yellow\%/g, "\x1b[93m")
}

export function grenerateToken(length: number): string {
	try {
		const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	} catch (err) {
		console.error(err);
		return "";
	}
}

export const navigate = (path: string, callback: (path: string) => any) => {
	try {
		for (const file of readdirSync(path, { withFileTypes: true, encoding: "utf-8" })) {
			if (file.isFile()) {
				callback(`${file.parentPath}/${file.name}`);
			}
			if (file.isDirectory()) {
				navigate(`${file.parentPath}/${file.name}`, callback);
			}
		}
	} catch (err) {
		console.error(err);
	}
}