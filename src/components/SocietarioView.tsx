import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Building2, 
  FileText, 
  ExternalLink, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Printer, 
  Download, 
  Sparkles, 
  Search, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  ChevronRight, 
  ShieldCheck, 
  BookOpen, 
  Clock, 
  DollarSign, 
  MapPin, 
  Layers, 
  Scale, 
  Briefcase, 
  RefreshCw,
  Info,
  Sliders,
  Award
} from 'lucide-react';
import { CompanyData } from '../types';
import { BrandLogo } from './BrandLogo';
import { 
  JUNTAS_COMERCIAIS_DATABASE, 
  COMPANY_TYPES_DATABASE, 
  PORTE_EMPRESARIAL_DATABASE, 
  getJuntaComercialData,
  JuntaComercialData
} from '../data/societarioData';

interface SocietarioViewProps {
  currentCompany: CompanyData;
  onUpdateCompany?: (updated: CompanyData) => void;
}

export interface ContractPartnerInput {
  id: string;
  name: string;
  nationality: string;
  maritalStatus: string;
  propertyRegime?: string;
  profession: string;
  rg: string;
  rgIssuer: string;
  cpf: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  uf: string;
  cep: string;
  quotasCount: number;
  quotasValue: number;
  isAdministrator: boolean;
}

