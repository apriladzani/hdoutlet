/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Printer,
  Lock,
} from 'lucide-react';
import {
  AppTab,
  DailyReport,
  DEFAULT_PRODUCTS,
  ExpenseData,
  OutletItem,
  OUTLETS,
  PaymentData,
  Product,
  ReportFormData,
  SaleItem,
  StockData,
} from './types.ts';
import { Header } from './components/Header.tsx';
import { StockSection } from './components/StockSection.tsx';
import { SalesSection } from './components/SalesSection.tsx';
import { RemainingStockSection } from './components/RemainingStockSection.tsx';
import { ExpensesSection } from './components/ExpensesSection.tsx';
import { PromoAndSummarySection } from './components/PromoAndSummarySection.tsx';
import { LossSection } from './components/LossSection.tsx';
import { PaymentAndNotesSection } from './components/PaymentAndNotesSection.tsx';
import { ReportHistory } from './components/ReportHistory.tsx';
import { MasterManagement } from './components/MasterManagement.tsx';
import { ReportDetailModal } from './components/ReportDetailModal.tsx';
import { AdminPinModal } from './components/AdminPinModal.tsx';
import { formatRupiah } from './utils/formatters.ts';
import {
  PRODUCT_STOCK_MAPPINGS,
  parseStockQuantity,
  generateRemainingStockFromSales,
  calculateLoss,
  calculateLossPercentage,
  calculateChickenRemainingDetail,
  calculateSoldUnitsFromSales,
  getProductStockSummary,
  clampSalesToStock,
} from './utils/stockCalculations.ts';
import {
  getLocalReports,
  upsertLocalReport,
  removeLocalReport,
  mergeReportsWithLocal,
} from './utils/reportStorage.ts';

const INITIAL_STOCK: StockData = {
  ayam_mentah: '',
  goreng_ayam: '',
  masak_ayam_pb: '',
  masak_ayam_pk: '',
  kulit_mentah: '',
  masak_kulit_ck: '',
  beras: '',
  masak_nasi: '',
  tosser_in: {
    goreng_ayam_pb: '',
    goreng_ayam_pk: '',
    goreng_kulit: '',
    goreng_kulit_ck: '',
    nasi: '',
    s_chili_oil: '',
    s_geprek: '',
  },
  tosser_out: {
    goreng_ayam_pb: '',
    goreng_ayam_pk: '',
    goreng_kulit: '',
    goreng_kulit_ck: '',
    nasi: '',
    s_chili_oil: '',
    s_geprek: '',
  },
  goreng_ayam_pb: '',
  goreng_ayam_pk: '',
  goreng_kulit: '',
  goreng_kulit_ck: '',
  nasi: '',
  s_chili_oil: '',
  s_geprek: '',
};

const INITIAL_EXPENSES: ExpenseData = {
  gas: 0,
  galon: 0,
  clean_tools: 0,
  kulit: 0,
  meal: 0,
  bonus: 0,
  lain_lain: 0,
  lain_lain_keterangan: '',
};

const INITIAL_PAYMENTS: PaymentData = {
  tunai: 0,
  qr: 0,
  tf: 0,
};

