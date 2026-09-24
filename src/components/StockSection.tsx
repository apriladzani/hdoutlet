import React from 'react';
import {
  Package,
  Sparkles,
  Flame,
  Plus,
  Minus,
  ChefHat,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
} from 'lucide-react';
import { ChickenConversionConfig, StockData, StockMasterItem, TosserData, TosserMasterItem } from '../types.ts';
import {
  parseStockQuantity,
  calculateChickenBatch,
  calculateRiceBatch,
  calculateChickenTotalCookKg,
  calculateChickenRemainingDetail,
  AYAM_PB_KG_WEIGHT,
  AYAM_PK_KG_WEIGHT,
  GORENG_AYAM_PB_RATIO,
  GORENG_AYAM_PK_RATIO,
  MASAK_NASI_RATIO,
  TOSSER_PRODUCTS,
  EMPTY_TOSSER_DATA,
} from '../utils/stockCalculations.ts';

interface StockSectionProps {
  stock: StockData;
  setStock: React.Dispatch<React.SetStateAction<StockData>>;
  conversion?: ChickenConversionConfig;
  stockItems?: StockMasterItem[];
  tosserItems?: TosserMasterItem[];
}

interface SellableProductConfig {
  key: string;
  tosserKey: string;
  label: string;
  placeholder: string;
  unit: string;
  offlineProductName: string;
}

const SELLABLE_PRODUCTS: SellableProductConfig[] = [
  { key: 'goreng_ayam_pb', tosserKey: 'goreng_ayam_pb', label: 'Goreng Ayam PB', placeholder: '0', unit: 'pcs', offlineProductName: 'Ayam PB' },
  { key: 'goreng_ayam_pk', tosserKey: 'goreng_ayam_pk', label: 'Goreng Ayam PK', placeholder: '0', unit: 'pcs', offlineProductName: 'Ayam PK' },
  { key: 'goreng_kulit', tosserKey: 'goreng_kulit', label: 'Goreng Kulit', placeholder: '0', unit: 'pcs', offlineProductName: 'Kulit' },
  { key: 'goreng_kulit_ck', tosserKey: 'goreng_kulit_ck', label: 'Goreng Kulit CK', placeholder: '0', unit: 'pcs', offlineProductName: 'Kulit CK' },
  { key: 'nasi', tosserKey: 'nasi', label: 'Nasi', placeholder: '0', unit: 'pcs', offlineProductName: 'Nasi' },
  { key: 's_chili_oil', tosserKey: 's_chili_oil', label: 'S. Chili Oil', placeholder: '0', unit: 'pcs', offlineProductName: 'Chili Oil' },
  { key: 's_geprek', tosserKey: 's_geprek', label: 'S. Geprek', placeholder: '0', unit: 'pcs', offlineProductName: 'Geprek' },
];

