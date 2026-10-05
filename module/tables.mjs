export const ND_LIST = ["1/4", "1/2", ...Array.from({ length: 20 }, (_, i) => String(i + 1))];

const nada = null;
const moedas = (formula, unidade) => ({ tipo: "moedas", formula, unidade });
const riqueza = (nivel, qtd = "1", bonus = 0) => ({ tipo: "riqueza", nivel, qtd, bonus });
const diverso = () => ({ cat: "diverso" });
const equipamento = (dois = false) => ({ cat: "equipamento", dois });
const pocao = (qtd = "1", bonus = 0) => ({ cat: "pocao", qtd, bonus });
const superior = (melhorias, dois = false) => ({ cat: "superior", melhorias, dois });
const magico = (nivel, dois = false) => ({ cat: "magico", nivel, dois });

export const TABELA_8_1 = {
	"1/4": {
		dinheiro: [[30, nada], [70, moedas("1d6*10", "TC")], [95, moedas("1d4*100", "TC")], [100, moedas("1d6*10", "T$")]],
		itens: [[50, nada], [75, diverso()], [100, equipamento()]]
	},
	"1/2": {
		dinheiro: [[25, nada], [70, moedas("2d6*10", "TC")], [95, moedas("2d8*10", "T$")], [100, moedas("1d4*100", "T$")]],
		itens: [[45, nada], [70, diverso()], [100, equipamento()]]
	},
	1: {
		dinheiro: [[20, nada], [70, moedas("3d8*10", "T$")], [95, moedas("4d12*10", "T$")], [100, riqueza("menor")]],
		itens: [[40, nada], [65, diverso()], [90, equipamento()], [100, pocao()]]
	},
	2: {
		dinheiro: [[15, nada], [55, moedas("3d10*10", "T$")], [85, moedas("2d4*100", "T$")], [95, moedas("(2d6+1)*100", "T$")], [100, riqueza("menor")]],
		itens: [[30, nada], [40, diverso()], [70, equipamento()], [90, pocao()], [100, superior(1)]]
	},
	3: {
		dinheiro: [[10, nada], [20, moedas("4d12*10", "T$")], [60, moedas("1d4*100", "T$")], [90, moedas("1d8*10", "TO")], [100, riqueza("menor", "1d3")]],
		itens: [[25, nada], [35, diverso()], [60, equipamento()], [85, pocao()], [100, superior(1)]]
	},
	4: {
		dinheiro: [[10, nada], [50, moedas("1d6*100", "T$")], [80, moedas("1d12*100", "T$")], [90, riqueza("menor", "1", 20)], [100, riqueza("menor", "1d3", 20)]],
		itens: [[20, nada], [30, diverso()], [55, equipamento(true)], [80, pocao("1", 20)], [100, superior(1, true)]]
	},
	5: {
		dinheiro: [[15, nada], [65, moedas("1d8*100", "T$")], [95, moedas("3d4*10", "TO")], [100, riqueza("media")]],
		itens: [[20, nada], [70, pocao()], [90, superior(1)], [100, superior(2)]]
	},
	6: {
		dinheiro: [[15, nada], [60, moedas("2d6*100", "T$")], [90, moedas("2d10*100", "T$")], [100, riqueza("menor", "1d3+1")]],
		itens: [[20, nada], [65, pocao("1", 20)], [95, superior(1)], [100, superior(2, true)]]
	},
	7: {
		dinheiro: [[10, nada], [60, moedas("2d8*100", "T$")], [90, moedas("2d12*10", "TO")], [100, riqueza("menor", "1d4+1")]],
		itens: [[20, nada], [60, pocao("1d3")], [90, superior(2)], [100, superior(3)]]
	},
	8: {
		dinheiro: [[10, nada], [55, moedas("2d10*100", "T$")], [95, riqueza("menor", "1d4+1")], [100, riqueza("media", "1", 20)]],
		itens: [[20, nada], [75, pocao("1d3")], [95, superior(2)], [100, superior(3, true)]]
	},
	9: {
		dinheiro: [[10, nada], [35, riqueza("media")], [85, moedas("4d6*100", "T$")], [100, riqueza("media", "1d3")]],
		itens: [[20, nada], [70, pocao("1", 20)], [95, superior(3)], [100, magico("menor")]]
	},
	10: {
		dinheiro: [[10, nada], [30, moedas("4d6*100", "T$")], [85, moedas("4d10*10", "TO")], [100, riqueza("media", "1d3+1")]],
		itens: [[50, nada], [75, pocao("1d3+1")], [90, superior(3)], [100, magico("menor")]]
	},
	11: {
		dinheiro: [[10, nada], [45, moedas("2d4*1000", "T$")], [85, riqueza("media", "1d3")], [100, moedas("2d6*100", "TO")]],
		itens: [[45, nada], [70, pocao("1d4+1")], [90, superior(3)], [100, magico("menor", true)]]
	},
	12: {
		dinheiro: [[10, nada], [45, riqueza("media", "1", 20)], [80, moedas("2d6*1000", "T$")], [100, riqueza("media", "1d4+1")]],
		itens: [[45, nada], [70, pocao("1d3+1", 20)], [85, superior(4)], [100, magico("menor")]]
	},
	13: {
		dinheiro: [[10, nada], [45, moedas("4d4*1000", "T$")], [80, riqueza("media", "1d3+1")], [100, moedas("4d6*100", "TO")]],
		itens: [[40, nada], [65, pocao("1d4+1", 20)], [95, superior(4)], [100, magico("medio")]]
	},
	14: {
		dinheiro: [[10, nada], [45, riqueza("media", "1d3+1")], [80, moedas("3d6*1000", "T$")], [100, riqueza("maior")]],
		itens: [[40, nada], [65, pocao("1d4+1", 20)], [90, superior(4)], [100, magico("medio")]]
	},
	15: {
		dinheiro: [[10, nada], [45, riqueza("media", "1", 20)], [80, moedas("2d10*1000", "T$")], [100, moedas("1d4*1000", "TO")]],
		itens: [[35, nada], [45, pocao("1d6+1")], [85, superior(4, true)], [100, magico("medio")]]
	},
	16: {
		dinheiro: [[10, nada], [40, moedas("3d6*1000", "T$")], [75, moedas("3d10*100", "TO")], [100, riqueza("maior", "1d3")]],
		itens: [[35, nada], [45, pocao("1d6+1", 20)], [80, superior(4, true)], [100, magico("medio")]]
	},
	17: {
		dinheiro: [[5, nada], [40, moedas("4d6*1000", "T$")], [75, riqueza("media", "1d3", 20)], [100, moedas("2d4*1000", "TO")]],
		itens: [[20, nada], [40, magico("menor")], [80, magico("medio")], [100, magico("maior")]]
	},
	18: {
		dinheiro: [[5, nada], [40, moedas("4d10*1000", "T$")], [75, riqueza("maior")], [100, riqueza("maior", "1d3+1")]],
		itens: [[15, nada], [40, magico("menor", true)], [70, magico("medio")], [100, magico("maior")]]
	},
	19: {
		dinheiro: [[5, nada], [40, moedas("4d12*1000", "T$")], [75, riqueza("maior", "1", 20)], [100, moedas("1d12*1000", "TO")]],
		itens: [[10, nada], [40, magico("menor", true)], [60, magico("medio", true)], [100, magico("maior")]]
	},
	20: {
		dinheiro: [[5, nada], [40, moedas("2d4*1000", "TO")], [75, riqueza("maior", "1d3")], [100, riqueza("maior", "1d3+1", 20)]],
		itens: [[5, nada], [40, magico("menor", true)], [50, magico("medio", true)], [100, magico("maior", true)]]
	}
};

