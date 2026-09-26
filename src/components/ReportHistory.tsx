import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar,
  Store,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  User,
  Printer,
  TrendingUp,
  TrendingDown,
  Coins,
  Receipt,
  PieChart,
  Lock,
  Check,
  X,
  Tag,
} from 'lucide-react';
import { DailyReport, SaleItem, OUTLETS } from '../types.ts';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters.ts';
import {
  calculateLoss,
  calculateLossPercentage,
  calculateExpensePercentage,
  calculateSoldUnitsFromSales,
  formatPercentage,
} from '../utils/stockCalculations.ts';

interface ReportHistoryProps {
  reports: DailyReport[];
  loading: boolean;
  onRefresh: () => void;
  onSelectReport: (report: DailyReport) => void;
  onNewReport: () => void;
  onLockAdmin?: () => void;
  availableOutlets?: string[];
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({
  reports,
  loading,
  onRefresh,
  onSelectReport,
  onNewReport,
  onLockAdmin,
  availableOutlets,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [isOutletDropdownOpen, setIsOutletDropdownOpen] = useState<boolean>(false);
  const [outletSearch, setOutletSearch] = useState<string>('');
  const outletDropdownRef = useRef<HTMLDivElement>(null);

  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const activeOutletsList = availableOutlets && availableOutlets.length > 0 ? availableOutlets : OUTLETS;
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (outletDropdownRef.current && !outletDropdownRef.current.contains(event.target as Node)) {
        setIsOutletDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOutlet = (outletName: string) => {
    setSelectedOutlets((prev) =>
      prev.includes(outletName) ? prev.filter((o) => o !== outletName) : [...prev, outletName]
    );
  };

  const selectAllOutlets = () => {
    setSelectedOutlets([...activeOutletsList]);
  };

  const clearOutletSelection = () => {
    setSelectedOutlets([]);
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    // Outlet match (multi-select: if empty, show all; if selected, r.outlet_name must match one)
    if (selectedOutlets.length > 0) {
      const matchOutlet = selectedOutlets.some(
        (out) => out.toLowerCase() === r.outlet_name.toLowerCase()
      );
      if (!matchOutlet) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOutlet = r.outlet_name.toLowerCase().includes(q);
      const matchStaff = (r.staff_name || '').toLowerCase().includes(q);
      const matchDate = r.report_date.includes(q);
      const matchNotes = (r.notes || '').toLowerCase().includes(q) || (r.promo_note || '').toLowerCase().includes(q);
      if (!matchOutlet && !matchStaff && !matchDate && !matchNotes) return false;
    }

    // Time filter
    if (filterType === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return r.report_date === today;
    }
    if (filterType === 'week') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return r.report_date >= oneWeekAgo;
    }
    if (filterType === 'month') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      return r.report_date.startsWith(currentMonth);
    }
    if (filterType === 'custom') {
      if (customStartDate && customEndDate) {
        if (r.report_date < customStartDate || r.report_date > customEndDate) return false;
      } else if (customStartDate && !customEndDate) {
        if (r.report_date !== customStartDate) return false;
      } else if (!customStartDate && customEndDate) {
        if (r.report_date > customEndDate) return false;
      }
    }

    return true;
  });

  // Aggregated totals for the current filter selection
  const filterSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalPromo = 0;
    let totalClean = 0;
    let totalLoss = 0;
    let totalPbLossQty = 0;
    let totalPkLossQty = 0;
    let totalNasiLossQty = 0;
    let totalPbSold = 0;
    let totalPkSold = 0;
    let totalNasiSold = 0;
    let totalKulitSold = 0;

