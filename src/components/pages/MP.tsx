import { useEffect, useRef, useState } from "react";
import styles from "../../assets/css/conversations.module.css";
import { Listener, ReciveMessage, SendMessage } from "../../interfacies";
import { useNavigate, useOutletContext, useParams } from "react-router";
import ConvertDate from "../Date";

function Conversation({ username }: { username: string }) {
	const navigate = useNavigate();
	const { sendMessage, listen, sendMessageWithResponse }: {
		sendMessage: SendMessage;
		sendMessageWithResponse: (id: string, args?: any) => Promise<ReciveMessage>;
		listen: Listener;
	} = useOutletContext();
	const {id: channelId} = useParams();
	
	const bottom = useRef<HTMLDivElement>(null);
	const input = useRef<HTMLTextAreaElement | null>(null);
	const inputContainer = useRef<HTMLDivElement | null>(null);
	const [sendable, setSendable] = useState(false);

	const autoresize = () => {
		if (input.current && inputContainer.current) {
			inputContainer.current.style.height = `calc(1rem * ${input.current.value.split("\n").length - 1} + 2rem)`;
		}
	}
	const [recipent, setRecipent] = useState<null | string>(null);

	const [messages, setMessages] = useState<{
		members: {
			username: string;
			avatar: string;
			status: boolean;
			verified: boolean;
		}[];
		messages: {
			username: string;
			content: string;
			date: number;
			state: "posting" | "posted"
		}[];
	}>({
		members: [],
		messages: []
	})
	const scrollDown = (behavior?: "instant" | "smooth") => {
		if (bottom.current) {
			bottom.current.scrollIntoView({ behavior: behavior || "smooth" })
		}
	};

	const send = () => {
		if (!input.current) return;
		if (!sendable) return;
		sendMessage("messages/post", {
			content: input.current.value,
			channel: {
				type: "mp",
				recipent: channelId
			}
		});
		const newMessages = [...messages.messages];
		newMessages.push({
			content: input.current.value,
			username: username,
			date: Math.floor(Date.now() / 1000),
			state: "posting"
		})
		setMessages((oldMessages) => ({...oldMessages, messages: newMessages}));
		input.current.value = "";
	}

	useEffect(() => {
		if (input.current) {
			input.current.focus();
		}
		sendMessageWithResponse("messages/get", {
			type: "mp",
			recipent: channelId
		}).then((response) => {
			if (response.args === "Channel not found") {
				window.scrollTo(0, 0);
				navigate("/app/friends", { replace: true });
				return;
			}
			setRecipent(
				response.args.members
				.find((member: { username: string; avatar: string; online: boolean; verified: boolean; }) => member.username !== username)
				.username
			);
			const newMessages: {
				username: string;
				content: string;
				date: number;
				state: "posting" | "posted";
			}[]  = [];
			
			for (const message of response.args.messages as { user: string, message: string, date: number }[]) {
				newMessages.push({
					content: message.message,
					username: message.user,
					date: message.date,
					state: "posted"
				});
			}
			
			setMessages({
				members: response.args.members.map(
					(member: { username: string; avatar: string; online: boolean; verified: boolean; }) =>
					({ username: member.username, avatar: member.avatar, verified: member.verified, status: member.online })
				),
				messages: newMessages
			});
		});
		const listener = listen(`New message: ${channelId}`, (_id: string, args: {
			id: string,
			user: string,
			message: string,
			date: number
		}) => {
			setMessages((oldMessages) => {
				const newMessages = [...oldMessages.messages];
				newMessages.push({
					content: args.message,
					username: args.user,
					date: args.date,
					state: "posted"
				});
				return {...oldMessages, messages: newMessages};
			});
		});
		return () => {
			listener.remove();
		}
	}, [channelId]);

	useEffect(() => {
		if (recipent) {
			document.title = `Secur'it - ${recipent.toUpperCase()}`;
		} else {
			document.title = `Secur'it`;
		}
	}, [recipent]);

	useEffect(() => {
		console.log(messages.messages.length);
		
		scrollDown(messages.messages.length > 100 ? "instant" : "smooth");
	}, [messages.messages]);
	
	if (!channelId) {
		navigate("/app", { replace: true });
		return (<></>);
	}
	if (!recipent) {
		return (<div id={styles.content} style={{display: "flex", justifyContent: "center", alignItems: "center"}}><h1>Il n'y a rien a voir ici</h1></div>);
	}
	
	return (
		<div id={styles.content}>
			<div id={styles.conversation}>
				<div id={styles.messages}>
					{
						messages.messages.map((message, index) => {
							return (
								<div className={styles.message} key={index}>
								{
									messages.members.find((member) => member.username.toLowerCase() === message.username.toLowerCase()) ? 
										(
											messages.members.find((member) => member.username === message.username)?.avatar ?
											<img src={messages.members.find((member) => member.username === message.username)?.avatar} alt={`${message.username}'s avatar`} className={styles.avatar}/>
											:
											<div className={styles.avatar}>{message.username[0].toUpperCase()}</div>
										)
										:
										<img src="/cdn/img/users/System.png" alt="System's avatar" className={styles.avatar}/>
									}
									<div className={styles.content}>
										<div className={styles.top}>
											<h3 className={styles.username}>
												{message.username[0].toUpperCase()}{message.username.slice(1, message.username.length)}
											</h3>
											{
												messages.members.find((member) => member.username.toLowerCase() === message.username.toLowerCase()) ?
												messages.members.find((member) => member.username.toLowerCase() === message.username.toLowerCase())?.verified &&
												<div className={styles.badge}>
													<span className="material-symbols-outlined">check</span>
												</div>
												:
												<div className={styles.badge}>
													<span className="material-symbols-outlined">check</span>
												</div>
											}
											<div className={styles.date}>{ConvertDate(message.date * 1000)}</div>
										</div>
										<div className={styles.messages}>
											<p className={styles.text} style={{color: message.state === "posting" ? "var(--alt-color)" : ""}}>
												{
													message.content.split("\n").map((content) => (<>{content}<br /></>))
												}
											</p>
										</div>
									</div>
								</div>
							);
						})
					}
					<div ref={bottom} style={{height: "2.5rem"}}></div>
				</div>
				<div id={styles.writeMessage} ref={inputContainer}>
					<textarea
						onInput={(e) => {
							if (recipent.length === 0) {
								e.preventDefault();
								return;
							}
							if (!input.current) {
								setSendable(false);
								return;
							}
							autoresize();
							if (!/[a-zA-Z0-9²°#@&~""\{\(\\\[\`\]\)\}\-\.\|_,;:\/\*§%^¨îïôöêëéèçù<>!?\$€£]{1,250}/.test(input.current.value.trim())) {
								setSendable(false);
								return;
							}
							setSendable(true);
						}}
						ref={input}
						placeholder={recipent.length === 0 ? "Impossible de trouver le destinataire" : `Envoyer un message à ${recipent[0].toUpperCase()}${recipent.slice(1, recipent.length)}`}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								if (!e.shiftKey) {
									e.preventDefault();
									send();
									autoresize();
								}
							}
						}}
					></textarea>
					<button onClick={send} className="material-symbols-outlined" style={sendable ? {}: { color: "var(--alt-color)", cursor: "no-drop" }}>send</button>
				</div>
			</div>
			<div id={styles.members}>
				{
					messages.members.map((member) => (
						<div key={member.username} className={styles.member}>
							<div className={styles.avatar}>
								{
									member.avatar ?
									<img src={member.avatar} alt={`${member.username}'s avatar`}/>
									:
									<h3 className={styles.avatar}>{member.username[0].toUpperCase()}</h3>
								}
								<div className={`${styles.status} ${member.status && styles.online}`}></div>
							</div>
							<div className={styles.content}>
								<h3 className={styles.username}>{member.username[0].toUpperCase()}{member.username.slice(1, member.username.length)}</h3>
								{
									member.verified &&
									<div className={styles.badge}>
										<span className="material-symbols-outlined">check</span>
									</div>
								}
							</div>
						</div>
					))
				}
			</div>
		</div>
	);
}

export default Conversation;