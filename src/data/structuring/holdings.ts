import { StructuringModelItem } from './types';

export const HOLDINGS_MODELS: StructuringModelItem[] = [
  {
    id: 'holding_familiar',
    title: 'Holding Familiar Pura & Sucessória',
    category: 'holdings',
    categoryName: 'Holdings & Sucessão',
    badge: 'SUCESSÓRIO & USUFRUTO',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    description: 'Veículo de planejamento sucessório em vida com doação de quotas com reserva de usufruto vitalício de 100% dos direitos políticos e econômicos ao patriarca, com as 4 cláusulas restritivas de proteção (Art. 1.911 CC e Art. 547 CC).',
    legalFramework: 'Arts. 997, 1.052, 1.390 a 1.411, 1.647 e 1.911 do Código Civil; Lei nº 13.874/2019 (Liberdade Econômica).',
    jurisprudence: 'STF Tema 796 (imunidade de ITBI sobre o capital subscrito); STJ REsp 1.877.331/SP (Balanço de Determinação).',
    keyFeatures: ['Usufruto Vitalício de Voto e Dividendos', 'Cláusulas de Inalienabilidade e Incomunicabilidade', 'Reversão por Premoriência (Art. 547 CC)', 'Dispensa de Inventário Judicial'],
    riskLevel: 'Máxima Blindagem',
    targetProfile: 'Famílias empresárias buscando perpetuidade patrimonial, blindagem contra genros/noras e herança sem atritos de inventário.',
    defaultClauses: {
      inalienabilidade: true,
      impenhorabilidade: true,
      incomunicabilidade: true,
      usufruto: true,
      reversao: true,
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted, clauses }) => {
      let d = `INSTRUMENTO PARTICULAR DE CONSTITUIÇÃO DE SOCIEDADE LIMITADA - HOLDING FAMILIAR PURA E DE ADMINISTRAÇÃO PATRIMONIAL\n`;
      d += `DENOMINAÇÃO SOCIAL: ${(nomeEmpresarial || 'HOLDING FAMILIAR PARTICIPAÇÕES').toUpperCase()} LTDA\n\n`;
      d += `PREÂMBULO - DAS PARTES QUALIFICADAS:\n`;
      d += `1. SÓCIO FUNDADOR / PATRIARCA USUFRUTUÁRIO:\n- ${socioPF.toUpperCase()}, brasileiro, empresário, portador do CPF sob o nº ***.***.***-**, residente e domiciliado nesta Comarca;\n\n`;
      d += `2. SÓCIOS HERDEIROS / NUS-PROPRIETÁRIOS BENEFICIÁRIOS:\n`;
      herdeiros.split(',').forEach((h, i) => {
        d += `- Herdeiro Donatário ${i + 1}: ${h.trim().toUpperCase()}, brasileiro, portador do CPF sob o nº ***.***.***-**;\n`;
      });
      d += `\n3. DO PATRIMÔNIO ALOCADO POR SUB-ROGAÇÃO REAL:\n`;
      d += `- Ativos Conferidos: ${ativos.toUpperCase()}.\n\n`;
      d += `Resolvem celebrar o presente Contrato Social com base nos Arts. 997 e 1.052 do Código Civil, sob as seguintes cláusulas:\n\n`;
      d += `CLÁUSULA PRIMEIRA - DA DENOMINAÇÃO, SEDE E OBJETO SOCIAL EXCLUSIVO:\n`;
      d += `A sociedade girará sob a denominação social ${(nomeEmpresarial || 'HOLDING FAMILIAR PARTICIPAÇÕES').toUpperCase()} LTDA, com sede e foro na cidade de ${cidade}/${ufEmpresa}. Seu objeto social exclusivo consiste na administração de bens próprios, gestão patrimonial familiar e participação no capital social de outras sociedades empresárias como sócia ou acionista (Holding Pura - CNAE 6462-0/00).\n\n`;
      d += `CLÁUSULA SEGUNDA - DA AUTONOMIA PATRIMONIAL E BLINDAGEM DA PESSOA JURÍDICA (ART. 50 DO CÓDIGO CIVIL):\n`;
      d += `Em cumprimento estrito à Lei da Liberdade Econômica (Lei nº 13.874/2019) e ao Artigo 50 do Código Civil, o patrimônio desta sociedade não se confunde com o patrimônio pessoal de seus sócios, patriarcas ou herdeiros. A holding responde unicamente com seus próprios bens por suas obrigações, restando vedada qualquer responsabilização reflexa, salvo na hipótese legal de dolo específico e fraude cabalmente demonstrada.\n\n`;
      
      if (clauses.inalienabilidade || clauses.impenhorabilidade || clauses.incomunicabilidade) {
        d += `CLÁUSULA TERCEIRA - DOS GRAVAMES E RESTRIÇÕES PATRIMONIAIS ABSOLUTAS (ART. 1.911 DO CÓDIGO CIVIL):\n`;
        d += `As quotas sociais doadas aos herdeiros beneficiários são instituídas com as seguintes restrições de ordem pública:\n`;
        if (clauses.inalienabilidade) d += `a) INALIENABILIDADE: As quotas sociais jamais poderão ser vendidas, doadas, permutadas, hipotecadas ou oneradas a terceiros sem a anuência prévia e unânime do Sócio Fundador/Patriarca;\n`;
        if (clauses.impenhorabilidade) d += `b) IMPENHORABILIDADE: As quotas sociais e os frutos civis delas derivados são absolutamente impenhoráveis perante quaisquer credores presentes ou futuros dos herdeiros;\n`;
        if (clauses.incomunicabilidade) d += `c) INCOMUNICABILIDADE: As quotas ora integralizadas não integrarão a comunhão de bens com cônjuges ou companheiros dos herdeiros em nenhuma hipótese de casamento ou união estável (Art. 1.668, I do Código Civil).\n\n`;
      }

      if (clauses.usufruto) {
        d += `CLÁUSULA QUARTA - DA RESERVA DE USUFRUTO VITALÍCIO DE CONTROLE (ARTS. 1.390 A 1.411 DO CÓDIGO CIVIL):\n`;
        d += `A doação das quotas de capital aos sócios herdeiros é gravada com cláusula de USUFRUTO VITALÍCIO em favor de ${socioPF.toUpperCase()}. O usufrutuário conserva com exclusividade até o final de sua vida:\n`;
        d += `I - O poder de voto integral em todas as deliberações sociais, nomeação e destituição de administradores;\n`;
        d += `II - A percepção de 100% dos dividendos, juros sobre o capital próprio (JCP) e quaisquer resultados econômicos auferidos pela holding, sem obrigação de rateio aos herdeiros nus-proprietários.\n\n`;
      }

      if (clauses.reversao) {
        d += `CLÁUSULA QUINTA - DA CLÁUSULA DE REVERSÃO DA DOAÇÃO POR PREMORIÊNCIA (ART. 547 DO CÓDIGO CIVIL):\n`;
        d += `Caso qualquer dos donatários/herdeiros venha a falecer antes do Sócio Doador/Patriarca, as respectivas quotas sociais doadas reverterão de pleno direito à titularidade do doador original, sem sujeição a processo de inventário, partilha ou meação de cônjuge supérstite.\n\n`;
      }

      d += `CLÁUSULA SEXTA - DA APURAÇÃO DE HAVERES PELO BALANÇO DE DETERMINAÇÃO (RESP 1.877.331/SP DO STJ):\n`;
      d += `Na hipótese de dissolução parcial, retirada ou exclusão de qualquer quotista, a apuração de haveres será realizada obrigatoriamente através de BALANÇO DE DETERMINAÇÃO especial na data-base do evento (Art. 1.031 do CC), apurando-se o valor patrimonial real dos ativos a valor de liquidação, excluído o fluxo de caixa descontado e goodwill. O pagamento dar-se-á em 24 (vinte e quatro) parcelas mensais e sucessivas após carência de 180 (cento e oitenta) dias.\n\n`;
      d += `CLÁUSULA SÉTIMA - DO FORO DE ELEIÇÃO:\n`;
      d += `As partes elegem o foro da Comarca de ${cidade}/${ufEmpresa}, com expressa renúncia a qualquer outro, por mais privilegiado que seja.\n\n`;
      d += `${cidade}/${ufEmpresa}, ${dateFormatted}.\n\n`;
      d += `_____________________________________________________\n${socioPF.toUpperCase()} (Sócio Instituidor / Usufrutuário Vitalício)\n\n`;
      herdeiros.split(',').forEach((h) => {
        d += `_____________________________________________________\n${h.trim().toUpperCase()} (Sócio Nu-proprietário Donatário)\n\n`;
      });
      return d;
    }
  },

  {
    id: 'holding_patrimonial',
    title: 'Holding Imobiliária Patrimonial (Imóveis Próprios)',
    category: 'holdings',
    categoryName: 'Holdings & Sucessão',
    badge: 'TRIBUTÁRIO IMOBILIÁRIO',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    description: 'Gestão, aluguel e desinvestimento de imóveis próprios sob regime do Lucro Presumido (alíquota efetiva de 11,33% a 14,53% vs 27,5% IRPF), com imunidade constitucional de ITBI e segregação estrita contra passivos contratuais.',
    legalFramework: 'Art. 156, § 2º, I da Constituição Federal; Art. 23 da Lei nº 9.249/1995; Arts. 997 e 1.052 do Código Civil.',
    jurisprudence: 'STF Tema 796 de Repercussão Geral (imunidade de ITBI estrita ao capital subscrito); STJ Súmula 308 e Art. 50 CC.',
    keyFeatures: ['Economia Tributária de até 58% nos Aluguéis', 'Integralização pelo Valor Histórico do IRPF', 'Imunidade de ITBI Constitucional', 'Isolamento de Contratos de Locação'],
    riskLevel: 'Tributário',
    targetProfile: 'Investidores com múltiplos imóveis urbanos ou comerciais buscando reduzir IRPF de aluguel e ganho de capital.',
    defaultClauses: {
      imunidadeITBI: true,
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted, clauses }) => {
      let d = `CONTRATO SOCIAL DE SOCIEDADE LIMITADA - HOLDING PATRIMONIAL IMOBILIÁRIA\n`;
      d += `DENOMINAÇÃO SOCIAL: ${(nomeEmpresarial || 'PATRIMONIAL IMÓVEIS').toUpperCase()} LTDA\n\n`;
      d += `SÓCIO MAJORITÁRIO ADMINISTRADOR: ${socioPF.toUpperCase()}\n`;
      d += `DEMAIS SÓCIOS: ${herdeiros.toUpperCase()}\n`;
      d += `IMÓVEIS INTEGRALIZADOS: ${ativos.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - OBJETO SOCIAL EXCLUSIVO:\n`;
      d += `A sociedade tem por objeto: a) Compra, venda, permuta, locação, sublocação e administração de bens imóveis próprios; b) Loteamento e incorporação imobiliária própria; c) Participação em outras sociedades como sócia quotista ou acionista.\n\n`;
      if (clauses.imunidadeITBI) {
        d += `CLÁUSULA SEGUNDA - DA INTEGRALIZAÇÃO DE CAPITAL COM IMÓVEIS E IMUNIDADE DE ITBI (TEMA 796 DO STF):\n`;
        d += `Os imóveis retro descritos são transferidos à sociedade para a exata formação e integralização do capital social pelo valor constante da última Declaração de Ajuste Anual de IRPF do instituidor (Art. 23 da Lei nº 9.249/1995). Não há emissão de ágio ou reserva de capital, operando-se a imunidade integral do ITBI nos exatos termos do Art. 156, § 2º, I da CRFB/88 e tese vinculante do Tema 796 do Supremo Tribunal Federal.\n\n`;
      }
      d += `CLÁUSULA TERCEIRA - DA ADMINISTRAÇÃO E DISPOSIÇÃO DE BENS:\n`;
      d += `A administração compete exclusivamente a ${socioPF.toUpperCase()}, a quem caberá assinar escrituras, alienar e onerar imóveis sem necessidade de anuência prévia dos demais sócios.\n\n`;
      d += `CLÁUSULA QUARTA - FORO:\n`;
      d += `Foro da Comarca de ${cidade}/${ufEmpresa}.\n\n`;
      d += `${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'holding_mista',
    title: 'Holding Mista (Participações & Operação)',
    category: 'holdings',
    categoryName: 'Holdings & Sucessão',
    badge: 'OPERACIONAL & COFRE',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    description: 'Combina a gestão centralizada de quotas/ações de subsidiárias com atividades comerciais, industriais ou prestação de serviços compartilhados (SSC) no mesmo CNPJ, com segregação contábil interna de centros de custo.',
    legalFramework: 'Art. 2º, § 3º da Lei nº 6.404/1976 e Arts. 997 e 1.052 do Código Civil.',
    jurisprudence: 'CARF Acórdão 1402-003.871 (planejamento tributário com holdings mistas e licitude de rateio de despesas).',
    keyFeatures: ['Gestão de Participações + Serviços Operacionais', 'Centralização de Tesouraria e Compras', 'Distribuição Isenta de Dividendos', 'Planejamento Tributário Integrado'],
    riskLevel: 'Estratégico',
    targetProfile: 'Grupos empresariais que necessitam de faturamento operacional direto mantendo o controle das controladas.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CONTRATO SOCIAL DE HOLDING MISTA (PARTICIPAÇÕES E PRESTAÇÃO DE SERVIÇOS TÉCNICOS)\n`;
      d += `DENOMINAÇÃO SOCIAL: ${(nomeEmpresarial || 'GRUPO EMPRESARIAL PARTICIPAÇÕES').toUpperCase()} LTDA\n\n`;
      d += `SÓCIOS PARTICIPANTES:\n- ${socioPF.toUpperCase()}\n- ${herdeiros.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DO OBJETO SOCIAL MULTIFUNCIONAL:\n`;
      d += `Constitui objeto social: I - Participação societária em outras sociedades civis ou empresárias (Holding); II - Prestação de serviços de consultoria estratégica, gestão administrativa, suporte técnico e assessoria corporativa a empresas do mesmo grupo econômico; III - Locação de equipamentos e bens móveis.\n\n`;
      d += `CLÁUSULA SEGUNDA - DA SEGREGAÇÃO CONTÁBIL E NÃO CONFUSÃO DE ATIVOS:\n`;
      d += `A sociedade manterá escrituração contábil segregada para as receitas de equivalência patrimonial/dividendos (isentas) e para as receitas operacionais de prestação de serviços (tributáveis), garantindo total idoneidade contábil e fiscal.\n\n`;
      d += `CLÁUSULA TERCEIRA - DO FORO:\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'holding_rural',
    title: 'Holding Rural & Agropecuária (Fazendas e CPRs)',
    category: 'holdings',
    categoryName: 'Holdings & Sucessão',
    badge: 'AGRONEGÓCIO & SUCESSÃO',
    badgeColor: 'bg-lime-500/20 text-lime-300 border-lime-500/40',
    description: 'Estrutura customizada para o agronegócio: isolamento de matrículas de fazendas em empresa patrimonial, com arrendamento ou parceria agrícola para PJ operacional, blindando a terra contra penhoras de crédito rural e execução de CPRs.',
    legalFramework: 'Estatuto da Terra (Lei nº 4.504/1964); Lei nº 8.929/1994 (Cédula de Produto Rural); Arts. 96 e 997 do Código Civil.',
    jurisprudence: 'STJ REsp 1.442.222/MT (arrendamento rural intercompany e proteção das terras produtivas da família).',
    keyFeatures: ['Proteção de Matrículas das Fazendas', 'Arrendamento Rural Otimizado (IR 11,33% vs 27,5%)', 'Separação entre Risco de Safra e Propriedade da Terra', 'Sucessão Agrária sem Partilha de Glebas'],
    riskLevel: 'Máxima Blindagem',
    targetProfile: 'Produtores rurais, pecuaristas e famílias do agronegócio proprietárias de múltiplas fazendas ou áreas de lavoura.',
    defaultClauses: {
      inalienabilidade: true,
      impenhorabilidade: true,
      incomunicabilidade: true,
      usufruto: true,
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted, clauses }) => {
      let d = `CONTRATO SOCIAL DE HOLDING RURAL E AGROPECUÁRIA LTDA\n`;
      d += `DENOMINAÇÃO SOCIAL: ${(nomeEmpresarial || 'AGROPECUÁRIA E TERRAS').toUpperCase()} LTDA\n\n`;
      d += `SÓCIO PATRIARCA PRODUTOR: ${socioPF.toUpperCase()}\n`;
      d += `SUCESSORES HERDEIROS: ${herdeiros.toUpperCase()}\n`;
      d += `IMÓVEIS RURAIS INTEGRALIZADOS: ${ativos.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - OBJETO SOCIAL E ATIVIDADE RURAL:\n`;
      d += `A sociedade tem por objeto social a administração, exploração agrícola e pecuária de imóveis rurais próprios, bem como o arrendamento rural e parceria agrícola das fazendas de sua titularidade, além da participação em outras sociedades do agronegócio.\n\n`;
      d += `CLÁUSULA SEGUNDA - VEDAÇÃO DE AVAL E FIANÇA EM CPRs OPERACIONAIS:\n`;
      d += `Resta expressamente vedada à administração a concessão de avais, fianças, garantias reais (hipotecas ou alienações fiduciárias sobre as terras) em favor de operações de crédito agrícola, CPRs ou financiamentos de custeio contraídos por terceiros ou empresas operacionais, sob pena de nulidade do ato e responsabilidade pessoal do infrator.\n\n`;
      if (clauses.usufruto) {
        d += `CLÁUSULA TERCEIRA - RESERVA DE USUFRUTO SOBRE RENDAS DO ARRENDAMENTO:\n`;
        d += `O patriarca instituidor reserva para si o usufruto vitalício da totalidade das rendas provenientes de arrendamentos agrícolas e pastagens, cabendo-lhe a administração soberana da atividade pecuária e cerealista.\n\n`;
      }
      d += `CLÁUSULA QUARTA - FORO:\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'holding_royalties',
    title: 'Holding de Ativos Intangíveis, Franquias & Marcas',
    category: 'holdings',
    categoryName: 'Holdings & Sucessão',
    badge: 'PROPRIEDADE INTELECTUAL',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    description: 'Empresa cofre dedicada exclusivamente à titularidade de marcas registradas no INPI, patentes de invenção, softwares e direitos de franquia, licenciando para empresas operacionais mediante pagamento de royalties dedutíveis.',
    legalFramework: 'Lei de Propriedade Industrial (Lei nº 9.279/1996); Lei de Software (Lei nº 9.609/1998); Lei das Franquias (Lei nº 13.966/2019).',
    jurisprudence: 'STJ REsp 1.554.498/SP (legitimidade de segregação de marcas em holding com contratos de licenciamento oneroso).',
    keyFeatures: ['Isolamento da Marca Líder contra Riscos Fiscais/Trabalhistas', 'Recebimento de Royalties Dedutíveis na Operação', 'Licenciamento para Franqueados e Terceiros', 'Valuation Independente de Ativos Intangíveis'],
    riskLevel: 'Estratégico',
    targetProfile: 'Redes de franquias, indústrias com marcas fortes e empresas de tecnologia proprietárias de patentes e softwares.',
    defaultClauses: {
      autonomiaPatrimonial: true,
      nonCompete: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, cidade, ufEmpresa, dateFormatted }) => {
      let d = `CONTRATO SOCIAL DE HOLDING DE PROPRIEDADE INTELECTUAL E GESTÃO DE MARCAS LTDA\n`;
      d += `DENOMINAÇÃO SOCIAL: ${(nomeEmpresarial || 'BRAND & IP HOLDING').toUpperCase()} LTDA\n\n`;
      d += `SÓCIOS: ${socioPF.toUpperCase()} e ${herdeiros.toUpperCase()}\n`;
      d += `ATIVOS INTANGÍVEIS (MARCAS/PATENTES): ${ativos.toUpperCase()}\n\n`;
      d += `CLÁUSULA PRIMEIRA - DO OBJETO SOCIAL:\n`;
      d += `Constitui objeto: a) Titularidade, gestão, proteção e exploração econômica de marcas, patentes, desenhos industriais, direitos autorais e programas de computador (softwares); b) Licenciamento e cessão de direitos de uso de propriedade intelectual a empresas coligadas ou terceiros; c) Franquia empresarial.\n\n`;
      d += `CLÁUSULA SEGUNDA - DA INALIENABILIDADE DAS MARCAS SEM QUÓRUM QUALIFICADO:\n`;
      d += `A alienação, concessão de garantia ou licença exclusiva de qualquer registro marcário depositado junto ao INPI dependerá da aprovação prévia de sócios que representem no mínimo 85% do capital social.\n\n`;
      d += `CLÁUSULA TERCEIRA - FORO:\n`;
      d += `Comarca de ${cidade}/${ufEmpresa}, ${dateFormatted}.\n`;
      return d;
    }
  },

  {
    id: 'holding_offshore',
    title: 'Estrutura Internacional Offshore (PIC & Private Trust)',
    category: 'holdings',
    categoryName: 'Holdings & Sucessão',
    badge: 'INTERNACIONAL & TAX LAW',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    description: 'Veículo de investimento internacional (Personal Investment Company - BVI/Delaware/Cayman) e Private Trust, adaptado às regras da Lei nº 14.754/2023 (Tributação de Offshores e Trusts no Brasil - IRPF 15% ou transparência fiscal).',
    legalFramework: 'Lei nº 14.754/2023 (Tributação de Ativos no Exterior); Instrução Normativa RFB nº 2.180/2024; Código Civil Brasileiro.',
    jurisprudence: 'STF ADI 7.518 (constitucionalidade da tributação periódica de controladas no exterior); Prática de Trusts Internacionais.',
    keyFeatures: ['Diversificação Patrimonial Global em Moeda Forte', 'Regras de Sucessão Automática sem Burocracia no Brasil', 'Adequação Completa à Lei 14.754/2023', 'Blindagem contra Instabilidades Jurídicas Locais'],
    riskLevel: 'Alta Complexidade',
    targetProfile: 'Investidores com ativos líquidos globais superiores a US$ 500k que necessitam de alocação em moeda forte e governança internacional.',
    defaultClauses: {
      inalienabilidade: true,
      autonomiaPatrimonial: true,
      valuationMethod: 'balanco_determinacao',
    },
    generateFullDraft: ({ socioPF, herdeiros, ativos, nomeEmpresarial, dateFormatted }) => {
      let d = `DECLARAÇÃO DE ESTRUTURAÇÃO DE VEÍCULO INTERNACIONAL (OFFSHORE PIC / PRIVATE TRUST PROTOCOL)\n`;
      d += `EM CONFORMIDADE COM A LEI BRASILEIRA Nº 14.754/2023 E IN RFB Nº 2.180/2024\n\n`;
      d += `SETTLOR / BENEFICIAL OWNER RESIDENTE FISCAL NO BRASIL: ${socioPF.toUpperCase()}\n`;
      d += `SUCCESSOR BENEFICIARIES DESIGNADOS: ${herdeiros.toUpperCase()}\n`;
      d += `VEÍCULO INTERNACIONAL: ${(nomeEmpresarial || 'GLOBAL ASSETS INTERNATIONAL').toUpperCase()} LTD / TRUST\n`;
      d += `ATIVOS INTERNACIONAIS SOB CUSTÓDIA: ${ativos.toUpperCase()}\n\n`;
      d += `1. OPÇÃO DE REGIME FISCAL (LEI 14.754/2023):\n`;
      d += `O Titular declara perante as autoridades fiscais brasileiras que o veículo estrangeiro controlado adotará a sistemática de transparência fiscal (Art. 8º) ou tributação anual pelo regime de competência à alíquota de 15% (Art. 2º), declarando a totalidade de seus rendimentos na DAA e no Capitais Brasileiros no Exterior (CBE/BACEN).\n\n`;
      d += `2. PROTOCOLO DE DISTRIBUIÇÃO E SUCESSÃO GLOBAL:\n`;
      d += `Com o falecimento do Instituidor, a administração fiduciária (Trustee/Director) transferirá a fruição dos rendimentos e das cotas aos beneficiários designados, respeitando a legítima do ordenamento brasileiro, sem necessidade de homologação de partilha no exterior.\n\n`;
      d += `Data de Elaboração: ${dateFormatted}.\n`;
      return d;
    }
  }
];