export const TABELA_8_2 = [
	{ menor: [1, 25], formula: "4d4", exemplos: [["Ágata", 0.5, "gema"], ["Hematita", 0.5, "gema"], ["Barril de farinha", 5, "bens"], ["Gaiola com galinhas", 5, "bens"]] },
	{ menor: [26, 40], formula: "1d4*10", exemplos: [["Quartzo rosa", 0.5, "gema"], ["Topázio", 0.5, "gema"], ["Caixa de tabaco", 1, "bens"], ["Rolo de linho", 1, "bens"], ["Jarro de especiarias", 2, "bens"]] },
	{ menor: [41, 55], media: [1, 10], formula: "2d4*10", exemplos: [["Bracelete de ouro trabalhado", 0.5, "joia"], ["Estatueta de osso entalhado", 1, "arte"], ["Estatueta de marfim entalhado", 1, "arte"], ["Rolo de seda", 1, "bens"], ["Vaso de prata", 2, "arte"]] },
	{ menor: [56, 70], media: [11, 30], formula: "4d6*10", exemplos: [["Ametista", 0.5, "gema"], ["Pérola branca", 0.5, "gema"], ["Lingote de prata", 1, "bens"], ["Cálice de prata com lápis-lazúli", 1, "arte"], ["Tapeçaria de lã", 5, "arte"]] },
	{ menor: [71, 85], media: [31, 50], maior: [1, 5], formula: "1d6*100", exemplos: [["Alexandrita", 0.5, "gema"], ["Pérola negra", 0.5, "gema"], ["Espada cerimonial ornada", 1, "arte"], ["Pente de prata com pedras preciosas", 1, "joia"]] },
	{ menor: [86, 95], media: [51, 65], maior: [6, 15], formula: "2d6*100", exemplos: [["Pente em forma de dragão", 1, "joia"], ["Harpa de madeira exótica", 5, "arte"]] },
	{ menor: [96, 99], media: [66, 80], maior: [16, 25], formula: "2d8*100", exemplos: [["Opala negra", 0.5, "gema"], ["Tapa-olho com olho de safira", 0.5, "joia"], ["Luva bordada com gemas", 1, "joia"], ["Pingente de opala vermelha", 1, "joia"], ["Lingote de ouro", 2, "bens"], ["Pintura antiga", 2, "arte"]] },
	{ menor: [100, 100], media: [81, 90], maior: [26, 40], formula: "4d10*100", exemplos: [["Esmeralda verde", 0.5, "gema"], ["Pingente de safira", 0.5, "joia"], ["Caixinha de música de ouro", 1, "arte"], ["Tornozeleira com gemas", 1, "joia"], ["Manto de veludo e seda cravejado", 2, "arte"]] },
	{ media: [91, 95], maior: [41, 60], formula: "6d12*100", exemplos: [["Anel de prata e safira", 0.5, "joia"], ["Correntinha de pérolas rosas", 0.5, "joia"], ["Diamante branco", 0.5, "gema"], ["Ídolo de ouro maciço", 5, "arte"]] },
	{ media: [96, 99], maior: [61, 75], formula: "2d10*1000", exemplos: [["Anel de ouro e rubi", 0.5, "joia"], ["Diamante vermelho", 0.5, "gema"], ["Conjunto de taças de ouro com esmeraldas", 2, "arte"]] },
	{ media: [100, 100], maior: [76, 85], formula: "6d8*1000", exemplos: [["Coroa de ouro cravejada de gemas", 1, "coroa"], ["Baú de mitral com diamantes", 2, "bens"]] },
	{ maior: [86, 95], formula: "1d10*10000", exemplos: [["Arca repleta de lingotes e pedras preciosas", 20, "bens"]] },
	{ maior: [96, 100], formula: "4d12*10000", exemplos: [["Sala forrada de moedas", 0, "moedas"]] }
];

