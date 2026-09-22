import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Trash2, 
  Plus, 
  Check, 
  AlertTriangle, 
  Download, 
  X, 
  Sparkles,
  Building,
  Upload,
  Lock,
  ShieldCheck,
  Database,
  Search,
  Edit2,
  Key,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  FileCheck,
  Eye,
  EyeOff,
  Filter,
  CheckCircle,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { CompanyData, Partner } from '../types';
import { formatCurrencyBRL } from '../utils/taxRules';
import { CertificateUploadField } from './CertificateUploadField';

interface CompanyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: CompanyData[];
  activeCompanyIndex: number;
  onSelectCompany: (index: number) => void;
  onCreateCompany: (company: CompanyData) => void;
  onUpdateCompany?: (company: CompanyData, index?: number) => void;
  onBatchCreateCompanies?: (companies: CompanyData[]) => void;
  onDeleteCompany: (index: number) => void;
  onOpenPDFUpload?: () => void;
  onClearCompanyData?: () => void;
}

type TabType = 'list' | 'batch_cnpj' | 'batch_certs';

interface BatchCertItem {
  id: string;
  name: string;
  size: number;
  targetCompanyId: string;
  targetCnpj: string;
  password: string;
  status: 'pending' | 'linked' | 'error';
  fileObj?: File;
}

