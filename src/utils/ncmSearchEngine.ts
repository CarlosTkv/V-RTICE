import { NCMTaxData } from '../types';
import { NCM_DATABASE, NCM_CHAPTERS, getOrGenerateNCMData } from '../data/ncmDatabase';

/**
 * Remove acentos, diacríticos e pontuação para busca fonética e insensível a acentuação
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos (ex: á -> a, é -> e, ó -> o, ç -> c)
    .trim();
}

/**
 * Mapeamento abrangente de palavras-chave do português do Brasil para Capítulos da TIPI e Códigos NCM Representativos
 */
interface ProductKeywordMapping {
  keywords: string[];
  suggestedNCMs: {
    ncm: string;
    description: string;
    chapterCode: string;
  }[];
}

const PRODUCT_KEYWORD_MAPPINGS: ProductKeywordMapping[] = [
  // Cap. 01 & 02 & 03 & 04 & 05 - Animais, Carnes, Peixes, Laticínios
  {
    keywords: ['carne', 'frango', 'bovino', 'suino', 'picanha', 'alcatra', 'peru', 'carne moida', 'linguica', 'salsicha', 'presunto'],
    suggestedNCMs: [
      { ncm: '0201.30.00', description: 'Carnes desossadas de animais da espécie bovina, frescas ou refrigeradas (Cesta Básica)', chapterCode: '02' },
      { ncm: '0207.12.00', description: 'Carnes e miudezas comestíveis de frango, congeladas (Cesta Básica)', chapterCode: '02' },
      { ncm: '0203.29.00', description: 'Outras carnes de animais da espécie suína, congeladas', chapterCode: '02' },
      { ncm: '1601.00.00', description: 'Chouriços, linguiças, salsichas e produtos semelhantes de carne', chapterCode: '16' },
    ],
  },
  {
    keywords: ['peixe', 'salmao', 'tilapia', 'camarao', 'bacalhau', 'lula', 'polvo', 'atum', 'sardinha'],
    suggestedNCMs: [
      { ncm: '0302.14.00', description: 'Salmão-do-atlântico e salmão-do-danúbio, frescos ou refrigerados', chapterCode: '03' },
      { ncm: '0304.61.00', description: 'Filés de tilápia frescos ou refrigerados', chapterCode: '03' },
      { ncm: '0306.17.10', description: 'Camarões congelados para uso alimentar', chapterCode: '03' },
      { ncm: '1604.14.10', description: 'Atum conservado em óleo vegetal em lata', chapterCode: '16' },
    ],
  },
  {
    keywords: ['leite', 'queijo', 'manteiga', 'iogurte', 'requeijao', 'ovo', 'mel', 'laticinio'],
    suggestedNCMs: [
      { ncm: '0401.20.10', description: 'Leite UHT (Longa Vida) integral em embalagem Tetra Pak (Cesta Básica)', chapterCode: '04' },
      { ncm: '0406.10.10', description: 'Queijo Mozarela (Mussarela) em peças ou fatiado', chapterCode: '04' },
      { ncm: '0405.10.00', description: 'Manteiga de leite em embalagens para consumo', chapterCode: '04' },
      { ncm: '0407.21.00', description: 'Ovos frescos de galinha em casca', chapterCode: '04' },
      { ncm: '0409.00.00', description: 'Mel natural de abelha', chapterCode: '04' },
    ],
  },
  {
    keywords: ['animal', 'bovinos vivos', 'cavalo', 'equino', 'suino vivo', 'ave viva', 'coelho'],
    suggestedNCMs: [
      { ncm: '0102.21.00', description: 'Reprodutores de raça pura da espécie bovina', chapterCode: '01' },
      { ncm: '0101.21.00', description: 'Cavalos reprodutores de raça pura', chapterCode: '01' },
      { ncm: '0105.11.10', description: 'Galinhas de reprodução das espécies domésticas', chapterCode: '01' },
    ],
  },

  // Cap. 06 a 14 - Vegetais, Frutas, Café, Cereais, Moagem, Soja
  {
    keywords: ['cafe', 'cha', 'mate', 'pimenta', 'especiaria', 'cravo', 'canela'],
    suggestedNCMs: [
      { ncm: '0901.21.00', description: 'Café torrado, não descafeinado, moído ou em grão (Cesta Básica)', chapterCode: '09' },
      { ncm: '0902.30.00', description: 'Chá preto (fermentado) e chá parcial fermentado em embalagens', chapterCode: '09' },
      { ncm: '0904.11.00', description: 'Pimenta do gênero Piper não triturada nem pulverizada', chapterCode: '09' },
    ],
  },
  {
    keywords: ['arroz', 'milho', 'trigo', 'aveia', 'cevada', 'cereal', 'sorgo'],
    suggestedNCMs: [
      { ncm: '1006.30.21', description: 'Arroz polido ou brunido em grãos beneficiados de tipo longo fino (Cesta Básica)', chapterCode: '10' },
      { ncm: '1005.90.10', description: 'Milho em grão, exceto para semeadura', chapterCode: '10' },
      { ncm: '1001.99.00', description: 'Trigo mole e mistura de trigo com centeio em grãos', chapterCode: '10' },
    ],
  },
  {
    keywords: ['farinha', 'fuba', 'amido', 'fecula', 'malte', 'trigo farinha', 'mandioca farinha'],
    suggestedNCMs: [
      { ncm: '1101.00.10', description: 'Farinha de trigo para panificação (Cesta Básica)', chapterCode: '11' },
      { ncm: '1102.20.00', description: 'Farinha de milho (Fubá)', chapterCode: '11' },
      { ncm: '1108.12.00', description: 'Amido de milho (Maizena)', chapterCode: '11' },
      { ncm: '1106.20.00', description: 'Farinha e sêmola de féculas de mandioca', chapterCode: '11' },
    ],
  },
  {
    keywords: ['soja', 'girassol', 'amendoim', 'linho', 'gergelim', 'grao de soja', 'semente oleaginosa'],
    suggestedNCMs: [
      { ncm: '1201.90.00', description: 'Grãos de soja, mesmo triturados, exceto para semeadura', chapterCode: '12' },
      { ncm: '1202.42.00', description: 'Amendoins descascados, mesmo triturados', chapterCode: '12' },
      { ncm: '1206.00.90', description: 'Sementes de girassol, mesmo trituradas', chapterCode: '12' },
    ],
  },
  {
    keywords: ['fruta', 'maca', 'banana', 'laranja', 'uva', 'manga', 'mamao', 'morango', 'abacaxi', 'castanha', 'nozes'],
    suggestedNCMs: [
      { ncm: '0803.90.00', description: 'Bananas frescas ou secas (Cesta Básica)', chapterCode: '08' },
      { ncm: '0808.10.00', description: 'Maçãs frescas', chapterCode: '08' },
      { ncm: '0805.10.00', description: 'Laranjas frescas ou secas', chapterCode: '08' },
      { ncm: '0801.32.00', description: 'Castanha-de-caju sem casca', chapterCode: '08' },
    ],
  },
  {
    keywords: ['batata', 'tomate', 'cebola', 'alho', 'cenoura', 'feijao', 'hortalica', 'legume'],
    suggestedNCMs: [
      { ncm: '0713.33.99', description: 'Feijão comum preto ou carioca em grãos (Cesta Básica)', chapterCode: '07' },
      { ncm: '0701.90.00', description: 'Batatas frescas ou refrigeradas', chapterCode: '07' },
      { ncm: '0702.00.00', description: 'Tomates frescos ou refrigerados', chapterCode: '07' },
      { ncm: '0703.10.19', description: 'Cebolas frescas ou refrigeradas', chapterCode: '07' },
      { ncm: '0703.20.90', description: 'Alho fresco ou refrigerado', chapterCode: '07' },
    ],
  },
  {
    keywords: ['planta viva', 'flor', 'rosa', 'orquidea', 'muda', 'bulbo', 'folhagem'],
    suggestedNCMs: [
      { ncm: '0602.90.90', description: 'Outras plantas vivas, mudas de árvores e arbustos', chapterCode: '06' },
      { ncm: '0603.11.00', description: 'Rosas frescas cortadas para buquês ou ornamentação', chapterCode: '06' },
    ],
  },

  // Cap. 15 a 24 - Óleos, Alimentos Processados, Bebidas, Ração, Tabaco
  {
    keywords: ['oleo', 'soja oleo', 'margarina', 'gordura', 'azeite', 'oleo vegetal', 'girassol oleo'],
    suggestedNCMs: [
      { ncm: '1507.90.11', description: 'Óleo de soja refinado em embalagens para consumo humano', chapterCode: '15' },
      { ncm: '1509.10.00', description: 'Azeite de oliva virgem extra de primeira prensagem', chapterCode: '15' },
      { ncm: '1517.10.00', description: 'Margarina, exceto a margarina líquida, pronta para consumo', chapterCode: '15' },
    ],
  },
  {
    keywords: ['acucar', 'adocante', 'bala', 'doce', 'confeito', 'chiclete'],
    suggestedNCMs: [
      { ncm: '1701.99.00', description: 'Açúcar de cana refinado em embalagens para consumo (Cesta Básica)', chapterCode: '17' },
      { ncm: '1704.90.20', description: 'Caramelos, confritos, drops e pastilhas de confeitaria', chapterCode: '17' },
    ],
  },
  {
    keywords: ['chocolate', 'cacau', 'achocolatado', 'bomboes', 'trufa'],
    suggestedNCMs: [
      { ncm: '1806.31.10', description: 'Chocolates em barras ou tabletes recheados', chapterCode: '18' },
      { ncm: '1806.90.00', description: 'Achocolatados em pó para preparação de bebidas', chapterCode: '18' },
    ],
  },
  {
    keywords: ['pao', 'biscoito', 'bolacha', 'macarrao', 'massa', 'torrada', 'padaria'],
    suggestedNCMs: [
      { ncm: '1902.19.00', description: 'Massas alimentícias não cozidas, nem recheadas (Macarrão Cesta Básica)', chapterCode: '19' },
      { ncm: '1905.90.90', description: 'Produtos de padaria, pastelaria ou da indústria de biscoitos (Pães de Forma)', chapterCode: '19' },
      { ncm: '1905.31.00', description: 'Biscoitos e bolachas adicionados de edulcorantes', chapterCode: '19' },
    ],
  },
  {
    keywords: ['conserva', 'molho de tomate', 'extrato de tomate', 'ketchup', 'geleiadefruta', 'polpa de fruta', 'suco de laranja'],
    suggestedNCMs: [
      { ncm: '2002.90.90', description: 'Extratos e molhos de tomate preparados', chapterCode: '20' },
      { ncm: '2009.12.00', description: 'Suco de laranja natural não congelado', chapterCode: '20' },
      { ncm: '2007.99.90', description: 'Geleias e doces de frutas preparados', chapterCode: '20' },
    ],
  },
  {
    keywords: ['tempero', 'maionese', 'mostarda', 'fermento', 'caldo de galinha', 'suplemento alimentar'],
    suggestedNCMs: [
      { ncm: '2103.90.21', description: 'Maionese em bisnagas ou potes', chapterCode: '21' },
      { ncm: '2103.90.90', description: 'Temperos e condimentos mistos preparados', chapterCode: '21' },
      { ncm: '2106.90.30', description: 'Suplementos alimentares contendo vitaminas ou minerais', chapterCode: '21' },
    ],
  },
  {
    keywords: ['refrigerante', 'cerveja', 'vinho', 'agua mineral', 'suco', 'bebida', 'chopp', 'vodka', 'whisky', 'cachaca', 'energetico', 'gin'],
    suggestedNCMs: [
      { ncm: '2202.10.00', description: 'Águas e refrigerantes com adição de açúcar ou edulcorantes (Refrigerante PET / Lata)', chapterCode: '22' },
      { ncm: '2203.00.00', description: 'Cervejas de malte em latas, garrafas ou barril (Pilsen, Lager, Craft)', chapterCode: '22' },
      { ncm: '2204.21.00', description: 'Vinhos de uvas frescas em garrafas', chapterCode: '22' },
      { ncm: '2201.10.00', description: 'Águas minerais naturais e águas gaseificadas sem adição de açúcar', chapterCode: '22' },
      { ncm: '2208.40.00', description: 'Cachaça e aguardentes de cana-de-açúcar', chapterCode: '22' },
    ],
  },
  {
    keywords: ['racao', 'farelo de soja', 'racao cao', 'racao gato', 'pet food', 'petshop'],
    suggestedNCMs: [
      { ncm: '2309.10.00', description: 'Alimentos para cães e gatos em embalagens de venda a retalho (Pet Food)', chapterCode: '23' },
      { ncm: '2304.00.90', description: 'Farelo e resíduos sólidos da extração do óleo de soja', chapterCode: '23' },
    ],
  },
  {
    keywords: ['cigarro', 'charuto', 'tabaco', 'fumo', 'narguile'],
    suggestedNCMs: [
      { ncm: '2402.20.00', description: 'Cigarros contendo tabaco em maços ou caixas', chapterCode: '24' },
      { ncm: '2403.99.90', description: 'Outros tabacos para cachimbo ou narguilé', chapterCode: '24' },
    ],
  },

  // Cap. 25 a 27 - Cimento, Minérios, Combustíveis, Gasolina, Diesel
  {
    keywords: ['cimento', 'gesso', 'cal', 'pedra', 'sal', 'areia', 'brita'],
    suggestedNCMs: [
      { ncm: '2523.29.10', description: 'Cimento Portland cinza comum para construção civil', chapterCode: '25' },
      { ncm: '2520.10.00', description: 'Gesso e gipsita em pedra ou pó para construção civil', chapterCode: '25' },
      { ncm: '2501.00.20', description: 'Sal refinado para alimentação humana', chapterCode: '25' },
    ],
  },
  {
    keywords: ['minerio', 'minerio de ferro', 'bauxita', 'cobre minerio', 'ouro minerio'],
    suggestedNCMs: [
      { ncm: '2601.11.00', description: 'Minérios de ferro não aglomerados e seus concentrados', chapterCode: '26' },
      { ncm: '2606.00.00', description: 'Minérios de alumínio e seus concentrados (Bauxita)', chapterCode: '26' },
    ],
  },
  {
    keywords: ['gasolina', 'diesel', 'etanol', 'glp', 'gas de cozinha', 'gas natural', 'lubrificante', 'querosene', 'oleo lubrificante', 'graxa'],
    suggestedNCMs: [
      { ncm: '2710.12.59', description: 'Gasolina A e C para veículos automotores (Tributação Monofásica de ICMS e PIS/COFINS)', chapterCode: '27' },
      { ncm: '2710.19.21', description: 'Óleo Diesel S10 e S500 para uso automotivo e agrícola', chapterCode: '27' },
      { ncm: '2711.19.10', description: 'Gás Liquefeito de Petróleo (GLP - Gás de Cozinha em botijões P13)', chapterCode: '27' },
      { ncm: '2710.19.32', description: 'Óleos lubrificantes para motores de veículos automotores', chapterCode: '27' },
    ],
  },

  // Cap. 28 a 38 - Químicos, Medicamentos, Fertilizantes, Cosméticos, Tintas, Sabões, Defensivos
  {
    keywords: ['cloro', 'soda caustica', 'acido sulfurico', 'amonia', 'quimico inorganico'],
    suggestedNCMs: [
      { ncm: '2815.11.00', description: 'Hidróxido de sódio (Soda cáustica) sólido', chapterCode: '28' },
      { ncm: '2807.00.10', description: 'Ácido sulfúrico de grau industrial', chapterCode: '28' },
    ],
  },
  {
    keywords: ['remedio', 'medicamento', 'farmaco', 'vacina', 'antibiotico', 'vitamina', 'xarope', 'dipirona', 'paracetamol', 'ibuprofeno'],
    suggestedNCMs: [
      { ncm: '3004.90.99', description: 'Medicamentos constituídos por produtos misturados ou preparados para fins terapêuticos (Regra Geral)', chapterCode: '30' },
      { ncm: '3004.20.99', description: 'Medicamentos contendo outros antibióticos para uso humano', chapterCode: '30' },
      { ncm: '3002.20.29', description: 'Vacinas para medicina humana', chapterCode: '30' },
      { ncm: '3004.50.00', description: 'Medicamentos contendo vitaminas ou outros produtos profiláticos', chapterCode: '30' },
    ],
  },
  {
    keywords: ['adubo', 'fertilizante', 'ureia', 'npk', 'superfosfato', 'cloreto de potassio'],
    suggestedNCMs: [
      { ncm: '3102.10.10', description: 'Ureia agrícola contendo mais de 45% de nitrogênio', chapterCode: '31' },
      { ncm: '3105.20.00', description: 'Adubos e fertilizantes minerais contendo os três elementos: nitrogênio, fósforo e potássio (NPK)', chapterCode: '31' },
    ],
  },
  {
    keywords: ['tinta', 'verniz', 'corante', 'pigmento', 'tinta suvinil', 'tinta coral'],
    suggestedNCMs: [
      { ncm: '3209.10.00', description: 'Tintas e vernizes à base de polímeros acrílicos ou vinílicos dispersos em meio aquoso (Tinta de Parede)', chapterCode: '32' },
      { ncm: '3208.20.19', description: 'Tintas de fundo e anticorrosivas à base de polímeros sintéticos', chapterCode: '32' },
    ],
  },
  {
    keywords: ['perfume', 'shampoo', 'xampu', 'creme', 'desodorante', 'cosmetico', 'maquiagem', 'batom', 'sabonete', 'protetor solar'],
    suggestedNCMs: [
      { ncm: '3303.00.10', description: 'Perfumes (extratos) e águas-de-colônia para uso pessoal', chapterCode: '33' },
      { ncm: '3305.10.00', description: 'Xampus (shampoos) para os cabelos', chapterCode: '33' },
      { ncm: '3307.20.10', description: 'Desodorantes corporais e antiperspirantes em aerossol', chapterCode: '33' },
      { ncm: '3401.11.90', description: 'Sabões de toucador em barras, pedaços ou formatos moldados', chapterCode: '34' },
      { ncm: '3304.99.10', description: 'Cremes de beleza e protetores solares', chapterCode: '33' },
    ],
  },
  {
    keywords: ['sabao', 'sabao em po', 'detergente', 'amaciante', 'desinfetante', 'cera', 'limpeza'],
    suggestedNCMs: [
      { ncm: '3402.50.00', description: 'Detergentes sintéticos e sabão em pó acondicionados para venda a retalho', chapterCode: '34' },
      { ncm: '3402.90.39', description: 'Amaciantes e preparações para amaciar roupas', chapterCode: '34' },
    ],
  },
  {
    keywords: ['inseticida', 'herbicida', 'fungicida', 'defensivo', 'defensivos agricolas', 'raticida', 'fluido de freio'],
    suggestedNCMs: [
      { ncm: '3808.91.99', description: 'Insecticidas para uso agrícola e doméstico', chapterCode: '38' },
      { ncm: '3808.93.29', description: 'Herbicidas à base de glifosato para agricultura', chapterCode: '38' },
      { ncm: '3819.00.00', description: 'Fluidos para freios hidráulicos e outros líquidos preparados para transmissões', chapterCode: '38' },
    ],
  },

  // Cap. 39 a 40 - Plásticos e Borrachas
  {
    keywords: ['plastico', 'embalagem', 'sacola', 'copo plastico', 'garrafa pet', 'tubo pvc', 'caixa plastica', 'filme pvc'],
    suggestedNCMs: [
      { ncm: '3923.21.00', description: 'Sacos, bolsas e cartuchos de polímeros de etileno (Sacolas plásticas)', chapterCode: '39' },
      { ncm: '3924.10.00', description: 'Serviços de mesa e outros artigos de uso doméstico, de plásticos (Copos descartáveis)', chapterCode: '39' },
      { ncm: '3917.23.00', description: 'Tubos rígidos de polímeros de cloreto de vinila (Tubos de PVC)', chapterCode: '39' },
      { ncm: '3923.30.00', description: 'Garrafões, garrafas, frascos e artigos semelhantes de plástico (Garrafas PET)', chapterCode: '39' },
    ],
  },
  {
    keywords: ['borracha', 'pneu', 'pneus', 'correia', 'camara de ar', 'luva de borracha'],
    suggestedNCMs: [
      { ncm: '4011.10.00', description: 'Pneus novos de borracha dos tipos utilizados em automóveis de passageiros', chapterCode: '40' },
      { ncm: '4011.20.90', description: 'Pneus novos de borracha utilizados em tratores, ônibus ou caminhões', chapterCode: '40' },
      { ncm: '4010.31.00', description: 'Correias de transmissão trapezoidais de borracha vulcanizada', chapterCode: '40' },
    ],
  },

  // Cap. 41 a 49 - Couro, Madeira, Papel, Gráfica, Livros
  {
    keywords: ['couro', 'bolsa', 'carteira', 'mala', 'mochila', 'mala de viagem'],
    suggestedNCMs: [
      { ncm: '4202.21.00', description: 'Bolsas, mesmo com tiracolo ou sem alças, com a superfície exterior de couro natural', chapterCode: '42' },
      { ncm: '4202.31.00', description: 'Carteiras, porta-moedas e artigos de bolso de couro natural', chapterCode: '42' },
      { ncm: '4107.92.00', description: 'Couros e peles preparados de bovinos', chapterCode: '41' },
    ],
  },
  {
    keywords: ['madeira', 'mdf', 'compensado', 'viga', 'porta de madeira', 'palete'],
    suggestedNCMs: [
      { ncm: '4407.11.00', description: 'Madeira serrada ou lascada longitudinalmente de pínus', chapterCode: '44' },
      { ncm: '4411.14.00', description: 'Painéis de fibras de madeira de média densidade (MDF)', chapterCode: '44' },
      { ncm: '4418.20.00', description: 'Portas de madeira e seus caixilhos, alisares e soleiras', chapterCode: '44' },
    ],
  },
  {
    keywords: ['papel', 'cartao', 'caixa de papelao', 'caderno', 'livro', 'papel a4', 'papel higienico', 'guardanapo'],
    suggestedNCMs: [
      { ncm: '4819.10.00', description: 'Caixas de papel ou cartão, ondulados (Caixas de papelão para transporte)', chapterCode: '48' },
      { ncm: '4818.10.00', description: 'Papel higiênico em rolos', chapterCode: '48' },
      { ncm: '4802.56.10', description: 'Papel A4 recortado para impressão ou cópia', chapterCode: '48' },
      { ncm: '4820.20.00', description: 'Cadernos escolares e universitários', chapterCode: '48' },
      { ncm: '4901.99.00', description: 'Livros, brochuras e impressos semelhantes (Imunidade Tributária)', chapterCode: '49' },
    ],
  },

  // Cap. 50 a 67 - Têxteis, Vestuário, Calçados, Chapéus
  {
    keywords: ['camisa', 'camiseta', 'casaco', 'calca', 'jaqueta', 'vestuario', 'roupa', 'jeans', 'meia', 'vestido', 'cueca', 'calcinha', 'pijama', 'moletom'],
    suggestedNCMs: [
      { ncm: '6105.10.00', description: 'Camisas de malha de algodão de uso masculino ou infantil', chapterCode: '61' },
      { ncm: '6109.10.00', description: 'T-shirts, camisetas e camisetas interiores, de malha, de algodão', chapterCode: '61' },
      { ncm: '6203.42.00', description: 'Calças, jardineiras, bermudas e shorts, de algodão, de uso masculino (Jeans)', chapterCode: '62' },
      { ncm: '6115.95.00', description: 'Meias e artefatos semelhantes de malha de algodão', chapterCode: '61' },
    ],
  },
  {
    keywords: ['toalha', 'lencol', 'fronha', 'edredom', 'cortina', 'cama mesa e banho'],
    suggestedNCMs: [
      { ncm: '6302.60.00', description: 'Roupas de toucador ou de cozinha, de tecidos de felpa do tipo toalha, de algodão (Toalhas de Banho)', chapterCode: '63' },
      { ncm: '6302.21.00', description: 'Roupas de cama impressas, de algodão (Lençóis e Fronhas)', chapterCode: '63' },
    ],
  },
  {
    keywords: ['sapato', 'tenis', 'sapatenis', 'bota', 'sandalia', 'chinelo', 'calcado', 'sapatilha', 'chinelo havaianas'],
    suggestedNCMs: [
      { ncm: '6403.99.90', description: 'Calçados com sola exterior de borracha/plástico e parte superior de couro natural', chapterCode: '64' },
      { ncm: '6404.11.00', description: 'Calçados para esporte, tênis de corrida com sola de borracha e parte superior têxtil', chapterCode: '64' },
      { ncm: '6402.99.90', description: 'Chinelos e sandálias de borracha ou plástico para uso diário', chapterCode: '64' },
    ],
  },
  {
    keywords: ['bone', 'chapeu', 'capacete', 'guarda chuva', 'sombrinha'],
    suggestedNCMs: [
      { ncm: '6505.00.11', description: 'Bonés e artefatos semelhantes de malha de algodão', chapterCode: '65' },
      { ncm: '6601.91.10', description: 'Guarda-chuvas e sombrinhas com armação dobrável', chapterCode: '66' },
    ],
  },

  // Cap. 68 a 71 - Pedras, Cerâmica, Porcelanato, Vidro, Joias
  {
    keywords: ['tijolo', 'telha', 'piso ceramico', 'azulejo', 'porcelanato', 'louca sanitaria'],
    suggestedNCMs: [
      { ncm: '6907.21.00', description: 'Placas e ladrilhos de cerâmica para pavimentação ou revestimento (Porcelanato / Piso Cerâmico)', chapterCode: '69' },
      { ncm: '6904.10.00', description: 'Tijolos cerâmicos para construção civil', chapterCode: '69' },
      { ncm: '6905.10.00', description: 'Telhas cerâmicas para cobertura de imóveis', chapterCode: '69' },
      { ncm: '6910.10.00', description: 'Pias, lavatórios, colunas, banheiras e vasos sanitários de porcelana', chapterCode: '69' },
    ],
  },
  {
    keywords: ['vidro', 'espelho', 'garrafa de vidro', 'copo de vidro', 'parabrisa'],
    suggestedNCMs: [
      { ncm: '7007.11.00', description: 'Vidros temperados de dimensão e formato adequados para veículos', chapterCode: '70' },
      { ncm: '7010.90.21', description: 'Garrafas de vidro de capacidade superior a 0,33 l para refrigerantes e cervejas', chapterCode: '70' },
      { ncm: '7009.91.00', description: 'Espelhos de vidro não moldurados', chapterCode: '70' },
    ],
  },
  {
    keywords: ['joia', 'ouro', 'prata', 'alianca', 'anel', 'bijuteria', 'metal nobre'],
    suggestedNCMs: [
      { ncm: '7113.19.00', description: 'Artefatos de joalharia e suas partes, de outros metais nobres (Ouro 18K)', chapterCode: '71' },
      { ncm: '7117.19.00', description: 'Bijuterias de metais comuns, mesmo prateadas ou douradas', chapterCode: '71' },
    ],
  },

  // Cap. 72 a 83 - Ferro, Aço, Parafusos, Cobre, Alumínio, Ferramentas, Fechaduras
  {
    keywords: ['parafuso', 'porca', 'arruela', 'prego', 'estruturas', 'tubo de aco', 'vergalhao', 'chapa de aco', 'panela de inox'],
    suggestedNCMs: [
      { ncm: '7318.15.00', description: 'Parafusos e porcas de ferro fundido, ferro ou aço, mesmo com suas arruelas', chapterCode: '73' },
      { ncm: '7318.16.00', description: 'Porcas de ferro fundido, ferro ou aço com rosca métrica', chapterCode: '73' },
      { ncm: '7318.22.00', description: 'Arruelas de pressão e outras arruelas de segurança de aço', chapterCode: '73' },
      { ncm: '7308.90.90', description: 'Estruturas e construções de ferro ou aço e suas partes', chapterCode: '73' },
      { ncm: '7214.20.00', description: 'Barras de ferro ou aço dentadas, com entalhes ou nervuras (Vergalhão para construção civil)', chapterCode: '72' },
    ],
  },
  {
    keywords: ['cobre', 'fio de cobre', 'tubo de cobre', 'latão'],
    suggestedNCMs: [
      { ncm: '7408.11.00', description: 'Fios de cobre refinado com dimensão transversal superior a 6 mm', chapterCode: '74' },
      { ncm: '7411.10.10', description: 'Tubos de cobre refinado para refrigeração e ar condicionado', chapterCode: '74' },
    ],
  },
  {
    keywords: ['aluminio', 'lata de aluminio', 'esquadria de aluminio', 'janela de aluminio', 'folha de aluminio'],
    suggestedNCMs: [
      { ncm: '7612.90.19', description: 'Latas de alumínio para bebidas refrigerantes e cervejas', chapterCode: '76' },
      { ncm: '7610.10.00', description: 'Portas, janelas e seus caixilhos, alisares e soleiras de alumínio', chapterCode: '76' },
      { ncm: '7607.11.90', description: 'Folhas de alumínio sem suporte para uso doméstico', chapterCode: '76' },
    ],
  },
  {
    keywords: ['alicate', 'chave de fenda', 'martelo', 'serra', 'faca', 'ferramenta', 'cutelaria'],
    suggestedNCMs: [
      { ncm: '8203.20.10', description: 'Alicates (mesmo cortantes), tenazes e ferramentas semelhantes', chapterCode: '82' },
      { ncm: '8205.40.00', description: 'Chaves de fenda e chaves Philips', chapterCode: '82' },
      { ncm: '8211.92.10', description: 'Facas de lâmina fixa para cozinha ou açougue', chapterCode: '82' },
    ],
  },
  {
    keywords: ['fechadura', 'cadeado', 'dobradica', 'cofre'],
    suggestedNCMs: [
      { ncm: '8301.40.00', description: 'Outras fechaduras de metais comuns para portas de imóveis', chapterCode: '83' },
      { ncm: '8301.10.00', description: 'Cadeados de metais comuns', chapterCode: '83' },
    ],
  },

  // Cap. 84 a 85 - Máquinas, Ar-Condicionado, Geladeiras, Computadores, Eletrônicos, Celulares, TVs
  {
    keywords: ['geladeira', 'refrigerador', 'ar condicionado', 'compressor', 'bomba', 'motor eletrico', 'computador', 'notebook', 'laptop', 'impressora', 'maquina de lavar', 'trator agricola'],
    suggestedNCMs: [
      { ncm: '8418.10.00', description: 'Combinados de geladeira e congelador (freezer) de uso doméstico', chapterCode: '84' },
      { ncm: '8415.10.11', description: 'Aparelhos de ar condicionado tipo Split System', chapterCode: '84' },
      { ncm: '8471.30.12', description: 'Máquinas automáticas de processamento de dados portáteis (Notebooks / Laptops)', chapterCode: '84' },
      { ncm: '8443.32.31', description: 'Impressoras a jato de tinta líquida multifuncionais', chapterCode: '84' },
      { ncm: '8450.11.00', description: 'Máquinas de lavar roupa inteiramente automáticas', chapterCode: '84' },
    ],
  },
  {
    keywords: ['celular', 'smartphone', 'televisao', 'tv', 'cabo', 'bateria', 'carregador', 'fone', 'painel solar', 'lampada', 'fio', 'fone de ouvido'],
    suggestedNCMs: [
      { ncm: '8517.13.00', description: 'Smartphones e telefones celulares para redes celulares 4G/5G', chapterCode: '85' },
      { ncm: '8528.52.00', description: 'Monitores de vídeo e televisores de tela plana LED/OLED', chapterCode: '85' },
      { ncm: '8504.40.10', description: 'Carregadores de bateria para dispositivos móveis', chapterCode: '85' },
      { ncm: '8507.60.00', description: 'Acumuladores elétricos de íons de lítio (Baterias recarregáveis)', chapterCode: '85' },
      { ncm: '8539.52.00', description: 'Lâmpadas de LED de uso doméstico', chapterCode: '85' },
      { ncm: '8518.30.00', description: 'Fones de ouvido e auriculares, mesmo combinados com microfone', chapterCode: '85' },
    ],
  },

  // Cap. 86 a 89 - Veículos, Motos, Caminhões, Autopeças, Drones, Barcos
  {
    keywords: ['carro', 'automovel', 'moto', 'motocicleta', 'caminhao', 'trator', 'pneu', 'autopeca', 'amortecedor', 'freio', 'bateria automotiva', 'filtro de oleo'],
    suggestedNCMs: [
      { ncm: '8703.23.10', description: 'Automóveis de passageiros com motor a explosão de 1.0L a 1.5L', chapterCode: '87' },
      { ncm: '8711.20.10', description: 'Motocicletas com motor alternativo de 50 cm³ a 250 cm³', chapterCode: '87' },
      { ncm: '8708.80.00', description: 'Sistemas de suspensão e suas partes (Amortecedores para autopeças)', chapterCode: '87' },
      { ncm: '8708.30.90', description: 'Freios e servo-freios e suas partes para veículos automotores', chapterCode: '87' },
    ],
  },
  {
    keywords: ['aviao', 'drone', 'aeronave', 'barco', 'navio', 'lancha'],
    suggestedNCMs: [
      { ncm: '8806.22.00', description: 'Aeronaves não tripuladas (Drones) de peso máximo de decolagem superior a 250 g', chapterCode: '88' },
      { ncm: '8903.92.00', description: 'Barcos a motor e lanchas de recreio ou de esporte', chapterCode: '89' },
    ],
  },

  // Cap. 90 a 97 - Médicos, Relógios, Música, Móveis, Brinquedos, Papelaria, Arte
  {
    keywords: ['oculos', 'lentes de contato', 'ultrassom', 'medidor de pressao', 'termometro', 'medico', 'hospitalar'],
    suggestedNCMs: [
      { ncm: '9004.10.00', description: 'Óculos de sol para proteção ocular', chapterCode: '90' },
      { ncm: '9018.90.99', description: 'Outros instrumentos e aparelhos para medicina, cirurgia ou veterinária', chapterCode: '90' },
      { ncm: '9025.19.90', description: 'Termômetros digitais e pirômetros', chapterCode: '90' },
    ],
  },
  {
    keywords: ['relogio', 'despertador', 'cronometro', 'violao', 'guitarra', 'teclado musical', 'piano'],
    suggestedNCMs: [
      { ncm: '9102.11.00', description: 'Relógios de pulso elétricos com mostrador optoeletrônico', chapterCode: '91' },
      { ncm: '9202.90.00', description: 'Violões e outros instrumentos musicais de cordas', chapterCode: '92' },
    ],
  },
  {
    keywords: ['movel', 'sofa', 'mesa', 'cadeira', 'colchao', 'cama', 'armario', 'luminaria'],
    suggestedNCMs: [
      { ncm: '9403.60.00', description: 'Móveis de madeira de uso doméstico ou comercial (Mesas, Armários, Estantes)', chapterCode: '94' },
      { ncm: '9401.61.00', description: 'Assentos estofados com armação de madeira (Sofás e Poltronas)', chapterCode: '94' },
      { ncm: '9404.21.00', description: 'Colchões de borracha alveolar ou de plásticos (Colchões de Espuma)', chapterCode: '94' },
    ],
  },
  {
    keywords: ['brinquedo', 'boneco', 'jogo', 'videogame', 'console', 'playstation', 'xbox', 'nintendo', 'bola de futebol'],
    suggestedNCMs: [
      { ncm: '9503.00.99', description: 'Outros brinquedos, bonecos e modelos reduzidos para recreação infantil', chapterCode: '95' },
      { ncm: '9504.50.00', description: 'Consoles e máquinas de jogos de vídeo (PlayStation, Xbox, Nintendo)', chapterCode: '95' },
      { ncm: '9506.62.00', description: 'Bolas infláveis para futebol e esportes', chapterCode: '95' },
    ],
  },
  {
    keywords: ['caneta', 'lapis', 'escova de dente', 'isqueiro', 'ziper', 'carimbo'],
    suggestedNCMs: [
      { ncm: '9608.10.00', description: 'Canetas esferográficas com corpo de plástico ou metal', chapterCode: '96' },
      { ncm: '9603.21.00', description: 'Escovas de dentes, incluindo as escovas para dentaduras', chapterCode: '96' },
      { ncm: '9613.10.00', description: 'Isqueiros de bolso, a gás, não recarregáveis', chapterCode: '96' },
    ],
  },
  {
    keywords: ['quadro', 'pintura', 'escultura', 'arte', 'antiguidade', 'colecao'],
    suggestedNCMs: [
      { ncm: '9701.10.00', description: 'Quadros, pinturas e desenhos, feitos inteiramente à mão', chapterCode: '97' },
    ],
  },
];

