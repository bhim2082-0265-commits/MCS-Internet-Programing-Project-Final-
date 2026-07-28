const PDFDocument = require('pdfkit');

exports.generatePrescriptionPDF = async (prescription, patient) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fontSize(18).font('Helvetica-Bold').text('Lincoln International Hospital and Research Center', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Dhobidhara, Kathmandu, Nepal', { align: 'center' });
    doc.text('Tel: +977-1-4234567 | Email: info@lincolnhospital.com.np', { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('PRESCRIPTION', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica');
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString('en-NP')}`);
    doc.text(`Patient: ${patient.firstName} ${patient.lastName}`);
    doc.text(`MRN: ${patient.mrn}`);
    doc.text(`Age/Gender: ${patient.gender}`);
    doc.moveDown();
    doc.fontSize(11).font('Helvetica-Bold').text(`Dr. ${prescription.doctorName}`);
    doc.fontSize(10).font('Helvetica').text(`NMC No: ${prescription.nmcNumber}`);
    doc.moveDown();
    doc.fontSize(11).font('Helvetica-Bold').text('Diagnosis:');
    doc.fontSize(10).font('Helvetica').text(prescription.diagnosis);
    doc.moveDown();
    doc.fontSize(11).font('Helvetica-Bold').text('Medications:');
    doc.moveDown(0.5);
    prescription.medications.forEach((med, idx) => {
      doc.fontSize(10).font('Helvetica-Bold').text(`${idx + 1}. ${med.drugName}`);
      doc.font('Helvetica').text(`   Dosage: ${med.dosage} | Frequency: ${med.frequency} | Route: ${med.route} | Duration: ${med.duration}`);
      if (med.instructions) doc.text(`   Instructions: ${med.instructions}`);
    });
    doc.moveDown();
    if (prescription.notes) { doc.fontSize(10).font('Helvetica-Bold').text('Notes:'); doc.font('Helvetica').text(prescription.notes); }
    if (prescription.followUpDate) { doc.moveDown(); doc.text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString('en-NP')}`); }
    doc.moveDown(3);
    doc.moveTo(50, doc.y).lineTo(200, doc.y).stroke();
    doc.text('Doctor Signature');
    doc.end();
  });
};

