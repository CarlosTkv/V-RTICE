import { ConhecimentoItem } from '../conhecimentosData';

export const CONHECIMENTOS_SOCIETARIO: ConhecimentoItem[] = [
  {
    id: 'con-soc-01',
    title: 'Normas DREI nº 81/2020 e Constituição/Alteração de LTDA e Sociedade Limitada Unipessoal (SLU)',
    assunto: 'societario',
    assuntoLabel: 'Societario & Juntas',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Instrução Normativa DREI nº 81/2020 e Lei nº 13.874/2019 (Lei da Liberdade Econômica)',
    orgaoEmissor: 'Departamento Nacional de Registro Empresarial e Integração (DREI) / Juntas Comerciais',
    resumoTecnico: 'Procedimentos padronizados e manuais de registro de atos societários no âmbito das Juntas Comerciais das 27 UFs via Redesim, viabilidade locacional, DBE e arquivamento digital com assinatura ICP-Brasil ou gov.br.',
    conteudoDetalhador: `A IN DREI nº 81/2020 unificou as regras de registro mercantil no Brasil:

1. A Sociedade Limitada Unipessoal (SLU - Art. 1.052, §§ 1º e 2º do Código Civil):
- Extinção prática da EIRELI: A SLU permite a constituição de sociedade limitada com um único sócio (pessoa física ou jurídica), sem exigência de capital social mínimo de 100 salários-mínimos;
- Preservação da blindagem patrimonial: o patrimônio pessoal do titular não responde pelas dívidas negociais da empresa (salvo fraude comprovada nos termos do Art. 50 do CC).

2. Fases Integradas da Redesim:
- Consulta Prévia de Viabilidade: Análise automatizada de Nome Empresarial (Junta) e Endereço/Zoneamento Urbano (Prefeitura);
- Coletor Nacional da Receita Federal (DBE - Documento Básico de Entrada): Geração do protocolo de CNPJ, enquadramento de porte (ME/EPP/Demais) e definição de quadro de sócios e administradores (QSA);
- Registro Integrador Estadual (FCN/VRE): Elaboração do Contrato Social Padronizado ou Personalizado;
- Inscrições Tributárias Fiscais: Emissão simultânea do CNPJ, Inscrição Estadual (SEFAZ) e Inscrição Municipal (CCM).

3. Desregulamentação pela Lei de Liberdade Econômica:
- Registro automático de atos constitutivos padronizados sem análise humana prévia para empresas de baixo risco (apenas checagem formal pós-registro).`,
    fundamentacaoLegal: [
      'Instrução Normativa DREI nº 81/2020 (Consolidação das Normas de Registro)',
      'Lei nº 13.874/2019 (Declaração de Direitos de Liberdade Econômica)',
      'Art. 1.052 do Código Civil (Lei nº 10.406/2002)'
    ],
    exemploPratico: {
      cenario: 'Empresário individual deseja constituir uma sociedade limitada unipessoal para prestação de serviços de TI com capital de R$ 10.000,00.',
      aplicacao: 'Abertura 100% digital via Portal Integrador da Junta Comercial com assinatura digital gov.br Ouro/Prata, gerando CNPJ, IE e CCM em menos de 24 horas sem necessidade de sócio fictício.',
      conclusao: 'Constituição ágil com segregação patrimonial garantida sem exigência de capital mínimo estratosférico.'
    },
    tags: ['DREI 81/20', 'SLU', 'Sociedade Limitada', 'Redesim', 'Junta Comercial', 'Liberdade Econômica'],
    linkDireitoId: 'dir-emp-01'
  },
  {
    id: 'con-soc-02',
    title: 'Reorganizações Societárias: Fusão, Cisão (Total e Parcial), Incorporação e Transformação',
    assunto: 'societario',
    assuntoLabel: 'Societario & Juntas',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Arts. 220 a 234 da Lei nº 6.404/1976 e Arts. 1.113 a 1.122 do Código Civil',
    orgaoEmissor: 'Juntas Comerciais / Receita Federal do Brasil / CVM',
    resumoTecnico: 'Operações societárias estruturadas para reestruturação patrimonial, segregação de riscos, consolidação de mercado (M&A) e otimização fiscal, envolvendo laudos periciais de avaliação de acervo líquido.',
    conteudoDetalhador: `As modalidades de reorganização societária são regidas por regras rígidas de sucessão:

1. Modalidades Societárias:
- Incorporação (Art. 227 da LSA): Operação pela qual uma ou mais sociedades são absorvidas por outra, que lhes sucede em todos os direitos e obrigações (a sociedade incorporada é extinta);
- Fusão (Art. 228 da LSA): Operação pela qual se unem duas ou mais sociedades para formar sociedade nova, extinguindo-se as sociedades originárias;
- Cisão (Art. 229 da LSA): Operação pela qual a companhia transfere parcelas do seu patrimônio para uma ou mais sociedades constituídas para esse fim ou já existentes:
  a) Cisão Total: Extingue-se a sociedade cindida e todo o patrimônio é dividido;
  b) Cisão Parcial: A sociedade cindida permanece existindo com o patrimônio remanescente;
- Transformação (Art. 220 da LSA): Mudança do tipo jurídico da sociedade (ex: de LTDA para S.A. ou de Sociedade Simples para Empresária) sem extinção da pessoa jurídica.

2. Aspectos Fiscais e Prejuízos Fiscais (Art. 33 da Lei 9.249/95):
- A pessoa jurídica sucessora por incorporação, fusão ou cisão NÃO pode se apropriar dos Prejuízos Fiscais de IRPJ e da Base Negativa de CSLL da sociedade extinta (perda definitiva do benefício fiscal);
- Na cisão parcial, a sociedade cindida perde os prejuízos fiscais proporcionalmente à parcela do patrimônio líquido transferida.

3. Laudo de Avaliação do Acervo Líquido:
Exige-se a nomeação de 3 peritos ou empresa especializada de auditoria para avaliação contábil do patrimônio a valor contábil ou a valor de mercado.`,
    fundamentacaoLegal: [
      'Arts. 220 a 234 da Lei nº 6.404/1976 (Lei das Sociedades por Ações)',
      'Arts. 1.113 a 1.122 da Lei nº 10.406/2002 (Código Civil)',
      'Art. 33 da Lei nº 9.249/1995 (Regras sobre Prejuízos Fiscais em M&A)'
    ],
    exemploPratico: {
      cenario: 'Grupo econômico deseja segregar seu patrimônio imobiliário (R$ 20M) da sua atividade industrial operacional de alto risco.',
      aplicacao: 'Execução de Cisão Parcial da empresa operacional com versão do acervo líquido imobiliário para uma nova sociedade holding patrimonial, mediante laudo contábil sem incidência de ITBI (Art. 156, § 2º, I da CF/88).',
      conclusao: 'Blindagem lícita dos imóveis corporativos contra passivos operacionais futuros da indústria.'
    },
    tags: ['Reorganização Societária', 'Incorporação', 'Cisão', 'Fusão', 'M&A', 'Holding Patrimonial'],
    linkDireitoId: 'dir-emp-01'
  },
  {
    id: 'con-soc-03',
    title: 'Certidões Negativas de Débitos (CNDs), Expedição de CPEN (Art. 206 CTN) e Transação Tributária (PGFN)',
    assunto: 'societario',
    assuntoLabel: 'Societario & Juntas',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Art. 205 e 206 do CTN, Lei nº 13.988/2020 e Portaria PGFN nº 6.757/2022',
    orgaoEmissor: 'Procuradoria-Geral da Fazenda Nacional (PGFN) / Receita Federal do Brasil',
    resumoTecnico: 'Monitoramento diário da regularidade fiscal da empresa para emissão de CND conjunta RFB/PGFN, obtenção de Certidão Positiva com Efeitos de Negativa (CPEN) e celebração de acordos de Transação Tributária no Portal Regularize.',
    conteudoDetalhador: `A CND é o documento indispensável para a continuidade operacional da pessoa jurídica (participação em licitações, obtenção de financiamentos e distribuição de dividendos):

1. Tipos de Certidões de Débito:
- CND (Certidão Negativa de Débitos - Art. 205 do CTN): Expedida quando não constam quaisquer pendências tributárias na Fazenda Pública;
- CPEN (Certidão Positiva com Efeitos de Negativa - Art. 206 do CTN): Tem os mesmos efeitos jurídicos da CND. É expedida quando existem débitos, porém com a EXIGIBILIDADE SUSPENSA (Art. 151 do CTN: parcelamento ativo, depósito judicial integral, recurso no CARF/PAF ou liminar judicial);
- CPD (Certidão Positiva de Débitos): Expedida quando existem débitos fiscais em aberto sem garantia e sem suspensão.

2. A Nova Transação Tributária Federal (Lei nº 13.988/2020 e Portaria PGFN 6.757/2022):
- Permite a negociação direta de débitos inscritos em Dívida Ativa da União no Portal Regularize;
- Benefícios conforme a Capacidade de Pagamento (Capag) da empresa:
  a) Descontos de até 70% sobre juros, multas e encargos legais;
  b) Parcelamento em até 120 ou 145 meses;
  c) Utilização de créditos acumulados de prejuízo fiscal e base negativa de CSLL para abater até 70% do saldo devedor remanescente;
- A adesão tempestiva à transação suspende a cobrança e libera a emissão de CPEN em menos de 48 horas.`,
    fundamentacaoLegal: [
      'Arts. 205 e 206 da Lei nº 5.172/1966 (Código Tributário Nacional)',
      'Lei nº 13.988/2020 (Marco Legal da Transação Tributária)',
      'Portaria PGFN nº 6.757/2022 (Regulamentação das Transações por Adesão e Individual)'
    ],
    exemploPratico: {
      cenario: 'Empresa com dívida de R$ 1.000.000,00 inscrita em Dívida Ativa da PGFN precisa renovar CND para assinar contrato com o Poder Público.',
      aplicacao: 'Adesão ao Edital de Transação da PGFN com desconto de 50% nos juros e multas, pagamento da entrada e parcelamento do saldo em 120 vezes.',
      conclusao: 'Emissão imediata da Certidão Positiva com Efeitos de Negativa (CPEN) liberando a assinatura do contrato.'
    },
    tags: ['CND', 'CPEN', 'Transação Tributária', 'PGFN', 'Regularize', 'Capag', 'CTN 206'],
    linkDireitoId: 'dir-trib-03'
  },
  {
    id: 'con-soc-04',
    title: 'Dissolução Parcial de Sociedade, Apuração de Haveres (Arts. 600 a 609 CPC) e Liquidação de Quotas',
    assunto: 'societario',
    assuntoLabel: 'Societario & Juntas',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Arts. 1.028 a 1.038 do Código Civil e Arts. 599 a 609 do Código de Processo Civil (Lei nº 13.105/2015)',
    orgaoEmissor: 'Juntas Comerciais / Poder Judiciário',
    resumoTecnico: 'Rito procedimental e metodologias contábeis para retirada de sócio, exclusão por justa causa, falecimento ou dissolução de vínculo societário com liquidação do valor real do patrimônio líquido da sociedade.',
    conteudoDetalhador: `A saída de sócio exige o levantamento formal do Balanço Especial de Determinação:

1. Hipóteses Legais de Dissolução Parcial:
- Direito de Retirada / Recesso (Art. 1.029 do CC): Em sociedade por prazo indeterminado, mediante notificação com antecedência mínima de 60 dias;
- Falecimento de Sócio (Art. 1.028 do CC): Pagamento do valor das quotas aos herdeiros (salvo se o contrato social previr a admissão dos herdeiros ou os sócios remanescentes acordarem a continuidade);
- Exclusão Judicial ou Extrajudicial por Justa Causa (Arts. 1.030 e 1.085 do CC): Exige ato de inegável gravidade praticado pelo sócio que coloque em risco a continuidade da empresa.

2. Metodologia de Apuração de Haveres (Art. 606 do CPC/2015):
- O critério legal padrão é o Balanço Especial de Determinação tomado na data da resolução da sociedade;
- Avaliação dos bens e direitos do ativo e passivo a VALOR DE SAÍDA (Valor de Mercado dos ativos e passivos), incluindo marcas e ativos intangíveis se pactuado;
- Vedação da utilização do Valor Patrimonial Contábil Histórico se houver discrepância com a realidade econômica (prevalência do valor de mercado).

3. Forma de Pagamento dos Haveres (Art. 1.031, § 2º do CC):
- Liquidada a quota, o valor apurado deve ser pago em dinheiro no prazo de 90 dias, a menos que o Contrato Social estipule prazo e parcelamento diversos (ex: 24 parcelas mensais).`,
    fundamentacaoLegal: [
      'Arts. 1.028 a 1.038 do Código Civil (Lei nº 10.406/2002)',
      'Arts. 599 a 609 do Código de Processo Civil (Lei nº 13.105/2015)',
      'Súmula 265 do STF e Jurisprudência Pacificada da 2ª Seção do STJ'
    ],
    exemploPratico: {
      cenario: 'Sócio dissidente detentor de 30% das quotas notifica a sociedade sobre sua retirada voluntária.',
      aplicacao: 'Elaboração de Balanço Especial de Determinação a valor de mercado avaliando o ativo imobilizado e estoques, apurando o valor líquido de R$ 600.000,00 a ser pago nas condições previstas na cláusula de dissolução do contrato social.',
      conclusao: 'Liquidação pacífica e juridicamente blindada dos haveres sem descapitalização abrupta da sociedade.'
    },
    tags: ['Dissolução Parcial', 'Apuração de Haveres', 'Balanço Especial', 'CPC 606', 'Direito de Retirada', 'Exclusão de Sócio'],
    linkDireitoId: 'dir-emp-01'
  },
  {
    id: 'con-soc-05',
    title: 'Acordo de Sócios e Acionistas: Tag Along, Drag Along, Preferência, Lock-up e Non-Compete',
    assunto: 'societario',
    assuntoLabel: 'Societario & Juntas',
    subdivisao: 'federal',
    subdivisaoLabel: 'Federal (RFB / PGFN / IPI / PGDAS)',
    normaOficial: 'Art. 118 da Lei nº 6.404/1976 e Art. 1.054 c/c Art. 421 do Código Civil',
    orgaoEmissor: 'Juntas Comerciais / Registro Público de Empresas',
    resumoTecnico: 'Instrumento parassocietário arquivado na sede da empresa que vincula todos os sócios e a própria administração quanto a regras de voto em bloco, compra e venda de quotas/ações, governança e desinvestimento.',
    conteudoDetalhador: `O Acordo de Sócios possui força vinculante direta perante a sociedade (Art. 118 da LSA):

1. Cláusulas de Proteção e Alocação de Participações:
- Tag Along (Direito de Saída Conjunta): Garante aos sócios minoritários o direito de vender suas quotas/ações nas mesmas condições de preço e prazo oferecidas por um terceiro comprador ao sócio controlador;
- Drag Along (Obrigação de Venda Conjunta): Confere ao sócio majoritário o poder de compelir os minoritários a venderem suas participações para um adquirente que exija 100% da empresa;
- Direito de Preferência (Right of First Refusal): Antes de alienar quotas/ações a terceiros, o sócio deve ofertá-las prioritariamente aos demais sócios pelo mesmo preço e condições;
- Shotgun / Russian Roulette: Mecanismo de resolução de impasse (deadlock) onde um sócio oferece comprar a cota do outro por determinado valor, e o outro tem o direito de vender ou comprar pelo mesmo preço unitário.

2. Cláusulas Operacionais e de Governança:
- Lock-up: Período de carência durante o qual os sócios fundadores estão terminantemente proibidos de alienar suas quotas a terceiros;
- Non-Compete (Não Concorrência): Vedação de atuar direta ou indiretamente em negócio concorrente durante a vigência da sociedade e por até 2 a 5 anos após a sua saída;
- Execução Específica do Acordo (Art. 118, § 8º da LSA): O presidente da assembleia ou reunião de sócios DEVE desconsiderar qualquer voto proferido em violação ao acordo devidamente arquivado.`,
    fundamentacaoLegal: [
      'Art. 118 da Lei nº 6.404/1976 (Eficácia dos Acordos de Acionistas)',
      'Art. 1.054 da Lei nº 10.406/2002 (Aplicação supletiva da LSA às Limitadas)',
      'Enunciado 549 da VI Jornada de Direito Civil'
    ],
    exemploPratico: {
      cenario: 'Startup com 3 fundadores recebe proposta de compra de fundo de Venture Capital por 80% do capital.',
      aplicacao: 'Aplicação da cláusula de Drag Along com arquivamento do termo na Junta Comercial garantindo a venda uniforme e protegendo a avaliação pactuada.',
      conclusao: 'Segurança jurídica para os investidores e cumprimento das diretrizes de governança corporativa.'
    },
    tags: ['Acordo de Sócios', 'Tag Along', 'Drag Along', 'Lock-up', 'Non-Compete', 'Governança Corporativa'],
    linkDireitoId: 'dir-emp-01'
  }
];
