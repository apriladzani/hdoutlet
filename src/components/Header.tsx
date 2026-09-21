import React from 'react';
import { Calendar, Store, FileText, History, User, Lock, Unlock, Database } from 'lucide-react';
import { AppTab, OUTLETS } from '../types.ts';

interface HeaderProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  reportDate: string;
  setReportDate: (date: string) => void;
  outletName: string;
  setOutletName: (outlet: string) => void;
  staffName: string;
  setStaffName: (name: string) => void;
  historyCount: number;
  isAdminUnlocked?: boolean;
  onRequestOpenHistory?: () => void;
  onRequestOpenMaster?: () => void;
  onLockAdmin?: () => void;
  availableOutlets?: string[];
  currentOutletType?: 'traditional' | 'modern';
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  reportDate,
  setReportDate,
  outletName,
  setOutletName,
  staffName,
  setStaffName,
  historyCount,
  isAdminUnlocked = false,
  onRequestOpenHistory,
  onRequestOpenMaster,
  onLockAdmin,
  availableOutlets,
  currentOutletType,
}) => {
  const handleHistoryClick = () => {
    if (isAdminUnlocked) {
      setCurrentTab('history');
    } else {
      if (onRequestOpenHistory) {
        onRequestOpenHistory();
      } else {
        setCurrentTab('history');
      }
    }
  };

  const handleMasterClick = () => {
    if (isAdminUnlocked) {
      setCurrentTab('master');
    } else {
      if (onRequestOpenMaster) {
        onRequestOpenMaster();
      } else if (onRequestOpenHistory) {
        onRequestOpenHistory();
      } else {
        setCurrentTab('master');
      }
    }
  };

  const activeOutletsList = availableOutlets && availableOutlets.length > 0 ? availableOutlets : OUTLETS;

  return (
    <header className="bg-white border-b border-red-200/80 sticky top-0 z-30 shadow-xs">
      {/* Top Brand Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Logo Badge */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#E4002B] to-[#b30022] flex items-center justify-center text-white font-black text-xs sm:text-lg shadow-xs tracking-tighter shrink-0">
              HD
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                HD Fried Chicken
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold text-[#E4002B] leading-none mt-0.5">
                Laporan Harian
              </p>
            </div>
          </div>

          {/* Navigation Tab Pills for Mobile & Desktop: Formulir, Riwayat, Kelola Data */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="flex p-0.5 sm:p-1 bg-slate-100 rounded-lg sm:rounded-xl border border-slate-200/80">
              {/* Tab 1: Formulir */}
              <button
                type="button"
                id="nav-tab-form"
                onClick={() => setCurrentTab('form')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all min-h-[30px] sm:min-h-[38px] cursor-pointer ${
                  currentTab === 'form'
                    ? 'bg-[#E4002B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Formulir</span>
              </button>

              {/* Tab 2: Riwayat */}
              <button
                type="button"
                id="nav-tab-history"
                onClick={handleHistoryClick}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all min-h-[30px] sm:min-h-[38px] cursor-pointer ${
                  currentTab === 'history'
                    ? 'bg-[#E4002B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isAdminUnlocked ? 'Riwayat Laporan' : 'Riwayat Laporan (Perlu PIN Admin)'}
              >
                <History className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Riwayat</span>
                {!isAdminUnlocked && (
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0" />
                )}
                {historyCount > 0 && (
                  <span
                    className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-full font-black ${
                      currentTab === 'history' ? 'bg-[#90001a] text-red-100' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {historyCount}
                  </span>
                )}
              </button>

              {/* Tab 3: Kelola Data (Fitur Baru Terpisah) */}
              <button
                type="button"
                id="nav-tab-master"
                onClick={handleMasterClick}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all min-h-[30px] sm:min-h-[38px] cursor-pointer ${
                  currentTab === 'master'
                    ? 'bg-[#E4002B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={isAdminUnlocked ? 'Kelola Data Master' : 'Kelola Data Master (Perlu PIN Admin)'}
              >
                <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Kelola Data</span>
                {!isAdminUnlocked && (
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0" />
                )}
              </button>
            </div>

            {/* Lock Admin shortcut when on history/master and unlocked */}
            {isAdminUnlocked && onLockAdmin && (
              <button
                type="button"
                id="btn-header-lock-admin"
                onClick={onLockAdmin}
                className="p-1 sm:p-2 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-all cursor-pointer min-h-[30px] min-w-[30px] sm:min-h-[38px] sm:min-w-[38px] flex items-center justify-center border border-slate-200/70"
                title="Kunci Akses Admin (Keluar dari Riwayat / Kelola Data)"
              >
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Date, Outlet & Staff Selectors (Active on Form View) */}
        {currentTab === 'form' && (
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100">
            {/* Tanggal */}
            <div className="min-w-0">
              <label htmlFor="header-report-date" className="block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 sm:mb-1 truncate">
                <span className="sm:hidden">Tanggal</span>
                <span className="hidden sm:inline">Tanggal Laporan</span>
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[#E4002B] absolute left-2 sm:left-3 pointer-events-none shrink-0" />
                <input
                  type="date"
                  id="header-report-date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full min-w-0 pl-6 sm:pl-9 pr-1 sm:pr-3 py-1 sm:py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all min-h-[32px] sm:min-h-[44px]"
                />
              </div>
            </div>

            {/* Outlet */}
            <div className="min-w-0">
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <label htmlFor="header-outlet-name" className="block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                  Outlet
                </label>
                {currentOutletType && (
                  <span
                    className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight ${
                      currentOutletType === 'modern'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {currentOutletType === 'modern' ? '🏬 Modern' : '🏛️ Tradisional'}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Store className="w-3 h-3 sm:w-4 sm:h-4 text-[#E4002B] absolute left-2 sm:left-3 pointer-events-none shrink-0" />
                <select
                  id="header-outlet-name"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  className="w-full min-w-0 pl-6 sm:pl-9 pr-4 sm:pr-8 py-1 sm:py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all min-h-[32px] sm:min-h-[44px] appearance-none cursor-pointer truncate"
                >
                  <option value="" disabled>
                    Pilih Outlet
                  </option>
                  {activeOutletsList.map((out) => (
                    <option key={out} value={out}>
                      {out}
                    </option>
                  ))}
                </select>
                <div className="absolute right-1.5 sm:right-3 pointer-events-none text-slate-400 text-[8px] sm:text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Nama Pegawai (Wajib) */}
            <div className="min-w-0">
              <label htmlFor="header-staff-name" className="block text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 sm:mb-1 truncate">
                <span className="sm:hidden">
                  Pegawai <span className="text-red-500 font-extrabold">*</span>
                </span>
                <span className="hidden sm:inline">
                  Nama Pegawai <span className="text-red-500 font-extrabold">*</span>
                </span>
              </label>
              <div className="relative flex items-center">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-[#E4002B] absolute left-2 sm:left-3 pointer-events-none shrink-0" />
                <input
                  type="text"
                  id="header-staff-name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Wajib diisi..."
                  required
                  className={`w-full min-w-0 pl-6 sm:pl-9 pr-1.5 sm:pr-3 py-1 sm:py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all min-h-[32px] sm:min-h-[44px] ${
                    !staffName.trim() ? 'border-amber-300' : 'border-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
