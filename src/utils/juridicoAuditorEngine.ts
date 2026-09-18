// =====================================================================================
// VÉRTICE LEGAL LAB - MOTOR DE AUDITORIA FORENSE & JURÍDICA ESPECIALISTA 360°
// Nível: Supremo Tribunal Federal (STF), Superior Tribunal de Justiça (STJ),
// Vade Mecum, Código Civil, Código de Processo Civil, Lei 6.404/76, Lei 13.874/19 (LLE),
// Lei 14.451/22 (Quóruns) e Instruções Normativas DREI 81/2020.
// =====================================================================================

export interface AuditPillar {
  id: string;
  name: string;
  axis: string;
  score: number;
  maxScore: number;
  status: 'conforme' | 'ajuste_necessario' | 'critico';
  legalRef: string;
  courtPrecedent: string;
  diagnostic: string;
  recommendation: string;
}

export interface AuditIssue {
  id: string;
  code: string;
  title: string;
  severity: 'Crítico' | 'Alto' | 'Moderado' | 'Preventivo';
  pillarId: string;
  legalBase: string;
  law?: string;
  courtJurisprudence: string;
  reason: string;
  desc?: string;
  practicalRisk: string;
  clauseFixTitle: string;
  clauseFix: string;
}

export interface CourtBenchmark {
  court: 'STF' | 'STJ' | 'CARF' | 'TST' | 'DREI';
  title: string;
  precedentNumber: string;
  doctrine: string;
  isCompliant: boolean;
  statusText: string;
  riskEvaluation: string;
  correctiveAction: string;
}

export interface AuditResultData {
  score: number;
  rating: string;
  level: 'blindagem_maxima' | 'risco_moderado' | 'alto_risco';
  levelLabel: string;
  timestamp: string;
  modelId: string;
  modelTitle: string;
  wordCount: number;
  charCount: number;
  
  // Requisitos Fundamentais (Art. 104 CC)
  validityCheck: {
    agenteCapaz: boolean;
    objetoLicito: boolean;
    formaPrescrita: boolean;
  };

  // Elementos Vitais da Estrutura Societária
  vitalsCheck: {
    preambulo: boolean;
    objeto: boolean;
    preco: boolean;
    vigencia: boolean;
    protecao: boolean;
    foro: boolean;
  };

  // 8 Eixos de Auditoria Forense
  pillars: AuditPillar[];

  // Confronto com Precedentes dos Tribunais Superiores
  courtBenchmarks: CourtBenchmark[];

  // Dimensões antigas mantidas para compatibilidade com o relatório PDF existente
  dimensions: {
    capacidadeValidade: { score: number; status: string; details: string };
    objetoFuncaoSocial: { score: number; status: string; details: string };
    formaEficaciaRegistral: { score: number; status: string; details: string };
    barreiraDesconsideracao: { score: number; status: string; details: string };
    gravamesSucessao: { score: number; status: string; details: string };
    tributarioValuation: { score: number; status: string; details: string };
  };

  // Lista de Vulnerabilidades e Cláusulas de Correção Prontas
  issues: AuditIssue[];
}

// =====================================================================================
// BASE ENCICLOPÉDICA DE CLÁUSULAS DE ELITE (PADRÃO TRIBUNAIS SUPERIORES)
// =====================================================================================

