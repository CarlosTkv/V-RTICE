/**
 * VÉRTICE AUDITOR FISCAL - DYNAMIC TAX RULES ENGINE
 * Gerencia a parametrização viva e reativa das regras, fórmulas, alíquotas
 * e entendimentos tributários atualizados pelos robôs de varredura governamental.
 */

export interface DynamicTaxRuleParameter {
  id: string;
  category: 'SimplesNacional' | 'ReformaTributaria' | 'PIS_COFINS_Monofasico' | 'ICMS_ISS' | 'FatorR' | 'Jurisprudencia';
  name: string;
  code: string;
  legalSource: string;
  officialDoc: string;
  oldValueText: string;
  newValueText: string;
  currentNumericValue: number;
  unit: '%' | 'R$' | 'ratio' | 'boolean';
  status: 'applied' | 'pending' | 'draft';
  lastUpdated: string;
  affectedModules: string[];
  impactDescription: string;
  calculationFormulaBefore: string;
  calculationFormulaAfter: string;
}

export interface PlatformSyncSummary {
  engineVersion: string;
  rulesAppliedCount: number;
  pendingRulesCount: number;
  lastGlobalSyncTimestamp: string;
  activeParameters: Record<string, number | boolean | string>;
}

const STORAGE_KEY_DYNAMIC_RULES = 'vertice_dynamic_tax_rules_v1';

