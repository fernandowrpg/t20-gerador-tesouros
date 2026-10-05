import { MODULE_ID, localize } from "./constants.mjs";
import { registrarConfiguracoes } from "./settings.mjs";
import { invalidarCatalogo, obterCatalogo } from "./catalog.mjs";
import { prepararCartao, registrarHelpers } from "./chat.mjs";
import { gerarRolagemDireta, gerarTesouroPorND, limparItensGerados, reindexar } from "./api.mjs";
import { ROLAGENS_DIRETAS } from "./generator.mjs";
import { GeradorApp } from "./apps/gerador-app.mjs";
import { CatalogoApp } from "./apps/catalogo-app.mjs";

const abrirGerador = () => GeradorApp.abrir();
const abrirCatalogo = () => CatalogoApp.abrir();

Hooks.once("init", () => {
	registrarConfiguracoes();
	registrarHelpers();
	foundry.applications.handlebars.loadTemplates([
		`modules/${MODULE_ID}/templates/chat-card.hbs`,
		`modules/${MODULE_ID}/templates/gerador.hbs`,
		`modules/${MODULE_ID}/templates/catalogo.hbs`
	]);
});

Hooks.once("ready", () => {
	game.modules.get(MODULE_ID).api = {
		abrir: abrirGerador,
		abrirCatalogo,
		gerar: gerarTesouroPorND,
		rolarDireto: gerarRolagemDireta,
		tiposDiretos: () => Object.keys(ROLAGENS_DIRETAS),
		catalogo: obterCatalogo,
		reindexar,
		limparGerados: limparItensGerados
	};
	if (game.system.id !== "tormenta20") {
		ui.notifications.warn(localize("T20T.Erros.SistemaIncompativel"));
	}
});

Hooks.on("getSceneControlButtons", (controles) => {
	if (!game.user?.isGM) return;
	const grupo = controles.tokens;
	if (!grupo?.tools) return;
	grupo.tools[MODULE_ID] = {
		name: MODULE_ID,
		title: "T20T.Gerador.Titulo",
		icon: "fa-solid fa-gem",
		order: Object.keys(grupo.tools).length + 1,
		button: true,
		visible: true,
		onChange: () => abrirGerador()
	};
});

function adicionarBotaoDiretorio(app, html) {
	if (!game.user.isGM) return;
	const elemento = html instanceof HTMLElement ? html : html?.[0];
	const destino = elemento?.querySelector(".header-actions");
	if (!destino || destino.querySelector(".t20t-abrir")) return;
	const botao = document.createElement("button");
	botao.type = "button";
	botao.className = "t20t-abrir";
	botao.innerHTML = `<i class="fa-solid fa-gem"></i> ${localize("T20T.Gerador.Botao")}`;
	botao.addEventListener("click", abrirGerador);
	destino.append(botao);
}

Hooks.on("renderItemDirectory", adicionarBotaoDiretorio);
Hooks.on("renderRollTableDirectory", adicionarBotaoDiretorio);
Hooks.on("renderChatMessageHTML", (message, html) => prepararCartao(message, html));

for (const hook of ["createItem", "updateItem", "deleteItem", "createFolder", "updateFolder", "deleteFolder"]) {
	Hooks.on(hook, (doc) => {
		if (doc.documentName === "Folder" && doc.type !== "Item") return;
		if (doc.parent || doc.getFlag?.(MODULE_ID, "gerado")) return;
		invalidarCatalogo();
	});
}
Hooks.on("updateCompendium", () => invalidarCatalogo());