export const TABELA_8_3 = [
	[2, "Ácido"], [4, "Água benta"], [5, "Alaúde élfico"], [6, "Algemas"], [8, "Baga-de-fogo"],
	[23, "Bálsamo restaurador"], [24, "Bandana"], [25, "Bandoleira de poções"], [30, "Bomba"],
	[31, "Botas reforçadas"], [32, "Camisa bufante"], [33, "Capa esvoaçante"], [34, "Capa pesada"],
	[35, "Casaco longo"], [36, "Chapéu arcano"], [38, "Coleção de livros"], [40, "Cosmético"],
	[42, "Dente-de-dragão"], [43, "Enfeite de elmo"], [44, "Elixir do amor"], [46, "Equipamento de viagem"],
	[56, "Essência de mana"], [57, "Estojo de disfarces"], [58, "Farrapos de ermitão"], [59, "Flauta mística"],
	[66, "Fogo alquímico"], [67, "Gorro de ervas"], [69, "Líquen lilás"], [70, "Luneta"], [71, "Luva de pelica"],
	[73, "Maleta de medicamentos"], [74, "Manopla"], [75, "Manto eclesiástico"], [78, "Mochila de aventureiro"],
	[80, "Musgo púrpura"], [81, "Organizador de pergaminhos"], [83, "Ossos de monstro"], [85, "Pó de cristal"],
	[87, "Pó de giz"], [88, "Pó do desaparecimento"], [89, "Robe místico"], [91, "Saco de sal"],
	[92, "Sapatos de camurça"], [94, "Seixo de âmbar"], [95, "Sela"], [96, "Tabardo"], [97, "Traje da corte"],
	[99, "Terra de cemitério"], [100, "Veste de seda"]
];