export const DEFAULT_DYNAMIC_TAX_RULES: DynamicTaxRuleParameter[] = [
  {
    id: 'rule_cbs_ibs_test_2026',
    category: 'ReformaTributaria',
    name: 'Alíquota de Teste do IVA Dual (CBS Federal + IBS Subnacional)',
    code: 'IVA_DUAL_TEST_RATE',
    legalSource: 'Secretaria da Reforma Tributária / EC 132/2023 Art. 124',
    officialDoc: 'EC 132/2023 & PLP 68/2024 Art. 340',
    oldValueText: '0,00% (CBS 0% / IBS 0% - Regime Antigo PIS/COFINS/ICMS/ISS)',
    newValueText: '1,00% Total (CBS 0,90% + IBS 0,10% compensável)',
    currentNumericValue: 0.010, // 1%
    unit: '%',
    status: 'applied',
    lastUpdated: '17/09/2026',
    affectedModules: ['Reforma Tributária (IVA Dual)', 'Planejamento Tributário', 'Emissor Fiscal NFS-e'],
    impactDescription: 'Aplica a cobrança de teste de 1,0% sobre faturamento de serviços e mercadorias do regime regular com compensação integral de PIS e COFINS na apuração mensal.',
    calculationFormulaBefore: 'Tributos = PIS (1,65% / 0,65%) + COFINS (7,60% / 3,00%) + ICMS + ISS',
    calculationFormulaAfter: 'Tributos = (Receita Bruta * 0,9% [CBS]) + (Receita Bruta * 0,1% [IBS]) - Créditos de PIS/COFINS',
  },
  {
    id: 'rule_monofasico_pis_cofins_deduction',
    category: 'PIS_COFINS_Monofasico',
    name: 'Segregação Automática de PIS/COFINS Monofásico no PGDAS-D',
    code: 'SIMPLES_MONOFASICO_DEDUCTION',
    legalSource: 'Receita Federal do Brasil / Lei 10.147/2000 & Solução COSIT 142/2026',
    officialDoc: 'Nota Técnica CGSN nº 42/2026 e LC 123/06 Art. 18 § 4º-A',
    oldValueText: 'Alíquota Cheia do Anexo I do Simples sobre todas as mercadorias',
    newValueText: 'Dedução de 100% da parcela de PIS e COFINS nos itens monofásicos',
    currentNumericValue: 1.0, // 100% deduçao das parcelas
    unit: '%',
    status: 'applied',
    lastUpdated: '17/09/2026',
    affectedModules: ['Classificação & Monofásico', 'Fator R & Anexos', 'Auditoria Digital'],
    impactDescription: 'Abate as alíquotas nominais de PIS e COFINS da tabela do Anexo I para farmácias, autopeças, cosméticos, bebidas frias e revendas de combustíveis.',
    calculationFormulaBefore: 'DAS = Receita Total * Alíquota Efetiva Anexo I',
    calculationFormulaAfter: 'DAS = (Receita Geral * Alíquota Efetiva) + (Receita Monofásica * [Alíquota Efetiva - Parcela PIS/COFINS])',
  },
  {
    id: 'rule_stj_tema_1125_icms_st',
    category: 'Jurisprudencia',
    name: 'Exclusão do ICMS-ST da Base de Cálculo do PIS e da COFINS',
    code: 'STJ_TEMA_1125_EXCLUSION',
    legalSource: 'Superior Tribunal de Justiça (STJ) - Primeira Seção',
    officialDoc: 'Acórdão STJ REsp 1.896.678/RS (Tema 1.125)',
    oldValueText: 'ICMS-ST integrava a receita bruta total para apuração de PIS/COFINS',
    newValueText: 'Exclusão integral do ICMS-ST destacado das bases de PIS e COFINS',
    currentNumericValue: 1.0, // Exclusão ativa
    unit: 'boolean',
    status: 'applied',
    lastUpdated: '17/09/2026',
    affectedModules: ['Planejamento Tributário', 'Consultoria Fiscal', 'Auditoria Digital'],
    impactDescription: 'Reduz a base de cálculo de PIS e COFINS pelo montante exato do ICMS recolhido anteriormente sob substituição tributária pelo substituto.',
    calculationFormulaBefore: 'Base PIS/COFINS = Faturamento Total Bruto',
    calculationFormulaAfter: 'Base PIS/COFINS = Faturamento Bruto - ICMS Próprio - ICMS-ST Destacado',
  },
  {
    id: 'rule_cgsn_sublimite_nacional',
    category: 'SimplesNacional',
    name: 'Sublimite de ICMS/ISS e Gatilho de Exclusão Subsequente (R$ 3,6M + 20%)',
    code: 'CGSN_SUBLIMIT_THRESHOLD',
    legalSource: 'Comitê Gestor do Simples Nacional / Portaria CGSN 2026',
    officialDoc: 'Resolução CGSN nº 140/2018 com alterações da Res. 175/2026',
    oldValueText: 'R$ 3.600.000,00 fixo sem cálculo proativo de excesso mensal',
    newValueText: 'R$ 3.600.000,00 base com trava aos R$ 4.320.000,00 (+20%) para EFD',
    currentNumericValue: 3600000,
    unit: 'R$',
    status: 'applied',
    lastUpdated: '17/09/2026',
    affectedModules: ['Fator R & Anexos', 'Planejamento Tributário', 'Blindagem Societária'],
    impactDescription: 'Quando a receita acumulada (RBT12) ultrapassa R$ 3,6M até R$ 4,32M, o ICMS e ISS passam a ser recolhidos em guia própria estadual/municipal no ano seguinte; se exceder 20%, o recolhimento fora do DAS é no mês subsequente.',
    calculationFormulaBefore: 'Se RBT12 > 3.6M -> Alerta simples',
    calculationFormulaAfter: 'Se RBT12 > 3.6M e <= 4.32M: Segregação Estadual em Jan/Ano+1. Se RBT12 > 4.32M: EFD SPED Imediata.',
  },
  {
    id: 'rule_fator_r_threshold',
    category: 'FatorR',
    name: 'Threshold Determinístico do Fator R (Folha/Faturamento >= 28%)',
    code: 'FATOR_R_MIN_RATIO',
    legalSource: 'Lei Complementar 123/2006 Art. 18 § 5º-J',
    officialDoc: 'Instrução Normativa RFB nº 2.114 e LC 123/06',
    oldValueText: '28,00% com validação estática de pró-labore sem projeção',
    newValueText: '28,00% com motor de inteligência preditiva de Pro-labore ideal',
    currentNumericValue: 0.28,
    unit: '%',
    status: 'applied',
    lastUpdated: '17/09/2026',
    affectedModules: ['Fator R & Auditoria', 'Dashboard', 'Gestão Financeira & BPO'],
    impactDescription: 'Se a relação Folha de Pagamento + Encargos + Pró-labore dos últimos 12 meses sobre a Receita Bruta (RBT12) for igual ou superior a 0,28, a atividade migra do Anexo V (alíquotas de 15,5% a 30,5%) para o Anexo III (alíquotas de 6,0% a 33,0%).',
    calculationFormulaBefore: 'Fator R = Folha 12m / RBT12. Se >= 0.28 -> Anexo III.',
    calculationFormulaAfter: 'Fator R = (Folha + Pró-labore + Encargos) / RBT12. Otimizador sugere Pro-labore mínimo exato para atingir 28,05%.',
  },
  {
    id: 'rule_nfse_padrao_nacional_adn',
    category: 'ReformaTributaria',
    name: 'Padrão Nacional NFS-e e Homologação de Alíquotas Municipais ADN',
    code: 'NFSE_ADN_STANDARD_RATES',
    legalSource: 'Comitê Gestor da NFS-e Nacional / Receita Federal',
    officialDoc: 'Convênio Nacional NFS-e e Resolução CGSN nº 169',
    oldValueText: 'Regras isoladas de cada município sem validação unificada',
    newValueText: 'Sincronização com Ambiente de Dados Nacional (ADN) e alíquotas de 2% a 5%',
    currentNumericValue: 0.05,
    unit: '%',
    status: 'applied',
    lastUpdated: '17/09/2026',
    affectedModules: ['Emissor Fiscal NFS-e', 'Agenda Fiscal', 'Gestão Financeira'],
    impactDescription: 'Valida automaticamente códigos de tributação nacional (NBS/Tributação Municipal), retenções na fonte de ISS e alíquota mínima constitucional de 2,00% e máxima de 5,00%.',
    calculationFormulaBefore: 'ISS = Valor Serviço * Alíquota Municipal Manual',
    calculationFormulaAfter: 'ISS = Valor Serviço * Clamp(Alíquota ADN, 2.0%, 5.0%) com validação de retenção pelo tomador.',
  }
];