export const ELITE_AUDIT_CLAUSES: Record<string, {
  title: string;
  badge: string;
  legalBase: string;
  courtRef: string;
  text: string;
}> = {
  ISSUE_AUTONOMIA_PATRIMONIAL: {
    title: 'Autonomia Patrimonial & Barreira Rígida contra IDPJ (Art. 49-A e 50 CC)',
    badge: 'Art. 50 CC / Lei 13.874/19',
    legalBase: 'Art. 49-A e Art. 50 do Código Civil (com redação da Lei Federal nº 13.874/2019) e Arts. 133 a 137 do CPC',
    courtRef: 'STJ - 2ª Seção - EREsp 1.306.553/SC e Tema Repetitivo 1.075',
    text: `CLÁUSULA DE AUTONOMIA PATRIMONIAL, SEPARAÇÃO DE ESFERAS JURÍDICAS E LIMITAÇÃO DE RESPONSABILIDADE (ARTS. 49-A E 50 DO CÓDIGO CIVIL / LEI FEDERAL Nº 13.874/2019 / ARTS. 133 A 137 DO CPC):
Em estrita observância aos Artigos 49-A e 50 do Código Civil brasileiro, com a redação outorgada pela Lei da Liberdade Econômica (Lei Federal nº 13.874/2019), estipula-se de forma expressa, irrevogável e solene que a pessoa jurídica não se confunde, sob nenhum aspecto fático ou de direito, com os seus sócios, administradores, herdeiros ou sociedades coligadas.
Parágrafo Primeiro: O patrimônio social responderá integral e exclusivamente pelas obrigações legitimamente contraídas pela sociedade, sendo peremptoriamente vedada a desconsideração da personalidade jurídica (disregard of the legal entity) por mera insolvência, iliquidez, inadimplemento negocial, protestos ou encerramento irregular, exigindo-se em qualquer hipótese o preenchimento cabal, objetivo e estrito dos requisitos cumulativos de: (a) desvio doloso de finalidade societária mediante prática reiterada de atos lesivos a credores; ou (b) confusão patrimonial real demonstrada pela transferência sistemática e habitual de recursos pessoais sem a correspondente contraprestação contábil.
Parágrafo Segundo: Caso qualquer autoridade judicial ou administrativa venha a instaurar Incidente de Desconsideração da Personalidade Jurídica (IDPJ), deverão ser rigorosamente assegurados o contraditório prévio, a ampla defesa e a suspensão da exigibilidade executiva de bens particulares dos sócios até decisão de mérito transitada em julgado, consoante impõem os Artigos 133 a 137 do Código de Processo Civil.`
  },

  ISSUE_BALANCO_DETERMINACAO: {
    title: 'Apuração de Haveres por Balanço Especial de Determinação (STJ REsp 1.877.331/SP)',
    badge: 'STJ REsp 1.877.331/SP',
    legalBase: 'Art. 1.031 do Código Civil c/c Art. 604 e 605 do Código de Processo Civil',
    courtRef: 'STJ - 2ª Seção - REsp 1.877.331/SP (Rel. Min. Raul Araújo)',
    text: `CLÁUSULA DE CRITÉRIO E METODOLOGIA DE APURAÇÃO DE HAVERES POR BALANÇO ESPECIAL DE DETERMINAÇÃO (ART. 1.031 DO CÓDIGO CIVIL, ARTS. 604/605 DO CPC E PRECEDENTE VINCULANTE DO STJ RESP 1.877.331/SP):
Na ocorrência de retirada voluntária, exclusão motivada, falecimento, interdição ou qualquer forma de dissolução parcial da sociedade em relação a um ou mais sócios, a liquidação das quotas e a apuração dos haveres devidos serão processadas obrigatoriamente através da elaboração de BALANÇO ESPECIAL DE DETERMINAÇÃO, tomando-se como marco temporal improrrogável a exata data da resolução da sociedade (Artigo 605 do Código de Processo Civil).
Parágrafo Primeiro: O Balanço Especial de Determinação avaliará com precisão contábil o patrimônio líquido real da sociedade, procedendo-se à reavaliação de todos os bens do ativo imobilizado corpóreo e incorpóreo, realizáveis e passivos contingentes a valor justo de liquidação e saída no mercado. Fica expressa e solenemente repudiada e vedada qualquer tentativa de arbitramento por Fluxo de Caixa Descontado (FCD), múltiplos de EBITDA ou projeções de rentabilidade futura, por se tratar de sociedade de pessoas assentada no estrito intuitu personae, em conformidade com a jurisprudência pacificada e vinculante da Segunda Seção do Superior Tribunal de Justiça (REsp nº 1.877.331/SP).
Parágrafo Segundo: O montante líquido total dos haveres apurados na forma do caput será liquidado pela sociedade aos sócios retirantes, excluídos ou aos respectivos sucessores legítimos em até 36 (trinta e seis) parcelas mensais, iguais e sucessivas, com carência inicial de 180 (cento e oitenta) dias contados da homologação do balanço especial, devidamente corrigidas pela variação positiva acumulada do IPCA/IBGE, sem incidência de juros remuneratórios usurários ou vencimento antecipado das vincendas, de modo a resguardar a higidez operacional e a continuidade da empresa (Artigo 421-A do Código Civil).`
  },

  ISSUE_INCOMUNICABILIDADE: {
    title: 'Incomunicabilidade Qualificada com Extensão Expressa a Frutos e Dividendos',
    badge: 'Art. 1.911 c/c 1.660 CC',
    legalBase: 'Art. 1.911 c/c Art. 1.660, inciso V do Código Civil brasileiro',
    courtRef: 'STJ - 4ª Turma - REsp 1.590.222/SP e REsp 1.957.548/PR',
    text: `CLÁUSULA DE INCOMUNICABILIDADE QUALIFICADA COM EXTENSÃO CONVENCIONAL IRRESTRITA A FRUTOS CIVIS E DIVIDENDOS (ARTS. 1.660, V E 1.911 DO CÓDIGO CIVIL):
As quotas sociais de emissão desta sociedade atribuídas, transferidas, sub-rogadas, doadas ou conferidas aos sócios — bem como quaisquer novas quotas decorrentes de futuras capitalizações de reservas, aumentos de capital, bonificações ou desdobramentos — são gravadas de pleno direito com a CLÁUSULA DE INCOMUNICABILIDADE ABSOLUTA E VITALÍCIA.
Parágrafo Primeiro: As quotas gravadas não se comunicarão nem integrarão o monte patrimonial de comunhão em decorrência de matrimônio, união estável ou concubinato sob qualquer dos regimes legais ou convencionais de bens adotados pelos sócios (inclusive comunhão parcial, comunhão universal ou participação final nos aquestos), presentes ou supervenientes.
Parágrafo Segundo: Por convenção expressa, unânime e voluntária dos contratantes nos termos da liberdade negocial (Art. 421 do CC), a presente incomunicabilidade estende-se categoricamente a todos os frutos civis, dividendos declarados, lucros retidos ou distribuídos, juros sobre capital próprio (JCP) e créditos de adiantamento financeiro, afastando formal e peremptoriamente a incidência da comunicabilidade patrimonial estabelecida no Artigo 1.660, inciso V do Código Civil, de modo que nenhum cônjuge, convivente, meação ou credor do cônjuge poderá reivindicar fração de haveres ou lucros sociais.`
  },

  ISSUE_USUFRUTO_CONTROLE: {
    title: 'Doação de Quotas com Reserva de Usufruto Vitalício e Cisão de Direitos Políticos',
    badge: 'Arts. 1.390 a 1.411 CC',
    legalBase: 'Artigos 1.390 a 1.411 do Código Civil e Artigo 1.053 c/c Art. 114 da Lei Federal nº 6.404/1976',
    courtRef: 'STJ - 3ª Turma - REsp 1.848.472/SP e DREI/DREI Circular 81/2020',
    text: `CLÁUSULA DE TRANSMISSÃO DA NUA-PROPRIEDADE COM RESERVA DE USUFRUTO VITALÍCIO, SUCESSIVO E CISÃO DE DIREITOS POLÍTICOS E ECONÔMICOS (ARTS. 1.390 A 1.411 DO CÓDIGO CIVIL):
A alienação ou doação de quotas sociais representativas do capital aos sócios sucessores é aperfeiçoada sob a condição suspensiva e resolutiva expressa de DOAÇÃO DA NUA-PROPRIEDADE COM RESERVA DE USUFRUTO VITALÍCIO e SUCESSIVO em favor exclusivo dos Sócios Fundadores / Patriarcas.
Parágrafo Primeiro: Em decorrência direta do usufruto outorgado, confere-se com exclusividade aos Usufrutuários:
(a) O direito político absoluto e indelegável de voto, deliberação e representação em todas as Assembleias Gerais, Reuniões de Sócios, alterações do Contrato Social, eleição, remuneração ou destituição de administradores, aprovação de contas e fusões ou aquisições;
(b) O direito econômico incondicional à percepção de até 100% (cem por cento) dos lucros líquidos distribuídos, dividendos, juros sobre capital próprio e reservas financeiras acumuladas;
(c) O poder de veto irrecorrível contra qualquer ato de oneração, penhor, alienação ou cessão das quotas por parte dos nus-proprietários.
Parágrafo Segundo: O usufruto instituído é sucessivo e indivisível: em caso de falecimento de um dos usufrutuários, o direito ao usufruto consolidar-se-á integral e automaticamente na pessoa do usufrutuário sobrevivente, e somente se extinguirá em sua totalidade pelo advento de óbito do último deles ou por renúncia formal e pública devidamente levada a registro perante a Junta Comercial competente.`
  },

  ISSUE_REVERSAO_PREMORIENCIA: {
    title: 'Cláusula de Reversão por Premoriência do Donatário / Filho (Art. 547 CC)',
    badge: 'Art. 547 Código Civil',
    legalBase: 'Artigo 547 do Código Civil brasileiro',
    courtRef: 'STJ - 3ª Turma - REsp 1.758.544/SP (Eficácia ex tunc da cláusula resolutiva)',
    text: `CLÁUSULA DE REVERSÃO POR PREMORIÊNCIA DOS SÓCIOS DONATÁRIOS (ART. 547 DO CÓDIGO CIVIL):
Com amparo no Artigo 547 do Código Civil brasileiro, estipula-se em caráter irrevogável que, caso qualquer dos Sócios Donatários venha a falecer antes do Sócio Doador / Patriarca, a totalidade das quotas sociais a ele outorgadas ou transmitidas, juntamente com todos os seus direitos e prerrogativas decorrentes, REVERTERÁ automática, imediata e integralmente ao patrimônio e domínio exclusivo do Doador.
Parágrafo Único: A reversão pactuada opera pleno jure com eficácia ex tunc e constitui cláusula resolutiva expressa, não se transmitindo as quotas aos herdeiros, descendentes legítimos, meação de viúvo(a) ou inventário judicial do donatário falecido, ficando o Cartório de Registro ou a Junta Comercial autorizados a restabelecer o registro societário primitivo mediante a mera apresentação da certidão de óbito do sócio pré-morto.`
  },

  ISSUE_ITBI_INTEGRALIZACAO: {
    title: 'Imunidade Constitucional de ITBI estrita ao STF Tema 796 e Art. 156, § 2º, I CF',
    badge: 'STF Tema 796 / Art. 156 CF',
    legalBase: 'Art. 156, § 2º, inciso I da Constituição Federal c/c Arts. 36 e 37 do CTN',
    courtRef: 'STF - Pleno - Tema 796 de Repercussão Geral (RE 796.376/SC - Rel. Min. Alexandre de Moraes)',
    text: `CLÁUSULA DE IMUNIDADE TRIBUTÁRIA DE ITBI NA CONFERÊNCIA DE BENS IMÓVEIS AO CAPITAL EM ESTRITA CONFORMIDADE COM O STF TEMA 796 (ART. 156, § 2º, I DA CONSTITUIÇÃO FEDERAL E ARTS. 36 E 37 DO CTN):
A conferência e integralização dos bens imóveis descritos neste instrumento ao capital social da sociedade é instrumentalizada sob a égide da IMUNIDADE CONSTITUCIONAL TRIBUTÁRIA assegurada pelo Artigo 156, § 2º, inciso I da Constituição Federal brasileira e da tese vinculante fixada pelo Plenário do Supremo Tribunal Federal no TEMA 796 DE REPERCUSSÃO GERAL (Recurso Extraordinário nº 796.376/SC).
Parágrafo Primeiro: Para assegurar a inquestionável fruição da imunidade tributária sem risco de bitributação ou exigência municipal de ágio:
(a) O montante total do valor contábil dos imóveis conferidos é estritamente equivalente e integralmente imputado ao valor do capital social subscrito, não havendo constituição de reserva de capital, ágio na subscrição ou emissão de quotas com sobrepreço não imune;
(b) A sociedade atesta e declara sob as penas da lei que não exerce, não possui como atividade preponderante e não auferiu mais de 50% de sua receita operacional decorrente da venda ou locação de propriedades imobiliárias ou da cessão de direitos a elas relativos, nos 2 (dois) anos anteriores e nos 2 (dois) anos subsequentes à aquisição, atendendo plenamente aos requisitos dos Artigos 36 e 37 do Código Tributário Nacional (Lei nº 5.172/1966).`
  },

  ISSUE_TITULO_RGI_ART64: {
    title: 'Título Translativo Direto perante o Registro Imobiliário (Art. 64 Lei 8.934/94)',
    badge: 'Art. 64 Lei 8.934/1994',
    legalBase: 'Artigo 64 da Lei Federal nº 8.934/1994 (Lei do Registro Público de Empresas Mercantis)',
    courtRef: 'Conselho Nacional de Justiça (CNJ) - Pedido de Providências 0001053-88.2012 e Provimento CNJ 88',
    text: `CLÁUSULA DE EFICÁCIA TRANSLATIVA DIRETA DO CONTRATO SOCIAL PERANTE O REGISTRO IMOBILIÁRIO (DISPENSA DE ESCRITURA PÚBLICA - ART. 64 DA LEI FEDERAL Nº 8.934/1994):
O presente instrumento particular de alteração contratual / contrato social, após sua chancela, deferimento e arquivamento formal perante a Junta Comercial competente, constitui TÍTULO TRANSLATIVO HÁBIL, PLENO E AUTÔNOMO para a transferência dominial e registro definitivo da propriedade dos imóveis conferidos junto às respectivas matrículas do Cartório de Registro de Imóveis (CRI) competente.
Parágrafo Único: Consoante a disciplina expressa e cogente do Artigo 64 da Lei Federal nº 8.934/1994, fica total e categoricamente dispensada a lavratura notarial de escritura pública de compra e venda, permuta ou doação, cabendo ao Oficial Registrador imobiliário proceder à averbação imediata da titularidade da sociedade cessionária unicamente mediante a apresentação de certidão simplificada ou cópia autenticada do contrato arquivado na Junta Comercial.`
  },

  ISSUE_DEADLOCK_SHOTGUN: {
    title: 'Mecanismo Anti-Impasse Societário Shotgun / Texas Shootout (Art. 118 Lei 6.404/76)',
    badge: 'Deadlock / Shotgun',
    legalBase: 'Artigo 1.053, parágrafo único do Código Civil c/c Artigo 118 da Lei Federal nº 6.404/1976',
    courtRef: 'STJ - 3ª Turma - REsp 1.838.006/SP (Validade e vinculação de cláusula shotgun)',
    text: `CLÁUSULA DE SOLUÇÃO DE IMPASSE SOCIETÁRIO E MECANISMO DE SAÍDA FORÇADA "SHOTGUN" / "TEXAS SHOOTOUT" (ART. 118 DA LEI Nº 6.404/76 E ART. 1.053 CC):
Configurada situação de IMPASSE SOCIETÁRIO INSOLÚVEL (Deadlock) nas deliberações sociais, caracterizada pela impossibilidade fática de obtenção de quórum legal ou contratual deliberativo em duas Reuniões de Sócios consecutivas convocadas com intervalo mínimo de 15 (quinze) dias e que venha a ameaçar a consecução do fim social da empresa, qualquer um dos blocos societários poderá deflagrar a solução resolutiva de "Shotgun".
Parágrafo Primeiro: O Sócio Ofertante encaminhará Notificação Notarial ou Judicial ao Sócio Notificado especificando: (i) o valor unitário e total atribuído à aquisição de 100% das quotas sociais, lastreado em pagamento em dinheiro; e (ii) as condições comerciais e cronograma de liquidação.
Parágrafo Segundo: No prazo improrrogável de 30 (trinta) dias contados do recebimento formal da Notificação, o Sócio Notificado deverá exercer irrevogavelmente uma de duas opções exclusivas:
(a) Vender a integralidade de suas quotas ao Sócio Ofertante pelo preço unitário e condições pactuadas na notificação; OU
(b) Adquirir compulsoriamente a integralidade das quotas detidas pelo Sócio Ofertante exatamente pelo mesmo valor unitário e condições originais ofertadas.
Parágrafo Terceiro: O silêncio do Sócio Notificado transcorrido o prazo de 30 dias presumir-se-á concordância tácita e irretratável com a venda de suas quotas ao Sócio Ofertante, operando-se a adjudicação extrajudicial das quotas em favor deste mediante depósito judicial ou bancário do valor equivalente.`
  },

  ISSUE_QUORUNS_LEI14451: {
    title: 'Adequação dos Quóruns Deliberativos à Lei nº 14.451/2022 e Arts. 1.071/1.076 CC',
    badge: 'Lei 14.451/2022',
    legalBase: 'Arts. 1.061 e 1.076 do Código Civil (com alteração dada pela Lei nº 14.451/2022)',
    courtRef: 'DREI - Ofício Circular SEI nº 4509/2022/ME e Instrução Normativa DREI 81/20',
    text: `CLÁUSULA DE REGIME DELIBERATIVO E QUÓRUNS QUALIFICADOS ADEQUADOS À LEI FEDERAL Nº 14.451/2022 (ARTS. 1.061, 1.071 E 1.076 DO CÓDIGO CIVIL):
As deliberações dos sócios serão tomadas em Reunião de Sócios ou Assembleia de conformidade estrita com as balizas outorgadas pela Lei Federal nº 14.451/2022, observando-se os seguintes quóruns constitutivos:
(a) Pela maioria dos votos dos presentes: a aprovação das contas da administração, a designação dos administradores quando fixada no contrato e a remuneração da diretoria;
(b) Por mais da metade do capital social (50% mais uma quota): a alteração do contrato social, a modificação do objeto, a incorporação, a fusão, a dissolução voluntária da sociedade e a cessação do estado de liquidação;
(c) Por 2/3 (dois terços) dos votos do capital social: a designação de administradores não-sócios enquanto o capital não estiver integralizado, e por maioria absoluta após a sua integralização total (Art. 1.061 do CC);
Parágrafo Único: Ressalvam-se as matérias sujeitas ao direito de veto do Usufrutuário Vitalício titular dos direitos políticos das quotas, as quais exigirão expressa concordância escrita deste para qualquer alteração de seu status quo.`
  },

  ISSUE_DESIMPEDIMENTO_ADMIN: {
    title: 'Declaração Formal de Desimpedimento de Administradores (Art. 1.011, § 1º CC e IN DREI 81)',
    badge: 'Art. 1.011 CC / DREI 81',
    legalBase: 'Artigo 1.011, § 1º do Código Civil e Instrução Normativa DREI nº 81/2020',
    courtRef: 'Juntas Comerciais (JUCESP, JUCERJA, JUCEMG) e DREI',
    text: `CLÁUSULA DE DESIMPEDIMENTO LEGAL DOS ADMINISTRADORES (ART. 1.011, § 1º DO CÓDIGO CIVIL E IN DREI Nº 81/2020):
Os administradores ora eleitos e qualificados declaram formal e expressamente sob as penas da lei (especialmente as do Artigo 299 do Código Penal brasileiro):
(a) Que não estão condenados a pena que vede, ainda que temporariamente, o acesso a cargos públicos, ou por crime falimentar, de prevaricação, peita ou suborno, concussão, peculato, ou contra a economia popular, contra o sistema financeiro nacional, contra as normas de defesa da concorrência, contra as relações de consumo, contra a fé pública ou a propriedade;
(b) Que não estão incursos em qualquer outro impedimento legal ou condenação criminal que os incompatibilize para o exercício da administração de sociedades empresárias, preenchendo todos os requisitos de idoneidade previstos no Artigo 1.011, § 1º do Código Civil e na Instrução Normativa DREI nº 81/2020.`
  },

  ISSUE_ASSINATURA_DIGITAL: {
    title: 'Eficácia de Título Executivo Extrajudicial e Assinatura Eletrônica (MP 2.200-2 / Lei 14.063 / Art. 784 CPC)',
    badge: 'Art. 784, III CPC',
    legalBase: 'MP nº 2.200-2/2001, Lei Federal nº 14.063/2020 e Art. 784, inciso III do Código de Processo Civil',
    courtRef: 'STJ - 3ª Turma - REsp 1.495.920/DF (Validade de contratos assinados eletronicamente como títulos executivos)',
    text: `CLÁUSULA DE FORÇA EXECUTIVA EXTRAJUDICIAL, VALIDADE DE ASSINATURA ELETRÔNICA E TESTEMUNHAS INSTRUMENTÁRIAS (MP 2.200-2/2001, LEI Nº 14.063/2020 E ART. 784, III DO CPC):
As partes contratantes declaram e reconhecem mutuamente a plena validade jurídica, autenticidade e integridade do presente instrumento celebrado de forma física ou em meio eletrônico, mediante aposição de assinaturas com certificação digital emitida no âmbito da Infraestrutura de Chaves Públicas Brasileira (ICP-Brasil) ou assinaturas eletrônicas avançadas admitidas pela Lei Federal nº 14.063/2020 e Medida Provisória nº 2.200-2/2001.
Parágrafo Único: O presente instrumento, assinado pelas partes e por 2 (duas) testemunhas instrumentárias devidamente qualificadas, constitui TÍTULO EXECUTIVO EXTRAJUDICIAL de eficácia plena na forma do Artigo 784, inciso III do Código de Processo Civil, conferindo via executiva imediata para a exigibilidade de quaisquer obrigações pecuniárias ou de fazer pactuadas.`
  },

  ISSUE_NAO_SOLIDARIEDADE_TRABALHISTA: {
    title: 'Vedação à Presunção de Grupo Econômico Trabalhista (Art. 2º, § 2º CLT e Súmula 129 TST)',
    badge: 'Art. 2º, § 2º CLT',
    legalBase: 'Artigo 2º, §§ 2º e 3º da Consolidação das Leis do Trabalho (Lei nº 13.467/2017)',
    courtRef: 'TST - SDI-1 - E-ED-RR 1000781-42.2017.5.02.0463 e Súmula 129 TST',
    text: `CLÁUSULA DE AUTONOMIA OPERACIONAL E VEDAÇÃO À CARACTERIZAÇÃO DE GRUPO ECONÔMICO TRABALHISTA (ART. 2º, §§ 2º E 3º DA CLT / LEI 13.467/2017):
Fica expressamente estabelecido que a presente sociedade constitui unidade autônoma de fins eminentemente patrimoniais e de participação (holding passiva), sendo despida de qualquer ingerência, subordinação jurídica hierárquica ou coordenação operacional com sociedades operacionais investidas.
Parágrafo Único: Nos termos do Artigo 2º, § 3º da CLT (introduzido pela Lei nº 13.467/2017), a mera identidade de sócios (sócios comuns) não caracteriza grupo econômico empresarial para fins trabalhistas ou previdenciários, sendo indispensável a demonstração inequívoca de interesse integrado, efetiva comunhão de interesses e atuação conjunta das sociedades, ficando vedada qualquer presunção automática de solidariedade passiva.`
  }
};

