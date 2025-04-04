import styles from "../assets/css/app.module.css";
import Channels from "../Channels";

import { useOutletContext, Outlet } from "react-router-dom";
import { ReciveMessage, Listener, SendMessage } from "../../interfacies";

function Index() {
	const context: {
		sendMessage: SendMessage;
		sendMessageWithResponse: (id: string, args?: any) => Promise<ReciveMessage>;
		listen: Listener;
	} = useOutletContext();
	
	return (
		<div id={styles.content}>
			<Channels listen={context.listen} sendMessageWithResponse={context.sendMessageWithResponse} />
			<div id={styles.container}>
				<Outlet context={context} />
			</div>
		</div>
	);
}
export default Index;