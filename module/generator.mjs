import {
	CATEGORIAS,
	CRIATURAS_ANTICRIATURA,
	ENCANTOS_POR_NIVEL,
	ESPECIFICO,
	MATERIAIS,
	NIVEIS_MAGICOS,
	NIVEIS_RIQUEZA,
	PRECO_ENCANTOS,
	PRECO_MATERIAIS,
	PRECO_MELHORIAS,
	TABELA_8_1,
	TABELA_8_10,
	TABELA_8_2,
	TABELA_8_5,
	TABELA_8_8
} from "./tables.mjs";

const LIMITE_TENTATIVAS = 200;

export async function rolar(formula) {
	const RollClass = globalThis.foundry?.dice?.Roll ?? globalThis.Roll;
	const roll = await new RollClass(formula).evaluate();
	return roll.total;
}

const d100 = () => rolar("1d100");
const d6 = () => rolar("1d6");

function buscarFaixa(tabela, valor) {
	return tabela.find(([max]) => valor <= max) ?? tabela.at(-1);
}

function textoFormula(formula) {
	return formula.replace(/\*/g, "×").replace(/\((.+)\)/, "$1").replace(/(\d)(\d{3})\b/g, "$1.$2");
}

export class ResultadoTesouro {
	constructor(titulo) {
		this.titulo = titulo;
		this.moedas = { TC: 0, "T$": 0, TO: 0 };
		this.riquezas = [];
		this.itens = [];
		this.log = [];
	}

	registrar(texto) {
		this.log.push(texto);
	}
}

export class GeradorTesouro {
	constructor(catalogo) {
		this.pools = catalogo.pools;
	}

	async sortear(categoria, bonus = 0) {
		const pool = this.pools[categoria] ?? [];
		if (!pool.length) return { entrada: null, dado: null };
		const total = pool.reduce((s, e) => s + e.peso, 0);
		let dado = null;
		let alvo;
		if (bonus) {
			dado = await d100();
			const ajustado = Math.min(100, dado + bonus);
			alvo = ((ajustado - 1 + Math.random()) / 100) * total;
		} else {
			alvo = Math.random() * total;
		}
		let acumulado = 0;
		for (const entrada of pool) {
			acumulado += entrada.peso;
			if (alvo < acumulado) return { entrada, dado };
		}
		return { entrada: pool.at(-1), dado };
	}

	async sortearDoLivro(categoria, bonus = 0) {
		const valor = Math.min(100, (await d100()) + bonus);
		const [, nomes] = buscarFaixa(CATEGORIAS[categoria].tabela, valor);
		return [nomes].flat()[0];
	}

	async item(categoria, resultado, { bonus = 0, rotulo = null } = {}) {
		const { entrada, dado } = await this.sortear(categoria, bonus);
		const nomeCategoria = rotulo ?? CATEGORIAS[categoria].rotulo;
		if (!entrada) {
			const nome = await this.sortearDoLivro(categoria, bonus);
			resultado.registrar(`${nomeCategoria}: nenhum item disponível nos compêndios; tabela do livro sugere "${nome}".`);
			return { tipo: "faltando", categoria: nomeCategoria, nome };
		}
		const detalheDado = dado ? ` (d% ${dado}${bonus ? ` +${bonus}` : ""})` : "";
		resultado.registrar(`${nomeCategoria}: ${entrada.name}${detalheDado}`);
		return { tipo: "existente", entrada, categoria: nomeCategoria, qtd: 1 };
	}

	async categoriaEquipamento(resultado) {
		const valor = await d6();
		const categoria = valor <= 3 ? "arma" : valor <= 5 ? "armadura" : "esoterico";
		resultado.registrar(`Tipo de equipamento: 1d6 = ${valor} → ${CATEGORIAS[categoria].rotulo}`);
		return categoria;
	}

	async categoriaMagica(resultado) {
		const valor = await d6();
		const tipo = valor <= 2 ? "arma" : valor === 3 ? "armadura" : "acessorio";
		const nomes = { arma: "Arma", armadura: "Armadura/Escudo", acessorio: "Acessório" };
		resultado.registrar(`Tipo de item mágico: 1d6 = ${valor} → ${nomes[tipo]}`);
		return tipo;
	}