// =====================================================================================
// MOTOR DE PROCESSAMENTO FORENSE DE TEXTO
// =====================================================================================

export function runForensicAuditEngine(textToAudit: string, selectedModelInfo: { id: string; title: string; vertical?: string }): AuditResultData {
  const textRaw = textToAudit || '';
  const text = textRaw.toLowerCase();
  const words = textRaw.trim() ? textRaw.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = textRaw.length;

  // 1. ANÁLISE DE REQUISITOS DE VALIDADE DO ART. 104 DO CÓDIGO CIVIL
  const hasAgenteCapaz = (
    text.includes('plenamente capaz') ||
    text.includes('capacidade civil') ||
    text.includes('maior e capaz') ||
    text.includes('sócio') ||
    text.includes('outorga') ||
    text.includes('representad') ||
    text.includes('procurador')
  ) && (
    text.includes('cpf') ||
    text.includes('identidade') ||
    text.includes('rg') ||
    text.includes('nacionalidade')
  );

  const hasObjetoLicito = (
    text.includes('objeto') ||
    text.includes('finalidade') ||
    text.includes('atividade')
  ) && (
    text.includes('lícito') ||
    text.includes('participação') ||
    text.includes('administração') ||
    text.includes('locação') ||
    text.includes('consultoria') ||
    text.includes('prestação de serviços') ||
    text.includes('holding') ||
    text.includes('incorporação')
  );

  const hasFormaPrescrita = (
    text.includes('testemunha') ||
    text.includes('junta comercial') ||
    text.includes('registro') ||
    text.includes('icp-brasil') ||
    text.includes('eletrônica') ||
    text.includes('14.063') ||
    text.includes('cartório') ||
    text.includes('assinam')
  );

  // 2. ELEMENTOS VITAIS DO CONTRATO
  const hasPreambulo = (
    text.includes('preâmbulo') ||
    text.includes('qualifica') ||
    text.includes('nome empresarial') ||
    text.includes('denomina') ||
    text.includes('razão social') ||
    text.includes('inscrita no cnp')
  ) && (text.includes('sócio') || text.includes('contratante') || text.includes('partes'));

  const hasObjeto = text.includes('objeto') || text.includes('finalidade');
  const hasPrecoOuCapital = text.includes('capital social') || text.includes('quotas') || text.includes('valor') || text.includes('preço') || text.includes('subscrição');
  const hasVigencia = text.includes('prazo') || text.includes('vigência') || text.includes('indeterminado') || text.includes('vitalício') || text.includes('duração');
  const hasGravames = text.includes('inalienabilidade') || text.includes('impenhorabilidade') || text.includes('incomunicabilidade') || text.includes('usufruto') || text.includes('reversão') || text.includes('blindagem');
  const hasForoArbitragem = text.includes('foro') || text.includes('arbitragem') || text.includes('comarca') || text.includes('câmara') || text.includes('mediação');

  // 3. ANÁLISE DE PRECEITOS TÉCNICOS ESPECÍFICOS (VADE MECUM & TRIBUNAIS)
  
  // Art. 50 CC / Lei da Liberdade Econômica 13.874 / IDPJ
  const hasAutonomiaArt50 = (
    text.includes('art. 50') ||
    text.includes('49-a') ||
    text.includes('liberdade econômica') ||
    text.includes('13.874') ||
    text.includes('autonomia patrimonial') ||
    text.includes('separação patrimonial') ||
    text.includes('desconsideração da personalidade jurídica')
  ) && (
    text.includes('desvio de finalidade') ||
    text.includes('confusão patrimonial') ||
    text.includes('insolvência')
  );

  // Apuração de Haveres e STJ REsp 1.877.331/SP
  const hasBalancoDeterminacao = (
    text.includes('balanço de determinação') ||
    text.includes('balanço especial de determinação') ||
    text.includes('1.877.331') ||
    (text.includes('1.031') && text.includes('determinação')) ||
    (text.includes('haveres') && text.includes('valor justo'))
  );

  const hasFCDViciousWarning = (
    text.includes('fluxo de caixa descontado') ||
    text.includes('fcd') ||
    (text.includes('múltiplos') && text.includes('ebitda') && text.includes('haveres'))
  );

  // Usufruto de Quotas com Cisão Política e Econômica
  const hasUsufrutoControle = (
    text.includes('usufruto') &&
    (text.includes('voto') || text.includes('delibera') || text.includes('político')) &&
    (text.includes('dividendos') || text.includes('lucros') || text.includes('proventos'))
  );

  // Incomunicabilidade Ampla Estendida a Dividendos (Art. 1.660, V e Art. 1.911 CC)
  const hasIncomunicabilidadeAmpla = (
    text.includes('incomunicabilidade') &&
    (text.includes('frutos') || text.includes('dividendos') || text.includes('1.660') || text.includes('lucros'))
  );

  // Reversão por Premoriência (Art. 547 CC)
  const hasReversao = (
    text.includes('reversão') ||
    text.includes('premoriência') ||
    text.includes('547')
  );

  // STF Tema 796 de Repercussão Geral (ITBI)
  const hasTema796 = (
    text.includes('tema 796') ||
    text.includes('796.376') ||
    (text.includes('itbi') && text.includes('capital social subscrito')) ||
    (text.includes('imunidade') && text.includes('excedente') && text.includes('ágio')) ||
    (text.includes('atividade preponderante') && text.includes('37 do ctn'))
  );

  // Art. 64 Lei 8.934/94 (Título Translativo Imobiliário no RGI)
  const hasTituloRGI = (
    text.includes('8.934') ||
    text.includes('art. 64') ||
    text.includes('título translativo') ||
    text.includes('dispensa de escritura pública') ||
    (text.includes('registro de imóveis') && text.includes('junta comercial'))
  );

  // Impasse Societário / Shotgun / Texas Shootout
  const hasDeadlockShotgun = (
    text.includes('shotgun') ||
    text.includes('texas shootout') ||
    text.includes('impasse') ||
    text.includes('deadlock') ||
    text.includes('roleta russa') ||
    text.includes('russian roulette') ||
    text.includes('compra e venda forçada')
  );

  // Quóruns Lei 14.451/2022
  const hasQuorunsAtualizados = (
    text.includes('14.451') ||
    text.includes('maioria dos votos dos presentes') ||
    text.includes('mais da metade do capital social') ||
    (text.includes('1.076') && (text.includes('50%') || text.includes('metade')))
  );

  // Declaração de Desimpedimento dos Administradores (Art. 1.011 CC e IN DREI 81/20)
  const hasDesimpedimentoAdmin = (
    text.includes('1.011') ||
    text.includes('desimpedimento') ||
    text.includes('crime falimentar') ||
    text.includes('peita') ||
    text.includes('prevaricação') ||
    text.includes('concussão') ||
    text.includes('drei 81')
  );

  // Outorga Conjugal (Art. 1.647 CC)
  const hasOutorgaConjugal = (
    text.includes('outorga') ||
    text.includes('uxória') ||
    text.includes('marital') ||
    text.includes('1.647') ||
    text.includes('cônjuge') ||
    text.includes('regime de bens') ||
    text.includes('separação total')
  );

  // Assinatura Eletrônica e Eficácia Executiva (Art. 784, III CPC)
  const hasAssinaturaExecutiva = (
    (text.includes('icp-brasil') || text.includes('14.063') || text.includes('2.200')) &&
    (text.includes('título executivo') || text.includes('784') || text.includes('testemunhas'))
  );

  // Não-Solidariedade Trabalhista (Art. 2º, § 2º CLT)
  const hasNaoSolidariedadeTrabalhista = (
    text.includes('grupo econômico') ||
    text.includes('solidariedade trabalhista') ||
    text.includes('art. 2º') ||
    text.includes('clt') ||
    text.includes('holding passiva')
  );

  // 4. CÁLCULO CIENTÍFICO E PONDERADO DO ÍNDICE DE SEGURANÇA JURÍDICA (0 a 100)
  let baseScore = 15; // Mínimo inicial por ter minuta estruturada

  // Requisitos Estruturais Gerais (máx 35 pts)
  if (hasAgenteCapaz) baseScore += 6;
  if (hasObjetoLicito) baseScore += 5;
  if (hasFormaPrescrita) baseScore += 5;
  if (hasPreambulo) baseScore += 4;
  if (hasPrecoOuCapital) baseScore += 5;
  if (hasVigencia) baseScore += 3;
  if (hasForoArbitragem) baseScore += 3;
  if (hasOutorgaConjugal) baseScore += 4;

  // Requisitos Especialistas de Blindagem & Tribunais Superiores (máx 60 pts)
  if (hasAutonomiaArt50) baseScore += 10;
  if (hasBalancoDeterminacao) baseScore += 10;
  if (hasUsufrutoControle) baseScore += 8;
  if (hasIncomunicabilidadeAmpla) baseScore += 8;
  if (hasTema796) baseScore += 7;
  if (hasDeadlockShotgun) baseScore += 6;
  if (hasReversao) baseScore += 4;
  if (hasTituloRGI) baseScore += 4;
  if (hasQuorunsAtualizados) baseScore += 4;
  if (hasDesimpedimentoAdmin) baseScore += 4;
  if (hasAssinaturaExecutiva) baseScore += 4;
  if (hasNaoSolidariedadeTrabalhista) baseScore += 3;

  // Penalização Cirúrgica por Erro Crítico Doutrinário
  if (hasFCDViciousWarning) {
    baseScore -= 18; // Vício fatal repudiado expressamente pelo STJ
  }

  // Trava de limites
  const score = Math.min(100, Math.max(12, Math.round(baseScore)));

  // Classificação
  let level: 'blindagem_maxima' | 'risco_moderado' | 'alto_risco' = 'alto_risco';
  let levelLabel = 'Vulnerabilidade Crítica / Alto Risco Processual';
  let rating = 'Alto Risco';

  if (score >= 85) {
    level = 'blindagem_maxima';
    levelLabel = 'Blindagem Máxima & Padrão de Tribunais Superiores';
    rating = 'Blindagem Máxima';
  } else if (score >= 60) {
    level = 'risco_moderado';
    levelLabel = 'Risco Moderado / Requer Cláusulas de Saneamento';
    rating = 'Risco Moderado';
  }

  // 5. CONSTRUÇÃO DOS 8 PILARES DO VADE MECUM E TRIBUNAIS
  const pillars: AuditPillar[] = [
    {
      id: 'pilar_validade_104',
      name: 'Validade Negocial & Agente Capaz',
      axis: 'Código Civil (Arts. 104, 1.647 e 1.660)',
      score: (hasAgenteCapaz && hasObjetoLicito && hasOutorgaConjugal) ? 100 : (hasAgenteCapaz && hasObjetoLicito) ? 75 : 35,
      maxScore: 100,
      status: (hasAgenteCapaz && hasObjetoLicito && hasOutorgaConjugal) ? 'conforme' : 'ajuste_necessario',
      legalRef: 'Art. 104, I, II, III e Art. 1.647, I do CC',
      courtPrecedent: 'STJ - 4ª Turma - REsp 1.590.222/SP',
      diagnostic: (hasAgenteCapaz && hasOutorgaConjugal)
        ? 'Qualificação completa das partes, capacidade civil inconteste e menção a outorga uxória/marital.'
        : 'Ausência de outorga conjugal expressa ou indicação do regime matrimonial dos sócios.',
      recommendation: 'Incluir declaração expressa do regime matrimonial e outorga conjugal para atos de oneração patrimonial.'
    },
    {
      id: 'pilar_art50_autonomia',
      name: 'Autonomia Patrimonial & Blindagem contra IDPJ',
      axis: 'Código Civil (Arts. 49-A e 50) / Lei 13.874/19 (LLE)',
      score: hasAutonomiaArt50 ? 100 : 20,
      maxScore: 100,
      status: hasAutonomiaArt50 ? 'conforme' : 'critico',
      legalRef: 'Arts. 49-A e 50 do CC / Arts. 133-137 do CPC',
      courtPrecedent: 'STJ - 2ª Seção - EREsp 1.306.553/SC e Tema Repetitivo 1.075',
      diagnostic: hasAutonomiaArt50
        ? 'Barreira de proteção sólida contra desconsideração da personalidade jurídica conforme a Lei da Liberdade Econômica.'
        : 'Vulnerabilidade Crítica: Contrato desprovido de cláusula de limitação de responsabilidade e separação de esferas patrimoniais.',
      recommendation: 'Injetar cláusula resolutiva com critérios da Lei nº 13.874/2019 e exigência de contraditório prévio no IDPJ.'
    },
    {
      id: 'pilar_haveres_stj',
      name: 'Apuração de Haveres & Valuation Contábil',
      axis: 'Código Civil (Art. 1.031) / CPC (Arts. 599 a 609)',
      score: (hasBalancoDeterminacao && !hasFCDViciousWarning) ? 100 : hasFCDViciousWarning ? 15 : 40,
      maxScore: 100,
      status: (hasBalancoDeterminacao && !hasFCDViciousWarning) ? 'conforme' : 'critico',
      legalRef: 'Art. 1.031 do CC e Arts. 604/605 do CPC',
      courtPrecedent: 'STJ - 2ª Seção - REsp 1.877.331/SP (Rel. Min. Raul Araújo)',
      diagnostic: hasFCDViciousWarning
        ? 'Nulidade Prática: O uso de Fluxo de Caixa Descontado (FCD) é terminantemente rechaçado pela Segunda Seção do STJ.'
        : hasBalancoDeterminacao
        ? 'Balanço Especial de Determinação a valor de mercado pactuado em estrita consonância com o STJ REsp 1.877.331/SP.'
        : 'Critério de apuração de haveres omisso ou vago, gerando risco de perícia judicial com liquidação forçada.',
      recommendation: 'Adotar Balanço Especial de Determinação com parcelamento em 36 vezes e carência financeira.'
    },
    {
      id: 'pilar_sucessao_usufruto',
      name: 'Usufruto Vitalício & Governança Política',
      axis: 'Código Civil (Arts. 1.390 a 1.411)',
      score: hasUsufrutoControle ? 100 : text.includes('usufruto') ? 60 : 25,
      maxScore: 100,
      status: hasUsufrutoControle ? 'conforme' : 'ajuste_necessario',
      legalRef: 'Arts. 1.390 a 1.411 do CC e Lei 6.404/76 Art. 114',
      courtPrecedent: 'STJ - 3ª Turma - REsp 1.848.472/SP',
      diagnostic: hasUsufrutoControle
        ? 'Reserva de usufruto vitalício e sucessivo com cisão inequívoca entre direito político de voto e dividendos econômicos.'
        : 'Doação de quotas com usufruto genérico sem retenção expressa e exclusiva dos poderes de deliberação política.',
      recommendation: 'Garantir que 100% dos direitos políticos de voto e 100% dos dividendos permaneçam com o usufrutuário patriarca.'
    },
    {
      id: 'pilar_gravames_incomunicabilidade',
      name: 'Gravames Restritivos da Legítima & Família',
      axis: 'Código Civil (Arts. 1.911, 1.660, V e 547)',
      score: (hasIncomunicabilidadeAmpla && hasReversao) ? 100 : hasIncomunicabilidadeAmpla ? 75 : 30,
      maxScore: 100,
      status: (hasIncomunicabilidadeAmpla && hasReversao) ? 'conforme' : 'ajuste_necessario',
      legalRef: 'Arts. 1.911, 1.660, V e 547 do CC',
      courtPrecedent: 'STJ - 3ª Turma - REsp 1.758.544/SP (Reversão e Incomunicabilidade)',
      diagnostic: hasIncomunicabilidadeAmpla
        ? 'Incomunicabilidade qualificada estendida contratualmente a lucros, dividendos e JCP (afastando Art. 1.660, V CC).'
        : 'Incomunicabilidade simplória que não impede ex-genro/ex-nora de penhorar metade dos dividendos em caso de divórcio.',
      recommendation: 'Adicionar extensão expressa da incomunicabilidade a todos os frutos civis e cláusula de reversão por premoriência.'
    },
    {
      id: 'pilar_tributario_itbi',
      name: 'Imunidade de ITBI & STF Tema 796',
      axis: 'Constituição Federal (Art. 156, § 2º, I) / CTN (Arts. 36 e 37)',
      score: hasTema796 ? 100 : 35,
      maxScore: 100,
      status: hasTema796 ? 'conforme' : 'critico',
      legalRef: 'Art. 156, § 2º, I da CF e Arts. 36/37 do CTN',
      courtPrecedent: 'STF - Pleno - Tema 796 de Repercussão Geral (RE 796.376/SC)',
      diagnostic: hasTema796
        ? 'Integralização imobiliária blindada e estritamente limitada ao capital social subscrito, sem reserva de ágio não-imune.'
        : 'Risco de Autuação Fiscal de ITBI: Prefeituras municipais cobram ITBI sobre diferença patrimonial por falta de adequação ao Tema 796.',
      recommendation: 'Inserir cláusula com remissão expressa ao Tema 796 do STF e atestado de não-preponderância imobiliária.'
    },
    {
      id: 'pilar_governanca_impasse',
      name: 'Anti-Impasse Societário (Shotgun / Deadlock)',
      axis: 'Lei das S.A. (Lei 6.404/76, Art. 118) / CC (Art. 1.053)',
      score: hasDeadlockShotgun ? 100 : 30,
      maxScore: 100,
      status: hasDeadlockShotgun ? 'conforme' : 'ajuste_necessario',
      legalRef: 'Art. 1.053, parágrafo único CC c/c Art. 118 Lei 6.404/76',
      courtPrecedent: 'STJ - 3ª Turma - REsp 1.838.006/SP',
      diagnostic: hasDeadlockShotgun
        ? 'Mecanismo de saída forçada Shotgun / Texas Shootout para desempate extrajudicial rápido de impasses societários.'
        : 'Inexistência de mecanismo anti-impasse: Uma divergência entre quotistas pode paralisar as contas e levar à dissolução judicial.',
      recommendation: 'Adotar procedimento de compra e venda obrigatória (Shotgun) com prazo de 30 dias para resposta.'
    },
    {
      id: 'pilar_registral_executivo',
      name: 'Eficácia Registral no RGI & Título Executivo',
      axis: 'Lei nº 8.934/94 (Art. 64) / CPC (Art. 784, III) / DREI 81',
      score: (hasTituloRGI && hasAssinaturaExecutiva) ? 100 : (hasTituloRGI || hasAssinaturaExecutiva) ? 70 : 35,
      maxScore: 100,
      status: (hasTituloRGI && hasAssinaturaExecutiva) ? 'conforme' : 'ajuste_necessario',
      legalRef: 'Art. 64 Lei 8.934/94, Art. 784, III CPC e IN DREI 81/20',
      courtPrecedent: 'STJ - 3ª Turma - REsp 1.495.920/DF e CNJ PP 0001053-88.2012',
      diagnostic: hasTituloRGI
        ? 'Eficácia translativa direta que dispensa escritura pública notarial perante o Cartório de Registro de Imóveis (Art. 64 Lei 8.934/94).'
        : 'Omissão de cláusula translativa que leva Oficiais de RGI a exigirem escrituras públicas de dezenas de milhares de reais.',
      recommendation: 'Fazer constar a eficácia translativa direta da Lei 8.934/94 e validação de assinatura conforme Lei 14.063/20.'
    }
  ];

  // 6. MATRIZ DE CONFRONTO COM OS MINISTROS DOS TRIBUNAIS SUPERIORES
  const courtBenchmarks: CourtBenchmark[] = [
    {
      court: 'STF',
      title: 'Imunidade de ITBI em Integralização de Capital Imobiliário',
      precedentNumber: 'Tema 796 de Repercussão Geral (RE 796.376/SC)',
      doctrine: 'A imunidade tributária do Art. 156, § 2º, I da CF/88 alcança unicamente o valor dos imóveis afetado ao capital social subscrito. Excedentes incorporados como reserva de capital ou ágio sofrem incidência de ITBI municipal.',
      isCompliant: hasTema796,
      statusText: hasTema796 ? 'Plena Conformidade Constitucional' : 'Vulnerável a Autuação de ITBI com Multa',
      riskEvaluation: hasTema796
        ? 'Imunidade blindada pelo entendimento vinculante do Plenário do STF.'
        : 'Fisco Municipal poderá lançar imposto sobre a diferença entre o custo declarado na DIRPF e o valor venal de referência.',
      correctiveAction: 'Fixar que 100% do valor dos imóveis é imputado ao capital social subscrito, sem formação de reserva de ágio.'
    },
    {
      court: 'STJ',
      title: 'Repúdio ao Fluxo de Caixa Descontado (FCD) para Apuração de Haveres',
      precedentNumber: '2ª Seção - REsp 1.877.331/SP (Rel. Min. Raul Araújo)',
      doctrine: 'Em sociedades de pessoas e limitadas em geral, a apuração de haveres deve ocorrer por Balanço Especial de Determinação a valor presente de saída dos ativos e passivos, sendo inaplicável a metodologia de Fluxo de Caixa Descontado (FCD).',
      isCompliant: hasBalancoDeterminacao && !hasFCDViciousWarning,
      statusText: hasFCDViciousWarning
        ? 'Nulidade Prática (FCD Proibido pelo STJ)'
        : hasBalancoDeterminacao
        ? 'Conforme com Jurisprudência Vinculante do STJ'
        : 'Omissão de Critério (Risco de Litígio Judicial)',
      riskEvaluation: hasFCDViciousWarning
        ? 'Juiz anulará a cláusula de FCD em ação de dissolução parcial com base no REsp 1.877.331/SP, impondo perícia com custas elevadíssimas.'
        : 'Risco de litígio judicial sobre o método contábil aplicável no caso de morte ou exclusão de sócio.',
      correctiveAction: 'Definir expressamente o Balanço Especial de Determinação e carência de pagamento em 36 parcelas mensais.'
    },
    {
      court: 'STJ',
      title: 'Proteção do Bem de Família Integralizado em Holding Familiar',
      precedentNumber: 'Corte Especial / 4ª Turma - REsp 1.677.196/SP e Súmula 364',
      doctrine: 'O imóvel de propriedade de pessoa jurídica utilizado como residência permanente da entidade familiar dos sócios mantém a impenhorabilidade do bem de família instituída pela Lei nº 8.009/1990.',
      isCompliant: text.includes('bem de família') || (hasAutonomiaArt50 && hasGravames),
      statusText: (text.includes('bem de família') || hasGravames) ? 'Proteção Patrimonial Consolidada' : 'Ajuste Recomendado',
      riskEvaluation: 'Sem cláusula de afetação residencial, credores da sociedade ou de empresas correlatas podem penhorar o imóvel de moradia.',
      correctiveAction: 'Inserir salvaguarda de impenhorabilidade de residência unifamiliar nos termos da Súmula 364 do STJ.'
    },
    {
      court: 'STJ',
      title: 'Autonomia Patrimonial Rígida e Teoria Maior da Desconsideração da PJ',
      precedentNumber: '2ª Seção - EREsp 1.306.553/SC e Lei Federal nº 13.874/2019',
      doctrine: 'A desconsideração da personalidade jurídica no direito empresarial e cível exige prova cabal e inconteste de dolo específico de fraude a credores ou confusão patrimonial sistemática, sendo ilegal a desconsideração por mero prejuízo ou encerramento das atividades.',
      isCompliant: hasAutonomiaArt50,
      statusText: hasAutonomiaArt50 ? 'Barreira de Proteção Eficaz' : 'Exposição a Penhoras Diretas',
      riskEvaluation: 'Juízes de primeira instância aplicam com frequência a Teoria Menor se o contrato social não estipular a limitação rígida da Lei 13.874/19.',
      correctiveAction: 'Adicionar a cláusula mestra de Autonomia Patrimonial com invocação do Art. 49-A e Art. 50 do Código Civil.'
    },
    {
      court: 'TST',
      title: 'Descaracterização de Grupo Econômico por Mera Identidade de Sócios',
      precedentNumber: 'SDI-1 - E-ED-RR 1000781-42.2017.5.02.0463 / CLT Art. 2º, § 3º',
      doctrine: 'A Reforma Trabalhista (Lei 13.467/17) vedou expressamente a presunção de grupo econômico pela simples identidade societária, exigindo demonstração de controle compartilhado e interesse integrado.',
      isCompliant: hasNaoSolidariedadeTrabalhista,
      statusText: hasNaoSolidariedadeTrabalhista ? 'Holding Imune a Passivos Trabalhistas de Terceiros' : 'Atenção a Bloqueios Via Sisbajud',
      riskEvaluation: 'A holding patrimonial pode ter contas bancárias bloqueadas em execução trabalhista contra empresa operacional de parente.',
      correctiveAction: 'Declarar o caráter passivo da holding de bens, sem subordinação ou coordenação com empresas operacionais dos sócios.'
    },
    {
      court: 'DREI',
      title: 'Quóruns Societários da Lei 14.451/2022 & Desimpedimento de Administradores',
      precedentNumber: 'Instrução Normativa DREI nº 81/2020 e Ofício Circular SEI 4509/2022',
      doctrine: 'A Lei nº 14.451/2022 alterou radicalmente os quóruns do Código Civil, reduzindo o quórum de alteração contratual para mais da metade do capital social (antigo 3/4) e exigindo cláusula explícita de desimpedimento do Art. 1.011, § 1º.',
      isCompliant: hasQuorunsAtualizados && hasDesimpedimentoAdmin,
      statusText: (hasQuorunsAtualizados && hasDesimpedimentoAdmin) ? 'Aderência Plena às Exigências da Junta Comercial' : 'Exigência Registral Provável na Junta Comercial',
      riskEvaluation: 'Contratos que ainda mencionem quórum de 3/4 geram insegurança ou exigências formais de analistas de Juntas Comerciais.',
      correctiveAction: 'Adequar todos os quóruns de deliberação societária aos novos padrões da Lei 14.451/2022.'
    }
  ];

  // 7. LISTA CIRÚRGICA DE VULNERABILIDADES E CLÁUSULAS SANEADORAS
  const issues: AuditIssue[] = [];

  // VULNERABILIDADE 1: ART. 50 CC / AUTONOMIA PATRIMONIAL
  if (!hasAutonomiaArt50) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_AUTONOMIA_PATRIMONIAL;
    issues.push({
      id: 'iss_art50',
      code: 'ISSUE_AUTONOMIA_PATRIMONIAL',
      title: 'Ausência de Cláusula Rígida de Autonomia Patrimonial e Lei da Liberdade Econômica',
      severity: 'Crítico',
      pillarId: 'pilar_art50_autonomia',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'O contrato social omite a blindagem expressa dos Arts. 49-A e 50 do Código Civil, permitindo que magistrados cíveis e trabalhistas desconsiderem a pessoa jurídica por presunção de insolvência.',
      practicalRisk: 'Penhora online instantânea (Sisbajud/Renajud) de contas e bens pessoais dos sócios em processos de cobrança contra a empresa sem contraditório prévio.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 2: FCD OU OMISSÃO DE BALANÇO DE DETERMINAÇÃO
  if (hasFCDViciousWarning) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_BALANCO_DETERMINACAO;
    issues.push({
      id: 'iss_fcd_vicious',
      code: 'ISSUE_BALANCO_DETERMINACAO',
      title: 'Nulidade Prática de Fluxo de Caixa Descontado (FCD) para Apuração de Haveres',
      severity: 'Crítico',
      pillarId: 'pilar_haveres_stj',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'A minuta estipula a apuração de haveres por Fluxo de Caixa Descontado (FCD) ou múltiplos futuros de EBITDA, metodologia expressamente repudiada pela 2ª Seção do STJ para sociedades limitadas de pessoas.',
      practicalRisk: 'O sócio dissidente anulará a cláusula em juízo; a sociedade será condenada a pagar haveres à vista calculados por perícia judicial imprevisível e onerosa.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  } else if (!hasBalancoDeterminacao) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_BALANCO_DETERMINACAO;
    issues.push({
      id: 'iss_balanco_det',
      code: 'ISSUE_BALANCO_DETERMINACAO',
      title: 'Omissão da Metodologia de Balanço Especial de Determinação (STJ REsp 1.877.331/SP)',
      severity: 'Alto',
      pillarId: 'pilar_haveres_stj',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'O contrato silencia quanto à fórmula de valuation e prazos de liquidação de quotas na saída, falecimento ou exclusão de quotistas.',
      practicalRisk: 'Herdeiros ou ex-sócios exigem quitação imediata e integral à vista do valor patrimonial, inviabilizando o fluxo de caixa operacional.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 3: USUFRUTO E GOVERNANÇA POLÍTICA
  if (!hasUsufrutoControle && (selectedModelInfo.vertical?.toLowerCase().includes('holding') || selectedModelInfo.title.toLowerCase().includes('holding') || selectedModelInfo.title.toLowerCase().includes('sucessão') || text.includes('doação') || text.includes('usufruto'))) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_USUFRUTO_CONTROLE;
    issues.push({
      id: 'iss_usufruto_controle',
      code: 'ISSUE_USUFRUTO_CONTROLE',
      title: 'Doação de Quotas sem Retenção Expressa de Voto Político e Dividendos',
      severity: 'Crítico',
      pillarId: 'pilar_sucessao_usufruto',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'Ao transmitir a nua-propriedade das quotas sem cisão estrita entre direitos políticos e econômicos, o patriarca corre o risco de perder a administração da holding para os filhos/donatários.',
      practicalRisk: 'Herdeiros assumem a gestão por maioria simples, elegem novos administradores ou vendem ativos da holding sem o consentimento dos pais.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 4: INCOMUNICABILIDADE ESTENDIDA A FRUTOS CIVIS (ART. 1.660, V CC)
  if (!hasIncomunicabilidadeAmpla) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_INCOMUNICABILIDADE;
    issues.push({
      id: 'iss_incomunicabilidade',
      code: 'ISSUE_INCOMUNICABILIDADE',
      title: 'Falta de Incomunicabilidade Ampla Estendida a Frutos Civis e Dividendos',
      severity: 'Alto',
      pillarId: 'pilar_gravames_incomunicabilidade',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'A incomunicabilidade ordinária protege apenas as quotas em si. Conforme o Artigo 1.660, inciso V do Código Civil, os frutos, dividendos e lucros percebidos comunicam-se ao cônjuge em caso de divórcio.',
      practicalRisk: 'Genros ou noras em divórcio litigioso exigem 50% de todas as distribuições de lucros acumuladas pela sociedade durante a constância do casamento.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 5: REVERSÃO POR PREMORIÊNCIA (ART. 547 CC)
  if (!hasReversao && (selectedModelInfo.vertical?.toLowerCase().includes('holding') || selectedModelInfo.title.toLowerCase().includes('holding') || selectedModelInfo.title.toLowerCase().includes('sucessão') || text.includes('doação'))) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_REVERSAO_PREMORIENCIA;
    issues.push({
      id: 'iss_reversao_premoriencia',
      code: 'ISSUE_REVERSAO_PREMORIENCIA',
      title: 'Ausência de Cláusula Resolutiva de Reversão por Premoriência do Donatário',
      severity: 'Moderado',
      pillarId: 'pilar_gravames_incomunicabilidade',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'Se um herdeiro/donatário falecer antes do doador/patriarca, as quotas doadas serão incluídas no inventário do filho falecido, transmitindo-se ao cônjuge viúvo.',
      practicalRisk: 'Quotas de controle da família transferidas a terceiros estranhos ou bloqueadas em partilha de inventário demorada de filho falecido prematuramente.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 6: IMUNIDADE DE ITBI E TEMA 796 DO STF
  if (!hasTema796 && (text.includes('imóve') || text.includes('conferência') || text.includes('integraliz') || selectedModelInfo.id === 'CON-071')) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_ITBI_INTEGRALIZACAO;
    issues.push({
      id: 'iss_tema796_itbi',
      code: 'ISSUE_ITBI_INTEGRALIZACAO',
      title: 'Exposição Fiscal de ITBI por Desconformidade com o STF Tema 796',
      severity: 'Alto',
      pillarId: 'pilar_tributario_itbi',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'A conferência de imóveis desprovida de delimitação precisa quanto ao capital social subscrito faculta ao Município exigir ITBI sobre a diferença contábil ou sobre reserva de ágio.',
      practicalRisk: 'Autuações tributárias com multas punitivas de 50% a 100% sobre o imposto de transmissão incidente sobre imóveis de milhões de reais conferidos à holding.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 7: DISPENSA DE ESCRITURA PÚBLICA NO RGI (ART. 64 LEI 8.934/94)
  if (!hasTituloRGI && (text.includes('imóve') || text.includes('conferência') || selectedModelInfo.id === 'CON-071')) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_TITULO_RGI_ART64;
    issues.push({
      id: 'iss_rgi_art64',
      code: 'ISSUE_TITULO_RGI_ART64',
      title: 'Falta de Cláusula de Eficácia Translativa Direta perante o Registro de Imóveis',
      severity: 'Moderado',
      pillarId: 'pilar_registral_executivo',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'Oficiais de Registro de Imóveis (CRI) costumam suscitar dúvida registral e exigir escritura pública notarial se o contrato social não invocar formalmente o Artigo 64 da Lei Federal 8.934/94.',
      practicalRisk: 'Custos notariais desnecessários que chegam a dezenas de milhares de reais pagos indevidamente a Tabelionatos de Notas.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 8: IMPASSE SOCIETÁRIO E CLÁUSULA SHOTGUN
  if (!hasDeadlockShotgun && (selectedModelInfo.vertical?.toLowerCase().includes('governança') || selectedModelInfo.title.toLowerCase().includes('acordo de sócios') || text.includes('50%') || text.includes('acordo de sócios'))) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_DEADLOCK_SHOTGUN;
    issues.push({
      id: 'iss_deadlock_shotgun',
      code: 'ISSUE_DEADLOCK_SHOTGUN',
      title: 'Vulnerabilidade a Paralisia Decisória (Falta de Mecanismo Deadlock / Shotgun)',
      severity: 'Alto',
      pillarId: 'pilar_governanca_impasse',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'Em sociedades divididas em blocos igualitários (50/50) ou com direito de veto mútuo, um impasse deliberativo pode levar à dissolução total da sociedade judicialmente.',
      practicalRisk: 'Paralisação judicial das contas da empresa, bloqueio operacional e destituição judicial da administração por litígio infindável entre sócios.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 9: QUÓRUNS DA LEI 14.451/2022
  if (!hasQuorunsAtualizados) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_QUORUNS_LEI14451;
    issues.push({
      id: 'iss_quoruns_lei14451',
      code: 'ISSUE_QUORUNS_LEI14451',
      title: 'Desatualização dos Quóruns Deliberativos Perante a Lei Federal nº 14.451/2022',
      severity: 'Moderado',
      pillarId: 'pilar_governanca_impasse',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'A Lei nº 14.451/2022 alterou os quóruns do Código Civil, reduzindo a aprovação de alteração contratual para mais da metade do capital social (anteriormente 3/4).',
      practicalRisk: 'Cláusula contratual antiga de quórum de 3/4 gera conflitos interpretativos e insegurança jurídica em deliberações societárias com sócios minoritários.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 10: DECLARAÇÃO DE DESIMPEDIMENTO DE ADMINISTRADORES
  if (!hasDesimpedimentoAdmin) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_DESIMPEDIMENTO_ADMIN;
    issues.push({
      id: 'iss_desimpedimento_admin',
      code: 'ISSUE_DESIMPEDIMENTO_ADMIN',
      title: 'Ausência da Declaração Formal de Desimpedimento dos Administradores (Art. 1.011 CC)',
      severity: 'Preventivo',
      pillarId: 'pilar_registral_executivo',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'A Instrução Normativa DREI 81/2020 e o Art. 1.011, § 1º do Código Civil exigem declaração explícita de que os administradores não estão impedidos por crime falimentar, contra a economia ou fé pública.',
      practicalRisk: 'Exigência formal (nota devolutiva) do analista da Junta Comercial, atrasando o arquivamento e registro da empresa em até 30 dias.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 11: ASSINATURA ELETRÔNICA E TÍTULO EXECUTIVO (ART. 784, III CPC)
  if (!hasAssinaturaExecutiva) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_ASSINATURA_DIGITAL;
    issues.push({
      id: 'iss_assinatura_executiva',
      code: 'ISSUE_ASSINATURA_DIGITAL',
      title: 'Falta de Previsão de Assinatura Eletrônica e Força Executiva Extrajudicial',
      severity: 'Preventivo',
      pillarId: 'pilar_registral_executivo',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'Contratos particulares assinados eletronicamente sem remissão expressa à Lei 14.063/20 ou sem 2 testemunhas qualificadas têm sua força executiva questionada perante o Poder Judiciário.',
      practicalRisk: 'Necessidade de ajuizar ação de conhecimento com instrução probatória de anos em vez de ação de execução direta para cobrança de haveres ou penalidades contratuais.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // VULNERABILIDADE 12: NÃO-SOLIDARIEDADE TRABALHISTA (ART. 2º CLT)
  if (!hasNaoSolidariedadeTrabalhista && (selectedModelInfo.vertical?.toLowerCase().includes('holding') || selectedModelInfo.title.toLowerCase().includes('holding') || selectedModelInfo.title.toLowerCase().includes('patrimonial'))) {
    const data = ELITE_AUDIT_CLAUSES.ISSUE_NAO_SOLIDARIEDADE_TRABALHISTA;
    issues.push({
      id: 'iss_nao_solidariedade_clt',
      code: 'ISSUE_NAO_SOLIDARIEDADE_TRABALHISTA',
      title: 'Ausência de Cláusula de Vedação à Presunção de Grupo Econômico Trabalhista',
      severity: 'Moderado',
      pillarId: 'pilar_art50_autonomia',
      legalBase: data.legalBase,
      courtJurisprudence: data.courtRef,
      reason: 'A ausência de delimitação expressa da holding como sociedade puramente passiva facilita incidentes de desconsideração na Justiça do Trabalho por mera identidade societária.',
      practicalRisk: 'Juízos do Trabalho bloqueiam contas bancárias e aluguéis da holding para pagar verbas rescisórias de empresas de familiares.',
      clauseFixTitle: data.title,
      clauseFix: data.text
    });
  }

  // 8. DIMENSÕES PARA COMPATIBILIDADE COM RELATÓRIOS E LAUDOS EXISTENTES
  const dimensions = {
    capacidadeValidade: {
      score: (hasAgenteCapaz && hasOutorgaConjugal) ? 100 : hasAgenteCapaz ? 70 : 35,
      status: (hasAgenteCapaz && hasOutorgaConjugal) ? 'conforme' : 'atencao',
      details: hasOutorgaConjugal
        ? 'Qualificação completa dos sócios, capacidade civil plena e menção expressa a outorga uxória/marital em consonância com o Art. 1.647 do Código Civil.'
        : 'Ausência de declaração formal do regime matrimonial de bens ou outorga expressa de cônjuges para atos de disposição patrimonial.'
    },
    objetoFuncaoSocial: {
      score: (hasObjetoLicito && hasObjeto) ? 100 : 50,
      status: (hasObjetoLicito && hasObjeto) ? 'conforme' : 'atencao',
      details: hasObjetoLicito
        ? 'Objeto social lícito, delimitado com precisão técnico-societária e alinhado aos Princípios de Função Social e Intervenção Mínima (Arts. 421 e 421-A do Código Civil).'
        : 'Requer melhor detalhamento do escopo operacional ou finalidade institucional da sociedade.'
    },
    formaEficaciaRegistral: {
      score: (hasTituloRGI && hasAssinaturaExecutiva) ? 100 : (hasTituloRGI || hasAssinaturaExecutiva) ? 75 : 40,
      status: (hasTituloRGI && hasAssinaturaExecutiva) ? 'conforme' : 'atencao',
      details: hasTituloRGI
        ? 'Eficácia de título translativo direto (Art. 64 Lei 8.934/94), assinatura digital qualificada ICP-Brasil / Lei 14.063/20 e força de título executivo extrajudicial (Art. 784, III CPC).'
        : 'Falta de menção expressa à eficácia translativa direta dispensadora de escritura pública notarial ou qualificação de testemunhas instrumentárias.'
    },
    barreiraDesconsideracao: {
      score: hasAutonomiaArt50 ? 100 : 20,
      status: hasAutonomiaArt50 ? 'conforme' : 'critico',
      details: hasAutonomiaArt50
        ? 'Barreira de proteção sólida contra desconsideração da personalidade jurídica, com observância estrita aos parâmetros da Lei da Liberdade Econômica (Art. 50 do CC).'
        : 'Patrimônio dos sócios desprotegido contra penhoras automáticas via Sisbajud/Renajud por ausência de blindagem conforme o Art. 50 do Código Civil.'
    },
    gravamesSucessao: {
      score: (hasIncomunicabilidadeAmpla && hasUsufrutoControle && hasReversao) ? 100 : (hasIncomunicabilidadeAmpla || hasUsufrutoControle) ? 70 : 25,
      status: (hasIncomunicabilidadeAmpla && hasUsufrutoControle) ? 'conforme' : 'critico',
      details: hasIncomunicabilidadeAmpla
        ? 'Quotas blindadas contra meação de genros/noras com extensão a dividendos e lucros (Art. 1.660, V CC), retenção de usufruto político vitalício e reversão por premoriência (Art. 547 CC).'
        : 'Vulnerabilidade crítica a partilhas de divórcio sobre proventos societários ou perda da governança das quotas em favor de herdeiros donatários.'
    },
    tributarioValuation: {
      score: (hasBalancoDeterminacao && !hasFCDViciousWarning && hasTema796) ? 100 : (!hasFCDViciousWarning && hasBalancoDeterminacao) ? 80 : 30,
      status: (!hasFCDViciousWarning && hasBalancoDeterminacao && hasTema796) ? 'conforme' : 'critico',
      details: hasFCDViciousWarning
        ? 'Alerta Fatal: Metodologia de Fluxo de Caixa Descontado (FCD) repudiada expressamente pela Segunda Seção do STJ no paradigmático REsp 1.877.331/SP.'
        : hasBalancoDeterminacao
        ? 'Balanço Especial de Determinação a valor de mercado e imunidade tributária de ITBI pactuados em harmonia estrita com a jurisprudência vinculante do STJ e STF (Tema 796).'
        : 'Critério de avaliação de quotas indefinido ou ausência de salvaguarda de imunidade de ITBI nos termos do STF Tema 796.'
    }
  };

  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

  return {
    score,
    rating,
    level,
    levelLabel,
    timestamp,
    modelId: selectedModelInfo.id,
    modelTitle: selectedModelInfo.title,
    wordCount,
    charCount,
    validityCheck: {
      agenteCapaz: hasAgenteCapaz,
      objetoLicito: hasObjetoLicito,
      formaPrescrita: hasFormaPrescrita
    },
    vitalsCheck: {
      preambulo: hasPreambulo,
      objeto: hasObjeto,
      preco: hasPrecoOuCapital,
      vigencia: hasVigencia,
      protecao: hasGravames,
      foro: hasForoArbitragem
    },
    pillars,
    courtBenchmarks,
    dimensions,
    issues: issues.map((iss) => ({
      ...iss,
      law: iss.legalBase,
      desc: iss.reason
    }))
  };
}