export const TABELA_8_4 = {
	arma: [
		[3, "Adaga"], [5, "Alabarda"], [7, "Alfange"], [10, "Arco curto"], [13, "Arco longo"], [15, "Azagaia"],
		[16, "Balas"], [18, "Besta leve"], [20, "Besta pesada"], [23, "Bordão"], [24, "Chicote"], [27, "Cimitarra"],
		[30, "Clava"], [31, "Corrente de espinhos"], [33, "Espada bastarda"], [38, "Espada curta"], [43, "Espada longa"],
		[46, "Flechas"], [49, "Florete"], [51, "Foice"], [53, "Funda"], [55, "Gadanho"], [56, "Katana"], [59, "Lança"],
		[60, "Lança montada"], [63, "Maça"], [66, "Machadinha"], [67, "Machado anão"], [70, "Machado de batalha"],
		[73, "Machado de guerra"], [74, "Machado táurico"], [76, "Mangual"], [77, "Marreta"], [80, "Martelo de guerra"],
		[83, "Montante"], [84, "Mosquete"], [85, "Pedras"], [88, "Picareta"], [90, "Pique"], [92, "Pistola"],
		[93, "Rede"], [96, "Tacape"], [98, "Tridente"], [100, "Virotes"]
	],
	armadura: [
		[5, ["Armadura de couro", "Couro"]], [10, "Brunea"], [25, ["Armadura completa", "Completa"]], [30, "Cota de malha"],
		[45, "Couraça"], [55, "Couro batido"], [65, "Escudo leve"], [80, "Escudo pesado"], [85, "Gibão de peles"],
		[90, "Loriga segmentada"], [100, "Meia armadura"]
	],
	esoterico: [
		[10, "Bolsa de pó"], [25, "Cajado arcano"], [35, "Cetro elemental"], [42, "Costela de lich"], [50, "Dedo de ente"],
		[55, "Luva de ferro"], [65, "Medalhão de prata"], [75, ["Orbe cristalina", "Orbe cristalino"]], [85, "Tomo hermético"],
		[100, "Varinha arcana"]
	]
};

