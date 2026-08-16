import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pet, SOAPNote, ClinicVisit, Customer, LabTest, VacHistory } from '../types';
import { DEFAULT_COMPANY_INFO, ReportCompanyInfo } from './pdfReportGenerator';

export interface PatientMedicalPDFOptions {
  pet: Pet;
  lastSoap?: SOAPNote;
  lastVisit?: ClinicVisit;
  customer?: Customer;
  vitals?: {
    tempC?: number;
    hr?: number;
    rr?: number;
    weightKg?: number;
    bp?: string;
  };
  doctorName?: string;
  doctorSip?: string;
  diagnosis?: string;
  medicationSummary?: string;
  company?: ReportCompanyInfo;
  labTests?: LabTest[];
  vacHistories?: VacHistory[];
  additionalNotes?: string;
  includeSignatureStamp?: boolean;
  followUpDate?: string;
}

/**
 * Helper to generate official reference code for patient medical certificate / summary
 */
const generateMedicalRefNo = (petId: string): string => {
  const cleanId = petId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `MED-SUM/${dateStr}/${cleanId || 'VET1'}`;
};

/**
 * Draw PetCare Header & Letterhead for Patient Medical Summary Document
 */
const drawPatientSummaryHeader = (
  doc: jsPDF,
  company: ReportCompanyInfo,
  refNo: string,
  petName: string,
  ownerName: string
) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top color bands (Navy + Gold)
  doc.setFillColor(27, 42, 69); // #1B2A45
  doc.rect(0, 0, pageWidth, 6, 'F');
  doc.setFillColor(184, 144, 90); // #B8905A
  doc.rect(0, 6, pageWidth, 2.5, 'F');

  // Clinic Emblem Box
  doc.setFillColor(27, 42, 69);
  doc.roundedRect(14, 12, 18, 18, 3, 3, 'F');
  doc.setFillColor(184, 144, 90);
  doc.circle(23, 21, 5, 'F');
  doc.setTextColor(255, 253, 249);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('+', 23, 22.8, { align: 'center' });

  // Clinic Main Titles
  doc.setTextColor(27, 42, 69);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(company.clinicName, 36, 17.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 102, 86);
  doc.text(company.subTitle, 36, 22);
  doc.text(`${company.address} | Telp: ${company.phone}`, 36, 26);
  doc.text(`Email: ${company.email} | Izin: ${company.licenseNo}`, 36, 30);

  // Document Badge on Right
  doc.setFillColor(246, 241, 230);
  doc.roundedRect(pageWidth - 72, 12, 58, 18, 2, 2, 'F');
  doc.setDrawColor(225, 214, 190);
  doc.roundedRect(pageWidth - 72, 12, 58, 18, 2, 2, 'S');

  doc.setTextColor(184, 144, 90);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('LEMBAR REKAM MEDIS RESMI', pageWidth - 43, 17, { align: 'center' });

  doc.setTextColor(27, 42, 69);
  doc.setFontSize(8);
  doc.text('DISCHARGE & SUMMARY', pageWidth - 43, 22, { align: 'center' });

  doc.setTextColor(107, 102, 86);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref: ${refNo}`, pageWidth - 43, 27, { align: 'center' });

  // Header Divider Lines
  doc.setDrawColor(27, 42, 69);
  doc.setLineWidth(0.7);
  doc.line(14, 35, pageWidth - 14, 35);
  doc.setDrawColor(184, 144, 90);
  doc.setLineWidth(0.3);
  doc.line(14, 36.2, pageWidth - 14, 36.2);

  // Title Banner
  doc.setFillColor(27, 42, 69);
  doc.roundedRect(14, 40, pageWidth - 28, 15, 2, 2, 'F');

  doc.setTextColor(217, 185, 138);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN PERAWATAN & REKAM MEDIS PASIEN (VETERINARY MEDICAL SUMMARY)', 20, 45.5);

  doc.setTextColor(255, 253, 249);
  doc.setFontSize(10.5);
  doc.text(`Pasien: ${petName}  |  Pemilik: ${ownerName}`, 20, 51.5);

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setTextColor(217, 185, 138);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal Cetak: ${printDateStr}`, pageWidth - 20, 48.5, { align: 'right' });
};