/**
 * MOTOR BUSCADOR INTELIGENTE DE NCMS POR CÓDIGO E DESCRIÇÃO
 */
export function searchIntelligentNCMs(params: {
  searchTerm: string;
  selectedSegment?: string;
  selectedChapter?: string;
  taxFilter?: string;
  cstFilter?: string;
  favoriteNCMs?: string[];
}): NCMTaxData[] {
  const { searchTerm = '', selectedSegment = 'todos', selectedChapter = 'todos', taxFilter = 'todos', cstFilter = 'todos', favoriteNCMs = [] } = params;

  const rawTerm = searchTerm.trim();
  const normalizedTerm = normalizeText(rawTerm);
  const cleanDigits = rawTerm.replace(/[^0-9]/g, '');

  // Quebra a busca em palavras/tokens individuais para permitir buscas flexíveis como "geladeira lg", "oleo soja", "parafuso inox"
  const searchTokens = normalizedTerm.split(/\s+/).filter(t => t.length > 0);

  // 1. Filtra a lista estática do banco de dados
  let results = NCM_DATABASE.filter(item => {
    const cleanItemNcm = item.ncm.replace(/[^0-9]/g, '');
    const normalizedDesc = normalizeText(item.description);
    const normalizedSeg = normalizeText(item.segment);
    const normalizedCap = normalizeText(item.capitulo);
    const normalizedPis = normalizeText(item.pisCofinsLegalBase || '');
    const cleanCest = item.cest ? item.cest.replace(/[^0-9]/g, '') : '';

    // Verifica se os dígitos numéricos ou todos os tokens de texto casam
    let matchesSearch = true;
    if (searchTokens.length > 0) {
      if (cleanDigits.length >= 2 && cleanItemNcm.includes(cleanDigits)) {
        matchesSearch = true;
      } else {
        // Todos os tokens pesquisados precisam estar presentes em algum campo do NCM
        matchesSearch = searchTokens.every(token => 
          cleanItemNcm.includes(token) ||
          normalizedDesc.includes(token) ||
          normalizedSeg.includes(token) ||
          normalizedCap.includes(token) ||
          normalizedPis.includes(token) ||
          cleanCest.includes(token)
        );
      }
    }

    const matchesSegment = selectedSegment === 'todos' || item.segment === selectedSegment;
    const matchesChapter = selectedChapter === 'todos' || item.capitulo.startsWith(`Capítulo ${selectedChapter}:`);

    let matchesTax = true;
    if (taxFilter === 'monofasico') matchesTax = item.pisCofinsNature === 'monofasico';
    else if (taxFilter === 'icms_st') matchesTax = item.icmsST;
    else if (taxFilter === 'aliquota_zero') matchesTax = item.pisCofinsNature === 'aliquota_zero';
    else if (taxFilter === 'zfm') matchesTax = item.cstClassificacaoEspecial === 'zona_franca_manaus' || item.cBenef === 'ZFM999';
    else if (taxFilter === 'imposto_seletivo') matchesTax = item.reformaTributaria.hasImpostoSeletivo;
    else if (taxFilter === 'favoritos') matchesTax = favoriteNCMs.includes(item.ncm);

    let matchesCst = true;
    if (cstFilter !== 'todos') {
      matchesCst = item.cstClassificacaoEspecial === cstFilter;
    }

    return matchesSearch && matchesSegment && matchesChapter && matchesTax && matchesCst;
  });

  // 2. Se a busca tiver 2 ou mais dígitos e não encontrou exatos no banco estático, gera via TIPI
  if (cleanDigits.length >= 2) {
    const hasMatches = results.some(item => item.ncm.replace(/[^0-9]/g, '').startsWith(cleanDigits));
    if (!hasMatches) {
      const paddedDigits = (cleanDigits + '00000000').substring(0, 8);
      const generated = getOrGenerateNCMData(paddedDigits);
      results = [generated, ...results];
    }
  }

  // 3. Se a busca for textual por Descrição, pesquisa no Motor de Palavras-Chave de Produtos
  if (searchTokens.length > 0 && cleanDigits.length < 4) {
    PRODUCT_KEYWORD_MAPPINGS.forEach(mapping => {
      const matchesKeyword = searchTokens.some(token => 
        mapping.keywords.some(kw => normalizeText(kw).includes(token) || token.includes(normalizeText(kw)))
      );

      if (matchesKeyword) {
        mapping.suggestedNCMs.forEach(sugg => {
          const suggDigits = sugg.ncm.replace(/[^0-9]/g, '');
          const existsInResults = results.some(r => r.ncm.replace(/[^0-9]/g, '') === suggDigits);

          if (!existsInResults) {
            const generatedNcm = getOrGenerateNCMData(suggDigits);
            generatedNcm.description = `${sugg.description} (Localizado por descrição "${rawTerm}")`;
            results.push(generatedNcm);
          }
        });
      }
    });

    // 4. Também pesquisa por nome de capítulos no NCM_CHAPTERS
    NCM_CHAPTERS.forEach(chap => {
      const normalizedChapName = normalizeText(chap.name);
      const matchesChapName = searchTokens.some(token => token.length >= 3 && (normalizedChapName.includes(token) || token.includes(chap.code)));

      if (matchesChapName) {
        const testCode = `${chap.code}01.00.00`;
        const testDigits = testCode.replace(/[^0-9]/g, '');
        const exists = results.some(r => r.ncm.replace(/[^0-9]/g, '').startsWith(chap.code));

        if (!exists) {
          const generatedFromChap = getOrGenerateNCMData(testDigits);
          results.push(generatedFromChap);
        }
      }
    });
  }

  // 5. Garantia de Cobertura Universal: Se um capítulo específico for selecionado na dropdown e a lista estiver curta
  if (selectedChapter !== 'todos' && results.length < 2) {
    const chapInfo = NCM_CHAPTERS.find(c => c.code === selectedChapter);
    if (chapInfo) {
      const fallbackDigits = [
        `${selectedChapter}01.00.00`,
        `${selectedChapter}02.90.00`,
        `${selectedChapter}90.90.00`
      ];

      fallbackDigits.forEach((codeStr, idx) => {
        const clean = codeStr.replace(/[^0-9]/g, '');
        const exists = results.some(r => r.ncm.replace(/[^0-9]/g, '') === clean);
        if (!exists) {
          const gen = getOrGenerateNCMData(clean);
          gen.description = `[NCM TIPI ${codeStr}] ${chapInfo.name} — Item ${idx + 1}`;
          results.push(gen);
        }
      });
    }
  }

  return results;
}