export const SocietarioView: React.FC<SocietarioViewProps> = ({ currentCompany }) => {
  // Estado das Abas Principais do Módulo Societário
  const [activeSubSection, setActiveSubSection] = useState<'gerador_contrato' | 'juntas_passo_a_passo' | 'modelos_guia'>('gerador_contrato');

  // --- ESTADOS DO PASSO A PASSO DAS JUNTAS COMERCIAIS ---
  const [selectedUf, setSelectedUf] = useState<string>(currentCompany?.uf || 'SP');
  const [juntaTab, setJuntaTab] = useState<'abertura' | 'alteracao' | 'encerramento'>('abertura');

  // --- ESTADOS DO GERADOR DE CONTRATO ---
  const [contractMode, setContractMode] = useState<'abertura' | 'alteracao' | 'distrato'>('abertura');
  
  // Campos de Identificação da Empresa
  const [nomeEmpresarial, setNomeEmpresarial] = useState<string>(currentCompany?.name || '');
  const [nomeFantasia, setNomeFantasia] = useState<string>((currentCompany as any)?.nomeFantasia || '');
  const [telefone, setTelefone] = useState<string>((currentCompany as any)?.telefone || '(11) 99999-9999');
  const [email, setEmail] = useState<string>((currentCompany as any)?.email || 'contato@empresa.com.br');
  const [porte, setPorte] = useState<'ME' | 'EPP' | 'DEMAIS'>('ME');
  const [naturezaJuridica, setNaturezaJuridica] = useState<'SLU' | 'LTDA' | 'EI' | 'SA' | 'SOCIEDADE_SIMPLES'>('SLU');
  
  // Endereço
  const [logradouro, setLogradouro] = useState<string>(
    typeof currentCompany?.address === 'string'
      ? (currentCompany.address as string).split(',')[0]
      : currentCompany?.address?.logradouro || 'Avenida Paulista'
  );
  const [numero, setNumero] = useState<string>('1000');
  const [complemento, setComplemento] = useState<string>('Sala 101');
  const [bairro, setBairro] = useState<string>('Bela Vista');
  const [cidade, setCidade] = useState<string>(currentCompany?.city || 'São Paulo');
  const [ufEmpresa, setUfEmpresa] = useState<string>(currentCompany?.uf || 'SP');
  const [cep, setCep] = useState<string>('01310-100');

  // Atividade e Capital
  const [cnaeCodigo, setCnaeCodigo] = useState<string>(currentCompany?.cnae || '6201-5/00');
  const [cnaeDescricao, setCnaeDescricao] = useState<string>('Desenvolvimento de programas de computador sob encomenda');
  const [capitalSocial, setCapitalSocial] = useState<number>(10000);
  const [valorNominalCota, setValorNominalCota] = useState<number>(1);
  const [integralizacaoPrazo, setIntegralizacaoPrazo] = useState<string>('à vista, em moeda corrente nacional');

  // Sócios
  const [partners, setPartners] = useState<ContractPartnerInput[]>(() => {
    if (currentCompany?.partners && currentCompany.partners.length > 0) {
      return currentCompany.partners.map((p, idx) => ({
        id: `partner-${idx + 1}`,
        name: p.name || 'Sócio Exemplo',
        nationality: 'brasileiro(a)',
        maritalStatus: 'solteiro(a)',
        propertyRegime: '',
        profession: 'Empresário(a)',
        rg: '12.345.678-9',
        rgIssuer: 'SSP/SP',
        cpf: p.cpf || '000.000.000-00',
        address: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Centro',
        city: currentCompany?.city || 'São Paulo',
        uf: currentCompany?.uf || 'SP',
        cep: '01000-000',
        quotasCount: Math.round(((p.participationPercent || 100) / 100) * 10000),
        quotasValue: Math.round(((p.participationPercent || 100) / 100) * 10000),
        isAdministrator: p.isManager !== undefined ? p.isManager : idx === 0
      }));
    }
    return [
      {
        id: 'partner-1',
        name: 'Carlos Miguel Vieira',
        nationality: 'brasileiro',
        maritalStatus: 'solteiro',
        propertyRegime: '',
        profession: 'Contador e Consultor Fiscal',
        rg: '44.555.666-7',
        rgIssuer: 'SSP/SP',
        cpf: '123.456.789-00',
        address: 'Av. Brigadeiro Faria Lima',
        number: '1500',
        complement: 'Cj 82',
        neighborhood: 'Jardim Paulistano',
        city: 'São Paulo',
        uf: 'SP',
        cep: '01452-001',
        quotasCount: 10000,
        quotasValue: 10000,
        isAdministrator: true
      }
    ];
  });

  // --- FLAGS DE ALTERAÇÃO (Para modo Alteração Contratual) ---
  const [flagNomeEmpresarial, setFlagNomeEmpresarial] = useState<boolean>(false);
  const [flagNomeFantasia, setFlagNomeFantasia] = useState<boolean>(false);
  const [flagEndereco, setFlagEndereco] = useState<boolean>(false);
  const [flagCnae, setFlagCnae] = useState<boolean>(false);
  const [flagCapitalSocial, setFlagCapitalSocial] = useState<boolean>(false);
  const [flagQuadroSocietario, setFlagQuadroSocietario] = useState<boolean>(false);
  const [flagAdministracao, setFlagAdministracao] = useState<boolean>(false);

  // --- CLÁUSULAS ADICIONAIS & QUESTIONÁRIO PRÉ-EMISSÃO ---
  const [showClausesModal, setShowClausesModal] = useState<boolean>(false);
  const [includeDeathClause, setIncludeDeathClause] = useState<boolean>(true); // OBRIGATÓRIA
  const [includeConsolidationClause, setIncludeConsolidationClause] = useState<boolean>(true); // OBRIGATÓRIA
  const [includeArbitrationClause, setIncludeArbitrationClause] = useState<boolean>(false);
  const [includeNonCompeteClause, setIncludeNonCompeteClause] = useState<boolean>(false);
  const [includeUnequalDistributionClause, setIncludeUnequalDistributionClause] = useState<boolean>(false);
  const [includePreemptionClause, setIncludePreemptionClause] = useState<boolean>(false);
  const [customAdditionalClauseText, setCustomAdditionalClauseText] = useState<string>('');

  // --- ESTADO DO CONTRATO GERADO FINAL ---
  const [generatedContractText, setGeneratedContractText] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Total de Cotas Calculadas dos Sócios
  const totalQuotasSum = partners.reduce((acc, p) => acc + (Number(p.quotasCount) || 0), 0);

  // Manipulação de Sócios
  const handleAddPartner = () => {
    const newId = `partner-${Date.now()}`;
    setPartners([
      ...partners,
      {
        id: newId,
        name: 'Novo Sócio Participante',
        nationality: 'brasileiro(a)',
        maritalStatus: 'solteiro(a)',
        propertyRegime: '',
        profession: 'Empresário(a)',
        rg: '00.000.000-0',
        rgIssuer: 'SSP/SP',
        cpf: '000.000.000-00',
        address: 'Rua Principal',
        number: '100',
        complement: '',
        neighborhood: 'Centro',
        city: cidade || 'São Paulo',
        uf: ufEmpresa || 'SP',
        cep: '01000-000',
        quotasCount: 1000,
        quotasValue: 1000,
        isAdministrator: false
      }
    ]);
  };

  const handleRemovePartner = (id: string) => {
    if (partners.length <= 1) {
      alert('A empresa deve conter ao menos 1 sócio (SLU) ou mais sócios (LTDA).');
      return;
    }
    setPartners(partners.filter((p) => p.id !== id));
  };

  const handleUpdatePartner = (id: string, field: keyof ContractPartnerInput, value: any) => {
    setPartners(
      partners.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          if (field === 'quotasCount') {
            updated.quotasValue = Number(value) * valorNominalCota;
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Preencher com dados da empresa ativa
  const handlePullActiveCompanyData = () => {
    if (!currentCompany) return;
    setNomeEmpresarial(currentCompany.name || '');
    setNomeFantasia((currentCompany as any).nomeFantasia || '');
    setCnaeCodigo(currentCompany.cnae || '6201-5/00');
    setCidade(currentCompany.city || 'São Paulo');
    setUfEmpresa(currentCompany.uf || 'SP');
    
    if (currentCompany.partners && currentCompany.partners.length > 0) {
      setPartners(
        currentCompany.partners.map((p, idx) => ({
          id: `partner-${idx + 1}`,
          name: p.name || `Sócio ${idx + 1}`,
          nationality: 'brasileiro(a)',
          maritalStatus: 'solteiro(a)',
          propertyRegime: '',
          profession: 'Empresário(a)',
          rg: '12.345.678-9',
          rgIssuer: 'SSP/SP',
          cpf: p.cpf || '000.000.000-00',
          address: 'Logradouro da Empresa',
          number: '100',
          complement: '',
          neighborhood: 'Bairro',
          city: currentCompany.city || 'São Paulo',
          uf: currentCompany.uf || 'SP',
          cep: '01000-000',
          quotasCount: Math.round(((p.participationPercent || 100) / 100) * 10000),
          quotasValue: Math.round(((p.participationPercent || 100) / 100) * 10000),
          isAdministrator: p.isManager !== undefined ? p.isManager : idx === 0
        }))
      );
    }
  };

  // GERAÇÃO REATIVA E AUTOMÁTICA DO CONTRATO SOCIAL
  const generateContractText = useCallback(() => {
    const effectiveName = (nomeEmpresarial.trim() || 'EMPRESA EM CONSTITUIÇÃO LTDA').toUpperCase();
    const effectiveFantasia = nomeFantasia.trim();
    const effectiveCidade = cidade.trim() || 'São Paulo';
    const effectiveUf = ufEmpresa.trim() || 'SP';
    const effectiveLogradouro = logradouro.trim() || 'Avenida Paulista';
    const effectiveNumero = numero.trim() || '1000';
    const effectiveBairro = bairro.trim() || 'Centro';
    const effectiveCep = cep.trim() || '01000-000';
    const effectiveCnaeCode = cnaeCodigo.trim() || '6201-5/00';
    const effectiveCnaeDesc = cnaeDescricao.trim() || 'Serviços de Tecnologia e Consultoria Empresarial';

    // Se houver mais de 1 sócio e estiver selecionado SLU, tratar como LTDA no documento
    const isMultiPartnerSLU = naturezaJuridica === 'SLU' && partners.length > 1;
    const effectiveNatureza = isMultiPartnerSLU ? 'LTDA' : naturezaJuridica;

    let doc = '';

    // TÍTULO DO INSTRUMENTO
    if (contractMode === 'abertura') {
      if (effectiveNatureza === 'SLU') {
        doc += `CONTRATO SOCIAL DE CONSTITUIÇÃO DE SOCIEDADE LIMITADA UNIPESSUAL\n`;
        doc += `${effectiveName}\n\n`;
      } else {
        doc += `CONTRATO SOCIAL DE CONSTITUIÇÃO DE SOCIEDADE LIMITADA\n`;
        doc += `${effectiveName}\n\n`;
      }
    } else if (contractMode === 'alteracao') {
      doc += `1ª ALTERAÇÃO CONTRATUAL E CONSOLIDAÇÃO DO CONTRATO SOCIAL\n`;
      doc += `${effectiveName}\n\n`;
    } else {
      doc += `DISTRATO SOCIAL - INSTRUMENTO DE DISSOLUÇÃO E LIQUIDAÇÃO AMIGÁVEL\n`;
      doc += `${effectiveName}\n\n`;
    }

    // PREÂMBULO E QUALIFICAÇÃO DOS SÓCIOS
    doc += `PREÂMBULO - QUALIFICAÇÃO DAS PARTES:\n\n`;

    partners.forEach((p, index) => {
      const pName = (p.name || `Sócio ${index + 1}`).toUpperCase();
      const pNat = p.nationality || 'brasileiro(a)';
      const pMarital = p.maritalStatus || 'solteiro(a)';
      const pRegime = p.propertyRegime ? ` (regime de ${p.propertyRegime})` : '';
      const pProf = p.profession || 'Empresário(a)';
      const pRg = p.rg || '00.000.000-0';
      const pIssuer = p.rgIssuer || 'SSP/SP';
      const pCpf = p.cpf || '000.000.000-00';
      const pAddr = p.address || 'Logradouro do Sócio';
      const pNum = p.number || '100';
      const pComp = p.complement ? `, ${p.complement}` : '';
      const pBairro = p.neighborhood || 'Bairro';
      const pCep = p.cep || '01000-000';
      const pCity = p.city || effectiveCidade;
      const pUf = p.uf || effectiveUf;

      doc += `${index + 1}. ${pName}, ${pNat}, ${pMarital}${pRegime}, ${pProf}, portador(a) do RG nº ${pRg} ${pIssuer} e inscrito(a) no CPF/MF sob o nº ${pCpf}, residente e domiciliado(a) na ${pAddr}, nº ${pNum}${pComp}, Bairro ${pBairro}, CEP ${pCep}, na cidade de ${pCity}/${pUf};\n\n`;
    });

    if (contractMode === 'abertura') {
      doc += `Resolvem, por este instrumento particular de Contrato Social, sob as regras do Código Civil Brasileiro (Lei nº 10.406/2002), das Instruções Normativas do DREI (Diretoria do Registro Empresarial e Integração - IN nº 81/2020) e do Código de Procedimentos Contábeis (ITG 2000 R1 do CFC), constituir uma Sociedade Empresária Limitada, mediante as seguintes cláusulas:\n\n`;

      doc += `CLÁUSULA PRIMEIRA - DO NOME EMPRESARIAL E SEDE:\n`;
      doc += `A sociedade girará sob o nome empresarial ${effectiveName}${effectiveFantasia ? ` (Nome Fantasia: ${effectiveFantasia})` : ''}, e terá sua sede e foro na cidade de ${effectiveCidade}/${effectiveUf}, localizado na ${effectiveLogradouro}, nº ${effectiveNumero}${complemento ? `, ${complemento}` : ''}, Bairro ${effectiveBairro}, CEP ${effectiveCep}.\n\n`;

      doc += `CLÁUSULA SEGUNDA - DO OBJETO SOCIAL E ATIVIDADES (CNAE):\n`;
      doc += `A sociedade terá por objeto social a exploração das seguintes atividades econômicas:\n`;
      doc += `- CNAE Principal ${effectiveCnaeCode}: ${effectiveCnaeDesc}.\n\n`;

      doc += `CLÁUSULA TERCEIRA - DO CAPITAL SOCIAL E DAS COTAS:\n`;
      const capSocialNum = Number(capitalSocial) || 10000;
      const totalQuotas = totalQuotasSum > 0 ? totalQuotasSum : 10000;
      doc += `O capital social é de R$ ${capSocialNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${capitalSocialWords(capSocialNum)}), dividido em ${totalQuotas.toLocaleString('pt-BR')} cotas no valor nominal de R$ ${(valorNominalCota || 1).toFixed(2)} cada uma, totalmente subscritas e integralizadas da seguinte forma: ${integralizacaoPrazo || 'à vista, em moeda corrente'}.\n\n`;

      doc += `QUADRO DE DISTRIBUIÇÃO DAS COTAS:\n`;
      partners.forEach((p, index) => {
        const pName = (p.name || `Sócio ${index + 1}`).toUpperCase();
        const pQuotas = Number(p.quotasCount) || 0;
        const pVal = Number(p.quotasValue) || (pQuotas * (valorNominalCota || 1));
        const percent = totalQuotas > 0 ? ((pQuotas / totalQuotas) * 100).toFixed(2) : '0';
        doc += `- Sócio: ${pName} -> ${pQuotas.toLocaleString('pt-BR')} cotas (R$ ${pVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) representando ${percent}% do capital social.\n`;
      });
      doc += `\n`;

      doc += `CLÁUSULA QUARTA - DA ADMINISTRAÇÃO E GESTÃO SOCIAL:\n`;
      const admins = partners.filter((p) => p.isAdministrator);
      if (admins.length > 0) {
        doc += `A administração da sociedade será exercida pelo(s) sócio(s) ${admins.map((a) => (a.name || 'Sócio').toUpperCase()).join(', ')}, ao(s) qual(ais) competirá o uso exclusivo da firma e a representação ativa e passiva, judicial e extrajudicial da sociedade, sendo-lhe(s) vedado o uso da denominação social em atividades estranhas ao interesse social, tais como avais, fianças e cauções de favor.\n\n`;
      } else {
        doc += `A administração da sociedade será exercida por todos os sócios em conjunto ou isoladamente.\n\n`;
      }

    } else if (contractMode === 'alteracao') {
      doc += `Únicos sócios componentes da sociedade empresária limitada ${effectiveName}, resolvem por este instrumento alterar o contrato social mediante as seguintes deliberações:\n\n`;

      doc += `ALTERAÇÕES CONTRATUAIS ESPECÍFICAS (CLÁUSULAS ALTERADAS):\n\n`;

      if (flagNomeEmpresarial) {
        doc += `CLÁUSULA DE ALTERAÇÃO DO NOME EMPRESARIAL:\n`;
        doc += `O Nome Empresarial da sociedade passa a ser ${effectiveName}.\n\n`;
      }

      if (flagEndereco) {
        doc += `CLÁUSULA DE ALTERAÇÃO DA SEDE SOCIAL:\n`;
        doc += `A sociedade altera o seu endereço comercial para ${effectiveLogradouro}, nº ${effectiveNumero}${complemento ? `, ${complemento}` : ''}, Bairro ${effectiveBairro}, CEP ${effectiveCep}, na cidade de ${effectiveCidade}/${effectiveUf}.\n\n`;
      }

      if (flagCnae) {
        doc += `CLÁUSULA DE ALTERAÇÃO DO OBJETO SOCIAL (CNAE):\n`;
        doc += `O objeto social é alterado para abranger as atividades do CNAE ${effectiveCnaeCode}: ${effectiveCnaeDesc}.\n\n`;
      }

      if (flagCapitalSocial || flagQuadroSocietario) {
        doc += `CLÁUSULA DE ALTERAÇÃO DO CAPITAL SOCIAL E QUADRO SOCIETÁRIO:\n`;
        doc += `O capital social é reestruturado para R$ ${capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, dividido em ${totalQuotasSum.toLocaleString('pt-BR')} cotas.\n\n`;
      }

      if (flagAdministracao) {
        doc += `CLÁUSULA DE ALTERAÇÃO DA ADMINISTRAÇÃO:\n`;
        const admins = partners.filter((p) => p.isAdministrator);
        doc += `A administração passa a ser exercida por ${admins.map((a) => (a.name || 'Sócio').toUpperCase()).join(', ')}.\n\n`;
      }

      if (includeConsolidationClause) {
        doc += `\n=========================================================\n`;
        doc += `CONSOLIDAÇÃO DO CONTRATO SOCIAL (CONFORME IN DREI 81/2020)\n`;
        doc += `=========================================================\n\n`;
        doc += `CLÁUSULA CONSOLIDADA 1 - NOME E SEDE: A sociedade gira sob a razão social ${effectiveName} com sede em ${effectiveCidade}/${effectiveUf}.\n`;
        doc += `CLÁUSULA CONSOLIDADA 2 - OBJETO SOCIAL: Atividades de ${effectiveCnaeDesc} (CNAE ${effectiveCnaeCode}).\n`;
        doc += `CLÁUSULA CONSOLIDADA 3 - CAPITAL SOCIAL: R$ ${capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} integralizado em moeda corrente nacional.\n`;
      }
    } else {
      // DISTRATO SOCIAL
      doc += `Decidem por mútuo acordo dissolver e extinguir a sociedade empresária ${effectiveName}, dando quitação plena das obrigações sociais nos termos dos Artigos 1.033 a 1.035 do Código Civil Brasileiro e LC 147/2014, nas seguintes condições:\n\n`;
      doc += `1. A sociedade encerra suas atividades a partir desta data, tendo procedido à liquidação de seu passivo e ativo.\n`;
      doc += `2. A guarda dos livros contábeis e documentos fiscais pelo prazo legal de 5 (cinco) anos fica sob responsabilidade do(a) sócio(a) ${(partners[0]?.name || 'Sócio Responsável').toUpperCase()}.\n\n`;
    }

    // CLÁUSULAS ADICIONAIS E OBRIGATÓRIAS (CODIGO CIVIL & DREI)
    doc += `\nCLÁUSULAS ADICIONAIS E DISPOSIÇÕES GERAIS JURÍDICAS:\n\n`;

    if (includeDeathClause) {
      doc += `CLÁUSULA OBRIGATÓRIA DE FALECIMENTO OU INTERDIÇÃO DE SÓCIO (ART. 1.028 E 1.031 DO CÓDIGO CIVIL):\n`;
      doc += `O falecimento, interdição ou falência de qualquer dos sócios não dissolverá a sociedade, que continuará com os sócios remanescentes. A apuração dos haveres do sócio falecido ou impedido será efetuada com base em Balanço de Determinação elaborado especialmente na data da ocorrência do evento, considerando o valor real do acervo patrimonial conforme o Código de Procedimentos Contábeis (ITG 2000 R1 do CFC). O pagamento dos haveres apurados aos herdeiros ou sucessores legais será realizado em 12 (doze) parcelas mensais, iguais e sucessivas, vencendo-se a primeira 90 (noventa) dias após a liquidação do balanço especial.\n\n`;
    }

    if (includeArbitrationClause) {
      doc += `CLÁUSULA DE ARBITRAGEM E MEDIAÇÃO (LEI Nº 9.307/1996):\n`;
      doc += `Quaisquer divergências ou litígios oriundos do presente contrato social ou dele decorrentes serão definitivamente resolvidos por arbitragem, perante a Câmara de Mediação e Arbitragem de ${effectiveCidade}/${effectiveUf}, de acordo com o seu regulamento interno.\n\n`;
    }

    if (includeNonCompeteClause) {
      doc += `CLÁUSULA DE NÃO CONCORRÊNCIA E CONFIDENCIALIDADE:\n`;
      doc += `Os sócios obrigam-se a não exercer, diretamente ou por interposta pessoa, atividades concorrentes com o objeto social da empresa durante a vigência da sociedade e pelo prazo de 2 (dois) anos após o seu desligamento do quadro social.\n\n`;
    }

    if (includeUnequalDistributionClause) {
      doc += `CLÁUSULA DE DISTRIBUIÇÃO DESPROPORCIONAL DE LUCROS (ART. 1.007 DO CÓDIGO CIVIL):\n`;
      doc += `É facultada a distribuição desproporcional de lucros entre os sócios, independentemente da proporção de suas cotas no capital social, desde que aprovada por unanimidade em reunião de sócios e fundamentada em laudo contábil de apuração do resultado do exercício.\n\n`;
    }

    if (includePreemptionClause) {
      doc += `CLÁUSULA DE DIREITO DE PREFERÊNCIA NA CESSÃO DE COTAS (ART. 1.057 DO CÓDIGO CIVIL):\n`;
      doc += `O sócio que pretender ceder suas cotas deverá notificar os demais sócios por escrito. Os sócios remanescentes terão direito de preferência na aquisição das cotas em igualdade de condições no prazo de 30 (trinta) dias.\n\n`;
    }

    if (customAdditionalClauseText.trim()) {
      doc += `CLÁUSULA ADICIONAL PERSONALIZADA:\n`;
      doc += `${customAdditionalClauseText.trim()}\n\n`;
    }

    doc += `CLÁUSULA DE FORO:\n`;
    doc += `Para dirimir quaisquer dúvidas oriundas deste contrato, as partes elegem o Foro da Comarca de ${effectiveCidade}/${effectiveUf}, com renúncia expressa a qualquer outro, por mais privilegiado que seja.\n\n`;

    // FECHAMENTO E ASSINATURAS
    doc += `${effectiveCidade}/${effectiveUf}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.\n\n\n`;

    doc += `ASSINATURAS DOS SÓCIOS (Assinatura Eletrônica via Gov.br ou e-CPF Digital):\n\n`;
    partners.forEach((p, idx) => {
      doc += `_____________________________________________________\n`;
      doc += `${(p.name || `Sócio ${idx + 1}`).toUpperCase()}\n`;
      doc += `CPF: ${p.cpf || '000.000.000-00'}\n\n`;
    });

    doc += `\nTESTEMUNHAS:\n\n`;
    doc += `1. ____________________________________    2. ____________________________________\n`;
    doc += `Nome:                                       Nome:\n`;
    doc += `CPF:                                        CPF:\n`;

    return doc;
  }, [
    contractMode,
    nomeEmpresarial,
    nomeFantasia,
    naturezaJuridica,
    logradouro,
    numero,
    complemento,
    bairro,
    cidade,
    ufEmpresa,
    cep,
    cnaeCodigo,
    cnaeDescricao,
    capitalSocial,
    valorNominalCota,
    integralizacaoPrazo,
    partners,
    totalQuotasSum,
    flagNomeEmpresarial,
    flagEndereco,
    flagCnae,
    flagCapitalSocial,
    flagQuadroSocietario,
    flagAdministracao,
    includeConsolidationClause,
    includeDeathClause,
    includeArbitrationClause,
    includeNonCompeteClause,
    includeUnequalDistributionClause,
    includePreemptionClause,
    customAdditionalClauseText
  ]);

  // Efeito reativo para manter a minuta do contrato SEMPRE atualizada e disponível no painel
  useEffect(() => {
    const text = generateContractText();
    setGeneratedContractText(text);
  }, [generateContractText]);

  const handleGenerateContractDocument = () => {
    const text = generateContractText();
    setGeneratedContractText(text);
    setShowClausesModal(false);
  };

  const handleCopyContractText = () => {
    if (!generatedContractText) return;
    navigator.clipboard.writeText(generatedContractText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const handleDownloadPDF = () => {
    if (!generatedContractText) return;
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      const title = nomeEmpresarial.trim() || 'Contrato_Social';
      const splitText = doc.splitTextToSize(generatedContractText, 180);
      
      let pageHeight = doc.internal.pageSize.height;
      let cursorY = 15;
      
      for (let i = 0; i < splitText.length; i++) {
        if (cursorY > pageHeight - 15) {
          doc.addPage();
          cursorY = 15;
        }
        doc.text(splitText[i], 15, cursorY);
        cursorY += 4.5;
      }
      
      doc.save(`Contrato_Social_${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF com jsPDF:', err);
      window.print();
    }
  };

  const handleDownloadTXT = () => {
    if (!generatedContractText) return;
    const element = document.createElement('a');
    const file = new Blob([generatedContractText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Contrato_Social_${(nomeEmpresarial.trim() || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePrintContract = () => {
    window.print();
  };

  const currentJuntaData = getJuntaComercialData(selectedUf);

  return (
    <div className="space-[#1E293B] space-y-6 pb-12">
      
      {/* CABEÇALHO DO MÓDULO SOCIETÁRIO */}
      <div className="bg-gradient-to-r from-cyan-950/90 via-[#0F172A] to-[#0F172A] border border-cyan-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-4">
            <BrandLogo variant="badge" module="societario" />
            <div>
              <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
                <Scale className="w-3.5 h-3.5" />
                Módulo Societário 360°
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                27 Juntas Comerciais & DREI IN 81/2020
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Inteligência Societária & Emissão de Contratos
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Passo a passo legal para abertura, alteração e encerramento de empresas nas 27 Juntas Comerciais do Brasil, com gerador automatizado de Contratos Sociais e Alterações Contratuais em estrita conformidade com o Código Civil e Código de Procedimentos Contábeis.
            </p>
          </div>
        </div>

          <button
            onClick={handlePullActiveCompanyData}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition cursor-pointer shrink-0 border border-cyan-400/40"
            title="Preencher gerador com dados da empresa ativa no cockpit"
          >
            <RefreshCw className="w-4 h-4 text-cyan-200 animate-spin-slow" />
            <span>Puxar Dados da Empresa Ativa</span>
          </button>
        </div>

        {/* NAVEGAÇÃO INTERNA DO MÓDULO SOCIETÁRIO */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubSection('gerador_contrato')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeSubSection === 'gerador_contrato'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>1. Gerador de Contrato Social & Alterações</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-extrabold ml-1 font-mono">Com Flegar</span>
          </button>

          <button
            onClick={() => setActiveSubSection('juntas_passo_a_passo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeSubSection === 'juntas_passo_a_passo'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
            }`}
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>2. Guia Passo a Passo das 27 Juntas Comerciais</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-extrabold ml-1 font-mono">Todas UFs</span>
          </button>

          <button
            onClick={() => setActiveSubSection('modelos_guia')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
              activeSubSection === 'modelos_guia'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>3. Guia Didático de Tipos de Empresas (SLU, LTDA, SA, MEI)</span>
          </button>
        </div>
      </div>

      {/* SEÇÃO 1: GERADOR DE CONTRATOS SOCIAIS E ALTERAÇÕES CONTRATUAIS */}
      {activeSubSection === 'gerador_contrato' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PAINEL DE FORMULÁRIO E DADOS (ESQUERDA) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* TIPO DE OPERAÇÃO SOCIETÁRIA */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Selecione o Tipo de Operação Societária:
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setContractMode('abertura')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                    contractMode === 'abertura'
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <span>Constituição (Abertura)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContractMode('alteracao')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                    contractMode === 'alteracao'
                      ? 'bg-amber-600/30 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <RefreshCw className="w-5 h-5 text-amber-400" />
                  <span>Alteração Contratual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContractMode('distrato')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-center flex flex-col items-center gap-1 cursor-pointer ${
                    contractMode === 'distrato'
                      ? 'bg-rose-600/30 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Trash2 className="w-5 h-5 text-rose-400" />
                  <span>Distrato (Encerramento)</span>
                </button>
              </div>

              {contractMode === 'alteracao' && (
                <div className="mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Atenção para Alteração Contratual:</strong> Marque a caixa de seleção (<CheckSquare className="w-3 h-3 inline text-amber-400" />) ao lado do campo que deseja alterar no Contrato Social. Apenas os campos marcados gerarão cláusulas de modificação.
                  </div>
                </div>
              )}
            </div>

            {/* DADOS DA EMPRESA */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Dados Principais da Empresa
              </h3>

              {/* NOME EMPRESARIAL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">NOME EMPRESARIAL (Razão Social):</label>
                  {contractMode === 'alteracao' && (
                    <label className="flex items-center gap-1 text-[11px] font-bold text-amber-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flagNomeEmpresarial}
                        onChange={(e) => setFlagNomeEmpresarial(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span>Flegar para Alterar</span>
                    </label>
                  )}
                </div>
                <input
                  type="text"
                  value={nomeEmpresarial}
                  onChange={(e) => setNomeEmpresarial(e.target.value)}
                  placeholder="Ex: VÉRTICE TECNOLOGIA E CONSULTORIA LTDA"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* NOME FANTASIA, TELEFONE E E-MAIL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">NOME FANTASIA:</label>
                    {contractMode === 'alteracao' && (
                      <input
                        type="checkbox"
                        checked={flagNomeFantasia}
                        onChange={(e) => setFlagNomeFantasia(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500"
                      />
                    )}
                  </div>
                  <input
                    type="text"
                    value={nomeFantasia}
                    onChange={(e) => setNomeFantasia(e.target.value)}
                    placeholder="Ex: Vértice Auditor Fiscal"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">TELEFONE:</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">E-MAIL:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* NATUREZA JURÍDICA E PORTE EMPRESARIAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">NATUREZA JURÍDICA:</label>
                  <select
                    value={naturezaJuridica}
                    onChange={(e) => setNaturezaJuridica(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="SLU">SLU - Sociedade Limitada Unipessoal (1 Sócio)</option>
                    <option value="LTDA">LTDA - Sociedade Limitada (Plural)</option>
                    <option value="EI">EI - Empresário Individual</option>
                    <option value="SA">S/A - Sociedade Anônima Fechada</option>
                    <option value="SOCIEDADE_SIMPLES">Sociedade Simples (Cartório RCPJ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">PORTE EMPRESARIAL (LC 123/2006):</label>
                  <select
                    value={porte}
                    onChange={(e) => setPorte(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ME">ME - Microempresa (Até R$ 360 mil/ano)</option>
                    <option value="EPP">EPP - Empresa de Pequeno Porte (Até R$ 4.8 milhões/ano)</option>
                    <option value="DEMAIS">DEMAIS - Normal (Acima de R$ 4.8 milhões/ano)</option>
                  </select>
                </div>
              </div>

              {/* ENDEREÇO DA EMPRESA */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">ENDEREÇO DA SEDE DA EMPRESA:</label>
                  {contractMode === 'alteracao' && (
                    <label className="flex items-center gap-1 text-[11px] font-bold text-amber-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flagEndereco}
                        onChange={(e) => setFlagEndereco(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500"
                      />
                      <span>Flegar para Alterar</span>
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      placeholder="Logradouro (Rua, Av.)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="Número"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <input
                      type="text"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Complemento (Sala/Apto)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Bairro"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Cidade"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={ufEmpresa}
                      onChange={(e) => setUfEmpresa(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-bold"
                    >
                      {Object.keys(JUNTAS_COMERCIAIS_DATABASE).map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CNAE (ATIVIDADE) E CAPITAL SOCIAL */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">CNAE (ATIVIDADE ECONÔMICA):</label>
                  {contractMode === 'alteracao' && (
                    <label className="flex items-center gap-1 text-[11px] font-bold text-amber-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flagCnae}
                        onChange={(e) => setFlagCnae(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500"
                      />
                      <span>Flegar para Alterar</span>
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <input
                      type="text"
                      value={cnaeCodigo}
                      onChange={(e) => setCnaeCodigo(e.target.value)}
                      placeholder="Código CNAE"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={cnaeDescricao}
                      onChange={(e) => setCnaeDescricao(e.target.value)}
                      placeholder="Descrição detalhada do objeto social"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300">CAPITAL SOCIAL (R$):</label>
                      {contractMode === 'alteracao' && (
                        <input
                          type="checkbox"
                          checked={flagCapitalSocial}
                          onChange={(e) => setFlagCapitalSocial(e.target.checked)}
                          className="rounded border-slate-700 text-amber-500"
                        />
                      )}
                    </div>
                    <input
                      type="number"
                      value={capitalSocial}
                      onChange={(e) => setCapitalSocial(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">VALOR NOMINAL DA COTA (R$):</label>
                    <input
                      type="number"
                      value={valorNominalCota}
                      onChange={(e) => setValorNominalCota(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">INTEGRALIZAÇÃO:</label>
                    <input
                      type="text"
                      value={integralizacaoPrazo}
                      onChange={(e) => setIntegralizacaoPrazo(e.target.value)}
                      placeholder="Ex: à vista, em moeda corrente"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QUADRO SOCIETÁRIO E DADOS PESSOAIS DOS SÓCIOS */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Sócios & Dados Pessoais ({partners.length})
                </h3>

                <div className="flex items-center gap-2">
                  {contractMode === 'alteracao' && (
                    <label className="flex items-center gap-1 text-[11px] font-bold text-amber-400 cursor-pointer mr-2">
                      <input
                        type="checkbox"
                        checked={flagQuadroSocietario}
                        onChange={(e) => setFlagQuadroSocietario(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500"
                      />
                      <span>Flegar para Alterar</span>
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={handleAddPartner}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Adicionar Sócio</span>
                  </button>
                </div>
              </div>

              {partners.map((partner, index) => (
                <div key={partner.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 relative">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Sócio #{index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={partner.isAdministrator}
                          onChange={(e) => handleUpdatePartner(partner.id, 'isAdministrator', e.target.checked)}
                          className="rounded border-slate-700 text-blue-500"
                        />
                        <span>Sócio Administrador</span>
                      </label>
                      {partners.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePartner(partner.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Remover sócio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold">NOME COMPLETO:</label>
                      <input
                        type="text"
                        value={partner.name}
                        onChange={(e) => handleUpdatePartner(partner.id, 'name', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold">CPF:</label>
                      <input
                        type="text"
                        value={partner.cpf}
                        onChange={(e) => handleUpdatePartner(partner.id, 'cpf', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold">RG:</label>
                      <input
                        type="text"
                        value={partner.rg}
                        onChange={(e) => handleUpdatePartner(partner.id, 'rg', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold">ÓRGÃO EMISSOR:</label>
                      <input
                        type="text"
                        value={partner.rgIssuer}
                        onChange={(e) => handleUpdatePartner(partner.id, 'rgIssuer', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold">ESTADO CIVIL:</label>
                      <input
                        type="text"
                        value={partner.maritalStatus}
                        onChange={(e) => handleUpdatePartner(partner.id, 'maritalStatus', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold">PROFISSÃO:</label>
                      <input
                        type="text"
                        value={partner.profession}
                        onChange={(e) => handleUpdatePartner(partner.id, 'profession', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold">NÚMERO DE COTAS:</label>
                      <input
                        type="number"
                        value={partner.quotasCount}
                        onChange={(e) => handleUpdatePartner(partner.id, 'quotasCount', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTÃO DISPARADOR DA PERGUNTA PRÉVIA E EMISSÃO DO CONTRATO */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg text-center space-y-3">
              <p className="text-xs text-slate-300">
                Antes de emitir o documento final, você poderá selecionar cláusulas societárias personalizadas (apuração de haveres por morte de sócio, não concorrência, arbitragem, etc.).
              </p>

              <button
                type="button"
                onClick={() => setShowClausesModal(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Avançar para Incluir Cláusulas e Gerar Contrato</span>
              </button>
            </div>
          </div>

          {/* VISUALIZAÇÃO DA FOLHA DO CONTRATO GERADO (DIREITA) */}
          <div className="lg:col-span-6">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Minuta Jurídica do Contrato
                  </span>
                </div>

                {generatedContractText && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopyContractText}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                      title="Copiar texto para área de transferência"
                    >
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>{copiedNotification ? 'Copiado!' : 'Copiar'}</span>
                    </button>

                    <button
                      onClick={handleDownloadPDF}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      title="Baixar Arquivo PDF em A4"
                    >
                      <Download className="w-3.5 h-3.5 text-red-400" />
                      <span>Baixar PDF</span>
                    </button>

                    <button
                      onClick={handleDownloadTXT}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      title="Baixar Texto Editável (.txt)"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Baixar .TXT</span>
                    </button>

                    <button
                      onClick={handlePrintContract}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                      title="Imprimir Documento"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                )}
              </div>

              {generatedContractText ? (
                <div className="mt-4 p-6 bg-slate-950 border border-slate-800 rounded-xl max-h-[700px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
                  {generatedContractText}
                </div>
              ) : (
                <div className="mt-4 p-12 text-center bg-slate-950/60 border border-dashed border-slate-800 rounded-xl space-y-3">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">Nenhum Contrato Gerado Ainda</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Preencha os dados da empresa e dos sócios no formulário à esquerda e clique no botão para incluir cláusulas e emitir o Contrato Social oficial.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL / QUESTIONÁRIO PRÉ-EMISSÃO DE CLÁUSULAS ADICIONAIS */}
      {showClausesModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Questionário de Cláusulas Especiais e Jurídicas
                </h3>
              </div>
              <button
                onClick={() => setShowClausesModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Selecione quais cláusulas adicionais de segurança jurídica e governança você deseja incluir no Contrato Social antes da emissão:
            </p>

            <div className="space-y-3">
              {/* Cláusula Obrigatoria Falecimento */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-800/60 flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={includeDeathClause}
                  disabled
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-300">
                      Cláusula Obrigatória de Falecimento / Interdição de Sócio
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Código Civil Art. 1.028
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Garante a continuidade da empresa pelos sócios remanescentes e estabelece a apuração de haveres por Balanço de Determinação e pagamento parcelado aos herdeiros.
                  </p>
                </div>
              </div>

              {/* Cláusula Arbitragem */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-arb"
                  checked={includeArbitrationClause}
                  onChange={(e) => setIncludeArbitrationClause(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="chk-arb" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      Cláusula de Arbitragem e Mediação
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                      Lei 9.307/96
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Submete divergências entre sócios à Câmara de Mediação e Arbitragem, evitando processos judiciais lentos.
                  </p>
                </label>
              </div>

              {/* Cláusula Não Concorrência */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-noncomp"
                  checked={includeNonCompeteClause}
                  onChange={(e) => setIncludeNonCompeteClause(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="chk-noncomp" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      Cláusula de Não Concorrência e Confidencialidade (NDA)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Proíbe que o sócio atue em negócios concorrentes durante a sociedade e por até 2 anos após o desligamento.
                  </p>
                </label>
              </div>

              {/* Distribuição Desproporcional de Lucros */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-desp"
                  checked={includeUnequalDistributionClause}
                  onChange={(e) => setIncludeUnequalDistributionClause(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="chk-desp" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      Cláusula de Distribuição Desproporcional de Lucros
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                      Art. 1.007 CC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permite distribuir lucros em proporção diversa das cotas do capital social.
                  </p>
                </label>
              </div>

              {/* Campo para Cláusula Texto Livre */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Outra Cláusula Adicional Personalizada (Texto Livre):
                </label>
                <textarea
                  value={customAdditionalClauseText}
                  onChange={(e) => setCustomAdditionalClauseText(e.target.value)}
                  placeholder="Escreva qualquer outra instrução ou norma societária particular..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowClausesModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleGenerateContractDocument}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Gerar Contrato Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO 2: GUIA PASSO A PASSO DAS 27 JUNTAS COMERCIAIS */}
      {activeSubSection === 'juntas_passo_a_passo' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            
            {/* SELEÇÃO DA UF / ESTADO */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Selecione a Unidade da Federação (UF):
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consulte os links oficiais do integrador e o fluxo do processo em cada Junta Comercial do Brasil.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-400">UF:</span>
                <select
                  value={selectedUf}
                  onChange={(e) => setSelectedUf(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm font-black text-emerald-400 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {Object.keys(JUNTAS_COMERCIAIS_DATABASE).map((uf) => (
                    <option key={uf} value={uf}>
                      {uf} - {JUNTAS_COMERCIAIS_DATABASE[uf].stateName}
                    </option>
                  ))}
                  <option value="AM">AM - Amazonas</option>
                  <option value="PA">PA - Pará</option>
                  <option value="ES">ES - Espírito Santo</option>
                  <option value="MT">MT - Mato Grosso</option>
                  <option value="MS">MS - Mato Grosso do Sul</option>
                  <option value="AL">AL - Alagoas</option>
                  <option value="AP">AP - Amapá</option>
                  <option value="MA">MA - Maranhão</option>
                  <option value="PB">PB - Paraíba</option>
                  <option value="PI">PI - Piauí</option>
                  <option value="RN">RN - Rio Grande do Norte</option>
                  <option value="RO">RO - Rondônia</option>
                  <option value="RR">RR - Roraima</option>
                  <option value="SE">SE - Sergipe</option>
                  <option value="TO">TO - Tocantins</option>
                  <option value="AC">AC - Acre</option>
                </select>
              </div>
            </div>

            {/* PAINEL INFORMATIVO DA JUNTA SELECIONADA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Junta Comercial:</span>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  {currentJuntaData.juntaFullName} ({currentJuntaData.juntaName})
                </h4>
                <p className="text-xs text-slate-400 mt-1">Sistema: {currentJuntaData.systemName}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Métricas da UF:</span>
                <div className="text-xs text-slate-300 space-y-1 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tempo Médio: <strong>{currentJuntaData.avgTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Taxa Estimada: <strong>{currentJuntaData.estimatedFee}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-2">
                <a
                  href={currentJuntaData.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Acessar Portal da {currentJuntaData.juntaName}</span>
                </a>

                <a
                  href={currentJuntaData.redesimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                >
                  <ExternalLink className="w-3 h-3 text-emerald-400" />
                  <span>Portal Redesim Nacional</span>
                </a>
              </div>
            </div>

            {/* ABAS DE FLUXO (ABERTURA / ALTERAÇÃO / ENCERRAMENTO) */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 pt-2">
              <button
                onClick={() => setJuntaTab('abertura')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  juntaTab === 'abertura'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Passo a Passo de Abertura</span>
              </button>

              <button
                onClick={() => setJuntaTab('alteracao')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  juntaTab === 'alteracao'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Passo a Passo de Alteração</span>
              </button>

              <button
                onClick={() => setJuntaTab('encerramento')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  juntaTab === 'encerramento'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Passo a Passo de Encerramento (Distrato)</span>
              </button>
            </div>

            {/* CARDS COM OS PASSO A PASSO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {currentJuntaData.stepByStep[juntaTab].map((step) => (
                <div key={step.step} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs flex items-center justify-center border border-emerald-500/30">
                      {step.step}
                    </span>
                    {step.url && step.url !== '#' && (
                      <a
                        href={step.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                      >
                        <span>Acessar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <h4 className="text-xs font-extrabold text-white leading-snug">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* SEÇÃO 3: GUIA DIDÁTICO DE TIPOS DE EMPRESA (SLU, LTDA, EI, MEI, SA) */}
      {activeSubSection === 'modelos_guia' && (
        <div className="space-y-6">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Guia Explicativo Completo das Naturezas Jurídicas & Portes
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Conheça as particularidades, impedimentos legais (Art. 1.011 do Código Civil), regras de responsabilidade e obrigações contábeis de cada modelo societário no Brasil.
              </p>
            </div>

            {/* GRID DOS TIPOS DE EMPRESA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {COMPANY_TYPES_DATABASE.map((type) => (
                <div key={type.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-slate-700 transition">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {type.badge}
                      </span>
                      <h4 className="text-sm font-black text-white mt-1">
                        {type.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    {type.subtitle}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Fundamento Legal:</span>
                      <span className="text-slate-200 font-mono text-[11px]">{type.legalBasis}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Responsabilidade:</span>
                      <span className="text-emerald-400 font-bold">{type.liability}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Particularidades e Vantagens:
                    </h5>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                      {type.particularities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      Impedimentos e Cuidados Fiscais:
                    </h5>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                      {type.impediments.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                </div>
              ))}
            </div>

            {/* EXPANDER DOS PORTES EMPRESARIAIS (LC 123/2006) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Portes Empresariais (Lei Complementar 123/2006)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(PORTE_EMPRESARIAL_DATABASE).map(([key, item]) => (
                  <div key={key} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                    <span className="font-extrabold text-blue-300 uppercase block">{item.name}</span>
                    <span className="text-amber-400 font-bold font-mono block">{item.limit}</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed mt-1">{item.benefits}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

// HELPER PARA ESCREVER VALORES EM EXTENSO SIMPLES
function capitalSocialWords(val: number): string {
  if (val === 10000) return 'dez mil reais';
  if (val === 1000) return 'um mil reais';
  if (val === 50000) return 'cinquenta mil reais';
  if (val === 100000) return 'cem mil reais';
  return `${val.toLocaleString('pt-BR')} reais`;
}
