import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import { DailyReport } from '../types.ts';
import {
  calculateLoss,
  calculateLossPercentage,
  calculateExpensePercentage,
  formatPercentage,
  LOSS_RATES,
} from '../utils/stockCalculations.ts';
import {
  formatRupiah,
  formatIndonesianDate,
  generateWaSummary,
} from '../utils/formatters.ts';
import { printElement } from '../utils/printUtils.ts';

interface ReportDetailModalProps {
  report: DailyReport | null;
  onClose: () => void;
  onEdit: (report: DailyReport) => void;
  onDelete: (id: number) => void;
}

// Helper to get formatted display for Olahan Dapur Goreng PB/PK
function getOlahanPbDisplay(stock?: DailyReport['stock']): string {
  if (!stock) return '-';
  const masak = stock.masak_ayam_pb?.trim();
  if (masak) {
    const num = Number(masak);
    if (!isNaN(num) && num > 0) {
      const kg = num * 0.5;
      const pcs = num * 5;
      return `${masak} (${kg} kg • ${pcs} pcs)`;
    }
    return `${masak} kg`;
  }
  if (stock.goreng_ayam?.trim()) {
    return `${stock.goreng_ayam} kg`;
  }
  if (stock.goreng_ayam_pb?.trim() && stock.goreng_ayam_pb !== '0') {
    return `${stock.goreng_ayam_pb} pcs`;
  }
  return '-';
}

function getOlahanPkDisplay(stock?: DailyReport['stock']): string {
  if (!stock) return '-';
  const masak = stock.masak_ayam_pk?.trim();
  if (masak) {
    const num = Number(masak);
    if (!isNaN(num) && num > 0) {
      const kg = num * 0.5;
      const pcs = num * 4;
      return `${masak} (${kg} kg • ${pcs} pcs)`;
    }
    return `${masak} kg`;
  }
  if (stock.goreng_ayam?.trim()) {
    return `${stock.goreng_ayam} kg`;
  }
  if (stock.goreng_ayam_pk?.trim() && stock.goreng_ayam_pk !== '0') {
    return `${stock.goreng_ayam_pk} pcs`;
  }
  return '-';
}

function getSiapJualPbDisplay(stock?: DailyReport['stock']): string {
  if (!stock) return '-';
  if (stock.goreng_ayam_pb?.trim() && stock.goreng_ayam_pb !== '0') {
    return `${stock.goreng_ayam_pb} pcs`;
  }
  const masak = stock.masak_ayam_pb?.trim();
  if (masak) {
    const num = Number(masak);
    if (!isNaN(num) && num > 0) {
      return `${num * 5} pcs`;
    }
  }
  return stock.goreng_ayam_pb?.trim() ? `${stock.goreng_ayam_pb} pcs` : '-';
}

