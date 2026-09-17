import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  User, 
  CreditCard, 
  QrCode, 
  Scale, 
  Award,
  Layers,
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SoldSubscription, PlanDefinition, BankConfig } from '../types';

interface ContractViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SoldSubscription | null;
  plan?: PlanDefinition | null;
  bankConfig: BankConfig;
  onConfirmAcceptance?: (subId: string, ip: string) => void;
}

export const ContractViewerModal: React.FC<ContractViewerModalProps> = ({
  isOpen,
  onClose,
  subscription,
  plan,
  bankConfig,
  onConfirmAcceptance
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  if (!isOpen || !subscription) return null;

  const effectivePlanName = subscription.planName || plan?.name || 'Plano Estratégico';
  const periodicityLabel = 
    subscription.periodicity === 'anual' ? 'Anual (12 Meses)' :
    subscription.periodicity === 'semestral' ? 'Semestral (6 Meses)' :
    subscription.periodicity === 'trimestral' ? 'Trimestral (3 Meses)' : 'Mensal (Recorrente)';
  
  const loyaltyMonths = 
    subscription.loyaltyMonths || 
    (subscription.periodicity === 'anual' ? 12 : 
     subscription.periodicity === 'semestral' ? 6 : 
     subscription.periodicity === 'trimestral' ? 3 : 1);

  const hasLoyalty = loyaltyMonths > 1;
  const terminationPenaltyPercent = subscription.terminationFinePercent || plan?.terminationPenaltyPercent || 20;
  const promptDiscountPercent = plan?.promptPaymentDiscountPercent || 5;
  const annualCashDiscountPercent = plan?.annualCashDiscountPercent || 15;

  const startDateFormatted = new Date(subscription.startDate + 'T12:00:00').toLocaleDateString('pt-BR');
  
  // Calcular término da vigência
  const endDateObj = subscription.contractEndDate ? new Date(subscription.contractEndDate + 'T12:00:00') : (() => {
    const d = new Date(subscription.startDate + 'T12:00:00');
    d.setMonth(d.getMonth() + loyaltyMonths);
    return d;
  })();
  const endDateFormatted = endDateObj.toLocaleDateString('pt-BR');

  const contractNum = subscription.contractNumber || `CTR-${subscription.startDate.slice(0,4)}-${subscription.id.slice(-6).toUpperCase()}`;

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSign = () => {
    setIsSigning(true);
    const mockIp = `189.${Math.floor(10 + Math.random() * 89)}.${Math.floor(10 + Math.random() * 89)}.${Math.floor(10 + Math.random() * 89)}`;
    setTimeout(() => {
      setIsSigning(false);
      setSignedSuccess(true);
      if (onConfirmAcceptance) {
        onConfirmAcceptance(subscription.id, mockIp);
      }
    }, 900);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let cursorY = 22;
    const margin = 20;
    const pageWidth = 210;
    const contentWidth = pageWidth - (margin * 2);

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

    // Cabeçalho Principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text('CONTRATO DE LICENCIAMENTO DE SOFTWARE E PRESTAÇÃO DE', 105, cursorY, { align: 'center' });
    cursorY += 6;
    doc.text('SERVIÇOS DE INTELIGÊNCIA E CONSULTORIA TRIBUTÁRIA', 105, cursorY, { align: 'center' });
    cursorY += 6;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Instrumento Registrado Eletronicamente sob o nº ${contractNum}`, 105, cursorY, { align: 'center' });
    cursorY += 8;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 7;

    // Qualificação das Partes
    addTitle('QUALIFICAÇÃO DAS PARTES CONTRATANTES');
    addParagraph(`CONTRATADA: ${bankConfig.beneficiaryName}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${bankConfig.beneficiaryDocument}, com sede administrativa e fiscal em ${bankConfig.pixCity}, desenvolvedora e titular dos direitos de exploração da Plataforma Vértice Auditor Fiscal - Auditoria Tributária de Planejamento Tributário e Inteligência Fiscal, doravante denominada simplesmente CONTRATADA.`);
    addParagraph(`CONTRATANTE: ${subscription.customerName}, com sede ou domicílio vinculado à sociedade ${subscription.companyName}, inscrita no CNPJ/CPF sob nº ${subscription.customerDocument}, e-mail de contato ${subscription.customerEmail}, telefone ${subscription.customerPhone}, doravante denominada simplesmente CONTRATANTE.`);

    // Cláusula 1 - Do Objeto e Plano Escolhido
    addClauseHeader('CLÁUSULA PRIMEIRA', 'DO OBJETO E DO PLANO ESCOLHIDO');
    addParagraph(`1.1. O presente instrumento tem por objeto a concessão de licença de uso temporária, não exclusiva e intransferível do software de inteligência tributária, bem como a prestação continuada de serviços técnicos de consultoria fiscal digital, consubstanciada no plano denominado "${effectivePlanName}".`);
    addParagraph(`1.2. O plano contratado compreende exatamente a seguinte capacidade operacional e técnica:
• Quantidade de Operadores/Acessos Simultâneos: ${subscription.maxUsersAllowed >= 999 ? 'Ilimitados (Acesso Master Total)' : `${subscription.maxUsersAllowed} usuário(s) credenciado(s)`}.
• Capacidade de Empresas Cadastradas (CNPJs): ${subscription.maxCompaniesAllowed && subscription.maxCompaniesAllowed >= 999 ? 'Ilimitadas' : `${subscription.maxCompaniesAllowed || (subscription.planId === 'starter' ? 5 : subscription.planId === 'pro' ? 30 : 120)} empresa(s) simultânea(s)`}.
• Módulos Inclusos: Diagnóstico Executivo de Regimes, Comparativo Simples x Presumido x Real, Fator R Estratégico, Segregação CFOP e Monofásicos, Importação e Análise de PGDAS-D, Reforma Tributária (IBS/CBS), Pareceres Periciais e Auditoria Fiscal.`);

    // Cláusula 2 - Vigência, Data de Início e Fidelidade
    addClauseHeader('CLÁUSULA SEGUNDA', 'DA VIGÊNCIA, DATA DE INÍCIO E FIDELIDADE');
    addParagraph(`2.1. DATA DE INÍCIO DE VALIDADE: O presente contrato entra em vigor na data de ${startDateFormatted}, marco no qual se inicia a contagem incondicional de disponibilidade dos sistemas.`);
    addParagraph(`2.2. PRAZO DE VIGÊNCIA: O prazo de vigência deste contrato é de ${loyaltyMonths} (${loyaltyMonths === 1 ? 'um' : loyaltyMonths === 3 ? 'três' : loyaltyMonths === 6 ? 'seis' : 'doze'}) meses, com término previsto para ${endDateFormatted}.`);
    if (hasLoyalty) {
      addParagraph(`2.3. FIDELIDADE CONTRATUAL OBRIGATÓRIA: Em virtude das condições comerciais promocionais, investimento computacional e segregação de infraestrutura dedicada em favor da CONTRATANTE, os planos com periodicidade trimestral, semestral e anual estabelecem fidelidade vinculante até o término do período contratado vigente.`);
    } else {
      addParagraph(`2.3. PLANO MENSAL: A contratação com periodicidade mensal renova-se a cada 30 (trinta) dias, não incidindo período de fidelidade para além da mensalidade já liquidada.`);
    }

    // Cláusula 3 - Do Preço, Condições e Descontos
    addClauseHeader('CLÁUSULA TERCEIRA', 'DO PREÇO, DESCONTOS E FORMAS DE PAGAMENTO');
    addParagraph(`3.1. PREÇO CONTRATADO: Pela licença e serviços, a CONTRATANTE pagará o valor ajustado de ${formatBRL(subscription.pricePaid)} por ciclo (${periodicityLabel}).`);
    addParagraph(`3.2. DESCONTO DE PONTUALIDADE (5%): Fica assegurado à CONTRATANTE o abatimento correspondente a 5% (cinco por cento) sobre o valor da fatura quando a liquidação integral for consumada até o dia exato do vencimento.`);
    addParagraph(`3.3. DESCONTO NO PLANO ANUAL À VISTA (15%): Na opção pelo plano de periodicidade Anual quitado em cota única à vista, é conferido à CONTRATANTE desconto especial de 15% (quinze por cento) sobre a soma do valor tabelado.`);
    addParagraph(`3.4. FORMAS DE PAGAMENTO ACEITAS:
• Plano Mensal: Pagamento admitido exclusivamente via PIX ou Boleto Bancário com compensação em até 48 horas.
• Planos com mais de um mês (Trimestrais, Semestrais e Anuais): Pagamento admitido via PIX, Boleto Bancário ou Cartão de Crédito corporativo, facultado o parcelamento em conformidade com as regras vigentes do gateway de pagamentos.`);

    // Cláusula 4 - Código de Defesa do Consumidor e Conformidade Legal
    addClauseHeader('CLÁUSULA QUARTA', 'DO CÓDIGO DO CONSUMIDOR E DIREITO DE ARREPENDIMENTO');
    addParagraph(`4.1. DIREITO DE ARREPENDIMENTO (ART. 49 DO CDC): Em estrita observância ao art. 49 da Lei Federal nº 8.078/1990 (Código de Defesa do Consumidor), o CONTRATANTE tem o direito potestativo de desistir do presente contrato no prazo decadencial de 7 (sete) dias corridos, contados da data de início de validade ou disponibilização dos acessos. Exercido o arrependimento dentro deste prazo, os valores pagos serão restituídos integral e tempestivamente.`);
    addParagraph(`4.2. DEVER DE INFORMAÇÃO TRANSPARENTE (ART. 6º, III E IV DO CDC): A CONTRATADA prestou à CONTRATANTE esclarecimentos completos sobre funcionalidades, limitações, requisitos de rede e tabela de preços antes da formalização do aceite.`);
    addParagraph(`4.3. MORA E EQUILÍBRIO CONTRATUAL (ART. 52, § 1º DO CDC E CÓDIGO CIVIL): Na hipótese de impontualidade no pagamento, aplicar-se-á multa moratória de 2% (dois por cento) sobre o valor da parcela em aberto, cumulada com juros de mora legais de 1% ao mês e atualização monetária pelo IPCA-IBGE.`);

    // Cláusula 5 - Multa por Quebra de Contrato e Rescisão Antecipada
    addClauseHeader('CLÁUSULA QUINTA', 'DA MULTA POR QUEBRA DE CONTRATO E RESCISÃO');
    addParagraph(`5.1. RESCISÃO APÓS O PRAZO DE ARREPENDIMENTO: Ultrapassado o prazo do art. 49 do CDC, caso a CONTRATANTE opte pela resilição unilateral imotivada em planos que possuam fidelidade contratual (trimestral, semestral ou anual), incidirá MULTA DE QUEBRA DE CONTRATO no montante de ${terminationPenaltyPercent}% (${terminationPenaltyPercent === 20 ? 'vinte' : terminationPenaltyPercent} por cento), calculada sobre a totalidade do saldo residual das parcelas vincendas até o término regular da vigência contratada, com supedâneo nos artigos 408 a 416 do Código Civil Brasileiro.`);
    addParagraph(`5.2. MOTIVOS JUSTIFICADOS: Não incidirá multa rescisória caso a rescisão decorra de descumprimento comprovado e reiterado de obrigações contratuais imputável exclusivamente à CONTRATADA, após notificação formal com prazo saneador de 15 (quinze) dias úteis.`);

    // Cláusula 6 - Proteção de Dados (LGPD) e Foro
    addClauseHeader('CLÁUSULA SEXTA', 'DA LGPD, CONFIDENCIALIDADE E FORO');
    addParagraph(`6.1. PROTEÇÃO DE DADOS (LEI 13.709/2018): As partes comprometem-se a cumprir a LGPD, adotando salvaguardas técnicas para que os dados fiscais e cadastrais inseridos na plataforma permaneçam estritamente confidenciais e protegidos.`);
    addParagraph(`6.2. DO FORO: As partes elegem o foro da comarca da sede da CONTRATADA para dirimir quaisquer controvérsias oriundas do presente instrumento.`);

    // Assinaturas
    cursorY += 6;
    checkPage(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(`Instrumento firmado digitalmente com validade jurídica perante o Art. 10 da MP nº 2.200-2/2001.`, margin, cursorY);
    cursorY += 10;
    
    doc.text(`___________________________________________________          ___________________________________________________`, margin, cursorY);
    cursorY += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(`CONTRATADA: ${bankConfig.beneficiaryName}                 CONTRATANTE: ${subscription.customerName}`, margin, cursorY);
    cursorY += 4;
    doc.text(`CNPJ: ${bankConfig.beneficiaryDocument}                                             Documento: ${subscription.customerDocument}`, margin, cursorY);
    cursorY += 4;
    doc.text(`Data de Assinatura: ${subscription.contractSignedAt || new Date().toLocaleString('pt-BR')} | IP: ${subscription.contractIp || '189.44.12.82'}`, margin, cursorY);

    doc.save(`Contrato_${contractNum}_${subscription.customerName.replace(/\s+/g, '_')}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-700/80 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-[#0B0F19] px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-700/80 flex items-center justify-center text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100">
                  Contrato de Prestação de Serviços & Licenciamento
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  {contractNum}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cliente: <strong className="text-slate-200">{subscription.customerName}</strong> ({subscription.companyName})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Imprimir Contrato"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Baixar Contrato Oficial em PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumo Rápido dos Dados Chave */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Plano Escolhido:</span>
            <span className="font-bold text-slate-100 flex items-center space-x-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{effectivePlanName}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Periodicidade:</span>
            <span className="font-bold text-emerald-400">
              {periodicityLabel}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Início de Validade:</span>
            <span className="font-bold text-slate-200 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{startDateFormatted}</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Fidelidade Contratual:</span>
            <span className={`font-bold ${hasLoyalty ? 'text-amber-400' : 'text-slate-300'}`}>
              {hasLoyalty ? `${loyaltyMonths} Meses (Até ${endDateFormatted})` : 'Sem Fidelidade (Mensal)'}
            </span>
          </div>
        </div>

        {/* Corpo do Contrato com Estilização Jurídica Imersiva */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-300 text-xs sm:text-[13px] leading-relaxed select-text bg-[#0B0F19]/60">
          
          <div className="text-center pb-4 border-b border-slate-800">
            <h1 className="text-base sm:text-lg font-black tracking-wide text-slate-100 uppercase">
              Instrumento Particular de Contrato de Licenciamento de Software e Prestação de Serviços de Inteligência e Consultoria Tributária
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Com fundamentação expressa na Lei nº 8.078/1990 (Código de Defesa do Consumidor), Lei nº 10.406/2002 (Código Civil) e Lei nº 13.709/2018 (LGPD)
            </p>
          </div>

          {/* Partes */}
          <section className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-4 h-4" />
              <span>1. Das Partes Contratantes</span>
            </h3>
            <p>
              <strong className="text-slate-100">CONTRATADA:</strong> {bankConfig.beneficiaryName}, pessoa jurídica de direito privado inscrita no CNPJ sob o nº <strong className="text-slate-100">{bankConfig.beneficiaryDocument}</strong>, com sede e domicílio tributário em {bankConfig.pixCity}, desenvolvedora, proprietária e gestora da Plataforma Vértice Auditor Fiscal - Auditoria Tributária de Inteligência Fiscal e Planejamento Tributário Estratégico, representada neste ato na forma de seus atos constitutivos;
            </p>
            <p>
              <strong className="text-slate-100">CONTRATANTE:</strong> <strong className="text-slate-100">{subscription.customerName}</strong>, vinculado à sociedade empresária <strong className="text-slate-100">{subscription.companyName}</strong>, inscrita no CNPJ/CPF sob nº <strong className="text-slate-100">{subscription.customerDocument}</strong>, com e-mail corporativo cadastrado <span className="text-blue-300">{subscription.customerEmail}</span> e telefone {subscription.customerPhone}.
            </p>
          </section>

          {/* Cláusula 1 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-slate-100 uppercase flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-blue-400">1</span>
              <span>Cláusula Primeira – Do Objeto e Capacidade do Plano Escolhido</span>
            </h4>
            <p>
              <strong>1.1. Objeto:</strong> O presente contrato tem por objeto a concessão de licença de uso do software digital especializado e a prestação continuada de serviços técnicos de inteligência tributária, apuração fiscal, comparativos entre Simples Nacional, Lucro Presumido e Lucro Real, auditoria via inteligência artificial e consultoria da Reforma Tributária (EC 132/2023).
            </p>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1.5 mt-2">
              <p className="font-semibold text-slate-200 text-xs">Especificações Detalhadas do Plano Ativo ({effectivePlanName}):</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                <li><strong>Operadores Simultâneos:</strong> {subscription.maxUsersAllowed >= 999 ? 'Ilimitados' : `${subscription.maxUsersAllowed} acessos autorizados com perfis granulares`}</li>
                <li><strong>Empresas Cadastradas:</strong> {subscription.maxCompaniesAllowed && subscription.maxCompaniesAllowed >= 999 ? 'Ilimitadas' : `${subscription.maxCompaniesAllowed || 30} CNPJs simultâneos`}</li>
                <li><strong>Módulos Inclusos:</strong> Comparativo de 4 Regimes Tributários, Segregação CFOP e Monofásicos, Diagnóstico Fator R com Folha e Pró-labore, Importação de Extratos PGDAS-D, Reforma Tributária (IBS/CBS/Split Payment), Parecer Técnico e Auditor IA.</li>
              </ul>
            </div>
          </section>

          {/* Cláusula 2 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-slate-100 uppercase flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-blue-400">2</span>
              <span>Cláusula Segunda – Da Vigência, Data de Início e Fidelidade</span>
            </h4>
            <p>
              <strong>2.1. Data de Início de Validade:</strong> O presente instrumento entra em vigor e passa a produzir todos os seus efeitos de direito a partir de <strong className="text-emerald-400">{startDateFormatted}</strong>, data em que as credenciais e acessos foram ativados.
            </p>
            <p>
              <strong>2.2. Prazo de Vigência e Renovação:</strong> O contrato vigorará pelo período de <strong>{loyaltyMonths} ({loyaltyMonths === 1 ? 'um' : loyaltyMonths === 3 ? 'três' : loyaltyMonths === 6 ? 'seis' : 'doze'}) meses</strong>, com data prevista de término em <strong className="text-slate-100">{endDateFormatted}</strong>, renovando-se sucessivamente caso não haja notificação prévia de 30 (trinta) dias.
            </p>
            {hasLoyalty && (
              <div className="bg-amber-950/30 border border-amber-800/60 p-3.5 rounded-xl space-y-1 text-amber-200">
                <p className="font-bold flex items-center space-x-1.5 text-xs">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>2.3. Fidelidade Contratual Obrigatória (Planos com mais de 1 mês):</span>
                </p>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  Para os planos com periodicidade trimestral, semestral e anual, a CONTRATANTE assume compromisso irrevogável de <strong>fidelidade contratual até o término do contrato vigente ({endDateFormatted})</strong>, contrapartida imprescindível para os descontos tarifários, alocação de servidores dedicados e suporte contínuo disponibilizados.
                </p>
              </div>
            )}
          </section>

          {/* Cláusula 3 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-slate-100 uppercase flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-blue-400">3</span>
              <span>Cláusula Terceira – Do Preço, Descontos Especiais e Meios de Pagamento</span>
            </h4>
            <p>
              <strong>3.1. Valor Contratado:</strong> Pela licença de software e consultoria contratada, a CONTRATANTE pagará o montante de <strong className="text-emerald-400">{formatBRL(subscription.pricePaid)}</strong> por ciclo ({periodicityLabel}).
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-emerald-800/60 space-y-1">
                <p className="font-bold text-emerald-400 flex items-center space-x-1 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Desconto de 5% por Pontualidade:</span>
                </p>
                <p className="text-xs text-slate-300">
                  Fica garantido <strong>desconto de {promptDiscountPercent}%</strong> sobre o valor do plano para pagamentos efetuados impreterivelmente até a data de vencimento de cada fatura.
                </p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-blue-800/60 space-y-1">
                <p className="font-bold text-blue-400 flex items-center space-x-1 text-xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>Desconto de 15% no Plano Anual à Vista:</span>
                </p>
                <p className="text-xs text-slate-300">
                  Para contratações com periodicidade anual liquidadas à vista em parcela única, é aplicado o <strong>desconto de {annualCashDiscountPercent}%</strong> sobre o valor consolidado.
                </p>
              </div>
            </div>

            <p className="mt-2">
              <strong>3.4. Modalidades de Pagamento:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
              <li><strong>Plano Mensal:</strong> Disponível exclusivamente via <strong>PIX Dinâmico com QR Code</strong> e <strong>Boleto Bancário</strong>.</li>
              <li><strong>Planos com mais de um mês (Trimestrais, Semestrais e Anuais):</strong> Disponíveis nas modalidades de <strong>PIX</strong>, <strong>Boleto Bancário</strong> e <strong>Cartão de Crédito</strong> com possibilidade de parcelamento.</li>
            </ul>
          </section>

          {/* Cláusula 4 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-slate-100 uppercase flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-blue-400">4</span>
              <span>Cláusula Quarta – Da Proteção do Código de Defesa do Consumidor (CDC)</span>
            </h4>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
              <p>
                <strong>4.1. Direito de Arrependimento (Art. 49 da Lei 8.078/1990 - CDC):</strong> O CONTRATANTE poderá exercer seu direito de arrependimento e desistir imotivadamente deste contrato no prazo legal incondicional de <strong>7 (sete) dias corridos</strong> a contar da sua formalização eletrônica ou liberação do acesso. Havendo manifestação dentro do septêndio legal, a totalidade de quaisquer quantias quitadas será estornada imediatamente sem qualquer retenção.
              </p>
              <p>
                <strong>4.2. Dever de Transparência e Informação Adequada (Art. 6º, III e IV do CDC):</strong> A CONTRATADA declara haver disponibilizado ao CONTRATANTE demonstração cabal, suporte técnico e detalhamento das alíquotas, limites de empresa e funcionalidades da plataforma antes do aceite.
              </p>
              <p>
                <strong>4.3. Limitação de Encargos Moratórios (Art. 52, § 1º do CDC):</strong> As multas de mora decorrentes de inadimplemento pontual de mensalidade ficam expressamente limitadas ao percentual de <strong>2% (dois por cento)</strong> sobre a parcela em atraso, com juros moratórios legais de 1% (um por cento) ao mês calculados pro rata die.
              </p>
            </div>
          </section>

          {/* Cláusula 5 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-slate-100 uppercase flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-blue-400">5</span>
              <span>Cláusula Quinta – Da Multa de Quebra de Contrato e Rescisão</span>
            </h4>
            <p>
              <strong>5.1. Resilição Unilateral Antecipada e Multa Compensatória:</strong> Salvo na hipótese legal de arrependimento em 7 dias (Art. 49 CDC), a resilição imotivada por iniciativa do CONTRATANTE antes de findo o período de fidelidade (planos trimestrais, semestrais ou anuais) sujeitará o mesmo ao pagamento de <strong>multa compensatória de rescisão contratual fixada em {terminationPenaltyPercent}% (vinte por cento)</strong> sobre o saldo total das parcelas vincendas até o término do contrato, em estrita harmonia com os arts. 408 a 416 do Código Civil Brasileiro.
            </p>
            <p>
              <strong>5.2. Suspensão por Inadimplemento:</strong> Atrasos superiores a 15 (quinze) dias na quitação de faturas autorizam a CONTRATADA a suspender temporariamente os acessos da CONTRATANTE até a devida regularização financeira.
            </p>
          </section>

          {/* Cláusula 6 */}
          <section className="space-y-2">
            <h4 className="text-sm font-bold text-slate-100 uppercase flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono text-blue-400">6</span>
              <span>Cláusula Sexta – Da LGPD, Sigilo Profissional e Foro de Eleição</span>
            </h4>
            <p>
              <strong>6.1. Proteção de Dados (Lei 13.709/2018):</strong> Toda e qualquer informação societária, faturamento, folha de pagamento e documentos fiscais inseridos na plataforma constituem patrimônio confidencial da CONTRATANTE, sendo tratados de modo estritamente seguro sob criptografia de ponta a ponta.
            </p>
            <p>
              <strong>6.2. Foro de Eleição:</strong> As partes elegem o Foro da Comarca de {bankConfig.pixCity} para dirimir quaisquer dúvidas decorrentes da execução deste instrumento, renunciando expressamente a qualquer outro.
            </p>
          </section>

          {/* Termo de Aceite e Assinatura Digital */}
          <div className="pt-4 border-t border-slate-800 bg-slate-900/90 p-5 rounded-2xl border border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h5 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Validação Jurídica & Assinatura Eletrônica</span>
                </h5>
                <p className="text-slate-400 text-xs mt-0.5">
                  Art. 10, § 2º da MP 2.200-2/2001 e Art. 5º da Lei 14.063/2020
                </p>
                {subscription.contractAccepted || signedSuccess ? (
                  <div className="mt-2 text-xs text-emerald-400 flex items-center space-x-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Contrato Aceito e Assinado Digitalmente em {subscription.contractSignedAt || new Date().toLocaleString('pt-BR')} (IP: {subscription.contractIp || '189.44.12.82'})
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-amber-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Pendente de confirmação do aceite contratual.</span>
                  </div>
                )}
              </div>

              {(!subscription.contractAccepted && !signedSuccess) && (
                <button
                  onClick={handleSign}
                  disabled={isSigning}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center space-x-2 cursor-pointer shadow-lg disabled:opacity-50 shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSigning ? 'Processando Aceite...' : 'Assinar Digitalmente'}</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-[#0B0F19] px-6 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            {effectivePlanName} • Vigência: {startDateFormatted} até {endDateFormatted}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
