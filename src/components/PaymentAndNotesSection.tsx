import React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, FileEdit } from 'lucide-react';
import { PaymentData } from '../types.ts';
import { formatRupiah, parseNumber } from '../utils/formatters.ts';

interface PaymentAndNotesSectionProps {
  payments: PaymentData;
  setPayments: React.Dispatch<React.SetStateAction<PaymentData>>;
  finalTotal: number;
  notes: string;
  setNotes: (notes: string) => void;
}

export const PaymentAndNotesSection: React.FC<PaymentAndNotesSectionProps> = ({
  payments,
  setPayments,
  finalTotal,
  notes,
  setNotes,
}) => {
  const totalPayment = (payments.tunai || 0) + (payments.qr || 0) + (payments.tf || 0);
  const isBalanced = totalPayment === finalTotal;
  const difference = totalPayment - finalTotal;

  const handleAmountChange = (key: keyof PaymentData, rawVal: string) => {
    const num = parseNumber(rawVal);
    setPayments((prev) => ({ ...prev, [key]: num }));
  };

  // Quick fill remaining balance to a field
  const fillRemaining = (field: 'tunai' | 'qr' | 'tf') => {
    const otherPayments =
      field === 'tunai'
        ? (payments.qr || 0) + (payments.tf || 0)
        : field === 'qr'
        ? (payments.tunai || 0) + (payments.tf || 0)
        : (payments.tunai || 0) + (payments.qr || 0);

    const remaining = Math.max(0, finalTotal - otherPayments);
    setPayments((prev) => ({ ...prev, [field]: remaining }));
  };

  return (
    <div className="space-y-4">
      {/* SECTION 8: PEMBAYARAN */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-red-50/70 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E4002B]/10 text-[#E4002B]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                SECTION 8
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                💳 PEMBAYARAN
              </h2>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600">
            Target: {formatRupiah(finalTotal)}
          </span>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Inputs: Tunai, QR, TF */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tunai */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="pay-tunai" className="text-xs font-bold text-slate-800">
                  Tunai (Cash)
                </label>
                <button
                  type="button"
                  onClick={() => fillRemaining('tunai')}
                  className="text-[10px] font-semibold text-[#E4002B] hover:text-[#c40024] underline cursor-pointer"
                >
                  Isi Sisa
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="pay-tunai"
                  value={payments.tunai === 0 ? '' : payments.tunai.toLocaleString('id-ID')}
                  onChange={(e) => handleAmountChange('tunai', e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[#E4002B] focus:ring-2 focus:ring-[#E4002B]/20 rounded-xl text-base font-bold text-slate-900 focus:outline-none transition-all min-h-[44px]"
                />
              </div>
            </div>

            {/* QR */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="pay-qr" className="text-xs font-bold text-slate-800">
                  QR (QRIS)
                </label>
                <button
                  type="button"
                  onClick={() => fillRemaining('qr')}
                  className="text-[10px] font-semibold text-[#E4002B] hover:text-[#c40024] underline cursor-pointer"
                >
                  Isi Sisa
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="pay-qr"
                  value={payments.qr === 0 ? '' : payments.qr.toLocaleString('id-ID')}
                  onChange={(e) => handleAmountChange('qr', e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[#E4002B] focus:ring-2 focus:ring-[#E4002B]/20 rounded-xl text-base font-bold text-slate-900 focus:outline-none transition-all min-h-[44px]"
                />
              </div>
            </div>

            {/* TF */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="pay-tf" className="text-xs font-bold text-slate-800">
                  Transfer (TF)
                </label>
                <button
                  type="button"
                  onClick={() => fillRemaining('tf')}
                  className="text-[10px] font-semibold text-[#E4002B] hover:text-[#c40024] underline cursor-pointer"
                >
                  Isi Sisa
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  id="pay-tf"
                  value={payments.tf === 0 ? '' : payments.tf.toLocaleString('id-ID')}
                  onChange={(e) => handleAmountChange('tf', e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-[#E4002B] focus:ring-2 focus:ring-[#E4002B]/20 rounded-xl text-base font-bold text-slate-900 focus:outline-none transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* BALANCE STATUS BADGE */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              isBalanced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50/90 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#E4002B] shrink-0" />
                )}
                <div>
                  <div className="text-sm font-extrabold">
                    {isBalanced ? '✓ Pembayaran Balance' : '⚠ Pembayaran Belum Balance'}
                  </div>
                  <div className="text-xs font-medium opacity-80 mt-0.5">
                    {isBalanced
                      ? 'Total pembayaran cocok dengan Total Akhir.'
                      : `Total Bayar (${formatRupiah(totalPayment)}) ≠ Target (${formatRupiah(finalTotal)})`}
                  </div>
                </div>
              </div>

              {!isBalanced && (
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-800">
                    Selisih
                  </div>
                  <div className="text-sm sm:text-base font-black text-red-900">
                    {difference < 0 ? `Kurang ${formatRupiah(Math.abs(difference))}` : `Lebih ${formatRupiah(difference)}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: CATATAN */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-700">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                SECTION 9
              </span>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                📝 CATATAN
              </h2>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Opsional
          </span>
        </div>

        <div className="p-4">
          <label htmlFor="notes-textarea" className="block text-xs font-bold text-slate-700 mb-1.5">
            Catatan Tambahan Outlet
          </label>
          <textarea
            id="notes-textarea"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan catatan khusus hari ini jika ada (misal: kendala stok, cuaca hujan sepi, pergantian shift, dll)..."
            className="w-full p-3 bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-[#E4002B] focus:ring-2 focus:ring-[#E4002B]/20 rounded-xl text-sm font-medium text-slate-900 focus:outline-none transition-all resize-none"
          />
        </div>
      </section>
    </div>
  );
};
