import { DailyReport } from '../types.ts';
import {
  calculateLoss,
  calculateLossPercentage,
  calculateExpensePercentage,
  formatPercentage,
  GORENG_AYAM_PB_RATIO,
  GORENG_AYAM_PK_RATIO,
} from './stockCalculations.ts';

export function formatRupiah(amount: number | string | undefined | null): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === undefined || num === null || isNaN(num)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num).replace(/\s+/g, ' ');
}

export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (!value) return 0;
  // Remove non-digits
  const clean = value.replace(/[^0-9]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatIndonesianDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

export function formatShortIndonesianDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  if (isNaN(date.getTime())) return dateString;

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function generateWaSummary(report: DailyReport): string {
  const lines: string[] = [
    `🍗 *LAPORAN HARIAN OUTLET HD FRIED CHICKEN* 🍗`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📍 *Outlet:* ${report.outlet_name}`,
    `👤 *Pegawai:* ${report.staff_name || '-'}`,
    `📅 *Tanggal:* ${formatIndonesianDate(report.report_date)}`,
    ``,
    `📦 *STOCK AWAL & TOSSER:*`,
    `• Ayam Mentah: ${report.stock?.ayam_mentah || '0'} kg | Goreng PB: ${report.stock?.masak_ayam_pb || (report.stock?.goreng_ayam_pb ? report.stock.goreng_ayam_pb + ' pcs' : '0')} | Goreng PK: ${report.stock?.masak_ayam_pk || (report.stock?.goreng_ayam_pk ? report.stock.goreng_ayam_pk + ' pcs' : '0')}`,
    `• Beras: ${report.stock?.beras || '0'} kg | Masak Nasi: ${report.stock?.masak_nasi || '0'} kg | Masak Kulit CK: ${report.stock?.masak_kulit_ck ? report.stock.masak_kulit_ck + ' pcs' : '0'}`,
    `• Siap Jual: PB: ${report.stock?.goreng_ayam_pb || (Number(report.stock?.masak_ayam_pb || 0) * GORENG_AYAM_PB_RATIO) || 0} | PK: ${report.stock?.goreng_ayam_pk || (Number(report.stock?.masak_ayam_pk || 0) * GORENG_AYAM_PK_RATIO) || 0} | Kulit: ${report.stock?.goreng_kulit || 0} | Kulit CK: ${report.stock?.goreng_kulit_ck || 0} | Nasi: ${report.stock?.nasi || 0}`,
  ];

  const inData = report.stock?.tosser_in;
  const outData = report.stock?.tosser_out;
  if (inData && Object.values(inData).some((v) => v && v !== '0')) {
    lines.push(`• 📥 Tosser In: PB:${inData.goreng_ayam_pb || 0}, PK:${inData.goreng_ayam_pk || 0}, Klt:${inData.goreng_kulit || 0}, CK:${inData.goreng_kulit_ck || 0}, Nasi:${inData.nasi || 0}`);
  }
  if (outData && Object.values(outData).some((v) => v && v !== '0')) {
    lines.push(`• 📤 Tosser Out: PB:${outData.goreng_ayam_pb || 0}, PK:${outData.goreng_ayam_pk || 0}, Klt:${outData.goreng_kulit || 0}, CK:${outData.goreng_kulit_ck || 0}, Nasi:${outData.nasi || 0}`);
  }

  if (report.remaining_stock) {
    const rawVal = report.remaining_stock.ayam_mentah || '0';
    const ket = report.remaining_stock.ayam_mentah_keterangan;
    const ayamRemKet = ket && ket !== `${rawVal} kg` ? ` (${ket})` : '';
    lines.push(`• Sisa Dapur: Ayam Mentah: ${rawVal} kg${ayamRemKet} | Beras: ${report.remaining_stock.beras || '0'} kg`);
    lines.push(`• Sisa Jual: PB: ${report.remaining_stock.goreng_ayam_pb || '0'} | PK: ${report.remaining_stock.goreng_ayam_pk || '0'} | Kulit: ${report.remaining_stock.goreng_kulit || '0'} | Kulit CK: ${report.remaining_stock.goreng_kulit_ck || '0'} | Nasi: ${report.remaining_stock.nasi || '0'}`);
  }

  lines.push(``);
  lines.push(`💰 *PENJUALAN OFFLINE:*`);

  (report.sales || []).forEach((item) => {
    if (item.quantity > 0) {
      lines.push(`• ${item.product_name} (${item.quantity}x @${formatRupiah(item.price)}) = ${formatRupiah(item.subtotal)}`);
    }
  });

  lines.push(`*Total Pemasukan:* ${formatRupiah(report.total_income)}`);
  lines.push(``);
  lines.push(`💸 *PENGELUARAN:*`);
  if (report.expenses.gas > 0) lines.push(`• Gas: ${formatRupiah(report.expenses.gas)}`);
  if (report.expenses.galon > 0) lines.push(`• Galon: ${formatRupiah(report.expenses.galon)}`);
  if (report.expenses.clean_tools && report.expenses.clean_tools > 0) lines.push(`• Clean Tools: ${formatRupiah(report.expenses.clean_tools)}`);
  if (report.expenses.kulit && report.expenses.kulit > 0) lines.push(`• Kulit: ${formatRupiah(report.expenses.kulit)}`);
  if (report.expenses.meal > 0) lines.push(`• Meal: ${formatRupiah(report.expenses.meal)}`);
  if (report.expenses.bonus > 0) lines.push(`• Bonus: ${formatRupiah(report.expenses.bonus)}`);
  if (report.expenses.lain_lain > 0) {
    const ket = report.expenses.lain_lain_keterangan ? ` (${report.expenses.lain_lain_keterangan})` : '';
    lines.push(`• Lain-lain${ket}: ${formatRupiah(report.expenses.lain_lain)}`);
  }
  if (report.expenses.beras && report.expenses.beras > 0) lines.push(`• Beras: ${formatRupiah(report.expenses.beras)}`);
  if (report.expenses.saus && report.expenses.saus > 0) lines.push(`• Saus: ${formatRupiah(report.expenses.saus)}`);
  if (report.expenses.minyak && report.expenses.minyak > 0) lines.push(`• Minyak: ${formatRupiah(report.expenses.minyak)}`);
  lines.push(`*Total Pengeluaran:* ${formatRupiah(report.total_expense)}`);
  const expensePct = calculateExpensePercentage(report.total_expense, report.total_income);
  lines.push(`*Persentase Pengeluaran:* ${formatPercentage(expensePct)}`);
  lines.push(`• Persentase pengeluaran: (Total Pengeluaran dibagi Total Pemasukan) x 100%`);
  if (report.promo > 0) {
    lines.push(`🏷️ *Promo/Potongan:* ${formatRupiah(report.promo)}`);
  }
  lines.push(``);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`⭐ *TOTAL AKHIR:* ${formatRupiah(report.final_total)}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const lossData = calculateLoss(report.remaining_stock);
  const lossPct = calculateLossPercentage(lossData.totalLoss, report.total_income);
  lines.push(``);
  lines.push(`📉 *LOSS (KERUGIAN SISA STOCK):*`);
  lines.push(`• Sisa Ayam PB: ${lossData.pbQty} pcs × Rp 5.500 = ${formatRupiah(lossData.pbLoss)}`);
  lines.push(`• Sisa Ayam PK: ${lossData.pkQty} pcs × Rp 5.500 = ${formatRupiah(lossData.pkLoss)}`);
  lines.push(`• Sisa Nasi: ${lossData.nasiQty} pcs × Rp 1.500 = ${formatRupiah(lossData.nasiLoss)}`);
  lines.push(`*Total Kerugian:* ${formatRupiah(lossData.totalLoss)}`);
  lines.push(`*Persentase Kerugian:* ${formatPercentage(lossPct)}`);
  lines.push(`• toleransi kerugian 1%`);
  lines.push(`• Persentase kerugian: (Total Kerugian dibagi Total Pemasukan) x 100%`);
  lines.push(``);
  lines.push(`💳 *PEMBAYARAN:*`);
  lines.push(`• Tunai: ${formatRupiah(report.payments.tunai)}`);
  lines.push(`• QR: ${formatRupiah(report.payments.qr)}`);
  lines.push(`• Transfer: ${formatRupiah(report.payments.tf)}`);
  lines.push(`*Status:* ${report.is_balanced ? '✅ BALANCE' : `⚠️ BELUM BALANCE (Selisih: ${formatRupiah(report.balance_difference)})`}`);

  if (report.notes) {
    lines.push(``);
    lines.push(`📝 *Catatan:*`);
    lines.push(report.notes);
  }

  lines.push(``);
  lines.push(`_Dikirim melalui Sistem HD Fried Chicken Mobile_`);
  return lines.join('\n');
}
