# Gerador de Tesouros T20

Módulo para **Foundry VTT v13** e o sistema **Tormenta20 (1.5.x)** que rola tesouros por Nível de Desafio seguindo o capítulo 8 do livro básico (p. 327 em diante) e sorteia os itens a partir de **todos os compêndios de itens instalados** — os do sistema, os de módulos como o [Suplementos de Arton](https://github.com/mobguilherme/Suplementos-de-Arton) e qualquer item customizado criado depois, sem precisar configurar nada.

O resultado aparece no chat **apenas para o mestre**, com cada item pronto para ser arrastado para uma ficha ou baú.

## Como usar

Abra o gerador por um destes caminhos (só aparecem para o mestre):

- botão **💎 Gerar Tesouro** no topo da aba **Itens** ou **Tabelas**;
- ícone de gema nos controles de token, à esquerda do mapa;
- macro: `game.modules.get("t20-gerador-tesouros").api.abrir()`.

**Tesouro por ND** — escolha o ND (1/4 a 20), o tesouro da criatura (Padrão, Metade, Dobro) e quantas rolagens fazer (uma por criatura ou uma pelo ND do combate). O módulo rola as colunas Dinheiro e Itens da Tabela 8-1 e resolve tudo em cascata:

| Resultado | O que acontece |
| --- | --- |
| Moedas | Rola a fórmula (TC, T$ ou TO). *Metade* divide por 2. |
| Riquezas | Rola na Tabela 8-2 (com +20% quando a célula tem `+%`) e cria um item do tipo *tesouro* com o valor rolado. |
| Diverso | Sorteia um item diverso (Tabela 8-3). |
| Equipamento | 1d6 define arma, armadura/escudo ou esotérico; sorteia o item. |
| Superior | Sorteia a base e rola as melhorias na Tabela 8-5, respeitando pré-requisitos (Atroz→Cruel, Pungente→Certeira, Sob medida→Ajustada), Harmonizada e Mira telescópica, e o material especial (1d6, sem madeira Tollon em armaduras). |
| Poções | Sorteia na Tabela 8-12, com +20% quando há `+%`. |
| Mágico | 1d6 define arma, armadura/escudo ou acessório. Armas e armaduras recebem 1, 2 ou 3 encantos (8-8 / 8-10), com encantos que contam como dois e "item específico"; acessórios vêm das Tabelas 8-13 a 8-15. |
| `2D` | Gera duas opções e mostra "Escolha um" no chat. |

**Rolagem direta** — rola uma categoria específica (ex.: "Arma mágica maior", "Riqueza média", "Superior (3 melhorias)") quantas vezes quiser.

### No chat

- Cada linha mostra ícone, nome, categoria, preço e o compêndio de origem.
- **Arraste** a linha para uma ficha de personagem, NPC ou baú. **Clique** para abrir a ficha do item.
- Itens sem modificação apontam direto para o compêndio. Itens **superiores, mágicos, riquezas e moedas** são criados na pasta **Tesouros Gerados** da aba Itens, já com `melhoria1..4`, `material` e `encanto1..3` preenchidos, efeitos ativos das melhorias aplicados (como a ficha do sistema faz), nome e preço ajustados.
- O bloco **Rolagens** mostra cada d% rolado, para conferência.
- O botão **Limpar gerados** apaga essa pasta quando ela ficar cheia (itens já arrastados para fichas não são afetados).

## Itens de compêndios customizados

A cada rolagem o módulo relê o índice de todos os compêndios de Itens ativos (e, opcionalmente, os itens do mundo), então itens novos entram no sorteio automaticamente.

1. **Itens das tabelas do livro** são reconhecidos pelo nome e usam o peso exato da tabela (ex.: Bálsamo restaurador 15%).
2. **Itens customizados** são classificados por tipo do sistema (`arma`, `equipamento` + `system.tipo`, `consumivel`, `tesouro`), preço, melhorias/encantos já preenchidos e nome das pastas do compêndio (ex.: *Itens Mágicos / Acessórios / Média*). Cada um recebe o peso médio de um item da tabela da categoria — o multiplicador nas configurações aumenta ou reduz essa chance.
3. **Ignorados por padrão:** artefatos e itens de avatares, alimentos, materiais, armas naturais, itens sem preço e itens do sistema fora das tabelas (veículos, itens de origem…).

Abra **Configurações → Gerador de Tesouros T20 → Abrir catálogo** (ou o botão no gerador) para:

- ligar/desligar compêndios inteiros;
- ver a categoria e o peso de cada item e o motivo da classificação;
- **corrigir a categoria** de qualquer item, ou marcá-lo como "Nunca sortear" — funciona também para itens de compêndios bloqueados.

Autores de módulos também podem fixar a categoria no próprio item: `flags["t20-gerador-tesouros"].categoria` com um destes valores: `diverso`, `arma`, `armadura`, `esoterico`, `pocao`, `arma-especifica`, `armadura-especifica`, `acessorio-menor`, `acessorio-medio`, `acessorio-maior` ou `excluir`.

## Configurações

| Configuração | Padrão |
| --- | --- |
| Incluir itens do mundo | sim |
| Incluir extras do sistema | não |
| Alimentos como itens diversos | não |
| Peso de itens customizados | 1 |
| Criar item para moedas | sim |
| Sempre criar cópias no mundo | não |
| Pasta dos itens gerados | Tesouros Gerados |
| Mostrar rolagens no chat | sim |

## API para macros

```js
const api = game.modules.get("t20-gerador-tesouros").api;

await api.gerar({ nd: "7", tesouro: "padrao", vezes: 3 });
await api.gerar({ nd: "12", tesouro: "dobro", dinheiro: false });
await api.rolarDireto("arma-magica-maior", 2);
api.tiposDiretos();
const dados = await api.gerar({ nd: "5" }, { chat: false });
await api.limparGerados();
```

## Instalação

No Foundry: **Add-on Modules → Install Module** e cole o manifesto:

```
https://github.com/fernandowrpg/t20-gerador-tesouros/releases/latest/download/module.json
```

## Publicar no GitHub (manual)

1. Crie o repositório `t20-gerador-tesouros` no GitHub e envie este código para a branch `main`.
2. Gere o pacote com o seu usuário (requer Node 22+). Isso também corrige as URLs do `module.json`:

   ```bash
   node tools/build.mjs --repo fernandowrpg/t20-gerador-tesouros
   ```

3. Faça commit do `module.json` atualizado e envie.
4. No GitHub, crie uma **Release** com a tag `v1.0.0` (mesma versão do `module.json`) e anexe os dois arquivos de `dist/`: `module.json` e `t20-gerador-tesouros.zip`.
5. Use o manifesto `https://github.com/fernandowrpg/t20-gerador-tesouros/releases/latest/download/module.json` no Foundry.

Para versões seguintes, aumente `version` no `module.json`, rode o build de novo e crie uma release com a tag correspondente (`v1.0.1`, …).

**Opcional:** o workflow `.github/workflows/release.yml` faz os passos 2 e 4 sozinho — basta publicar uma release com a tag da versão que o GitHub Actions anexa o `module.json` e o zip.

## Compatibilidade

- Foundry VTT 13 (verificado em 13.351)
- Tormenta20 1.5.x (verificado em 1.5.015)

Módulo não oficial. Tormenta20 é marca da Jambô Editora.
