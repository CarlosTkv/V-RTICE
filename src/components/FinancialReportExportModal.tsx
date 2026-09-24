import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Layers,
  Eye,
  Sliders,
  RefreshCw,
  Clock,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanyData, CalculationResult } from '../types';
import {
  generateRevenueReportPDF,
  generateFinancialStatementPDF,
  buildCompanyMonthlyRevenueData,
  buildCompanyFinancialStatementRows
} from '../utils/financialPdfGenerator';

interface FinancialReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyData;
  calculation?: CalculationResult;
  defaultReportType?: 'faturamento' | 'extrato' | 'consolidado';
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const formatBRL = (val: number) => {
  return (val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const FinancialReportExportModal: React.FC<FinancialReportExportModalProps> = ({
  isOpen,
  onClose,
  company,
  calculation,
  defaultReportType = 'faturamento',
  showToast
}) => {
  const [reportType, setReportType] = useState<'faturamento' | 'extrato' | 'consolidado'>(defaultReportType);
  const [periodFilter, setPeriodFilter] = useState<'12_meses' | 'mes_atual' | 'trimestre' | 'ano_atual'>('12_meses');
  const [accountantName, setAccountantName] = useState('Vértice Inteligência Contábil & Fiscal');
  const [crcNumber, setCrcNumber] = useState('PR-059281/O-4');
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-calculate data for live preview
  const monthlyRows = buildCompanyMonthlyRevenueData(company, calculation);
  const statementData = buildCompanyFinancialStatementRows(company, company.monthlyRevenue || 120000);

  const totalAnnualRevenue = monthlyRows.reduce((a, b) => a + b.totalRevenue, 0);
  const totalAnnualTaxes = monthlyRows.reduce((a, b) => a + b.taxAmount, 0);
  const effectiveRate = calculation?.effectiveRate || (totalAnnualTaxes / totalAnnualRevenue * 100);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      if (reportType === 'faturamento') {
        const doc = await generateRevenueReportPDF(company, calculation, {
          accountantName,
          crcNumber
        });
        const cleanName = (company.name || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`Relatorio_Faturamento_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`);
        showToast?.('Relatório de Faturamento exportado em PDF com sucesso!', 'success');
      } else if (reportType === 'extrato') {
        const doc = await generateFinancialStatementPDF(company, {
          accountantName,
          crcNumber
        });
        const cleanName = (company.name || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_');
        doc.save(`Extrato_Financeiro_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`);
        showToast?.('Extrato Financeiro exportado em PDF com sucesso!', 'success');
      } else {
        // Consolidado: baixa ambos
        const docFat = await generateRevenueReportPDF(company, calculation, { accountantName, crcNumber });
        const docExt = await generateFinancialStatementPDF(company, { accountantName, crcNumber });
        const cleanName = (company.name || 'Empresa').replace(/[^a-zA-Z0-9]/g, '_');
        docFat.save(`01_Relatorio_Faturamento_${cleanName}.pdf`);
        docExt.save(`02_Extrato_Financeiro_${cleanName}.pdf`);
        showToast?.('Dossiê Financeiro Completo exportado em PDF com sucesso!', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao gerar relatório em PDF.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      const doc = reportType === 'faturamento'
        ? await generateRevenueReportPDF(company, calculation, { accountantName, crcNumber })
        : await generateFinancialStatementPDF(company, { accountantName, crcNumber });
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao preparar impressão.', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      let csvContent = '';
      if (reportType === 'faturamento') {
        const headers = ['Competencia', 'Mercadorias (R$)', 'Servicos (R$)', 'Total Faturado (R$)', 'Tributos (R$)', 'Liquido (R$)', 'Aliquota Efetiva (%)'];
        const rows = monthlyRows.map(r => [
          r.monthLabel,
          r.merchandiseRevenue.toFixed(2),
          r.serviceRevenue.toFixed(2),
          r.totalRevenue.toFixed(2),
          r.taxAmount.toFixed(2),
          r.netRevenue.toFixed(2),
          r.effectiveTaxRate.toFixed(2)
        ]);
        csvContent = ['Relatório de Faturamento - ' + (company.name || ''), headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
      } else {
        const headers = ['Data', 'Descricao', 'Doc_Ref', 'Banco', 'Tipo', 'Valor (R$)', 'Saldo Acumulado (R$)'];
        const rows = statementData.movements.map(m => [
          m.date,
          `"${m.description}"`,
          `"${m.docRef || ''}"`,
          m.bankName,
          m.type.toUpperCase(),
          m.amount.toFixed(2),
          (m.runningBalance || 0).toFixed(2)
        ]);
        csvContent = ['Extrato Financeiro - ' + (company.name || ''), headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
      }

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast?.('Exportação CSV realizada com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showToast?.('Erro ao exportar CSV.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-slate-100 tracking-tight">
                    Central de Exportação de Relatórios & Extratos Financeiros
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Padrão Executivo A4
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Gere documentos oficiais de faturamento (RBT12) e extratos financeiros auditados com fé pública para bancos, licitações e diretoria.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-center">
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Gerando PDF...' : 'Baixar PDF Oficial'}
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportCSV}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Exportar CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Seletores de Tipo de Relatório */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-4">
            <button
              onClick={() => setReportType('faturamento')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                reportType === 'faturamento'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-300" />
              Relatório de Faturamento (RBT12)
            </button>

            <button
              onClick={() => setReportType('extrato')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                reportType === 'extrato'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              Extrato Financeiro & Conciliação
            </button>

            <button
              onClick={() => setReportType('consolidado')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                reportType === 'consolidado'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Dossiê Financeiro Completo (Ambos)
            </button>
          </div>
        </div>

        {/* Corpo do Modal: Configurações + Visualização Prévia */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Painel Esquerdo: Parâmetros & Assinatura (4 colunas) */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Configurações do Documento
              </span>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Período Analisado:
                </label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="12_meses">Últimos 12 Meses (RBT12 Oficial)</option>
                  <option value="mes_atual">Competência Vigente (Setembro/2026)</option>
                  <option value="trimestre">Último Trimestre Encerrado</option>
                  <option value="ano_atual">Ano Calendário Vigente</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Responsável Técnico / Contabilidade:
                </label>
                <input
                  type="text"
                  value={accountantName}
                  onChange={(e) => setAccountantName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Registro CRC / Órgão de Classe:
                </label>
                <input
                  type="text"
                  value={crcNumber}
                  onChange={(e) => setCrcNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Quadro de Validação de Fé Pública */}
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Validade Jurídica & Fé Pública</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Este documento contém código de verificação criptográfica e QR Code de autenticação direta no barramento governamental da Vértice.
              </p>
            </div>

            {/* Resumo Rápido de Números */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Resumo dos Dados Selecionados
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Receita Bruta Total:</span>
                <strong className="text-emerald-400">{formatBRL(totalAnnualRevenue)}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Carga Tributária Efetiva:</span>
                <strong className="text-rose-400">{formatBRL(totalAnnualTaxes)} ({effectiveRate.toFixed(2)}%)</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Saldo Final em Conta:</span>
                <strong className="text-indigo-300">{formatBRL(statementData.finalBalance)}</strong>
              </div>
            </div>

          </div>

          {/* Painel Direito: Pré-Visualização Estilizada do PDF A4 (8 colunas) */}
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-6 overflow-x-auto shadow-inner">
            
            {/* Folha A4 Mockup */}
            <div className="max-w-2xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 space-y-6 font-sans border border-slate-200 text-xs">
              
              {/* Header do Mockup */}
              <div className="bg-slate-900 text-white p-4 -m-8 mb-4 rounded-t-xl flex justify-between items-start border-b-4 border-indigo-600">
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white">VÉRTICE AUDITORIA TRIBUTÁRIA & GESTÃO FINANCEIRA</h3>
                  <p className="text-[10px] text-indigo-300">
                    {reportType === 'faturamento' ? 'RELATÓRIO OFICIAL DE FATURAMENTO & EVOLUÇÃO FISCAL 360°' : 'EXTRATO FINANCEIRO CONSOLIDADO & CONCILIAÇÃO BANCÁRIA'}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Emissão: {new Date().toLocaleDateString('pt-BR')} • Protocolo: VRT-PDF-992140</p>
                </div>
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded flex items-center justify-center text-[8px] text-slate-400 text-center font-mono">
                  QR CODE
                </div>
              </div>

              {/* Quadro da Empresa */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 font-bold block">EMPRESA:</span>
                  <strong className="text-slate-900">{company.name || 'EMPRESA CONTRIBUINTE LTDA'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">CNPJ:</span>
                  <span className="text-slate-800 font-mono">{company.cnpj || '00.000.000/0001-00'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">REGIME TRIBUTÁRIO:</span>
                  <span className="text-indigo-700 font-bold">{company.regimeTributario || 'Simples Nacional'} (Anexo {company.anexo || 'III'})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">JURISDIÇÃO:</span>
                  <span className="text-slate-800">{company.city || 'Curitiba'} - {(company.uf || 'PR').toUpperCase()}</span>
                </div>
              </div>

              {/* Cards no Mockup */}
              {reportType === 'faturamento' ? (
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[8px] text-slate-500 font-bold block">RECEITA BRUTA (12M)</span>
                    <strong className="text-[11px] text-slate-900 block mt-0.5">{formatBRL(totalAnnualRevenue)}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[8px] text-slate-500 font-bold block">MÉDIA MENSAL</span>
                    <strong className="text-[11px] text-indigo-600 block mt-0.5">{formatBRL(totalAnnualRevenue / 12)}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[8px] text-slate-500 font-bold block">TRIBUTOS PAGOS</span>
                    <strong className="text-[11px] text-rose-600 block mt-0.5">{formatBRL(totalAnnualTaxes)}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[8px] text-slate-500 font-bold block">ALÍQUOTA EFETIVA</span>
                    <strong className="text-[11px] text-emerald-600 block mt-0.5">{effectiveRate.toFixed(2)}%</strong>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[8px] text-slate-500 font-bold block">SALDO INICIAL</span>
                    <strong className="text-[11px] text-slate-700 block mt-0.5">{formatBRL(statementData.initialBalance)}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[8px] text-slate-500 font-bold block">ENTRADAS (+)</span>
                    <strong className="text-[11px] text-emerald-600 block mt-0.5">{formatBRL(statementData.totalCredits)}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[8px] text-slate-500 font-bold block">SAÍDAS (-)</span>
                    <strong className="text-[11px] text-rose-600 block mt-0.5">{formatBRL(statementData.totalDebits)}</strong>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-center">
                    <span className="text-[8px] text-slate-500 font-bold block">SALDO FINAL</span>
                    <strong className="text-[11px] text-slate-900 block mt-0.5">{formatBRL(statementData.finalBalance)}</strong>
                  </div>
                </div>
              )}

              {/* Tabela Mockup */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-[9px]">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      {reportType === 'faturamento' ? (
                        <>
                          <th className="p-1.5 font-bold">COMPETÊNCIA</th>
                          <th className="p-1.5 font-bold">MERCADORIAS</th>
                          <th className="p-1.5 font-bold">SERVIÇOS</th>
                          <th className="p-1.5 font-bold">TOTAL</th>
                          <th className="p-1.5 font-bold">TRIBUTOS</th>
                        </>
                      ) : (
                        <>
                          <th className="p-1.5 font-bold">DATA</th>
                          <th className="p-1.5 font-bold">DESCRIÇÃO</th>
                          <th className="p-1.5 font-bold">BANCO</th>
                          <th className="p-1.5 font-bold">VALOR</th>
                          <th className="p-1.5 font-bold">SALDO</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportType === 'faturamento' ? (
                      monthlyRows.slice(0, 6).map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-1.5 font-bold text-slate-900">{r.monthLabel}</td>
                          <td className="p-1.5 text-slate-600">{formatBRL(r.merchandiseRevenue)}</td>
                          <td className="p-1.5 text-slate-600">{formatBRL(r.serviceRevenue)}</td>
                          <td className="p-1.5 font-bold text-slate-900">{formatBRL(r.totalRevenue)}</td>
                          <td className="p-1.5 text-rose-600">{formatBRL(r.taxAmount)}</td>
                        </tr>
                      ))
                    ) : (
                      statementData.movements.slice(0, 6).map((m, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-1.5 font-bold text-slate-900">{m.date}</td>
                          <td className="p-1.5 text-slate-700 truncate max-w-[150px]">{m.description}</td>
                          <td className="p-1.5 text-slate-500">{m.bankName}</td>
                          <td className={`p-1.5 font-bold ${m.type === 'credito' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {m.type === 'credito' ? '+' : '-'} {formatBRL(m.amount)}
                          </td>
                          <td className="p-1.5 text-slate-900">{formatBRL(m.runningBalance || 0)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Assinaturas no Mockup */}
              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-200 text-center text-[8px]">
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <strong className="block text-slate-900">{company.name}</strong>
                  <span className="text-slate-500">Representante Legal</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <strong className="block text-slate-900">{accountantName}</strong>
                  <span className="text-slate-500">CRC: {crcNumber}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Documentos gerados em conformidade com as normas do CFC e Receita Federal do Brasil.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar em PDF
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