	async duplicar(dois, fabrica) {
		if (!dois) return fabrica();
		const opcoes = [await fabrica(), await fabrica()];
		return { tipo: "escolha", opcoes };
	}

	async equipamento(resultado, dois = false) {
		return this.duplicar(dois, async () => this.item(await this.categoriaEquipamento(resultado), resultado));
	}

	async pocoes(resultado, qtdFormula = "1", bonus = 0) {
		const qtd = await rolar(qtdFormula);
		if (qtdFormula !== "1") resultado.registrar(`Quantidade de poções: ${qtdFormula} = ${qtd}`);
		const lista = [];
		for (let i = 0; i < qtd; i++) lista.push(await this.item("pocao", resultado, { bonus }));
		return lista;
	}

	async superior(resultado, melhorias, dois = false, categoriaFixa = null) {
		return this.duplicar(dois, async () => {
			const categoria = categoriaFixa ?? (await this.categoriaEquipamento(resultado));
			const rotulo = `Superior (${melhorias} ${melhorias === 1 ? "melhoria" : "melhorias"})`;
			const base = await this.item(categoria, resultado, { rotulo: `${rotulo} — base` });
			if (base.tipo !== "existente") return base;
			const mods = await this.rolarMelhorias(categoria, melhorias, base.entrada, resultado);
			const precoBase = base.entrada.preco;
			return {
				tipo: "modificado",
				entrada: base.entrada,
				categoria: rotulo,
				melhorias: mods.melhorias,
				material: mods.material,
				encantos: [],
				preco: precoBase + PRECO_MELHORIAS[mods.melhorias.length] + (mods.material?.preco ?? 0)
			};
		});
	}

	tipoArmadura(entrada) {
		const tipo = entrada.system?.tipo;
		return ["leve", "pesada", "escudo"].includes(tipo) ? tipo : "leve";
	}

	ehDistancia(entrada) {
		const s = entrada.system ?? {};
		return s.proposito === "disparo" || s.proficiencia === "fogo";
	}

	async rolarMelhorias(categoria, quantidade, entrada, resultado) {
		const tabela = TABELA_8_5[categoria];
		const escolhidas = [];
		let material = null;
		let tentativas = 0;
		while (escolhidas.length < quantidade && tentativas++ < LIMITE_TENTATIVAS) {
			const valor = await d100();
			const [, chave, rotulo, opcoes = {}] = buscarFaixa(tabela, valor);
			if (escolhidas.some((m) => m.chave === chave)) continue;
			if (opcoes.distancia && !this.ehDistancia(entrada)) continue;
			if (opcoes.exigeOutra && quantidade === 1) continue;
			const novas = [];
			if (opcoes.implica && !escolhidas.some((m) => m.chave === opcoes.implica)) {
				novas.push({ chave: opcoes.implica, rotulo: tabela.find(([, k]) => k === opcoes.implica)?.[2] ?? opcoes.implica });
			}
			novas.push({ chave, rotulo });
			if (escolhidas.length + novas.length > quantidade) continue;
			escolhidas.push(...novas);
			resultado.registrar(`Melhoria: d% ${valor} → ${novas.map((m) => m.rotulo).join(" + ")}`);
			if (chave === "specialmaterial") material = await this.rolarMaterial(categoria, entrada, resultado);
		}
		return { melhorias: escolhidas, material };
	}

	async rolarMaterial(categoria, entrada, resultado) {
		const tabelaPreco = categoria === "armadura" ? PRECO_MATERIAIS[this.tipoArmadura(entrada)] : PRECO_MATERIAIS[categoria];
		for (let i = 0; i < LIMITE_TENTATIVAS; i++) {
			const valor = await d6();
			const preco = tabelaPreco[valor - 1];
			if (preco === null) continue;
			const [chave, rotulo] = MATERIAIS[valor - 1];
			resultado.registrar(`Material especial: 1d6 = ${valor} → ${rotulo}`);
			return { chave, rotulo, preco };
		}
		return null;
	}