function getInitialSales(targetType: 'traditional' | 'modern' = 'traditional'): SaleItem[] {
  return DEFAULT_PRODUCTS
    .filter((p) => p.active !== false && (p.outlet_type === targetType || p.outlet_type === 'all' || !p.outlet_type))
    .map((p) => ({
      product_id: p.id,
      product_name: p.name,
      price: p.selling_price,
      quantity: 0,
      subtotal: 0,
      description: p.description,
      items_composition: p.items_composition,
    }));
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('form');
  const intendedTabRef = useRef<AppTab>('history');

  // Master Data & PIN State
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem('hd_admin_pin') || '0825';
    } catch {
      return '0825';
    }
  });

  const [outlets, setOutlets] = useState<OutletItem[]>(() =>
    OUTLETS.map((name, i) => ({
      id: i + 1,
      name,
      active: true,
      outlet_type: name === 'BRP' || name === 'Taman Sari' ? 'modern' : 'traditional',
    }))
  );
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const isEditLoadingRef = useRef<boolean>(false);
  const [reportDate, setReportDate] = useState<string>(() => {
    // Current date in YYYY-MM-DD (e.g. 2026-09-10)
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [outletName, setOutletName] = useState<string>('Cisalak');
  const [staffName, setStaffName] = useState<string>('');
  const [stock, setStock] = useState<StockData>(INITIAL_STOCK);
  const [remainingStock, setRemainingStock] = useState<StockData>(INITIAL_STOCK);
  const [sales, setSales] = useState<SaleItem[]>(() => getInitialSales('traditional'));
  const [expenses, setExpenses] = useState<ExpenseData>(INITIAL_EXPENSES);
  const [promo, setPromo] = useState<number>(0);
  const [promoNote, setPromoNote] = useState<string>('');
  const [payments, setPayments] = useState<PaymentData>(INITIAL_PAYMENTS);
  const [notes, setNotes] = useState<string>('');

  // Active outlet and its type ('traditional' or 'modern')
  const activeOutlet = outlets.find((o) => o.name === outletName);
  const currentOutletType: 'traditional' | 'modern' =
    activeOutlet?.outlet_type || (outletName.toLowerCase().includes('kawalu') ? 'traditional' : 'traditional');

  // UI state
  const [reports, setReports] = useState<DailyReport[]>(() => getLocalReports());
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Admin PIN Protection State (PIN: dynamic, default 0825)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hd_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [showPinModal, setShowPinModal] = useState<boolean>(false);

  const handleRequestOpenHistory = () => {
    intendedTabRef.current = 'history';
    if (isAdminUnlocked) {
      setCurrentTab('history');
    } else {
      setShowPinModal(true);
    }
  };

  const handleRequestOpenMaster = () => {
    intendedTabRef.current = 'master';
    if (isAdminUnlocked) {
      setCurrentTab('master');
    } else {
      setShowPinModal(true);
    }
  };

  const handlePinSuccess = () => {
    setIsAdminUnlocked(true);
    try {
      sessionStorage.setItem('hd_admin_unlocked', 'true');
    } catch {
      // ignore
    }
    setShowPinModal(false);
    const targetTab = intendedTabRef.current || 'history';
    setCurrentTab(targetTab);
    showToast(
      targetTab === 'master'
        ? 'Akses Admin berhasil dibuka! Selamat datang di Kelola Data.'
        : 'Akses Admin berhasil dibuka! Selamat datang di Riwayat Laporan.',
      'success'
    );
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
  };

  const handlePinChangeSuccess = (newPin: string) => {
    setAdminPin(newPin);
    try {
      localStorage.setItem('hd_admin_pin', newPin);
    } catch {
      // ignore
    }
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    try {
      sessionStorage.removeItem('hd_admin_unlocked');
    } catch {
      // ignore
    }
    setCurrentTab('form');
    showToast('Akses Admin telah dikunci.', 'success');
  };

  // Auto-generate Sisa Stock: (Stok Awal - Jumlah Pemasukan Offline)
  // When Stock Awal or Pemasukan Offline changes, Sisa Stock is automatically generated
  // Raw materials (ayam mentah, kulit mentah, beras) are kept for manual closing entry
  useEffect(() => {
    if (isEditLoadingRef.current) {
      isEditLoadingRef.current = false;
      return;
    }

    setRemainingStock((prevRem) => {
      let hasChanges = false;
      const nextRem = { ...prevRem };
      const soldUnits = calculateSoldUnitsFromSales(sales);

      for (const mapping of PRODUCT_STOCK_MAPPINGS) {
        const stockVal = stock[mapping.stockKey];
        const stockNum = parseStockQuantity(stockVal);
        const soldQty = soldUnits[mapping.stockKey] || 0;

        if (stockNum !== null) {
          const calcRem = Math.max(0, stockNum - soldQty).toString();
          if (nextRem[mapping.stockKey] !== calcRem) {
            nextRem[mapping.stockKey] = calcRem;
            hasChanges = true;
          }
        }
      }

      // Sisa Ayam Mentah = Stok Awal Ayam Mentah - (Goreng PB * 0.5 kg + Goreng PK * 0.5 kg)
      const ayamInitial = parseStockQuantity(stock.ayam_mentah);
      const pbCook = parseStockQuantity(stock.masak_ayam_pb) || 0;
      const pkCook = parseStockQuantity(stock.masak_ayam_pk) || 0;

      if (ayamInitial !== null) {
        const chickenDetail = calculateChickenRemainingDetail(ayamInitial, pbCook, pkCook);
        const calcAyamRem = chickenDetail.totalRemainingKg.toString();
        if (nextRem.ayam_mentah !== calcAyamRem) {
          nextRem.ayam_mentah = calcAyamRem;
          hasChanges = true;
        }
        if (chickenDetail.description && nextRem.ayam_mentah_keterangan !== chickenDetail.description) {
          nextRem.ayam_mentah_keterangan = chickenDetail.description;
          hasChanges = true;
        }
      }

      // Sisa Beras = Stok Awal Beras - Stok Awal Masak Nasi
      const berasInitial = parseStockQuantity(stock.beras);
      const berasMasak = parseStockQuantity(stock.masak_nasi) || 0;
      if (berasInitial !== null) {
        const calcBerasRem = (Math.round(Math.max(0, berasInitial - berasMasak) * 100) / 100).toString();
        if (nextRem.beras !== calcBerasRem) {
          nextRem.beras = calcBerasRem;
          hasChanges = true;
        }
      }

      return hasChanges ? nextRem : prevRem;
    });
  }, [stock, sales]);

  // Enforce that sales quantities never exceed available initial stock
  useEffect(() => {
    if (isEditLoadingRef.current) return;

    setSales((prevSales) => {
      const { clampedSales, hasChanges } = clampSalesToStock(prevSales, stock);
      return hasChanges ? clampedSales : prevSales;
    });
  }, [stock]);

  // Calculations
  const totalIncome = sales.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);
  const totalExpense =
    (Number(expenses.gas) || 0) +
    (Number(expenses.galon) || 0) +
    (Number(expenses.clean_tools) || 0) +
    (Number(expenses.kulit) || 0) +
    (Number(expenses.meal) || 0) +
    (Number(expenses.bonus) || 0) +
    (Number(expenses.lain_lain) || 0) +
    (Number(expenses.beras) || 0) +
    (Number(expenses.saus) || 0) +
    (Number(expenses.minyak) || 0);

  // Formula: Total Akhir = Total Pemasukan - (Total Pengeluaran + Promo)
  const finalTotal = totalIncome - (totalExpense + (Number(promo) || 0));

  // Payment Balance: Tunai + QR + TF = Total Akhir
  const totalPayment = (Number(payments.tunai) || 0) + (Number(payments.qr) || 0) + (Number(payments.tf) || 0);
  const isBalanced = totalPayment === finalTotal;
  const balanceDifference = totalPayment - finalTotal;

  // Show Toast helper
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch reports from server
  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        const merged = mergeReportsWithLocal(Array.isArray(data) ? data : []);
        setReports(merged);
      } else {
        setReports(getLocalReports());
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setReports(getLocalReports());
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Fetch settings (PIN)
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((settings) => {
        if (settings?.admin_pin) {
          setAdminPin(settings.admin_pin);
          try {
            localStorage.setItem('hd_admin_pin', settings.admin_pin);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => { });

    // Fetch master outlets
    fetch('/api/outlets')
      .then((res) => (res.ok ? res.json() : []))
      .then((outs: OutletItem[]) => {
        if (Array.isArray(outs) && outs.length > 0) {
          setOutlets(outs);
        }
      })
      .catch(() => { });

    // Fetch master products
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : []))
      .then((prods: Product[]) => {
        if (Array.isArray(prods) && prods.length > 0) {
          setProducts(prods);
        }
      })
      .catch(() => { });
  }, []);

  // Sync sales items when master products list updates or outlet changes
  useEffect(() => {
    if (editingId) return;
    if (products.length > 0) {
      setSales((prevSales) => {
        const existingMap = new Map<number, SaleItem>(prevSales.map((s) => [s.product_id, s]));
        const targetProducts = products.filter(
          (p) => p.active !== false && (p.outlet_type === currentOutletType || p.outlet_type === 'all' || !p.outlet_type)
        );
        return targetProducts.map((p) => {
          const existing = existingMap.get(p.id);
          const qty = existing ? Number(existing.quantity) || 0 : 0;
          return {
            product_id: p.id,
            product_name: p.name,
            price: p.selling_price,
            quantity: qty,
            subtotal: qty * p.selling_price,
            description: p.description,
            items_composition: p.items_composition,
          };
        });
      });
    }
  }, [products, currentOutletType, editingId]);

  // Reset Form to initial state
  const resetForm = () => {
    setEditingId(null);
    setStaffName('');
    setStock(INITIAL_STOCK);
    setRemainingStock(INITIAL_STOCK);
    setSales(getInitialSales(currentOutletType));
    setExpenses(INITIAL_EXPENSES);
    setPromo(0);
    setPromoNote('');
    setPayments(INITIAL_PAYMENTS);
    setNotes('');
  };

  // Populate form for editing
  const handleEditReport = (report: DailyReport) => {
    isEditLoadingRef.current = true;
    setSelectedReport(null);
    setEditingId(report.id);
    setReportDate(report.report_date);
    setOutletName(report.outlet_name);
    setStaffName(report.staff_name || '');
    setStock({ ...INITIAL_STOCK, ...(report.stock || {}) });
    setRemainingStock({ ...INITIAL_STOCK, ...(report.remaining_stock || {}) });

    // Determine outlet type of edited report
    const reportOutlet = outlets.find((o) => o.name === report.outlet_name);
    const reportType: 'traditional' | 'modern' =
      reportOutlet?.outlet_type || (report.outlet_name.toLowerCase().includes('kawalu') ? 'traditional' : 'traditional');

    // Sync sales with master products for this outlet type
    const existingSalesMap = new Map(report.sales.map((s) => [s.product_id, s]));
    const targetProducts = products.filter(
      (p) => p.active !== false && (p.outlet_type === reportType || p.outlet_type === 'all' || !p.outlet_type)
    );
    const hydratedSales = targetProducts.map((p) => {
      const found = existingSalesMap.get(p.id);
      return {
        product_id: p.id,
        product_name: p.name,
        price: p.selling_price,
        quantity: found ? found.quantity : 0,
        subtotal: found ? found.subtotal : 0,
        description: p.description,
        items_composition: p.items_composition,
      };
    });
    setSales(hydratedSales);
    setExpenses({ ...INITIAL_EXPENSES, ...(report.expenses || {}) });
    setPromo(report.promo || 0);
    setPromoNote(report.promo_note || '');
    setPayments({ ...INITIAL_PAYMENTS, ...(report.payments || {}) });
    setNotes(report.notes || '');

    setCurrentTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Memuat data laporan #${report.id} untuk diedit`, 'success');
  };

  // Delete report
  const handleDeleteReport = async (id: number) => {
    try {
      const remaining = removeLocalReport(id);
      setReports(remaining);
      setSelectedReport(null);
      showToast('Laporan berhasil dihapus', 'success');
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
      showToast('Laporan telah dihapus dari riwayat lokal', 'success');
    }
  };

  // Submit Laporan
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!outletName) {
      showToast('Harap pilih nama outlet terlebih dahulu', 'error');
      return;
    }

    if (!reportDate) {
      showToast('Harap isi tanggal laporan', 'error');
      return;
    }

    if (!staffName || !staffName.trim()) {
      showToast('Nama pegawai wajib diisi sebelum menyimpan laporan!', 'error');
      const staffInput = document.getElementById('header-staff-name');
      if (staffInput) {
        staffInput.focus();
        staffInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Validation: ensure no sales exceed initial stock
    for (const mapping of PRODUCT_STOCK_MAPPINGS) {
      const stockVal = stock[mapping.stockKey];
      const stockNum = parseStockQuantity(stockVal);
      const saleItem = sales.find((s) => s.product_id === mapping.productId);
      if (stockNum !== null && saleItem && saleItem.quantity > stockNum) {
        showToast(
          `Penjualan ${saleItem.product_name} (${saleItem.quantity}) melebihi stok awal (${stockNum}). Maksimal input adalah ${stockNum}.`,
          'error'
        );
        return;
      }
    }

    setIsSubmitting(true);
    const lossResult = calculateLoss(remainingStock);
    const lossPercentage = calculateLossPercentage(lossResult.totalLoss, totalIncome);

    const assignedId = editingId || (Date.now() % 100000000);
    const localRecord: DailyReport = {
      id: assignedId,
      report_date: reportDate,
      outlet_name: outletName,
      staff_name: staffName.trim(),
      total_income: totalIncome,
      total_expense: totalExpense,
      promo,
      promo_note: promoNote.trim(),
      final_total: finalTotal,
      is_balanced: isBalanced,
      balance_difference: balanceDifference,
      total_loss: lossResult.totalLoss,
      loss_percentage: lossPercentage,
      notes,
      created_at: new Date().toISOString(),
      stock: { ...stock },
      remaining_stock: { ...remainingStock },
      sales: [...sales],
      expenses: { ...expenses },
      payments: { ...payments },
    };

    // Guarantee persistence locally immediately
    const updatedLocalReports = upsertLocalReport(localRecord);
    setReports(updatedLocalReports);

    const payload: ReportFormData = {
      report_date: reportDate,
      outlet_name: outletName,
      staff_name: staffName.trim(),
      stock,
      remaining_stock: remainingStock,
      sales,
      expenses,
      promo,
      promo_note: promoNote.trim(),
      payments,
      total_loss: lossResult.totalLoss,
      loss_percentage: lossPercentage,
      notes,
    };

    try {
      const url = editingId ? `/api/reports/${editingId}` : '/api/reports';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let finalSavedRecord: DailyReport = localRecord;

      if (res.ok) {
        const savedReport: DailyReport = await res.json();
        if (!editingId) {
          removeLocalReport(assignedId);
        }
        upsertLocalReport(savedReport);
        setReports(getLocalReports());
        setEditingId(savedReport.id);
        finalSavedRecord = savedReport;
      } else {
        setEditingId(localRecord.id);
      }

      showToast(
        editingId
          ? 'Laporan berhasil diperbarui dan tersimpan di riwayat!'
          : 'Laporan harian berhasil disimpan ke riwayat!' +
          (!isBalanced ? ` (Terdapat selisih kas ${formatRupiah(Math.abs(balanceDifference))})` : ''),
        'success'
      );

      // Buka preview modal agar user dapat memeriksa / mencetak laporan sebelum ditutup
      // Jangan langsung reset / close form secara otomatis!
      setSaveSuccess(true);
      setSelectedReport(finalSavedRecord);
      setIsAdminUnlocked(true);
      try {
        sessionStorage.setItem('hd_admin_unlocked', 'true');
      } catch {
        // ignore
      }
    } catch (err) {
      console.warn('Saved report to local storage due to network failure:', err);
      setEditingId(localRecord.id);
      showToast('Laporan berhasil disimpan ke riwayat!', 'success');
      setSaveSuccess(true);
      setSelectedReport(localRecord);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewAndPrintCurrentForm = () => {
    const currentDraft: DailyReport = {
      id: editingId || 0,
      report_date: reportDate,
      outlet_name: outletName,
      staff_name: staffName,
      total_income: totalIncome,
      total_expense: totalExpense,
      promo: promo,
      promo_note: promoNote,
      final_total: finalTotal,
      is_balanced: isBalanced,
      balance_difference: balanceDifference,
      notes: notes,
      created_at: new Date().toISOString(),
      stock: stock,
      remaining_stock: remainingStock,
      sales: sales,
      expenses: expenses,
      payments: payments,
    };
    setSelectedReport(currentDraft);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-slate-800 flex flex-col antialiased selection:bg-red-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all animate-in fade-in slide-in-from-top-3 duration-200 max-w-[90vw] ${toastMessage.type === 'success'
              ? 'bg-emerald-800 text-white'
              : 'bg-rose-800 text-white'
            }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-300" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Header Component */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        reportDate={reportDate}
        setReportDate={setReportDate}
        outletName={outletName}
        setOutletName={setOutletName}
        staffName={staffName}
        setStaffName={setStaffName}
        historyCount={reports.length}
        isAdminUnlocked={isAdminUnlocked}
        onRequestOpenHistory={handleRequestOpenHistory}
        onRequestOpenMaster={handleRequestOpenMaster}
        onLockAdmin={handleLockAdmin}
        availableOutlets={outlets.filter((o) => o.active !== false).map((o) => o.name)}
        currentOutletType={currentOutletType}
      />

      {/* Main Content Area */}
      <main id="main-app-content" className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-4">
        {currentTab === 'form' ? (
          <div className="space-y-4 pb-28">
            {/* Edit Mode Alert Banner */}
            {editingId && (
              <div className="bg-[#E4002B]/10 border border-[#E4002B]/30 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#E4002B] text-white font-bold text-xs">
                    EDIT
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-red-950">
                      Mengedit Laporan ID #{editingId}
                    </h3>
                    <p className="text-xs text-red-800">
                      Ubah data di formulir bawah ini lalu tekan tombol perbarui.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 bg-white border border-red-300 text-red-900 rounded-lg text-xs font-bold hover:bg-red-50 transition-all cursor-pointer shrink-0 min-h-[36px]"
                >
                  Batal Edit
                </button>
              </div>
            )}

            {/* SECTION 1: STOCK AWAL */}
            <StockSection
              stock={stock}
              setStock={setStock}
            />

            {/* SECTION 2: PEMASUKAN OFFLINE */}
            <SalesSection
              sales={sales}
              setSales={setSales}
              totalIncome={totalIncome}
              stock={stock}
              outletType={currentOutletType}
            />

            {/* SECTION 3: SISA STOCK */}
            <RemainingStockSection
              remainingStock={remainingStock}
              setRemainingStock={setRemainingStock}
              stock={stock}
              sales={sales}
              onResetToCalculated={() => {
                setRemainingStock((prev) => generateRemainingStockFromSales(stock, sales, prev));
                showToast('Sisa stock berhasil dihitung ulang dari Stok Awal − Penjualan Offline', 'success');
              }}
            />

            {/* SECTION 4: PENGELUARAN */}
            <ExpensesSection
              expenses={expenses}
              setExpenses={setExpenses}
              totalExpense={totalExpense}
              totalIncome={totalIncome}
            />

            {/* SECTION 5 & 6: PROMO & RINGKASAN */}
            <PromoAndSummarySection
              promo={promo}
              setPromo={setPromo}
              promoNote={promoNote}
              setPromoNote={setPromoNote}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              finalTotal={finalTotal}
            />

            {/* SECTION 7: LOSS (KERUGIAN SISA STOCK) */}
            <LossSection remainingStock={remainingStock} totalIncome={totalIncome} />

            {/* SECTION 8 & 9: PEMBAYARAN & CATATAN */}
            <PaymentAndNotesSection
              payments={payments}
              setPayments={setPayments}
              finalTotal={finalTotal}
              notes={notes}
              setNotes={setNotes}
            />

            {/* Desktop / Inline Save Button (Visible alongside sticky bottom) */}
            <div className="hidden sm:flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Setoran Akhir
                </div>
                <div className="text-2xl font-black text-[#E4002B]">
                  {formatRupiah(finalTotal)}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs font-semibold">
                  {isBalanced ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pembayaran Balance
                    </span>
                  ) : (
                    <span className="text-[#E4002B] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Belum Balance ({formatRupiah(balanceDifference)})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold flex items-center gap-1.5 cursor-pointer min-h-[46px]"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  id="btn-desktop-preview-print"
                  onClick={handlePreviewAndPrintCurrentForm}
                  className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold flex items-center gap-1.5 cursor-pointer min-h-[46px] transition-all shadow-xs"
                  title="Lihat formulir & cetak"
                >
                  <Printer className="w-4 h-4 text-[#E4002B]" />
                  <span>Preview & Cetak</span>
                </button>
                <button
                  type="button"
                  id="btn-desktop-save-report"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit()}
                  className="px-6 py-3 rounded-xl bg-[#E4002B] hover:bg-[#c40024] active:bg-[#a0001e] text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px]"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'PERBARUI LAPORAN' : 'SIMPAN LAPORAN'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : !isAdminUnlocked ? (
          /* LOCKED VIEW FOR UNAUTHENTICATED USERS */
          <div
            id="view-admin-locked"
            className="max-w-md mx-auto my-8 sm:my-16 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl text-center animate-in fade-in duration-200"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {currentTab === 'master' ? 'Kelola Data Terkunci' : 'Akses Riwayat Terkunci'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed max-w-xs mx-auto">
              Halaman {currentTab === 'master' ? 'Kelola Data Master' : 'Riwayat Laporan'} dilindungi kode PIN Admin untuk menjaga privasi & keamanan data outlet.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                id="btn-open-pin-prompt"
                onClick={() => setShowPinModal(true)}
                className="w-full py-3 px-4 bg-[#E4002B] hover:bg-[#c40024] active:bg-[#a0001e] text-white rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Masukkan PIN Admin ({adminPin})</span>
              </button>
              <button
                type="button"
                id="btn-back-to-form-from-locked"
                onClick={() => setCurrentTab('form')}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[42px]"
              >
                Kembali ke Formulir
              </button>
            </div>
          </div>
        ) : currentTab === 'master' ? (
          /* KELOLA MASTER DATA VIEW */
          <MasterManagement
            currentPin={adminPin}
            onPinChangeSuccess={handlePinChangeSuccess}
            outlets={outlets}
            setOutlets={setOutlets}
            products={products}
            setProducts={setProducts}
            showToast={showToast}
            onLockAdmin={handleLockAdmin}
          />
        ) : (
          /* RIWAYAT LAPORAN VIEW */
          <ReportHistory
            reports={reports}
            loading={loadingReports}
            onRefresh={fetchReports}
            onSelectReport={(r) => setSelectedReport(r)}
            onNewReport={() => {
              resetForm();
              setCurrentTab('form');
            }}
            onLockAdmin={handleLockAdmin}
            availableOutlets={outlets.filter((o) => o.active !== false).map((o) => o.name)}
          />
        )}
      </main>

      {/* STICKY BOTTOM ACTION BAR (OPTIMIZED FOR SMARTPHONE ONE-HAND USAGE) */}
      {currentTab === 'form' && (
        <aside
          aria-label="Aksi Simpan Laporan"
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 py-2.5 sm:hidden"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5">
            {/* Quick Status Mini Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  Total Akhir:
                </span>
                {isBalanced ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Balance
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-[#E4002B] bg-red-50 px-1 rounded flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Selisih {formatRupiah(balanceDifference)}
                  </span>
                )}
              </div>
              <div className="text-base font-black text-slate-900 truncate">
                {formatRupiah(finalTotal)}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Sticky Print / Preview Button */}
              <button
                type="button"
                id="btn-sticky-preview-print"
                onClick={handlePreviewAndPrintCurrentForm}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1 min-h-[46px] border border-slate-200 cursor-pointer"
                title="Lihat formulir & cetak"
              >
                <Printer className="w-4 h-4 text-[#E4002B]" />
                <span>Cetak</span>
              </button>

              {/* Sticky Primary Action Button */}
              <button
                type="button"
                id="btn-sticky-save-report"
                disabled={isSubmitting}
                onClick={() => handleSubmit()}
                className="px-4 py-2.5 bg-[#E4002B] hover:bg-[#c40024] active:bg-[#a0001e] disabled:opacity-50 text-white rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center gap-1.5 transition-all min-h-[46px] cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Perbarui' : 'Simpan'}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* DETAIL LAPORAN MODAL (DIGITAL PAPER FORM VIEW) */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onEdit={handleEditReport}
        onDelete={handleDeleteReport}
      />

      {/* ADMIN PIN VERIFICATION MODAL */}
      <AdminPinModal
        isOpen={showPinModal}
        currentPin={adminPin}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
    </div>
  );
}
