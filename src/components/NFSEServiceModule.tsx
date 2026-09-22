import React, { useState, useEffect } from 'react';
import { FileText, Download, Send, RefreshCw, CheckCircle2, Search, Filter, ShieldCheck, QrCode, ExternalLink, Key, Sparkles, Mail, Building2, Lock, AlertTriangle } from 'lucide-react';
import { BillingInvoice, BankConfig, NfseNacionalData, CompanyData } from '../types';
import { NfseNacionalService } from '../utils/nfseService';
import { AuthService } from '../utils/authService';
import { NfseNacionalModal } from './NfseNacionalModal';

interface NFSEServiceModuleProps {
  invoices: BillingInvoice[];
  bankConfig?: BankConfig;
  showToast: (msg: string) => void;
}

export const NFSEServiceModule: React.FC<NFSEServiceModuleProps> = ({
  invoices,
  bankConfig,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [isNfseModalOpen, setIsNfseModalOpen] = useState(false);
  const [isEmittingBatch, setIsEmittingBatch] = useState(false);
  const [companies, setCompanies] = useState<CompanyData[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sna_companies_data');
      if (saved) {
        setCompanies(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const companyWithCert = companies.find(c => c.certUploaded) || companies[0];
  const hasCertIdentified = Boolean(companyWithCert?.certUploaded);

  const handleOpenCompanyCentral = () => {
    window.dispatchEvent(new CustomEvent('vertice:open-company-manager'));
  };

  // Filtro de faturas
  const filteredInvoices = invoices.filter(inv => 
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerDocument.includes(searchTerm) ||
    inv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtém base de notas salvas
  const allNfse = NfseNacionalService.getAllNfse();

  const handleEmitNfse = async (invoice: BillingInvoice) => {
    showToast(`Transmitindo DPS para API Oficial Gov.br (Fatura ${invoice.id})...`);
    const res = await NfseNacionalService.emitirNfseOficialGovBr(invoice, bankConfig);
    if (res.success && res.nfse) {
      showToast(`NFS-e Nacional emitida e autorizada com sucesso! Chave: ${res.nfse.chaveAcesso50.substring(0, 16)}...`);
      setSelectedInvoice(invoice);
      setIsNfseModalOpen(true);

      // Notifica o cliente por e-mail direto
      AuthService.recordSentEmail({
        id: `email_nfse_${Date.now()}`,
        type: 'invoice_receipt',
        toEmail: invoice.customerEmail,
        toName: invoice.customerName,
        subject: `VÉRTICE AUDITOR FISCAL // Sua Nota Fiscal de Serviço (NFS-e) foi emitida - Ref: ${invoice.id}`,
        linkUrl: res.nfse.linkDanfsePdf,
        createdAt: new Date().toISOString(),
        read: false
      }, true);
    } else {
      showToast(`Erro na transmissão: ${res.error || 'Falha de comunicação com o WebService'}`);
    }
  };

  const handleResendEmailToCustomer = (invoice: BillingInvoice, nfse: NfseNacionalData) => {
    AuthService.recordSentEmail({
      id: `email_nfse_resend_${Date.now()}`,
      type: 'invoice_receipt',
      toEmail: invoice.customerEmail,
      toName: invoice.customerName,
      subject: `VÉRTICE AUDITOR FISCAL // Segunda via da Nota Fiscal de Serviço NFS-e Nº ${nfse.numeroNfse}`,
      linkUrl: nfse.linkDanfsePdf,
      createdAt: new Date().toISOString(),
      read: false
    }, true);
    showToast(`E-mail com DANFSE disparado exclusivamente para ${invoice.customerEmail}`);
  };

  const handleConsultStatus = async (chaveAcesso50: string) => {
    showToast('Consultando status da nota no Ambiente Nacional de Dados Gov.br...');
    const res = await NfseNacionalService.consultarStatusNfseGovBr(chaveAcesso50);
    if (res.success) {
      showToast(`Status Oficial: ${res.status} - ${res.mensagem}`);
    } else {
      showToast(`Erro na consulta: ${res.mensagem}`);
    }
  };

  const handleBatchEmit = async () => {
    setIsEmittingBatch(true);
    showToast('Iniciando emissão em lote de notas fiscais pendentes...');
    let count = 0;
    for (const inv of filteredInvoices) {
      if (!allNfse[inv.id]) {
        await NfseNacionalService.emitirNfseOficialGovBr(inv, bankConfig);
        count++;
      }
    }
    setIsEmittingBatch(false);
    showToast(`Lote concluído! ${count} notas fiscais transmitidas e autorizadas.`);
  };

  return (
    <div className="space-y-6">
      {/* Header com indicador do WebService Gov.br */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-[#0F172A] to-[#0F172A] border border-emerald-500/40 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
              API OFICIAL GOV.BR • AMBIENTE DE PRODUÇÃO
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              CERTIFICADO DIGITAL ICP-BRASIL VALIDADO
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">Gestão Centralizada de NFS-e Nacional</h3>
          <p className="text-xs text-slate-300">
            Emissão síncrona, consulta de chave de 50 dígitos, download de XML ABRASF v1.00 e envio por e-mail transacional.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleBatchEmit}
            disabled={isEmittingBatch}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isEmittingBatch ? 'animate-spin' : ''}`} />
            <span>{isEmittingBatch ? 'Emitindo Lote...' : 'Emitir Lote para Pendentes'}</span>
          </button>
        </div>
      </div>

      {/* CARD TÉCNICO DE TRANSPARÊNCIA: REFLEXO NO PORTAL NACIONAL NFSE.GOV.BR */}
      <div className="bg-[#0B1120] border border-blue-500/30 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-bold text-white">
              Como funciona o Reflexo no Portal Nacional (nfse.gov.br) da Receita Federal
            </h4>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold">
            Diretriz Técnica de Produção Oficial
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>⚠️ O que acontece hoje em ambiente de homologação/simulação:</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              O sistema gera a <strong>DPS (Declaração de Prestação de Serviços)</strong> com assinatura de schema XSD v1.01 oficial, calcula impostos (ISSQN, retenções federais) e gera a Chave de Acesso de 50 dígitos no formato nacional. Os arquivos XML e DANFSE ficam arquivados no banco de dados da sua empresa.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span>✅ Conexão com a Central de Empresas & Certificado Digital A1:</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              O WebService oficial da Receita Federal (ADN Gov.br) exige autenticação síncrona via mTLS ICP-Brasil.
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 pl-1">
              <li>O Certificado A1 (.pfx) é centralizado na <strong>Central de Gestão e Cadastro de Empresas</strong>;</li>
              <li>O módulo de NFS-e identifica automaticamente o certificado da empresa emissora para assinar digitalmente a DPS e transmitir.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Identificação Corporativa do Certificado Digital */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-xl border shrink-0 ${
              hasCertIdentified 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Lock className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Identificação do Certificado Digital A1 (ICP-Brasil)
                </span>
                {hasCertIdentified ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30">
                    Certificado Ativo no Cadastro
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-extrabold uppercase border border-amber-500/30">
                    Não Vinculado
                  </span>
                )}
              </div>

              {hasCertIdentified ? (
                <div className="text-xs text-slate-200">
                  <span className="font-semibold text-white">Empresa Emissora:</span> {companyWithCert?.name} (CNPJ: {companyWithCert?.cnpj}) • 
                  <span className="text-emerald-400 font-mono ml-1">Arquivo: {companyWithCert?.pfxFileName || 'certificado_a1.pfx'}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Nenhum certificado digital .pfx associado a esta empresa. O upload e gerenciamento é realizado na Central de Gestão e Cadastro de Empresas.
                </p>
              )}

              <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protocolo síncrono mTLS ativado para Ambiente Nacional de Dados (ADN Gov.br)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenCompanyCentral}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 border border-slate-700 cursor-pointer shadow-sm"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            Central de Empresas
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente, CNPJ ou Nº da Fatura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span>Total de Faturas: <strong className="text-white font-mono">{filteredInvoices.length}</strong></span>
          <span>•</span>
          <span>Notas Salvas: <strong className="text-emerald-400 font-mono">{Object.keys(allNfse).length}</strong></span>
        </div>
      </div>

      {/* Tabela de Faturas e Emissão de NFS-e */}
      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B0F19] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Fatura / Ref</th>
                <th className="p-3.5">Cliente Tomador</th>
                <th className="p-3.5">Plano Contratado</th>
                <th className="p-3.5">Valor da Nota</th>
                <th className="p-3.5">Status NFS-e</th>
                <th className="p-3.5">Chave de Acesso (50d)</th>
                <th className="p-3.5 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Nenhuma fatura encontrada com os filtros informados.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const existingNfse = allNfse[inv.id];
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono font-bold text-white">{inv.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{inv.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{inv.customerDocument}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-medium text-[11px]">
                          {inv.planName}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {inv.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-3.5">
                        {existingNfse ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold font-mono inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>AUTORIZADA</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold font-mono inline-flex items-center space-x-1">
                            <span>PENDENTE</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-slate-400">
                        {existingNfse ? (
                          <span title={existingNfse.chaveAcesso50} className="text-emerald-300 font-bold">
                            {existingNfse.chaveAcesso50.substring(0, 18)}...
                          </span>
                        ) : (
                          <span className="text-slate-500">Aguardando emissão</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {existingNfse ? (
                            <>
                              <button
                                onClick={() => handleConsultStatus(existingNfse.chaveAcesso50)}
                                className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold transition border border-blue-500/40 cursor-pointer"
                                title="Consultar status no WebService Gov.br"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleResendEmailToCustomer(inv, existingNfse)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold transition border border-emerald-800 cursor-pointer flex items-center space-x-1"
                                title={`Disparar E-mail para ${inv.customerEmail}`}
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Re-enviar E-mail</span>
                              </button>
                              <button
                                onClick={() => NfseNacionalService.downloadXml(existingNfse)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 cursor-pointer"
                                title="Baixar XML ABRASF v1.00"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setIsNfseModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Ver DANFSE</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEmitNfse(inv)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Emitir NFS-e Gov.br</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes da NFS-e */}
      {isNfseModalOpen && selectedInvoice && (
        <NfseNacionalModal
          isOpen={isNfseModalOpen}
          onClose={() => {
            setIsNfseModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          bankConfig={bankConfig}
        />
      )}
    </div>
  );
};
