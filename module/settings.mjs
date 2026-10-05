import { MODULE_ID, SETTINGS } from "./constants.mjs";
import { invalidarCatalogo } from "./catalog.mjs";
import { CatalogoApp } from "./apps/catalogo-app.mjs";

export function registrarConfiguracoes() {
	const registrar = (chave, dados) => game.settings.register(MODULE_ID, chave, { scope: "world", config: true, ...dados });
	const reindexar = () => invalidarCatalogo();

	game.settings.registerMenu(MODULE_ID, "catalogoMenu", {
		name: "T20T.Config.Catalogo.Nome",
		label: "T20T.Config.Catalogo.Botao",
		hint: "T20T.Config.Catalogo.Dica",
		icon: "fa-solid fa-book-open",
		type: CatalogoApp,
		restricted: true
	});

	registrar(SETTINGS.incluirMundo, {
		name: "T20T.Config.IncluirMundo.Nome",
		hint: "T20T.Config.IncluirMundo.Dica",
		type: Boolean,
		default: true,
		onChange: reindexar
	});
	registrar(SETTINGS.incluirExtrasSistema, {
		name: "T20T.Config.ExtrasSistema.Nome",
		hint: "T20T.Config.ExtrasSistema.Dica",
		type: Boolean,
		default: false,
		onChange: reindexar
	});
	registrar(SETTINGS.incluirAlimentos, {
		name: "T20T.Config.Alimentos.Nome",
		hint: "T20T.Config.Alimentos.Dica",
		type: Boolean,
		default: false,
		onChange: reindexar
	});
	registrar(SETTINGS.pesoCustomizado, {
		name: "T20T.Config.Peso.Nome",
		hint: "T20T.Config.Peso.Dica",
		type: Number,
		range: { min: 0, max: 5, step: 0.25 },
		default: 1,
		onChange: reindexar
	});
	registrar(SETTINGS.criarMoedas, {
		name: "T20T.Config.Moedas.Nome",
		hint: "T20T.Config.Moedas.Dica",
		type: Boolean,
		default: true
	});
	registrar(SETTINGS.copiarSempre, {
		name: "T20T.Config.Copiar.Nome",
		hint: "T20T.Config.Copiar.Dica",
		type: Boolean,
		default: false
	});
	registrar(SETTINGS.nomePasta, {
		name: "T20T.Config.Pasta.Nome",
		hint: "T20T.Config.Pasta.Dica",
		type: String,
		default: "Tesouros Gerados"
	});
	registrar(SETTINGS.mostrarRolagens, {
		name: "T20T.Config.Rolagens.Nome",
		hint: "T20T.Config.Rolagens.Dica",
		type: Boolean,
		default: true
	});

	game.settings.register(MODULE_ID, SETTINGS.pacotesDesabilitados, {
		scope: "world",
		config: false,
		type: Array,
		default: [],
		onChange: reindexar
	});
	game.settings.register(MODULE_ID, SETTINGS.ajustes, {
		scope: "world",
		config: false,
		type: Object,
		default: {},
		onChange: reindexar
	});
	game.settings.register(MODULE_ID, SETTINGS.ultimoFormulario, {
		scope: "client",
		config: false,
		type: Object,
		default: {}
	});
}
