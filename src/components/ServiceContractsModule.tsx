import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Scale, 
  ShieldCheck, 
  Award, 
  Percent, 
  Lock, 
  Sparkles,
  CreditCard,
  QrCode,
  Building2,
  UserCheck,
  Library,
  Check,
  Copy,
  FileSearch,
  AlertTriangle,
  Info,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { CompanyData, AuthUser, SoldSubscription, PlanDefinition, PlanPeriodicity } from '../types';
import { PLATFORM_PLANS, DEFAULT_BANK_CONFIG } from '../data/adminBillingData';
import { BrandLogo } from './BrandLogo';
import { CONTRACT_MATRIX_DATA, CONTRACT_VERTICALS, ContractModelItem } from '../data/contractMatrixData';

export interface ServiceContractItem {
  id: string;
  clientName: string;
  cnpj: string;
  customerEmail?: string;
  customerPhone?: string;
  planName: string;
  planId?: string;
  periodicity: PlanPeriodicity;
  loyaltyMonths: number;
  startDate: string;
  endDate: string;
  value: number;
  originalValue?: number;
  status: 'active' | 'pending' | 'canceled';
  createdAt: string;
  contractNumber: string;
  terminationPenaltyPercent: number;
  promptDiscountPercent: number;
  annualCashDiscountPercent: number;
  paymentMethods: string[];
  contractAccepted?: boolean;
  contractSignedAt?: string;
}

interface ServiceContractsModuleProps {
  currentCompany?: CompanyData;
  currentUser?: AuthUser | null;
}

