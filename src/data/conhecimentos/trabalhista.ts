import { ConhecimentoItem } from '../conhecimentosData';

export const CONHECIMENTOS_TRABALHISTA: ConhecimentoItem[] = [
  {
    id: 'con-trab-01',
    title: 'Rotinas e Cálculos de Folha: Rescisões Contratuais, Férias, 13º Salário e Adicionais (Insalubridade/Periculosidade)',
    assunto: 'trabalhista',
    assuntoLabel: 'Trabalhista & eSocial',
    subdivisao: 'trabalhista',
    subdivisaoLabel: 'Trabalhista/Previdenciário (CLT / eSocial / INSS)',
    normaOficial: 'Decreto-Lei nº 5.452/1943 (CLT) e Lei nº 13.467/2017 (Reforma Trabalhista)',
    orgaoEmissor: 'Ministério do Trabalho e Emprego (MTE) / Tribunal Superior do Trabalho (TST)',
    resumoTecnico: 'Metodologias de cálculo de folha mensal de pagamento, provisões de férias e 13º salário, modalidades de rescisão de contrato de trabalho e apuração dos adicionais legais de insalubridade, periculosidade e horas extras.',
    conteudoDetalhador: `As rotinas de departamento pessoal e folha envolvem regras matemáticas e jurídicas exatas:

1. Modalidades de Rescisão do Contrato de Trabalho:
- Sem Justa Causa (Iniciativa do Empregador): Saldo de salário, aviso prévio indenizado/trabalhado proporcional (Lei 12.506/11 - até 90 dias), férias vencidas e proporcionais com 1/3, 13º proporcional, saque do FGTS com Multa Rescisória de 40% e guia do seguro-desemprego;
- Com Justa Causa (Art. 482 da CLT): Apenas saldo de salário e férias vencidas com 1/3 (perde aviso, 13º proporcional, férias proporcionais, saque FGTS e seguro);
- Pedido de Demissão: Saldo de salário, 13º proporcional e férias com 1/3 (não saca FGTS nem recebe multa rescisória);
- Rescisão por Acordo Mútuo (Art. 484-A da CLT): Metade do aviso prévio indenizado (50%), metade da multa do FGTS (20%), demais verbas integrais e saque de até 80% do FGTS (sem direito a seguro-desemprego).

2. Adicionais de Remuneração:
- Adicional de Insalubridade (Art. 192 da CLT / NR-15): Incide sobre o Salário-Mínimo Nacional (Súmula Vinculante 4 do STF) nos graus Mínimo (10%), Médio (20%) ou Máximo (40%);
- Adicional de Periculosidade (Art. 193 da CLT / NR-16): 30% sobre o Salário-Base do empregado (inflamáveis, explosivos, energia elétrica, segurança patrimonial e motociclistas);
- Horas Extras e Reflexo em DSR (Descanso Semanal Remunerado): Mínimo de 50% em dias úteis e 100% em domingos/feriados, com integração no cálculo do DSR pela média ponderada.`,
    fundamentacaoLegal: [
      'Arts. 189 a 197 e 477 a 484-A da Consolidação das Leis do Trabalho (CLT)',
      'Súmula Vinculante nº 4 do Supremo Tribunal Federal (Insalubridade)',
      'Súmula nº 191 e Súmula nº 172 do Tribunal Superior do Trabalho (TST)'
    ],
    exemploPratico: {
      cenario: 'Empregado com salário-base de R$ 3.000,00 e 2 anos de empresa demitido sem justa causa com periculosidade e aviso prévio indenizado.',
      aplicacao: 'Cálculo do aviso prévio proporcional de 36 dias, projeção no 13º e férias, apuração de 30% de periculosidade integrando a remuneração (R$ 3.900,00) e geração da guia rescisória com multa de 40% do FGTS.',
      conclusao: 'Homologação e quitação no prazo improrrogável de 10 dias corridos (Art. 477, § 6º da CLT), evitando a multa do § 8º.'
    },
    tags: ['CLT', 'Rescisão Trabalhista', 'Multa 40% FGTS', 'Insalubridade', 'Periculosidade', 'Aviso Prévio'],
    linkDireitoId: 'dir-civ-03'
  },
  {
    id: 'con-trab-02',
    title: 'Encargos Sociais, CPP Patronal, FAP/RAT Ajustado e FGTS Digital via Pix',
    assunto: 'trabalhista',
    assuntoLabel: 'Trabalhista & eSocial',
    subdivisao: 'trabalhista',
    subdivisaoLabel: 'Trabalhista/Previdenciário (CLT / eSocial / INSS)',
    normaOficial: 'Lei nº 8.212/1991, Lei nº 14.438/2022 (FGTS Digital) e Decreto nº 3.048/1999',
    orgaoEmissor: 'Ministério do Trabalho e Emprego / Secretaria de Previdência / Caixa Econômica Federal',
    resumoTecnico: 'Apuração dos encargos de seguridade social devidos pela empresa sobre a folha de pagamento e implantação definitiva do FGTS Digital com arrecadação exclusivamente via Pix.',
    conteudoDetalhador: `A carga tributária patronal sobre a folha de salários compreende:

1. Contribuição Previdenciária Patronal (CPP):
- 20% sobre o total das remunerações pagas a empregados, trabalhadores avulsos e contribuintes individuais (sócios com pró-labore e autônomos);
- Empresas optantes pelo Simples Nacional nos Anexos I, II, III e V estão dispensadas do recolhimento dos 20% de CPP (recolhido na guia unificada do DAS); empresas do Anexo IV recolhem a CPP de 20% na DCTFWeb.

2. RAT Ajustado pelo Fator Acidentário de Prevenção (FAP):
RAT Ajustado = RAT Básico (1%, 2% ou 3% conforme o CNAE) × FAP (0,5000 a 2,0000)
- O FAP bonifica empresas com menor índice de acidentes de trabalho e penaliza empresas com alta sinistralidade;
- Terceiros / Outras Entidades (Sistema S, INCRA, Salário-Educação, SEBRAE): Varia entre 3,3% e 5,8% conforme o código FPAS da empresa.

3. O Novo FGTS Digital (Lei nº 14.438/2022):
- Substituição integral da antiga GFIP e Conectividade Social da Caixa;
- Utiliza os dados de remuneração declarados diretamente nos eventos do eSocial (S-1200 e S-2299);
- Geração da Guia Rápida do FGTS com liquidação exclusiva via Pix (QR Code), com recolhimento até o dia 20 do mês seguinte;
- Cálculo automático da indenização compensatória de 40% na rescisão, sem necessidade de chave de liberação da Caixa.`,
    fundamentacaoLegal: [
      'Arts. 22 e 28 da Lei nº 8.212/1991 (Custeio da Seguridade Social)',
      'Lei nº 14.438/2022 (Instituição do Sistema FGTS Digital)',
      'Decreto nº 3.048/1999 (Regulamento da Previdência Social - Anexo V)'
    ],
    exemploPratico: {
      cenario: 'Empresa de construção civil (Anexo IV Simples Nacional) com folha de salários de R$ 50.000,00, RAT de 3% e FAP de 1,2000.',
      aplicacao: 'RAT Ajustado = 3% × 1,2 = 3,6%. CPP Patronal = 20%. Total Previdenciário Patronal = 23,6% (R$ 11.800,00) transmitido via DCTFWeb. FGTS Digital de 8% (R$ 4.000,00) pago via Pix instantâneo.',
      conclusao: 'Quitação unificada dos encargos e eliminação de inconsistências no extrato previdenciário do trabalhador.'
    },
    tags: ['FGTS Digital', 'CPP Patronal', 'RAT/FAP', 'eSocial', 'DCTFWeb', 'Sistema S', 'Pix'],
    linkDireitoId: 'dir-pen-02'
  },
  {
    id: 'con-trab-03',
    title: 'Fechamento e Eventos Periódicos e Não Periódicos do eSocial (S-1000 a S-1299 e S-2200)',
    assunto: 'trabalhista',
    assuntoLabel: 'Trabalhista & eSocial',
    subdivisao: 'trabalhista',
    subdivisaoLabel: 'Trabalhista/Previdenciário (CLT / eSocial / INSS)',
    normaOficial: 'Manual de Orientação do eSocial (MOS) Versão S-1.2 e Decreto nº 8.373/2014',
    orgaoEmissor: 'Comitê Diretivo do eSocial / Receita Federal / Ministério do Trabalho',
    resumoTecnico: 'Arquitetura de mensageria em arquivos XML assinados digitalmente para comunicação compulsória de eventos cadastrais, trabalhistas e previdenciários de todos os empregadores brasileiros.',
    conteudoDetalhador: `A estrutura do eSocial organiza-se em 3 grandes grupos de eventos:

1. Eventos Iniciais e de Tabelas:
- S-1000: Informações do Empregador/Contribuinte (dados cadastrais, classificação tributária, desoneração);
- S-1005: Tabela de Estabelecimentos, Obras e CNAE Preponderante;
- S-1010: Tabela de Rubricas (Natureza das verbas salariais e incidências de INSS, IRRF e FGTS);
- S-1020: Tabela de Lotações Tributárias (FPAS e Terceiros).

2. Eventos Não Periódicos (Fatos Ocorridos no Mês):
- S-2190 / S-2200: Admissão Preliminar e Admissão de Trabalhador (prazo: até o dia imediatamente anterior ao início do trabalho);
- S-2205 / S-2206: Alteração de Dados Cadastrais e Contratuais;
- S-2230: Afastamento Temporário (atestados médicos superiores a 3 dias ou auxílio-doença);
- S-2299 / S-2399: Desligamento de Empregado e Término de TSVE (trabalhador sem vínculo).

3. Eventos Periódicos de Folha de Pagamento:
- S-1200: Remuneração do Trabalhador vinculado ao Regime Geral de Previdência Social;
- S-1210: Pagamentos de Rendimentos do Trabalho (data efetiva do pagamento e retenção de IRRF);
- S-1280: Informações Complementares aos Eventos Periódicos (Desoneração CPRB e Isenções);
- S-1299: Fechamento dos Eventos Periódicos (valida e envia débitos consolidados à DCTFWeb).`,
    fundamentacaoLegal: [
      'Decreto nº 8.373/2014 (Criação do eSocial)',
      'Portaria Conjunta SEPRT/RFB nº 82/2020',
      'Art. 47 da CLT (Penalidades por falta de registro de empregados)'
    ],
    exemploPratico: {
      cenario: 'Admissão de 5 novos operadores industriais para início das atividades na segunda-feira.',
      aplicacao: 'Transmissão do evento S-2200 no domingo anterior com exames admissionais vinculados, gerando a Carteira de Trabalho Digital dos empregados.',
      conclusao: 'Eliminação do risco de multa administrativa do Art. 47 da CLT por admissão extemporânea.'
    },
    tags: ['eSocial', 'MOS S-1.2', 'S-1200', 'S-1299', 'S-2200', 'Tabela de Rubricas S-1010'],
    linkDireitoId: 'dir-adm-01'
  },
  {
    id: 'con-trab-04',
    title: 'Segurança e Saúde no Trabalho (SST) no eSocial: S-2210 (CAT), S-2220 (ASO) e S-2240 (LTCAT)',
    assunto: 'trabalhista',
    assuntoLabel: 'Trabalhista & eSocial',
    subdivisao: 'trabalhista',
    subdivisaoLabel: 'Trabalhista/Previdenciário (CLT / eSocial / INSS)',
    normaOficial: 'Portaria Conjunta MTP/RFB nº 2/2021, Instrução Normativa INSS nº 128/2022 e NR-01',
    orgaoEmissor: 'Ministério do Trabalho e Emprego / Instituto Nacional do Seguro Social (INSS)',
    resumoTecnico: 'Obrigações eletrônicas de Saúde e Segurança do Trabalho exigidas pelo eSocial para alimentação do Perfil Profissiográfico Previdenciário (PPP Eletrônico) e custeio da Aposentadoria Especial.',
    conteudoDetalhador: `A tríade de eventos de SST no eSocial integra medicina do trabalho, engenharia e contabilidade:

1. Evento S-2210 (Comunicação de Acidente de Trabalho - CAT):
- Registro de acidente de trabalho típico, de trajeto ou doença ocupacional;
- Prazo rigoroso: até o primeiro dia útil seguinte ao da ocorrência e, em caso de morte, de imediato à autoridade competente.

2. Evento S-2220 (Monitoramento da Saúde do Trabalhador - ASO):
- Informações relativas aos Atestados de Saúde Ocupacional: Exame Admissional, Periódico, Retorno ao Trabalho, Mudança de Riscos Ocupacionais e Demissional;
- Detalhamento de exames complementares com base no Programa de Controle Médico de Saúde Ocupacional (PCMSO / NR-07).

3. Evento S-2240 (Condições Ambientais do Trabalho - Fatores de Risco):
- Registro da exposição do trabalhador a agentes nocivos Físicos (ruído, calor), Químicos (solventes, poeiras) e Biológicos (vírus, bactérias) com base no Laudo Técnico das Condições Ambientais do Trabalho (LTCAT);
- Código da Tabela 24 do eSocial e descrição de Equipamentos de Proteção Coletiva (EPC) e Individual (EPI com Certificado de Aprovação - CA);
- Determina o pagamento do adicional FAE (Financiamento da Aposentadoria Especial - 6%, 9% ou 12% sobre a folha).`,
    fundamentacaoLegal: [
      'Arts. 57 e 58 da Lei nº 8.213/1991 (Planos de Benefícios da Previdência Social)',
      'Instrução Normativa INSS nº 128/2022 (PPP Eletrônico)',
      'Normas Regulamentadoras NR-01, NR-07 e NR-09 do MTE'
    ],
    exemploPratico: {
      cenario: 'Trabalhador atua exposto a ruído contínuo de 88 dB(A) sem EPC eficaz no setor de caldeiraria.',
      aplicacao: 'Envio do evento S-2240 informando o agente nocivo 01.01.001 (ruído acima dos limites de tolerância) com base no LTCAT assinado por Engenheiro de Segurança.',
      conclusao: 'Alimentação fidedigna do PPP Eletrônico no Meu INSS e recolhimento do FAE para cobertura da aposentadoria especial de 25 anos.'
    },
    tags: ['SST', 'eSocial SST', 'S-2210', 'S-2220', 'S-2240', 'PPP Eletrônico', 'LTCAT', 'NR-01'],
    linkDireitoId: 'dir-civ-03'
  },
  {
    id: 'con-trab-05',
    title: 'Desoneração da Folha de Pagamento (CPRB - Lei 12.546/11) e Retenção Previdenciária de 3,5%',
    assunto: 'trabalhista',
    assuntoLabel: 'Trabalhista & eSocial',
    subdivisao: 'trabalhista',
    subdivisaoLabel: 'Trabalhista/Previdenciário (CLT / eSocial / INSS)',
    normaOficial: 'Lei nº 12.546/2011, Lei nº 14.784/2023 e IN RFB nº 2.053/2021',
    orgaoEmissor: 'Secretaria Especial da Receita Federal do Brasil',
    resumoTecnico: 'Regime substitutivo facultativo no qual as empresas dos 17 setores econômicos contemplados substituem a contribuição previdenciária patronal de 20% sobre a folha por alíquota de 1% a 4,5% sobre a Receita Bruta.',
    conteudoDetalhador: `A Contribuição Previdenciária sobre a Receita Bruta (CPRB) desonera a contratação de mão de obra formal:

1. Sistemática de Opção e Alíquotas:
- Opção irretratável para todo o ano-calendário, manifestada mediante o pagamento da CPRB relativa a janeiro de cada ano;
- Alíquotas conforme o setor:
  a) 1,0% para indústrias calçadistas, têxteis, confecções e proteína animal;
  b) 1,5% para transporte rodoviário coletivo de passageiros;
  c) 2,5% para empresas de TI, TIC e teleatendimento (call center);
  d) 4,5% para empresas de construção civil e obras de infraestrutura.

2. Impacto na Retenção de Serviços de Terceiros (Art. 7º, § 6º da Lei 12.546/11):
- As empresas prestadoras de serviços mediante cessão de mão de obra enquadradas na CPRB sofrem retenção previdenciária de apenas 3,5% sobre o valor bruto da nota fiscal/fatura (em vez da alíquota padrão de 11% do Art. 31 da Lei 8.212/91);
- Exige declaração formal de enquadramento na CPRB anexada à Nota Fiscal.

3. Escrituração no SPED:
- Informada na EFD-Reinf no evento R-2060 (CPRB) e no eSocial no evento S-1280, integrando os créditos e débitos diretamente na DCTFWeb.`,
    fundamentacaoLegal: [
      'Arts. 7º a 9º da Lei nº 12.546/2011 (Plano Brasil Maior)',
      'Lei nº 14.784/2023 (Prorrogação da Desoneração da Folha)',
      'Instrução Normativa RFB nº 2.053/2021'
    ],
    exemploPratico: {
      cenario: 'Empresa de desenvolvimento de software com faturamento de R$ 500.000,00 e folha salarial de R$ 300.000,00.',
      aplicacao: 'Pelo regime normal, pagaria 20% de CPP = R$ 60.000,00. Pela CPRB (2,5% sobre R$ 500.000,00), recolhe R$ 12.500,00 na EFD-Reinf/DCTFWeb.',
      conclusao: 'Economia financeira direta de R$ 47.500,00 por mês no custo tributário da folha de pagamento.'
    },
    tags: ['Desoneração da Folha', 'CPRB', 'Lei 12546/11', 'Retenção 3,5%', 'EFD-Reinf R-2060', 'Planejamento Tributário'],
    linkDireitoId: 'dir-trib-01'
  }
];