	async rolarEncantos(tipo, quantidade, entrada, resultado) {
		const tabela = tipo === "arma" ? TABELA_8_8 : TABELA_8_10;
		const ehEscudo = entrada.system?.tipo === "escudo";
		const custo = (lista) => lista.reduce((s, e) => s + (e.duplo ? 2 : 1), 0);
		let escolhidos = [];
		let tentativas = 0;
		while (custo(escolhidos) < quantidade && tentativas++ < LIMITE_TENTATIVAS) {
			const valor = await d100();
			const [, chave, rotulo, efeito, opcoes = {}] = buscarFaixa(tabela, valor);
			if (chave === ESPECIFICO) {
				resultado.registrar(`Encanto: d% ${valor} → ${rotulo}`);
				return { especifico: true };
			}
			if (escolhidos.some((e) => e.chave === chave)) continue;
			if (opcoes.apenasEscudo && !ehEscudo) continue;
			if (escolhidos.some((e) => e.substitui === chave)) continue;
			let proximos = opcoes.substitui ? escolhidos.filter((e) => e.chave !== opcoes.substitui) : [...escolhidos];
			const encanto = { chave, rotulo, efeito, duplo: !!opcoes.duplo, substitui: opcoes.substitui ?? null };
			if (opcoes.criatura) {
				const d = await d6();
				encanto.rotulo = `${rotulo} (${CRIATURAS_ANTICRIATURA[d - 1]})`;
			}
			proximos.push(encanto);
			if (custo(proximos) > quantidade) continue;
			escolhidos = proximos;
			resultado.registrar(`Encanto: d% ${valor} → ${encanto.rotulo}`);
		}
		return { encantos: escolhidos, custo: custo(escolhidos) };
	}

	async magico(resultado, nivel, dois = false, tipoFixo = null) {
		return this.duplicar(dois, async () => {
			const tipo = tipoFixo ?? (await this.categoriaMagica(resultado));
			const rotulo = `Mágico (${NIVEIS_MAGICOS[nivel].toLowerCase()})`;
			if (tipo === "acessorio") return this.item(`acessorio-${nivel}`, resultado, { rotulo });

			const categoriaBase = tipo === "arma" ? "arma" : "armadura";
			const base = await this.item(categoriaBase, resultado, { rotulo: `${rotulo} — base` });
			if (base.tipo !== "existente") return base;
			const enc = await this.rolarEncantos(tipo, ENCANTOS_POR_NIVEL[nivel], base.entrada, resultado);
			if (enc.especifico) {
				return this.item(tipo === "arma" ? "arma-especifica" : "armadura-especifica", resultado, { rotulo });
			}
			return {
				tipo: "modificado",
				entrada: base.entrada,
				categoria: rotulo,
				melhorias: [],
				material: null,
				encantos: enc.encantos,
				preco: base.entrada.preco + PRECO_ENCANTOS[Math.min(3, enc.custo)]
			};
		});
	}

	async riqueza(resultado, nivel, bonus = 0, metade = false) {
		const dado = await d100();
		const valor = Math.min(100, dado + bonus);
		const linha = TABELA_8_2.find((l) => l[nivel] && valor >= l[nivel][0] && valor <= l[nivel][1]) ?? TABELA_8_2.at(-1);
		let preco = await rolar(linha.formula);
		if (metade) preco = Math.floor(preco / 2);
		const [nome, espacos, icone] = linha.exemplos[Math.floor(Math.random() * linha.exemplos.length)];
		resultado.registrar(
			`Riqueza ${NIVEIS_RIQUEZA[nivel].toLowerCase()}: d% ${dado}${bonus ? ` +${bonus}` : ""} → ${textoFormula(linha.formula)} = T$ ${preco}${metade ? " (metade)" : ""} — ${nome}`
		);
		resultado.riquezas.push({ nome, preco, espacos, icone, nivel });
	}