export const TABELA_8_5 = {
	arma: [
		[10, "atrocious", "Atroz", { implica: "cruel" }], [13, "golden", "Banhada a ouro"], [23, "accurate", "Certeira"],
		[26, "gems", "Cravejada de gemas"], [36, "cruel", "Cruel"], [39, "discreet", "Discreta"], [44, "balanced", "Equilibrada"],
		[48, "harmonized", "Harmonizada", { exigeOutra: true }], [53, "injection", "Injeção alquímica"], [55, "macabre", "Macabra"],
		[65, "massive", "Maciça"], [75, "specialmaterial", "Material especial"], [80, "scope", "Mira telescópica", { distancia: true }],
		[90, "precise", "Precisa"], [100, "pungent", "Pungente", { implica: "accurate" }]
	],
	armadura: [
		[15, "adjusted", "Ajustada"], [19, "golden", "Banhada a ouro"], [23, "gems", "Cravejada de gemas"], [28, "delicate", "Delicada"],
		[32, "discreet", "Discreta"], [37, "thorny", "Espinhos"], [40, "macabre", "Macabra"], [50, "specialmaterial", "Material especial"],
		[55, "polished", "Polida"], [80, "reinforced", "Reforçada"], [90, "sealed", "Selada"], [100, "undermeasure", "Sob medida", { implica: "adjusted" }]
	],
	esoterico: [
		[4, "golden", "Banhado a ouro"], [19, "channeler", "Canalizador"], [23, "gems", "Cravejado de gemas"], [27, "discreet", "Discreto"],
		[42, "energetic", "Energético"], [57, "harmonized", "Harmonizado"], [60, "macabre", "Macabro"], [69, "specialmaterial", "Material especial"],
		[85, "powerful", "Poderoso"], [100, "vigilant", "Vigilante"]
	]
};

export const ROTULOS_MELHORIA = Object.fromEntries(
	Object.values(TABELA_8_5).flatMap((t) => t.map(([, key, rotulo]) => [key, rotulo]))
);
ROTULOS_MELHORIA.cruel = "Cruel";
ROTULOS_MELHORIA.accurate = "Certeira";
ROTULOS_MELHORIA.adjusted = "Ajustada";

export const PRECO_MELHORIAS = [0, 300, 3000, 9000, 18000];

export const MATERIAIS = [
	["ruby-steel", "Aço-rubi"],
	["adamant", "Adamante"],
	["everlasting-ice", "Gelo eterno"],
	["dark-wood", "Madeira Tollon"],
	["red-matter", "Matéria vermelha"],
	["mithril", "Mitral"]
];

export const PRECO_MATERIAIS = {
	arma: [6000, 3000, 600, 1500, 1500, 1500],
	leve: [3000, 6000, 1500, null, 6000, 1500],
	pesada: [6000, 18000, 3000, null, 18000, 12000],
	escudo: [3000, 6000, 1500, 1500, 6000, 1500],
	esoterico: [6000, 3000, 3000, 1500, 3000, 3000]
};

export const PRECO_ENCANTOS = [0, 18000, 36000, 72000];

export const ESPECIFICO = "__especifico";

export const TABELA_8_8 = [
	[5, "keen", "Ameaçadora", "Duplica margem de ameaça"],
	[10, "bane", "Anticriatura", "Bônus contra tipo de criatura", { criatura: true }],
	[12, "throwable", "Arremesso", "Pode ser arremessada"],
	[14, "assassin", "Assassina", "Aumenta ataque furtivo"],
	[16, "seeking", "Caçadora", "Ignora camuflagem e cobertura leve"],
	[21, "frost", "Congelante", "+1d6 de dano de frio"],
	[23, "caster", "Conjuradora", "Pode guardar e lançar magias"],
	[28, "corrosive", "Corrosiva", "+1d6 de dano de ácido"],
	[30, "dancing", "Dançarina", "Ataca sozinha"],
	[34, "defending", "Defensora", "Defesa +2"],
	[36, "destructive", "Destruidora", "Bônus contra construtos"],
	[38, "lacerating", "Dilacerante", "+10 de dano em acertos críticos"],
	[40, "draining", "Drenante", "Crítico drena vítima"],
	[45, "shock", "Elétrica", "+1d6 de dano de eletricidade"],
	[46, "energy", "Energética", "Bônus em ataque", { duplo: true, substitui: "formidable" }],
	[48, "excruciating", "Excruciante", "Causa fraqueza"],
	[53, "flaming", "Flamejante", "+1d6 de dano de fogo"],
	[63, "formidable", "Formidável", "Ataque e dano +2"],
	[64, "lancinating", "Lancinante", "Causa crítico terrível", { duplo: true, substitui: "lacerating" }],
	[72, "magnificent", "Magnífica", "Ataque e dano +4", { duplo: true, substitui: "formidable" }],
	[74, "merciful", "Piedosa", "Dano não letal"],
	[76, "unholy", "Profana", "Bônus contra devotos do Bem"],
	[78, "holy", "Sagrada", "Bônus contra devotos do Mal"],
	[80, "bloodthirsty", "Sanguinária", "Causa sangramento"],
	[82, "thundering", "Trovejante", "Causa atordoamento"],
	[84, "sepulchral", "Tumular", "+1d8 de dano de trevas"],
	[88, "speed", "Veloz", "Fornece ataque extra"],
	[90, "poisonous", "Venenosa", "Causa envenenamento"],
	[100, ESPECIFICO, "Arma específica", ""]
];

