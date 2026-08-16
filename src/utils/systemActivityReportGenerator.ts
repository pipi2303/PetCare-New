import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuditLog } from '../types';

export interface SystemActivityReportOptions {
  logs: AuditLog[];
  reportTitle?: string;
  reportScope?: 'all' | 'clinical' | 'financial' | 'critical' | 'master' | 'security';
  periodLabel?: string;
  startDate?: string;
  endDate?: string;
  branchName?: string;
  adminName?: string;
  adminRole?: string;
  includeDiffSnapshot?: boolean;
  includeDigitalSignatures?: boolean;
  customNotes?: string;
}

/**
 * Categorizes an audit log into Clinical, Financial, Security, Master, or Operational
 */
export const getAuditLogCategory = (
  log: AuditLog
): 'Klinis (EMR & Farmasi)' | 'Finansial & Billing' | 'Keamanan & Akses' | 'Master & SDM' | 'Operasional' => {
  const m = (log.module || '').toLowerCase();
  const t = (log.target || '').toLowerCase();
  const a = (log.action || '').toLowerCase();
  const d = (log.details || '').toLowerCase();

  if (
    m.includes('klinik') ||
    m.includes('emr') ||
    m.includes('pemeriksaan') ||
    m.includes('apotek') ||
    m.includes('farmasi') ||
    m.includes('resep') ||
    m.includes('vaksin') ||
    m.includes('monitoring') ||
    m.includes('rawat inap') ||
    m.includes('lab') ||
    m.includes('e-form') ||
    t.includes('soap') ||
    t.includes('pasien') ||
    t.includes('resep') ||
    t.includes('drg') ||
    t.includes('obat')
  ) {
    return 'Klinis (EMR & Farmasi)';
  }

  if (
    m.includes('kasir') ||
    m.includes('billing') ||
    m.includes('keuangan') ||
    m.includes('buku kas') ||
    m.includes('tarif') ||
    m.includes('purchasing') ||
    m.includes('faktur') ||
    a === 'bayar' ||
    t.includes('inv') ||
    t.includes('rp ') ||
    d.includes('pembayaran') ||
    d.includes('qris') ||
    d.includes('tarif')
  ) {
    return 'Finansial & Billing';
  }

  if (
    m.includes('keamanan') ||
    m.includes('autentikasi') ||
    m.includes('login') ||
    m.includes('sesi') ||
    a === 'login' ||
    a === 'logout' ||
    t.includes('ip ') ||
    t.includes('sesi')
  ) {
    return 'Keamanan & Akses';
  }

  if (
    m.includes('master') ||
    m.includes('sdm') ||
    m.includes('karyawan') ||
    m.includes('inventaris') ||
    m.includes('gudang') ||
    m.includes('stok')
  ) {
    return 'Master & SDM';
  }

  return 'Operasional';
};

/**
 * Generate PDF System Activity Report with executive summary and forensic audit tables
 */