	async rolarDinheiro(tabela, resultado, metade) {
		const dado = await d100();
		const [, spec] = buscarFaixa(tabela, dado);
		if (!spec) {
			resultado.registrar(`Dinheiro: d% ${dado} → nada`);
			return;
		}
		if (spec.tipo === "moedas") {
			let valor = await rolar(spec.formula);
			if (metade) valor = Math.floor(valor / 2);
			resultado.moedas[spec.unidade] += valor;
			resultado.registrar(`Dinheiro: d% ${dado} → ${textoFormula(spec.formula)} ${spec.unidade} = ${valor} ${spec.unidade}${metade ? " (metade)" : ""}`);
			return;
		}
		const qtd = await rolar(spec.qtd);
		resultado.registrar(`Dinheiro: d% ${dado} → ${spec.qtd === "1" ? 1 : `${spec.qtd} = ${qtd}`} riqueza(s) ${NIVEIS_RIQUEZA[spec.nivel].toLowerCase()}(s)`);
		for (let i = 0; i < qtd; i++) await this.riqueza(resultado, spec.nivel, spec.bonus, metade);
	}

	async resolverItem(spec, resultado) {
		switch (spec.cat) {
			case "diverso":
				return [await this.item("diverso", resultado)];
			case "equipamento":
				return [await this.equipamento(resultado, spec.dois)];
			case "pocao":
				return this.pocoes(resultado, spec.qtd, spec.bonus);
			case "superior":
				return [await this.superior(resultado, spec.melhorias, spec.dois)];
			case "magico":
				return [await this.magico(resultado, spec.nivel, spec.dois)];
			default:
				return [];
		}
	}

	async rolarItens(tabela, resultado) {
		const dado = await d100();
		const [, spec] = buscarFaixa(tabela, dado);
		if (!spec) {
			resultado.registrar(`Itens: d% ${dado} → nada`);
			return;
		}
		resultado.registrar(`Itens: d% ${dado} → ${descreverSpecItem(spec)}`);
		resultado.itens.push(...(await this.resolverItem(spec, resultado)));
	}

	async gerarPorND({ nd, tesouro = "padrao", vezes = 1, dinheiro = true, itens = true }) {
		const linha = TABELA_8_1[nd];
		if (!linha) throw new Error(`ND inválido: ${nd}`);
		const rotuloTesouro = { padrao: "Padrão", metade: "Metade", dobro: "Dobro" }[tesouro] ?? tesouro;
		const resultado = new ResultadoTesouro(`ND ${nd} — Tesouro ${rotuloTesouro}${vezes > 1 ? ` × ${vezes}` : ""}`);
		const repeticoes = tesouro === "dobro" ? 2 : 1;
		const metade = tesouro === "metade";
		for (let v = 0; v < vezes; v++) {
			for (let r = 0; r < repeticoes; r++) {
				if (dinheiro) await this.rolarDinheiro(linha.dinheiro, resultado, metade);
				if (itens) await this.rolarItens(linha.itens, resultado);
			}
		}
		return resultado;
	}

	async gerarDireto(tipo, quantidade = 1) {
		const resultado = new ResultadoTesouro(`Rolagem direta: ${ROLAGENS_DIRETAS[tipo]?.rotulo ?? tipo}${quantidade > 1 ? ` × ${quantidade}` : ""}`);
		const def = ROLAGENS_DIRETAS[tipo];
		if (!def) throw new Error(`Rolagem desconhecida: ${tipo}`);
		for (let i = 0; i < quantidade; i++) await def.rolar(this, resultado);
		return resultado;
	}
}

function descreverSpecItem(spec) {
	const sufixo = spec.dois ? " [2D]" : "";
	switch (spec.cat) {
		case "diverso":
			return "Diverso";
		case "equipamento":
			return `Equipamento${sufixo}`;
		case "pocao":
			return `${spec.qtd === "1" ? "1 poção" : `${spec.qtd} poções`}${spec.bonus ? " [+%]" : ""}`;
		case "superior":
			return `Superior (${spec.melhorias} ${spec.melhorias === 1 ? "melhoria" : "melhorias"})${sufixo}`;
		case "magico":
			return `Mágico (${NIVEIS_MAGICOS[spec.nivel].toLowerCase()})${sufixo}`;
		default:
			return spec.cat;
	}
}

