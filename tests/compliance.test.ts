import { verificarDivergenciaCFOP, avaliarStatusCancelamento, identificarSubstituicaoTributaria, identificarMonofasico } from '../src/services/complianceEngine';

describe('Compliance Fiscal Vértice', () => {
  test('Deve alertar CFOP interestadual em operação interna', () => {
    const nota = { municipioEmitente: '3550308', municipioDestinatario: '3550308', cfopPrincipal: '6102' };
    expect(verificarDivergenciaCFOP(nota).temDivergencia).toBe(true);
  });

  test('Deve aprovar CFOP correto em operação interna', () => {
    const nota = { municipioEmitente: '3550308', municipioDestinatario: '3550308', cfopPrincipal: '5102' };
    expect(verificarDivergenciaCFOP(nota).temDivergencia).toBe(false);
  });

  test('Deve alertar CFOP interno em operação interestadual', () => {
    const nota = { ufEmitente: 'SP', ufDestinatario: 'RJ', cfopPrincipal: '5102' };
    expect(verificarDivergenciaCFOP(nota).temDivergencia).toBe(true);
  });

  test('Deve detectar cancelamento posterior na SEFAZ', () => {
    expect(avaliarStatusCancelamento('AUTORIZADA', '110111').novoStatus).toBe('CANCELADA');
    expect(avaliarStatusCancelamento('AUTORIZADA', '110111').dispararAlertaCritico).toBe(true);
  });

  test('Deve identificar operação com ICMS-ST', () => {
    expect(identificarSubstituicaoTributaria('5405')).toBe(true);
    expect(identificarSubstituicaoTributaria('5102')).toBe(false);
  });

  test('Deve identificar produtos monofásicos de PIS/COFINS por NCM', () => {
    expect(identificarMonofasico('3004.90.99')).toBe(true); // Fármaco
    expect(identificarMonofasico('8471.50.10')).toBe(false); // Computador
  });
});
