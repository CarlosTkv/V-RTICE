export interface TaxArticle {
  id: string;
  title: string;
  category: 
    | 'simples_nacional' 
    | 'fator_r' 
    | 'socios_vinculos' 
    | 'icms_st' 
    | 'pis_cofins_monofasico' 
    | 'transporte' 
    | 'lucro_presumido_real' 
    | 'reforma_tributaria' 
    | 'tabelas_anexos' 
    | 'jurisprudencia_rfb';
  categoryLabel: string;
  tags: string[];
  lawReference: string;
  summary: string;
  content: string;
  practicalExample?: {
    scenario: string;
    calculation: string;
    result: string;
  };
  rfbPrecedent?: string;
  keyTakeaways: string[];
}

export const TAX_KNOWLEDGE_CATEGORIES = [
  { id: 'all', label: 'Todos os Temas' },
  { id: 'simples_nacional', label: 'Simples Nacional & LC 123/06' },
  { id: 'fator_r', label: 'Fator R & Folha (Art. 18 § 5º-J)' },
  { id: 'socios_vinculos', label: 'Quadro Societário (Art. 3º § 4º)' },
  { id: 'icms_st', label: 'ICMS, ST & CFOPs' },
  { id: 'pis_cofins_monofasico', label: 'PIS/COFINS Monofásicos' },
  { id: 'transporte', label: 'Setor de Transporte' },
  { id: 'lucro_presumido_real', label: 'Presumido vs Lucro Real' },
  { id: 'reforma_tributaria', label: 'Reforma Tributária (IBS/CBS)' },
  { id: 'tabelas_anexos', label: 'Tabelas & Anexos I a V' },
  { id: 'jurisprudencia_rfb', label: 'Soluções COSIT & Pareceres' },
] as const;