const empurrar = (resultado, item) => {
	resultado.itens.push(...[item].flat());
};

export const ROLAGENS_DIRETAS = {
	diverso: { rotulo: "Item diverso", rolar: async (g, r) => empurrar(r, await g.item("diverso", r)) },
	equipamento: { rotulo: "Equipamento", rolar: async (g, r) => empurrar(r, await g.equipamento(r)) },
	arma: { rotulo: "Arma", rolar: async (g, r) => empurrar(r, await g.item("arma", r)) },
	armadura: { rotulo: "Armadura/Escudo", rolar: async (g, r) => empurrar(r, await g.item("armadura", r)) },
	esoterico: { rotulo: "Esotérico", rolar: async (g, r) => empurrar(r, await g.item("esoterico", r)) },
	pocao: { rotulo: "Poção", rolar: async (g, r) => empurrar(r, await g.pocoes(r)) },
	"superior-1": { rotulo: "Superior (1 melhoria)", rolar: async (g, r) => empurrar(r, await g.superior(r, 1)) },
	"superior-2": { rotulo: "Superior (2 melhorias)", rolar: async (g, r) => empurrar(r, await g.superior(r, 2)) },
	"superior-3": { rotulo: "Superior (3 melhorias)", rolar: async (g, r) => empurrar(r, await g.superior(r, 3)) },
	"superior-4": { rotulo: "Superior (4 melhorias)", rolar: async (g, r) => empurrar(r, await g.superior(r, 4)) },
	"magico-menor": { rotulo: "Item mágico menor", rolar: async (g, r) => empurrar(r, await g.magico(r, "menor")) },
	"magico-medio": { rotulo: "Item mágico médio", rolar: async (g, r) => empurrar(r, await g.magico(r, "medio")) },
	"magico-maior": { rotulo: "Item mágico maior", rolar: async (g, r) => empurrar(r, await g.magico(r, "maior")) },
	"arma-magica-menor": { rotulo: "Arma mágica menor", rolar: async (g, r) => empurrar(r, await g.magico(r, "menor", false, "arma")) },
	"arma-magica-medio": { rotulo: "Arma mágica média", rolar: async (g, r) => empurrar(r, await g.magico(r, "medio", false, "arma")) },
	"arma-magica-maior": { rotulo: "Arma mágica maior", rolar: async (g, r) => empurrar(r, await g.magico(r, "maior", false, "arma")) },
	"armadura-magica-menor": { rotulo: "Armadura/Escudo mágico menor", rolar: async (g, r) => empurrar(r, await g.magico(r, "menor", false, "armadura")) },
	"armadura-magica-medio": { rotulo: "Armadura/Escudo mágico médio", rolar: async (g, r) => empurrar(r, await g.magico(r, "medio", false, "armadura")) },
	"armadura-magica-maior": { rotulo: "Armadura/Escudo mágico maior", rolar: async (g, r) => empurrar(r, await g.magico(r, "maior", false, "armadura")) },
	"acessorio-menor": { rotulo: "Acessório menor", rolar: async (g, r) => empurrar(r, await g.item("acessorio-menor", r)) },
	"acessorio-medio": { rotulo: "Acessório médio", rolar: async (g, r) => empurrar(r, await g.item("acessorio-medio", r)) },
	"acessorio-maior": { rotulo: "Acessório maior", rolar: async (g, r) => empurrar(r, await g.item("acessorio-maior", r)) },
	"riqueza-menor": { rotulo: "Riqueza menor", rolar: (g, r) => g.riqueza(r, "menor") },
	"riqueza-media": { rotulo: "Riqueza média", rolar: (g, r) => g.riqueza(r, "media") },
	"riqueza-maior": { rotulo: "Riqueza maior", rolar: (g, r) => g.riqueza(r, "maior") }
};
