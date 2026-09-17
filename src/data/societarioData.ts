export interface JuntaComercialData {
  uf: string;
  stateName: string;
  juntaName: string; // Ex: JUCESP, JUCERJA, JUCEMG
  juntaFullName: string; // Ex: Junta Comercial do Estado de São Paulo
  portalName: string;
  portalUrl: string;
  redesimUrl: string;
  avgTime: string;
  estimatedFee: string;
  systemName: string; // Ex: VRE Redesim, Carioca Digital, JUCEMG Ágil
  stepByStep: {
    abertura: Array<{ step: number; title: string; description: string; url?: string }>;
    alteracao: Array<{ step: number; title: string; description: string; url?: string }>;
    encerramento: Array<{ step: number; title: string; description: string; url?: string }>;
  };
}

export interface CompanyTypeDetail {
  id: 'slu' | 'ltda' | 'ei' | 'mei' | 'sa' | 'sociedade_simples' | 'scp';
  title: string;
  subtitle: string;
  badge: string;
  legalBasis: string;
  minPartners: string;
  minCapital: string;
  liability: string;
  registrationBody: string;
  particularities: string[];
  obligations: string[];
  impediments: string[];
  currentRules: string[];
}

export const JUNTAS_COMERCIAIS_DATABASE: Record<string, JuntaComercialData> = {
  SP: {
    uf: 'SP',
    stateName: 'São Paulo',
    juntaName: 'JUCESP',
    juntaFullName: 'Junta Comercial do Estado de São Paulo',
    portalName: 'VRE - Via Rápida Empresa Redesim SP',
    portalUrl: 'https://www.jucesp.sp.gov.br',
    redesimUrl: 'https://vreredesim.sp.gov.br',
    avgTime: '24h a 48h (deferimento automático em 4h no VRE Digital)',
    estimatedFee: 'R$ 96,22 (SLU/LTDA) a R$ 230,00',
    systemName: 'VRE Redesim / JUCESP Digital',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Consulta Prévia de Viabilidade no VRE Redesim', description: 'Acesse o portal VRE Redesim SP para pesquisar a disponibilidade do Nome Empresarial e a viabilidade do endereço perante a Prefeitura Municipal.', url: 'https://vreredesim.sp.gov.br' },
        { step: 2, title: 'Preenchimento do Coletor Nacional DBE (Receita Federal)', description: 'No portal Redesim da RFB, informe a viabilidade aprovada e preencha o Coletor Nacional para gerar o DBE (Documento Básico de Entrada) sob o Evento 101.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaboração do Ato Constitutivo (Contrato Social / SLU)', description: 'Elabore o Contrato Social ou Contrato Unipessoal com todas as qualificações dos sócios, capital social, cotas, administração e cláusula de falecimento de sócios.', url: '#' },
        { step: 4, title: 'Protocolo e Assinatura Digital no VRE JUCESP', description: 'Transmita o processo no VRE Digital. Efetue o pagamento da DARE JUCESP e colha as assinaturas dos sócios via gov.br (Prata/Ouro) ou Certificado Digital e-CPF.', url: 'https://www.jucesp.sp.gov.br' },
        { step: 5, title: 'Inscrição Municipal / Estadual & Licenciamento', description: 'Obtenha o NIRE e CNPJ automaticamente. O sistema direciona para a Inscrição Estadual (SEFAZ/SP) e emissão do Alvará/CLCB no portal do Licenciamento de SP.', url: 'https://vreredesim.sp.gov.br' }
      ],
      alteracao: [
        { step: 1, title: 'Pesquisa de Viabilidade (se houver mudança de endereço/CNAE/Nome)', description: 'Caso haja alteração de endereço, razão social ou inclusão de atividades, solicite a nova viabilidade no VRE Redesim.', url: 'https://vreredesim.sp.gov.br' },
        { step: 2, title: 'Emissão do DBE de Alteração Contratual (RFB)', description: 'Selecione no Coletor Nacional os eventos de alteração (ex: Evento 220 para Nome, 202 para Capital, 244 para Sócios) e vincule ao recibo da viabilidade.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaboração da Alteração Contratual com Consolidação', description: 'Redija o instrumento especificando apenas os campos alterados no preâmbulo e inclua obrigatoriamente a Consolidação do Contrato Social ao final.', url: '#' },
        { step: 4, title: 'Envio Digital no VRE JUCESP e Assinaturas Eletrônicas', description: 'Anexe o documento em PDF/A no VRE JUCESP, pague a DARE de alteração e colha as assinaturas dos sócios com conta gov.br ou e-CPF.', url: 'https://www.jucesp.sp.gov.br' },
        { step: 5, title: 'Atualização Cadastral nos Órgãos Públicos e Bancos', description: 'Após registro na JUCESP, atualize a Inscrição Municipal, Inscrição Estadual, Certificados Digitais e cadastros bancários.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Elaboração do Distrato Social (Encerramento)', description: 'Redija o Distrato Social nomeando o sócio liquidante, declarando a quitação do ativo/passivo e a divisão do capital remanescente.', url: '#' },
        { step: 2, title: 'Emissão do DBE de Baixa na Receita Federal', description: 'No Coletor Nacional Redesim, selecione o Evento 517 (Extinção por Encerramento de Liquidação Voluntária). Nos termos da LC 147/2014, a baixa independe de certidões negativas.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Protocolo de Baixa no VRE JUCESP', description: 'Protocolar o Distrato Social e o DBE no VRE JUCESP. O deferimento é isento de taxas estaduais no estado de SP para ME/EPP.', url: 'https://www.jucesp.sp.gov.br' },
        { step: 4, title: 'Transmissão de Declarações de Extinção', description: 'Transmitir DEFIS/PGDAS-D de Situação Especial (Extinção) à Receita Federal e solicitar cancelamento da Inscrição Municipal e Estadual.', url: '#' }
      ]
    }
  },
  RJ: {
    uf: 'RJ',
    stateName: 'Rio de Janeiro',
    juntaName: 'JUCERJA',
    juntaFullName: 'Junta Comercial do Estado do Rio de Janeiro',
    portalName: 'REGIN JUCERJA / Carioca Digital',
    portalUrl: 'https://www.jucerja.rj.gov.br',
    redesimUrl: 'https://www.jucerja.rj.gov.br/regin',
    avgTime: '24h a 72h',
    estimatedFee: 'R$ 130,00 a R$ 380,00',
    systemName: 'REGIN / JUCERJA Digital',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Pedido de Viabilidade no REGIN JUCERJA', description: 'Solicite a viabilidade locacional e de nome empresarial no sistema REGIN da JUCERJA com validação na Prefeitura do Rio/Municípios.', url: 'https://www.jucerja.rj.gov.br/regin' },
        { step: 2, title: 'Solicitação do DBE no Coletor Nacional (RFB)', description: 'Com o número do REGIN aprovado, solicite o DBE de inscrição de matriz (Evento 101).', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Redação do Contrato Social / Ato Constitutivo SLU', description: 'Elabore o contrato com as cláusulas societárias obrigatórias, incluindo regras de apuração de haveres por falecimento de sócio.', url: '#' },
        { step: 4, title: 'Protocolo Web no Portal JUCERJA e Pagamento de Taxa', description: 'Pague a taxa de registro (JUCERJA), carregue o arquivo e assine com gov.br ou certificado digital e-CPF.', url: 'https://www.jucerja.rj.gov.br' },
        { step: 5, title: 'Emissão do Alvará Eletrônico e Inscrição Estadual (SEFAZ/RJ)', description: 'Após deferimento na JUCERJA, obtenha a Inscrição Estadual e o Alvará através do REGIN/Prefeitura.', url: 'https://www.jucerja.rj.gov.br/regin' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade de Alteração no REGIN (se alteração de endereço/CNAE)', description: 'Acesse o REGIN JUCERJA para validar as novas informações no município.', url: 'https://www.jucerja.rj.gov.br/regin' },
        { step: 2, title: 'Emissão do DBE no Portal Redesim', description: 'Gere o DBE com os eventos de alteração aplicáveis.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Confecção da Alteração Contratual Consolidada', description: 'Elabore o instrumento registrando as alterações selecionadas e a consolidação do estatuto social.', url: '#' },
        { step: 4, title: 'Envio Digital no Portal JUCERJA', description: 'Protocolar o processo no ambiente web da JUCERJA e assinar eletronicamente.', url: 'https://www.jucerja.rj.gov.br' },
        { step: 5, title: 'Atualização nos Cadastros Públicos do RJ', description: 'Atualize SEFAZ/RJ, Prefeitura e conselhos profissionais.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Confecção do Distrato Social', description: 'Redigir o Distrato nomeando o responsável pela guarda de livros e documentos.', url: '#' },
        { step: 2, title: 'Emissão do DBE de Extinção no Coletor Nacional', description: 'Emitir DBE de baixa sob o evento 517.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Protocolo no JUCERJA Digital', description: 'Protocolar o Distrato e o DBE no portal JUCERJA.', url: 'https://www.jucerja.rj.gov.br' },
        { step: 4, title: 'Baixa de Inscrições Municipais e Estaduais no RJ', description: 'Apresentar declarações de extinção e efetuar baixa na SEFAZ/RJ e Prefeitura.', url: '#' }
      ]
    }
  },
  MG: {
    uf: 'MG',
    stateName: 'Minas Gerais',
    juntaName: 'JUCEMG',
    juntaFullName: 'Junta Comercial do Estado de Minas Gerais',
    portalName: 'JUCEMG Ágil / Portal Integrador MG',
    portalUrl: 'https://www.jucemg.mg.gov.br',
    redesimUrl: 'https://portalintegrador.jucemg.mg.gov.br',
    avgTime: '24h a 48h',
    estimatedFee: 'R$ 115,00 a R$ 260,00',
    systemName: 'JUCEMG Ágil / Portal Integrador',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Consulta de Viabilidade no Portal Integrador MG', description: 'Pesquisar disponibilidade de nome empresarial e viabilidade municipal de localização em MG.', url: 'https://portalintegrador.jucemg.mg.gov.br' },
        { step: 2, title: 'Emissão do DBE no Coletor Nacional', description: 'Gerar o Documento Básico de Entrada na Receita Federal vinculando a viabilidade de MG.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Contrato Social Constitutivo', description: 'Elaborar o ato constitutivo com preceitos do Código Civil e DREI IN 81/2020.', url: '#' },
        { step: 4, title: 'Módulo JUCEMG Ágil (Assinatura e Pagamento DAE)', description: 'Enviar pelo JUCEMG Ágil, pagar DAE e colher assinaturas gov.br/e-CPF.', url: 'https://www.jucemg.mg.gov.br' },
        { step: 5, title: 'Inscrição Estadual (SEFAZ/MG) e Alvará Municipal', description: 'Finalizar os registros fiscais para emissão de NF-e/NFS-e.', url: '#' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade no Integrador JUCEMG', description: 'Registrar consulta de viabilidade no estado de MG para alterações necessárias.', url: 'https://portalintegrador.jucemg.mg.gov.br' },
        { step: 2, title: 'Emissão de DBE de Alteração', description: 'Gerar DBE com eventos específicos no portal Redesim.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Alteração Contratual com Consolidação', description: 'Elaborar o documento com as cláusulas modificadas e consolidado final.', url: '#' },
        { step: 4, title: 'JUCEMG Ágil Digital', description: 'Enviar o processo para a JUCEMG e assinar com certificado digital.', url: 'https://www.jucemg.mg.gov.br' },
        { step: 5, title: 'Registro Fiscal em MG', description: 'Solicitar atualização no SIARE/SEFAZ-MG e prefeituras mineiras.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Elaboração do Distrato Social', description: 'Redigir termo de dissolução e partilha do capital social.', url: '#' },
        { step: 2, title: 'DBE de Baixa', description: 'Solicitar baixa no evento 517 perante a Receita Federal.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Protocolo JUCEMG', description: 'Dar entrada no distrato social no sistema JUCEMG.', url: 'https://www.jucemg.mg.gov.br' },
        { step: 4, title: 'Quitação e Baixas Fiscais', description: 'Baixar inscrição estadual no SIARE e municipal na Prefeitura.', url: '#' }
      ]
    }
  },
  RS: {
    uf: 'RS',
    stateName: 'Rio Grande do Sul',
    juntaName: 'JUCISRS',
    juntaFullName: 'Junta Comercial, Industrial e de Serviços do Estado do Rio Grande do Sul',
    portalName: 'Portal JUCISRS Digital',
    portalUrl: 'https://jucisrs.rs.gov.br',
    redesimUrl: 'https://jucisrs.rs.gov.br/redesim',
    avgTime: '24h a 48h',
    estimatedFee: 'R$ 120,00 a R$ 280,00',
    systemName: 'Tudo Fácil Empresas / JUCISRS Digital',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Viabilidade no Portal JUCISRS / Redesim RS', description: 'Realizar consulta prévia de nome e uso de solo no portal gaúcho.', url: 'https://jucisrs.rs.gov.br/redesim' },
        { step: 2, title: 'DBE na Receita Federal', description: 'Transmitir solicitações no Coletor Nacional para geração do DBE.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaborar Contrato Social ou SLU', description: 'Preencher instrumento contratual respeitando Código Civil e ITG 2000.', url: '#' },
        { step: 4, title: 'JUCISRS Digital (Junta 100% Digital)', description: 'Enviar e assinar pelo gov.br/e-CPF no sistema JUCISRS.', url: 'https://jucisrs.rs.gov.br' },
        { step: 5, title: 'Inscrição Estadual (Receita Estadual/RS) e Licenciamento', description: 'Efetuar cadastro fiscal na SEFAZ/RS e alvará municipal.', url: '#' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade de Alteração no RS', description: 'Consultar viabilidade no JUCISRS Redesim se aplicável.', url: 'https://jucisrs.rs.gov.br/redesim' },
        { step: 2, title: 'Emissão do DBE', description: 'Gerar o DBE de alteração no Coletor Nacional.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Instrumento de Alteração Consolidado', description: 'Redigir a alteração destacando cláusulas alteradas e texto consolidado.', url: '#' },
        { step: 4, title: 'Envio Digital JUCISRS', description: 'Submeter o processo no portal web com recolhimento da taxa gaúcha.', url: 'https://jucisrs.rs.gov.br' },
        { step: 5, title: 'Regularização Cadastral', description: 'Atualizar cadastros nos órgãos estaduais e municipais do RS.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Distrato Social', description: 'Elaborar termo de extinção amigável e liquidação.', url: '#' },
        { step: 2, title: 'DBE de Baixa', description: 'Solicitar baixa no evento 517 Redesim.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Protocolo JUCISRS', description: 'Deferimento digital do distrato na JUCISRS.', url: 'https://jucisrs.rs.gov.br' },
        { step: 4, title: 'Encerramento Fiscal RS', description: 'Finalizar Inscrição Estadual e licenças no RS.', url: '#' }
      ]
    }
  },
  PR: {
    uf: 'PR',
    stateName: 'Paraná',
    juntaName: 'JUCEPAR',
    juntaFullName: 'Junta Comercial do Paraná',
    portalName: 'Empresa Fácil Paraná / JUCEPAR',
    portalUrl: 'https://www.jucepar.pr.gov.br',
    redesimUrl: 'https://www.empresafacil.pr.gov.br',
    avgTime: '12h a 24h (Empresa Fácil Automática)',
    estimatedFee: 'R$ 110,00 a R$ 240,00',
    systemName: 'Empresa Fácil PR / JUCEPAR Digital',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Consulta no Portal Empresa Fácil PR', description: 'Acessar o Empresa Fácil Paraná para pesquisar viabilidade de endereço e nome empresarial.', url: 'https://www.empresafacil.pr.gov.br' },
        { step: 2, title: 'Solicitação do DBE', description: 'Gerar DBE no Coletor Nacional da Receita Federal.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaboração do Ato Constitutivo', description: 'Elaborar minuta contratual com regras do DREI e cláusulas de segurança jurídica.', url: '#' },
        { step: 4, title: 'Envio no Empresa Fácil PR', description: 'Anexar contrato, pagar a taxa da JUCEPAR e colher assinaturas gov.br/e-CPF.', url: 'https://www.jucepar.pr.gov.br' },
        { step: 5, title: 'Cadastros Fiscais em PR', description: 'Inscrição Estadual na SEFAZ/PR e emissão do Alvará Unificado.', url: 'https://www.empresafacil.pr.gov.br' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade no Empresa Fácil PR', description: 'Consultar viabilidade no portal paranaense se houver alteração de local/CNAE.', url: 'https://www.empresafacil.pr.gov.br' },
        { step: 2, title: 'DBE de Alteração', description: 'Solicitar eventos de alteração no portal Redesim.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Alteração com Consolidação', description: 'Elaborar alteração destacando pontos modificados e anexo consolidado.', url: '#' },
        { step: 4, title: 'Protocolo JUCEPAR Digital', description: 'Carregar processo no portal Empresa Fácil e assinar eletronicamente.', url: 'https://www.jucepar.pr.gov.br' },
        { step: 5, title: 'Atualização de Inscrições', description: 'Atualizar SEFAZ-PR e prefeitura municipal.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Distrato Social', description: 'Confecção do distrato declarando liquidação do acervo.', url: '#' },
        { step: 2, title: 'DBE de Baixa', description: 'Gerar o DBE evento 517 na RFB.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Registro na JUCEPAR', description: 'Protocolar o pedido de baixa no Empresa Fácil PR.', url: 'https://www.jucepar.pr.gov.br' },
        { step: 4, title: 'Baixa nos Órgãos do Paraná', description: 'Informar extinção para SEFAZ-PR e prefeitura.', url: '#' }
      ]
    }
  },
  SC: {
    uf: 'SC',
    stateName: 'Santa Catarina',
    juntaName: 'JUCESC',
    juntaFullName: 'Junta Comercial do Estado de Santa Catarina',
    portalName: 'Portal JUCESC Digital / JUCESC Online',
    portalUrl: 'https://www.jucesc.sc.gov.br',
    redesimUrl: 'https://www.jucesc.sc.gov.br/index.php/servicos/redesim',
    avgTime: '24h a 48h',
    estimatedFee: 'R$ 125,00 a R$ 270,00',
    systemName: 'JUCESC Digital / Redesim SC',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Viabilidade no Redesim SC', description: 'Consultar viabilidade de nome e localização em Santa Catarina.', url: 'https://www.jucesc.sc.gov.br' },
        { step: 2, title: 'Coleta Nacional DBE (RFB)', description: 'Preencher Coletor Nacional para emissão do DBE.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaboração do Contrato Social', description: 'Redigir ato constitutivos com diretrizes do Código Civil.', url: '#' },
        { step: 4, title: 'Protocolo JUCESC Digital', description: 'Carregar documentos na JUCESC Digital e assinar via gov.br.', url: 'https://www.jucesc.sc.gov.br' },
        { step: 5, title: 'SEFAZ/SC & Alvará Municipal', description: 'Emissão da Inscrição Estadual (SAT/SC) e licenciamento do município.', url: '#' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade SC (se necessário)', description: 'Realizar viabilidade no portal catarinense.', url: 'https://www.jucesc.sc.gov.br' },
        { step: 2, title: 'DBE de Alteração Redesim', description: 'Transmitir eventos de alteração na Receita Federal.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Alteração com Consolidação', description: 'Formular a alteração com consolidação obrigatória.', url: '#' },
        { step: 4, title: 'Submissão na JUCESC Online', description: 'Protocolar o processo no portal JUCESC.', url: 'https://www.jucesc.sc.gov.br' },
        { step: 5, title: 'Atualização de Registros', description: 'Atualizar cadastros fiscais e sanitários em SC.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Distrato Social', description: 'Ato de dissolução com quitação de deveres sociais.', url: '#' },
        { step: 2, title: 'DBE de Baixa', description: 'Emissão de DBE de extinção (Evento 517).', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Protocolo de Baixa JUCESC', description: 'Protocolar o distrato e o DBE no portal JUCESC.', url: 'https://www.jucesc.sc.gov.br' },
        { step: 4, title: 'Cancelamento em SC', description: 'Cancelar inscrição na SEFAZ/SC (SAT) e município.', url: '#' }
      ]
    }
  },
  BA: {
    uf: 'BA',
    stateName: 'Bahia',
    juntaName: 'JUCEB',
    juntaFullName: 'Junta Comercial do Estado da Bahia',
    portalName: 'REGIN JUCEB / Portal JUCEB',
    portalUrl: 'http://www.juceb.ba.gov.br',
    redesimUrl: 'http://www.juceb.ba.gov.br/regin',
    avgTime: '24h a 72h',
    estimatedFee: 'R$ 110,00 a R$ 250,00',
    systemName: 'REGIN JUCEB / 100% Digital JUCEB',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Viabilidade no REGIN JUCEB', description: 'Consultar viabilidade de nome e localização na Bahia.', url: 'http://www.juceb.ba.gov.br/regin' },
        { step: 2, title: 'Emissão de DBE', description: 'Solicitar DBE de constituição no portal Redesim.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Minuta de Contrato Social', description: 'Elaborar contrato respeitando legislação vigente.', url: '#' },
        { step: 4, title: 'Envio Digital JUCEB', description: 'Protocolar no portal JUCEB e efetuar pagamento da taxa baiana.', url: 'http://www.juceb.ba.gov.br' },
        { step: 5, title: 'SEFAZ/BA & Alvará Municipal', description: 'Registro fiscal na SEFAZ-BA e Prefeitura.', url: '#' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade REGIN', description: 'Solicitar viabilidade no estado da Bahia.', url: 'http://www.juceb.ba.gov.br/regin' },
        { step: 2, title: 'DBE de Alteração', description: 'Emitir DBE na Receita Federal.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Alteração Consolidada', description: 'Redigir instrumento de alteração contratual.', url: '#' },
        { step: 4, title: 'Protocolo JUCEB', description: 'Enviar e assinar com e-CPF/gov.br na JUCEB.', url: 'http://www.juceb.ba.gov.br' },
        { step: 5, title: 'Atualização Fiscal', description: 'Atualizar cadastros na Bahia.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Distrato Social', description: 'Elaborar distrato com quitação de cotas.', url: '#' },
        { step: 2, title: 'DBE de Baixa', description: 'Solicitar DBE evento 517.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Baixa na JUCEB', description: 'Protocolar liquidação na JUCEB.', url: 'http://www.juceb.ba.gov.br' },
        { step: 4, title: 'Baixa em BA', description: 'Encerrar inscrições estaduais e municipais.', url: '#' }
      ]
    }
  },
  PE: {
    uf: 'PE',
    stateName: 'Pernambuco',
    juntaName: 'JUCEPE',
    juntaFullName: 'Junta Comercial do Estado de Pernambuco',
    portalName: 'REGIN JUCEPE / Portal JUCEPE',
    portalUrl: 'https://www.jucepe.pe.gov.br',
    redesimUrl: 'https://www.jucepe.pe.gov.br/regin',
    avgTime: '24h a 48h',
    estimatedFee: 'R$ 115,00 a R$ 260,00',
    systemName: 'REGIN PE / JUCEPE Digital',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Viabilidade no REGIN JUCEPE', description: 'Consultar nome e viabilidade em Pernambuco.', url: 'https://www.jucepe.pe.gov.br/regin' },
        { step: 2, title: 'DBE no Coletor Nacional', description: 'Gerar o Documento Básico de Entrada.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaboração do Contrato', description: 'Formular o Ato Constitutivo.', url: '#' },
        { step: 4, title: 'JUCEPE Digital', description: 'Transmitir no portal da JUCEPE e assinar.', url: 'https://www.jucepe.pe.gov.br' },
        { step: 5, title: 'Cadastros em PE', description: 'Solicitar IE na SEFAZ/PE e licenças municipais.', url: '#' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade REGIN PE', description: 'Viabilidade para alterações cadastrais.', url: 'https://www.jucepe.pe.gov.br/regin' },
        { step: 2, title: 'DBE de Alteração', description: 'DBE de alteração contratual na RFB.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Alteração Consolidada', description: 'Elaborar minuta com consolidação.', url: '#' },
        { step: 4, title: 'Envio JUCEPE', description: 'Protocolar na JUCEPE.', url: 'https://www.jucepe.pe.gov.br' },
        { step: 5, title: 'Atualização em PE', description: 'Atualizar registros estaduais.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Distrato Social', description: 'Confecção do distrato social.', url: '#' },
        { step: 2, title: 'DBE de Extinção', description: 'Emitir DBE de baixa (517).', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Protocolo JUCEPE', description: 'Registrar baixa na JUCEPE.', url: 'https://www.jucepe.pe.gov.br' },
        { step: 4, title: 'Baixa em PE', description: 'Encerrar Inscrição na SEFAZ-PE.', url: '#' }
      ]
    }
  },
  CE: {
    uf: 'CE',
    stateName: 'Ceará',
    juntaName: 'JUCEC',
    juntaFullName: 'Junta Comercial do Estado do Ceará',
    portalName: 'Portal JUCEC / Simples Ceará',
    portalUrl: 'https://www.jucec.ce.gov.br',
    redesimUrl: 'https://www.jucec.ce.gov.br/redesim',
    avgTime: '12h a 24h (Vem Facilitar JUCEC)',
    estimatedFee: 'R$ 100,00 a R$ 230,00',
    systemName: 'Portal Agiliza JUCEC',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Viabilidade no Agiliza CE', description: 'Realizar viabilidade de nome e endereço no Ceará.', url: 'https://www.jucec.ce.gov.br' },
        { step: 2, title: 'DBE Receita Federal', description: 'Gerar o DBE de matriz no portal Redesim.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Contrato Social Constitutivo', description: 'Redigir contrato conforme preceitos do Código Civil.', url: '#' },
        { step: 4, title: 'JUCEC Digital', description: 'Protocolar no Agiliza JUCEC e assinar eletronicamente.', url: 'https://www.jucec.ce.gov.br' },
        { step: 5, title: 'SEFAZ/CE e Prefeitura', description: 'Ativação da Inscrição Estadual e Alvará no Ceará.', url: '#' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade CE', description: 'Consultar viabilidade no Ceará.', url: 'https://www.jucec.ce.gov.br' },
        { step: 2, title: 'DBE Alteração', description: 'Gerar DBE com eventos específicos.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Alteração Consolidada', description: 'Elaborar alteração contratual consolidada.', url: '#' },
        { step: 4, title: 'Submissão Agiliza CE', description: 'Protocolar o processo no portal JUCEC.', url: 'https://www.jucec.ce.gov.br' },
        { step: 5, title: 'Atualização Cadastral', description: 'Atualizar SEFAZ/CE e município.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Distrato Social', description: 'Redigir instrumento de extinção.', url: '#' },
        { step: 2, title: 'DBE de Baixa', description: 'Emitir DBE de baixa.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Protocolo JUCEC', description: 'Deferir a baixa no portal da JUCEC.', url: 'https://www.jucec.ce.gov.br' },
        { step: 4, title: 'Encerramento Fiscal CE', description: 'Solicitar baixa na SEFAZ/CE.', url: '#' }
      ]
    }
  },
  GO: {
    uf: 'GO',
    stateName: 'Goiás',
    juntaName: 'JUCEG',
    juntaFullName: 'Junta Comercial do Estado de Goiás',
    portalName: 'Portal JUCEG / Portal Web Goiás',
    portalUrl: 'https://www.juceg.go.gov.br',
    redesimUrl: 'https://www.juceg.go.gov.br/redesim',
    avgTime: '24h a 48h',
    estimatedFee: 'R$ 110,00 a R$ 250,00',
    systemName: 'JUCEG 100% Digital',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Viabilidade JUCEG', description: 'Consultar viabilidade no estado de Goiás.', url: 'https://www.juceg.go.gov.br' },
        { step: 2, title: 'DBE Receita Federal', description: 'Obter DBE no portal Redesim.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaboração do Contrato', description: 'Redigir estatuto contratual.', url: '#' },
        { step: 4, title: 'JUCEG Digital', description: 'Protocolar no sistema 100% digital da JUCEG.', url: 'https://www.juceg.go.gov.br' },
        { step: 5, title: 'SEFAZ/GO e Alvará', description: 'Inscrição Estadual na SEFAZ-GO e licenças municipais.', url: '#' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade GO', description: 'Viabilidade de alteração cadastral.', url: 'https://www.juceg.go.gov.br' },
        { step: 2, title: 'DBE de Alteração', description: 'Emitir DBE com dados atualizados.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Alteração Consolidada', description: 'Redigir minuta alterada e consolidada.', url: '#' },
        { step: 4, title: 'Envio Digital JUCEG', description: 'Enviar e assinar com e-CPF/gov.br na JUCEG.', url: 'https://www.juceg.go.gov.br' },
        { step: 5, title: 'Registros Fiscais GO', description: 'Atualizar SEFAZ-GO e prefeituras.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Distrato Social', description: 'Termo de dissolução voluntária.', url: '#' },
        { step: 2, title: 'DBE Baixa 517', description: 'DBE de encerramento na RFB.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Protocolo JUCEG', description: 'Baixa registrada no portal JUCEG.', url: 'https://www.juceg.go.gov.br' },
        { step: 4, title: 'Baixa em GO', description: 'Encerrar cadastros estaduais e municipais em GO.', url: '#' }
      ]
    }
  },
  DF: {
    uf: 'DF',
    stateName: 'Distrito Federal',
    juntaName: 'JUCIS-DF',
    juntaFullName: 'Junta Comercial, Industrial e Serviços do Distrito Federal',
    portalName: 'Portal JUCIS-DF Digital / Agiliza DF',
    portalUrl: 'https://www.jucis.df.gov.br',
    redesimUrl: 'https://www.agiliza.df.gov.br',
    avgTime: '12h a 24h',
    estimatedFee: 'R$ 95,00 a R$ 220,00',
    systemName: 'Agiliza DF / JUCIS-DF 100% Digital',
    stepByStep: {
      abertura: [
        { step: 1, title: 'Viabilidade no Agiliza DF', description: 'Consultar viabilidade no DF perante a Administração Regional/DF.', url: 'https://www.agiliza.df.gov.br' },
        { step: 2, title: 'DBE na Receita Federal', description: 'Transmitir no Coletor Nacional e obter o DBE.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Ato Constitutivo SLU/LTDA', description: 'Elaborar contrato respeitando legislação vigente.', url: '#' },
        { step: 4, title: 'Protocolo JUCIS-DF', description: 'Protocolar e assinar no portal JUCIS-DF.', url: 'https://www.jucis.df.gov.br' },
        { step: 5, title: 'Inscrição no DF (SEFP/DF)', description: 'Obter Inscrição no DF (CF/DF) e Licença de Funcionamento.', url: '#' }
      ],
      alteracao: [
        { step: 1, title: 'Viabilidade no DF', description: 'Consultar viabilidade de alteração se aplicável.', url: 'https://www.agiliza.df.gov.br' },
        { step: 2, title: 'DBE Alteração', description: 'DBE com os eventos selecionados.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Alteração Consolidada', description: 'Redigir instrumento com cláusula consolidada.', url: '#' },
        { step: 4, title: 'Protocolo Web DF', description: 'Transmitir via JUCIS-DF Digital.', url: 'https://www.jucis.df.gov.br' },
        { step: 5, title: 'Atualização no DF', description: 'Atualizar cadastro fiscal do Distrito Federal.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Distrato Social', description: 'Elaborar distrato com quitação de deveres.', url: '#' },
        { step: 2, title: 'DBE Baixa 517', description: 'Geração do DBE de baixa.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Baixa JUCIS-DF', description: 'Protocolar distrato no portal JUCIS-DF.', url: 'https://www.jucis.df.gov.br' },
        { step: 4, title: 'Baixa no CF/DF', description: 'Encerrar a inscrição do Distrito Federal.', url: '#' }
      ]
    }
  }
};

