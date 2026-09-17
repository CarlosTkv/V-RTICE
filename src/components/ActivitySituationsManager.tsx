import React from 'react';
import { 
  CheckSquare, 
  Square, 
  Percent, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { AnexoRevenueItem, RevenueSituationType, ActivitySituationSplit, SimplesAnexo } from '../types';
import { formatCurrencyBRL, formatPercentBR } from '../utils/taxRules';

interface ActivitySituationsManagerProps {
  item: AnexoRevenueItem;
  anexo: SimplesAnexo;
  effectiveSimplesRate: number; // Ex: 0.065 (6.5%)
  isTransport?: boolean;
  onChangeItem: (updated: AnexoRevenueItem) => void;
}

interface SituationMeta {
  key: RevenueSituationType;
  label: string;
  shortLabel: string;
  badge: string;
  badgeColor: string;
  deductedTaxes: string;
  description: string;
  legalBasis: string;
  applicableAnexos: SimplesAnexo[];
}

export const SITUATION_METAS: SituationMeta[] = [
  {
    key: 'normal',
    label: 'Tributação Normal Integral',
    shortLabel: 'Normal',
    badge: 'Sem Dedução',
    badgeColor: 'border-slate-700 text-slate-300 bg-slate-800',
    deductedTaxes: 'Nenhum tributo deduzido (Alíquota integral do Simples)',
    description: 'Receita tributada normalmente com recolhimento de todos os tributos na guia DAS única.',
    legalBasis: 'LC 123/2006, Art. 18',
    applicableAnexos: ['I', 'II', 'III', 'IV', 'V'],
  },
  {
    key: 'iss_retido',
    label: 'Com Retenção de ISS pelo Tomador',
    shortLabel: 'Retenção ISS',
    badge: 'Deduz ISS (100%)',
    badgeColor: 'border-amber-800 text-amber-300 bg-amber-950/80',
    deductedTaxes: 'Deduz 100% da parcela de ISS da guia DAS',
    description: 'O tomador do serviço retém o imposto na fonte conforme Art. 3º da LC 116/2003 e Art. 21, § 4º da LC 123/2006. O ISS não é cobrado no DAS.',
    legalBasis: 'LC 116/2003 Art. 3º; LC 123/2006 Art. 21 § 4º',
    applicableAnexos: ['III', 'IV', 'V'],
  },
  {
    key: 'icms_st',
    label: 'Com Substituição Tributária (ICMS-ST / ISS-ST)',
    shortLabel: 'Subst. Tributária (ST)',
    badge: 'Deduz ICMS/ISS',
    badgeColor: 'border-purple-800 text-purple-300 bg-purple-950/80',
    deductedTaxes: 'Deduz parcela de ICMS (Comércio/Indústria/Frete) ou ISS-ST da guia DAS',
    description: 'Imposto já recolhido por substituição tributária na cadeia produtiva anterior ou pago pelo contratante.',
    legalBasis: 'LC 123/2006, Art. 18, § 4º-A, I',
    applicableAnexos: ['I', 'II', 'III'],
  },
  {
    key: 'isencao_reducao',
    label: 'Com Isenção ou Redução de Base (Estadual/Municipal)',
    shortLabel: 'Isenção / Redução',
    badge: 'Deduz ICMS/ISS',
    badgeColor: 'border-emerald-800 text-emerald-300 bg-emerald-950/80',
    deductedTaxes: 'Deduz parcela de ICMS (ex: PR até R$ 360k) ou ISS municipal isento',
    description: 'Operações amparadas por benefício fiscal estadual (isenção até R$ 360k ou redução progressiva) ou isenção municipal.',
    legalBasis: 'LC 123/2006, Art. 19 e Art. 20; Lei Estadual PR 15.342/06',
    applicableAnexos: ['I', 'II', 'III', 'IV', 'V'],
  },
  {
    key: 'pis_cofins_monofasico',
    label: 'Com Tributação Monofásica de PIS/COFINS',
    shortLabel: 'PIS/COFINS Monofásico',
    badge: 'Deduz PIS/COFINS',
    badgeColor: 'border-cyan-800 text-cyan-300 bg-cyan-950/80',
    deductedTaxes: 'Deduz parcelas de PIS e COFINS da guia DAS',
    description: 'Revenda de produtos monofásicos (autopeças, cosméticos, bebidas, combustíveis, remédios). Tributação concentrada no fabricante.',
    legalBasis: 'Lei nº 10.147/2000; LC 123/2006, Art. 18, § 4º-A',
    applicableAnexos: ['I'],
  },
  {
    key: 'transporte_subcontratado',
    label: 'Subcontratação de Frete (Convênio ICMS 25/90)',
    shortLabel: 'Frete Subcontratado',
    badge: 'Deduz ICMS Frete (100%)',
    badgeColor: 'border-blue-800 text-blue-300 bg-blue-950/80',
    deductedTaxes: 'Deduz 100% da parcela de ICMS do DAS de transporte',
    description: 'Frete executado como transportadora subcontratada. O ICMS da prestação é de responsabilidade da transportadora contratante inicial.',
    legalBasis: 'Convênio ICMS 25/90; LC 123/2006, Art. 18, § 4º-A',
    applicableAnexos: ['III'],
  },
];

export const ActivitySituationsManager: React.FC<ActivitySituationsManagerProps> = ({
  item,
  anexo,
  effectiveSimplesRate,
  isTransport = false,
  onChangeItem,
}) => {
  const totalRevInternal = item.monthlyRevenueInternal || 0;

  // Filtra as situações compatíveis com o Anexo desta atividade
  const availableSituations = SITUATION_METAS.filter(meta => {
    if (meta.key === 'transporte_subcontratado') {
      return isTransport;
    }
    return meta.applicableAnexos.includes(anexo);
  });

  // Situações ativas atuais (ou default 'normal')
  const currentActiveSituations: RevenueSituationType[] = React.useMemo(() => {
    if (item.activeSituations && item.activeSituations.length > 0) {
      return item.activeSituations;
    }
    // Inferência baseada em propriedades legadas
    const inferred: RevenueSituationType[] = [];
    if (item.issRetidoPercent && item.issRetidoPercent > 0) inferred.push('iss_retido');
    if (item.stPercent && item.stPercent > 0) inferred.push('icms_st');
    if (item.isencaoPercent && item.isencaoPercent > 0) inferred.push('isencao_reducao');
    if (item.monofasicoPercent && item.monofasicoPercent > 0) inferred.push('pis_cofins_monofasico');
    if (item.subcontratacaoPercent && item.subcontratacaoPercent > 0) inferred.push('transporte_subcontratado');

    if (inferred.length === 0) {
      if (item.ecacClassification && item.ecacClassification !== 'normal') {
        if (item.ecacClassification === 'iss_retido' || item.ecacClassification === 'iss_st') inferred.push('iss_retido');
        else if (item.ecacClassification === 'icms_st') inferred.push('icms_st');
        else if (item.ecacClassification === 'icms_isencao_estadual' || item.ecacClassification === 'iss_isencao_municipal') inferred.push('isencao_reducao');
        else if (item.ecacClassification === 'pis_cofins_monofasico') inferred.push('pis_cofins_monofasico');
        else if (item.ecacClassification === 'transporte_subcontratado') inferred.push('transporte_subcontratado');
      } else {
        inferred.push('normal');
      }
    }
    return inferred;
  }, [item]);

  // Lista de desdobramentos ativos
  const currentSplits: ActivitySituationSplit[] = React.useMemo(() => {
    if (item.situationSplits && item.situationSplits.length > 0) {
      return item.situationSplits;
    }

    // Inicializa splits baseado nas situações marcadas
    const total = totalRevInternal > 0 ? totalRevInternal : 0;
    const count = currentActiveSituations.length || 1;
    const equalPercent = +(100 / count).toFixed(2);

    return currentActiveSituations.map(sit => {
      const meta = SITUATION_METAS.find(m => m.key === sit);
      // Busca percentual específico se já existia
      let pct = equalPercent;
      if (sit === 'iss_retido' && item.issRetidoPercent !== undefined) pct = item.issRetidoPercent;
      else if (sit === 'icms_st' && item.stPercent !== undefined) pct = item.stPercent;
      else if (sit === 'isencao_reducao' && item.isencaoPercent !== undefined) pct = item.isencaoPercent;
      else if (sit === 'pis_cofins_monofasico' && item.monofasicoPercent !== undefined) pct = item.monofasicoPercent;
      else if (sit === 'transporte_subcontratado' && item.subcontratacaoPercent !== undefined) pct = item.subcontratacaoPercent;

      const amt = +(total * (pct / 100)).toFixed(2);

      return {
        id: `split_${sit}`,
        situation: sit,
        label: meta?.label || sit,
        active: true,
        percent: pct,
        amount: amt,
        description: meta?.deductedTaxes,
      };
    });
  }, [item, currentActiveSituations, totalRevInternal]);

  // Alterna uma situação (marca ou desmarca)
  const toggleSituation = (sitKey: RevenueSituationType) => {
    let nextSituations: RevenueSituationType[];
    const isCurrentlyActive = currentActiveSituations.includes(sitKey);

    if (isCurrentlyActive) {
      // Se for a última, mantém ao menos 'normal'
      if (currentActiveSituations.length <= 1) {
        nextSituations = ['normal'];
      } else {
        nextSituations = currentActiveSituations.filter(s => s !== sitKey);
      }
    } else {
      // Adiciona a nova situação
      nextSituations = [...currentActiveSituations, sitKey];
    }

    // Recalcula splits correspondentes
    const count = nextSituations.length;
    const equalPct = +(100 / count).toFixed(2);
    const newSplits: ActivitySituationSplit[] = nextSituations.map((sit, idx) => {
      const meta = SITUATION_METAS.find(m => m.key === sit);
      // Se for o último elemento, ajusta para somar exatamente 100%
      const pct = idx === count - 1 ? +(100 - equalPct * (count - 1)).toFixed(2) : equalPct;
      const amt = +(totalRevInternal * (pct / 100)).toFixed(2);

      return {
        id: `split_${sit}`,
        situation: sit,
        label: meta?.label || sit,
        active: true,
        percent: pct,
        amount: amt,
        description: meta?.deductedTaxes,
      };
    });

    // Atualiza percentuais legados para sincronização completa
    const updatedItem: AnexoRevenueItem = {
      ...item,
      activeSituations: nextSituations,
      situationSplits: newSplits,
      issRetidoPercent: nextSituations.includes('iss_retido') ? (newSplits.find(s => s.situation === 'iss_retido')?.percent || 100) : 0,
      stPercent: nextSituations.includes('icms_st') ? (newSplits.find(s => s.situation === 'icms_st')?.percent || 100) : 0,
      isencaoPercent: nextSituations.includes('isencao_reducao') ? (newSplits.find(s => s.situation === 'isencao_reducao')?.percent || 100) : 0,
      monofasicoPercent: nextSituations.includes('pis_cofins_monofasico') ? (newSplits.find(s => s.situation === 'pis_cofins_monofasico')?.percent || 100) : 0,
      subcontratacaoPercent: nextSituations.includes('transporte_subcontratado') ? (newSplits.find(s => s.situation === 'transporte_subcontratado')?.percent || 100) : 0,
    };

    onChangeItem(updatedItem);
  };

  // Altera o percentual de um desdobramento específico
  const handleUpdateSplitPercent = (situation: RevenueSituationType, newPercent: number) => {
    const clamped = Math.max(0, Math.min(100, newPercent));
    const updatedSplits = currentSplits.map(s => {
      if (s.situation === situation) {
        return {
          ...s,
          percent: clamped,
          amount: +(totalRevInternal * (clamped / 100)).toFixed(2),
        };
      }
      return s;
    });

    const updatedItem: AnexoRevenueItem = {
      ...item,
      situationSplits: updatedSplits,
      issRetidoPercent: updatedSplits.find(s => s.situation === 'iss_retido')?.percent ?? item.issRetidoPercent,
      stPercent: updatedSplits.find(s => s.situation === 'icms_st')?.percent ?? item.stPercent,
      isencaoPercent: updatedSplits.find(s => s.situation === 'isencao_reducao')?.percent ?? item.isencaoPercent,
      monofasicoPercent: updatedSplits.find(s => s.situation === 'pis_cofins_monofasico')?.percent ?? item.monofasicoPercent,
      subcontratacaoPercent: updatedSplits.find(s => s.situation === 'transporte_subcontratado')?.percent ?? item.subcontratacaoPercent,
    };

    onChangeItem(updatedItem);
  };

  // Altera o valor em R$ de um desdobramento específico
  const handleUpdateSplitAmount = (situation: RevenueSituationType, newAmount: number) => {
    const clampedAmount = Math.max(0, newAmount);
    const newPercent = totalRevInternal > 0 ? +((clampedAmount / totalRevInternal) * 100).toFixed(2) : 0;

    const updatedSplits = currentSplits.map(s => {
      if (s.situation === situation) {
        return {
          ...s,
          amount: clampedAmount,
          percent: Math.min(100, newPercent),
        };
      }
      return s;
    });

    const updatedItem: AnexoRevenueItem = {
      ...item,
      situationSplits: updatedSplits,
      issRetidoPercent: updatedSplits.find(s => s.situation === 'iss_retido')?.percent ?? item.issRetidoPercent,
      stPercent: updatedSplits.find(s => s.situation === 'icms_st')?.percent ?? item.stPercent,
      isencaoPercent: updatedSplits.find(s => s.situation === 'isencao_reducao')?.percent ?? item.isencaoPercent,
      monofasicoPercent: updatedSplits.find(s => s.situation === 'pis_cofins_monofasico')?.percent ?? item.monofasicoPercent,
      subcontratacaoPercent: updatedSplits.find(s => s.situation === 'transporte_subcontratado')?.percent ?? item.subcontratacaoPercent,
    };

    onChangeItem(updatedItem);
  };

  // Distribuir igualmente 100% entre todas as situações ativas
  const handleDistributeEqually = () => {
    const count = currentActiveSituations.length;
    if (count === 0) return;

    const equalPct = +(100 / count).toFixed(2);
    const newSplits = currentSplits.map((s, idx) => {
      const pct = idx === count - 1 ? +(100 - equalPct * (count - 1)).toFixed(2) : equalPct;
      return {
        ...s,
        percent: pct,
        amount: +(totalRevInternal * (pct / 100)).toFixed(2),
      };
    });

    const updatedItem: AnexoRevenueItem = {
      ...item,
      situationSplits: newSplits,
      issRetidoPercent: newSplits.find(s => s.situation === 'iss_retido')?.percent,
      stPercent: newSplits.find(s => s.situation === 'icms_st')?.percent,
      isencaoPercent: newSplits.find(s => s.situation === 'isencao_reducao')?.percent,
      monofasicoPercent: newSplits.find(s => s.situation === 'pis_cofins_monofasico')?.percent,
      subcontratacaoPercent: newSplits.find(s => s.situation === 'transporte_subcontratado')?.percent,
    };

    onChangeItem(updatedItem);
  };

  const totalSplitPercent = currentSplits.reduce((acc, s) => acc + (s.percent || 0), 0);
  const totalSplitAmount = currentSplits.reduce((acc, s) => acc + (s.amount || 0), 0);
  const hasMultipleSituations = currentActiveSituations.length > 1;

  return (
    <div className="mt-3 pt-3 border-t border-slate-800 bg-[#0B0F19] p-4 rounded-xl border border-slate-800 shadow-xs space-y-3">
      {/* Header com instruções e indicador de múltipla situação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs font-bold text-slate-100 font-sans">
            Situações Fiscais e Variáveis da Atividade (e-CAC / PGDAS-D)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800 font-semibold">
            {currentActiveSituations.length > 1 ? `${currentActiveSituations.length} Situações Marcadas` : '1 Situação'}
          </span>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 font-mono">
          <span>Receita da Atividade:</span>
          <span className="text-slate-100 font-bold">{formatCurrencyBRL(totalRevInternal)}</span>
        </div>
      </div>

      {/* Bar com opções selecionáveis (Checkboxes interativos com chips coloridos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {availableSituations.map(meta => {
          const isSelected = currentActiveSituations.includes(meta.key);
          return (
            <button
              key={meta.key}
              type="button"
              onClick={() => toggleSituation(meta.key)}
              className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0F172A] border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-[#0F172A]/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-[#0F172A]'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-bold truncate ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>
                    {meta.shortLabel}
                  </span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold shrink-0 ${meta.badgeColor}`}>
                    {meta.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                  {meta.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Painel de Desdobramento Detalhado quando múltiplas situações estão marcadas */}
      {hasMultipleSituations && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-200">
                Desdobramento dos Valores por Situação Fiscal:
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                (Ajuste os valores em R$ ou percentuais para cada hipótese)
              </span>
            </div>

            <button
              type="button"
              onClick={handleDistributeEqually}
              className="text-[10px] font-mono px-2 py-1 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-blue-300 hover:text-blue-200 border border-slate-800 shadow-xs transition cursor-pointer"
              title="Dividir igualmente o total da receita entre as situações marcadas"
            >
              Distribuir Igualmente
            </button>
          </div>

          {/* Cards de cada situação marcada */}
          <div className="space-y-2">
            {currentSplits.map(split => {
              const meta = SITUATION_METAS.find(m => m.key === split.situation);
              const isNormal = split.situation === 'normal';
              
              // Estimativa de economia no DAS desta parcela
              // (Parcial simples rate * valor desta parcela)
              const estimatedSaving = !isNormal 
                ? (split.amount || 0) * (effectiveSimplesRate || 0.065) * 0.335
                : 0;

              return (
                <div
                  key={split.situation}
                  className="bg-[#0F172A] border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs hover:border-slate-700 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${meta?.badgeColor}`}>
                        {meta?.shortLabel}
                      </span>
                      <span className="text-xs font-bold text-slate-100 font-sans">
                        {meta?.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-1">
                      <span>Base Legal: {meta?.legalBasis}</span>
                      {!isNormal && estimatedSaving > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold flex items-center space-x-0.5">
                            <TrendingDown className="w-3 h-3 inline" />
                            <span>Economia estimada no DAS: ~{formatCurrencyBRL(estimatedSaving)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Campos de Input de R$ e % sincronizados */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-slate-400 font-mono">R$:</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={split.amount || ''}
                        onChange={(e) => handleUpdateSplitAmount(split.situation, parseFloat(e.target.value) || 0)}
                        placeholder="0,00"
                        className="w-28 bg-[#0B0F19] border border-slate-800 focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-100 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-slate-400 font-mono">%:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={split.percent !== undefined ? split.percent : ''}
                        onChange={(e) => handleUpdateSplitPercent(split.situation, parseFloat(e.target.value) || 0)}
                        placeholder="0%"
                        className="w-16 bg-[#0B0F19] border border-slate-800 focus:border-blue-500 rounded-lg px-2 py-1 text-xs font-mono text-slate-100 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpdateSplitPercent(split.situation, 100)}
                      className="text-[9px] font-mono px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition cursor-pointer"
                      title="Definir 100% desta atividade para esta situação"
                    >
                      100%
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barra de Validação da Soma (Alerta amigável se passar ou faltar 100%) */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <span>Soma dos Desdobramentos:</span>
              <span className={`font-bold ${Math.abs(totalSplitPercent - 100) < 0.1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {totalSplitPercent.toFixed(1)}% ({formatCurrencyBRL(totalSplitAmount)})
              </span>
              {Math.abs(totalSplitPercent - 100) > 0.1 && (
                <span className="text-amber-400 text-[10px] flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 inline" />
                  <span>Diferença: {(100 - totalSplitPercent).toFixed(1)}%</span>
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              O PGDAS-D segregará automaticamente as linhas correspondentes na apuração do e-CAC
            </div>
          </div>
        </div>
      )}

      {/* Nota de rodapé explicativa para o contador / auditor */}
      {!hasMultipleSituations && (
        <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 inline" />
          <span>
            Dica: Marque mais de uma situação acima se esta mesma atividade possuir vendas com retenção e outras com isenção ou substituição.
          </span>
        </div>
      )}
    </div>
  );
};
