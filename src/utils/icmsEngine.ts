import { BRAZILIAN_STATES_ICMS, StateIcmsDefinition } from './taxRules';
import { NCMTaxData } from '../types';

export interface DynamicIcmsResult {
  originUF: string;
  destinationUF: string;
  tipoOperacao: 'nacional_interna' | 'nacional_interestadual' | 'importacao' | 'exportacao';
  isImportedProduct: boolean; // FCI > 40%
  internalRateOrigin: number;
  internalRateDestination: number;
  fcpRateDestination: number;
  effectiveInternalRateDestination: number; // alíquota modal interna + FCP
  interstateRate: number; // 4%, 7%, 12%, 0% ou interna
  difalRate: number;
  isDifalApplicable: boolean;
  legalBasis: string;
  explanation: string;
  resolutionSenate: 'Res. 22/89 (7%)' | 'Res. 22/89 (12%)' | 'Res. 13/2012 (4% Importado)' | 'Operação Interna' | 'Exportação (0%)' | 'Importação Direta';
}

/**
 * MOTOR DE CORREÇÃO AUTOMÁTICA DE ICMS INTERNO E INTERESTADUAL (2026/2027)
 * Cobre as alíquotas modais de todas as 27 UFs do Brasil e regras do Senado Federal.
 */
export function calculateDynamicIcms(params: {
  originUF: string;
  destinationUF: string;
  tipoOperacao?: 'nacional_interna' | 'nacional_interestadual' | 'importacao' | 'exportacao';
  isImportedProduct?: boolean;
}): DynamicIcmsResult {
  const originUF = (params.originUF || 'SP').toUpperCase().trim();
  const destinationUF = (params.destinationUF || 'SP').toUpperCase().trim();
  const isImportedProduct = !!params.isImportedProduct;

  let tipoOperacao = params.tipoOperacao;
  if (!tipoOperacao) {
    if (originUF === 'EXTERIOR') tipoOperacao = 'importacao';
    else if (destinationUF === 'EXTERIOR') tipoOperacao = 'exportacao';
    else if (originUF === destinationUF) tipoOperacao = 'nacional_interna';
    else tipoOperacao = 'nacional_interestadual';
  }

  const originDef: StateIcmsDefinition = BRAZILIAN_STATES_ICMS[originUF] || { 
    name: originUF, 
    region: 'Sudeste', 
    standardIcmsRate: 18.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da subcontratada',
    hasPresumedCreditConv106: true,
    notes: ''
  };

  const destDef: StateIcmsDefinition = BRAZILIAN_STATES_ICMS[destinationUF] || { 
    name: destinationUF, 
    region: 'Sudeste', 
    standardIcmsRate: 18.0, 
    fcpRate: 0, 
    defaultIssRate: 3.5,
    subcontractLegalBasis: 'Convênio ICMS 25/90',
    subcontractTreatment: 'Dispensa da subcontratada',
    hasPresumedCreditConv106: true,
    notes: ''
  };

  const internalRateOrigin = originDef.standardIcmsRate;
  const internalRateDestination = destDef.standardIcmsRate;
  const fcpRateDestination = destDef.fcpRate || 0;
  const effectiveInternalRateDestination = +(internalRateDestination + fcpRateDestination).toFixed(2);

  let interstateRate = 12.0;
  let legalBasis = '';
  let explanation = '';
  let resolutionSenate: DynamicIcmsResult['resolutionSenate'] = 'Res. 22/89 (12%)';

  if (tipoOperacao === 'exportacao') {
    interstateRate = 0;
    resolutionSenate = 'Exportação (0%)';
    legalBasis = 'CF/88, Art. 155, § 2º, X, "a" (Imunidade Constitucional do ICMS na Exportação)';
    explanation = `Operação de exportação para o exterior desonerada (alíquota 0%).`;
  } else if (tipoOperacao === 'importacao') {
    interstateRate = effectiveInternalRateDestination;
    resolutionSenate = 'Importação Direta';
    legalBasis = `RICMS/${destinationUF} - Alíquota Interna de Desembaraço/Entrada de Importação`;
    explanation = `Importação direta do exterior tributada pela alíquota interna de ${destinationUF} (${effectiveInternalRateDestination}%).`;
  } else if (tipoOperacao === 'nacional_interna') {
    interstateRate = effectiveInternalRateDestination;
    resolutionSenate = 'Operação Interna';
    legalBasis = `RICMS/${destinationUF} - Alíquota Modal Interna da UF`;
    explanation = `Operação interna em ${destinationUF} tributada à alíquota de ${effectiveInternalRateDestination}% (${internalRateDestination}% + ${fcpRateDestination}% FCP).`;
  } else {
    // Operação Interestadual entre Estados Brasileiros
    if (isImportedProduct) {
      interstateRate = 4.0;
      resolutionSenate = 'Res. 13/2012 (4% Importado)';
      legalBasis = 'Resolução do Senado Federal nº 13/2012 (Alíquota 4.0% em Bens com FCI > 40%)';
      explanation = `Produto importado do exterior ou com Conteúdo de Importação superior a 40% sujeito à alíquota unificada de 4.0% na saída interestadual.`;
    } else {
      const southSoutheast = ['SP', 'MG', 'RJ', 'PR', 'SC', 'RS'];
      const isOriginSouthSE = southSoutheast.includes(originUF);
      const isDestNorthNECOES = ['AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO'].includes(destinationUF);

      if (isOriginSouthSE && isDestNorthNECOES) {
        interstateRate = 7.0;
        resolutionSenate = 'Res. 22/89 (7%)';
        legalBasis = 'Resolução do Senado Federal nº 22/1989 (Sul/Sudeste exceto ES para N/NE/CO/ES = 7.0%)';
        explanation = `Origem em ${originUF} (${originDef.region}) com destino a ${destinationUF} (${destDef.region}) aplica a alíquota interestadual de 7.0%.`;
      } else {
        interstateRate = 12.0;
        resolutionSenate = 'Res. 22/89 (12%)';
        legalBasis = 'Resolução do Senado Federal nº 22/1989 (Alíquota Interestadual Padrão = 12.0%)';
        explanation = `Saída de ${originUF} (${originDef.region}) para ${destinationUF} (${destDef.region}) aplica a alíquota interestadual padrão de 12.0%.`;
      }
    }
  }

  const difalRate = Math.max(0, +(effectiveInternalRateDestination - interstateRate).toFixed(2));
  const isDifalApplicable = tipoOperacao === 'nacional_interestadual' && difalRate > 0;

  return {
    originUF,
    destinationUF,
    tipoOperacao,
    isImportedProduct,
    internalRateOrigin,
    internalRateDestination,
    fcpRateDestination,
    effectiveInternalRateDestination,
    interstateRate,
    difalRate,
    isDifalApplicable,
    legalBasis,
    explanation,
    resolutionSenate,
  };
}

