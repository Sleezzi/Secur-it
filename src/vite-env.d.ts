/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly api_url: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}