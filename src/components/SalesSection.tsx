import React from 'react';
import { ShoppingBag, Plus, Minus, ArrowDown, PackageCheck } from 'lucide-react';
import { SaleItem, StockData } from '../types.ts';
import { formatRupiah } from '../utils/formatters.ts';
import { getProductStockSummary } from '../utils/stockCalculations.ts';

interface SalesSectionProps {
  sales: SaleItem[];
  setSales: React.Dispatch<React.SetStateAction<SaleItem[]>>;
  totalIncome: number;
  stock: StockData;
  outletType?: 'traditional' | 'modern';
}

export const SalesSection: React.FC<SalesSectionProps> = ({
  sales,
  setSales,
  totalIncome,
  stock,
  outletType,
}) => {
  const updateQuantity = (productId: number, newQty: number) => {
    const item = sales.find((s) => s.product_id === productId);
    if (!item) return;
    const stockInfo = getProductStockSummary(item, stock, sales);

    let validQty = Math.max(0, isNaN(newQty) ? 0 : newQty);
    if (!stockInfo.hasAllStockFilled) {
      validQty = 0;
    } else if (validQty > stockInfo.maxAllowedQuantity) {
      validQty = stockInfo.maxAllowedQuantity;
    }

    setSales((prev) =>
      prev.map((it) =>
        it.product_id === productId
          ? { ...it, quantity: validQty, subtotal: validQty * it.price }
          : it
      )
    );
  };

  const handleStep = (productId: number, delta: number) => {
    const current = sales.find((s) => s.product_id === productId);
    const currentQty = current ? current.quantity : 0;
    updateQuantity(productId, currentQty + delta);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="px-4 py-3 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-600/10 text-emerald-700">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                SECTION 2
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
                <ArrowDown className="w-2.5 h-2.5" />
                Auto-generate Sisa Stock ke Section 3
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              💰 SALES
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {outletType && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                outletType === 'modern'
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              {outletType === 'modern' ? '🏬 Menu Modern Outlet' : '🏛️ Menu Traditional Outlet'}
            </span>
          )}
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            Penjualan Kasir
          </span>
        </div>
      </div>

      {/* Info Banner on Flow */}
      <div className="px-4 py-2 bg-emerald-50/40 border-b border-emerald-100/50 flex items-center justify-between text-xs text-emerald-800">
        <span className="flex items-center gap-1.5">
          <PackageCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            {outletType === 'modern'
              ? 'Pilih paket menu Modern Outlet yang terjual. Sisa stock ayam PB, PK, & nasi di Section 3 akan langsung berkurang otomatis sesuai isi paket.'
              : 'Input jumlah barang yang terjual di outlet. Sisa stock di Section 3 akan langsung ter-generate otomatis (Stok Awal − Terjual).'}
          </span>
        </span>
      </div>

      {/* Product Rows List */}
      <div className="p-3.5 space-y-2.5">
        {sales.map((item) => {
          const stockInfo = getProductStockSummary(item, stock, sales);

          return (
            <div
              key={item.product_id}
              id={`sale-row-${item.product_id}`}
              className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              {/* Product Info & Available Stock */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {item.product_name}
                  </h3>
                  <span className="text-xs font-semibold text-[#E4002B] bg-red-50 px-1.5 py-0.5 rounded border border-red-200/50 shrink-0">
                    {formatRupiah(item.price)}
                  </span>
                  {item.description && (
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60 shrink-0">
                      {item.description}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {stockInfo.hasAllStockFilled ? (
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md inline-flex items-center gap-1.5 flex-wrap">
                      <span>
                        Stok Awal: <strong className="text-slate-800 font-bold">{stockInfo.initialStockText}</strong>
                      </span>
                      {stockInfo.maxFromInitialStock !== null && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          (Maks: {stockInfo.maxFromInitialStock} {stockInfo.unitLabel})
                        </span>
                      )}
                      {stockInfo.remainingStockText && (
                        <span className={`font-bold ml-1 ${stockInfo.canAddMore ? 'text-emerald-700' : 'text-rose-700'}`}>
                          ➔ Sisa: {stockInfo.remainingStockText}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-md">
                      ⚠️ Stok awal belum diisi di Section 1
                      {stockInfo.components.length > 0 && (
                        <span className="font-semibold ml-1">
                          (Perlu: {stockInfo.components.map((c) => c.shortLabel).join(' & ')})
                        </span>
                      )}
                    </span>
                  )}

                  {stockInfo.isOutOfStock && (
                    <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded">
                      Stok 0 (Tidak Bisa Dijual)
                    </span>
                  )}

                  {!stockInfo.isOutOfStock && !stockInfo.canAddMore && item.quantity > 0 && (
                    <span className="text-[10px] font-extrabold text-red-800 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded">
                      🛑 Maksimal Stok Terjual {stockInfo.exhaustedComponents.length > 0 && `(${stockInfo.exhaustedComponents.join(', ')})`}
                    </span>
                  )}

                  {!stockInfo.isOutOfStock && !stockInfo.canAddMore && item.quantity === 0 && stockInfo.hasAllStockFilled && (
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                      ⚠️ Bahan Habis: {stockInfo.exhaustedComponents.join(', ')}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>
                    Subtotal: <strong className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {item.quantity} {stockInfo.unitLabel} × {formatRupiah(item.price)}
                  </span>
                </div>
              </div>

              {/* Stepper Touch-Control & Number Input */}
              <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                {/* Minus Button */}
                <button
                  type="button"
                  id={`btn-dec-${item.product_id}`}
                  onClick={() => handleStep(item.product_id, -1)}
                  disabled={item.quantity <= 0}
                  aria-label={`Kurangi ${item.product_name}`}
                  className="w-11 h-11 rounded-xl bg-white border border-slate-300 active:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-700 font-bold shadow-xs hover:border-[#E4002B] transition-all cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* Number Input Field */}
                <div className="relative w-16">
                  <input
                    type="number"
                    id={`qty-input-${item.product_id}`}
                    min="0"
                    max={stockInfo.hasAllStockFilled ? stockInfo.maxAllowedQuantity : 0}
                    value={item.quantity === 0 ? '' : item.quantity}
                    disabled={!stockInfo.hasAllStockFilled || (!stockInfo.canAddMore && item.quantity === 0)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === '') {
                        updateQuantity(item.product_id, 0);
                        return;
                      }
                      const val = parseInt(raw, 10);
                      updateQuantity(item.product_id, val);
                    }}
                    placeholder="0"
                    className={`w-full h-11 text-center bg-white border rounded-xl text-base font-extrabold text-slate-900 focus:outline-none transition-all shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
                      !stockInfo.canAddMore && item.quantity > 0
                        ? 'border-[#E4002B] ring-1 ring-red-300 focus:ring-2 focus:ring-[#E4002B]/30'
                        : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                </div>

                {/* Plus Button */}
                <button
                  type="button"
                  id={`btn-inc-${item.product_id}`}
                  onClick={() => handleStep(item.product_id, 1)}
                  disabled={!stockInfo.canAddMore}
                  title={
                    !stockInfo.hasAllStockFilled
                      ? 'Stok awal belum diisi di Section 1'
                      : !stockInfo.canAddMore
                      ? stockInfo.exhaustedComponents.length > 0
                        ? `Tidak bisa tambah, bahan habis: ${stockInfo.exhaustedComponents.join(', ')}`
                        : 'Stok sudah habis'
                      : `Tambah ${item.product_name}`
                  }
                  aria-label={`Tambah ${item.product_name}`}
                  className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-30 disabled:pointer-events-none text-white font-bold shadow-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Subtotal Banner */}
        <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Total Pemasukan Offline
          </span>
          <span className="text-base font-extrabold text-emerald-700">
            {formatRupiah(totalIncome)}
          </span>
        </div>
      </div>
    </section>
  );
};
