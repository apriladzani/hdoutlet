import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, X, ShieldAlert, CheckCircle2, Delete } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  currentPin?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  currentPin = '0825',
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setIsSuccess(false);
      setIsShaking(false);
      // Auto focus hidden input for keyboard typing
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const verifyPin = (candidatePin: string) => {
    const targetPin = currentPin || '0825';
    if (candidatePin === targetPin) {
      setIsSuccess(true);
      setErrorMsg('');
      setTimeout(() => {
        onSuccess();
      }, 400);
    } else {
      setIsShaking(true);
      setErrorMsg('PIN salah! Akses khusus Admin Outlet.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 700);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (pin.length >= 4 || isSuccess) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg('');
    if (newPin.length === 4) {
      verifyPin(newPin);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0 && !isSuccess) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      handleDigitPress(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="admin-pin-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      {/* Hidden real input for physical keyboard entry */}
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute pointer-events-none -top-96"
        aria-hidden="true"
        autoComplete="off"
      />

      <div
        className={`bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transform transition-all duration-150 ${
          isShaking ? 'translate-x-[-8px] animate-pulse border-red-400' : ''
        }`}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 pb-6 text-center relative">
          <button
            type="button"
            id="btn-close-pin-modal"
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Tutup / Kembali"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E4002B] to-[#b30022] mx-auto flex items-center justify-center shadow-lg mb-3">
            {isSuccess ? (
              <CheckCircle2 className="w-7 h-7 text-white animate-bounce" />
            ) : (
              <Lock className="w-7 h-7 text-white" />
            )}
          </div>

          <h3 className="text-lg font-black tracking-tight text-white">
            Verifikasi Akses Admin
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
            Halaman Riwayat Laporan dilindungi kode keamanan. Masukkan 4 digit PIN admin untuk masuk.
          </p>
        </div>

        {/* PIN Dots Area */}
        <div className="p-5 text-center bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-center gap-3 my-1">
            {[0, 1, 2, 3].map((index) => {
              const hasDigit = index < pin.length;
              return (
                <div
                  key={index}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                    isSuccess
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-xs'
                      : hasDigit
                      ? 'border-[#E4002B] bg-white text-slate-900 shadow-sm scale-105'
                      : 'border-slate-200 bg-white text-slate-300'
                  }`}
                >
                  {hasDigit ? (isSuccess ? '✓' : '•') : ''}
                </div>
              );
            })}
          </div>

          {/* Status / Error Message */}
          <div className="min-h-[22px] mt-2 flex items-center justify-center">
            {isSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> PIN Benar! Mengalihkan...
              </span>
            ) : errorMsg ? (
              <span className="text-xs font-bold text-rose-600 flex items-center gap-1 animate-shake">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">
                Ketik langsung atau gunakan tombol di bawah
              </span>
            )}
          </div>
        </div>

        {/* On-Screen Keypad for Mobile & Touchscreens */}
        <div className="p-4 sm:p-5 bg-white space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                id={`pin-btn-${digit}`}
                onClick={() => handleDigitPress(digit)}
                disabled={isSuccess}
                className="h-13 sm:h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 text-xl font-extrabold transition-all cursor-pointer border border-slate-200/80 shadow-xs active:scale-95 flex items-center justify-center select-none"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              id="pin-btn-clear"
              onClick={handleClear}
              disabled={isSuccess || pin.length === 0}
              className="h-13 sm:h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 hover:text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200/80 shadow-xs disabled:opacity-40 flex items-center justify-center select-none"
            >
              Hapus
            </button>

            {/* Digit 0 */}
            <button
              type="button"
              id="pin-btn-0"
              onClick={() => handleDigitPress('0')}
              disabled={isSuccess}
              className="h-13 sm:h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-900 text-xl font-extrabold transition-all cursor-pointer border border-slate-200/80 shadow-xs active:scale-95 flex items-center justify-center select-none"
            >
              0
            </button>

            {/* Backspace Button */}
            <button
              type="button"
              id="pin-btn-backspace"
              onClick={handleBackspace}
              disabled={isSuccess || pin.length === 0}
              className="h-13 sm:h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-red-600 transition-all cursor-pointer border border-slate-200/80 shadow-xs disabled:opacity-40 flex items-center justify-center select-none"
              title="Hapus Satu Digit"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Cancel Button */}
          <div className="pt-2">
            <button
              type="button"
              id="btn-pin-cancel"
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer min-h-[42px] border border-slate-200"
            >
              Batal & Kembali ke Formulir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