// Fallback gerador genérico para os demais 17 UFs do Brasil (AM, PA, ES, MT, MS, AL, AP, MA, PB, PI, RN, RO, RR, SE, TO, AC)
export const getJuntaComercialData = (uf: string): JuntaComercialData => {
  if (JUNTAS_COMERCIAIS_DATABASE[uf]) {
    return JUNTAS_COMERCIAIS_DATABASE[uf];
  }

  const juntaNamesMap: Record<string, { shortName: string; fullName: string; state: string; site: string }> = {
    AM: { shortName: 'JUCEA', fullName: 'Junta Comercial do Estado do Amazonas', state: 'Amazonas', site: 'https://www.jucea.am.gov.br' },
    PA: { shortName: 'JUCEPA', fullName: 'Junta Comercial do Estado do Pará', state: 'Pará', site: 'https://www.jucepa.pa.gov.br' },
    ES: { shortName: 'JUCEES', fullName: 'Junta Comercial do Estado do Espírito Santo', state: 'Espírito Santo', site: 'https://jucees.es.gov.br' },
    MT: { shortName: 'JUCEMAT', fullName: 'Junta Comercial do Estado de Mato Grosso', state: 'Mato Grosso', site: 'https://www.jucemat.mt.gov.br' },
    MS: { shortName: 'JUCEMS', fullName: 'Junta Comercial do Estado de Mato Grosso do Sul', state: 'Mato Grosso do Sul', site: 'http://www.jucems.ms.gov.br' },
    AL: { shortName: 'JUCEAL', fullName: 'Junta Comercial do Estado de Alagoas', state: 'Alagoas', site: 'https://www.juceal.al.gov.br' },
    AP: { shortName: 'JUCAP', fullName: 'Junta Comercial do Estado do Amapá', state: 'Amapá', site: 'https://jucap.ap.gov.br' },
    MA: { shortName: 'JUCEMA', fullName: 'Junta Comercial do Estado do Maranhão', state: 'Maranhão', site: 'https://www.jucema.ma.gov.br' },
    PB: { shortName: 'JUCEP', fullName: 'Junta Comercial do Estado da Paraíba', state: 'Paraíba', site: 'https://www.jucep.pb.gov.br' },
    PI: { shortName: 'JUCEPI', fullName: 'Junta Comercial do Estado do Piauí', state: 'Piauí', site: 'https://www.jucepi.pi.gov.br' },
    RN: { shortName: 'JUCERN', fullName: 'Junta Comercial do Estado do Rio Grande do Norte', state: 'Rio Grande do Norte', site: 'https://jucern.rn.gov.br' },
    RO: { shortName: 'JUCER', fullName: 'Junta Comercial do Estado de Rondônia', state: 'Rondônia', site: 'https://rondonia.ro.gov.br/jucer' },
    RR: { shortName: 'JUCERR', fullName: 'Junta Comercial do Estado de Roraima', state: 'Roraima', site: 'https://jucerr.rr.gov.br' },
    SE: { shortName: 'JUCESE', fullName: 'Junta Comercial do Estado de Sergipe', state: 'Sergipe', site: 'https://www.jucese.se.gov.br' },
    TO: { shortName: 'JUCETINS', fullName: 'Junta Comercial do Estado do Tocantins', state: 'Tocantins', site: 'https://jucetins.to.gov.br' },
    AC: { shortName: 'JUCAC', fullName: 'Junta Comercial do Estado do Acre', state: 'Acre', site: 'https://jucac.ac.gov.br' },
  };

  const info = juntaNamesMap[uf] || {
    shortName: `JUCE-${uf}`,
    fullName: `Junta Comercial do Estado (${uf})`,
    state: uf,
    site: `https://www.gov.br/empresas-e-negocios/pt-br/redesim`
  };

  return {
    uf,
    stateName: info.state,
    juntaName: info.shortName,
    juntaFullName: info.fullName,
    portalName: `Portal ${info.shortName} Redesim Digital`,
    portalUrl: info.site,
    redesimUrl: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim',
    avgTime: '24h a 48h',
    estimatedFee: 'R$ 100,00 a R$ 250,00',
    systemName: `${info.shortName} 100% Digital / Redesim`,
    stepByStep: {
      abertura: [
        { step: 1, title: `Consulta de Viabilidade no Portal Integrador do Estado (${uf})`, description: `Acesse o portal do integrador estadual da ${info.shortName} para pesquisar nome e viabilidade de endereço.`, url: info.site },
        { step: 2, title: 'Emissão do DBE no Coletor Nacional Redesim (RFB)', description: 'Preencha o Coletor Nacional da Receita Federal vinculando a viabilidade aprovada sob o Evento 101.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaboração do Contrato Social / Ato Constitutivo SLU', description: 'Redija o Contrato Social com base no Código Civil e DREI IN 81/2020.', url: '#' },
        { step: 4, title: `Protocolo Digital na ${info.shortName}`, description: `Carregue o processo na ${info.shortName}, pague a taxa de registro estadual e assine com gov.br ou e-CPF.`, url: info.site },
        { step: 5, title: 'Inscrição Estadual & Licenciamento Municipal', description: 'Obtenha a Inscrição Estadual (SEFAZ) e Alvará de Funcionamento no município.', url: info.site }
      ],
      alteracao: [
        { step: 1, title: `Viabilidade de Alteração na ${info.shortName}`, description: `Solicite nova viabilidade na ${info.shortName} se alterar endereço, nome ou atividades.`, url: info.site },
        { step: 2, title: 'Emissão do DBE no Portal Redesim', description: 'Gere o DBE com os eventos de alteração necessários.', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: 'Elaboração da Alteração Contratual com Consolidação', description: 'Redija o instrumento de alteração contratual especificando os campos alterados e anexe a consolidação contratual.', url: '#' },
        { step: 4, title: `Submissão Digital na ${info.shortName}`, description: `Submeta o processo na ${info.shortName} com assinatura eletrônica dos sócios.`, url: info.site },
        { step: 5, title: 'Atualização Cadastral nos Órgãos Fiscais', description: 'Atualize SEFAZ, prefeitura e conselhos de classe.', url: '#' }
      ],
      encerramento: [
        { step: 1, title: 'Elaboração do Distrato Social', description: 'Redija o distrato social nomeando o liquidante e declarando quitação do acervo.', url: '#' },
        { step: 2, title: 'DBE de Baixa no Coletor Nacional', description: 'Solicite baixa sob o evento 517 perante a Receita Federal (isenção de certidões nos termos da LC 147/2014).', url: 'https://www.gov.br/empresas-e-negocios/pt-br/redesim' },
        { step: 3, title: `Protocolo de Baixa na ${info.shortName}`, description: `Protocolar o distrato e o DBE no portal da ${info.shortName}.`, url: info.site },
        { step: 4, title: 'Baixa nos Órgãos Estaduais e Municipais', description: 'Transmitir declarações de extinção e encerrar inscrições fiscais.', url: '#' }
      ]
    }
  };
};

