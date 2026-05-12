// Drop-in replacement for the downloadPDF function in AuditResultPage.tsx
// Uses jsPDF — no extra dependencies needed.

import jsPDF from 'jspdf';

interface ToolResult {
  toolName: string;
  currentSpend: number;
  recommendedSpend: number;
  savings: number;
  recommendedAction: string;
  reason: string;
}

interface AuditResults {
  totalSavings: number;
  annualSavings: number;
  totalCurrentSpend: number;
  hasHighSavings: boolean;
  results: ToolResult[];
}

interface AuditData {
  teamSize: number;
  useCase: string;
  tools: any[];
}

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  navy:        [15,  43,  90]  as [number, number, number],
  navyLight:   [26,  58, 107]  as [number, number, number],
  green:       [16, 185, 129]  as [number, number, number],
  greenLight:  [209, 250, 229] as [number, number, number],
  amber:       [245, 158,  11] as [number, number, number],
  amberLight:  [254, 243, 199] as [number, number, number],
  ink:         [15,  14,  13]  as [number, number, number],
  muted:       [107, 106, 102] as [number, number, number],
  subtle:      [140, 138, 134] as [number, number, number],
  border:      [226, 224, 219] as [number, number, number],
  white:       [255, 255, 255] as [number, number, number],
  pageGray:    [247, 246, 243] as [number, number, number],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setDraw(doc: jsPDF, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function setTxt(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function rect(doc: jsPDF, x: number, y: number, w: number, h: number, style: 'F' | 'S' | 'FD' = 'F') {
  doc.rect(x, y, w, h, style);
}

function roundRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, style: 'F' | 'S' | 'FD' = 'F') {
  doc.roundedRect(x, y, w, h, r, r, style);
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function downloadPDF(auditData: AuditData | null, auditResults: AuditResults | null) {
  if (!auditData || !auditResults) return;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const PW = 210;
  const PH = 297;
  const ML = 20;
  const MR = 20;
  const CW = PW - ML - MR;

  // ── PAGE 1 HEADER ──────────────────────────────────────────────────────────
  setFill(doc, C.navy);
  rect(doc, 0, 0, PW, 50);

  setFill(doc, C.navyLight);
  doc.triangle(PW - 50, 0, PW, 0, PW, 50, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setTxt(doc, C.white);
  doc.text('AI SPEND AUDIT', ML, 18);

  setFill(doc, C.green);
  rect(doc, ML, 21, 28, 0.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setTxt(doc, C.white);
  doc.text('Your AI Cost Report', ML, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setTxt(doc, [180, 190, 210] as any);
  doc.text(`Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, ML, 48);

  // ── SUMMARY CARDS ──────────────────────────────────────────────────────────
  const cardY = 62;
  const cardH = 36;
  const cardW = (CW - 8) / 3;

  const cards = [
    { label: 'MONTHLY SAVINGS', value: `$${auditResults.totalSavings.toLocaleString()}`, sub: 'per month', accent: C.green },
    { label: 'ANNUAL SAVINGS', value: `$${auditResults.annualSavings.toLocaleString()}`, sub: 'per year', accent: C.navyLight },
    { label: 'CURRENT SPEND', value: `$${(auditResults.totalCurrentSpend || 0).toLocaleString()}`, sub: 'per month', accent: C.amber },
  ];

  cards.forEach((card, i) => {
    const cx = ML + i * (cardW + 4);

    setFill(doc, C.white);
    setDraw(doc, C.border);
    roundRect(doc, cx, cardY, cardW, cardH, 3, 'FD');

    setFill(doc, card.accent);
    roundRect(doc, cx, cardY, 3, cardH, 1.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setTxt(doc, C.subtle);
    doc.text(card.label, cx + 8, cardY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    setTxt(doc, C.ink);
    doc.text(card.value, cx + 8, cardY + 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setTxt(doc, C.muted);
    doc.text(card.sub, cx + 8, cardY + 30);
  });

  // ── TEAM INFO ──────────────────────────────────────────────────────────────
  const metaY = cardY + cardH + 10;
  setFill(doc, C.pageGray);
  roundRect(doc, ML, metaY, CW, 16, 2);

  const metas = [
    { label: 'TEAM SIZE', value: `${auditData.teamSize} people` },
    { label: 'TOOLS AUDITED', value: `${auditData.tools.length} tools` },
    { label: 'PRIMARY USE CASE', value: auditData.useCase || 'General' },
  ];

  metas.forEach((m, i) => {
    const mx = ML + 8 + i * (CW / 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setTxt(doc, C.subtle);
    doc.text(m.label, mx, metaY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setTxt(doc, C.ink);
    doc.text(m.value, mx, metaY + 12);
  });

  // ── SECTION HEADER ─────────────────────────────────────────────────────────
  let y = metaY + 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  setTxt(doc, C.ink);
  doc.text('Per-Tool Breakdown', ML, y);

  setFill(doc, C.green);
  rect(doc, ML, y + 2, CW, 0.5);

  y += 10;

  // ── TOOL ROWS ──────────────────────────────────────────────────────────────
  auditResults.results.forEach((result, index) => {
    const rowH = 32;

    if (y + rowH > PH - 25) {
      doc.addPage();
      y = 20;
    }

    if (index % 2 === 0) {
      setFill(doc, C.pageGray);
    } else {
      setFill(doc, C.white);
    }
    setDraw(doc, C.border);
    roundRect(doc, ML, y, CW, rowH, 2, 'FD');

    // Savings badge
    if (result.savings > 0) {
      setFill(doc, C.greenLight);
      roundRect(doc, ML + CW - 38, y + 4, 34, 9, 2);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setTxt(doc, C.green);
      doc.text(`Save $${result.savings}/mo`, ML + CW - 36, y + 10);
    }

    // Tool name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setTxt(doc, C.ink);
    doc.text(result.toolName, ML + 5, y + 8);

    // Current vs Recommended
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setTxt(doc, C.muted);
    doc.text('CURRENT', ML + 5, y + 17);
    doc.text('RECOMMENDED', ML + 40, y + 17);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setTxt(doc, C.ink);
    doc.text(`$${result.currentSpend}/mo`, ML + 5, y + 24);
    setTxt(doc, C.green);
    doc.text(`$${result.recommendedSpend}/mo`, ML + 40, y + 24);

    // Action text (wrapped)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setTxt(doc, C.muted);
    const actionText = result.recommendedAction || 'Current setup is optimized';
    const actionLines = doc.splitTextToSize(`→ ${actionText}`, CW - 95);
    doc.text(actionLines, ML + 90, y + 12);

    y += rowH + 2;
  });

  // ── SAVINGS HIGHLIGHT ──────────────────────────────────────────────────────
  if (y + 32 > PH - 25) {
    doc.addPage();
    y = 20;
  }

  y += 6;
  setFill(doc, C.navy);
  roundRect(doc, ML, y, CW, 30, 3);

  setFill(doc, C.green);
  doc.circle(ML + 14, y + 15, 5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  setTxt(doc, C.white);
  doc.text('✓', ML + 11.5, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setTxt(doc, C.white);
  doc.text(`Total Annual Savings Opportunity: $${auditResults.annualSavings.toLocaleString()}`, ML + 26, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  setTxt(doc, [180, 195, 220] as any);
  const optimizedCount = auditResults.results.filter(r => r.savings > 0).length;
  doc.text(`Found ${optimizedCount} optimization opportunities across ${auditData.tools.length} tools`, ML + 26, y + 22);

  // ── FOOTER (all pages) ─────────────────────────────────────────────────────
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    setFill(doc, C.border);
    rect(doc, 0, PH - 14, PW, 0.4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setTxt(doc, C.subtle);
    doc.text('AI Spend Audit — Find savings in your AI tool spending', ML, PH - 7);
    doc.text(`Page ${p} of ${totalPages}`, PW - MR, PH - 7, { align: 'right' });
  }

  doc.save(`ai-spend-audit-${new Date().toISOString().slice(0, 10)}.pdf`);
}