/**
 * Utilitário de Geração e Exportação de Relatórios Fiscais
 * Permite exportação direta em PDF (.pdf de alta definição), impressão pelo navegador com suporte a iframe,
 * download de documento HTML autônomo formatado em A4 e exportação para CSV/Excel.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface ExportTableColumn {
  header: string;
  key: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Faz o download de um arquivo genérico no navegador do usuário
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/html;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Exporta qualquer elemento HTML (como o Parecer Técnico A4 ou Relatório) para arquivo PDF (.pdf) real
 * Utiliza html2canvas em alta resolução (scale: 2) e jsPDF com fatiamento exato A4
 */
export async function exportElementToPDF(
  elementOrId: string | HTMLElement,
  filename: string,
  onProgress?: (message: string) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const element = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
    if (!element) {
      return { success: false, error: 'Elemento do relatório não encontrado na página.' };
    }

    onProgress?.('Preparando documento e renderizando em alta definição...');

    const hadPrintMode = element.classList.contains('print-mode');
    if (!hadPrintMode) {
      element.classList.add('print-mode');
    }

    // Salva estilos temporários de sombra para evitar artefatos no canvas
    const originalShadow = element.style.boxShadow;
    element.style.boxShadow = 'none';

    // Aguarda um ciclo de renderização para garantir que fontes e SVGs estejam estáveis
    await new Promise(resolve => setTimeout(resolve, 150));

    const a4WidthMm = 210;
    const a4HeightMm = 297;

    // 1. VERIFICA SE O RELATÓRIO POSSUI PÁGINAS EXPLÍCITAS (.report-page / [data-report-page])
    const pageElements = Array.from(
      element.querySelectorAll('.report-page, [data-report-page]')
    ) as HTMLElement[];

    if (pageElements.length > 0) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        onProgress?.(`Renderizando página oficial ${i + 1} de ${pageElements.length}...`);

        const hadPagePrint = pageEl.classList.contains('print-mode');
        if (!hadPagePrint) pageEl.classList.add('print-mode');

        const pageCanvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1080,
          scrollX: 0,
          scrollY: 0,
        });

        if (!hadPagePrint) pageEl.classList.remove('print-mode');

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST');
      }

      element.style.boxShadow = originalShadow;
      if (!hadPrintMode) element.classList.remove('print-mode');

      onProgress?.('Finalizando e baixando PDF...');
      const finalFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
      pdf.save(finalFilename);
      return { success: true };
    }

    // 2. FALLBACK PARA DOCUMENTOS CONTÍNUOS
    const totalWidth = Math.max(element.scrollWidth, 960);
    const totalHeight = element.scrollHeight;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: totalWidth,
      width: totalWidth,
      height: totalHeight,
      scrollX: 0,
      scrollY: 0,
    });

    element.style.boxShadow = originalShadow;
    if (!hadPrintMode) {
      element.classList.remove('print-mode');
    }

    onProgress?.('Formatando páginas no padrão A4 oficial com quebras inteligentes...');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Altura proporcional no canvas correspondente a 1 página A4
    const canvasPageHeight = Math.floor((canvas.width * a4HeightMm) / a4WidthMm);
    const scaleY = canvas.height / Math.max(1, totalHeight);

    // Mapeia bounding rects dos elementos filhos ANTES de renderizar o canvas
    const elementRect = element.getBoundingClientRect();

    // Identifica apenas blocos estruturais de nível superior que não devem ser fatiados
    const breakableElements = Array.from(
      element.querySelectorAll('.avoid-break, section, article, header, footer, table, figure, .grid')
    ) as HTMLElement[];

    const elementBounds = breakableElements
      .map(el => {
        const rect = el.getBoundingClientRect();
        const top = Math.floor((rect.top - elementRect.top) * scaleY);
        const bottom = Math.ceil((rect.bottom - elementRect.top) * scaleY);
        return { top, bottom, height: bottom - top };
      })
      .filter(r => r.height > 20 && r.height < canvasPageHeight * 0.95);

    let renderedHeight = 0;
    let pageIndex = 0;

    while (renderedHeight < canvas.height) {
      const idealCut = renderedHeight + canvasPageHeight;
      let actualCut = idealCut;

      if (idealCut < canvas.height) {
        // Se a linha idealCut corta o meio de algum bloco estrutural, ajusta o corte para logo acima desse bloco
        for (const bound of elementBounds) {
          if (bound.top < idealCut && bound.bottom > idealCut && bound.top > renderedHeight + 150) {
            actualCut = Math.min(actualCut, bound.top - 12);
          }
        }
      } else {
        actualCut = canvas.height;
      }

      // Garante avanço mínimo de 150px para prevenir loops infinitos
      if (actualCut <= renderedHeight + 150) {
        actualCut = idealCut;
      }

      const sliceHeight = Math.min(actualCut - renderedHeight, canvas.height - renderedHeight);
      
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, renderedHeight, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.96);
        if (pageIndex > 0) {
          pdf.addPage();
        }

        const sliceHeightMm = (sliceHeight * a4WidthMm) / canvas.width;
        pdf.addImage(pageImgData, 'JPEG', 0, 0, a4WidthMm, sliceHeightMm, undefined, 'FAST');
      }

      renderedHeight += sliceHeight;
      pageIndex++;
    }

    onProgress?.('Finalizando e baixando PDF...');
    const finalFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(finalFilename);

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao exportar PDF:', error);
    return { 
      success: false, 
      error: error?.message || 'Falha ao processar o arquivo PDF no navegador.' 
    };
  }
}

