import { CATEGORIAS } from "./tables.mjs";
import { EXCLUIR, MODULE_ID, SETTINGS, TIPOS_FISICOS, setting } from "./constants.mjs";

const PREFIXO_POCAO = /^(pocao|oleo|granada) de /;
const CAMPOS_INDICE = [
	"system.tipo",
	"system.preco",
	"system.proficiencia",
	"system.proposito",
	"system.upgrades",
	"folder",
	`flags.${MODULE_ID}`
];
const CAMPOS_MELHORIA = ["melhoria1", "melhoria2", "melhoria3", "melhoria4", "material"];
const CAMPOS_ENCANTO = ["encanto1", "encanto2", "encanto3"];

export function normalizar(nome) {
	return String(nome ?? "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9+()]+/g, " ")
		.replace(/\s*\(\s*/g, " (")
		.replace(/\s*\)\s*/g, ") ")
		.replace(/\s+/g, " ")
		.trim();
}

let indiceLivro = null;

function obterIndiceLivro() {
	if (indiceLivro) return indiceLivro;
	indiceLivro = new Map();
	for (const [categoria, def] of Object.entries(CATEGORIAS)) {
		let anterior = 0;
		def.tabela.forEach(([max, nomes, preco], ordem) => {
			const lista = [nomes].flat();
			const linha = { categoria, peso: max - anterior, preco: preco ?? null, ordem, nomeLivro: lista[0], id: `${categoria}:${ordem}` };
			anterior = max;
			for (const nome of lista) {
				const chave = normalizar(nome);
				if (!indiceLivro.has(chave)) indiceLivro.set(chave, []);
				indiceLivro.get(chave).push(linha);
			}
		});
	}
	return indiceLivro;
}

export function buscarNoLivro(nome, categoria = null) {
	const indice = obterIndiceLivro();
	const chave = normalizar(nome);
	const filtrar = (linhas) => (categoria ? linhas?.filter((l) => l.categoria === categoria) : linhas) ?? [];
	let linhas = filtrar(indice.get(chave));
	if (!linhas.length && PREFIXO_POCAO.test(chave)) {
		linhas = filtrar(indice.get(chave.replace(PREFIXO_POCAO, ""))).filter((l) => l.categoria === "pocao");
	}
	return linhas[0] ?? null;
}

export function nivelAcessorio(preco) {
	if (preco < 10000) return "acessorio-menor";
	if (preco < 30000) return "acessorio-medio";
	return "acessorio-maior";
}

const sim = (categoria, motivo = "heuristica") => ({ categoria, motivo });
const nao = (motivo) => ({ categoria: null, motivo });

function nivelPelaPasta(segmentos) {
	for (const seg of [...segmentos].reverse()) {
		if (/(^| )(menor|menores)$/.test(seg)) return "acessorio-menor";
		if (/(^| )(media|medio|medias|medios)$/.test(seg)) return "acessorio-medio";
		if (/(^| )(maior|maiores)$/.test(seg)) return "acessorio-maior";
	}
	return null;
}

function heuristica(entrada, { incluirAlimentos }) {
	const s = entrada.system ?? {};
	const preco = Number(s.preco) || 0;
	const segmentos = String(entrada.pastas ?? "").split("/").map(normalizar).filter(Boolean);
	const pastas = segmentos.join("/");
	const nome = normalizar(entrada.name);
	const up = s.upgrades ?? {};
	const temEncanto = CAMPOS_ENCANTO.some((k) => up[k]);
	const temMelhoria = CAMPOS_MELHORIA.some((k) => up[k]);
	const pastaAcessorio = /acessori/.test(pastas);
	const pastaMagica = pastaAcessorio || /magic|liturgic|especific/.test(pastas);
	const acessorio = () => sim(nivelPelaPasta(segmentos) ?? nivelAcessorio(preco));

	if (/artefato|avatar/.test(pastas)) return nao("artefato");
	if (preco <= 0) return nao("sem-preco");

	switch (entrada.type) {
		case "arma":
			if (s.proficiencia === "natural") return nao("arma-natural");
			if (temEncanto || preco >= 18000 || (pastaMagica && preco >= 1000)) return sim("arma-especifica");
			if (temMelhoria) return nao("ja-superior");
			return sim("arma");
		case "consumivel":
			if (s.tipo === "potion" || PREFIXO_POCAO.test(nome)) return sim("pocao");
			if (s.tipo === "ammo") return temMelhoria || temEncanto ? nao("ja-superior") : sim("arma");
			if (s.tipo === "food") return incluirAlimentos ? sim("diverso") : nao("alimento");
			if (s.tipo === "material") return nao("material");
			return sim("diverso");
		case "equipamento":
			if (["leve", "pesada", "escudo"].includes(s.tipo)) {
				if (pastaAcessorio && preco >= 1000) return acessorio();
				if (temEncanto || preco >= 18000 || (pastaMagica && preco >= 1000)) return sim("armadura-especifica");
				if (temMelhoria) return nao("ja-superior");
				return sim("armadura");
			}
			if (s.tipo === "esoterico") {
				if (preco >= 18000 || (pastaMagica && preco >= 1000)) return acessorio();
				if (temMelhoria) return nao("ja-superior");
				return sim("esoterico");
			}
			if (s.tipo === "acessorio") return preco < 1000 ? sim("diverso") : acessorio();
			return preco >= 10000 || (pastaMagica && preco >= 1000) ? acessorio() : sim("diverso");
		case "tesouro":
			return preco >= 10000 || (pastaMagica && preco >= 1000) ? acessorio() : sim("diverso");
		default:
			return nao("tipo");
	}
}

export function classificar(entrada, opcoes = {}) {
	const { ajustes = {}, incluirExtrasSistema = false } = opcoes;
	const ajuste = ajustes[entrada.uuid];
	const flag = entrada.flags?.[MODULE_ID]?.categoria;
	const livro = buscarNoLivro(entrada.name);

	if (ajuste === EXCLUIR) return { ...nao("manual"), livro };
	if (ajuste && CATEGORIAS[ajuste]) return { ...sim(ajuste, "manual"), livro };
	if (flag === EXCLUIR) return { ...nao("flag"), livro };
	if (flag && CATEGORIAS[flag]) return { ...sim(flag, "flag"), livro };
	if (livro) return { ...sim(livro.categoria, "livro"), livro };
	if (entrada.sistema && !incluirExtrasSistema) return nao("sistema");
	return heuristica(entrada, opcoes);
}

export function montarPools(entradas, opcoes = {}) {
	const pesoCustomizado = Number(opcoes.pesoCustomizado ?? 1);
	const classificados = entradas.map((entrada) => ({ ...entrada, ...classificar(entrada, opcoes) }));
	const contagemLinhas = new Map();
	for (const c of classificados) {
		if (c.categoria && c.livro?.categoria === c.categoria) {
			contagemLinhas.set(c.livro.id, (contagemLinhas.get(c.livro.id) ?? 0) + 1);
		}
	}

	const pools = Object.fromEntries(Object.keys(CATEGORIAS).map((k) => [k, []]));
	for (const c of classificados) {
		if (!c.categoria) continue;
		const doLivro = c.livro?.categoria === c.categoria;
		const precoItem = Number(c.system?.preco) || 0;
		const precoLivro = doLivro ? c.livro.preco : null;
		const peso = doLivro
			? c.livro.peso / contagemLinhas.get(c.livro.id)
			: (100 / CATEGORIAS[c.categoria].tabela.length) * pesoCustomizado;
		if (peso <= 0) continue;
		c.peso = peso;
		c.doLivro = doLivro;
		c.preco = precoItem || precoLivro || 0;
		c.precoOrdem = precoLivro ?? c.preco;
		c.ordem = doLivro ? c.livro.ordem : Number.MAX_SAFE_INTEGER;
		pools[c.categoria].push(c);
	}
	for (const pool of Object.values(pools)) {
		pool.sort((a, b) => a.precoOrdem - b.precoOrdem || a.ordem - b.ordem || a.name.localeCompare(b.name));
	}
	return { pools, classificados };
}

function caminhoPasta(colecao, pasta) {
	const nomes = [];
	let atual = typeof pasta === "string" ? colecao?.get(pasta) : pasta;
	let limite = 0;
	while (atual && limite++ < 12) {
		nomes.unshift(atual.name);
		const pai = atual.folder;
		atual = typeof pai === "string" ? colecao?.get(pai) : pai;
	}
	return nomes.join("/");
}

async function coletarEntradas() {
	const desabilitados = new Set(setting(SETTINGS.pacotesDesabilitados) ?? []);
	const entradas = [];
	const pacotes = [];

	for (const pack of game.packs) {
		if (pack.documentName !== "Item") continue;
		const info = {
			id: pack.collection,
			rotulo: pack.metadata.label,
			pacote: pack.metadata.packageName,
			tipoPacote: pack.metadata.packageType,
			ativo: !desabilitados.has(pack.collection),
			total: 0
		};
		pacotes.push(info);
		if (!info.ativo) continue;

		let indice;
		try {
			indice = await pack.getIndex({ fields: CAMPOS_INDICE });
		} catch (err) {
			console.warn(`${MODULE_ID} | Não foi possível indexar ${pack.collection}`, err);
			continue;
		}
		const sistema = pack.metadata.packageType === "system";
		for (const i of indice) {
			if (!TIPOS_FISICOS.includes(i.type)) continue;
			info.total++;
			entradas.push({
				uuid: i.uuid ?? `Compendium.${pack.collection}.Item.${i._id}`,
				name: i.name,
				img: i.img,
				type: i.type,
				system: i.system ?? {},
				flags: i.flags ?? {},
				pastas: caminhoPasta(pack.folders, i.folder),
				sistema,
				origem: pack.metadata.label,
				pack: pack.collection
			});
		}
	}

	if (setting(SETTINGS.incluirMundo)) {
		const jaIndexados = new Set(entradas.map((e) => e.uuid));
		for (const item of game.items) {
			if (!TIPOS_FISICOS.includes(item.type)) continue;
			if (item.getFlag(MODULE_ID, "gerado")) continue;
			const fonte = item._stats?.compendiumSource;
			if (fonte && jaIndexados.has(fonte)) continue;
			entradas.push({
				uuid: item.uuid,
				name: item.name,
				img: item.img,
				type: item.type,
				system: item._source.system ?? {},
				flags: item._source.flags ?? {},
				pastas: caminhoPasta(game.folders, item.folder),
				sistema: false,
				origem: game.i18n.localize("T20T.Catalogo.ItensMundo"),
				pack: null
			});
		}
	}
	return { entradas, pacotes };
}

let cache = null;

export function invalidarCatalogo() {
	cache = null;
}

export async function obterCatalogo() {
	if (cache) return cache;
	cache = (async () => {
		const { entradas, pacotes } = await coletarEntradas();
		const { pools, classificados } = montarPools(entradas, {
			ajustes: setting(SETTINGS.ajustes) ?? {},
			incluirExtrasSistema: setting(SETTINGS.incluirExtrasSistema),
			incluirAlimentos: setting(SETTINGS.incluirAlimentos),
			pesoCustomizado: setting(SETTINGS.pesoCustomizado)
		});
		return { pools, classificados, pacotes };
	})();
	try {
		return await cache;
	} catch (err) {
		cache = null;
		throw err;
	}
}
