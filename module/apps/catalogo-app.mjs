import { EXCLUIR, MODULE_ID, SETTINGS, formatarTibares, localize, setting } from "../constants.mjs";
import { CATEGORIAS } from "../tables.mjs";
import { invalidarCatalogo, obterCatalogo } from "../catalog.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CatalogoApp extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: `${MODULE_ID}-catalogo`,
		classes: ["t20t-app", "t20t-catalogo"],
		window: { title: "T20T.Catalogo.Titulo", icon: "fa-solid fa-book-open", resizable: true },
		position: { width: 820, height: 720 },
		actions: {
			reindexar: CatalogoApp.#aoReindexar,
			abrirItem: CatalogoApp.#aoAbrirItem
		}
	};

	static PARTS = {
		conteudo: { template: `modules/${MODULE_ID}/templates/catalogo.hbs`, scrollable: [".t20t-tabela-rolagem"] }
	};

	static #instancia = null;

	static abrir() {
		this.#instancia ??= new CatalogoApp();
		return this.#instancia.render({ force: true });
	}

	#filtro = { texto: "", categoria: "todas" };

	async _prepareContext(options) {
		const catalogo = await obterCatalogo();
		const ajustes = setting(SETTINGS.ajustes) ?? {};
		const categorias = Object.entries(CATEGORIAS).map(([valor, def]) => ({ valor, rotulo: def.rotulo }));
		const contagem = Object.fromEntries(Object.keys(CATEGORIAS).map((k) => [k, catalogo.pools[k].length]));

		const linhas = catalogo.classificados
			.map((c) => ({
				uuid: c.uuid,
				nome: c.name,
				img: c.img,
				tipo: c.system?.tipo ? `${c.type}/${c.system.tipo}` : c.type,
				preco: formatarTibares(Number(c.system?.preco) || c.livro?.preco || 0),
				origem: c.origem,
				categoria: c.categoria ?? "",
				rotuloCategoria: c.categoria ? CATEGORIAS[c.categoria].rotulo : localize("T20T.Catalogo.Ignorado"),
				motivo: localize(`T20T.Motivo.${c.motivo}`),
				ajuste: ajustes[c.uuid] ?? "",
				peso: c.peso ? Math.round(c.peso * 100) / 100 : "—",
				busca: `${c.name} ${c.origem}`.toLowerCase()
			}))
			.sort((a, b) => a.nome.localeCompare(b.nome));

		return {
			pacotes: catalogo.pacotes,
			categorias,
			resumo: categorias.map((c) => ({ ...c, total: contagem[c.valor] })),
			linhas,
			excluir: EXCLUIR,
			filtro: this.#filtro,
			totalClassificados: linhas.filter((l) => l.categoria).length,
			totalIgnorados: linhas.filter((l) => !l.categoria).length
		};
	}

	_onRender(context, options) {
		const html = this.element;
		const busca = html.querySelector("input[name=busca]");
		const filtroCategoria = html.querySelector("select[name=filtroCategoria]");
		const aplicarFiltro = () => {
			this.#filtro.texto = busca.value.trim().toLowerCase();
			this.#filtro.categoria = filtroCategoria.value;
			for (const tr of html.querySelectorAll("tr[data-uuid]")) {
				const textoOk = !this.#filtro.texto || tr.dataset.busca.includes(this.#filtro.texto);
				const cat = tr.dataset.categoria;
				const categoriaOk =
					this.#filtro.categoria === "todas" ||
					(this.#filtro.categoria === "ignorados" ? !cat : cat === this.#filtro.categoria);
				tr.hidden = !(textoOk && categoriaOk);
			}
		};
		busca.addEventListener("input", aplicarFiltro);
		filtroCategoria.addEventListener("change", aplicarFiltro);
		aplicarFiltro();

		for (const el of html.querySelectorAll("input[data-pacote]")) {
			el.addEventListener("change", (ev) => this.#alternarPacote(ev.currentTarget.dataset.pacote, ev.currentTarget.checked));
		}
		for (const el of html.querySelectorAll("select[data-ajuste]")) {
			el.addEventListener("change", (ev) => this.#ajustar(ev.currentTarget.dataset.ajuste, ev.currentTarget.value));
		}
	}

	async #alternarPacote(id, ativo) {
		const desabilitados = new Set(setting(SETTINGS.pacotesDesabilitados) ?? []);
		if (ativo) desabilitados.delete(id);
		else desabilitados.add(id);
		await game.settings.set(MODULE_ID, SETTINGS.pacotesDesabilitados, [...desabilitados]);
		invalidarCatalogo();
		this.render();
	}

	async #ajustar(uuid, valor) {
		const ajustes = foundry.utils.deepClone(setting(SETTINGS.ajustes) ?? {});
		if (valor) ajustes[uuid] = valor;
		else delete ajustes[uuid];
		await game.settings.set(MODULE_ID, SETTINGS.ajustes, ajustes);
		invalidarCatalogo();
		this.render();
	}

	static #aoReindexar() {
		invalidarCatalogo();
		this.render();
	}

	static async #aoAbrirItem(event, alvo) {
		const doc = await fromUuid(alvo.closest("tr").dataset.uuid);
		doc?.sheet.render(true);
	}
}