export const COMPANY_TYPES_DATABASE: CompanyTypeDetail[] = [
  {
    id: 'slu',
    title: 'SLU - Sociedade Limitada Unipessoal',
    subtitle: 'Modelo mais utilizado no Brasil • 1 Único Sócio • Proteção Patrimonial • Sem Capital Mínimo',
    badge: 'Mais Recomendado',
    legalBasis: 'Lei 14.195/2021; Art. 1.052, §§ 1º e 2º do Código Civil (Lei 10.406/2002); DREI IN 81/2020.',
    minPartners: '1 Único Sócio (Pessoa Física ou Jurídica)',
    minCapital: 'Livre (Qualquer valor a partir de R$ 1,00 - Fim da exigência de 100 Salários Mínimos da extinta EIRELI)',
    liability: 'LIMITADA ao valor do Capital Social integralizado',
    registrationBody: 'Junta Comercial do Estado (JUCESP, JUCERJA, etc.)',
    particularities: [
      'Substituiu definitivamente a antiga EIRELI (extinta pela Lei 14.195/2021).',
      'Não exige múltiplos sócios (pode ser constituída por 1 pessoa).',
      'Preserva a autonomia do patrimônio pessoal do sócio perante dívidas da pessoa jurídica (salvo fraude ou desconsideração da personalidade jurídica conforme Art. 50 do Código Civil).',
      'Permite que a mesma pessoa física seja titular de mais de uma SLU.'
    ],
    obligations: [
      'Manutenção de escrituração contábil regular conforme ITG 2000 R1 (Resolução CFC).',
      'Emissão de Nota Fiscal de Serviços (NFS-e) ou Mercadorias (NF-e).',
      'Cumprimento das obrigações acessórias federais, estaduais e municipais (DEFIS, PGDAS-D, SPED, DCTFWeb, EFD-Reinf).',
      'Aprovação anual de contas da administração.'
    ],
    impediments: [
      'Servidores públicos em regime de dedicação exclusiva não podem exercer a ADMINISTRAÇÃO da empresa (podem figurar como sócios cotistas se o estatuto do servidor permitir).',
      'Pessoas impedidas por condenação criminal falimentar ou peita (Art. 1.011 do CC).'
    ],
    currentRules: [
      'Totalmente compatível com o Simples Nacional, Lucro Presumido e Lucro Real.',
      'Razão social pode conter o nome do sócio ou palavra/expressão com o indicativo "LTDA".'
    ]
  },
  {
    id: 'ltda',
    title: 'LTDA - Sociedade Limitada Plural',
    subtitle: 'Sociedade de 2 ou mais sócios • Responsabilidade Limitada • Regida pelo Código Civil',
    badge: 'Tradicional Plural',
    legalBasis: 'Art. 1.052 a 1.087 do Código Civil (Lei 10.406/2002); DREI IN 81/2020.',
    minPartners: '2 ou mais Sócios (Pessoas Físicas e/ou Jurídicas)',
    minCapital: 'Livre (Definido em Contrato Social)',
    liability: 'LIMITADA ao valor das cotas de cada sócio, mas todos respondem SOLIDARIAMENTE pela integralização do capital social',
    registrationBody: 'Junta Comercial do Estado',
    particularities: [
      'Ideal para parcerias e sociedades empresárias com múltiplos investidores.',
      'O capital social é dividido em cotas (iguais ou desiguais).',
      'Regida pelo contrato social, com ampla liberdade de cláusulas de quórum, deliberação e governança.',
      'Permite distribuição desproporcional de lucros se previsto expressamente em contrato (Art. 1.007 do CC).'
    ],
    obligations: [
      'Reunião ou Assembleia Anual de Sócios nos 4 meses seguintes ao término do exercício social (Art. 1.078 do CC).',
      'Manutenção de livros ou fichas de atas de reuniões de sócios.',
      'Balanço Patrimonial e DRE assinados por Contador habilitado no CRC.',
      'Declarações acessórias de acordo com o regime tributário.'
    ],
    impediments: [
      'Impedimento de administração para servidores públicos impedidos por estatuto.',
      'Cessão de cotas a terceiros depende da não oposição de titulares de mais de 1/4 do capital social, salvo disposição em contrário no contrato (Art. 1.057 do CC).'
    ],
    currentRules: [
      'Pode optar pelo Simples Nacional se os sócios e a receita bruta RBT12 estiverem dentro dos limites legais (R$ 4,8 milhões/ano e somatório de participação em outras empresas conforme LC 123/2006).',
      'Uso da expressão "LTDA" obrigatório no final do nome empresarial.'
    ]
  },
  {
    id: 'ei',
    title: 'EI - Empresário Individual',
    subtitle: 'Titular único • Sem separação entre bens pessoais e da empresa • Responsabilidade Ilimitada',
    badge: 'Responsabilidade Ilimitada',
    legalBasis: 'Art. 966 e seguintes do Código Civil (Lei 10.406/2002).',
    minPartners: '1 Único Titular (Pessoa Física)',
    minCapital: 'Livre (Recomenda-se capital inicial compatível com as operações)',
    liability: 'ILIMITADA - O patrimônio pessoal da pessoa física responde integralmente pelas dívidas da empresa',
    registrationBody: 'Junta Comercial do Estado',
    particularities: [
      'Não há criação de uma pessoa jurídica com patrimônio separado do titular.',
      'O nome empresarial deve ser obrigatoriamente a Razão Social com o nome civil do titular (completo ou abreviado).',
      'Não é permitido para profissões intelectuais, científicas, literárias ou artísticas regulamentadas (ex: médicos, advogados, contadores, engenheiros não podem ser EI para sua profissão regulamentada).'
    ],
    obligations: [
      'Inscrição na Junta Comercial e CNPJ.',
      'Manutenção de escrituração fiscal/contábil.',
      'Recolhimento dos tributos e cumprimento de obrigações acessórias.'
    ],
    impediments: [
      'Vedado para atividades intelectuais regulamentadas em conselhos de classe.',
      'Servidores públicos impedidos por legislação específica.'
    ],
    currentRules: [
      'Com o advento da SLU (sem capital mínimo), a figura do EI caiu em desuso devido ao alto risco de responsabilidade ilimitada patrimonial.'
    ]
  },
  {
    id: 'mei',
    title: 'MEI - Microempreendedor Individual',
    subtitle: 'Faturamento até R$ 81.000/ano • Regime Simplificado DAS-MEI • Isenção de IRPJ/CSLL/PIS/COFINS',
    badge: 'Simplificado MEI',
    legalBasis: 'Lei Complementar 123/2006 (Art. 18-A) e Resoluções CGSN.',
    minPartners: '1 Titular (Não pode ter sócios)',
    minCapital: 'Livre',
    liability: 'ILIMITADA (Atuando como Empresário Individual simplificado)',
    registrationBody: 'Portal do Empreendedor (gov.br/mei) - Registro automático no CCMEI',
    particularities: [
      'Limite de faturamento anual de R$ 81.000,00 (ou R$ 251.600,00 para MEI Caminhoneiro).',
      'Tributação em valor fixo mensal via DAS-MEI (INSS + R$ 1,00 ICMS + R$ 5,00 ISS).',
      'Permite a contratação de apenas 1 empregado que receba 1 salário mínimo ou o piso da categoria.'
    ],
    obligations: [
      'Emissão de Relatório Mensal das Receitas Brutas.',
      'Emissão de Nota Fiscal quando prestar serviço para Pessoa Jurídica (PJ).',
      'Transmissão da DASN-SIMEI (Declaração Anual) até 31 de maio de cada ano.'
    ],
    impediments: [
      'O titular NÃO pode participar como sócio, administrador ou titular em NENHUMA outra empresa.',
      'Não pode ter filiais.',
      'Vedado para profissões regulamentadas (médicos, advogados, contadores, psicólogos, engenheiros, etc.).'
    ],
    currentRules: [
      'Desenquadramento automático se ultrapassar o limite de faturamento em mais de 20% (passando a recolher pelo Simples Nacional retroativo ao início do ano).'
    ]
  },
  {
    id: 'sa',
    title: 'S/A - Sociedade Anônima (Fechada ou Aberta)',
    subtitle: 'Capital dividido em Ações • Lei 6.404/76 • Grandes Empreendimentos e Captação de Investimentos',
    badge: 'Corporativo',
    legalBasis: 'Lei nº 6.404/1976 (Lei das S/A) e alterações.',
    minPartners: 'Mínimo de 2 Acionistas (salvo subsidiária integral)',
    minCapital: 'Definido no estatuto, com exigência de depósito de no mínimo 10% do valor integralizado em dinheiro no banco',
    liability: 'LIMITADA ao preço de emissão das ações subscritas ou adquiridas',
    registrationBody: 'Junta Comercial + CVM (se S/A de Capital Aberto)',
    particularities: [
      'Capital dividido em Ações (Ordinárias com direito a voto e Preferenciais com prioridade de dividendos).',
      'Órgãos de governança obrigatórios: Diretoria Executiva, Conselho de Administração (obrigatório em S/A aberta e capital autorizado) e Conselho Fiscal.',
      'Regida por Estatuto Social (e não Contrato Social).'
    ],
    obligations: [
      'Publicação de Demonstrações Financeiras em diário oficial e jornais de grande circulação (ou portal público conforme porte).',
      'Realização de Assembleia Geral Ordinária (AGO) anual.',
      'Manutenção de livros corporativos (Registro de Ações, Transferência de Ações, Atas de AGO/AGE).'
    ],
    impediments: [
      'Complexidade e custo regulatório elevados, incompatível com pequenos negócios sem investidores.'
    ],
    currentRules: [
      'A S/A Fechada com receita bruta anual de até R$ 78 milhões pode realizar publicações em formato eletrônico simplificado.'
    ]
  },
  {
    id: 'sociedade_simples',
    title: 'Sociedade Simples (Pura ou Limitada)',
    subtitle: 'Para Profissões Regulamentadas (Médicos, Advogados, Arquitetos) • Registrada no Cartório RCPJ',
    badge: 'Cartório RCPJ',
    legalBasis: 'Art. 997 a 1.038 do Código Civil (Lei 10.406/2002).',
    minPartners: '2 ou mais Sócios de profissões intelectuais ou científicas',
    minCapital: 'Livre',
    liability: 'Pura (ilimitada) ou Limitada (se constituída sob a forma de Sociedade Simples Limitada)',
    registrationBody: 'Cartório de Registro Civil das Pessoas Jurídicas (RCPJ) + OAB (para advogados)',
    particularities: [
      'Voltada para a prestação de serviços decorrentes de atividade intelectual, de natureza científica, literária ou artística.',
      'O registro ocorre no Cartório RCPJ (e não na Junta Comercial).',
      'Sociedades de Advogados são registradas exclusivamente na OAB da respectiva seccional.'
    ],
    obligations: [
      'Escrituração contábil e cumprimento de obrigações tributárias municipais e federais.',
      'Regras especiais para o ISS SUP (Sociedade Uniprofissional) com tributação fixa por profissional em determinados municípios.'
    ],
    impediments: [
      'Não pode praticar atos de comércio nem ter elemento de empresa que a descaracterize de sociedade simples.'
    ],
    currentRules: [
      'Pode optar pela Sociedade Simples Limitada para proteger o patrimônio pessoal dos profissionais associados.'
    ]
  },
  {
    id: 'scp',
    title: 'SCP - Sociedade em Conta de Participação',
    subtitle: 'Sociedade Sem Personalidade Jurídica • Sócio Ostensivo (Opera) + Sócio Participante (Investidor Oculto)',
    badge: 'Investimento Anjo',
    legalBasis: 'Art. 991 a 996 do Código Civil (Lei 10.406/2002).',
    minPartners: '2 Sócios (1 Ostensivo + 1 ou mais Participantes/Investidores)',
    minCapital: 'Livre',
    liability: 'Sócio Ostensivo responde exclusivamente perante terceiros; Sócio Participante responde apenas perante o Ostensivo conforme o contrato',
    registrationBody: 'Não exige registro público na Junta (opcional para fins de prova); CNPJ PJ emitido vinculado ao Sócio Ostensivo',
    particularities: [
      'Excelente estrutura para Investimento Anjo, Incorporação Imobiliária e Projetos Específicos (Joint Ventures).',
      'Não possui personalidade jurídica própria. O Sócio Ostensivo realiza todas as operações em seu próprio nome.',
      'O Sócio Participante (Investidor) aporta capital e recebe participação nos lucros sem expor seu nome ao mercado.'
    ],
    obligations: [
      'O Sócio Ostensivo deve manter contabilidade separada para a SCP.',
      'Prestação de contas periódica ao sócio investidor.'
    ],
    impediments: [
      'O Sócio Participante não pode praticar atos de gestão nem se apresentar a terceiros como sócio gestor, sob pena de responder ilimitadamente.'
    ],
    currentRules: [
      'Distribuição de lucros da SCP ao sócio participante é isenta de IRPF no Brasil (Art. 10 da Lei 9.249/95).'
    ]
  }
];

