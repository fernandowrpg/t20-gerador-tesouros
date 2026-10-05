import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARQUIVOS = ["module.json", "module", "templates", "lang", "styles", "README.md", "LICENSE", "CHANGELOG.md"];

function argumento(nome) {
	const i = process.argv.indexOf(`--${nome}`);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

function listar(relativo) {
	const absoluto = path.join(raiz, relativo);
	if (!fs.existsSync(absoluto)) return [];
	if (fs.statSync(absoluto).isFile()) return [relativo];
	return fs.readdirSync(absoluto).flatMap((nome) => listar(path.posix.join(relativo, nome)));
}

function horaDos(data) {
	const hora = (data.getHours() << 11) | (data.getMinutes() << 5) | Math.floor(data.getSeconds() / 2);
	const dia = ((data.getFullYear() - 1980) << 9) | ((data.getMonth() + 1) << 5) | data.getDate();
	return { hora, dia };
}

function criarZip(entradas) {
	const locais = [];
	const centrais = [];
	let deslocamento = 0;
	const { hora, dia } = horaDos(new Date());
	for (const { nome, dados } of entradas) {
		const nomeBuf = Buffer.from(nome, "utf8");
		const comprimido = zlib.deflateRawSync(dados, { level: 9 });
		const crc = zlib.crc32(dados);
		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0);
		local.writeUInt16LE(20, 4);
		local.writeUInt16LE(0x0800, 6);
		local.writeUInt16LE(8, 8);
		local.writeUInt16LE(hora, 10);
		local.writeUInt16LE(dia, 12);
		local.writeUInt32LE(crc, 14);
		local.writeUInt32LE(comprimido.length, 18);
		local.writeUInt32LE(dados.length, 22);
		local.writeUInt16LE(nomeBuf.length, 26);
		locais.push(local, nomeBuf, comprimido);

		const central = Buffer.alloc(46);
		central.writeUInt32LE(0x02014b50, 0);
		central.writeUInt16LE(20, 4);
		central.writeUInt16LE(20, 6);
		central.writeUInt16LE(0x0800, 8);
		central.writeUInt16LE(8, 10);
		central.writeUInt16LE(hora, 12);
		central.writeUInt16LE(dia, 14);
		central.writeUInt32LE(crc, 16);
		central.writeUInt32LE(comprimido.length, 20);
		central.writeUInt32LE(dados.length, 24);
		central.writeUInt16LE(nomeBuf.length, 28);
		central.writeUInt32LE(deslocamento, 42);
		centrais.push(central, nomeBuf);
		deslocamento += local.length + nomeBuf.length + comprimido.length;
	}
	const tamanhoCentral = centrais.reduce((s, b) => s + b.length, 0);
	const fim = Buffer.alloc(22);
	fim.writeUInt32LE(0x06054b50, 0);
	fim.writeUInt16LE(entradas.length, 8);
	fim.writeUInt16LE(entradas.length, 10);
	fim.writeUInt32LE(tamanhoCentral, 12);
	fim.writeUInt32LE(deslocamento, 16);
	return Buffer.concat([...locais, ...centrais, fim]);
}

const caminhoManifesto = path.join(raiz, "module.json");
const manifesto = JSON.parse(fs.readFileSync(caminhoManifesto, "utf8"));
const repo = argumento("repo") ?? process.env.GITHUB_REPOSITORY;
const versao = (argumento("version") ?? manifesto.version).replace(/^v/, "");

manifesto.version = versao;
if (repo) {
	const base = `https://github.com/${repo}`;
	manifesto.url = base;
	manifesto.manifest = `${base}/releases/latest/download/module.json`;
	manifesto.download = `${base}/releases/latest/download/${manifesto.id}.zip`;
	manifesto.bugs = `${base}/issues`;
	manifesto.readme = `${base}/blob/main/README.md`;
	fs.writeFileSync(caminhoManifesto, `${JSON.stringify(manifesto, null, "\t")}\n`);
} else if (manifesto.manifest.includes("SEU-USUARIO")) {
	console.warn("Aviso: module.json ainda aponta para SEU-USUARIO. Rode com --repo usuario/repositorio.");
}

const dist = path.join(raiz, "dist");
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const entradas = ARQUIVOS.flatMap(listar).map((nome) => ({
	nome,
	dados: nome === "module.json" ? Buffer.from(`${JSON.stringify(manifesto, null, "\t")}\n`) : fs.readFileSync(path.join(raiz, nome))
}));

fs.writeFileSync(path.join(dist, `${manifesto.id}.zip`), criarZip(entradas));
fs.writeFileSync(path.join(dist, "module.json"), `${JSON.stringify(manifesto, null, "\t")}\n`);

console.log(`Versão ${versao} gerada em dist/ (${entradas.length} arquivos).`);
console.log(`  dist/module.json`);
console.log(`  dist/${manifesto.id}.zip`);
console.log(`Manifesto: ${manifesto.manifest}`);
