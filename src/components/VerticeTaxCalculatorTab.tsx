import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, 
  Calculator, 
  FileCode, 
  CheckCircle, 
  Copy, 
  Download, 
  Layers, 
  Info, 
  ArrowRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  Percent, 
  Coins, 
  Sparkles, 
  FileSpreadsheet, 
  Building2, 
  ExternalLink 
} from 'lucide-react';
import { CompanyData } from '../types';
import { BRAZILIAN_STATES_ICMS } from '../utils/taxRules';
import { 
  NCM_TAX_CATALOG, 
  calculateMvaAjustada, 
  getInterstateRate,
  calculateDocTaxDetails 
} from '../utils/verticeTaxEngine';

interface VerticeTaxCalculatorTabProps {
  documents: any[];
  currentCompany: CompanyData;
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  onApplyTaxToXml: (
    opType: 'difal_entrada' | 'difal_saida' | 'st',
    calculatedTaxValue: number,
    baseCalculo: number,
    taxRate: number,
    extraParams?: { mva?: number; icmsProprio?: number }
  ) => void;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const VerticeTaxCalculatorTab: React.FC<VerticeTaxCalculatorTabProps> = ({
  documents,
  currentCompany,
  selectedDocId,
  onSelectDoc,
  onApplyTaxToXml,
  showToast
}) => {
  // Find current selected document
  const activeDoc = useMemo(() => {
    return documents.find(d => d.id === selectedDocId) || documents[0] || null;
  }, [documents, selectedDocId]);

  // Calculator State
  const [opType, setOpType] = useState<'difal_entrada' | 'difal_saida' | 'st'>('difal_entrada');
  const [valorMercadoria, setValorMercadoria] = useState<number>(activeDoc?.valorTotal || 5000);
  const [frete, setFrete] = useState<number>(0);
  const [seguro, setSeguro] = useState<number>(0);
  const [outrasDespesas, setOutrasDespesas] = useState<number>(0);
  const [ipi, setIpi] = useState<number>(0);
  const [descontoIncondicional, setDescontoIncondicional] = useState<number>(0);

  const [origemUf, setOrigemUf] = useState<string>('SP');
  const [destinoUf, setDestinoUf] = useState<string>(currentCompany.state || 'RJ');
  const [ncm, setNcm] = useState<string>(activeDoc?.ncm || '2202.10.00');
  const [cfop, setCfop] = useState<string>(activeDoc?.cfop || '2102');
  
  const [aliqInterestadual, setAliqInterestadual] = useState<number>(12);
  const [aliqInternaDestino, setAliqInternaDestino] = useState<number>(20);
  const [fcpDestino, setFcpDestino] = useState<number>(2);
  const [mvaOriginal, setMvaOriginal] = useState<number>(44.3);
  const [methodology, setMethodology] = useState<'base_dupla' | 'base_simples'>('base_dupla');
  const [isImported, setIsImported] = useState<boolean>(false);

  // Sync with activeDoc when selectedDoc changes
  useEffect(() => {
    if (activeDoc) {
      setValorMercadoria(activeDoc.valorTotal);
      setNcm(activeDoc.ncm || '2202.10.00');
      setCfop(activeDoc.cfop || '2102');

      const isEntrada = activeDoc.cfop.startsWith('2') || activeDoc.direcao === 'entrada';
      const isSaida = activeDoc.cfop.startsWith('6') || activeDoc.direcao === 'saida';
      const isStDoc = activeDoc.cfop.startsWith('5.4') || activeDoc.cfop.startsWith('6.4') || activeDoc.cfop === '5405' || activeDoc.ncm === '2202.10.00' || activeDoc.ncm === '2203.00.00';

      if (isStDoc) {
        setOpType('st');
      } else if (isEntrada) {
        setOpType('difal_entrada');
      } else if (isSaida) {
        setOpType('difal_saida');
      }

      const compState = currentCompany.state || 'RJ';
      if (isEntrada) {
        setOrigemUf(compState === 'SP' ? 'RJ' : 'SP');
        setDestinoUf(compState);
      } else if (isSaida) {
        setOrigemUf(compState);
        setDestinoUf(compState === 'RJ' ? 'SP' : 'RJ');
      }
    }
  }, [activeDoc, currentCompany.state]);

  // Update rates when UFs change
  useEffect(() => {
    const interRate = isImported ? 4.0 : getInterstateRate(origemUf, destinoUf);
    setAliqInterestadual(interRate);

    const destDef = BRAZILIAN_STATES_ICMS[destinoUf];
    if (destDef) {
      setAliqInternaDestino(destDef.standardIcmsRate);
      setFcpDestino(destDef.fcpRate || 0);
    }

    const ncmRule = NCM_TAX_CATALOG[ncm];
    if (ncmRule) {
      setMvaOriginal(ncmRule.mvaOriginal || 40.0);
    }
  }, [origemUf, destinoUf, ncm, isImported]);

  // Mathematical Calculation Engine
  const calculationResults = useMemo(() => {
    const valorBaseOperacao = Math.max(0, valorMercadoria + frete + seguro + outrasDespesas + ipi - descontoIncondicional);
    const effectiveDestRate = +(aliqInternaDestino + fcpDestino).toFixed(2);
    
    // MVA Ajustada (Convênio ICMS 142/2018)
    const mvaAjustada = origemUf !== destinoUf
      ? calculateMvaAjustada(mvaOriginal, aliqInterestadual, effectiveDestRate)
      : mvaOriginal;

    // 1. Substituição Tributária (ST)
    const baseST = +(valorBaseOperacao * (1 + mvaAjustada / 100)).toFixed(2);
    const icmsProprio = +(valorBaseOperacao * (aliqInterestadual / 100)).toFixed(2);
    const icmsStBruto = +(baseST * (effectiveDestRate / 100)).toFixed(2);
    const icmsStLiquido = Math.max(0, +(icmsStBruto - icmsProprio).toFixed(2));
    const fcpSt = +(baseST * (fcpDestino / 100)).toFixed(2);

    // 2. DIFAL Entrada (Base Simples)
    const difalEntradaSimples = +(valorBaseOperacao * (effectiveDestRate - aliqInterestadual) / 100).toFixed(2);

    // 3. DIFAL Entrada (Base Dupla / Cálculo por Dentro)
    const icmsOrigemVal = +(valorBaseOperacao * (aliqInterestadual / 100)).toFixed(2);
    const baseExcluida = +(valorBaseOperacao - icmsOrigemVal).toFixed(2);
    const destDec = effectiveDestRate / 100;
    const baseDupla = destDec < 1 ? +(baseExcluida / (1 - destDec)).toFixed(2) : valorBaseOperacao;
    const icmsDestTotal = +(baseDupla * (aliqInternaDestino / 100)).toFixed(2);
    const fcpBaseDupla = +(baseDupla * (fcpDestino / 100)).toFixed(2);
    const difalBaseDupla = Math.max(0, +(icmsDestTotal - icmsOrigemVal).toFixed(2));
    const difalEntradaDuplaTotal = +(difalBaseDupla + fcpBaseDupla).toFixed(2);

    // 4. DIFAL Saída (EC 87/2015)
    const difalSaidaImposto = +(valorBaseOperacao * (Math.max(0, aliqInternaDestino - aliqInterestadual) / 100)).toFixed(2);
    const difalSaidaFcp = +(valorBaseOperacao * (fcpDestino / 100)).toFixed(2);
    const difalSaidaTotal = +(difalSaidaImposto + difalSaidaFcp).toFixed(2);

    return {
      valorBaseOperacao,
      effectiveDestRate,
      mvaAjustada,
      baseST,
      icmsProprio,
      icmsStBruto,
      icmsStLiquido,
      fcpSt,
      difalEntradaSimples,
      baseDupla,
      icmsOrigemVal,
      icmsDestTotal,
      difalBaseDupla,
      fcpBaseDupla,
      difalEntradaDuplaTotal,
      difalSaidaImposto,
      difalSaidaFcp,
      difalSaidaTotal
    };
  }, [
    valorMercadoria, frete, seguro, outrasDespesas, ipi, descontoIncondicional,
    origemUf, destinoUf, aliqInterestadual, aliqInternaDestino, fcpDestino,
    mvaOriginal
  ]);

  const handleApplyCurrentCalculation = () => {
    if (opType === 'st') {
      onApplyTaxToXml(
        'st',
        calculationResults.icmsStLiquido,
        calculationResults.baseST,
        calculationResults.effectiveDestRate,
        { mva: calculationResults.mvaAjustada, icmsProprio: calculationResults.icmsProprio }
      );
    } else if (opType === 'difal_entrada') {
      const taxVal = methodology === 'base_dupla' ? calculationResults.difalEntradaDuplaTotal : calculationResults.difalEntradaSimples;
      const baseVal = methodology === 'base_dupla' ? calculationResults.baseDupla : calculationResults.valorBaseOperacao;
      onApplyTaxToXml('difal_entrada', taxVal, baseVal, calculationResults.effectiveDestRate);
    } else {
      onApplyTaxToXml('difal_saida', calculationResults.difalSaidaTotal, calculationResults.valorBaseOperacao, calculationResults.effectiveDestRate);
    }
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Top Banner: Quick Preset from Active Repository */}
      <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">Simulador Central DIFAL & Substituição Tributária</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                Convênio 142/18 & EC 87/15
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Automatização precisa de alíquotas interestaduais, MVA Ajustada e memória de cálculo Base Dupla
            </p>
          </div>
        </div>

        {/* Quick Select XML Document */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">Carregar Nota:</span>
          <select
            value={selectedDocId}
            onChange={(e) => onSelectDoc(e.target.value)}
            aria-label="Carregar nota fiscal para simulação"
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-rose-500 cursor-pointer w-full md:w-auto"
          >
            {documents.map(d => (
              <option key={d.id} value={d.id}>
                {d.tipo} nº {d.numero} - {d.emitente.substring(0, 20)} (R$ {d.valorTotal.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wide Horizontal 3-Column Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: Configuração da Operação (4 Cols) */}
        <div className="lg:col-span-4 p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-rose-500" />
              1. Dados da Operação Fiscal
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Entrada / Saída</span>
          </div>

          {/* Operation Type Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setOpType('difal_entrada')}
              className={`py-2 px-1 text-center rounded-lg text-[10px] font-black uppercase transition ${opType === 'difal_entrada' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              DIFAL Entrada
            </button>
            <button
              onClick={() => setOpType('difal_saida')}
              className={`py-2 px-1 text-center rounded-lg text-[10px] font-black uppercase transition ${opType === 'difal_saida' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              DIFAL Saída
            </button>
            <button
              onClick={() => setOpType('st')}
              className={`py-2 px-1 text-center rounded-lg text-[10px] font-black uppercase transition ${opType === 'st' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              ICMS ST
            </button>
          </div>

          {/* UF Origin & Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">UF Origem (Remetente)</label>
              <select
                value={origemUf}
                onChange={(e) => setOrigemUf(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 font-bold focus:outline-none focus:border-rose-500"
              >
                {Object.keys(BRAZILIAN_STATES_ICMS).map(uf => (
                  <option key={uf} value={uf}>{uf} - {BRAZILIAN_STATES_ICMS[uf].name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">UF Destino (Destinatário)</label>
              <select
                value={destinoUf}
                onChange={(e) => setDestinoUf(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 font-bold focus:outline-none focus:border-rose-500"
              >
                {Object.keys(BRAZILIAN_STATES_ICMS).map(uf => (
                  <option key={uf} value={uf}>{uf} - {BRAZILIAN_STATES_ICMS[uf].name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* NCM & CFOP */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">NCM do Produto</label>
              <select
                value={ncm}
                onChange={(e) => setNcm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2 font-mono focus:outline-none focus:border-rose-500"
              >
                {Object.keys(NCM_TAX_CATALOG).map(code => (
                  <option key={code} value={code}>{code} - {NCM_TAX_CATALOG[code].category}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">CFOP da Operação</label>
              <input
                type="text"
                value={cfop}
                onChange={(e) => setCfop(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2 font-mono font-bold focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Valor da Mercadoria & Despesas Acessórias */}
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Valor dos Produtos (R$)</label>
              <input
                type="number"
                step="0.01"
                value={valorMercadoria}
                onChange={(e) => setValorMercadoria(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 text-emerald-400 text-base font-black rounded-xl p-2.5 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Frete (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={frete}
                  onChange={(e) => setFrete(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Seguro / Outras (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={seguro + outrasDespesas}
                  onChange={(e) => setSeguro(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl p-2 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isImportedCheck"
                checked={isImported}
                onChange={(e) => setIsImported(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="isImportedCheck" className="text-[11px] text-slate-300 cursor-pointer">
                Mercadoria com Conteúdo de Importação &gt; 40% (Alíquota 4%)
              </label>
            </div>
          </div>
        </div>

        {/* Column 2: Alíquotas e Parâmetros Tributários (4 Cols) */}
        <div className="lg:col-span-4 p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-500" />
              2. Alíquotas & Margens (MVA)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">SEFAZ {destinoUf}</span>
          </div>

          <div className="space-y-3">
            {/* Interstate & Internal Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[9px] font-bold text-amber-400 uppercase">Alíquota Interestadual</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white font-mono">{aliqInterestadual}%</span>
                  <span className="text-[9px] text-slate-500">Res. 22/89</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[9px] font-bold text-emerald-400 uppercase">Alíq Interna Destino</span>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white font-mono">{aliqInternaDestino}%</span>
                  <span className="text-[9px] text-slate-500">UF {destinoUf}</span>
                </div>
              </div>
            </div>

            {/* FCP Rate */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase block">FCP (Fundo Combate à Pobreza)</span>
                <span className="text-[9px] text-slate-400">Adicional estadual obrigatório no destino</span>
              </div>
              <span className="text-lg font-black text-purple-400 font-mono">+{fcpDestino}%</span>
            </div>

            {/* MVA Original vs MVA Ajustada */}
            {opType === 'st' && (
              <div className="p-4 bg-slate-900 rounded-2xl border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-400 uppercase">MVA Original da Mercadoria</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={mvaOriginal}
                      onChange={(e) => setMvaOriginal(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold rounded p-1 text-right"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-300 uppercase block">MVA Ajustada (Calculada)</span>
                    <span className="text-[8px] text-slate-400 font-mono">Fórmula oficial Convênio 142/18</span>
                  </div>
                  <span className="text-xl font-black text-rose-400 font-mono">{calculationResults.mvaAjustada}%</span>
                </div>
              </div>
            )}

            {/* Methodology Toggle for DIFAL Entrada */}
            {opType === 'difal_entrada' && (
              <div className="space-y-2 pt-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Metodologia de Apuração DIFAL</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMethodology('base_dupla')}
                    className={`p-2.5 rounded-xl text-left border transition ${methodology === 'base_dupla' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    <div className="text-[10px] font-black uppercase">Base Dupla (Por Dentro)</div>
                    <div className="text-[8px] text-slate-400">Exclui origem e embute alíq destino</div>
                  </button>
                  <button
                    onClick={() => setMethodology('base_simples')}
                    className={`p-2.5 rounded-xl text-left border transition ${methodology === 'base_simples' ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    <div className="text-[10px] font-black uppercase">Base Simples (Única)</div>
                    <div className="text-[8px] text-slate-400">Diferencial direto de alíquotas</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Memória de Cálculo & Ações Fiscais (4 Cols) */}
        <div className="lg:col-span-4 p-5 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                3. Resultado & Memória de Cálculo
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Apuração Líquida</span>
            </div>

            {/* Specific Breakdown according to opType */}
            {opType === 'st' ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base de Cálculo ST:</span>
                  <span className="text-white font-bold">R$ {calculationResults.baseST.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ICMS Próprio Origem ({aliqInterestadual}%):</span>
                  <span className="text-slate-300">R$ {calculationResults.icmsProprio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ICMS-ST Bruto ({calculationResults.effectiveDestRate}%):</span>
                  <span className="text-slate-300">R$ {calculationResults.icmsStBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex justify-between items-center mt-2">
                  <span className="text-xs font-black text-rose-300 uppercase">ICMS-ST a Recolher:</span>
                  <span className="text-xl font-black text-rose-400">R$ {calculationResults.icmsStLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            ) : opType === 'difal_entrada' ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base de Cálculo {methodology === 'base_dupla' ? 'Dupla' : 'Simples'}:</span>
                  <span className="text-white font-bold">
                    R$ {(methodology === 'base_dupla' ? calculationResults.baseDupla : calculationResults.valorBaseOperacao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ICMS Destino Total:</span>
                  <span className="text-slate-300">R$ {calculationResults.icmsDestTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>FCP Destino ({fcpDestino}%):</span>
                  <span className="text-purple-400">R$ {calculationResults.fcpBaseDupla.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex justify-between items-center mt-2">
                  <span className="text-xs font-black text-amber-300 uppercase">DIFAL Entrada Devido:</span>
                  <span className="text-xl font-black text-amber-400">
                    R$ {(methodology === 'base_dupla' ? calculationResults.difalEntradaDuplaTotal : calculationResults.difalEntradaSimples).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Base DIFAL Saída (EC 87):</span>
                  <span className="text-white font-bold">R$ {calculationResults.valorBaseOperacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Diferencial de Alíquota ({aliqInternaDestino - aliqInterestadual}%):</span>
                  <span className="text-slate-300">R$ {calculationResults.difalSaidaImposto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>FCP UF Destino ({fcpDestino}%):</span>
                  <span className="text-purple-400">R$ {calculationResults.difalSaidaFcp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex justify-between items-center mt-2">
                  <span className="text-xs font-black text-cyan-300 uppercase">Total GNRE Destino:</span>
                  <span className="text-xl font-black text-cyan-400">R$ {calculationResults.difalSaidaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <button
              onClick={handleApplyCurrentCalculation}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              <span>Gravar Cálculo Diretamente no XML</span>
            </button>
            <p className="text-[9px] text-slate-500 text-center font-mono">
              Injeta nós &lt;ICMSUFDest&gt; ou &lt;ICMS10&gt; no arquivo oficial do documento selecionado
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