export const TABELA_8_10 = [
	[6, "abascanth", "Abascanto", "Resistência contra magia"],
	[10, "blessed", "Abençoado", "Resistência contra trevas"],
	[12, "acrobatic", "Acrobático", "Bônus em Acrobacia"],
	[14, "winged", "Alado", "Deslocamento de voo 12m"],
	[16, "animateed", "Animado", "Escudo defende sozinho", { apenasEscudo: true }],
	[18, "frightful", "Assustador", "Causa efeito de medo"],
	[22, "caustic", "Cáustico", "Resistência contra ácido"],
	[32, "defending", "Defensor", "Defesa +2"],
	[34, "slick", "Escorregadio", "Bônus para escapar"],
	[36, "bashing", "Esmagador", "Escudo causa mais dano", { apenasEscudo: true }],
	[38, "ghostly", "Fantasmagórico", "Lança Manto de Sombras"],
	[40, "ortification", "Fortificado", "Chance de ignorar crítico"],
	[44, "frost", "Gélido", "Resistência contra frio"],
	[54, "guardian", "Guardião", "Defesa +4", { duplo: true, substitui: "defending" }],
	[56, "hypnotic", "Hipnótico", "Fascina inimigos"],
	[58, "illusory", "Ilusório", "Camufla-se como item comum"],
	[62, "incandescent", "Incandescente", "Resistência contra fogo"],
	[68, "invulnerable", "Invulnerável", "Redução de dano"],
	[72, "opaque", "Opaco", "Redução de energia"],
	[78, "protector", "Protetor", "Resistência +2"],
	[80, "reflecting", "Refletor", "Reflete magia"],
	[84, "lightning", "Relampejante", "Resistência contra eletricidade"],
	[86, "blinding", "Reluzente", "Causa efeito de cegueira"],
	[88, "shadow", "Sombrio", "Bônus em Furtividade"],
	[90, "zealous", "Zeloso", "Atrai ataques em aliados"],
	[100, ESPECIFICO, "Item específico", ""]
];

export const CRIATURAS_ANTICRIATURA = ["animal", "construto", "espírito", "monstro", "morto-vivo", "uma raça de humanoides"];

export const TABELA_8_9 = [
	[5, "Azagaia dos relâmpagos", 30000], [15, "Espada baronial", 30000], [25, "Lâmina da luz", 45000],
	[30, "Lança animalesca", 45000], [35, "Maça do terror", 45000], [40, "Florete fugaz", 50000],
	[45, "Cajado da destruição", 60000], [50, "Cajado da vida", 60000], [55, "Machado silvestre", 70000],
	[60, ["Martelo de Doherimm", "Martelo dos anões"], 70000], [67, "Arco do poder", 90000], [72, "Língua do deserto", 90000],
	[77, "Besta explosiva", 100000], [82, ["Punhal sszzaazita", "Punhal traiçoeiro"], 100000], [87, "Espada sortuda", 110000],
	[92, "Avalanche", 140000], [95, "Cajado do poder", 180000], [100, "Vingadora sagrada", 200000]
];

