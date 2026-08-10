import type { RefObject } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function parseAndConvertOklch(innerContent: string): string {
  try {
    const parts = innerContent.trim().split('/');
    const colorParts = parts[0].trim().split(/[\s,]+/);

    let lVal = colorParts[0] || '0';
    let cVal = colorParts[1] || '0';
    let hVal = colorParts[2] || '0';
    let aVal = parts[1] ? parts[1].trim() : '1';

    let L = lVal === 'none' ? 0 : (lVal.endsWith('%') ? parseFloat(lVal) / 100 : parseFloat(lVal));
    let C = cVal === 'none' ? 0 : parseFloat(cVal);
    let H = hVal === 'none' ? 0 : parseFloat(hVal.replace('deg', ''));
    let A = aVal === 'none' ? 1 : (aVal.endsWith('%') ? parseFloat(aVal) / 100 : parseFloat(aVal));

    if (isNaN(L)) L = 0;
    if (isNaN(C)) C = 0;
    if (isNaN(H)) H = 0;
    if (isNaN(A)) A = 1;

    // OKLCH to OKLAB
    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    // OKLAB to Linear LMS
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 0.1291986459 * b;

    const l = l_ * l_ * l_;
    const m1 = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    // LMS to Linear RGB
    let rLinear = +4.0767416621 * l - 3.3077115913 * m1 + 0.2309699292 * s;
    let gLinear = -1.2684380046 * l + 2.6097574011 * m1 - 0.3413193965 * s;
    let bLinear = -0.0041960863 * l - 0.7034186147 * m1 + 1.707614701 * s;

    const gamma = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055);

    let r = Math.min(255, Math.max(0, Math.round(gamma(rLinear) * 255)));
    let g = Math.min(255, Math.max(0, Math.round(gamma(gLinear) * 255)));
    let b_ = Math.min(255, Math.max(0, Math.round(gamma(bLinear) * 255)));

    return A < 1 ? `rgba(${r}, ${g}, ${b_}, ${A})` : `rgb(${r}, ${g}, ${b_})`;
  } catch (e) {
    return 'rgb(51, 51, 51)';
  }
}

export function oklchToRgb(colorStr: string): string {
  if (!colorStr || !colorStr.includes('oklch')) return colorStr;

  let result = '';
  let i = 0;
  while (i < colorStr.length) {
    const oklchIndex = colorStr.indexOf('oklch(', i);
    if (oklchIndex === -1) {
      result += colorStr.slice(i);
      break;
    }

    result += colorStr.slice(i, oklchIndex);

    let parenCount = 1;
    let endIdx = -1;
    for (let j = oklchIndex + 6; j < colorStr.length; j++) {
      if (colorStr[j] === '(') parenCount++;
      else if (colorStr[j] === ')') {
        parenCount--;
        if (parenCount === 0) {
          endIdx = j;
          break;
        }
      }
    }

    if (endIdx === -1) {
      result += colorStr.slice(oklchIndex);
      break;
    }

    const innerContent = colorStr.slice(oklchIndex + 6, endIdx);
    const converted = parseAndConvertOklch(innerContent);
    result += converted;
    i = endIdx + 1;
  }

  return result;
}

export function sanitizeClonedDocForHtml2Canvas(clonedDoc: Document, clonedElement?: HTMLElement | null) {
  // Fast style tag sanitization
  const styleTags = clonedDoc.querySelectorAll('style');
  styleTags.forEach((styleTag) => {
    if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
      styleTag.textContent = oklchToRgb(styleTag.textContent);
    }
  });

  // Fast node style cleanup
  const rootNode = clonedElement || clonedDoc.body;
  if (rootNode) {
    const cloneNodes = [rootNode, ...Array.from(rootNode.querySelectorAll('*'))] as HTMLElement[];
    for (let k = 0; k < cloneNodes.length; k++) {
      const cloneEl = cloneNodes[k];
      if (!cloneEl) continue;

      const styleAttr = cloneEl.getAttribute('style');
      if (styleAttr && styleAttr.includes('oklch')) {
        cloneEl.setAttribute('style', oklchToRgb(styleAttr));
      }
    }
  }
}

export async function exportPdfFromRef(
  pdfRef: RefObject<HTMLDivElement | null>,
  title: string = 'DocCraft-Publication',
  onProgress?: (progress: number) => void
): Promise<boolean> {
  if (!pdfRef.current) {
    throw new Error('Canvas element not found. Please ensure the workspace is visible.');
  }

  const pageElements = Array.from(pdfRef.current.querySelectorAll('.pdf-page')) as HTMLElement[];
  if (!pageElements || pageElements.length === 0) {
    throw new Error('No printable PDF pages were found in the current workspace.');
  }

  onProgress?.(15);

  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'letter'
  });

  const total = pageElements.length;
  let completedCount = 0;

  // Render pages concurrently for maximum speed
  const canvasPromises = pageElements.map(async (pageEl) => {
    const rect = pageEl.getBoundingClientRect();
    const widthMm = (rect.width * 25.4) / 96;
    const heightMm = (rect.height * 25.4) / 96;

    const hasOklch = pageEl.outerHTML.includes('oklch');

    const canvas = await html2canvas(pageEl, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      onclone: (clonedDoc, clonedElement) => {
        sanitizeClonedDocForHtml2Canvas(clonedDoc, clonedElement);
      }
    });

    completedCount++;
    onProgress?.(Math.round(15 + (completedCount / total) * 75));

    return {
      canvas,
      widthMm,
      heightMm
    };
  });

  const pageResults = await Promise.all(canvasPromises);

  pageResults.forEach((res, i) => {
    const imgData = res.canvas.toDataURL('image/png');
    if (i > 0) {
      pdf.addPage([res.widthMm, res.heightMm], res.widthMm > res.heightMm ? 'l' : 'p');
    } else {
      pdf.deletePage(1);
      pdf.addPage([res.widthMm, res.heightMm], res.widthMm > res.heightMm ? 'l' : 'p');
    }
    pdf.addImage(imgData, 'PNG', 0, 0, res.widthMm, res.heightMm);
  });

  onProgress?.(100);

  const fileName = `${(title || 'DocCraft-Studio').toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
  pdf.save(fileName);
  return true;
}