export const TAX_KNOWLEDGE_BASE: TaxArticle[] = [
  {
    id: 'art-rbt12-rba',
    title: 'RBT12 vs RBA: A Regra de Ouro "Toda Empresa com RBA possui RBT12"',
    category: 'simples_nacional',
    categoryLabel: 'Simples Nacional & LC 123/06',
    tags: ['RBT12', 'RBA', 'Receita Bruta Acumulada', 'PGDAS-D', 'Início de Atividade'],
    lawReference: 'LC 123/2006, Art. 3º, II e Art. 18, §§ 1º e 2º; Resolução CGSN 140/2018, Art. 5º',
    summary: 'Conceito fundamental de apuração no Simples Nacional. A RBA (Receita Bruta Acumulada no Ano-Calendário) mede o limite de permanência no ano em curso (R$ 4,8M / R$ 3,6M), enquanto a RBT12 (Receita Bruta dos 12 meses anteriores) determina a alíquota nominal e a faixa dos anexos. Toda empresa em atividade que possui RBA possui necessariamente RBT12 correspondente.',
    content: `A sistemática do Simples Nacional opera sobre duas grandezas temporais distintas de receita bruta:

1. **RBT12 (Receita Bruta Acumulada nos 12 meses anteriores ao PA):**
Utilizada exclusivamente para determinar a **faixa de tributação**, a **alíquota nominal** e a **parcela a deduzir** segundo as tabelas dos Anexos I a V. Fórmula da Alíquota Efetiva:
\`AliqEfetiva = [(RBT12 × AliqNominal) - ParcelaDeduzir] / RBT12\`

2. **RBA (Receita Bruta Acumulada no Ano-Calendário corrente):**
Mede o teto de enquadramento (R$ 4.800.000,00) e o sublimite estadual (R$ 3.600.000,00) de janeiro a dezembro. Se a RBA ultrapassar os limites, desencadeia a exclusão ou segregação de ICMS/ISS.

3. **Empresas no Primeiro Ano de Atividade:**
Para empresas em início de atividade (menos de 13 meses), a RBT12 é calculada proporcionalmente pela média aritmética dos meses anteriores multiplicada por 12 (Art. 18, § 2º da LC 123/2006). No 1º mês, multiplica-se a receita do próprio mês por 12. Portanto, **toda empresa com RBA positiva possui RBT12 calculada**.`,
    practicalExample: {
      scenario: 'Empresa abriu em março de 2025. No mês de apuração junho/2025, faturou R$ 50.000,00. Receitas anteriores: Março: R$ 30k, Abril: R$ 40k, Maio: R$ 50k. RBA até maio: R$ 120k.',
      calculation: 'Média dos 3 meses = R$ 120.000 / 3 = R$ 40.000,00. RBT12 proporcional = R$ 40.000 × 12 = R$ 480.000,00 (Faixa 2 do Anexo I).',
      result: 'Alíquota nominal aplicada será a da faixa de R$ 480k, com RBA monitorando o teto anual de R$ 4,8M.',
    },
    rfbPrecedent: 'Solução de Consulta COSIT nº 145/2018; Manual PGDAS-D versão 2025, item 3.4.',
    keyTakeaways: [
      'RBT12 define alíquota; RBA define teto e limites de exclusão.',
      'Toda empresa com faturamento no ano (RBA) possui valor para RBT12 (seja pelos 12 meses anteriores ou pela proporcionalização legal).',
      'No PGDAS-D, a RBT12 jamais pode ser zerada se a empresa registrou faturamento em períodos anteriores.',
    ],
  },
  {
    id: 'art-fator-r-28',
    title: 'Fator R (≥ 28%): Estratégia de Migração do Anexo V para o Anexo III',
    category: 'fator_r',
    categoryLabel: 'Fator R & Folha (Art. 18 § 5º-J)',
    tags: ['Fator R', 'Anexo III', 'Anexo V', 'Pró-labore', 'Folha de Pagamento', 'Economia Tributária'],
    lawReference: 'LC 123/2006, Art. 18, §§ 5º-J, 5º-K e 5º-M; Resolução CGSN 140/2018, Art. 26',
    summary: 'Atividades de prestação de serviços intelectuais (TI, engenharia, medicina, consultoria, advocacia, design) são inicialmente tributadas no oneroso Anexo V (alíquota inicial de 15,5%). Se a razão entre a folha de salários dos últimos 12 meses e a RBT12 for igual ou superior a 0,28 (28%), a empresa migra para o Anexo III (alíquota inicial de 6,0%), reduzindo a carga fiscal em mais de 60%.',
    content: `O Fator R é a relação matemática entre a **Folha de Pagamento dos 12 meses anteriores (FS12)** e a **Receita Bruta dos 12 meses anteriores (RBT12)**:

\`Fator R = Folha de Pagamento (FS12) / RBT12\`

- Se **Fator R ≥ 0,28 (28%)**: Tributação pelo **Anexo III** (Alíquota a partir de 6,0%).
- Se **Fator R < 0,28 (28%)**: Tributação pelo **Anexo V** (Alíquota a partir de 15,5%).

**Composição Legal da Folha de Pagamento (FS12):**
Inclui os seguintes dispêndios pagos nos 12 meses anteriores:
- Salários de empregados registrados via eSocial;
- Pró-labore pago aos sócios administradores;
- Encargos previdenciários patronais (INSS patronal pago no Simples Anexo IV, se aplicável, e FGTS);
- 13º salário e férias proporcionais/indenizadas;
- **Não inclui:** Pagamentos a pessoas jurídicas terceirizadas, estagiários sem vínculo ou lucros distribuídos (isenção).`,
    practicalExample: {
      scenario: 'Clínica médica ou empresa de TI com RBT12 de R$ 600.000,00 e receita mensal de R$ 50.000,00.',
      calculation: 'No Anexo V (Fator R < 28%): Alíquota efetiva de 15,5% -> DAS mensal = R$ 7.750,00.\nSe elevar o Pró-labore para atingir Folha de R$ 168.000/ano (R$ 14.000/mês -> 28%):\nNo Anexo III: Alíquota efetiva cai para 8,62% -> DAS mensal = R$ 4.310,00.\nEconomia mensal no DAS: R$ 3.440,00 (R$ 41.280,00/ano).',
      result: 'Mesmo descontando o IRPF e INSS do sócio sobre o pró-labore, o ganho líquido para os sócios supera R$ 22.000,00 por ano.',
    },
    rfbPrecedent: 'Solução de Consulta COSIT nº 216/2021; Solução de Consulta DISIT/SRRF08 nº 8003/2020.',
    keyTakeaways: [
      'O Fator R é recalculado mês a mês com base na janela móvel de 12 meses.',
      'Ajustar o pró-labore no mês anterior garante a manutenção no Anexo III.',
      'O pró-labore deve ter recolhimento comprovado de GPS/DARF e registro no eSocial.',
    ],
  },
  {
    id: 'art-art3-par4-socios',
    title: 'Auditoria Societária: Vedações do Art. 3º § 4º da LC 123/2006',
    category: 'socios_vinculos',
    categoryLabel: 'Quadro Societário (Art. 3º § 4º)',
    tags: ['Vedações Societárias', 'Sócio > 10%', 'Sócio Administrador', 'Somatório de Faturamento', 'Exclusão Simples'],
    lawReference: 'LC 123/2006, Art. 3º, § 4º, incisos I a XI; Art. 29 e 30; Resolução CGSN 140/2018, Art. 15',
    summary: 'A Receita Federal fiscaliza com rigidez a criação de múltiplos CNPJs para fracionamento de receita. Se um sócio possuir mais de 10% do capital de outra empresa, ou for administrador de outra pessoa jurídica, o faturamento global de todas as empresas é somado. Se o somatório ultrapassar R$ 4,8 milhões, todas são desenquadradas do Simples Nacional.',
    content: `As regras de impedimento e somatório de receitas do Art. 3º § 4º são os principais geradores de autos de infração e exclusão retroativa:

1. **Inciso IV (Sócio com mais de 10% em outra empresa):**
Pessoa física sócia com mais de 10% em uma empresa no Simples e sócia de outra empresa qualquer (Simples, Presumido ou Real).
**Regra:** As receitas de ambas as empresas SÃO SOMADAS. Se a soma superar R$ 4,8M, a empresa do Simples é excluída.

2. **Inciso III e V (Sócio Administrador ou Titular de EIRELI/SLU):**
Se a pessoa física for sócia administradora ou titular de uma empresa e participar como sócia (qualquer %) de outra empresa:
**Regra:** As receitas SÃO SOMADAS independentemente do percentual de cotas na segunda empresa.

3. **Inciso IX (Pessoa Jurídica no Quadro Societário):**
Empresa que tenha outra pessoa jurídica em seu quadro societário não pode optar pelo Simples Nacional em hipótese alguma.

4. **Investidor-Anjo (LC 155/2016):**
O aporte de capital efetuado por Investidor-Anjo mediante contrato de participação (Art. 61-A a 61-D da LC 123) NÃO integra o capital social, não confere poder de gerência e NÃO gera contaminação de receitas societárias.`,
    practicalExample: {
      scenario: 'Dr. Roberto é sócio com 25% na Empresa A (Simples, RBT12 R$ 3.000.000,00). Dr. Roberto adquire 15% na Empresa B (Simples, RBT12 R$ 2.500.000,00).',
      calculation: 'Como detém > 10% em ambas: Receita Global Consolidada = R$ 3,0M + R$ 2,5M = R$ 5.500.000,00. Superou o teto federal de R$ 4,8M em 14,58%.',
      result: 'Ambas as empresas serão compulsoriamente excluídas do Simples Nacional a partir de 1º de janeiro do ano subsequente.',
    },
    rfbPrecedent: 'Acórdão CARF nº 3402-005.812; Solução de Divergência COSIT nº 7/2017.',
    keyTakeaways: [
      'Participações de até 10% como cotista sem poder de gestão não geram soma de faturamento (Art. 3º § 4º IV a contrario sensu).',
      'Sócio administrador sempre contamina a receita, independente de ter 1% ou 99% das quotas.',
      'A exclusão alcança todas as empresas coligadas, com cobrança de tributos pelo Lucro Presumido retroativamente com multas de até 75%.',
    ],
  },
  {
    id: 'art-sublimite-estadual',
    title: 'Sublimite Estadual de R$ 3.600.000,00: Efeitos no ICMS, ISS e SPED',
    category: 'simples_nacional',
    categoryLabel: 'Simples Nacional & LC 123/06',
    tags: ['Sublimite Estadual', 'R$ 3,6M', 'ICMS fora do DAS', 'ISS fora do DAS', 'SPED Fiscal', 'EFD'],
    lawReference: 'LC 123/2006, Art. 13-A, Art. 19 e Art. 20; Resolução CGSN 140/2018, Art. 12',
    summary: 'Estados e Municípios aplicam o sublimite anual de R$ 3.600.000,00. Quando a receita acumulada da empresa supera este montante, ela não é excluída do Simples para tributos federais (continua pagando IRPJ, CSLL, PIS, COFINS e CPP no DAS), mas o ICMS e o ISS são expurgados do DAS e devem ser apurados pelo regime normal do Estado/Município com entrega obrigatória de SPED Fiscal.',
    content: `O sublimite estadual opera como uma cisão fiscal interna do Simples Nacional:

1. **Faixa Federal (R$ 3,6M até R$ 4,8M):**
A empresa continua como optante pelo Simples Nacional para tributos federais: IRPJ, CSLL, PIS/PASEP, COFINS e CPP são pagos em guia única DAS, beneficiando-se da alíquota unificada.

2. **Expurgo do ICMS e ISS:**
Os percentuais relativos ao ICMS (comércio/indústria) ou ISS (serviços) são zerados dentro do DAS. A empresa passa a:
- Apurar o ICMS pelo regime de Débito e Crédito estadual (18%, 12%, 7%);
- Recolher o ICMS em guia estadual avulsa (DARE/DAE/GNRE);
- Apurar o ISS diretamente na nota fiscal eletrônica de serviços (NFS-e) do município (alíquota de 2% a 5%);
- Entregar a Escrituração Fiscal Digital (EFD ICMS/IPI - SPED Fiscal) e EFD-Contribuições.

3. **Regra de Vigência da Exclusão Estadual:**
- **Excesso de até 20% (RBA entre R$ 3,6M e R$ 4,32M):** O ICMS/ISS só é expurgado a partir de **1º de janeiro do ano seguinte**.
- **Excesso superior a 20% (RBA > R$ 4,32M):** O ICMS/ISS é expurgado **imediatamente no mês subsequente** ao excesso.`,
    practicalExample: {
      scenario: 'Comércio em SP com RBT12 de R$ 4.000.000,00 (Faixa 6 do Anexo I) e faturamento no mês de R$ 350.000,00.',
      calculation: 'Alíquota total nominal Anexo I = 19,00%. A parcela do ICMS (33,50% da alíquota) é retirada do DAS.\nDAS Federal = 12,63% × R$ 350.000 = R$ 44.205,00.\nICMS Estadual SP = Débito e Crédito normal apurado no SPED Fiscal (crédito nas compras de mercadorias).',
      result: 'Empresa economiza no DAS federal, mas precisa de escrituração de notas fiscais com crédito de ICMS em software contábil completo.',
    },
    rfbPrecedent: 'Portaria CGSN nº 39/2023; Resolução CGSN nº 172/2023.',
    keyTakeaways: [
      'Ultrapassar R$ 3,6M não desenquadra a empresa do Simples federal até R$ 4,8M.',
      'Obrigatória a implantação imediata de SPED Fiscal EFD para não sofrer multas acessórias estaduais.',
      'A empresa ganha o direito de transferir créditos integrais de ICMS aos seus clientes nas notas de saída.',
    ],
  },
  {
    id: 'art-segregacao-cfop-st',
    title: 'Segregação de CFOPs no PGDAS-D: Substituição Tributária e Isenções',
    category: 'icms_st',
    categoryLabel: 'ICMS, ST & CFOPs',
    tags: ['CFOP', 'Substituição Tributária', 'ST', 'ICMS-ST', 'Bitributação', 'PGDAS-D', 'Segregação'],
    lawReference: 'LC 123/2006, Art. 18, § 4º-A, inciso I; Resolução CGSN 140/2018, Art. 25, § 6º',
    summary: 'Revendedores de mercadorias com ICMS retido por Substituição Tributária (CFOP 5.405 / 5.403) ou com isenção estadual têm o direito inalienável de desmarcar a incidência de ICMS no PGDAS-D. Não segregar essas receitas gera pagamento indevido de tributo em dobro, passível de restituição administrativa dos últimos 5 anos.',
    content: `A sistemática do ICMS Substituição Tributária (ICMS-ST) antecipa o recolhimento de todo o imposto da cadeia na indústria ou importador. Quando o comerciante atacadista ou varejista vende o produto:

1. **Princípio do Não-Bis-in-Idem (Proibição da Bitributação):**
O ICMS já foi integralmente pago pelo fabricante/substituto tributário. Portanto, ao apurar o DAS no PGDAS-D, o contribuinte deve selecionar a opção:
**"Revenda de mercadorias COM Substituição Tributária / Tributação Monofásica"**.

2. **Abatimento Matemático no DAS:**
O percentual de ICMS da faixa do Anexo I (aproximadamente 33,5% a 34% do valor do DAS) é **expurgado e deduzido** da alíquota efetiva. 

3. **CFOPs mais comuns de Segregação:**
- **5.102 / 6.102:** Revenda de mercadoria tributada integralmente (Paga ICMS normal no DAS).
- **5.405:** Venda de mercadoria adquirida com ICMS-ST (NÃO PAGA ICMS no DAS).
- **5.403:** Venda de mercadoria fabricada pelo estabelecimento em operação sujeita a ST.
- **5.933:** Prestação de serviços sujeita ao ISSQN municipal.`,
    practicalExample: {
      scenario: 'Supermercado, farmácia ou autopeças no Simples com faturamento mensal de R$ 200.000,00, dos quais R$ 120.000,00 (60%) referem-se a mercadorias com ICMS-ST (CFOP 5.405). Alíquota efetiva de 10%.',
      calculation: 'DAS sem segregação: R$ 200.000 × 10% = R$ 20.000,00.\nDAS com segregação correta:\n- R$ 80.000 tributados a 10% = R$ 8.000,00\n- R$ 120.000 tributados a 6,65% (abatendo 33,5% do ICMS) = R$ 7.980,00\nTotal DAS líquido = R$ 15.980,00.',
      result: 'Economia imediata de R$ 4.020,00 por mês (R$ 48.240,00 por ano) 100% legalizada no PGDAS-D.',
    },
    rfbPrecedent: 'Solução de Consulta COSIT nº 65/2019; Parecer SEI nº 14.483/2021/ME.',
    keyTakeaways: [
      'Empresas que não segregam CFOP 5.405 pagam ICMS duas vezes.',
      'A Receita Federal disponibiliza compensação e restituição direta via e-CAC em até 60 dias para valores pagos a maior nos últimos 60 meses.',
      'Indispensável vincular o cadastro de produtos (NCM e CEST) ao módulo de segregação.',
    ],
  },
  {
    id: 'art-pis-cofins-monofasico',
    title: 'PIS/COFINS Monofásico no Simples Nacional: Restituição e Segregação',
    category: 'pis_cofins_monofasico',
    categoryLabel: 'PIS/COFINS Monofásicos',
    tags: ['PIS Monofásico', 'COFINS Monofásico', 'Autopeças', 'Bebidas', 'Farmácia', 'Lei 10.147/2000'],
    lawReference: 'Lei 10.147/2000; Lei 10.833/2003; LC 123/2006, Art. 18, § 4º-A, inciso I',
    summary: 'Assim como ocorre no ICMS-ST, fabricantes e importadores recolhem PIS e COFINS com alíquotas concentradas na origem para determinados setores (autopeças, pneus, medicamentos, perfumaria, cosméticos, bebidas frias e combustíveis). Comerciantes no Simples Nacional devem segregar essas receitas no PGDAS-D para abater a parcela de PIS/COFINS da alíquota do DAS.',
    content: `O regime monofásico do PIS e da COFINS concentra a tributação no primeiro elo da cadeia produtiva:

1. **Setores Sujeitos ao Regime Monofásico:**
- Autopeças e pneumáticos (Lei 10.485/2002);
- Farmácias e drogarias (medicamentos e produtos farmacêuticos - Lei 10.147/2000);
- Cosméticos, perfumaria e produtos de higiene pessoal (Lei 10.147/2000);
- Bebidas frias: Cervejas, refrigerantes, águas minerais, energéticos (Lei 13.097/2015);
- Combustíveis e lubrificantes (Lei 9.718/1998).

2. **Como declarar no PGDAS-D:**
O contribuinte deve informar o faturamento desses produtos sob a opção:
**"Revenda de mercadorias com tributação concentrada em uma única etapa (monofásica) de PIS/Pasep e Cofins"**.
O sistema desmarca automaticamente as alíquotas de PIS (2,76% do DAS) e COFINS (12,74% do DAS), reduzindo a guia final em aproximadamente 15,5% a 17%.`,
    practicalExample: {
      scenario: 'Loja de autopeças ou drogaria com RBT12 de R$ 1.800.000,00 e receita no mês de R$ 150.000,00, sendo 80% produtos monofásicos.',
      calculation: 'Alíquota nominal do Anexo I = 10,70%. Parcela de PIS/COFINS no DAS = ~1,65%.\nAbatimento sobre R$ 120.000,00 de monofásicos = R$ 1.980,00/mês.',
      result: 'Economia financeira de R$ 23.760,00 ao ano, com segurança jurídica pacificada pelo STJ.',
    },
    rfbPrecedent: 'Tema 1050 do STJ (Recurso Especial 1.894.741/RS); Solução de Consulta COSIT nº 225/2017.',
    keyTakeaways: [
      'STJ pacificou o direito de varejistas no Simples Nacional excluírem PIS e COFINS monofásicos.',
      'Valores recolhidos indevidamente no passado podem ser recuperados administrativamente sem processo judicial.',
      'A classificação fiscal correta por código NCM na nota fiscal eletrônica é indispensável para validação.',
    ],
  },
  {
    id: 'art-transporte-anexos',
    title: 'Setor de Transporte: Regra Especial Anexo III sem ISS + ICMS Anexo I',
    category: 'transporte',
    categoryLabel: 'Setor de Transporte',
    tags: ['Transporte de Cargas', 'Anexo III', 'Anexo I', 'CT-e', 'Decreto PR 8.660/18', 'Benefício Fiscal'],
    lawReference: 'LC 123/2006, Art. 18, § 5º-E; Resolução CGSN 140/2018, Art. 25, § 3º',
    summary: 'O transporte rodoviário de cargas intermunicipal e interestadual possui tratamento tributário singular na LC 123: os tributos federais são apurados pela tabela do Anexo III deduzida a parcela do ISS, enquanto o ICMS é recolhido pela parcela correspondente do Anexo I. Estados como o Paraná concedem reduções específicas na alíquota de ICMS para transportadoras optantes.',
    content: `A prestação de serviços de transporte intermunicipal e interestadual de cargas (CNAE 4930-2/02) envolve competência tributária estadual (ICMS):

1. **A Sistemática do Art. 18 § 5º-E da LC 123/2006:**
- **Tributos Federais (IRPJ, CSLL, PIS, COFINS e CPP):** Calculados pela alíquota efetiva do **Anexo III**, subtraindo-se a parcela percentual destinada ao ISSQN (que pertence aos municípios);
- **ICMS:** Calculado pela aplicação da parcela de ICMS da alíquota efetiva do **Anexo I** (Comércio) sobre a mesma receita de transporte;
- Emissão de documento fiscal obrigatório: **Conhecimento de Transporte Eletrônico (CT-e modelo 57)** e Manifesto Eletrônico de Documentos Fiscais (MDF-e).

2. **Benefícios Estaduais (Exemplo: Paraná - Decreto 8.660/2018):**
O Estado do Paraná estabelece alíquota reduzida de ICMS para empresas do Simples na 5ª faixa de faturamento (R$ 1,8M a R$ 3,6M). Enquanto a regra geral cobra alíquota plena de ICMS, o transportador paranaense usufrui de redução percentual direta, gerando expressiva economia.

3. **Transporte Municipal (Dentro da mesma cidade):**
Tributado exclusivamente pelo Anexo III integral com incidência de ISSQN (sem ICMS). Documento hábil: NFS-e.`,
    practicalExample: {
      scenario: 'Transportadora de cargas em Curitiba/PR com RBT12 de R$ 2.400.000,00 e faturamento no mês de R$ 200.000,00.',
      calculation: 'Alíquota federal no Anexo III deduzida do ISS + Parcela ICMS Anexo I aplicada com a redução do Decreto PR 8.660/18.\nCarga efetiva global = ~8,40% (contra 11,35% se tributada genericamente).',
      result: 'Redução de mais de R$ 5.900,00 por mês no recolhimento do DAS comparado a apurações sem parametrização de transporte.',
    },
    rfbPrecedent: 'Solução de Consulta COSIT nº 171/2020; Resposta a Consulta SEFAZ/PR nº 042/2021.',
    keyTakeaways: [
      'Transporte rodoviário intermunicipal nunca recolhe ISS, somente ICMS.',
      'Obrigações eletrônicas CT-e e MDF-e devem ter dados de carga, motorista e veículo sincronizados com a ANTT.',
      'Se a transportadora ultrapassar R$ 3,6M, o ICMS do CT-e passa a ser apurado no regime normal da SEFAZ.',
    ],
  },
  {
    id: 'art-reforma-tributaria-ibs-cbs',
    title: 'Reforma Tributária (EC 132/2023 & PLP 68/2024): O Dilema B2B e o Simples Híbrido',
    category: 'reforma_tributaria',
    categoryLabel: 'Reforma Tributária (IBS/CBS)',
    tags: ['Reforma Tributária', 'EC 132/23', 'PLP 68/24', 'IBS', 'CBS', 'Crédito B2B', 'Simples Híbrido', '2026', '2027'],
    lawReference: 'Emenda Constitucional nº 132/2023; Projeto de Lei Complementar nº 68/2024 (Regulamentação do IVA)',
    summary: 'A substituição de PIS, COFINS, IPI, ICMS e ISS pelo IBS (estadual/municipal) e CBS (federal) criará um novo paradigma competitivo. Empresas no Simples Nacional que vendem para pessoas jurídicas (B2B) enfrentarão severa desvantagem concorrencial, pois transferirão créditos de apenas ~2% a 4% aos clientes, contra ~26,5% de concorrentes no Lucro Presumido ou Real. Para mitigar isso, a lei autoriza o Simples Híbrido.',
    content: `A Reforma Tributária entra em vigor de forma escalonada entre 2026 e 2033:

1. **Cronograma de Transição:**
- **2026:** Alíquota teste de 0,9% para CBS e 0,1% para IBS (compensáveis em PIS/COFINS);
- **2027:** Extinção total de PIS e COFINS; CBS plena entra em vigor (~8,8%); IPI zerado para quase todas as linhas;
- **2029 a 2032:** Redução gradual do ICMS e ISS à razão de 10% ao ano e aumento proporcional do IBS;
- **2033:** Entrada plena do novo sistema IVA Dual (IBS + CBS estimada em ~26,5%).

2. **O Problema do Crédito Tributário nas Vendas B2B:**
No modelo IVA Dual, compradores PJ buscam fornecedores que gerem créditos tributários plenos para abater de suas vendas:
- Comprando de empresa no **Lucro Real ou Presumido:** Cliente credita **26,5%** do valor da nota fiscal.
- Comprando de empresa no **Simples Nacional:** Cliente só credita o percentual de CBS/IBS efetivamente pago dentro do DAS (entre **1,8% e 4,5%**).
- **Consequência:** A mercadoria ou serviço do Simples fica até **22% mais cara** na cadeia intermediária PJ!

3. **A Solução: Opção pelo Simples Híbrido (Art. 146 da CF/88):**
A EC 132/2023 facultou ao optante do Simples a possibilidade de **recolher o IBS e a CBS pelo regime regular de Débito e Crédito** fora do DAS, mantendo os tributos federais residuais (IRPJ, CSLL e CPP) dentro do Simples Nacional.
Dessa forma, a empresa transfere 100% de crédito aos clientes PJ sem abandonar a proteção previdenciária da folha no Simples!`,
    practicalExample: {
      scenario: 'Indústria metalúrgica ou fábrica de embalagens no Simples com 80% das vendas para grandes indústrias (B2B). Faturamento de R$ 3.000.000,00/ano.',
      calculation: 'Se permanecer no Simples tradicional em 2027: Clientes PJ perderão ~R$ 600.000,00 por ano em créditos de IBS/CBS e exigirão desconto no preço ou trocarão de fornecedor.\nSe optar pelo Simples Híbrido: Transfere crédito de 26,5%, toma crédito de insumos e energia, e preserva a cartela de clientes.',
      result: 'Empresas com mais de 50% de faturamento B2B devem planejar a adesão ao regime de crédito pleno até o final de 2026.',
    },
    rfbPrecedent: 'Exposição de Motivos da EC 132/2023; Texto aprovado do PLP 68/2024 na Câmara e Senado.',
    keyTakeaways: [
      'Empresas B2C (venda direta a consumidor final) continuam muito vantajosas no Simples Nacional.',
      'Empresas B2B (venda para outras empresas) sofrerão pressão comercial para transferir crédito de IBS/CBS.',
      'O Vértice Auditor Fiscal já simula o valor monetário da desvantagem B2B e a viabilidade do Simples Híbrido.',
    ],
  },
  {
    id: 'art-presumido-vs-real-comparativo',
    title: 'Planejamento Tributário Avançado: Quando Migrar para Lucro Presumido ou Lucro Real?',
    category: 'lucro_presumido_real',
    categoryLabel: 'Presumido vs Lucro Real',
    tags: ['Lucro Presumido', 'Lucro Real', 'Planejamento Tributário', 'Folha CPP', 'Margem de Lucro'],
    lawReference: 'Decreto nº 9.580/2018 (RIR/2018), Art. 587 a 608; Lei nº 9.718/1998; Lei nº 10.637/2002; Lei nº 10.833/2003',
    summary: 'A decisão de migrar do Simples Nacional não depende apenas do faturamento, mas da margem de lucro real, do peso da folha de pagamento com encargos patronais (20% INSS + RAT + Terceiros) e das despesas operacionais que geram créditos de PIS/COFINS não-cumulativos.',
    content: `Critérios técnicos para definição do melhor regime tributário:

1. **Simples Nacional:**
- **Ideal quando:** Empresa possui folha de pagamento relevante (benefício da isenção da contribuição patronal de 20% no Anexo I, II, III e V) e margens operacionais elevadas em faturamentos de até R$ 3,6 milhões.
- **Ponto fraco:** Alíquotas marginais elevadas nas faixas 5 e 6 (> 15% a 20%) e restrição de créditos para clientes.

2. **Lucro Presumido:**
- **Ideal quando:** Empresa possui **margem de lucro real superior à presunção legal** (Presunção: 8% para comércio/indústria e 32% para serviços em geral);
- Folha de pagamento é baixa ou enxuta (pois incide 20% de INSS patronal + RAT + Terceiros ~28,8%);
- PIS (0,65%) e COFINS (3,00%) em regime cumulativo (sem complicação de créditos).

3. **Lucro Real:**
- **Ideal quando:** Empresa opera com **margens de lucro baixas (inferiores a 6% a 8%)**, ou em períodos de prejuízo fiscal (não há incidência de IRPJ e CSLL);
- Custos com insumos, mercadorias, aluguéis de prédios e energia elétrica são elevados (PIS 1,65% e COFINS 7,6% geram créditos financeiros diretos);
- Obrigatório para empresas com faturamento anual superior a R$ 78 milhões ou do setor financeiro/factoring.`,
    practicalExample: {
      scenario: 'Distribuidora com RBT12 de R$ 4.500.000,00, margem de lucro líquido de apenas 3,5% e compras volumosas de insumos com nota fiscal.',
      calculation: 'No Simples (Faixa 6 Anexo I): Paga ~11,8% sobre faturamento bruto = R$ 531.000/ano.\nNo Lucro Presumido: Presunção de 8% gera imposto superior ao lucro real da empresa.\nNo Lucro Real: IRPJ e CSLL incidem apenas sobre o lucro de 3,5% (R$ 157.500) = R$ 37.800 de IRPJ/CSLL, com créditos de PIS/COFINS absorvendo a maior parte das contribuições.',
      result: 'No Lucro Real, o imposto total anual cai para R$ 260.000,00, gerando economia líquida de R$ 271.000,00 ao ano frente ao Simples.',
    },
    rfbPrecedent: 'Instrução Normativa RFB nº 1.700/2017.',
    keyTakeaways: [
      'Nunca compare regimes apenas pela alíquota aparente; o DRE fiscal com custo de folha e crédito é indispensável.',
      'Folha de pagamento alta favorece o Simples Nacional (exceto Anexo IV).',
      'Margem de lucro baixa favorece o Lucro Real.',
    ],
  },
  {
    id: 'art-tabelas-anexos-oficiais',
    title: 'Tabelas Oficiais dos Anexos I, II, III, IV e V da LC 123/2006',
    category: 'tabelas_anexos',
    categoryLabel: 'Tabelas & Anexos I a V',
    tags: ['Anexo I', 'Anexo II', 'Anexo III', 'Anexo IV', 'Anexo V', 'Faixas', 'Parcela a Deduzir', 'Alíquota Nominal'],
    lawReference: 'LC 123/2006, Anexos I a V (redação dada pela Lei Complementar nº 155/2016)',
    summary: 'Compêndio oficial das 6 faixas de receita bruta anual, alíquotas nominais e parcelas a deduzir de todos os cinco anexos do Simples Nacional, acompanhado das regras de repartição de tributos.',
    content: `Estrutura Oficial dos 5 Anexos do Simples Nacional:

### Anexo I - Comércio
- **1ª Faixa (até R$ 180k):** Alíquota 4,00% | Dedução: R$ 0,00
- **2ª Faixa (R$ 180k a R$ 360k):** Alíquota 7,30% | Dedução: R$ 5.940,00
- **3ª Faixa (R$ 360k a R$ 720k):** Alíquota 9,50% | Dedução: R$ 13.860,00
- **4ª Faixa (R$ 720k a R$ 1,8M):** Alíquota 10,70% | Dedução: R$ 22.500,00
- **5ª Faixa (R$ 1,8M a R$ 3,6M):** Alíquota 14,30% | Dedução: R$ 87.300,00
- **6ª Faixa (R$ 3,6M a R$ 4,8M):** Alíquota 19,00% | Dedução: R$ 378.000,00

### Anexo II - Indústria
- **1ª Faixa:** 4,50% | Ded: R$ 0
- **2ª Faixa:** 7,80% | Ded: R$ 5.940,00
- **3ª Faixa:** 10,00% | Ded: R$ 13.860,00
- **4ª Faixa:** 11,20% | Ded: R$ 22.500,00
- **5ª Faixa:** 14,70% | Ded: R$ 85.500,00
- **6ª Faixa:** 30,00% | Ded: R$ 720.000,00

### Anexo III - Serviços em Geral & Fator R ≥ 28%
- **1ª Faixa:** 6,00% | Ded: R$ 0
- **2ª Faixa:** 11,20% | Ded: R$ 9.360,00
- **3ª Faixa:** 13,50% | Ded: R$ 17.640,00
- **4ª Faixa:** 16,00% | Ded: R$ 35.640,00
- **5ª Faixa:** 21,00% | Ded: R$ 125.640,00
- **6ª Faixa:** 33,00% | Ded: R$ 648.000,00

### Anexo IV - Serviços Específicos (Construção, Advocacia, Vigilância)
*Nota: A CPP patronal não está inclusa no DAS do Anexo IV, sendo recolhida à parte via DCTFWeb.*
- **1ª Faixa:** 4,50% | Ded: R$ 0
- **2ª Faixa:** 9,00% | Ded: R$ 8.100,00
- **3ª Faixa:** 10,20% | Ded: R$ 12.420,00
- **4ª Faixa:** 14,00% | Ded: R$ 39.780,00
- **5ª Faixa:** 22,00% | Ded: R$ 183.780,00
- **6ª Faixa:** 33,00% | Ded: R$ 828.000,00

### Anexo V - Serviços Intelectuais (Fator R < 28%)
- **1ª Faixa:** 15,50% | Ded: R$ 0
- **2ª Faixa:** 18,00% | Ded: R$ 4.500,00
- **3ª Faixa:** 19,50% | Ded: R$ 9.900,00
- **4ª Faixa:** 20,50% | Ded: R$ 17.100,00
- **5ª Faixa:** 23,00% | Ded: R$ 62.100,00
- **6ª Faixa:** 30,50% | Ded: R$ 540.000,00`,
    keyTakeaways: [
      'A alíquota efetiva nunca é igual à alíquota nominal, devido à dedução progressiva.',
      'A transição entre faixas é suave e contínua, sem degraus abruptos de tributação.',
      'No Anexo IV, adicione 20% de INSS patronal + RAT sobre a folha para cálculo do custo real.',
    ],
  },
  {
    id: 'art-jurisprudencia-cosit-carf',
    title: 'Jurisprudência Relevante: Soluções de Consulta COSIT e Julgados CARF',
    category: 'jurisprudencia_rfb',
    categoryLabel: 'Soluções COSIT & Pareceres',
    tags: ['COSIT', 'CARF', 'Jurisprudência', 'Precedentes Fiscais', 'Defesa Administrativa'],
    lawReference: 'Regimento Interno do CARF; Portaria RFB nº 2.053/2021',
    summary: 'Seleção das principais decisões administrativas da Receita Federal e do Conselho Administrativo de Recursos Fiscais (CARF) que vinculam a fiscalização tributária nacional.',
    content: `Precedentes Fundamentais para a Prática Tributária:

1. **Solução de Consulta COSIT nº 145/2018:**
Define a fórmula vinculante para apuração de receita de empresas em início de atividade. Estabelece que mesmo sem completar 12 meses de vida, a empresa possui base matemática obrigatória de RBT12 calculada pela média móvel.

2. **Acórdão CARF nº 1402-004.981 (Simulação Societária):**
Mantém a exclusão do Simples de sociedades que compartilhavam sede física, funcionários e clientes com sócios comuns detendo mais de 10% do capital. Considera fracionamento artificial de receitas para evasão do teto de R$ 4,8 milhões.

3. **Solução de Consulta COSIT nº 216/2021 (Fator R e Pró-Labore):**
Confirma que o pró-labore dos sócios administradores devidamente escriturado no eSocial e com recolhimento da contribuição previdenciária integra a folha de salários para efeito do cálculo do Fator R do Art. 18 § 5º-J.

4. **Tema 1050 do STJ:**
Determina a legalidade da apuração segregada de PIS e COFINS monofásicos por optantes do Simples Nacional, autorizando o pedido de restituição via PER/DCOMP Web sem exigência de ação judicial.`,
    keyTakeaways: [
      'Soluções de Consulta COSIT têm efeito vinculante perante todos os auditores fiscais da Receita Federal do Brasil.',
      'O CARF desconsidera atos societários sem propósito negocial que visem apenas reduzir tributos.',
      'Fundamentar defesas em precedentes COSIT aumenta em 90% as chances de cancelamento de autos de infração.',
    ],
  },
  {
    id: 'art-ncm-classificacao-segregacao',
    title: 'NCM, CEST e Segregação Tributária: Monofásicos, ICMS-ST, Imunidades e Imposto Seletivo',
    category: 'icms_st',
    categoryLabel: 'ICMS, ST & CFOPs',
    tags: ['NCM', 'CEST', 'PIS/COFINS Monofásico', 'ICMS-ST', 'Imposto Seletivo', 'Imunidades', 'CFOP 5.405'],
    lawReference: 'Lei Complementar nº 123/2006, Art. 18, § 4º-A; Lei nº 10.147/2000; Convênio ICMS 142/2018; EC nº 132/2023',
    summary: 'Guia completo de classificação fiscal de mercadorias. A segregação correta de NCMs sujeitos à Substituição Tributária de ICMS e à tributação monofásica de PIS/COFINS permite abater de 40% a 55% da guia DAS no Simples Nacional e recuperar valores pagos a maior nos últimos 5 anos via PER/DCOMP.',
    content: `A classificação por Nomenclatura Comum do Mercosul (NCM) e Código Especificador da Substituição Tributária (CEST) define o tratamento tributário em todos os regimes:

1. **PIS e COFINS Monofásicos (Lei nº 10.147/2000 & Lei nº 13.097/2015):**
   - Indústrias e importadores recolhem com alíquotas concentradas majoradas.
   - Varejistas e atacadistas possuem alíquota zero (CST PIS/COFINS 04).
   - No Simples Nacional, desmarca-se o PIS e a COFINS no PGDAS-D, reduzindo a alíquota da guia em até 17%.

2. **Substituição Tributária de ICMS (ICMS-ST - Convênio 142/2018):**
   - O imposto estadual de toda a cadeia é recolhido pelo substituto tributário (indústria/importador) com base na MVA (Margem de Valor Agregado).
   - O revendedor (CFOP 5.405 / 6.404 / CSOSN 500) segrega a receita no PGDAS-D sem recolher o ICMS do Simples, abatendo ~33,5% da alíquota do Anexo I.

3. **Imunidades Constitucionais (Art. 150, VI da CF/88):**
   - Livros, jornais, periódicos e o papel destinado à sua impressão são imunes a impostos (ICMS, IPI, PIS/COFINS).
   - Exportação de mercadorias para o exterior também é imune a ICMS, IPI, PIS e COFINS.

4. **Reforma Tributária & Imposto Seletivo (EC 132/2023):**
   - Produtos nocivos à saúde e ao meio ambiente (cigarros, bebidas alcoólicas, bebidas açucaradas, veículos a combustão) estarão sujeitos ao Imposto Seletivo ("Imposto do Pecado") monofásico na produção/extração/importação.`,
    keyTakeaways: [
      'Cadastrar produtos com NCM e CEST corretos é a principal fonte de economia no comércio varejista.',
      'A não segregação de CFOP 5.405 e PIS monofásico no PGDAS-D gera bitributação imediata.',
      'Valores pagos indevidamente nos últimos 60 meses podem ser restituídos diretamente na conta corrente em até 60 dias.',
    ],
  },
  {
    id: 'art-lc116-servicos-retencoes',
    title: 'Lista de Serviços da LC 116/2003: Local de Incidência do ISS, Retenções Federais e Enquadramento',
    category: 'simples_nacional',
    categoryLabel: 'Simples Nacional & LC 123/06',
    tags: ['LC 116/2003', 'ISSQN', 'Local de Incidência', 'Retenção na Fonte', 'IRRF', 'CSRF', 'INSS 11%'],
    lawReference: 'Lei Complementar nº 116/2003, Arts. 3º e 6º; Decreto nº 9.580/2018 (RIR/18, Art. 714); Lei nº 10.833/2003, Art. 30; Lei nº 8.212/1991, Art. 31',
    summary: 'Mapeamento pericial dos 40 itens da lista anexa à LC 116/2003. Regras de competência tributária municipal (local do prestador vs tomador), retenções de tributos federais na fonte (IRRF 1,5%, CSRF 4,65%, INSS 11%) e correlação com os Anexos III, IV e V do Simples Nacional.',
    content: `A prestação de serviços no Brasil é regida pela Lei Complementar nº 116/2003 e normas federais de retenção:

1. **Local de Incidência do ISS (Art. 3º da LC 116/2003):**
   - **Regra Geral:** O ISS é devido no local do **estabelecimento prestador** (ou do domicílio do prestador na falta de estabelecimento).
   - **Exceções (Incisos I a XXV):** O ISS é devido no local da **execução do serviço/obra** nos casos de construção civil (item 7.02), vigilância e limpeza (item 11.02 / 17.05), feiras e eventos (item 12.07), entre outros.

2. **Retenções Federais na Fonte para Pessoas Jurídicas (PJ para PJ):**
   - **IRRF (1,5% ou 1,0%):** Serviços profissionais regulamentados (Art. 714 RIR/18). Dispensa quando o prestador for optante pelo Simples Nacional (Art. 1º da IN RFB 765/07).
   - **CSRF 4,65% (PIS 0,65% + COFINS 3,0% + CSLL 1,0%):** Devida na contratação de serviços de assessoria, consultoria, informática e segurança (Art. 30 Lei 10.833/03). Dispensada para prestadores no Simples Nacional.
   - **INSS 11% (Cessão de Mão de Obra):** Retenção obrigatória sobre a fatura de limpeza, vigilância, portaria e construção civil (Art. 31 da Lei 8.212/91), inclusive para optantes do Simples enquadrados no Anexo IV.

3. **Enquadramento nos Anexos do Simples Nacional:**
   - **Anexo III (6% inicial):** Manutenção, transporte municipal, serviços gerais e atividades intelectuais com Fator R ≥ 28%.
   - **Anexo IV (4,5% inicial):** Construção civil, advocacia, vigilância e limpeza (CPP patronal de 20% recolhida por fora na DCTFWeb).
   - **Anexo V (15,5% inicial):** Atividades intelectuais com Fator R < 28%.`,
    keyTakeaways: [
      'Empresas no Simples Nacional sofrem apenas retenção de ISS (quando a lei municipal exigir) e INSS 11% (no Anexo IV em cessão de mão de obra). Estão dispensadas de IRRF e CSRF na fonte.',
      'Emitir NFS-e com o código do item da LC 116 correto previne autuações por bitributação de ISS entre municípios concorrentes.',
      'A transição para o IBS municipal na Reforma Tributária unificará as regras de local de destino até 2033.',
    ],
  },
];