/**
 * Recalcula a MVA Ajustada para o ICMS-ST com base na alíquota interestadual e interna de destino atualizadas.
 * Fórmula Oficial Convênio ICMS 142/2018:
 * MVA Ajustada (%) = [ ( (1 + MVA Original) * (1 - Alíquota Interestadual) ) / (1 - Alíquota Interna Destino) ] - 1
 */
export function calculateAdjustedMva(mvaOriginal: number, interstateRate: number, internalRateDest: number): number {
  if (!mvaOriginal || mvaOriginal <= 0) return 0;
  const mvaDec = mvaOriginal / 100;
  const interDec = interstateRate / 100;
  const intDec = internalRateDest / 100;

  if (intDec >= 1) return mvaOriginal;

  const adjustedDec = ((1 + mvaDec) * (1 - interDec)) / (1 - intDec) - 1;
  return Math.max(mvaOriginal, +(adjustedDec * 100).toFixed(2));
}

/**
 * Robô Corretor Automático de Alíquotas e Matriz de Tributação do NCM para qualquer UF selecionada.
 * Atualiza automaticamente a alíquota interna, DIFAL e MVAs ST daquele NCM na UF de destino.
 */
export function autoCorrectNCMForOperation(params: {
  ncmData: NCMTaxData;
  originUF: string;
  destinationUF: string;
  tipoOperacao?: 'nacional_interna' | 'nacional_interestadual' | 'importacao' | 'exportacao';
  isImportedProduct?: boolean;
}): NCMTaxData {
  const { ncmData, originUF, destinationUF, isImportedProduct = false } = params;

  const icmsAnalysis = calculateDynamicIcms({
    originUF,
    destinationUF,
    tipoOperacao: params.tipoOperacao,
    isImportedProduct,
  });

  const correctedNCM: NCMTaxData = JSON.parse(JSON.stringify(ncmData));

  // Aplica correção automática de alíquota interna e DIFAL da UF Destino
  correctedNCM.icmsInternalRate = icmsAnalysis.effectiveInternalRateDestination;
  correctedNCM.difalRate = icmsAnalysis.difalRate;

  // Ajusta MVAs de ST caso a mercadoria esteja no regime de Substituição Tributária
  if (correctedNCM.icmsST && correctedNCM.mvaOriginal) {
    correctedNCM.mvaAjustada4 = calculateAdjustedMva(correctedNCM.mvaOriginal, 4.0, icmsAnalysis.effectiveInternalRateDestination);
    correctedNCM.mvaAjustada12 = calculateAdjustedMva(correctedNCM.mvaOriginal, 12.0, icmsAnalysis.effectiveInternalRateDestination);
  }

  // Atualiza fundamentação legal do ICMS com a alíquota corrigida da UF
  correctedNCM.icmsLegalBase = `RICMS/${destinationUF} (${icmsAnalysis.effectiveInternalRateDestination}% Interno) c/c ${icmsAnalysis.legalBasis}`;

  return correctedNCM;
}
