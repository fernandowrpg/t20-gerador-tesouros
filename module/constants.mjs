export const MODULE_ID = "t20-gerador-tesouros";

export const TIPOS_FISICOS = ["arma", "equipamento", "consumivel", "tesouro"];

export const SETTINGS = {
	incluirMundo: "incluirItensMundo",
	incluirExtrasSistema: "incluirExtrasSistema",
	incluirAlimentos: "incluirAlimentos",
	pesoCustomizado: "pesoCustomizado",
	criarMoedas: "criarItemMoedas",
	copiarSempre: "copiarParaMundo",
	nomePasta: "nomePasta",
	mostrarRolagens: "mostrarRolagens",
	pacotesDesabilitados: "pacotesDesabilitados",
	ajustes: "ajustesCategoria",
	ultimoFormulario: "ultimoFormulario"
};

export const EXCLUIR = "excluir";

export function setting(key) {
	return game.settings.get(MODULE_ID, key);
}

export function localize(key, data) {
	return data ? game.i18n.format(key, data) : game.i18n.localize(key);
}

export function formatarTibares(valor) {
	const arredondado = Math.round(valor * 100) / 100;
	return `T$ ${arredondado.toLocaleString("pt-BR")}`;
}