export const generateSystemActivityReportPDF = (options: SystemActivityReportOptions): jsPDF => {
  // Use Landscape for high data density and clean diff layout
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 210 mm
  const docRefNo = `AUD-SYS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const printTimestamp = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate high-level metrics
  const totalCount = options.logs.length;
  const clinicalLogs = options.logs.filter((l) => getAuditLogCategory(l) === 'Klinis (EMR & Farmasi)');
  const financialLogs = options.logs.filter((l) => getAuditLogCategory(l) === 'Finansial & Billing');
  const criticalLogs = options.logs.filter((l) => (l.severity || 'Info') === 'Kritis' || l.action === 'Hapus' || (l.module || '').includes('Keamanan'));
  const warningLogs = options.logs.filter((l) => (l.severity || 'Info') === 'Warning' || l.action === 'Edit' || l.action === 'Dispense');

  // Top Accent Bar (VetCare Pro Navy & Gold)
  doc.setFillColor(27, 42, 69); // #1B2A45
  doc.rect(0, 0, pageWidth, 5.5, 'F');
  doc.setFillColor(184, 144, 90); // #B8905A
  doc.rect(0, 5.5, pageWidth, 1.5, 'F');

  // Emblem Box
  doc.setFillColor(27, 42, 69);
  doc.roundedRect(12, 11, 14, 14, 2.5, 2.5, 'F');
  doc.setFillColor(184, 144, 90);
  doc.circle(19, 18, 4, 'F');
  doc.setTextColor(255, 253, 249);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('+', 19, 19.2, { align: 'center' });

  // Clinic Header Typography
  doc.setTextColor(27, 42, 69);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VETCARE PRO - HOSPITAL MANAGEMENT & ELECTRONIC MEDICAL RECORDS', 30, 16);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 102, 86);
  doc.text('Sistem Informasi Manajemen Rumah Sakit Hewan & Pengawasan Integritas Rekam Medis Terakreditasi', 30, 20);
  doc.text('Kepatuhan Audit Regulasi: UU ITE & Standar Rekam Medis Veteriner Elektronik (RMVE)', 30, 24);

  // Branch & Confidentiality Badge
  doc.setFillColor(246, 241, 230);
  doc.roundedRect(pageWidth - 75, 10, 63, 15, 2, 2, 'F');
  doc.setDrawColor(225, 214, 190);
  doc.roundedRect(pageWidth - 75, 10, 63, 15, 2, 2, 'S');

  doc.setTextColor(184, 144, 90);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS DOKUMEN:', pageWidth - 43.5, 14, { align: 'center' });

  doc.setTextColor(27, 42, 69);
  doc.setFontSize(7.5);
  doc.text('OFFICIAL SYSTEM AUDIT TRAIL', pageWidth - 43.5, 18, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(107, 102, 86);
  doc.text(`Cabang: ${options.branchName || 'Semua Unit Operasional'}`, pageWidth - 43.5, 22.5, { align: 'center' });

  // Divider Line
  doc.setDrawColor(27, 42, 69);
  doc.setLineWidth(0.6);
  doc.line(12, 28, pageWidth - 12, 28);
  doc.setDrawColor(184, 144, 90);
  doc.setLineWidth(0.3);
  doc.line(12, 29, pageWidth - 12, 29);

  // Title Banner
  doc.setFillColor(27, 42, 69);
  doc.roundedRect(12, 32, pageWidth - 24, 14, 2, 2, 'F');

  doc.setTextColor(217, 185, 138);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN PENGAWASAN KEAMANAN & MODIFIKASI DATA SISTEM', 16, 37);

  doc.setTextColor(255, 253, 249);
  doc.setFontSize(10);
  doc.text(options.reportTitle || 'SYSTEM ACTIVITY REPORT: AUDIT REKAM KLINIS & TRANSAKSI FINANSIAL', 16, 42.5);

  // Metadata right
  doc.setTextColor(217, 185, 138);
  doc.setFontSize(7);
  doc.text(`Cakupan: ${options.periodLabel || 'Log Terfilter'}`, pageWidth - 16, 37, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref: ${docRefNo} | Waktu Ekstraksi: ${printTimestamp} WIB`, pageWidth - 16, 42.5, { align: 'right' });

  // 4 KPI Summary Cards
  const cardY = 49;
  const cardW = (pageWidth - 24 - 9) / 4; // 4 cards with 3mm gap
  const cardH = 14;

  // Card 1: Total Log
  doc.setFillColor(254, 253, 250);
  doc.setDrawColor(225, 214, 190);
  doc.roundedRect(12, cardY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 102, 86);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL EVENT TERCATAT', 15, cardY + 4.5);
  doc.setFontSize(11);
  doc.setTextColor(27, 42, 69);
  doc.text(`${totalCount} Log`, 15, cardY + 11);

  // Card 2: Modifikasi Klinis
  const card2X = 12 + cardW + 3;
  doc.setFillColor(254, 253, 250);
  doc.roundedRect(card2X, cardY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 102, 86);
  doc.text('REKAM MEDIS & RESEP KLINIS', card2X + 3, cardY + 4.5);
  doc.setFontSize(11);
  doc.setTextColor(13, 148, 136); // Teal
  doc.text(`${clinicalLogs.length} Modifikasi`, card2X + 3, cardY + 11);

  // Card 3: Modifikasi Finansial & Kasir
  const card3X = card2X + cardW + 3;
  doc.setFillColor(254, 253, 250);
  doc.roundedRect(card3X, cardY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 102, 86);
  doc.text('BILLING, TARIF & KEUANGAN', card3X + 3, cardY + 4.5);
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text(`${financialLogs.length} Transaksi`, card3X + 3, cardY + 11);

  // Card 4: Kritis & Warning
  const card4X = card3X + cardW + 3;
  doc.setFillColor(254, 253, 250);
  doc.roundedRect(card4X, cardY, cardW, cardH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setTextColor(107, 102, 86);
  doc.text('RISIKO KRITIS & PERINGATAN', card4X + 3, cardY + 4.5);
  doc.setFontSize(11);
  doc.setTextColor(225, 29, 72); // Rose
  doc.text(`${criticalLogs.length} Kritis / ${warningLogs.length} Warn`, card4X + 3, cardY + 11);

  // Section Heading
  let currentY = cardY + cardH + 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 69);
  doc.text('I. RINCIAN TABEL JEJAK AUDIT & MODIFIKASI DATA (AUDIT TRAIL)', 12, currentY);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 102, 86);
  doc.text(
    `Administrator Pencetak: ${options.adminName || 'Admin Utama'} (${options.adminRole || 'Superadmin'}) | Filter Cakupan: ${options.reportScope ? options.reportScope.toUpperCase() : 'SEMUA AKTIVITAS'}`,
    pageWidth - 12,
    currentY,
    { align: 'right' }
  );

  // Table Body preparation
  const tableData = options.logs.map((log, index) => {
    const category = getAuditLogCategory(log);
    const severity = log.severity || 'Info';
    
    let detailsText = log.details || '-';
    if (options.includeDiffSnapshot !== false) {
      if (log.previousValue || log.newValue) {
        detailsText += `\n[Diff Perubahan]`;
        if (log.previousValue) detailsText += `\n- Sebelum: ${log.previousValue}`;
        if (log.newValue) detailsText += `\n- Sesudah: ${log.newValue}`;
      }
    }

    return [
      (index + 1).toString(),
      log.timestamp || '-',
      `${log.userName}\n(${log.userRole})`,
      log.branchName || options.branchName || 'Klinik Utama',
      log.module || '-',
      category,
      `${log.action}\n[${severity.toUpperCase()}]`,
      log.target || '-',
      detailsText
    ];
  });

  autoTable(doc, {
    startY: currentY + 2,
    head: [[
      'No',
      'Waktu (WIB)',
      'Pengguna / Role',
      'Cabang',
      'Modul Sistem',
      'Kategori Record',
      'Aksi & Risiko',
      'Target Objek / Dokumen',
      'Rincian Aktivitas & Diff Nilai Snapshot'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [27, 42, 69],
      textColor: [255, 253, 249],
      fontSize: 6.8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26, font: 'courier', fontSize: 6.2 },
      2: { cellWidth: 28, fontStyle: 'bold', fontSize: 6.5 },
      3: { cellWidth: 24, fontSize: 6.2 },
      4: { cellWidth: 28, fontSize: 6.5 },
      5: { cellWidth: 28, fontSize: 6.5 },
      6: { cellWidth: 24, halign: 'center', fontSize: 6.2, fontStyle: 'bold' },
      7: { cellWidth: 38, fontSize: 6.5 },
      8: { cellWidth: 'auto', fontSize: 6.2 }
    },
    styles: {
      textColor: [34, 36, 43],
      lineColor: [225, 214, 190],
      lineWidth: 0.15,
      cellPadding: 2,
      overflow: 'linebreak'
    },
    alternateRowStyles: {
      fillColor: [254, 253, 250]
    },
    margin: { left: 12, right: 12 },
    didParseCell: (data) => {
      // Highlight Kritis or Warning in column 6
      if (data.section === 'body' && data.column.index === 6) {
        const text = String(data.cell.raw);
        if (text.includes('KRITIS')) {
          data.cell.styles.textColor = [190, 18, 60]; // Rose
          data.cell.styles.fontStyle = 'bold';
        } else if (text.includes('WARNING')) {
          data.cell.styles.textColor = [180, 83, 9]; // Amber
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [3, 105, 161]; // Sky
        }
      }
    }
  });

  let finalY = (doc as any).lastAutoTable.finalY + 6;

  // If table is close to page bottom, add a new page
  if (finalY > 165) {
    doc.addPage();
    finalY = 18;
  }

  // Security Integrity & Regulatory Notes
  doc.setFillColor(246, 241, 230);
  doc.roundedRect(12, finalY, pageWidth - 24, 14, 1.5, 1.5, 'F');
  doc.setDrawColor(225, 214, 190);
  doc.roundedRect(12, finalY, pageWidth - 24, 14, 1.5, 1.5, 'S');

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 69);
  doc.text('PERNYATAAN INTEGRITAS AUDIT & FORENSIK DIGITAL:', 16, finalY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(107, 102, 86);
  doc.text(
    `Setiap log di atas dihasilkan otomatis oleh modul Audit Trail VetCare Pro secara immutable (tidak dapat dihapus manual). Seluruh modifikasi rekam medis klinis dan billing tersimpan dengan verifikasi hash SHA-256 dan terikat pada autentikasi sesi pengguna yang sah.`,
    16,
    finalY + 8.5
  );
  doc.text(
    `Catatan Tambahan: ${options.customNotes || 'Laporan ini sah digunakan sebagai bukti audit internal, pemeriksaan akreditasi klinik, dan investigasi forensik ketidaksesuaian data medis/keuangan.'}`,
    16,
    finalY + 12
  );

  // Digital Signatures Block if enabled
  if (options.includeDigitalSignatures !== false) {
    const sigY = finalY + 18;
    if (sigY < pageHeight - 28) {
      const boxW = 68;
      const leftX = 14;
      const rightX = pageWidth - 14 - boxW;

      // Left Box: Administrator Pelapor
      doc.setFillColor(254, 253, 250);
      doc.setDrawColor(225, 214, 190);
      doc.roundedRect(leftX, sigY, boxW, 20, 1.5, 1.5, 'FD');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 102, 86);
      doc.text('AUDITOR / ADMINISTRATOR PELAPOR', leftX + boxW / 2, sigY + 4, { align: 'center' });
      doc.line(leftX + 8, sigY + 14, leftX + boxW - 8, sigY + 14);
      doc.setTextColor(27, 42, 69);
      doc.setFontSize(7);
      doc.text(options.adminName || 'Admin Sistem VetCare', leftX + boxW / 2, sigY + 17.5, { align: 'center' });

      // Right Box: Kepala Medik / Manajer Operasional
      doc.setFillColor(254, 253, 250);
      doc.roundedRect(rightX, sigY, boxW, 20, 1.5, 1.5, 'FD');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 102, 86);
      doc.text('KEPALA MEDIK & DIREKTUR KLINIK', rightX + boxW / 2, sigY + 4, { align: 'center' });
      doc.line(rightX + 8, sigY + 14, rightX + boxW - 8, sigY + 14);
      doc.setTextColor(27, 42, 69);
      doc.setFontSize(7);
      doc.text('Drh. Hendra Wijaya / Direksi', rightX + boxW / 2, sigY + 17.5, { align: 'center' });
    }
  }

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(225, 214, 190);
    doc.setLineWidth(0.3);
    doc.line(12, pageHeight - 8, pageWidth - 12, pageHeight - 8);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 102, 86);
    doc.text(
      'DOKUMEN RAHASIA - SYSTEM ACTIVITY & AUDIT TRAIL REPORT | VETCARE PRO HOSPITAL ERP',
      12,
      pageHeight - 4.5
    );
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 12, pageHeight - 4.5, { align: 'right' });
  }

  return doc;
};

