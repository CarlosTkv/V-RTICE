import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Download, 
  FileText, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  ExternalLink, 
  Lock, 
  Server, 
  FileCode, 
  Cpu, 
  Sparkles, 
  HelpCircle,
  Zap,
  Info,
  Building2,
  Copy
} from 'lucide-react';
import { CompanyData } from '../types';

interface VerticeSefazSetupGuideProps {
  currentCompany: CompanyData;
  certUploaded: boolean;
  isRealConnection: boolean;
  onOpenCertModal?: () => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const VerticeSefazSetupGuide: React.FC<VerticeSefazSetupGuideProps> = ({
  currentCompany,
  certUploaded,
  isRealConnection,
  onOpenCertModal,
  showToast
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: 'Certificado Digital A1 ICP-Brasil (.PFX / .P12)',
      tag: 'Obrigatório (mTLS)',
      desc: 'A SEFAZ exige autenticação mTLS (Mutual Transport Layer Security) com a chave privada criptográfica do CNPJ.',
      status: certUploaded ? 'concluido' : 'pendente',
      instructions: [
        'Obtenha o arquivo .pfx ou .p12 do Certificado Digital A1 da sua empresa emitido por Autoridade Certificadora ICP-Brasil (Serasa, Certisign, Soluti, etc.).',
        'Faça o upload do arquivo .pfx e digite a senha de instalação no Painel de Certificados.',
        'O sistema armazenará a cadeia de certificados com criptografia AES-256 e utilizará nas requisições SOAP para o WebService NFeDistribuicaoDFe.'
      ],
      tip: 'Certificados A3 (token USB ou cartão) não funcionam em servidores de nuvem automática. Utilize sempre o modelo A1 em arquivo digital.'
    },
    {
      num: 2,
      title: 'Manifestação do Destinatário (MD-e Automática)',
      tag: 'Desbloqueio de XML Completo',
      desc: 'Sem a manifestação, a SEFAZ fornece apenas o resumo da nota (resNFe) sem itens, produtos ou impostos.',
      status: 'concluido',
      instructions: [
        'Quando um fornecedor emite uma nota contra seu CNPJ, a SEFAZ primeiro disponibiliza apenas o resumo.',
        'O Vértice Documentos envia automaticamente o evento "210210 - Ciência da Emissão" para a SEFAZ Nacional.',
        'Após a ciência, a SEFAZ autoriza o download do XML completo (procNFe) contendo todos os produtos, NCMs, CFOPs, valores de ICMS, DIFAL e ST.'
      ],
      tip: 'A Manifestação Automática de Ciência garante que 100% dos XMLs cheguem completos ao seu sistema em tempo real.'
    },
    {
      num: 3,
      title: 'Varredura Sequencial de NSU (Sem Consumo Indevido)',
      tag: 'Regra SEFAZ Anti-Bloqueio',
      desc: 'A fila de documentos da SEFAZ é indexada pelo NSU (Número Sequencial Único).',
      status: 'concluido',
      instructions: [
        'O sistema inicia a consulta a partir do último NSU registrado (ultNSU = 0 até atingir o maxNSU da SEFAZ).',
        'Cada lote retorna até 50 documentos compactados em GZIP Base64.',
        'O agendador do Vértice respeita os intervalos para evitar a Rejeição 656 ("Consumo Indevido"), que bloqueia o CNPJ por 1 hora se houver consultas repetidas sem novos documentos.'
      ],
      tip: 'Mantenha o intervalo agendado em 1h ou 6h para manter a conformidade estrita com o Manual de Orientação do Contribuinte (MOC).'
    },
    {
      num: 4,
      title: 'Renderização Gráfica do DANFE / DACTE em PDF',
      tag: 'Geração Instantânea de PDF',
      desc: 'Conversão automática do XML autorizado em documento gráfico fiscal para impressão e auditoria.',
      status: 'concluido',
      instructions: [
        'Assim que o XML completo é baixado e validado, o motor gráfico do Vértice extrai os nós <infNFe> e <protNFe>.',
        'Gera dinamicamente o DANFE em PDF com o Código de Barras Code 128 oficial da Chave de Acesso de 44 dígitos.',
        'O PDF fica disponível para download imediato, envio por e-mail para a contabilidade ou impressão em lote.'
      ],
      tip: 'Você pode baixar o PDF individual ou exportar o pacote ZIP contendo XML + DANFE de todas as notas do mês com 1 clique.'
    }
  ];

  return (
    <div className="p-6 bg-[#0F172A] border-2 border-slate-800 rounded-3xl space-y-6 shadow-2xl">
      
      {/* Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 text-white shrink-0 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">
              Guia Completo: Como Buscar XMLs e PDFs (DANFE) na SEFAZ
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Passo a passo com os 4 requisitos técnicos e fiscais para capturar 100% das notas emitidas contra o seu CNPJ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs font-bold">
            CNPJ: {currentCompany.cnpj}
          </span>
        </div>
      </div>

      {/* Interactive 4-step selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isSelected = activeStep === step.num;
          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected 
                  ? 'bg-rose-950/30 border-rose-500 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center ${
                  isSelected ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  0{step.num}
                </span>
                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">{step.tag}</span>
              </div>

              <div>
                <h4 className="text-xs font-black text-white leading-snug">{step.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{step.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Status</span>
                <span className={`font-bold flex items-center gap-1 ${
                  step.status === 'concluido' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  {step.status === 'concluido' ? 'Pronto' : 'Configurar'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Deep Dive */}
      {(() => {
        const current = steps[activeStep - 1];
        return (
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono font-black text-xs">
                  PASSO 0{current.num}
                </span>
                <h4 className="text-sm font-black text-white">{current.title}</h4>
              </div>

              <span className="text-[11px] font-bold text-cyan-400 font-mono">
                {current.tag}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                O que você precisa fazer:
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {current.instructions.map((inst, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tip Box */}
            <div className="p-3.5 bg-[#0B0F19] border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <strong className="text-amber-300 block text-[11px] uppercase">Dica do Especialista Fiscal:</strong>
                <span className="text-[11px] text-slate-400">{current.tip}</span>
              </div>
            </div>

            {/* Quick Action Trigger */}
            {current.num === 1 && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onOpenCertModal}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Cadastrar Certificado A1 (.PFX) Agora</span>
                </button>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
};