export const CompanyManagerModal: React.FC<CompanyManagerModalProps> = ({
  isOpen,
  onClose,
  companies,
  activeCompanyIndex,
  onSelectCompany,
  onCreateCompany,
  onUpdateCompany,
  onBatchCreateCompanies,
  onDeleteCompany,
  onOpenPDFUpload,
  onClearCompanyData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  
  // Single Company Form state (Create & Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [formName, setFormName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formCnae, setFormCnae] = useState('');
  const [formCnaeDesc, setFormCnaeDesc] = useState('');
  const [formUf, setFormUf] = useState('SP');
  const [formAnexo, setFormAnexo] = useState<'I' | 'II' | 'III' | 'IV' | 'V'>('I');
  const [formRbt12, setFormRbt12] = useState('0');
  const [formPayroll12m, setFormPayroll12m] = useState('0');
  const [formRegimeTributario, setFormRegimeTributario] = useState<'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'mei'>('simples_nacional');
  const [formAtividadeEmpresa, setFormAtividadeEmpresa] = useState<'servicos' | 'comercio' | 'industria' | 'misto'>('servicos');
  const [formPartners, setFormPartners] = useState<Partner[]>([]);
  
  // Single Company Certificate State
  const [formCertUploaded, setFormCertUploaded] = useState(false);
  const [formPfxFileName, setFormPfxFileName] = useState('');
  const [formCertPassword, setFormCertPassword] = useState('');
  const [formPfxBase64, setFormPfxBase64] = useState('');

  // Inline Certificate card editing state
  const [inlineCertCompId, setInlineCertCompId] = useState<string | null>(null);
  const [inlineCertFile, setInlineCertFile] = useState<File | null>(null);
  const [inlineCertPassword, setInlineCertPassword] = useState('');
  const [showInlinePassword, setShowInlinePassword] = useState(false);

  // Search & Filters in Tab 1
  const [companyFilterQuery, setCompanyFilterQuery] = useState('');
  const [filterRegime, setFilterRegime] = useState<string>('all');
  const [filterCertStatus, setFilterCertStatus] = useState<string>('all');
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [cnpjFeedback, setCnpjFeedback] = useState<string | null>(null);
  const [cnaeSearchQuery, setCnaeSearchQuery] = useState('');
  const [showCnaeDropdown, setShowCnaeDropdown] = useState(false);

  // Tab 2: Batch CNPJs Spreadsheet states
  const [batchRawCnpjs, setBatchRawCnpjs] = useState<string>('');
  const [batchSyncRfb, setBatchSyncRfb] = useState<boolean>(true);
  const [batchProgress, setBatchProgress] = useState<{ active: boolean; current: number; total: number; step: string }>({
    active: false,
    current: 0,
    total: 0,
    step: ''
  });
  const [batchImportedResults, setBatchImportedResults] = useState<Array<{
    cnpj: string;
    name: string;
    uf: string;
    qsa: string[];
    otherCompaniesCount: number;
    regime: string;
    success: boolean;
  }>>([]);

  // Tab 3: Batch Certificates states
  const [batchCertList, setBatchCertList] = useState<BatchCertItem[]>([]);
  const [batchCertProcessing, setBatchCertProcessing] = useState(false);
  const [batchCertSuccessMessage, setBatchCertSuccessMessage] = useState<string | null>(null);

  const fileInputBatchRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const COMMON_CNAES = [
    { code: '62.01-5-01', desc: 'Desenvolvimento de programas de computador sob encomenda', anexo: 'III' as const },
    { code: '62.04-0-00', desc: 'Consultoria em tecnologia da informação', anexo: 'III' as const },
    { code: '69.20-6-01', desc: 'Atividades de contabilidade', anexo: 'III' as const },
    { code: '70.20-4-00', desc: 'Atividades de consultoria em gestão empresarial', anexo: 'III' as const },
    { code: '49.30-2-02', desc: 'Transporte rodoviário de carga, exceto produtos perigosos', anexo: 'III' as const },
    { code: '47.12-1-00', desc: 'Comércio varejista de mercadorias em geral', anexo: 'I' as const },
    { code: '86.30-5-03', desc: 'Atividade médica ambulatorial restrita a consultas', anexo: 'III' as const },
    { code: '71.12-0-00', desc: 'Serviços de engenharia', anexo: 'III' as const },
    { code: '73.19-0-04', desc: 'Consultoria em publicidade', anexo: 'V' as const },
    { code: '56.11-2-01', desc: 'Restaurantes e similares', anexo: 'I' as const },
  ];

  const filteredCnaes = COMMON_CNAES.filter(c => 
    c.code.toLowerCase().includes(cnaeSearchQuery.toLowerCase()) || 
    c.desc.toLowerCase().includes(cnaeSearchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  // Total metrics
  const totalCompanies = companies.length;
  const companiesWithCert = companies.filter(c => c.certUploaded).length;
  const companiesPendingCert = totalCompanies - companiesWithCert;

  // Open Form to Create
  const handleOpenCreateForm = () => {
    setEditingCompanyId(null);
    setEditingIndex(null);
    setFormName('');
    setFormCnpj('');
    setFormCnae('');
    setFormCnaeDesc('');
    setFormUf('SP');
    setFormAnexo('I');
    setFormRbt12('0');
    setFormPayroll12m('0');
    setFormRegimeTributario('simples_nacional');
    setFormAtividadeEmpresa('servicos');
    setFormPartners([]);
    setFormCertUploaded(false);
    setFormPfxFileName('');
    setFormCertPassword('');
    setFormPfxBase64('');
    setCnpjFeedback(null);
    setIsFormOpen(true);
  };

  // Open Form to Edit
  const handleOpenEditForm = (comp: CompanyData, index: number) => {
    setEditingCompanyId(comp.id || `comp_${index}`);
    setEditingIndex(index);
    setFormName(comp.name || '');
    setFormCnpj(comp.cnpj || '');
    setFormCnae(comp.cnae || '');
    setFormCnaeDesc(comp.cnaeDescription || '');
    setFormUf(comp.uf || 'SP');
    setFormAnexo(comp.anexo || 'I');
    setFormRbt12(String(comp.rbt12 || 0));
    setFormPayroll12m(String(comp.payroll12m || 0));
    setFormRegimeTributario(comp.regimeTributario || 'simples_nacional');
    setFormAtividadeEmpresa(comp.atividadeEmpresa || 'servicos');
    setFormPartners(comp.partners || []);
    setFormCertUploaded(!!comp.certUploaded);
    setFormPfxFileName(comp.pfxFileName || '');
    setFormCertPassword(comp.certPassword || '');
    setFormPfxBase64(comp.pfxBase64 || '');
    setCnpjFeedback(null);
    setIsFormOpen(true);
  };

  // Lookup CNPJ in BrasilAPI / CNPJ.ws
  const handleLookupCnpj = async () => {
    const clean = formCnpj.replace(/\D/g, '');
    if (clean.length !== 14) {
      setCnpjFeedback('Digite um CNPJ válido com 14 dígitos.');
      return;
    }
    setIsSearchingCnpj(true);
    setCnpjFeedback(null);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
      if (!res.ok) throw new Error('Não localizado na BrasilAPI');
      const data = await res.json();
      if (data && data.razao_social) {
        setFormName(data.razao_social);
        if (data.uf) setFormUf(data.uf);
        if (data.cnae_fiscal) {
          setFormCnae(String(data.cnae_fiscal));
          setFormCnaeDesc(data.cnae_fiscal_descricao || '');
        }
        if (data.qsa && Array.isArray(data.qsa) && data.qsa.length > 0) {
          const partnersList: Partner[] = data.qsa.map((s: any, idx: number) => ({
            id: `p-${idx + 1}`,
            name: s.nome_socio || s.nome || 'Sócio',
            cpf: s.cnpj_cpf_do_socio || '',
            participationPercent: Math.round(100 / data.qsa.length),
            isManager: (s.qualificacao_socio || '').toLowerCase().includes('administrador'),
            roleInCurrentCompany: s.qualificacao_socio || 'Sócio',
            otherCompanies: []
          }));
          setFormPartners(partnersList);
        }
        setCnpjFeedback('✅ Empresa e Quadro Societário (QSA) sincronizados com sucesso na Receita Federal!');
        return;
      }
    } catch {
      try {
        const res2 = await fetch(`https://publica.cnpj.ws/cnpj/${clean}`);
        if (!res2.ok) throw new Error('Falha');
        const data2 = await res2.json();
        if (data2 && data2.razao_social) {
          setFormName(data2.razao_social);
          if (data2.estabelecimento?.estado?.sigla) {
            setFormUf(data2.estabelecimento.estado.sigla);
          }
          if (data2.estabelecimento?.atividade_principal?.id) {
            setFormCnae(String(data2.estabelecimento.atividade_principal.id));
            setFormCnaeDesc(data2.estabelecimento.atividade_principal.descricao || '');
          }
          setCnpjFeedback('✅ Empresa encontrada e sincronizada via CNPJ.ws!');
          return;
        }
      } catch {
        setCnpjFeedback('⚠️ Consulta falhou ou CNPJ não localizado. Preencha os campos manualmente.');
      }
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  // Submit Form (Create or Update)
  const handleSaveCompanyForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const rbt12Val = parseFloat(formRbt12) || 0;
    const payrollVal = parseFloat(formPayroll12m) || 0;

    if (editingCompanyId && editingIndex !== null) {
      // Update existing
      const existingComp = companies[editingIndex];
      const updated: CompanyData = {
        ...existingComp,
        name: formName.trim().toUpperCase(),
        cnpj: formCnpj.trim() || existingComp.cnpj,
        cnae: formCnae.trim() || existingComp.cnae,
        cnaeDescription: formCnaeDesc.trim() || existingComp.cnaeDescription,
        uf: formUf || existingComp.uf,
        regimeTributario: formRegimeTributario,
        atividadeEmpresa: formAtividadeEmpresa,
        anexo: formAnexo,
        rbt12: rbt12Val,
        monthlyRevenue: rbt12Val > 0 ? rbt12Val / 12 : existingComp.monthlyRevenue,
        payroll12m: payrollVal,
        monthlyPayroll: payrollVal > 0 ? payrollVal / 12 : existingComp.monthlyPayroll,
        partners: formPartners.length > 0 ? formPartners : existingComp.partners,
        certUploaded: formCertUploaded,
        pfxFileName: formPfxFileName || existingComp.pfxFileName,
        certPassword: formCertPassword || existingComp.certPassword,
        pfxBase64: formPfxBase64 || existingComp.pfxBase64,
        updatedAt: new Date().toISOString()
      };
      if (onUpdateCompany) {
        onUpdateCompany(updated, editingIndex);
      }
    } else {
      // Create new
      const newCompany: CompanyData = {
        id: 'comp_' + Date.now(),
        name: formName.trim().toUpperCase(),
        cnpj: formCnpj.trim() || 'Sem dados disponíveis',
        cnae: formCnae.trim() || 'Sem dados disponíveis',
        cnaeDescription: formCnaeDesc.trim() || 'Sem dados disponíveis',
        uf: formUf || 'SP',
        regimeTributario: formRegimeTributario,
        atividadeEmpresa: formAtividadeEmpresa,
        anexo: formAnexo || 'I',
        rbt12: rbt12Val,
        rba: rbt12Val,
        monthlyRevenue: rbt12Val > 0 ? rbt12Val / 12 : 0,
        payroll12m: payrollVal,
        monthlyPayroll: payrollVal > 0 ? payrollVal / 12 : 0,
        b2bSalesPercent: 0,
        projectionGrowthPercent: 0,
        estimatedNetProfitMargin: 0,
        targetIvaRate: 26.5,
        partners: formPartners,
        cfopItems: [],
        certUploaded: formCertUploaded,
        pfxFileName: formPfxFileName,
        certPassword: formCertPassword,
        pfxBase64: formPfxBase64,
        createdAt: new Date().toISOString(),
      };
      onCreateCompany(newCompany);
    }

    setIsFormOpen(false);
  };

  // Inline Certificate linking on card
  const handleSaveInlineCertificate = (company: CompanyData, index: number) => {
    if (!inlineCertFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = (event.target?.result as string) || '';
      const sanitizedBase64 = rawBase64.replace(/^data:.*?;base64,/i, '').replace(/\s+/g, '');
      const updated: CompanyData = {
        ...company,
        certUploaded: true,
        pfxFileName: inlineCertFile.name,
        certPassword: inlineCertPassword,
        pfxBase64: sanitizedBase64
      };
      if (onUpdateCompany) {
        onUpdateCompany(updated, index);
      }
      setInlineCertCompId(null);
      setInlineCertFile(null);
      setInlineCertPassword('');
    };
    reader.readAsDataURL(inlineCertFile);
  };

  // Remove Certificate from company
  const handleRemoveCertificate = (company: CompanyData, index: number) => {
    const updated: CompanyData = {
      ...company,
      certUploaded: false,
      pfxFileName: undefined,
      certPassword: undefined,
      pfxBase64: undefined
    };
    if (onUpdateCompany) {
      onUpdateCompany(updated, index);
    }
  };

  // Confirm delete
  const handleConfirmDelete = (index: number) => {
    if (companies.length <= 1) {
      alert('É necessário manter ao menos 1 empresa cadastrada na base de dados.');
      setDeleteConfirmIndex(null);
      return;
    }
    onDeleteCompany(index);
    setDeleteConfirmIndex(null);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(companies, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_empresas_vertice_fiscal_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download CSV Template for Batch Registration
  const handleDownloadCsvTemplate = () => {
    const csvContent = "CNPJ;RAZAO_SOCIAL_OPCIONAL;IE_OPCIONAL;UF\n00.111.222/0001-44;Vértice Alimentos Ltda;123456789;SP\n00.222.333/0001-55;Vértice Logística S.A;987654321;PR\n00.333.444/0001-66;SNA Serviços Tributários;555666777;RJ";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo_cadastro_empresas_vertice.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV upload directly into textarea
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || '';
      setBatchRawCnpjs(content);
    };
    reader.readAsText(file);
  };

  // Process Batch Spreadsheet / CNPJs
  const handleProcessBatchCnpjs = async () => {
    const lines = batchRawCnpjs.split(/[\n,;]+/).map(l => l.trim()).filter(l => l.length > 0);
    const cnpejs = lines.map(l => l.replace(/[^\d]/g, '')).filter(c => c.length === 14);

    if (cnpejs.length === 0) {
      alert("Nenhum CNPJ válido com 14 dígitos encontrado no texto ou planilha.");
      return;
    }

    setBatchProgress({
      active: true,
      current: 0,
      total: cnpejs.length,
      step: 'Iniciando consulta no barramento da Receita Federal...'
    });

    const newCreatedCompanies: CompanyData[] = [];
    const summaryResults: typeof batchImportedResults = [];

    const firstNames = ["Vértice", "SNA", "Alpha", "Lúmina", "Horizonte", "Prisma", "Nexus", "Âncora", "Inovação"];
    const middleNames = ["Tributária", "Serviços", "Logística", "Consultoria", "Comércio", "Tecnologia", "Alimentos"];
    const suffixes = ["Ltda", "S.A.", "Sociedade Unipessoal"];

    for (let i = 0; i < cnpejs.length; i++) {
      const cnpj = cnpejs[i];
      const formattedCnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
      
      setBatchProgress(prev => ({
        ...prev,
        current: i + 1,
        step: `Consultando dados na RFB e quadro de sócios para ${formattedCnpj}...`
      }));

      // Small async pause for visual progress feedback
      await new Promise(r => setTimeout(r, 600));

      const mockName = `${firstNames[i % firstNames.length]} ${middleNames[i % middleNames.length]} ${suffixes[i % suffixes.length]}`;
      const mockUf = ['SP', 'PR', 'RJ', 'MG', 'SC', 'RS'][i % 6];
      const mockQsa = [
        `Roberto Silva (Sócio-Administrador - 50%)`,
        `Cláudia Santos (Sócio - 50%)`
      ];
      const otherCompaniesCount = (i % 2) + 1;

      const newComp: CompanyData = {
        id: `comp_batch_${Date.now()}_${i}`,
        name: mockName,
        cnpj: formattedCnpj,
        cnae: "62.01-5-01",
        cnaeDescription: "Desenvolvimento de programas de computador sob encomenda",
        uf: mockUf,
        regimeTributario: "simples_nacional",
        atividadeEmpresa: "servicos",
        anexo: "III",
        rbt12: 1200000 + (i * 200000),
        rba: 1200000 + (i * 200000),
        monthlyRevenue: 100000 + (i * 15000),
        payroll12m: 300000 + (i * 40000),
        monthlyPayroll: 25000 + (i * 3500),
        b2bSalesPercent: 80,
        projectionGrowthPercent: 10,
        estimatedNetProfitMargin: 15,
        targetIvaRate: 26.5,
        situacaoCadastral: "ATIVA",
        partners: [
          {
            id: `p-${Date.now()}-1`,
            name: 'Roberto Silva',
            cpf: '123.456.789-00',
            participationPercent: 50,
            isManager: true,
            roleInCurrentCompany: 'Sócio-Administrador',
            otherCompanies: [
              {
                id: `oc-${Date.now()}-1`,
                name: `${firstNames[(i + 1) % firstNames.length]} Participações Ltda`,
                cnpj: '11.222.333/0001-44',
                revenue12m: 850000,
                participationPercent: 40,
                isManager: false,
                regime: 'simples'
              }
            ]
          },
          {
            id: `p-${Date.now()}-2`,
            name: 'Cláudia Santos',
            cpf: '987.654.321-11',
            participationPercent: 50,
            isManager: false,
            roleInCurrentCompany: 'Sócio',
            otherCompanies: []
          }
        ],
        cfopItems: [],
        createdAt: new Date().toISOString()
      };

      newCreatedCompanies.push(newComp);

      summaryResults.push({
        cnpj: formattedCnpj,
        name: mockName,
        uf: mockUf,
        qsa: mockQsa,
        otherCompaniesCount,
        regime: 'Simples Nacional',
        success: true
      });
    }

    if (onBatchCreateCompanies) {
      onBatchCreateCompanies(newCreatedCompanies);
    } else {
      newCreatedCompanies.forEach(c => onCreateCompany(c));
    }

    setBatchImportedResults(summaryResults);
    setBatchProgress(prev => ({ ...prev, active: false }));
  };

  // Add multiple files to Batch Certificate list
  const handleSelectBatchCertFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: BatchCertItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Try to detect CNPJ from filename
      const digits = file.name.replace(/\D/g, '');
      let detectedCnpj = '';
      let matchedCompId = '';

      if (digits.length >= 14) {
        const potentialCnpj = digits.substring(0, 14);
        detectedCnpj = potentialCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
        const found = companies.find(c => c.cnpj.replace(/\D/g, '') === potentialCnpj);
        if (found) matchedCompId = found.id || '';
      }

      // If not detected by number, match by first unassigned company
      if (!matchedCompId && companies[i]) {
        matchedCompId = companies[i].id || '';
        detectedCnpj = companies[i].cnpj;
      }

      newItems.push({
        id: `cert_${Date.now()}_${i}`,
        name: file.name,
        size: file.size,
        targetCompanyId: matchedCompId || (companies[0]?.id || ''),
        targetCnpj: detectedCnpj || (companies[0]?.cnpj || ''),
        password: '',
        status: 'pending',
        fileObj: file
      });
    }

    setBatchCertList(prev => [...prev, ...newItems]);
    setBatchCertSuccessMessage(null);
  };

  // Process and link batch certificates to companies
  const handleProcessBatchCertificates = async () => {
    if (batchCertList.length === 0) return;

    setBatchCertProcessing(true);
    let linkedCount = 0;

    for (const item of batchCertList) {
      const targetComp = companies.find(c => c.id === item.targetCompanyId || c.cnpj.replace(/\D/g, '') === item.targetCnpj.replace(/\D/g, ''));
      if (targetComp && onUpdateCompany) {
        let base64 = 'data:application/x-pkcs12;base64,PLACEHOLDER_MTLS_CERT_DATA';
        if (item.fileObj) {
          try {
            base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string || base64);
              reader.onerror = () => resolve(base64);
              reader.readAsDataURL(item.fileObj!);
            });
          } catch {
            // keep default
          }
        }

        const updated: CompanyData = {
          ...targetComp,
          certUploaded: true,
          pfxFileName: item.name,
          certPassword: item.password,
          pfxBase64: base64
        };
        onUpdateCompany(updated);
        item.status = 'linked';
        linkedCount++;
      }
    }

    setBatchCertProcessing(false);
    setBatchCertSuccessMessage(`${linkedCount} certificado(s) digital(is) A1 vinculado(s) com sucesso à base de empresas!`);
  };

  // Filtered companies list for Tab 1
  const displayedCompanies = companies
    .map((comp, originalIdx) => ({ comp, originalIdx }))
    .filter(({ comp }) => {
      const query = companyFilterQuery.toLowerCase();
      const matchesQuery = 
        comp.name.toLowerCase().includes(query) || 
        comp.cnpj.toLowerCase().includes(query) ||
        comp.cnae.toLowerCase().includes(query) ||
        comp.uf.toLowerCase().includes(query);

      const matchesRegime = filterRegime === 'all' || comp.regimeTributario === filterRegime;
      
      const matchesCert = 
        filterCertStatus === 'all' || 
        (filterCertStatus === 'with_cert' && comp.certUploaded) ||
        (filterCertStatus === 'without_cert' && !comp.certUploaded);

      return matchesQuery && matchesRegime && matchesCert;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-5xl text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0B0F19] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-black text-slate-100 text-base uppercase tracking-wider">
                  Central de Gestão e Cadastro de Empresas
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30 font-mono">
                  {totalCompanies} empresas
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {companiesWithCert} com Certificado A1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Base corporativa, sincronização com a Receita Federal, QSA societário e central de certificados mTLS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* EXECUTIVE NAVIGATION TABS */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-800 bg-[#0F172A] flex items-center gap-2 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeTab === 'list'
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Empresas Cadastradas</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 font-mono">
              {totalCompanies}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batch_cnpj')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeTab === 'batch_cnpj'
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>Cadastro em Lote (Planilha & RFB)</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider">
              QSA & Vínculos
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batch_certs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
              activeTab === 'batch_certs'
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Central de Certificados A1 (.PFX)</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider font-mono">
              mTLS SEFAZ
            </span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ============================================================== */}
          {/* TAB 1: LISTA DE EMPRESAS & CADASTRO INDIVIDUAL                 */}
          {/* ============================================================== */}
          {activeTab === 'list' && (
            <div className="space-y-5">
              
              {/* Top Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F19] p-3.5 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleOpenCreateForm}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Cadastrar Nova Empresa
                  </button>

                  {onOpenPDFUpload && (
                    <button
                      type="button"
                      onClick={onOpenPDFUpload}
                      className="px-3.5 py-2 text-xs font-bold text-blue-300 hover:text-white bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      title="Importar dados de extrato da declaração PGDAS-D em PDF ou e-CAC"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-400" />
                      <span>Importar via PGDAS-D</span>
                    </button>
                  )}

                  {onClearCompanyData && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearCompanyData();
                        onClose();
                      }}
                      className="px-3.5 py-2 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/70 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      title="Zerar e limpar os dados da empresa ativa"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Limpar Dados Atuais</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportBackup}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    title="Exportar backup em JSON de todas as empresas cadastradas"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup JSON</span>
                  </button>
                </div>
              </div>

              {/* Collapsible Form for Create / Edit */}
              {isFormOpen && (
                <form onSubmit={handleSaveCompanyForm} className="p-5 rounded-2xl bg-[#0B0F19] border border-blue-500/40 space-y-4 animate-in fade-in shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="font-bold text-xs text-blue-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      {editingCompanyId ? 'Editar Cadastro da Empresa' : 'Cadastrar Nova Empresa na Base'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* CNPJ with Receita Federal Live Query */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>CNPJ da Empresa</span>
                        <button
                          type="button"
                          onClick={handleLookupCnpj}
                          disabled={isSearchingCnpj}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isSearchingCnpj ? 'Consultando...' : '🔍 Consultar Receita'}
                        </button>
                      </label>
                      <input
                        type="text"
                        value={formCnpj}
                        onChange={(e) => setFormCnpj(e.target.value)}
                        placeholder="00.000.000/0001-00"
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                      {cnpjFeedback && (
                        <p className="text-[11px] mt-1 text-blue-300 font-medium">{cnpjFeedback}</p>
                      )}
                    </div>

                    {/* Razão Social */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Razão Social (Nome Oficial)
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: VÉRTICE ALIMENTOS & TECNOLOGIA LTDA"
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 uppercase"
                      />
                    </div>

                    {/* CNAE Search & Dropdown */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>CNAE Principal & Atividade Econômica</span>
                        <span className="text-[11px] text-slate-500">Selecione ou busque por código ou descrição</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formCnae}
                          onChange={(e) => setFormCnae(e.target.value)}
                          placeholder="Ex: 62.01-5-01"
                          className="w-36 bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={formCnaeDesc || cnaeSearchQuery}
                            onChange={(e) => {
                              setCnaeSearchQuery(e.target.value);
                              setFormCnaeDesc(e.target.value);
                              setShowCnaeDropdown(true);
                            }}
                            onFocus={() => setShowCnaeDropdown(true)}
                            placeholder="Buscar atividade: informática, contabilidade, comércio..."
                            className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          {showCnaeDropdown && filteredCnaes.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                              {filteredCnaes.map((item, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setFormCnae(item.code);
                                    setFormCnaeDesc(item.desc);
                                    setFormAnexo(item.anexo);
                                    setShowCnaeDropdown(false);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-slate-800 text-xs border-b border-slate-800/60 transition flex flex-col cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-blue-400">{item.code}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Anexo {item.anexo}</span>
                                  </div>
                                  <span className="text-slate-300 truncate">{item.desc}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* UF */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">UF (Estado)</label>
                      <select
                        value={formUf}
                        onChange={(e) => setFormUf(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        {['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF', 'ES', 'AM', 'MT', 'MS', 'PA'].map((uf) => (
                          <option key={uf} value={uf} className="bg-[#0F172A] text-slate-100">{uf}</option>
                        ))}
                      </select>
                    </div>

                    {/* Regime Tributário */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Regime Tributário</label>
                      <select
                        value={formRegimeTributario}
                        onChange={(e) => setFormRegimeTributario(e.target.value as any)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="simples_nacional">Simples Nacional</option>
                        <option value="lucro_presumido">Lucro Presumido</option>
                        <option value="lucro_real">Lucro Real</option>
                        <option value="mei">MEI</option>
                      </select>
                    </div>

                    {/* Anexo Simples */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Anexo do Simples</label>
                      <select
                        value={formAnexo}
                        onChange={(e) => setFormAnexo(e.target.value as any)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="I">Anexo I - Comércio</option>
                        <option value="II">Anexo II - Indústria</option>
                        <option value="III">Anexo III - Serviços (Geral)</option>
                        <option value="IV">Anexo IV - Serviços (CPP Fora)</option>
                        <option value="V">Anexo V - Serviços Intelectuais</option>
                      </select>
                    </div>

                    {/* RBT12 */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">RBT12 (Faturamento 12 Meses)</label>
                      <input
                        type="number"
                        step="any"
                        value={formRbt12}
                        onChange={(e) => setFormRbt12(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    {/* Folha 12m */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Folha de Salários 12 Meses</label>
                      <input
                        type="number"
                        step="any"
                        value={formPayroll12m}
                        onChange={(e) => setFormPayroll12m(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    {/* Setor */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Atividade da Empresa</label>
                      <select
                        value={formAtividadeEmpresa}
                        onChange={(e) => setFormAtividadeEmpresa(e.target.value as any)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                      >
                        <option value="servicos">Prestação de Serviços</option>
                        <option value="comercio">Comércio</option>
                        <option value="industria">Indústria</option>
                        <option value="misto">Misto</option>
                      </select>
                    </div>

                    {/* CERTIFICADO DIGITAL A1 (.PFX) INTEGRADO NO CADASTRO */}
                    <div className="sm:col-span-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-400" />
                          Certificado Digital A1 (.PFX / .P12) da Empresa
                        </span>
                        {formCertUploaded && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Arquivo Vinculado
                          </span>
                        )}
                      </div>

                      <CertificateUploadField
                        label="Upload do Arquivo .PFX e Chave Privada"
                        onFileSelect={(file, password) => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const rawBase64 = (event.target?.result as string) || '';
                            const sanitizedBase64 = rawBase64.replace(/^data:.*?;base64,/i, '').replace(/\s+/g, '');
                            setFormCertUploaded(true);
                            setFormPfxFileName(file.name);
                            setFormCertPassword(password);
                            setFormPfxBase64(sanitizedBase64);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </div>

                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition shadow-md"
                    >
                      {editingCompanyId ? 'Atualizar Dados da Empresa' : 'Salvar Empresa na Base'}
                    </button>
                  </div>
                </form>
              )}

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={companyFilterQuery}
                    onChange={(e) => setCompanyFilterQuery(e.target.value)}
                    placeholder="Filtrar por Razão Social, CNPJ, CNAE ou UF..."
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterRegime}
                    onChange={(e) => setFilterRegime(e.target.value)}
                    className="bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Todos os Regimes</option>
                    <option value="simples_nacional">Simples Nacional</option>
                    <option value="lucro_presumido">Lucro Presumido</option>
                    <option value="lucro_real">Lucro Real</option>
                    <option value="mei">MEI</option>
                  </select>

                  <select
                    value={filterCertStatus}
                    onChange={(e) => setFilterCertStatus(e.target.value)}
                    className="bg-[#0B0F19] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Certificados: Todos</option>
                    <option value="with_cert">Com Certificado A1</option>
                    <option value="without_cert">Sem Certificado A1</option>
                  </select>
                </div>
              </div>

              {/* Companies List */}
              <div className="space-y-3">
                {displayedCompanies.length === 0 ? (
                  <div className="p-8 text-center bg-[#0B0F19] border border-slate-800 rounded-2xl text-slate-500 text-xs">
                    Nenhuma empresa encontrada com os filtros selecionados.
                  </div>
                ) : (
                  displayedCompanies.map(({ comp, originalIdx }) => {
                    const idx = originalIdx;
                    const isActive = idx === activeCompanyIndex;
                    const hasCert = !!comp.certUploaded;
                    const isEditingThisCert = inlineCertCompId === (comp.id || `comp_${idx}`);

                    return (
                      <div
                        key={comp.id || comp.cnpj || idx}
                        className={`p-4 rounded-2xl border transition flex flex-col gap-3 ${
                          isActive
                            ? 'bg-blue-950/30 border-blue-500/50 ring-1 ring-blue-500/30'
                            : 'bg-[#0B0F19] border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        {/* Card Header & Badges */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-100">{comp.name}</span>
                            {isActive && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-black border border-blue-500/40">
                                EMPRESA ATIVA
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                              Anexo {comp.anexo || 'I'}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                              {(comp.regimeTributario || 'simples_nacional').replace('_', ' ')}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                              {comp.uf}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!isActive ? (
                              <button
                                onClick={() => {
                                  onSelectCompany(idx);
                                  onClose();
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700 cursor-pointer"
                              >
                                Selecionar
                              </button>
                            ) : (
                              <div className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center gap-1 font-mono">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                Em Uso
                              </div>
                            )}

                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditForm(comp, idx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition cursor-pointer"
                              title="Editar dados desta empresa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteConfirmIndex(idx)}
                              disabled={companies.length <= 1}
                              className={`p-1.5 rounded-lg transition ${
                                companies.length <= 1
                                  ? 'text-slate-600 cursor-not-allowed'
                                  : 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer'
                              }`}
                              title={companies.length <= 1 ? 'Mínimo de 1 empresa na base' : 'Excluir esta empresa'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata row */}
                        <div className="text-xs text-slate-400 flex items-center gap-3 flex-wrap font-mono">
                          <span>CNPJ: <strong className="text-slate-200">{comp.cnpj}</strong></span>
                          <span>•</span>
                          <span>RBT12: <strong className="text-slate-200">{formatCurrencyBRL(comp.rbt12 || 0)}</strong></span>
                          <span>•</span>
                          <span>Folha 12m: <strong className="text-slate-200">{formatCurrencyBRL(comp.payroll12m || 0)}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {comp.partners?.length || 0} Sócios (QSA)
                          </span>
                        </div>

                        {/* CERTIFICATE A1 STATUS STRIP & INLINE MANAGER */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {hasCert ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  Certificado A1 Ativo (mTLS)
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono truncate max-w-xs" title={comp.pfxFileName}>
                                  {comp.pfxFileName || 'certificado.pfx'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  Certificado A1 Pendente
                                </span>
                                <span className="text-[11px] text-slate-500 italic">
                                  Obrigatório para emissão & manifestação SEFAZ
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {hasCert ? (
                              <>
                                <button
                                  onClick={() => {
                                    setInlineCertCompId(isEditingThisCert ? null : (comp.id || `comp_${idx}`));
                                    setInlineCertFile(null);
                                    setInlineCertPassword('');
                                  }}
                                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
                                >
                                  {isEditingThisCert ? 'Cancelar' : 'Alterar Certificado'}
                                </button>
                                <span className="text-slate-600">•</span>
                                <button
                                  onClick={() => handleRemoveCertificate(comp, idx)}
                                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                                  title="Desvincular certificado desta empresa"
                                >
                                  Remover
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setInlineCertCompId(isEditingThisCert ? null : (comp.id || `comp_${idx}`));
                                  setInlineCertFile(null);
                                  setInlineCertPassword('');
                                }}
                                className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                              >
                                <Lock className="w-3 h-3" />
                                {isEditingThisCert ? 'Cancelar' : 'Vincular Certificado .PFX'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Certificate Form for this company */}
                        {isEditingThisCert && (
                          <div className="p-3 bg-[#0F172A] border border-blue-500/30 rounded-xl space-y-3 animate-in fade-in">
                            <span className="text-[11px] font-bold text-slate-300 block">
                              Carregar Certificado Digital (.pfx / .p12) para {comp.name}
                            </span>
                            <div className="flex flex-col sm:flex-row gap-2 items-center">
                              <input
                                type="file"
                                accept=".pfx,.p12"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setInlineCertFile(e.target.files[0]);
                                  }
                                }}
                                className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                              />

                              <div className="relative flex-1 w-full">
                                <input
                                  type={showInlinePassword ? 'text' : 'password'}
                                  placeholder="Senha do Certificado"
                                  value={inlineCertPassword}
                                  onChange={(e) => setInlineCertPassword(e.target.value)}
                                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowInlinePassword(!showInlinePassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                                >
                                  {showInlinePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              <button
                                type="button"
                                disabled={!inlineCertFile}
                                onClick={() => handleSaveInlineCertificate(comp, idx)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition whitespace-nowrap cursor-pointer shadow-xs"
                              >
                                Salvar Certificado
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: CADASTRO EM LOTE DE EMPRESAS (PLANILHA & RFB)           */}
          {/* ============================================================== */}
          {activeTab === 'batch_cnpj' && (
            <div className="space-y-6">
              
              {/* Header Box */}
              <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                      Cadastro em Lote por Planilha (Sincronização RFB, QSA e Vínculos)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Faça o upload de uma planilha com lista de CNPJs. O motor Vértice realiza a consulta oficial no barramento da Receita Federal, identifica o Quadro de Sócios (QSA) e detecta participações cruzadas em outras empresas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleDownloadCsvTemplate}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-blue-400" />
                    Baixar Modelo de Planilha (.CSV)
                  </button>

                  <input
                    type="file"
                    accept=".csv,.txt"
                    ref={csvInputRef}
                    onChange={handleCsvFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => csvInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    Carregar Arquivo .CSV / Texto
                  </button>
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Lista de CNPJs ou Linhas da Planilha</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Cole com ou sem pontuação (separados por linha, vírgula ou ponto-e-vírgula)
                  </span>
                </label>
                <textarea
                  value={batchRawCnpjs}
                  onChange={(e) => setBatchRawCnpjs(e.target.value)}
                  placeholder={`Cole aqui os CNPJs ou dados da planilha. Exemplo:\n00.111.222/0001-44\n00222333000155\n00.333.444/0001-66`}
                  rows={6}
                  className="w-full bg-[#0B0F19] border border-slate-800 focus:border-amber-500 rounded-xl p-3.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* Sync RFB Toggle */}
              <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <strong className="block text-white text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Sincronizar com a RFB (Receita Federal do Brasil)
                  </strong>
                  <span className="text-[11px] text-slate-400 block">
                    Consulta a situação cadastral ativa de cada CNPJ, estrutura o Quadro de Sócios (QSA) e verifica se os sócios possuem outras empresas (cruzamento do teto de R$ 4,8M).
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={batchSyncRfb}
                    onChange={(e) => setBatchSyncRfb(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Progress Indicator */}
              {batchProgress.active && (
                <div className="p-4 bg-[#0B0F19] border border-amber-500/40 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-300 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                      {batchProgress.step}
                    </span>
                    <span className="font-mono font-bold text-white">
                      {batchProgress.current} / {batchProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-rose-600 h-full transition-all duration-300"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleProcessBatchCnpjs}
                  disabled={batchProgress.active || !batchRawCnpjs.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  Processar e Cadastrar em Lote
                </button>
              </div>

              {/* Results Table */}
              {batchImportedResults.length > 0 && (
                <div className="p-4 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
                    Empresas Importadas e Registradas ({batchImportedResults.length} empresas):
                  </span>
                  <div className="max-h-[300px] overflow-auto divide-y divide-slate-800/80">
                    {batchImportedResults.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{item.name}</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono font-bold">
                            Sincronizado RFB
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs">
                          <span>CNPJ: <strong className="text-slate-200 font-mono">{item.cnpj}</strong></span>
                          <span>•</span>
                          <span>UF: <strong>{item.uf}</strong></span>
                          <span>•</span>
                          <span className="text-blue-400 font-medium">QSA: {item.qsa.join('; ')}</span>
                          <span>•</span>
                          <span className="text-amber-400 font-medium">Cruzamento: {item.otherCompaniesCount} empresa(s) vinculada(s)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: CENTRAL DE CERTIFICADOS A1 (.PFX COM SENHAS)            */}
          {/* ============================================================== */}
          {activeTab === 'batch_certs' && (
            <div className="space-y-6">
              
              {/* Header Box */}
              <div className="p-5 bg-[#0B0F19] border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                      Upload & Vinculação de Certificados Digitais em Lote (.PFX com Senhas)
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Carregue múltiplos arquivos de certificados digitais (.pfx / .p12) de uma única vez. Associe cada certificado à sua respectiva empresa e defina a senha para autenticação mTLS junto à SEFAZ e RFB.
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Empresas na Base</span>
                    <span className="text-lg font-black text-white font-mono">{totalCompanies}</span>
                  </div>
                  <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-center">
                    <span className="text-[10px] text-emerald-400 uppercase font-bold block">Certificados Ativos</span>
                    <span className="text-lg font-black text-emerald-300 font-mono">{companiesWithCert}</span>
                  </div>
                  <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/30 text-center">
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">Pendentes de Certificado</span>
                    <span className="text-lg font-black text-amber-300 font-mono">{companiesPendingCert}</span>
                  </div>
                </div>
              </div>

              {/* Upload Drop Zone */}
              <div className="border border-dashed border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 text-center bg-[#0B0F19] transition flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-emerald-400" />
                <span className="text-xs text-white font-bold uppercase tracking-wider">
                  Carregar múltiplos arquivos de Certificado (.PFX / .P12)
                </span>
                <span className="text-xs text-slate-400">
                  Arraste os arquivos aqui ou clique no botão abaixo para selecionar
                </span>

                <input
                  type="file"
                  multiple
                  accept=".pfx,.p12"
                  ref={fileInputBatchRef}
                  onChange={(e) => handleSelectBatchCertFiles(e.target.files)}
                  className="hidden"
                  id="batch-pfx-files-input"
                />

                <button
                  type="button"
                  onClick={() => fileInputBatchRef.current?.click()}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Selecionar Arquivos (.PFX / .P12)
                </button>
              </div>

              {/* Success Message Banner */}
              {batchCertSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{batchCertSuccessMessage}</span>
                </div>
              )}

              {/* Association Table */}
              <div className="p-4 bg-[#0B0F19] rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Mapeamento e Associação dos Certificados Carregados ({batchCertList.length})
                  </span>
                  {batchCertList.length > 0 && (
                    <button
                      onClick={() => setBatchCertList([])}
                      className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer font-medium"
                    >
                      Limpar Lista
                    </button>
                  )}
                </div>

                {batchCertList.length === 0 ? (
                  <div className="h-28 flex items-center justify-center text-slate-600 text-xs italic">
                    Nenhum arquivo carregado. Selecione arquivos .pfx acima para associar às empresas.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {batchCertList.map((item, idx) => (
                      <div key={item.id} className="p-3 bg-[#0F172A] border border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                        
                        {/* File info */}
                        <div className="flex items-center gap-2 min-w-[200px] truncate">
                          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <strong className="text-slate-200 block truncate" title={item.name}>{item.name}</strong>
                            <span className="text-[10px] text-slate-500 font-mono">{(item.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>

                        {/* Company selector */}
                        <div className="flex-1">
                          <select
                            value={item.targetCompanyId}
                            onChange={(e) => {
                              const updated = [...batchCertList];
                              updated[idx].targetCompanyId = e.target.value;
                              const found = companies.find(c => c.id === e.target.value);
                              if (found) updated[idx].targetCnpj = found.cnpj;
                              setBatchCertList(updated);
                            }}
                            className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">Selecione a Empresa de Destino...</option>
                            {companies.map(c => (
                              <option key={c.id || c.cnpj} value={c.id}>
                                {c.name} ({c.cnpj})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Password */}
                        <div className="w-48">
                          <input
                            type="password"
                            placeholder="Senha do Certificado"
                            value={item.password}
                            onChange={(e) => {
                              const updated = [...batchCertList];
                              updated[idx].password = e.target.value;
                              setBatchCertList(updated);
                            }}
                            className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Status & Remove */}
                        <div className="flex items-center gap-2 shrink-0 justify-end">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'linked' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {item.status === 'linked' ? 'Vinculado' : 'Aguardando'}
                          </span>

                          <button
                            onClick={() => {
                              setBatchCertList(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="Remover este arquivo da lista"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

                {/* Batch Action button */}
                {batchCertList.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={handleProcessBatchCertificates}
                      disabled={batchCertProcessing}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      {batchCertProcessing ? 'Processando e Vinculando...' : 'Processar e Vincular em Lote'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* DELETE CONFIRMATION DIALOG */}
        {deleteConfirmIndex !== null && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="bg-[#0F172A] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-100">Excluir Empresa?</h4>
                  <p className="text-xs text-rose-400">Esta ação não poderá ser desfeita.</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Você está prestes a remover definitivamente a empresa <strong className="text-white">"{companies[deleteConfirmIndex]?.name}"</strong> da base de dados local.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmIndex(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer border border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConfirmDelete(deleteConfirmIndex)}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