/**
 * Export filtered system activity logs as Excel-compatible CSV with UTF-8 BOM
 */
export const exportSystemActivityReportCSV = (options: SystemActivityReportOptions): void => {
  const printDate = new Date().toISOString().split('T')[0];
  const header =
    '\uFEFF' + // UTF-8 BOM for Excel
    'No,ID Log,Waktu (WIB),Pengguna Pelaksana,Peran Pengguna,Cabang Klinik,Kategori Data,Modul Sistem,Tingkat Risiko,Jenis Aksi,Target Objek / No Dokumen,Rincian Modifikasi,Nilai Sebelum (Previous),Nilai Sesudah (New)\n';

  const rows = options.logs
    .map((l, idx) => {
      const cat = getAuditLogCategory(l);
      const clean = (val?: string) => `"${(val || '').replace(/"/g, '""')}"`;
      return [
        idx + 1,
        clean(l.id),
        clean(l.timestamp),
        clean(l.userName),
        clean(l.userRole),
        clean(l.branchName || options.branchName || 'Klinik Utama'),
        clean(cat),
        clean(l.module),
        clean(l.severity || 'Info'),
        clean(l.action),
        clean(l.target),
        clean(l.details),
        clean(l.previousValue),
        clean(l.newValue)
      ].join(',');
    })
    .join('\n');

  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Laporan_Aktivitas_Sistem_Audit_Klinis_Finansial_${printDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export as rich styled XML Spreadsheet (.xls) for direct, rich Microsoft Excel viewing
 */
export const exportSystemActivityReportExcelXML = (options: SystemActivityReportOptions): void => {
  const printDate = new Date().toISOString().split('T')[0];
  const printTime = new Date().toLocaleString('id-ID');

  const escapeXML = (str?: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  let rowsXml = '';
  options.logs.forEach((log, index) => {
    const cat = getAuditLogCategory(log);
    const severity = log.severity || 'Info';
    const rowBg = index % 2 === 0 ? '#FFFFFF' : '#FBF9F5';

    rowsXml += `
      <Row ss:Height="22">
        <Cell ss:StyleID="DataCenter" ss:Index="1"><Data ss:Type="Number">${index + 1}</Data></Cell>
        <Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXML(log.id)}</Data></Cell>
        <Cell ss:StyleID="DataCenter"><Data ss:Type="String">${escapeXML(log.timestamp)}</Data></Cell>
        <Cell ss:StyleID="DataBold"><Data ss:Type="String">${escapeXML(log.userName)}</Data></Cell>
        <Cell ss:StyleID="DataLeft"><Data ss:Type="String">${escapeXML(log.userRole)}</Data></Cell>
        <Cell ss:StyleID="DataLeft"><Data ss:Type="String">${escapeXML(log.branchName || options.branchName || 'Klinik Utama')}</Data></Cell>
        <Cell ss:StyleID="DataCategory"><Data ss:Type="String">${escapeXML(cat)}</Data></Cell>
        <Cell ss:StyleID="DataLeft"><Data ss:Type="String">${escapeXML(log.module)}</Data></Cell>
        <Cell ss:StyleID="${severity === 'Kritis' ? 'DataCritical' : severity === 'Warning' ? 'DataWarning' : 'DataInfo'}"><Data ss:Type="String">${escapeXML(severity)}</Data></Cell>
        <Cell ss:StyleID="DataAction"><Data ss:Type="String">${escapeXML(log.action)}</Data></Cell>
        <Cell ss:StyleID="DataLeft"><Data ss:Type="String">${escapeXML(log.target)}</Data></Cell>
        <Cell ss:StyleID="DataLeft"><Data ss:Type="String">${escapeXML(log.details)}</Data></Cell>
        <Cell ss:StyleID="DataDiff"><Data ss:Type="String">${escapeXML(log.previousValue || '-')}</Data></Cell>
        <Cell ss:StyleID="DataDiff"><Data ss:Type="String">${escapeXML(log.newValue || '-')}</Data></Cell>
      </Row>`;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#1B2A45"/>
  </Style>
  <Style ss:ID="Title">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Bold="1" ss:Color="#1B2A45"/>
  </Style>
  <Style ss:ID="Subtitle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Italic="1" ss:Color="#6B6656"/>
  </Style>
  <Style ss:ID="HeaderRow">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#B8905A"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1B2A45"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1B2A45" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataLeft">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#1B2A45"/>
  </Style>
  <Style ss:ID="DataBold">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#1B2A45"/>
  </Style>
  <Style ss:ID="DataCenter">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#1B2A45"/>
  </Style>
  <Style ss:ID="DataCategory">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#0D9488"/>
  </Style>
  <Style ss:ID="DataAction">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#B8905A"/>
  </Style>
  <Style ss:ID="DataCritical">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#BE123C"/>
   <Interior ss:Color="#FFE4E6" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataWarning">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Bold="1" ss:Color="#B45309"/>
   <Interior ss:Color="#FEF3C7" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DataInfo">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="9.5" ss:Color="#0369A1"/>
  </Style>
  <Style ss:ID="DataDiff">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E1D6BE"/>
   </Borders>
   <Font ss:FontName="Courier New" ss:Size="8.5" ss:Color="#4B5563"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Jejak Audit Sistem">
  <Table ss:DefaultColumnWidth="80" ss:DefaultRowHeight="18">
   <Column ss:Width="30"/>
   <Column ss:Width="70"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="80"/>
   <Column ss:Width="110"/>
   <Column ss:Width="120"/>
   <Column ss:Width="120"/>
   <Column ss:Width="75"/>
   <Column ss:Width="70"/>
   <Column ss:Width="160"/>
   <Column ss:Width="240"/>
   <Column ss:Width="160"/>
   <Column ss:Width="160"/>

   <Row ss:Height="24">
    <Cell ss:MergeAcross="13" ss:StyleID="Title"><Data ss:Type="String">LAPORAN AKTIVITAS SISTEM &amp; AUDIT DATA SENSITIF (SYSTEM ACTIVITY REPORT)</Data></Cell>
   </Row>
   <Row ss:Height="18">
    <Cell ss:MergeAcross="13" ss:StyleID="Subtitle"><Data ss:Type="String">Rumah Sakit Hewan &amp; Klinik VetCare Pro | Diekstraksi pada: ${printTime} WIB | Administrator: ${escapeXML(options.adminName || 'Admin Utama')}</Data></Cell>
   </Row>
   <Row ss:Height="10"></Row>

   <Row ss:Height="26">
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">No</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">ID Event</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Waktu (WIB)</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Pengguna</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Peran</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Cabang</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Kategori Record</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Modul Sistem</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Risiko</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Aksi</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Target Data / Objek</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Rincian Modifikasi</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Nilai Sebelum (Previous)</Data></Cell>
    <Cell ss:StyleID="HeaderRow"><Data ss:Type="String">Nilai Sesudah (New)</Data></Cell>
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Laporan_Aktivitas_Sistem_Audit_${printDate}.xls`;
  link.click();
  URL.revokeObjectURL(url);
};