export const TABELA_8_11 = [
	[10, "Cota élfica", 30000], [20, "Couro de monstro", 36000], [25, "Escudo do conjurador", 45000],
	[32, "Loriga do centurião", 45000], [42, "Manto da noite", 45000], [49, "Couraça do comando", 45000],
	[59, "Baluarte anão", 50000], [66, "Escudo espinhoso", 50000], [76, "Escudo do leão", 50000],
	[83, "Carapaça demoníaca", 63000], [88, "Escudo do eclipse", 70000], [93, ["Escudo de Azgher", "Escudo do Deus-Sol"], 140000],
	[100, "Armadura da luz", 150000]
];

export const TABELA_8_12 = [
	[1, "Abençoar Alimentos", 30], [3, "Área Escorregadia", 30], [6, "Arma Mágica", 30], [7, "Compreensão", 30],
	[15, "Curar Ferimentos (2d8+2 PV)", 30], [18, "Disfarce Ilusório", 30], [20, "Escuridão", 30], [22, "Luz", 30],
	[24, "Névoa", 30], [26, "Primor Atlético", 30], [28, "Proteção Divina", 30], [30, "Resistência a Energia", 30],
	[32, "Sono", 30], [33, "Suporte Ambiental", 30], [34, "Tranca Arcana", 30], [35, "Visão Mística", 30],
	[36, "Vitalidade Fantasma", 30], [38, "Escudo da Fé (cena)", 120], [40, "Alterar Tamanho", 270],
	[42, "Aparência Perfeita", 270], [43, "Armamento da Natureza", 270], [49, "Bola de Fogo", 270],
	[51, "Camuflagem Ilusória", 270], [53, "Concentração de Combate (cena)", 270], [62, "Curar Ferimentos (4d8+4 PV)", 270],
	[66, "Físico Divino", 270], [68, "Mente Divina", 270], [70, "Metamorfose", 270], [75, "Purificação", 270],
	[77, "Velocidade", 270], [79, "Vestimenta da Fé", 270], [80, "Voz Divina", 270], [82, "Arma Mágica (+3)", 750],
	[88, "Curar Ferimentos (7d8+7 PV)", 1080], [89, "Físico Divino (3 atributos)", 1080], [92, "Invisibilidade (cena)", 1080],
	[96, "Bola de Fogo (10d6)", 1470], [100, "Curar Ferimentos (11d8+11 PV)", 3000]
];

export const TABELA_8_13 = [
	[2, "Anel do sustento", 3000], [7, "Bainha mágica", 3000], [12, "Corda da escalada", 3000],
	[14, "Ferraduras da velocidade", 3000], [19, "Garrafa da fumaça eterna", 3000], [24, "Gema da luminosidade", 3000],
	[29, "Manto élfico", 3000], [34, "Mochila de carga", 3000], [40, "Brincos da sagacidade", 4500],
	[46, "Luvas da delicadeza", 4500], [52, "Manoplas da força do ogro", 4500], [59, "Manto da resistência", 4500],
	[65, "Manto do fascínio", 4500], [71, "Pingente da sensatez", 4500], [77, "Torque do vigor", 4500],
	[82, "Chapéu do disfarce", 6000], [84, "Flauta fantasma", 6000], [89, "Lanterna da revelação", 6000],
	[96, "Anel da proteção", 9000], [98, "Anel do escudo mental", 9000], [100, "Pingente da saúde", 9000]
];