function getSiapJualPkDisplay(stock?: DailyReport['stock']): string {
  if (!stock) return '-';
  if (stock.goreng_ayam_pk?.trim() && stock.goreng_ayam_pk !== '0') {
    return `${stock.goreng_ayam_pk} pcs`;
  }
  const masak = stock.masak_ayam_pk?.trim();
  if (masak) {
    const num = Number(masak);
    if (!isNaN(num) && num > 0) {
      return `${num * 4} pcs`;
    }
  }
  return stock.goreng_ayam_pk?.trim() ? `${stock.goreng_ayam_pk} pcs` : '-';
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copiedWa, setCopiedWa] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!report) return null;

  const handleCopyWa = () => {
    const text = generateWaSummary(report);
    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2500);
  };

  const handlePrint = () => {
    printElement(
      'printable-report-content',
      `Laporan Harian HD Fried Chicken - ${report.outlet_name} (${report.report_date})`
    );
  };

  return (
    <div
      id="report-detail-modal-root"
      className="print-modal-backdrop fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className="print-modal-container bg-white w-full max-w-3xl sm:max-w-4xl print:max-w-none rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar (no-print) */}
        <div className="no-print px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4002B]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              {report.id === 0 ? 'Preview Formulir Laporan' : 'Preview Laporan Tersimpan'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
              📄 Pas 1 Lembar A4
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyWa}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Salin ringkasan untuk WhatsApp"
            >
              {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWa ? 'Tersalin!' : 'Salin WA'}</span>
            </button>
            <button
              type="button"
              id="btn-modal-print-top"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#E4002B] hover:bg-[#c40024] active:bg-[#a0001e] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Cetak Formulir Laporan (Pas 1 Lembar A4)"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Cetak Laporan</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer ml-1"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulir Content (Official Single-Page A4 Vertical Layout - Downwards Flow) */}
        <div
          id="printable-report-content"
          className="print-modal-body p-3.5 sm:p-5 print:p-0 overflow-y-auto space-y-2.5 print:space-y-1 font-sans text-slate-900 bg-[#fdfdfd]"
        >
          {/* Header Formulir */}
          <div className="text-center border-b-2 border-slate-900 pb-2 print:pb-1 print:mb-1 print-break-inside-avoid">
            <h2 className="text-xl sm:text-2xl print:text-sm font-black tracking-tight text-slate-900 uppercase">
              HD FRIED CHICKEN
            </h2>
            <div className="text-xs print:text-[7.5pt] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
              FORMULIR LAPORAN HARIAN OUTLET
            </div>
            <div className="mt-1.5 print:mt-0.5 flex flex-wrap items-center justify-center gap-3 sm:gap-6 print:gap-4 text-xs print:text-[7.5pt] font-semibold text-slate-700">
              <div>
                <span className="text-slate-500">Tanggal:</span>{' '}
                <span className="font-bold underline">{formatIndonesianDate(report.report_date)}</span>
              </div>
              <div>
                <span className="text-slate-500">Outlet:</span>{' '}
                <span className="font-bold underline">{report.outlet_name}</span>
              </div>
              <div>
                <span className="text-slate-500">Pegawai:</span>{' '}
                <span className="font-bold underline text-red-900">{report.staff_name || '-'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 1: BEGINNING STOCK */}
          <div className="border border-slate-300 print:border-slate-400 rounded-xl print:rounded overflow-hidden bg-white print-break-inside-avoid">
            <div className="bg-red-100/70 px-3 py-1 print:px-2 print:py-0.5 font-bold text-red-900 border-b border-slate-300 print:border-slate-400 flex justify-between items-center text-xs print:text-[7.5pt]">
              <span>SECTION 1: 📦 BEGINNING STOCK</span>
              <span className="text-[10px] print:text-[6.5pt] text-red-800">Stok & Olahan Awal</span>
            </div>
            <div className="p-2 print:p-1 space-y-1.5 print:space-y-0.5 text-xs print:text-[7pt]">
              {/* Bahan Baku & Olahan Dapur */}
              <div>
                <span className="text-[10px] print:text-[6.5pt] font-bold uppercase text-slate-500 block mb-0.5">
                  Bahan Baku & Olahan Dapur:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 print:grid-cols-7 gap-1.5 print:gap-1">
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60">
                    <span className="text-slate-500 block text-[9px] print:text-[6pt]">Ayam Mentah</span>
                    <span className="font-bold">{report.stock?.ayam_mentah || '-'} kg</span>
                  </div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-red-50 rounded border border-red-200/60">
                    <span className="text-red-800 block text-[9px] print:text-[6pt]">Goreng PB</span>
                    <span className="font-bold text-red-950">
                      {getOlahanPbDisplay(report.stock)}
                    </span>
                  </div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-red-50 rounded border border-red-200/60">
                    <span className="text-red-800 block text-[9px] print:text-[6pt]">Goreng PK</span>
                    <span className="font-bold text-red-950">
                      {getOlahanPkDisplay(report.stock)}
                    </span>
                  </div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60">
                    <span className="text-slate-500 block text-[9px] print:text-[6pt]">Beras</span>
                    <span className="font-bold">{report.stock?.beras || '-'} kg</span>
                  </div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-red-50 rounded border border-red-200/60">
                    <span className="text-red-800 block text-[9px] print:text-[6pt]">Nyangu</span>
                    <span className="font-bold text-red-950">{report.stock?.masak_nasi || '-'} kg</span>
                  </div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60">
                    <span className="text-slate-500 block text-[9px] print:text-[6pt]">Kulit Mentah</span>
                    <span className="font-bold">{report.stock?.kulit_mentah || '-'} kg</span>
                  </div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-red-50 rounded border border-red-200/60">
                    <span className="text-red-800 block text-[9px] print:text-[6pt]">Kulit CK (Masak)</span>
                    <span className="font-bold text-red-950">{report.stock?.masak_kulit_ck ? report.stock.masak_kulit_ck + ' pcs' : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Tosser In & Tosser Out */}
              <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-1.5 print:gap-1">
                <div className="p-1.5 print:p-0.5 bg-emerald-50/50 rounded print:rounded border border-emerald-200">
                  <span className="text-[9px] print:text-[6pt] font-bold text-emerald-900 block mb-0.5">
                    📥 Tosser In:
                  </span>
                  <div className="grid grid-cols-7 gap-1 print:gap-0.5 text-[10px] print:text-[6.5pt] text-center">
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">PB</span><span className="font-bold text-emerald-950">{report.stock?.tosser_in?.goreng_ayam_pb || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">PK</span><span className="font-bold text-emerald-950">{report.stock?.tosser_in?.goreng_ayam_pk || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Kulit</span><span className="font-bold text-emerald-950">{report.stock?.tosser_in?.goreng_kulit || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Kulit CK</span><span className="font-bold text-emerald-950">{report.stock?.tosser_in?.goreng_kulit_ck || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Nasi</span><span className="font-bold text-emerald-950">{report.stock?.tosser_in?.nasi || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Chili</span><span className="font-bold text-emerald-950">{report.stock?.tosser_in?.s_chili_oil || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Geprek</span><span className="font-bold text-emerald-950">{report.stock?.tosser_in?.s_geprek || '0'}</span></div>
                  </div>
                </div>

                <div className="p-1.5 print:p-0.5 bg-rose-50/50 rounded print:rounded border border-rose-200">
                  <span className="text-[9px] print:text-[6pt] font-bold text-rose-900 block mb-0.5">
                    📤 Tosser Out:
                  </span>
                  <div className="grid grid-cols-7 gap-1 print:gap-0.5 text-[10px] print:text-[6.5pt] text-center">
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">PB</span><span className="font-bold text-rose-950">{report.stock?.tosser_out?.goreng_ayam_pb || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">PK</span><span className="font-bold text-rose-950">{report.stock?.tosser_out?.goreng_ayam_pk || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Kulit</span><span className="font-bold text-rose-950">{report.stock?.tosser_out?.goreng_kulit || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Kulit CK</span><span className="font-bold text-rose-950">{report.stock?.tosser_out?.goreng_kulit_ck || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Nasi</span><span className="font-bold text-rose-950">{report.stock?.tosser_out?.nasi || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Chili</span><span className="font-bold text-rose-950">{report.stock?.tosser_out?.s_chili_oil || '0'}</span></div>
                    <div className="bg-white/80 rounded py-0.5"><span className="text-slate-400 text-[8px] print:text-[5.5pt] block">Geprek</span><span className="font-bold text-rose-950">{report.stock?.tosser_out?.s_geprek || '0'}</span></div>
                  </div>
                </div>
              </div>

              {/* Produk Siap Jual */}
              <div>
                <span className="text-[10px] print:text-[6.5pt] font-bold uppercase text-slate-500 block mb-0.5">
                  Produk Siap Jual (Total Stok Awal):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 print:grid-cols-7 gap-1.5 print:gap-1">
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Goreng PB</span><span className="font-bold">{getSiapJualPbDisplay(report.stock)}</span></div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Goreng PK</span><span className="font-bold">{getSiapJualPkDisplay(report.stock)}</span></div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Goreng Kulit</span><span className="font-bold">{report.stock?.goreng_kulit || '-'} pcs</span></div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Kulit CK</span><span className="font-bold">{report.stock?.goreng_kulit_ck || '-'} pcs</span></div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Nasi</span><span className="font-bold">{report.stock?.nasi || '-'} pcs</span></div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">S. Chili</span><span className="font-bold">{report.stock?.s_chili_oil || '-'} pcs</span></div>
                  <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">S. Geprek</span><span className="font-bold">{report.stock?.s_geprek || '-'} pcs</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PEMASUKAN OFFLINE */}
          <div className="border border-slate-300 print:border-slate-400 rounded-xl print:rounded overflow-hidden bg-white print-break-inside-avoid">
            <div className="bg-emerald-100/70 px-3 py-1 print:px-2 print:py-0.5 font-bold text-emerald-900 border-b border-slate-300 print:border-slate-400 flex justify-between items-center text-xs print:text-[7.5pt]">
              <span>SECTION 2: 💰 SALES </span>
              <span className="text-xs print:text-[7.5pt] font-black">
                Total: {formatRupiah(report.total_income)}
              </span>
            </div>
            <div className="p-2 print:p-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 print:grid-cols-5 gap-1.5 print:gap-1 text-xs print:text-[7pt]">
                {(() => {
                  const salesArr = report.sales || [];
                  const activeSales = salesArr.filter((s) => Number(s.quantity) > 0);
                  const itemsToRender = activeSales.length > 0 ? activeSales : salesArr;

                  return itemsToRender.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-1.5 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 truncate text-[10px] print:text-[6.5pt] leading-tight block">
                            {item.product_name}
                          </span>
                          {item.description && (
                            <span className="text-[8px] print:text-[5.5pt] text-slate-500 truncate block">
                              {item.description}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-1 rounded border border-slate-200 text-[10px] print:text-[6.5pt] shrink-0">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] print:text-[6pt] text-slate-500 mt-0.5 pt-0.5 border-t border-slate-200/50">
                        <span>@{formatRupiah(item.price)}</span>
                        <span className="font-bold text-emerald-800">{formatRupiah(item.subtotal)}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>

          {/* SECTION 3: ENDING STOCK */}
          <div className="border border-slate-300 print:border-slate-400 rounded-xl print:rounded overflow-hidden bg-white print-break-inside-avoid">
            <div className="bg-red-100/70 px-3 py-1 print:px-2 print:py-0.5 font-bold text-red-900 border-b border-slate-300 print:border-slate-400 flex justify-between items-center text-xs print:text-[7.5pt]">
              <span>SECTION 3: 📦 ENDING STOCK</span>
              <span className="text-[10px] print:text-[6.5pt] text-red-800">Sisa Fisik</span>
            </div>
            <div className="p-2 print:p-1 text-xs print:text-[7pt] grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 print:grid-cols-9 gap-1.5 print:gap-1">
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60">
                <span className="text-slate-500 block text-[9px] print:text-[6pt]">Ayam Mentah</span>
                <span className="font-bold">{report.remaining_stock?.ayam_mentah || '-'} kg</span>
                {report.remaining_stock?.ayam_mentah_keterangan &&
                  report.remaining_stock.ayam_mentah_keterangan !== `${report.remaining_stock?.ayam_mentah || '-'} kg` && (
                    <span className="text-[8.5px] print:text-[5.5pt] font-semibold text-red-700 block leading-tight">
                      {report.remaining_stock.ayam_mentah_keterangan}
                    </span>
                  )}
              </div>
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Beras</span><span className="font-bold">{report.remaining_stock?.beras || '-'} kg</span></div>
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Goreng PB</span><span className="font-bold">{report.remaining_stock?.goreng_ayam_pb || '-'} pcs</span></div>
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Goreng PK</span><span className="font-bold">{report.remaining_stock?.goreng_ayam_pk || '-'} pcs</span></div>
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Goreng Kulit</span><span className="font-bold">{report.remaining_stock?.goreng_kulit || '-'} pcs</span></div>
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Kulit CK</span><span className="font-bold">{report.remaining_stock?.goreng_kulit_ck || '-'} pcs</span></div>
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">Nasi</span><span className="font-bold">{report.remaining_stock?.nasi || '-'} pcs</span></div>
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">S. Chili Oil</span><span className="font-bold">{report.remaining_stock?.s_chili_oil || '-'} pcs</span></div>
              <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60"><span className="text-slate-500 block text-[9px] print:text-[6pt]">S. Geprek</span><span className="font-bold">{report.remaining_stock?.s_geprek || '-'} pcs</span></div>
            </div>
          </div>

          {/* SECTION 4: PENGELUARAN & PROMO */}
          {(() => {
            const expensePct = calculateExpensePercentage(report.total_expense, report.total_income);
            return (
              <div className="border border-slate-300 print:border-slate-400 rounded-xl print:rounded overflow-hidden bg-white print-break-inside-avoid">
                <div className="bg-rose-100/70 px-3 py-1 print:px-2 print:py-0.5 font-bold text-rose-900 border-b border-slate-300 print:border-slate-400 flex justify-between items-center text-xs print:text-[7.5pt]">
                  <span>SECTION 4: 💸 PENGELUARAN & PROMO</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs print:text-[7.5pt] font-black">
                      Total: {formatRupiah(report.total_expense + (report.promo || 0))}
                    </span>
                    <span className="bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-bold text-[10px] print:text-[6.5pt]">
                      {formatPercentage(expensePct)}
                    </span>
                  </div>
                </div>
                <div className="p-2 print:p-1 text-xs print:text-[7pt] space-y-1.5 print:space-y-0.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 print:grid-cols-7 gap-1.5 print:gap-1">
                    <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                      <span className="text-slate-600">Gas:</span>
                      <span className="font-bold">{formatRupiah(report.expenses?.gas)}</span>
                    </div>
                    <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                      <span className="text-slate-600">Galon:</span>
                      <span className="font-bold">{formatRupiah(report.expenses?.galon)}</span>
                    </div>
                    <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                      <span className="text-slate-600 truncate">Clean Tools:</span>
                      <span className="font-bold shrink-0">{formatRupiah(report.expenses?.clean_tools)}</span>
                    </div>
                    <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                      <span className="text-slate-600">Kulit:</span>
                      <span className="font-bold">{formatRupiah(report.expenses?.kulit)}</span>
                    </div>
                    <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                      <span className="text-slate-600">Meal:</span>
                      <span className="font-bold">{formatRupiah(report.expenses?.meal)}</span>
                    </div>
                    <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                      <span className="text-slate-600">Bonus:</span>
                      <span className="font-bold">{formatRupiah(report.expenses?.bonus)}</span>
                    </div>
                    <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200/60 flex justify-between">
                      <span className="text-slate-600 truncate">
                        Lain2 {report.expenses?.lain_lain_keterangan ? `(${report.expenses?.lain_lain_keterangan})` : ''}:
                      </span>
                      <span className="font-bold shrink-0">{formatRupiah(report.expenses?.lain_lain)}</span>
                    </div>
                  </div>

                  {(report.expenses?.beras || report.expenses?.saus || report.expenses?.minyak) ? (
                    <div className="flex flex-wrap gap-2 text-[10px] print:text-[6.5pt] text-slate-500">
                      {report.expenses?.beras ? <span>Beras: {formatRupiah(report.expenses.beras)}</span> : null}
                      {report.expenses?.saus ? <span>Saus: {formatRupiah(report.expenses.saus)}</span> : null}
                      {report.expenses?.minyak ? <span>Minyak: {formatRupiah(report.expenses.minyak)}</span> : null}
                    </div>
                  ) : null}

                  {(report.promo > 0 || report.promo_note) && (
                    <div className="p-1.5 print:py-0.5 print:px-1.5 bg-red-50 rounded border border-red-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-red-800 font-bold text-[10px] print:text-[6.5pt]">Promo / Potongan:</span>
                        {report.promo_note && (
                          <span className="text-[10px] print:text-[6.5pt] text-red-700 italic">
                            ({report.promo_note})
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-red-900">{formatRupiah(report.promo)}</span>
                    </div>
                  )}

                  <div className="px-1.5 py-0.5 bg-rose-50/50 rounded border border-rose-100 flex items-center justify-between text-[8px] print:text-[5.5pt] text-slate-600">
                    <span>Persentase Pengeluaran: (Total Pengeluaran ÷ Total Pemasukan) x 100%</span>
                    <span className="font-bold text-rose-800">
                      = ({formatRupiah(report.total_expense)} ÷ {formatRupiah(report.total_income)}) × 100% = {formatPercentage(expensePct)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* SECTION 5: TOTAL AKHIR & RINCIAN PEMBAYARAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 print:gap-1.5 items-stretch print-break-inside-avoid">
            {/* TOTAL AKHIR SUMMARY BOX */}
            <div className="border-2 border-slate-900 rounded-xl print:rounded p-2 print:p-1.5 bg-red-50/60 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs print:text-[7.5pt] font-black uppercase tracking-wider text-slate-900">
                    TOTAL AKHIR (SETORAN BERSIH)
                  </div>
                  <div className="text-[9px] print:text-[6pt] text-slate-500 mt-0.5">
                    Sales {formatRupiah(report.total_income)} - (Beban {formatRupiah(report.total_expense)} + Promo {formatRupiah(report.promo)})
                  </div>
                </div>
                <div className="text-lg print:text-sm font-black text-red-950">
                  {formatRupiah(report.final_total)}
                </div>
              </div>
            </div>

            {/* RINCIAN PEMBAYARAN */}
            <div className="border border-slate-300 print:border-slate-400 rounded-xl print:rounded overflow-hidden text-xs print:text-[7pt] bg-white flex flex-col justify-between">
              <div className="bg-slate-100 px-2 py-1 print:px-1.5 print:py-0.5 font-bold text-slate-800 border-b border-slate-300 print:border-slate-400 flex justify-between items-center text-xs print:text-[7.5pt]">
                <span>💳 RINCIAN PEMBAYARAN</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] print:text-[6pt] font-bold ${report.is_balanced ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                  {report.is_balanced ? '✓ Balance' : `⚠ Selisih: ${formatRupiah(report.balance_difference)}`}
                </span>
              </div>
              <div className="p-1.5 print:p-1 grid grid-cols-3 gap-1">
                <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200">
                  <span className="block text-slate-500 text-[8px] print:text-[5.5pt] uppercase font-bold">Tunai</span>
                  <span className="font-extrabold text-slate-900 text-[10px] print:text-[6.5pt]">{formatRupiah(report.payments?.tunai)}</span>
                </div>
                <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200">
                  <span className="block text-slate-500 text-[8px] print:text-[5.5pt] uppercase font-bold">QR / QRIS</span>
                  <span className="font-extrabold text-slate-900 text-[10px] print:text-[6.5pt]">{formatRupiah(report.payments?.qr)}</span>
                </div>
                <div className="p-1 print:py-0.5 print:px-1 bg-slate-50 rounded border border-slate-200">
                  <span className="block text-slate-500 text-[8px] print:text-[5.5pt] uppercase font-bold">Transfer</span>
                  <span className="font-extrabold text-slate-900 text-[10px] print:text-[6.5pt]">{formatRupiah(report.payments?.tf)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: LOSS & CATATAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-2 print:gap-1.5 items-stretch print-break-inside-avoid">
            {/* ESTIMASI LOSS */}
            {(() => {
              const lossData = calculateLoss(report.remaining_stock);
              const lossPct = calculateLossPercentage(lossData.totalLoss, report.total_income);
              return (
                <div className="border border-rose-200 print:border-rose-300 rounded-xl print:rounded overflow-hidden text-xs print:text-[7pt] bg-white flex flex-col justify-between">
                  <div className="bg-rose-100/80 px-2 py-1 print:px-1.5 print:py-0.5 font-bold text-rose-900 border-b border-rose-200 print:border-rose-300 flex justify-between items-center text-xs print:text-[7.5pt]">
                    <span>📉 ESTIMASI LOSS</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs print:text-[7pt] font-black text-rose-800">
                        {formatRupiah(lossData.totalLoss)}
                      </span>
                      <span className="text-[8px] print:text-[5.5pt] font-bold bg-rose-200 text-rose-900 px-1 py-0.2 rounded">
                        {formatPercentage(lossPct)}
                      </span>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between text-[8px] print:text-[5.5pt] text-slate-600">
                    <span>Persentase kerugian: (Total Kerugian dibagi Total Pemasukan) x 100%</span>
                    <span className="text-emerald-700 font-semibold">toleransi kerugian 1%</span>
                  </div>
                  <div className="p-1.5 print:p-1 grid grid-cols-3 gap-1 bg-rose-50/20">
                    <div className="p-1 print:py-0.5 print:px-1 bg-white rounded border border-rose-100">
                      <span className="block text-slate-500 text-[8px] print:text-[5.5pt] uppercase font-bold">Goreng PB</span>
                      <span className="text-[9px] print:text-[6pt] text-slate-600">{lossData.pbQty} pcs</span>
                      <span className="block font-black text-rose-600 text-[9px] print:text-[6pt]">{formatRupiah(lossData.pbLoss)}</span>
                    </div>
                    <div className="p-1 print:py-0.5 print:px-1 bg-white rounded border border-rose-100">
                      <span className="block text-slate-500 text-[8px] print:text-[5.5pt] uppercase font-bold">Goreng PK</span>
                      <span className="text-[9px] print:text-[6pt] text-slate-600">{lossData.pkQty} pcs</span>
                      <span className="block font-black text-rose-600 text-[9px] print:text-[6pt]">{formatRupiah(lossData.pkLoss)}</span>
                    </div>
                    <div className="p-1 print:py-0.5 print:px-1 bg-white rounded border border-rose-100">
                      <span className="block text-slate-500 text-[8px] print:text-[5.5pt] uppercase font-bold">Nasi</span>
                      <span className="text-[9px] print:text-[6pt] text-slate-600">{lossData.nasiQty} pcs</span>
                      <span className="block font-black text-rose-600 text-[9px] print:text-[6pt]">{formatRupiah(lossData.nasiLoss)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* CATATAN OUTLET */}
            <div className="border border-slate-300 print:border-slate-400 rounded-xl print:rounded p-2 print:p-1.5 text-xs print:text-[7pt] bg-slate-50/80 flex flex-col justify-start">
              <div className="font-bold text-slate-700 mb-0.5 uppercase text-[9px] print:text-[6.5pt]">
                📝 CATATAN OUTLET:
              </div>
              <div className="text-slate-800 whitespace-pre-wrap text-[10px] print:text-[6.5pt] italic flex-1">
                {report.notes || 'Tidak ada catatan khusus hari ini.'}
              </div>
            </div>
          </div>

          {/* Tanda Tangan Fisik (Paper Signature Area) */}
          <div className="pt-2 print:pt-1 pb-1 print:pb-0 grid grid-cols-2 gap-8 print:gap-16 text-center text-xs print:text-[7pt] print-break-inside-avoid">
            <div className="border-t border-slate-400 pt-0.5">
              <div className="font-bold text-slate-800 uppercase text-[9px] print:text-[6.5pt] tracking-wider">Petugas Outlet</div>
              <div className="h-7 print:h-5 flex items-center justify-center text-slate-300 italic text-[9px] print:text-[6pt] select-none">(Tanda Tangan)</div>
              <div className="font-bold text-slate-700 underline text-xs print:text-[7pt]">{report.staff_name || 'Petugas'}</div>
            </div>
            <div className="border-t border-slate-400 pt-0.5">
              <div className="font-bold text-slate-800 uppercase text-[9px] print:text-[6.5pt] tracking-wider">Pemilik / Pengawas</div>
              <div className="h-7 print:h-5 flex items-center justify-center text-slate-300 italic text-[9px] print:text-[6pt] select-none">(Tanda Tangan)</div>
              <div className="font-bold text-slate-700 underline text-xs print:text-[7pt]">( ................................... )</div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (no-print) */}
        <div className="no-print p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {report.id > 0 && (
              !showDeleteConfirm ? (
                <button
                  type="button"
                  id="btn-delete-report"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-rose-200 cursor-pointer min-h-[42px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id="btn-confirm-delete"
                    onClick={() => onDelete(report.id)}
                    className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[42px]"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[42px]"
                  >
                    Batal
                  </button>
                </div>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-modal-print-bottom"
              onClick={handlePrint}
              className="px-5 py-2.5 bg-[#E4002B] hover:bg-[#c40024] active:bg-[#a0001e] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md cursor-pointer min-h-[42px]"
              title="Cetak Formulir Laporan ke Kertas A4 (Pas 1 Lembar)"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Cetak Laporan</span>
            </button>
            {report.id > 0 && (
              <button
                type="button"
                id="btn-edit-report"
                onClick={() => onEdit(report)}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[42px]"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Laporan</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer min-h-[42px]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
