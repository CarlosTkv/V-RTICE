import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Cpu, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Globe, 
  Search, 
  FileText, 
  Zap, 
  Printer, 
  Download, 
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  DollarSign,
  CreditCard,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AutomationStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  details?: string;
  logs?: string[];
}

interface AutomatedFilingRobotProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  cnpj?: string;
  uf?: string;
  operationType?: string;
  contractScore: number;
}

export const AutomatedFilingRobot: React.FC<AutomatedFilingRobotProps> = ({
  isOpen,
  onClose,
  companyName,
  cnpj,
  uf = 'PR',
  operationType = 'Alteração de Matriz',
  contractScore
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [automationFinished, setAutomationFinished] = useState(false);
  const [automationFailed, setAutomationFailed] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  
  const [steps, setSteps] = useState<AutomationStep[]>([
    { 
      id: 'access_junta', 
      label: `Acesso ao Empresa Fácil (${uf})`, 
      status: 'pending',
      details: `Iniciando autenticação via GOV.BR e acessando portal da Junta Comercial...`,
      logs: []
    },
    { 
      id: 'operation_select', 
      label: 'Seleção de Eventos & Alteração de Matriz', 
      status: 'pending',
      details: 'Identificando atos societários e selecionando eventos conforme contrato...',
      logs: []
    },
    { 
      id: 'viability_validation', 
      label: 'Validação do Processo & Viabilidade', 
      status: 'pending',
      details: 'Verificando endereçamento, nome empresarial e disponibilidade de rede...',
      logs: []
    },
    { 
      id: 'redesim_access', 
      label: 'Acesso ao Portal Redesim (DBE)', 
      status: 'pending',
      details: 'Migrando dados para o Coletor Nacional e iniciando preenchimento do DBE...',
      logs: []
    },
    { 
      id: 'dbe_filling', 
      label: 'Preenchimento & Transmissão do DBE', 
      status: 'pending',
      details: 'Preenchendo QSA, capital social e enviando para validação da Receita Federal...',
      logs: []
    },
    { 
      id: 'fees', 
      label: 'Geração de Custas & Taxas (DARE/GARE)', 
      status: 'pending',
      details: 'Gerando guia de recolhimento oficial da Junta Comercial...',
      logs: []
    },
    { 
      id: 'payment', 
      label: 'Monitoramento de Pagamento PIX', 
      status: 'pending',
      details: 'Aguardando compensação bancária automática para liberação do protocolo...',
      logs: []
    },
    { 
      id: 'filing', 
      label: 'Arquivamento & Registro Final', 
      status: 'pending',
      details: 'Transmitindo contrato assinado digitalmente para registro definitivo...',
      logs: []
    }
  ]);

  useEffect(() => {
    if (!isOpen || automationFinished || automationFailed || showPaymentFlow) return;

    const timer = setTimeout(() => {
      processNextStep();
    }, 1500 + Math.random() * 2000);

    return () => clearTimeout(timer);
  }, [isOpen, currentStepIndex, automationFinished, automationFailed, showPaymentFlow]);

  const processNextStep = () => {
    if (currentStepIndex >= steps.length) {
      setAutomationFinished(true);
      return;
    }

    const currentStep = steps[currentStepIndex];
    
    // Atualiza status para processing
    updateStep(currentStep.id, 'processing', [
      `[${new Date().toLocaleTimeString()}] Iniciando ${currentStep.label}...`,
      `[${new Date().toLocaleTimeString()}] Autenticando robô Vértice Python RPA v4.2...`,
      `[${new Date().toLocaleTimeString()}] Buscando dados da empresa: ${companyName}`
    ]);

    // Simula tempo de processamento do robô
    setTimeout(() => {
      // Regra especial para o passo de taxas/pagamento
      if (currentStep.id === 'fees') {
        updateStep(currentStep.id, 'completed', [
          `[${new Date().toLocaleTimeString()}] Guia gerada com sucesso.`,
          `[${new Date().toLocaleTimeString()}] Valor: R$ 184,50 (Taxa de Alteração)`,
          `[${new Date().toLocaleTimeString()}] Aguardando ação de pagamento do usuário...`
        ]);
        setTimeout(() => setShowPaymentFlow(true), 1000);
        setCurrentStepIndex(prev => prev + 1);
        return;
      }

      updateStep(currentStep.id, 'completed', [
        `[${new Date().toLocaleTimeString()}] Processamento concluído via API/Robô.`,
        `[${new Date().toLocaleTimeString()}] Resposta do servidor: Status 200 OK.`,
        `[${new Date().toLocaleTimeString()}] Protocolo: PR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      ]);
      setCurrentStepIndex(prev => prev + 1);
    }, 3000 + Math.random() * 2000);
  };

  const updateStep = (id: string, status: AutomationStep['status'], newLogs: string[]) => {
    setSteps(prev => prev.map(s => s.id === id ? { 
      ...s, 
      status, 
      logs: [...(s.logs || []), ...newLogs] 
    } : s));
  };

  const handleSimulatePayment = () => {
    setIsPaid(true);
    updateStep('payment', 'processing', [`[${new Date().toLocaleTimeString()}] Detectando pagamento PIX Instantâneo...`]);
    
    setTimeout(() => {
      updateStep('payment', 'completed', [`[${new Date().toLocaleTimeString()}] Pagamento confirmado! Seguindo para arquivamento.`]);
      setShowPaymentFlow(false);
      // O timer do useEffect vai cuidar de disparar o último passo (filing)
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#090D16] border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* HEADER DO ROBÔ */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-900/20 to-slate-900/40">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="p-2.5 bg-blue-600/20 rounded-xl border border-blue-500/30 text-blue-400">
                <Bot className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-tight">
                  Robô de Automação Redesim & Junta Comercial
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold uppercase">
                  Vértice RPA v4.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Orquestrando Processo de {operationType} • <strong className="text-slate-200">{companyName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* ÁREA DE STATUS E LOGS */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LADO ESQUERDO: LISTA DE PASSOS */}
          <div className="w-full lg:w-1/2 border-r border-slate-800 p-6 overflow-y-auto space-y-4 bg-slate-900/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                Workflow de Registro
              </h4>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Fim</span>
                <span className="flex items-center gap-1 text-blue-400 animate-pulse"><Loader2 className="w-3 h-3" /> Ativo</span>
              </div>
            </div>

            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                  step.status === 'completed' ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100' :
                  step.status === 'processing' ? 'bg-blue-950/30 border-blue-600/50 text-white shadow-lg shadow-blue-900/10' :
                  'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                {step.status === 'processing' && (
                  <motion.div 
                    className="absolute bottom-0 left-0 h-1 bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5 }}
                  />
                )}
                
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      step.status === 'completed' ? 'bg-emerald-500 text-white border-emerald-400' :
                      step.status === 'processing' ? 'bg-blue-600 text-white border-blue-400 animate-pulse' :
                      'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${
                        step.status === 'completed' ? 'text-emerald-400' :
                        step.status === 'processing' ? 'text-blue-300' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </span>
                      <p className="text-[10px] mt-1 opacity-70 leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                  
                  {step.status === 'processing' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                  {step.status === 'completed' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
            ))}
          </div>

          {/* LADO DIREITO: LOGS DO TERMINAL / FLUXO DE PAGAMENTO */}
          <div className="w-full lg:w-1/2 flex flex-col bg-black/40">
            <AnimatePresence mode="wait">
              {showPaymentFlow ? (
                <motion.div 
                  key="payment-ui"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="flex-1 p-8 flex flex-col items-center justify-center space-y-6 text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-900/10">
                    <DollarSign className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                      Guia de Custas Gerada com Sucesso
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      O robô detectou a geração da taxa oficial da Junta Comercial. 
                      Para seguir com o arquivamento automático, o pagamento deve ser identificado.
                    </p>
                  </div>

                  <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase">Valor da Taxa:</span>
                      <span className="text-emerald-400 font-black">R$ 184,50</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold uppercase">Órgão:</span>
                      <span className="text-slate-200 font-bold">JUCE{uf}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-800">
                      <button
                        onClick={handleSimulatePayment}
                        disabled={isPaid}
                        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg ${
                          isPaid 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white cursor-pointer active:scale-95'
                        }`}
                      >
                        {isPaid ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            PAGAMENTO CONFIRMADO
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            SIMULAR PAGAMENTO PIX
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    O robô Vértice RPA monitora o extrato bancário em tempo real para liberação do processo.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  key="logs-ui"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      Console do Robô (Live)
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
                      AUTORIZADO • e-CNPJ
                    </span>
                  </div>

                  <div className="flex-1 bg-[#05080F] rounded-xl p-4 font-mono text-[11px] text-emerald-400/90 leading-relaxed overflow-y-auto shadow-inner border border-slate-800/60 custom-scrollbar">
                    {steps.some(s => s.status !== 'pending') ? (
                      <div className="space-y-1.5">
                        {steps.filter(s => s.status !== 'pending').map(s => (
                          <div key={s.id + '-log'}>
                            {s.logs?.map((log, lIdx) => (
                              <div key={lIdx} className="animate-fadeIn">
                                <span className="text-slate-600 mr-2">➜</span>
                                {log}
                              </div>
                            ))}
                            {s.status === 'processing' && (
                              <div className="flex items-center gap-1.5 text-blue-400">
                                <span className="text-slate-600 mr-2">➜</span>
                                <span className="animate-pulse">Aguardando resposta do servidor governamental...</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-600 italic">
                        Iniciando sequência de automação...
                      </div>
                    )}
                  </div>

                  {automationFinished && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-4 p-5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-center space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <h5 className="font-bold text-sm uppercase tracking-wider">Processo Concluído com Sucesso!</h5>
                      </div>
                      <p className="text-xs text-emerald-100/70">
                        O protocolo de registro foi deferido e arquivado na Junta Comercial {uf}. 
                        O Contrato Social oficial está disponível para download.
                      </p>
                      <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        CONCLUIR WORKFLOW
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FOOTER DO MODAL */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Certificado Digital OK
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              Conexão VPN Segura (Redesim)
            </span>
          </div>
          <div className="text-slate-500 font-mono">
            Build: 2026.09.RPA • Latência: 45ms
          </div>
        </div>

      </div>
    </div>
  );
};