export const TABELA_8_14 = [
	[4, "Anel de telecinesia", 10500], [8, "Bola de cristal", 10500], [10, "Caveira maldita", 10500],
	[14, "Botas aladas", 15000], [18, "Braceletes de bronze", 16500], [24, "Anel da energia", 21000],
	[30, "Anel da vitalidade", 21000], [34, "Anel de invisibilidade", 21000], [38, "Braçadeiras do arqueiro", 21000],
	[42, ["Brincos de Marah", "Brincos da paz"], 21000], [46, "Faixas do pugilista", 21000], [50, "Manto da aranha", 21000],
	[54, "Vassoura voadora", 21000], [58, "Símbolo abençoado", 21000], [64, "Amuleto da robustez", 25500],
	[68, "Botas velozes", 25500], [74, "Cinto da força do gigante", 25500], [80, "Coroa majestosa", 25500],
	[86, "Estola da serenidade", 25500], [88, "Manto do morcego", 25500], [94, "Pulseiras da celeridade", 25500],
	[100, "Tiara da sapiência", 25500]
];

export const TABELA_8_15 = [
	[2, "Elmo do teletransporte", 30000], [4, "Gema da telepatia", 30000], [9, "Gema elemental", 30000],
	[15, "Manual da saúde corporal", 30000], [21, "Manual do bom exercício", 30000], [27, "Manual dos movimentos precisos", 30000],
	[34, ["Medalhão de Lena", "Medalhão da deusa da vida"], 30000], [40, "Tomo da compreensão", 30000],
	[46, "Tomo da liderança e influência", 30000], [52, "Tomo dos grandes pensamentos", 30000], [57, "Anel refletor", 51000],
	[60, "Cinto do campeão", 51000], [67, "Colar guardião", 51000], [72, "Estatueta animista", 51000],
	[77, "Anel da liberdade", 60000], [82, "Tapete voador", 60000], [87, "Braceletes de ouro", 64500],
	[89, "Espelho da oposição", 75000], [94, "Robe do arquimago", 90000], [96, "Orbe das tempestades", 97500],
	[98, "Anel da regeneração", 150000], [100, "Espelho do aprisionamento", 150000]
];

export const CATEGORIAS = {
	diverso: { rotulo: "Diverso", tabela: TABELA_8_3 },
	arma: { rotulo: "Arma", tabela: TABELA_8_4.arma },
	armadura: { rotulo: "Armadura/Escudo", tabela: TABELA_8_4.armadura },
	esoterico: { rotulo: "Esotérico", tabela: TABELA_8_4.esoterico },
	pocao: { rotulo: "Poção", tabela: TABELA_8_12, prefixosPocao: true },
	"arma-especifica": { rotulo: "Arma mágica específica", tabela: TABELA_8_9 },
	"armadura-especifica": { rotulo: "Armadura/Escudo mágico específico", tabela: TABELA_8_11 },
	"acessorio-menor": { rotulo: "Acessório mágico menor", tabela: TABELA_8_13 },
	"acessorio-medio": { rotulo: "Acessório mágico médio", tabela: TABELA_8_14 },
	"acessorio-maior": { rotulo: "Acessório mágico maior", tabela: TABELA_8_15 }
};

export const NIVEIS_MAGICOS = { menor: "Menor", medio: "Médio", maior: "Maior" };
export const NIVEIS_RIQUEZA = { menor: "Menor", media: "Média", maior: "Maior" };
export const ENCANTOS_POR_NIVEL = { menor: 1, medio: 2, maior: 3 };

export const ICONES_RIQUEZA = {
	gema: "systems/tormenta20/icons/itens/gerais/gemas-preciosas.webp",
	joia: "systems/tormenta20/icons/itens/gerais/joia-familia.webp",
	arte: "systems/tormenta20/icons/itens/gerais/mercadoria.webp",
	bens: "systems/tormenta20/icons/itens/gerais/mercadoria.webp",
	coroa: "systems/tormenta20/icons/itens/itens-magicos/coroa.webp",
	moedas: "systems/tormenta20/icons/itens/gerais/algibeira.webp"
};

export const ICONE_MOEDAS = "systems/tormenta20/icons/itens/gerais/algibeira.webp";

export const VALOR_EM_TIBARES = { TC: 0.1, "T$": 1, TO: 10 };
