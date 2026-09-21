import React from 'react';
import { TrendingDown, Info, PackageX, Percent, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StockData } from '../types.ts';
import { calculateLoss, calculateLossPercentage, formatPercentage, LOSS_RATES } from '../utils/stockCalculations.ts';
import { formatRupiah } from '../utils/formatters.ts';

interface LossSectionProps {
  remainingStock: StockData;
  totalIncome: number;
}

export const LossSection: React.FC<LossSectionProps> = ({ remainingStock, totalIncome }) => {
  const lossData = calculateLoss(remainingStock);
  const lossPct = calculateLossPercentage(lossData.totalLoss, totalIncome);

  // Status assessment based on loss percentage
  const getStatusBadge = () => {
    if (lossData.totalLoss === 0) {
      return {
        label: 'Nol Kerugian',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    }
    if (totalIncome <= 0) {
      return {
        label: 'Pemasukan ≤ 0',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        icon: Info,
      };
    }
    if (lossPct <= 1) {
      return {
        label: 'Aman (≤ 1%)',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    }
    if (lossPct <= 2) {
      return {
        label: 'Perhatian (1% - 2%)',
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'Tinggi (> 2%)',
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertTriangle,
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <section className="bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden">
      {/* Header Section 7: LOSS */}
      <div className="px-4 py-3 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-700">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              SECTION 7
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              📉 LOSS (KERUGIAN SISA STOCK)
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-md border border-rose-200">
            Otomatis dari Sisa Stock
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Banner Formula */}
        <div className="bg-rose-50/40 border border-rose-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-950">
          <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed space-y-1">
            <div>
              <span className="font-bold text-rose-900">Perhitungan Kerugian:</span> Sisa Goreng Ayam PB (× {formatRupiah(LOSS_RATES.goreng_ayam_pb)}), Goreng Ayam PK (× {formatRupiah(LOSS_RATES.goreng_ayam_pk)}), dan Nasi (× {formatRupiah(LOSS_RATES.nasi)}).
            </div>
            <div className="text-[11px] text-rose-900/90 font-medium">
              <span className="font-bold">Persentase Kerugian:</span> (Total Kerugian ÷ Total Pemasukan) × 100%
            </div>
          </div>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Goreng Ayam PB */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">Goreng Ayam PB</span>
                <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  pcs
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs text-slate-500 font-medium">Sisa Stock:</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {lossData.pbQty} <span className="text-xs font-normal text-slate-500">pcs</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-[11px] text-slate-500">
                <span>Pengali Modal:</span>
                <span className="font-semibold text-slate-700">× {formatRupiah(LOSS_RATES.goreng_ayam_pb)}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-baseline justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">
                Kerugian PB:
              </span>
              <span className="text-sm font-black text-rose-600">
                {formatRupiah(lossData.pbLoss)}
              </span>
            </div>
          </div>

          {/* Card 2: Goreng Ayam PK */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">Goreng Ayam PK</span>
                <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  pcs
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs text-slate-500 font-medium">Sisa Stock:</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {lossData.pkQty} <span className="text-xs font-normal text-slate-500">pcs</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-[11px] text-slate-500">
                <span>Pengali Modal:</span>
                <span className="font-semibold text-slate-700">× {formatRupiah(LOSS_RATES.goreng_ayam_pk)}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-baseline justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">
                Kerugian PK:
              </span>
              <span className="text-sm font-black text-rose-600">
                {formatRupiah(lossData.pkLoss)}
              </span>
            </div>
          </div>

          {/* Card 3: Nasi */}
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">Nasi</span>
                <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                  pcs
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs text-slate-500 font-medium">Sisa Stock:</span>
                <span className="text-sm font-extrabold text-slate-900">
                  {lossData.nasiQty} <span className="text-xs font-normal text-slate-500">pcs</span>
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-1 text-[11px] text-slate-500">
                <span>Pengali Modal:</span>
                <span className="font-semibold text-slate-700">× {formatRupiah(LOSS_RATES.nasi)}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-baseline justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wide">
                Kerugian Nasi:
              </span>
              <span className="text-sm font-black text-rose-600">
                {formatRupiah(lossData.nasiLoss)}
              </span>
            </div>
          </div>
        </div>

        {/* Dual Summary Banner: Total Loss & Loss Percentage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Total Loss */}
          <div className="bg-gradient-to-br from-rose-900 via-rose-950 to-slate-900 rounded-xl p-4 text-white flex flex-col justify-between shadow-inner">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                <PackageX className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                TOTAL KERUGIAN (LOSS)
              </div>
            </div>

            <div className="text-2xl font-black text-rose-400 tracking-tight">
              {formatRupiah(lossData.totalLoss)}
            </div>

            <div className="text-[11px] text-slate-300 mt-1">
              Akumulasi modal sisa ({lossData.pbQty + lossData.pkQty} pcs ayam + {lossData.nasiQty} pcs nasi)
            </div>
          </div>

          {/* Loss Percentage Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950 rounded-xl p-4 text-white flex flex-col justify-between shadow-inner border border-rose-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                    PERSENTASE KERUGIAN
                  </div>
                  <div className="text-[10px] font-medium text-emerald-400">
                    toleransi kerugian 1%
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${status.bg}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-rose-300 tracking-tight">
                {formatPercentage(lossPct)}
              </span>
              <span className="text-xs text-emerald-400/90 font-medium">
                (toleransi kerugian 1%)
              </span>
            </div>

            <div className="text-[11px] text-slate-300 mt-2 pt-1.5 border-t border-rose-900/40 flex flex-col gap-0.5">
              <span className="text-slate-200 font-medium">
                Persentase kerugian: (Total Kerugian dibagi Total Pemasukan) x 100%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                = ({formatRupiah(lossData.totalLoss)} ÷ {formatRupiah(totalIncome)}) × 100%
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