export const StockSection: React.FC<StockSectionProps> = ({
  stock,
  setStock,
  conversion,
  stockItems,
  tosserItems,
}) => {
  const pbRatio = conversion?.pb_ratio ?? GORENG_AYAM_PB_RATIO;
  const pkRatio = conversion?.pk_ratio ?? GORENG_AYAM_PK_RATIO;
  const pbWeight = conversion?.pb_kg_weight ?? AYAM_PB_KG_WEIGHT;
  const pkWeight = conversion?.pk_kg_weight ?? AYAM_PK_KG_WEIGHT;
  const riceRatio = conversion?.masak_nasi_ratio ?? MASAK_NASI_RATIO;

  const STANDARD_RAW_KEYS = ['ayam_mentah', 'masak_ayam_pb', 'masak_ayam_pk', 'kulit_mentah', 'masak_kulit_ck', 'beras', 'masak_nasi', 'goreng_ayam'];
  const customRawItems = (stockItems || []).filter((s) => s.active !== false && s.category === 'raw' && !STANDARD_RAW_KEYS.includes(s.key));

  const activeTosserInList = (tosserItems && tosserItems.length > 0)
    ? tosserItems.filter((t) => t.active !== false && (t.type === 'in' || t.type === 'both'))
    : TOSSER_PRODUCTS.map((p) => ({
        id: 0,
        key: p.key as string,
        name: p.label,
        unit: p.unit,
        type: 'in' as const,
        active: true,
      }));

  const activeTosserOutList = (tosserItems && tosserItems.length > 0)
    ? tosserItems.filter((t) => t.active !== false && (t.type === 'out' || t.type === 'both'))
    : TOSSER_PRODUCTS.map((p) => ({
        id: 0,
        key: p.key as string,
        name: p.label,
        unit: p.unit,
        type: 'out' as const,
        active: true,
      }));

  const activeReadyList = (stockItems && stockItems.length > 0)
    ? stockItems.filter((s) => s.active !== false && s.category === 'ready')
    : SELLABLE_PRODUCTS.map((p) => ({
        id: 0,
        key: p.key as string,
        name: p.label,
        category: 'ready' as const,
        unit: p.unit,
        active: true,
      }));

  const handleStockChange = (key: string, value: string) => {
    setStock((prev) => ({ ...prev, [key]: value }));
  };

  // Tosser In Handler
  const handleTosserInChange = (key: string, value: string) => {
    setStock((prev) => ({
      ...prev,
      tosser_in: {
        ...(prev.tosser_in || EMPTY_TOSSER_DATA),
        [key]: value,
      },
    }));
  };

  const handleStepTosserIn = (key: string, delta: number) => {
    const current = parseStockQuantity(stock.tosser_in?.[key]) || 0;
    const nextVal = Math.max(0, current + delta);
    handleTosserInChange(key, nextVal > 0 ? nextVal.toString() : '');
  };

  // Tosser Out Handler
  const handleTosserOutChange = (key: string, value: string) => {
    setStock((prev) => ({
      ...prev,
      tosser_out: {
        ...(prev.tosser_out || EMPTY_TOSSER_DATA),
        [key]: value,
      },
    }));
  };

  const handleStepTosserOut = (key: string, delta: number) => {
    const current = parseStockQuantity(stock.tosser_out?.[key]) || 0;
    const nextVal = Math.max(0, current + delta);
    handleTosserOutChange(key, nextVal > 0 ? nextVal.toString() : '');
  };

  // Handlers for Goreng Ayam PB and PK:
  // 1 Goreng Ayam PB -> auto input PB = count * pbRatio
  // 1 Goreng Ayam PK -> auto input PK = count * pkRatio
  const handleGorengAyamPbChange = (value: string) => {
    const count = parseStockQuantity(value);
    setStock((prev) => {
      const nextStock = { ...prev, masak_ayam_pb: value };
      const pbPcs = count !== null && count > 0 ? count * pbRatio : 0;
      const tosserInPb = parseStockQuantity(prev.tosser_in?.goreng_ayam_pb) || 0;
      const tosserOutPb = parseStockQuantity(prev.tosser_out?.goreng_ayam_pb) || 0;
      const netPb = pbPcs + tosserInPb - tosserOutPb;
      nextStock.goreng_ayam_pb = netPb > 0 ? netPb.toString() : '';
      return nextStock;
    });
  };

  const handleStepGorengAyamPb = (delta: number) => {
    const current = parseStockQuantity(stock.masak_ayam_pb) || 0;
    const nextVal = Math.max(0, current + delta);
    handleGorengAyamPbChange(nextVal > 0 ? nextVal.toString() : '');
  };

  const handleGorengAyamPkChange = (value: string) => {
    const count = parseStockQuantity(value);
    setStock((prev) => {
      const nextStock = { ...prev, masak_ayam_pk: value };
      const pkPcs = count !== null && count > 0 ? count * pkRatio : 0;
      const tosserInPk = parseStockQuantity(prev.tosser_in?.goreng_ayam_pk) || 0;
      const tosserOutPk = parseStockQuantity(prev.tosser_out?.goreng_ayam_pk) || 0;
      const netPk = pkPcs + tosserInPk - tosserOutPk;
      nextStock.goreng_ayam_pk = netPk > 0 ? netPk.toString() : '';
      return nextStock;
    });
  };

  const handleStepGorengAyamPk = (delta: number) => {
    const current = parseStockQuantity(stock.masak_ayam_pk) || 0;
    const nextVal = Math.max(0, current + delta);
    handleGorengAyamPkChange(nextVal > 0 ? nextVal.toString() : '');
  };

  // Handler for Masak Nasi:
  // Masak Nasi -> auto input nasi = kg * riceRatio
  const handleMasakNasiChange = (value: string) => {
    const kg = parseStockQuantity(value);
    setStock((prev) => {
      const nextStock = { ...prev, masak_nasi: value };
      const tosserInNasi = parseStockQuantity(prev.tosser_in?.nasi) || 0;
      const tosserOutNasi = parseStockQuantity(prev.tosser_out?.nasi) || 0;

      if (kg !== null && kg > 0) {
        const porsi = calculateRiceBatch(kg, conversion);
        nextStock.nasi = Math.max(0, porsi + tosserInNasi - tosserOutNasi).toString();
      } else if (value.trim() === '' || kg === 0) {
        const netNasi = tosserInNasi - tosserOutNasi;
        nextStock.nasi = netNasi > 0 ? netNasi.toString() : '';
      }
      return nextStock;
    });
  };

  const handleStepMasakNasi = (delta: number) => {
    const current = parseStockQuantity(stock.masak_nasi) || 0;
    const nextVal = Math.max(0, Math.round((current + delta) * 10) / 10);
    handleMasakNasiChange(nextVal > 0 ? nextVal.toString() : '');
  };

  // Handler for Masak Kulit CK:
  // Masak Kulit CK (pcs) -> auto input goreng_kulit_ck = pcs + tosser_in - tosser_out
  const handleMasakKulitCkChange = (value: string) => {
    const pcs = parseStockQuantity(value);
    setStock((prev) => {
      const nextStock = { ...prev, masak_kulit_ck: value };
      const tosserInKulitCk = parseStockQuantity(prev.tosser_in?.goreng_kulit_ck) || 0;
      const tosserOutKulitCk = parseStockQuantity(prev.tosser_out?.goreng_kulit_ck) || 0;

      if (pcs !== null && pcs > 0) {
        nextStock.goreng_kulit_ck = Math.max(0, pcs + tosserInKulitCk - tosserOutKulitCk).toString();
      } else if (value.trim() === '' || pcs === 0) {
        const net = tosserInKulitCk - tosserOutKulitCk;
        nextStock.goreng_kulit_ck = net > 0 ? net.toString() : '';
      }
      return nextStock;
    });
  };

  const handleStepMasakKulitCk = (delta: number) => {
    const current = parseStockQuantity(stock.masak_kulit_ck) || 0;
    const nextVal = Math.max(0, current + delta);
    handleMasakKulitCkChange(nextVal > 0 ? nextVal.toString() : '');
  };

  // Helper to sync all ready-to-sell stock based on (Dapur + Tosser In - Tosser Out)
  const handleSyncAllFromDapurAndTosser = () => {
    setStock((prev) => {
      const nextStock = { ...prev };
      const pbCookCount = parseStockQuantity(prev.masak_ayam_pb);
      const pkCookCount = parseStockQuantity(prev.masak_ayam_pk);
      const legacyGoreng = parseStockQuantity(prev.goreng_ayam) || 0;
      const masakKg = parseStockQuantity(prev.masak_nasi) || 0;
      const kulitCkCook = parseStockQuantity(prev.masak_kulit_ck) || 0;

      const pbFromDapur = (pbCookCount !== null || pkCookCount !== null)
        ? (pbCookCount || 0) * pbRatio
        : legacyGoreng * pbRatio;
      const pkFromDapur = (pbCookCount !== null || pkCookCount !== null)
        ? (pkCookCount || 0) * pkRatio
        : legacyGoreng * pkRatio;

      const riceBatch = calculateRiceBatch(masakKg, conversion);

      const inData = prev.tosser_in || EMPTY_TOSSER_DATA;
      const outData = prev.tosser_out || EMPTY_TOSSER_DATA;

      const calcPb = pbFromDapur + (parseStockQuantity(inData.goreng_ayam_pb) || 0) - (parseStockQuantity(outData.goreng_ayam_pb) || 0);
      const calcPk = pkFromDapur + (parseStockQuantity(inData.goreng_ayam_pk) || 0) - (parseStockQuantity(outData.goreng_ayam_pk) || 0);
      const calcKulit = (parseStockQuantity(inData.goreng_kulit) || 0) - (parseStockQuantity(outData.goreng_kulit) || 0);
      const calcKulitCk = kulitCkCook + (parseStockQuantity(inData.goreng_kulit_ck) || 0) - (parseStockQuantity(outData.goreng_kulit_ck) || 0);
      const calcNasi = riceBatch + (parseStockQuantity(inData.nasi) || 0) - (parseStockQuantity(outData.nasi) || 0);
      const calcChili = (parseStockQuantity(inData.s_chili_oil) || 0) - (parseStockQuantity(outData.s_chili_oil) || 0);
      const calcGeprek = (parseStockQuantity(inData.s_geprek) || 0) - (parseStockQuantity(outData.s_geprek) || 0);

      nextStock.goreng_ayam_pb = calcPb > 0 ? calcPb.toString() : '';
      nextStock.goreng_ayam_pk = calcPk > 0 ? calcPk.toString() : '';
      if (calcKulit > 0 || (inData.goreng_kulit || outData.goreng_kulit)) {
        nextStock.goreng_kulit = calcKulit > 0 ? calcKulit.toString() : '';
      }
      if (calcKulitCk > 0 || (inData.goreng_kulit_ck || outData.goreng_kulit_ck) || kulitCkCook > 0) {
        nextStock.goreng_kulit_ck = calcKulitCk > 0 ? calcKulitCk.toString() : '';
      }
      nextStock.nasi = calcNasi > 0 ? calcNasi.toString() : '';
      if (calcChili > 0 || (inData.s_chili_oil || outData.s_chili_oil)) {
        nextStock.s_chili_oil = calcChili > 0 ? calcChili.toString() : '';
      }
      if (calcGeprek > 0 || (inData.s_geprek || outData.s_geprek)) {
        nextStock.s_geprek = calcGeprek > 0 ? calcGeprek.toString() : '';
      }

      // Sync custom ready items with Tosser In - Tosser Out if present
      const standardKeys = ['goreng_ayam_pb', 'goreng_ayam_pk', 'goreng_kulit', 'goreng_kulit_ck', 'nasi', 's_chili_oil', 's_geprek'];
      for (const p of activeReadyList) {
        if (!standardKeys.includes(p.key)) {
          const inVal = parseStockQuantity(inData[p.key]) || 0;
          const outVal = parseStockQuantity(outData[p.key]) || 0;
          if (inVal > 0 || outVal > 0) {
            const net = inVal - outVal;
            nextStock[p.key] = net > 0 ? net.toString() : '';
          }
        }
      }

      return nextStock;
    });
  };

  const pbCookCount = parseStockQuantity(stock.masak_ayam_pb) || 0;
  const pkCookCount = parseStockQuantity(stock.masak_ayam_pk) || 0;
  const totalAyamCookKg = calculateChickenTotalCookKg(pbCookCount, pkCookCount, conversion);
  const rawAyamInitial = parseStockQuantity(stock.ayam_mentah);
  const chickenDetail = calculateChickenRemainingDetail(rawAyamInitial, pbCookCount, pkCookCount, conversion);
  const legacyGorengCount = parseStockQuantity(stock.goreng_ayam) || 0;
  const masakNasiKg = parseStockQuantity(stock.masak_nasi) || 0;
  const masakKulitCkPcs = parseStockQuantity(stock.masak_kulit_ck) || 0;

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header Section 1 */}
      <div className="px-4 py-3 bg-red-50/60 border-b border-red-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E4002B]/10 text-[#E4002B]">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">
              SECTION 1
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              📦 BEGINNING STOCK
            </h2>
          </div>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
          Awal Hari
        </span>
      </div>

      <div className="p-4 space-y-5">
        {/* SUB-SECTION A: BAHAN BAKU & OLAHAN DAPUR */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-[#E4002B]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Bahan Baku & Olahan Dapur
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Input masak otomatis mengisi produk jadi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Card 1: Ayam Mentah & Goreng Ayam */}
            <div className="bg-red-50/30 p-3 rounded-xl border border-red-200/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="stock-input-ayam_mentah"
                    className="text-xs font-bold text-slate-800"
                  >
                    Ayam Mentah
                  </label>
                  <span className="text-[10px] font-semibold text-red-800 bg-red-100/70 px-1.5 py-0.5 rounded">
                    kg
                  </span>
                </div>
                <input
                  id="stock-input-ayam_mentah"
                  type="text"
                  inputMode="decimal"
                  value={stock.ayam_mentah || ''}
                  onChange={(e) => handleStockChange('ayam_mentah', e.target.value)}
                  placeholder="cth: 15"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all"
                />
              </div>

              {/* Tambahan Dibawah Card Ayam Mentah: Split Goreng Ayam PB & Goreng Ayam PK */}
              <div className="mt-3 pt-2.5 border-t border-dashed border-red-200/80 bg-red-50/70 -mx-3 -mb-3 p-3 rounded-b-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-red-950 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#E4002B]" />
                    Olahan Dapur (Goreng Ayam)
                  </span>
                  <span className="text-[10px] font-bold text-red-800 bg-red-100/80 px-1.5 py-0.5 rounded">
                    {pbRatio} PB = {pbWeight} kg • {pkRatio} PK = {pkWeight} kg
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Olahan 1: Goreng Ayam PB */}
                  <div className="bg-white p-2.5 rounded-lg border border-red-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="stock-input-masak_ayam_pb"
                        className="text-[11px] font-bold text-slate-800"
                      >
                        Goreng Ayam PB
                      </label>
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                        kg
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStepGorengAyamPb(-1)}
                        className="w-7 h-7 rounded-md bg-white border border-red-300 text-red-800 font-bold flex items-center justify-center hover:bg-red-50 active:scale-95 transition-all cursor-pointer shrink-0"
                        title="Kurangi 1 Goreng Ayam PB"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        id="stock-input-masak_ayam_pb"
                        type="text"
                        inputMode="numeric"
                        value={stock.masak_ayam_pb || ''}
                        onChange={(e) => handleGorengAyamPbChange(e.target.value)}
                        placeholder="0"
                        className="w-full text-center bg-white border border-red-300 rounded-md px-1.5 py-1 text-xs font-bold text-red-950 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/30 focus:border-[#E4002B]"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepGorengAyamPb(1)}
                        className="w-7 h-7 rounded-md bg-[#E4002B] text-white font-bold flex items-center justify-center hover:bg-[#c40024] active:scale-95 transition-all cursor-pointer shrink-0"
                        title="Tambah 1 Goreng Ayam PB"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[9.5px]">
                      <span className="text-slate-400">1 = {pbWeight} kg ({pbRatio} PB)</span>
                      {pbCookCount > 0 && (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200/60">
                          +{pbCookCount * pbRatio} pcs ({Math.round(pbCookCount * pbWeight * 100) / 100} kg)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Olahan 2: Goreng Ayam PK */}
                  <div className="bg-white p-2.5 rounded-lg border border-red-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="stock-input-masak_ayam_pk"
                        className="text-[11px] font-bold text-slate-800"
                      >
                        Goreng Ayam PK
                      </label>
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                        kg
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStepGorengAyamPk(-1)}
                        className="w-7 h-7 rounded-md bg-white border border-red-300 text-red-800 font-bold flex items-center justify-center hover:bg-red-50 active:scale-95 transition-all cursor-pointer shrink-0"
                        title="Kurangi 1 Goreng Ayam PK"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        id="stock-input-masak_ayam_pk"
                        type="text"
                        inputMode="numeric"
                        value={stock.masak_ayam_pk || ''}
                        onChange={(e) => handleGorengAyamPkChange(e.target.value)}
                        placeholder="0"
                        className="w-full text-center bg-white border border-red-300 rounded-md px-1.5 py-1 text-xs font-bold text-red-950 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/30 focus:border-[#E4002B]"
                      />
                      <button
                        type="button"
                        onClick={() => handleStepGorengAyamPk(1)}
                        className="w-7 h-7 rounded-md bg-[#E4002B] text-white font-bold flex items-center justify-center hover:bg-[#c40024] active:scale-95 transition-all cursor-pointer shrink-0"
                        title="Tambah 1 Goreng Ayam PK"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[9.5px]">
                      <span className="text-slate-400">1 = {pkWeight} kg ({pkRatio} PK)</span>
                      {pkCookCount > 0 && (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200/60">
                          +{pkCookCount * pkRatio} pcs ({Math.round(pkCookCount * pkWeight * 100) / 100} kg)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ringkasan Akumulasi Olahan Ayam */}
                <div className="pt-1.5 border-t border-red-200/60 flex flex-wrap items-center justify-between gap-1 text-[10px] text-red-900 font-medium">
                  <span>
                    Ayam dimasak: <strong className="font-bold text-red-950">{totalAyamCookKg} kg</strong>
                  </span>
                  {rawAyamInitial !== null && (
                    <span>
                      Sisa mentah:{' '}
                      <strong className="font-bold text-slate-900">
                        {chickenDetail.totalRemainingKg} kg
                        {chickenDetail.description && chickenDetail.description !== `${chickenDetail.totalRemainingKg} kg`
                          ? ` (${chickenDetail.description})`
                          : ''}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Beras & Masak Nasi */}
            <div className="bg-red-50/30 p-3 rounded-xl border border-red-200/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="stock-input-beras"
                    className="text-xs font-bold text-slate-800"
                  >
                    Beras
                  </label>
                  <span className="text-[10px] font-semibold text-red-800 bg-red-100/70 px-1.5 py-0.5 rounded">
                    kg
                  </span>
                </div>
                <input
                  id="stock-input-beras"
                  type="text"
                  inputMode="decimal"
                  value={stock.beras || ''}
                  onChange={(e) => handleStockChange('beras', e.target.value)}
                  placeholder="cth: 10"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all"
                />
              </div>

              {/* Tambahan Dibawah Card Beras: Masak Nasi */}
              <div className="mt-3 pt-2.5 border-t border-dashed border-red-200/80 bg-red-50/70 -mx-3 -mb-3 p-3 rounded-b-xl">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="stock-input-masak_nasi"
                    className="text-xs font-black text-red-950 flex items-center gap-1"
                  >
                    <Flame className="w-3.5 h-3.5 text-[#E4002B]" />
                    Nyangu
                  </label>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    kg
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStepMasakNasi(-0.5)}
                    className="w-8 h-8 rounded-lg bg-white border border-red-300 text-red-800 font-bold flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all cursor-pointer shrink-0"
                    title="Kurangi 0.5 kg nyangu"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    id="stock-input-masak_nasi"
                    type="text"
                    inputMode="decimal"
                    value={stock.masak_nasi || ''}
                    onChange={(e) => handleMasakNasiChange(e.target.value)}
                    placeholder="0.5"
                    className="w-full text-center bg-white border border-red-300 rounded-lg px-2 py-1 text-sm font-bold text-red-950 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/30 focus:border-[#E4002B]"
                  />
                  <button
                    type="button"
                    onClick={() => handleStepMasakNasi(0.5)}
                    className="w-8 h-8 rounded-lg bg-[#E4002B] text-white font-bold flex items-center justify-center hover:bg-[#c40024] active:scale-95 transition-all cursor-pointer shrink-0"
                    title="Tambah 0.5 kg nyangu"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Presets for Nyangu (e.g. 0.5 kg, 1 kg, 1.5 kg, 2 kg) */}
                <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[9px] font-bold text-red-800/80">Pilih Cepat:</span>
                  <div className="flex items-center gap-1">
                    {[0.5, 1, 1.5, 2].map((presetKg) => {
                      const isSelected = parseStockQuantity(stock.masak_nasi) === presetKg;
                      return (
                        <button
                          key={presetKg}
                          type="button"
                          onClick={() => handleMasakNasiChange(presetKg.toString())}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${isSelected
                              ? 'bg-[#E4002B] text-white shadow-xs'
                              : 'bg-white text-red-900 border border-red-200/80 hover:bg-red-100'
                            }`}
                          title={`Set nyangu ${presetKg} kg (${presetKg * 12} pcs)`}
                        >
                          {presetKg} kg
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-1.5 text-[10px] font-medium text-red-800 flex items-center justify-between">
                  <span>0.5 kg = 6 pcs | 1 kg = 12 pcs</span>
                  {masakNasiKg > 0 && (
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      +{Math.round(masakNasiKg * MASAK_NASI_RATIO)} Pcs Nasi
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 3: Kulit Mentah & Masak Kulit CK */}
            <div className="bg-red-50/30 p-3 rounded-xl border border-red-200/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="stock-input-kulit_mentah"
                    className="text-xs font-bold text-slate-800"
                  >
                    Kulit Mentah
                  </label>
                  <span className="text-[10px] font-semibold text-red-800 bg-red-100/70 px-1.5 py-0.5 rounded">
                    kg
                  </span>
                </div>
                <input
                  id="stock-input-kulit_mentah"
                  type="text"
                  inputMode="decimal"
                  value={stock.kulit_mentah || ''}
                  onChange={(e) => handleStockChange('kulit_mentah', e.target.value)}
                  placeholder="cth: 2"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all"
                />
              </div>

              {/* Tambahan Dibawah Card Kulit: Masak Kulit CK */}
              <div className="mt-3 pt-2.5 border-t border-dashed border-red-200/80 bg-red-50/70 -mx-3 -mb-3 p-3 rounded-b-xl">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="stock-input-masak_kulit_ck"
                    className="text-xs font-black text-red-950 flex items-center gap-1"
                  >
                    <Flame className="w-3.5 h-3.5 text-[#E4002B]" />
                    Masak Kulit CK
                  </label>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                    pcs
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStepMasakKulitCk(-1)}
                    className="w-8 h-8 rounded-lg bg-white border border-red-300 text-red-800 font-bold flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all cursor-pointer shrink-0"
                    title="Kurangi 1 pcs Kulit CK"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    id="stock-input-masak_kulit_ck"
                    type="text"
                    inputMode="numeric"
                    value={stock.masak_kulit_ck || ''}
                    onChange={(e) => handleMasakKulitCkChange(e.target.value)}
                    placeholder="0"
                    className="w-full text-center bg-white border border-red-300 rounded-lg px-2 py-1 text-sm font-bold text-red-950 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/30 focus:border-[#E4002B]"
                  />
                  <button
                    type="button"
                    onClick={() => handleStepMasakKulitCk(1)}
                    className="w-8 h-8 rounded-lg bg-[#E4002B] text-white font-bold flex items-center justify-center hover:bg-[#c40024] active:scale-95 transition-all cursor-pointer shrink-0"
                    title="Tambah 1 pcs Kulit CK"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Presets for Masak Kulit CK (e.g. 5, 10, 15, 20) */}
                <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[9px] font-bold text-red-800/80">Pilih Cepat:</span>
                  <div className="flex items-center gap-1">
                    {[5, 10, 15, 20].map((presetPcs) => {
                      const isSelected = parseStockQuantity(stock.masak_kulit_ck) === presetPcs;
                      return (
                        <button
                          key={presetPcs}
                          type="button"
                          onClick={() => handleMasakKulitCkChange(presetPcs.toString())}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${isSelected
                              ? 'bg-[#E4002B] text-white shadow-xs'
                              : 'bg-white text-red-900 border border-red-200/80 hover:bg-red-100'
                            }`}
                          title={`Set Masak Kulit CK ${presetPcs} pcs`}
                        >
                          {presetPcs} pcs
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-1.5 text-[10px] font-medium text-red-800 flex items-center justify-between">
                  <span className="text-slate-500">Olahan Kulit CK Dapur</span>
                  {masakKulitCkPcs > 0 && (
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      +{masakKulitCkPcs} Pcs Siap Jual
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Item Bahan Baku Tambahan dari Kelola Data */}
            {customRawItems.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3 mt-1 pt-3 border-t border-dashed border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Item Bahan Baku Tambahan ({customRawItems.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Dari Kelola Data</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {customRawItems.map((item) => {
                    const currentVal = stock[item.key] || '';
                    return (
                      <div
                        key={`custom-raw-${item.key}`}
                        className="bg-red-50/30 p-3 rounded-xl border border-red-200/60 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label
                              htmlFor={`stock-input-${item.key}`}
                              className="text-xs font-bold text-slate-800 truncate mr-1"
                              title={item.name}
                            >
                              {item.name}
                            </label>
                            <span className="text-[10px] font-semibold text-red-800 bg-red-100/70 px-1.5 py-0.5 rounded">
                              {item.unit}
                            </span>
                          </div>
                          <input
                            id={`stock-input-${item.key}`}
                            type="text"
                            inputMode="decimal"
                            value={currentVal}
                            onChange={(e) => handleStockChange(item.key, e.target.value)}
                            placeholder={item.default_value || '0'}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SUB-SECTION B: 📥 TOSSER IN (MASUK ETALASE / WARMER) */}
        <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-emerald-600 text-white">
                <ArrowDownToLine className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                  📥 Tosser In (Masuk Etalase)
                </span>
                <p className="text-[10px] text-emerald-700/90 font-medium">
                  Catatan produk yang masuk ke etalase/warmer display
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {activeTosserInList.length} Menu
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {activeTosserInList.map((item) => {
              const currentVal = stock.tosser_in?.[item.key] || '';
              return (
                <div
                  key={`tosser-in-${item.key}`}
                  className="bg-white p-2 rounded-lg border border-emerald-200 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-800 truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-100">
                      {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => handleStepTosserIn(item.key, -1)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 shrink-0"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <input
                      id={`tosser-in-input-${item.key}`}
                      type="text"
                      inputMode="numeric"
                      value={currentVal}
                      onChange={(e) => handleTosserInChange(item.key, e.target.value)}
                      placeholder="0"
                      className="w-full text-center bg-slate-50 border border-slate-200 focus:bg-white rounded px-1 py-0.5 text-xs font-bold text-emerald-950 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepTosserIn(item.key, 1)}
                      className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 shrink-0"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SUB-SECTION C: 📤 TOSSER OUT (KELUAR ETALASE / REJECT / AFKIR) */}
        <div className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-rose-600 text-white">
                <ArrowUpFromLine className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-900">
                  📤 Tosser Out (Keluar Etalase)
                </span>
                <p className="text-[10px] text-rose-700/90 font-medium">
                  Produk afkir, reject, rusak, tester, atau retur yang dikeluarkan dari etalase
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              {activeTosserOutList.length} Menu
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {activeTosserOutList.map((item) => {
              const currentVal = stock.tosser_out?.[item.key] || '';
              return (
                <div
                  key={`tosser-out-${item.key}`}
                  className="bg-white p-2 rounded-lg border border-rose-200 shadow-2xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-800 truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[9px] font-semibold text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">
                      {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => handleStepTosserOut(item.key, -1)}
                      className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 shrink-0"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <input
                      id={`tosser-out-input-${item.key}`}
                      type="text"
                      inputMode="numeric"
                      value={currentVal}
                      onChange={(e) => handleTosserOutChange(item.key, e.target.value)}
                      placeholder="0"
                      className="w-full text-center bg-slate-50 border border-slate-200 focus:bg-white rounded px-1 py-0.5 text-xs font-bold text-rose-950 focus:outline-hidden focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepTosserOut(item.key, 1)}
                      className="w-6 h-6 rounded bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center font-bold text-xs cursor-pointer active:scale-95 shrink-0"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SUB-SECTION D: PRODUK SIAP JUAL (TOTAL STOK TERSEDIA) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                Produk Siap Jual (Total Stok Awal Hari Ini)
              </span>
              <p className="text-[10px] text-slate-500">
                Total stok yang siap dijual ke kasir. Sisa stock akan dipotong dari angka ini.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSyncAllFromDapurAndTosser}
              className="px-2.5 py-1 text-[11px] font-bold text-red-800 bg-red-100 hover:bg-red-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer active:scale-95"
              title="Hitung ulang otomatis: Olahan Dapur + Tosser In - Tosser Out"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sinkronkan Tosser</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {activeReadyList.map((product) => {
              const inVal = parseStockQuantity(stock.tosser_in?.[product.key]) || 0;
              const outVal = parseStockQuantity(stock.tosser_out?.[product.key]) || 0;

              let kitchenExtra = 0;
              if (product.key === 'goreng_ayam_pb') {
                kitchenExtra = (stock.masak_ayam_pb !== undefined || stock.masak_ayam_pk !== undefined)
                  ? pbCookCount * pbRatio
                  : legacyGorengCount * pbRatio;
              } else if (product.key === 'goreng_ayam_pk') {
                kitchenExtra = (stock.masak_ayam_pb !== undefined || stock.masak_ayam_pk !== undefined)
                  ? pkCookCount * pkRatio
                  : legacyGorengCount * pkRatio;
              } else if (product.key === 'nasi') {
                kitchenExtra = masakNasiKg * riceRatio;
              } else if (product.key === 'goreng_kulit_ck') {
                kitchenExtra = masakKulitCkPcs;
              }

              const isAutoFilled = kitchenExtra > 0 || inVal > 0 || outVal > 0;

              return (
                <div
                  key={`stock-sell-${product.key}`}
                  className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor={`stock-input-${product.key}`}
                      className="text-xs font-bold text-slate-700 truncate mr-1"
                      title={product.name}
                    >
                      {product.name}
                    </label>
                    <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      {product.unit}
                    </span>
                  </div>

                  <input
                    id={`stock-input-${product.key}`}
                    type="text"
                    inputMode="numeric"
                    value={stock[product.key] || ''}
                    onChange={(e) => handleStockChange(product.key, e.target.value)}
                    placeholder="0"
                    className={`w-full bg-white border rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-hidden focus:ring-2 transition-all ${isAutoFilled
                        ? 'border-red-300 ring-1 ring-red-400/30 focus:ring-[#E4002B]/30 focus:border-[#E4002B]'
                        : 'border-slate-200 focus:ring-[#E4002B]/20 focus:border-[#E4002B]'
                      }`}
                  />

                  {/* Breakdown Indicator */}
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      Siap Jual
                    </span>

                    <div className="flex items-center gap-1 font-semibold">
                      {inVal > 0 && (
                        <span className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                          +{inVal} In
                        </span>
                      )}
                      {outVal > 0 && (
                        <span className="text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
                          -{outVal} Out
                        </span>
                      )}
                      {kitchenExtra > 0 && (
                        <span className="text-red-800 bg-red-50 px-1 py-0.2 rounded border border-red-200">
                          +{kitchenExtra} Dapur
                        </span>
                      )}
                    </div>
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
