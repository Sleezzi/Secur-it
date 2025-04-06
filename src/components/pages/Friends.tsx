import { useEffect, useRef, useState } from "react";
import styles from "../../assets/css/friends.module.css";
import { Link, useOutletContext } from "react-router-dom";
import { Listener, ReciveMessage, SendMessage } from "../../interfacies";

function Friends() {
	const { sendMessage, listen, sendMessageWithResponse }: {
		sendMessage: SendMessage;
		sendMessageWithResponse: (id: string, args?: any) => Promise<ReciveMessage>;
		listen: Listener;
	} = useOutletContext();
	const search_input = useRef<HTMLInputElement>(null);

	const [search, setSearch] = useState("");

	const [userlist, setUserlist] = useState<{
			friends: {
			username: string,
			avatar: string | null,
			mp: string,
			verified: boolean,
			online: boolean
		}[],
		request: {
			username: string,
			avatar: string | null,
			verified: boolean,
			online: boolean
		}[]
	}>({
		friends: [],
		request: []
	});

	useEffect(() => {
		sendMessageWithResponse("friends/get").then((response) => {
			if (!response.args) {
				return;
			}
			setUserlist(response.args);
		});
		const request = listen("Friend request", (_id: string, args: {
			user: string,
			avatar: string | null,
			online: boolean,
			verified: boolean
		}) => {
			setUserlist((friends) => {
				const newFriends = [...friends.request];
				newFriends.push({
					username: args.user,
					avatar: args.avatar,
					online: args.online,
					verified: args.verified
				});
				return {...friends, request: newFriends};
			});
		});
		const accepted = listen("Friend accepted", (_id: string, args: {
			user: string,
			mp: string,
			avatar: string | null,
			online: boolean,
			verified: boolean
		}) => {
			setUserlist((friends) => {
				const newFriends = [...friends.friends];
				newFriends.push({
					username: args.user,
					mp: args.mp,
					online: args.online,
					avatar: args.avatar,
					verified: args.verified
				});
				return {...friends, friends: newFriends}
			});
		});
		return () => {
			request.remove();
			accepted.remove();
		}
	}, []);
	return (
		<div id={styles.content}>
			<section id={styles.search}>
				<h1>Rechercher</h1>
				<input id={styles.input} max={15} ref={search_input} value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Entrer le pseudonyme d'une personne" />
			</section>
			<section id={styles.users}>
				{
					userlist.friends.length === 0 && userlist.request.length === 0 ?
					<h1 >
						Vous n'avez aucun ami.
						<br />
						<br />
						Pour ajouter des amis, recherche leurs pseudo dans la barre de recherche puis click sur "Envoyer une demande d'amis"
						<br />
						Une fois qu'il aura accepter votre demande, son profil s'affichera ici.
					</h1>
					:
					<>
						{
							userlist.request
							.filter((user) => search.length > 0 ? user.username.toLowerCase().startsWith(search.toLowerCase() as string) : true)
							.map((user, index) => (
								<div className={styles.friend} key={user.username}>
									<div className={styles.avatar}>
										{
											user.avatar ?
											<img src={user.avatar} alt={`${user.username}'s avatar`} className={styles.avatar}/>
											:
											<h1 className={styles.avatar}>{user.username[0].toUpperCase()}</h1>
										}
									</div>
									<div className={styles.content}>
										<h4 className={styles.username}>
											{user.username[0].toUpperCase()}
											{user.username.slice(1, user.username.length)}
											{
												user.verified &&
												<div className={styles.badge}>
													<span className="material-symbols-outlined">check</span>
												</div>
											}
										</h4>
										<button className={`${styles.settings} material-symbols-outlined`} onClick={(e) => {
											e.preventDefault();
											sendMessage("friends/accept", user.username.toLowerCase());
											const newUserlist = {...userlist};
											newUserlist.request.splice(index, 1);
											setUserlist(newUserlist);
										}}>person_add</button>
									</div>
								</div>
							))
						}
						{
							userlist.friends
							.filter((user) => search.length > 0 ? user.username.toLowerCase().startsWith(search.toLowerCase() as string) : true)
							.map((user, index) => (
								<Link to={`/mp/${user.mp}`} className={styles.friend} key={user.username}>
									<div className={styles.avatar}>
										{
											user.avatar ?
											<img src={user.avatar} alt={`${user.username}'s avatar`} className={styles.avatar}/>
											:
											<h1 className={styles.avatar}>{user.username[0].toUpperCase()}</h1>
										}
									</div>
									<div className={styles.content}>
										<h4 className={styles.username}>
											{user.username[0].toUpperCase()}
											{user.username.slice(1, user.username.length)}
											{
												user.verified &&
												<div className={styles.badge}>
													<span className="material-symbols-outlined">check</span>
												</div>
											}
										</h4>
										<button className={`${styles.settings} material-symbols-outlined`} onClick={(e) => {
											e.preventDefault();
											sendMessage("friends/remove", user.username.toLowerCase());
											const newUserlist = {...userlist};
											newUserlist.friends.splice(index, 1);
											setUserlist(newUserlist);
										}}>person_remove</button>
									</div>
								</Link>
							))
						}
					</>
				}
				{
					search.length > 0 &&
					<button onClick={() => {
						sendMessage("friends/add", search);
						setSearch("");
					}} id={styles.add}>
						<div className={styles.friend}>
							<div className={styles.avatar}>
								<h1 className={`${styles.avatar} material-symbols-outlined`}>person_add</h1>
							</div>
							<div className={styles.content}>
								<h4 className={styles.username}>Envoyer une demande d'ami</h4>
							</div>
						</div>
					</button>
				}
			</section>
		</div>
	);
}

export default Friends;