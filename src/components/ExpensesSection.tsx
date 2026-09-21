import React from 'react';
import { DollarSign, HelpCircle, Percent } from 'lucide-react';
import { ExpenseData } from '../types.ts';
import { formatRupiah, parseNumber } from '../utils/formatters.ts';
import { calculateExpensePercentage, formatPercentage } from '../utils/stockCalculations.ts';

interface ExpensesSectionProps {
  expenses: ExpenseData;
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseData>>;
  totalExpense: number;
  totalIncome: number;
}

interface ExpenseFieldConfig {
  key: keyof Omit<ExpenseData, 'lain_lain_keterangan' | 'total_expense'>;
  label: string;
  placeholder: string;
}

const EXPENSE_FIELDS: ExpenseFieldConfig[] = [
  { key: 'gas', label: 'Gas', placeholder: '0' },
  { key: 'galon', label: 'Galon', placeholder: '0' },
  { key: 'clean_tools', label: 'Clean Tools', placeholder: '0' },
  { key: 'kulit', label: 'Kulit', placeholder: '0' },
  { key: 'meal', label: 'Meal (Makan Karyawan)', placeholder: '0' },
  { key: 'bonus', label: 'Bonus', placeholder: '0' },
  { key: 'lain_lain', label: 'Lain-lain', placeholder: '0' },
];

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  setExpenses,
  totalExpense,
  totalIncome,
}) => {
  const handleAmountChange = (key: keyof ExpenseData, rawVal: string) => {
    const num = parseNumber(rawVal);
    setExpenses((prev) => ({ ...prev, [key]: num }));
  };

  const addQuickAmount = (key: keyof ExpenseData, addVal: number) => {
    setExpenses((prev) => {
      const current = Number(prev[key]) || 0;
      return { ...prev, [key]: current + addVal };
    });
  };

  const expensePct = calculateExpensePercentage(totalExpense, totalIncome);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-600/10 text-rose-700">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              SECTION 4
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              💸 PENGELUARAN
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
            Total: {formatRupiah(totalExpense)}
          </span>
          <span className="text-xs font-bold text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Percent className="w-3 h-3 text-rose-700" />
            {formatPercentage(expensePct)}
          </span>
        </div>
      </div>

      {/* Fields */}
      <div className="p-3.5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EXPENSE_FIELDS.map((field) => {
            const val = expenses[field.key] as number;
            const isLainLain = field.key === 'lain_lain';

            return (
              <div
                key={field.key}
                className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={`expense-${field.key}`}
                    className="text-xs font-bold text-slate-800"
                  >
                    {field.label}
                  </label>
                  {val > 0 && (
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200/40">
                      {formatRupiah(val)}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    id={`expense-${field.key}`}
                    value={val === 0 ? '' : val.toLocaleString('id-ID')}
                    onChange={(e) => handleAmountChange(field.key, e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-xl text-base font-bold text-slate-900 focus:outline-none transition-all min-h-[44px]"
                  />
                </div>

                {/* Quick Add Helper chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {[
                    { label: '+10rb', val: 10000 },
                    { label: '+15rb', val: 15000 },
                    { label: '+20rb', val: 20000 },
                    { label: '+25rb', val: 25000 },
                    { label: '+30rb', val: 30000 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => addQuickAmount(field.key, preset.val)}
                      className="text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-md px-2 py-0.5 active:scale-95 transition-all cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                  {val > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpenses((prev) => ({ ...prev, [field.key]: 0 }))}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 ml-auto px-1 cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Keterangan Lain-lain */}
                {isLainLain && (val > 0 || expenses.lain_lain_keterangan) && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60">
                    <label
                      htmlFor="expense-lain-lain-keterangan"
                      className="block text-[11px] font-semibold text-slate-600 mb-1"
                    >
                      Keterangan Pengeluaran Lain-lain:
                    </label>
                    <input
                      type="text"
                      id="expense-lain-lain-keterangan"
                      value={expenses.lain_lain_keterangan || ''}
                      onChange={(e) =>
                        setExpenses((prev) => ({ ...prev, lain_lain_keterangan: e.target.value }))
                      }
                      placeholder="Contoh: Beli kresek, spons cuci piring, dll"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-rose-500 rounded-lg text-xs font-medium text-slate-900 focus:outline-none transition-all min-h-[40px]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Subtotal Banner & Percentage */}
        <div className="pt-2 border-t border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Total Pengeluaran
            </span>
            <div className="text-right">
              <span className="text-base font-extrabold text-rose-700">
                {formatRupiah(totalExpense)}
              </span>
              <span className="ml-2 text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                {formatPercentage(expensePct)}
              </span>
            </div>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/70 rounded-xl p-2.5 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="font-bold text-rose-900">
                Persentase Pengeluaran: (Total Pengeluaran ÷ Total Pemasukan) x 100%
              </span>
              <div className="text-[11px] text-rose-800/90 font-mono mt-0.5">
                = ({formatRupiah(totalExpense)} ÷ {formatRupiah(totalIncome)}) × 100%
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-black text-rose-700">
                {formatPercentage(expensePct)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
