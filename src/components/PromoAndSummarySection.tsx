import React from 'react';
import { Tag, Calculator, ArrowDownRight, ArrowUpRight, MinusCircle } from 'lucide-react';
import { formatRupiah, parseNumber } from '../utils/formatters.ts';
import { calculateExpensePercentage, formatPercentage } from '../utils/stockCalculations.ts';

interface PromoAndSummarySectionProps {
  promo: number;
  setPromo: React.Dispatch<React.SetStateAction<number>>;
  promoNote: string;
  setPromoNote: React.Dispatch<React.SetStateAction<string>>;
  totalIncome: number;
  totalExpense: number;
  finalTotal: number;
}

export const PromoAndSummarySection: React.FC<PromoAndSummarySectionProps> = ({
  promo,
  setPromo,
  promoNote,
  setPromoNote,
  totalIncome,
  totalExpense,
  finalTotal,
}) => {
  const handlePromoChange = (val: string) => {
    const parsed = parseNumber(val);
    setPromo(parsed);
  };

  return (
    <div className="space-y-4">
      {/* SECTION 5: PROMO */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-red-50/70 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E4002B]/10 text-[#E4002B]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                SECTION 5
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                🏷️ PROMO / DISKON
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            Default Rp 0
          </span>
        </div>

        <div className="p-4 space-y-3.5">
          <div>
            <label
              htmlFor="input-promo"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Promo / Potongan Harga
            </label>
            <div className="relative max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                id="input-promo"
                value={promo === 0 ? '' : promo.toLocaleString('id-ID')}
                onChange={(e) => handlePromoChange(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#E4002B] focus:ring-2 focus:ring-[#E4002B]/20 rounded-xl text-base font-extrabold text-slate-900 focus:outline-none transition-all min-h-[44px]"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Masukkan nilai diskon atau promo voucher jika ada potongan harga offline.
            </p>
          </div>

          {/* Catatan Promo */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="input-promo-note"
                className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
              >
                <span>Catatan Promo</span>
                <span className="text-[10px] font-normal text-slate-400">(Keterangan diskon / program)</span>
              </label>
              {promoNote && (
                <button
                  type="button"
                  onClick={() => setPromoNote('')}
                  className="text-[10px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Hapus
                </button>
              )}
            </div>
            <input
              type="text"
              id="input-promo-note"
              value={promoNote}
              onChange={(e) => setPromoNote(e.target.value)}
              placeholder="Contoh: Diskon Jumat Berkah, Promo Opening, Voucher Diskon 10rb, dll"
              className="w-full px-3.5 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#E4002B] focus:ring-2 focus:ring-[#E4002B]/20 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none transition-all min-h-[42px]"
            />
            {/* Quick chips for promo notes */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-medium text-slate-400">Pilihan cepat:</span>
              {[
                'Jumat Berkah',
                'Promo Opening',
                'Voucher Diskon',
                'Diskon Karyawan',
                'Promo Bundling',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() =>
                    setPromoNote((prev) => (prev ? `${prev}, ${chip}` : chip))
                  }
                  className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-md px-2 py-0.5 active:scale-95 transition-all cursor-pointer"
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: RINGKASAN */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 bg-[#E4002B]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E4002B]/20 text-[#E4002B]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E4002B]">
                SECTION 6
              </span>
              <h2 className="text-base font-extrabold tracking-tight text-white leading-tight">
                📊 RINGKASAN HARIAN
              </h2>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
            Otomatis
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
          {/* Total Pemasukan */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>TOTAL PEMASUKAN</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 tracking-tight">
              {formatRupiah(totalIncome)}
            </div>
          </div>

          {/* Total Pengeluaran */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>TOTAL PENGELUARAN</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-rose-400 tracking-tight flex items-baseline justify-between gap-1">
              <span>{formatRupiah(totalExpense)}</span>
              <span className="text-xs font-bold text-rose-300 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-900/60">
                {formatPercentage(calculateExpensePercentage(totalExpense, totalIncome))}
              </span>
            </div>
          </div>

          {/* Promo */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
              <span>PROMO</span>
              <MinusCircle className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-red-300 tracking-tight">
              {formatRupiah(promo)}
            </div>
          </div>
        </div>

        {/* Total Akhir Highlight Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10 bg-[#E4002B]/10 -mx-5 -mb-5 p-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-200">
              TOTAL AKHIR BERSIH
            </div>
            <div className="text-[11px] text-slate-400">
              Pemasukan - (Pengeluaran + Promo)
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#ff4d6d] tracking-tight">
            {formatRupiah(finalTotal)}
          </div>
        </div>
      </section>
    </div>
  );
};
