import { MODULE_ID, SETTINGS, formatarTibares, setting } from "./constants.mjs";
import { ICONE_MOEDAS, ICONES_RIQUEZA, NIVEIS_RIQUEZA, ROTULOS_MELHORIA, VALOR_EM_TIBARES } from "./tables.mjs";

const FLAG_PASTA = "pastaGerados";

export async function obterPasta() {
	const existente = game.folders.find((f) => f.type === "Item" && f.getFlag(MODULE_ID, FLAG_PASTA));
	if (existente) return existente;
	return Folder.create({
		name: setting(SETTINGS.nomePasta) || "Tesouros Gerados",
		type: "Item",
		color: "#8a6d1f",
		flags: { [MODULE_ID]: { [FLAG_PASTA]: true } }
	});
}

function efeitosDisponiveis(item) {
	const U = CONFIG.T20?.upgrades;
	if (!U) return {};
	const base = { ...U.general };
	if (item.type === "arma") return Object.assign(base, U.weapon);
	const tipo = item.system?.tipo;
	if (tipo === "ammo") return Object.assign(base, U.ammo);
	if (tipo === "esoterico") return Object.assign(base, U.esoteric);
	if (["traje", "ferramenta"].includes(tipo)) return Object.assign(base, U.tools);
	return Object.assign(base, U.armor?.general ?? {}, U.armor?.[tipo] ?? {});
}

function dadosEfeito(definicao, item) {
	const t20 = definicao.flags?.tormenta20 ?? {};
	return {
		...foundry.utils.deepClone(definicao),
		name: game.i18n.localize(definicao.name),
		description: game.i18n.localize(definicao.description ?? ""),
		img: item.img,
		origin: item.uuid,
		flags: {
			...definicao.flags,
			tormenta20: {
				...t20,
				items: (t20.items || "")
					.split(";")
					.map((i) => i.trim())
					.filter(Boolean)
					.map((i) => game.i18n.localize(i))
					.join(";")
			}
		}
	};
}

async function aplicarEfeitosDeMelhoria(item, chaves) {
	if (item.system?.enableAutoUpgrades === false) return;
	const disponiveis = efeitosDisponiveis(item);
	const efeitos = chaves
		.filter((chave) => disponiveis[chave] && chave !== "status")
		.map((chave) => dadosEfeito(disponiveis[chave], item));
	if (efeitos.length) await item.createEmbeddedDocuments("ActiveEffect", efeitos);
}

async function dadosBase(uuid) {
	const doc = await fromUuid(uuid);
	if (!doc) throw new Error(`Item não encontrado: ${uuid}`);
	const dados = doc.pack ? game.items.fromCompendium(doc, { keepId: false }) : doc.toObject();
	delete dados._id;
	return dados;
}

function descricaoModificacoes(r) {
	const partes = [];
	if (r.melhorias.length) {
		const nomes = r.melhorias.map((m) => (m.chave === "specialmaterial" && r.material ? `${m.rotulo} (${r.material.rotulo})` : m.rotulo));
		partes.push(`<p><strong>Melhorias:</strong> ${nomes.join(", ")}.</p>`);
	}
	if (r.encantos.length) {
		const nomes = r.encantos.map((e) => `${e.rotulo}${e.efeito ? ` <em>(${e.efeito})</em>` : ""}`);
		partes.push(`<p><strong>Encantos:</strong> ${nomes.join(", ")}.</p>`);
	}
	return `<div class="t20t-gerado">${partes.join("")}<p><em>${r.categoria} — ${formatarTibares(r.preco)}</em></p></div><hr>`;
}

function nomeModificado(r) {
	const sufixos = [
		...r.melhorias.map((m) => (m.chave === "specialmaterial" && r.material ? r.material.rotulo : m.rotulo)),
		...r.encantos.map((e) => e.rotulo)
	];
	return `${r.entrada.name} (${sufixos.join(", ")})`;
}

async function criarModificado(r, pasta) {
	const dados = await dadosBase(r.entrada.uuid);
	const upgrades = { ...(dados.system.upgrades ?? {}) };
	r.melhorias.slice(0, 4).forEach((m, i) => (upgrades[`melhoria${i + 1}`] = m.chave));
	if (r.material) upgrades.material = r.material.chave;
	r.encantos.slice(0, 3).forEach((e, i) => (upgrades[`encanto${i + 1}`] = e.chave));

	dados.name = nomeModificado(r);
	dados.folder = pasta.id;
	dados.system.upgrades = upgrades;
	dados.system.preco = r.preco;
	dados.system.description ??= {};
	dados.system.description.value = descricaoModificacoes(r) + (dados.system.description.value ?? "");
	foundry.utils.setProperty(dados, `flags.${MODULE_ID}`, { gerado: true, origem: r.entrada.uuid, data: Date.now() });

	const item = await Item.create(dados);
	await aplicarEfeitosDeMelhoria(item, r.melhorias.map((m) => m.chave));
	return item;
}

