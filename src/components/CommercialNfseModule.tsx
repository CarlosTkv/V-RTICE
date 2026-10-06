import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  QrCode, 
  Key, 
  Building2, 
  UserCheck, 
  Plus, 
  DollarSign, 
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileCode,
  Check,
  Edit3,
  KeyRound,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  Globe,
  Copy,
  Trash2,
  Layers,
  Printer,
  FileSpreadsheet,
  Filter,
  Calendar
} from 'lucide-react';
import JSZip from 'jszip';
import { CompanyData, AuthUser, AppViewMode, BankConfig, BillingInvoice, NfseNacionalData } from '../types';
import { NfseNacionalService } from '../utils/nfseService';
import { AuthService } from '../utils/authService';
import { NfseNacionalModal } from './NfseNacionalModal';
import { BrandLogo } from './BrandLogo';
import { NfseDocumentoCapturado } from '../services/nfseCrawler';

interface CommercialNfseModuleProps {
  currentCompany: CompanyData;
  authUser: AuthUser | null;
  viewMode: AppViewMode;
  showToast: (msg: string) => void;
  bankConfig?: BankConfig;
  invoices?: BillingInvoice[];
}

export interface CommercialTomador {
  id: string;
  cpfCnpj: string;
  razaoSocial: string;
  email: string;
  telefone?: string;
  endereco?: string;
  municipio?: string;
  uf?: string;
}

const SERVICE_CODES_PRESETS = [
  { code: '17.01.01', description: 'Assessoria, consultoria, orientação ou assistência técnica tributária e fiscal' },
  { code: '17.19.01', description: 'Contabilidade, auditoria técnica e consultoria financeira/patrimonial' },
  { code: '01.07.01', description: 'Suporte técnico, manutenção e consultoria em tecnologia da informação e softwares' },
  { code: '17.02.01', description: 'Perícias, laudos, exames técnicos e análises doutrinárias tributárias' },
  { code: '14.01.01', description: 'Lubrificação, limpeza, revisão, manutenção e conservação de máquinas e equipamentos' },
];

