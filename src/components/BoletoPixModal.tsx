import React, { useState, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  QrCode, 
  Barcode, 
  ShieldCheck, 
  Calendar, 
  Building2, 
  User, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle,
  Download,
  CreditCard,
  Percent,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { BillingInvoice, BankConfig, PlanPeriodicity } from '../types';
import { generatePixCopiaECola, generateBoletoLinhaDigitavel } from '../data/adminBillingData';

interface BoletoPixModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice | null;
  bankConfig: BankConfig;
  onMarkAsPaid?: (invoiceId: string) => void;
}

export const BoletoPixModal: React.FC<BoletoPixModalProps> = ({
  isOpen,
  onClose,
  invoice,
  bankConfig,
  onMarkAsPaid
}) => {
  const [activeTab, setActiveTab] = useState<'pix' | 'boleto' | 'cartao'>('pix');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [simulatingPaid, setSimulatingPaid] = useState(false);

  // Estados para descontos dinâmicos
  const isAnnualPlan = invoice ? (invoice.periodicity === 'anual' || invoice.planName.toLowerCase().includes('anual')) : false;
  const isMultiMonthPlan = invoice ? (isAnnualPlan || invoice.periodicity === 'trimestral' || invoice.periodicity === 'semestral' || invoice.amount > 500) : false;

  const [applyPromptDiscount, setApplyPromptDiscount] = useState(false); // 5% até o vencimento
  const [applyAnnualDiscount, setApplyAnnualDiscount] = useState(isAnnualPlan); // 15% no anual à vista

  // Cartão de crédito
  const [installments, setInstallments] = useState(1);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardSuccess, setCardSuccess] = useState(false);

  if (!isOpen || !invoice) return null;

  // Cálculo do valor efetivo do plano ativo com descontos
  const baseAmount = invoice.originalAmount || invoice.amount;
  
  let effectiveDiscountPercent = 0;
  let discountReason = '';

  if (isAnnualPlan && applyAnnualDiscount) {
    effectiveDiscountPercent = 15;
    discountReason = '15% de Desconto para Pagamento Anual à Vista';
  } else if (applyPromptDiscount) {
    effectiveDiscountPercent = 5;
    discountReason = '5% de Desconto por Pagamento até o Vencimento';
  }

  const effectiveAmount = Math.max(1, baseAmount * (1 - effectiveDiscountPercent / 100));

  // Geração dinâmica do PIX Copia e Cola com o valor exato do plano ativo do cliente
  const dynamicPixCopiaECola = useMemo(() => {
    return generatePixCopiaECola({
      pixKey: bankConfig.pixKey,
      beneficiaryName: bankConfig.beneficiaryName,
      cityName: bankConfig.pixCity,
      amount: effectiveAmount,
      txId: invoice.txId || `VF-${Date.now().toString().slice(-6)}`
    });
  }, [bankConfig, effectiveAmount, invoice.txId]);

  // Geração dinâmica da Linha Digitável do Boleto com o valor exato
  const dynamicBoleto = useMemo(() => {
    return generateBoletoLinhaDigitavel(
      bankConfig.bankCode, 
      effectiveAmount, 
      invoice.nossoNumero || '0000012345'
    );
  }, [bankConfig.bankCode, effectiveAmount, invoice.nossoNumero]);

  // URL para imagem de QR Code dinâmico do PIX
  const qrCodeImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(dynamicPixCopiaECola)}&size=240&ecLevel=M&margin=1`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSimulatePayment = () => {
    setSimulatingPaid(true);
    setTimeout(() => {
      setSimulatingPaid(false);
      if (onMarkAsPaid) {
        onMarkAsPaid(invoice.id);
      }
    }, 1000);
  };

  const handleProcessCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      alert('Por favor, preencha todos os dados do cartão.');
      return;
    }
    setSimulatingPaid(true);
    setTimeout(() => {
      setSimulatingPaid(false);
      setCardSuccess(true);
      if (onMarkAsPaid) {
        onMarkAsPaid(invoice.id);
      }
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatBRL = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#0F172A] border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-[#0B0F19] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Fatura de Assinatura #{invoice.id}</span>
                {invoice.status === 'pago' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    PAGO
                  </span>
                )}
                {invoice.status === 'pendente' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
                    PENDENTE
                  </span>
                )}
                {invoice.status === 'vencido' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800">
                    VENCIDO
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Cliente: <strong className="text-slate-200">{invoice.customerName}</strong> • {invoice.planName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              title="Imprimir documento de cobrança"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection: PIX vs BOLETO vs CARTÃO DE CRÉDITO */}
        <div className="flex flex-wrap border-b border-slate-800 bg-[#0B0F19]/60 px-6 pt-3 gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('pix')}
            className={`pb-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm flex items-center space-x-2 transition cursor-pointer border-b-2 ${
              activeTab === 'pix'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code PIX (Instantâneo)</span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
              Automático
            </span>
          </button>

          <button
            onClick={() => setActiveTab('boleto')}
            className={`pb-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm flex items-center space-x-2 transition cursor-pointer border-b-2 ${
              activeTab === 'boleto'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>Boleto Bancário</span>
          </button>

          {/* Opção de Cartão para planos com mais de um mês (Trimestral, Semestral, Anual) */}
          <button
            onClick={() => setActiveTab('cartao')}
            className={`pb-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm flex items-center space-x-2 transition cursor-pointer border-b-2 ${
              activeTab === 'cartao'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cartão de Crédito</span>
            {isMultiMonthPlan && (
              <span className="text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800 px-1.5 py-0.2 rounded font-bold">
                Até 12x
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">

          {/* Painel de Configuração de Desconto Dinâmico (5% Pontualidade / 15% Anual) */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Percent className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Opções de Desconto Contratual</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  O QR Code e os dados de pagamento atualizam em tempo real para o valor exato ajustado.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Desconto de 5% de Pontualidade */}
                <button
                  type="button"
                  onClick={() => {
                    setApplyPromptDiscount(!applyPromptDiscount);
                    if (!applyPromptDiscount) setApplyAnnualDiscount(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border ${
                    applyPromptDiscount
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>5% até o Vencimento</span>
                </button>

                {/* Desconto de 15% no Anual à Vista */}
                {isAnnualPlan && (
                  <button
                    type="button"
                    onClick={() => {
                      setApplyAnnualDiscount(!applyAnnualDiscount);
                      if (!applyAnnualDiscount) setApplyPromptDiscount(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border ${
                      applyAnnualDiscount
                        ? 'bg-blue-950/80 text-blue-300 border-blue-600'
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>15% Anual à Vista</span>
                  </button>
                )}
              </div>
            </div>

            {/* Resumo de Valores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-xs text-slate-400 block">Valor Base do Plano:</span>
                <span className={`text-sm ${effectiveDiscountPercent > 0 ? 'line-through text-slate-500' : 'font-bold text-slate-200'}`}>
                  {formatBRL(baseAmount)}
                </span>
                {effectiveDiscountPercent > 0 && (
                  <p className="text-[11px] font-bold text-emerald-400 mt-0.5">
                    {discountReason} (-{effectiveDiscountPercent}%)
                  </p>
                )}
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Valor Final com QR Code:</span>
                <p className="text-xl font-black text-emerald-400">
                  {formatBRL(effectiveAmount)}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Data de Vencimento:</span>
                <p className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{new Date(invoice.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ABA 1: QR CODE PIX */}
          {activeTab === 'pix' && (
            <div className="space-y-5">
              <div className="bg-[#0B0F19] p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-6">
                
                {/* QR Code Canvas/Image com o valor exato do plano ativo */}
                <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-xl shadow-lg border border-slate-700 shrink-0">
                  <img 
                    src={qrCodeImageUrl} 
                    alt={`QR Code PIX de ${formatBRL(effectiveAmount)}`} 
                    className="w-48 h-48 rounded object-contain"
                  />
                  <div className="mt-2 flex items-center space-x-1.5 text-[11px] font-bold text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-white">Valor exato: {formatBRL(effectiveAmount)}</span>
                  </div>
                </div>

                {/* Instruções & Dados PIX */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                      <span>Pague via PIX com Baixa Automática</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Abra o app do seu banco, escolha <strong>PIX</strong> e aponte a câmera para o QR Code ao lado ou utilize o botão de Copia e Cola. O valor codificado é de <strong className="text-emerald-400">{formatBRL(effectiveAmount)}</strong>.
                    </p>
                  </div>

                  {/* Chave PIX */}
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Chave PIX Cadastrada</span>
                      <p className="text-xs font-mono font-semibold text-emerald-400 select-all">
                        {bankConfig.pixKey} ({bankConfig.pixKeyType.toUpperCase()})
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(bankConfig.pixKey, 'chave_pix')}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center space-x-1 cursor-pointer border border-slate-700"
                    >
                      {copiedField === 'chave_pix' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Chave</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Código Pix Copia e Cola */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Código Pix Copia e Cola (BR Code com valor exato):</span>
                      {copiedField === 'copia_cola' && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Copiado com sucesso!</span>
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <textarea
                        readOnly
                        value={dynamicPixCopiaECola}
                        rows={3}
                        className="w-full font-mono text-[11px] p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none select-all resize-none"
                      />
                      <button
                        onClick={() => handleCopy(dynamicPixCopiaECola, 'copia_cola')}
                        className="absolute right-2 bottom-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      >
                        {copiedField === 'copia_cola' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código PIX</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Identificador TxID */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Identificador TxID: <strong className="text-slate-200 font-mono">{invoice.txId}</strong></span>
                    <span>Beneficiário: <strong className="text-slate-200">{bankConfig.beneficiaryName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Botão de Simulação de Baixa Automática */}
              {invoice.status !== 'pago' && (
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <p className="text-xs text-slate-300">
                      <strong>Painel do Gestor:</strong> você pode registrar a confirmação de recebimento deste PIX para ativar ou atualizar o plano do cliente.
                    </p>
                  </div>
                  <button
                    onClick={handleSimulatePayment}
                    disabled={simulatingPaid}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {simulatingPaid ? (
                      <span>Registrando Baixa...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Pagamento PIX ({formatBRL(effectiveAmount)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ABA 2: BOLETO BANCÁRIO OFICIAL */}
          {activeTab === 'boleto' && (
            <div className="space-y-4">
              
              {/* Linha Digitável Destacada com Botão de Copiar */}
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    Linha Digitável Atualizada ({formatBRL(effectiveAmount)})
                  </span>
                  <p className="font-mono text-xs sm:text-sm font-bold text-slate-100 select-all break-all">
                    {dynamicBoleto.linhaDigitavel}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(dynamicBoleto.linhaDigitavel, 'linha_digitavel')}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-xs shrink-0 cursor-pointer"
                >
                  {copiedField === 'linha_digitavel' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Linha Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Linha Digitável</span>
                    </>
                  )}
                </button>
              </div>

              {/* Ficha de Compensação Visual do Boleto (Design Real Febraban) */}
              <div className="bg-[#0B0F19] text-white p-6 rounded-xl border border-slate-700 font-sans shadow-xs text-xs space-y-4">
                
                {/* Cabeçalho do Banco */}
                <div className="flex items-center justify-between border-b-2 border-slate-700 pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="font-black text-lg tracking-tight text-amber-400 flex items-center space-x-1">
                      <Building2 className="w-5 h-5 text-amber-400" />
                      <span>{bankConfig.bankName}</span>
                    </div>
                    <span className="border-l-2 border-r-2 border-slate-700 px-3 font-bold text-base text-white">
                      {bankConfig.bankCode}-9
                    </span>
                  </div>
                  <div className="font-mono font-bold text-xs sm:text-sm text-white">
                    {dynamicBoleto.linhaDigitavel}
                  </div>
                </div>

                {/* Grid de Campos do Boleto */}
                <div className="grid grid-cols-4 gap-2 border-b border-slate-700 pb-2">
                  <div className="col-span-3 border-r border-slate-700 pr-2">
                    <span className="text-[10px] text-slate-300 block uppercase font-semibold">Local de Pagamento</span>
                    <p className="font-semibold text-white">Pagável em qualquer banco até o vencimento ou via PIX / Internet Banking.</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block uppercase font-semibold">Vencimento</span>
                    <p className="font-bold text-white text-sm">{new Date(invoice.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 border-b border-slate-700 pb-2">
                  <div className="col-span-3 border-r border-slate-700 pr-2">
                    <span className="text-[10px] text-slate-300 block uppercase font-semibold">Beneficiário</span>
                    <p className="font-bold text-white">{bankConfig.beneficiaryName} • CNPJ: {bankConfig.beneficiaryDocument}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block uppercase font-semibold">Agência / Código Cedente</span>
                    <p className="font-mono font-semibold text-white">{bankConfig.agency} / {bankConfig.cedenteCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 border-b border-slate-700 pb-2">
                  <div className="col-span-3 border-r border-slate-700 pr-2">
                    <span className="text-[10px] text-slate-300 block uppercase font-semibold">Instruções (Texto de Responsabilidade do Beneficiário)</span>
                    <p className="text-slate-200 text-[11px] leading-tight mt-1">
                      {bankConfig.instructions1}<br />
                      {effectiveDiscountPercent > 0 ? `Desconto especial de ${effectiveDiscountPercent}% concedido.` : bankConfig.instructions2}<br />
                      {bankConfig.instructions3}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-300 block uppercase font-semibold">Nosso Número</span>
                      <p className="font-mono font-semibold text-white">{invoice.nossoNumero}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-300 block uppercase font-semibold">(=) Valor do Documento</span>
                      <p className="font-mono font-bold text-base text-white">
                        {formatBRL(effectiveAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pagador */}
                <div className="border-b border-slate-700 pb-2">
                  <span className="text-[10px] text-slate-300 block uppercase font-semibold">Pagador / Sacado</span>
                  <p className="font-bold text-white">{invoice.customerName} • CPF/CNPJ: {invoice.customerDocument}</p>
                </div>

                {/* Código de Barras Visual */}
                <div className="pt-2 flex flex-col items-center">
                  <div className="flex h-12 w-full max-w-lg items-center justify-center space-x-[2px] overflow-hidden bg-slate-100 p-1 border border-slate-300">
                    {Array.from({ length: 65 }).map((_, i) => {
                      const isThick = (i % 3 === 0 || i % 7 === 0);
                      const isHidden = (i % 5 === 0);
                      if (isHidden) return <div key={i} className="w-[3px] h-full bg-transparent" />;
                      return (
                        <div
                          key={i}
                          className={`h-full bg-slate-900 ${isThick ? 'w-[4px]' : 'w-[2px]'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 tracking-widest mt-1">
                    {dynamicBoleto.codigoBarras}
                  </span>
                </div>
              </div>

              {/* Botão de Simulação de Pagamento do Boleto */}
              {invoice.status !== 'pago' && (
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                    <p className="text-xs text-slate-300">
                      <strong>Painel do Gestor:</strong> você pode registrar a conciliação manual deste boleto caso tenha identificado a compensação.
                    </p>
                  </div>
                  <button
                    onClick={handleSimulatePayment}
                    disabled={simulatingPaid}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {simulatingPaid ? (
                      <span>Registrando Baixa...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar Compensação do Boleto</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
          )}

          {/* ABA 3: CARTÃO DE CRÉDITO (PLANOS COM MAIS DE UM MÊS OU OPÇÃO CORPORATIVA) */}
          {activeTab === 'cartao' && (
            <div className="space-y-4">
              <div className="bg-[#0B0F19] p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-bold text-slate-100">
                      Pagamento via Cartão de Crédito Corporativo
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Disponível para planos de {invoice.periodicity === 'anual' ? '12 meses' : invoice.periodicity === 'semestral' ? '6 meses' : invoice.periodicity === 'trimestral' ? '3 meses' : 'recorrência'}
                  </span>
                </div>

                {cardSuccess ? (
                  <div className="p-6 text-center space-y-3 bg-emerald-950/40 border border-emerald-800 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/80 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-emerald-300">Pagamento Autorizado com Sucesso!</h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      A transação no valor de <strong>{formatBRL(effectiveAmount)}</strong> em <strong>{installments}x</strong> foi aprovada. O plano está ativo e o comprovante foi enviado para <strong>{invoice.customerEmail}</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleProcessCardPayment} className="space-y-4">
                    {/* Seleção de Parcelas */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Opções de Parcelamento ({isMultiMonthPlan ? 'Até 12 parcelas' : 'À vista ou parcelado'})
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 10, 12].map(num => (
                          <option key={num} value={num}>
                            {num}x de {formatBRL(effectiveAmount / num)} {num === 1 ? '(à vista)' : 'sem juros'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Número do Cartão</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Impresso no Cartão</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="NOME COMO NO CARTÃO"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 uppercase focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Validade (MM/AA)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono text-center focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono text-center focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex items-end">
                        <button
                          type="submit"
                          disabled={simulatingPaid}
                          className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer disabled:opacity-50"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{simulatingPaid ? 'Processando...' : 'Pagar no Cartão'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Transação criptografada com certificado SSL TLS 1.3 de ponta a ponta.</span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#0B0F19] border-t border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Status da Fatura: <strong className="text-slate-100 capitalize">{invoice.status}</strong>
            {invoice.paidAt && <span className="ml-2 text-emerald-400 font-semibold">({invoice.paidAt})</span>}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