/**
 * Dispara a impressão com suporte a iframes e fallbacks automáticos
 */
export function triggerSmartPrint(
  elementId?: string,
  docTitle?: string,
  onFallbackNotice?: () => void
): boolean {
  // 1. Tenta acionar window.print() direto
  try {
    const isInsideIframe = window.self !== window.top;
    
    // Se estiver em iframe ou window.print falhar, avisar e tentar abrir documento autônomo
    if (isInsideIframe) {
      console.warn('Aplicação rodando dentro de iframe. A impressão nativa do navegador pode ser bloqueada pelo container.');
      if (onFallbackNotice) {
        onFallbackNotice();
      }
    }

    window.print();
    return true;
  } catch (err) {
    console.error('Falha ao acionar window.print():', err);
    if (onFallbackNotice) {
      onFallbackNotice();
    }
    return false;
  }
}

/**
 * Abre o relatório em uma nova janela limpa com trigger de impressão automática
 * Resolve 100% dos bloqueios de iframe no Chrome/Safari
 */
export function openStandalonePrintWindow(title: string, bodyHtml: string) {
  const htmlContent = generateStandalonePrintHtml(title, bodyHtml);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const newWin = window.open(url, '_blank');
  if (!newWin) {
    // Se popup foi bloqueado pelo navegador, baixa o arquivo HTML
    downloadFile(`Relatorio_${title.replace(/\s+/g, '_')}.html`, htmlContent);
  }
}

/**
 * Exporta dados tabulares para formato CSV compatível com Microsoft Excel (UTF-8 com BOM)
 */
export function exportTableToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const BOM = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${(h || '').replace(/"/g, '""')}"`).join(';'),
    ...rows.map(row => 
      row.map(cell => {
        const val = typeof cell === 'number' ? cell.toLocaleString('pt-BR') : String(cell || '');
        return `"${val.replace(/"/g, '""')}"`;
      }).join(';')
    )
  ].join('\r\n');

  downloadFile(`${filename}.csv`, BOM + csvContent, 'text/csv;charset=utf-8');
}

/**
 * Copia texto formatado para a área de transferência do usuário com fallback
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn('Clipboard API failed, trying fallback...', e);
  }

  // Fallback via textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
}

/**
 * Gera um documento HTML autônomo formatado em A4 com CSS embutido, pronto para impressão/salvar em PDF
 */