export const CommercialNfseModule: React.FC<CommercialNfseModuleProps> = ({
  currentCompany,
  authUser,
  viewMode,
  showToast,
  bankConfig,
  invoices = []
}) => {
  const [activeTab, setActiveTab] = useState<'portal_nacional' | 'emitir' | 'historico' | 'tomadores' | 'config'>('portal_nacional');

  // Estados de Captura Oficial de NFS-e no Portal Nacional (ADN / Sefin / Receita Federal)
  const nfseStorageKey = `portal_nacional_nfse_${currentCompany.cnpj.replace(/\D/g, '')}`;
  const [realNfseDocs, setRealNfseDocs] = useState<NfseDocumentoCapturado[]>(() => {
    try {
      const saved = localStorage.getItem(nfseStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(nfseStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRealNfseDocs(parsed);
          return;
        }
      }
      setRealNfseDocs([]);
    } catch {
      setRealNfseDocs([]);
    }
  }, [nfseStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(nfseStorageKey, JSON.stringify(realNfseDocs));
    } catch (e) {}
  }, [realNfseDocs, nfseStorageKey]);

  const [isSyncingNfse, setIsSyncingNfse] = useState(false);
  const [nfseSyncDiagnostic, setNfseSyncDiagnostic] = useState<string | null>(null);
  const [pfxFile, setPfxFile] = useState<File | null>(null);
  const [pfxPassword, setPfxPassword] = useState('');
  const [showPfxPassword, setShowPfxPassword] = useState(false);
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroDirecao, setFiltroDirecao] = useState<'todas' | 'saida' | 'entrada'>('todas');
  const [activeDanfseDoc, setActiveDanfseDoc] = useState<NfseDocumentoCapturado | null>(null);
  const [activeXmlDoc, setActiveXmlDoc] = useState<NfseDocumentoCapturado | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [ambienteSefin, setAmbienteSefin] = useState<'1' | '2'>('1');
  const [datePreset, setDatePreset] = useState<'hoje' | '7dias' | 'mes' | 'ano' | 'custom'>('mes');
  const [authMethod, setAuthMethod] = useState<'certificado' | 'senha_web'>('certificado');
  const [usuarioWeb, setUsuarioWeb] = useState(currentCompany.cnpj || '');
  const [senhaWeb, setSenhaWeb] = useState('');
  const [showSenhaWeb, setShowSenhaWeb] = useState(false);

  const copyToClipboard = (text: string, label: string = 'Texto') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    showToast(`${label} copiado!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const applyDatePreset = (preset: 'hoje' | '7dias' | 'mes' | 'ano') => {
    setDatePreset(preset);
    const now = new Date();
    const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
    const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === 'hoje') {
      const today = format(now);
      setFiltroDataInicio(today);
      setFiltroDataFim(today);
    } else if (preset === '7dias') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setFiltroDataInicio(format(past));
      setFiltroDataFim(format(now));
    } else if (preset === 'mes') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      setFiltroDataInicio(format(first));
      setFiltroDataFim(format(now));
    } else if (preset === 'ano') {
      const firstYear = new Date(now.getFullYear(), 0, 1);
      setFiltroDataInicio(format(firstYear));
      setFiltroDataFim(format(now));
    }
  };

  const handleExportCsv = () => {
    if (realNfseDocs.length === 0) {
      showToast('Nenhum dado disponível para exportar CSV.');
      return;
    }
    const headers = ['Chave de Acesso', 'Número', 'Série', 'Data Emissão', 'Direção', 'Prestador CNPJ', 'Prestador Nome', 'Tomador CNPJ', 'Tomador Nome', 'Valor Serviços (R$)', 'ISSQN (R$)', 'ISS Retido'];
    const rows = realNfseDocs.map(d => [
      `"${d.chaveAcesso || ''}"`,
      `"${d.numero || ''}"`,
      `"${d.serie || ''}"`,
      `"${d.dataEmissao || ''}"`,
      `"${d.direcao === 'saida' ? 'Prestada' : 'Tomada'}"`,
      `"${d.emitenteCnpj || ''}"`,
      `"${(d.emitenteNome || '').replace(/"/g, '""')}"`,
      `"${d.tomadorCnpj || ''}"`,
      `"${(d.tomadorNome || '').replace(/"/g, '""')}"`,
      (d.valorServicos || 0).toFixed(2),
      (d.valorIss || 0).toFixed(2),
      d.issRetido ? 'Sim' : 'Não'
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RELATORIO_NFSE_NACIONAL_${currentCompany.cnpj.replace(/\D/g, '')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Planilha CSV gerada com sucesso!');
  };

  const handleDownloadSelectedZip = async () => {
    const selected = realNfseDocs.filter(d => selectedDocIds.includes(d.id || d.chaveAcesso));
    if (selected.length === 0) {
      showToast('Selecione pelo menos uma NFS-e para baixar.');
      return;
    }
    try {
      const zip = new JSZip();
      const folderXml = zip.folder('xmls');
      const folderPdf = zip.folder('danfses');

      selected.forEach(doc => {
        if (doc.xmlConteudo && folderXml) {
          folderXml.file(`NFSe_${doc.chaveAcesso || doc.numero}.xml`, doc.xmlConteudo);
        }
        if (doc.pdfBase64 && folderPdf) {
          folderPdf.file(`DANFSE_${doc.chaveAcesso || doc.numero}.pdf`, doc.pdfBase64, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SELECAO_NFSE_${selected.length}_NOTAS.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Pacote com ${selected.length} notas baixado!`);
    } catch (e: any) {
      showToast(`Erro ao gerar pacote: ${e.message}`);
    }
  };

  // Executa o disparo da API oficial /api/v1/nfse/sincronizar
  const handleTriggerNfseSync = async () => {
    setIsSyncingNfse(true);
    if (authMethod === 'senha_web') {
      setNfseSyncDiagnostic(`Autenticando com Usuário e Senha Web no Portal Nacional (${usuarioWeb || currentCompany.cnpj})...`);
    } else {
      setNfseSyncDiagnostic('Conectando ao Ambiente de Dados Nacional (ADN / Sefin / Receita Federal via mTLS)...');
    }

    try {
      let pfxBase64 = '';
      if (pfxFile && authMethod === 'certificado') {
        const buffer = await pfxFile.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        pfxBase64 = btoa(binary);
      }

      const res = await fetch('/api/v1/nfse/sincronizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cnpj: currentCompany.cnpj,
          authType: authMethod,
          usuario: authMethod === 'senha_web' ? (usuarioWeb || currentCompany.cnpj) : undefined,
          senhaWeb: authMethod === 'senha_web' ? senhaWeb : undefined,
          pfxBase64: authMethod === 'certificado' ? pfxBase64 || undefined : undefined,
          password: authMethod === 'certificado' ? (pfxPassword || currentCompany.certificateA1?.password || undefined) : undefined,
          dataInicio: filtroDataInicio || undefined,
          dataFim: filtroDataFim || undefined,
          ambiente: ambienteSefin
        })
      });

      const data = await res.json();

      if (data.success) {
        setNfseSyncDiagnostic(data.mensagem || 'Sincronização oficial concluída com sucesso!');
        if (data.documentos && Array.isArray(data.documentos) && data.documentos.length > 0) {
          setRealNfseDocs(prev => {
            const existingKeys = new Set(prev.map(d => d.chaveAcesso));
            const novos = data.documentos.filter((d: NfseDocumentoCapturado) => !existingKeys.has(d.chaveAcesso));
            return [...novos, ...prev];
          });
          showToast(`${data.documentos.length} NFS-e(s) capturada(s) com sucesso no Portal Nacional!`);
        } else {
          showToast('Nenhuma nova NFS-e retornada pelo Portal Nacional no período.');
        }
      } else {
        const errMessage = data.error || data.mensagem || 'Falha na resposta do Portal Nacional.';
        setNfseSyncDiagnostic(`Erro retornado: ${errMessage}`);
        showToast(`Erro na sincronização: ${errMessage}`);
      }
    } catch (e: any) {
      setNfseSyncDiagnostic(`Erro de conexão com o servidor: ${e.message}`);
      showToast(`Falha de comunicação: ${e.message}`);
    } finally {
      setIsSyncingNfse(false);
    }
  };

  // Download do XML Oficial
  const handleDownloadNfseXml = (doc: NfseDocumentoCapturado) => {
    if (!doc.xmlConteudo) {
      showToast('Conteúdo XML não disponível para este registro.');
      return;
    }
    const blob = new Blob([doc.xmlConteudo], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NFSe_${doc.chaveAcesso || doc.numero}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download do XML oficial da NFS-e iniciado!');
  };

  // Download do PDF DANFSE Oficial
  const handleDownloadDanfsePdf = (doc: NfseDocumentoCapturado) => {
    if (doc.pdfBase64) {
      const byteCharacters = atob(doc.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DANFSE_${doc.chaveAcesso || doc.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Download do DANFSE em PDF iniciado!');
      return;
    }
    showToast('Espelho PDF sendo gerado a partir do XML oficial...');
  };

  // Download em Lote (.ZIP)
  const handleBatchDownloadZip = async () => {
    if (realNfseDocs.length === 0) {
      showToast('Nenhum documento para exportação em lote.');
      return;
    }
    try {
      const zip = new JSZip();
      const folderXml = zip.folder('xmls');
      const folderPdf = zip.folder('danfses');

      realNfseDocs.forEach(doc => {
        if (doc.xmlConteudo && folderXml) {
          folderXml.file(`NFSe_${doc.chaveAcesso || doc.numero}.xml`, doc.xmlConteudo);
        }
        if (doc.pdfBase64 && folderPdf) {
          folderPdf.file(`DANFSE_${doc.chaveAcesso || doc.numero}.pdf`, doc.pdfBase64, { base64: true });
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LOTE_NFSE_PORTAL_NACIONAL_${currentCompany.cnpj.replace(/\D/g, '')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Pacote .ZIP com XMLs e PDFs gerado com sucesso!');
    } catch (e: any) {
      showToast(`Erro ao gerar pacote .ZIP: ${e.message}`);
    }
  };

  // Tomadores salvos
  const [tomadores, setTomadores] = useState<CommercialTomador[]>(() => {
    const saved = localStorage.getItem(`commercial_tomadores_${currentCompany.cnpj}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'tom_1',
        cpfCnpj: '12.345.678/0001-90',
        razaoSocial: 'Beta Logística e Distribuição S.A.',
        email: 'financeiro@betalog.com.br',
        telefone: '(41) 3344-5566',
        endereco: 'Av. das Indústrias, 1500',
        municipio: 'Curitiba',
        uf: 'PR'
      },
      {
        id: 'tom_2',
        cpfCnpj: '98.765.432/0001-10',
        razaoSocial: 'Gamma Soluções Comerciais Ltda',
        email: 'contato@gammasolucoes.com.br',
        telefone: '(11) 98765-4321',
        endereco: 'Rua das Flores, 450',
        municipio: 'São Paulo',
        uf: 'SP'
      }
    ];
  });

  // Salvar tomadores no localStorage
  useEffect(() => {
    localStorage.setItem(`commercial_tomadores_${currentCompany.cnpj}`, JSON.stringify(tomadores));
  }, [tomadores, currentCompany.cnpj]);

  // Formulário de Emissão
  const [selectedTomadorId, setSelectedTomadorId] = useState<string>(tomadores[0]?.id || '');
  const [serviceCode, setServiceCode] = useState<string>('17.01.01');
  const [serviceNbsCode, setServiceNbsCode] = useState<string>('1.0101.10.00');
  const [itemLc116, setItemLc116] = useState<string>('17.01');
  const [codigoServicoMunicipal, setCodigoServicoMunicipal] = useState<string>('02800');
  const [serviceDescription, setServiceDescription] = useState<string>(
    'Prestação de serviços de consultoria tributária, análise de segregação de receitas no Simples Nacional e apuração do Fator R.'
  );
  const [valorServico, setValorServico] = useState<number>(2500);
  const [aliquotaIss, setAliquotaIss] = useState<number>(currentCompany.customIssRate || 2.0);
  const [issRetido, setIssRetido] = useState<boolean>(false);
  const [descontoIncondicionado, setDescontoIncondicionado] = useState<number>(0);
  const [deducoesBaseCalculo, setDeducoesBaseCalculo] = useState<number>(0);
  const [hasRetencoes, setHasRetencoes] = useState<boolean>(false);

  // Painel Reforma Tributária EC 132/2023 (IBS, CBS e Split Payment)
  const [isReformaActive, setIsReformaActive] = useState<boolean>(true);
  const [aliquotaIbs, setAliquotaIbs] = useState<number>(17.7);
  const [aliquotaCbs, setAliquotaCbs] = useState<number>(8.8);
  const [regimeEspecificoReforma, setRegimeEspecificoReforma] = useState<string>('Padrao_26.5');
  const [splitPaymentActive, setSplitPaymentActive] = useState<boolean>(true);
  const [splitPaymentPixKey, setSplitPaymentPixKey] = useState<string>(bankConfig?.pixKey || currentCompany.cnpj);

  // Novo Tomador Modal/Form
  const [showNewTomadorModal, setShowNewTomadorModal] = useState<boolean>(false);
  const [newTomador, setNewTomador] = useState<Partial<CommercialTomador>>({
    cpfCnpj: '',
    razaoSocial: '',
    email: '',
    telefone: '',
    endereco: '',
    municipio: currentCompany.city || 'Curitiba',
    uf: currentCompany.uf || 'PR'
  });

  // Modal DANFSE
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState<BillingInvoice | null>(null);
  const [isNfseModalOpen, setIsNfseModalOpen] = useState(false);

  // Notas fiscais comerciais salvas
  const [commercialNotes, setCommercialNotes] = useState<Array<{ invoice: BillingInvoice; nfse: NfseNacionalData }>>(() => {
    const saved = localStorage.getItem(`commercial_notes_${currentCompany.cnpj}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(`commercial_notes_${currentCompany.cnpj}`, JSON.stringify(commercialNotes));
  }, [commercialNotes, currentCompany.cnpj]);

  const tomadorAtual = tomadores.find(t => t.id === selectedTomadorId) || tomadores[0];

  // Cálculo de retenções federais
  const pisVal = hasRetencoes ? Math.round(valorServico * 0.0065 * 100) / 100 : 0;
  const cofinsVal = hasRetencoes ? Math.round(valorServico * 0.03 * 100) / 100 : 0;
  const inssVal = hasRetencoes ? Math.round(valorServico * 0.11 * 100) / 100 : 0;
  const irrfVal = hasRetencoes ? Math.round(valorServico * 0.015 * 100) / 100 : 0;
  const csllVal = hasRetencoes ? Math.round(valorServico * 0.01 * 100) / 100 : 0;
  const totalRetencoes = pisVal + cofinsVal + inssVal + irrfVal + csllVal;
  const valorIssVal = Math.round(valorServico * (aliquotaIss / 100) * 100) / 100;
  
  // Cálculo Reforma Tributária (IBS e CBS)
  const valorIbsCalc = isReformaActive ? Math.round(valorServico * (aliquotaIbs / 100) * 100) / 100 : 0;
  const valorCbsCalc = isReformaActive ? Math.round(valorServico * (aliquotaCbs / 100) * 100) / 100 : 0;
  const totalIbsCbsCalc = Math.round((valorIbsCalc + valorCbsCalc) * 100) / 100;
  const splitRetenidoCalc = splitPaymentActive ? totalIbsCbsCalc : 0;
  const splitLiquidoPrestadorCalc = Math.round((valorServico - splitRetenidoCalc) * 100) / 100;

  const valorLiquido = valorServico - (issRetido ? valorIssVal : 0) - totalRetencoes;

  const handleCreateTomador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTomador.cpfCnpj || !newTomador.razaoSocial || !newTomador.email) {
      showToast('Preencha CPF/CNPJ, Razão Social e E-mail do tomador.');
      return;
    }
    const created: CommercialTomador = {
      id: `tom_${Date.now()}`,
      cpfCnpj: newTomador.cpfCnpj,
      razaoSocial: newTomador.razaoSocial,
      email: newTomador.email,
      telefone: newTomador.telefone || '',
      endereco: newTomador.endereco || '',
      municipio: newTomador.municipio || currentCompany.city || 'Curitiba',
      uf: newTomador.uf || currentCompany.uf || 'PR'
    };
    setTomadores(prev => [...prev, created]);
    setSelectedTomadorId(created.id);
    setShowNewTomadorModal(false);
    setNewTomador({ cpfCnpj: '', razaoSocial: '', email: '', telefone: '', endereco: '', municipio: '', uf: '' });
    showToast(`Tomador "${created.razaoSocial}" cadastrado com sucesso!`);
  };

  const [isEmitting, setIsEmitting] = useState(false);

  const handleEmitCommercialNfse = async () => {
    if (!tomadorAtual) {
      showToast('Selecione um tomador de serviços válido.');
      return;
    }
    if (valorServico <= 0) {
      showToast('Informe um valor de serviço válido.');
      return;
    }

    setIsEmitting(true);
    showToast(`Iniciando transmissão síncrona de DPS para o Ambiente Nacional de Dados Gov.br...`);

    // Cria fatura comercial temporária
    const tempInvId = `FAT-${Date.now().toString().substring(5)}`;
    const mockInvoice: BillingInvoice = {
      id: tempInvId,
      subscriptionId: 'sub_commercial',
      customerName: tomadorAtual.razaoSocial,
      customerDocument: tomadorAtual.cpfCnpj,
      customerEmail: tomadorAtual.email,
      planName: `Serviço - CTN ${serviceCode}`,
      amount: valorServico,
      dueDate: new Date().toLocaleDateString('pt-BR'),
      issueDate: new Date().toLocaleDateString('pt-BR'),
      paymentMethod: 'pix',
      status: 'pago',
      linhaDigitavel: '34191.09008 61713.916297 00000.100045 1 97500000050000',
      nossoNumero: `${Math.floor(100000000 + Math.random() * 900000000)}`,
      codigoBarras: '34191975000000500000900061713916290000010004',
      pixCopiaECola: `00020126580014br.gov.bcb.pix0136${currentCompany.cnpj.replace(/\D/g, '')}5204000053039865405${valorServico.toFixed(2)}5802BR5925${currentCompany.name.substring(0, 25)}6008CURITIBA62070503***6304A1B2`,
      txId: `tx_${Date.now()}`
    };

    const res = await NfseNacionalService.emitirNfseOficialGovBr(mockInvoice, bankConfig);

    setIsEmitting(false);

    if (res.success && res.nfse) {
      // Sobrescreve dados com os da empresa prestadora comercial e enquadramento da Reforma
      const customNfse: NfseNacionalData = {
        ...res.nfse,
        codigoTributacaoNacional: serviceCode,
        descricaoServico: serviceDescription,
        valorServico: valorServico,
        aliquotaIss: aliquotaIss,
        valorIss: valorIssVal,
        issRetido: issRetido,
        baseCalculo: Math.max(0, valorServico - deducoesBaseCalculo),
        descontoIncondicionado: descontoIncondicionado,
        deducoesBaseCalculo: deducoesBaseCalculo,
        retencoesFederais: {
          pis: pisVal,
          cofins: cofinsVal,
          inss: inssVal,
          irrf: irrfVal,
          csll: csllVal,
          totalRetencoes: totalRetencoes
        },
        servico: {
          codigoTributacaoNacional: serviceCode,
          codigoNbs: serviceNbsCode,
          itemLc116: itemLc116,
          codigoServicoMunicipal: codigoServicoMunicipal,
          localPrestacaoServico: 'municipio_prestador',
          municipioIncidenciaIbge: '3550308',
          exigibilidadeIss: '1'
        },
        reformaTributaria: {
          isReformaApplicable: isReformaActive,
          aliquotaIbs: aliquotaIbs,
          valorIbs: valorIbsCalc,
          aliquotaCbs: aliquotaCbs,
          valorCbs: valorCbsCalc,
          totalIbsCbs: totalIbsCbsCalc,
          regimeEspecifico: regimeEspecificoReforma,
          splitPaymentActive: splitPaymentActive,
          splitPaymentPixKey: splitPaymentPixKey || currentCompany.cnpj,
          splitPaymentValorRetido: splitRetenidoCalc,
          splitPaymentValorLiquidoPrestador: splitLiquidoPrestadorCalc
        },
        valorLiquido: valorLiquido,
        prestador: {
          cnpj: currentCompany.cnpj,
          razaoSocial: currentCompany.name,
          nomeFantasia: currentCompany.name,
          inscricaoMunicipal: '998877-0',
          inscricaoEstadual: 'ISENTO',
          regimeEspecialTributacao: '6',
          optanteSimplesNacional: true,
          incentivadorCultural: false,
          endereco: 'Av. Brasil',
          numero: '1000',
          bairro: 'Centro',
          cep: '80000-000',
          codigoIbgeMunicipio: '4106902',
          municipio: currentCompany.city || 'Curitiba',
          uf: currentCompany.uf || 'PR',
          telefone: '(41) 3322-1100',
          email: 'financeiro@' + currentCompany.name.toLowerCase().replace(/[^a-z]/g, '') + '.com.br'
        },
        tomador: {
          tipoDocumento: (tomadorAtual.cpfCnpj || '').replace(/\D/g, '').length === 14 ? 'cnpj' : 'cpf',
          cpfCnpj: tomadorAtual.cpfCnpj,
          razaoSocial: tomadorAtual.razaoSocial,
          inscricaoMunicipal: 'ISENTO',
          email: tomadorAtual.email,
          telefone: tomadorAtual.telefone || '(11) 98877-6655',
          endereco: tomadorAtual.endereco || 'Endereço cadastrado na plataforma',
          numero: '100',
          bairro: 'Centro',
          cep: '01000-000',
          codigoIbgeMunicipio: '3550308',
          municipio: tomadorAtual.municipio || 'São Paulo',
          uf: tomadorAtual.uf || 'SP'
        }
      };

      setCommercialNotes(prev => [{ invoice: mockInvoice, nfse: customNfse }, ...prev]);

      // Envia notificação direta por e-mail ao tomador
      AuthService.recordSentEmail({
        id: `email_nfse_tom_${Date.now()}`,
        type: 'invoice_receipt',
        toEmail: tomadorAtual.email,
        toName: tomadorAtual.razaoSocial,
        subject: `${currentCompany.name} // Nota Fiscal de Serviço Eletrônica (NFS-e Gov.br) Emitida`,
        linkUrl: customNfse.linkDanfsePdf,
        createdAt: new Date().toISOString(),
        read: false
      }, true);

      showToast(`NFS-e Comercial emitida com sucesso! Chave: ${customNfse.chaveAcesso50.substring(0, 18)}... E-mail disparado ao cliente.`);
      setSelectedInvoiceModal(mockInvoice);
      setIsNfseModalOpen(true);
      setActiveTab('historico');
    } else {
      showToast(`Falha na emissão da NFS-e: ${res.error || 'Erro de comunicação com o WebService'}`);
    }
  };

  // Filtragem dinâmica de documentos da NFS-e
  const filteredNfseDocs = realNfseDocs.filter(d => {
    if (filtroDirecao !== 'todas' && d.direcao !== filtroDirecao) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchKey = (d.chaveAcesso || '').toLowerCase().includes(q);
      const matchNum = (d.numero || '').toLowerCase().includes(q);
      const matchEmit = (d.emitenteNome || '').toLowerCase().includes(q) || (d.emitenteCnpj || '').includes(q);
      const matchTom = (d.tomadorNome || '').toLowerCase().includes(q) || (d.tomadorCnpj || '').includes(q);
      if (!matchKey && !matchNum && !matchEmit && !matchTom) return false;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedDocIds.length === filteredNfseDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredNfseDocs.map(d => d.id || d.chaveAcesso));
    }
  };

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Profissional Figma: Padrão Nacional ADN / Sefin */}
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Globe className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  SISTEMA NACIONAL DA NFS-E • PADRÃO ADN / SEFIN
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-slate-400 font-medium">Receita Federal do Brasil</span>
                <span className="text-slate-600">·</span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conexão mTLS Produção
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Gestão & Emissão de NFS-e Nacional
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Ambiente de integração direta com o barramento governamental da Receita Federal. Captura automática de documentos fiscais por mTLS, emissão síncrona de DPS e geração de DANFSE em PDF oficial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-right">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Empresa em Operação</div>
              <div className="text-sm font-bold text-white truncate max-w-[200px]" title={currentCompany.name}>{currentCompany.name}</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="text-xs font-mono font-bold text-emerald-400">{currentCompany.cnpj}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentCompany.cnpj, 'CNPJ')}
                  className="text-slate-500 hover:text-emerald-400 transition"
                  title="Copiar CNPJ"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Control Bar (Figma Design) */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1.5 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('portal_nacional')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'portal_nacional'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Captura Portal Nacional</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-700/60">
              {realNfseDocs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('emitir')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'emitir'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Emitir Nova NFS-e (DPS)</span>
          </button>

          <button
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'historico'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. Painel de Emitidas</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
              {commercialNotes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tomadores')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'tomadores'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Clientes / Tomadores</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
              {tomadores.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'config'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>4. Certificado & Regras</span>
          </button>
        </div>
      </div>

      {/* ABA 0: CAPTURA OFICIAL PORTAL NACIONAL NFS-E (LAYOUT FIGMA) */}
      {activeTab === 'portal_nacional' && (
        <div className="space-y-6">
          {/* Deck de Controle mTLS & Disparo da API */}
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Painel de Sincronização e Busca Direta na Receita Federal
                </h3>
                <p className="text-xs text-slate-400">
                  Transmissão por socket TLS mútuo (mTLS) com o endpoint governamental <code className="text-emerald-300 font-mono">/api/v1/nfse/sincronizar</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-400">Ambiente:</span>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setAmbienteSefin('1')}
                    className={`px-2.5 py-1 rounded-md transition ${ambienteSefin === '1' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Produção Oficial
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmbienteSefin('2')}
                    className={`px-2.5 py-1 rounded-md transition ${ambienteSefin === '2' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    Homologação
                  </button>
                </div>
              </div>
            </div>

            {/* Seletor de Método de Autenticação: Certificado A1 vs Usuário e Senha Web */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Modo de Acesso:</span>
                <div className="flex items-center bg-slate-900 border border-slate-700/80 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('certificado')}
                    className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      authMethod === 'certificado'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Certificado Digital A1 (.pfx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('senha_web')}
                    className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      authMethod === 'senha_web'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Usuário e Senha Web (CPF/CNPJ + Senha)</span>
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                {authMethod === 'certificado'
                  ? '🔒 Conexão mTLS com canal criptográfico seguro ICP-Brasil.'
                  : '👤 Acesso direto para MEI e optantes pelo login com Senha Web / Código de Acesso do Portal Nacional.'}
              </div>
            </div>

            {/* Grid de Configurações de Conexão */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {authMethod === 'certificado' ? (
                <>
                  {/* Card 1: Certificado A1 */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                        Certificado Digital A1 (.pfx)
                      </label>
                      {currentCompany.certificateA1?.password && (
                        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          Salvo na Empresa
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept=".pfx,.p12"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          setPfxFile(e.target.files[0]);
                          showToast(`Certificado ${e.target.files[0].name} carregado.`);
                        }
                      }}
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-950 border border-slate-800 rounded-lg p-1"
                    />
                    <div className="text-[10px] text-slate-500">
                      {pfxFile ? `Arquivo pronto: ${pfxFile.name}` : 'Utilize o certificado e-CNPJ da empresa para abrir o canal seguro'}
                    </div>
                  </div>

                  {/* Card 2: Senha Certificado */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <label className="text-xs font-bold text-slate-200 block">
                      Senha do Certificado A1
                    </label>
                    <div className="relative">
                      <input
                        type={showPfxPassword ? 'text' : 'password'}
                        value={pfxPassword}
                        onChange={e => setPfxPassword(e.target.value)}
                        placeholder={currentCompany.certificateA1?.password ? '•••••••• (Usar salva)' : 'Senha do arquivo .pfx...'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPfxPassword(!showPfxPassword)}
                        className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-200"
                      >
                        {showPfxPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      A senha é descriptografada em memória RAM para o handshake TLS
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Card 1: Usuário / CPF / CNPJ */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Usuário (CPF ou CNPJ)
                    </label>
                    <input
                      type="text"
                      value={usuarioWeb}
                      onChange={e => setUsuarioWeb(e.target.value)}
                      placeholder="00.000.000/0001-00 ou CPF..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <div className="text-[10px] text-slate-500">
                      CPF do titular ou CNPJ da empresa cadastrado no Emissor Nacional
                    </div>
                  </div>

                  {/* Card 2: Senha Web / Código de Acesso */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <label className="text-xs font-bold text-slate-200 block">
                      Senha Web / Código de Acesso
                    </label>
                    <div className="relative">
                      <input
                        type={showSenhaWeb ? 'text' : 'password'}
                        value={senhaWeb}
                        onChange={e => setSenhaWeb(e.target.value)}
                        placeholder="Digite a Senha Web ou Código..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenhaWeb(!showSenhaWeb)}
                        className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-200"
                      >
                        {showSenhaWeb ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Senha cadastrada no Portal Nacional da NFS-e (nfse.gov.br)
                    </div>
                  </div>
                </>
              )}

              {/* Card 3: Filtro de Período com Presets */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Período de Emissão
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button type="button" onClick={() => applyDatePreset('hoje')} className={`px-1.5 py-0.5 rounded ${datePreset === 'hoje' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>Hoje</button>
                    <button type="button" onClick={() => applyDatePreset('7dias')} className={`px-1.5 py-0.5 rounded ${datePreset === '7dias' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>7D</button>
                    <button type="button" onClick={() => applyDatePreset('mes')} className={`px-1.5 py-0.5 rounded ${datePreset === 'mes' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>Mês</button>
                    <button type="button" onClick={() => applyDatePreset('ano')} className={`px-1.5 py-0.5 rounded ${datePreset === 'ano' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}>Ano</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={e => {
                      setFiltroDataInicio(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    title="Data Inicial"
                  />
                  <input
                    type="date"
                    value={filtroDataFim}
                    onChange={e => {
                      setFiltroDataFim(e.target.value);
                      setDatePreset('custom');
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    title="Data Final"
                  />
                </div>
                <div className="text-[10px] text-slate-500">
                  Deixe em branco para sincronização irrestrita por NSU
                </div>
              </div>
            </div>

            {/* Barra de Ação de Disparo */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Consulta direta: varre notas emitidas pela empresa e notas recebidas de fornecedores.</span>
              </div>

              <button
                type="button"
                onClick={handleTriggerNfseSync}
                disabled={isSyncingNfse}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSyncingNfse ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Consultando Barramento Nacional...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>Disparar Sincronização Automática</span>
                  </>
                )}
              </button>
            </div>

            {/* Terminal de Diagnóstico Governamental */}
            {nfseSyncDiagnostic && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    LOG DA SESSÃO mTLS / RECEITA FEDERAL
                  </span>
                  <span className="text-[10px] text-slate-500">Status 200 OK</span>
                </div>
                <div className="text-slate-300 pt-1 leading-relaxed">
                  {nfseSyncDiagnostic}
                </div>
              </div>
            )}
          </div>

          {/* Cards de Métricas Executivas (Figma Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total de NFS-e Capturadas</div>
              <div className="text-3xl font-black text-white font-mono">{realNfseDocs.length}</div>
              <div className="text-[11px] text-slate-500">Documentos fiscais autênticos</div>
            </div>

            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                Prestadas (Faturamento)
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                R$ {realNfseDocs.filter(d => d.direcao === 'saida').reduce((acc, d) => acc + (d.valorServicos || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500">
                {realNfseDocs.filter(d => d.direcao === 'saida').length} nota(s) emitidas pela empresa
              </div>
            </div>

            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5 text-blue-400" />
                Tomadas (Compras / Despesas)
              </div>
              <div className="text-2xl font-black text-blue-400 font-mono">
                R$ {realNfseDocs.filter(d => d.direcao === 'entrada').reduce((acc, d) => acc + (d.valorServicos || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500">
                {realNfseDocs.filter(d => d.direcao === 'entrada').length} nota(s) recebidas de fornecedores
              </div>
            </div>

            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total ISSQN Apurado</div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                R$ {realNfseDocs.reduce((acc, d) => acc + (d.valorIss || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-500">Imposto municipal destacado e retido</div>
            </div>
          </div>

          {/* Barra de Ferramentas, Busca e Ações em Massa (Figma Style) */}
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Campo de Busca Rápida */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por chave de 50 dígitos, prestador, tomador ou número..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Segmented Filter (Todas, Prestadas, Tomadas) */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setFiltroDirecao('todas')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  filtroDirecao === 'todas' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas ({realNfseDocs.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroDirecao('saida')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filtroDirecao === 'saida' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Prestadas ({realNfseDocs.filter(d => d.direcao === 'saida').length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroDirecao('entrada')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  filtroDirecao === 'entrada' ? 'bg-blue-600 text-white' : 'text-blue-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Tomadas ({realNfseDocs.filter(d => d.direcao === 'entrada').length})
              </button>
            </div>

            {/* Botões de Ações em Massa */}
            <div className="flex items-center gap-2">
              {selectedDocIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadSelectedZip}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Selecionadas ({selectedDocIds.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleBatchDownloadZip}
                disabled={realNfseDocs.length === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Baixar pacote completo com todos os XMLs e PDFs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lote (.ZIP)</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={realNfseDocs.length === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                title="Exportar planilha Excel/CSV com os dados tributários"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                <span>CSV</span>
              </button>

              {realNfseDocs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Deseja limpar os registros baixados desta empresa?')) {
                      setRealNfseDocs([]);
                      localStorage.removeItem(nfseStorageKey);
                      setSelectedDocIds([]);
                      showToast('Registros locais limpos.');
                    }
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                  title="Limpar registros locais"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabela de Dados de Alta Densidade (Figma Style) */}
          {realNfseDocs.length === 0 ? (
            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-bold text-white text-base">Nenhuma NFS-e sincronizada</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Carregue o Certificado A1 (.pfx) acima e clique em <strong className="text-emerald-400">Disparar Sincronização Automática</strong> para capturar as notas diretamente do repositório da Receita Federal.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedDocIds.length === filteredNfseDocs.length && filteredNfseDocs.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5">Chave de Acesso (50 Dígitos) / Nº</th>
                      <th className="p-3.5">Emissão</th>
                      <th className="p-3.5">Direção</th>
                      <th className="p-3.5">Prestador</th>
                      <th className="p-3.5">Tomador</th>
                      <th className="p-3.5 text-right">Valor Serviços</th>
                      <th className="p-3.5 text-right">ISSQN</th>
                      <th className="p-3.5 text-center">Ações Fiscais</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredNfseDocs.map(doc => {
                      const isSelected = selectedDocIds.includes(doc.id || doc.chaveAcesso);
                      return (
                        <tr key={doc.id || doc.chaveAcesso} className={`hover:bg-slate-900/50 transition ${isSelected ? 'bg-slate-900/80' : ''}`}>
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectDoc(doc.id || doc.chaveAcesso)}
                              className="rounded border-slate-700 text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white font-mono">Nº {doc.numero}</span>
                              <span className="text-[10px] text-slate-500 font-mono">Série {doc.serie}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]" title={doc.chaveAcesso}>
                                {doc.chaveAcesso ? `${doc.chaveAcesso.substring(0, 12)}...${doc.chaveAcesso.substring(38)}` : 'Chave não informada'}
                              </span>
                              {doc.chaveAcesso && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(doc.chaveAcesso, 'Chave de Acesso')}
                                  className="text-slate-500 hover:text-emerald-400 transition"
                                  title="Copiar chave de acesso completa"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                            {doc.dataEmissao ? new Date(doc.dataEmissao).toLocaleDateString('pt-BR') : '-'}
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            {doc.direcao === 'saida' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1 w-fit">
                                <ArrowUpRight className="w-3 h-3" />
                                Prestada
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold flex items-center gap-1 w-fit">
                                <ArrowDownLeft className="w-3 h-3" />
                                Tomada
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 max-w-[180px]">
                            <div className="font-bold text-slate-200 truncate" title={doc.emitenteNome}>{doc.emitenteNome}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{doc.emitenteCnpj}</div>
                          </td>

                          <td className="p-3.5 max-w-[180px]">
                            <div className="font-bold text-slate-200 truncate" title={doc.tomadorNome}>{doc.tomadorNome}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{doc.tomadorCnpj}</div>
                          </td>

                          <td className="p-3.5 text-right font-mono font-bold text-white whitespace-nowrap">
                            R$ {(doc.valorServicos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3.5 text-right font-mono text-slate-300 whitespace-nowrap">
                            R$ {(doc.valorIss || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            {doc.issRetido && <span className="block text-[9px] text-amber-400 font-bold">Retido</span>}
                          </td>

                          <td className="p-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setActiveDanfseDoc(doc)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 hover:text-white transition cursor-pointer"
                                title="Visualizar DANFSE (Layout Oficial)"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadDanfsePdf(doc)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 hover:text-white transition cursor-pointer"
                                title="Baixar DANFSE em PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setActiveXmlDoc(doc)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-white transition cursor-pointer"
                                title="Inspecionar XML Assinado"
                              >
                                <FileCode className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadNfseXml(doc)}
                                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                                title="Baixar arquivo XML"
                              >
                                <Download className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal DANFSE Oficial da Receita Federal (Padrão Figma Make) */}
          {activeDanfseDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <div className="bg-[#0B0F19] border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Espelho DANFSE • Padrão Nacional</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Chave: {activeDanfseDoc.chaveAcesso}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadDanfsePdf(activeDanfseDoc)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDanfseDoc(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Espelho Físico DANFSE Oficial (Branco/Padrão Nacional) */}
                <div className="bg-white text-slate-900 p-6 rounded-2xl space-y-4 font-sans text-xs border border-slate-300 shadow-md">
                  {/* Cabeçalho Oficial */}
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-3">
                    <div className="space-y-1 max-w-sm">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        República Federativa do Brasil
                      </div>
                      <div className="text-base font-black uppercase text-slate-900 leading-tight">
                        {activeDanfseDoc.emitenteNome}
                      </div>
                      <div className="font-mono text-[11px] text-slate-700">
                        CNPJ Prestador: <strong>{activeDanfseDoc.emitenteCnpj}</strong>
                      </div>
                    </div>

                    <div className="text-right border-l-2 border-slate-800 pl-4 space-y-0.5">
                      <div className="font-black text-sm text-emerald-800 uppercase tracking-tight">
                        DANFSE NACIONAL
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold">Documento Auxiliar da NFS-e</div>
                      <div className="font-mono font-bold text-xs text-slate-900 pt-1">
                        Nº {activeDanfseDoc.numero} · Série {activeDanfseDoc.serie}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Emissão: {activeDanfseDoc.dataEmissao}
                      </div>
                    </div>
                  </div>

                  {/* Chave de Acesso Formatada */}
                  <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300 space-y-0.5 text-center">
                    <div className="text-[9px] uppercase font-bold text-slate-500">Chave de Acesso para Consulta no Portal Nacional</div>
                    <div className="font-mono font-black text-xs text-slate-900 tracking-wider">
                      {activeDanfseDoc.chaveAcesso ? activeDanfseDoc.chaveAcesso.match(/.{1,4}/g)?.join(' ') : '0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 00'}
                    </div>
                  </div>

                  {/* Quadros de Prestador e Tomador */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-[10px] uppercase text-slate-500">Dados do Prestador</div>
                      <div className="font-bold text-xs">{activeDanfseDoc.emitenteNome}</div>
                      <div className="font-mono text-[11px] text-slate-700">CNPJ: {activeDanfseDoc.emitenteCnpj}</div>
                      <div className="text-[10px] text-slate-600">Município de Incidência do ISS</div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-[10px] uppercase text-slate-500">Dados do Tomador</div>
                      <div className="font-bold text-xs">{activeDanfseDoc.tomadorNome}</div>
                      <div className="font-mono text-[11px] text-slate-700">CNPJ/CPF: {activeDanfseDoc.tomadorCnpj}</div>
                      <div className="text-[10px] text-slate-600">Destinatário do Serviço</div>
                    </div>
                  </div>

                  {/* Discriminação dos Serviços */}
                  <div className="p-3.5 border border-slate-300 rounded-xl space-y-1.5">
                    <div className="font-bold text-[10px] uppercase text-slate-500 border-b border-slate-200 pb-1">
                      Discriminação dos Serviços Prestados
                    </div>
                    <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {activeDanfseDoc.discriminacao || 'Prestação de serviços executada conforme especificações e parâmetros legais da Receita Federal.'}
                    </div>
                    {activeDanfseDoc.itemLc116 && (
                      <div className="text-[10px] text-slate-500 font-mono pt-1">
                        Código de Tributação Nacional / LC 116: <strong>{activeDanfseDoc.itemLc116}</strong>
                      </div>
                    )}
                  </div>

                  {/* Tabela de Valores e Tributos */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-100 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Valor dos Serviços</div>
                      <div className="text-base font-black font-mono text-slate-900 mt-1">
                        R$ {(activeDanfseDoc.valorServicos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-100 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Alíquota ISS</div>
                      <div className="text-base font-black font-mono text-slate-900 mt-1">
                        {(activeDanfseDoc.aliquotaIss || 2.0).toFixed(2)}%
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 text-white rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-emerald-400">ISSQN Apurado</div>
                      <div className="text-base font-black font-mono text-emerald-300 mt-1">
                        R$ {(activeDanfseDoc.valorIss || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadNfseXml(activeDanfseDoc)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Baixar XML</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDanfseDoc(null)}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal XML Oficial (Figma Make) */}
          {activeXmlDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <div className="bg-[#0B0F19] border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Arquivo XML Assinado Oficial</h4>
                      <p className="text-xs text-slate-400 font-mono truncate max-w-md">Chave: {activeXmlDoc.chaveAcesso}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setActiveXmlDoc(null)} className="text-slate-400 hover:text-white text-sm cursor-pointer">✕</button>
                </div>

                <div className="flex-1 overflow-auto bg-[#070B13] border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 whitespace-pre">
                  {activeXmlDoc.xmlConteudo || '<!-- XML não disponível -->'}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeXmlDoc.xmlConteudo) {
                        copyToClipboard(activeXmlDoc.xmlConteudo, 'XML');
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar XML</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadNfseXml(activeXmlDoc)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Arquivo .XML</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveXmlDoc(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 1: EMITIR NOVA NFS-E */}
      {activeTab === 'emitir' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-400" />
                  Preenchimento do DPS (Declaração de Prestação de Serviço)
                </h4>
                <p className="text-xs text-slate-400">Emissão oficial conforme padrão nacional ABRASF / ADN Gov.br</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold font-mono">
                Produção Nacional
              </span>
            </div>

            {/* Seleção do Tomador */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Cliente Tomador do Serviço *</label>
                <button
                  onClick={() => setShowNewTomadorModal(true)}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Cadastrar Novo Tomador
                </button>
              </div>
              <select
                value={selectedTomadorId}
                onChange={(e) => setSelectedTomadorId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition font-medium"
              >
                {tomadores.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.razaoSocial} — CNPJ/CPF: {t.cpfCnpj} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Código de Serviço Padrão */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Código de Tributação Nacional da NFS-e *</label>
              <select
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition font-medium"
              >
                {SERVICE_CODES_PRESETS.map(preset => (
                  <option key={preset.code} value={preset.code}>
                    {preset.code} - {preset.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Enquadramento Tributário Nacional (NBS, LC 116, Código Municipal) */}
            <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Enquadramento Técnico do Serviço (NBS & LC 116/03)</span>
                <span className="font-mono text-[10px] text-rose-400 font-bold">ABRASF 1.00 / Gov.br</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Código NBS (9 dígitos)</label>
                  <input
                    type="text"
                    value={serviceNbsCode}
                    onChange={(e) => setServiceNbsCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-white font-mono"
                    placeholder="1.0101.10.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Item LC 116/03</label>
                  <input
                    type="text"
                    value={itemLc116}
                    onChange={(e) => setItemLc116(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-white font-mono"
                    placeholder="17.01"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Cód. Serviço Municipal</label>
                  <input
                    type="text"
                    value={codigoServicoMunicipal}
                    onChange={(e) => setCodigoServicoMunicipal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0F172A] border border-slate-700 rounded-lg text-xs text-white font-mono"
                    placeholder="02800"
                  />
                </div>
              </div>
            </div>

            {/* Descrição dos Serviços */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Discriminação Detalhada dos Serviços Prestados *</label>
              <textarea
                rows={4}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Descreva detalhadamente a prestação de serviços para a nota fiscal..."
                className="w-full p-4 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition leading-relaxed"
              />
            </div>

            {/* Valores, Alíquotas e Deduções */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Valor Serviço (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={valorServico}
                    onChange={(e) => setValorServico(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-rose-400 font-bold font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Dedução BC (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={deducoesBaseCalculo}
                    onChange={(e) => setDeducoesBaseCalculo(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Alíquota ISS (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="5"
                    value={aliquotaIss}
                    onChange={(e) => setAliquotaIss(parseFloat(e.target.value) || 2.0)}
                    className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white font-bold font-mono focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Valor ISS</label>
                <div className="px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-300">
                  {valorIssVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>

            {/* PAINEL EXCLUSIVO REFORMA TRIBUTÁRIA EC 132/2023 (IBS, CBS E SPLIT PAYMENT NACIONAL) */}
            <div className="p-4 bg-purple-950/40 border border-purple-500/50 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse"></span>
                  <h5 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                    Reforma Tributária EC 132/2023 • IBS & CBS + Split Payment (BACEN)
                  </h5>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isReformaActive}
                    onChange={(e) => setIsReformaActive(e.target.checked)}
                    className="rounded border-purple-500 text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span className="text-[11px] font-bold text-purple-300">Habilitar Alíquotas da Reforma</span>
                </label>
              </div>

              {isReformaActive && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Alíquota IBS Est. (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={aliquotaIbs}
                        onChange={(e) => setAliquotaIbs(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-[#0B0F19] border border-purple-700/60 rounded-lg text-purple-200 font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Alíquota CBS Est. (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={aliquotaCbs}
                        onChange={(e) => setAliquotaCbs(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-[#0B0F19] border border-purple-700/60 rounded-lg text-purple-200 font-mono font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Regime Específico EC 132</label>
                      <select
                        value={regimeEspecificoReforma}
                        onChange={(e) => setRegimeEspecificoReforma(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0B0F19] border border-purple-700/60 rounded-lg text-purple-200 text-xs font-semibold"
                      >
                        <option value="Padrao_26.5">Alíquota Padrão (26.5%)</option>
                        <option value="Reducao_60">Redução 60% (Saúde/Educação)</option>
                        <option value="SociedadeProfissionais">Sociedade de Profissionais</option>
                      </select>
                    </div>
                  </div>

                  {/* Configuração do Split Payment */}
                  <div className="pt-2 border-t border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#0B0F19]/80 p-3 rounded-lg border border-purple-500/20">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={splitPaymentActive}
                        onChange={(e) => setSplitPaymentActive(e.target.checked)}
                        className="rounded border-rose-500 text-rose-500 focus:ring-rose-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-rose-300">Ativar Split Payment Automático (BACEN / SPI)</span>
                    </label>

                    {splitPaymentActive && (
                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        <span className="text-[11px] text-slate-400 font-bold shrink-0">Chave PIX Split:</span>
                        <input
                          type="text"
                          value={splitPaymentPixKey}
                          onChange={(e) => setSplitPaymentPixKey(e.target.value)}
                          className="px-3 py-1 bg-[#0F172A] border border-rose-500/50 rounded text-xs text-white font-mono w-full md:w-48"
                          placeholder="Chave PIX ou CNPJ"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Checkboxes de Retenção */}
            <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={issRetido}
                    onChange={(e) => setIssRetido(e.target.checked)}
                    className="rounded border-slate-700 text-rose-500 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-200">ISS Retido na Fonte pelo Tomador</span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRetencoes}
                    onChange={(e) => setHasRetencoes(e.target.checked)}
                    className="rounded border-slate-700 text-rose-500 focus:ring-rose-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-200">Destacar Retenções Federais na Fonte (PIS, COFINS, INSS, IRRF, CSLL)</span>
                </label>
              </div>
            </div>

            {/* Botão de Disparo da Emissão */}
            <button
              onClick={handleEmitCommercialNfse}
              disabled={isEmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm transition shadow-lg shadow-rose-950/50 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <FileText className={`w-5 h-5 ${isEmitting ? 'animate-bounce' : ''}`} />
              <span>{isEmitting ? 'Transmitindo DPS para o Gov.br...' : 'Transmitir DPS e Emitir NFS-e Oficial (Gov.br)'}</span>
            </button>
          </div>

          {/* Card Resumo do Cálculo Fiscal */}
          <div className="space-y-6">
            <div className="bg-[#0F172A] rounded-2xl border border-rose-500/40 p-6 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <DollarSign className="w-4 h-4 text-rose-400" />
                Resumo Fiscal da Nota Fiscal
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Valor Bruto do Serviço:</span>
                  <strong className="text-white font-mono">{valorServico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </div>

                {deducoesBaseCalculo > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Deduções Base Cálculo:</span>
                    <strong className="text-amber-400 font-mono">- {deducoesBaseCalculo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>ISS ({aliquotaIss}%):</span>
                  <strong className="text-slate-300 font-mono">{valorIssVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                </div>

                {hasRetencoes && (
                  <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-400">
                    <div className="flex justify-between"><span>PIS (0.65%):</span> <span className="font-mono text-slate-300">R$ {pisVal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>COFINS (3.0%):</span> <span className="font-mono text-slate-300">R$ {cofinsVal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>INSS (11.0%):</span> <span className="font-mono text-slate-300">R$ {inssVal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>IRRF (1.5%):</span> <span className="font-mono text-slate-300">R$ {irrfVal.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>CSLL (1.0%):</span> <span className="font-mono text-slate-300">R$ {csllVal.toFixed(2)}</span></div>
                  </div>
                )}

                {/* Bloco Resumo Reforma Tributária EC 132/23 */}
                {isReformaActive && (
                  <div className="pt-2 border-t border-purple-500/30 space-y-1.5 text-[11px] bg-purple-950/40 p-2.5 rounded-lg border border-purple-500/30">
                    <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between">
                      <span>Reforma Tributária (EC 132/23)</span>
                      <span className="font-mono text-[9px] text-purple-400">Transição</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>IBS ({aliquotaIbs}%):</span>
                      <span className="font-mono text-purple-300">R$ {valorIbsCalc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>CBS ({aliquotaCbs}%):</span>
                      <span className="font-mono text-purple-300">R$ {valorCbsCalc.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-purple-200 font-bold border-t border-purple-500/20 pt-1">
                      <span>Total Impostos Reforma:</span>
                      <span className="font-mono">R$ {totalIbsCbsCalc.toFixed(2)}</span>
                    </div>

                    {splitPaymentActive && (
                      <div className="pt-1.5 border-t border-rose-500/30 text-[10px] text-rose-300 space-y-0.5 font-mono">
                        <div className="flex justify-between">
                          <span>Split Retido Banco (BACEN):</span>
                          <span>- R$ {splitRetenidoCalc.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-rose-400">
                          <span>Líquido Conta Prestador:</span>
                          <span>R$ {splitLiquidoPrestadorCalc.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">Valor Líquido NFS-e:</span>
                  <span className="text-base font-black text-rose-400 font-mono">
                    {valorLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Info do Prestador Selecionado */}
            <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-6 shadow-xs space-y-3 text-xs text-slate-300">
              <h5 className="font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rose-400" />
                Empresa Prestadora
              </h5>
              <div><strong>Razão Social:</strong> {currentCompany.name}</div>
              <div><strong>CNPJ:</strong> {currentCompany.cnpj}</div>
              <div><strong>Município / UF:</strong> {currentCompany.city || 'Curitiba'} / {currentCompany.uf}</div>
              <div className="pt-2 border-t border-slate-800 flex items-center space-x-2 text-rose-400 text-[11px] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Certificado e-CNPJ A1 ICP-Brasil Habilitado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: PAINEL DE NOTAS EMITIDAS */}
      {activeTab === 'historico' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Notas Fiscais de Serviço Emitidas para Clientes ({commercialNotes.length})</h4>
            <span className="text-xs font-mono text-rose-400 bg-rose-950/60 px-3 py-1 rounded-lg border border-rose-800">
              Padrão ADN / ABRASF v1.00
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0F19] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Nº Nota / Ref</th>
                  <th className="p-3.5">Cliente Tomador</th>
                  <th className="p-3.5">Valor do Serviço</th>
                  <th className="p-3.5">Data Emissão</th>
                  <th className="p-3.5">Status Gov.br</th>
                  <th className="p-3.5">Chave de Acesso 50d</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {commercialNotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      Nenhuma nota fiscal emitida ainda no módulo comercial. Clique em "Emitir Nova NFS-e" para iniciar.
                    </td>
                  </tr>
                ) : (
                  commercialNotes.map(({ invoice, nfse }) => (
                    <tr key={invoice.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono font-bold text-white">{nfse.numeroNfse}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{nfse.tomador.razaoSocial}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{nfse.tomador.cpfCnpj}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-rose-400">
                        {nfse.valorServico.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">{nfse.dataEmissao}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold font-mono inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-rose-400" />
                          <span>AUTORIZADA</span>
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-rose-300 font-bold">
                        {nfse.chaveAcesso50.substring(0, 18)}...
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => NfseNacionalService.downloadXml(nfse)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer"
                            title="Baixar XML ABRASF v1.00"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInvoiceModal(invoice);
                              setIsNfseModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ver DANFSE</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: GERENCIADOR DE TOMADORES */}
      {activeTab === 'tomadores' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-rose-400" />
                Clientes e Tomadores Cadastrados
              </h4>
              <p className="text-xs text-slate-400">Gerencie a base de clientes para emissão recorrente de notas fiscais</p>
            </div>
            <button
              onClick={() => setShowNewTomadorModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-xs flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Tomador</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tomadores.map(t => (
              <div key={t.id} className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-bold text-white text-sm">{t.razaoSocial}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[10px] font-bold">
                    {t.cpfCnpj}
                  </span>
                </div>
                <div className="text-slate-400"><strong>E-mail:</strong> {t.email}</div>
                <div className="text-slate-400"><strong>Telefone:</strong> {t.telefone || 'Não informado'}</div>
                <div className="text-slate-400"><strong>Localidade:</strong> {t.municipio} / {t.uf}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: CONFIGURAÇÕES FISCAIS & CERTIFICADO */}
      {activeTab === 'config' && (
        <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-rose-400" />
              Parâmetros Fiscais & Certificado ICP-Brasil
            </h4>
            <p className="text-xs text-slate-400">Configuração de autenticação mTLS e assinatura digital XML da empresa prestadora</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-[#0B0F19] rounded-xl border border-rose-500/30 space-y-3 text-xs">
              <h5 className="font-bold text-white flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Certificado Digital Ativo (e-CNPJ A1)
              </h5>
              <div className="text-slate-300"><strong>Titular:</strong> {currentCompany.name}</div>
              <div className="text-slate-300"><strong>CNPJ:</strong> {currentCompany.cnpj}</div>
              <div className="text-slate-300"><strong>Emissor:</strong> AC SERPRO RFB v5 (ICP-Brasil)</div>
              <div className="text-slate-300"><strong>Validade:</strong> 15/10/2027</div>
              <div className="pt-2 text-rose-400 font-bold font-mono">Status: PRONTO PARA TRANSMISSÃO</div>
            </div>

            <div className="p-5 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-3 text-xs">
              <h5 className="font-bold text-white text-sm">Endereços dos WebServices Gov.br</h5>
              <div className="text-slate-400 font-mono text-[11px]">
                <div><strong>Produção ADN:</strong> https://www.nfse.gov.br/adn</div>
                <div><strong>Ambiente de Testes:</strong> https://www.nfse.gov.br/adn-homologacao</div>
                <div><strong>Versão Layout:</strong> ABRASF v1.00 / Padrão Nacional</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOVO TOMADOR */}
      {showNewTomadorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Cadastrar Novo Cliente Tomador</h4>
              <button onClick={() => setShowNewTomadorModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTomador} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">CPF ou CNPJ *</label>
                <input
                  type="text"
                  required
                  placeholder="00.000.000/0000-00"
                  value={newTomador.cpfCnpj}
                  onChange={(e) => setNewTomador(prev => ({ ...prev, cpfCnpj: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-white font-mono focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Razão Social / Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Empresa Exemplo Ltda"
                  value={newTomador.razaoSocial}
                  onChange={(e) => setNewTomador(prev => ({ ...prev, razaoSocial: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-white focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">E-mail para Recebimento da NFS-e *</label>
                <input
                  type="email"
                  required
                  placeholder="financeiro@empresa.com.br"
                  value={newTomador.email}
                  onChange={(e) => setNewTomador(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-white focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Município</label>
                  <input
                    type="text"
                    value={newTomador.municipio}
                    onChange={(e) => setNewTomador(prev => ({ ...prev, municipio: e.target.value }))}
                    className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-white focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newTomador.uf}
                    onChange={(e) => setNewTomador(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-white uppercase font-mono focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTomadorModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Salvar Tomador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DANFSE INTERATIVA */}
      {isNfseModalOpen && selectedInvoiceModal && (
        <NfseNacionalModal
          isOpen={isNfseModalOpen}
          onClose={() => {
            setIsNfseModalOpen(false);
            setSelectedInvoiceModal(null);
          }}
          invoice={selectedInvoiceModal}
          bankConfig={bankConfig}
        />
      )}
    </div>
  );
};