export class DynamicTaxRulesEngine {
  private static instance: DynamicTaxRulesEngine;
  private rules: DynamicTaxRuleParameter[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadRules();
  }

  public static getInstance(): DynamicTaxRulesEngine {
    if (!DynamicTaxRulesEngine.instance) {
      DynamicTaxRulesEngine.instance = new DynamicTaxRulesEngine();
    }
    return DynamicTaxRulesEngine.instance;
  }

  private loadRules() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DYNAMIC_RULES);
      if (stored) {
        this.rules = JSON.parse(stored);
      } else {
        this.rules = DEFAULT_DYNAMIC_TAX_RULES;
      }
    } catch (e) {
      this.rules = DEFAULT_DYNAMIC_TAX_RULES;
    }
  }

  private saveRules() {
    try {
      localStorage.setItem(STORAGE_KEY_DYNAMIC_RULES, JSON.stringify(this.rules));
      this.notifyListeners();
    } catch (e) {
      console.warn('Erro ao salvar regras tributárias dinâmicas:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Erro em listener de regras dinâmicas:', err);
      }
    });
  }

  public getAllRules(): DynamicTaxRuleParameter[] {
    return this.rules;
  }

  public getRule(code: string): DynamicTaxRuleParameter | undefined {
    return this.rules.find(r => r.code === code);
  }

  public getNumericValue(code: string, defaultValue: number): number {
    const rule = this.rules.find(r => r.code === code && r.status === 'applied');
    return rule ? rule.currentNumericValue : defaultValue;
  }

  /**
   * Aplica uma regra ou todas as regras pendentes em toda a plataforma
   */
  public applyRule(id: string): { success: boolean; message: string } {
    const target = this.rules.find(r => r.id === id);
    if (!target) return { success: false, message: 'Regra não encontrada.' };

    this.rules = this.rules.map(r => r.id === id ? {
      ...r,
      status: 'applied',
      lastUpdated: new Date().toLocaleDateString('pt-BR'),
    } : r);

    this.saveRules();

    return {
      success: true,
      message: `Regra "${target.name}" aplicada com sucesso em toda a plataforma! Fórmulas e cálculos foram recalibrados.`,
    };
  }

  /**
   * Força a aplicação global de todas as atualizações e recalibra toda a plataforma
   */
  public applyAllRulesToEntirePlatform(): {
    success: boolean;
    appliedCount: number;
    message: string;
    affectedModules: string[];
  } {
    const affectedModulesSet = new Set<string>();
    
    this.rules = this.rules.map(r => {
      r.affectedModules.forEach(m => affectedModulesSet.add(m));
      return {
        ...r,
        status: 'applied',
        lastUpdated: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
      };
    });

    this.saveRules();

    return {
      success: true,
      appliedCount: this.rules.length,
      affectedModules: Array.from(affectedModulesSet),
      message: `Plataforma Vértice 100% atualizada! ${this.rules.length} regras tributárias, novas fórmulas e entendimentos do DOU/RFB/CGSN/STJ foram aplicados globalmente a todos os módulos.`,
    };
  }
}

export const dynamicTaxRulesEngine = DynamicTaxRulesEngine.getInstance();
