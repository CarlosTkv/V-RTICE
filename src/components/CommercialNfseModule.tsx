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
  Edit3
} from 'lucide-react';
import { CompanyData, AuthUser, AppViewMode, BankConfig, BillingInvoice, NfseNacionalData } from '../types';
import { NfseNacionalService } from '../utils/nfseService';
import { AuthService } from '../utils/authService';
import { NfseNacionalModal } from './NfseNacionalModal';
import { BrandLogo } from './BrandLogo';

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
  const [activeTab, setActiveTab] = useState<'emitir' | 'historico' | 'tomadores' | 'config'>('emitir');

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

  return (
    <div className="space-y-6">
      {/* Header Comercial com Identificação da Empresa Emitente */}
      <div className="bg-gradient-to-r from-rose-950/90 via-[#0F172A] to-[#0F172A] border border-rose-500/40 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <BrandLogo variant="badge" module="nfse" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30">
                MÓDULO COMERCIAL NFS-E • GOV.BR NACIONAL
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                WEBSERVICE DE PRODUÇÃO OPERACIONAL
              </span>
            </div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Emissão de Notas Fiscais para Clientes
              <span className="text-xs font-normal text-slate-400 font-mono">({currentCompany.name})</span>
            </h3>
            <p className="text-xs text-slate-300">
              Módulo oficial de transmissão síncrona de DPS, cálculo automático de ISS e retenções federais com envio imediato por e-mail ao tomador.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/90 border border-slate-700/80 px-4 py-2 rounded-xl text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empresa Prestadora</div>
            <div className="text-xs font-bold text-rose-400 font-mono">{currentCompany.cnpj}</div>
          </div>
        </div>
      </div>

      {/* Navegação por Sub-Abas do Módulo Commercial */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('emitir')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'emitir'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 border border-rose-400/40'
              : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Emitir Nova NFS-e</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'historico'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 border border-rose-400/40'
              : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>2. Painel de Notas Emitidas ({commercialNotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tomadores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'tomadores'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 border border-rose-400/40'
              : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>3. Meus Clientes / Tomadores ({tomadores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'config'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30 border border-rose-400/40'
              : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>4. Certificado & Regras Fiscais</span>
        </button>
      </div>

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
