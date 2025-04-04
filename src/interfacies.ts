export interface Login {
	success: {
		token: string,
	},
	error: {
		code: number,
		msg: string
	}
}

interface Friend {
	id: string
	name: string
	type: "MP",
	avatar: string | null,
	messages: number
}

interface Group {
	id: string
	name: string
	type: "group",
	avatars: string[],
	messages: number
}
export type Channel = Friend | Group


export interface MessageBase {
	id: string,
	args?: any
}
export type ReciveMessage = MessageBase & { origin?: string, request_id?: string };

export type Listener = (id: string, callback: SendMessage) => { remove: () => void; }

export type SendMessage = (id: string, args?: any) => void;