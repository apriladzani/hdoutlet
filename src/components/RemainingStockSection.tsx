import React from 'react';
import { Archive, Sparkles, RefreshCw, CheckCircle2, Flame } from 'lucide-react';
import { ChickenConversionConfig, EndingStockMasterItem, SaleItem, StockData, StockMasterItem } from '../types.ts';
import {
  PRODUCT_STOCK_MAPPINGS,
  parseStockQuantity,
  calculateAllRemainingStock,
  calculateRawMaterialsRemaining,
} from '../utils/stockCalculations.ts';

interface RemainingStockSectionProps {
  remainingStock: StockData;
  setRemainingStock: React.Dispatch<React.SetStateAction<StockData>>;
  stock: StockData;
  sales: SaleItem[];
  onResetToCalculated: () => void;
  conversion?: ChickenConversionConfig;
  stockItems?: StockMasterItem[];
  endingStockItems?: EndingStockMasterItem[];
}

export const RemainingStockSection: React.FC<RemainingStockSectionProps> = ({
  remainingStock,
  setRemainingStock,
  stock,
  sales,
  onResetToCalculated,
  conversion,
  stockItems,
  endingStockItems,
}) => {
  const handleRemainingStockChange = (key: string, value: string) => {
    setRemainingStock((prev) => ({ ...prev, [key]: value }));
  };

  const standardRawKeys = ['ayam_mentah', 'masak_ayam_pb', 'masak_ayam_pk', 'kulit_mentah', 'masak_kulit_ck', 'beras', 'masak_nasi', 'goreng_ayam'];
  const customRawItems = (stockItems || []).filter((s) => s.active !== false && s.category === 'raw' && !standardRawKeys.includes(s.key));

  const standardSellKeys = ['goreng_ayam_pb', 'goreng_ayam_pk', 'goreng_kulit', 'goreng_kulit_ck', 'nasi', 's_chili_oil', 's_geprek'];
  const customReadyItems = (stockItems || []).filter((s) => s.active !== false && s.category === 'ready' && !standardSellKeys.includes(s.key));

  // Calculation status for ready-to-sell products
  const calcDetails = calculateAllRemainingStock(stock, sales);

  // Calculation status for raw materials (ayam mentah & beras)
  const rawCalcDetails = calculateRawMaterialsRemaining(stock, conversion);

  const pbWeight = conversion?.pb_kg_weight ?? 0.5;
  const pkWeight = conversion?.pk_kg_weight ?? 0.5;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Section 3 */}
      <div className="px-4 py-3 bg-red-50/60 border-b border-red-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E4002B]/10 text-[#E4002B]">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">
              SECTION 3
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              📦 ENDING STOCK
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetToCalculated}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E4002B] bg-white hover:bg-red-50 border border-red-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            title="Reset nilai ke hitungan otomatis (Bahan Baku & Produk Terjual)"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden xs:inline">Hitung Ulang</span>
          </button>
          <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            Tutup Hari
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Box Flow Otomatis */}
        <div className="bg-red-50/50 border border-red-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-900">
          <Sparkles className="w-4 h-4 text-[#E4002B] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Otomatis Ter-generate:</span> Sisa stok bahan baku dihitung dari{' '}
            <span className="font-semibold underline">Ayam Mentah − Goreng Ayam (PB @{pbWeight}kg & PK @{pkWeight}kg)</span> &{' '}
            <span className="font-semibold underline">Beras − Masak Nasi</span>, dan produk siap jual dari{' '}
            <span className="font-semibold underline">Stok Awal − Penjualan Offline</span>. Nilai tetap dapat disesuaikan jika terdapat selisih fisik saat tutup toko.
          </div>
        </div>

        {/* Group 1: Bahan Baku (Dapur) - Ayam Mentah & Beras (Kulit Mentah Dihapus) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Bahan Baku Dapur (Otomatis)
              </span>
              <span className="text-[10px] font-semibold text-red-800 bg-red-100/70 px-1.5 py-0.5 rounded">
                Stok Awal − Terpakai
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Formula Dapur
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card Ayam Mentah */}
            {(() => {
              const ayamCalc = rawCalcDetails.ayam_mentah;
              const val = remainingStock.ayam_mentah || '';
              const currentNum = parseStockQuantity(val);
              const isManualOverride =
                ayamCalc.isCalculated && currentNum !== null && currentNum !== ayamCalc.remainingQty;
              const ketVal = remainingStock.ayam_mentah_keterangan !== undefined
                ? remainingStock.ayam_mentah_keterangan
                : (ayamCalc.remainingDescription || '');

              return (
                <div className="bg-red-50/30 p-3 rounded-xl border border-red-200/70 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="rem-input-ayam_mentah"
                        className="text-xs font-bold text-slate-800 flex items-center gap-1"
                      >
                        <Flame className="w-3.5 h-3.5 text-[#E4002B]" />
                        Sisa Ayam Mentah
                      </label>
                      <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                        kg
                      </span>
                    </div>

                    <input
                      id="rem-input-ayam_mentah"
                      type="text"
                      inputMode="decimal"
                      value={val}
                      onChange={(e) => handleRemainingStockChange('ayam_mentah', e.target.value)}
                      placeholder="0"
                      className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-sm font-semibold placeholder-slate-300 focus:outline-hidden focus:ring-2 transition-all ${
                        isManualOverride
                          ? 'border-red-400 text-red-900 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                          : 'border-slate-200 text-slate-800 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                      }`}
                    />

                    {/* Keterangan Bagian PB / PK */}
                    <div className="mt-2 bg-white/90 border border-red-200 rounded-lg p-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="rem-input-ayam_mentah_keterangan"
                          className="text-[10px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1"
                        >
                          🍗 Keterangan Sisa (PB/PK)
                        </label>
                        {ketVal && (
                          <span className="text-[9.5px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                            {ketVal}
                          </span>
                        )}
                      </div>
                      <input
                        id="rem-input-ayam_mentah_keterangan"
                        type="text"
                        value={ketVal}
                        onChange={(e) => handleRemainingStockChange('ayam_mentah_keterangan', e.target.value)}
                        placeholder="cth: 1 kg 0.5 Ayam PK"
                        className="w-full bg-red-50/40 border border-red-200 rounded-md px-2 py-1 text-xs font-semibold text-red-950 placeholder-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                      />
                    </div>
                  </div>

                  {/* Formula Breakdown Badge */}
                  <div className="mt-2 pt-2 border-t border-red-100 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                    {ayamCalc.isCalculated ? (
                      <span className="text-slate-600 font-medium">
                        {ayamCalc.initialStock} kg (Stok) − {ayamCalc.usedStock} kg ({ayamCalc.usedLabel}) ={' '}
                        <strong className="text-slate-900 font-black">
                          {ayamCalc.remainingQty} kg{' '}
                          {ayamCalc.remainingDescription && ayamCalc.remainingDescription !== `${ayamCalc.remainingQty} kg`
                            ? `(${ayamCalc.remainingDescription})`
                            : ''}
                        </strong>
                      </span>
                    ) : (
                      <span className="text-slate-400">Stok awal belum diisi</span>
                    )}

                    {isManualOverride ? (
                      <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                        Disesuaikan
                      </span>
                    ) : ayamCalc.isCalculated ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                        Otomatis
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })()}

            {/* Card Beras */}
            {(() => {
              const berasCalc = rawCalcDetails.beras;
              const val = remainingStock.beras || '';
              const currentNum = parseStockQuantity(val);
              const isManualOverride =
                berasCalc.isCalculated && currentNum !== null && currentNum !== berasCalc.remainingQty;

              return (
                <div className="bg-red-50/30 p-3 rounded-xl border border-red-200/70 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="rem-input-beras"
                        className="text-xs font-bold text-slate-800 flex items-center gap-1"
                      >
                        <Flame className="w-3.5 h-3.5 text-[#E4002B]" />
                        Sisa Beras
                      </label>
                      <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                        kg
                      </span>
                    </div>

                    <input
                      id="rem-input-beras"
                      type="text"
                      inputMode="decimal"
                      value={val}
                      onChange={(e) => handleRemainingStockChange('beras', e.target.value)}
                      placeholder="0"
                      className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-sm font-semibold placeholder-slate-300 focus:outline-hidden focus:ring-2 transition-all ${
                        isManualOverride
                          ? 'border-red-400 text-red-900 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                          : 'border-slate-200 text-slate-800 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                      }`}
                    />
                  </div>

                  {/* Formula Breakdown Badge */}
                  <div className="mt-2 pt-2 border-t border-red-100 flex items-center justify-between text-[10px]">
                    {berasCalc.isCalculated ? (
                      <span className="text-slate-600 font-medium">
                        {berasCalc.initialStock} kg (Beras) − {berasCalc.usedStock} kg (Masak) ={' '}
                        <strong className="text-slate-900 font-black">{berasCalc.remainingQty} kg</strong>
                      </span>
                    ) : (
                      <span className="text-slate-400">Stok awal belum diisi</span>
                    )}

                    {isManualOverride ? (
                      <span className="text-red-700 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                        Disesuaikan
                      </span>
                    ) : berasCalc.isCalculated ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                        Otomatis
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })()}

            {/* Custom Raw Items from Kelola Data */}
            {customRawItems.map((item) => {
              const val = remainingStock[item.key] || '';
              return (
                <div
                  key={`rem-raw-${item.key}`}
                  className="bg-red-50/30 p-3 rounded-xl border border-red-200/70 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor={`rem-input-${item.key}`}
                        className="text-xs font-bold text-slate-800 truncate mr-1"
                        title={item.name}
                      >
                        Sisa {item.name}
                      </label>
                      <span className="text-[10px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                        {item.unit}
                      </span>
                    </div>
                    <input
                      id={`rem-input-${item.key}`}
                      type="text"
                      inputMode="decimal"
                      value={val}
                      onChange={(e) => handleRemainingStockChange(item.key, e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-sm font-semibold placeholder-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all"
                    />
                  </div>
                  <div className="mt-2 pt-2 border-t border-red-100 text-[10px] text-slate-500">
                    Bahan Baku Tambahan
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Group 2: Produk Jadi (Otomatis dari Stok - Penjualan) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Produk Siap Jual (Otomatis)
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Formula: Stok Awal − Terjual
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {PRODUCT_STOCK_MAPPINGS.map((mapping) => {
              const calc = calcDetails[mapping.stockKey];
              const isAutoCalculated = calc && calc.isCalculated;
              const val = remainingStock[mapping.stockKey] || '';
              const currentNum = parseStockQuantity(val);
              const isManualOverride =
                isAutoCalculated && currentNum !== null && currentNum !== calc.remainingQty;

              return (
                <div
                  key={`rem-sell-${mapping.stockKey}`}
                  className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`rem-input-${mapping.stockKey}`}
                      className="text-xs font-bold text-slate-700"
                    >
                      {mapping.label}
                    </label>
                    <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {mapping.unit}
                    </span>
                  </div>

                  <input
                    id={`rem-input-${mapping.stockKey}`}
                    type="text"
                    inputMode="numeric"
                    value={val}
                    onChange={(e) => handleRemainingStockChange(mapping.stockKey, e.target.value)}
                    placeholder="0"
                    className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-sm font-semibold placeholder-slate-300 focus:outline-hidden focus:ring-2 transition-all ${
                      isManualOverride
                        ? 'border-red-400 text-red-900 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                        : 'border-slate-200 text-slate-800 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                    }`}
                  />

                  {/* Formula Breakdown Badge */}
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    {isAutoCalculated ? (
                      <span className="text-slate-600 font-medium">
                        {calc.stockNum} − {calc.soldQty} ={' '}
                        <strong className="text-slate-900 font-black">{calc.remainingQty} {mapping.unit}</strong>
                      </span>
                    ) : (
                      <span className="text-slate-400">Stok belum diisi</span>
                    )}

                    {isManualOverride ? (
                      <span className="text-red-700 font-bold bg-red-100/70 px-1 py-0.5 rounded">
                        Disesuaikan
                      </span>
                    ) : isAutoCalculated ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100/70 px-1 py-0.5 rounded">
                        Otomatis
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {/* Custom Ready Items from Kelola Data */}
            {customReadyItems.map((item) => {
              const matchingSale = sales.find(
                (s) => s.product_name.toLowerCase() === item.name.toLowerCase() || (item.barang_id && (s as any).barang_id === item.barang_id)
              );
              const soldQty = matchingSale ? Number(matchingSale.quantity) || 0 : 0;
              const stockVal = stock[item.key];
              const stockNum = parseStockQuantity(stockVal);
              const calcRem = stockNum !== null ? Math.max(0, stockNum - soldQty) : null;
              const val = remainingStock[item.key] !== undefined && remainingStock[item.key] !== ''
                ? remainingStock[item.key]
                : (calcRem !== null ? calcRem.toString() : '');
              const currentNum = parseStockQuantity(val);
              const isManualOverride = calcRem !== null && currentNum !== null && currentNum !== calcRem;

              return (
                <div
                  key={`rem-custom-sell-${item.key}`}
                  className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor={`rem-input-${item.key}`}
                        className="text-xs font-bold text-slate-700 truncate mr-1"
                        title={item.name}
                      >
                        {item.name}
                      </label>
                      <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                        {item.unit}
                      </span>
                    </div>

                    <input
                      id={`rem-input-${item.key}`}
                      type="text"
                      inputMode="numeric"
                      value={val}
                      onChange={(e) => handleRemainingStockChange(item.key, e.target.value)}
                      placeholder="0"
                      className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-sm font-semibold placeholder-slate-300 focus:outline-hidden focus:ring-2 transition-all ${
                        isManualOverride
                          ? 'border-red-400 text-red-900 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                          : 'border-slate-200 text-slate-800 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                      }`}
                    />
                  </div>

                  {/* Formula Breakdown Badge */}
                  <div className="mt-1.5 flex items-center justify-between text-[10px]">
                    {stockNum !== null ? (
                      <span className="text-slate-600 font-medium">
                        {stockNum} − {soldQty} ={' '}
                        <strong className="text-slate-900 font-black">{calcRem} {item.unit}</strong>
                      </span>
                    ) : (
                      <span className="text-slate-400">Stok belum diisi</span>
                    )}

                    {isManualOverride ? (
                      <span className="text-red-700 font-bold bg-red-100/70 px-1 py-0.5 rounded">
                        Disesuaikan
                      </span>
                    ) : stockNum !== null ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100/70 px-1 py-0.5 rounded">
                        Otomatis
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
