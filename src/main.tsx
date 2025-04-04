import { scan } from "react-scan";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { HashRouter } from "react-router-dom";

scan({
	enabled: true
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<HashRouter basename='/'>
			<App />
		</HashRouter>
	</StrictMode>,
);