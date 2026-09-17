import { parsePGDASText } from './src/utils/pdfParser';

const sample = `1. Identificação do Contribuinte
CNPJ Matriz: 23.277.116/0001-78
Nome empresarial: C.L. ODONTOLOGIA S/S LTDA
Data de abertura no CNPJ: 25/08/2015
Optante pelo Simples Nacional: Sim
Regime de Apuração: Competência
Nº da Declaração: 23277116202607001
1.1 CNPJ das filiais presentes nesta declaração:
Nenhuma
.
2.Apuração do Simples Nacional
2.1 Discriminativo de Receitas
Total de Receitas Brutas (R$) Mercado Interno Mercado Externo Total
Receita Bruta do PA (RPA) - Competência 0,00 0,00 0,00
Receita bruta acumulada nos doze meses anteriores
ao PA (RBT12) 1.450,00 0,00 1.450,00
Receita bruta acumulada nos doze meses anteriores
ao PA proporcionalizada (RBT12p)
Receita bruta acumulada no ano-calendário corrente
(RBA) 1.450,00 0,00 1.450,00
Receita bruta acumulada no ano-calendário anterior
(RBAA) 9.010,00 0,00 9.010,00
Limite de receita bruta proporcionalizado 4.800.000,00 4.800.000,00
2.2) Receitas Brutas Anteriores (R$)
2.2.1) Mercado Interno
01/2025 0,00 02/2025 3.710,00 03/2025 800,00 04/2025 2.700,00
05/2025 1.800,00 06/2025 0,00 07/2025 0,00 08/2025 0,00
09/2025 0,00 10/2025 0,00 11/2025 0,00 12/2025 0,00
01/2026 0,00 02/2026 0,00 03/2026 0,00 04/2026 0,00
05/2026 0,00 06/2026 1.450,00
2.2.2) Mercado Externo
01/2025 0,00 02/2025 0,00 03/2025 0,00 04/2025 0,00
05/2025 0,00 06/2025 0,00 07/2025 0,00 08/2025 0,00
09/2025 0,00 10/2025 0,00 11/2025 0,00 12/2025 0,00
01/2026 0,00 02/2026 0,00 03/2026 0,00 04/2026 0,00
05/2026 0,00 06/2026 0,00
2.3) Folha de Salários Anteriores (R$)
Nenhuma
2.4) Fator r
Fator r = Não se aplica
2.5) Valores Fixos
Não se aplica
Número da Declaração: 23277116202607001 Número do Recibo: 01.07.26215.0279398-4
Autenticação: 23264.27699.71129.16113 Página 1
2.6) Resumo da Declaração
Receita Bruta Auferida (regime competência) Valor Total do Débito Declarado (R$)
0,00 0,00
2.7) Informações da Declaração por Estabelecimento
CNPJ Estabelecimento: 23.277.116/0001-78
Município: COLOMBO UF: PR
Sublimite de Receita Anual (R$): 3.600.000,00 Impedido de recolher ICMS/ISS no DAS: Não
Nenhuma atividade selecionada
2.8) Total Geral da Empresa
Total do Débito Declarado (exigível + suspenso) (R$)
IRPJ CSLL COFINS PIS/Pasep INSS/CPP ICMS IPI ISS Total
0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00
Total do Débito com Exigibilidade Suspensa (R$)
IRPJ CSLL COFINS PIS/Pasep INSS/CPP ICMS IPI ISS Total
0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00
Total do Débito Exigível (R$)
IRPJ CSLL COFINS PIS/Pasep INSS/CPP ICMS IPI ISS Total
0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00 0,00
.
3. Informações da Recepção da Declaração
Data e horário da transmissão da Declaração: 03/08/2026 15:58:24
Número do Recibo: 01.07.26215.0279398-4
Autenticação: 23264.27699.71129.16113`;

const result = parsePGDASText(sample);
console.log("RESULT:", JSON.stringify(result, null, 2));