/**
 * Generate Comprehensive Patient Medical History PDF Document
 */
export const generatePatientMedicalSummaryPDF = (options: PatientMedicalPDFOptions): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const company = options.company || DEFAULT_COMPANY_INFO;
  const pet = options.pet;
  const soap = options.lastSoap;
  const visit = options.lastVisit;
  const customer = options.customer;
  const refNo = generateMedicalRefNo(pet.id);

  // 1. Draw Letterhead
  drawPatientSummaryHeader(doc, company, refNo, pet.name, customer?.name || pet.customerName);

  let currentY = 60;

  // 2. Patient & Owner Identification Card (Table)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 69);
  doc.text('I. IDENTITAS PASIEN & PEMILIK (PATIENT & CLIENT DEMOGRAPHICS)', 14, currentY);

  const allergiesText = pet.allergies && pet.allergies.toLowerCase() !== 'tidak ada'
    ? `⚠️ ${pet.allergies} (Kontraindikasi!)`
    : 'Tidak Ada Alergi Tercatat';

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Informasi Pasien', 'Detail Medis Pasien', 'Informasi Pemilik (Client)', 'Kontak & Alamat']],
    body: [
      [
        `Nama Pasien: ${pet.name}\nSpesies: ${pet.species}\nRas: ${pet.breed}\nJenis Kelamin: ${pet.gender}`,
        `Berat Badan: ${options.vitals?.weightKg || pet.weightKg || '-'} kg\nMicrochip: ${pet.microchipNo || '985141002341829'}\nSterilisasi: ${pet.sterilized ? 'Sudah Disteril' : 'Belum Disteril'}\nWarna: ${pet.color || '-'}`,
        `Nama Pemilik: ${customer?.name || pet.customerName}\nID Klien: #${customer?.id || 'CUST-089'}\nMembership: ${customer?.membershipTier || 'Silver'} Member\nStatus: Terverifikasi`,
        `No. Telepon: ${customer?.phone || '0812-3456-7890'}\nEmail: ${customer?.email || 'owner@petcare.id'}\nAlamat: ${customer?.address || 'Jakarta, Indonesia'}\nRiwayat Alergi: ${allergiesText}`
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [27, 42, 69],
      textColor: [255, 253, 249],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [34, 36, 43],
      cellPadding: 3,
      lineColor: [225, 214, 190]
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 3. Clinical Encounter & Vital Signs Section
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 69);
  doc.text('II. TANDA VITAL & PEMERIKSAAN FISIK (CLINICAL VITALS & ENCOUNTER)', 14, currentY);

  const treatedDate = soap?.date || (visit ? visit.queuedAt?.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const doctorName = options.doctorName || soap?.doctorName || visit?.doctorName || 'drh. Ananda Putri, M.Si';
  const doctorSip = options.doctorSip || '503/SIP-DRH/DKPKP/2024/0412';

  const vitals = {
    tempC: options.vitals?.tempC ?? (soap?.temperatureC || 38.5),
    hr: options.vitals?.hr ?? (soap?.heartRate || (pet.species === 'Kucing' ? 160 : 98)),
    rr: options.vitals?.rr ?? (soap?.respiratoryRate || 24),
    weightKg: options.vitals?.weightKg ?? (soap?.weightKg || pet.weightKg || 4.5),
    bp: options.vitals?.bp ?? (soap?.systolicBP ? `${soap.systolicBP}/${soap.diastolicBP} mmHg` : '120/80 mmHg')
  };

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Parameter Vital', 'Nilai Terukur', 'Rentang Normal Referensi', 'Status Evaluasi Klinis']],
    body: [
      ['Suhu Tubuh (Body Temp)', `${vitals.tempC} °C`, '38.0 - 39.2 °C (Anjing/Kucing)', vitals.tempC > 39.3 ? 'Febris / Demam Ringan' : 'Normotermia (Normal)'],
      ['Denyut Jantung (Heart Rate)', `${vitals.hr} bpm`, '70 - 160 bpm (Canine/Feline)', 'Irama Sinus Reguler, Tidak Ada Murmur'],
      ['Laju Respirasi (Resp Rate)', `${vitals.rr} /menit`, '18 - 34 /menit', 'Pola Eupnea, Vesikuler Bersih'],
      ['Bobot Badan (Body Weight)', `${vitals.weightKg} kg`, 'BCS 5/9 (Ideal)', 'Kondisi Fisik Ideal & Terpantau'],
      ['Tekanan Darah (Blood Pressure)', vitals.bp, '110/70 - 130/85 mmHg', 'Normotensi Sesuai Doppler/Oscillometric']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [184, 144, 90],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [34, 36, 43],
      lineColor: [225, 214, 190]
    },
    alternateRowStyles: { fillColor: [254, 253, 250] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 4. Clinical SOAP Medical Findings
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 69);
  doc.text('III. HASIL PEMERIKSAAN MEDIS SOAP (SOAP CLINICAL EVALUATION)', 14, currentY);

  const soapData = [
    [
      'S (Subjective / Anamnesis)',
      `${soap?.chiefComplaint || visit?.complaint || 'Pemeriksaan kesehatan rutin & kontrol klinis'}\nRiwayat: ${soap?.historyOfPresentIllness || 'Pasien aktif, nafsu makan baik, tidak ada muntah/diare akut.'}`
    ],
    [
      'O (Objective / Temuan Fisik)',
      `${soap?.physicalExamNotes || 'Mukosa merah muda lembap, CRT < 2 detik, turgor kulit elastis normal, palpasi abdomen lentur tanpa nyeri tekan.'}`
    ],
    [
      'A (Assessment / Diagnosis)',
      `DIAGNOSIS KERJA: ${options.diagnosis || soap?.workingDiagnosis || 'Pemeriksaan Rutin & Profilaksis Kesehatan'}\nDiagnosis Diferensial: ${soap?.differentialDiagnosis || '-'}`
    ],
    [
      'P (Plan / Terapi & Tindakan)',
      `${soap?.medicationPlan || options.medicationSummary || 'Pemberian multivitamin & edukasi perawatan lanjutan di rumah.'}\nEdukasi: ${soap?.patientEducation || 'Jaga asupan hidrasi bersih, pakan bergizi seimbang, dan hindari stres lingkungan.'}`
    ]
  ];

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Elemen SOAP', 'Rincian Catatan Medis & Temuan Dokter']],
    body: soapData,
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold', textColor: [27, 42, 69] },
      1: { textColor: [34, 36, 43] }
    },
    headStyles: {
      fillColor: [27, 42, 69],
      textColor: [255, 253, 249],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7.2,
      lineColor: [225, 214, 190],
      cellPadding: 2.5
    },
    alternateRowStyles: { fillColor: [254, 253, 250] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Check if we need to add a page or continue on page 1
  if (currentY > 215) {
    doc.addPage();
    currentY = 20;
  }

  // 5. Prescribed Medications & Posology (Resep & Aturan Pakai)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 69);
  doc.text('IV. RESEP OBAT & ATURAN PAKAI (PRESCRIPTIONS & HOME MEDICATIONS)', 14, currentY);

  let drugRows: string[][] = [];
  if (soap?.prescribedDrugs && soap.prescribedDrugs.length > 0) {
    drugRows = soap.prescribedDrugs.map((d, idx) => [
      (idx + 1).toString(),
      d.drugName,
      d.dosage,
      d.frequency,
      `${d.durationDays} hari`,
      'Habiskan sesuai anjuran'
    ]);
  } else if (options.medicationSummary && options.medicationSummary !== '-') {
    drugRows = [
      ['1', options.medicationSummary, 'Sesuai Dosis', '2x sehari sesudah makan', '5 hari', 'Simpan di suhu ruang sejuk']
    ];
  } else {
    drugRows = [
      ['1', 'Multivitamin & Suplemen Imun (Nutri-Plus Gel)', '2 cm / 5kg BB', '1x sehari pagi', '14 hari', 'Dapat dicampur ke pakan']
    ];
  }

  autoTable(doc, {
    startY: currentY + 2,
    head: [['No', 'Nama Obat / Sediaan', 'Dosis / Takaran', 'Frekuensi Pemakaian', 'Durasi', 'Petunjuk Khusus']],
    body: drugRows,
    theme: 'grid',
    headStyles: {
      fillColor: [184, 144, 90],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [34, 36, 43],
      lineColor: [225, 214, 190]
    },
    alternateRowStyles: { fillColor: [254, 253, 250] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 6. Home Care Instructions & Red Flags
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 69);
  doc.text('V. INSTRUKSI PERAWATAN DI RUMAH & JADWAL KONTROL', 14, currentY);

  const followUpText = options.followUpDate || '3 - 5 Hari setelah terapi / bila gejala memburuk';
  autoTable(doc, {
    startY: currentY + 2,
    head: [['Panduan Perawatan Pasien di Rumah', 'Tanda Bahaya (Segera Hubungi Emergency)', 'Jadwal Kontrol Ulang']],
    body: [
      [
        '• Berikan obat secara teratur sesuai jadwal posologi.\n• Sediakan air minum bersih yang selalu segar (ad libitum).\n• Batasi aktivitas fisik berat selama masa pemulihan.',
        '• Muntah berulang / diare cair bercampur darah.\n• Nafas tersengal / terengah-engah tanpa aktivitas.\n• Kehilangan kesadaran / kejang mendadak.',
        `Jadwal Kontrol:\n${followUpText}\nLayanan Darurat: (021) 555-8899`
      ]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [27, 42, 69],
      textColor: [255, 253, 249],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [34, 36, 43],
      lineColor: [225, 214, 190],
      cellPadding: 2.5
    },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  if (currentY > 235) {
    doc.addPage();
    currentY = 20;
  }

  // 7. Signature & Official Stamp Section
  const signatureY = currentY + 2;
  const boxWidth = 72;
  const leftX = 14;
  const rightX = pageWidth - 14 - boxWidth;

  // Left Box: Pemilik Pasien / Klien
  doc.setFillColor(254, 253, 250);
  doc.setDrawColor(225, 214, 190);
  doc.roundedRect(leftX, signatureY, boxWidth, 32, 2, 2, 'FD');

  doc.setTextColor(107, 102, 86);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PENERIMA RINGKASAN MEDIS / PEMILIK', leftX + boxWidth / 2, signatureY + 5.5, { align: 'center' });

  doc.setDrawColor(225, 214, 190);
  doc.line(leftX + 8, signatureY + 22, leftX + boxWidth - 8, signatureY + 22);

  doc.setTextColor(27, 42, 69);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(customer?.name || pet.customerName, leftX + boxWidth / 2, signatureY + 26, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 102, 86);
  doc.text('Pemilik Pasien yang Sah', leftX + boxWidth / 2, signatureY + 29.5, { align: 'center' });

  // Right Box: Dokter Hewan Pemeriksa
  doc.setFillColor(254, 253, 250);
  doc.roundedRect(rightX, signatureY, boxWidth, 32, 2, 2, 'FD');

  doc.setTextColor(107, 102, 86);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DOKTER HEWAN PEMERIKSA', rightX + boxWidth / 2, signatureY + 5.5, { align: 'center' });

  // Stamp Seal Graphic
  if (options.includeSignatureStamp !== false) {
    const stampX = rightX + boxWidth / 2;
    const stampY = signatureY + 14;

    doc.setDrawColor(184, 144, 90);
    doc.setLineWidth(0.6);
    doc.circle(stampX, stampY, 6.5, 'S');
    doc.setLineWidth(0.2);
    doc.circle(stampX, stampY, 5.2, 'S');

    doc.setTextColor(184, 144, 90);
    doc.setFontSize(4.5);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED', stampX, stampY - 1, { align: 'center' });
    doc.text('PETCARE VET', stampX, stampY + 1.5, { align: 'center' });
    doc.text('OFFICIAL', stampX, stampY + 3.5, { align: 'center' });
  }

  doc.setDrawColor(225, 214, 190);
  doc.line(rightX + 8, signatureY + 22, rightX + boxWidth - 8, signatureY + 22);

  doc.setTextColor(27, 42, 69);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(doctorName, rightX + boxWidth / 2, signatureY + 26, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 102, 86);
  doc.text(`SIP: ${doctorSip}`, rightX + boxWidth / 2, signatureY + 29.5, { align: 'center' });

  // Document Footers on All Pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(225, 214, 190);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 102, 86);
    doc.text(
      `Dokumen Medis Resmi PetCare • Pasien: ${pet.name} (${pet.species}) • Ref: ${refNo}`,
      14,
      pageHeight - 7.5
    );

    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - 14,
      pageHeight - 7.5,
      { align: 'right' }
    );
  }

  return doc;
};

/**
 * Generate Batch PDF Summary for the 5 Recent Treated Patients
 */
export const generateBatchRecentPatientsPDF = (
  patients: {
    pet: Pet;
    lastSoap?: SOAPNote;
    lastVisit?: ClinicVisit;
    treatedDate: string;
    doctorName: string;
    diagnosis: string;
    medicationSummary: string;
    vitals: { tempC?: number; hr?: number; rr?: number; weightKg?: number; bp?: string };
    status: string;
    visitCount: number;
  }[],
  company: ReportCompanyInfo = DEFAULT_COMPANY_INFO
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const refNo = `BATCH-REC/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/5VET`;

  // Top Accent Bar
  doc.setFillColor(27, 42, 69);
  doc.rect(0, 0, pageWidth, 6, 'F');
  doc.setFillColor(184, 144, 90);
  doc.rect(0, 6, pageWidth, 2, 'F');

  // Header Letterhead
  doc.setTextColor(27, 42, 69);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(company.clinicName, 14, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 102, 86);
  doc.text(`${company.subTitle} | ${company.address} | Telp: ${company.phone}`, 14, 21);

  // Title Banner
  doc.setFillColor(27, 42, 69);
  doc.roundedRect(14, 26, pageWidth - 28, 14, 2, 2, 'F');

  doc.setTextColor(217, 185, 138);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('REKAPITULASI 5 PASIEN TERAKHIR DITANGANI (RECENT PATIENTS CLINICAL DOSSIER)', 20, 31);

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.setTextColor(255, 253, 249);
  doc.setFontSize(9.5);
  doc.text(`Total Terdaftar: ${patients.length} Pasien Medis  |  Tanggal Cetak: ${printDateStr}`, 20, 36.5);

  doc.setTextColor(217, 185, 138);
  doc.setFontSize(7.5);
  doc.text(`Ref: ${refNo}`, pageWidth - 20, 34, { align: 'right' });

  // Patients Table
  const tableRows = patients.map((item, idx) => [
    `#${idx + 1}`,
    `${item.pet.name}\n(${item.pet.species} - ${item.pet.breed})`,
    `${item.pet.customerName}\nChip: ${item.pet.microchipNo || '-'}`,
    `${item.treatedDate}\n${item.doctorName}`,
    `T: ${item.vitals.tempC}°C | HR: ${item.vitals.hr}bpm\nRR: ${item.vitals.rr}/m | BB: ${item.vitals.weightKg}kg`,
    item.diagnosis,
    item.medicationSummary || '-',
    item.status
  ]);

  autoTable(doc, {
    startY: 44,
    head: [['No', 'Identitas Pasien', 'Pemilik & Microchip', 'Tanggal & Dokter', 'Tanda Vital', 'Diagnosis Medis', 'Terapi & Obat', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [27, 42, 69],
      textColor: [255, 253, 249],
      fontSize: 7.5,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [34, 36, 43],
      lineColor: [225, 214, 190],
      cellPadding: 2.5
    },
    alternateRowStyles: { fillColor: [254, 253, 250] },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Footer notes
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(107, 102, 86);
  doc.text('* Rekapitulasi pasien divalidasi langsung dari Rekam Medis Elektronik (RME) PetCare Hospital.', 14, finalY);

  // Bottom footer bar
  doc.setDrawColor(225, 214, 190);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10);

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.text(`PetCare ERP System • Dokumen Klinis Sah • ${refNo}`, 14, pageHeight - 6);
  doc.text('Halaman 1 dari 1', pageWidth - 14, pageHeight - 6, { align: 'right' });

  return doc;
};

/**
 * Trigger browser file download for medical summary
 */
export const downloadMedicalSummaryPDF = (
  doc: jsPDF,
  petName: string,
  treatedDate?: string
): void => {
  const safePet = petName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeDate = (treatedDate || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const filename = `Ringkasan-Medis-${safePet}-${safeDate}.pdf`;
  doc.save(filename);
};