async function criarCopia(entrada, pasta) {
	const dados = await dadosBase(entrada.uuid);
	dados.folder = pasta.id;
	if (!dados.system.preco && entrada.preco) dados.system.preco = entrada.preco;
	foundry.utils.setProperty(dados, `flags.${MODULE_ID}`, { gerado: true, origem: entrada.uuid, data: Date.now() });
	return Item.create(dados);
}

async function criarTesouro({ nome, preco, espacos = 0, img, descricao }, pasta) {
	return Item.create({
		name: nome,
		type: "tesouro",
		img,
		folder: pasta.id,
		system: { preco, espacos, qtd: 1, description: { value: descricao } },
		flags: { [MODULE_ID]: { gerado: true, data: Date.now() } }
	});
}

function agruparExistentes(itens) {
	const saida = [];
	const porUuid = new Map();
	for (const item of itens) {
		if (item.tipo === "existente") {
			const chave = item.entrada.uuid;
			if (porUuid.has(chave)) {
				porUuid.get(chave).qtd++;
				continue;
			}
			const copia = { ...item };
			porUuid.set(chave, copia);
			saida.push(copia);
		} else {
			saida.push(item);
		}
	}
	return saida;
}

export async function materializar(resultado) {
	const copiarSempre = setting(SETTINGS.copiarSempre);
	let pasta = null;
	const garantirPasta = async () => (pasta ??= await obterPasta());

	const converter = async (item) => {
		switch (item.tipo) {
			case "escolha":
				return { escolha: true, opcoes: await Promise.all(item.opcoes.map(converter)) };
			case "faltando":
				return { faltando: true, nome: item.nome, categoria: item.categoria };
			case "existente": {
				const vm = {
					nome: item.entrada.name,
					img: item.entrada.img,
					uuid: item.entrada.uuid,
					preco: item.entrada.preco,
					categoria: item.categoria,
					origem: item.entrada.origem,
					qtd: item.qtd ?? 1
				};
				if (copiarSempre) {
					const criado = await criarCopia(item.entrada, await garantirPasta());
					vm.uuid = criado.uuid;
				}
				return vm;
			}
			case "modificado": {
				const criado = await criarModificado(item, await garantirPasta());
				return {
					nome: criado.name,
					img: criado.img,
					uuid: criado.uuid,
					preco: item.preco,
					categoria: item.categoria,
					origem: item.entrada.origem,
					qtd: 1,
					detalhes: [
						...item.melhorias.map((m) => (m.chave === "specialmaterial" && item.material ? `${ROTULOS_MELHORIA[m.chave]}: ${item.material.rotulo}` : m.rotulo)),
						...item.encantos.map((e) => (e.efeito ? `${e.rotulo} — ${e.efeito}` : e.rotulo))
					]
				};
			}
			default:
				return null;
		}
	};

	const itens = [];
	for (const item of agruparExistentes(resultado.itens)) {
		const vm = await converter(item);
		if (vm) itens.push(vm);
	}

	const riquezas = [];
	for (const r of resultado.riquezas) {
		const criado = await criarTesouro(
			{
				nome: r.nome,
				preco: r.preco,
				espacos: r.espacos,
				img: ICONES_RIQUEZA[r.icone] ?? ICONES_RIQUEZA.bens,
				descricao: `<p>Riqueza ${NIVEIS_RIQUEZA[r.nivel].toLowerCase()} — valor de venda ${formatarTibares(r.preco)}.</p>`
			},
			await garantirPasta()
		);
		riquezas.push({ nome: r.nome, img: criado.img, uuid: criado.uuid, preco: r.preco, categoria: `Riqueza ${NIVEIS_RIQUEZA[r.nivel].toLowerCase()}`, qtd: 1 });
	}

	const moedas = [];
	for (const [unidade, valor] of Object.entries(resultado.moedas)) {
		if (!valor) continue;
		const vm = { nome: `${valor.toLocaleString("pt-BR")} ${unidade}`, img: ICONE_MOEDAS, unidade, valor, preco: valor * VALOR_EM_TIBARES[unidade], qtd: 1 };
		if (setting(SETTINGS.criarMoedas)) {
			const criado = await criarTesouro(
				{
					nome: `Moedas (${vm.nome})`,
					preco: vm.preco,
					img: ICONE_MOEDAS,
					descricao: `<p>${vm.nome} — equivalente a ${formatarTibares(vm.preco)}.</p>`
				},
				await garantirPasta()
			);
			vm.uuid = criado.uuid;
		}
		moedas.push(vm);
	}

	const somar = (lista) => lista.reduce((s, i) => s + (i.escolha ? 0 : (i.preco ?? 0) * (i.qtd ?? 1)), 0);
	const total = somar(moedas) + somar(riquezas) + somar(itens);

	return { titulo: resultado.titulo, moedas, riquezas, itens, log: resultado.log, total };
}

export async function limparGerados() {
	const ids = game.items.filter((i) => i.getFlag(MODULE_ID, "gerado")).map((i) => i.id);
	if (ids.length) await Item.deleteDocuments(ids);
	return ids.length;
}
