const { existsSync, mkdirSync, readdirSync, rmSync, appendFileSync, readFileSync } = require("fs");

const build = "./build";
const src = "./"

const exclude = [
	".git",
	"node_modules",
	"tsconfig.json",
	"builder.js",
	".gitignore",
	build
];

const navigate = (path) => {
	for (const file of readdirSync(path, { withFileTypes: true })
		.filter(file =>
			!file.name.endsWith(".ts") &&
			!exclude.find(name => name === file.name) &&
			!`${path}${file.name}`.startsWith(build)
		)
	) {
		if (file.isFile()) {
			appendFileSync(`${build}/${path.replace(src, "")}${file.name}`, readFileSync(`${path}${file.name}`));
		}
		if (file.isDirectory()) {
			mkdirSync(`${build}/${path.replace(src, "")}${file.name}`);
			navigate(`${path}${file.name}/`);
		}
	}
}

if (existsSync(build)) {
	rmSync(build, { force: true, recursive: true });
}

mkdirSync(build);

navigate(src);