export const PORTE_EMPRESARIAL_DATABASE = {
  ME: {
    name: 'Microempresa (ME)',
    limit: 'Até R$ 360.000,00 / ano',
    legalBasis: 'Lei Complementar nº 123/2006, Art. 3º, I.',
    benefits: 'Tratamento favorecido em licitações públicas, dispensa de determinadas obrigações trabalhistas simplificadas, tributação simplificada no Simples Nacional.'
  },
  EPP: {
    name: 'Empresa de Pequeno Porte (EPP)',
    limit: 'De R$ 360.000,01 a R$ 4.800.000,00 / ano',
    legalBasis: 'Lei Complementar nº 123/2006, Art. 3º, II.',
    benefits: 'Tratamento diferenciado em licitações (margem de preferência até 10%), acesso ao Simples Nacional até R$ 4,8 milhões (com sublimite de ICMS/ISS de R$ 3.6M).'
  },
  DEMAIS: {
    name: 'Demais Portes (Normal / Sem Enquadramento de Porte)',
    limit: 'Acima de R$ 4.800.000,00 / ano',
    legalBasis: 'Regime Geral de Tributação (Lucro Presumido ou Lucro Real).',
    benefits: 'Sem limite de faturamento no Lucro Real; acesso a créditos plenos de PIS/COFINS não-cumulativos e ICMS.'
  }
};
