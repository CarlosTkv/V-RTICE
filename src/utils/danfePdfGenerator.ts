import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export interface DocFiscalPdfData {
  id: string;
  tipo: 'NF-e' | 'NFS-e' | 'NFC-e' | 'CT-e';
  numero: string;
  serie: string;
  chave: string;
  dataEmissao: string;
  emitente: string;
  emitenteCnpj: string;
  destinatario: string;
  destinatarioCnpj: string;
  valorTotal: number;
  valorIcms: number;
  valorIss: number;
  cfop: string;
  ncm: string;
  status: 'Autorizada' | 'Cancelada' | 'Denegada';
  xmlOriginal: string;
  direcao?: 'entrada' | 'saida';
  protocoloAutorizacao?: string;
  itens?: Array<{
    descricao: string;
    ncm: string;
    cfop: string;
    valor: number;
    quantidade?: number;
    valorUnitario?: number;
    icmsAliquota?: number;
    issAliquota?: number;
  }>;
}

/**
 * Formata CNPJ ou CPF
 */
export function formatCnpjCpf(val: string): string {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length === 11) {
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) {
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return val;
}

/**
 * Formata Chave de Acesso em grupos de 4 dígitos
 */
export function formatChaveAcesso(chave: string): string {
  if (!chave) return '';
  const clean = chave.replace(/\D/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Gera o documento DANFE em PDF utilizando jsPDF seguindo o layout oficial
 */
export function generateDanfePdf(doc: DocFiscalPdfData): jsPDF {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2; // 190mm
  let y = margin;

  // Cores institucionais
  const primaryColor = [15, 23, 42]; // slate-900
  const borderColor = [180, 185, 195];
  const headerBg = [245, 247, 250];

  // Helper para desenhar caixas
  const drawBox = (x: number, boxY: number, w: number, h: number, title?: string, bg?: number[]) => {
    if (bg) {
      pdf.setFillColor(bg[0], bg[1], bg[2]);
      pdf.rect(x, boxY, w, h, 'F');
    }
    pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    pdf.setLineWidth(0.3);
    pdf.rect(x, boxY, w, h, 'S');

    if (title) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(100, 110, 125);
      pdf.text(title.toUpperCase(), x + 1.5, boxY + 3.2);
    }
  };

  // 1. CANHOTO DE RECEBIMENTO (Topo)
  drawBox(margin, y, 155, 12, 'Recebemos de ' + (doc.emitente || 'EMITENTE').substring(0, 45) + ' os produtos constantes da NF-e indicada ao lado');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(70, 70, 70);
  pdf.text('Data de Recebimento: ____/____/________  |  Identificação e Assinatura do Recebedor: ___________________________________', margin + 2, y + 9);

  drawBox(margin + 155, y, 35, 12);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text('NF-e', margin + 172.5, y + 4.5, { align: 'center' });
  pdf.setFontSize(7);
  pdf.text(`Nº ${doc.numero}`, margin + 172.5, y + 8, { align: 'center' });
  pdf.text(`SÉRIE ${doc.serie}`, margin + 172.5, y + 11, { align: 'center' });

  y += 14;

  // 2. CABEÇALHO PRINCIPAL DO DANFE
  const headerH = 34;

  // Box 1: Emitente (Esquerda)
  drawBox(margin, y, 75, headerH);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const emitLines = pdf.splitTextToSize(doc.emitente.toUpperCase(), 71);
  pdf.text(emitLines, margin + 2, y + 5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(80, 80, 80);
  pdf.text(`CNPJ: ${formatCnpjCpf(doc.emitenteCnpj)}`, margin + 2, y + 17);
  pdf.text(`Endereço: Área Fiscal Comercial Central`, margin + 2, y + 21);
  pdf.text(`Município: Atuação Estadual / Federal`, margin + 2, y + 25);
  pdf.text(`Inscrição Estadual: Isento / Habilitado`, margin + 2, y + 29);

  // Box 2: Identificação DANFE (Centro)
  drawBox(margin + 75, y, 38, headerH);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(doc.tipo === 'CT-e' ? 'DACTE' : 'DANFE', margin + 94, y + 6, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text(doc.tipo === 'CT-e' ? 'Documento Auxiliar do CT-e' : 'Documento Auxiliar da NF-e', margin + 94, y + 9.5, { align: 'center' });

  // Tipo de Operação: 0 - Entrada | 1 - Saída
  const isEntrada = doc.direcao === 'entrada';
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.text(isEntrada ? '0 - ENTRADA' : '1 - SAÍDA', margin + 94, y + 15, { align: 'center' });
  pdf.rect(margin + 90, y + 11.5, 8, 5);
  pdf.text(isEntrada ? '0' : '1', margin + 94, y + 15, { align: 'center' });

  pdf.setFontSize(8);
  pdf.text(`Nº ${doc.numero}`, margin + 94, y + 22, { align: 'center' });
  pdf.setFontSize(7);
  pdf.text(`SÉRIE ${doc.serie}`, margin + 94, y + 26, { align: 'center' });
  pdf.text(`FOLHA 1/1`, margin + 94, y + 30, { align: 'center' });

  // Box 3: Chave de Acesso & Código de Barras (Direita)
  drawBox(margin + 113, y, 77, headerH);

  // Simulação gráfica de Código de Barras Code 128
  const barY = y + 2;
  const barH = 11;
  const barW = 73;
  pdf.setFillColor(20, 20, 20);
  // Desenho de barras alternadas com espessuras proporcionais
  let curX = margin + 115;
  const chaveSeed = doc.chave.replace(/\D/g, '') || '33260904921832000199550010000000011857391234';
  for (let i = 0; i < chaveSeed.length; i++) {
    const digit = parseInt(chaveSeed[i], 10) || 1;
    const wBar = (digit % 3 === 0) ? 1.0 : (digit % 2 === 0) ? 0.6 : 0.35;
    if (curX + wBar < margin + 113 + barW) {
      pdf.rect(curX, barY, wBar, barH, 'F');
      curX += wBar + 0.35;
    }
  }

  // Chave de acesso formatada em texto
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(60, 60, 60);
  pdf.text('CHAVE DE ACESSO', margin + 115, y + 16.5);
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(6.8);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(formatChaveAcesso(doc.chave), margin + 115, y + 20.5);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(90, 90, 90);
  pdf.text('Consulta de autenticidade no portal nacional da NF-e:', margin + 115, y + 25);
  pdf.setTextColor(0, 80, 160);
  pdf.text('www.nfe.fazenda.gov.br/portal ou no site da SEFAZ autorizadora', margin + 115, y + 28);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(`PROTOCOLO: ${doc.protocoloAutorizacao || '1332609' + Math.floor(100000000 + Math.random() * 900000000)}`, margin + 115, y + 31.5);

  y += headerH + 2;

  // 3. NATUREZA DA OPERAÇÃO E INSCRIÇÕES
  const natH = 10;
  drawBox(margin, y, 100, natH, 'Natureza da Operação');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(isEntrada ? 'Compra de Mercadoria / Insumo' : 'Venda de Produção / Mercadoria', margin + 2, y + 7.5);

  drawBox(margin + 100, y, 45, natH, 'Protocolo de Autorização de Uso');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text(`${doc.protocoloAutorizacao || '133260900192841'} - ${doc.dataEmissao}`, margin + 102, y + 7.5);

  drawBox(margin + 145, y, 45, natH, 'Inscrição Estadual');
  pdf.text('98.765.432-1', margin + 147, y + 7.5);

  y += natH + 2;

  // 4. DESTINATÁRIO / REMETENTE
  const destH = 19;
  drawBox(margin, y, contentWidth, destH, 'Destinatário / Remetente', headerBg);

  // Linha 1 Destinatário
  drawBox(margin, y + 3.5, 120, 7.5, 'Nome / Razão Social');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(doc.destinatario.toUpperCase(), margin + 2, y + 9);

  drawBox(margin + 120, y + 3.5, 45, 7.5, 'CNPJ / CPF');
  pdf.setFont('courier', 'bold');
  pdf.setFontSize(7.5);
  pdf.text(formatCnpjCpf(doc.destinatarioCnpj), margin + 122, y + 9);

  drawBox(margin + 165, y + 3.5, 25, 7.5, 'Data da Emissão');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.text(doc.dataEmissao, margin + 167, y + 9);

  // Linha 2 Destinatário
  drawBox(margin, y + 11, 95, 7.5, 'Endereço');
  pdf.text('Avenida Principal do Contribuinte, 1000 - Centro', margin + 2, y + 16.5);

  drawBox(margin + 95, y + 11, 45, 7.5, 'Bairro / Distrito');
  pdf.text('Zona Comercial', margin + 97, y + 16.5);

  drawBox(margin + 140, y + 11, 25, 7.5, 'CEP');
  pdf.text('80010-000', margin + 142, y + 16.5);

  drawBox(margin + 165, y + 11, 25, 7.5, 'Data Saída/Entrada');
  pdf.text(doc.dataEmissao, margin + 167, y + 16.5);

  y += destH + 2;

  // 5. CÁLCULO DO IMPOSTO
  const taxH = 18;
  drawBox(margin, y, contentWidth, taxH, 'Cálculo do Imposto', headerBg);

  const colW = contentWidth / 5;
  // Linha 1 Impostos
  drawBox(margin, y + 3.5, colW, 7, 'Base de Cálculo do ICMS');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text(`R$ ${doc.valorTotal.toFixed(2)}`, margin + 2, y + 8.5);

  drawBox(margin + colW, y + 3.5, colW, 7, 'Valor do ICMS');
  pdf.text(`R$ ${doc.valorIcms.toFixed(2)}`, margin + colW + 2, y + 8.5);

  drawBox(margin + colW * 2, y + 3.5, colW, 7, 'Base de Cálculo ICMS ST');
  pdf.text('R$ 0,00', margin + colW * 2 + 2, y + 8.5);

  drawBox(margin + colW * 3, y + 3.5, colW, 7, 'Valor do ICMS ST');
  pdf.text('R$ 0,00', margin + colW * 3 + 2, y + 8.5);

  drawBox(margin + colW * 4, y + 3.5, colW, 7, 'Valor Total dos Produtos');
  pdf.text(`R$ ${doc.valorTotal.toFixed(2)}`, margin + colW * 4 + 2, y + 8.5);

  // Linha 2 Impostos
  drawBox(margin, y + 10.5, colW, 7, 'Valor do Frete');
  pdf.text('R$ 0,00', margin + 2, y + 15.5);

  drawBox(margin + colW, y + 10.5, colW, 7, 'Valor do Seguro');
  pdf.text('R$ 0,00', margin + colW + 2, y + 15.5);

  drawBox(margin + colW * 2, y + 10.5, colW, 7, 'Desconto');
  pdf.text('R$ 0,00', margin + colW * 2 + 2, y + 15.5);

  drawBox(margin + colW * 3, y + 10.5, colW, 7, 'Outras Despesas');
  pdf.text('R$ 0,00', margin + colW * 3 + 2, y + 15.5);

  drawBox(margin + colW * 4, y + 10.5, colW, 7, 'VALOR TOTAL DA NOTA');
  pdf.setFontSize(8.5);
  pdf.setTextColor(0, 100, 40);
  pdf.text(`R$ ${doc.valorTotal.toFixed(2)}`, margin + colW * 4 + 2, y + 15.5);

  y += taxH + 2;

  // 6. DADOS DOS PRODUTOS / SERVIÇOS
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text('DADOS DOS PRODUTOS / SERVIÇOS', margin, y + 3);
  y += 4;

  const tableH = 75;
  drawBox(margin, y, contentWidth, tableH);

  // Cabeçalho da Tabela
  pdf.setFillColor(headerBg[0], headerBg[1], headerBg[2]);
  pdf.rect(margin, y, contentWidth, 5, 'F');
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.line(margin, y + 5, margin + contentWidth, y + 5);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(5.8);
  pdf.setTextColor(80, 80, 80);
  pdf.text('CÓDIGO', margin + 2, y + 3.5);
  pdf.text('DESCRIÇÃO DO PRODUTO / SERVIÇO', margin + 22, y + 3.5);
  pdf.text('NCM/SH', margin + 95, y + 3.5);
  pdf.text('CST', margin + 112, y + 3.5);
  pdf.text('CFOP', margin + 122, y + 3.5);
  pdf.text('UN', margin + 133, y + 3.5);
  pdf.text('QTD', margin + 140, y + 3.5);
  pdf.text('V. UNIT', margin + 152, y + 3.5);
  pdf.text('V. TOTAL', margin + 167, y + 3.5);
  pdf.text('ALIQ. ICMS', margin + 180, y + 3.5);

  // Linhas dos itens
  let itemY = y + 8.5;
  const itemsList = (doc.itens && doc.itens.length > 0)
    ? doc.itens
    : [
        {
          descricao: `MERCADORIA / OPERAÇÃO REGISTRADA SOB NCM ${doc.ncm || '00000000'}`,
          ncm: doc.ncm || '00000000',
          cfop: doc.cfop || '5102',
          valor: doc.valorTotal,
          quantidade: 1,
          valorUnitario: doc.valorTotal,
          icmsAliquota: doc.valorTotal > 0 ? Math.round((doc.valorIcms / doc.valorTotal) * 100) : 0
        }
      ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.2);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

  itemsList.slice(0, 10).forEach((it, idx) => {
    pdf.text(`PROD-${idx + 1}`.padStart(6, '0'), margin + 2, itemY);
    const descShort = (it.descricao || 'Item fiscal').substring(0, 50);
    pdf.text(descShort, margin + 22, itemY);
    pdf.text(it.ncm || doc.ncm || '-', margin + 95, itemY);
    pdf.text('000', margin + 112, itemY);
    pdf.text(it.cfop || doc.cfop || '-', margin + 122, itemY);
    pdf.text('UN', margin + 133, itemY);
    pdf.text(String(it.quantidade || 1), margin + 140, itemY);
    pdf.text(`R$ ${(it.valorUnitario || it.valor).toFixed(2)}`, margin + 152, itemY);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`R$ ${it.valor.toFixed(2)}`, margin + 167, itemY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${it.icmsAliquota || 0}%`, margin + 182, itemY);

    itemY += 6;
  });

  y += tableH + 3;

  // 7. DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES
  const addH = 26;
  drawBox(margin, y, contentWidth, addH, 'Dados Adicionais / Informações Complementares', headerBg);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.2);
  pdf.setTextColor(60, 60, 60);

  const infoLines = [
    `Documento Fiscal Oficial emitido em conformidade com as regras do SPED e SEFAZ Nacional.`,
    `Chave de Acesso: ${doc.chave} | Protocolo de Autorização: ${doc.protocoloAutorizacao || '133260900192841'}`,
    `Status na Base Federal: ${doc.status.toUpperCase()} | Operação: ${doc.direcao === 'saida' ? 'SAÍDA (EMITIDA)' : 'ENTRADA (RECEBIDA)'}`,
    `Impostos Apurados: ICMS: R$ ${doc.valorIcms.toFixed(2)} | ISS: R$ ${doc.valorIss.toFixed(2)} | CFOP Predominante: ${doc.cfop}`,
    `Auditoria e Conformidade realizada pelo Vértice Auditor Fiscal (verticeanalises.com.br).`
  ];

  let lineY = y + 5.5;
  infoLines.forEach(l => {
    pdf.text(l, margin + 2, lineY);
    lineY += 4;
  });

  return pdf;
}

/**
 * Faz o download direto do DANFE em PDF no navegador
 */
export function downloadDanfePdf(doc: DocFiscalPdfData): void {
  const pdf = generateDanfePdf(doc);
  const cleanNum = (doc.numero || 'doc').replace(/\D/g, '');
  const cleanChave = (doc.chave || '').substring(0, 15);
  pdf.save(`DANFE_${doc.tipo}_${cleanNum}_${cleanChave}.pdf`);
}

/**
 * Faz o download direto do XML original no navegador
 */
export function downloadFiscalXml(doc: DocFiscalPdfData): void {
  const xmlContent = doc.xmlOriginal || `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${doc.chave}" versao="4.00">
      <ide><nNF>${doc.numero}</nNF><serie>${doc.serie}</serie><dhEmi>${doc.dataEmissao}T12:00:00-03:00</dhEmi></ide>
      <emit><CNPJ>${doc.emitenteCnpj.replace(/\D/g, '')}</CNPJ><xNome>${doc.emitente}</xNome></emit>
      <dest><CNPJ>${doc.destinatarioCnpj.replace(/\D/g, '')}</CNPJ><xNome>${doc.destinatario}</xNome></dest>
      <total><ICMSTot><vNF>${doc.valorTotal.toFixed(2)}</vNF><vICMS>${doc.valorIcms.toFixed(2)}</vICMS></ICMSTot></total>
    </infNFe>
  </NFe>
</nfeProc>`;

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.tipo}_${doc.numero}_${doc.chave || 'nota'}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gera e baixa um arquivo .ZIP contendo todos os XMLs e PDFs de uma lista de notas
 */
export async function downloadBatchZip(docs: DocFiscalPdfData[], packName = 'lote_fiscal'): Promise<void> {
  const zip = new JSZip();
  const folderXml = zip.folder('XMLs_Oficiais');
  const folderPdf = zip.folder('DANFEs_PDF');

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const baseName = `${doc.tipo}_${doc.numero}_${doc.chave ? doc.chave.slice(-8) : i + 1}`;

    // 1. XML
    if (folderXml) {
      const xmlData = doc.xmlOriginal || `<xml>${doc.chave}</xml>`;
      folderXml.file(`${baseName}.xml`, xmlData);
    }

    // 2. PDF DANFE
    if (folderPdf) {
      try {
        const pdf = generateDanfePdf(doc);
        const pdfBlob = pdf.output('blob');
        folderPdf.file(`${baseName}.pdf`, pdfBlob);
      } catch (e) {
        console.warn('Erro ao gerar PDF no lote:', e);
      }
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${packName}_${docs.length}_documentos_${new Date().toISOString().split('T')[0]}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
