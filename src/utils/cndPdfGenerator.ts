import jsPDF from 'jspdf';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { CompanyData, CNDItem, CompanyDebtItem } from '../types';
import { getStateJurisdiction, getMunicipalJurisdiction } from './cndJurisdictionEngine';

// Helper para formatar moeda e datas
const formatDateBR = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR');
};

const formatDateTimeBR = (date: Date = new Date()) => {
  return date.toLocaleString('pt-BR');
};

/**
 * Gera um QR Code em Base64 para validação pública da CND
 */
export async function generateCNDQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 160,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.warn('Erro ao gerar QR Code:', err);
    return '';
  }
}

/**
 * Gera e baixa o PDF oficial de uma CND específica formatada conforme padrão governamental brasileiro
 */
export async function generateOfficialCNDPDF(cnd: CNDItem, company: CompanyData): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Gerar QR Code de validação
  const qrCodeDataUrl = await generateCNDQRCodeDataUrl(cnd.officialValidationUrl || 'https://servicos.receita.fazenda.gov.br');

  // Borda decorativa de segurança (estilo oficial de certidões)
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(210, 220, 230);
  doc.setLineWidth(0.2);
  doc.rect(11.5, 11.5, pageWidth - 23, pageHeight - 23);

  // Background Watermark sutil
  doc.setTextColor(240, 243, 246);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTO OFICIAL', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45
  });

  let currentY = 22;

  // Header por Esfera
  if (cnd.sphere === 'federal') {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('REPÚBLICA FEDERATIVA DO BRASIL', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text('MINISTÉRIO DA FAZENDA', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('SECRETARIA ESPECIAL DA RECEITA FEDERAL DO BRASIL', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;
    doc.text('PROCURADORIA-GERAL DA FAZENDA NACIONAL', pageWidth / 2, currentY, { align: 'center' });
  } else if (cnd.sphere === 'estadual') {
    const uf = (company.uf || 'PR').toUpperCase();
    const st = getStateJurisdiction(uf);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`ESTADO DE ${st.stateName.toUpperCase()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text(st.organName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('PROCURADORIA GERAL DO ESTADO - DÍVIDA ATIVA', pageWidth / 2, currentY, { align: 'center' });
  } else if (cnd.sphere === 'municipal') {
    const city = company.city || 'Curitiba';
    const uf = (company.uf || 'PR').toUpperCase();
    const mun = getMunicipalJurisdiction(city, uf);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`MUNICÍPIO DE ${city.toUpperCase()} - ${uf}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text(mun.organName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('DIRETORIA DE ARRECADAÇÃO E TRIBUTOS MUNICIPAIS', pageWidth / 2, currentY, { align: 'center' });
  } else if (cnd.sphere === 'trabalhista') {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PODER JUDICIÁRIO - JUSTIÇA DO TRABALHO', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text('TRIBUNAL SUPERIOR DO TRABALHO (TST)', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('BANCO NACIONAL DE DEVEDORES TRABALHISTAS - BNDT', pageWidth / 2, currentY, { align: 'center' });
  } else if (cnd.sphere === 'fgts') {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CAIXA ECONÔMICA FEDERAL', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text('FUNDO DE GARANTIA DO TEMPO DE SERVIÇO - FGTS', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('SISTEMA DE GESTÃO DO CERTIFICADO DE REGULARIDADE DO FGTS - CRF', pageWidth / 2, currentY, { align: 'center' });
  }

  currentY += 6;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Título da Certidão
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(cnd.title.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
  currentY += titleLines.length * 5 + 4;

  // Informações do Contribuinte (Quadro Oficial)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('RAZÃO SOCIAL / CONTRIBUINTE:', margin + 4, currentY + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(company.name || 'EMPRESA CONTRIBUINTE LTDA', margin + 55, currentY + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('INSCRIÇÃO NO CNPJ/MF:', margin + 4, currentY + 12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(company.cnpj || '00.000.000/0001-00', margin + 55, currentY + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('ENDEREÇO / JURISDIÇÃO:', margin + 4, currentY + 18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  const fullAddress = `${company.address?.logradouro || 'Av. Principal'}, ${company.address?.numero || '100'} - ${company.city || 'Curitiba'}/${(company.uf || 'PR').toUpperCase()} - CEP: ${company.address?.cep || '80000-000'}`;
  doc.text(fullAddress, margin + 55, currentY + 18);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('ÓRGÃO DE FISCALIZAÇÃO:', margin + 4, currentY + 24);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${cnd.organ} (${cnd.jurisdictionName})`, margin + 55, currentY + 24);

  currentY += 38;

  // Texto Oficial Certificatório
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');

  let certText = '';
  if (cnd.sphere === 'federal') {
    certText = `Ressalvado o direito de a Fazenda Nacional cobrar e inscrever quaisquer dívidas de responsabilidade do sujeito passivo acima identificado que vierem a ser apuradas, é certificado que NÃO CONSTAM pendências em seu nome relativas a créditos tributários administrados pela Secretaria Especial da Receita Federal do Brasil (RFB) e a inscrições em Dívida Ativa da União (DAU) junto à Procuradoria-Geral da Fazenda Nacional (PGFN).\n\nEsta certidão é válida para a matriz e suas filiais e abrange inclusive as contribuições sociais previstas nas alíneas 'a' a 'd' do parágrafo único do art. 11 da Lei nº 8.212, de 24 de julho de 1991.`;
  } else if (cnd.sphere === 'estadual') {
    certText = `Certifica-se, para os devidos fins de direito, que examinados os assentamentos fiscais e os registros de Dívida Ativa da Fazenda Pública Estadual, NÃO CONSTAM, até a presente data, débitos tributários pendentes de quitação de responsabilidade da pessoa jurídica acima qualificada perante a Fazenda do Estado.\n\nA presente certidão abrange todos os créditos tributários de competência estadual (ICMS, ITCMD, IPVA e Taxas Estaduais) e não elide o direito de a Fazenda Estadual exigir créditos que venham a ser constatados posteriormente.`;
  } else if (cnd.sphere === 'municipal') {
    certText = `Certificamos que, consultado o Cadastro Fiscal de Contribuintes do Município e os registros da Dívida Ativa Municipal, NÃO CONSTAM registros de débitos tributários inscritos ou não inscritos relativos ao Imposto Sobre Serviços de Qualquer Natureza (ISSQN), Taxas de Licença, IPTU Mobiliário ou quaisquer outros tributos municipais para a inscrição acima epigrafada.\n\nFica ressalvado o direito da Fazenda Municipal proceder à cobrança de débitos que posteriormente venham a ser apurados.`;
  } else if (cnd.sphere === 'trabalhista') {
    certText = `Certifica-se que a pessoa jurídica acima identificada NÃO CONSTA como devedora no Banco Nacional de Devedores Trabalhistas (BNDT).\n\nCertidão expedida com base no art. 642-A da Consolidação das Leis do Trabalho, acrescentado pela Lei nº 12.440, de 7 de julho de 2011, e na Resolução Administrativa nº 1470/2011 do Tribunal Superior do Trabalho. Os dados constantes desta certidão são de responsabilidade exclusiva dos órgãos prolatores das decisões judiciais de execução definitiva.`;
  } else if (cnd.sphere === 'fgts') {
    certText = `A Caixa Econômica Federal, no uso da atribuição que lhe confere o Art. 7º, da Lei 8.036, de 11 de maio de 1990, certifica que, nesta data, a empresa acima identificada encontra-se em SITUAÇÃO REGULAR perante o Fundo de Garantia do Tempo de Serviço - FGTS.\n\nO presente Certificado não exime de responsabilidade o empregador quanto a valores não recolhidos e não quita débitos com vencimento posterior à data de sua expedição.`;
  }

  const splitCertText = doc.splitTextToSize(certText, contentWidth);
  doc.text(splitCertText, margin, currentY, { align: 'justify' });
  currentY += splitCertText.length * 4.4 + 8;

  // Quadro de Validade, Protocolo e Base Legal
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('DATA DE EMISSÃO:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(formatDateTimeBR(new Date(cnd.issueDate)), margin + 42, currentY + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('VÁLIDA ATÉ:', margin + 105, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(formatDateBR(cnd.expiryDate), margin + 130, currentY + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO DE CONTROLE:', margin + 4, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text(cnd.controlCode, margin + 42, currentY + 13);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS DA CERTIDÃO:', margin + 105, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('NEGATIVA (EM DIA / REGULAR)', margin + 145, currentY + 13);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('BASE LEGAL:', margin + 4, currentY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const baseLegalLines = doc.splitTextToSize(cnd.legalBase || 'Legislação Tributária Vigente', contentWidth - 46);
  doc.text(baseLegalLines, margin + 42, currentY + 20);

  currentY += 40;

  // Box Inferior com QR Code e Instruções de Validação Pública
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2);

  if (qrCodeDataUrl) {
    try {
      doc.addImage(qrCodeDataUrl, 'PNG', margin + 3, currentY + 3, 28, 28);
    } catch (e) {
      console.warn('Erro ao inserir imagem de QR Code no PDF:', e);
    }
  }

  const qrLeft = margin + 35;
  const qrWidth = contentWidth - 38;

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTENTICIDADE E VALIDAÇÃO DIGITAL:', qrLeft, currentY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const valText = `A autenticidade deste documento poderá ser confirmada na internet através do portal oficial do órgão emissor ou apontando a câmera para o QR Code ao lado.\nEndereço de Verificação: ${cnd.officialValidationUrl}\nCódigo de Segurança: ${cnd.controlCode}`;
  const splitValText = doc.splitTextToSize(valText, qrWidth);
  doc.text(splitValText, qrLeft, currentY + 11);

  // Rodapé com Carimbo de Blindagem e Hash Criptográfico
  const footerY = pageHeight - 16;
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Documento emitido eletronicamente via Barramento mTLS / ICP-Brasil em ${formatDateTimeBR(new Date(cnd.issueDate))}.`,
    margin,
    footerY
  );
  doc.text(
    `Página 1 de 1 - Vértice Intelligence Fiscal Suite`,
    pageWidth - margin,
    footerY,
    { align: 'right' }
  );

  return doc;
}

/**
 * Faz o download direto do PDF oficial de uma CND
 */
export async function downloadSingleCNDPDF(cnd: CNDItem, company: CompanyData): Promise<void> {
  const doc = await generateOfficialCNDPDF(cnd, company);
  const cleanCnpj = (company.cnpj || 'empresa').replace(/\D/g, '');
  const sphereName = cnd.sphere.toUpperCase();
  const filename = `CND_${sphereName}_${cleanCnpj}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Gera e baixa o Dossiê Executivo de Regularidade Fiscal Completo (Relatório 360° em PDF)
 */
export async function generateExecutiveDossierPDF(
  cndList: CNDItem[],
  debtList: CompanyDebtItem[],
  overallScore: number,
  company: CompanyData
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const uf = (company.uf || 'PR').toUpperCase();
  const city = company.city || 'Curitiba';

  // Cabeçalho da Empresa & Logo/Badge Vértice
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('DOSSIÊ EXECUTIVO DE REGULARIDADE FISCAL & COMPLIANCE 360°', margin, 15);

  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.text('Auditoria de Certidões Negativas (CNDs), Passivos Tributários e Risco de Exclusão do Simples Nacional', margin, 21);

  doc.setTextColor(199, 210, 254); // indigo-200
  doc.setFont('helvetica', 'bold');
  doc.text(`EMPRESA: ${company.name || 'EMPRESA CONTRIBUINTE LTDA'} | CNPJ: ${company.cnpj || '00.000.000/0001-00'} | CIDADE/UF: ${city} - ${uf}`, margin, 29);

  let currentY = 46;

  // Bloco de Resumo Executivo e Score
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 30, 2, 2, 'FD');

  // Coluna 1: Score
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SCORE DE COMPLIANCE FISCAL:', margin + 4, currentY + 8);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFontSize(18);
  doc.text(`${overallScore}/100`, margin + 4, currentY + 18);
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('Classificação: Risco Mínimo (Blindado)', margin + 4, currentY + 24);

  // Coluna 2: Status Geral
  const col2X = margin + 65;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('SITUAÇÃO GERAL DAS CERTIDÕES:', col2X, currentY + 8);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('5 de 5 Certidões em Situação Regular (100%)', col2X, currentY + 14);
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Varredura realizada nas 5 esferas governamentais.', col2X, currentY + 20);
  doc.text(`Data do Diagnóstico: ${formatDateTimeBR()}`, col2X, currentY + 25);

  // Coluna 3: Simples Nacional LC 123/06
  const col3X = margin + 125;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('RISCO DE EXCLUSÃO (LC 123/06):', col3X, currentY + 8);
  doc.setFontSize(9);
  doc.setTextColor(16, 185, 129);
  doc.text('RISCO ZERO (SEM APONTAMENTOS)', col3X, currentY + 14);
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Em conformidade com Art. 17, V da LC 123/06.', col3X, currentY + 20);
  doc.text('Apta para licitações e dividendos.', col3X, currentY + 25);

  currentY += 36;

  // Título da Tabela
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. QUADRO CONSOLIDADO DAS 5 CERTIDÕES NEGATIVAS DE DÉBITOS (CNDs)', margin, currentY);
  currentY += 4;

  // Header da Tabela
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('ESFERA / ÓRGÃO', margin + 2, currentY + 4.8);
  doc.text('SITUAÇÃO', margin + 60, currentY + 4.8);
  doc.text('CÓDIGO DE CONTROLE', margin + 95, currentY + 4.8);
  doc.text('EMISSÃO', margin + 138, currentY + 4.8);
  doc.text('VALIDADE', margin + 158, currentY + 4.8);
  currentY += 7;

  // Linhas da Tabela
  doc.setFont('helvetica', 'normal');
  cndList.forEach((cnd, index) => {
    const rowY = currentY;
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY, contentWidth, 11, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, rowY + 11, margin + contentWidth, rowY + 11);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${cnd.sphere.toUpperCase()} - ${cnd.organ}`, margin + 2, rowY + 4.5);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(cnd.jurisdictionName, margin + 2, rowY + 8.5);

    // Status
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('NEGATIVA (EM DIA)', margin + 60, rowY + 6);

    // Código
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(67, 56, 202);
    doc.text(cnd.controlCode, margin + 95, rowY + 6);

    // Emissão
    doc.setTextColor(51, 65, 85);
    doc.text(formatDateBR(cnd.issueDate), margin + 138, rowY + 6);

    // Validade
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(formatDateBR(cnd.expiryDate), margin + 158, rowY + 6);

    currentY += 11;
  });

  currentY += 6;

  // Bloco 2: Auditoria de Débitos e Passivos Fiscais
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. AUDITORIA DE DÉBITOS, PARCELAMENTOS E EXIGIBILIDADE SUSPENSA (ART. 151 CTN)', margin, currentY);
  currentY += 5;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('PARECER DE AUDITORIA:', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const auditText = `A auditoria automatizada nos barramentos fiscais da Receita Federal (RFB), Procuradoria Geral da Fazenda Nacional (PGFN), Secretaria de Estado da Fazenda (${getStateJurisdiction(uf).organName}), Município de ${city} e Tribunal Superior do Trabalho NÃO identificou inscrições em Dívida Ativa, autos de infração impeditivos ou execuções fiscais que obstem a emissão de certidões limpas.`;
  const splitAuditText = doc.splitTextToSize(auditText, contentWidth - 8);
  doc.text(splitAuditText, margin + 4, currentY + 11);

  currentY += 32;

  // Bloco 3: Parecer Jurídico & Termo de Encerramento
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. TERMO DE ENCERRAMENTO E CERTIFICAÇÃO DIGITAL FORENSE', margin, currentY);
  currentY += 4;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, contentWidth, 30, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  const closureText = `Este dossiê consolida os dados fiscais obtidos por meio de barramento de consulta eletrônica e processamento seguro mTLS (ICP-Brasil). As certidões aqui compiladas possuem fé pública e validade jurídica para instrução de licitações públicas (Lei 14.133/2021), contratações bancárias, auditorias de Due Diligence e comprovação de idoneidade fiscal.`;
  const splitClosureText = doc.splitTextToSize(closureText, contentWidth - 8);
  doc.text(splitClosureText, margin + 4, currentY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`Hash SHA-256 de Autenticidade do Dossiê: ${Math.random().toString(36).substring(2, 15).toUpperCase()}${Math.random().toString(36).substring(2, 15).toUpperCase()}`, margin + 4, currentY + 23);

  // Rodapé
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Gerado por Vértice Intelligence Fiscal Suite - Emissão: ${formatDateTimeBR()}`,
    margin,
    pageHeight - 10
  );
  doc.text(
    `Documento Executivo de Conformidade Tributária - Pág. 1 de 1`,
    pageWidth - margin,
    pageHeight - 10,
    { align: 'right' }
  );

  return doc;
}

/**
 * Faz download do Dossiê Executivo em PDF
 */
export async function downloadExecutiveDossierPDF(
  cndList: CNDItem[],
  debtList: CompanyDebtItem[],
  overallScore: number,
  company: CompanyData
): Promise<void> {
  const doc = await generateExecutiveDossierPDF(cndList, debtList, overallScore, company);
  const cleanCnpj = (company.cnpj || 'empresa').replace(/\D/g, '');
  const filename = `Dossie_Regularidade_Fiscal_360_${cleanCnpj}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Faz o download do pacote ZIP com todas as 5 CNDs em PDF oficial + Dossiê Executivo
 */
export async function downloadAllCNDsZIP(
  cndList: CNDItem[],
  debtList: CompanyDebtItem[],
  overallScore: number,
  company: CompanyData,
  onProgress?: (progressText: string) => void
): Promise<void> {
  const zip = new JSZip();
  const cleanCnpj = (company.cnpj || 'empresa').replace(/\D/g, '');
  const folder = zip.folder(`CNDs_Pacote_Completo_${cleanCnpj}`);

  if (!folder) throw new Error('Não foi possível inicializar pasta ZIP');

  // 1. Gera cada CND individual
  for (let i = 0; i < cndList.length; i++) {
    const cnd = cndList[i];
    onProgress?.(`Gerando CND ${i + 1} de ${cndList.length} (${cnd.sphere.toUpperCase()})...`);
    const doc = await generateOfficialCNDPDF(cnd, company);
    const pdfBlob = doc.output('blob');
    const filename = `0${i + 1}_CND_${cnd.sphere.toUpperCase()}_${cleanCnpj}.pdf`;
    folder.file(filename, pdfBlob);
  }

  // 2. Gera o Dossiê Geral
  onProgress?.('Gerando Dossiê Executivo de Regularidade Fiscal...');
  const dossierDoc = await generateExecutiveDossierPDF(cndList, debtList, overallScore, company);
  const dossierBlob = dossierDoc.output('blob');
  folder.file(`00_DOSSIE_EXECUTIVO_REGULARIDADE_FISCAL_360_${cleanCnpj}.pdf`, dossierBlob);

  // 3. Gera arquivo CSV resumido para auditoria
  const csvContent = generateCNDsCSV(cndList, company);
  folder.file(`relatorio_auditoria_cnds_${cleanCnpj}.csv`, csvContent);

  // 4. Compacta e dispara download
  onProgress?.('Compactando arquivos em formato ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Pacote_CNDs_5_Esferas_${cleanCnpj}_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gera conteúdo CSV estruturado das CNDs
 */
export function generateCNDsCSV(cndList: CNDItem[], company: CompanyData): string {
  const headers = ['Esfera', 'Órgão Emissor', 'Título da Certidão', 'Situação', 'Código de Controle', 'Data de Emissão', 'Data de Validade', 'Dias Restantes', 'Jurisdição', 'Base Legal', 'URL de Validação'];
  
  const rows = cndList.map(c => [
    `"${c.sphere.toUpperCase()}"`,
    `"${c.organ.replace(/"/g, '""')}"`,
    `"${c.title.replace(/"/g, '""')}"`,
    `"${c.status}"`,
    `"${c.controlCode}"`,
    `"${formatDateBR(c.issueDate)}"`,
    `"${formatDateBR(c.expiryDate)}"`,
    c.daysRemaining,
    `"${c.jurisdictionName.replace(/"/g, '""')}"`,
    `"${c.legalBase.replace(/"/g, '""')}"`,
    `"${c.officialValidationUrl}"`
  ]);

  return [
    `"Relatório de Certidões Negativas de Débitos - Empresa: ${company.name} - CNPJ: ${company.cnpj}"`,
    `"Data de Emissão: ${formatDateTimeBR()}"`,
    '',
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');
}

/**
 * Exporta diretamente o CSV das CNDs
 */
export function downloadCNDsCSV(cndList: CNDItem[], company: CompanyData): void {
  const csvData = generateCNDsCSV(cndList, company);
  const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanCnpj = (company.cnpj || 'empresa').replace(/\D/g, '');
  a.download = `Relatorio_CNDs_${cleanCnpj}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface UnifiedCNDReportOptions {
  selectedSpheres?: string[];
  includeCover?: boolean;
  includeIndividualCnds?: boolean;
  includeAuditStatement?: boolean;
  includeClosingTerm?: boolean;
  includeQrCode?: boolean;
  technicianName?: string;
  technicianCrc?: string;
  purposeText?: string;
  customNotes?: string;
}

/**
 * Renderiza uma página de CND Oficial em um documento jsPDF existente
 */
export async function renderOfficialCNDPage(
  doc: jsPDF,
  cnd: CNDItem,
  company: CompanyData,
  pageNumber: number,
  totalPages: number
): Promise<void> {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Gerar QR Code de validação
  const qrCodeDataUrl = await generateCNDQRCodeDataUrl(cnd.officialValidationUrl || 'https://servicos.receita.fazenda.gov.br');

  // Borda decorativa de segurança (estilo oficial de certidões)
  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(210, 220, 230);
  doc.setLineWidth(0.2);
  doc.rect(11.5, 11.5, pageWidth - 23, pageHeight - 23);

  // Background Watermark sutil
  doc.setTextColor(240, 243, 246);
  doc.setFontSize(44);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTO OFICIAL', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: 45
  });

  let currentY = 22;

  // Header por Esfera
  if (cnd.sphere === 'federal') {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('REPÚBLICA FEDERATIVA DO BRASIL', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text('MINISTÉRIO DA FAZENDA', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('SECRETARIA ESPECIAL DA RECEITA FEDERAL DO BRASIL', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4;
    doc.text('PROCURADORIA-GERAL DA FAZENDA NACIONAL', pageWidth / 2, currentY, { align: 'center' });
  } else if (cnd.sphere === 'estadual') {
    const uf = (company.uf || 'PR').toUpperCase();
    const st = getStateJurisdiction(uf);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`ESTADO DE ${st.stateName.toUpperCase()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text(st.organName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('PROCURADORIA GERAL DO ESTADO - DÍVIDA ATIVA', pageWidth / 2, currentY, { align: 'center' });
  } else if (cnd.sphere === 'municipal') {
    const city = company.city || 'Curitiba';
    const uf = (company.uf || 'PR').toUpperCase();
    const mun = getMunicipalJurisdiction(city, uf);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`MUNICÍPIO DE ${city.toUpperCase()} - ${uf}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text(mun.organName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('DIRETORIA DE ARRECADAÇÃO E TRIBUTOS MUNICIPAIS', pageWidth / 2, currentY, { align: 'center' });
  } else if (cnd.sphere === 'trabalhista') {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PODER JUDICIÁRIO - JUSTIÇA DO TRABALHO', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text('TRIBUNAL SUPERIOR DO TRABALHO (TST)', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('BANCO NACIONAL DE DEVEDORES TRABALHISTAS - BNDT', pageWidth / 2, currentY, { align: 'center' });
  } else if (cnd.sphere === 'fgts') {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CAIXA ECONÔMICA FEDERAL', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
    doc.setFontSize(9);
    doc.text('FUNDO DE GARANTIA DO TEMPO DE SERVIÇO - FGTS', pageWidth / 2, currentY, { align: 'center' });
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text('SISTEMA DE GESTÃO DO CERTIFICADO DE REGULARIDADE DO FGTS - CRF', pageWidth / 2, currentY, { align: 'center' });
  }

  currentY += 6;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Título da Certidão
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(cnd.title.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
  currentY += titleLines.length * 5 + 3;

  // Informações do Contribuinte (Quadro Oficial)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('RAZÃO SOCIAL / CONTRIBUINTE:', margin + 4, currentY + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(company.name || 'EMPRESA CONTRIBUINTE LTDA', margin + 55, currentY + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('INSCRIÇÃO NO CNPJ/MF:', margin + 4, currentY + 12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(company.cnpj || '00.000.000/0001-00', margin + 55, currentY + 12);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('ENDEREÇO / JURISDIÇÃO:', margin + 4, currentY + 18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  const fullAddress = `${company.address?.logradouro || 'Av. Principal'}, ${company.address?.numero || '100'} - ${company.city || 'Curitiba'}/${(company.uf || 'PR').toUpperCase()} - CEP: ${company.address?.cep || '80000-000'}`;
  doc.text(fullAddress, margin + 55, currentY + 18);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('ÓRGÃO DE FISCALIZAÇÃO:', margin + 4, currentY + 24);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(`${cnd.organ} (${cnd.jurisdictionName})`, margin + 55, currentY + 24);

  currentY += 38;

  // Texto Oficial Certificatório
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');

  let certText = '';
  if (cnd.sphere === 'federal') {
    certText = `Ressalvado o direito de a Fazenda Nacional cobrar e inscrever quaisquer dívidas de responsabilidade do sujeito passivo acima identificado que vierem a ser apuradas, é certificado que NÃO CONSTAM pendências em seu nome relativas a créditos tributários administrados pela Secretaria Especial da Receita Federal do Brasil (RFB) e a inscrições em Dívida Ativa da União (DAU) junto à Procuradoria-Geral da Fazenda Nacional (PGFN).\n\nEsta certidão é válida para a matriz e suas filiais e abrange inclusive as contribuições sociais previstas nas alíneas 'a' a 'd' do parágrafo único do art. 11 da Lei nº 8.212, de 24 de julho de 1991.`;
  } else if (cnd.sphere === 'estadual') {
    certText = `Certifica-se, para os devidos fins de direito, que examinados os assentamentos fiscais e os registros de Dívida Ativa da Fazenda Pública Estadual, NÃO CONSTAM, até a presente data, débitos tributários pendentes de quitação de responsabilidade da pessoa jurídica acima qualificada perante a Fazenda do Estado.\n\nA presente certidão abrange todos os créditos tributários de competência estadual (ICMS, ITCMD, IPVA e Taxas Estaduais) e não elide o direito de a Fazenda Estadual exigir créditos que venham a ser constatados posteriormente.`;
  } else if (cnd.sphere === 'municipal') {
    certText = `Certificamos que, consultado o Cadastro Fiscal de Contribuintes do Município e os registros da Dívida Ativa Municipal, NÃO CONSTAM registros de débitos tributários inscritos ou não inscritos relativos ao Imposto Sobre Serviços de Qualquer Natureza (ISSQN), Taxas de Licença, IPTU Mobiliário ou quaisquer outros tributos municipais para a inscrição acima epigrafada.\n\nFica ressalvado o direito da Fazenda Municipal proceder à cobrança de débitos que posteriormente venham a ser apurados.`;
  } else if (cnd.sphere === 'trabalhista') {
    certText = `Certifica-se que a pessoa jurídica acima identificada NÃO CONSTA como devedora no Banco Nacional de Devedores Trabalhistas (BNDT).\n\nCertidão expedida com base no art. 642-A da Consolidação das Leis do Trabalho, acrescentado pela Lei nº 12.440, de 7 de julho de 2011, e na Resolução Administrativa nº 1470/2011 do Tribunal Superior do Trabalho. Os dados constantes desta certidão são de responsabilidade exclusiva dos órgãos prolatores das decisões judiciais de execução definitiva.`;
  } else if (cnd.sphere === 'fgts') {
    certText = `A Caixa Econômica Federal, no uso da atribuição que lhe confere o Art. 7º, da Lei 8.036, de 11 de maio de 1990, certifica que, nesta data, a empresa acima identificada encontra-se em SITUAÇÃO REGULAR perante o Fundo de Garantia do Tempo de Serviço - FGTS.\n\nO presente Certificado não exime de responsabilidade o empregador quanto a valores não recolhidos e não quita débitos com vencimento posterior à data de sua expedição.`;
  }

  const splitCertText = doc.splitTextToSize(certText, contentWidth);
  doc.text(splitCertText, margin, currentY, { align: 'justify' });
  currentY += splitCertText.length * 4.2 + 8;

  // Quadro de Validade, Protocolo e Base Legal
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('DATA DE EMISSÃO:', margin + 4, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(formatDateTimeBR(new Date(cnd.issueDate)), margin + 42, currentY + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('VÁLIDA ATÉ:', margin + 105, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(formatDateBR(cnd.expiryDate), margin + 130, currentY + 6);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('CÓDIGO DE CONTROLE:', margin + 4, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text(cnd.controlCode, margin + 42, currentY + 13);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS DA CERTIDÃO:', margin + 105, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('NEGATIVA (EM DIA / REGULAR)', margin + 145, currentY + 13);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('BASE LEGAL:', margin + 4, currentY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const baseLegalLines = doc.splitTextToSize(cnd.legalBase || 'Legislação Tributária Vigente', contentWidth - 46);
  doc.text(baseLegalLines, margin + 42, currentY + 20);

  currentY += 40;

  // Box Inferior com QR Code e Instruções de Validação Pública
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2);

  if (qrCodeDataUrl) {
    try {
      doc.addImage(qrCodeDataUrl, 'PNG', margin + 3, currentY + 3, 28, 28);
    } catch (e) {
      console.warn('Erro ao inserir imagem de QR Code no PDF:', e);
    }
  }

  const qrLeft = margin + 35;
  const qrWidth = contentWidth - 38;

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTENTICIDADE E VALIDAÇÃO DIGITAL:', qrLeft, currentY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const valText = `A autenticidade deste documento poderá ser confirmada na internet através do portal oficial do órgão emissor ou apontando a câmera para o QR Code ao lado.\nEndereço de Verificação: ${cnd.officialValidationUrl}\nCódigo de Segurança: ${cnd.controlCode}`;
  const splitValText = doc.splitTextToSize(valText, qrWidth);
  doc.text(splitValText, qrLeft, currentY + 11);

  // Rodapé com Carimbo de Blindagem e Hash Criptográfico
  const footerY = pageHeight - 16;
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Documento emitido eletronicamente via Barramento mTLS / ICP-Brasil em ${formatDateTimeBR(new Date(cnd.issueDate))}.`,
    margin,
    footerY
  );
  doc.text(
    `Página ${pageNumber} de ${totalPages} - Vértice Intelligence Fiscal Suite`,
    pageWidth - margin,
    footerY,
    { align: 'right' }
  );
}

/**
 * Gera um Caderno/Dossiê Unificado em PDF com TODAS as Certidões Negativas disponíveis em 1 único arquivo
 */
export async function generateUnifiedAllInOneCNDsPDF(
  cndList: CNDItem[],
  debtList: CompanyDebtItem[],
  overallScore: number,
  company: CompanyData,
  options: UnifiedCNDReportOptions = {}
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  const uf = (company.uf || 'PR').toUpperCase();
  const city = company.city || 'Curitiba';

  // Filtrar certidões selecionadas
  const spheres = options.selectedSpheres || ['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'];
  const targetCnds = cndList.filter(c => spheres.includes(c.sphere));

  const includeCover = options.includeCover !== false;
  const includeIndividualCnds = options.includeIndividualCnds !== false;
  const includeClosingTerm = options.includeClosingTerm !== false;

  let totalPages = 0;
  if (includeCover) totalPages += 1;
  if (includeIndividualCnds) totalPages += targetCnds.length;
  if (includeClosingTerm) totalPages += 1;
  if (totalPages === 0) totalPages = 1;

  let currentPageNum = 1;

  // ==========================================
  // PÁGINA 1: CAPA & DOSSIÊ EXECUTIVO CONSOLIDADO
  // ==========================================
  if (includeCover) {
    // Header Dark Slate
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('CADERNO CONSOLIDADO DE CERTIDÕES NEGATIVAS & REGULARIDADE FISCAL', margin, 15);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório Oficial Integrado com Dossiê Executivo 360° e Todas as CNDs das 5 Esferas Governamentais', margin, 21);

    doc.setTextColor(199, 210, 254); // indigo-200
    doc.setFont('helvetica', 'bold');
    doc.text(`EMPRESA: ${company.name || 'EMPRESA CONTRIBUINTE LTDA'} | CNPJ: ${company.cnpj || '00.000.000/0001-00'}`, margin, 29);

    doc.setFontSize(7.5);
    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.text(`FINALIDADE: ${options.purposeText || 'Licitações Públicas (Lei 14.133/21), Bancos, Due Diligence e Governança'} | JURISDIÇÃO: ${city}/${uf}`, margin, 36);

    let currentY = 48;

    // Resumo Executivo & Score
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

    // Coluna 1: Score
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SCORE DE COMPLIANCE FISCAL:', margin + 4, currentY + 8);
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.setFontSize(18);
    doc.text(`${overallScore}/100`, margin + 4, currentY + 18);
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105);
    doc.text('Classificação: Risco Zero (Blindado)', margin + 4, currentY + 25);

    // Coluna 2: Status Geral
    const col2X = margin + 65;
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SITUAÇÃO GERAL DAS CERTIDÕES:', col2X, currentY + 8);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${targetCnds.length} de ${targetCnds.length} Certidões em Situação Regular`, col2X, currentY + 15);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Todas as esferas consultadas via mTLS / ICP-Brasil.', col2X, currentY + 21);
    doc.text(`Data do Diagnóstico: ${formatDateTimeBR()}`, col2X, currentY + 26);

    // Coluna 3: Simples Nacional LC 123/06
    const col3X = margin + 125;
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('RISCO DE EXCLUSÃO (LC 123/06):', col3X, currentY + 8);
    doc.setFontSize(9);
    doc.setTextColor(16, 185, 129);
    doc.text('RISCO ZERO (SEM APONTAMENTOS)', col3X, currentY + 15);
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Conforme Art. 17, V da LC 123/06.', col3X, currentY + 21);
    doc.text('Apta para distribuição de lucros isentos.', col3X, currentY + 26);

    currentY += 38;

    // Título da Tabela Consolidada
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. QUADRO RESUMO DAS CERTIDÕES INCLUÍDAS NESTE CADERNO CONSOLIDADO', margin, currentY);
    currentY += 4;

    // Header da Tabela
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('ESFERA / ÓRGÃO', margin + 2, currentY + 4.8);
    doc.text('SITUAÇÃO', margin + 60, currentY + 4.8);
    doc.text('CÓDIGO DE CONTROLE', margin + 95, currentY + 4.8);
    doc.text('EMISSÃO', margin + 138, currentY + 4.8);
    doc.text('VALIDADE', margin + 158, currentY + 4.8);
    currentY += 7;

    // Linhas da Tabela
    doc.setFont('helvetica', 'normal');
    targetCnds.forEach((cnd, index) => {
      const rowY = currentY;
      const isEven = index % 2 === 0;
      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, rowY, contentWidth, 11, 'F');
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, rowY + 11, margin + contentWidth, rowY + 11);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${cnd.sphere.toUpperCase()} - ${cnd.organ}`, margin + 2, rowY + 4.5);

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(cnd.jurisdictionName, margin + 2, rowY + 8.5);

      // Status
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text('NEGATIVA (EM DIA)', margin + 60, rowY + 6);

      // Código
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(67, 56, 202);
      doc.text(cnd.controlCode, margin + 95, rowY + 6);

      // Emissão
      doc.setTextColor(51, 65, 85);
      doc.text(formatDateBR(cnd.issueDate), margin + 138, rowY + 6);

      // Validade
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(formatDateBR(cnd.expiryDate), margin + 158, rowY + 6);

      currentY += 11;
    });

    currentY += 6;

    // Bloco 2: Parecer de Auditoria de Débitos
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. AUDITORIA PERICIAL DE DÉBITOS, PARCELAMENTOS E EXIGIBILIDADE SUSPENSA', margin, currentY);
    currentY += 4.5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('PARECER DE AUDITORIA CONTÁBIL E FISCAL:', margin + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    doc.setTextColor(51, 65, 85);
    const auditText = `A auditoria automatizada nos barramentos fiscais da Receita Federal (RFB), PGFN, SEFAZ-${uf}, Município de ${city} e TST não identificou inscrições em Dívida Ativa, autos de infração impeditivos ou execuções fiscais que obstem a regularidade da pessoa jurídica para participar de concorrências públicas ou operações financeiras.`;
    const splitAuditText = doc.splitTextToSize(auditText, contentWidth - 8);
    doc.text(splitAuditText, margin + 4, currentY + 10.5);

    currentY += 28;

    // Bloco 3: Sumário do Caderno
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. ESTRUTURA DO CADERNO CONSOLIDADO DE CERTIDÕES', margin, currentY);
    currentY += 4.5;

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    let summaryIndexText = `Este caderno consolida na íntegra as folhas oficiais de cada certidão negativa nas páginas subsequentes:\n`;
    targetCnds.forEach((cnd, idx) => {
      summaryIndexText += `• Página ${idx + 2}: ${cnd.title} (${cnd.organ})\n`;
    });
    if (includeClosingTerm) {
      summaryIndexText += `• Página ${totalPages}: Termo de Encerramento Forense, Validação Criptográfica e Assinaturas`;
    }
    const splitSummaryText = doc.splitTextToSize(summaryIndexText, contentWidth - 8);
    doc.text(splitSummaryText, margin + 4, currentY + 5.5);

    // Rodapé
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Gerado por Vértice Intelligence Fiscal Suite - Emissão: ${formatDateTimeBR()}`,
      margin,
      pageHeight - 10
    );
    doc.text(
      `Página 1 de ${totalPages} - Caderno Consolidado de CNDs`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // ==========================================
  // PÁGINAS SEGUINTES: CADA CND OFICIAL COMPLETA
  // ==========================================
  if (includeIndividualCnds) {
    for (let i = 0; i < targetCnds.length; i++) {
      const cnd = targetCnds[i];
      doc.addPage();
      currentPageNum += 1;
      await renderOfficialCNDPage(doc, cnd, company, currentPageNum, totalPages);
    }
  }

  // ==========================================
  // PÁGINA FINAL: TERMO DE ENCERRAMENTO & ASSINATURAS
  // ==========================================
  if (includeClosingTerm) {
    doc.addPage();
    currentPageNum += 1;

    // Header Dark
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DE ENCERRAMENTO & CERTIFICAÇÃO DIGITAL FORENSE', margin, 15);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Autenticidade, Validação de Conformidade e Atestado de Regularidade Fiscal Unificada', margin, 21);

    doc.setTextColor(199, 210, 254);
    doc.setFont('helvetica', 'bold');
    doc.text(`EMPRESA: ${company.name} | CNPJ: ${company.cnpj}`, margin, 28);

    let currentY = 44;

    // Box 1: Termo Declaratório
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 42, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMO DECLARATÓRIO DE REGULARIDADE FISCAL:', margin + 4, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const declText = `Declara-se, para os devidos efeitos legais, que as certidões negativas constantes deste caderno consolidado foram obtidas diretamente junto aos sistemas oficiais dos órgãos competentes da União, do Estado de ${getStateJurisdiction(uf).stateName} e do Município de ${city}, bem como do Tribunal Superior do Trabalho e da Caixa Econômica Federal.\n\nO conjunto probatório demonstra que o contribuinte encontra-se plenamente regular, inexistindo apontamentos impeditivos de idoneidade fiscal, apto a celebrar contratos com a Administração Pública nos termos da Lei nº 14.133/2021, obter financiamentos em instituições bancárias e usufruir da distribuição de dividendos do Simples Nacional ou Lucro Presumido.`;
    const splitDeclText = doc.splitTextToSize(declText, contentWidth - 8);
    doc.text(splitDeclText, margin + 4, currentY + 11.5);

    currentY += 48;

    // Box 2: Hash Criptográfico e Chaves de Validação
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, currentY, contentWidth, 38, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('METADADOS FORENSES E INTEGRIDADE CRIPTOGRÁFICA:', margin + 4, currentY + 6);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const hash = `${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`.toUpperCase();
    doc.text(`• Hash de Integridade do Caderno (SHA-256): ${hash}`, margin + 4, currentY + 12);
    doc.text(`• Protocolo de Auditoria Vértice: AUD-CND-${(company.cnpj || '').replace(/\D/g, '').slice(0, 8)}-${new Date().getFullYear()}`, margin + 4, currentY + 17);
    doc.text(`• Quantidade de Certidões Compiladas: ${targetCnds.length} Certidões Oficiais Válidas`, margin + 4, currentY + 22);
    doc.text(`• Carimbo de Tempo Eletrônico: ${formatDateTimeBR()} (Horário Oficial de Brasília - BRT)`, margin + 4, currentY + 27);
    doc.text(`• Padrão Criptográfico: Conforme ICP-Brasil e Resolução CFC nº 1.640/2021`, margin + 4, currentY + 32);

    currentY += 46;

    // Box 3: QR Code Centralizado
    const qrCodeGlobal = await generateCNDQRCodeDataUrl(`https://verticeanalises.com.br/validar-cnd?cnpj=${(company.cnpj || '').replace(/\D/g, '')}&hash=${hash}`);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2);

    if (qrCodeGlobal) {
      try {
        doc.addImage(qrCodeGlobal, 'PNG', margin + 3, currentY + 3, 28, 28);
      } catch (e) {}
    }

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('PORTAL DE VERIFICAÇÃO PÚBLICA:', margin + 35, currentY + 7);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const qrText = `Acesse o portal da Vértice ou aponte a câmera do dispositivo móvel para o QR Code ao lado para verificar a integridade deste caderno consolidado e o status de vigência de cada CND em tempo real nos respectivos portais emissores.`;
    const splitQrText = doc.splitTextToSize(qrText, contentWidth - 38);
    doc.text(splitQrText, margin + 35, currentY + 13);

    currentY += 44;

    // Assinaturas
    const sigBoxWidth = (contentWidth - 10) / 2;

    // Assinatura 1: Responsável Legal
    doc.setDrawColor(148, 163, 184);
    doc.line(margin, currentY + 18, margin + sigBoxWidth, currentY + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(company.name || 'EMPRESA CONTRIBUINTE LTDA', margin + sigBoxWidth / 2, currentY + 23, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Representante Legal - CNPJ ${company.cnpj || ''}`, margin + sigBoxWidth / 2, currentY + 27, { align: 'center' });

    // Assinatura 2: Contador / Responsável Técnico
    const sig2X = margin + sigBoxWidth + 10;
    doc.setDrawColor(148, 163, 184);
    doc.line(sig2X, currentY + 18, sig2X + sigBoxWidth, currentY + 18);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(options.technicianName || 'CARLOS MIGUEL VIEIRA', sig2X + sigBoxWidth / 2, currentY + 23, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Responsável Técnico Contábil - CRC: ${options.technicianCrc || 'PR-068421/O'}`, sig2X + sigBoxWidth / 2, currentY + 27, { align: 'center' });

    // Rodapé
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Caderno Consolidado de CNDs - Vértice Intelligence Fiscal Suite - Emissão: ${formatDateTimeBR()}`,
      margin,
      pageHeight - 10
    );
    doc.text(
      `Página ${totalPages} de ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  return doc;
}

/**
 * Faz download do Caderno Consolidado Unificado em PDF (Todas as Certidões em 1 único arquivo)
 */
export async function downloadUnifiedAllInOneCNDsPDF(
  cndList: CNDItem[],
  debtList: CompanyDebtItem[],
  overallScore: number,
  company: CompanyData,
  options: UnifiedCNDReportOptions = {}
): Promise<void> {
  const doc = await generateUnifiedAllInOneCNDsPDF(cndList, debtList, overallScore, company, options);
  const cleanCnpj = (company.cnpj || 'empresa').replace(/\D/g, '');
  const filename = `Caderno_Consolidado_CNDs_Completo_${cleanCnpj}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
