import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Printer, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Layers, 
  AlertTriangle, 
  Info,
  Sparkles,
  ArrowRight,
  Download,
  RefreshCw,
  Copy,
  Check,
  Trash2
} from 'lucide-react';

interface EconetReportData {
  companyName: string;
  year: string;
  period: string;
  anexoSegmento: string;
  uf: string;
  municipio: string;
  faixa: string;
  rbt12: string;
  clientProfile: string;
  pjsales: string;
  inputsPurchase: string;
  expectedRevenue: string;
  ncms: string[];
  regimeRegularIbsCbs: string;
  regimeRegularCredit: string;
  regimeRegularAccumulatedCredit: string;
  regimeRegularNetCost: string;
  pgdasIbsCbs: string;
  pgdasNetCost: string;
  monthlyData: {
    month: string;
    regimeRegular: string;
    pgdas: string;
    economy: string;
  }[];
}

interface EconetReportGeneratorViewProps {
  reports: EconetReportData[];
  setReports: React.Dispatch<React.SetStateAction<EconetReportData[]>>;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const EconetReportGeneratorView: React.FC<EconetReportGeneratorViewProps> = ({
  reports,
  setReports,
  activeIndex,
  setActiveIndex,
}) => {
  const reportData = reports[activeIndex];

  const updateReport = (newData: Partial<EconetReportData>) => {
    setReports(prev => prev.map((r, i) => i === activeIndex ? { ...r, ...newData } : r));
  };

  const [activeTab, setActiveTab] = useState<'preview' | 'editor' | 'parecer_automatizado'>('preview');
  const [importStatus, setImportStatus] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const handleResetReport = () => {
    setReports([{
      companyName: 'Nova Empresa Ltda',
      year: '2027',
      period: '1° Semestre',
      anexoSegmento: 'I - Comércio',
      uf: 'SP',
      municipio: 'São Paulo',
      faixa: 'Faixa 1',
      rbt12: 'R$ 0,00',
      clientProfile: 'Misto',
      pjsales: '50%',
      inputsPurchase: '30%',
      expectedRevenue: 'R$ 0,00',
      ncms: ['00000000'],
      regimeRegularIbsCbs: 'R$ 0,00',
      regimeRegularCredit: 'R$ 0,00',
      regimeRegularAccumulatedCredit: 'R$ 0,00',
      regimeRegularNetCost: 'R$ 0,00',
      pgdasIbsCbs: 'R$ 0,00',
      pgdasNetCost: 'R$ 0,00',
      monthlyData: [
        { month: 'Janeiro', regimeRegular: 'R$ 0,00', pgdas: 'R$ 0,00', economy: 'R$ 0,00' },
        { month: 'Fevereiro', regimeRegular: 'R$ 0,00', pgdas: 'R$ 0,00', economy: 'R$ 0,00' },
        { month: 'Março', regimeRegular: 'R$ 0,00', pgdas: 'R$ 0,00', economy: 'R$ 0,00' },
        { month: 'Abril', regimeRegular: 'R$ 0,00', pgdas: 'R$ 0,00', economy: 'R$ 0,00' },
        { month: 'Maio', regimeRegular: 'R$ 0,00', pgdas: 'R$ 0,00', economy: 'R$ 0,00' },
        { month: 'Junho', regimeRegular: 'R$ 0,00', pgdas: 'R$ 0,00', economy: 'R$ 0,00' },
      ]
    }]);
    setActiveIndex(0);
    setImportStatus('Dados zerados com sucesso.');
    setTimeout(() => setImportStatus(''), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImportStatus(`Lendo ${files.length} arquivo(s)...`);

    const newReports: EconetReportData[] = await Promise.all(files.map(async (file) => {
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string || '');
        reader.readAsText(file);
      });

      let extracted: Partial<EconetReportData> = { companyName: file.name };
      if (text) {
        const lines = text.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if ((line.toLowerCase().includes('nome da simulação') || line.toLowerCase().includes('empresa') || line.toLowerCase().includes('cliente')) && lines[i+1]) {
            const comp = lines[i+1].trim();
            if (comp.length > 2) extracted.companyName = comp;
          }
          if (line.toLowerCase().includes('rbt 12') || line.toLowerCase().includes('rbt12')) {
            const parts = line.split(':');
            if (parts[1]) extracted.rbt12 = parts[1].trim();
          }
          if (line.toLowerCase().includes('receita esperada') || line.toLowerCase().includes('faturamento')) {
            const parts = line.split(':');
            if (parts[1]) extracted.expectedRevenue = parts[1].trim();
          }
        }
      }
      return {
        companyName: extracted.companyName || file.name,
        year: '2027',
        period: '1° Semestre',
        anexoSegmento: 'I - Comércio',
        uf: 'SP',
        municipio: 'São Paulo',
        faixa: 'Faixa 1',
        rbt12: extracted.rbt12 || 'R$ 0,00',
        clientProfile: 'Misto',
        pjsales: '50%',
        inputsPurchase: '30%',
        expectedRevenue: extracted.expectedRevenue || 'R$ 0,00',
        ncms: ['00000000'],
        regimeRegularIbsCbs: 'R$ 0,00',
        regimeRegularCredit: 'R$ 0,00',
        regimeRegularAccumulatedCredit: 'R$ 0,00',
        regimeRegularNetCost: 'R$ 0,00',
        pgdasIbsCbs: 'R$ 0,00',
        pgdasNetCost: 'R$ 0,00',
        monthlyData: Array(6).fill({ month: '-', regimeRegular: 'R$ 0,00', pgdas: 'R$ 0,00', economy: 'R$ 0,00' })
      };
    }));

    setReports(prev => [...prev, ...newReports]);
    setActiveIndex(reports.length); // Switch to the first new report
    setImportStatus(`${files.length} nova(s) empresa(s) importada(s) com sucesso!`);
    setTimeout(() => setImportStatus(''), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const automatedOpinionText = `Análise e Recomendação do Regime Tributário ${reportData.year} – ${reportData.companyName}
Parecer Técnico ${reportData.period} de ${reportData.year}

📊 Cenário Financeiro (Receita Prevista): ${reportData.expectedRevenue}
🟩 PGDAS (Simples Nacional): Custo tributário de ${reportData.pgdasNetCost}.
🟥 Regime Regular (Híbrido): Custo líquido de ${reportData.regimeRegularNetCost} (Débito de ${reportData.regimeRegularIbsCbs} menos crédito de ${reportData.regimeRegularCredit}).
💰 Diferencial Competitivo: A opção tributária calculada reflete o cenário financeiro mais vantajoso para o fluxo de caixa.

Nossa Recomendação: 
Orientamos a análise detalhada com base nos parâmetros da empresa ${reportData.companyName}, ponderando os impactos de caixa e operacionais.

⚠️ Aspectos Operacionais: Fatores estratégicos e comerciais podem demandar atenção na transição para o Regime Regular (Simples Híbrido):
🤝 Exigência Comercial (B2B – Venda PJ): Como ${reportData.pjsales} do faturamento provém de vendas para pessoas jurídicas (PJ), clientes de grande porte podem exigir o destaque integral do IBS/CBS para fins de creditamento.
💵 Retenção de Caixa (Split Payment): No Regime Híbrido, o mecanismo de recolhimento na liquidação financeira afeta a disponibilidade imediata de caixa.
🔒 Garantia de Crédito de Insumos: A fruição dos ${reportData.regimeRegularCredit} em créditos estimados sobre as compras fica condicionada à regularidade fiscal e recolhimento dos fornecedores na etapa anterior.

Diante do exposto, solicitamos a análise das opções e formalização de sua escolha.

Favor formalizar a decisão adotada pela empresa em resposta a este comunicado. Caso não haja manifestação expressa até o dia 28/09/2026, adotaremos de forma automática o regime recomendado no estudo para assegurar o estrito cumprimento dos prazos legais.
Permanecemos à disposição para eventuais esclarecimentos.`;

  const handleCopyOpinion = () => {
    navigator.clipboard.writeText(automatedOpinionText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body > *:not(#econet-report-container) {
            display: none !important;
          }
          #econet-report-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          .print\\:page-break {
            page-break-before: always;
            break-before: page;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] p-4 rounded-2xl border border-slate-800 shadow-xl print:hidden">
        <div>
          <h2 className="text-lg font-black text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Gerador e Simulador de Relatórios Econet Ecosim</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Módulo independente para importação de nova empresa, simulação e emissão de parecer executivo padronizado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={activeIndex}
            onChange={(e) => setActiveIndex(Number(e.target.value))}
            className="bg-[#0B0F19] text-white border border-slate-800 rounded-xl p-2 text-xs font-bold"
          >
            {reports.map((r, i) => (
              <option key={i} value={i}>{r.companyName}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleResetReport}
            className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            title="Zerar dados e preparar para nova empresa"
          >
            <Trash2 className="w-4 h-4" />
            <span>Zerar / Novo</span>
          </button>

          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 cursor-pointer transition shadow-md">
            <Upload className="w-4 h-4" />
            <span>Subir PDF Econet</span>
            <input 
              type="file" 
              accept=".pdf,.txt,.json" 
              className="hidden" 
              multiple
              onChange={handleFileUpload}
            />
          </label>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'preview' ? 'editor' : 'preview')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{activeTab === 'preview' ? 'Editar Dados' : 'Ver Relatório'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parecer_automatizado')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'parecer_automatizado'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Parecer Automatizado</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl text-xs text-blue-300 font-mono text-center print:hidden">
          {importStatus}
        </div>
      )}

      {/* Editor View */}
      {activeTab === 'editor' && (
        <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 space-y-6 print:hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Editar Parâmetros da Nova Empresa / Simulação
            </h3>
            <span className="text-xs text-slate-400">Todos os campos atualizam o relatório e o parecer em tempo real</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Nome da Simulação / Empresa</label>
              <input 
                type="text" 
                value={reportData.companyName}
                onChange={(e) => updateReport({ companyName: e.target.value })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Ano</label>
              <input 
                type="text" 
                value={reportData.year}
                onChange={(e) => updateReport({ year: e.target.value })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Período</label>
              <input 
                type="text" 
                value={reportData.period}
                onChange={(e) => updateReport({ period: e.target.value })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Anexo - Segmento</label>
              <input 
                type="text" 
                value={reportData.anexoSegmento}
                onChange={(e) => updateReport({ anexoSegmento: e.target.value })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">UF / Município</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={reportData.uf}
                  onChange={(e) => updateReport({ uf: e.target.value })}
                  className="w-1/3 bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
                <input 
                  type="text" 
                  value={reportData.municipio}
                  onChange={(e) => updateReport({ municipio: e.target.value })}
                  className="w-2/3 bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">RBT 12</label>
              <input 
                type="text" 
                value={reportData.rbt12}
                onChange={(e) => updateReport({ rbt12: e.target.value })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Receita Esperada</label>
              <input 
                type="text" 
                value={reportData.expectedRevenue}
                onChange={(e) => updateReport({ expectedRevenue: e.target.value })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Custo Líquido PGDAS</label>
              <input 
                type="text" 
                value={reportData.pgdasNetCost}
                onChange={(e) => updateReport({ pgdasNetCost: e.target.value, pgdasIbsCbs: e.target.value })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Custo Líquido Regime Regular</label>
              <input 
                type="text" 
                value={reportData.regimeRegularNetCost}
                onChange={(e) => updateReport({ regimeRegularNetCost: e.target.value })}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md"
            >
              Visualizar Relatório Atualizado
            </button>
          </div>
        </div>
      )}

      {/* MÓDULO: ANÁLISE DE PARECER AUTOMATIZADO */}
      {activeTab === 'parecer_automatizado' && (
        <div className="bg-[#0F172A] p-6 rounded-2xl border border-slate-800 space-y-6 print:hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Módulo de Análise de Parecer Automatizado (Template Aprovado)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gera e formata automaticamente o parecer executivo preenchendo os dados da nova empresa importada ou editada.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyOpinion}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-md cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Parecer Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Parecer Completo</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0B0F19] border border-slate-800 rounded-xl p-6 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap shadow-inner">
            {automatedOpinionText}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
            >
              Ver Relatório Completo PDF
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Parecer & Relatório</span>
            </button>
          </div>
        </div>
      )}

      {/* PREVIEW DO RELATÓRIO ECONET ECOSIM (FIDEDIGNO AO MODELO SUBMETIDO) */}
      <div id="econet-report-container" className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden font-sans border border-slate-300">
        
        {/* PAGE 1 */}
        <div className="p-8 space-y-6 min-h-[1056px] flex flex-col justify-between page-break-after">
          <div className="space-y-6">
            
            {/* Header Econet */}
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#0066cc] rounded-lg flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-black tracking-wider text-[#0066cc] uppercase">ECONET</div>
                  <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">ECOSIM</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-500">Relatório Oficial de Simulação</span>
              </div>
            </div>

            {/* Section 1: Dados da simulação */}
            <div className="space-y-3">
              <div className="bg-[#0066cc] text-white px-4 py-2 rounded-t-lg text-xs font-black uppercase tracking-wider">
                Dados da simulação
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-b-lg p-4 space-y-4 text-xs">
                <div>
                  <div className="font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider text-slate-500">Empresa</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Nome da simulação</span>
                      <strong className="text-slate-800">{reportData.companyName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ano</span>
                      <strong className="text-slate-800">{reportData.year}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Período</span>
                      <strong className="text-slate-800">{reportData.period}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Anexo - Segmento</span>
                      <strong className="text-slate-800">{reportData.anexoSegmento}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">UF</span>
                      <strong className="text-slate-800">{reportData.uf}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Município</span>
                      <strong className="text-slate-800">{reportData.municipio}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Enquadramento</span>
                      <strong className="text-slate-800">{reportData.faixa} (Valor Máximo)</strong>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-[10px] text-slate-400 block">RBT 12</span>
                      <strong className="text-slate-800 font-mono">{reportData.rbt12}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider text-slate-500">Perfil de negócio</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3 rounded border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Perfil do cliente</span>
                      <strong className="text-slate-800">{reportData.clientProfile}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vendas para empresa PJ</span>
                      <strong className="text-slate-800">{reportData.pjsales}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Compra de insumos</span>
                      <strong className="text-slate-800">{reportData.inputsPurchase}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Regime Tributário</span>
                      <strong className="text-slate-800">Regime Regular</strong>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider text-slate-500">Faturamento</div>
                  <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">Receita esperada/planejada</span>
                    <strong className="font-mono text-slate-900 text-sm">{reportData.expectedRevenue}</strong>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider text-slate-500">NCM cadastradas</div>
                  <div className="bg-white p-3 rounded border border-slate-200 flex flex-wrap gap-2">
                    {reportData.ncms.map((ncm, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded font-mono text-[11px] border border-slate-200">
                        {ncm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Resultado */}
            <div className="space-y-3">
              <div className="bg-[#0066cc] text-white px-4 py-2 rounded-t-lg text-xs font-black uppercase tracking-wider">
                Resultado
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Regime regular */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 pb-2 border-b border-slate-200">Regime regular</div>
                  <div className="space-y-1.5 font-mono text-slate-600">
                    <div className="flex justify-between">
                      <span>IBS/CBS</span>
                      <span className="text-slate-900">{reportData.regimeRegularIbsCbs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crédito</span>
                      <span className="text-slate-900">{reportData.regimeRegularCredit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Créditos Acumulados</span>
                      <span className="text-slate-900">{reportData.regimeRegularAccumulatedCredit}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">Custo líquido</span>
                    <span className="text-base font-black text-slate-900 font-mono">{reportData.regimeRegularNetCost}</span>
                  </div>
                </div>

                {/* PGDAS - MELHOR OPÇÃO */}
                <div className="bg-emerald-50/60 border-2 border-emerald-500 rounded-lg p-4 space-y-3 text-xs relative shadow-sm">
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px] tracking-wider uppercase">
                    Melhor Opção
                  </div>
                  <div className="font-bold text-emerald-900 pb-2 border-b border-emerald-200">PGDAS</div>
                  <div className="space-y-1.5 font-mono text-emerald-800 pt-1">
                    <div className="flex justify-between">
                      <span>IBS/CBS</span>
                      <span className="text-emerald-950 font-bold">{reportData.pgdasIbsCbs}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-emerald-200 flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Custo líquido</span>
                    <span className="text-base font-black text-emerald-700 font-mono">{reportData.pgdasNetCost}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Page 1 */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-[#0066cc] rounded flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="font-bold text-slate-700">ECONET — A informação por completo</span>
              </div>
              <span className="font-mono">Relatório gerado em: 16/09/2026 às 13:17 pelo GDC00000.</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Esta simulação foi elaborada com base nas informações fornecidas pelo usuário e considera a legislação vigente no momento de sua emissão. Como a Reforma Tributária ainda está em processo de implementação, os resultados poderão ser alterados em decorrência da publicação de novas leis complementares, regulamentações e atos normativos. A responsabilidade pela veracidade, integridade e precisão dos dados informados é exclusivamente do usuário.
            </p>
          </div>
        </div>

        {/* PAGE 2 */}
        <div className="p-8 space-y-6 min-h-[1056px] flex flex-col justify-between border-t-4 border-slate-100 print:page-break">
          <div className="space-y-6">
            
            {/* Header Econet */}
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#0066cc] rounded-lg flex items-center justify-center text-white shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-lg font-black tracking-wider text-[#0066cc] uppercase">ECONET</div>
                  <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">ECOSIM</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-500">Tabela de Carga Tributária & Expertise</span>
              </div>
            </div>

            {/* Section 3: Tabela carga tributária */}
            <div className="space-y-3">
              <div className="bg-[#0066cc] text-white px-4 py-2 rounded-t-lg text-xs font-black uppercase tracking-wider">
                Tabela carga tributária
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-b-lg p-4 space-y-3">
                <div className="font-bold text-slate-700 uppercase text-[10px] tracking-wider text-slate-500">Evolução da carga tributária</div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-200 text-slate-700 uppercase text-[10px]">
                        <th className="p-2.5">Tributos</th>
                        <th className="p-2.5 text-right">Janeiro</th>
                        <th className="p-2.5 text-right">Fevereiro</th>
                        <th className="p-2.5 text-right">Março</th>
                        <th className="p-2.5 text-right">Abril</th>
                        <th className="p-2.5 text-right">Maio</th>
                        <th className="p-2.5 text-right">Junho</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr>
                        <td className="p-2.5 font-bold text-slate-800">Regime Regular</td>
                        {reportData.monthlyData.map((m, i) => (
                          <td key={i} className="p-2.5 text-right text-slate-600">{m.regimeRegular}</td>
                        ))}
                      </tr>
                      <tr className="bg-emerald-50/50">
                        <td className="p-2.5 font-bold text-emerald-900 flex items-center gap-1.5">
                          <span>PGDAS</span>
                          <span className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold">MELHOR</span>
                        </td>
                        {reportData.monthlyData.map((m, i) => (
                          <td key={i} className="p-2.5 text-right font-bold text-emerald-700">{m.pgdas}</td>
                        ))}
                      </tr>
                      <tr className="bg-slate-100 font-bold">
                        <td className="p-2.5 text-blue-900">Economia com PGDAS</td>
                        {reportData.monthlyData.map((m, i) => (
                          <td key={i} className="p-2.5 text-right text-blue-700">{m.economy}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Section 4: Expertise Econet */}
            <div className="space-y-3">
              <div className="bg-[#0066cc] text-white px-4 py-2 rounded-t-lg text-xs font-black uppercase tracking-wider">
                Expertise Econet
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-b-lg p-4 space-y-2.5 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2.5 bg-white p-3 rounded border border-slate-200">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>Para o Regime Regular foram utilizadas alíquotas estimadas de IBS e CBS, com base em expertise Econet, uma vez que ainda não foram divulgadas as alíquotas definitivas pela autoridade tributária.</p>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-3 rounded border border-slate-200">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>No Regime Regular, a utilização dos créditos de IBS e CBS está condicionada à extinção do débito correspondente na apuração do fornecedor na etapa anterior.</p>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-3 rounded border border-slate-200">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>Os valores apresentados são estimativas com base nas informações fornecidas, não constituindo garantia de tributação futura.</p>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-3 rounded border border-slate-200">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>Créditos de IBS e CBS superiores aos débitos no Regime Regular. Os créditos evidenciados poderão ser objeto de ressarcimento ou compensação em períodos futuros. A disponibilização dos valores de ressarcimento ao contribuinte segue os prazos de 30, 60 ou até 180 dias.</p>
                </div>

                <div className="flex items-start gap-2.5 bg-amber-50 p-3 rounded border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>No regime regular, o recolhimento antecipado de IBS e CBS por meio do Split Payment ou Recolhimento pelo Adquirente pode reduzir o valor recebido pela empresa na operação, gerando impactos no fluxo de caixa. Por isso, esse aspecto deve ser considerado na avaliação dos efeitos da opção.</p>
                </div>

                <div className="flex items-start gap-2.5 bg-amber-50 p-3 rounded border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>Por atender tanto empresas (B2B) quanto consumidores finais (B2C), a vantagem tributária isolada pode não definir o melhor regime. No B2B, clientes valorizam créditos gerados; no B2C, prevalece o preço final. Analise o impacto comercial além do resultado fiscal.</p>
                </div>
              </div>
            </div>

            {/* Section 5: Parecer Técnico Executivo & Recomendação */}
            <div className="space-y-3 pt-2">
              <div className="bg-[#0066cc] text-white px-4 py-2 rounded-t-lg text-xs font-black uppercase tracking-wider flex items-center justify-between">
                <span>Parecer Técnico e Recomendação do Regime Tributário — {reportData.period} de {reportData.year}</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">{reportData.companyName}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-b-lg p-5 space-y-4 text-xs text-slate-800 leading-relaxed">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>Análise e Recomendação do Regime Tributário {reportData.year} – {reportData.companyName}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                  <div className="bg-white p-3 rounded border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">Cenário Financeiro (Receita)</span>
                    <strong className="text-slate-900 text-sm">{reportData.expectedRevenue}</strong>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded border border-emerald-200 shadow-xs">
                    <span className="text-[10px] text-emerald-700 block uppercase font-sans font-bold">PGDAS (Simples Nacional)</span>
                    <strong className="text-emerald-900 text-sm">{reportData.pgdasNetCost}</strong>
                  </div>
                  <div className="bg-rose-50 p-3 rounded border border-rose-200 shadow-xs">
                    <span className="text-[10px] text-rose-700 block uppercase font-sans font-bold">Regime Regular (Híbrido)</span>
                    <strong className="text-rose-900 text-sm">{reportData.regimeRegularNetCost}</strong>
                    <span className="block text-[9px] text-rose-600 mt-0.5">(Débito {reportData.regimeRegularIbsCbs} - Créd. {reportData.regimeRegularCredit})</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg space-y-2">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span>Diferencial Competitivo & Recomendação:</span>
                  </div>
                  <p className="text-blue-950">
                    A manutenção no <strong>Simples Nacional (PGDAS)</strong> gera uma economia expressiva para a <strong>{reportData.companyName}</strong>. Orientamos a permanência no PGDAS, por se tratar do cenário financeiramente mais benéfico para o fluxo de caixa da empresa.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Aspectos Operacionais e Estratégicos:</span>
                  </div>
                  <p className="text-slate-600">
                    Apesar da desvantagem financeira imediata, fatores estratégicos e comerciais podem demandar a adoção do Regime Regular (Simples Híbrido):
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-700 font-sans">
                    <li><strong>Exigência Comercial (B2B – Venda PJ):</strong> Como {reportData.pjsales} do faturamento provém de vendas para pessoas jurídicas (PJ), clientes de grande porte podem exigir o destaque integral do IBS/CBS para fins de creditamento, sob risco de perda de contratos.</li>
                    <li><strong>Retenção de Caixa (Split Payment):</strong> No Regime Híbrido, o mecanismo de recolhimento na liquidação financeira afeta a disponibilidade imediata de caixa.</li>
                    <li><strong>Garantia de Crédito de Insumos:</strong> A fruição dos {reportData.regimeRegularCredit} em créditos estimados sobre as compras fica condicionada à regularidade fiscal e recolhimento dos fornecedores na etapa anterior.</li>
                  </ul>
                </div>

                <div className="bg-amber-50/70 border border-amber-300 p-3.5 rounded-lg space-y-1 text-amber-900 font-sans text-[11px]">
                  <p className="font-bold">Prazo para Manifestação e Decisão:</p>
                  <p>
                    Favor formalizar a decisão adotada pela empresa em resposta a este comunicado. <strong>Caso não haja manifestação expressa até o dia 28/09/2026</strong>, adotaremos de forma automática o regime recomendado no estudo para assegurar o estrito cumprimento dos prazos legais. Permanecemos à disposição para eventuais esclarecimentos.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Page 2 */}
          <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-[#0066cc] rounded flex items-center justify-center text-white">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="font-bold text-slate-700">ECONET — A informação por completo</span>
              </div>
              <span className="font-mono">Relatório gerado em: 16/09/2026 às 13:17 pelo GDC00000.</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Esta simulação foi elaborada com base nas informações fornecidas pelo usuário e considera a legislação vigente no momento de sua emissão. Como a Reforma Tributária ainda está em processo de implementação, os resultados poderão ser alterados em decorrência da publicação de novas leis complementares, regulamentações e atos normativos. A responsabilidade pela veracidade, integridade e precisão dos dados informados é exclusivamente do usuário.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
