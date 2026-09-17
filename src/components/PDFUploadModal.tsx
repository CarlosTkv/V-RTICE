import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  ArrowRight,
  ClipboardPaste,
  Sparkles,
  Info,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Building,
  Users,
  Search,
  RefreshCw,
  Check,
  BadgeAlert,
  AlertTriangle,
  Percent,
  TrendingUp,
  Calculator
} from 'lucide-react';
import { extractPGDASFromPDF, parsePGDASText, ExtractedPGDASData } from '../utils/pdfParser';
import { CompanyData, SimplesAnexo, CompanyAddress, CompanyRFBValidation, Partner, SavedSimulation, EcacRevenueClassification, RevenueSituationType } from '../types';
import { formatCurrencyBRL } from '../utils/taxRules';
import { findEcacOptionByText } from '../utils/ecacCatalog';
import { 
  validateCompanyWithRFB, 
  formatCNPJ, 
  sanitizeDoc, 
  CNPJApiResponse, 
  buildFormattedAddress 
} from '../utils/cnpjService';

interface PDFUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExtractedData: (data: Partial<CompanyData>) => void;
}

export const PDFUploadModal: React.FC<PDFUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyExtractedData,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedPGDASData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');

  // Editable preview state
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCnpj, setEditCnpj] = useState('');
  const [editRbt12, setEditRbt12] = useState<string>('');
  const [editRba, setEditRba] = useState<string>('');
  const [editRbaa, setEditRbaa] = useState<string>('');
  const [editMonthlyRevenue, setEditMonthlyRevenue] = useState<string>('');
  const [editPayroll12m, setEditPayroll12m] = useState<string>('');
  const [editFatorRPercent, setEditFatorRPercent] = useState<string>('');
  const [editFatorRValue, setEditFatorRValue] = useState<string>('');
  const [editAnexo, setEditAnexo] = useState<SimplesAnexo>('III');
  const [editPeriod, setEditPeriod] = useState<string>('');
  const [editUf, setEditUf] = useState<string>('SP');
  const [editCity, setEditCity] = useState<string>('');

  // Receita Federal (RFB) Validation state
  const [rfbLoading, setRfbLoading] = useState(false);
  const [rfbData, setRfbData] = useState<CNPJApiResponse | null>(null);
  const [rfbValidation, setRfbValidation] = useState<CompanyRFBValidation | null>(null);
  const [rfbAddress, setRfbAddress] = useState<CompanyAddress | null>(null);
  const [rfbPartners, setRfbPartners] = useState<Partner[]>([]);
  const [rfbError, setRfbError] = useState<string | null>(null);

  // Sync checkboxes (default false to prevent overwriting document with external API data)
  const [syncOfficialAddress, setSyncOfficialAddress] = useState(false);
  const [syncOfficialName, setSyncOfficialName] = useState(false);
  const [syncOfficialQSA, setSyncOfficialQSA] = useState(false);
  const [archiveInHistory, setArchiveInHistory] = useState(true);

  if (!isOpen) return null;

  // Trigger RFB validation for a given CNPJ
  const runRFBValidation = async (cnpjToValidate: string, declaredName?: string) => {
    const clean = sanitizeDoc(cnpjToValidate);
    if (clean.length !== 14) {
      setRfbError('CNPJ deve conter 14 dígitos para validação com a Receita Federal.');
      return;
    }

    setRfbLoading(true);
    setRfbError(null);

    try {
      const result = await validateCompanyWithRFB(clean, declaredName || editCompanyName);
      setRfbData(result.rfbData);
      setRfbValidation(result.validation);
      setRfbAddress(result.address);
      setRfbPartners(result.partners);
      if (result.rfbData.uf) {
        setEditUf(result.rfbData.uf);
      }
      if (result.rfbData.municipio) {
        setEditCity(result.rfbData.municipio);
      }
    } catch (err: any) {
      console.warn('RFB validation notice:', err);
      setRfbError(err.message || 'Não foi possível validar os dados do CNPJ na Receita Federal no momento.');
    } finally {
      setRfbLoading(false);
    }
  };

  const populateEditableFields = (data: ExtractedPGDASData) => {
    setExtracted(data);
    setEditCompanyName(data.companyName || '');
    const cleanCnpj = data.cnpj ? formatCNPJ(data.cnpj) : '';
    setEditCnpj(cleanCnpj);

    // Regra Fundamental do Simples Nacional: Toda empresa que possui RBA possui RBT12
    const resolvedRbt12 = (data.rbt12 !== undefined && data.rbt12 > 0)
      ? data.rbt12
      : (data.rba !== undefined && data.rba > 0
          ? data.rba
          : (data.monthlyRevenue !== undefined && data.monthlyRevenue > 0 ? data.monthlyRevenue * 12 : undefined));

    setEditRbt12(resolvedRbt12 !== undefined ? resolvedRbt12.toString() : '');
    setEditRba(data.rba !== undefined ? data.rba.toString() : '');
    setEditRbaa(data.rbaa !== undefined ? data.rbaa.toString() : '');
    
    // Compute or set monthly revenue accurately
    const totalRev = data.monthlyRevenue !== undefined && data.monthlyRevenue > 0
      ? data.monthlyRevenue
      : (data.activities && data.activities.length > 0
          ? data.activities.reduce((acc, a) => acc + (a.revenue || 0), 0)
          : (data.monthlyRevenue !== undefined ? data.monthlyRevenue : ''));

    setEditMonthlyRevenue(totalRev !== '' && totalRev !== undefined ? totalRev.toString() : '');
    setEditPayroll12m(data.payroll12m !== undefined ? data.payroll12m.toString() : '');
    setEditAnexo(data.anexo || 'III');
    setEditPeriod(data.period || '');
    if (data.uf) {
      setEditUf(data.uf);
    }
    if (data.city) {
      setEditCity(data.city);
    } else if (data.address?.municipio) {
      setEditCity(data.address.municipio);
    }

    // Fator R (% e Valor em R$ aplicado sobre o Faturamento do Mês)
    let initialFatorRPercent = data.fatorRCalculated;
    const numRbt = resolvedRbt12;
    const numFs12 = data.payroll12m;
    if (data.subjectToFatorR === false) {
      initialFatorRPercent = 0;
    } else if (initialFatorRPercent === undefined && numFs12 !== undefined && numRbt && numRbt > 0) {
      initialFatorRPercent = (numFs12 / numRbt) * 100;
    } else if (initialFatorRPercent === undefined && numFs12 === 0 && numRbt && numRbt > 0) {
      initialFatorRPercent = 0;
    }

    const parsedMonthlyRev = typeof totalRev === 'number'
      ? totalRev
      : (typeof totalRev === 'string' && totalRev !== '' ? (parseFloat(totalRev) || 0) : 0);

    let initialFatorRValue = data.fatorRValue;
    if (data.subjectToFatorR === false) {
      initialFatorRValue = 0;
    } else if (initialFatorRValue === undefined && initialFatorRPercent !== undefined && parsedMonthlyRev >= 0) {
      initialFatorRValue = Math.round(parsedMonthlyRev * (initialFatorRPercent / 100) * 100) / 100;
    }

    setEditFatorRPercent(initialFatorRPercent !== undefined ? initialFatorRPercent.toFixed(2) : '');
    setEditFatorRValue(initialFatorRValue !== undefined ? initialFatorRValue.toFixed(2) : '');

    // Auto-run Receita Federal validation if CNPJ was extracted
    if (cleanCnpj && sanitizeDoc(cleanCnpj).length === 14) {
      runRFBValidation(cleanCnpj, data.companyName);
    } else {
      setRfbData(null);
      setRfbValidation(null);
      setRfbAddress(null);
      setRfbPartners([]);
      setRfbError(null);
    }
  };

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor, selecione um arquivo em formato PDF.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await extractPGDASFromPDF(file);
      populateEditableFields(result);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || 
        'Não foi possível extrair dados estruturados deste PDF. Caso seja um documento escaneado sem OCR, use a aba "Colar Texto" para inserir os dados.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      setError('Por favor, cole o texto da declaração do PGDAS-D no campo abaixo.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = parsePGDASText(pastedText);
      if (!result.rbt12 && !result.cnpj && !result.companyName && !result.monthlyRevenue) {
        setError('Não foram encontrados campos fiscais reconhecíveis no texto colado. Verifique o texto ou use os campos editáveis abaixo.');
      }
      populateEditableFields(result);
    } catch (err: any) {
      setError('Erro ao processar o texto informado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    const sampleText = `
PROGRAMA GERADOR DO DOCUMENTO DE ARRECADAÇÃO DO SIMPLES NACIONAL - DECLARATÓRIO (PGDAS-D)
EXTRATO DA DECLARAÇÃO - TRANSMITIDA COM SUCESSO
Identificação da Pessoa Jurídica:
Razão Social: ALFA TECH CONSULTORIA EM TECNOLOGIA E SERVICOS LTDA
CNPJ Matriz: 12.345.678/0001-90
Período de Apuração (PA): 01/2026
Endereço: Avenida Paulista, Nº 1374 - Bela Vista - São Paulo/SP - CEP: 01310-100

1. Receita Bruta Acumulada nos 12 meses anteriores ao PA (RBT12): R$ 4.450.000,00
2. Receita Bruta Acumulada no ano-calendário anterior (RBT12a): R$ 4.200.000,00
3. Receita Bruta Acumulada no ano-calendário corrente (RBA): R$ 4.100.000,00
4. Receita do Período de Apuração (PA): R$ 380.000,00
5. Folha de Salários / Encargos nos 12 meses anteriores (FS12): R$ 1.290.500,00
6. Fator r calculado: 0,2900 (29,00%) - Tributação pelo Anexo III
7. Valor devido do Simples Nacional: R$ 56.430,00
CNAE Principal: 62.01-5-01 - Desenvolvimento de programas de computador sob encomenda
    `;
    setPastedText(sampleText);
    const parsed = parsePGDASText(sampleText);
    populateEditableFields(parsed);
    setError(null);
  };

  const handleLoadTransportSample = () => {
    const transportSample = `
PROGRAMA GERADOR DO DOCUMENTO DE ARRECADAÇÃO DO SIMPLES NACIONAL - DECLARATÓRIO (PGDAS-D)
EXTRATO DA DECLARAÇÃO - TRANSMITIDA COM SUCESSO
Identificação da Pessoa Jurídica:
Razão Social: ODRESKI TRANSPORTE E LOGISTICA LTDA
CNPJ Matriz: 28.745.912/0001-44
Período de Apuração (PA): 01/2026
Município: Curitiba / PR - CEP: 81000-000

1. Receita Bruta Acumulada nos 12 meses anteriores ao PA (RBT12): R$ 1.857.769,63
2. Receita Bruta Acumulada no ano-calendário corrente (RBA): R$ 148.450,20
3. Receita do Período de Apuração (PA): R$ 148.450,20
4. Folha de Salários incluídos encargos dos 12 meses anteriores (FS12): R$ 520.175,50
5. Total a recolher do Simples Nacional: R$ 17.426,73

Atividades Econômicas com Receita no Período de Apuração:
1. Prestação de Serviços, exceto para o exterior
Não sujeitos ao fator "r" e tributados pelo Anexo III, com retenção/substituição tributária de ISS
Receita Bruta Informada: R$ 30.118,20

2. Serviços de comunicação; de transporte intermunicipal e interestadual de carga
Tributados pelo Anexo III c/c Art. 18 § 5º-E da LC 123/06 (Parcela de ICMS do Anexo I)
Transporte sem substituição tributária de ICMS - Estado: PR
Percentual de redução do ICMS (Decreto Estadual 8.660/2018): 11,40%
Receita Bruta Informada: R$ 118.332,00
CNAE Principal: 49.30-2-02 - Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal, interestadual e internacional
    `;
    setPastedText(transportSample);
    const parsed = parsePGDASText(transportSample);
    populateEditableFields(parsed);
    setError(null);
  };

  const handleLoadOdontoSample = () => {
    const odontoSample = `
1. Identificação do Contribuinte
CNPJ Matriz: 23.277.116/0001-78
Nome empresarial: C.L. ODONTOLOGIA S/S LTDA
Data de abertura no CNPJ: 25/08/2015
Optante pelo Simples Nacional: Sim
Regime de Apuração: Competência
Nº da Declaração: 23277116202607001
1.1 CNPJ das filiais presentes nesta declaração:
Nenhuma
.
2.Apuração do Simples Nacional
2.1 Discriminativo de Receitas
Total de Receitas Brutas (R$) Mercado Interno Mercado Externo Total
Receita Bruta do PA (RPA) - Competência 0,00 0,00 0,00
Receita bruta acumulada nos doze meses anteriores
ao PA (RBT12) 1.450,00 0,00 1.450,00
Receita bruta acumulada no ano-calendário corrente
(RBA) 1.450,00 0,00 1.450,00
Receita bruta acumulada no ano-calendário anterior
(RBAA) 9.010,00 0,00 9.010,00
Limite de receita bruta proporcionalizado 4.800.000,00 4.800.000,00
2.2) Receitas Brutas Anteriores
2.2.1) Mercado Interno
Período de Apuração Valor (R$)
06/2026 0,00
05/2026 0,00
04/2026 0,00
03/2026 0,00
02/2026 0,00
01/2026 0,00
12/2025 0,00
11/2025 0,00
10/2025 0,00
09/2025 0,00
08/2025 1.450,00
07/2025 0,00
2.3) Informações Complementares
Folha de Salários / Encargos nos 12 meses anteriores: 0,00
Fator r: Não se aplica
Endereço: Rua XV de Novembro, 100 - Colombo / PR - CEP: 83400-000
`;
    setPastedText(odontoSample);
    const parsed = parsePGDASText(odontoSample);
    populateEditableFields(parsed);
    setError(null);
  };

  const handleManualRFBValidation = () => {
    if (!editCnpj) {
      setRfbError('Digite um CNPJ válido para consultar na Receita Federal.');
      return;
    }
    runRFBValidation(editCnpj, editCompanyName);
  };

  // Recalculate Fator R when Monthly Revenue changes
  const handleMonthlyRevenueChange = (val: string) => {
    setEditMonthlyRevenue(val);
    const parsedMonthly = parseFloat(val);
    const currentPercent = parseFloat(editFatorRPercent);
    if (!isNaN(parsedMonthly) && !isNaN(currentPercent)) {
      const newVal = Math.round(parsedMonthly * (currentPercent / 100) * 100) / 100;
      setEditFatorRValue(newVal.toFixed(2));
    } else if (isNaN(parsedMonthly)) {
      setEditFatorRValue('');
    }

    if (extracted && !isNaN(parsedMonthly)) {
      if (extracted.activities && extracted.activities.length === 1) {
        setExtracted({
          ...extracted,
          monthlyRevenue: parsedMonthly,
          activities: [{ ...extracted.activities[0], revenue: parsedMonthly }]
        });
      } else {
        setExtracted({
          ...extracted,
          monthlyRevenue: parsedMonthly
        });
      }
    }
  };

  // Recalculate Fator R when Payroll 12m (FS12) changes
  const handlePayroll12mChange = (val: string) => {
    setEditPayroll12m(val);
    const parsedPayroll = parseFloat(val);
    const parsedRbt = parseFloat(editRbt12);
    const parsedMonthly = parseFloat(editMonthlyRevenue);
    if (!isNaN(parsedPayroll) && !isNaN(parsedRbt) && parsedRbt > 0) {
      const newPercent = (parsedPayroll / parsedRbt) * 100;
      setEditFatorRPercent(newPercent.toFixed(2));
      if (!isNaN(parsedMonthly) && parsedMonthly >= 0) {
        const newVal = Math.round(parsedMonthly * (newPercent / 100) * 100) / 100;
        setEditFatorRValue(newVal.toFixed(2));
      }
    }
  };

  // Recalculate Fator R when RBT12 changes
  const handleRbt12Change = (val: string) => {
    setEditRbt12(val);
    const parsedRbt = parseFloat(val);
    const parsedPayroll = parseFloat(editPayroll12m);
    const parsedMonthly = parseFloat(editMonthlyRevenue);
    if (!isNaN(parsedPayroll) && !isNaN(parsedRbt) && parsedRbt > 0) {
      const newPercent = (parsedPayroll / parsedRbt) * 100;
      setEditFatorRPercent(newPercent.toFixed(2));
      if (!isNaN(parsedMonthly) && parsedMonthly >= 0) {
        const newVal = Math.round(parsedMonthly * (newPercent / 100) * 100) / 100;
        setEditFatorRValue(newVal.toFixed(2));
      }
    }
  };

  // Toda empresa que possui RBA possui RBT12: sincroniza RBT12 se estiver vazio ou zerado
  const handleRbaChange = (val: string) => {
    setEditRba(val);
    const parsedRba = parseFloat(val);
    const parsedRbt = parseFloat(editRbt12);
    if ((!editRbt12 || isNaN(parsedRbt) || parsedRbt === 0) && !isNaN(parsedRba) && parsedRba > 0) {
      handleRbt12Change(val);
    }
  };

  // Recalculate Value and FS12 when user edits Fator R (%) directly
  const handleFatorRPercentChange = (val: string) => {
    setEditFatorRPercent(val);
    const parsedPercent = parseFloat(val);
    const parsedMonthly = parseFloat(editMonthlyRevenue);
    const parsedRbt = parseFloat(editRbt12);
    if (!isNaN(parsedPercent)) {
      if (!isNaN(parsedMonthly) && parsedMonthly >= 0) {
        const newVal = Math.round(parsedMonthly * (parsedPercent / 100) * 100) / 100;
        setEditFatorRValue(newVal.toFixed(2));
      }
      if (!isNaN(parsedRbt) && parsedRbt > 0) {
        const newPayroll12m = Math.round(((parsedRbt * parsedPercent) / 100) * 100) / 100;
        setEditPayroll12m(newPayroll12m.toFixed(2));
      }
    }
  };

  // Recalculate Fator R (%) and FS12 when user edits Fator R Value (R$) directly
  const handleFatorRValueChange = (val: string) => {
    setEditFatorRValue(val);
    const parsedVal = parseFloat(val);
    const parsedMonthly = parseFloat(editMonthlyRevenue);
    const parsedRbt = parseFloat(editRbt12);
    if (!isNaN(parsedVal) && !isNaN(parsedMonthly) && parsedMonthly > 0) {
      const newPercent = (parsedVal / parsedMonthly) * 100;
      setEditFatorRPercent(newPercent.toFixed(2));
      if (!isNaN(parsedRbt) && parsedRbt > 0) {
        const newPayroll12m = Math.round(((parsedRbt * newPercent) / 100) * 100) / 100;
        setEditPayroll12m(newPayroll12m.toFixed(2));
      }
    }
  };

  const handleApply = () => {
    const updates: Partial<CompanyData> = {};
    
    if (editRbt12 && !isNaN(parseFloat(editRbt12)) && parseFloat(editRbt12) > 0) {
      updates.rbt12 = parseFloat(editRbt12);
    } else if (editRba && !isNaN(parseFloat(editRba)) && parseFloat(editRba) > 0) {
      // Regra Fundamental: Toda empresa que possui RBA possui RBT12
      updates.rbt12 = parseFloat(editRba);
    }
    if (editRba && !isNaN(parseFloat(editRba))) {
      updates.rba = parseFloat(editRba);
    }
    if (editMonthlyRevenue && !isNaN(parseFloat(editMonthlyRevenue))) {
      updates.monthlyRevenue = parseFloat(editMonthlyRevenue);
    }
    if (editPayroll12m && !isNaN(parseFloat(editPayroll12m))) {
      updates.payroll12m = parseFloat(editPayroll12m);
    }

    // Sincronização da folha do mês com o valor apurado do Fator R
    if (editFatorRValue && !isNaN(parseFloat(editFatorRValue)) && parseFloat(editFatorRValue) >= 0) {
      updates.monthlyPayroll = parseFloat(editFatorRValue);
    } else if (updates.payroll12m && updates.payroll12m > 0) {
      updates.monthlyPayroll = Math.round((updates.payroll12m / 12) * 100) / 100;
    }
    
    // Company name
    if (syncOfficialName && rfbData?.razao_social) {
      updates.name = rfbData.razao_social;
    } else if (editCompanyName.trim()) {
      updates.name = editCompanyName.trim();
    }

    if (editCnpj.trim()) {
      updates.cnpj = formatCNPJ(editCnpj.trim());
    }
    if (editAnexo) {
      updates.anexo = editAnexo;
    }
    if (editUf) {
      updates.uf = editUf;
    }

    if (editCity.trim()) {
      updates.city = editCity.trim();
    } else if (extracted?.city) {
      updates.city = extracted.city;
    }

    if (editRbaa && !isNaN(parseFloat(editRbaa))) {
      updates.rbaa = parseFloat(editRbaa);
    } else if (extracted?.rbaa !== undefined) {
      updates.rbaa = extracted.rbaa;
    }

    // CNAE from RFB or extracted
    if (rfbData?.cnae_fiscal && rfbData.cnae_fiscal !== 'Sem dados disponíveis') {
      updates.cnae = rfbData.cnae_fiscal;
      updates.cnaeDescription = rfbData.cnae_fiscal_descricao;
    } else if (extracted?.cnae) {
      updates.cnae = extracted.cnae;
      if (extracted.cnaeDescription) updates.cnaeDescription = extracted.cnaeDescription;
    }

    // Address synchronization
    if (syncOfficialAddress && rfbAddress) {
      updates.address = rfbAddress;
    } else if (extracted?.address) {
      updates.address = extracted.address;
    }

    // Cadastral situation & RFB validation audit record
    if (rfbValidation) {
      updates.rfbValidation = rfbValidation;
      updates.situacaoCadastral = rfbValidation.situacaoCadastral;
    }

    // Partners from official QSA only if explicitly requested by user
    if (syncOfficialQSA && rfbPartners && rfbPartners.length > 0) {
      updates.partners = rfbPartners;
    } else {
      updates.partners = [];
    }

    // Reset operational flags strictly based on document content
    updates.cfopItems = [];

    const monthlyRev = updates.monthlyRevenue ?? (editMonthlyRevenue && !isNaN(parseFloat(editMonthlyRevenue)) ? parseFloat(editMonthlyRevenue) : (extracted?.monthlyRevenue || 0));

    const effectiveActivities = extracted?.activities && extracted.activities.length > 0
      ? extracted.activities
      : [{
          description: editAnexo === 'I'
            ? 'Revenda de Mercadorias (Comércio - Anexo I)'
            : editAnexo === 'II'
              ? 'Venda de Produtos Industrializados (Indústria - Anexo II)'
              : editAnexo === 'IV'
                ? 'Prestação de Serviços em Geral - Anexo IV'
                : editAnexo === 'V'
                  ? 'Serviços Intelectuais / Técnicos - Anexo V'
                  : 'Prestação de Serviços - Anexo III',
          anexo: editAnexo,
          revenue: monthlyRev,
          isTransport: false,
          ecacClassification: 'normal' as EcacRevenueClassification,
          subjectToFatorR: extracted?.subjectToFatorR === false ? false : undefined,
        }];

    const hasTransport = effectiveActivities.some(a => a.isTransport);
    updates.isTransportService = hasTransport;
    if (hasTransport) {
      const tAct = effectiveActivities.find(a => a.isTransport);
      updates.transportType = tAct?.transportType || 'intermunicipal_cargas';
    } else {
      updates.transportType = undefined;
    }

    const hasStateBenefit = effectiveActivities.some(a => a.hasStateBenefit);
    updates.applyStateIcmsReduction = hasStateBenefit;

    if (effectiveActivities.length > 0) {
      const totalActRev = effectiveActivities.reduce((acc, a) => acc + (a.revenue || 0), 0);
      const ratio = totalActRev > 0 && monthlyRev > 0 ? (monthlyRev / totalActRev) : 1;

      let hasFatorRFlag = false;
      let totalExportAmount = 0;

      updates.anexoRevenues = effectiveActivities.map((act, idx) => {
        const descLower = act.description.toLowerCase();
        const ecacOpt = act.ecacOptionCode 
          ? findEcacOptionByText(act.ecacOptionCode) 
          : findEcacOptionByText(act.description);

        const itemAnexo = ecacOpt?.anexo || act.anexo || editAnexo;

        // Exportação estrita: "para o exterior" MAS NÃO "exceto para o exterior"
        const isExport = ecacOpt?.isExport ?? (
          (act.isExport || descLower.includes('para o exterior') || descLower.includes('exportação')) &&
          !descLower.includes('exceto para o exterior')
        );

        const calculatedRev = effectiveActivities.length === 1 ? monthlyRev : (act.revenue * ratio);
        if (isExport) {
          totalExportAmount += calculatedRev;
        }

        // Substituição tributária precisa (evita falso positivo com "Sem substituição tributária")
        const hasSemST = descLower.includes('sem substituição') || 
                         descLower.includes('sem substituicao') || 
                         descLower.includes('substituto tributário') ||
                         descLower.includes('substituto tributario');

        const hasST = !hasSemST && (
          act.hasST ||
          (ecacOpt?.code.includes('_com_st') ?? false) ||
          descLower.includes('com substituição') || 
          descLower.includes('com substituicao') ||
          descLower.includes('substituído tributário') ||
          descLower.includes('substituido tributario') ||
          descLower.includes('substituição tributária de: icms') ||
          descLower.includes('substituicao tributaria de: icms')
        );

        // ISS Retido preciso (evita falso positivo com "Sem retenção")
        const hasSemRetencao = descLower.includes('sem retenção') || descLower.includes('sem retencao');
        const hasIssRetido = !hasSemRetencao && (
          act.hasIssRetido ||
          (ecacOpt?.code.includes('_com_ret') ?? false) ||
          (act.issRetidoPercent !== undefined && act.issRetidoPercent > 0) ||
          descLower.includes('com retenção') ||
          descLower.includes('com retencao') ||
          descLower.includes('retenção de: iss') ||
          descLower.includes('retencao de: iss')
        );

        // Fator R preciso (evita falso positivo com "Não sujeitos ao fator r")
        const isExplicitlyNotSubjectToFatorR = descLower.includes('não sujeitos ao fator') || 
                                              descLower.includes('nao sujeitos ao fator') ||
                                              descLower.includes('não sujeito ao fator') ||
                                              descLower.includes('nao sujeito ao fator') ||
                                              act.subjectToFatorR === false || 
                                              extracted?.subjectToFatorR === false;

        const subjectToFatorR = isExplicitlyNotSubjectToFatorR
          ? false
          : (ecacOpt?.subjectToFatorR ?? (
              act.subjectToFatorR !== undefined
                ? act.subjectToFatorR
                : ((descLower.includes('sujeitos ao fator') && !isExplicitlyNotSubjectToFatorR) || itemAnexo === 'V')
            ));

        if (subjectToFatorR) {
          hasFatorRFlag = true;
        }

        // PIS/COFINS Monofásico
        const isMonofasico = descLower.includes('monofásica') && !descLower.includes('sem monofásica') && !hasSemST;

        // Auto-flegagem das situações ativas correspondentes ao e-CAC
        const activeSituations: RevenueSituationType[] = [];
        if (hasST) {
          activeSituations.push('icms_st');
        }
        if (isMonofasico) {
          activeSituations.push('pis_cofins_monofasico');
        }
        if (hasIssRetido) {
          activeSituations.push('iss_retido');
        }
        if (act.isTransport && (act.transportType === 'intermunicipal_cargas' || descLower.includes('subcontrat'))) {
          activeSituations.push('transporte_subcontratado');
        }
        if (act.hasStateBenefit || (descLower.includes('redução') && descLower.includes('icms'))) {
          activeSituations.push('isencao_reducao');
        }
        if (activeSituations.length === 0) {
          activeSituations.push('normal');
        }

        const ecacClassif: EcacRevenueClassification = hasIssRetido 
          ? 'iss_retido' 
          : hasST 
            ? 'icms_st' 
            : isExport 
              ? (itemAnexo === 'I' || itemAnexo === 'II' ? 'exterior_mercadoria' : 'exterior_servico') 
              : 'normal';

        // Chave única para que múltiplos desdobramentos de um mesmo anexo não se sobreponham
        const uniqueKey = `anexo_${itemAnexo.toLowerCase()}_${ecacOpt?.code || 'act'}_${idx + 1}`;

        return {
          id: `extracted-${idx + 1}-${Date.now()}`,
          anexo: itemAnexo,
          activityKey: uniqueKey,
          activityTitle: ecacOpt?.label ? `${ecacOpt.group} - ${ecacOpt.label}` : act.description,
          description: act.description,
          ecacOptionCode: ecacOpt?.code || act.ecacOptionCode,
          subjectToFatorR,
          activeSituations,
          monthlyRevenueInternal: isExport ? 0 : calculatedRev,
          monthlyRevenueExport: isExport ? calculatedRev : 0,
          active: true,
          isTransport: ecacOpt?.isTransport ?? act.isTransport,
          transportType: act.transportType,
          ecacClassification: ecacClassif,
          issRetidoPercent: hasIssRetido ? (act.issRetidoPercent || 100) : 0,
          stPercent: hasST ? 100 : 0,
          monofasicoPercent: isMonofasico ? 100 : 0,
          isencaoReducaoPercent: (act.hasStateBenefit ? 24.07 : 0),
        };
      });

      if (totalExportAmount > 0) {
        updates.exportMonthlyRevenue = totalExportAmount;
      }
      if (extracted?.subjectToFatorR === false) {
        updates.subjectToFatorR = false;
      } else {
        updates.subjectToFatorR = hasFatorRFlag || editAnexo === 'V';
      }
    }

    if (archiveInHistory) {
      const now = new Date();
      const periodLabel = editPeriod ? `PA ${editPeriod}` : now.toLocaleDateString('pt-BR');
      const newSim: SavedSimulation = {
        id: `sim-import-${Date.now()}`,
        title: `Importação PGDAS-D (${periodLabel})`,
        date: now.toLocaleDateString('pt-BR'),
        timestamp: now.toISOString(),
        rbt12: updates.rbt12 || 0,
        monthlyRevenue: updates.monthlyRevenue || 0,
        payroll12m: updates.payroll12m || 0,
        monthlyPayroll: updates.monthlyPayroll || 0,
        fatorRPercent: fatorRNumber,
        fatorRStatus: extracted?.subjectToFatorR === false ? 'fator_r_atingido' : (fatorRNumber >= 28 ? 'fator_r_atingido' : 'fator_r_nao_atingido'),
        effectiveAnexo: editAnexo,
        effectiveRatePercent: 0,
        simplesTaxMonthly: 0,
        simplesTaxAnnual: 0,
        presumedTaxMonthly: 0,
        presumedTaxAnnual: 0,
        realTaxMonthly: 0,
        realTaxAnnual: 0,
        bestRegime: 'simples',
        annualSavings: 0,
        anexoRevenuesSnapshot: updates.anexoRevenues ? JSON.parse(JSON.stringify(updates.anexoRevenues)) : [],
        companyDataSnapshot: { ...updates } as any,
      };
      updates.simulationHistory = [newSim];
      updates.keepSimulationHistory = true;
    }

    onApplyExtractedData(updates);
    onClose();
  };

  // Helper values for Fator R calculation and UI diagnosis
  const parsedRbt12 = parseFloat(editRbt12) || 0;
  const parsedPayroll12m = parseFloat(editPayroll12m) || 0;
  const parsedMonthlyRev = parseFloat(editMonthlyRevenue) || 0;
  const fatorRNumber = parseFloat(editFatorRPercent) || (parsedRbt12 > 0 ? (parsedPayroll12m / parsedRbt12) * 100 : 0);
  const fatorRValNumber = parseFloat(editFatorRValue) || (parsedMonthlyRev > 0 ? Math.round(parsedMonthlyRev * (fatorRNumber / 100) * 100) / 100 : 0);
  const targetMonthlyPayroll28 = Math.round(parsedMonthlyRev * 0.28 * 100) / 100;
  const payrollShortfall = Math.max(0, targetMonthlyPayroll28 - fatorRValNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Auditoria & Validação RFB</p>
              <h3 className="text-base font-bold text-slate-100 tracking-tight">Importação de PGDAS-D & Validação na Receita Federal</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap border-b border-slate-800 bg-[#0B0F19] px-5 py-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('upload'); setError(null); }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Arquivo PDF</span>
          </button>

          <button
            onClick={() => { setActiveTab('paste'); setError(null); }}
            className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-2 text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Colar Texto da Declaração</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300 bg-[#0F172A]">
          
          {activeTab === 'upload' ? (
            <div className="space-y-3">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleProcessFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-950/30'
                    : 'border-slate-700 hover:border-blue-500 bg-[#0B0F19]'
                }`}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf';
                  input.onchange = (e: any) => {
                    if (e.target.files?.[0]) {
                      handleProcessFile(e.target.files[0]);
                    }
                  };
                  input.click();
                }}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-3 py-4">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    <p className="text-xs font-semibold text-slate-100">Analisando e extraindo tabelas fiscais do PDF...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2.5 py-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Clique para selecionar ou arraste o PDF do PGDAS-D aqui
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
                      Compatível com extratos oficiais do PGDAS-D, DEFIS e recibos da Receita Federal.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Deseja testar com declarações reais do PGDAS-D?</span>
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleLoadOdontoSample}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline text-[11px] cursor-pointer"
                  >
                    + Exemplo Odontologia (C.L. ODONTOLOGIA)
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadTransportSample}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline text-[11px] cursor-pointer"
                  >
                    + Exemplo Transporte PR
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-blue-400 hover:text-blue-300 font-bold underline text-[11px] cursor-pointer"
                  >
                    Exemplo TI
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Cole abaixo o texto copiado do PGDAS-D ou e-CAC:
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleLoadOdontoSample}
                      className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] cursor-pointer"
                    >
                      + Exemplo Odonto
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadTransportSample}
                      className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] cursor-pointer"
                    >
                      + Exemplo Transporte PR
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="text-blue-400 hover:text-blue-300 font-bold text-[11px] cursor-pointer"
                    >
                      + Exemplo TI
                    </button>
                  </div>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Cole aqui o texto do Extrato da Declaração do Simples Nacional (PGDAS-D)... Ex: 'RBT12: R$ 4.450.000,00 ... Razão Social: ... CNPJ: ...'"
                  className="w-full h-28 bg-[#0B0F19] border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-mono focus:border-blue-500 focus:outline-none resize-none placeholder-slate-500 shadow-inner"
                />
              </div>

              <button
                type="button"
                onClick={handleProcessPastedText}
                disabled={isLoading || !pastedText.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Processar e Auditar Texto</span>
              </button>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-start space-x-3 text-xs text-rose-300 shadow-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Aviso na Importação</span>
                <span className="text-[11px] text-rose-300 leading-relaxed block">{error}</span>
              </div>
            </div>
          )}

          {/* 1. SEÇÃO DE VALIDAÇÃO CADASTRAL & ENDEREÇO NA RECEITA FEDERAL (RFB) */}
          {extracted && (
            <div className="space-y-4">
              
              <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                        <span>Validação Cadastral & Endereço na Receita Federal</span>
                        {rfbLoading && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">Consulta direta em base oficial da RFB</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleManualRFBValidation}
                    disabled={rfbLoading || !editCnpj}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-[11px] font-semibold transition border border-slate-700 cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    <RefreshCw className={`w-3 h-3 text-blue-400 ${rfbLoading ? 'animate-spin' : ''}`} />
                    <span>Revalidar na RFB</span>
                  </button>
                </div>

                {rfbLoading ? (
                  <div className="p-6 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-200">Conectando às bases públicas da Receita Federal...</p>
                    <p className="text-[10px] text-slate-400 font-mono">Verificando Situação Cadastral, Endereço e QSA oficial</p>
                  </div>
                ) : rfbValidation ? (
                  <div className="space-y-4">
                    {/* Status Badges & Basic Indicators */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Situação Cadastral */}
                      <div className={`p-3 rounded-xl border flex items-center space-x-3 shadow-xs ${
                        (rfbValidation.situacaoCadastral || '').toUpperCase() === 'ATIVA'
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                      }`}>
                        <div className={`p-2 rounded-lg ${
                          (rfbValidation.situacaoCadastral || '').toUpperCase() === 'ATIVA'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {(rfbValidation.situacaoCadastral || '').toUpperCase() === 'ATIVA' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <ShieldAlert className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Situação Cadastral</p>
                          <p className="text-xs font-bold font-mono">
                            {rfbValidation.situacaoCadastral || 'ATIVA'}
                          </p>
                          {rfbValidation.dataSituacaoCadastral && (
                            <p className="text-[9px] text-slate-400 font-mono">Desde {rfbValidation.dataSituacaoCadastral}</p>
                          )}
                        </div>
                      </div>

                      {/* Regime Tributário Simples */}
                      <div className={`p-3 rounded-xl border flex items-center space-x-3 shadow-xs ${
                        rfbValidation.opcaoSimples === true
                          ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                          : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                      }`}>
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Regime RFB</p>
                          <p className="text-xs font-bold">
                            {rfbValidation.opcaoSimples === true
                              ? 'Optante Simples'
                              : rfbValidation.opcaoSimples === false
                              ? 'Não Optante'
                              : 'Conferência Simples'}
                          </p>
                          {rfbValidation.dataOpcaoSimples && (
                            <p className="text-[9px] text-slate-400 font-mono">Opção: {rfbValidation.dataOpcaoSimples}</p>
                          )}
                        </div>
                      </div>

                      {/* Sócios no QSA */}
                      <div className="p-3 rounded-xl border border-slate-800 bg-[#0F172A] flex items-center space-x-3 text-slate-200 shadow-xs">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Quadro de Sócios (QSA)</p>
                          <p className="text-xs font-bold font-mono text-slate-100">
                            {rfbPartners.length} {rfbPartners.length === 1 ? 'Sócio' : 'Sócios'} Detectados
                          </p>
                          <p className="text-[9px] text-purple-400 font-mono">LC 123/06 Art. 3º § 4º</p>
                        </div>
                      </div>

                    </div>

                    {/* Endereço Oficial Validado */}
                    {rfbAddress && (
                      <div className="p-3.5 bg-[#0F172A] border border-blue-500/30 rounded-xl space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1.5 text-blue-400 font-bold text-xs">
                            <MapPin className="w-4 h-4" />
                            <span className="text-[10px] uppercase tracking-wider">Endereço Oficial Registrado na RFB</span>
                          </span>
                          <span className="text-[9px] text-emerald-300 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            Validado ✓
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-200 font-mono bg-[#0B0F19] p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                          {rfbAddress.formatted || buildFormattedAddress(rfbAddress)}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
                          {rfbAddress.logradouro && (
                            <span><strong className="text-slate-200">Logradouro:</strong> {rfbAddress.logradouro}{rfbAddress.numero ? `, ${rfbAddress.numero}` : ''}</span>
                          )}
                          {rfbAddress.bairro && (
                            <span><strong className="text-slate-200">Bairro:</strong> {rfbAddress.bairro}</span>
                          )}
                          {rfbAddress.municipio && (
                            <span><strong className="text-slate-200">Município/UF:</strong> {rfbAddress.municipio}/{rfbAddress.uf || editUf}</span>
                          )}
                          {rfbAddress.cep && (
                            <span><strong className="text-slate-200">CEP:</strong> {rfbAddress.cep}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Messages / Divergences */}
                    {rfbValidation.messages && rfbValidation.messages.length > 0 && (
                      <div className="space-y-1.5 text-[11px] pt-1">
                        {rfbValidation.messages.map((msg, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{msg}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sync Options Checkboxes */}
                    <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <label className="flex items-center space-x-2 text-slate-300 hover:text-slate-100 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={syncOfficialAddress}
                          onChange={(e) => setSyncOfficialAddress(e.target.checked)}
                          className="rounded border-slate-700 bg-[#0F172A] text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Sincronizar Endereço Oficial</span>
                      </label>

                      <label className="flex items-center space-x-2 text-slate-300 hover:text-slate-100 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={syncOfficialName}
                          onChange={(e) => setSyncOfficialName(e.target.checked)}
                          className="rounded border-slate-700 bg-[#0F172A] text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Usar Razão Social Oficial RFB</span>
                      </label>

                      <label className="flex items-center space-x-2 text-slate-300 hover:text-slate-100 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={syncOfficialQSA}
                          onChange={(e) => setSyncOfficialQSA(e.target.checked)}
                          className="rounded border-slate-700 bg-[#0F172A] text-blue-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span>Importar Sócios do QSA ({rfbPartners.length})</span>
                      </label>
                    </div>

                  </div>
                ) : rfbError ? (
                  <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1.5 text-[11px] text-amber-300 shadow-xs">
                    <div className="flex items-center space-x-2 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Consulta RFB: {rfbError}</span>
                    </div>
                    <p className="text-slate-400 text-[10px]">
                      Você pode continuar com a importação dos dados fiscais do PGDAS-D e os dados locais serão preservados.
                    </p>
                  </div>
                ) : null}

              </div>

              {/* 2. DADOS FISCAIS IDENTIFICADOS NO PGDAS-D (CONFERÊNCIA EDITÁVEL) */}
              <div className="p-4 bg-[#0B0F19] rounded-xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wider">Dados Fiscais da Declaração PGDAS-D</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {editPeriod ? `Período de Apuração (PA): ${editPeriod}` : 'Valores Fiscais'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      value={editCompanyName}
                      onChange={(e) => setEditCompanyName(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none shadow-xs"
                      placeholder="Nome da Empresa"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={editCnpj}
                      onChange={(e) => setEditCnpj(e.target.value)}
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:border-blue-500 focus:outline-none shadow-xs"
                      placeholder="00.000.000/0001-00"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      RBT12 (Últimos 12 Meses)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">R$</span>
                      <input
                        type="number"
                        step="any"
                        value={editRbt12}
                        onChange={(e) => handleRbt12Change(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-blue-400 focus:border-blue-500 focus:outline-none shadow-xs"
                        placeholder="0.00"
                      />
                    </div>
                    {parseFloat(editRba) > 0 && parseFloat(editRbt12) === parseFloat(editRba) && (
                      <span className="text-[9px] text-emerald-400 font-medium mt-1 block">
                        ✓ RBT12 integrado (toda empresa com RBA possui RBT12)
                      </span>
                    )}
                    {parseFloat(editRba) > 0 && (!editRbt12 || parseFloat(editRbt12) === 0) && (
                      <button
                        type="button"
                        onClick={() => handleRbt12Change(editRba)}
                        className="text-[9px] text-amber-400 hover:text-amber-300 underline mt-1 block"
                      >
                        Definir RBT12 = RBA (R$ {parseFloat(editRba).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      RBA (Ano Corrente)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">R$</span>
                      <input
                        type="number"
                        step="any"
                        value={editRba}
                        onChange={(e) => handleRbaChange(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-100 focus:border-blue-500 focus:outline-none shadow-xs"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      RBAA (Ano Calendário Anterior)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">R$</span>
                      <input
                        type="number"
                        step="any"
                        value={editRbaa}
                        onChange={(e) => setEditRbaa(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-300 focus:border-blue-500 focus:outline-none shadow-xs"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Receita do Mês (PA)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">R$</span>
                      <input
                        type="number"
                        step="any"
                        value={editMonthlyRevenue}
                        onChange={(e) => handleMonthlyRevenueChange(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-blue-500 focus:outline-none shadow-xs"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Folha de Salários (FS12)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">R$</span>
                      <input
                        type="number"
                        step="any"
                        value={editPayroll12m}
                        onChange={(e) => handlePayroll12mChange(e.target.value)}
                        className="w-full bg-[#0F172A] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 focus:border-blue-500 focus:outline-none shadow-xs"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Município / UF
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-2/3 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none shadow-xs"
                        placeholder="Cidade / Município"
                      />
                      <input
                        type="text"
                        maxLength={2}
                        value={editUf}
                        onChange={(e) => setEditUf(e.target.value.toUpperCase())}
                        className="w-1/3 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono uppercase text-slate-100 focus:border-blue-500 focus:outline-none text-center font-bold shadow-xs"
                        placeholder="UF"
                      />
                    </div>
                  </div>
                </div>

                {/* PAINEL DEDICADO DO FATOR R (LC 123/2006) */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-blue-500/10 rounded border border-blue-500/30 text-blue-400">
                        <Percent className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wider block">
                          Fator R da Apuração (Simples Nacional)
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          LC 123/06 Art. 18: Folha 12m (FS12) ÷ RBT12 com reflexo sobre a receita do mês
                        </span>
                      </div>
                    </div>

                    <div>
                      {extracted?.subjectToFatorR === false ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                          <Check className="w-3 h-3 text-blue-400" />
                          <span>Fator R = Não se aplica • Anexo III Direto</span>
                        </span>
                      ) : fatorRNumber >= 28 ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Fator R ≥ 28,00% • Anexo III (Econômico)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Fator R &lt; 28,00% • Anexo V (Oneroso)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Campo 1: Fator R em Porcentagem (%) */}
                    <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800 shadow-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Fator R em Porcentagem (%)
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          FS12 ÷ RBT12
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono font-bold">%</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editFatorRPercent}
                          onChange={(e) => handleFatorRPercentChange(e.target.value)}
                          className={`w-full bg-[#0B0F19] border rounded-lg pl-3 pr-8 py-2 text-xs font-mono font-bold focus:outline-none transition ${
                            extracted?.subjectToFatorR === false
                              ? 'border-blue-500/40 text-blue-300 focus:border-blue-500'
                              : fatorRNumber >= 28
                                ? 'border-emerald-500/40 text-emerald-300 focus:border-emerald-500'
                                : 'border-amber-500/40 text-amber-300 focus:border-amber-500'
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {extracted?.subjectToFatorR === false
                          ? 'Documento declarou "Não se aplica"'
                          : (parsedRbt12 > 0
                            ? `Cálculo: R$ ${parsedPayroll12m.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ÷ R$ ${parsedRbt12.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : 'Informe RBT12 e Folha 12m para apuração')}
                      </p>
                    </div>

                    {/* Campo 2: Fator R em Valor (R$) aplicado sobre o Faturamento */}
                    <div className="p-3 bg-[#0F172A] rounded-xl border border-slate-800 shadow-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                          Valor do Fator R no Mês (R$)
                        </label>
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          {fatorRNumber > 0 ? `${fatorRNumber.toFixed(2)}% s/ Receita` : '% s/ Receita'}
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editFatorRValue}
                          onChange={(e) => handleFatorRValueChange(e.target.value)}
                          className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-blue-500 focus:outline-none"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {parsedMonthlyRev > 0
                          ? `${fatorRNumber.toFixed(2)}% de R$ ${parsedMonthlyRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Receita do Mês)`
                          : 'Valor da folha do mês derivada do Fator R'}
                      </p>
                    </div>
                  </div>

                  {/* Diagnóstico Tributário / Meta 28% */}
                  {extracted?.subjectToFatorR === false ? (
                    <div className="p-3 rounded-xl border text-xs leading-relaxed bg-blue-950/40 border-blue-500/30 text-blue-300 shadow-xs">
                      <div className="flex items-center space-x-2 font-bold">
                        <Check className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Fator R: Declarado como &quot;Não se aplica&quot; no PGDAS-D</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        Conforme o extrato da declaração PGDAS-D oficial, esta atividade não está sujeita à regra do Fator R e tributa diretamente no Anexo III, sem necessidade de comprovação de 28% de folha de pagamento e sem risco de enquadramento no Anexo V.
                      </p>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-xl border text-xs leading-relaxed transition shadow-xs ${
                      fatorRNumber >= 28
                        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-bold flex items-center space-x-1.5">
                            {fatorRNumber >= 28 ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>Elegível ao Anexo III (Tributação Reduzida)</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                <span>Enquadrado no Anexo V (Tributação Onerosa)</span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300">
                            {fatorRNumber >= 28
                              ? `O Fator R de ${fatorRNumber.toFixed(2)}% (R$ ${fatorRValNumber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} no mês) atinge o mínimo de 28,00%, enquadrando atividades ambíguas no Anexo III (a partir de 6,00%).`
                              : `O Fator R de ${fatorRNumber.toFixed(2)}% está abaixo dos 28,00%. Atividades intelectuais ambíguas tributarão no Anexo V (alíquota inicial de 15,50%).`}
                          </p>
                        </div>

                        {fatorRNumber < 28 && parsedMonthlyRev > 0 && (
                          <div className="bg-[#0F172A] p-2 rounded-lg border border-amber-500/30 text-[10px] font-mono shrink-0 space-y-0.5 shadow-xs">
                            <div className="text-slate-400">Piso Anexo III (28% do Mês):</div>
                            <div className="text-emerald-400 font-bold">R$ {targetMonthlyPayroll28.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                            <div className="text-amber-400">Déficit: +R$ {payrollShortfall.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. ATIVIDADES ECONÔMICAS & BENEFÍCIO DE ICMS DETECTADOS */}
              {extracted.activities && extracted.activities.length > 0 && (
                <div className="p-4 bg-[#0B0F19] rounded-xl border border-emerald-500/30 space-y-3 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <span className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-wider">Atividades Econômicas & ICMS Segregados no PGDAS-D</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                      Tabela de ICMS Ativa • Decreto nº 8.660/18 (PR)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {extracted.activities.map((act, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#0F172A] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-100">{act.description}</span>
                            {act.isTransport && (
                              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[9px] font-bold rounded border border-blue-500/30">
                                ICMS Estadual ({act.state || editUf || 'PR'})
                              </span>
                            )}
                            {act.ecacClassification === 'iss_retido' && (
                              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded border border-amber-500/30">
                                ISS Retido na Fonte
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {act.isTransport 
                              ? `LC 123/06 Art. 18 § 5º-E: Anexo III deduz ISS e recolhe ICMS com ${act.icmsReductionPercent || 11.4}% de redução no PR`
                              : 'Tributação pelo Anexo III integral com dedução de ISS retido'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {formatCurrencyBRL(act.revenue)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Receita Bruta</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {extracted.dasTaxDue && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs shadow-xs">
                      <span className="text-slate-300 text-[11px] font-medium">
                        Total Declarado na Guia DAS do PGDAS-D:
                      </span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        {formatCurrencyBRL(extracted.dasTaxDue)}
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold text-slate-300 hover:text-slate-100 transition">
              <input
                type="checkbox"
                checked={archiveInHistory}
                onChange={(e) => setArchiveInHistory(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-[#0F172A] text-purple-600 focus:ring-purple-500"
              />
              <span className="flex items-center space-x-1.5">
                <span>[ ] Manter em Histórico</span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(Arquivar parecer fiscal desta declaração)</span>
              </span>
            </label>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer shadow-xs"
            >
              Cancelar
            </button>
            
            {extracted && (
              <button
                onClick={handleApply}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-xs transition cursor-pointer"
              >
                <span>Aplicar no Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
