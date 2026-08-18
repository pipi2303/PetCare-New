import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Package,
  ArrowLeft,
  Filter,
  DollarSign,
  Boxes,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface PetShopCategoryAnalyticsProps {
  onBackToPOS?: () => void;
}

const CATEGORY_SALES_DATA = [
  { category: 'Pakan Kucing', revenue: 14500000, volume: 185, profitMargin: 32, fill: '#D97706' },
  { category: 'Pakan Anjing', revenue: 11200000, volume: 120, profitMargin: 28, fill: '#1B2A45' },
  { category: 'Pasir & Sanitasi', revenue: 7800000, volume: 210, profitMargin: 42, fill: '#059669' },
  { category: 'Suplemen & Vitamin', revenue: 6400000, volume: 75, profitMargin: 48, fill: '#6366F1' },
  { category: 'Aksesoris & Kalung', revenue: 3900000, volume: 62, profitMargin: 55, fill: '#EC4899' },
  { category: 'Mainan & Scratch', revenue: 2800000, volume: 48, profitMargin: 50, fill: '#8B5CF6' }
];

const PIE_COLORS = ['#D97706', '#1B2A45', '#059669', '#6366F1', '#EC4899', '#8B5CF6'];

export const PetShopCategoryAnalytics: React.FC<PetShopCategoryAnalyticsProps> = ({ onBackToPOS }) => {
  const { stockItems, invoices } = useData();
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'volume' | 'margin'>('revenue');

  const totalRevenue = CATEGORY_SALES_DATA.reduce((sum, item) => sum + item.revenue, 0);
  const totalVolume = CATEGORY_SALES_DATA.reduce((sum, item) => sum + item.volume, 0);
  const avgMargin = Math.round(CATEGORY_SALES_DATA.reduce((sum, item) => sum + item.profitMargin, 0) / CATEGORY_SALES_DATA.length);

  const pieData = CATEGORY_SALES_DATA.map((item) => ({
    name: item.category,
    value: item.revenue,
    percent: Math.round((item.revenue / totalRevenue) * 100)
  }));

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white p-4 rounded-xl border border-[#E1D6BE] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToPOS && (
            <button
              type="button"
              onClick={onBackToPOS}
              className="p-2 bg-[#F6F1E6] hover:bg-[#E1D6BE] text-[#1B2A45] rounded-lg transition-all"
              title="Kembali ke Kasir POS"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h3 className="font-bold text-sm text-[#1B2A45] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Analisis Penjualan Retail per Kategori (Pet Shop)
            </h3>
            <p className="text-xs text-[#1B2A45]/70">
              Visualisasi kontribusi omzet, margin keuntungan kotor, dan volume penjualan produk pet shop
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#F6F1E6] p-1 rounded-lg border border-[#E1D6BE]">
          <button
            type="button"
            onClick={() => setSelectedMetric('revenue')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              selectedMetric === 'revenue'
                ? 'bg-[#1B2A45] text-white shadow-xs'
                : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
            }`}
          >
            Omzet (Rp)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('volume')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              selectedMetric === 'volume'
                ? 'bg-[#1B2A45] text-white shadow-xs'
                : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
            }`}
          >
            Volume (Pcs)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMetric('margin')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              selectedMetric === 'margin'
                ? 'bg-[#1B2A45] text-white shadow-xs'
                : 'text-[#1B2A45]/70 hover:text-[#1B2A45]'
            }`}
          >
            Margin (%)
          </button>
        </div>
      </div>

      {/* 3 Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E1D6BE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#1B2A45]/70">
            <span className="font-semibold">Total Omzet Retail (30 Hari)</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-[#1B2A45]">Rp {totalRevenue.toLocaleString('id-ID')}</p>
          <p className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
            +14.2% vs bulan lalu
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1D6BE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#1B2A45]/70">
            <span className="font-semibold">Volume Item Terjual</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-[#1B2A45]">{totalVolume} Unit Produk</p>
          <p className="text-[10px] text-blue-800 font-bold bg-blue-50 px-1.5 py-0.5 rounded inline-block">
            Fast Moving: Pakan & Pasir
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E1D6BE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#1B2A45]/70">
            <span className="font-semibold">Rata-rata Margin Kotor</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-[#1B2A45]">{avgMargin}% Gross Margin</p>
          <p className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded inline-block">
            Margin tertinggi: Aksesoris (55%)
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bar Chart */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-[#E1D6BE] shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-sm text-[#1B2A45]">
              {selectedMetric === 'revenue'
                ? 'Omzet per Kategori Produk'
                : selectedMetric === 'volume'
                ? 'Volume Unit Terjual per Kategori'
                : 'Tingkat Margin Keuntungan Kotor per Kategori'}
            </h4>
            <p className="text-xs text-[#1B2A45]/70">
              Evaluasi performa penjualan untuk pengadaan stok dan strategi diskon toko
            </p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_SALES_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1D6BE" opacity={0.5} />
                <XAxis dataKey="category" stroke="#1B2A45" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis
                  stroke="#1B2A45"
                  fontSize={11}
                  tickFormatter={(val) =>
                    selectedMetric === 'revenue'
                      ? `${val / 1000000}M`
                      : selectedMetric === 'margin'
                      ? `${val}%`
                      : `${val}`
                  }
                />
                <Tooltip
                  formatter={(val: any) =>
                    selectedMetric === 'revenue'
                      ? `Rp ${Number(val).toLocaleString('id-ID')}`
                      : selectedMetric === 'margin'
                      ? `${val}%`
                      : `${val} Unit`
                  }
                />
                <Bar
                  dataKey={selectedMetric === 'revenue' ? 'revenue' : selectedMetric === 'volume' ? 'volume' : 'profitMargin'}
                  name={selectedMetric === 'revenue' ? 'Omzet' : selectedMetric === 'volume' ? 'Volume' : 'Margin (%)'}
                  fill="#B8905A"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Distribution Donut */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#E1D6BE] shadow-xs space-y-4">
          <div>
            <h4 className="font-bold text-sm text-[#1B2A45]">Pangsa Omzet Kategori</h4>
            <p className="text-xs text-[#1B2A45]/70">Proporsi penjualan produk</p>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#E1D6BE]/50">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-[#1B2A45]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="truncate max-w-[140px] font-medium">{item.name}</span>
                </div>
                <span className="font-bold">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