export const ServiceContractsModule: React.FC<ServiceContractsModuleProps> = ({ currentCompany, currentUser }) => {
  const [contracts, setContracts] = useState<ServiceContractItem[]>(() => {
    const saved = localStorage.getItem('sna_contracts_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }

    // Inicializa com as assinaturas existentes no sistema para manter perfeita sincronia
    const subsSaved = localStorage.getItem('sna_admin_subscriptions');
    if (subsSaved) {
      try {
        const subs: SoldSubscription[] = JSON.parse(subsSaved);
        return subs.map(s => {
          const loyaltyMonths = s.loyaltyMonths || (s.periodicity === 'anual' ? 12 : s.periodicity === 'semestral' ? 6 : s.periodicity === 'trimestral' ? 3 : 1);
          const endD = s.contractEndDate || (() => {
            const d = new Date(s.startDate + 'T12:00:00');
            d.setMonth(d.getMonth() + loyaltyMonths);
            return d.toISOString().split('T')[0];
          })();

          return {
            id: s.id,
            clientName: s.customerName,
            cnpj: s.customerDocument,
            customerEmail: s.customerEmail,
            customerPhone: s.customerPhone,
            planName: s.planName,
            planId: s.planId,
            periodicity: s.periodicity,
            loyaltyMonths,
            startDate: s.startDate,
            endDate: endD,
            value: s.pricePaid,
            originalValue: s.originalPrice || s.pricePaid,
            status: s.status === 'ativa' ? 'active' : s.status === 'cancelada' ? 'canceled' : 'pending',
            createdAt: s.startDate,
            contractNumber: s.contractNumber || `CTR-${s.startDate.slice(0, 4)}-${s.id.slice(-6).toUpperCase()}`,
            terminationPenaltyPercent: s.terminationFinePercent || 20,
            promptDiscountPercent: 5,
            annualCashDiscountPercent: 15,
            paymentMethods: loyaltyMonths > 1 ? ['PIX', 'Boleto Bancário', 'Cartão de Crédito'] : ['PIX', 'Boleto Bancário'],
            contractAccepted: s.contractAccepted,
            contractSignedAt: s.contractSignedAt
          } as ServiceContractItem;
        });
      } catch (e) {}
    }

    return [
      {
        id: 'ctr-001',
        clientName: 'Oliveira & Santos Contabilidade',
        cnpj: '12.345.678/0001-90',
        customerEmail: 'contato@oliveirasantos.com.br',
        customerPhone: '(11) 98765-4321',
        planName: 'Escritório Enterprise',
        planId: 'enterprise',
        periodicity: 'anual',
        loyaltyMonths: 12,
        startDate: '2025-01-10',
        endDate: '2026-01-10',
        value: 7114.50,
        originalValue: 8370.00,
        status: 'active',
        createdAt: '2025-01-10',
        contractNumber: 'CTR-2025-ENT-001',
        terminationPenaltyPercent: 20,
        promptDiscountPercent: 5,
        annualCashDiscountPercent: 15,
        paymentMethods: ['PIX', 'Boleto Bancário', 'Cartão de Crédito (12x)'],
        contractAccepted: true,
        contractSignedAt: '10/01/2025 14:22:10'
      },
      {
        id: 'ctr-002',
        clientName: 'Dr. Fernando Prado Consultoria Fiscal',
        cnpj: '98.765.432/0001-10',
        customerEmail: 'fernando.prado@tributos.adv.br',
        customerPhone: '(11) 97654-3210',
        planName: 'Pro Tributário',
        planId: 'pro',
        periodicity: 'semestral',
        loyaltyMonths: 6,
        startDate: '2025-02-15',
        endDate: '2025-08-15',
        value: 2140.00,
        status: 'active',
        createdAt: '2025-02-15',
        contractNumber: 'CTR-2025-PRO-002',
        terminationPenaltyPercent: 20,
        promptDiscountPercent: 5,
        annualCashDiscountPercent: 15,
        paymentMethods: ['PIX', 'Boleto Bancário', 'Cartão de Crédito (6x)'],
        contractAccepted: true,
        contractSignedAt: '15/02/2025 09:45:00'
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para Novo Contrato
  const [newClientName, setNewClientName] = useState(currentCompany?.name || '');
  const [newCnpj, setNewCnpj] = useState(currentCompany?.cnpj || '');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlanId, setNewPlanId] = useState('pro');
  const [newPeriodicity, setNewPeriodicity] = useState<PlanPeriodicity>('anual');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [applyPromptDiscount, setApplyPromptDiscount] = useState(false);
  const [applyAnnualDiscount, setApplyAnnualDiscount] = useState(true);

  // Estados adicionais para Engenharia Contratual & Auditor IA
  const [activeSubTab, setActiveSubTab] = useState<'issued' | 'matrix' | 'auditor'>('issued');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [selectedMatrixVertical, setSelectedMatrixVertical] = useState<string>('all');
  const [expandedMatrixId, setExpandedMatrixId] = useState<string | null>(null);
  const [copiedContractId, setCopiedContractId] = useState<string | null>(null);

  // Estados para Auditor IA de Minutas
  const [auditorDraftText, setAuditorDraftText] = useState('');
  const [auditorSelectedType, setAuditorSelectedType] = useState<string>('CON-101');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  useEffect(() => {
    if (currentCompany) {
      setNewClientName(currentCompany.name);
      setNewCnpj(currentCompany.cnpj);
    }
  }, [currentCompany]);

  useEffect(() => {
    localStorage.setItem('sna_contracts_v2', JSON.stringify(contracts));
  }, [contracts]);

  const filteredContracts = contracts.filter(c => 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cnpj.includes(searchTerm) ||
    c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.planName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAudit = () => {
    if (!auditorDraftText.trim()) return;
    setIsAuditing(true);
    setAuditResult(null);

    setTimeout(() => {
      const selectedModel = CONTRACT_MATRIX_DATA.find(m => m.id === auditorSelectedType) || CONTRACT_MATRIX_DATA[0];
      const text = auditorDraftText.toLowerCase();

      // Check for elements vitais (Vitals) in the text
      const hasPreambulo = text.includes('qualifica') || text.includes('preâmbulo') || text.includes('cnp') || text.includes('cpf') || text.includes('razão social') || text.includes('inscrita') || text.includes('residente');
      const hasObjeto = text.includes('objeto') || text.includes('prestação de serviços') || text.includes('licenciamento') || text.includes('finalidade') || text.includes('objeto contratual');
      const hasPreco = text.includes('preço') || text.includes('valor') || text.includes('pagará') || text.includes('reajuste') || text.includes('reajustado') || text.includes('fatura') || text.includes('vencimento') || text.includes('pagamento');
      const hasVigencia = text.includes('vigência') || text.includes('prazo') || text.includes('rescis') || text.includes('multa por quebra') || text.includes('fidelidade') || text.includes('extinção') || text.includes('aviso prévio');
      const hasProtecao = text.includes('confidencial') || text.includes('sigilo') || text.includes('nda') || text.includes('concorrência') || text.includes('propriedade intelectual') || text.includes('marca') || text.includes('ativos') || text.includes('segredo');
      const hasForo = text.includes('foro') || text.includes('eleger') || text.includes('comarca') || text.includes('resolvido') || text.includes('arbitragem') || text.includes('disputa');

      // Check for validade requirements (Art. 104 CC)
      const hasAgenteCapaz = text.includes('representante') || text.includes('representada') || text.includes('sócio') || text.includes('procurador') || text.includes('capacidade') || text.includes('plena') || text.includes('art. 104') || text.includes('capaz');
      const hasObjetoLicito = text.includes('serviço') || text.includes('lícito') || text.includes('atividades') || text.includes('regular') || text.includes('cnae') || text.includes('possível');
      const hasFormaPrescrita = text.includes('testemunha') || text.includes('icp-brasil') || text.includes('eletrônica') || text.includes('assina') || text.includes('instrumento') || text.includes('forma prescrita');

      // Check for specific sphere risks
      const hasLeoninaWarning = text.includes('retenção integral') || text.includes('multa de 100%') || text.includes('sem direito a aviso');
      const hasImprevisaoCheck = text.includes('478') || text.includes('imprevisão') || text.includes('caso fortuito') || text.includes('força maior') || text.includes('reequilíbrio');
      const hasComplianceCheck = text.includes('fraude') || text.includes('simulação') || text.includes('declaração falsa') || text.includes('falsidade') || text.includes('conformidade') || text.includes('compliance') || text.includes('anti-corrupção');
      const hasTaxCheck = text.includes('retenç') || text.includes('irrf') || text.includes('pis') || text.includes('cofins') || text.includes('iss') || text.includes('tributo') || text.includes('imposto') || text.includes('csll');

      // Calculate score based on vitals and validity (weighted)
      let score = 25; // base score for input
      if (hasPreambulo) score += 10;
      if (hasObjeto) score += 12;
      if (hasPreco) score += 12;
      if (hasVigencia) score += 10;
      if (hasProtecao) score += 10;
      if (hasForo) score += 8;

      if (hasAgenteCapaz) score += 3;
      if (hasObjetoLicito) score += 3;
      if (hasFormaPrescrita) score += 4;
      if (hasImprevisaoCheck) score += 4;
      if (hasComplianceCheck) score += 2;
      if (hasTaxCheck) score += 2;

      // Cap score
      score = Math.min(Math.max(score, 10), 100);

      setAuditResult({
        score,
        model: selectedModel,
        vitals: {
          preambulo: hasPreambulo,
          objeto: hasObjeto,
          preco: hasPreco,
          vigencia: hasVigencia,
          protecao: hasProtecao,
          foro: hasForo
        },
        validade: {
          agenteCapaz: hasAgenteCapaz,
          objetoLicito: hasObjetoLicito,
          formaPrescrita: hasFormaPrescrita
        },
        riscos: {
          civil: {
            ok: hasImprevisaoCheck && !hasLeoninaWarning,
            warning: hasLeoninaWarning ? "Risco elevado de cláusulas leoninas identificadas. Multas rescisórias abusivas ou retenções sem reciprocidade." : !hasImprevisaoCheck ? "Falta de menção expressa à Teoria da Imprevisão (Art. 478 CC) ou caso fortuito." : null,
            correction: "Garantir reciprocidade contratual em caso de penalidades de rescisão e adicionar cláusula de reequilíbrio econômico baseada no Art. 478 do Código Civil."
          },
          compliance: {
            ok: hasComplianceCheck,
            warning: !hasComplianceCheck ? "Ausência de salvaguardas de integridade ou proteção ativa contra falsidade ideológica (Art. 299 CP) ou simulações (Art. 171 CP)." : null,
            correction: "Incluir um parágrafo de declaração mútua de compliance e conformidade com as leis anticorrupção vigentes."
          },
          fiscal: {
            ok: hasTaxCheck,
            warning: !hasTaxCheck ? "Ausência de detalhamento técnico de retenções federais e municipais (IRRF, CSLL, PIS, COFINS, ISS) para prestação de serviços." : null,
            correction: "Garantir que o instrumento mencione expressamente quais retenções na fonte incidem sobre os pagamentos de acordo com o CNAE oficial."
          }
        }
      });
      setIsAuditing(false);
    }, 1200);
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const generatePDF = (contract: ServiceContractItem) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);
    let cursorY = 22;

    const checkPage = (height: number = 8) => {
      if (cursorY + height > 275) {
        doc.addPage();
        cursorY = 20;
      }
    };

    const addTitle = (text: string) => {
      checkPage(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(text, margin, cursorY);
      cursorY += 7;
    };

    const addClauseHeader = (num: string, title: string) => {
      checkPage(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`${num} - ${title.toUpperCase()}`, margin, cursorY);
      cursorY += 5.5;
    };

    const addParagraph = (text: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(text, contentWidth);
      for (const line of splitText) {
        checkPage(5);
        doc.text(line, margin, cursorY);
        cursorY += 4.5;
      }
      cursorY += 2;
    };

    const startFormatted = new Date(contract.startDate + 'T12:00:00').toLocaleDateString('pt-BR');
    const endFormatted = new Date(contract.endDate + 'T12:00:00').toLocaleDateString('pt-BR');
    const periodicityLabel = 
      contract.periodicity === 'anual' ? 'Anual (12 Meses)' :
      contract.periodicity === 'semestral' ? 'Semestral (6 Meses)' :
      contract.periodicity === 'trimestral' ? 'Trimestral (3 Meses)' : 'Mensal (Recorrente)';

    // Cabeçalho Principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS E LICENCIAMENTO', 105, cursorY, { align: 'center' });
    cursorY += 6;
    doc.text('DE SOFTWARE DE INTELIGÊNCIA E CONSULTORIA TRIBUTÁRIA', 105, cursorY, { align: 'center' });
    cursorY += 6;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Registro Oficial nº ${contract.contractNumber}`, 105, cursorY, { align: 'center' });
    cursorY += 8;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 7;

    // Qualificação das Partes
    addTitle('QUALIFICAÇÃO DAS PARTES');
    addParagraph(`CONTRATADA: ${DEFAULT_BANK_CONFIG.beneficiaryName}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${DEFAULT_BANK_CONFIG.beneficiaryDocument}, com sede administrativa e fiscal em ${DEFAULT_BANK_CONFIG.pixCity}, desenvolvedora e titular dos direitos de exploração da Plataforma Vértice Auditor Fiscal - Auditoria Tributária de Planejamento Tributário e Inteligência Fiscal, doravante denominada simplesmente CONTRATADA.`);
    addParagraph(`CONTRATANTE: ${contract.clientName}, pessoa jurídica inscrita no CNPJ/MF sob nº ${contract.cnpj}, e-mail de contato ${contract.customerEmail || 'cadastrado na plataforma'}, telefone ${contract.customerPhone || 'não informado'}, doravante denominada simplesmente CONTRATANTE.`);

    // Cláusula 1 - Objeto e Dados do Plano
    addClauseHeader('CLÁUSULA PRIMEIRA', 'DO OBJETO E DADOS DO PLANO CONTRATADO');
    addParagraph(`1.1. Constitui objeto deste instrumento a prestação continuada de serviços técnicos de consultoria fiscal digital e a concessão de licença de uso do software especializado da Plataforma Vértice Auditor Fiscal - Auditoria Tributária, compreendendo os recursos do plano "${contract.planName}".`);
    addParagraph(`1.2. Recursos e Módulos Inclusos no Plano:
• Diagnóstico Executivo de Regimes (Simples Nacional, Lucro Presumido, Lucro Real);
• Cálculo Estratégico de Fator R e Pró-labore;
• Segregação Inteligente de CFOPs e Tributação Monofásica;
• Importador e Conciliador de Extratos PGDAS-D;
• Módulo de Transição da Reforma Tributária (EC 132/2023 - IBS/CBS/Split Payment);
• Auditor Fiscal Digital IA e Emissão de Pareceres Técnicos em PDF.`);

    // Cláusula 2 - Vigência, Data de Início e Fidelidade
    addClauseHeader('CLÁUSULA SEGUNDA', 'DA VIGÊNCIA, DATA DE INÍCIO E FIDELIDADE OBRIGATÓRIA');
    addParagraph(`2.1. DATA DE INÍCIO DE VALIDADE: O presente contrato entra em vigor em ${startFormatted}, termo inicial para contagem da disponibilidade dos serviços.`);
    addParagraph(`2.2. PRAZO DE VIGÊNCIA: O prazo de vigência é de ${contract.loyaltyMonths} meses, estendendo-se até ${endFormatted}.`);
    if (contract.loyaltyMonths > 1) {
      addParagraph(`2.3. CLÁUSULA DE FIDELIDADE CONTRATUAL: Para planos com periodicidade superior a um mês (trimestral, semestral e anual), fica expressamente pactuada a fidelidade obrigatória até o término do contrato vigente (${endFormatted}), justificada pelos descontos concedidos e alocação de infraestrutura dedicada.`);
    } else {
      addParagraph(`2.3. PERIODICIDADE MENSAL: A contratação com periodicidade mensal vigora pelo período de 30 (trinta) dias, renovável sucessivamente a cada quitação.`);
    }

    // Cláusula 3 - Preço, Descontos e Meios de Pagamento
    addClauseHeader('CLÁUSULA TERCEIRA', 'DO VALOR, DESCONTOS CONTRATUAIS E FORMAS DE PAGAMENTO');
    addParagraph(`3.1. VALOR CONTRATADO: Pela prestação dos serviços e licença, a CONTRATANTE pagará o valor ajustado de ${formatBRL(contract.value)} por ciclo (${periodicityLabel}).`);
    addParagraph(`3.2. DESCONTO DE PONTUALIDADE (5%): É conferido à CONTRATANTE o direito ao desconto de 5% (cinco por cento) para pagamentos quitados impreterivelmente até a data de vencimento da fatura.`);
    addParagraph(`3.3. DESCONTO NO PLANO ANUAL À VISTA (15%): Concede-se abatimento especial de 15% (quinze por cento) na contratação anual quando o pagamento ocorrer à vista em parcela única.`);
    addParagraph(`3.4. MODALIDADES DE PAGAMENTO ADMITIDAS:
• Plano Mensal: Pagamentos exclusivamente via PIX ou Boleto Bancário.
• Planos com mais de um mês (Trimestral, Semestral e Anual): Pagamentos via PIX, Boleto Bancário ou Cartão de Crédito corporativo, admitido o parcelamento.`);

    // Cláusula 4 - Código de Defesa do Consumidor (CDC)
    addClauseHeader('CLÁUSULA QUARTA', 'DO CÓDIGO DO CONSUMIDOR E DIREITO DE ARREPENDIMENTO');
    addParagraph(`4.1. DIREITO DE ARREPENDIMENTO (ART. 49 DO CDC): A CONTRATANTE poderá exercer seu direito de arrependimento e rescindir imotivadamente o presente contrato no prazo decadencial de 7 (sete) dias corridos a contar da data de início de validade (${startFormatted}), recebendo a devolução integral e imediata dos valores eventualmente pagos.`);
    addParagraph(`4.2. TRANSPARÊNCIA E DEVER DE INFORMAÇÃO (ART. 6º, III E IV DO CDC): A CONTRATADA assegura a precisão e clareza de todas as informações sobre módulos, tabelas e prazos.`);
    addParagraph(`4.3. LIMITAÇÃO DA MULTA MORATÓRIA (ART. 52, § 1º DO CDC): Em caso de inadimplemento pontual, a multa moratória não excederá 2% (dois por cento) sobre a parcela em atraso, com juros legais de 1% ao mês.`);

    // Cláusula 5 - Multa por Quebra de Contrato e Rescisão
    addClauseHeader('CLÁUSULA QUINTA', 'DA MULTA POR QUEBRA DE CONTRATO');
    addParagraph(`5.1. RESCISÃO ANTECIPADA: Ultrapassado o prazo do Art. 49 do CDC, na hipótese de resilição imotivada por iniciativa da CONTRATANTE antes de findo o período de fidelidade (planos trimestrais, semestrais ou anuais), incidirá MULTA POR QUEBRA DE CONTRATO fixada em ${contract.terminationPenaltyPercent}% (vinte por cento) calculada sobre a somatória das parcelas vincendas até o término do contrato vigente (${endFormatted}), nos termos dos artigos 408 a 416 do Código Civil Brasileiro.`);

    // Cláusula 6 - LGPD e Foro
    addClauseHeader('CLÁUSULA SEXTA', 'DA LGPD, CONFIDENCIALIDADE E FORO');
    addParagraph(`6.1. PROTEÇÃO DE DADOS: As partes comprometem-se ao estrito cumprimento da Lei Federal nº 13.709/2018 (LGPD), resguardando sob sigilo absoluto todos os dados societários e fiscais.`);
    addParagraph(`6.2. FORO: Elegem as partes o foro da comarca de ${DEFAULT_BANK_CONFIG.pixCity} para dirimir controvérsias decorrentes deste contrato.`);

    // Assinaturas
    cursorY += 6;
    checkPage(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Validade jurídica eletrônica fundamentada no Art. 10, § 2º da Medida Provisória nº 2.200-2/2001.', margin, cursorY);
    cursorY += 10;
    
    doc.text(`___________________________________________________          ___________________________________________________`, margin, cursorY);
    cursorY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(`CONTRATADA: ${DEFAULT_BANK_CONFIG.beneficiaryName}                 CONTRATANTE: ${contract.clientName}`, margin, cursorY);
    cursorY += 4;
    doc.text(`CNPJ: ${DEFAULT_BANK_CONFIG.beneficiaryDocument}                                             CNPJ: ${contract.cnpj}`, margin, cursorY);
    cursorY += 4;
    doc.text(`Status: ${contract.contractAccepted ? 'Assinado Digitalmente' : 'Pendente de Aceite'} | Registrado sob o nº ${contract.contractNumber}`, margin, cursorY);

    doc.save(`Contrato_${contract.contractNumber}_${contract.clientName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newCnpj) return;

    const selectedPlan = PLATFORM_PLANS.find(p => p.id === newPlanId) || PLATFORM_PLANS[1];
    const loyaltyMonths = newPeriodicity === 'anual' ? 12 : newPeriodicity === 'semestral' ? 6 : newPeriodicity === 'trimestral' ? 3 : 1;
    
    let basePrice = selectedPlan.priceMonthly;
    if (newPeriodicity === 'trimestral') basePrice = selectedPlan.priceQuarterly || (selectedPlan.priceMonthly * 3 * 0.95);
    else if (newPeriodicity === 'semestral') basePrice = selectedPlan.priceSemiannual || (selectedPlan.priceMonthly * 6 * 0.90);
    else if (newPeriodicity === 'anual') basePrice = selectedPlan.priceAnnual;

    let discount = 0;
    if (newPeriodicity === 'anual' && applyAnnualDiscount) discount = 15;
    else if (applyPromptDiscount) discount = 5;

    const finalValue = Math.round(basePrice * (1 - discount / 100) * 100) / 100;

    const endD = new Date(newStartDate + 'T12:00:00');
    endD.setMonth(endD.getMonth() + loyaltyMonths);
    const endDateStr = endD.toISOString().split('T')[0];

    const newContract: ServiceContractItem = {
      id: `ctr-${Date.now().toString().slice(-5)}`,
      clientName: newClientName,
      cnpj: newCnpj,
      customerEmail: newEmail || 'contato@cliente.com.br',
      customerPhone: newPhone || '(11) 98888-7777',
      planName: selectedPlan.name,
      planId: selectedPlan.id,
      periodicity: newPeriodicity,
      loyaltyMonths,
      startDate: newStartDate,
      endDate: endDateStr,
      value: finalValue,
      originalValue: basePrice,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      contractNumber: `CTR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}-${selectedPlan.name.slice(0, 3).toUpperCase()}`,
      terminationPenaltyPercent: 20,
      promptDiscountPercent: 5,
      annualCashDiscountPercent: 15,
      paymentMethods: loyaltyMonths > 1 ? ['PIX', 'Boleto Bancário', 'Cartão de Crédito'] : ['PIX', 'Boleto Bancário'],
      contractAccepted: false
    };

    setContracts(prev => [newContract, ...prev]);
    setIsModalOpen(false);
    generatePDF(newContract);
  };

  const handleDeleteContract = (id: string) => {
    if (confirm('Deseja realmente remover este registro de contrato?')) {
      setContracts(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-950/90 via-[#0F172A] to-[#0F172A] border border-orange-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <BrandLogo variant="badge" module="contratos" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-300 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60 font-mono">
                  Vértice Contratos & Engenharia Jurídica
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-1">
                Contratos de Prestação de Serviços & Engenharia Contratual
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Geração de instrumentos contratuais robustos e auditoria de minutas sob os requisitos do Código Civil (Art. 104) e esferas de risco (Civil, Compliance e Fiscal).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-orange-950/40 border border-orange-400/40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Contrato Vértice</span>
            </button>
          </div>
        </div>

        {/* Badges de Destaque Jurídico */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Validade (Art. 104 CC)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Proteção Ativos & NDA</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Percent className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Mitigação de Riscos Fiscais</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>500 Modelos de Minutas</span>
          </div>
        </div>
      </div>

      {/* MULTI-TAB CONTROLLERS FOR THE COCKPIT */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveSubTab('issued')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'issued'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Contratos Emitidos ({contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'matrix'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>Minutas de Serviços & Parcerias</span>
        </button>

        <button
          onClick={() => setActiveSubTab('auditor')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'auditor'
              ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>Auditor IA de Prestação & Parcerias</span>
        </button>
      </div>

      {/* TAB 1: ISSUED CONTRACTS */}
      {activeSubTab === 'issued' && (
        <div className="space-y-4 animate-fadeIn">
          {/* FILTROS E BUSCA */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0F172A] p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, CNPJ, número de contrato ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Total de Contratos Gerados: <strong className="text-slate-100">{contracts.length}</strong>
            </div>
          </div>

          {/* TABELA DE CONTRATOS */}
          <div className="bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B0F19] text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Contrato Nº / Início</th>
                    <th className="p-4">Cliente / CNPJ</th>
                    <th className="p-4">Plano Escolhido</th>
                    <th className="p-4">Periodicidade & Fidelidade</th>
                    <th className="p-4">Valor & Descontos</th>
                    <th className="p-4">Meios de Pagamento</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredContracts.map((contract) => {
                    const startDateFormatted = new Date(contract.startDate + 'T12:00:00').toLocaleDateString('pt-BR');
                    const endDateFormatted = new Date(contract.endDate + 'T12:00:00').toLocaleDateString('pt-BR');

                    return (
                      <tr key={contract.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-4">
                          <div className="font-bold text-blue-400 text-xs">{contract.contractNumber}</div>
                          <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>Início: {startDateFormatted}</span>
                          </div>
                        </td>

                        <td className="p-4 font-sans">
                          <div className="font-bold text-slate-100 text-xs">{contract.clientName}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{contract.cnpj}</div>
                        </td>

                        <td className="p-4 font-sans">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-950/70 text-blue-300 border border-blue-800 font-bold text-xs inline-block">
                            {contract.planName}
                          </span>
                        </td>

                        <td className="p-4 font-sans">
                          <div className="font-semibold text-slate-200 capitalize">
                            {contract.periodicity} ({contract.loyaltyMonths}m)
                          </div>
                          <div className="text-[10px] text-amber-400 font-medium mt-0.5 font-mono">
                            {contract.loyaltyMonths > 1 ? `Fidelidade até ${endDateFormatted}` : 'Sem fidelidade'}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-bold text-emerald-400 text-xs">
                            {formatBRL(contract.value)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans">
                            {contract.periodicity === 'anual' ? 'Desc. 15% à vista' : 'Desc. 5% pontualidade'}
                          </div>
                        </td>

                        <td className="p-4 font-sans">
                          <div className="flex flex-wrap gap-1">
                            {contract.paymentMethods.map((m, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-300 font-medium whitespace-nowrap">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-4 font-sans">
                          {contract.contractAccepted ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                              Assinado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                              Vigente / Formalizado
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => generatePDF(contract)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white font-semibold text-xs transition flex items-center space-x-1 cursor-pointer"
                              title="Baixar Contrato Completo em PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                            <button
                              onClick={() => handleDeleteContract(contract.id)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                              title="Remover Contrato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: LIBRARY AND SPECIFIC SERVICE/PARTNERSHIP CONTRACT MODELS */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4 animate-fadeIn">
          {/* AVISO DE CONSOLIDAÇÃO NO MÓDULO BLINDAGEM SOCIETÁRIA */}
          <div className="bg-gradient-to-r from-orange-950/40 via-[#0F172A] to-[#0F172A] border border-orange-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Minutas de Governança, M&A, Acordos de Sócios e Blindagem Centralizadas
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  O acervo completo de 500 minutas de governança, holding familiar, proteção patrimonial e acordos societários complexos foi consolidado no módulo <strong>Blindagem Societária</strong>, equipado com o Analisador Jurídico IA de conformidade (0 a 100 pontos).
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-[11px] font-bold text-orange-300 shrink-0">
              Societário &gt; Blindagem Societária
            </span>
          </div>

          {/* MATRIX FILTERS AND SEARCH */}
          <div className="bg-[#0F172A] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar minuta de serviço ou parceria comercial..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="text-xs text-slate-400">
                Minutas de Prestação & Parcerias Ativas
              </div>
            </div>
          </div>

          {/* LIST OF CONTRACT MODELS */}
          <div className="grid grid-cols-1 gap-4">
            {CONTRACT_MATRIX_DATA.filter((model) => {
              const titleLower = model.title.toLowerCase();
              const isAllowed =
                titleLower.includes('prestação de serviço do sistema para cliente') ||
                titleLower.includes('parceria comercial');
              if (!isAllowed) return false;

              const matchSearch =
                model.title.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                model.id.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                model.description.toLowerCase().includes(matrixSearch.toLowerCase());
              return matchSearch;
            }).map((model) => {
              const isExpanded = expandedMatrixId === model.id;

              // Replace placeholders dynamically for live previewing
              const dynamicDraft = model.boilerplateDraft
                .replace(/{{CONTRATANTE_NOME}}/g, currentCompany?.name || "CONTRATANTE EXECUTIVA S.A.")
                .replace(/{{CONTRATANTE_CNPJ}}/g, currentCompany?.cnpj || "00.000.000/0001-99")
                .replace(/{{CONTRATANTE_ENDERECO}}/g, `${currentCompany?.uf || 'SP'}, Brasil`)
                .replace(/{{INVESTIDOR_NOME}}/g, "Carlos Miguel Vieira")
                .replace(/{{INVESTIDOR_DOCUMENTO}}/g, "123.456.789-00")
                .replace(/{{INVESTIDOR_ENDERECO}}/g, "Av. Paulista, 1000 - São Paulo/SP")
                .replace(/{{VALOR_APORTE}}/g, "250.000,00")
                .replace(/{{VALOR_APORTE_EXTENSO}}/g, "duzentos e cinquenta mil reais")
                .replace(/{{PERCENTUAL_PARTICIPACAO}}/g, "5")
                .replace(/{{PRAZO_CONVERSAO}}/g, "24")
                .replace(/{{BENEFICIARIO_NOME}}/g, "Sócio Executor de Operações")
                .replace(/{{BENEFICIARIO_DOCUMENTO}}/g, "987.654.321-99")
                .replace(/{{PERCENTUAL_MAXIMO}}/g, "10")
                .replace(/{{SOCIO_A_NOME}}/g, "Carlos Miguel Vieira")
                .replace(/{{SOCIO_A_DOCUMENTO}}/g, "123.456.789-00")
                .replace(/{{SOCIO_A_ENDERECO}}/g, "São Paulo/SP")
                .replace(/{{SOCIO_B_NOME}}/g, "Parceiro Estratégico")
                .replace(/{{SOCIO_B_DOCUMENTO}}/g, "888.888.888-88")
                .replace(/{{SOCIO_B_ENDERECO}}/g, "Rio de Janeiro/RJ")
                .replace(/{{EMPRESA_DENOMINACAO}}/g, currentCompany?.name?.toUpperCase() || "VÉRTICE INTELIGÊNCIA")
                .replace(/{{EMPRESA_CIDADE}}/g, "São Paulo")
                .replace(/{{EMPRESA_UF}}/g, currentCompany?.uf || "SP")
                .replace(/{{CAPITAL_SOCIAL}}/g, "100.000,00")
                .replace(/{{CAPITAL_SOCIAL_EXTENSO}}/g, "cem mil reais")
                .replace(/{{TITULAR_NOME}}/g, "Carlos Miguel")
                .replace(/{{TITULAR_DOCUMENTO}}/g, "123.456.789-00")
                .replace(/{{TITULAR_ENDERECO}}/g, "São Paulo/SP")
                .replace(/{{PRESTADOR_NOME}}/g, "Vértice Auditoria Contábil")
                .replace(/{{PRESTADOR_DOCUMENTO}}/g, "55.666.777/0001-11")
                .replace(/{{PRESTADOR_ENDERECO}}/g, "Av. Brigadeiro Faria Lima - SP")
                .replace(/{{TIPO_SERVICO}}/g, "Auditoria de Fator R e Conciliação Tributária Inteligente")
                .replace(/{{VALOR_MENSAL}}/g, "1.450,00")
                .replace(/{{DIA_VENCIMENTO}}/g, "10")
                .replace(/{{RECEPTORA_NOME}}/g, "Empresa Parceira Tecnológica Ltda")
                .replace(/{{RECEPTORA_DOCUMENTO}}/g, "44.444.444/0001-55")
                .replace(/{{RECEPTORA_ENDERECO}}/g, "Belo Horizonte/MG");

              return (
                <div key={model.id} className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden transition-all duration-200">
                  <div
                    onClick={() => setExpandedMatrixId(isExpanded ? null : model.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded font-mono">
                          {model.id}
                        </span>
                        <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-2 py-0.5 rounded">
                          {model.vertical}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mt-1">{model.title}</h4>
                      <p className="text-xs text-slate-400">{model.description}</p>
                    </div>

                    <span className="text-xs text-blue-400 font-bold whitespace-nowrap bg-blue-500/10 px-2.5 py-1 rounded-lg">
                      {isExpanded ? "Recolher Detalhes ▲" : "Ver Estruturação ▼"}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-800 bg-[#0B0F19]/50 space-y-5 animate-fadeIn">
                      {/* 3 GRID CARDS FOR GUIDELINES REQUIREMENTS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. ELEMENTOS VITAIS */}
                        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                            <Sparkles className="w-4 h-4" />
                            <span>1. Elementos Vitais Mapeados</span>
                          </div>
                          <div className="text-[11px] space-y-2 text-slate-300">
                            <p><strong>Preâmbulo:</strong> {model.vitais.preambulo}</p>
                            <p><strong>Objeto:</strong> {model.vitais.objeto}</p>
                            <p><strong>Preço/Reajuste:</strong> {model.vitais.preco}</p>
                            <p><strong>Vigência/Extinção:</strong> {model.vitais.vigencia}</p>
                            <p><strong>Proteção de Ativos:</strong> {model.vitais.protecao}</p>
                            <p><strong>Disputas/Foro:</strong> {model.vitais.foro}</p>
                          </div>
                        </div>

                        {/* 2. REQUISITOS ABSOLUTOS DE VALIDADE */}
                        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                            <Scale className="w-4 h-4" />
                            <span>2. Validade (Art. 104 CC)</span>
                          </div>
                          <div className="text-[11px] space-y-2 text-slate-300">
                            <p><strong>Agente Capaz:</strong> {model.validadeChecklist.agenteCapaz}</p>
                            <p><strong>Objeto Lícito & Possível:</strong> {model.validadeChecklist.objetoLicito}</p>
                            <p><strong>Forma Legal Prescrita:</strong> {model.validadeChecklist.formaPrescrita}</p>
                          </div>
                        </div>

                        {/* 3. MATRIZ DE RISCO MULTI-ESFERAS */}
                        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 space-y-2.5">
                          <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider pb-1.5 border-b border-slate-800">
                            <ShieldCheck className="w-4 h-4" />
                            <span>3. Matriz Multi-Esferas</span>
                          </div>
                          <div className="text-[11px] space-y-2 text-slate-300">
                            <p><strong className="text-emerald-400">Esfera Civil (Art. 478 CC):</strong> {model.riscoEsferas.civil}</p>
                            <p><strong className="text-amber-400">Compliance & Penal:</strong> {model.riscoEsferas.compliance}</p>
                            <p><strong className="text-blue-400">Esfera Fiscal (CNAEs/Retenções):</strong> {model.riscoEsferas.fiscal}</p>
                          </div>
                        </div>
                      </div>

                      {/* LIVE AUTO-FILLED MINUTA DRAFT WITH COPY/DOWNLOAD TOOLS */}
                      <div className="bg-[#090D16] border border-slate-800/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                          <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                            <FileCode className="w-4 h-4 text-blue-400" />
                            <span>Minuta Gerada de Engenharia Contratual (Preenchimento Automático)</span>
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(dynamicDraft);
                                setCopiedContractId(model.id);
                                setTimeout(() => setCopiedContractId(null), 2000);
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 transition flex items-center space-x-1 cursor-pointer border border-slate-700"
                            >
                              {copiedContractId === model.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copiar Texto</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                const doc = new jsPDF({ unit: 'mm', format: 'a4' });
                                doc.setFont('helvetica', 'normal');
                                doc.setFontSize(9.5);
                                doc.setTextColor(40, 40, 40);
                                const lines = doc.splitTextToSize(dynamicDraft, 170);
                                let y = 20;
                                for (const line of lines) {
                                  if (y > 275) {
                                    doc.addPage();
                                    y = 20;
                                  }
                                  doc.text(line, 20, y);
                                  y += 5;
                                }
                                doc.save(`Minuta_${model.id}_${model.title.replace(/\s+/g, '_')}.pdf`);
                              }}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-[10px] font-bold text-white transition flex items-center space-x-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Baixar PDF</span>
                            </button>
                          </div>
                        </div>

                        <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto bg-[#070A10] p-3 rounded border border-slate-900">
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
      )}

      {/* TAB 3: CONTRACT DRAFT AUDITOR */}
      {activeSubTab === 'auditor' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-200">Auditoria IA de Minutas & Engenharia Contratual</h3>
              <p className="text-xs text-slate-400">
                Cole a sua minuta ou cláusula rascunhada abaixo para realizar uma auditoria rigorosa baseada no Art. 104 do Código Civil, identificação de riscos multi-esferas e enquadramento de elementos vitais.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Minuta Contratual / Texto do Rascunho</label>
                  <textarea
                    rows={12}
                    value={auditorDraftText}
                    onChange={(e) => setAuditorDraftText(e.target.value)}
                    placeholder="Cole aqui o preâmbulo, objeto ou clausulado geral do contrato para auditarmos..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-bold">Tipo de Minuta de Teste:</span>
                    <select
                      value={auditorSelectedType}
                      onChange={(e) => setAuditorSelectedType(e.target.value)}
                      className="p-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
                    >
                      {CONTRACT_MATRIX_DATA.filter((m) => {
                        const titleLower = m.title.toLowerCase();
                        return (
                          titleLower.includes('prestação de serviço do sistema para cliente') ||
                          titleLower.includes('parceria comercial')
                        );
                      }).map((model) => (
                        <option key={model.id} value={model.id}>{model.id} - {model.title}</option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const m = CONTRACT_MATRIX_DATA.find(x => x.id === auditorSelectedType) || 
                          CONTRACT_MATRIX_DATA.find(x => x.title.toLowerCase().includes('prestação de serviço do sistema para cliente')) ||
                          CONTRACT_MATRIX_DATA[0];
                        setAuditorDraftText(m.boilerplateDraft);
                      }}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 cursor-pointer"
                    >
                      Carregar Exemplo 📂
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAudit}
                    disabled={isAuditing || !auditorDraftText.trim()}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg cursor-pointer flex items-center space-x-1.5"
                  >
                    {isAuditing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Auditando...</span>
                      </>
                    ) : (
                      <>
                        <FileSearch className="w-4 h-4" />
                        <span>Analisar & Auditar Cláusulas 🛡️</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AUDIT OUTPUT DISPLAY */}
              <div className="bg-[#0B0F19] rounded-xl border border-slate-800 p-4 space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
                  Painel de Auditoria IA
                </span>

                {auditResult ? (
                  <div className="space-y-4 animate-fadeIn">
                    {/* RISK INDEX CIRCULAR Progress OR SCORE BANNER */}
                    <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Score Contratual</span>
                        <div className="text-2xl font-black text-white">{auditResult.score}<span className="text-xs text-slate-400">%</span></div>
                        <p className={`text-[10px] font-bold ${
                          auditResult.score >= 85 ? 'text-emerald-400' : auditResult.score >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {auditResult.score >= 85 ? 'Excelente Validade' : auditResult.score >= 60 ? 'Risco Moderado' : 'Alto Risco Legal'}
                        </p>
                      </div>

                      <div className="w-14 h-14 relative flex items-center justify-center shrink-0 font-mono">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="28" cy="28" r="24" stroke="#1e293b" strokeWidth="4.5" fill="transparent" />
                          <circle cx="28" cy="28" r="24" stroke={auditResult.score >= 85 ? '#10b981' : auditResult.score >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="4.5" fill="transparent"
                            strokeDasharray={150.7} strokeDashoffset={150.7 * (1 - auditResult.score / 100)} strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-[11px] font-bold text-slate-200">{auditResult.score}%</span>
                      </div>
                    </div>

                    {/* VITAL ELEMENTS */}
                    <div className="space-y-1.5 text-xs">
                      <span className="font-bold text-slate-300 block mb-1">Elementos Estruturais Vitais:</span>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                        {[
                          { key: 'preambulo', label: 'Qualificação' },
                          { key: 'objeto', label: 'Objeto' },
                          { key: 'preco', label: 'Preço/Pagamento' },
                          { key: 'vigencia', label: 'Vigência/Extinção' },
                          { key: 'protecao', label: 'NDA/Proteção' },
                          { key: 'foro', label: 'Foro/Resolução' }
                        ].map((v) => {
                          const ok = auditResult.vitals[v.key];
                          return (
                            <div key={v.key} className="flex items-center space-x-1 text-slate-300">
                              {ok ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              )}
                              <span className={ok ? 'text-slate-300' : 'text-rose-400 font-bold'}>{v.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ART 104 VALIDATION CHECKLIST */}
                    <div className="space-y-1.5 text-xs bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                      <span className="font-bold text-slate-300 block">Art. 104 do Código Civil:</span>
                      <div className="space-y-1 text-[10px]">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>I. Agente Capaz</span>
                          <span className={auditResult.validade.agenteCapaz ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {auditResult.validade.agenteCapaz ? 'Verificado ✓' : 'Pendente ✗'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>II. Objeto Lícito & Possível</span>
                          <span className={auditResult.validade.objetoLicito ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {auditResult.validade.objetoLicito ? 'Verificado ✓' : 'Pendente ✗'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>III. Forma Prescrita/Não Defesa</span>
                          <span className={auditResult.validade.formaPrescrita ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {auditResult.validade.formaPrescrita ? 'Verificado ✓' : 'Pendente ✗'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500 space-y-2 p-4">
                    <FileSearch className="w-10 h-10 text-slate-700" />
                    <p className="text-xs">
                      Aguardando rascunho de minuta. Insira o texto à esquerda ou carregue um exemplo de teste para auditar riscos e validade jurídica.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* EXPANDED DETAILED MATRIX ESFERAS RISK OUTPUT UNDER TEXTAREA */}
            {auditResult && (
              <div className="border-t border-slate-800 pt-5 space-y-4 animate-fadeIn">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  <span>Matriz Multi-Esferas de Risco & Recomendações de Engenharia Contratual</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ESFERA CIVIL CARD */}
                  <div className={`p-4 rounded-xl border ${
                    auditResult.riscos.civil.ok ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-amber-950/20 border-amber-800/60'
                  } space-y-2`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300">Esfera Civil (Art. 478 CC)</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                        auditResult.riscos.civil.ok ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                      }`}>
                        {auditResult.riscos.civil.ok ? 'Equilibrado' : 'Ajustes Requeridos'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {auditResult.riscos.civil.warning || "Cláusula de reequilíbrio econômico, imprevisão e multa proporcional validadas em perfeita simetria."}
                    </p>
                    <div className="bg-[#090D16] p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-1 mt-2">
                      <strong className="text-slate-300 block">Correção Recomendada:</strong>
                      <span>{auditResult.riscos.civil.correction}</span>
                    </div>
                  </div>

                  {/* ESFERA PENAL E COMPLIANCE CARD */}
                  <div className={`p-4 rounded-xl border ${
                    auditResult.riscos.compliance.ok ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-amber-950/20 border-amber-800/60'
                  } space-y-2`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300">Penal & Compliance (Art. 171/299 CP)</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                        auditResult.riscos.compliance.ok ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                      }`}>
                        {auditResult.riscos.compliance.ok ? 'Verificado' : 'Aviso Legal'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {auditResult.riscos.compliance.warning || "Salvaguardas de conformidade ideológica, compliance geral e prevenção a atos ilícitos ativadas."}
                    </p>
                    <div className="bg-[#090D16] p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-1 mt-2">
                      <strong className="text-slate-300 block">Correção Recomendada:</strong>
                      <span>{auditResult.riscos.compliance.correction}</span>
                    </div>
                  </div>

                  {/* ESFERA FISCAL E TRIBUTÁRIA CARD */}
                  <div className={`p-4 rounded-xl border ${
                    auditResult.riscos.fiscal.ok ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-amber-950/20 border-amber-800/60'
                  } space-y-2`}>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-bold text-slate-300">Esfera Fiscal (CNAEs & Retenções)</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                        auditResult.riscos.fiscal.ok ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
                      }`}>
                        {auditResult.riscos.fiscal.ok ? 'Retenções Detalhadas' : 'Tributos Indefinidos'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {auditResult.riscos.fiscal.warning || "Definições explícitas de fato gerador tributário, responsabilidade de recolhimento de impostos mapeadas."}
                    </p>
                    <div className="bg-[#090D16] p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-1 mt-2">
                      <strong className="text-slate-300 block">Correção Recomendada:</strong>
                      <span>{auditResult.riscos.fiscal.correction}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE NOVO CONTRATO ROBUSTO */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F172A] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6"
            >
              <div className="bg-[#0B0F19] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Scale className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-slate-100 font-sans">
                    Gerar Novo Contrato com Rigor Jurídico & CDC
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 font-bold cursor-pointer font-sans"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleGenerate} className="p-6 space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Nome / Razão Social do Cliente *</label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Ex: Aliança Contabilidade Ltda"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">CNPJ ou CPF *</label>
                    <input
                      type="text"
                      required
                      value={newCnpj}
                      onChange={(e) => setNewCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">E-mail Corporativo</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="fiscal@empresa.com.br"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Seleção do Plano e Periodicidade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Plano Escolhido</label>
                    <select
                      value={newPlanId}
                      onChange={(e) => setNewPlanId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      {PLATFORM_PLANS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Periodicidade</label>
                    <select
                      value={newPeriodicity}
                      onChange={(e) => setNewPeriodicity(e.target.value as PlanPeriodicity)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="mensal">Mensal (Recorrente)</option>
                      <option value="trimestral">Trimestral (3 meses)</option>
                      <option value="semestral">Semestral (6 meses)</option>
                      <option value="anual">Anual (12 meses)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Data Início Validade</label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Opções de Desconto */}
                <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Condições Promocionais & Descontos:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={applyPromptDiscount}
                        onChange={(e) => {
                          setApplyPromptDiscount(e.target.checked);
                          if (e.target.checked) setApplyAnnualDiscount(false);
                        }}
                        className="rounded border-slate-700 text-emerald-600 bg-slate-900"
                      />
                      <span>Desconto de 5% de Pontualidade</span>
                    </label>

                    {newPeriodicity === 'anual' && (
                      <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={applyAnnualDiscount}
                          onChange={(e) => {
                            setApplyAnnualDiscount(e.target.checked);
                            if (e.target.checked) setApplyPromptDiscount(false);
                          }}
                          className="rounded border-slate-700 text-blue-600 bg-slate-900"
                        />
                        <span>Desconto de 15% no Anual à Vista</span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Cláusulas Legais Incluídas Automaticamente */}
                <div className="p-3 bg-blue-950/30 border border-blue-900/60 rounded-xl text-[11px] text-blue-200 space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <Scale className="w-3.5 h-3.5 text-blue-400" />
                    <span>Garantias e Cláusulas Fixadas no Instrumento:</span>
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                    <li>Direito de Arrependimento legal em 7 dias (Art. 49 da Lei 8.078/1990 - CDC);</li>
                    <li>Multa compensatória de quebra de contrato de 20% (Código Civil Arts. 408 a 416);</li>
                    <li>Fidelidade até o término da vigência para planos com mais de um mês;</li>
                    <li>Meios de pagamento autorizados: PIX, Boleto e Cartão de Crédito corporativo.</li>
                  </ul>
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-lg cursor-pointer flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Salvar & Gerar PDF Oficial</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
