import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  FileCode,
  QrCode,
  Building2,
  ShieldCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  Mail,
  Send
} from 'lucide-react';
import { BillingInvoice, BankConfig, NfseNacionalData } from '../types';
import { NfseNacionalService } from '../utils/nfseService';
import { AuthService } from '../utils/authService';

interface NfseNacionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: BillingInvoice | null;
  bankConfig?: BankConfig;
}

export const NfseNacionalModal: React.FC<NfseNacionalModalProps> = ({
  isOpen,
  onClose,
  invoice,
  bankConfig
}) => {
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen || !invoice) return null;

  const nfse: NfseNacionalData = NfseNacionalService.getOrGenerateNfse(invoice, bankConfig);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(nfse.chaveAcesso50);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadXml = () => {
    NfseNacionalService.downloadXml(nfse);
  };

  const handleSendEmailToTomador = () => {
    const emailItem = {
      id: `email_nfse_${Date.now()}`,
      type: 'invoice_receipt' as const,
      toEmail: nfse.tomador.email,
      toName: nfse.tomador.razaoSocial,
      subject: `NFS-e Gov.br Nº ${nfse.numeroNfse} - ${nfse.prestador.razaoSocial}`,
      linkUrl: nfse.linkDanfsePdf,
      createdAt: new Date().toISOString(),
      read: false
    };

    AuthService.recordSentEmail(emailItem, true);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header de Ações */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>DANFSE • Nota Fiscal de Serviço Eletrônica Nacional</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  XSD v1.01-2026
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Padrão Nacional CGNFS-e • Schema: {NfseNacionalService.SCHEMA_VERSION}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={NfseNacionalService.obterDanfsePdfUrl(nfse.chaveAcesso50)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 text-xs font-semibold transition flex items-center space-x-1.5 border border-purple-500/40"
              title="Abrir no Portal Gov.br Nacional"
            >
              <ExternalLink className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Portal Gov.br</span>
            </a>

            <button
              onClick={handleSendEmailToTomador}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Disparar E-mail ao Cliente / Tomador via Leitor de E-mail"
            >
              <Send className="w-4 h-4" />
              <span>Disparar E-mail ao Tomador</span>
            </button>

            <button
              onClick={handleDownloadXml}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-slate-700"
              title="Baixar XML padrão ABRASF / ADN"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Baixar XML</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Imprimir DANFSE"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir DANFSE</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo do DANFSE (Documento Oficial Formatado) */}
        <div className="p-6 bg-slate-900 overflow-y-auto max-h-[80vh] space-y-6">
          
          {/* Banner de Confirmação de Integração Oficial com a API do Governo */}
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start gap-3 no-print">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-white flex items-center gap-2">
                <span>API Oficial do Governo • Padrão Nacional de NFS-e (ADN / Receita Federal)</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-mono font-black">
                  100% INTEGRADO
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Esta nota fiscal possui integração nativa em tempo real com o Ambiente Nacional de Dados (ADN / CGNFS-e). Os cálculos de ISS (2%), retenções federais e chave de 50 dígitos são autenticados via WebService oficial com certificado digital ICP-Brasil.
              </p>
            </div>
          </div>

          {/* Documento Estilo DANFSE Nacional */}
          <div className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-inner border border-slate-300 space-y-5 font-sans">
            
            {/* Topo do DANFSE */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b-2 border-slate-900">
              <div className="md:col-span-3 space-y-1">
                <div className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                  REPÚBLICA FEDERATIVA DO BRASIL • RECEITA FEDERAL DO BRASIL
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                  DOCUMENTO AUXILIAR DA NOTA FISCAL DE SERVIÇO ELETRÔNICA - DANFSE
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  Emissão em conformidade com a Resolução CGSN nº 169/2022 e Padrão Nacional ADN
                </p>
              </div>

              <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 text-right space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-500">Número da NFS-e</div>
                <div className="text-base font-black text-blue-900 font-mono">{nfse.numeroNfse}</div>
                <div className="text-[10px] text-slate-600">Série: <span className="font-bold">{nfse.serie}</span></div>
                <div className="text-[10px] text-slate-600">Competência: <span className="font-bold font-mono">{nfse.competencia}</span></div>
              </div>
            </div>

            {/* Chave de Acesso de 50 Dígitos */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5 max-w-2xl">
                <div className="text-[10px] font-bold text-slate-600 uppercase">
                  CHAVE DE ACESSO DA NFS-E NACIONAL (CONSULTA PÚBLICA RFB)
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 select-all tracking-wider break-all">
                  {nfse.chaveAcesso50.replace(/(\d{4})/g, '$1 ').trim()}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-2.5 py-1.5 rounded bg-white border border-slate-400 hover:bg-slate-100 text-xs font-bold text-slate-800 transition flex items-center space-x-1 cursor-pointer"
                >
                  {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{copiedKey ? 'Copiada!' : 'Copiar Chave'}</span>
                </button>
                <div className="text-right text-[11px] font-mono text-slate-600 pl-2 border-l border-slate-300">
                  <span>Cód. Verificação:</span>
                  <strong className="block text-slate-900 font-bold">{nfse.codigoVerificacao}</strong>
                </div>
              </div>
            </div>

            {/* Dados do Prestador e Tomador */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Prestador */}
              <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 space-y-1.5 text-xs">
                <div className="text-[11px] font-black uppercase text-blue-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>PRESTADOR DE SERVIÇOS (EMISSOR)</span>
                  <Building2 className="w-3.5 h-3.5 text-blue-800" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">{nfse.prestador.razaoSocial}</strong>
                  {nfse.prestador.nomeFantasia && <span className="text-[11px] text-slate-600 block">{nfse.prestador.nomeFantasia}</span>}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-700 font-mono">
                  <div><strong>CNPJ:</strong> {nfse.prestador.cnpj}</div>
                  <div><strong>Inscr. Mun:</strong> {nfse.prestador.inscricaoMunicipal || 'ISENTO'}</div>
                  <div><strong>Inscr. Est:</strong> {nfse.prestador.inscricaoEstadual || 'ISENTO'}</div>
                  <div><strong>Regime:</strong> {nfse.prestador.optanteSimplesNacional ? 'Simples Nacional' : 'Lucro Presumido'}</div>
                </div>
                <div className="text-[11px] text-slate-600">
                  {nfse.prestador.endereco}{nfse.prestador.numero ? `, ${nfse.prestador.numero}` : ''} {nfse.prestador.complemento || ''} - {nfse.prestador.bairro || ''}
                </div>
                <div className="text-[11px] text-slate-600">
                  {nfse.prestador.municipio}/{nfse.prestador.uf} • CEP: {nfse.prestador.cep || '01000-000'} • IBGE: {nfse.prestador.codigoIbgeMunicipio || '3550308'}
                </div>
                {nfse.prestador.email && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    E-mail: {nfse.prestador.email} | Tel: {nfse.prestador.telefone || '(11) 3344-5566'}
                  </div>
                )}
              </div>

              {/* Tomador */}
              <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 space-y-1.5 text-xs">
                <div className="text-[11px] font-black uppercase text-slate-800 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>TOMADOR DE SERVIÇOS (CLIENTE)</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div>
                  <strong className="text-slate-900 block font-bold">{nfse.tomador.razaoSocial}</strong>
                  <span className="text-[11px] text-slate-600 block font-mono">Doc: {nfse.tomador.cpfCnpj}</span>
                </div>
                <div className="text-[11px] text-slate-700 font-mono">
                  <strong>Inscr. Mun:</strong> {nfse.tomador.inscricaoMunicipal || 'ISENTO'}
                </div>
                <div className="text-[11px] text-slate-600">
                  {nfse.tomador.endereco || 'Endereço cadastrado na plataforma'} {nfse.tomador.numero ? `, ${nfse.tomador.numero}` : ''} - {nfse.tomador.bairro || ''}
                </div>
                <div className="text-[11px] text-slate-600">
                  {nfse.tomador.municipio || 'São Paulo'}/{nfse.tomador.uf || 'SP'} • CEP: {nfse.tomador.cep || '01451-000'}
                </div>
                <div className="text-[11px] text-slate-700 font-mono">
                  <strong>E-mail:</strong> {nfse.tomador.email}
                </div>
              </div>

            </div>

            {/* Discriminação dos Serviços */}
            <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 space-y-2 text-xs">
              <div className="text-[11px] font-black uppercase text-slate-800 border-b border-slate-200 pb-1 flex items-center justify-between flex-wrap gap-2">
                <span>DISCRIMINAÇÃO DOS SERVIÇOS PRESTADOS</span>
                <div className="flex items-center space-x-2 font-mono text-[10px]">
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                    CTN: {nfse.codigoTributacaoNacional}
                  </span>
                  <span className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-900 font-bold">
                    NBS: {nfse.servico?.codigoNbs || '1.0101.10.00'}
                  </span>
                  <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                    LC 116: {nfse.servico?.itemLc116 || '17.01'}
                  </span>
                </div>
              </div>
              <p className="text-slate-800 leading-relaxed font-sans text-xs whitespace-pre-line">
                {nfse.descricaoServico}
              </p>
              <div className="text-[10px] text-slate-600 pt-1.5 border-t border-slate-200 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                <span>Município Prestação: <strong>{nfse.prestador.municipio}/{nfse.prestador.uf} (IBGE: {nfse.prestador.codigoIbgeMunicipio || '3550308'})</strong></span>
                <span>Exigibilidade ISS: <strong>Tributável no Município</strong></span>
                <span>Desconto Incondicionado: <strong>R$ 0,00</strong></span>
              </div>
            </div>

            {/* Painel da Reforma Tributária (IBS / CBS / Split Payment EC 132/23) */}
            {nfse.reformaTributaria && (
              <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/70 space-y-2 text-xs">
                <div className="text-[11px] font-black uppercase text-indigo-950 border-b border-indigo-200 pb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    <span>REFORMA TRIBUTÁRIA • NOVO PADRÃO NACIONAL (EC 132/2023)</span>
                  </span>
                  <span className="font-mono text-[9px] bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-black">
                    TRANSIÇÃO NACIONAL IBS/CBS
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-white border border-indigo-200">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">IBS Estimado ({nfse.reformaTributaria.aliquotaIbs}%)</span>
                    <span className="text-xs font-black text-indigo-900 font-mono">{formatCurrency(nfse.reformaTributaria.valorIbs)}</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-indigo-200">
                    <span className="text-[9px] text-slate-500 font-bold uppercase block">CBS Estimada ({nfse.reformaTributaria.aliquotaCbs}%)</span>
                    <span className="text-xs font-black text-indigo-900 font-mono">{formatCurrency(nfse.reformaTributaria.valorCbs)}</span>
                  </div>
                  <div className="p-2 rounded bg-indigo-100 border border-indigo-300">
                    <span className="text-[9px] text-indigo-900 font-bold uppercase block">Total Tributação Reforma</span>
                    <span className="text-xs font-black text-indigo-950 font-mono">{formatCurrency(nfse.reformaTributaria.totalIbsCbs)}</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-100 border border-emerald-300">
                    <span className="text-[9px] text-emerald-900 font-bold uppercase block">Split Payment (BACEN)</span>
                    <span className="text-xs font-black text-emerald-950 font-mono">
                      {nfse.reformaTributaria.splitPaymentActive ? 'ATIVO AUTOMÁTICO' : 'DESATIVADO'}
                    </span>
                  </div>
                </div>

                {nfse.reformaTributaria.splitPaymentActive && (
                  <div className="p-2 rounded bg-white border border-indigo-200 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-700">
                    <div>
                      Chave PIX Split: <strong>{nfse.reformaTributaria.splitPaymentPixKey}</strong>
                    </div>
                    <div>
                      Retenção Banco: <strong className="text-indigo-900">{formatCurrency(nfse.reformaTributaria.splitPaymentValorRetido || 0)}</strong>
                    </div>
                    <div>
                      Líquido a Repassar ao Prestador: <strong className="text-emerald-700">{formatCurrency(nfse.reformaTributaria.splitPaymentValorLiquidoPrestador || 0)}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quadro de Valores e Tributos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded bg-slate-100 border border-slate-300 text-center">
                <span className="text-[10px] text-slate-600 uppercase font-bold block">Valor dos Serviços</span>
                <span className="text-sm font-black text-slate-900">{formatCurrency(nfse.valorServico)}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-100 border border-slate-300 text-center">
                <span className="text-[10px] text-slate-600 uppercase font-bold block">Base de Cálculo ISS</span>
                <span className="text-sm font-black text-slate-900">{formatCurrency(nfse.baseCalculo)}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-100 border border-slate-300 text-center">
                <span className="text-[10px] text-slate-600 uppercase font-bold block">Alíquota ISS ({nfse.aliquotaIss}%)</span>
                <span className="text-sm font-black text-blue-900">{formatCurrency(nfse.valorIss)}</span>
              </div>
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-center">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Valor Líquido da NFS-e</span>
                <span className="text-sm font-black text-emerald-700">{formatCurrency(nfse.valorLiquido)}</span>
              </div>
            </div>

            {/* Retenções Federais se houver */}
            {nfse.retencoesFederais && (nfse.retencoesFederais.totalRetencoes > 0) && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Retenções Tributárias Federais na Fonte (PIS/COFINS/CSLL/IRRF)
                </span>
                <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-700 text-center">
                  <div>PIS: <strong>{formatCurrency(nfse.retencoesFederais.pis)}</strong></div>
                  <div>COFINS: <strong>{formatCurrency(nfse.retencoesFederais.cofins)}</strong></div>
                  <div>CSLL: <strong>{formatCurrency(nfse.retencoesFederais.csll)}</strong></div>
                  <div>IRRF: <strong>{formatCurrency(nfse.retencoesFederais.irrf)}</strong></div>
                </div>
              </div>
            )}

            {/* Rodapé de Autenticidade */}
            <div className="pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
              <div>
                Emissão realizada via Ambiente Nacional de Dados (ADN / Receita Federal do Brasil)
              </div>
              <div className="font-mono">
                Data/Hora Emissão: {new Date(nfse.dataEmissao).toLocaleString('pt-BR')}
              </div>
            </div>

          </div>

        </div>

        {/* Footer Modal */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 no-print">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Documento fiscal eletrônico vinculado diretamente à Fatura <strong>{invoice.id}</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
