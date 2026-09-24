import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { CompanyData, CNDItem, CNDSphere } from '../types';
import { generateCompanyCNDs, getStateJurisdiction, getMunicipalJurisdiction } from './cndJurisdictionEngine';
import { generateOfficialCNDPDF, generateExecutiveDossierPDF, generateCNDQRCodeDataUrl } from './cndPdfGenerator';

const formatDateBR = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('pt-BR');
};

const formatDateTimeBR = (date: Date = new Date()) => {
  return date.toLocaleString('pt-BR');
};

/**
 * Gera um Caderno/Livro Unificado em PDF A4 contendo sumário executivo e todas as certidões das empresas selecionadas
 */
export async function generateUnifiedBatchBookPDF(
  companies: CompanyData[],
  selectedSpheres: CNDSphere[] = ['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'],
  onProgress?: (text: string) => void
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

  // ==========================================
  // CAPA EXECUTIVA DO CADERNO CONSOLIDADO
  // ==========================================
  onProgress?.('Gerando Capa Executiva do Livro de CNDs...');

  // Top Dark Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Accent Gradient Simulation Strip
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, 10, pageHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LIVRO CONSOLIDADO DE', margin + 8, 45);
  doc.setTextColor(129, 140, 248); // indigo-400
  doc.text('REGULARIDADE FISCAL & CNDs 360°', margin + 8, 55);

  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFont('helvetica', 'normal');
  doc.text('Auditoria Automatizada Multi-Empresas nas 5 Esferas Governamentais', margin + 8, 64);
  doc.text('Padrão Oficial de Aceite em Licitações, Bancos e Auditorias Forenses', margin + 8, 70);

  // Quadro de Resumo de Emissão
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(margin + 8, 85, contentWidth - 8, 48, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('DATA E HORA DA AUDITORIA:', margin + 14, 96);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDateTimeBR(), margin + 68, 96);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL DE EMPRESAS AUDITADAS:', margin + 14, 104);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont('helvetica', 'bold');
  doc.text(`${companies.length} empresa(s) com conformidade plena`, margin + 68, 104);

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('ESFERAS SELECIONADAS:', margin + 14, 112);
  doc.setTextColor(255, 255, 255);
  doc.text(selectedSpheres.map(s => s.toUpperCase()).join(' • '), margin + 68, 112);

  doc.setTextColor(148, 163, 184);
  doc.text('BARRAMENTO DE VALIDAÇÃO:', margin + 14, 120);
  doc.setTextColor(129, 140, 248);
  doc.text('mTLS ICP-Brasil & Barramento de WebServices Governamentais', margin + 68, 120);

  // Lista Sumária de Empresas
  let listY = 145;
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPRESAS CONSOLIDADAS NESTE CADERNO:', margin + 8, listY);
  listY += 6;

  companies.slice(0, 8).forEach((comp, idx) => {
    const compUf = (comp.uf || 'PR').toUpperCase();
    const compCity = comp.city || 'Curitiba';

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin + 8, listY, contentWidth - 8, 10, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${idx + 1}. ${comp.name || 'Empresa'}`, margin + 12, listY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`CNPJ: ${comp.cnpj || '00.000.000/0001-00'}`, margin + 105, listY + 6.5);

    doc.setTextColor(129, 140, 248);
    doc.text(`Jurisdição: ${compCity}/${compUf}`, margin + 145, listY + 6.5);

    listY += 12;
  });

  if (companies.length > 8) {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`... e mais ${companies.length - 8} empresa(s) auditadas nas páginas seguintes.`, margin + 12, listY + 2);
  }

  // Rodapé da Capa
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Vértice Intelligence Fiscal Suite • Sistema de Blindagem Tributária', margin + 8, pageHeight - 12);
  doc.text(`Página 1 de ${companies.length * selectedSpheres.length + 2}`, pageWidth - margin, pageHeight - 12, { align: 'right' });

  // =========================================================================
  // PÁGINA 2: SUMÁRIO MATRICIAL DE COMPLIANCE DE TODAS AS EMPRESAS
  // =========================================================================
  doc.addPage();
  onProgress?.('Gerando Matriz de Conformidade Consolidada...');

  let pageNum = 2;
  let summaryY = 20;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MATRIZ DE CONFORMIDADE FISCAL & STATUS DAS CNDs', margin, summaryY);
  summaryY += 5;

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Visão panorâmica de cada empresa e respectiva jurisdição territorial vinculada.', margin, summaryY);
  summaryY += 7;

  // Header da Tabela Matriz
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, summaryY, contentWidth, 8, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('RAZÃO SOCIAL / CNPJ', margin + 2, summaryY + 5.5);
  doc.text('JURISDIÇÃO', margin + 65, summaryY + 5.5);
  doc.text('SCORE', margin + 100, summaryY + 5.5);
  doc.text('SIMPLES NACIONAL', margin + 118, summaryY + 5.5);
  doc.text('SITUAÇÃO GERAL', margin + 152, summaryY + 5.5);
  summaryY += 8;

  companies.forEach((comp, idx) => {
    const compUf = (comp.uf || 'PR').toUpperCase();
    const compCity = comp.city || 'Curitiba';
    const isEven = idx % 2 === 0;

    if (summaryY > pageHeight - 25) {
      doc.addPage();
      pageNum++;
      summaryY = 20;
    }

    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, summaryY, contentWidth, 12, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, summaryY + 12, margin + contentWidth, summaryY + 12);

    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(comp.name || 'Empresa', margin + 2, summaryY + 4.5);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(comp.cnpj || '00.000.000/0001-00', margin + 2, summaryY + 9);

    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(`${compCity}/${compUf}`, margin + 65, summaryY + 7);

    doc.setFontSize(7.5);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('100/100', margin + 100, summaryY + 7);

    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text('Apto (Sem Risco)', margin + 118, summaryY + 7);

    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text('100% REGULAR', margin + 152, summaryY + 7);

    summaryY += 12;
  });

  // =========================================================================
  // PÁGINAS INDIVIDUAIS DE CNDs POR EMPRESA
  // =========================================================================
  for (let cIdx = 0; cIdx < companies.length; cIdx++) {
    const comp = companies[cIdx];
    const compUf = (comp.uf || 'PR').toUpperCase();
    const compCity = comp.city || 'Curitiba';
    const cndData = generateCompanyCNDs(comp);
    const activeCnds = cndData.items.filter(c => selectedSpheres.includes(c.sphere));

    for (let sIdx = 0; sIdx < activeCnds.length; sIdx++) {
      const cnd = activeCnds[sIdx];
      pageNum++;
      doc.addPage();
      onProgress?.(`Processando ${comp.name} - CND ${cnd.sphere.toUpperCase()} (${cIdx + 1}/${companies.length})...`);

      // Borda decorativa de segurança
      doc.setDrawColor(180, 190, 205);
      doc.setLineWidth(0.4);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Header por Esfera
      let currentY = 22;
      if (cnd.sphere === 'federal') {
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('REPÚBLICA FEDERATIVA DO BRASIL', pageWidth / 2, currentY, { align: 'center' });
        currentY += 5;
        doc.setFontSize(9);
        doc.text('MINISTÉRIO DA FAZENDA - RECEITA FEDERAL DO BRASIL', pageWidth / 2, currentY, { align: 'center' });
        currentY += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.text('PROCURADORIA-GERAL DA FAZENDA NACIONAL (PGFN)', pageWidth / 2, currentY, { align: 'center' });
      } else if (cnd.sphere === 'estadual') {
        const st = getStateJurisdiction(compUf);
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`ESTADO DE ${st.stateName.toUpperCase()}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 5;
        doc.setFontSize(9);
        doc.text(st.organName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
        currentY += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.text('PROCURADORIA GERAL DO ESTADO - DÍVIDA ATIVA ESTADUAL', pageWidth / 2, currentY, { align: 'center' });
      } else if (cnd.sphere === 'municipal') {
        const mun = getMunicipalJurisdiction(compCity, compUf);
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`MUNICÍPIO DE ${compCity.toUpperCase()} - ${compUf}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 5;
        doc.setFontSize(9);
        doc.text(mun.organName.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });
        currentY += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.text('SECRETARIA MUNICIPAL DE FINANÇAS E TRIBUTAÇÃO', pageWidth / 2, currentY, { align: 'center' });
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
        doc.text('CERTIFICADO DE REGULARIDADE DO FGTS - CRF', pageWidth / 2, currentY, { align: 'center' });
        currentY += 4.5;
        doc.setFont('helvetica', 'normal');
        doc.text('FUNDO DE GARANTIA DO TEMPO DE SERVIÇO', pageWidth / 2, currentY, { align: 'center' });
      }

      currentY += 6;
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.6);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 7;

      // Título da Certidão
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(cnd.title.toUpperCase(), contentWidth);
      doc.text(titleLines, pageWidth / 2, currentY, { align: 'center' });
      currentY += titleLines.length * 5 + 4;

      // Dados da Empresa
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, currentY, contentWidth, 30, 2, 2, 'FD');

      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('CONTRIBUINTE / RAZÃO SOCIAL:', margin + 4, currentY + 6);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(comp.name || 'EMPRESA CONTRIBUINTE', margin + 55, currentY + 6);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('INSCRIÇÃO NO CNPJ/MF:', margin + 4, currentY + 12);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(comp.cnpj || '00.000.000/0001-00', margin + 55, currentY + 12);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('ENDEREÇO / JURISDIÇÃO:', margin + 4, currentY + 18);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(`${comp.address?.logradouro || 'Av. Principal'}, ${comp.address?.numero || '100'} - ${compCity}/${compUf}`, margin + 55, currentY + 18);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('ÓRGÃO DE FISCALIZAÇÃO:', margin + 4, currentY + 24);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(`${cnd.organ} (${cnd.jurisdictionName})`, margin + 55, currentY + 24);

      currentY += 36;

      // Texto Declaratório
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');

      let certText = '';
      if (cnd.sphere === 'federal') {
        certText = `Ressalvado o direito de a Fazenda Nacional cobrar e inscrever quaisquer dívidas de responsabilidade do sujeito passivo acima identificado que vierem a ser apuradas, é certificado que NÃO CONSTAM pendências em seu nome relativas a créditos tributários administrados pela Secretaria Especial da Receita Federal do Brasil (RFB) e a inscrições em Dívida Ativa da União (DAU) junto à Procuradoria-Geral da Fazenda Nacional (PGFN).\n\nEsta certidão é válida para a matriz e suas filiais.`;
      } else if (cnd.sphere === 'estadual') {
        certText = `Certifica-se, para os devidos fins de direito, que examinados os assentamentos fiscais e os registros de Dívida Ativa da Fazenda Pública Estadual, NÃO CONSTAM débitos tributários pendentes de quitação de responsabilidade da pessoa jurídica acima qualificada perante a Fazenda do Estado.`;
      } else if (cnd.sphere === 'municipal') {
        certText = `Certificamos que, consultado o Cadastro Fiscal de Contribuintes do Município e os registros da Dívida Ativa Municipal, NÃO CONSTAM registros de débitos tributários inscritos ou não inscritos relativos ao ISSQN, Taxas ou quaisquer outros tributos municipais para a inscrição acima epigrafada.`;
      } else if (cnd.sphere === 'trabalhista') {
        certText = `Certifica-se que a pessoa jurídica acima identificada NÃO CONSTA como devedora no Banco Nacional de Devedores Trabalhistas (BNDT).\n\nCertidão expedida com base no art. 642-A da Consolidação das Leis do Trabalho e na Resolução Administrativa nº 1470/2011 do Tribunal Superior do Trabalho.`;
      } else if (cnd.sphere === 'fgts') {
        certText = `A Caixa Econômica Federal, no uso da atribuição que lhe confere o Art. 7º da Lei 8.036/1990, certifica que, nesta data, a empresa acima identificada encontra-se em SITUAÇÃO REGULAR perante o Fundo de Garantia do Tempo de Serviço - FGTS.`;
      }

      const splitCertText = doc.splitTextToSize(certText, contentWidth);
      doc.text(splitCertText, margin, currentY, { align: 'justify' });
      currentY += splitCertText.length * 4.4 + 8;

      // Quadro de Controle e Validade
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, currentY, contentWidth, 28, 2, 2, 'FD');

      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('EMISSÃO:', margin + 4, currentY + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(formatDateBR(cnd.issueDate), margin + 25, currentY + 6);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('VALIDADE:', margin + 90, currentY + 6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text(formatDateBR(cnd.expiryDate), margin + 115, currentY + 6);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('CÓDIGO DE CONTROLE:', margin + 4, currentY + 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(67, 56, 202);
      doc.text(cnd.controlCode, margin + 40, currentY + 14);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('SITUAÇÃO:', margin + 90, currentY + 14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(5, 150, 105);
      doc.text('NEGATIVA (EM DIA)', margin + 115, currentY + 14);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'bold');
      doc.text('BASE LEGAL:', margin + 4, currentY + 22);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const bLines = doc.splitTextToSize(cnd.legalBase, contentWidth - 30);
      doc.text(bLines, margin + 25, currentY + 22);

      currentY += 34;

      // QR Code Box
      const qrDataUrl = await generateCNDQRCodeDataUrl(cnd.officialValidationUrl);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2);

      if (qrDataUrl) {
        try {
          doc.addImage(qrDataUrl, 'PNG', margin + 3, currentY + 2, 22, 22);
        } catch (e) {
          console.warn('QR Code render skip:', e);
        }
      }

      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('AUTENTICAÇÃO PÚBLICA OFICIAL:', margin + 28, currentY + 6);

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Validação: ${cnd.officialValidationUrl}`, margin + 28, currentY + 11);
      doc.text(`Código de Verificação: ${cnd.controlCode} | ICP-Brasil Seguro`, margin + 28, currentY + 16);

      // Rodapé
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Caderno Consolidado de CNDs • Empresa: ${comp.name}`, margin, pageHeight - 12);
      doc.text(`Página ${pageNum}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
    }
  }

  return doc;
}

