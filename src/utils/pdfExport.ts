import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { SimulatorInput, CalculationResult } from '../types';
import { buildPdfHtml } from './pdfTemplate';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const SCALE = 2;

export async function exportPdf(
  input: SimulatorInput,
  result: CalculationResult,
): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '720px';
  container.style.background = '#fff';
  container.innerHTML = buildPdfHtml(input, result);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: SCALE,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgWidth = A4_WIDTH_MM;
    const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;
    const pdf = new jsPDF('p', 'mm', 'a4');

    let remainingHeight = imgHeight;
    let srcY = 0;
    let page = 0;

    while (remainingHeight > 0) {
      if (page > 0) pdf.addPage();

      const sliceHeight = Math.min(remainingHeight, A4_HEIGHT_MM);
      const sliceCanvasHeight = (sliceHeight / imgHeight) * canvas.height;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceCanvasHeight;
      const ctx = sliceCanvas.getContext('2d')!;
      ctx.drawImage(
        canvas,
        0,
        srcY,
        canvas.width,
        sliceCanvasHeight,
        0,
        0,
        canvas.width,
        sliceCanvasHeight,
      );

      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', 0, 0, imgWidth, sliceHeight);

      srcY += sliceCanvasHeight;
      remainingHeight -= A4_HEIGHT_MM;
      page++;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    pdf.save(`ふるさと納税シミュレーション_${dateStr}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
