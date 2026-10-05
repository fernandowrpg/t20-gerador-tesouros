import { MODULE_ID, SETTINGS, formatarTibares, localize, setting } from "./constants.mjs";

const TEMPLATE = `modules/${MODULE_ID}/templates/chat-card.hbs`;

export async function enviarAoChat(dados) {
	const renderizar = foundry.applications.handlebars.renderTemplate;
	const content = await renderizar(TEMPLATE, {
		...dados,
		totalFormatado: formatarTibares(dados.total),
		mostrarRolagens: setting(SETTINGS.mostrarRolagens) && dados.log.length,
		vazio: !dados.moedas.length && !dados.riquezas.length && !dados.itens.length
	});
	return ChatMessage.create({
		content,
		speaker: { alias: localize("T20T.Chat.Remetente") },
		whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id),
		flags: { [MODULE_ID]: { cartao: true } }
	});
}

function iniciarArraste(event) {
	const uuid = event.currentTarget.dataset.uuid;
	event.dataTransfer.setData("text/plain", JSON.stringify({ type: "Item", uuid }));
	event.stopPropagation();
}

async function abrirFicha(event) {
	event.preventDefault();
	event.stopPropagation();
	const doc = await fromUuid(event.currentTarget.dataset.uuid);
	if (doc) doc.sheet.render(true);
	else ui.notifications.warn(localize("T20T.Chat.ItemSumiu"));
}

export function prepararCartao(message, html) {
	if (!message.getFlag(MODULE_ID, "cartao")) return;
	for (const el of html.querySelectorAll(".t20t-link[data-uuid]")) {
		el.setAttribute("draggable", "true");
		el.addEventListener("dragstart", iniciarArraste);
		el.addEventListener("click", abrirFicha);
	}
}

export function registrarHelpers() {
	Handlebars.registerHelper("t20tTibares", (valor) => formatarTibares(valor ?? 0));
}
