import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Award,
  FileCode,
  FileSearch,
  Check,
  Library,
  Lock,
  Percent,
  Plus,
  Zap,
  ShieldAlert,
  FileCheck2,
  FileCheck,
  Users,
  AlertCircle,
  Wand2
} from 'lucide-react';
import { CompanyData } from '../types';
import { BrandLogo } from './BrandLogo';
import { ExecutiveDocumentViewer } from './ExecutiveDocumentViewer';
import { 
  JUNTAS_COMERCIAIS_DATABASE, 
  COMPANY_TYPES_DATABASE, 
  PORTE_EMPRESARIAL_DATABASE, 
  getJuntaComercialData,
  JuntaComercialData
} from '../data/societarioData';
import { CONTRACT_MATRIX_DATA, CONTRACT_VERTICALS, ContractModelItem } from '../data/contractMatrixData';
import { 
  STRUCTURING_MODELS_DATA, 
  STRUCTURING_CATEGORIES, 
  StructuringModelItem 
} from '../data/structuringModelsData';
import { 
  runForensicAuditEngine, 
  ELITE_AUDIT_CLAUSES, 
  AuditResultData, 
  AuditIssue, 
  AuditPillar, 
  CourtBenchmark 
} from '../utils/juridicoAuditorEngine';
import { 
  REDESIM_EVENTS_CATALOG, 
  RedesimEventDefinition, 
  generateComprehensiveCorporateContract, 
  GenerateContractParams 
} from '../utils/redesimContractEngine';
import { ComplianceRadarPanel } from './societario/ComplianceRadarPanel';
import { PrecedentesClausulasLibrary } from './societario/PrecedentesClausulasLibrary';
import { MiniVadeMecumContextual } from './societario/MiniVadeMecumContextual';
import { FormalLegalOpinionReport } from './societario/FormalLegalOpinionReport';
import { SmartRedesimPresets } from './societario/SmartRedesimPresets';
import { DynamicActivityCnaeSelector, SecondaryCnaeItem } from './societario/DynamicActivityCnaeSelector';
import { CnaeRecord, CNAE_DATABASE, analyzeCnaeSimplesEligibility } from '../data/cnaeDatabase';
import { 
  ShieldedClauseItem, 
  ContractPrecedentModel, 
  RedesimPreset 
} from '../data/precedentesClausulasData';

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
  spouseName?: string;
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
  isAdmitted?: boolean;
  isRetiring?: boolean;
}