exports.generateInvoicePDF = async (invoice, patient) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = 595.28, H = 841.89;
    const M = 28;
    const CW = W - (M * 2);
    const FOOTER_H = 20;
    const FOOTER_Y = H - FOOTER_H;

    // ─── Colors ───
    const C = {
      navy: '#0b1a30', navyL: '#102a4a', blue: '#1565c0', blueM: '#1976d2', blueD: '#0d47a1',
      sky: '#42a5f5', paleB: '#bbdefb', ice: '#e8f0fe', ice2: '#f0f6ff',
      teal: '#00897b', tealBg: '#e0f2f1',
      green: '#1b7a2b', greenBg: '#d5ecd8', greenL: '#2e7d32',
      red: '#c62828', redBg: '#f9dede', redL: '#e53935',
      gold: '#e67700', goldBg: '#fff3cd', goldL: '#f57f17',
      purple: '#7b1fa2', purpleBg: '#f3e5f5',
      t: '#111827', tm: '#1f2937', tl: '#6b7280', mu: '#9ca3af',
      br: '#e5e7eb', brd: '#d1d5db', brw: '#f3f4f6',
      wh: '#ffffff'
    };

    const balance = invoice.totalAmount - (invoice.amountPaid || 0);
    const scMap = {
      'Paid':     { bg: C.greenBg, fg: C.green, bd: '#a5d6a7', l: 'PAID', icon: '\u2713' },
      'Partial':  { bg: C.goldBg, fg: C.gold, bd: '#ffe082', l: 'PARTIAL', icon: '\u25D2' },
      'Pending':  { bg: C.redBg, fg: C.red, bd: '#ef9a9a', l: 'UNPAID', icon: '\u2717' },
      'Cancelled':{ bg: C.brw, fg: C.tl, bd: C.brd, l: 'CANCELLED', icon: '\u2716' },
      'Refunded': { bg: C.purpleBg, fg: C.purple, bd: '#ce93d8', l: 'REFUNDED', icon: '\u21A9' }
    };
    const sc = scMap[invoice.status] || scMap['Pending'];
    const mc = {
      'Cash': C.greenL, 'Card': C.blue, 'Bank Transfer': C.purple,
      'eSewa': C.teal, 'Khalti': C.blue, 'ConnectIPS': C.purple, 'Other': C.tl
    };
    const fmtA = (a) => {
      if (!a) return 'N/A';
      if (typeof a === 'string') return a;
      return [a.street, a.city, a.district, a.province].filter(Boolean).join(', ') || 'N/A';
    };

    // ═══════════════════════════════════════════════════════
    //  PAGE BACKGROUND + 0.5mm BORDER
    // ═══════════════════════════════════════════════════════
    doc.rect(0, 0, W, H).fill(C.wh);
    doc.rect(1, 1, W - 2, H - 2).lineWidth(1.42).stroke(C.navy);
    doc.rect(0, 0, 5, H).fill(C.blue);

    // ═══════════════════════════════════════════════════════
    //  HEADER BAR
    // ═══════════════════════════════════════════════════════
    const HDR = 56;
    doc.rect(5, 0, W - 5, HDR).fill(C.navy);
    doc.rect(5, HDR - 2, W - 5, 3).fill(C.blueM);

    // Logo circle
    doc.circle(M + 16, HDR / 2, 14).fillAndStroke(C.blueM, C.sky);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(C.wh).text('LIN', M + 4, HDR / 2 - 7, { width: 24, align: 'center' });
    doc.fontSize(3).font('Helvetica').fillColor(C.paleB).text('HOSPITAL', M + 4, HDR / 2 + 3, { width: 24, align: 'center' });

    // Hospital name
    doc.fontSize(14).font('Helvetica-Bold').fillColor(C.wh).text('Lincoln International Hospital', M + 34, 8, { width: 260 });
    doc.fontSize(6.5).fillColor(C.sky).text('and Research Center', M + 34, 24, { width: 260 });
    doc.fontSize(5).fillColor(C.mu).text('Dhobidhara, Kathmandu, Nepal  |  PAN: 601234567  |  Tel: +977-1-4234567  |  info@lincoln.com.np', M + 34, 35, { width: 340 });

    // TAX INVOICE badge
    const badgeX = W - M - 110;
    doc.roundedRect(badgeX, 4, 110, 20, 3).fill(C.blue);
    doc.fontSize(11).font('Helvetica-Bold').fillColor(C.wh).text('TAX INVOICE', badgeX, 6, { width: 110, align: 'center' });
    doc.fontSize(4.5).fillColor(C.paleB).text('Original Copy', badgeX, 20, { width: 110, align: 'center' });

    // Invoice No + Date card
    doc.roundedRect(badgeX, 28, 110, 24, 2).fillAndStroke(C.ice, C.br);
    doc.fontSize(4.5).font('Helvetica').fillColor(C.tl).text('INVOICE NO.', badgeX + 6, 30, { width: 48 });
    doc.fontSize(7).font('Helvetica-Bold').fillColor(C.blue).text(invoice.invoiceNumber || 'N/A', badgeX + 6, 40, { width: 100 });
    doc.fontSize(4.5).fillColor(C.tl).text('DATE', badgeX + 60, 30, { width: 44 });
    doc.fontSize(5.5).font('Helvetica-Bold').fillColor(C.t).text(
      new Date(invoice.createdAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }),
      badgeX + 60, 40, { width: 44 }
    );

    let y = HDR + 8;

    // ═══════════════════════════════════════════════════════
    //  STATUS + AMOUNT SUMMARY ROW (4 cells, all inside)
    // ═══════════════════════════════════════════════════════
    const saH = 20;
    const saGap = 2;
    const saCellW = (CW - saGap * 3) / 4;

    const drawAmountCell = (cx, label, val, valColor, bgColor, borderColor) => {
      doc.save();
      doc.roundedRect(cx, y, saCellW, saH, 3).fill(bgColor);
      doc.roundedRect(cx, y, saCellW, saH, 3).lineWidth(0.4).stroke(borderColor);
      doc.rect(cx + 5, y + 2, saCellW - 10, 0.3).fill(C.br);
      doc.fontSize(4).font('Helvetica').fillColor(C.tl).text(label, cx + 5, y + 3, { width: saCellW - 10, align: 'left', lineBreak: false });
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(valColor).text(val, cx + 5, y + 10, { width: saCellW - 10, align: 'left', lineBreak: false });
      doc.restore();
    };

    drawAmountCell(M, 'STATUS', `${sc.icon} ${sc.l}`, sc.fg, sc.bg, sc.bd);
    drawAmountCell(M + saCellW + saGap, 'AMOUNT PAID', `Rs. ${(invoice.amountPaid || 0).toLocaleString()}`, C.green, C.ice, C.br);
    drawAmountCell(M + (saCellW + saGap) * 2, 'BALANCE DUE', `Rs. ${balance.toLocaleString()}`, balance > 0 ? C.red : C.green, C.ice, C.br);
    drawAmountCell(M + (saCellW + saGap) * 3, 'TOTAL', `Rs. ${invoice.totalAmount.toLocaleString()}`, C.blue, C.ice, C.br);
    y += saH + 8;

    // ═══════════════════════════════════════════════════════
    //  PATIENT & DOCTOR INFO (side by side tables)
    // ═══════════════════════════════════════════════════════
    const halfW = (CW - 5) / 2;
    const infoRowH = 11;
    const infoHeadH = 12;
    const lastPay = invoice.payments?.length ? invoice.payments[invoice.payments.length - 1] : null;

    const drawInfoBox = (bx, title, rows) => {
      const boxH = infoHeadH + rows.length * infoRowH + 1;
      doc.save();
      doc.roundedRect(bx, y, halfW, boxH, 3).fillAndStroke(C.wh, C.brd);
      doc.rect(bx + 1, y + 1, halfW - 2, infoHeadH).fill(C.blue);
      doc.roundedRect(bx, y, halfW, infoHeadH, 3).fill(C.blue);
      doc.rect(bx, y + 8, halfW, 4).fill(C.blue);
      doc.fontSize(5.5).font('Helvetica-Bold').fillColor(C.wh).text(title, bx + 6, y + 3, { width: halfW - 12, lineBreak: false });

      let ry = y + infoHeadH + 1;
      const labelW = 50;
      const valW = halfW - labelW - 12;
      rows.forEach(([label, val, vClr, vBold], idx) => {
        doc.rect(bx + 1, ry, halfW - 2, infoRowH).fill(idx % 2 === 0 ? C.wh : C.ice);
        doc.rect(bx + 1, ry, halfW - 2, 0.3).fill(C.br);
        doc.fontSize(5).font('Helvetica-Bold').fillColor(C.tl).text(label, bx + 6, ry + 3, { width: labelW, lineBreak: false });
        doc.font(vBold ? 'Helvetica-Bold' : 'Helvetica').fillColor(vClr || C.t).text(val, bx + 6 + labelW, ry + 3, { width: valW, lineBreak: false, ellipsis: true });
        ry += infoRowH;
      });
      doc.rect(bx + 1, ry, halfW - 2, 0.5).fill(C.brd);
      doc.restore();
    };

    drawInfoBox(M, 'PATIENT DETAILS', [
      ['Name', `${patient.firstName} ${patient.lastName}`, C.t, true],
      ['MRN', patient.mrn, C.blue, true],
      ['Phone', patient.phone || 'N/A', C.t, false],
      ['Address', fmtA(patient.address), C.t, false]
    ]);

    drawInfoBox(M + halfW + 5, 'DOCTOR DETAILS', [
      ['Doctor', invoice.doctorName || 'N/A', C.t, true],
      ['Department', invoice.doctorDepartment || 'N/A', C.t, false],
      ['Payment', lastPay ? lastPay.method : (invoice.paymentMethod || 'N/A'), C.t, true],
      ['Pay Date', lastPay ? new Date(lastPay.paidAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A', C.t, false]
    ]);

    y += infoHeadH + 4 * infoRowH + 1 + 7;

    // ═══════════════════════════════════════════════════════
    //  ITEMS TABLE (all values inside cells)
    // ═══════════════════════════════════════════════════════
    const icPad = 3;
    const ic = [
      { x: M, w: 18, hd: '#', al: 'center' },
      { x: M + 18, w: 175, hd: 'DESCRIPTION', al: 'left' },
      { x: M + 193, w: 58, hd: 'CATEGORY', al: 'left' },
      { x: M + 251, w: 28, hd: 'QTY', al: 'center' },
      { x: M + 279, w: 68, hd: 'UNIT PRICE', al: 'right' },
      { x: M + 347, w: 28, hd: 'TAX', al: 'center' },
      { x: M + 375, w: CW - 375, hd: 'AMOUNT', al: 'right' }
    ];
    const irH = 13;

    // Table header
    doc.save();
    doc.rect(M, y, CW, 14).fill(C.blue);
    ic.forEach(col => {
      doc.fontSize(5).font('Helvetica-Bold').fillColor(C.wh)
        .text(col.hd, col.x + icPad, y + 4, { width: col.w - icPad * 2, align: col.al, lineBreak: false });
    });
    ic.forEach((col, i) => { if (i > 0) doc.rect(col.x, y + 2, 0.4, 10).fill(C.wh + '50'); });
    doc.restore();
    y += 14;

    // Data rows
    (invoice.items || []).forEach((item, idx) => {
      doc.save();
      doc.rect(M, y, CW, irH).fill(idx % 2 === 0 ? C.wh : C.ice2);
      doc.rect(M + 1, y, 2.5, irH).fill(idx % 2 === 0 ? C.blueM : C.sky);

      doc.fontSize(5.5).font('Helvetica').fillColor(C.tm);
      doc.text(`${idx + 1}`, ic[0].x + icPad, y + 3.5, { width: ic[0].w - icPad * 2, align: 'center', lineBreak: false });
      doc.font('Helvetica-Bold').fillColor(C.t).text(item.description, ic[1].x + icPad, y + 3.5, { width: ic[1].w - icPad * 2, lineBreak: false, ellipsis: true });
      doc.font('Helvetica').fillColor(C.tl).text(item.category || 'Other', ic[2].x + icPad, y + 3.5, { width: ic[2].w - icPad * 2, lineBreak: false, ellipsis: true });
      doc.text(`${item.quantity}`, ic[3].x + icPad, y + 3.5, { width: ic[3].w - icPad * 2, align: 'center', lineBreak: false });
      doc.text(`Rs. ${item.unitPrice.toLocaleString()}`, ic[4].x + icPad, y + 3.5, { width: ic[4].w - icPad * 2, align: 'right', lineBreak: false });
      doc.fillColor(item.isTaxable !== false ? C.greenL : C.mu)
        .text(item.isTaxable !== false ? 'Yes' : 'No', ic[5].x + icPad, y + 3.5, { width: ic[5].w - icPad * 2, align: 'center', lineBreak: false });
      doc.font('Helvetica-Bold').fillColor(C.t)
        .text(`Rs. ${item.total.toLocaleString()}`, ic[6].x + icPad, y + 3.5, { width: ic[6].w - icPad * 2, align: 'right', lineBreak: false });

      ic.forEach((col, i) => { if (i > 0) doc.rect(col.x, y, 0.3, irH).fill(C.br); });
      doc.restore();
      y += irH;
    });

    doc.rect(M, y, CW, 1.5).fill(C.blue);
    y += 8;

    // ═══════════════════════════════════════════════════════
    //  BOTTOM SECTION: PAYMENT HISTORY (left) + BILLING SUMMARY (right)
    // ═══════════════════════════════════════════════════════
    const sumW = 200;
    const phW = CW - sumW - 6;
    const sumX = M + CW - sumW;
    const secTop = y;
    const secHeadH = 12;

    // ── PAYMENT HISTORY TABLE (left, all values inside) ──
    doc.save();
    doc.rect(M, secTop, phW, secHeadH).fill(C.blue);
    doc.roundedRect(M, secTop, phW, secHeadH, 2).fill(C.blue);
    doc.fontSize(5).font('Helvetica-Bold').fillColor(C.wh)
      .text(`PAYMENT HISTORY  (${(invoice.payments || []).length})`, M + 5, secTop + 3, { width: phW - 10, lineBreak: false });
    doc.restore();

    const phPad = 2;
    const phColX = [M + 2, M + 14, M + 60, M + 90, M + 134, M + 176];
    const phColW = [12, 44, 28, 42, 40, phW - 180];

    let phy = secTop + secHeadH;
    // Column headers
    doc.save();
    doc.rect(M, phy, phW, 8).fill(C.ice);
    doc.fontSize(3.8).font('Helvetica-Bold').fillColor(C.tl);
    ['#', 'DATE', 'METHOD', 'AMOUNT', 'TXN ID', 'NOTES'].forEach((h, i) => {
      doc.text(h, phColX[i], phy + 2, { width: phColW[i], lineBreak: false });
    });
    doc.restore();
    phy += 8;
    doc.rect(M, phy, phW, 0.3).fill(C.br);
    phy += 0.5;

    // Payment data rows
    const maxPhRows = 6;
    const payments = (invoice.payments || []).slice(0, maxPhRows);
    payments.forEach((p, idx) => {
      doc.save();
      doc.rect(M + 0.5, phy, phW - 1, 9).fill(idx % 2 === 0 ? C.wh : C.ice2);
      doc.fontSize(4.5).font('Helvetica').fillColor(C.tm);
      doc.text(`${p.installmentNumber || idx + 1}`, phColX[0], phy + 2, { width: phColW[0], lineBreak: false });
      doc.text(new Date(p.paidAt).toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: '2-digit' }), phColX[1], phy + 2, { width: phColW[1], lineBreak: false });
      const clr = mc[p.method] || C.tl;
      doc.roundedRect(phColX[2], phy + 1, 26, 7, 1.5).fill(clr);
      doc.fontSize(3.5).font('Helvetica-Bold').fillColor(C.wh).text(p.method, phColX[2] + 1, phy + 2.5, { width: 24, align: 'center', lineBreak: false });
      doc.font('Helvetica-Bold').fillColor(C.t).text(`Rs. ${p.amount.toLocaleString()}`, phColX[3], phy + 2, { width: phColW[3], lineBreak: false });
      doc.font('Helvetica').fillColor(C.tl).text(p.transactionId || '-', phColX[4], phy + 2, { width: phColW[4], lineBreak: false, ellipsis: true });
      doc.text(p.notes || '-', phColX[5], phy + 2, { width: phColW[5], lineBreak: false, ellipsis: true });
      phColX.forEach((cx, ci) => { if (ci > 0) doc.rect(cx - 1, phy, 0.3, 9).fill(C.br); });
      doc.restore();
      phy += 9;
      if (p.splitPayments?.length > 1) {
        doc.save();
        doc.rect(M + 0.5, phy, phW - 1, 6).fill(C.ice);
        doc.fontSize(3.5).fillColor(C.mu).text('  Split: ' + p.splitPayments.map(sp => `${sp.method}: Rs.${sp.amount.toLocaleString()}`).join(' | '), phColX[1], phy + 1, { width: phW - phColX[1] + M - 4, lineBreak: false, ellipsis: true });
        doc.restore();
        phy += 6;
      }
    });
    if ((invoice.payments || []).length > maxPhRows) {
      doc.save();
      doc.fontSize(3.5).fillColor(C.mu).text(`  ... and ${(invoice.payments || []).length - maxPhRows} more`, phColX[1], phy, { width: phW - 20, lineBreak: false });
      doc.restore();
      phy += 6;
    }
    doc.rect(M, phy, phW, 0.4).fill(C.brd);
    phy += 1;

    // ── BILLING SUMMARY TABLE (right, all values inside) ──
    doc.save();
    doc.rect(sumX, secTop, sumW, secHeadH).fill(C.blue);
    doc.roundedRect(sumX, secTop, sumW, secHeadH, 2).fill(C.blue);
    doc.fontSize(5).font('Helvetica-Bold').fillColor(C.wh).text('BILLING SUMMARY', sumX + 5, secTop + 3, { width: sumW - 10, lineBreak: false });
    doc.restore();

    let sY = secTop + secHeadH;
    const bsRowH = 11;
    const bsLabelW = 82;
    const bsValW = sumW - bsLabelW - 14;
    const sumRows = [
      ['Subtotal', `Rs. ${(invoice.subtotal || 0).toLocaleString()}`, C.tm, false],
      [`VAT (${invoice.taxRate || 13}%)`, `Rs. ${(invoice.taxAmount || 0).toLocaleString()}`, C.tm, false],
    ];
    if (invoice.discount > 0) sumRows.push(['Discount', `- Rs. ${invoice.discount.toLocaleString()}`, C.greenL, false]);
    sumRows.push(['TOTAL', `Rs. ${(invoice.totalAmount || 0).toLocaleString()}`, C.blue, true]);
    sumRows.push(['Amount Paid', `Rs. ${(invoice.amountPaid || 0).toLocaleString()}`, C.greenL, true]);
    sumRows.push(['Balance Due', `Rs. ${balance.toLocaleString()}`, balance > 0 ? C.red : C.greenL, true]);

    sumRows.forEach(([label, val, color, bold], idx) => {
      doc.save();
      doc.rect(sumX + 1, sY, sumW - 2, bsRowH).fill(idx % 2 === 0 ? C.wh : C.ice2);
      doc.rect(sumX + 1, sY, sumW - 2, 0.3).fill(C.br);
      doc.fontSize(bold ? 5.5 : 5).font('Helvetica').fillColor(C.tl).text(label, sumX + 5, sY + 3, { width: bsLabelW, lineBreak: false });
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(color).text(val, sumX + 5 + bsLabelW, sY + 3, { width: bsValW, align: 'right', lineBreak: false });
      doc.restore();
      sY += bsRowH;
    });
    doc.rect(sumX + 1, sY, sumW - 2, 0.4).fill(C.brd);
    sY += 2;

    // Status badge under billing
    doc.save();
    doc.roundedRect(sumX, sY, sumW, 11, 2).fill(sc.bg);
    doc.roundedRect(sumX, sY, sumW, 11, 2).lineWidth(0.4).stroke(sc.bd);
    doc.fontSize(5.5).font('Helvetica-Bold').fillColor(sc.fg).text(`${sc.icon} STATUS: ${sc.l}`, sumX + 5, sY + 2.5, { width: sumW - 10, align: 'center', lineBreak: false });
    doc.restore();
    sY += 14;

    y = Math.max(phy, sY) + 6;

    // ═══════════════════════════════════════════════════════
    //  SIGNATURES TABLE
    // ═══════════════════════════════════════════════════════
    doc.rect(M, y, CW, 0.3).fill(C.br);
    y += 4;

    const sigW = (CW - 10) / 3;
    const sigH = 26;
    const drawSig = (sx, title, line, align) => {
      doc.save();
      doc.roundedRect(sx, y, sigW, sigH, 2).fillAndStroke(C.wh, C.brd);
      doc.moveTo(sx + 5, y + 13).lineTo(sx + sigW - 5, y + 13).stroke(C.brd);
      doc.fontSize(4.5).font('Helvetica-Bold').fillColor(C.t).text(title, sx + 5, y + 15, { width: sigW - 10, align, lineBreak: false });
      doc.fontSize(3.5).font('Helvetica').fillColor(C.tl).text(line, sx + 5, y + 21, { width: sigW - 10, align, lineBreak: false });
      doc.restore();
    };
    drawSig(M, 'Authorized Signatory', `Date: ${new Date().toLocaleDateString('en-NP')}`, 'left');
    drawSig(M + sigW + 5, 'Hospital Stamp / Seal', 'SEAL', 'center');
    drawSig(M + (sigW + 5) * 2, 'Patient Signature', `Date: ${new Date().toLocaleDateString('en-NP')}`, 'right');
    y += sigH + 5;

    // ═══════════════════════════════════════════════════════
    //  TERMS & CONDITIONS
    // ═══════════════════════════════════════════════════════
    doc.rect(M, y, CW, 0.3).fill(C.br);
    y += 3;
    doc.roundedRect(M, y, CW, 14, 2).fillAndStroke(C.ice, C.br);
    doc.fontSize(4).font('Helvetica-Bold').fillColor(C.blue).text('Terms:', M + 5, y + 1, { width: 24, lineBreak: false });
    doc.fontSize(3.5).font('Helvetica').fillColor(C.tl)
      .text(invoice.termsAndConditions || 'Thank you for choosing Lincoln International Hospital. Payments are non-refundable. Please confirm all details before payment.', M + 30, y + 1, { width: CW - 36, lineBreak: false, ellipsis: true });
    y += 18;

    // ═══════════════════════════════════════════════════════
    //  FOOTER (pinned at bottom)
    // ═══════════════════════════════════════════════════════
    doc.rect(5, FOOTER_Y - 1, W - 5, FOOTER_H + 1).fill(C.navy);
    doc.rect(5, FOOTER_Y - 2, W - 5, 2).fill(C.blueM);
    doc.fontSize(3.5).font('Helvetica').fillColor(C.mu)
      .text(`Generated on ${new Date().toLocaleString('en-NP')}`, M, FOOTER_Y + 2, { width: CW, align: 'center', lineBreak: false });
    doc.fontSize(4.5).font('Helvetica-Bold').fillColor(C.sky)
      .text('Lincoln International Hospital and Research Center  |  Dhobidhara, Kathmandu, Nepal', M, FOOTER_Y + 8, { width: CW, align: 'center', lineBreak: false });
    doc.fontSize(3.5).fillColor(C.mu).text('This is a computer-generated invoice. No signature required if paid digitally.', M, FOOTER_Y + 14, { width: CW, align: 'center', lineBreak: false });

    doc.end();
  });
};
