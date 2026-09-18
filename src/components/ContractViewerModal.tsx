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
  Sparkles,
  Check
} from 'lucide-react';
import { SoldSubscription, PlanDefinition, BankConfig } from '../types';
import { ExecutiveDocumentViewer, SignatoryInfo } from './ExecutiveDocumentViewer';

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

  const signatories: SignatoryInfo[] = [
    {
      name: bankConfig.beneficiaryName,
      role: 'CONTRATADA / VÉRTICE AUDITORIA',
      cpfCnpj: bankConfig.beneficiaryDocument,
      rgOabCrc: 'Sede Operacional: ' + bankConfig.pixCity,
      signatureType: 'ICP-Brasil'
    },
    {
      name: subscription.customerName,
      role: `CONTRATANTE (${subscription.companyName})`,
      cpfCnpj: subscription.customerDocument,
      rgOabCrc: `E-mail: ${subscription.customerEmail}`,
      signatureType: 'Assinatura Eletrônica Qualificada'
    }
  ];

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
                <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wide">
                  Contrato de Prestação de Serviços & Licenciamento
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                  {contractNum}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Contratante: <strong className="text-slate-200">{subscription.customerName}</strong> • {subscription.companyName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Documento Usando o Padrão do Sistema */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <ExecutiveDocumentViewer
            documentTitle="CONTRATO DE LICENCIAMENTO DE SOFTWARE E PRESTAÇÃO DE SERVIÇOS DE INTELIGÊNCIA E AUDITORIA TRIBUTÁRIA"
            documentCategory="CONTRATO DE PRESTAÇÃO DE SERVIÇOS"
            normativeBase="Instrumento particular fundamentado na Lei nº 8.078/1990 (Código de Defesa do Consumidor), Lei nº 10.406/2002 (Código Civil Brasileiro), Lei nº 13.709/2018 (LGPD), Medida Provisória nº 2.200-2/2001 e Lei Federal nº 14.063/2020."
            companyName={subscription.companyName}
            cnpj={subscription.customerDocument}
            protocolNumber={contractNum}
            signatories={signatories}
          >
            <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
              {/* Qualificação das Partes */}
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
                      type="button"
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
          </ExecutiveDocumentViewer>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#0B0F19] px-6 py-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            {effectivePlanName} • Vigência: {startDateFormatted} até {endDateFormatted}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
};
