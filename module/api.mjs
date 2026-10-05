import { localize } from "./constants.mjs";
import { invalidarCatalogo, obterCatalogo } from "./catalog.mjs";
import { GeradorTesouro, ROLAGENS_DIRETAS } from "./generator.mjs";
import { limparGerados, materializar } from "./items.mjs";
import { enviarAoChat } from "./chat.mjs";
import { ND_LIST } from "./tables.mjs";

function exigirMestre() {
	if (!game.user.isGM) throw new Error(localize("T20T.Erros.ApenasMestre"));
}

async function finalizar(resultado, { chat = true } = {}) {
	const dados = await materializar(resultado);
	if (chat) await enviarAoChat(dados);
	return dados;
}

export async function gerarTesouroPorND({ nd = "1", tesouro = "padrao", vezes = 1, dinheiro = true, itens = true } = {}, opcoes = {}) {
	exigirMestre();
	nd = String(nd);
	if (!ND_LIST.includes(nd)) throw new Error(localize("T20T.Erros.NDInvalido", { nd }));
	const gerador = new GeradorTesouro(await obterCatalogo());
	const resultado = await gerador.gerarPorND({ nd, tesouro, vezes, dinheiro, itens });
	return finalizar(resultado, opcoes);
}

export async function gerarRolagemDireta(tipo, quantidade = 1, opcoes = {}) {
	exigirMestre();
	if (!ROLAGENS_DIRETAS[tipo]) throw new Error(localize("T20T.Erros.TipoInvalido", { tipo }));
	const gerador = new GeradorTesouro(await obterCatalogo());
	const resultado = await gerador.gerarDireto(tipo, quantidade);
	return finalizar(resultado, opcoes);
}

export async function limparItensGerados() {
	exigirMestre();
	return limparGerados();
}

export async function reindexar() {
	invalidarCatalogo();
	return obterCatalogo();
}