    for (const r of filteredReports) {
      totalIncome += Number(r.total_income) || 0;
      totalExpense += Number(r.total_expense) || 0;
      totalPromo += Number(r.promo) || 0;
      totalClean += Number(r.final_total) || 0;

      const loss = calculateLoss(r.remaining_stock);
      totalLoss += loss.totalLoss;
      totalPbLossQty += loss.pbQty;
      totalPkLossQty += loss.pkQty;
      totalNasiLossQty += loss.nasiQty;

      // Hitung total produk terjual: PB, PK, Nasi, Kulit
      let salesList: SaleItem[] = [];
      if (Array.isArray(r.sales)) {
        salesList = r.sales;
      } else if (typeof (r as any).sales === 'string') {
        try {
          salesList = JSON.parse((r as any).sales);
        } catch {
          salesList = [];
        }
      }

      if (salesList.length > 0) {
        const soldUnits = calculateSoldUnitsFromSales(salesList);
        totalPbSold += soldUnits.goreng_ayam_pb || 0;
        totalPkSold += soldUnits.goreng_ayam_pk || 0;
        totalNasiSold += soldUnits.nasi || 0;
        totalKulitSold += (soldUnits.goreng_kulit || 0) + (soldUnits.goreng_kulit_ck || 0);
      } else {
        // Fallback selisih stok jika data sales item belum terisi
        const initialPb = Number(r.stock?.goreng_ayam_pb) || 0;
        const remPb = Number(r.remaining_stock?.goreng_ayam_pb) || 0;
        totalPbSold += Math.max(0, initialPb - remPb);

        const initialPk = Number(r.stock?.goreng_ayam_pk) || 0;
        const remPk = Number(r.remaining_stock?.goreng_ayam_pk) || 0;
        totalPkSold += Math.max(0, initialPk - remPk);

        const initialNasi = Number(r.stock?.nasi) || 0;
        const remNasi = Number(r.remaining_stock?.nasi) || 0;
        totalNasiSold += Math.max(0, initialNasi - remNasi);

        const initialKulit =
          (Number(r.stock?.goreng_kulit) || 0) + (Number(r.stock?.goreng_kulit_ck) || 0);
        const remKulit =
          (Number(r.remaining_stock?.goreng_kulit) || 0) + (Number(r.remaining_stock?.goreng_kulit_ck) || 0);
        totalKulitSold += Math.max(0, initialKulit - remKulit);
      }
    }

    const lossPercentage = totalIncome > 0 ? (totalLoss / totalIncome) * 100 : 0;
    const expensePercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const promoPercentage = totalIncome > 0 ? (totalPromo / totalIncome) * 100 : 0;

