import React from 'react';
import { Printer, Download, CheckCircle, FileText, Building } from 'lucide-react';

interface PrintableDocumentProps {
  type: 'invoice' | 'prescription' | 'certificate' | 'referral' | 'vaccineCert';
  data: any;
  onClose?: () => void;
}

export const PrintableDocument: React.FC<PrintableDocumentProps> = ({ type, data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Control Action Bar (Hidden during window.print()) */}
      <div className="print:hidden flex items-center justify-between bg-slate-900 text-white p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <FileText className="w-4 h-4 text-sky-400" />
          <span>Pratinjau Dokumen Cetak Resmi PetCare ERP</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak Dokumen
          </button>
        </div>
      </div>

      {/* Printable Sheet Wrapper */}
      <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 max-w-2xl mx-auto space-y-6 font-sans text-xs">
        {/* Header Kop Klinik */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-600 text-white font-bold text-2xl flex items-center justify-center">
              🐾
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 uppercase tracking-tight">Klinik & PetCare Central</h2>
              <p className="text-[10px] text-slate-600 font-medium">Jl. Radio Dalam No. 45, Jakarta Selatan • Telp: (021) 7201982</p>
              <p className="text-[10px] text-slate-500">Izin Operasional No: 503/VET-KLINIK/2023/0019</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded bg-slate-100 font-bold text-[10px] uppercase text-slate-700 tracking-wider">
              {type === 'invoice' && 'INVOICE & STRUK'}
              {type === 'prescription' && 'RESEP OBAT KLINIS'}
              {type === 'certificate' && 'SURAT KET. SEHAT'}
              {type === 'referral' && 'SURAT RUJUKAN'}
              {type === 'vaccineCert' && 'SERTIFIKAT VAKSINASI'}
            </span>
          </div>
        </div>

        {/* Content per Document Type */}
        {type === 'invoice' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <p className="text-slate-500">No. Invoice: <span className="font-bold text-slate-900">{data.invoiceNo}</span></p>
                <p className="text-slate-500">Tanggal: <span className="font-bold text-slate-900">{data.date}</span></p>
              </div>
              <div>
                <p className="text-slate-500">Pelanggan: <span className="font-bold text-slate-900">{data.customerName}</span></p>
                <p className="text-slate-500">Hewan: <span className="font-bold text-slate-900">{data.petName || '-'}</span></p>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 text-[10px] uppercase text-slate-600">
                  <th className="py-2">Item Layanan / Produk</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Harga</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                    <td className="py-2 text-right font-semibold">Rp {item.totalPrice.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-3 border-t border-slate-300 flex justify-end">
              <div className="w-64 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>Rp {data.subtotal?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Diskon:</span>
                  <span>- Rp {data.discountAmount?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                  <span>TOTAL BAYAR:</span>
                  <span className="text-sky-700">Rp {data.totalAmount?.toLocaleString('id-ID')}</span>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold text-right pt-1">
                  STATUS: {data.status} (Via {data.paymentMethod})
                </p>
              </div>
            </div>
          </div>
        )}

        {type === 'prescription' && (
          <div className="space-y-4">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
              <p className="font-bold text-slate-900">Nama Pasien: {data.petName || 'Milo'}</p>
              <p className="text-[11px] text-slate-600">Pemilik: {data.customerName || 'Andri Santoso'} • Dokter: {data.doctorName || 'drh. Ananda Putri'}</p>
            </div>

            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl space-y-3">
              <p className="font-serif italic text-lg font-bold text-sky-900">R /</p>
              <p className="font-semibold text-slate-900 text-sm">{data.medicationPlan || 'Otopain Ear Drops 10ml - 2x3 tetes telinga kanan (5 hari)'}</p>
              <p className="text-slate-600 text-xs">{data.instructions || 'Harap diberikan teratur setelah telinga dibersihkan.'}</p>
            </div>
          </div>
        )}

        {/* Footer Signature */}
        <div className="pt-8 flex items-end justify-between text-center text-[10px] text-slate-600">
          <div>
            <p>Staf Kasir / Operasional</p>
            <div className="h-12" />
            <p className="font-bold border-t border-slate-400 pt-1">PetCare Staff</p>
          </div>
          <div>
            <p>Dokter Hewan Penanggung Jawab</p>
            <div className="h-12" />
            <p className="font-bold border-t border-slate-400 pt-1">drh. Ananda Putri</p>
          </div>
        </div>
      </div>
    </div>
  );
};