export const SocietarioView: React.FC<SocietarioViewProps> = ({ currentCompany }) => {
  // Estado das Abas Principais do Módulo Societário (Blindagem Societária como 3º Módulo Principal)
  const [activeSubSection, setActiveSubSection] = useState<'gerador_contrato' | 'juntas_passo_a_passo' | 'modelos_guia' | 'blindagem_societaria'>('blindagem_societaria');

  // --- ESTADOS DO MÓDULO DE BLINDAGEM SOCIETÁRIA ---
  const [shieldingType, setShieldingType] = useState<string>('holding_familiar');
  const [structuringSearch, setStructuringSearch] = useState<string>('');
  const [structuringCategoryFilter, setStructuringCategoryFilter] = useState<string>('all');
  const [shieldInalienabilidade, setShieldInalienabilidade] = useState<boolean>(true);
  const [shieldImpenhorabilidade, setShieldImpenhorabilidade] = useState<boolean>(true);
  const [shieldIncomunicabilidade, setShieldIncomunicabilidade] = useState<boolean>(true);
  const [shieldUsufruto, setShieldUsufruto] = useState<boolean>(true);
  const [shieldReversao, setShieldReversao] = useState<boolean>(true);
  const [shieldTagAlong, setShieldTagAlong] = useState<boolean>(true);
  const [shieldDragAlong, setShieldDragAlong] = useState<boolean>(true);
  const [shieldDeadlock, setShieldDeadlock] = useState<boolean>(true);
  const [shieldCallOption, setShieldCallOption] = useState<boolean>(false);
  const [shieldPrefRoute, setShieldPrefRoute] = useState<boolean>(true);
  const [shieldImunidadeITBI, setShieldImunidadeITBI] = useState<boolean>(true);
  const [shieldAutonomiaPatrimonial, setShieldAutonomiaPatrimonial] = useState<boolean>(true);
  const [shieldEficaciaRegistral, setShieldEficaciaRegistral] = useState<boolean>(true);
  const [shieldNonCompete, setShieldNonCompete] = useState<boolean>(true);
  const [shieldVesting, setShieldVesting] = useState<boolean>(false);
  const [shieldConselhoConsultivo, setShieldConselhoConsultivo] = useState<boolean>(false);
  const [shieldEscrowEarnout, setShieldEscrowEarnout] = useState<boolean>(false);
  const [shieldValuationMethod, setShieldValuationMethod] = useState<'balanco_determinacao' | 'fluxo_caixa_descontado' | 'valor_patrimonial_contabil'>('balanco_determinacao');
  const [holdingSocioPF, setHoldingSocioPF] = useState<string>('CARLOS MIGUEL VIEIRA');
  const [holdingHeireiros, setHoldingHeireiros] = useState<string>('ANA CLARA VIEIRA, THIAGO VIEIRA');
  const [holdingAssets, setHoldingAssets] = useState<string>('IMÓVEL COMERCIAL MATRÍCULA 45.122 SP, PARTICIPAÇÃO OPERACIONAL VÉRTICE LTDA');
  const [copiedShieldDoc, setCopiedShieldDoc] = useState<boolean>(false);

  const selectedStructuringModel = useMemo(() => {
    return STRUCTURING_MODELS_DATA.find(m => m.id === shieldingType) || STRUCTURING_MODELS_DATA[0];
  }, [shieldingType]);

  const filteredStructuringModels = useMemo(() => {
    return STRUCTURING_MODELS_DATA.filter((model) => {
      const matchCategory = structuringCategoryFilter === 'all' || model.category === structuringCategoryFilter;
      const q = structuringSearch.toLowerCase().trim();
      const matchQuery = !q || 
        model.title.toLowerCase().includes(q) ||
        model.description.toLowerCase().includes(q) ||
        model.legalFramework.toLowerCase().includes(q) ||
        model.targetProfile.toLowerCase().includes(q) ||
        model.keyFeatures.some(f => f.toLowerCase().includes(q));
      return matchCategory && matchQuery;
    });
  }, [structuringCategoryFilter, structuringSearch]);

  const handleSelectStructuringModel = (model: StructuringModelItem) => {
    setShieldingType(model.id);
    if (model.defaultClauses) {
      if (model.defaultClauses.inalienabilidade !== undefined) setShieldInalienabilidade(model.defaultClauses.inalienabilidade);
      if (model.defaultClauses.impenhorabilidade !== undefined) setShieldImpenhorabilidade(model.defaultClauses.impenhorabilidade);
      if (model.defaultClauses.incomunicabilidade !== undefined) setShieldIncomunicabilidade(model.defaultClauses.incomunicabilidade);
      if (model.defaultClauses.usufruto !== undefined) setShieldUsufruto(model.defaultClauses.usufruto);
      if (model.defaultClauses.reversao !== undefined) setShieldReversao(model.defaultClauses.reversao);
      if (model.defaultClauses.prefRoute !== undefined) setShieldPrefRoute(model.defaultClauses.prefRoute);
      if (model.defaultClauses.tagAlong !== undefined) setShieldTagAlong(model.defaultClauses.tagAlong);
      if (model.defaultClauses.dragAlong !== undefined) setShieldDragAlong(model.defaultClauses.dragAlong);
      if (model.defaultClauses.deadlock !== undefined) setShieldDeadlock(model.defaultClauses.deadlock);
      if (model.defaultClauses.callOption !== undefined) setShieldCallOption(model.defaultClauses.callOption);
      if (model.defaultClauses.imunidadeITBI !== undefined) setShieldImunidadeITBI(model.defaultClauses.imunidadeITBI);
      if (model.defaultClauses.autonomiaPatrimonial !== undefined) setShieldAutonomiaPatrimonial(model.defaultClauses.autonomiaPatrimonial);
      if (model.defaultClauses.nonCompete !== undefined) setShieldNonCompete(model.defaultClauses.nonCompete);
      if (model.defaultClauses.vesting !== undefined) setShieldVesting(model.defaultClauses.vesting);
      if (model.defaultClauses.conselhoConsultivo !== undefined) setShieldConselhoConsultivo(model.defaultClauses.conselhoConsultivo);
      if (model.defaultClauses.escrowEarnout !== undefined) setShieldEscrowEarnout(model.defaultClauses.escrowEarnout);
      if (model.defaultClauses.valuationMethod !== undefined) setShieldValuationMethod(model.defaultClauses.valuationMethod);
    }
  };

  // Sub-abas dentro do Módulo de Blindagem Societária
  const [blindagemSubTab, setBlindagemSubTab] = useState<'estruturador' | 'radar_compliance' | 'biblioteca_avancada' | 'vade_mecum_inteligente' | 'biblioteca_minutas' | 'auditor_ia'>('estruturador');
  const [selectedRedesimPresetId, setSelectedRedesimPresetId] = useState<string>('preset_constituicao_blindada');
  const [matrixSearch, setMatrixSearch] = useState<string>('');
  const [selectedMatrixVertical, setSelectedMatrixVertical] = useState<string>('all');
  const [expandedMatrixId, setExpandedMatrixId] = useState<string | null>(null);
  const [copiedMatrixId, setCopiedMatrixId] = useState<string | null>(null);

  // Estados para Auditor IA de Minutas Societárias & Blindagem
  const [auditorDraftText, setAuditorDraftText] = useState<string>('');
  const [auditorSelectedType, setAuditorSelectedType] = useState<string>('CON-070');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<AuditResultData | null>(null);
  const [auditorViewMode, setAuditorViewMode] = useState<'diagnostico' | 'tribunais' | 'vulnerabilidades' | 'biblioteca' | 'parecer_oficial'>('diagnostico');
  const [issueSeverityFilter, setIssueSeverityFilter] = useState<'all' | 'Crítico' | 'Alto' | 'Moderado' | 'Preventivo'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // --- ESTADOS DO PASSO A PASSO DAS JUNTAS COMERCIAIS ---
  const [selectedUf, setSelectedUf] = useState<string>(currentCompany?.uf || 'SP');
  const [juntaTab, setJuntaTab] = useState<'abertura' | 'alteracao' | 'encerramento'>('abertura');

  // --- ESTADOS DO GERADOR DE CONTRATO DINÂMICO & REDESIM ---
  const [contractMode, setContractMode] = useState<'abertura' | 'alteracao' | 'transformacao' | 'acordo_socios' | 'mutuo_conversivel' | 'distrato'>('abertura');
  const [selectedRedesimEvents, setSelectedRedesimEvents] = useState<string[]>(['210', '211', '244', '247', '248', '249']);
  const [redesimSearchQuery, setRedesimSearchQuery] = useState<string>('');
  const [redesimCategoryFilter, setRedesimCategoryFilter] = useState<string>('all');
  
  // Campos de Identificação da Empresa
  const [nomeEmpresarial, setNomeEmpresarial] = useState<string>(currentCompany?.name || '');
  const [nomeFantasia, setNomeFantasia] = useState<string>((currentCompany as any)?.nomeFantasia || '');
  const [telefone, setTelefone] = useState<string>((currentCompany as any)?.telefone || '(11) 99999-9999');
  const [email, setEmail] = useState<string>((currentCompany as any)?.email || 'contato@empresa.com.br');
  const [porte, setPorte] = useState<'ME' | 'EPP' | 'DEMAIS'>('ME');
  const [naturezaJuridica, setNaturezaJuridica] = useState<'SLU' | 'LTDA' | 'EI' | 'SA' | 'SOCIEDADE_SIMPLES' | 'SCP'>('SLU');
  
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
  const [secondaryCnaes, setSecondaryCnaes] = useState<SecondaryCnaeItem[]>([
    {
      code: '6202-3/00',
      description: 'Desenvolvimento e licenciamento de programas de computador customizáveis'
    },
    {
      code: '6209-1/00',
      description: 'Suporte técnico, manutenção e outros serviços em tecnologia da informação'
    },
    {
      code: '8599-6/04',
      description: 'Treinamento em desenvolvimento profissional e gerencial (Cursos Livres)'
    }
  ]);
  const [capitalSocial, setCapitalSocial] = useState<number>(10000);
  const [capitalSocialAnterior, setCapitalSocialAnterior] = useState<number>(10000);
  const [valorNominalCota, setValorNominalCota] = useState<number>(1);
  const [integralizacaoPrazo, setIntegralizacaoPrazo] = useState<string>('à vista, em moeda corrente nacional');

  // Sócios da Sociedade
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
        isAdministrator: p.isManager !== undefined ? p.isManager : idx === 0,
        isAdmitted: false,
        isRetiring: false
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
        isAdministrator: true,
        isAdmitted: false,
        isRetiring: false
      }
    ];
  });

  // Parâmetros Específicos de Eventos REDESIM & Transformações
  const [numeroAlteracao, setNumeroAlteracao] = useState<number>(1);
  const [novoNomeEmpresarial, setNovoNomeEmpresarial] = useState<string>('');
  const [formaAumentoCapital, setFormaAumentoCapital] = useState<'moeda' | 'lucros' | 'imoveis' | 'credito'>('moeda');
  const [detalhesImoveisIntegralizacao, setDetalhesImoveisIntegralizacao] = useState<string>('Imóvel matrícula nº 123.456 do 1º Oficial de Registro de Imóveis, avaliado pelo valor venal de R$ 500.000,00, conferido com base no Tema 796 STF.');
  const [tipoOrigemTransformacao, setTipoOrigemTransformacao] = useState<string>('Empresário Individual (EI)');
  const [tipoDestinoTransformacao, setTipoDestinoTransformacao] = useState<string>('Sociedade Limitada (LTDA)');
  const [socioLiquidante, setSocioLiquidante] = useState<string>('');
  const [guardaLivrosSocio, setGuardaLivrosSocio] = useState<string>('');

  // Flags Legadas para retrocompatibilidade
  const [flagNomeEmpresarial, setFlagNomeEmpresarial] = useState<boolean>(false);
  const [flagNomeFantasia, setFlagNomeFantasia] = useState<boolean>(false);
  const [flagEndereco, setFlagEndereco] = useState<boolean>(false);
  const [flagCnae, setFlagCnae] = useState<boolean>(false);
  const [flagCapitalSocial, setFlagCapitalSocial] = useState<boolean>(false);
  const [flagQuadroSocietario, setFlagQuadroSocietario] = useState<boolean>(false);
  const [flagAdministracao, setFlagAdministracao] = useState<boolean>(false);

  // Cláusulas Forenses e de Governança
  const [showClausesModal, setShowClausesModal] = useState<boolean>(false);
  const [includeConsolidacaoDrei, setIncludeConsolidacaoDrei] = useState<boolean>(true);
  const [includeApuracaoHaveresSTJ, setIncludeApuracaoHaveresSTJ] = useState<boolean>(true);
  const [includeAutonomiaPatrimonialArt50, setIncludeAutonomiaPatrimonialArt50] = useState<boolean>(true);
  const [includeDireitoPreferenciaTagAlong, setIncludeDireitoPreferenciaTagAlong] = useState<boolean>(true);
  const [includeDeadlockShotgun, setIncludeDeadlockShotgun] = useState<boolean>(false);
  const [includeDistribuicaoDesproporcional, setIncludeDistribuicaoDesproporcional] = useState<boolean>(true);
  const [includeArbitragemCamara, setIncludeArbitragemCamara] = useState<boolean>(false);
  const [includeNaoConcorrencia, setIncludeNaoConcorrencia] = useState<boolean>(true);
  const [includeImunidadeITBIImoveis, setIncludeImunidadeITBIImoveis] = useState<boolean>(false);
  const [includeAssinaturaDigitalICP, setIncludeAssinaturaDigitalICP] = useState<boolean>(true);
  const [includeGravamesSucessivos, setIncludeGravamesSucessivos] = useState<boolean>(false);
  const [includeConselhoConsultivo, setIncludeConselhoConsultivo] = useState<boolean>(false);
  const [customAdditionalClauseText, setCustomAdditionalClauseText] = useState<string>('');

  const filteredRedesimEvents = useMemo(() => {
    return REDESIM_EVENTS_CATALOG.filter(evt => {
      const matchesCategory = redesimCategoryFilter === 'all' || evt.category === redesimCategoryFilter;
      const q = redesimSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        evt.code.toLowerCase().includes(q) || 
        evt.name.toLowerCase().includes(q) || 
        evt.description.toLowerCase().includes(q) ||
        evt.dreiArticle.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [redesimCategoryFilter, redesimSearchQuery]);

  // Estado do Contrato Gerado Final
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

  // Handlers para Gerenciamento de Atividades e CNAEs
  const handleAddSecondaryCnae = (cnae: CnaeRecord) => {
    const clean = cnae.code.trim().replace(/[.\-/]/g, '');
    const cleanPrimary = cnaeCodigo.trim().replace(/[.\-/]/g, '');
    if (clean === cleanPrimary) {
      alert('Esta atividade já está definida como a Atividade Principal.');
      return;
    }
    if (secondaryCnaes.some(s => s.code.trim().replace(/[.\-/]/g, '') === clean)) {
      alert('Esta atividade secundária já foi adicionada.');
      return;
    }
    setSecondaryCnaes([...secondaryCnaes, { code: cnae.code, description: cnae.description, record: cnae }]);
  };

  const handleRemoveSecondaryCnae = (code: string) => {
    const clean = code.trim().replace(/[.\-/]/g, '');
    setSecondaryCnaes(secondaryCnaes.filter(s => s.code.trim().replace(/[.\-/]/g, '') !== clean));
  };

  const handleSetAsPrimary = (item: SecondaryCnaeItem) => {
    const oldPrimary: SecondaryCnaeItem = { code: cnaeCodigo, description: cnaeDescricao };
    setCnaeCodigo(item.code);
    setCnaeDescricao(item.description);
    setSecondaryCnaes(secondaryCnaes.filter(s => s.code !== item.code).concat([oldPrimary]));
  };

  const handleGenerateObjetoSocialClause = (clauseText: string) => {
    setCustomAdditionalClauseText(clauseText);
    setToastMessage('Cláusula de Objeto Social gerada e anexada ao contrato com sucesso!');
    setTimeout(() => setToastMessage(null), 4000);
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

  // GERAÇÃO REATIVA E AUTOMÁTICA DO CONTRATO SOCIAL ATRAVÉS DO MOTOR ESPECIALISTA REDESIM/DREI
  const generateContractText = useCallback(() => {
    return generateComprehensiveCorporateContract({
      mode: contractMode,
      naturezaJuridica,
      nomeEmpresarial: nomeEmpresarial || 'EMPRESA EM CONSTITUIÇÃO LTDA',
      nomeFantasia,
      cnpj: (currentCompany as any)?.cnpj || '00.000.000/0001-00',
      nire: (currentCompany as any)?.nire || '35.200.000.000',
      cidade: cidade || 'São Paulo',
      uf: ufEmpresa || 'SP',
      logradouro: logradouro || 'Avenida Paulista',
      numero: numero || '1000',
      complemento,
      bairro: bairro || 'Bela Vista',
      cep: cep || '01310-100',
      telefone,
      email,
      cnaePrincipal: cnaeCodigo || '6201-5/00',
      cnaePrincipalDesc: cnaeDescricao || 'Desenvolvimento de programas de computador sob encomenda',
      cnaesSecundarios: secondaryCnaes.map(s => ({ code: s.code, desc: s.description })),
      capitalSocial: Number(capitalSocial) || 10000,
      capitalSocialAnterior: Number(capitalSocialAnterior) || Number(capitalSocial) || 10000,
      valorNominalCota: Number(valorNominalCota) || 1,
      formaIntegralizacao: integralizacaoPrazo || 'à vista, em moeda corrente nacional',
      partners,
      selectedRedesimEvents,
      alteracaoDetails: {
        numeroAlteracao,
        novoNomeEmpresarial: novoNomeEmpresarial || nomeEmpresarial,
        formaAumentoCapital,
        detalhesImoveisIntegralizacao,
        tipoOrigemTransformacao,
        tipoDestinoTransformacao,
        socioLiquidante: socioLiquidante || partners[0]?.name || 'Sócio Liquidante',
        guardaLivrosSocio: guardaLivrosSocio || partners[0]?.name || 'Sócio Responsável',
      },
      clauses: {
        consolidacaoDrei: includeConsolidacaoDrei,
        apuracaoHaveresSTJ: includeApuracaoHaveresSTJ,
        autonomiaPatrimonialArt50: includeAutonomiaPatrimonialArt50,
        direitoPreferenciaTagAlong: includeDireitoPreferenciaTagAlong,
        deadlockShotgun: includeDeadlockShotgun,
        distribuicaoDesproporcional: includeDistribuicaoDesproporcional,
        arbitragemCamara: includeArbitragemCamara,
        naoConcorrencia: includeNaoConcorrencia,
        imunidadeITBIImoveis: includeImunidadeITBIImoveis,
        assinaturaDigitalICP: includeAssinaturaDigitalICP,
        gravamesSucessivos: includeGravamesSucessivos,
        conselhoConsultivo: includeConselhoConsultivo,
      },
      customClauses: customAdditionalClauseText
    });
  }, [
    contractMode,
    naturezaJuridica,
    nomeEmpresarial,
    nomeFantasia,
    currentCompany,
    cidade,
    ufEmpresa,
    logradouro,
    numero,
    complemento,
    bairro,
    cep,
    telefone,
    email,
    cnaeCodigo,
    cnaeDescricao,
    secondaryCnaes,
    capitalSocial,
    capitalSocialAnterior,
    valorNominalCota,
    integralizacaoPrazo,
    partners,
    selectedRedesimEvents,
    numeroAlteracao,
    novoNomeEmpresarial,
    formaAumentoCapital,
    detalhesImoveisIntegralizacao,
    tipoOrigemTransformacao,
    tipoDestinoTransformacao,
    socioLiquidante,
    guardaLivrosSocio,
    includeConsolidacaoDrei,
    includeApuracaoHaveresSTJ,
    includeAutonomiaPatrimonialArt50,
    includeDireitoPreferenciaTagAlong,
    includeDeadlockShotgun,
    includeDistribuicaoDesproporcional,
    includeArbitragemCamara,
    includeNaoConcorrencia,
    includeImunidadeITBIImoveis,
    includeAssinaturaDigitalICP,
    includeGravamesSucessivos,
    includeConselhoConsultivo,
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

  const handleToggleRedesimEvent = (eventCode: string) => {
    setSelectedRedesimEvents(prev => 
      prev.includes(eventCode)
        ? prev.filter(c => c !== eventCode)
        : [...prev, eventCode]
    );
  };

  const handleAuditCurrentContract = () => {
    if (!generatedContractText) return;
    setAuditorDraftText(generatedContractText);
    setActiveSubSection('blindagem_societaria');
    setBlindagemSubTab('auditor_ia');
    setIsAuditing(true);
    setTimeout(() => {
      const result = runForensicAuditEngine(generatedContractText, {
        id: 'CONTRATO-GERADO-REDESIM',
        title: `Contrato Social / ${contractMode.toUpperCase()} - ${nomeEmpresarial || 'Sociedade'}`,
        vertical: 'Auditoria Societária e Registro Mercantil'
      });
      setAuditResult(result);
      setIsAuditing(false);
      setToastMessage('Minuta enviada para o Auditor Jurídico Forense 360° com sucesso!');
      setTimeout(() => setToastMessage(null), 4000);
    }, 400);
  };

  // Cálculo Dinâmico dos Indicadores de Conformidade & Radar Jurídico Forense
  const complianceRadarMetrics = useMemo(() => {
    // 1. DREI & Instruções Normativas (IN 81/2020)
    let dreiScore = 70;
    if (includeConsolidacaoDrei) dreiScore += 15;
    if (nomeEmpresarial.trim().length > 3) dreiScore += 10;
    if (selectedRedesimEvents.length > 0) dreiScore += 5;
    dreiScore = Math.min(100, Math.max(0, dreiScore));

    // 2. Segurança Societária e Quóruns (Lei 14.451/22)
    let societarySecurity = 60;
    if (includeDireitoPreferenciaTagAlong) societarySecurity += 14;
    if (includeDistribuicaoDesproporcional) societarySecurity += 12;
    if (includeConselhoConsultivo) societarySecurity += 8;
    if (partners.length >= 2) societarySecurity += 6;
    societarySecurity = Math.min(100, Math.max(0, societarySecurity));

    // 3. Blindagem Patrimonial e Art. 50 CC (Lei 13.874/19)
    let art50Score = 50;
    if (includeAutonomiaPatrimonialArt50) art50Score += 25;
    if (includeGravamesSucessivos) art50Score += 20;
    if (capitalSocial > 0) art50Score += 5;
    art50Score = Math.min(100, Math.max(0, art50Score));

    // 4. Mitigação de Risco Tributário (ITBI / Tema 796 STF)
    let taxRiskScore = 60;
    if (includeImunidadeITBIImoveis) taxRiskScore += 25;
    if (includeDistribuicaoDesproporcional) taxRiskScore += 15;
    taxRiskScore = Math.min(100, Math.max(0, taxRiskScore));

    // 5. Prevenção de Litígios e Apuração de Haveres (Tema 1056 STJ)
    let disputeScore = 55;
    if (includeApuracaoHaveresSTJ) disputeScore += 25;
    if (includeDeadlockShotgun) disputeScore += 10;
    if (includeArbitragemCamara) disputeScore += 10;
    disputeScore = Math.min(100, Math.max(0, disputeScore));

    // 6. Eficácia Executiva e Assinatura Digital (Art. 784 CPC)
    let enforceabilityScore = 65;
    if (includeAssinaturaDigitalICP) enforceabilityScore += 20;
    if (includeNaoConcorrencia) enforceabilityScore += 15;
    enforceabilityScore = Math.min(100, Math.max(0, enforceabilityScore));

    const overall = Math.round(
      (dreiScore + societarySecurity + art50Score + taxRiskScore + disputeScore + enforceabilityScore) / 6
    );

    return {
      dreiCompliance: dreiScore,
      societarySecurity,
      assetProtectionArt50: art50Score,
      taxRiskMitigation: taxRiskScore,
      disputePrevention: disputeScore,
      executiveEnforceability: enforceabilityScore,
      overallScore: overall,
    };
  }, [
    includeConsolidacaoDrei,
    nomeEmpresarial,
    selectedRedesimEvents,
    includeDireitoPreferenciaTagAlong,
    includeDistribuicaoDesproporcional,
    includeConselhoConsultivo,
    partners.length,
    includeAutonomiaPatrimonialArt50,
    includeGravamesSucessivos,
    capitalSocial,
    includeImunidadeITBIImoveis,
    includeApuracaoHaveresSTJ,
    includeDeadlockShotgun,
    includeArbitragemCamara,
    includeAssinaturaDigitalICP,
    includeNaoConcorrencia
  ]);

  // Aplicação de Correções Rápidas no Painel Radar
  const handleApplyRadarQuickFix = (fixId: string) => {
    if (fixId === 'apuracao_haveres') {
      setIncludeApuracaoHaveresSTJ(true);
      setToastMessage('Cláusula de Apuração de Haveres (Tema 1.056 STJ) ativada com sucesso!');
    } else if (fixId === 'autonomia_patrimonial') {
      setIncludeAutonomiaPatrimonialArt50(true);
      setToastMessage('Cláusula de Autonomia Patrimonial Estrita (Art. 50 CC) ativada com sucesso!');
    } else if (fixId === 'assinatura_icp') {
      setIncludeAssinaturaDigitalICP(true);
      setToastMessage('Cláusula de Assinatura Digital ICP-Brasil (Art. 784 CPC) ativada com sucesso!');
    } else if (fixId === 'tag_along') {
      setIncludeDireitoPreferenciaTagAlong(true);
      setToastMessage('Cláusula de Direito de Preferência & Tag Along ativada com sucesso!');
    } else if (fixId === 'itbi') {
      setIncludeImunidadeITBIImoveis(true);
      setToastMessage('Cláusula de Integralização com Imóveis / ITBI ativada com sucesso!');
    }
  };

  // Inserção de Cláusula Blindada da Biblioteca
  const handleInsertLibraryClause = (clause: ShieldedClauseItem) => {
    if (clause.id === 'clausula_apuracao_haveres_stj') setIncludeApuracaoHaveresSTJ(true);
    else if (clause.id === 'clausula_autonomia_art50') setIncludeAutonomiaPatrimonialArt50(true);
    else if (clause.id === 'clausula_lockup_vesting_tagalong') setIncludeDireitoPreferenciaTagAlong(true);
    else if (clause.id === 'clausula_deadlock_shotgun') setIncludeDeadlockShotgun(true);
    else if (clause.id === 'clausula_distribuicao_desproporcional') setIncludeDistribuicaoDesproporcional(true);
    else if (clause.id === 'clausula_arbitragem_camara') setIncludeArbitragemCamara(true);
    else if (clause.id === 'clausula_nao_concorrencia_staff') setIncludeNaoConcorrencia(true);
    else if (clause.id === 'clausula_integralizacao_imoveis_itbi') setIncludeImunidadeITBIImoveis(true);
    else if (clause.id === 'clausula_assinatura_eletronica_icp') setIncludeAssinaturaDigitalICP(true);
    else if (clause.id === 'clausula_gravames_incomunicabilidade') setIncludeGravamesSucessivos(true);
    else {
      setCustomAdditionalClauseText(prev => prev ? `${prev}\n\n${clause.fullClauseText}` : clause.fullClauseText);
    }
    setToastMessage(`Cláusula "${clause.title}" inserida com sucesso no contrato!`);
  };

  // Aplicação de Modelo Estruturado da Biblioteca
  const handleApplyLibraryModel = (model: ContractPrecedentModel) => {
    model.recommendedClauses.forEach(clauseId => {
      if (clauseId === 'clausula_apuracao_haveres_stj') setIncludeApuracaoHaveresSTJ(true);
      if (clauseId === 'clausula_autonomia_art50') setIncludeAutonomiaPatrimonialArt50(true);
      if (clauseId === 'clausula_lockup_vesting_tagalong') setIncludeDireitoPreferenciaTagAlong(true);
      if (clauseId === 'clausula_deadlock_shotgun') setIncludeDeadlockShotgun(true);
      if (clauseId === 'clausula_distribuicao_desproporcional') setIncludeDistribuicaoDesproporcional(true);
      if (clauseId === 'clausula_arbitragem_camara') setIncludeArbitragemCamara(true);
      if (clauseId === 'clausula_nao_concorrencia_staff') setIncludeNaoConcorrencia(true);
      if (clauseId === 'clausula_integralizacao_imoveis_itbi') setIncludeImunidadeITBIImoveis(true);
      if (clauseId === 'clausula_assinatura_eletronica_icp') setIncludeAssinaturaDigitalICP(true);
      if (clauseId === 'clausula_gravames_incomunicabilidade') setIncludeGravamesSucessivos(true);
    });
    setToastMessage(`Modelo "${model.title}" aplicado! Cláusulas blindadas ativadas.`);
  };

  // Seleção de Preset REDESIM
  const handleSelectRedesimPreset = (preset: RedesimPreset) => {
    setSelectedRedesimPresetId(preset.id);
    setContractMode(preset.targetMode as any);
    setSelectedRedesimEvents(preset.events);
    
    const c = preset.defaultClausesToEnable;
    setIncludeConsolidacaoDrei(c.consolidacaoDrei);
    setIncludeApuracaoHaveresSTJ(c.apuracaoHaveresSTJ);
    setIncludeAutonomiaPatrimonialArt50(c.autonomiaPatrimonialArt50);
    setIncludeDireitoPreferenciaTagAlong(c.direitoPreferenciaTagAlong);
    setIncludeDeadlockShotgun(c.deadlockShotgun);
    setIncludeDistribuicaoDesproporcional(c.distribuicaoDesproporcional);
    setIncludeArbitragemCamara(c.arbitragemCamara);
    setIncludeNaoConcorrencia(c.naoConcorrencia);
    setIncludeImunidadeITBIImoveis(c.imunidadeITBIImoveis);
    setIncludeAssinaturaDigitalICP(c.assinaturaDigitalICP);
    setIncludeGravamesSucessivos(c.gravamesSucessivos);
    setIncludeConselhoConsultivo(c.conselhoConsultivo);

    setToastMessage(`Preset REDESIM "${preset.name}" aplicado! Eventos e salvaguardas configurados.`);
  };

  // --- INJEÇÃO DE FUNÇÕES DE BLINDAGEM SOCIETÁRIA ---
  const generateShieldingDocument = useCallback(() => {
    const dateFormatted = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const model = STRUCTURING_MODELS_DATA.find(m => m.id === shieldingType) || STRUCTURING_MODELS_DATA[0];

    return model.generateFullDraft({
      socioPF: holdingSocioPF,
      herdeiros: holdingHeireiros,
      ativos: holdingAssets,
      nomeEmpresarial: nomeEmpresarial || 'HOLDING PATRIMONIAL',
      cidade: cidade || 'São Paulo',
      ufEmpresa: ufEmpresa || 'SP',
      dateFormatted,
      clauses: {
        inalienabilidade: shieldInalienabilidade,
        impenhorabilidade: shieldImpenhorabilidade,
        incomunicabilidade: shieldIncomunicabilidade,
        usufruto: shieldUsufruto,
        reversao: shieldReversao,
        prefRoute: shieldPrefRoute,
        tagAlong: shieldTagAlong,
        dragAlong: shieldDragAlong,
        deadlock: shieldDeadlock,
        callOption: shieldCallOption,
        imunidadeITBI: shieldImunidadeITBI,
        autonomiaPatrimonial: shieldAutonomiaPatrimonial,
        nonCompete: shieldNonCompete,
        vesting: shieldVesting,
        conselhoConsultivo: shieldConselhoConsultivo,
        escrowEarnout: shieldEscrowEarnout,
        valuationMethod: shieldValuationMethod,
      }
    });
  }, [
    shieldingType,
    holdingSocioPF,
    holdingHeireiros,
    holdingAssets,
    shieldInalienabilidade,
    shieldImpenhorabilidade,
    shieldIncomunicabilidade,
    shieldUsufruto,
    shieldReversao,
    shieldPrefRoute,
    shieldTagAlong,
    shieldDragAlong,
    shieldDeadlock,
    shieldCallOption,
    shieldImunidadeITBI,
    shieldAutonomiaPatrimonial,
    shieldNonCompete,
    shieldVesting,
    shieldConselhoConsultivo,
    shieldEscrowEarnout,
    shieldValuationMethod,
    nomeEmpresarial,
    cidade,
    ufEmpresa
  ]);

  const getShieldingAudit = useCallback(() => {
    let score = 100;
    const warnings: Array<{ id: string; title: string; desc: string; type: 'error' | 'warning' | 'info'; law: string }> = [];
    const model = STRUCTURING_MODELS_DATA.find(m => m.id === shieldingType) || STRUCTURING_MODELS_DATA[0];

    // Checagem de Gravames para Holdings e Doações
    if (model.category === 'holdings' || model.category === 'especiais' || shieldingType.includes('doacao')) {
      if (!shieldInalienabilidade) {
        score -= 15;
        warnings.push({
          id: 'missing_inalienability',
          title: 'Falta Cláusula de Inalienabilidade',
          desc: 'Sem este gravame, os herdeiros ou donatários podem alienar, vender ou doar as quotas sociais recebidas a terceiros sem a autorização do patriarca.',
          type: 'error',
          law: 'Art. 1.911 do Código Civil Brasileiro'
        });
      }
      if (!shieldImpenhorabilidade) {
        score -= 15;
        warnings.push({
          id: 'missing_impenhorabilidade',
          title: 'Falta Cláusula de Impenhorabilidade',
          desc: 'As quotas sociais doadas podem ser penhoradas judicialmente por credores pessoais futuros dos herdeiros, comprometendo a blindagem da holding.',
          type: 'error',
          law: 'Art. 1.911 do Código Civil'
        });
      }
      if (!shieldIncomunicabilidade) {
        score -= 20;
        warnings.push({
          id: 'missing_incomunicabilidade',
          title: 'Falta Cláusula de Incomunicabilidade (RISCO CRÍTICO)',
          desc: 'Em caso de divórcio ou dissolução de união estável dos herdeiros, os cônjuges (genros ou noras) poderão pleitear 50% das quotas recebidas.',
          type: 'error',
          law: 'Art. 1.668, I e Art. 1.911 do Código Civil'
        });
      }
      if (!shieldUsufruto) {
        score -= 20;
        warnings.push({
          id: 'missing_usufruto',
          title: 'Sem Reserva de Usufruto Vitalício (ALTO RISCO)',
          desc: 'Sem usufruto, o patriarca perde imediatamente o controle de voto (poder político) e o recebimento de dividendos (poder econômico).',
          type: 'error',
          law: 'Art. 1.390 a 1.411 do Código Civil'
        });
      }
      if (!shieldReversao) {
        score -= 10;
        warnings.push({
          id: 'missing_reversao',
          title: 'Ausência de Cláusula de Reversão por Premoriência',
          desc: 'Caso o herdeiro beneficiário faleça antes do patriarca doador, as quotas doadas irão para o inventário do herdeiro, transmitindo-se sem retornar ao doador.',
          type: 'warning',
          law: 'Art. 547 do Código Civil'
        });
      }
      if (!shieldImunidadeITBI) {
        score -= 10;
        warnings.push({
          id: 'missing_itbi_immunity',
          title: 'Risco de Cobrança Fiscal de ITBI',
          desc: 'A ausência de ressalva da atividade imobiliária preponderante (Art. 156 CF) pode levar à cobrança municipal do imposto sobre a integralização.',
          type: 'warning',
          law: 'Art. 156, § 2º, I da Constituição Federal c/c Tema 796 STF'
        });
      }
    }

    // Checagem de Governança e Acordo Parassocial
    if (model.category === 'governanca') {
      if (!shieldPrefRoute) {
        score -= 20;
        warnings.push({
          id: 'missing_pref_route',
          title: 'Sem Direito de Preferência Absoluto',
          desc: 'Permite que um sócio venda suas quotas a terceiros ou concorrentes sem oferecer previamente aos sócios fundadores remanescentes.',
          type: 'error',
          law: 'Art. 1.057 do Código Civil'
        });
      }
      if (!shieldTagAlong) {
        score -= 10;
        warnings.push({
          id: 'missing_tag_along',
          title: 'Falta de Proteção Tag-Along para Minoritários',
          desc: 'Os sócios minoritários ficam desprotegidos em caso de venda de controle acionário, sujeitos a novos controladores desconhecidos.',
          type: 'warning',
          law: 'Art. 254-A da Lei das S/A (Lei 6.404/76)'
        });
      }
      if (!shieldDragAlong) {
        score -= 10;
        warnings.push({
          id: 'missing_drag_along',
          title: 'Ausência de Cláusula Drag-Along (Arrasto)',
          desc: 'Um minoritário com apenas 1% pode vetar ou travar a venda de 100% da empresa para um grande fundo de investimentos ou comprador estratégico.',
          type: 'warning',
          law: 'Princípio da Autonomia de Vontade das Partes'
        });
      }
      if (!shieldDeadlock) {
        score -= 20;
        warnings.push({
          id: 'missing_deadlock',
          title: 'Falta Mecanismo Anti-Deadlock (Texas Shootout/Shotgun)',
          desc: 'Se houver empate de 50/50 em decisões cruciais, a sociedade trava e a única saída será a dissolução judicial conflituosa.',
          type: 'error',
          law: 'Art. 1.033 e 1.034 do Código Civil'
        });
      }
      if (!shieldNonCompete) {
        score -= 10;
        warnings.push({
          id: 'missing_non_compete',
          title: 'Ausência de Não-Concorrência Estrita',
          desc: 'Sem cláusula de não concorrência com prazo e território definidos, sócios retirantes podem canibalizar a clientela da empresa.',
          type: 'warning',
          law: 'Art. 1.147 do Código Civil'
        });
      }
      if (!shieldCallOption) {
        score -= 10;
        warnings.push({
          id: 'missing_call_option',
          title: 'Falta de Call Option (Opção de Compra Compulsória)',
          desc: 'Se um sócio violar deveres fiduciários ou for excluído, os remanescentes não têm direito contratual imediato de adjudicar suas quotas.',
          type: 'info',
          law: 'Art. 1.085 do Código Civil'
        });
      }
    }

    // Checagem para Reorganizações Societárias
    if (model.category === 'reorganizacao') {
      if (!shieldAutonomiaPatrimonial) {
        score -= 20;
        warnings.push({
          id: 'missing_autonomia',
          title: 'Isolamento de Riscos e Autonomia Patrimonial Incompleta',
          desc: 'Sem blindagem expressa da autonomia patrimonial, credores de uma operação cindida podem buscar responsabilização solidária das demais sociedades.',
          type: 'error',
          law: 'Art. 50 do Código Civil (Lei 13.874/2019)'
        });
      }
    }

    if (shieldValuationMethod === 'fluxo_caixa_descontado' && model.id.includes('imoveis')) {
      score -= 10;
      warnings.push({
        id: 'valuation_mismatch',
        title: 'Valuation Inadequado para Holding Imobiliária',
        desc: 'Para holdings detentoras de bens imóveis, o fluxo de caixa descontado pode inflar o valor de retirada de um sócio, drenando a liquidez.',
        type: 'warning',
        law: 'Art. 1.031 do Código Civil'
      });
    }

    score = Math.max(score, 10);
    return { score, warnings };
  }, [
    shieldingType,
    shieldInalienabilidade,
    shieldImpenhorabilidade,
    shieldIncomunicabilidade,
    shieldUsufruto,
    shieldReversao,
    shieldPrefRoute,
    shieldTagAlong,
    shieldDragAlong,
    shieldDeadlock,
    shieldCallOption,
    shieldImunidadeITBI,
    shieldAutonomiaPatrimonial,
    shieldNonCompete,
    shieldValuationMethod
  ]);

  const handleDownloadShieldPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      
      const selectedModel = STRUCTURING_MODELS_DATA.find(m => m.id === shieldingType);
      const title = selectedModel 
        ? selectedModel.title.replace(/[^a-zA-Z0-9]/g, '_') 
        : 'Projeto_Blindagem_Patrimonial';

      const content = generateShieldingDocument();
      const splitText = doc.splitTextToSize(content, 180);
      let cursorY = 20;

      // Adicionar Cabeçalho com borda superior elegante
      doc.setDrawColor(249, 115, 22); // Cor laranja para blindagem
      doc.setLineWidth(1.5);
      doc.line(15, 10, 195, 10);

      for (let i = 0; i < splitText.length; i++) {
        if (cursorY > 280) {
          doc.addPage();
          cursorY = 15;
        }
        doc.text(splitText[i], 15, cursorY);
        cursorY += 5;
      }
      doc.save(`${title}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF de blindagem:', err);
      window.print();
    }
  };

  // Helper de substituição de variáveis com dados da empresa ativa
  const formatModelTemplate = useCallback((draft: string) => {
    const nome = (nomeEmpresarial || currentCompany?.name || 'VÉRTICE PARTICIPAÇÕES LTDA').toUpperCase();
    const cnpj = currentCompany?.cnpj || '00.000.000/0001-00';
    const city = cidade || 'São Paulo';
    const uf = ufEmpresa || 'SP';
    const endereco = `${logradouro || 'Avenida Paulista'}, ${numero || '1000'}, ${bairro || 'Bela Vista'}, ${city}/${uf}, CEP ${cep || '01310-100'}`;
    const dateFormatted = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    const valorCap = capitalSocial ? capitalSocial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 100.000,00';
    const patriarca = holdingSocioPF || 'CARLOS MIGUEL VIEIRA';
    const herdeiroPrimario = holdingHeireiros.split(',')[0]?.trim() || 'ANA CLARA VIEIRA';

    return draft
      .replace(/\{\{?CONTRATANTE_NOME\}?\}|\{\{?RAZAO_SOCIAL\}?\}|\{\{?HOLDING_DENOMINACAO\}?\}/g, nome)
      .replace(/\{\{?CONTRATANTE_DOC\}?\}|\{\{?CONTRATANTE_CNPJ\}?\}|\{\{?CNPJ\}?\}/g, cnpj)
      .replace(/\{\{?CONTRATANTE_ENDERECO\}?\}|\{\{?SEDE_ENDERECO\}?\}/g, endereco)
      .replace(/\{\{?FORO_CIDADE\}?\}/g, city)
      .replace(/\{\{?FORO_UF\}?\}/g, uf)
      .replace(/\{\{?DATA_EXTENSO\}?\}/g, dateFormatted)
      .replace(/\{\{?CAPITAL_SOCIAL\}?\}/g, valorCap)
      .replace(/\{\{?SOCIO_PATRIARCA\}?\}|\{\{?DOADOR_NOME\}?\}/g, patriarca.toUpperCase())
      .replace(/\{\{?BENEFICIARIO_NOME\}?\}|\{\{?SOCIO_DONATARIO\}?\}|\{\{?CONTRATADA_NOME\}?\}/g, herdeiroPrimario.toUpperCase())
      .replace(/\{\{?CONTRATADA_DOC\}?\}/g, '11.222.333/0001-44')
      .replace(/\{\{?PERCENTUAL_MAXIMO\}?\}/g, '15')
      .replace(/\{\{?VALOR_TOTAL_IMOVEIS\}?\}/g, 'R$ 2.500.000,00');
  }, [nomeEmpresarial, currentCompany, cidade, ufEmpresa, logradouro, numero, bairro, cep, capitalSocial, holdingSocioPF, holdingHeireiros]);

  // Download PDF de qualquer minuta da Biblioteca com formatação executiva
  const handleDownloadMatrixPDF = (model: ContractModelItem) => {
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);

      const title = model.title.replace(/[^a-zA-Z0-9]/g, '_');
      const dynamicDraft = formatModelTemplate(model.boilerplateDraft);

      const splitText = doc.splitTextToSize(dynamicDraft, 180);
      let cursorY = 20;

      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(1.5);
      doc.line(15, 10, 195, 10);

      for (let i = 0; i < splitText.length; i++) {
        if (cursorY > 280) {
          doc.addPage();
          cursorY = 15;
        }
        doc.text(splitText[i], 15, cursorY);
        cursorY += 4.5;
      }
      doc.save(`${title}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF da minuta:', err);
      window.print();
    }
  };

  // Motor Forense Pericial de Auditoria Jurídica & Blindagem Societária 360° (STF / STJ / Vade Mecum)
  const runAuditAnalysis = useCallback((textToAudit: string, selectedModel: any) => {
    if (!textToAudit.trim()) return null;
    const modelInfo = {
      id: selectedModel?.id || 'MINUTA-SOCIETARIA',
      title: selectedModel?.title || 'Instrumento Societário de Blindagem',
      vertical: selectedModel?.vertical || 'Holding & Planejamento Sucessório'
    };
    const result = runForensicAuditEngine(textToAudit, modelInfo);
    setAuditResult(result);
    return result;
  }, []);

  const handleAudit = () => {
    if (!auditorDraftText.trim()) return;
    setIsAuditing(true);
    setTimeout(() => {
      const selectedModel = CONTRACT_MATRIX_DATA.find(m => m.id === auditorSelectedType)
        || STRUCTURING_MODELS_DATA.find(m => m.id === auditorSelectedType)
        || CONTRACT_MATRIX_DATA[0];
      runAuditAnalysis(auditorDraftText, selectedModel);
      setIsAuditing(false);
    }, 450);
  };

  // Injeção de cláusula saneadora individual
  const handleInjectClause = (clauseFixOrCode: string) => {
    let textToAppend = clauseFixOrCode;
    if (ELITE_AUDIT_CLAUSES[clauseFixOrCode]) {
      textToAppend = ELITE_AUDIT_CLAUSES[clauseFixOrCode].text;
    }
    const updated = auditorDraftText.trim() + "\n\n" + textToAppend.trim();
    setAuditorDraftText(updated);
    const selectedModel = CONTRACT_MATRIX_DATA.find(m => m.id === auditorSelectedType)
      || STRUCTURING_MODELS_DATA.find(m => m.id === auditorSelectedType)
      || CONTRACT_MATRIX_DATA[0];
    runAuditAnalysis(updated, selectedModel);
    setToastMessage("Cláusula de blindagem jurídica injetada com sucesso! Score recalculado.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Injeção em lote de todas as cláusulas saneadoras faltantes
  const handleInjectAllClauses = () => {
    if (!auditResult?.issues || auditResult.issues.length === 0) return;
    let text = auditorDraftText.trim();
    auditResult.issues.forEach((iss: any) => {
      const clauseText = iss.clauseFix || (ELITE_AUDIT_CLAUSES[iss.code]?.text) || '';
      if (clauseText && !text.toLowerCase().includes(clauseText.slice(0, 45).toLowerCase())) {
        text += "\n\n" + clauseText.trim();
      }
    });
    setAuditorDraftText(text);
    const selectedModel = CONTRACT_MATRIX_DATA.find(m => m.id === auditorSelectedType)
      || STRUCTURING_MODELS_DATA.find(m => m.id === auditorSelectedType)
      || CONTRACT_MATRIX_DATA[0];
    runAuditAnalysis(text, selectedModel);
    setToastMessage("Todas as cláusulas saneadoras com padrão dos Tribunais foram aplicadas com êxito!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Exportar Parecer Técnico Jurídico em PDF
  const handleDownloadAuditOpinionPDF = () => {
    if (!auditResult) return;
    try {
      const doc = new jsPDF();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);

      const title = `PARECER_AUDITORIA_${auditResult.modelId}_${(nomeEmpresarial || 'EMPRESA').replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Cabeçalho Premium
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 26, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(249, 115, 22); // orange-500
      doc.text('VÉRTICE LEGAL LAB - AUDITORIA SOCIETÁRIA & BLINDAGEM 360°', 15, 12);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text('Parecer Técnico de Conformidade, Segurança Jurídica e Proteção Patrimonial', 15, 19);

      let cursorY = 36;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`1. DIAGNÓSTICO GERAL DE CONFORMIDADE & BLINDAGEM`, 15, cursorY);
      cursorY += 6;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Instrumento Auditado: ${auditResult.modelTitle} (${auditResult.modelId})`, 15, cursorY);
      cursorY += 5;
      doc.text(`Empresa / Objeto: ${(nomeEmpresarial || currentCompany?.name || 'Vértice Participações Ltda').toUpperCase()} | CNPJ: ${currentCompany?.cnpj || '00.000.000/0001-00'}`, 15, cursorY);
      cursorY += 5;
      doc.text(`Data da Auditoria: ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })} | Protocolo: VTX-${Date.now().toString().slice(-6)}`, 15, cursorY);
      cursorY += 7;

      // Caixa de Pontuação
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, cursorY, 180, 16, 2, 2, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(auditResult.score >= 85 ? 16 : auditResult.score >= 60 ? 217 : 225, auditResult.score >= 85 ? 185 : auditResult.score >= 60 ? 119 : 29, auditResult.score >= 85 ? 129 : auditResult.score >= 60 ? 6 : 72);
      doc.text(`Índice de Segurança Jurídica: ${auditResult.score}/100 - ${auditResult.levelLabel.toUpperCase()}`, 20, cursorY + 11);
      cursorY += 23;

      // 6 Pilares Estratégicos
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('2. ANÁLISE DOS 6 PILARES DA ESTRUTURAÇÃO SOCIETÁRIA', 15, cursorY);
      cursorY += 6;

      const dims = [
        { name: 'Pilar 1 - Validade Subjetiva & Capacidade (Art. 104, I CC)', val: auditResult.dimensions.capacidadeValidade },
        { name: 'Pilar 2 - Objeto Lícito & Função Social (Art. 104, II CC)', val: auditResult.dimensions.objetoFuncaoSocial },
        { name: 'Pilar 3 - Forma Prescrita & Eficácia RGI (Art. 64 L. 8.934/94)', val: auditResult.dimensions.formaEficaciaRegistral },
        { name: 'Pilar 4 - Autonomia Patrimonial (Art. 50 CC / Lei 13.874/19)', val: auditResult.dimensions.barreiraDesconsideracao },
        { name: 'Pilar 5 - Gravames Sucessórios & Usufruto (Art. 1.911 CC)', val: auditResult.dimensions.gravamesSucessao },
        { name: 'Pilar 6 - Tributário, Valuation & Deadlock (STF 796 / STJ 1.877)', val: auditResult.dimensions.tributarioValuation },
      ];

      dims.forEach(d => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`• ${d.name}: [${d.val.status.toUpperCase()}]`, 18, cursorY);
        cursorY += 4.5;
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const splitDet = doc.splitTextToSize(`  ${d.val.details}`, 170);
        splitDet.forEach((line: string) => {
          if (cursorY > 275) { doc.addPage(); cursorY = 20; }
          doc.text(line, 18, cursorY);
          cursorY += 4;
        });
        cursorY += 2;
      });

      if (cursorY > 250) { doc.addPage(); cursorY = 20; } else { cursorY += 5; }

      // Vulnerabilidades Identificadas
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('3. VULNERABILIDADES IDENTIFICADAS & FUNDAMENTAÇÃO LEGAL', 15, cursorY);
      cursorY += 6;

      if (auditResult.issues.length === 0) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(22, 101, 52);
        doc.text('Nenhuma vulnerabilidade crítica ou moderada detectada na minuta. O contrato atende plenamente aos critérios de blindagem e segurança jurídica.', 18, cursorY);
        cursorY += 8;
      } else {
        auditResult.issues.forEach((iss: any, idx: number) => {
          if (cursorY > 260) { doc.addPage(); cursorY = 20; }
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(iss.severity === 'critico' ? 185 : iss.severity === 'alto' ? 194 : 71, iss.severity === 'critico' ? 28 : iss.severity === 'alto' ? 65 : 85, iss.severity === 'critico' ? 28 : iss.severity === 'alto' ? 12 : 105);
          doc.text(`${idx + 1}. [${iss.severity.toUpperCase()}] ${iss.title}`, 18, cursorY);
          cursorY += 4.5;

          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`   Fundamento Legal: ${iss.law}`, 18, cursorY);
          cursorY += 4.5;

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          const splitRisk = doc.splitTextToSize(`   Risco Prático: ${iss.practicalRisk}`, 170);
          splitRisk.forEach((line: string) => {
            if (cursorY > 275) { doc.addPage(); cursorY = 20; }
            doc.text(line, 18, cursorY);
            cursorY += 3.8;
          });
          cursorY += 3;
        });
      }

      if (cursorY > 250) { doc.addPage(); cursorY = 20; } else { cursorY += 5; }

      // Conclusão e Parecer
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('4. CONCLUSÃO & RECOMENDAÇÕES DA AUDITORIA', 15, cursorY);
      cursorY += 6;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitConc = doc.splitTextToSize(
        `Conclui-se que o presente instrumento apresenta conformidade jurídica classificada como "${auditResult.levelLabel}". Recomenda-se a adoção imediata das cláusulas saneadoras apontadas, com destaque para a adstrição ao Tema 796 do STF na integralização de imóveis, a adoção de Balanço Especial de Determinação (STJ REsp 1.877.331/SP) e o registro do contrato perante a Junta Comercial competente para eficácia erga omnes nos termos do Artigo 64 da Lei Federal nº 8.934/1994.`,
        175
      );
      splitConc.forEach((line: string) => {
        if (cursorY > 275) { doc.addPage(); cursorY = 20; }
        doc.text(line, 15, cursorY);
        cursorY += 4;
      });

      cursorY += 10;
      if (cursorY > 265) { doc.addPage(); cursorY = 25; }
      doc.setDrawColor(203, 213, 225);
      doc.line(15, cursorY, 195, cursorY);
      cursorY += 6;
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Parecer emitido eletronicamente pela Plataforma de Inteligência Societária & Blindagem Patrimonial Vértice.', 15, cursorY);

      doc.save(`${title}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar parecer de auditoria:', err);
      window.print();
    }
  };

  // Inicialização inteligente da minuta padrão para o auditor
  useEffect(() => {
    if (!auditorDraftText) {
      const defaultModel = CONTRACT_MATRIX_DATA.find(m => m.id === 'CON-070') || CONTRACT_MATRIX_DATA[0];
      const rendered = formatModelTemplate(defaultModel.boilerplateDraft);
      setAuditorDraftText(rendered);
      setTimeout(() => {
        runAuditAnalysis(rendered, defaultModel);
      }, 150);
    }
  }, [auditorDraftText, formatModelTemplate, runAuditAnalysis]);

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

        {/* NAVEGAÇÃO INTERNA DO MÓDULO SOCIETÁRIO - GRID HORIZONTAL 4 COLUNAS EM 1 LINHA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80 font-sans w-full">
          <button
            onClick={() => setActiveSubSection('blindagem_societaria')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              activeSubSection === 'blindagem_societaria'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-950/50 border border-orange-400/40 ring-1 ring-orange-400/30'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="truncate">1. Blindagem & Holdings</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/30 text-orange-200 font-extrabold shrink-0 ml-1 font-mono">EXPERT 360°</span>
          </button>

          <button
            onClick={() => setActiveSubSection('gerador_contrato')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              activeSubSection === 'gerador_contrato'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">2. Gerador de Contrato Social</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-extrabold shrink-0 ml-1 font-mono">REDESIM</span>
          </button>

          <button
            onClick={() => setActiveSubSection('juntas_passo_a_passo')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              activeSubSection === 'juntas_passo_a_passo'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate">3. Guia 27 Juntas Comerciais</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-extrabold shrink-0 ml-1 font-mono">Brasil</span>
          </button>

          <button
            onClick={() => setActiveSubSection('modelos_guia')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer ${
              activeSubSection === 'modelos_guia'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40 border border-cyan-400/40'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate">4. Guia Tipos de Empresas</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-extrabold shrink-0 ml-1 font-mono">DREI</span>
          </button>
        </div>

        {/* NOTIFICAÇÃO TOAST FLUTUANTE */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-orange-500/60 shadow-2xl rounded-2xl p-4 flex items-center space-x-3 text-xs text-white backdrop-blur-md animate-bounce-short">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-slate-100">{toastMessage}</span>
          </div>
        )}
      </div>

      {/* SEÇÃO 1: GERADOR DE CONTRATOS SOCIAIS E ALTERAÇÕES CONTRATUAIS */}
      {activeSubSection === 'gerador_contrato' && (
        <div className="space-y-6">
          
          {/* TIPO DE OPERAÇÃO SOCIETÁRIA EM FAIXA HORIZONTAL COMPLETA (6 COLUNAS) */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Tipo de Operação Societária (REDESIM / DREI):
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/80 font-mono font-bold">
                Motor Forense 2026
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 w-full">
              <button
                type="button"
                onClick={() => setContractMode('abertura')}
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex flex-col gap-1.5 cursor-pointer ${
                  contractMode === 'abertura'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200 ring-1 ring-blue-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 font-mono">101</span>
                </div>
                <span className="text-slate-100 font-bold">Constituição</span>
                <span className="text-[10px] text-slate-400">Abertura LTDA / SLU</span>
              </button>

              <button
                type="button"
                onClick={() => setContractMode('alteracao')}
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex flex-col gap-1.5 cursor-pointer ${
                  contractMode === 'alteracao'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200 ring-1 ring-amber-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono">REDESIM</span>
                </div>
                <span className="text-slate-100 font-bold">Alteração Contratual</span>
                <span className="text-[10px] text-slate-400">Consolidação & Eventos</span>
              </button>

              <button
                type="button"
                onClick={() => setContractMode('transformacao')}
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex flex-col gap-1.5 cursor-pointer ${
                  contractMode === 'transformacao'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200 ring-1 ring-purple-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/80 text-purple-300 font-mono">225</span>
                </div>
                <span className="text-slate-100 font-bold">Transformação</span>
                <span className="text-[10px] text-slate-400">EI ↔ LTDA ↔ SLU ↔ SA</span>
              </button>

              <button
                type="button"
                onClick={() => setContractMode('acordo_socios')}
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex flex-col gap-1.5 cursor-pointer ${
                  contractMode === 'acordo_socios'
                    ? 'bg-cyan-600/30 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 font-mono">Art 118</span>
                </div>
                <span className="text-slate-100 font-bold">Acordo de Sócios</span>
                <span className="text-[10px] text-slate-400">Tag Along / Shotgun</span>
              </button>

              <button
                type="button"
                onClick={() => setContractMode('mutuo_conversivel')}
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex flex-col gap-1.5 cursor-pointer ${
                  contractMode === 'mutuo_conversivel'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono">LC 167</span>
                </div>
                <span className="text-slate-100 font-bold">Mútuo Conversível</span>
                <span className="text-[10px] text-slate-400">Investimento Anjo</span>
              </button>

              <button
                type="button"
                onClick={() => setContractMode('distrato')}
                className={`p-3 rounded-xl border text-xs font-bold transition text-left flex flex-col gap-1.5 cursor-pointer ${
                  contractMode === 'distrato'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-200 ring-1 ring-rose-500 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 font-mono">517</span>
                </div>
                <span className="text-slate-100 font-bold">Distrato / Extinção</span>
                <span className="text-[10px] text-slate-400">Dissolução & Liquidação</span>
              </button>
            </div>

            {/* BARRA DE DADOS ESPECÍFICOS DE ALTERAÇÃO / TRANSFORMAÇÃO / DISTRATO */}
            {contractMode === 'alteracao' && (
              <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">Número da Alteração Contratual:</span>
                    <input
                      type="number"
                      min={1}
                      value={numeroAlteracao}
                      onChange={(e) => setNumeroAlteracao(Number(e.target.value) || 1)}
                      className="w-16 bg-slate-900 border border-amber-700/60 rounded-lg px-2 py-1 text-xs text-white font-bold text-center"
                    />
                    <span className="text-xs text-amber-200 font-bold">ª Alteração</span>
                  </div>
                  <span className="text-[11px] text-amber-400">
                    {selectedRedesimEvents.length} eventos REDESIM selecionados
                  </span>
                </div>
                <p className="text-[11px] text-amber-300/80">
                  O motor gera a fundamentação legal da deliberação de cada evento e, ao final, a <strong>Consolidação Integral do Contrato Social</strong> conforme exigido pela IN DREI nº 81/2020.
                </p>
              </div>
            )}

            {contractMode === 'transformacao' && (
              <div className="p-3 bg-purple-950/30 border border-purple-800/60 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-purple-300 block mb-1">Tipo Societário de Origem:</label>
                  <select
                    value={tipoOrigemTransformacao}
                    onChange={(e) => setTipoOrigemTransformacao(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                  >
                    <option value="Empresário Individual (EI)">Empresário Individual (EI)</option>
                    <option value="Sociedade Limitada Unipessoal (SLU)">Sociedade Limitada Unipessoal (SLU)</option>
                    <option value="Sociedade Limitada (LTDA)">Sociedade Limitada (LTDA Plural)</option>
                    <option value="Sociedade Simples Pura/Limitada">Sociedade Simples (Cartório RCPJ)</option>
                    <option value="Sociedade Anônima Fechada (S/A)">Sociedade Anônima Fechada (S/A)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-purple-300 block mb-1">Tipo Societário de Destino:</label>
                  <select
                    value={tipoDestinoTransformacao}
                    onChange={(e) => setTipoDestinoTransformacao(e.target.value)}
                    className="w-full bg-slate-900 border border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                  >
                    <option value="Sociedade Limitada (LTDA)">Sociedade Limitada (LTDA Plural)</option>
                    <option value="Sociedade Limitada Unipessoal (SLU)">Sociedade Limitada Unipessoal (SLU)</option>
                    <option value="Sociedade Anônima Fechada (S/A)">Sociedade Anônima Fechada (S/A)</option>
                    <option value="Empresário Individual (EI)">Empresário Individual (EI)</option>
                  </select>
                </div>
              </div>
            )}

            {contractMode === 'distrato' && (
              <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-rose-300 block mb-1">Sócio Nomeado Liquidante:</label>
                  <input
                    type="text"
                    value={socioLiquidante}
                    onChange={(e) => setSocioLiquidante(e.target.value)}
                    placeholder={partners[0]?.name || 'Nome do Sócio Liquidante'}
                    className="w-full bg-slate-900 border border-rose-800/60 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-rose-300 block mb-1">Guarda dos Livros e Documentos (5 Anos):</label>
                  <input
                    type="text"
                    value={guardaLivrosSocio}
                    onChange={(e) => setGuardaLivrosSocio(e.target.value)}
                    placeholder={partners[0]?.name || 'Nome do Sócio Custodiante'}
                    className="w-full bg-slate-900 border border-rose-800/60 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PAINEL DE FORMULÁRIO (ESQUERDA) E MINUTA JURÍDICA OFICIAL (DIREITA) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PAINEL DE FORMULÁRIO E DADOS (ESQUERDA) */}
          <div className="lg:col-span-6 space-y-6">

            {/* SELETOR ESPECIALISTA DE EVENTOS REDESIM / DREI */}
            {(contractMode === 'alteracao' || contractMode === 'abertura' || contractMode === 'transformacao') && (
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                      Matriz de Eventos REDESIM & DREI
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold font-mono">
                      {selectedRedesimEvents.length} Eventos Selecionados
                    </span>
                    {selectedRedesimEvents.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedRedesimEvents([])}
                        className="text-[10px] text-slate-400 hover:text-rose-400 underline cursor-pointer ml-1"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>

                {/* FILTROS E BUSCA */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      value={redesimSearchQuery}
                      onChange={(e) => setRedesimSearchQuery(e.target.value)}
                      placeholder="Buscar por código ou palavra (ex: 210, 244, imóvel, capital, administrador)..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: 'Todos' },
                      { id: 'dados_basicos', label: 'Cadastrais' },
                      { id: 'quadro_societario', label: 'Sócios/QSA' },
                      { id: 'capital', label: 'Capital' },
                      { id: 'transformacao', label: 'Reorganização' },
                      { id: 'encerramento', label: 'Baixa' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRedesimCategoryFilter(tab.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                          redesimCategoryFilter === tab.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LISTA ROLÁVEL DE EVENTOS */}
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredRedesimEvents.map((evt) => {
                    const isSelected = selectedRedesimEvents.includes(evt.code);
                    return (
                      <div
                        key={evt.code}
                        onClick={() => handleToggleRedesimEvent(evt.code)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-600/80 text-slate-100 shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className="font-mono text-xs font-black text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              Ev. {evt.code}
                            </span>
                            <span className="font-bold text-xs text-white truncate">
                              {evt.name}
                            </span>
                            {evt.requiresViabilidade && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                                Viabilidade
                              </span>
                            )}
                            {evt.requiresDBE && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                                DBE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {evt.description}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                            <Scale className="w-3 h-3 text-slate-500" />
                            <span>{evt.dreiArticle}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DETALHAMENTO DINÂMICO PARA EVENTOS REDESIM SELECIONADOS */}
                <div className="space-y-3 pt-2">
                  {/* Evento 210 / 220 - Alteração de Nome Empresarial / Fantasia */}
                  {(selectedRedesimEvents.includes('210') || selectedRedesimEvents.includes('220')) && (
                    <div className="p-3.5 bg-slate-900/90 border border-blue-600/60 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-blue-300">
                          Alteração de Nome Empresarial e Fantasia (Eventos 210 / 220):
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">Novo Nome Empresarial (Razão Social):</label>
                          <input
                            type="text"
                            value={novoNomeEmpresarial}
                            onChange={(e) => setNovoNomeEmpresarial(e.target.value)}
                            placeholder="Ex: NOVA RAZÃO SOCIAL TECNOLOGIA LTDA"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">Novo Nome Fantasia:</label>
                          <input
                            type="text"
                            value={nomeFantasia}
                            onChange={(e) => setNomeFantasia(e.target.value)}
                            placeholder="Ex: Nova Marca Digital"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evento 247 / 249 - Alteração / Aumento de Capital Social */}
                  {(selectedRedesimEvents.includes('247') || selectedRedesimEvents.includes('249') || selectedRedesimEvents.includes('211')) && (
                    <div className="p-3.5 bg-slate-900/90 border border-emerald-600/60 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">
                          Alteração e Aumento de Capital Social (Evento 247):
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">Capital Social Anterior (R$):</label>
                          <input
                            type="number"
                            value={capitalSocialAnterior}
                            onChange={(e) => setCapitalSocialAnterior(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-emerald-400 block mb-1">Novo Capital Social Total (R$):</label>
                          <input
                            type="number"
                            value={capitalSocial}
                            onChange={(e) => setCapitalSocial(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Forma de Integralização do Aumento:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'moeda', label: 'Moeda Corrente' },
                            { id: 'lucros', label: 'Lucros Acumulados' },
                            { id: 'imoveis', label: 'Imóveis (Tema 796 STF)' },
                            { id: 'credito', label: 'Conversão de Crédito' },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setFormaAumentoCapital(item.id as any)}
                              className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer text-center ${
                                formaAumentoCapital === item.id
                                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-sm'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {formaAumentoCapital === 'imoveis' && (
                        <div>
                          <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                            Descrição do Imóvel para Integralização (Matrícula, Cartório e Valor Venal):
                          </label>
                          <textarea
                            value={detalhesImoveisIntegralizacao}
                            onChange={(e) => setDetalhesImoveisIntegralizacao(e.target.value)}
                            rows={2}
                            placeholder="Descreva a matrícula, cartório de registro de imóveis e valor conforme escritura..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evento 244 - Alteração de Atividade Econômica */}
                  {selectedRedesimEvents.includes('244') && (
                    <div className="p-3 bg-amber-950/30 border border-amber-600/50 rounded-xl flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-amber-400 shrink-0" />
                      <div className="text-xs text-amber-200">
                        <strong className="text-amber-300">Evento 244 Ativo:</strong> Utilize o{' '}
                        <span className="font-bold text-white">Gerenciador de Atividades & CNAEs</span> abaixo para definir a nova Atividade Principal e Secundárias com verificação de impedimentos no Simples Nacional e redação automática do Objeto Social DREI.
                      </div>
                    </div>
                  )}

                  {/* Evento 248 - Alteração de Quadro de Sócios */}
                  {selectedRedesimEvents.includes('248') && (
                    <div className="p-3 bg-cyan-950/30 border border-cyan-600/50 rounded-xl flex items-center gap-3">
                      <UserPlus className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div className="text-xs text-cyan-200">
                        <strong className="text-cyan-300">Evento 248 Ativo:</strong> No painel de{' '}
                        <span className="font-bold text-white">Quadro de Sócios</span> abaixo, marque os sócios que estão sendo <em>Admitidos</em> (novo sócio) ou <em>Retirantes</em> (saindo da sociedade com cessão e transferência de quotas).
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DADOS DA EMPRESA */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                Dados Principais da Empresa
              </h3>

              {/* NOME EMPRESARIAL */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">NOME EMPRESARIAL (Razão Social):</label>
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
                  <label className="text-xs font-bold text-slate-300 mb-1 block">NOME FANTASIA:</label>
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="LTDA">LTDA - Sociedade Limitada (Plural)</option>
                    <option value="SLU">SLU - Sociedade Limitada Unipessoal (1 Sócio)</option>
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="ME">ME - Microempresa (Até R$ 360 mil/ano)</option>
                    <option value="EPP">EPP - Empresa de Pequeno Porte (Até R$ 4.8 milhões/ano)</option>
                    <option value="DEMAIS">DEMAIS - Normal / Lucro Real / Presumido</option>
                  </select>
                </div>
              </div>

              {/* ENDEREÇO DA EMPRESA */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">ENDEREÇO DA SEDE DA EMPRESA:</label>

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

              {/* GERENCIADOR DINÂMICO DE ATIVIDADES ECONÔMICAS E CNAES (PRIMÁRIO E SECUNDÁRIOS) */}
              <div className="pt-2 border-t border-slate-800">
                <DynamicActivityCnaeSelector
                  primaryCnaeCode={cnaeCodigo}
                  primaryCnaeDesc={cnaeDescricao}
                  secondaryCnaes={secondaryCnaes}
                  onChangePrimaryCnae={(code, desc) => {
                    setCnaeCodigo(code);
                    setCnaeDescricao(desc);
                  }}
                  onAddSecondaryCnae={handleAddSecondaryCnae}
                  onRemoveSecondaryCnae={handleRemoveSecondaryCnae}
                  onSetAsPrimary={handleSetAsPrimary}
                  onGenerateObjetoSocialClause={handleGenerateObjetoSocialClause}
                />
              </div>

              {/* CAPITAL SOCIAL E INTEGRALIZAÇÃO */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Capital Social e Regras de Integralização</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">CAPITAL SOCIAL (R$):</label>
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
                  Quadro de Sócios & Administração ({partners.length})
                </h3>

                <button
                  type="button"
                  onClick={handleAddPartner}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Adicionar Sócio</span>
                </button>
              </div>

              {partners.map((partner, index) => (
                <div key={partner.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 relative">
                  <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-800 gap-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Sócio #{index + 1}
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-1 text-xs text-slate-300 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={partner.isAdministrator}
                          onChange={(e) => handleUpdatePartner(partner.id, 'isAdministrator', e.target.checked)}
                          className="rounded border-slate-700 text-blue-500"
                        />
                        <span>Administrador</span>
                      </label>

                      {contractMode === 'alteracao' && (
                        <>
                          <label className="flex items-center gap-1 text-[11px] text-cyan-400 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={partner.isAdmitted}
                              onChange={(e) => handleUpdatePartner(partner.id, 'isAdmitted', e.target.checked)}
                              className="rounded border-slate-700 text-cyan-500"
                            />
                            <span>Admissão (Ev. 248)</span>
                          </label>

                          <label className="flex items-center gap-1 text-[11px] text-rose-400 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={partner.isRetiring}
                              onChange={(e) => handleUpdatePartner(partner.id, 'isRetiring', e.target.checked)}
                              className="rounded border-slate-700 text-rose-500"
                            />
                            <span>Retirada (Ev. 247)</span>
                          </label>
                        </>
                      )}

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
                Configure as cláusulas especiais de proteção (Balanço de Determinação STJ, Tag Along, Shotgun, Art. 50 CC) e emita o instrumento completo.
              </p>

              <button
                type="button"
                onClick={() => setShowClausesModal(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Configurar Cláusulas Especiais & Emitir Minuta</span>
              </button>
            </div>
          </div>

          {/* VISUALIZAÇÃO DA FOLHA DO CONTRATO GERADO (DIREITA) */}
          <div className="lg:col-span-6">
            {generatedContractText ? (
              <ExecutiveDocumentViewer
                documentTitle={
                  contractMode === 'abertura' ? 'CONTRATO SOCIAL DE CONSTITUIÇÃO' :
                  contractMode === 'transformacao' ? 'INSTRUMENTO PARTICULAR DE TRANSFORMAÇÃO' :
                  contractMode === 'distrato' ? 'DISTRATO SOCIAL & LIQUIDAÇÃO' :
                  contractMode === 'acordo_socios' ? 'ACORDO DE SÓCIOS & GOVERNANÇA' :
                  contractMode === 'mutuo_conversivel' ? 'CONTRATO DE MÚTUO CONVERSÍVEL' :
                  'ALTERAÇÃO CONTRATUAL CONSOLIDADA'
                }
                documentCategory="CONTRATO SOCIAL & ALTERAÇÕES"
                normativeBase="Instrumento redigido e validado em estrita conformidade com a Instrução Normativa DREI nº 81/2020, Código Civil Brasileiro (Lei 10.406/02), Lei da Liberdade Econômica (Lei 13.874/19), Lei nº 14.451/22 e Jurisprudência Vinculante do STJ (Tema 1.056) e STF (Tema 796)."
                companyName={nomeEmpresarial || currentCompany.name || 'SOCIEDADE EMPRESÁRIA LIMITADA'}
                cnpj={currentCompany.cnpj || '00.000.000/0001-00'}
                nire="35.800.000-0"
                uf={ufEmpresa || currentCompany.uf || 'SP'}
                documentBodyText={generatedContractText}
                signatories={partners.map((p, i) => ({
                  name: p.name || `Sócio ${i + 1}`,
                  role: `Sócio Cotista (${p.quotasCount?.toLocaleString('pt-BR') || '1.000'} Cotas)`,
                  cpfCnpj: p.cpf || '000.000.000-00',
                  rgOabCrc: p.rg ? `RG: ${p.rg} ${p.rgIssuer || 'SSP'}` : undefined,
                  signatureType: 'Assinatura Eletrônica Qualificada' as const
                }))}
                onAuditClick={handleAuditCurrentContract}
                onCopyCustomText={() => generatedContractText}
              />
            ) : (
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-8 shadow-lg text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                    Minuta Jurídica Oficial Pronta para Emissão
                  </h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Preencha os dados cadastrais da empresa e dos sócios no formulário à esquerda e clique em <strong>"Configurar Cláusulas Especiais & Emitir Minuta"</strong> para gerar o instrumento institucional timbrado com validação ICP-Brasil.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClausesModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Gerar Minuta Agora</span>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      {/* MODAL / QUESTIONÁRIO PRÉ-EMISSÃO DE CLÁUSULAS ADICIONAIS & FORENSES */}
      {showClausesModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-black text-white">
                    Blindagem & Cláusulas Especiais de Governança
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Selecione as cláusulas contratuais de proteção patrimonial, resolução de conflitos e governança DREI:
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClausesModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {/* 1. Falecimento Balanço de Determinação */}
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-800/60 flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={includeApuracaoHaveresSTJ}
                  onChange={(e) => setIncludeApuracaoHaveresSTJ(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-300">
                      1. Falecimento / Interdição de Sócio por Balanço de Determinação (Ativo a Valor de Mercado)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Tema 1.056 STJ / Art. 1.028 CC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Proíbe a entrada automática de herdeiros no quadro social. Fixa a liquidação das quotas mediante Balanço de Determinação e parcelamento em 12 a 24 parcelas.
                  </p>
                </div>
              </div>

              {/* 2. Preferência e Cessão */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-pref"
                  checked={includeDireitoPreferenciaTagAlong}
                  onChange={(e) => setIncludeDireitoPreferenciaTagAlong(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-pref" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      2. Direito de Preferência Absoluto na Cessão e Transferência de Quotas
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                      Art. 1.057 CC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Garante o direito de preferência aos sócios remanescentes na proporção de suas quotas antes de qualquer oferta a terceiros estranhos à sociedade.
                  </p>
                </label>
              </div>

              {/* 3. Não Concorrência & NDA */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-noncomp"
                  checked={includeNaoConcorrencia}
                  onChange={(e) => setIncludeNaoConcorrencia(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-noncomp" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      3. Não Concorrência, Segredo de Negócio e Confidencialidade Pós-Retirada (NDA)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                      Art. 1.147 CC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Impede o sócio que se retira ou é excluído de abrir negócio concorrente ou aliciar clientes/colaboradores por até 2 (dois) anos sob pena de multa.
                  </p>
                </label>
              </div>

              {/* 4. Proteção Patrimonial Art 50 CC */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-prot"
                  checked={includeAutonomiaPatrimonialArt50}
                  onChange={(e) => setIncludeAutonomiaPatrimonialArt50(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-prot" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      4. Blindagem Contra Desconsideração da Personalidade Jurídica (Art. 50 CC)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 text-purple-400 border border-purple-800 font-bold">
                      Lei 13.874/2019
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Reitera expressamente a separação patrimonial estrita entre bens dos sócios e da sociedade nos termos da Lei da Liberdade Econômica.
                  </p>
                </label>
              </div>

              {/* 5. Distribuição Desproporcional */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-desp"
                  checked={includeDistribuicaoDesproporcional}
                  onChange={(e) => setIncludeDistribuicaoDesproporcional(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-desp" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      5. Distribuição Desproporcional de Lucros e Dividendos
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                      Art. 1.007 CC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permite deliberação unânime para distribuir lucros e pró-labore em proporção diferente das cotas sociais subscritas.
                  </p>
                </label>
              </div>

              {/* 6. Arbitragem */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-arb"
                  checked={includeArbitragemCamara}
                  onChange={(e) => setIncludeArbitragemCamara(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-arb" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      6. Cláusula Compromissória de Arbitragem e Mediação
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                      Lei 9.307/96
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Submete divergências entre sócios à Câmara Arbitral competente, garantindo sigilo e celeridade na solução de impasses societários.
                  </p>
                </label>
              </div>

              {/* 7. Imunidade ITBI e Conferência de Imóveis */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-itbi"
                  checked={includeImunidadeITBIImoveis}
                  onChange={(e) => setIncludeImunidadeITBIImoveis(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-itbi" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      7. Imunidade de ITBI na Integralização com Imóveis
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-bold">
                      Tema 796 STF / Art. 156 CF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Garante o registro imobiliário com amparo na imunidade constitucional e no limite do valor das quotas integralizadas.
                  </p>
                </label>
              </div>

              {/* 8. Shotgun / Buy-or-Sell */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-shotgun"
                  checked={includeDeadlockShotgun}
                  onChange={(e) => setIncludeDeadlockShotgun(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-shotgun" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      8. Cláusula de Impasse Irreconciliável / Texas Shoot-Out (Shotgun)
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                      Desbloqueio de Deadlock
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permite que um sócio oferte a compra das cotas do outro por um determinado valor. O notificado deve aceitar vender ou comprar a do ofertante pelo mesmo preço unitário.
                  </p>
                </label>
              </div>

              {/* 9. Inalienabilidade e Gravames Sucessivos */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-gravames"
                  checked={includeGravamesSucessivos}
                  onChange={(e) => setIncludeGravamesSucessivos(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-gravames" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      9. Inalienabilidade, Incomunicabilidade e Impenhorabilidade de Quotas
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                      Art. 1.911 CC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Protege o patrimônio familiar e as quotas societárias contra constrições judiciais externas e execuções alheias à sociedade.
                  </p>
                </label>
              </div>

              {/* 10. Conselho Consultivo e Governança */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  id="chk-conselho"
                  checked={includeConselhoConsultivo}
                  onChange={(e) => setIncludeConselhoConsultivo(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="chk-conselho" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      10. Criação de Conselho Consultivo e Governança
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Governança Familiar
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Estrutura conselho de assessoramento aos administradores para diretrizes financeiras e plano estratégico da sociedade.
                  </p>
                </label>
              </div>

              {/* Campo para Cláusula Texto Livre */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Outra Cláusula Adicional Personalizada (Texto Livre):
                </label>
                <textarea
                  value={customAdditionalClauseText}
                  onChange={(e) => setCustomAdditionalClauseText(e.target.value)}
                  placeholder="Escreva qualquer outra instrução societária particular..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800 shrink-0">
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
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Gerar Minuta Completa</span>
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

      {/* SEÇÃO 4: BLINDAGEM SOCIETÁRIA & ACORDO DE SÓCIOS (EXPERT) */}
      {activeSubSection === 'blindagem_societaria' && (
        <div className="space-y-6 font-sans">
          
          {/* HEADER & SUB-ABAS DE BLINDAGEM */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-orange-400" />
                  Blindagem Societária, Acordos Parassociais & Acervo Contratual
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Módulo avançado de proteção patrimonial, governança societária, biblioteca de minutas estruturadas e auditoria preditiva baseada no Art. 104 e Art. 50 do Código Civil (Lei da Liberdade Econômica nº 13.874/19).
                </p>
              </div>

              {/* CONTADOR DE MINUTAS DISPONÍVEIS */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-800/60 text-orange-300 font-bold text-xs flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-orange-400" />
                  <span>{STRUCTURING_MODELS_DATA.length} Procedimentos de Elite • 500 Minutas</span>
                </span>
              </div>
            </div>

            {/* SELETOR DE SUB-ABAS - GRID HORIZONTAL 6 COLUNAS */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 pt-2 border-t border-slate-800 w-full">
              <button
                type="button"
                onClick={() => setBlindagemSubTab('estruturador')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  blindagemSubTab === 'estruturador'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">1. Estruturador</span>
              </button>

              <button
                type="button"
                onClick={() => setBlindagemSubTab('radar_compliance')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  blindagemSubTab === 'radar_compliance'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">2. Radar ({complianceRadarMetrics.overallScore}%)</span>
              </button>

              <button
                type="button"
                onClick={() => setBlindagemSubTab('biblioteca_avancada')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  blindagemSubTab === 'biblioteca_avancada'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">3. Biblioteca Cláusulas</span>
              </button>

              <button
                type="button"
                onClick={() => setBlindagemSubTab('vade_mecum_inteligente')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  blindagemSubTab === 'vade_mecum_inteligente'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">4. Vade Mecum</span>
              </button>

              <button
                type="button"
                onClick={() => setBlindagemSubTab('biblioteca_minutas')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  blindagemSubTab === 'biblioteca_minutas'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Library className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">5. 500 Minutas</span>
              </button>

              <button
                type="button"
                onClick={() => setBlindagemSubTab('auditor_ia')}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  blindagemSubTab === 'auditor_ia'
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileSearch className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">6. Parecer Oficial</span>
              </button>
            </div>
          </div>

          {/* SUB-ABA 1: ESTRUTURADOR INTERATIVO */}
          {blindagemSubTab === 'estruturador' && (
            <div className="space-y-6 animate-fadeIn">
              {/* PRESETS INTELIGENTES REDESIM */}
              <SmartRedesimPresets 
                selectedPresetId={selectedRedesimPresetId} 
                onSelectPreset={handleSelectRedesimPreset} 
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* COLUNA ESQUERDA: CONFIGURADOR E ENTRADA DE DADOS */}
                <div className="lg:col-span-6 space-y-6">
            
            {/* TIPO DE OPERAÇÃO E ARQUETIPO: MATRIZ DE MODELOS */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-400" />
                    1. Matriz de Procedimentos & Arquitetura Societária ({STRUCTURING_MODELS_DATA.length} Modelos de Elite)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Holdings patrimoniais, governança, reorganizações societárias, transformações de tipo jurídico, capital e blindagem.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-950/60 text-orange-400 border border-orange-800/80 font-mono font-bold">
                    {filteredStructuringModels.length} de {STRUCTURING_MODELS_DATA.length} modelos
                  </span>
                </div>
              </div>

              {/* BARRA DE PESQUISA & FILTRO POR CATEGORIA */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={structuringSearch}
                    onChange={(e) => setStructuringSearch(e.target.value)}
                    placeholder="Buscar por nome, lei, artigo, ITBI, holding, acordo, vesting..."
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none transition"
                  />
                  {structuringSearch && (
                    <button
                      type="button"
                      onClick={() => setStructuringSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* FILTROS POR CATEGORIA */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {STRUCTURING_CATEGORIES.map((cat) => {
                    const count = cat.id === 'all'
                      ? STRUCTURING_MODELS_DATA.length
                      : STRUCTURING_MODELS_DATA.filter((m) => m.category === cat.id).length;
                    const isActive = structuringCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setStructuringCategoryFilter(cat.id)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-orange-600 text-white shadow-sm shadow-orange-950'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`text-[9px] px-1 rounded font-mono ${isActive ? 'bg-orange-800 text-orange-200' : 'bg-slate-800 text-slate-500'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GRID DOS MODELOS SELECIONÁVEIS */}
              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredStructuringModels.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs">
                    Nenhum modelo encontrado para "{structuringSearch}". Tente outro termo de busca.
                  </div>
                ) : (
                  filteredStructuringModels.map((model) => {
                    const isSelected = shieldingType === model.id;
                    const getRiskBadge = (risk: typeof model.riskLevel) => {
                      switch (risk) {
                        case 'Máxima Blindagem':
                          return { bg: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400', label: '🛡️ Máxima Blindagem' };
                        case 'Alta Complexidade':
                          return { bg: 'bg-purple-950/60 border-purple-800/80 text-purple-300', label: '⚡ Alta Complexidade' };
                        case 'Estratégico':
                          return { bg: 'bg-blue-950/60 border-blue-800/80 text-blue-400', label: '⚖️ Estratégico' };
                        case 'Foco Sucessório':
                          return { bg: 'bg-amber-950/60 border-amber-800/80 text-amber-400', label: '🏛️ Foco Sucessório' };
                        case 'Tributário':
                          return { bg: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300', label: '💰 Otimização Fiscal' };
                        default:
                          return { bg: 'bg-slate-800 border-slate-750 text-slate-300', label: 'Padrão' };
                      }
                    };
                    const riskBadge = getRiskBadge(model.riskLevel);

                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => handleSelectStructuringModel(model)}
                        className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border-orange-500 shadow-md ring-1 ring-orange-500/40'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                {model.title}
                                {isSelected && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-600 text-white font-extrabold uppercase tracking-wider">
                                    Ativo
                                  </span>
                                )}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold ${riskBadge.bg}`}>
                                {riskBadge.label}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                                {model.legalFramework}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                              {model.description}
                            </p>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {model.keyFeatures.slice(0, 3).map((feat, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-750 font-sans"
                                >
                                  • {feat}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border mt-0.5 transition ${
                            isSelected
                              ? 'bg-orange-600 border-orange-500 text-white'
                              : 'border-slate-700 text-transparent'
                          }">
                            {isSelected ? <Check className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* IDENTIFICAÇÃO E ATIVOS */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-400" />
                  2. Partes & Ativos Alocados
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedStructuringModel.title}
                </span>
              </div>

              {/* CARD DE DETALHES DO MODELO ATIVO */}
              <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-800/40 text-[11px] text-orange-200/90 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-300 font-bold block">{selectedStructuringModel.title}</strong>
                  <span className="text-[10px] text-slate-300">{selectedStructuringModel.targetProfile}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                    Sócio Instituidor / Patriarca / Cedente Gestor
                  </label>
                  <input
                    type="text"
                    value={holdingSocioPF}
                    onChange={(e) => setHoldingSocioPF(e.target.value)}
                    placeholder="Ex: CARLOS MIGUEL VIEIRA"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-bold focus:border-orange-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                    Herdeiros Donatários / Sócios Beneficiários / Cessionários
                  </label>
                  <input
                    type="text"
                    value={holdingHeireiros}
                    onChange={(e) => setHoldingHeireiros(e.target.value)}
                    placeholder="Ex: ANA CLARA VIEIRA, THIAGO VIEIRA"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-bold focus:border-orange-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 tracking-wider">
                    Ativos Objeto de Proteção / Participações Societárias / Bens Alocados
                  </label>
                  <textarea
                    rows={2}
                    value={holdingAssets}
                    onChange={(e) => setHoldingAssets(e.target.value)}
                    placeholder="Ex: IMÓVEL COMERCIAL MATRÍCULA 45.122 SP, PARTICIPAÇÃO OPERACIONAL VÉRTICE LTDA"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:border-orange-500 focus:outline-none transition resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* CLAUSULAS DE PROTEÇÃO (INTERACTIVE PARAMETERS) */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  3. Cláusulas de Proteção, Governança e Parametrização Ativas
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ajuste fino dos gravames, mecanismos parassociais e diretrizes de governança integradas à minuta.
                </p>
              </div>

              {/* GRUPO 1: GRAVAMES & PROTEÇÃO PATRIMONIAL SUCESSÓRIA */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Gravames & Proteção Sucessória
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Cláusula de Inalienabilidade</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-extrabold font-mono">Art. 1.911 CC</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">As quotas não podem ser vendidas, doadas ou transferidas sem consentimento prévio e expresso.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldInalienabilidade}
                      onChange={(e) => setShieldInalienabilidade(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Cláusula de Impenhorabilidade</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-extrabold font-mono">Art. 1.911 CC</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Impede a constrição e penhora judicial das quotas por dívidas pessoais presentes ou futuras dos herdeiros.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldImpenhorabilidade}
                      onChange={(e) => setShieldImpenhorabilidade(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Cláusula de Incomunicabilidade</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-extrabold font-mono">Blindagem Divórcio</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">As quotas não se comunicam com cônjuges ou companheiros dos donatários, sob qualquer regime de bens.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldIncomunicabilidade}
                      onChange={(e) => setShieldIncomunicabilidade(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Reserva de Usufruto Vitalício com Direito de Voto</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-extrabold font-mono">Art. 1.390 CC</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Garante voto político pleno, deliberação soberana e 100% dos dividendos ao Instituidor até falecimento.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldUsufruto}
                      onChange={(e) => setShieldUsufruto(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Reversão da Doação por Premoriência</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-extrabold font-mono">Art. 547 CC</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Se o herdeiro falecer antes do doador, o patrimônio retorna automaticamente, sem abertura de inventário.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldReversao}
                      onChange={(e) => setShieldReversao(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Imunidade de ITBI em Integralização</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-extrabold font-mono">Tema 796 STF</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Imunidade tributária estrita sobre o valor do imóvel integralizado para formação do capital social.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldImunidadeITBI}
                      onChange={(e) => setShieldImunidadeITBI(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* GRUPO 2: GOVERNANÇA CORPORATIVA & FOUNDERS */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  Governança Corporativa & Parassocial
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Direito de Preferência Absoluto</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-extrabold font-mono">Art. 1.057 CC</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Impede a venda direta de quotas a estranhos ou concorrentes sem prévia oferta aos demais sócios.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldPrefRoute}
                      onChange={(e) => setShieldPrefRoute(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Tag-Along (Direito de Co-venda)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-extrabold font-mono">L. 6.404</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Garante aos minoritários o direito de vender suas quotas nas mesmas condições do acionista controlador.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldTagAlong}
                      onChange={(e) => setShieldTagAlong(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Drag-Along (Obrigação de Co-venda / Arrasto)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-extrabold font-mono">M&A Liquidez</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Permite aos controladores obrigar a alienação total das quotas em caso de proposta de aquisição de 100%.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldDragAlong}
                      onChange={(e) => setShieldDragAlong(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Mecanismos de Deadlock (Anti-Impasse Shotgun)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-extrabold font-mono">Crítica 50/50</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Pactua mecanismo tipo Texas Shootout / Roleta Russa para desbloquear empates decisórios de sócios 50/50.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldDeadlock}
                      onChange={(e) => setShieldDeadlock(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Option Call por Falta Grave / Exclusão</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-extrabold font-mono">Art. 1.085 CC</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Permite a recompra forçada das quotas com deságio em caso de quebra fiduciária grave ou deslealdade.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldCallOption}
                      onChange={(e) => setShieldCallOption(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Não-Concorrência & Exclusividade</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-extrabold font-mono">Art. 1.147 CC</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Vedação expressa de criação de empresas concorrentes ou aliciamento de equipe durante 5 anos.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldNonCompete}
                      onChange={(e) => setShieldNonCompete(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Vesting com Cliff e Subordinação Operacional</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-extrabold font-mono">LC 182/21</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Aquisição paulatina de participação societária atrelada a permanência temporal e metas operacionais.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldVesting}
                      onChange={(e) => setShieldVesting(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Conselho Consultivo / Família</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-extrabold font-mono">Governança IBGC</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Instituição de órgão colegiado para mediação de conflitos intergeracionais e deliberação estratégica.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldConselhoConsultivo}
                      onChange={(e) => setShieldConselhoConsultivo(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* GRUPO 3: REORGANIZAÇÃO SOCIETÁRIA & M&A */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reorganização Societária & M&A
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Autonomia Patrimonial Estrita</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-extrabold font-mono">Lei 13.874 / Art. 50</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Blindagem contra desconsideração da personalidade jurídica, vedando solidariedade sem desvio de finalidade comprovado.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldAutonomiaPatrimonial}
                      onChange={(e) => setShieldAutonomiaPatrimonial(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-750 transition">
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">Conta Escrow de Garantia (Indemnification)</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-extrabold font-mono">M&A Closing</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Retenção temporária de 10% a 20% do preço de compra para liquidação de passivos ocultos tributários/trabalhistas.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={shieldEscrowEarnout}
                      onChange={(e) => setShieldEscrowEarnout(e.target.checked)}
                      className="w-4 h-4 text-orange-500 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO TIPO DE VALUATION DE HAVERES */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                  Mecanismo de Valuation e Apuração de Haveres (Art. 1.031 CC & REsp 1.877.331/SP)
                </label>
                <select
                  value={shieldValuationMethod}
                  onChange={(e) => setShieldValuationMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:border-orange-500 focus:outline-none transition cursor-pointer"
                >
                  <option value="balanco_determinacao">Balanço de Determinação por Ativos Reais a Valor Justo (Recomendado STJ)</option>
                  <option value="valor_patrimonial_contabil">Valor Patrimonial Líquido Contábil Estrito (Evita Avaliação Intangível)</option>
                  <option value="fluxo_caixa_descontado">Fluxo de Caixa Descontado - Múltiplos EBITDA (Startups e Tecnologia)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Define se a apuração de haveres por retirada ou falecimento utiliza a regra geral supletiva ou liquidação por valor justo.
                </p>
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: ANALISADOR JURÍDICO E VISUALIZADOR DE DOCUMENTO */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* ANALISADOR JURÍDICO (COMPLIANCE AUDITOR) */}
            {(() => {
              const audit = getShieldingAudit();
              return (
                <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <Scale className="w-4 h-4 text-emerald-400" />
                        Analisador Jurídico de Blindagem
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Mapeamento de vulnerabilidade patrimonial e conformidade com o Código Civil.
                      </p>
                    </div>

                    {/* SCORE CIRCULAR METER */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative flex items-center justify-center w-14 h-14">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-slate-800"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 24}
                            strokeDashoffset={2 * Math.PI * 24 * (1 - audit.score / 100)}
                            className={`transition-all duration-500 ${
                              audit.score >= 80
                                ? 'text-emerald-500'
                                : audit.score >= 50
                                ? 'text-amber-500'
                                : 'text-red-500'
                            }`}
                          />
                        </svg>
                        <span className="absolute text-xs font-black text-white">{audit.score}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-400 mt-1 tracking-wider">SEGURANÇA</span>
                    </div>
                  </div>

                  {/* ADVERTÊNCIAS / INCONSISTÊNCIAS */}
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {audit.warnings.length === 0 ? (
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 flex items-start space-x-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-xs font-bold text-emerald-300">Nível Máximo de Proteção Atingido!</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                            A estrutura possui todos os gravames de controle, proteção de divórcio, reversão e apuração de haveres conservadora. Plenamente seguro!
                          </span>
                        </div>
                      </div>
                    ) : (
                      audit.warnings.map((warn) => (
                        <div
                          key={warn.id}
                          className={`p-3.5 rounded-xl border flex items-start space-x-3 text-left ${
                            warn.type === 'error'
                              ? 'bg-red-950/20 border-red-900/60'
                              : warn.type === 'warning'
                              ? 'bg-amber-950/20 border-amber-900/60'
                              : 'bg-blue-950/20 border-blue-900/60'
                          }`}
                        >
                          <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            warn.type === 'error' ? 'text-red-400' : warn.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                          }`} />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-100">{warn.title}</span>
                              <span className={`text-[8px] px-1.5 py-0.2 rounded font-black font-mono uppercase tracking-wider ${
                                warn.type === 'error' ? 'bg-red-900/40 text-red-300' : 'bg-amber-900/40 text-amber-300'
                              }`}>
                                {warn.law}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{warn.desc}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* LEGISLAÇÃO E JURISPRUDÊNCIA RELEVANTE */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <span className="font-extrabold text-orange-400 text-[10px] uppercase tracking-wider block">
                      Fundamentos da Liberdade Econômica e STJ
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Conforme a <strong>Lei da Liberdade Econômica (Lei nº 13.874/19)</strong> e alteração do <strong>Art. 50 do Código Civil</strong>, a desconsideração de personalidade jurídica exige comprovação cabal de dolo e confusão patrimonial. A criação prévia de Holdings e acordos regulamenta as relações sem caracterizar fraude a credores.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* LIVE DOCUMENT PREVIEW & ACTIONS */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    Minuta Gerada de Blindagem e Acordo
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Revise, copie ou faça download do documento legal completo.
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateShieldingDocument());
                      setCopiedShieldDoc(true);
                      setTimeout(() => setCopiedShieldDoc(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    title="Copiar Texto"
                  >
                    {copiedShieldDoc ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownloadShieldPDF}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    title="Imprimir"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* DOCUMENT FIELD VIEW */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 h-96 overflow-y-auto font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-orange-500/25 selection:text-orange-200">
                {generateShieldingDocument()}
              </div>

              <div className="p-3 bg-orange-950/20 border border-orange-900/40 rounded-xl flex items-center gap-2.5 text-[10px] text-orange-400 leading-relaxed">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>Dica de Conformidade:</strong> Para eficácia imediata perante terceiros e validade absoluta da blindagem, este instrumento deve ser devidamente averbado na Junta Comercial competente e arquivado no livro de registro de quotas da empresa.
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
      )}

      {/* SUB-ABA 2: PAINEL DE RADAR DE CONFORMIDADE & MATRIZ 360° */}
      {blindagemSubTab === 'radar_compliance' && (
        <div className="animate-fadeIn">
          <ComplianceRadarPanel 
            score={complianceRadarMetrics.overallScore}
            dreiCompliance={complianceRadarMetrics.dreiCompliance}
            societarySecurity={complianceRadarMetrics.societarySecurity}
            assetProtection={complianceRadarMetrics.assetProtectionArt50}
            taxRiskMitigation={complianceRadarMetrics.taxRiskMitigation}
            conflictResolution={complianceRadarMetrics.disputePrevention}
            executiveEnforceability={complianceRadarMetrics.executiveEnforceability}
            clausesActiveCount={[
              includeConsolidacaoDrei,
              includeApuracaoHaveresSTJ,
              includeAutonomiaPatrimonialArt50,
              includeDireitoPreferenciaTagAlong,
              includeDeadlockShotgun,
              includeDistribuicaoDesproporcional,
              includeArbitragemCamara,
              includeNaoConcorrencia,
              includeImunidadeITBIImoveis,
              includeAssinaturaDigitalICP,
              includeGravamesSucessivos,
              includeConselhoConsultivo
            ].filter(Boolean).length}
            activeClausesTitles={[
              includeConsolidacaoDrei ? 'Consolidação DREI IN 81/2020' : '',
              includeApuracaoHaveresSTJ ? 'Apuração de Haveres (Tema 1.056 STJ)' : '',
              includeAutonomiaPatrimonialArt50 ? 'Autonomia Patrimonial (Art. 50 CC)' : '',
              includeDireitoPreferenciaTagAlong ? 'Tag-Along & Direito de Preferência' : '',
              includeDeadlockShotgun ? 'Cláusula Shotgun (Deadlock Resolution)' : '',
              includeDistribuicaoDesproporcional ? 'Distribuição Desproporcional de Lucros' : '',
              includeArbitragemCamara ? 'Cláusula Compromissória de Arbitragem' : '',
              includeNaoConcorrencia ? 'Não Concorrência (Art. 1.147 CC)' : '',
              includeImunidadeITBIImoveis ? 'Imunidade ITBI (Tema 796 STF)' : '',
              includeAssinaturaDigitalICP ? 'Assinatura Eletrônica ICP-Brasil (Art. 784 CPC)' : '',
              includeGravamesSucessivos ? 'Incomunicabilidade & Impenhorabilidade' : '',
              includeConselhoConsultivo ? 'Conselho Consultivo Estratégico' : ''
            ].filter(Boolean)}
            contractTypeTitle={`Contrato Social (${contractMode.toUpperCase()}) - ${nomeEmpresarial || 'Sociedade'}`}
            onApplyQuickFix={handleApplyRadarQuickFix}
          />
        </div>
      )}

      {/* SUB-ABA 3: BIBLIOTECA AVANÇADA DE PRECEDENTES & CLÁUSULAS BLINDADAS */}
      {blindagemSubTab === 'biblioteca_avancada' && (
        <div className="animate-fadeIn">
          <PrecedentesClausulasLibrary 
            onInsertClause={handleInsertLibraryClause}
            onApplyModel={handleApplyLibraryModel}
          />
        </div>
      )}

      {/* SUB-ABA 4: MINI-VADE MECUM & CAMADA CONTEXTUAL */}
      {blindagemSubTab === 'vade_mecum_inteligente' && (
        <div className="animate-fadeIn">
          <MiniVadeMecumContextual 
            currentContractText={generatedContractText || auditorDraftText || generateShieldingDocument()}
            onInsertLegalCitation={(cit) => {
              setCustomAdditionalClauseText(prev => prev ? `${prev}\n\n${cit}` : cit);
              setToastMessage('Fundamentação jurídica adicionada às cláusulas complementares!');
            }}
          />
        </div>
      )}

      {/* SUB-ABA 5: BIBLIOTECA DE 500 MODELOS DE MINUTAS SOCIETÁRIAS & GOVERNANÇA */}
      {blindagemSubTab === 'biblioteca_minutas' && (() => {
        const filteredModels = CONTRACT_MATRIX_DATA.filter((m) => {
          const titleLower = m.title.toLowerCase();
          if (
            titleLower.includes('prestação de serviço do sistema para cliente') ||
            titleLower.includes('parceria comercial')
          ) {
            return false;
          }
          const matchesSearch =
            matrixSearch.trim() === '' ||
            m.title.toLowerCase().includes(matrixSearch.toLowerCase()) ||
            m.description.toLowerCase().includes(matrixSearch.toLowerCase()) ||
            m.vertical.toLowerCase().includes(matrixSearch.toLowerCase()) ||
            m.id.toLowerCase().includes(matrixSearch.toLowerCase());
          const matchesVertical =
            selectedMatrixVertical === 'all' || m.vertical === selectedMatrixVertical;
          return matchesSearch && matchesVertical;
        });

        return (
          <div className="space-y-4 animate-fadeIn">
            {/* SEARCH & FILTERS BAR */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nome da minuta, vertical ou código..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setSelectedMatrixVertical('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedMatrixVertical === 'all'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Todas as Verticais ({filteredModels.length})
                </button>

                {CONTRACT_VERTICALS.map((vert) => {
                  const count = CONTRACT_MATRIX_DATA.filter((m) => {
                    const titleLower = m.title.toLowerCase();
                    if (
                      titleLower.includes('prestação de serviço do sistema para cliente') ||
                      titleLower.includes('parceria comercial')
                    ) {
                      return false;
                    }
                    return m.vertical === vert;
                  }).length;

                  if (count === 0) return null;

                  return (
                    <button
                      key={vert}
                      type="button"
                      onClick={() => setSelectedMatrixVertical(vert)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                        selectedMatrixVertical === vert
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      <span>{vert}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MODELS LIST */}
            <div className="grid grid-cols-1 gap-4">
              {filteredModels.map((model) => {
                const isExpanded = expandedMatrixId === model.id;

                const dynamicDraft = model.boilerplateDraft
                  .replace(/{CONTRATANTE_NOME}/g, (nomeEmpresarial || 'VÉRTICE PARTICIPAÇÕES LTDA').toUpperCase())
                  .replace(/{CONTRATANTE_DOC}/g, currentCompany?.cnpj || '00.000.000/0001-00')
                  .replace(/{CONTRATADA_NOME}/g, 'PARTE QUALIFICADA / SÓCIO BENEFICIÁRIO')
                  .replace(/{CONTRATADA_DOC}/g, '11.222.333/0001-44')
                  .replace(/{FORO_CIDADE}/g, cidade || 'São Paulo')
                  .replace(/{FORO_UF}/g, ufEmpresa || 'SP')
                  .replace(/{DATA_EXTENSO}/g, new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }));

                return (
                  <div
                    key={model.id}
                    className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-orange-950/60 border border-orange-800/80 text-[10px] font-mono text-orange-400 font-bold">
                            {model.id}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                            {model.vertical}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100">{model.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{model.description}</p>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            handleDownloadMatrixPDF(model);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                          title="Baixar Minuta em PDF Oficial"
                        >
                          <Download className="w-3.5 h-3.5 text-orange-400" />
                          <span>Baixar PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAuditorDraftText(dynamicDraft);
                            setAuditorSelectedType(model.id);
                            setBlindagemSubTab('auditor_ia');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800/60 text-orange-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                          title="Carregar no Auditor IA"
                        >
                          <FileSearch className="w-3.5 h-3.5 text-orange-400" />
                          <span>Auditar IA</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedMatrixId(isExpanded ? null : model.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                            isExpanded
                              ? 'bg-orange-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <span>{isExpanded ? 'Recolher' : 'Visualizar Minuta'}</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* TRÍADE DE VALIDADE E RISCOS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800 text-[11px]">
                      <div className="bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                          1. Elementos Vitais
                        </span>
                        <p className="text-slate-300 line-clamp-2">
                          Preâmbulo, Objeto ({model.vitais.objeto}), Preço, Vigência e Foro.
                        </p>
                      </div>

                      <div className="bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          2. Validade (Art. 104 CC)
                        </span>
                        <p className="text-slate-300 line-clamp-2">
                          Agente Capaz, Objeto Lícito e Forma Prescrita/Não Proibida por Lei.
                        </p>
                      </div>

                      <div className="bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                          3. Matriz Multi-Esferas
                        </span>
                        <p className="text-slate-300 line-clamp-2">
                          Civil (Art. 478 CC), Compliance (Lei 13.874/19) e Proteção Tributária.
                        </p>
                      </div>
                    </div>

                    {/* PREVIEW EXPANSÍVEL DA MINUTA PREENCHIDA */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">
                            Minuta Formatada & Preenchimento em Tempo Real
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(dynamicDraft);
                                setCopiedMatrixId(model.id);
                                setTimeout(() => setCopiedMatrixId(null), 2000);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 transition flex items-center space-x-1 cursor-pointer"
                            >
                              {copiedMatrixId === model.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  <span>Copiar Minuta</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 max-h-80 overflow-y-auto">
                          <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {dynamicDraft}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* SUB-ABA 3: AUDITOR IA DE MINUTAS SOCIETÁRIAS & GOVERNANÇA EXPERT */}
      {blindagemSubTab === 'auditor_ia' && (
        <div className="space-y-6 animate-fadeIn">
          {/* HEADER DO AUDITOR EXPERT */}
          <div className="bg-gradient-to-r from-orange-950/70 via-slate-900 to-[#0F172A] border border-orange-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1.5 font-mono">
                    <FileSearch className="w-3.5 h-3.5" />
                    Auditor Jurídico IA Especialista
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    6 Pilares de Blindagem & STF / STJ
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Auditoria de Minutas Societárias & Blindagem Patrimonial
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                  Avalia a minuta contratual em conformidade estrita com o Art. 104 e Art. 50 do Código Civil, Lei da Liberdade Econômica nº 13.874/19, Tema 796 do STF (imunidade de ITBI), REsp 1.877.331/SP do STJ (Balanço de Determinação) e Instrução Normativa DREI 81/2020.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAudit}
                  disabled={isAuditing || !auditorDraftText.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-black text-xs transition shadow-lg shadow-orange-950/50 cursor-pointer flex items-center space-x-2 border border-orange-400/40"
                >
                  {isAuditing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Auditando 6 Pilares...</span>
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-4 h-4 text-orange-200" />
                      <span>Auditar Minuta Agora (0-100)</span>
                    </>
                  )}
                </button>

                {auditResult && (
                  <button
                    type="button"
                    onClick={handleDownloadAuditOpinionPDF}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center space-x-2 cursor-pointer shadow"
                    title="Baixar Parecer Técnico de Auditoria Jurídica em PDF"
                  >
                    <Download className="w-4 h-4 text-orange-400" />
                    <span>Baixar Parecer Técnico (PDF)</span>
                  </button>
                )}
              </div>
            </div>

            {/* SELEÇÃO RÁPIDA DE MINUTA E CARGA DE DADOS */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                  Modelo Base:
                </span>
                <select
                  value={auditorSelectedType}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setAuditorSelectedType(newId);
                    const found = CONTRACT_MATRIX_DATA.find((x) => x.id === newId);
                    if (found) {
                      const rendered = formatModelTemplate(found.boilerplateDraft);
                      setAuditorDraftText(rendered);
                      runAuditAnalysis(rendered, found);
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-medium max-w-xs md:max-w-md"
                >
                  {CONTRACT_MATRIX_DATA.filter((m) => {
                    const titleLower = m.title.toLowerCase();
                    return (
                      !titleLower.includes('prestação de serviço do sistema para cliente') &&
                      !titleLower.includes('parceria comercial')
                    );
                  }).map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.id} - {model.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const m = CONTRACT_MATRIX_DATA.find((x) => x.id === auditorSelectedType) || CONTRACT_MATRIX_DATA[0];
                    const rendered = formatModelTemplate(m.boilerplateDraft);
                    setAuditorDraftText(rendered);
                    runAuditAnalysis(rendered, m);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                  <span>Recarregar Modelo com Dados Ativos</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                <span>{auditorDraftText.length.toLocaleString('pt-BR')} caracteres</span>
                <span>•</span>
                <span>{auditorDraftText.trim().split(/\s+/).filter(Boolean).length.toLocaleString('pt-BR')} palavras</span>
              </div>
            </div>
          </div>

          {/* GRID PRINCIPAL: EDITOR À ESQUERDA & DIAGNÓSTICO AUDITOR À DIREITA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUNA ESQUERDA (7 colunas): EDITOR E INJETOR DE CLÁUSULAS */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>Redação da Minuta Societária / Acordo em Análise</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(auditorDraftText);
                        setToastMessage('Minuta copiada com sucesso para a área de transferência!');
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer transition"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copiar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([auditorDraftText], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Minuta_${auditorSelectedType || 'Societaria'}_Auditada.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                        setToastMessage('Arquivo de texto baixado com sucesso!');
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer transition"
                    >
                      <Download className="w-3 h-3 text-slate-400" />
                      <span>Baixar .TXT</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={20}
                    value={auditorDraftText}
                    onChange={(e) => {
                      setAuditorDraftText(e.target.value);
                    }}
                    placeholder="Cole aqui as cláusulas do contrato social, alteração contratual, acordo de sócios ou termo de usufruto para auditoria instantânea..."
                    className="w-full p-4 rounded-xl bg-[#090D16] border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 leading-relaxed shadow-inner transition resize-y"
                  />
                </div>

                {/* BARRA DE AÇÕES RÁPIDAS DE INJEÇÃO */}
                {auditResult && auditResult.issues && auditResult.issues.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-xs text-orange-200 font-semibold">
                        {auditResult.issues.length} vulnerabilidade(s) identificada(s) nesta minuta.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleInjectAllClauses}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer shrink-0 border border-orange-400/40"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-200" />
                      <span>Injetar Todas as Cláusulas Saneadoras</span>
                    </button>
                  </div>
                )}

                {/* PALETA DE INJEÇÃO AVULSA DE CLÁUSULAS DE ELITE */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Adicionar Cláusulas Estratégicas de Blindagem (Clique para Inserir no Contrato):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_AUTONOMIA_PATRIMONIAL')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">Art. 50 CC (Autonomia)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_INCOMUNICABILIDADE')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate">Art. 1.911 CC (Gravames)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_ITBI_INTEGRALIZACAO')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <Scale className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">Tema 796 STF (ITBI)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_BALANCO_DETERMINACAO')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">STJ REsp 1.877 (Haveres)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_DEADLOCK_SHOTGUN')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <Zap className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">Deadlock (Shotgun)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_REVERSAO_DOACAO')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">Art. 547 CC (Reversão)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_TITULO_RGI_ART64')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">Art. 64 L. 8.934 (RGI)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_ASSINATURA_DIGITAL')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="truncate">Art. 784 CPC (ICP-Brasil)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_NON_COMPETE')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <Lock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span className="truncate">Art. 1.147 CC (Não Concorrência)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_ADMINISTRACAO_VETO')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">DREI 81 (Veto & Gestão)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_GRUPO_ECONOMICO_CLT')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="truncate">Art. 2º CLT (Blindagem Trabalhista)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInjectClause('ISSUE_PREFERENCIA_TAG')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 cursor-pointer font-medium text-left"
                    >
                      <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">Art. 1.057 CC (Tag/Drag Along)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA (5 colunas): PAINEL DE DIAGNÓSTICO JURÍDICO EXPERT */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* SCORE & PARECER EXECUTIVO */}
              <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-orange-400" />
                    Índice de Segurança Jurídica & Blindagem Forense
                  </span>
                  {auditResult && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Auditado às {auditResult.timestamp}
                    </span>
                  )}
                </div>

                {auditResult ? (
                  <div className="space-y-4">
                    {/* PLACAR E CLASSIFICAÇÃO */}
                    <div className="bg-gradient-to-br from-slate-900 to-[#0B0F19] border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Classificação Global de Blindagem
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-1">
                          {auditResult.score}
                          <span className="text-sm font-bold text-slate-400">/ 100</span>
                        </div>
                        <div className="pt-1">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border ${
                              auditResult.score >= 85
                                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                                : auditResult.score >= 60
                                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                                : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                            }`}
                          >
                            {auditResult.rating}
                          </span>
                        </div>
                      </div>

                      {/* GAUGE CIRCULAR VISUAL */}
                      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className={
                              auditResult.score >= 85
                                ? 'text-emerald-500'
                                : auditResult.score >= 60
                                ? 'text-amber-500'
                                : 'text-rose-500'
                            }
                            strokeDasharray={`${auditResult.score}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-base font-black text-white font-mono">{auditResult.score}</span>
                          <span className="text-[10px] text-slate-400 font-bold block -mt-1">%</span>
                        </div>
                      </div>
                    </div>

                    {/* SÍNTESE DO DIAGNÓSTICO JURÍDICO */}
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-cyan-400" />
                          Síntese Pericial de Validade & Precedentes
                        </span>
                        <span>{auditResult.issues.length === 0 ? 'Sem ressalvas' : `${auditResult.issues.length} apontamento(s)`}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {auditResult.score >= 85
                          ? 'Minuta com blindagem no patamar dos Tribunais Superiores (STF/STJ). Apresenta conformidade com o Art. 104 e 50 do Código Civil, Lei da Liberdade Econômica e precedentes vinculantes de dissolução parcial e imunidade fiscal.'
                          : auditResult.score >= 60
                          ? 'Minuta em conformidade intermediária. Recomenda-se saneamento preventivo nos eixos de apuração de haveres (STJ REsp 1.877.331/SP), incomunicabilidade ampla com frutos civis e imunidade de ITBI conforme STF Tema 796.'
                          : 'Atenção Pericial Crítica: Apontamentos graves de vulnerabilidade a desconsideração da personalidade jurídica, meação em caso de divórcio, tributação indevida de ITBI ou anulação judicial de cláusulas de valuation.'}
                      </p>
                    </div>

                    {/* SELETOR DE VISÃO DO AUDITOR EXPERT */}
                    <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setAuditorViewMode('diagnostico')}
                        className={`py-2 px-1 rounded-lg transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                          auditorViewMode === 'diagnostico'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] leading-tight">8 Pilares</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditorViewMode('tribunais')}
                        className={`py-2 px-1 rounded-lg transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                          auditorViewMode === 'tribunais'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span className="text-[10px] leading-tight">Tribunais</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditorViewMode('vulnerabilidades')}
                        className={`py-2 px-1 rounded-lg transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                          auditorViewMode === 'vulnerabilidades'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span className="text-[10px] leading-tight">Falhas ({auditResult.issues.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditorViewMode('biblioteca')}
                        className={`py-2 px-1 rounded-lg transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                          auditorViewMode === 'biblioteca'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="text-[10px] leading-tight">Vade Mecum</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuditorViewMode('parecer_oficial')}
                        className={`py-2 px-1 rounded-lg transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                          auditorViewMode === 'parecer_oficial'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-[10px] leading-tight">Parecer</span>
                      </button>
                    </div>

                    {/* CONTEÚDO DA VISÃO 1: DIAGNÓSTICO & 8 PILARES */}
                    {auditorViewMode === 'diagnostico' && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* REQUISITOS DE VALIDADE DO NEGÓCIO JURÍDICO (ART. 104 CC) */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Requisitos de Validade Legal (Art. 104 do Código Civil)
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                            <div
                              className={`p-2 rounded-lg border text-center font-bold flex flex-col items-center justify-center gap-1 ${
                                auditResult.validityCheck.agenteCapaz
                                  ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
                                  : 'bg-rose-950/30 border-rose-700/60 text-rose-300'
                              }`}
                            >
                              <span className="text-xs">{auditResult.validityCheck.agenteCapaz ? '✓' : '✕'}</span>
                              <span>Agente Capaz</span>
                            </div>
                            <div
                              className={`p-2 rounded-lg border text-center font-bold flex flex-col items-center justify-center gap-1 ${
                                auditResult.validityCheck.objetoLicito
                                  ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
                                  : 'bg-rose-950/30 border-rose-700/60 text-rose-300'
                              }`}
                            >
                              <span className="text-xs">{auditResult.validityCheck.objetoLicito ? '✓' : '✕'}</span>
                              <span>Objeto Lícito</span>
                            </div>
                            <div
                              className={`p-2 rounded-lg border text-center font-bold flex flex-col items-center justify-center gap-1 ${
                                auditResult.validityCheck.formaPrescrita
                                  ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
                                  : 'bg-rose-950/30 border-rose-700/60 text-rose-300'
                              }`}
                            >
                              <span className="text-xs">{auditResult.validityCheck.formaPrescrita ? '✓' : '✕'}</span>
                              <span>Forma Prescrita</span>
                            </div>
                          </div>
                        </div>

                        {/* ELEMENTOS VITAIS IDENTIFICADOS */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Elementos Vitais Mapeados na Redação
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                            <div className={`p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-1.5 ${auditResult.vitalsCheck.preambulo ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              <span>{auditResult.vitalsCheck.preambulo ? '✓' : '✕'}</span>
                              <span>Preâmbulo & Qualificação</span>
                            </div>
                            <div className={`p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-1.5 ${auditResult.vitalsCheck.objeto ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              <span>{auditResult.vitalsCheck.objeto ? '✓' : '✕'}</span>
                              <span>Objeto & Atividades</span>
                            </div>
                            <div className={`p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-1.5 ${auditResult.vitalsCheck.preco ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              <span>{auditResult.vitalsCheck.preco ? '✓' : '✕'}</span>
                              <span>Capital & Quotas</span>
                            </div>
                            <div className={`p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-1.5 ${auditResult.vitalsCheck.vigencia ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              <span>{auditResult.vitalsCheck.vigencia ? '✓' : '✕'}</span>
                              <span>Prazo & Vigência</span>
                            </div>
                            <div className={`p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-1.5 ${auditResult.vitalsCheck.protecao ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              <span>{auditResult.vitalsCheck.protecao ? '✓' : '✕'}</span>
                              <span>Gravames & Proteção</span>
                            </div>
                            <div className={`p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center space-x-1.5 ${auditResult.vitalsCheck.foro ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                              <span>{auditResult.vitalsCheck.foro ? '✓' : '✕'}</span>
                              <span>Foro & Mediação</span>
                            </div>
                          </div>
                        </div>

                        {/* OS 8 PILARES ESTRATÉGICOS DA AUDITORIA FORENSE */}
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Conformidade nos 8 Eixos de Auditoria Forense:
                          </span>
                          <div className="space-y-2">
                            {auditResult.pillars.map((pillar) => (
                              <div
                                key={pillar.id}
                                className={`p-3 rounded-xl border text-xs transition space-y-1.5 ${
                                  pillar.status === 'conforme'
                                    ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                                    : 'bg-orange-950/20 border-orange-500/30 text-orange-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white flex items-center gap-1.5">
                                    {pillar.status === 'conforme' ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : (
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    )}
                                    {pillar.name}
                                  </span>
                                  <span className="font-mono text-[11px] font-bold text-slate-400">
                                    {pillar.score}/{pillar.maxScore} pts
                                  </span>
                                </div>

                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      pillar.status === 'conforme'
                                        ? 'bg-emerald-500'
                                        : pillar.score > 0
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${Math.round((pillar.score / pillar.maxScore) * 100)}%` }}
                                  />
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                                  <span className="font-mono text-cyan-300/80 truncate max-w-[200px]" title={pillar.legalRef}>
                                    {pillar.legalRef}
                                  </span>
                                  <span className={pillar.status === 'conforme' ? 'text-emerald-400 font-medium' : 'text-amber-400 font-bold'}>
                                    {pillar.status === 'conforme' ? 'Conforme' : 'Ajuste Necessário'}
                                  </span>
                                </div>

                                <p className="text-[10px] text-slate-400 leading-tight">
                                  <strong className="text-slate-300">Jurisprudência:</strong> {pillar.courtPrecedent}
                                </p>

                                {pillar.status !== 'conforme' && (
                                  <p className="text-[10px] text-amber-300/90 bg-amber-950/40 p-1.5 rounded border border-amber-900/50">
                                    <strong>Remediação:</strong> {pillar.recommendation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CONTEÚDO DA VISÃO 2: CONFRONTO COM OS TRIBUNAIS SUPERIORES */}
                    {auditorViewMode === 'tribunais' && (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <span className="text-[11px] font-bold text-orange-400 block mb-0.5">
                            Jurisprudência Vinculante & Precedentes Notórios
                          </span>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Confronto da redação contratual com as teses de repercussão geral do STF, precedentes repetitivos do STJ, instruções do DREI e precedentes trabalhistas do TST.
                          </p>
                        </div>

                        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                          {auditResult.courtBenchmarks.map((bench, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border text-xs space-y-2 ${
                                bench.isCompliant
                                  ? 'bg-slate-900/70 border-slate-800 text-slate-300'
                                  : 'bg-[#0B0F19] border-amber-500/40 text-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-1.5 py-0.5 rounded bg-orange-950/60 border border-orange-500/40 text-orange-300 font-mono text-[9px] font-bold">
                                      {bench.court}
                                    </span>
                                    <span className="font-bold text-white text-[11px]">
                                      {bench.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-cyan-300/90 font-mono block mt-0.5">
                                    {bench.precedentNumber}
                                  </span>
                                </div>

                                <span
                                  className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${
                                    bench.isCompliant
                                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                                      : 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                  }`}
                                >
                                  {bench.isCompliant ? 'Conforme' : 'Alerta'}
                                </span>
                              </div>

                              <p className="text-[10px] text-slate-300 leading-relaxed">
                                <strong className="text-slate-400">Tese Fixada:</strong> {bench.doctrine}
                              </p>

                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                <strong className="text-amber-400">Impacto na Minuta:</strong> {bench.riskEvaluation}
                              </p>

                              {!bench.isCompliant && (
                                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                                  <span className="text-[9px] text-slate-400 truncate">
                                    {bench.correctiveAction}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleInjectAllClauses}
                                    className="px-2 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-[9px] transition shrink-0 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Zap className="w-2.5 h-2.5" />
                                    <span>Sanar</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CONTEÚDO DA VISÃO 3: VULNERABILIDADES & APONTAMENTOS PERICIAIS */}
                    {auditorViewMode === 'vulnerabilidades' && (
                      <div className="space-y-3 animate-fadeIn">
                        {/* FILTROS DE SEVERIDADE */}
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {(['all', 'Crítico', 'Alto', 'Moderado', 'Preventivo'] as const).map((sev) => {
                            const count = sev === 'all' 
                              ? auditResult.issues.length 
                              : auditResult.issues.filter((iss) => iss.severity === sev).length;
                            return (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => setIssueSeverityFilter(sev)}
                                className={`px-2 py-1 rounded-lg transition font-bold cursor-pointer ${
                                  issueSeverityFilter === sev
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                }`}
                              >
                                {sev === 'all' ? 'Todos' : sev} ({count})
                              </button>
                            );
                          })}
                        </div>

                        {auditResult.issues.length === 0 ? (
                          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 text-center space-y-1">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                            <p className="text-xs font-bold text-emerald-300">
                              Nenhuma vulnerabilidade crítica ou moderada detectada!
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Esta minuta contratual atende aos parâmetros mais rigorosos da doutrina societária e da jurisprudência dos Tribunais.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                            {auditResult.issues
                              .filter((iss) => issueSeverityFilter === 'all' || iss.severity === issueSeverityFilter)
                              .map((issue) => (
                                <div
                                  key={issue.code}
                                  className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2 text-xs"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                                      <span
                                        className={`w-2 h-2 rounded-full shrink-0 ${
                                          issue.severity === 'Crítico'
                                            ? 'bg-rose-500'
                                            : issue.severity === 'Alto'
                                            ? 'bg-amber-500'
                                            : issue.severity === 'Moderado'
                                            ? 'bg-blue-500'
                                            : 'bg-emerald-500'
                                        }`}
                                      />
                                      {issue.title}
                                    </span>
                                    <span
                                      className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${
                                        issue.severity === 'Crítico'
                                          ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                                          : issue.severity === 'Alto'
                                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                                          : issue.severity === 'Moderado'
                                          ? 'bg-blue-950/60 text-blue-300 border border-blue-800'
                                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                                      }`}
                                    >
                                      {issue.severity}
                                    </span>
                                  </div>

                                  <div className="text-[10px] text-cyan-300/90 font-mono flex items-center gap-1">
                                    <Scale className="w-3 h-3 text-cyan-400 shrink-0" />
                                    <span>{issue.legalBase}</span>
                                  </div>

                                  <p className="text-[10px] text-slate-400 leading-relaxed">
                                    <strong className="text-slate-300">Fundamentação:</strong> {issue.reason}
                                  </p>

                                  <p className="text-[10px] text-amber-400 leading-relaxed bg-amber-950/30 p-2 rounded border border-amber-900/40">
                                    <strong>Risco Prático Forense:</strong> {issue.practicalRisk}
                                  </p>

                                  <div className="pt-1 flex items-center justify-between border-t border-slate-800/60 gap-2">
                                    <span className="text-[9px] text-slate-500 truncate">
                                      {issue.clauseFixTitle}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleInjectClause(issue.clauseFix)}
                                      className="px-2.5 py-1 rounded-lg bg-orange-600/90 hover:bg-orange-500 text-white font-bold text-[10px] transition flex items-center space-x-1 cursor-pointer shadow-sm shrink-0"
                                    >
                                      <Zap className="w-3 h-3 text-amber-200" />
                                      <span>Injetar Cláusula</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CONTEÚDO DA VISÃO 4: VADE MECUM DE CLÁUSULAS DE ELITE */}
                    {auditorViewMode === 'biblioteca' && (
                      <div className="space-y-3 animate-fadeIn">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <span className="text-[11px] font-bold text-orange-400 block mb-0.5">
                            Vade Mecum Societário: Cláusulas de Elite
                          </span>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            Acervo de cláusulas redigidas com técnica pericial para inserção imediata, fundamentadas no Código Civil, CPC, Leis Especiais e precedentes dos Tribunais.
                          </p>
                        </div>

                        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                          {Object.entries(ELITE_AUDIT_CLAUSES).map(([key, clause]) => (
                            <div
                              key={key}
                              className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2 text-xs"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-bold text-white text-[11px] block">
                                    {clause.title}
                                  </span>
                                  <span className="text-[9px] font-mono text-orange-300">
                                    {clause.badge}
                                  </span>
                                </div>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                  Padrão Tribunais
                                </span>
                              </div>

                              <div className="text-[10px] text-cyan-300/90 font-mono">
                                {clause.legalBase}
                              </div>

                              <div className="p-2 rounded bg-black/50 border border-slate-900 font-mono text-[10px] text-slate-300 max-h-28 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                {clause.text}
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(clause.text);
                                    setToastMessage("Cláusula copiada para a área de transferência!");
                                    setTimeout(() => setToastMessage(null), 2500);
                                  }}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  <span>Copiar</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleInjectClause(clause.text)}
                                  className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Zap className="w-3 h-3 text-amber-200" />
                                  <span>Injetar no Contrato</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CONTEÚDO DA VISÃO 5: PARECER JURÍDICO OFICIAL PERICIAL */}
                    {auditorViewMode === 'parecer_oficial' && (
                      <div className="space-y-4 animate-fadeIn">
                        <FormalLegalOpinionReport 
                          auditData={auditResult} 
                          companyName={nomeEmpresarial || currentCompany?.name || 'Sociedade'}
                          cnpj={currentCompany?.cnpj || '00.000.000/0001-00'}
                          onApplyQuickFix={(issue) => handleInjectClause(issue.clauseFix)}
                        />
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <FileSearch className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 font-medium">
                      Clique em "Auditar Minuta Agora" para processar o diagnóstico forense em tempo real.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

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
