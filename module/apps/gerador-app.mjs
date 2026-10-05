import { MODULE_ID, SETTINGS, localize, setting } from "../constants.mjs";
import { ND_LIST } from "../tables.mjs";
import { ROLAGENS_DIRETAS } from "../generator.mjs";
import { gerarTesouroPorND, gerarRolagemDireta, limparItensGerados } from "../api.mjs";
import { CatalogoApp } from "./catalogo-app.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class GeradorApp extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: `${MODULE_ID}-gerador`,
		tag: "form",
		classes: ["t20t-app", "t20t-gerador"],
		window: { title: "T20T.Gerador.Titulo", icon: "fa-solid fa-gem", resizable: false },
		position: { width: 440, height: "auto" },
		form: { handler: GeradorApp.#aoEnviar, closeOnSubmit: false, submitOnChange: false },
		actions: {
			rolarDireto: GeradorApp.#aoRolarDireto,
			abrirCatalogo: GeradorApp.#aoAbrirCatalogo,
			limpar: GeradorApp.#aoLimpar
		}
	};

	static PARTS = {
		form: { template: `modules/${MODULE_ID}/templates/gerador.hbs` }
	};

	static #instancia = null;

	static abrir() {
		this.#instancia ??= new GeradorApp();
		return this.#instancia.render({ force: true });
	}

	async _prepareContext(options) {
		const ultimo = setting(SETTINGS.ultimoFormulario) ?? {};
		return {
			nds: ND_LIST.map((nd) => ({ valor: nd, selecionado: nd === (ultimo.nd ?? "1") })),
			tesouros: ["padrao", "metade", "dobro"].map((valor) => ({
				valor,
				rotulo: localize(`T20T.Gerador.Tesouro.${valor}`),
				selecionado: valor === (ultimo.tesouro ?? "padrao")
			})),
			vezes: ultimo.vezes ?? 1,
			dinheiro: ultimo.dinheiro ?? true,
			itens: ultimo.itens ?? true,
			diretas: Object.entries(ROLAGENS_DIRETAS).map(([valor, def]) => ({ valor, rotulo: def.rotulo, selecionado: valor === ultimo.direta })),
			qtdDireta: ultimo.qtdDireta ?? 1
		};
	}

	#lerFormulario() {
		const dados = new foundry.applications.ux.FormDataExtended(this.element).object;
		return {
			nd: String(dados.nd),
			tesouro: dados.tesouro,
			vezes: Math.max(1, Math.min(50, Number(dados.vezes) || 1)),
			dinheiro: !!dados.dinheiro,
			itens: !!dados.itens,
			direta: dados.direta,
			qtdDireta: Math.max(1, Math.min(20, Number(dados.qtdDireta) || 1))
		};
	}

	async #executar(botao, tarefa) {
		const botoes = this.element.querySelectorAll("button");
		botoes.forEach((b) => (b.disabled = true));
		botao?.classList.add("t20t-carregando");
		try {
			await tarefa();
		} catch (err) {
			console.error(`${MODULE_ID} |`, err);
			ui.notifications.error(localize("T20T.Erros.Geracao", { erro: err.message }));
		} finally {
			botoes.forEach((b) => (b.disabled = false));
			botao?.classList.remove("t20t-carregando");
		}
	}

	static async #aoEnviar(event, form) {
		const dados = this.#lerFormulario();
		await game.settings.set(MODULE_ID, SETTINGS.ultimoFormulario, dados);
		await this.#executar(event.submitter, () => gerarTesouroPorND(dados));
	}

	static async #aoRolarDireto(event, botao) {
		const dados = this.#lerFormulario();
		await game.settings.set(MODULE_ID, SETTINGS.ultimoFormulario, dados);
		await this.#executar(botao, () => gerarRolagemDireta(dados.direta, dados.qtdDireta));
	}

	static #aoAbrirCatalogo() {
		CatalogoApp.abrir();
	}

	static async #aoLimpar() {
		const confirmado = await foundry.applications.api.DialogV2.confirm({
			window: { title: localize("T20T.Limpar.Titulo") },
			content: `<p>${localize("T20T.Limpar.Confirmar")}</p>`
		});
		if (!confirmado) return;
		const total = await limparItensGerados();
		ui.notifications.info(localize("T20T.Limpar.Feito", { total }));
	}
}