export function generateStandalonePrintHtml(title: string, bodyHtml: string): string {
  // Remover botões de ação do sistema (Fechar Relatório, Validar, Auditar) do HTML impresso
  const cleanedBody = bodyHtml
    .replace(/<button[^>]*>.*?<\/button>/gis, '')
    .replace(/<div[^>]*class="[^"]*no-print[^"]*"[^>]*>.*?<\/div>/gis, '');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Vértice Auditor Fiscal // Inteligência Tributária</title>
  <!-- Tailwind CSS CDN para garantir fidelidade total das classes de cores e layout -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      line-height: 1.5;
      padding: 24px;
    }

    .report-wrapper {
      max-width: 980px;
      margin: 0 auto;
      background: #ffffff;
      padding: 48px;
      border-radius: 16px;
      box-shadow: 0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      border-top: 10px solid #0f172a;
    }

    .print-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-bottom: 24px;
    }

    .btn-print {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 22px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: background 0.2s;
      display: inline-flex !important;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover {
      background: #1d4ed8;
    }

    .btn-close {
      background: #64748b;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
      display: inline-flex !important;
      align-items: center;
      gap: 6px;
    }
    .btn-close:hover {
      background: #475569;
    }

    /* Print and PDF Generation Styles - High Contrast Light Theme */
    .print-mode {
      background: #ffffff !important;
      color: #0f172a !important;
    }

    /* Clear backgrounds for outer container elements */
    .print-mode section,
    .print-mode header,
    .print-mode footer,
    .print-mode article {
      background-color: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
    }

    /* Force dark background cards to become clean executive light paper boxes */
    .print-mode [class*="bg-slate-9"],
    .print-mode [class*="bg-slate-8"],
    .print-mode [class*="bg-zinc-"],
    .print-mode [class*="bg-gray-"],
    .print-mode [class*="bg-[#0B0F19]"],
    .print-mode [class*="bg-[#0F172A]"],
    .print-mode [class*="bg-[#070A11]"] {
      background-color: #f8fafc !important;
      background-image: none !important;
      border: 1px solid #cbd5e1 !important;
      color: #0f172a !important;
    }

    /* Soft badge/accent surfaces transformed for high readability on paper */
    .print-mode [class*="bg-emerald"] {
      background-color: #f0fdf4 !important;
      border: 1px solid #86efac !important;
      color: #14532d !important;
      font-weight: 700 !important;
    }

    .print-mode [class*="bg-amber"] {
      background-color: #fffbeb !important;
      border: 1px solid #fde68a !important;
      color: #78350f !important;
      font-weight: 700 !important;
    }

    .print-mode [class*="bg-red"],
    .print-mode [class*="bg-rose"] {
      background-color: #fef2f2 !important;
      border: 1px solid #fecaca !important;
      color: #7f1d1d !important;
      font-weight: 700 !important;
    }

    .print-mode [class*="bg-blue"] {
      background-color: #eff6ff !important;
      border: 1px solid #bfdbfe !important;
      color: #1e3a8a !important;
      font-weight: 700 !important;
    }

    .print-mode [class*="bg-indigo"],
    .print-mode [class*="bg-purple"] {
      background-color: #f5f3ff !important;
      border: 1px solid #ddd6fe !important;
      color: #4c1d95 !important;
      font-weight: 700 !important;
    }

    /* Watermark styling for standalone HTML window and PDF */
    .report-watermark {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      user-select: none;
      z-index: 0;
      overflow: hidden;
      opacity: 0.035;
    }

    /* Force text elements to dark high-contrast color */
    .print-mode h1,
    .print-mode h2,
    .print-mode h3,
    .print-mode h4,
    .print-mode h5,
    .print-mode h6 {
      color: #0f172a !important;
      font-weight: 800 !important;
      page-break-after: avoid !important;
      break-after: avoid !important;
    }

    .print-mode p,
    .print-mode span,
    .print-mode td,
    .print-mode th,
    .print-mode li,
    .print-mode b,
    .print-mode strong,
    .print-mode code {
      color: #0f172a !important;
    }

    /* Neutralize light text classes for print paper */
    .print-mode .text-white,
    .print-mode .text-slate-100,
    .print-mode .text-slate-200,
    .print-mode .text-slate-300,
    .print-mode .text-slate-400,
    .print-mode .text-slate-50,
    .print-mode .text-gray-300,
    .print-mode .text-gray-400 {
      color: #334155 !important;
    }

    /* Specific high-contrast overrides for highlighting text and key metrics */
    .print-mode .text-emerald-400,
    .print-mode .text-emerald-300,
    .print-mode .text-emerald-500 {
      color: #15803d !important;
      font-weight: 700 !important;
    }
    .print-mode .text-blue-400,
    .print-mode .text-blue-300,
    .print-mode .text-blue-500 {
      color: #1d4ed8 !important;
      font-weight: 700 !important;
    }
    .print-mode .text-amber-400,
    .print-mode .text-amber-300,
    .print-mode .text-amber-500 {
      color: #b45309 !important;
      font-weight: 700 !important;
    }
    .print-mode .text-red-400,
    .print-mode .text-red-300,
    .print-mode .text-rose-400 {
      color: #b91c1c !important;
      font-weight: 700 !important;
    }

    /* Standard borders & dividers */
    .print-mode .border-slate-800,
    .print-mode .border-slate-700,
    .print-mode .border-slate-600 {
      border-color: #cbd5e1 !important;
    }

    .print-mode .divide-slate-800 > :not([hidden]) ~ :not([hidden]),
    .print-mode .divide-slate-700 > :not([hidden]) ~ :not([hidden]) {
      border-color: #cbd5e1 !important;
    }

    /* Table structure formatting */
    .print-mode table {
      width: 100% !important;
      border-collapse: collapse !important;
      border: 1px solid #cbd5e1 !important;
      margin-top: 8px !important;
      margin-bottom: 8px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .print-mode th {
      background-color: #f1f5f9 !important;
      color: #0f172a !important;
      font-weight: 700 !important;
      border-bottom: 2px solid #94a3b8 !important;
      padding: 6px 8px !important;
      text-transform: uppercase !important;
      font-size: 10px !important;
    }

    .print-mode td {
      padding: 6px 8px !important;
      border-bottom: 1px solid #cbd5e1 !important;
      color: #0f172a !important;
      background-color: transparent !important;
    }

    .print-mode tr:nth-child(even) {
      background-color: #f8fafc !important;
    }

    .print-mode tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Recharts custom print styling inside canvas/svg */
    .print-mode .recharts-cartesian-grid-horizontal line,
    .print-mode .recharts-cartesian-grid-vertical line {
      stroke: #cbd5e1 !important;
      stroke-dasharray: 2 2 !important;
    }

    .print-mode .recharts-cartesian-axis-tick text {
      fill: #334155 !important;
      font-size: 9px !important;
      font-weight: 600 !important;
    }

    .print-mode .recharts-legend-item-text {
      color: #334155 !important;
      font-weight: 600 !important;
    }

    /* Prevent elements breaking across pages */
    .avoid-break,
    .print-mode section,
    .print-mode figure,
    .print-mode .grid > div,
    .print-mode div[class*="rounded"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      break-inside: avoid-page !important;
    }

    /* Report page structure for multi-page documents */
    .report-page {
      background: #ffffff !important;
      color: #0f172a !important;
      padding: 32px;
      border-radius: 14px;
      margin-bottom: 24px;
      position: relative;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm 10mm;
      }
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .report-wrapper {
        box-shadow: none !important;
        border-top: none !important;
        padding: 0 !important;
        max-width: 100% !important;
        background: transparent !important;
      }
      .report-page {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
      }
      .report-page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }
      .print-actions, .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar como PDF Oficial</button>
    <button class="btn-close" onclick="window.close()">✕ Fechar</button>
  </div>
  <div class="report-wrapper print-mode" style="position: relative; overflow: hidden;">
    <!-- MARCA D'ÁGUA SEGUNDO PADRÃO PERICIAL (LOGO E NOME DO SISTEMA VÉRTICE AUDITOR FISCAL) -->
    <div class="report-watermark">
      <div style="transform: rotate(-12deg); text-align: center; display: flex; flex-direction: column; items-center: center;">
        <svg width="340" height="340" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wm-t" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#0284C7"/></linearGradient>
            <linearGradient id="wm-r" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#059669"/></linearGradient>
            <linearGradient id="wm-br" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#D97706"/></linearGradient>
            <linearGradient id="wm-bl" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1E40AF"/></linearGradient>
            <linearGradient id="wm-l" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0F172A"/></linearGradient>
          </defs>
          <polygon points="50,4 90,27 50,50 10,27" fill="url(#wm-t)"/>
          <polygon points="90,27 90,73 50,50" fill="url(#wm-r)"/>
          <polygon points="90,73 50,96 50,50" fill="url(#wm-br)"/>
          <polygon points="50,96 10,73 50,50" fill="url(#wm-bl)"/>
          <polygon points="10,73 10,27 50,50" fill="url(#wm-l)"/>
          <polygon points="50,4 90,27 90,73 50,96 10,73 10,27" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="2"/>
          <path d="M 28,28 L 50,72 L 72,28" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="50" cy="34" r="5" fill="#FBBF24"/>
        </svg>
        <div style="font-size: 34px; font-weight: 900; letter-spacing: 0.22em; color: #0f172a; text-transform: uppercase; margin-top: 14px; font-family: sans-serif;">
          VÉRTICE AUDITOR FISCAL
        </div>
        <div style="font-size: 15px; font-weight: 700; letter-spacing: 0.2em; color: #334155; text-transform: uppercase; margin-top: 4px; font-family: monospace;">
          AUDITORIA TRIBUTÁRIA • SISTEMA PERICIAL
        </div>
      </div>
    </div>
    <div style="position: relative; z-index: 10;">
      ${cleanedBody}
    </div>
  </div>
</body>
</html>`;
}
