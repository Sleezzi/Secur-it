export async function register(username: string, passwords: {
	valid: string,
	killer: string
}): Promise<{
	success: boolean,
	message: string
}> {
	const raw = await fetch("https://api.sleezzi.fr/http/accounts/register", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username,
			valid_password: passwords.valid,
			killer_password: passwords.killer,
		})
	});
	const response: {
		code: number,
		message: string,
		args?: any
	} = await raw.json();
	if (response.code !== 200) {
		return {
			success: false,
			message: response.message
		};
	}
	return {
		success: true,
		message: response.args
	}
}
export async function login(username: string, password: string): Promise<{
	success: boolean,
	message: string
}> {
	const raw = await fetch("https://api.sleezzi.fr/http/accounts/login", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username,
			password
		})
	});
	const response: {
		code: number,
		message: string,
		args?: any
	} = await raw.json();
	if (response.code !== 200) {
		return {
			success: false,
			message: response.message
		};
	}
	return {
		success: true,
		message: response.args
	}
}

export async function verify(token: string): Promise<boolean> {
	if (!/[a-zA-Z0-9\-_]{25}/.test(token)) return false;
	return true;
}

export function disconnect() {
	document.cookie = "token=null;max-age=-1";
	document.cookie = "username=null;max-age=-1";
	return new Promise<void>((resolve) => {
		setInterval(() => {
			if (getCookie("token") || getCookie("username")) return;
			resolve();
		}, 100);
	})
}

export function getCookie(name: string) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}