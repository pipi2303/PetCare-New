import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { NavModule } from './Sidebar';
import { Search, X, User, Dog, FileText, Pill, Package, Users, Receipt, CalendarCheck, ShieldAlert } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveModule: (m: NavModule) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  setActiveModule,
}) => {
  const {
    customers = [],
    pets = [],
    medicalRecords = [],
    invoices = [],
    drugs = [],
    stockItems = [],
    employees = [],
    vacSchedules = []
  } = useData();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal via parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedCustomers = q
    ? customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 3)
    : [];
  const matchedPets = q
    ? pets.filter((p) => p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedEMR = q
    ? medicalRecords.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedInvoices = q
    ? invoices.filter((i) => i.invoiceNo.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedDrugs = q
    ? drugs.filter((d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const matchedStock = q
    ? stockItems.filter((s) => s.name.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const handleSelect = (module: NavModule) => {
    setActiveModule(module);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#1B2A45]/70 backdrop-blur-xs flex items-start justify-center pt-20 px-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white border border-[#E1D6BE] w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E1D6BE] bg-[#F6F1E6]">
          <Search className="w-5 h-5 text-[#1B2A45] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik untuk mencari pelanggan, hewan, obat, invoice, EMR..."
            className="w-full bg-transparent text-[#1B2A45] placeholder-[#1B2A45]/50 text-sm focus:outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-[#1B2A45] hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold px-2 py-1 rounded bg-[#E1D6BE] text-[#1B2A45]"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-sky-500" />
              <p className="text-xs">Ketik kata kunci untuk mencari seluruh modul ERP PetCare secara instan.</p>
            </div>
          )}

          {query && (
            <>
              {/* Customers */}
              {matchedCustomers.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <User className="w-3 h-3 text-sky-500" /> Pelanggan
                  </h5>
                  <div className="space-y-1">
                    {matchedCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect('masterData')}
                        className="p-2.5 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.phone} • {c.membershipTier}</p>
                        </div>
                        <span className="text-[10px] bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 px-2 py-0.5 rounded-md font-semibold">Master Data</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pets */}
              {matchedPets.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Dog className="w-3 h-3 text-emerald-500" /> Hewan Peliharaan
                  </h5>
                  <div className="space-y-1">
                    {matchedPets.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('masterData')}
                        className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{p.name} ({p.species})</p>
                          <p className="text-[11px] text-slate-500">Ras: {p.breed} • Pemilik: {p.customerName}</p>
                        </div>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded-md font-semibold">Profil Hewan</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {matchedInvoices.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Receipt className="w-3 h-3 text-amber-500" /> Tagihan & Invoice
                  </h5>
                  <div className="space-y-1">
                    {matchedInvoices.map((i) => (
                      <div
                        key={i.id}
                        onClick={() => handleSelect('billing')}
                        className="p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{i.invoiceNo} - {i.customerName}</p>
                          <p className="text-[11px] text-slate-500">Total: Rp {i.totalAmount.toLocaleString('id-ID')} • {i.status}</p>
                        </div>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold">Billing</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drugs */}
              {matchedDrugs.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <Pill className="w-3 h-3 text-indigo-500" /> Obat Farmasi
                  </h5>
                  <div className="space-y-1">
                    {matchedDrugs.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelect('pharmacy')}
                        className="p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{d.name}</p>
                          <p className="text-[11px] text-slate-500">Stok: {d.stock} {d.unit} • Harga: Rp {d.unitPrice.toLocaleString('id-ID')}</p>
                        </div>
                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-md font-semibold">Farmasi</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {matchedCustomers.length === 0 &&
                matchedPets.length === 0 &&
                matchedInvoices.length === 0 &&
                matchedDrugs.length === 0 && (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    Tidak ada data yang cocok dengan pencarian "{query}".
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
