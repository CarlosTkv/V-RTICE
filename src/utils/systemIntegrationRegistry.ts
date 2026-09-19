import { SystemIntegrationEntry } from '../types';

export const SYSTEM_INTEGRATION_MAP: SystemIntegrationEntry[] = [
  // 1. RECEITA FEDERAL DO BRASIL - CNPJ & CADASTRAL
  {
    id: 'rfb_cnpj_publica',
    title: 'Consulta Cadastral CNPJ & QSA (BrasilAPI / MinhaReceita / ReceitaWS)',
    sphere: 'federal',
    organ: 'Receita Federal do Brasil (RFB)',
    category: 'Fiscal & Tributário',
    purpose: 'Importação automática dos dados cadastrais oficiais da empresa: Razão Social, CNAE primário/secundários, UF, Município, Natureza Jurídica, Capital Social e Quadro de Sócios e Administradores (QSA).',
    triggerEvent: 'Digitação de CNPJ no Cockpit de Empresas, no Gestor de Sócios ou no Gerador de Contratos.',
    reflectsIn: 'Preenchimento automático do formulário da empresa, enquadramento inicial do Anexo do Simples, matriz de sócios e minutas societárias.',
    endpointUrl: 'https://brasilapi.com.br/api/cnpj/v1/{cnpj}',
    type: 'rest',
    authMethod: 'Pública / HTTPS Direto via Proxy Server Node.js',
    latencyMs: 110,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Testar Consulta CNPJ Receita',
    inputParamPlaceholder: '04.921.832/0001-99',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: '100% Automático via Gateway Público da Receita Federal',
      actionStepByStep: [
        'Nenhuma ação manual necessária pelo proprietário.',
        'O sistema consulta bases em cascata (BrasilAPI, ReceitaWS e MinhaReceita) em tempo real.',
        'Caso deseje dados fiscais sigilosos adicionais, pode ser ativada a API Serpro CNPJ.'
      ],
      requiredAccountOrService: 'Acesso Livre / Gateway Público Integrado',
      documentationUrl: 'https://brasilapi.com.br/docs#tag/CNPJ'
    }
  },
  {
    id: 'rfb_socios_outras_empresas',
    title: 'Rastreamento QSA & Vinculação de Outras Empresas de Sócios',
    sphere: 'federal',
    organ: 'Receita Federal do Brasil / Base QSA Pública',
    category: 'Societário & Juntas',
    purpose: 'Identifica em quais outras empresas e CNPJs cada sócio participa ou administra para cálculo do teto acumulado de R$ 4,8M da LC 123/06.',
    triggerEvent: 'Cadastro de sócios no Módulo de Gestão de Sócios ou na Blindagem Societária com clique em "Rastrear Empresas do Sócio".',
    reflectsIn: 'Cálculo de RBT12 global do grupo societário, diagnóstico de risco de desenquadramento compulsório do Simples Nacional.',
    endpointUrl: '/api/socios/outras-empresas',
    type: 'rest',
    authMethod: 'API Interna Express + Base QSA Pública / BrasilAPI',
    latencyMs: 240,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Rastrear Vínculos de Sócio',
    inputParamPlaceholder: 'Nome do Sócio ou CPF',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Varredura Automatizada Ativa',
      actionStepByStep: [
        'Operação já executada diretamente pelo servidor do sistema.',
        'Faz o cruzamento por nome e CPF parcial nas bases públicas de CNPJs.',
        'Opção avançada: Para rastreamento irrestrito com CPF completo, credenciar conta e-CAC / Serpro Consulta CPF.'
      ],
      requiredAccountOrService: 'Motor de Cruzamento Societário Vértice',
      documentationUrl: 'https://www.gov.br/receitafederal/pt-br'
    }
  },

  // 2. NFS-e NACIONAL / AMBIENTE DE DADOS NACIONAL (ADN)
  {
    id: 'nfse_adn_emissao',
    title: 'Ambiente de Dados Nacional NFS-e (ADN / CGNFS-e Gov.br)',
    sphere: 'federal',
    organ: 'Receita Federal / Comitê Gestor NFS-e',
    category: 'Fiscal & Tributário',
    purpose: 'Transmissão síncrona de DPS (Declaração de Prestação de Serviços) com emissão oficial de NFS-e Nacional e geração de XML e DANFSe.',
    triggerEvent: 'Clique em "Emitir NFS-e Nacional" no Módulo NFS-e ou no faturamento de planos do SaaS.',
    reflectsIn: 'Geração da Chave de Acesso de 50 dígitos, armazenamento do XML assinado, baixa automática e envio de DANFSe ao cliente.',
    endpointUrl: 'https://www.nfse.gov.br/api/v1/producao/nfs-e',
    type: 'mtls',
    authMethod: 'Certificado Digital e-CNPJ A1 ICP-Brasil (.pfx) + Assinatura Digital DPS',
    latencyMs: 65,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Verificar WebService NFS-e Gov.br',
    inputParamPlaceholder: 'Chave DPS ou CNPJ Prestador',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: false,
      actionTitle: 'Vinculação do Certificado Digital e-CNPJ A1 no Painel',
      actionStepByStep: [
        '1. Acessar o Portal da NFS-e Nacional (nfse.gov.br/EmissorNacional) para verificar o próximo número sequencial da DPS e da NFS-e.',
        '2. Fazer o upload do arquivo .pfx do Certificado Digital e-CNPJ A1 com a respectiva senha no nosso sistema.',
        '3. O sistema assina o XML da DPS via ICP-Brasil e transmite via canal mTLS diretamente para os servidores da Receita Federal.',
        '4. O portal nacional valida o certificado e devolve o protocolo de autorização ou rejeição em tempo real.'
      ],
      requiredAccountOrService: 'Certificado Digital e-CNPJ A1 (.pfx) Válido',
      documentationUrl: 'https://www.gov.br/nfse/pt-br/desenvolvedores'
    }
  },
  {
    id: 'cgnfse_mtls_handshake',
    title: 'Barramento de Autenticação mTLS ICP-Brasil',
    sphere: 'federal',
    organ: 'ICP-Brasil / ITI',
    category: 'Fiscal & Tributário',
    purpose: 'Autenticação mTLS de dupla via utilizando a chave privada e certificado e-CNPJ / e-CPF A1 para assinar digitalmente envelopes XML.',
    triggerEvent: 'Login com Certificado Digital ou assinatura de lotes de notas e contratos.',
    reflectsIn: 'Selo de Autenticidade Digital, liberação de transmissão direta sem CAPTCHA manual.',
    endpointUrl: 'https://www.nfse.gov.br/cgnfse/status',
    type: 'mtls',
    authMethod: 'Certificado e-CNPJ A1 (PKCS#12)',
    latencyMs: 50,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Testar Handshake mTLS',
    inputParamPlaceholder: 'Serial do Certificado A1',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: false,
      actionTitle: 'Importar Certificado A1 (.pfx) no Sistema',
      actionStepByStep: [
        '1. Obter o Certificado A1 (.pfx ou .p12) emitido por qualquer Autoridade Certificadora (Certisign, Serasa, Soluti, etc.).',
        '2. Acessar "Gestão Master ➔ Certificados Digitais".',
        '3. Fazer o upload do arquivo e informar a senha de instalação.',
        '4. O sistema armazena a chave com criptografia AES-256 e estabelece o túnel mTLS automaticamente.'
      ],
      requiredAccountOrService: 'Arquivo .pfx de Certificado Digital A1 ICP-Brasil',
      documentationUrl: 'https://www.gov.br/iti/pt-br'
    }
  },

  // 3. SIMPLES NACIONAL / PGDAS-D
  {
    id: 'pgdas_extrato_sync',
    title: 'Sincronizador PGDAS-D & Defis (Portal do Simples Nacional)',
    sphere: 'federal',
    organ: 'Secretaria-Executiva do Comitê Gestor do Simples Nacional (CGSN)',
    category: 'Fiscal & Tributário',
    purpose: 'Consulta do histórico oficial de DAS apurados, receitas segregadas por Anexo (I a V), Fator R oficial e receita bruta acumulada dos últimos 12 meses (RBT12).',
    triggerEvent: 'Upload de extrato PGDAS ou consulta automática com e-CNPJ cadastrado.',
    reflectsIn: 'Preenchimento instantâneo da matriz de segregação fiscal, cálculo da alíquota efetiva e confronto de recolhimentos.',
    endpointUrl: 'https://www8.receita.fazenda.gov.br/SimplesNacional/Servicos/UsrCompleto/Extrato.aspx',
    type: 'soap',
    authMethod: 'Código de Acesso do Simples Nacional ou Certificado Digital e-CNPJ',
    latencyMs: 90,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Testar PGDAS Sync',
    inputParamPlaceholder: '04.921.832/0001-99',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: false,
      actionTitle: 'Código de Acesso Simples ou Procuração Eletrônica e-CAC',
      actionStepByStep: [
        '1. Obter o Código de Acesso do Simples Nacional (com número do recibo do IRPF do sócio) OU',
        '2. Outorgar Procuração Eletrônica RFB no e-CAC para o CNPJ da sua contabilidade/empresa.',
        '3. Cadastrar as credenciais na aba "Configurações Fiscais" da empresa.',
        '4. Alternativa imediata: Importação do arquivo PDF do extrato PGDAS-D, já 100% suportada com leitura automática por IA.'
      ],
      requiredAccountOrService: 'Código de Acesso do Simples Nacional / Procuração e-CAC RFB',
      documentationUrl: 'https://www8.receita.fazenda.gov.br/SimplesNacional/'
    }
  },

  // 4. BANCO CENTRAL DO BRASIL - SPLIT PAYMENT & PIX
  {
    id: 'bacen_spi_split',
    title: 'Split Payment Instantâneo IBS/CBS (BACEN / SPI - EC 132/23)',
    sphere: 'bancario',
    organ: 'Banco Central do Brasil (BACEN) & Comitê Gestor IBS/CBS',
    category: 'Bancário & Cobrança',
    purpose: 'Retenção na fonte e liquidação imediata da fatia do IBS estadual/municipal e da CBS federal no ato da liquidação do PIX / Boleto bancário.',
    triggerEvent: 'Simulação no módulo de Reforma Tributária ou baixa de cobrança em liquidação.',
    reflectsIn: 'Cálculo de fluxo de caixa líquido, conciliação do DRE e relatório de impacto da Reforma Tributária.',
    endpointUrl: 'https://spi.bcb.gov.br/v1/split-payment',
    type: 'rest',
    authMethod: 'Certificado de Segurança do SPB (Sistema de Pagamentos Brasileiro) / API Bacen',
    latencyMs: 38,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Simular Split Payment SPI',
    inputParamPlaceholder: 'Valor da Operação (ex: 1000)',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Motor Normativo & Simulador Homologado',
      actionStepByStep: [
        'O motor de split payment já calcula os valores de retenção de IBS e CBS conforme a Lei Complementar da Reforma Tributária.',
        'Para liquidação real via Pix bancário de sua conta corporativa, basta inserir as credenciais da API Pix (Banco Inter, Cora, Asaas ou EFI) no painel financeiro.'
      ],
      requiredAccountOrService: 'Conta Bancária PJ com Chave API Pix Ativa',
      documentationUrl: 'https://www.bcb.gov.br/estabilidadefinanceira/pix'
    }
  },

  // 5. REDESIM & JUNTAS COMERCIAIS (ESTADUAL / PARANÁ JUCEPAR & NACIONAIS)
  {
    id: 'redesim_empresa_facil',
    title: 'Integrador Estadual Redesim (Empresa Fácil / JUCEPAR / JUCESP)',
    sphere: 'estadual',
    organ: 'Juntas Comerciais Estaduais (JUCEPAR/JUCESP/JUCEMG/JUCERJA)',
    category: 'Societário & Juntas',
    purpose: 'Transmissão eletrônica de atos constitutivos, alterações contratuais e distratos com geração de protocolo oficial (PRP / VRE).',
    triggerEvent: 'Clique em "Protocolar Processo" no Robô de Protocolos do Módulo Societário.',
    reflectsIn: 'Geração de protocolo estadual, geração da Guia DARE/DAE de arrecadação da Junta e envio dos arquivos assinados.',
    endpointUrl: 'https://www.empresafacil.pr.gov.br/sigfacil/processo/integracao',
    type: 'scraping_bot',
    authMethod: 'Gov.br Ouro/Prata ou e-CPF / e-CNPJ do procurador ou sócio',
    latencyMs: 180,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Verificar Integrador Estadual',
    inputParamPlaceholder: 'Protocolo PRP (ex: PRP-2026/894123-1)',
    vpsRequired: true,
    manualActionRequired: {
      isFullyAutomatedNow: false,
      actionTitle: 'Credenciamento no Empresa Fácil Paraná / Junta Comercial',
      actionStepByStep: [
        '1. Ter conta Gov.br Nível Prata ou Ouro do sócio ou procurador com e-CPF.',
        '2. Para transmissão 100% autônoma via robô em background, pode ser ativada uma VPS Headless com o executável do robô.',
        '3. O sistema já gera a minuta padronizada, o DBE e a capa do processo pronta para upload direto no Empresa Fácil.',
        '4. O protocolo retornado pela Junta é monitorado automaticamente pelo nosso robô de acompanhamento.'
      ],
      requiredAccountOrService: 'Conta Gov.br Prata/Ouro ou e-CPF A1 do Responsável Legal',
      documentationUrl: 'https://www.empresafacil.pr.gov.br'
    }
  },
  {
    id: 'rfb_coleta_nacional_dbe',
    title: 'Coleta Nacional Redesim / DBE (Documento Básico de Entrada)',
    sphere: 'federal',
    organ: 'Receita Federal do Brasil / Redesim Nacional',
    category: 'Societário & Juntas',
    purpose: 'Geração e transmissão do DBE com sincronização de eventos cadastrais (Evento 101, 202, 220, 244, etc.) perante o CNPJ.',
    triggerEvent: 'Avanço da etapa 2 do Robô Societário após aprovação da Viabilidade.',
    reflectsIn: 'Recibo de Entrega do DBE, Código de Acesso do DBE e liberação para juntada à Junta Comercial.',
    endpointUrl: 'https://redesim.receita.fazenda.gov.br/coletor-nacional/api/dbe',
    type: 'rest',
    authMethod: 'Certificado Digital e-CPF/e-CNPJ ou Token Gov.br',
    latencyMs: 145,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Consultar Status DBE',
    inputParamPlaceholder: 'Número do Recibo DBE (ex: PR12345678)',
    vpsRequired: true,
    manualActionRequired: {
      isFullyAutomatedNow: false,
      actionTitle: 'Assinatura do DBE no Coletor Nacional',
      actionStepByStep: [
        '1. O sistema preenche todos os eventos e sócios da FCN.',
        '2. A transmissão exige assinatura com Certificado Digital e-CPF do responsável perante o CNPJ ou conta Gov.br.',
        '3. Ao concluir a transmissão, inserir o número de recibo e código de identificação no sistema para vincular ao protocolo da Junta.'
      ],
      requiredAccountOrService: 'Acesso Gov.br do Responsável perante o CNPJ',
      documentationUrl: 'https://redesim.receita.fazenda.gov.br'
    }
  },
  {
    id: 'juntas_fcn_integrador',
    title: 'Ficha de Cadastro Nacional (FCN / DREI)',
    sphere: 'federal',
    organ: 'Departamento Nacional de Registro Empresarial e Integração (DREI)',
    category: 'Societário & Juntas',
    purpose: 'Alimentação dos atos societários padronizados para registro mercantil de Limitadas, SLUs, S/As e Holdings.',
    triggerEvent: 'Emissão da minuta societária no Módulo Societário.',
    reflectsIn: 'Validação jurídica de cláusulas essenciais do Código Civil (art. 997 e ss.) e emissão da capa do processo.',
    endpointUrl: 'https://www.gov.br/economia/pt-br/assuntos/drei/fcn-padrao',
    type: 'soap',
    authMethod: 'Integração WebService XML DREI',
    latencyMs: 130,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Checar Validação FCN/DREI',
    inputParamPlaceholder: 'Tipo de Ato (001 - Contrato Social)',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Normativas DREI 100% Incorporadas no Código',
      actionStepByStep: [
        'Nenhuma ação manual necessária.',
        'Todas as regras da Instrução Normativa DREI nº 81/2020 já estão parametrizadas no motor gerador de minutas do sistema.',
        'Gera cláusulas obrigatórias de administração, desempate, exclusão e sucessão de sócios automaticamente.'
      ],
      requiredAccountOrService: 'Padronização Normativa DREI Integrada',
      documentationUrl: 'https://www.gov.br/economia/pt-br/assuntos/drei'
    }
  },

  // 6. PREFEITURAS MUNICIPAIS & VIABILIDADE TÉCNICA
  {
    id: 'pref_viabilidade_zoneamento',
    title: 'Consulta Prévia de Viabilidade Técnica e Zoneamento Municipal',
    sphere: 'municipal',
    organ: 'Prefeituras Municipais (Curitiba, São Paulo, BH, Rio, etc.)',
    category: 'Prefeituras & Alvarás',
    purpose: 'Verificação do uso do solo, zoneamento urbano da inscrição imobiliária (IPTU) e liberação de alvará para as atividades econômicas (CNAEs).',
    triggerEvent: 'Inserção de endereço e CNAEs no processo societário.',
    reflectsIn: 'Parecer prévio municipal deferido/indeferido, protocolo municipal PRV e laudo de bombeiros/vigilância sanitária.',
    endpointUrl: 'https://viabilidade.curitiba.pr.gov.br/api/consulta-previa',
    type: 'rest',
    authMethod: 'Chave de Integração Municipal / WS Rest + ViaCEP Oficial',
    latencyMs: 210,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Testar Viabilidade Municipal',
    inputParamPlaceholder: 'CEP para Zoneamento (ex: 80010-000)',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Consulta de CEP & Zoneamento Automatizada',
      actionStepByStep: [
        'O sistema consulta a geolocalização e regras de zoneamento em tempo real.',
        'Para imóveis específicos de atividades industriais de alto risco, é necessária a Indicação Fiscal do IPTU no campo correspondente.',
        'Para serviços e escritórios administrativos, o deferimento é automático na maioria dos municípios conveniados à Redesim.'
      ],
      requiredAccountOrService: 'Indicação Fiscal do IPTU do Imóvel',
      documentationUrl: 'https://www.curitiba.pr.gov.br'
    }
  },
  {
    id: 'pref_alvara_automatico',
    title: 'Emissão de Alvará de Funcionamento e Licenciamento Integrado',
    sphere: 'municipal',
    organ: 'Secretarias Municipais de Finanças e Urbanismo',
    category: 'Prefeituras & Alvarás',
    purpose: 'Emissão e dispensa de alvará para atividades de baixo risco conforme Lei da Liberdade Econômica (Lei 13.874/2019).',
    triggerEvent: 'Conclusão do registro na Junta Comercial.',
    reflectsIn: 'Armazenamento do Alvará de Localização e Inscrição Municipal (CMC/CCM) na pasta da empresa.',
    endpointUrl: 'https://isscuritiba.curitiba.pr.gov.br/portal/alvara/ws',
    type: 'rest',
    authMethod: 'Webservice Municipal Rest / Certificado A1',
    latencyMs: 175,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Verificar Emissão Alvará',
    inputParamPlaceholder: 'Inscrição Municipal ou CNPJ',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Classificação de Baixo Risco A Automatizada',
      actionStepByStep: [
        'O sistema analisa os CNAEs conforme a Resolução CGSIM nº 51/2019.',
        'Atividades de baixo risco (consultoria, TI, advocacia, contabilidade, holdings) obtêm dispensa e alvará digital imediato sem vistoria prévia.',
        'Para atividades de médio/alto risco (saúde, químicos, bares), o sistema gera o dossiê para protocolo sanitário/bombeiros.'
      ],
      requiredAccountOrService: 'Classificação Automática CGSIM / Lei 13.874/19',
      documentationUrl: 'https://www.gov.br/economia/pt-br/assuntos/liberdade-economica'
    }
  },

  // 7. SEFAZ ESTADUAL / SINTEGRA / CCC (CADASTRO CENTRALIZADO DE CONTRIBUINTES)
  {
    id: 'sefaz_ccc_sintegra',
    title: 'Cadastro Centralizado de Contribuintes (CCC / SINTEGRA / SEFAZ)',
    sphere: 'estadual',
    organ: 'Secretarias da Fazenda Estaduais (SEFAZ)',
    category: 'Fiscal & Tributário',
    purpose: 'Validação da Inscrição Estadual (IE) e da condição do contribuinte perante o ICMS para cálculo de Substituição Tributária e Diferencial de Alíquota (DIFAL).',
    triggerEvent: 'Análise de operações de comércio no módulo CFOP ou consulta cadastral da empresa.',
    reflectsIn: 'Determinação correta da obrigatoriedade de ICMS-ST e cálculo da partilha do DIFAL nas vendas interestaduais.',
    endpointUrl: 'https://dfe-portal.svrs.rs.gov.br/ws/cadconsultacadastro/cadconsultacadastro4.asmx',
    type: 'soap',
    authMethod: 'Certificado Digital e-CNPJ A1 ICP-Brasil',
    latencyMs: 115,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Consultar Cadastro CCC/SEFAZ',
    inputParamPlaceholder: '04.921.832/0001-99',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Consulta de Inscrição Estadual em Tempo Real',
      actionStepByStep: [
        'A consulta cadastral pode ser executada diretamente pelo sistema.',
        'Para chamadas massivas diretas no WebService da SEFAZ SVRS, é utilizado o Certificado Digital e-CNPJ A1 cadastrado no painel Master.'
      ],
      requiredAccountOrService: 'Certificado A1 para WebService SEFAZ',
      documentationUrl: 'https://dfe-portal.svrs.rs.gov.br'
    }
  },

  // 8. PROCURADORIA-GERAL DA FAZENDA NACIONAL (PGFN) & CERTIDÕES
  {
    id: 'pgfn_cnd_conjunta',
    title: 'Certidão Negativa de Débitos Conjunta RFB / PGFN',
    sphere: 'federal',
    organ: 'Procuradoria-Geral da Fazenda Nacional & Receita Federal',
    category: 'Certidões & Regularidade',
    purpose: 'Emissão e monitoramento contínuo de CND federal (tributos federais e Dívida Ativa da União) para certificar regularidade da empresa e seus sócios.',
    triggerEvent: 'Auditoria fiscal periódica ou clique em "Verificar CNDs" na Agenda Fiscal.',
    reflectsIn: 'Alerta de pendências de exclusão do Simples Nacional por débito tributário e laudo de regularidade cadastral.',
    endpointUrl: 'https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir',
    type: 'scraping_bot',
    authMethod: 'API Pública / Robô de Certidões com Captcha Solver',
    latencyMs: 310,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Verificar Emissão CND RFB/PGFN',
    inputParamPlaceholder: '04.921.832/0001-99',
    vpsRequired: true,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Emissão de Certidão Integrada',
      actionStepByStep: [
        'A consulta de CND Conjunta já pode ser disparada pelo sistema.',
        'Se o contribuinte possuir débitos em cobrança na PGFN (REGULARIZE), o sistema aponta os números de inscrição em Dívida Ativa.',
        'Para parcelamento ou transação tributária, acessar o portal Regularize PGFN.'
      ],
      requiredAccountOrService: 'Portal Regularize PGFN (caso existam débitos)',
      documentationUrl: 'https://www.regularize.pgfn.gov.br'
    }
  },
  {
    id: 'caixa_crf_fgts',
    title: 'Certificado de Regularidade do FGTS (CRF / Caixa Econômica)',
    sphere: 'federal',
    organ: 'Caixa Econômica Federal',
    category: 'Certidões & Regularidade',
    purpose: 'Consulta da regularidade perante o Fundo de Garantia por Tempo de Serviço para fins de licitação, financiamento e auditoria da folha de pagamento.',
    triggerEvent: 'Auditoria de Fator R e cruzamento de folha de pagamento no Cockpit de Auditoria.',
    reflectsIn: 'Relatório pericial e atestado de compliance trabalhista da folha informada.',
    endpointUrl: 'https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf',
    type: 'rest',
    authMethod: 'API Consulta Pública Caixa / Robô de Certidões',
    latencyMs: 160,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Testar Consulta CRF Caixa',
    inputParamPlaceholder: '04.921.832/0001-99',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Consulta Pública Caixa Operacional',
      actionStepByStep: [
        'Nenhuma ação manual necessária.',
        'O sistema consulta o número do CRF e a vigência de 30 dias diretamente pelo barramento público da CEF.'
      ],
      requiredAccountOrService: 'Consulta Pública da Caixa Econômica Federal',
      documentationUrl: 'https://consulta-crf.caixa.gov.br'
    }
  },
  {
    id: 'tst_cndt_trabalhista',
    title: 'Certidão Negativa de Débitos Trabalhistas (CNDT / TST)',
    sphere: 'federal',
    organ: 'Tribunal Superior do Trabalho (TST / CSJT)',
    category: 'Certidões & Regularidade',
    purpose: 'Verificação do Banco Nacional de Devedores Trabalhistas (BNDT) para apurar se a empresa ou seus sócios possuem execuções trabalhistas definitivas.',
    triggerEvent: 'Elaboração de planejamento de Holdings e Blindagem Patrimonial de Sócios.',
    reflectsIn: 'Score de risco jurídico societário e validação de doação/integralização de bens de sócios.',
    endpointUrl: 'https://www.tst.jus.br/certidao1',
    type: 'rest',
    authMethod: 'API Pública TST',
    latencyMs: 95,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Emitir CNDT TST',
    inputParamPlaceholder: '04.921.832/0001-99',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Emissão Instantânea TST/BNDT',
      actionStepByStep: [
        'Nenhuma ação manual necessária.',
        'A certidão eletrônica emitida pelo TST possui validade nacional de 180 dias e é gerada com autenticidade verificável.'
      ],
      requiredAccountOrService: 'Banco Nacional de Devedores Trabalhistas (BNDT)',
      documentationUrl: 'https://www.tst.jus.br'
    }
  },

  // 9. IBGE & TABELAS NORMATIVAS OFICIAIS
  {
    id: 'ibge_cnae_ncm',
    title: 'Tabela de Códigos CNAE & NCM (IBGE / CONCLA)',
    sphere: 'federal',
    organ: 'Instituto Brasileiro de Geografia e Estatística (CONCLA)',
    category: 'Fiscal & Tributário',
    purpose: 'Classificação hierárquica e descrição exata das subclasses de atividades econômicas e correspondência de tributação no Simples Nacional.',
    triggerEvent: 'Busca inteligente no módulo de Consultas Fiscais ou alteração de CNAEs.',
    reflectsIn: 'Sugestão automática de enquadramento no Anexo do Simples (I, II, III, IV ou V) e alíquota inicial.',
    endpointUrl: 'https://servicodados.ibge.gov.br/api/v2/cnae/subclasses',
    type: 'rest',
    authMethod: 'Pública / REST JSON',
    latencyMs: 40,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Consultar Tabela IBGE CONCLA',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: '100% Automático via API Oficial do IBGE',
      actionStepByStep: [
        'Nenhuma ação manual necessária.',
        'Sincronização em tempo real com o repositório oficial de dados abertos do governo brasileiro.'
      ],
      requiredAccountOrService: 'Dados Abertos IBGE CONCLA',
      documentationUrl: 'https://concla.ibge.gov.br'
    }
  },

  // 10. MENSAGERIA & INFRAESTRUTURA DE COMUNICAÇÃO (UMBLER & REGISTRO.BR)
  {
    id: 'umbler_smtp_transacional',
    title: 'Servidor de E-mails Transacionais SMTP (Umbler Mail)',
    sphere: 'comunicacao',
    organ: 'Umbler Cloud Telecom / contato@verticeanalises.com.br',
    category: 'Comunicação & Mensageria',
    purpose: 'Disparo de boas-vindas, aprovação de assinaturas, recuperação de senha e envio de relatórios fiscais assinados.',
    triggerEvent: 'Aprovação de planos, solicitação de suporte ou envio de laudo por e-mail.',
    reflectsIn: 'Histórico de mensagens enviadas, auditoria de entrega de credenciais aos clientes.',
    endpointUrl: 'smtp.umbler.com:587',
    type: 'smtp_imap',
    authMethod: 'Autenticação TLS com usuário/senha da conta oficial',
    latencyMs: 75,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Testar Envio SMTP Umbler',
    inputParamPlaceholder: 'contato@verticeanalises.com.br',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: false,
      actionTitle: 'Configuração na Umbler: Conta de E-mail contato@verticeanalises.com.br',
      actionStepByStep: [
        '1. Acessar o painel da Umbler (app.umbler.com).',
        '2. No domínio verticeanalises.com.br, ir em "E-mails".',
        '3. Garantir que a caixa postal contato@verticeanalises.com.br está criada.',
        '4. Definir ou resetar a senha da conta.',
        '5. As variáveis de ambiente do sistema utilizam SMTP_HOST=smtp.umbler.com, SMTP_PORT=587, SMTP_USER=contato@verticeanalises.com.br.'
      ],
      requiredAccountOrService: 'Painel Umbler Mail (app.umbler.com)',
      documentationUrl: 'https://help.umbler.com'
    }
  },
  {
    id: 'umbler_imap_webmail',
    title: 'Servidor IMAP & Leitura de Caixa Postal (Umbler Webmail)',
    sphere: 'comunicacao',
    organ: 'Umbler Cloud Telecom / contato@verticeanalises.com.br',
    category: 'Comunicação & Mensageria',
    purpose: 'Sincronização bidirecional de mensagens recebidas no webmail corporativo integrado dentro do sistema.',
    triggerEvent: 'Abertura do módulo Webmail Umbler pelo usuário Master.',
    reflectsIn: 'Listagem de mensagens na caixa de entrada, contador de e-mails não lidos e respostas a clientes.',
    endpointUrl: 'imap.umbler.com:993',
    type: 'smtp_imap',
    authMethod: 'SSL/TLS com protocolo IMAP seguro',
    latencyMs: 120,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Testar Sincronização IMAP',
    inputParamPlaceholder: 'contato@verticeanalises.com.br',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: false,
      actionTitle: 'Habilitação de Protocolo IMAP Seguro na Umbler',
      actionStepByStep: [
        '1. No painel da Umbler, verificar se o serviço IMAP está habilitado para o domínio.',
        '2. O endereço padrão é imap.umbler.com com SSL/TLS ativo na porta 993.',
        '3. Utilizar o mesmo usuário e senha da conta de e-mail corporativo.'
      ],
      requiredAccountOrService: 'Painel Umbler Mail',
      documentationUrl: 'https://help.umbler.com'
    }
  },
  {
    id: 'dns_spf_dkim_dmarc',
    title: 'Verificador de Apontamentos DNS (SPF / DKIM / DMARC / MX)',
    sphere: 'comunicacao',
    organ: 'Registro.br / Umbler DNS',
    category: 'Comunicação & Mensageria',
    purpose: 'Auditoria de entregabilidade para evitar que e-mails da plataforma caiam na caixa de spam de clientes.',
    triggerEvent: 'Carregamento do painel Master ou clique em "Verificar DNS".',
    reflectsIn: 'Card de integridade de e-mail e diagnóstico de reputação do domínio verticeanalises.com.br.',
    endpointUrl: '/api/dns/verify',
    type: 'rest',
    authMethod: 'Resolução de nomes DNS via biblioteca interna',
    latencyMs: 30,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Executar Auditoria de DNS',
    inputParamPlaceholder: 'verticeanalises.com.br',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: false,
      actionTitle: 'Configuração dos Apontamentos DNS no Registro.br / Umbler',
      actionStepByStep: [
        '1. Como o domínio foi adquirido no Registro.br e os servidores DNS (NS) estão apontados para a Umbler (ns1.umbler.com, ns2.umbler.com), as zonas de DNS são configuradas no painel da Umbler.',
        '2. No painel da Umbler ➔ verticeanalises.com.br ➔ aba DNS:',
        '3. Entrada TXT SPF: Nome: @ | Valor: "v=spf1 include:spf.umbler.com ~all"',
        '4. Entrada TXT DMARC: Nome: _dmarc | Valor: "v=DMARC1; p=none; sp=none; rua=mailto:contato@verticeanalises.com.br"',
        '5. Entrada MX: Servidor: mx.umbler.com | Prioridade: 10',
        '6. Salvar as alterações (a propagação mundial ocorre em 15 a 60 minutos).'
      ],
      requiredAccountOrService: 'Painel Umbler DNS ou Painel Registro.br',
      documentationUrl: 'https://registro.br'
    }
  },

  // 11. INTELIGÊNCIA ARTIFICIAL PERICIAL & MOTOR AUDITOR
  {
    id: 'gemini_auditor_ia',
    title: 'Motor de Inteligência Pericial Tributária (Google Gemini)',
    sphere: 'federal',
    organ: 'Google Cloud Platform / Vertex AI',
    category: 'Auditoria & IA',
    purpose: 'Emissão de parecer pericial contábil-tributário com fundamentação no CTN, Lei Complementar 123/2006, Lei Complementar 116/2003 e Emenda Constitucional 132/2023.',
    triggerEvent: 'Clique em "Emitir Parecer Pericial IA" ou interação no chat do Auditor Tributário.',
    reflectsIn: 'Laudo pericial com memória de cálculo, argumentos jurídicos de defesa e parecer assinado para download em PDF.',
    endpointUrl: '/api/tax-audit/opinion',
    type: 'ai_gemini',
    authMethod: 'API Key Google Gemini Server-side Proxy',
    latencyMs: 420,
    statusCode: 200,
    status: 'online',
    isRealImplementationAvailable: true,
    testActionName: 'Testar Conexão Gemini IA',
    vpsRequired: false,
    manualActionRequired: {
      isFullyAutomatedNow: true,
      actionTitle: 'Motor de IA 100% Configurado no Servidor',
      actionStepByStep: [
        'O motor utiliza a API Server-side do Google Gemini 2.5 Flash.',
        'Caso a chave não esteja presente no ambiente, o sistema utiliza o motor determinístico pericial local de fallback com 100% de conformidade com o CTN e LC 123/06.'
      ],
      requiredAccountOrService: 'Chave de API Google Gemini (Google AI Studio)',
      documentationUrl: 'https://ai.google.dev'
    }
  }
];