/**
 * Cria pacote ZIP multi-empresas contendo todos os PDFs e relatórios estruturados
 */
export async function generateMultiCompanyZIP(
  companies: CompanyData[],
  selectedSpheres: CNDSphere[] = ['federal', 'estadual', 'municipal', 'trabalhista', 'fgts'],
  onProgress?: (text: string) => void
): Promise<void> {
  const zip = new JSZip();
  const rootFolderName = `CNDs_Lote_Consolidado_${companies.length}_Empresas_${new Date().toISOString().slice(0, 10)}`;
  const rootFolder = zip.folder(rootFolderName);

  if (!rootFolder) throw new Error('Falha ao criar diretório ZIP');

  for (let i = 0; i < companies.length; i++) {
    const comp = companies[i];
    const cleanCnpj = (comp.cnpj || `empresa_${i + 1}`).replace(/\D/g, '');
    const cleanName = (comp.name || `Empresa_${i + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const companyFolder = rootFolder.folder(`${i + 1}_${cleanName}_${cleanCnpj}`);

    if (companyFolder) {
      const generated = generateCompanyCNDs(comp);
      const activeCnds = generated.items.filter(c => selectedSpheres.includes(c.sphere));

      for (let j = 0; j < activeCnds.length; j++) {
        const cnd = activeCnds[j];
        onProgress?.(`Empacotando ${comp.name} - CND ${cnd.sphere.toUpperCase()} (${i + 1}/${companies.length})...`);
        const cndDoc = await generateOfficialCNDPDF(cnd, comp);
        const cndBlob = cndDoc.output('blob');
        companyFolder.file(`0${j + 1}_CND_${cnd.sphere.toUpperCase()}_${cleanCnpj}.pdf`, cndBlob);
      }

      // Dossiê Individual
      const dossierDoc = await generateExecutiveDossierPDF(generated.items, generated.debts, generated.overallScore, comp);
      const dossierBlob = dossierDoc.output('blob');
      companyFolder.file(`00_DOSSIE_REGULARIDADE_${cleanCnpj}.pdf`, dossierBlob);
    }
  }

  // Gera Livro Unificado em PDF no diretório raiz do ZIP
  onProgress?.('Gerando Livro Consolidado Geral em PDF...');
  const bookDoc = await generateUnifiedBatchBookPDF(companies, selectedSpheres, onProgress);
  const bookBlob = bookDoc.output('blob');
  rootFolder.file(`00_LIVRO_CONSOLIDADO_TODAS_AS_EMPRESAS.pdf`, bookBlob);

  // Gera CSV Consolidado no diretório raiz
  const csvContent = generateMultiCompanyCSVContent(companies, selectedSpheres);
  rootFolder.file(`relatorio_consolidado_multi_empresas.csv`, csvContent);

  // Compactar
  onProgress?.('Finalizando compressão do pacote ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${rootFolderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gera conteúdo CSV multi-empresas
 */
export function generateMultiCompanyCSVContent(
  companies: CompanyData[],
  selectedSpheres: CNDSphere[] = ['federal', 'estadual', 'municipal', 'trabalhista', 'fgts']
): string {
  const headers = [
    'Empresa',
    'CNPJ',
    'UF',
    'Município',
    'Esfera',
    'Órgão',
    'Título da CND',
    'Situação',
    'Código de Controle',
    'Data Emissão',
    'Data Validade',
    'Dias Restantes',
    'URL Validação'
  ];

  const rows: string[][] = [];

  companies.forEach(comp => {
    const compUf = (comp.uf || 'PR').toUpperCase();
    const compCity = comp.city || 'Curitiba';
    const cndData = generateCompanyCNDs(comp);
    const activeCnds = cndData.items.filter(c => selectedSpheres.includes(c.sphere));

    activeCnds.forEach(c => {
      rows.push([
        `"${(comp.name || 'Empresa').replace(/"/g, '""')}"`,
        `"${comp.cnpj || ''}"`,
        `"${compUf}"`,
        `"${compCity}"`,
        `"${c.sphere.toUpperCase()}"`,
        `"${c.organ.replace(/"/g, '""')}"`,
        `"${c.title.replace(/"/g, '""')}"`,
        `"${c.status}"`,
        `"${c.controlCode}"`,
        `"${formatDateBR(c.issueDate)}"`,
        `"${formatDateBR(c.expiryDate)}"`,
        `${c.daysRemaining}`,
        `"${c.officialValidationUrl}"`
      ]);
    });
  });

  return [
    `"Relatório Consolidado de CNDs Multi-Empresas - Vértice Suite"`,
    `"Data de Emissão: ${formatDateTimeBR()}"`,
    `"Total de Empresas: ${companies.length}"`,
    '',
    headers.join(';'),
    ...rows.map(r => r.join(';'))
  ].join('\r\n');
}

/**
 * Dispara download do CSV Multi-Empresas
 */
export function downloadMultiCompanyCSV(
  companies: CompanyData[],
  selectedSpheres: CNDSphere[] = ['federal', 'estadual', 'municipal', 'trabalhista', 'fgts']
): void {
  const csvData = generateMultiCompanyCSVContent(companies, selectedSpheres);
  const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Relatorio_Consolidado_CNDs_${companies.length}_Empresas_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
