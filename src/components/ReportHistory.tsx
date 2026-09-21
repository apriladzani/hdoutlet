import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Store,
  ChevronRight,
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
} from 'lucide-react';
import { DailyReport, OUTLETS } from '../types.ts';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters.ts';
import {
  calculateLoss,
  calculateLossPercentage,
  calculateExpensePercentage,
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
  const [outletFilter, setOutletFilter] = useState<string>('Semua');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const activeOutletsList = availableOutlets && availableOutlets.length > 0 ? availableOutlets : OUTLETS;
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    // Outlet match
    if (outletFilter !== 'Semua' && r.outlet_name.toLowerCase() !== outletFilter.toLowerCase()) {
      return false;
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
      if (customStartDate && r.report_date < customStartDate) return false;
      if (customEndDate && r.report_date > customEndDate) return false;
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
    }

    const lossPercentage = totalIncome > 0 ? (totalLoss / totalIncome) * 100 : 0;
    const expensePercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

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
      lossPercentage,
      expensePercentage,
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
      timeText = customStartDate && customEndDate
        ? `${customStartDate} s/d ${customEndDate}`
        : 'Rentang Kustom';
    }

    const outletText = outletFilter === 'Semua' ? 'Semua Outlet' : `Outlet ${outletFilter}`;
    return { timeText, outletText };
  }, [filterType, outletFilter, customStartDate, customEndDate]);

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
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
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
        )}

        {/* Secondary Filter: Outlet & Search */}
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Outlet Filter */}
          <div className="relative">
            <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              id="filter-outlet-select"
              value={outletFilter}
              onChange={(e) => setOutletFilter(e.target.value)}
              className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:border-[#E4002B] min-h-[40px]"
            >
              <option value="Semua">Semua Outlet</option>
              {activeOutletsList.map((out) => (
                <option key={out} value={out}>
                  {out}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">
              ▼
            </span>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tanggal, catatan..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#E4002B] min-h-[40px]"
            />
          </div>
        </div>
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

          {(outletFilter !== 'Semua' || filterType !== 'all' || searchQuery || customStartDate || customEndDate) && (
            <button
              type="button"
              id="btn-reset-filter"
              onClick={() => {
                setFilterType('all');
                setOutletFilter('Semua');
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

        {/* 4 Cards Grid for Pemasukan, Pengeluaran, Bersih, Loss */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* 1. Total Pemasukan */}
          <div
            id="summary-total-pemasukan"
            className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                Total Pemasukan
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-950 tracking-tight">
              {formatRupiah(filterSummary.totalIncome)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-700/90 font-medium mt-1">
              Akumulasi penerimaan kotor
            </div>
          </div>

          {/* 2. Total Pengeluaran */}
          <div
            id="summary-total-pengeluaran"
            className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between"
          >
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
            <div className="text-[10px] sm:text-[11px] text-rose-700/90 font-medium mt-1 truncate">
              {filterSummary.totalPromo > 0
                ? `Biaya operasional (+Promo: ${formatRupiah(filterSummary.totalPromo)})`
                : 'Biaya operasional & belanja'}
            </div>
          </div>

          {/* 3. Total Bersih (Setoran) */}
          <div
            id="summary-total-bersih"
            className="bg-slate-900 text-white rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-xs border border-slate-800"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-red-400">
                Total Bersih
              </span>
              <Coins className="w-4 h-4 text-red-400 shrink-0" />
            </div>
            <div className="text-base sm:text-xl font-black text-white tracking-tight">
              {formatRupiah(filterSummary.totalClean)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-1">
              Setoran kas bersih akhir
            </div>
          </div>

          {/* 4. Total Loss */}
          <div
            id="summary-total-loss"
            className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between"
          >
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