    return {
      count: filteredReports.length,
      totalIncome,
      totalExpense,
      totalPromo,
      totalClean,
      totalLoss,
      totalPbLossQty,
      totalPkLossQty,
      totalNasiLossQty,
      totalPbSold,
      totalPkSold,
      totalNasiSold,
      totalKulitSold,
      lossPercentage,
      expensePercentage,
      promoPercentage,
    };
  }, [filteredReports]);

  // Current filter human-readable label
  const filterLabel = useMemo(() => {
    let timeText = 'Semua Waktu';
    if (filterType === 'today') timeText = 'Hari Ini';
    else if (filterType === 'week') timeText = '7 Hari Terakhir';
    else if (filterType === 'month') {
      try {
        const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
        timeText = `Bulan Ini (${monthName})`;
      } catch {
        timeText = 'Bulan Ini';
      }
    } else if (filterType === 'custom') {
      if (customStartDate && customEndDate) {
        timeText =
          customStartDate === customEndDate
            ? formatIndonesianDate(customStartDate)
            : `${formatIndonesianDate(customStartDate)} s/d ${formatIndonesianDate(customEndDate)}`;
      } else if (customStartDate) {
        timeText = `Tanggal: ${formatIndonesianDate(customStartDate)}`;
      } else if (customEndDate) {
        timeText = `Sampai: ${formatIndonesianDate(customEndDate)}`;
      } else {
        timeText = 'Rentang Kustom';
      }
    }

    let outletText = 'Semua Outlet';
    if (selectedOutlets.length === 1) {
      outletText = `Outlet ${selectedOutlets[0]}`;
    } else if (selectedOutlets.length > 1) {
      if (selectedOutlets.length === activeOutletsList.length) {
        outletText = `Semua Outlet (${selectedOutlets.length})`;
      } else {
        outletText = `${selectedOutlets.length} Outlet (${selectedOutlets.join(', ')})`;
      }
    }
    return { timeText, outletText };
  }, [filterType, selectedOutlets, activeOutletsList.length, customStartDate, customEndDate]);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Riwayat Laporan Outlet
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300/80 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-amber-700" />
                <span>Admin</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar formulir laporan harian yang telah tersimpan.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              title="Perbarui Data"
              className="p-2 text-slate-600 hover:text-[#E4002B] bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E4002B]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onNewReport}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-bold transition-all shadow-xs min-h-[40px] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Buat Baru</span>
            </button>
            {onLockAdmin && (
              <button
                type="button"
                id="btn-history-lock-admin"
                onClick={onLockAdmin}
                title="Kunci Akses Admin (Keluar dari Riwayat)"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl text-xs font-bold transition-all border border-slate-200/80 min-h-[40px] cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Kunci Akses</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Time Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 min-h-[36px] ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterType('today')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 min-h-[36px] ${
              filterType === 'today'
                ? 'bg-[#E4002B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setFilterType('week')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 min-h-[36px] ${
              filterType === 'week'
                ? 'bg-[#E4002B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            onClick={() => setFilterType('month')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 min-h-[36px] ${
              filterType === 'month'
                ? 'bg-[#E4002B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => setFilterType('custom')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 min-h-[36px] ${
              filterType === 'custom'
                ? 'bg-[#E4002B] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custom Tanggal
          </button>
        </div>

        {/* Custom Date Picker Inputs */}
        {filterType === 'custom' && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="filter-custom-start" className="block text-[10px] font-bold text-slate-500 mb-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  id="filter-custom-start"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none min-h-[38px]"
                />
              </div>
              <div>
                <label htmlFor="filter-custom-end" className="block text-[10px] font-bold text-slate-500 mb-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  id="filter-custom-end"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none min-h-[38px]"
                />
              </div>
            </div>
            {customStartDate && (
              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setCustomEndDate(customStartDate)}
                  className="text-slate-600 hover:text-[#E4002B] font-semibold underline"
                >
                  Set hanya 1 hari ({formatIndonesianDate(customStartDate)})
                </button>
                {customEndDate && (
                  <button
                    type="button"
                    onClick={() => setCustomEndDate('')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Kosongkan batas akhir
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Secondary Filter: Outlet Multi-Select & Search */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Multi-Select Outlet Filter */}
          <div className="relative" ref={outletDropdownRef}>
            <button
              type="button"
              id="filter-outlet-multiselect-btn"
              onClick={() => setIsOutletDropdownOpen(!isOutletDropdownOpen)}
              className={`w-full pl-8 pr-3 py-2 text-left bg-slate-50 border rounded-xl text-xs font-semibold transition-all min-h-[40px] flex items-center justify-between gap-1.5 ${
                selectedOutlets.length > 0
                  ? 'border-[#E4002B]/60 bg-red-50/30 text-slate-900 ring-1 ring-[#E4002B]/20'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="flex-1 truncate pr-1">
                {selectedOutlets.length === 0 ? (
                  <span className="text-slate-600">Semua Outlet (Bisa Multi-Select)</span>
                ) : selectedOutlets.length === 1 ? (
                  <span className="truncate">
                    Outlet: <span className="text-[#E4002B] font-bold">{selectedOutlets[0]}</span>
                  </span>
                ) : (
                  <span className="truncate">
                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 bg-[#E4002B] text-white text-[10px] rounded-md font-bold mr-1.5">
                      {selectedOutlets.length}
                    </span>
                    <span className="text-slate-800 font-bold">{selectedOutlets.join(', ')}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {selectedOutlets.length > 0 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      clearOutletSelection();
                    }}
                    title="Reset Pilihan Outlet"
                    className="p-1 hover:bg-red-100 rounded-full text-slate-400 hover:text-[#E4002B] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isOutletDropdownOpen ? 'rotate-180 text-[#E4002B]' : ''
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isOutletDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-slate-100 bg-slate-50/80">
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Cari nama outlet..."
                      value={outletSearch}
                      onChange={(e) => setOutletSearch(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#E4002B]"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/60 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllOutlets}
                      className="font-bold text-[#E4002B] hover:underline"
                    >
                      Pilih Semua ({activeOutletsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={clearOutletSelection}
                      className="font-medium text-slate-500 hover:text-slate-800"
                    >
                      Kosongkan (Semua)
                    </button>
                  </div>
                </div>

                {/* Outlets Checkbox List */}
                <div className="max-h-60 overflow-y-auto p-1 divide-y divide-slate-50">
                  {activeOutletsList
                    .filter((out) => out.toLowerCase().includes(outletSearch.toLowerCase()))
                    .map((out) => {
                      const isSelected = selectedOutlets.includes(out);
                      const countForOutlet = reports.filter(
                        (r) => r.outlet_name.toLowerCase() === out.toLowerCase()
                      ).length;

                      return (
                        <label
                          key={out}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? 'bg-red-50/80 font-bold text-slate-900'
                              : 'hover:bg-slate-50 text-slate-700 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOutlet(out)}
                              className="w-4 h-4 rounded text-[#E4002B] focus:ring-[#E4002B] border-slate-300 accent-[#E4002B]"
                            />
                            <span>{out}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {countForOutlet} lap
                          </span>
                        </label>
                      );
                    })}
                  {activeOutletsList.filter((out) => out.toLowerCase().includes(outletSearch.toLowerCase())).length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Tidak ada outlet yang cocok
                    </div>
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {selectedOutlets.length === 0
                      ? 'Semua outlet aktif'
                      : `${selectedOutlets.length} dari ${activeOutletsList.length} outlet`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOutletDropdownOpen(false)}
                    className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-[11px] hover:bg-slate-800"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari staff, catatan..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#E4002B] min-h-[40px]"
            />
          </div>
        </div>

        {/* Selected Outlets Chips Bar */}
        {selectedOutlets.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1">Outlet Terpilih ({selectedOutlets.length}):</span>
            {selectedOutlets.map((out) => (
              <span
                key={out}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-bold bg-[#E4002B]/10 text-[#E4002B] border border-[#E4002B]/20"
              >
                <span>{out}</span>
                <button
                  type="button"
                  onClick={() => toggleOutlet(out)}
                  className="hover:bg-[#E4002B]/20 p-0.5 rounded-full text-[#E4002B] transition-colors"
                  title={`Hapus filter ${out}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearOutletSelection}
              className="text-[11px] text-slate-400 hover:text-[#E4002B] underline font-semibold ml-1 cursor-pointer"
            >
              Reset semua outlet
            </button>
          </div>
        )}
      </div>

      {/* Rekapitulasi Total Hasil Filter (Total Pemasukan, Total Pengeluaran, Total Bersih, Total Loss) */}
      <div
        id="filter-summary-card"
        className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Coins className="w-4 h-4 text-red-400" />
              </span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Rekapitulasi Total Hasil Filter
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#E4002B]/10 text-[#E4002B]">
                {filterSummary.count} Laporan
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap font-medium">
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {filterLabel.outletText}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                {filterLabel.timeText}
              </span>
              {searchQuery && (
                <>
                  <span>•</span>
                  <span className="text-slate-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                    Cari: "{searchQuery}"
                  </span>
                </>
              )}
            </div>
          </div>

          {(selectedOutlets.length > 0 || filterType !== 'all' || searchQuery || customStartDate || customEndDate) && (
            <button
              type="button"
              id="btn-reset-filter"
              onClick={() => {
                setFilterType('all');
                setSelectedOutlets([]);
                setSearchQuery('');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="text-xs font-bold text-slate-500 hover:text-[#E4002B] hover:underline cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Reset Semua Filter
            </button>
          )}
        </div>

        {/* 5 Cards Grid: Pemasukan (w/ PB, PK, Nasi, Kulit), Pengeluaran (Aktual), Diskon, Bersih, Loss */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* 1. Total Pemasukan */}
          <div
            id="summary-total-pemasukan"
            className="col-span-2 sm:col-span-1 lg:col-span-1 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                  Total Pemasukan
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black text-emerald-950 tracking-tight">
                {formatRupiah(filterSummary.totalIncome)}
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-700/90 font-medium mt-0.5">
                Akumulasi penerimaan kotor
              </div>
            </div>

            {/* Keterangan Terjual: PB, PK, Nasi, Kulit */}
            <div className="mt-2.5 pt-2 border-t border-emerald-200/70">
              <span className="text-[10px] font-bold text-emerald-900 block mb-1">
                Keterangan:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div className="flex items-center justify-between bg-white/70 px-1.5 py-0.5 rounded border border-emerald-200/50">
                  <span className="text-emerald-800 font-semibold">PB:</span>
                  <span className="font-bold text-emerald-950">{filterSummary.totalPbSold.toLocaleString('id-ID')} pcs</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 px-1.5 py-0.5 rounded border border-emerald-200/50">
                  <span className="text-emerald-800 font-semibold">PK:</span>
                  <span className="font-bold text-emerald-950">{filterSummary.totalPkSold.toLocaleString('id-ID')} pcs</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 px-1.5 py-0.5 rounded border border-emerald-200/50">
                  <span className="text-emerald-800 font-semibold">Nasi:</span>
                  <span className="font-bold text-emerald-950">{filterSummary.totalNasiSold.toLocaleString('id-ID')} pcs</span>
                </div>
                <div className="flex items-center justify-between bg-white/70 px-1.5 py-0.5 rounded border border-emerald-200/50">
                  <span className="text-emerald-800 font-semibold">Kulit:</span>
                  <span className="font-bold text-emerald-950">{filterSummary.totalKulitSold.toLocaleString('id-ID')} pcs</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Total Pengeluaran (Hanya Pengeluaran Aktual) */}
          <div
            id="summary-total-pengeluaran"
            className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-rose-800 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                    Total Pengeluaran
                  </span>
                  {filterSummary.expensePercentage > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-200 text-rose-950 rounded-full" title="Persentase: (Total Pengeluaran ÷ Total Pemasukan) × 100%">
                      {formatPercentage(filterSummary.expensePercentage)}
                    </span>
                  )}
                </div>
                <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black text-rose-950 tracking-tight">
                {formatRupiah(filterSummary.totalExpense)}
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-rose-700/90 font-medium mt-1 truncate" title="Pengeluaran operasional aktual">
              Pengeluaran aktual
            </div>
          </div>

          {/* 3. Total Diskon (Terpisah) */}
          <div
            id="summary-total-diskon"
            className="bg-violet-50/70 border border-violet-200/80 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-violet-800 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                    Total Diskon
                  </span>
                  {filterSummary.promoPercentage > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-violet-200 text-violet-950 rounded-full" title="Persentase: (Total Diskon ÷ Total Pemasukan) × 100%">
                      {formatPercentage(filterSummary.promoPercentage)}
                    </span>
                  )}
                </div>
                <Tag className="w-4 h-4 text-violet-600 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black text-violet-950 tracking-tight">
                {formatRupiah(filterSummary.totalPromo)}
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-violet-700/90 font-medium mt-1 truncate" title="Total potongan promo/diskon">
              Total potongan diskon
            </div>
          </div>

          {/* 4. Total Bersih (Setoran) */}
          <div
            id="summary-total-bersih"
            className="bg-slate-900 text-white rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xs border border-slate-800"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-red-400">
                  Total Bersih
                </span>
                <Coins className="w-4 h-4 text-red-400 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black text-white tracking-tight">
                {formatRupiah(filterSummary.totalClean)}
              </div>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-1">
              Setoran kas bersih akhir
            </div>
          </div>

          {/* 5. Total Loss */}
          <div
            id="summary-total-loss"
            className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-amber-900 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                    Total Loss
                  </span>
                  {filterSummary.lossPercentage > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-200 text-amber-950 rounded-full">
                      {formatPercentage(filterSummary.lossPercentage)}
                    </span>
                  )}
                </div>
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
              <div className="text-base sm:text-xl font-black text-amber-950 tracking-tight">
                {formatRupiah(filterSummary.totalLoss)}
              </div>
            </div>
            <div
              className="text-[10px] sm:text-[11px] text-amber-800/90 font-semibold mt-1 truncate"
              title={`Detail Sisa: PB ${filterSummary.totalPbLossQty} pcs | PK ${filterSummary.totalPkLossQty} pcs | Nasi ${filterSummary.totalNasiLossQty} pcs`}
            >
              {filterSummary.totalLoss > 0
                ? `PB: ${filterSummary.totalPbLossQty} • PK: ${filterSummary.totalPkLossQty} • Nasi: ${filterSummary.totalNasiLossQty}`
                : 'Nol kerugian sisa stock'}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Card List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-[#E4002B] flex items-center justify-center mx-auto mb-2">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Tidak Ada Laporan Ditemukan
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Tidak ada data laporan yang cocok dengan filter yang dipilih. Silakan ubah filter atau buat laporan baru.
            </p>
            <button
              type="button"
              onClick={onNewReport}
              className="mt-3 px-4 py-2 bg-[#E4002B] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#c40024] transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Buat Laporan Hari Ini
            </button>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              id={`report-card-${report.id}`}
              onClick={() => onSelectReport(report)}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#E4002B] p-4 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99] relative group"
            >
              {/* Header: Date & Outlet */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <div className="text-sm font-black text-slate-900 leading-tight">
                    {formatIndonesianDate(report.report_date)}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-[#E4002B] flex-wrap">
                    <span className="flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-[#E4002B]" />
                      <span>{report.outlet_name}</span>
                    </span>
                    {report.staff_name && (
                      <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-[11px]">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{report.staff_name}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Balance Pill */}
                <div>
                  {report.is_balanced ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Balance</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200/60 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Belum Balance</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Metrics Row */}
              <div className="mt-3 grid grid-cols-3 gap-2 py-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    Pemasukan
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-800 truncate mt-0.5">
                    {formatRupiah(report.total_income)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <span>Pengeluaran</span>
                    {report.total_income > 0 && report.total_expense > 0 && (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 rounded">
                        {formatPercentage(calculateExpensePercentage(report.total_expense, report.total_income))}
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-800 truncate mt-0.5">
                    {formatRupiah(report.total_expense)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#E4002B] uppercase">
                    Total Bersih
                  </div>
                  <div className="text-xs sm:text-sm font-black text-[#E4002B] truncate mt-0.5">
                    {formatRupiah(report.final_total)}
                  </div>
                </div>
              </div>

              {/* Footer row: Click prompt & Loss info & Print button */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold gap-2">
                <span className="text-[11px] text-slate-400 group-hover:text-[#E4002B] truncate">
                  Tekan untuk detail & cetak formulir
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {(() => {
                    const loss = calculateLoss(report.remaining_stock);
                    if (loss.totalLoss > 0) {
                      const lossPct = calculateLossPercentage(loss.totalLoss, report.total_income);
                      return (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
                          Loss: {formatRupiah(loss.totalLoss)} ({formatPercentage(lossPct)})
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <button
                    type="button"
                    id={`btn-card-print-${report.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReport(report);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-[#E4002B] text-slate-700 hover:text-white rounded-lg transition-all flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                    title="Buka & Cetak Formulir"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak</span>
                  </button>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-[#E4002B]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
