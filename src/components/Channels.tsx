import { useEffect, useState } from "react";
import styles from "../assets/css/channels.module.css";
import { Link } from "react-router-dom";
import { Channel, ReciveMessage, Listener } from "../interfacies";

function Channels({
	listen,
	sendMessageWithResponse
}: {
	listen: Listener,
	sendMessageWithResponse: (id: string, args?: any) => Promise<ReciveMessage>
}) {
	const [account, setAccount] = useState<{
		avatar: string | null,
		username: string
	}>({avatar: null, username: "Loading"});
	const [request, setRequest] = useState<number>(0);
	const [channels, setChannels] = useState<(Channel & { listener?: { remove: () => void } })[]>([]);

	useEffect(() => {
		sendMessageWithResponse("accounts/profil/me").then((response) => {
			if (response.id !== "Success") {
				setAccount({
					username: "Impossible de charger votre profil",
					avatar: null
				});
				return;
			}
			setAccount({
				username: response.args.username,
				avatar: response.args.avatar
			});
		});
		sendMessageWithResponse("friends/get").then((response) => {
			if (!response.args) return;
			const newChannels: Channel[] = [...channels];
			response.args.friends.forEach((friend: {
				avatar: string | null,
				username: string,
				mp: string,
				verified: boolean
			}) => {
				newChannels.push({
					type: "MP",
					avatar: friend.avatar,
					id: friend.mp,
					messages: 0,
					name: friend.username
				});
			});
			setChannels(newChannels);
		});
		const request = listen("Friend request", () => setRequest((oldValue) => oldValue + 1));
		const accepted = listen("Friend accepted", (_id: string, args: {
			user: string,
			mp: string,
			avatar: string | null,
			online: boolean,
			verified: boolean
		}) => {
			setChannels((oldChannel) => {
				const newChannels = [...oldChannel];
				newChannels.push({
					type: "MP",
					avatar: args.avatar,
					id: args.mp,
					messages: 0,
					name: args.user
				});
				return newChannels;
			});
		});
		return () => {
			request.remove();
			accepted.remove();
		}
	}, []);

	useEffect(() => {
		channels.forEach((channel, index) => {
			if (channel.listener) return;
			const listener = listen(`New message New message: ${channel.id}`, () => {
				if (window.location.hash.split("/").splice(2)[0] === channel.id) return;
				setChannels((oldChannels) => {
					oldChannels[index].messages += 1;
					oldChannels[index].listener = listener
					return oldChannels;
				});
			});
		});
		return () => {
			channels.forEach((channel, index) => {
				if (!channel.listener) return;
				channel.listener.remove();
				setChannels((oldChannels) => {
					delete oldChannels[index].listener;
					return oldChannels;
				});
			});
		}
	}, [channels]);

	return (
		<div id={styles.channels}>
			<div id={styles.friends}>
				<Link to="/app/friends" className={styles.friend}>
					<div className={styles.avatar}>
						<h1 className={`${styles.avatar} material-symbols-outlined`}>group</h1>
						{
							request > 0 &&
							<div className={styles.notification}>{request > 9 ? "9+" : request}</div>
						}
					</div>
					<div className={styles.content}>
						<h4 className={styles.username}>Friends</h4>
					</div>
				</Link>
				{
					channels.map((channel) => (
						channel.type === "MP" ? 
						<Link to={`/app/mp/${channel.id}`} className={styles.friend} key={channel.id}>
							<div className={styles.avatar}>
								{
									channel.avatar ?
									<img src={channel.avatar} alt={`${channel.name}'s avatar`} className={styles.avatar}/>
									:
									<h1 className={styles.avatar}>{channel.name[0].toUpperCase()}</h1>
								}
								{
									channel.messages > 0 &&
									<div className={styles.notification}>{channel.messages > 9 ? "9+" : channel.messages}</div>
								}
							</div>
							<div className={styles.content}>
								<h4 className={styles.username}>{channel.name}</h4>
								<button className={`${styles.settings} material-symbols-outlined`} onClick={(e) => {
									e.preventDefault();
								}}>person_remove</button>
							</div>
						</Link>
						:
						<Link to={`/app/group/${channel.id}`} className={styles.group} key={channel.id}>
							<div className={styles.avatars}>
								<img src={channel.avatars[0]} alt={`${channel.name}'s avatar`} className={styles.avatar} />
								<img src={channel.avatars[1]} alt={`${channel.name}'s avatar`} className={styles.avatar} />
								{
									channel.messages > 0 &&
									<div className={styles.notification}>{channel.messages > 9 ? "9+" : channel.messages}</div>
								}
							</div>
							<div className={styles.content}>
								<h4 className={styles.username}>Dictature</h4>
								<button className="material-symbols-outlined" onClick={(e) => {
									e.preventDefault();
								}}>logout</button>
							</div>
						</Link>
					))
				}
			</div>
			<div id={styles.user}>
				{
					account.avatar ?
					<img src={account.avatar} alt={`${account.username}'s avatar`} className={styles.avatar}/>
					:
					<h1 className={styles.avatar}>{account.username[0].toUpperCase()}</h1>
				}
				
				<div className={styles.content}>
					<h3 className={styles.username}>
						{account.username[0].toUpperCase()}
						{account.username.slice(1, account.username.length)}
					</h3>
					<Link to="/app/settings" className={`${styles.settings} material-symbols-outlined`}>settings</Link>
				</div>
			</div>
		</div>
	);
}

export default Channels;