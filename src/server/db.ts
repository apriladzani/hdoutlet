import fs from 'fs';
import path from 'path';
import { mySqlService, initDatabase } from './mysql.ts';
export { mySqlService, initDatabase };
import {
  AdminSettings,
  ChickenConversionConfig,
  DailyReport,
  DEFAULT_CHICKEN_CONVERSION,
  DEFAULT_MASTER_BARANG,
  DEFAULT_PRODUCTS,
  EndingStockMasterItem,
  ExpenseCategoryItem,
  MasterBarangItem,
  OutletItem,
  OUTLETS,
  Product,
  ReportFormData,
  SaleItem,
  StockMasterItem,
  TosserData,
  TosserMasterItem,
} from '../types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface DatabaseSchema {
  settings?: AdminSettings;
  master_barang?: MasterBarangItem[];
  outlets?: OutletItem[];
  products: Product[];
  stock_items?: StockMasterItem[];
  tosser_items?: TosserMasterItem[];
  expense_categories?: ExpenseCategoryItem[];
  ending_stock_items?: EndingStockMasterItem[];
  reports: Array<{
    id: number;
    report_date: string;
    outlet_name: string;
    staff_name?: string;
    total_income: number;
    total_expense: number;
    promo: number;
    promo_note?: string;
    final_total: number;
    is_balanced: boolean;
    balance_difference: number;
    total_loss?: number;
    loss_percentage?: number;
    notes: string;
    created_at: string;
    updated_at?: string;
  }>;
  stock: Array<{
    id: number;
    report_id: number;
    ayam_mentah: string;
    goreng_ayam?: string;
    masak_ayam_pb?: string;
    masak_ayam_pk?: string;
    kulit_mentah: string;
    masak_kulit_ck?: string;
    beras: string;
    masak_nasi?: string;
    tosser_in?: TosserData;
    tosser_out?: TosserData;
    goreng_ayam_pb: string;
    goreng_ayam_pk: string;
    goreng_kulit: string;
    goreng_kulit_ck?: string;
    nasi: string;
    s_chili_oil: string;
    s_geprek: string;
  }>;
  remaining_stock: Array<{
    id: number;
    report_id: number;
    ayam_mentah: string;
    ayam_mentah_keterangan?: string;
    goreng_ayam?: string;
    kulit_mentah: string;
    beras: string;
    masak_nasi?: string;
    goreng_ayam_pb: string;
    goreng_ayam_pk: string;
    goreng_kulit: string;
    goreng_kulit_ck?: string;
    nasi: string;
    s_chili_oil: string;
    s_geprek: string;
  }>;
  sales: Array<{
    id: number;
    report_id: number;
    product_id: number;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
  expenses: Array<{
    id: number;
    report_id: number;
    gas: number;
    galon: number;
    clean_tools?: number;
    kulit?: number;
    meal: number;
    bonus: number;
    lain_lain: number;
    lain_lain_keterangan?: string;
    total_expense: number;
    beras?: number;
    saus?: number;
    minyak?: number;
  }>;
  payments: Array<{
    id: number;
    report_id: number;
    tunai: number;
    qr: number;
    tf: number;
    total_payment: number;
  }>;
}

const DEFAULT_TOSSER: TosserData = {
  goreng_ayam_pb: '',
  goreng_ayam_pk: '',
  goreng_kulit: '',
  goreng_kulit_ck: '',
  nasi: '',
  s_chili_oil: '',
  s_geprek: '',
};

export const DEFAULT_SETTINGS: AdminSettings = {
  admin_pin: '0825',
  conversion: DEFAULT_CHICKEN_CONVERSION,
};

export const DEFAULT_OUTLETS: OutletItem[] = OUTLETS.map((name, idx) => ({
  id: idx + 1,
  name,
  active: true,
  outlet_type: name === 'BRP' || name === 'Taman Sari' ? 'modern' : 'traditional',
}));

export const DEFAULT_STOCK_ITEMS: StockMasterItem[] = [
  { id: 1, key: 'ayam_mentah', name: 'Ayam Mentah', category: 'raw', unit: 'kg', active: true, barang_id: 3 },
  { id: 2, key: 'masak_ayam_pb', name: 'Masak Goreng Ayam PB', category: 'raw', unit: 'ekor/porsi', active: true, barang_id: 1 },
  { id: 3, key: 'masak_ayam_pk', name: 'Masak Goreng Ayam PK', category: 'raw', unit: 'ekor/porsi', active: true, barang_id: 2 },
  { id: 4, key: 'kulit_mentah', name: 'Kulit Mentah', category: 'raw', unit: 'kg', active: true, barang_id: 6 },
  { id: 5, key: 'beras', name: 'Beras', category: 'raw', unit: 'kg', active: true, barang_id: 8 },
  { id: 6, key: 'masak_nasi', name: 'Masak Nasi', category: 'raw', unit: 'kg', active: true, barang_id: 7 },
  { id: 7, key: 'goreng_ayam_pb', name: 'Goreng Ayam PB', category: 'ready', unit: 'pcs', active: true, barang_id: 1 },
  { id: 8, key: 'goreng_ayam_pk', name: 'Goreng Ayam PK', category: 'ready', unit: 'pcs', active: true, barang_id: 2 },
  { id: 9, key: 'goreng_kulit', name: 'Goreng Kulit', category: 'ready', unit: 'pcs', active: true, barang_id: 4 },
  { id: 13, key: 'goreng_kulit_ck', name: 'Kulit CK', category: 'ready', unit: 'pcs', active: true, barang_id: 5 },
  { id: 10, key: 'nasi', name: 'Nasi', category: 'ready', unit: 'pcs', active: true, barang_id: 7 },
  { id: 11, key: 's_chili_oil', name: 'S. Chili Oil', category: 'ready', unit: 'pcs', active: true, barang_id: 9 },
  { id: 12, key: 's_geprek', name: 'S. Geprek', category: 'ready', unit: 'pcs', active: true, barang_id: 10 },
];

export const DEFAULT_TOSSER_ITEMS: TosserMasterItem[] = [
  { id: 1, key: 'goreng_ayam_pb', name: 'Goreng Ayam PB', type: 'both', unit: 'pcs', active: true, barang_id: 1 },
  { id: 2, key: 'goreng_ayam_pk', name: 'Goreng Ayam PK', type: 'both', unit: 'pcs', active: true, barang_id: 2 },
  { id: 3, key: 'goreng_kulit', name: 'Goreng Kulit', type: 'both', unit: 'pcs', active: true, barang_id: 4 },
  { id: 7, key: 'goreng_kulit_ck', name: 'Kulit CK', type: 'both', unit: 'pcs', active: true, barang_id: 5 },
  { id: 4, key: 'nasi', name: 'Nasi', type: 'both', unit: 'pcs', active: true, barang_id: 7 },
  { id: 5, key: 's_chili_oil', name: 'S. Chili Oil', type: 'both', unit: 'pcs', active: true, barang_id: 9 },
  { id: 6, key: 's_geprek', name: 'S. Geprek', type: 'both', unit: 'pcs', active: true, barang_id: 10 },
];

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategoryItem[] = [
  { id: 1, key: 'gas', name: 'Gas LPG', default_amount: 0, description: 'Penggantian tabung gas operasional', active: true },
  { id: 2, key: 'galon', name: 'Air Galon', default_amount: 8000, description: 'Air minum & masak galon', active: true },
  { id: 3, key: 'clean_tools', name: 'Clean Tools', default_amount: 0, description: 'Sabun cuci, spons, kresek', active: true },
  { id: 4, key: 'kulit', name: 'Kulit Tambahan', default_amount: 0, description: 'Belanja kulit ekstra', active: true },
  { id: 5, key: 'meal', name: 'Meal (Makan Karyawan)', default_amount: 25000, description: 'Uang makan staf operasional', active: true },
  { id: 6, key: 'bonus', name: 'Bonus Harian', default_amount: 0, description: 'Insentif target outlet', active: true },
  { id: 7, key: 'beras', name: 'Beras Tambahan', default_amount: 0, description: 'Belanja beras darurat', active: true },
  { id: 8, key: 'saus', name: 'Saus & Bumbu', default_amount: 0, description: 'Bumbu atau saus pelengkap', active: true },
  { id: 9, key: 'minyak', name: 'Minyak Goreng', default_amount: 0, description: 'Minyak goreng tambahan', active: true },
  { id: 10, key: 'lain_lain', name: 'Lain-lain', default_amount: 0, description: 'Biaya operasional tak terduga', active: true },
];

export const DEFAULT_ENDING_STOCK_ITEMS: EndingStockMasterItem[] = [
  { id: 1, key: 'ayam_mentah', name: 'Ayam Mentah (Sisa)', unit: 'kg', tolerance_note: 'Maks 0.5 kg (masuk freezer)', active: true },
  { id: 2, key: 'goreng_ayam_pb', name: 'Goreng Ayam PB', unit: 'pcs', tolerance_note: 'Maks 2 pcs batas wajar', active: true },
  { id: 3, key: 'goreng_ayam_pk', name: 'Goreng Ayam PK', unit: 'pcs', tolerance_note: 'Maks 2 pcs batas wajar', active: true },
  { id: 4, key: 'goreng_kulit', name: 'Goreng Kulit', unit: 'pcs', tolerance_note: 'Maks 3 pcs batas wajar', active: true },
  { id: 10, key: 'goreng_kulit_ck', name: 'Kulit CK', unit: 'pcs', tolerance_note: 'Maks 3 pcs batas wajar', active: true },
  { id: 5, key: 'nasi', name: 'Nasi Sisa', unit: 'pcs', tolerance_note: 'Maks 5 pcs', active: true },
  { id: 6, key: 's_chili_oil', name: 'S. Chili Oil', unit: 'pcs', tolerance_note: 'Maks 3 pcs', active: true },
  { id: 7, key: 's_geprek', name: 'S. Geprek', unit: 'pcs', tolerance_note: 'Maks 3 pcs', active: true },
  { id: 8, key: 'kulit_mentah', name: 'Kulit Mentah', unit: 'kg', tolerance_note: 'Simpan di chiller/freezer', active: true },
  { id: 9, key: 'beras', name: 'Beras Sisa', unit: 'kg', tolerance_note: 'Simpan tertutup', active: true },
];

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      outlets: DEFAULT_OUTLETS,
      products: DEFAULT_PRODUCTS,
      stock_items: DEFAULT_STOCK_ITEMS,
      tosser_items: DEFAULT_TOSSER_ITEMS,
      expense_categories: DEFAULT_EXPENSE_CATEGORIES,
      ending_stock_items: DEFAULT_ENDING_STOCK_ITEMS,
      reports: [
        {
          id: 1,
          report_date: '2026-09-10',
          outlet_name: 'Cisalak',
          total_income: 905000,
          total_expense: 128000,
          promo: 0,
          final_total: 777000,
          is_balanced: true,
          balance_difference: 0,
          notes: 'Penjualan ramai siang hari, stok ayam mentah habis tepat waktu tutup.',
          created_at: '2026-09-10T14:30:00.000Z',
        },
      ],
      stock: [
        {
          id: 1,
          report_id: 1,
          ayam_mentah: '12 kg',
          kulit_mentah: '5 kg',
          beras: '10 kg',
          goreng_ayam_pb: '25 pcs',
          goreng_ayam_pk: '30 pcs',
          goreng_kulit: '40 pcs',
          nasi: '50 pcs',
          s_chili_oil: '30 pcs',
          s_geprek: '35 pcs',
        },
      ],
      remaining_stock: [
        {
          id: 1,
          report_id: 1,
          ayam_mentah: '0 kg',
          kulit_mentah: '0.5 kg',
          beras: '2 kg',
          goreng_ayam_pb: '0 pcs',
          goreng_ayam_pk: '2 pcs',
          goreng_kulit: '3 pcs',
          nasi: '4 pcs',
          s_chili_oil: '2 pcs',
          s_geprek: '1 pcs',
        },
      ],
      sales: [
        { id: 1, report_id: 1, product_id: 1, product_name: 'Ayam PB', price: 9000, quantity: 45, subtotal: 405000 },
        { id: 2, report_id: 1, product_id: 2, product_name: 'Ayam PK', price: 7000, quantity: 38, subtotal: 266000 },
        { id: 3, report_id: 1, product_id: 3, product_name: 'Kulit', price: 5000, quantity: 24, subtotal: 120000 },
        { id: 4, report_id: 1, product_id: 4, product_name: 'Nasi', price: 3000, quantity: 20, subtotal: 60000 },
        { id: 5, report_id: 1, product_id: 5, product_name: 'Chili Oil', price: 2000, quantity: 18, subtotal: 36000 },
        { id: 6, report_id: 1, product_id: 6, product_name: 'Geprek', price: 2000, quantity: 9, subtotal: 18000 },
      ],
      expenses: [
        {
          id: 1,
          report_id: 1,
          gas: 0,
          galon: 8000,
          meal: 25000,
          bonus: 0,
          lain_lain: 0,
          lain_lain_keterangan: '',
          total_expense: 33000,
        },
      ],
      payments: [
        {
          id: 1,
          report_id: 1,
          tunai: 450000,
          qr: 250000,
          tf: 77000,
          total_payment: 777000,
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db: DatabaseSchema = JSON.parse(raw);
    let needsSave = false;

    // Migrate settings
    if (!db.settings || !db.settings.admin_pin) {
      db.settings = { ...DEFAULT_SETTINGS };
      needsSave = true;
    }

    // Migrate outlets
    if (!Array.isArray(db.outlets) || db.outlets.length === 0) {
      db.outlets = [...DEFAULT_OUTLETS];
      needsSave = true;
    } else {
      db.outlets = db.outlets.map((o) => {
        if (!o.outlet_type) {
          needsSave = true;
          return {
            ...o,
            outlet_type: o.name === 'BRP' || o.name === 'Taman Sari' ? 'modern' : 'traditional',
          };
        }
        return o;
      });
    }

    // Migrate stock_items
    if (!Array.isArray(db.stock_items) || db.stock_items.length === 0) {
      db.stock_items = [...DEFAULT_STOCK_ITEMS];
      needsSave = true;
    }

    // Migrate tosser_items
    if (!Array.isArray(db.tosser_items) || db.tosser_items.length === 0) {
      db.tosser_items = [...DEFAULT_TOSSER_ITEMS];
      needsSave = true;
    }

    // Migrate expense_categories
    if (!Array.isArray(db.expense_categories) || db.expense_categories.length === 0) {
      db.expense_categories = [...DEFAULT_EXPENSE_CATEGORIES];
      needsSave = true;
    }

    // Migrate ending_stock_items
    if (!Array.isArray(db.ending_stock_items) || db.ending_stock_items.length === 0) {
      db.ending_stock_items = [...DEFAULT_ENDING_STOCK_ITEMS];
      needsSave = true;
    }

    // Migrate & sync products (Ensure all modern & traditional products exist)
    if (!Array.isArray(db.products) || db.products.length === 0) {
      db.products = [...DEFAULT_PRODUCTS];
      needsSave = true;
    } else {
      const existingProductIds = new Set(db.products.map((p) => p.id));
      for (const defProd of DEFAULT_PRODUCTS) {
        if (!existingProductIds.has(defProd.id)) {
          db.products.push(defProd);
          needsSave = true;
        }
      }
      db.products = db.products.map((p) => {
        const defMatch = DEFAULT_PRODUCTS.find((dp) => dp.id === p.id);
        let updated = false;
        const newP = { ...p };
        if (!newP.outlet_type && defMatch?.outlet_type) {
          newP.outlet_type = defMatch.outlet_type;
          updated = true;
        }
        if (!newP.description && defMatch?.description) {
          newP.description = defMatch.description;
          updated = true;
        }
        if (!newP.items_composition && defMatch?.items_composition) {
          newP.items_composition = defMatch.items_composition;
          updated = true;
        }
        if ((newP.id === 5 || newP.name.toLowerCase() === 'chili oil') && newP.selling_price !== 1000) {
          newP.selling_price = 1000;
          updated = true;
        }
        if (updated) needsSave = true;
        return newP;
      });
    }

    if (needsSave) {
      saveDatabase(db);
    }
    return db;
  } catch (err) {
    console.error('Failed reading database file, creating fresh store:', err);
    const initialDb: DatabaseSchema = {
      settings: DEFAULT_SETTINGS,
      outlets: DEFAULT_OUTLETS,
      products: DEFAULT_PRODUCTS,
      stock_items: DEFAULT_STOCK_ITEMS,
      tosser_items: DEFAULT_TOSSER_ITEMS,
      expense_categories: DEFAULT_EXPENSE_CATEGORIES,
      ending_stock_items: DEFAULT_ENDING_STOCK_ITEMS,
      reports: [],
      stock: [],
      remaining_stock: [],
      sales: [],
      expenses: [],
      payments: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }
}



function saveDatabase(db: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export function calculateTotals(
  sales: SaleItem[] = [],
  expenses: { gas?: number; galon?: number; clean_tools?: number; kulit?: number; meal?: number; bonus?: number; lain_lain?: number; beras?: number; saus?: number; minyak?: number } = {},
  promo: number = 0,
  payments: { tunai?: number; qr?: number; tf?: number } = {}
) {
  const safeSales = Array.isArray(sales) ? sales : [];
  const safeExpenses = expenses || {};
  const safePayments = payments || {};

  // Validate and calculate sales income
  const total_income = safeSales.reduce((acc, item) => {
    const qty = Math.max(0, Number(item?.quantity) || 0);
    const price = Math.max(0, Number(item?.price) || 0);
    return acc + qty * price;
  }, 0);

  // Validate and calculate expenses
  const total_expense = Object.entries(safeExpenses).reduce((acc, [k, v]) => {
    if (k === 'total_expense' || k === 'lain_lain_keterangan') return acc;
    const num = Number(v);
    return isNaN(num) ? acc : acc + Math.max(0, num);
  }, 0);

  const validPromo = Math.max(0, Number(promo) || 0);

  // Formula: Total Akhir = Total Pemasukan - (Total Pengeluaran + Promo)
  const final_total = total_income - (total_expense + validPromo);

  // Payments
  const tunai = Math.max(0, Number(safePayments.tunai) || 0);
  const qr = Math.max(0, Number(safePayments.qr) || 0);
  const tf = Math.max(0, Number(safePayments.tf) || 0);
  const total_payment = tunai + qr + tf;

  // Balance Check: Tunai + QR + TF = Total Akhir
  const is_balanced = total_payment === final_total;
  const balance_difference = total_payment - final_total;

  return {
    total_income,
    total_expense,
    promo: validPromo,
    final_total,
    total_payment,
    is_balanced,
    balance_difference,
  };
}

export const dbService = mySqlService;

export const jsonDbService = {
  getProducts(outletType?: string): Product[] {
    const db = loadDatabase();
    if (outletType && outletType !== 'all') {
      return db.products.filter(
        (p) => p.outlet_type === outletType || p.outlet_type === 'all' || !p.outlet_type
      );
    }
    return db.products;
  },

  getReports(query?: { filter?: string; outlet?: string; startDate?: string; endDate?: string }): DailyReport[] {
    const db = loadDatabase();
    let reports = [...db.reports];

    // Filter by outlet
    if (query?.outlet && query.outlet !== 'Semua') {
      reports = reports.filter((r) => r.outlet_name.toLowerCase() === query.outlet!.toLowerCase());
    }

    // Filter by date ranges
    if (query?.filter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      reports = reports.filter((r) => r.report_date === today);
    } else if (query?.filter === 'week') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      reports = reports.filter((r) => r.report_date >= oneWeekAgo);
    } else if (query?.filter === 'month') {
      const now = new Date();
      const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
      reports = reports.filter((r) => r.report_date.startsWith(currentMonth));
    } else if (query?.startDate && query?.endDate) {
      reports = reports.filter((r) => r.report_date >= query.startDate! && r.report_date <= query.endDate!);
    }

    // Sort newest first
    reports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime() || b.id - a.id);

    // Hydrate child relational records
    return reports.map((r) => {
      const stock = db.stock.find((s) => s.report_id === r.id) || {
        id: 0,
        report_id: r.id,
        ayam_mentah: '',
        goreng_ayam: '',
        kulit_mentah: '',
        masak_kulit_ck: '',
        beras: '',
        masak_nasi: '',
        tosser_in: { ...DEFAULT_TOSSER },
        tosser_out: { ...DEFAULT_TOSSER },
        goreng_ayam_pb: '',
        goreng_ayam_pk: '',
        goreng_kulit: '',
        goreng_kulit_ck: '',
        nasi: '',
        s_chili_oil: '',
        s_geprek: '',
      };
      const remaining_stock = db.remaining_stock.find((rs) => rs.report_id === r.id) || {
        ayam_mentah: '',
        ayam_mentah_keterangan: '',
        goreng_ayam: '',
        kulit_mentah: '',
        beras: '',
        masak_nasi: '',
        goreng_ayam_pb: '',
        goreng_ayam_pk: '',
        goreng_kulit: '',
        goreng_kulit_ck: '',
        nasi: '',
        s_chili_oil: '',
        s_geprek: '',
      };
      const sales = db.sales.filter((s) => s.report_id === r.id);
      const expenses = db.expenses.find((e) => e.report_id === r.id) || {
        gas: 0,
        galon: 0,
        clean_tools: 0,
        kulit: 0,
        meal: 0,
        bonus: 0,
        lain_lain: 0,
        lain_lain_keterangan: '',
        total_expense: 0,
      };
      const payments = db.payments.find((p) => p.report_id === r.id) || {
        tunai: 0,
        qr: 0,
        tf: 0,
        total_payment: 0,
      };

      return {
        ...r,
        staff_name: r.staff_name || '',
        stock: {
          ayam_mentah: stock.ayam_mentah || '',
          goreng_ayam: stock.goreng_ayam || '',
          masak_ayam_pb: stock.masak_ayam_pb || '',
          masak_ayam_pk: stock.masak_ayam_pk || '',
          kulit_mentah: stock.kulit_mentah || '',
          masak_kulit_ck: stock.masak_kulit_ck || '',
          beras: stock.beras || '',
          masak_nasi: stock.masak_nasi || '',
          tosser_in: stock.tosser_in || { ...DEFAULT_TOSSER },
          tosser_out: stock.tosser_out || { ...DEFAULT_TOSSER },
          goreng_ayam_pb: stock.goreng_ayam_pb || '',
          goreng_ayam_pk: stock.goreng_ayam_pk || '',
          goreng_kulit: stock.goreng_kulit || '',
          goreng_kulit_ck: stock.goreng_kulit_ck || '',
          nasi: stock.nasi || '',
          s_chili_oil: stock.s_chili_oil || '',
          s_geprek: stock.s_geprek || '',
        },
        remaining_stock: {
          ayam_mentah: remaining_stock.ayam_mentah || '',
          ayam_mentah_keterangan: remaining_stock.ayam_mentah_keterangan || '',
          goreng_ayam: remaining_stock.goreng_ayam || '',
          kulit_mentah: remaining_stock.kulit_mentah || '',
          beras: remaining_stock.beras || '',
          masak_nasi: remaining_stock.masak_nasi || '',
          goreng_ayam_pb: remaining_stock.goreng_ayam_pb || '',
          goreng_ayam_pk: remaining_stock.goreng_ayam_pk || '',
          goreng_kulit: remaining_stock.goreng_kulit || '',
          goreng_kulit_ck: remaining_stock.goreng_kulit_ck || '',
          nasi: remaining_stock.nasi || '',
          s_chili_oil: remaining_stock.s_chili_oil || '',
          s_geprek: remaining_stock.s_geprek || '',
        },
        sales,
        expenses,
        payments,
      };
    });
  },

  getReportById(id: number): DailyReport | null {
    const db = loadDatabase();
    const r = db.reports.find((item) => item.id === id);
    if (!r) return null;

    const stock = db.stock.find((s) => s.report_id === r.id) || {
      id: 0,
      report_id: r.id,
      ayam_mentah: '',
      goreng_ayam: '',
      kulit_mentah: '',
      masak_kulit_ck: '',
      beras: '',
      masak_nasi: '',
      tosser_in: { ...DEFAULT_TOSSER },
      tosser_out: { ...DEFAULT_TOSSER },
      goreng_ayam_pb: '',
      goreng_ayam_pk: '',
      goreng_kulit: '',
      goreng_kulit_ck: '',
      nasi: '',
      s_chili_oil: '',
      s_geprek: '',
    };
    const remaining_stock = db.remaining_stock.find((rs) => rs.report_id === r.id) || {
      ayam_mentah: '',
      ayam_mentah_keterangan: '',
      goreng_ayam: '',
      kulit_mentah: '',
      beras: '',
      masak_nasi: '',
      goreng_ayam_pb: '',
      goreng_ayam_pk: '',
      goreng_kulit: '',
      goreng_kulit_ck: '',
      nasi: '',
      s_chili_oil: '',
      s_geprek: '',
    };
    const sales = db.sales.filter((s) => s.report_id === r.id);
    const expenses = db.expenses.find((e) => e.report_id === r.id) || {
      gas: 0,
      galon: 0,
      clean_tools: 0,
      kulit: 0,
      meal: 0,
      bonus: 0,
      lain_lain: 0,
      lain_lain_keterangan: '',
      total_expense: 0,
    };
    const payments = db.payments.find((p) => p.report_id === r.id) || {
      tunai: 0,
      qr: 0,
      tf: 0,
      total_payment: 0,
    };

    return {
      ...r,
      staff_name: r.staff_name || '',
      stock: {
        ayam_mentah: stock.ayam_mentah || '',
        goreng_ayam: stock.goreng_ayam || '',
        masak_ayam_pb: stock.masak_ayam_pb || '',
        masak_ayam_pk: stock.masak_ayam_pk || '',
        kulit_mentah: stock.kulit_mentah || '',
        masak_kulit_ck: stock.masak_kulit_ck || '',
        beras: stock.beras || '',
        masak_nasi: stock.masak_nasi || '',
        tosser_in: stock.tosser_in || { ...DEFAULT_TOSSER },
        tosser_out: stock.tosser_out || { ...DEFAULT_TOSSER },
        goreng_ayam_pb: stock.goreng_ayam_pb || '',
        goreng_ayam_pk: stock.goreng_ayam_pk || '',
        goreng_kulit: stock.goreng_kulit || '',
        goreng_kulit_ck: stock.goreng_kulit_ck || '',
        nasi: stock.nasi || '',
        s_chili_oil: stock.s_chili_oil || '',
        s_geprek: stock.s_geprek || '',
      },
      remaining_stock: {
        ayam_mentah: remaining_stock.ayam_mentah || '',
        ayam_mentah_keterangan: remaining_stock.ayam_mentah_keterangan || '',
        goreng_ayam: remaining_stock.goreng_ayam || '',
        kulit_mentah: remaining_stock.kulit_mentah || '',
        beras: remaining_stock.beras || '',
        masak_nasi: remaining_stock.masak_nasi || '',
        goreng_ayam_pb: remaining_stock.goreng_ayam_pb || '',
        goreng_ayam_pk: remaining_stock.goreng_ayam_pk || '',
        goreng_kulit: remaining_stock.goreng_kulit || '',
        goreng_kulit_ck: remaining_stock.goreng_kulit_ck || '',
        nasi: remaining_stock.nasi || '',
        s_chili_oil: remaining_stock.s_chili_oil || '',
        s_geprek: remaining_stock.s_geprek || '',
      },
      sales,
      expenses,
      payments,
    };
  },

  createReport(data: ReportFormData): DailyReport {
    const db = loadDatabase();
    const newId = db.reports.length > 0 ? Math.max(...db.reports.map((r) => r.id)) + 1 : 1;

    // Validate calculations
    const totals = calculateTotals(data.sales, data.expenses, data.promo, data.payments);

    const reportRecord = {
      id: newId,
      report_date: data.report_date || new Date().toISOString().split('T')[0],
      outlet_name: data.outlet_name || 'Cisalak',
      staff_name: data.staff_name || '',
      total_income: totals.total_income,
      total_expense: totals.total_expense,
      promo: totals.promo,
      promo_note: data.promo_note || '',
      final_total: totals.final_total,
      is_balanced: totals.is_balanced,
      balance_difference: totals.balance_difference,
      total_loss: data.total_loss !== undefined ? data.total_loss : 0,
      loss_percentage: data.loss_percentage !== undefined ? data.loss_percentage : 0,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    };

    db.reports.push(reportRecord);

    // Save stock
    const stockId = db.stock.length > 0 ? Math.max(...db.stock.map((s) => s.id)) + 1 : 1;
    db.stock.push({
      id: stockId,
      report_id: newId,
      ayam_mentah: data.stock?.ayam_mentah || '',
      goreng_ayam: data.stock?.goreng_ayam || '',
      masak_ayam_pb: data.stock?.masak_ayam_pb || '',
      masak_ayam_pk: data.stock?.masak_ayam_pk || '',
      kulit_mentah: data.stock?.kulit_mentah || '',
      masak_kulit_ck: data.stock?.masak_kulit_ck || '',
      beras: data.stock?.beras || '',
      masak_nasi: data.stock?.masak_nasi || '',
      tosser_in: data.stock?.tosser_in || { ...DEFAULT_TOSSER },
      tosser_out: data.stock?.tosser_out || { ...DEFAULT_TOSSER },
      goreng_ayam_pb: data.stock?.goreng_ayam_pb || '',
      goreng_ayam_pk: data.stock?.goreng_ayam_pk || '',
      goreng_kulit: data.stock?.goreng_kulit || '',
      goreng_kulit_ck: data.stock?.goreng_kulit_ck || '',
      nasi: data.stock?.nasi || '',
      s_chili_oil: data.stock?.s_chili_oil || '',
      s_geprek: data.stock?.s_geprek || '',
    });

    // Save remaining_stock
    const remStockId = db.remaining_stock.length > 0 ? Math.max(...db.remaining_stock.map((s) => s.id)) + 1 : 1;
    db.remaining_stock.push({
      id: remStockId,
      report_id: newId,
      ayam_mentah: data.remaining_stock?.ayam_mentah || '',
      ayam_mentah_keterangan: data.remaining_stock?.ayam_mentah_keterangan || '',
      goreng_ayam: data.remaining_stock?.goreng_ayam || '',
      kulit_mentah: data.remaining_stock?.kulit_mentah || '',
      beras: data.remaining_stock?.beras || '',
      masak_nasi: data.remaining_stock?.masak_nasi || '',
      goreng_ayam_pb: data.remaining_stock?.goreng_ayam_pb || '',
      goreng_ayam_pk: data.remaining_stock?.goreng_ayam_pk || '',
      goreng_kulit: data.remaining_stock?.goreng_kulit || '',
      goreng_kulit_ck: data.remaining_stock?.goreng_kulit_ck || '',
      nasi: data.remaining_stock?.nasi || '',
      s_chili_oil: data.remaining_stock?.s_chili_oil || '',
      s_geprek: data.remaining_stock?.s_geprek || '',
    });

    // Save sales
    let saleCounter = db.sales.length > 0 ? Math.max(...db.sales.map((s) => s.id)) + 1 : 1;
    const validatedSales: SaleItem[] = (data.sales || []).map((item) => {
      const qty = Math.max(0, Number(item.quantity) || 0);
      const price = Math.max(0, Number(item.price) || 0);
      const subtotal = qty * price;
      const saleRow = {
        id: saleCounter++,
        report_id: newId,
        product_id: item.product_id,
        product_name: item.product_name,
        price,
        quantity: qty,
        subtotal,
      };
      db.sales.push(saleRow);
      return {
        product_id: item.product_id,
        product_name: item.product_name,
        price,
        quantity: qty,
        subtotal,
      };
    });

    // Save expenses
    const expId = db.expenses.length > 0 ? Math.max(...db.expenses.map((e) => e.id)) + 1 : 1;
    const expenseRow = {
      id: expId,
      report_id: newId,
      gas: Number(data.expenses?.gas) || 0,
      galon: Number(data.expenses?.galon) || 0,
      clean_tools: Number(data.expenses?.clean_tools) || 0,
      kulit: Number(data.expenses?.kulit) || 0,
      meal: Number(data.expenses?.meal) || 0,
      bonus: Number(data.expenses?.bonus) || 0,
      lain_lain: Number(data.expenses?.lain_lain) || 0,
      lain_lain_keterangan: data.expenses?.lain_lain_keterangan || '',
      total_expense: totals.total_expense,
      beras: Number(data.expenses?.beras) || 0,
      saus: Number(data.expenses?.saus) || 0,
      minyak: Number(data.expenses?.minyak) || 0,
    };
    db.expenses.push(expenseRow);

    // Save payments
    const payId = db.payments.length > 0 ? Math.max(...db.payments.map((p) => p.id)) + 1 : 1;
    const paymentRow = {
      id: payId,
      report_id: newId,
      tunai: Number(data.payments?.tunai) || 0,
      qr: Number(data.payments?.qr) || 0,
      tf: Number(data.payments?.tf) || 0,
      total_payment: totals.total_payment,
    };
    db.payments.push(paymentRow);

    saveDatabase(db);

    return this.getReportById(newId)!;
  },

  updateReport(id: number, data: ReportFormData): DailyReport | null {
    const db = loadDatabase();
    const index = db.reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const totals = calculateTotals(data.sales, data.expenses, data.promo, data.payments);

    db.reports[index] = {
      ...db.reports[index],
      report_date: data.report_date,
      outlet_name: data.outlet_name,
      staff_name: data.staff_name || '',
      total_income: totals.total_income,
      total_expense: totals.total_expense,
      promo: totals.promo,
      promo_note: data.promo_note || '',
      final_total: totals.final_total,
      is_balanced: totals.is_balanced,
      balance_difference: totals.balance_difference,
      total_loss: data.total_loss !== undefined ? data.total_loss : db.reports[index].total_loss,
      loss_percentage: data.loss_percentage !== undefined ? data.loss_percentage : db.reports[index].loss_percentage,
      notes: data.notes || '',
      updated_at: new Date().toISOString(),
    };

    // Replace stock
    db.stock = db.stock.filter((s) => s.report_id !== id);
    const stockId = db.stock.length > 0 ? Math.max(...db.stock.map((s) => s.id)) + 1 : 1;
    db.stock.push({
      id: stockId,
      report_id: id,
      ayam_mentah: data.stock?.ayam_mentah || '',
      goreng_ayam: data.stock?.goreng_ayam || '',
      masak_ayam_pb: data.stock?.masak_ayam_pb || '',
      masak_ayam_pk: data.stock?.masak_ayam_pk || '',
      kulit_mentah: data.stock?.kulit_mentah || '',
      masak_kulit_ck: data.stock?.masak_kulit_ck || '',
      beras: data.stock?.beras || '',
      masak_nasi: data.stock?.masak_nasi || '',
      tosser_in: data.stock?.tosser_in || { ...DEFAULT_TOSSER },
      tosser_out: data.stock?.tosser_out || { ...DEFAULT_TOSSER },
      goreng_ayam_pb: data.stock?.goreng_ayam_pb || '',
      goreng_ayam_pk: data.stock?.goreng_ayam_pk || '',
      goreng_kulit: data.stock?.goreng_kulit || '',
      goreng_kulit_ck: data.stock?.goreng_kulit_ck || '',
      nasi: data.stock?.nasi || '',
      s_chili_oil: data.stock?.s_chili_oil || '',
      s_geprek: data.stock?.s_geprek || '',
    });

    // Replace remaining_stock
    db.remaining_stock = db.remaining_stock.filter((rs) => rs.report_id !== id);
    const remStockId = db.remaining_stock.length > 0 ? Math.max(...db.remaining_stock.map((s) => s.id)) + 1 : 1;
    db.remaining_stock.push({
      id: remStockId,
      report_id: id,
      ayam_mentah: data.remaining_stock?.ayam_mentah || '',
      ayam_mentah_keterangan: data.remaining_stock?.ayam_mentah_keterangan || '',
      goreng_ayam: data.remaining_stock?.goreng_ayam || '',
      kulit_mentah: data.remaining_stock?.kulit_mentah || '',
      beras: data.remaining_stock?.beras || '',
      masak_nasi: data.remaining_stock?.masak_nasi || '',
      goreng_ayam_pb: data.remaining_stock?.goreng_ayam_pb || '',
      goreng_ayam_pk: data.remaining_stock?.goreng_ayam_pk || '',
      goreng_kulit: data.remaining_stock?.goreng_kulit || '',
      goreng_kulit_ck: data.remaining_stock?.goreng_kulit_ck || '',
      nasi: data.remaining_stock?.nasi || '',
      s_chili_oil: data.remaining_stock?.s_chili_oil || '',
      s_geprek: data.remaining_stock?.s_geprek || '',
    });

    // Replace sales
    db.sales = db.sales.filter((s) => s.report_id !== id);
    let saleCounter = db.sales.length > 0 ? Math.max(...db.sales.map((s) => s.id)) + 1 : 1;
    (data.sales || []).forEach((item) => {
      const qty = Math.max(0, Number(item.quantity) || 0);
      const price = Math.max(0, Number(item.price) || 0);
      db.sales.push({
        id: saleCounter++,
        report_id: id,
        product_id: item.product_id,
        product_name: item.product_name,
        price,
        quantity: qty,
        subtotal: qty * price,
      });
    });

    // Replace expenses
    db.expenses = db.expenses.filter((e) => e.report_id !== id);
    const expId = db.expenses.length > 0 ? Math.max(...db.expenses.map((e) => e.id)) + 1 : 1;
    db.expenses.push({
      id: expId,
      report_id: id,
      gas: Number(data.expenses?.gas) || 0,
      galon: Number(data.expenses?.galon) || 0,
      clean_tools: Number(data.expenses?.clean_tools) || 0,
      kulit: Number(data.expenses?.kulit) || 0,
      meal: Number(data.expenses?.meal) || 0,
      bonus: Number(data.expenses?.bonus) || 0,
      lain_lain: Number(data.expenses?.lain_lain) || 0,
      lain_lain_keterangan: data.expenses?.lain_lain_keterangan || '',
      total_expense: totals.total_expense,
      beras: Number(data.expenses?.beras) || 0,
      saus: Number(data.expenses?.saus) || 0,
      minyak: Number(data.expenses?.minyak) || 0,
    });

    // Replace payments
    db.payments = db.payments.filter((p) => p.report_id !== id);
    const payId = db.payments.length > 0 ? Math.max(...db.payments.map((p) => p.id)) + 1 : 1;
    db.payments.push({
      id: payId,
      report_id: id,
      tunai: Number(data.payments?.tunai) || 0,
      qr: Number(data.payments?.qr) || 0,
      tf: Number(data.payments?.tf) || 0,
      total_payment: totals.total_payment,
    });

    saveDatabase(db);
    return this.getReportById(id);
  },

  deleteReport(id: number): boolean {
    const db = loadDatabase();
    const initLen = db.reports.length;
    db.reports = db.reports.filter((r) => r.id !== id);
    if (db.reports.length === initLen) return false;

    db.stock = db.stock.filter((s) => s.report_id !== id);
    db.remaining_stock = db.remaining_stock.filter((rs) => rs.report_id !== id);
    db.sales = db.sales.filter((s) => s.report_id !== id);
    db.expenses = db.expenses.filter((e) => e.report_id !== id);
    db.payments = db.payments.filter((p) => p.report_id !== id);

    saveDatabase(db);
    return true;
  },

  // Settings & PIN
  getSettings(): AdminSettings {
    const db = loadDatabase();
    return {
      admin_pin: db.settings?.admin_pin || DEFAULT_SETTINGS.admin_pin,
      conversion: db.settings?.conversion || DEFAULT_CHICKEN_CONVERSION,
    };
  },

  updateConversionConfig(cfg: Partial<ChickenConversionConfig>): ChickenConversionConfig {
    const db = loadDatabase();
    const current = db.settings?.conversion || DEFAULT_CHICKEN_CONVERSION;
    const pbRatio = Number(cfg.pb_ratio);
    const pkRatio = Number(cfg.pk_ratio);
    const pbWeight = Number(cfg.pb_kg_weight);
    const pkWeight = Number(cfg.pk_kg_weight);
    const riceRatio = Number(cfg.masak_nasi_ratio);

    const updated: ChickenConversionConfig = {
      pb_ratio: !isNaN(pbRatio) && pbRatio > 0 ? pbRatio : current.pb_ratio,
      pk_ratio: !isNaN(pkRatio) && pkRatio > 0 ? pkRatio : current.pk_ratio,
      pb_kg_weight: !isNaN(pbWeight) && pbWeight > 0 ? pbWeight : current.pb_kg_weight,
      pk_kg_weight: !isNaN(pkWeight) && pkWeight > 0 ? pkWeight : current.pk_kg_weight,
      masak_nasi_ratio: !isNaN(riceRatio) && riceRatio > 0 ? riceRatio : (current.masak_nasi_ratio ?? 12),
    };
    db.settings = { ...(db.settings || DEFAULT_SETTINGS), conversion: updated };
    saveDatabase(db);
    return updated;
  },

  updateAdminPin(newPin: string): { success: boolean; pin: string } {
    const db = loadDatabase();
    const cleanPin = String(newPin).trim();
    if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      throw new Error('PIN harus berupa 4 digit angka');
    }
    db.settings = { ...(db.settings || DEFAULT_SETTINGS), admin_pin: cleanPin };
    saveDatabase(db);
    return { success: true, pin: cleanPin };
  },

  // Outlets CRUD
  getOutlets(): OutletItem[] {
    const db = loadDatabase();
    return db.outlets || [...DEFAULT_OUTLETS];
  },

  createOutlet(data: Partial<OutletItem>): OutletItem {
    const db = loadDatabase();
    const outlets = db.outlets || [...DEFAULT_OUTLETS];
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama outlet wajib diisi');
    const newId = outlets.length > 0 ? Math.max(...outlets.map((o) => o.id)) + 1 : 1;
    const newOutlet: OutletItem = {
      id: newId,
      name,
      address: data.address || '',
      phone: data.phone || '',
      active: data.active !== undefined ? Boolean(data.active) : true,
      outlet_type: data.outlet_type === 'modern' ? 'modern' : 'traditional',
    };
    outlets.push(newOutlet);
    db.outlets = outlets;
    saveDatabase(db);
    return newOutlet;
  },

  updateOutlet(id: number, data: Partial<OutletItem>): OutletItem | null {
    const db = loadDatabase();
    const outlets = db.outlets || [...DEFAULT_OUTLETS];
    const index = outlets.findIndex((o) => o.id === id);
    if (index === -1) return null;
    const existing = outlets[index];
    outlets[index] = {
      ...existing,
      name: data.name !== undefined ? String(data.name).trim() : existing.name,
      address: data.address !== undefined ? data.address : existing.address,
      phone: data.phone !== undefined ? data.phone : existing.phone,
      active: data.active !== undefined ? Boolean(data.active) : existing.active,
      outlet_type: data.outlet_type !== undefined ? data.outlet_type : (existing.outlet_type || 'traditional'),
    };
    db.outlets = outlets;
    saveDatabase(db);
    return outlets[index];
  },

  deleteOutlet(id: number): boolean {
    const db = loadDatabase();
    const outlets = db.outlets || [...DEFAULT_OUTLETS];
    const initLen = outlets.length;
    db.outlets = outlets.filter((o) => o.id !== id);
    if (db.outlets.length === initLen) return false;
    saveDatabase(db);
    return true;
  },

  // Products CRUD
  createProduct(data: Partial<Product>): Product {
    const db = loadDatabase();
    const products = db.products || [...DEFAULT_PRODUCTS];
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama produk wajib diisi');
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct: Product = {
      id: newId,
      name,
      selling_price: Math.max(0, Number(data.selling_price) || 0),
      active: data.active !== undefined ? Boolean(data.active) : true,
      outlet_type: data.outlet_type || 'traditional',
      description: data.description || '',
      items_composition: data.items_composition,
      barang_id: data.barang_id ? Number(data.barang_id) : undefined,
    };
    products.push(newProduct);
    db.products = products;
    saveDatabase(db);
    return newProduct;
  },

  updateProduct(id: number, data: Partial<Product>): Product | null {
    const db = loadDatabase();
    const products = db.products || [...DEFAULT_PRODUCTS];
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const existing = products[index];
    products[index] = {
      ...existing,
      name: data.name !== undefined ? String(data.name).trim() : existing.name,
      selling_price: data.selling_price !== undefined ? Math.max(0, Number(data.selling_price) || 0) : existing.selling_price,
      active: data.active !== undefined ? Boolean(data.active) : existing.active,
      outlet_type: data.outlet_type !== undefined ? data.outlet_type : existing.outlet_type,
      description: data.description !== undefined ? data.description : existing.description,
      items_composition: data.items_composition !== undefined ? data.items_composition : existing.items_composition,
      barang_id: data.barang_id !== undefined ? (data.barang_id ? Number(data.barang_id) : undefined) : existing.barang_id,
    };
    db.products = products;
    saveDatabase(db);
    return products[index];
  },

  deleteProduct(id: number): boolean {
    const db = loadDatabase();
    const products = db.products || [...DEFAULT_PRODUCTS];
    const initLen = products.length;
    db.products = products.filter((p) => p.id !== id);
    if (db.products.length === initLen) return false;
    saveDatabase(db);
    return true;
  },

  // Master Barang CRUD
  getMasterBarang(): MasterBarangItem[] {
    const db = loadDatabase();
    return db.master_barang || [...DEFAULT_MASTER_BARANG];
  },

  createMasterBarang(data: Partial<MasterBarangItem>): MasterBarangItem {
    const db = loadDatabase();
    const items = db.master_barang || [...DEFAULT_MASTER_BARANG];
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama barang wajib diisi');
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: MasterBarangItem = {
      id: newId,
      code: data.code || `BRG-${newId}`,
      name,
      category: data.category || 'ready',
      unit: data.unit || 'pcs',
      description: data.description || '',
      active: data.active !== undefined ? Boolean(data.active) : true,
    };
    items.push(newItem);
    db.master_barang = items;
    saveDatabase(db);
    return newItem;
  },

  updateMasterBarang(id: number, data: Partial<MasterBarangItem>): MasterBarangItem | null {
    const db = loadDatabase();
    const items = db.master_barang || [...DEFAULT_MASTER_BARANG];
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const existing = items[index];
    items[index] = {
      ...existing,
      code: data.code !== undefined ? String(data.code).trim() : existing.code,
      name: data.name !== undefined ? String(data.name).trim() : existing.name,
      category: data.category !== undefined ? data.category : existing.category,
      unit: data.unit !== undefined ? String(data.unit).trim() : existing.unit,
      description: data.description !== undefined ? String(data.description).trim() : existing.description,
      active: data.active !== undefined ? Boolean(data.active) : existing.active,
    };
    db.master_barang = items;
    saveDatabase(db);
    return items[index];
  },

  deleteMasterBarang(id: number): boolean {
    const db = loadDatabase();
    const items = db.master_barang || [...DEFAULT_MASTER_BARANG];
    const initLen = items.length;
    db.master_barang = items.filter((i) => i.id !== id);
    if (db.master_barang.length === initLen) return false;
    saveDatabase(db);
    return true;
  },

  // Beginning Stock Items CRUD
  getStockItems(): StockMasterItem[] {
    const db = loadDatabase();
    const items = db.stock_items || [...DEFAULT_STOCK_ITEMS];
    return items.map((item) => {
      if (item.barang_id) return item;
      const def = DEFAULT_STOCK_ITEMS.find((d) => d.key === item.key || d.name.toLowerCase() === item.name.toLowerCase());
      return def?.barang_id ? { ...item, barang_id: def.barang_id } : item;
    });
  },

  createStockItem(data: Partial<StockMasterItem>): StockMasterItem {
    const db = loadDatabase();
    const items = db.stock_items || [...DEFAULT_STOCK_ITEMS];
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama item stok awal wajib diisi');
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: StockMasterItem = {
      id: newId,
      key: data.key || name.toLowerCase().replace(/\s+/g, '_'),
      name,
      category: data.category === 'ready' ? 'ready' : 'raw',
      unit: data.unit || 'pcs',
      default_value: data.default_value || '',
      active: data.active !== undefined ? Boolean(data.active) : true,
      barang_id: data.barang_id ? Number(data.barang_id) : undefined,
    };
    items.push(newItem);
    db.stock_items = items;
    saveDatabase(db);
    return newItem;
  },

  updateStockItem(id: number, data: Partial<StockMasterItem>): StockMasterItem | null {
    const db = loadDatabase();
    const items = db.stock_items || [...DEFAULT_STOCK_ITEMS];
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const existing = items[index];
    items[index] = {
      ...existing,
      name: data.name !== undefined ? String(data.name).trim() : existing.name,
      category: data.category !== undefined ? (data.category === 'ready' ? 'ready' : 'raw') : existing.category,
      unit: data.unit !== undefined ? String(data.unit).trim() : existing.unit,
      default_value: data.default_value !== undefined ? String(data.default_value).trim() : existing.default_value,
      active: data.active !== undefined ? Boolean(data.active) : existing.active,
      barang_id: data.barang_id !== undefined ? (data.barang_id ? Number(data.barang_id) : undefined) : existing.barang_id,
    };
    db.stock_items = items;
    saveDatabase(db);
    return items[index];
  },

  deleteStockItem(id: number): boolean {
    const db = loadDatabase();
    const items = db.stock_items || [...DEFAULT_STOCK_ITEMS];
    const initLen = items.length;
    db.stock_items = items.filter((i) => i.id !== id);
    if (db.stock_items.length === initLen) return false;
    saveDatabase(db);
    return true;
  },

  // Tosser Items CRUD (In / Out)
  getTosserItems(): TosserMasterItem[] {
    const db = loadDatabase();
    const items = db.tosser_items || [...DEFAULT_TOSSER_ITEMS];
    return items.map((item) => {
      if (item.barang_id) return item;
      const def = DEFAULT_TOSSER_ITEMS.find((d) => d.key === item.key || d.name.toLowerCase() === item.name.toLowerCase());
      return def?.barang_id ? { ...item, barang_id: def.barang_id } : item;
    });
  },

  createTosserItem(data: Partial<TosserMasterItem>): TosserMasterItem {
    const db = loadDatabase();
    const items = db.tosser_items || [...DEFAULT_TOSSER_ITEMS];
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama item tosser wajib diisi');
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: TosserMasterItem = {
      id: newId,
      key: data.key || name.toLowerCase().replace(/\s+/g, '_'),
      name,
      type: data.type === 'in' ? 'in' : data.type === 'out' ? 'out' : 'both',
      unit: data.unit || 'pcs',
      active: data.active !== undefined ? Boolean(data.active) : true,
      barang_id: data.barang_id ? Number(data.barang_id) : undefined,
    };
    items.push(newItem);
    db.tosser_items = items;
    saveDatabase(db);
    return newItem;
  },

  updateTosserItem(id: number, data: Partial<TosserMasterItem>): TosserMasterItem | null {
    const db = loadDatabase();
    const items = db.tosser_items || [...DEFAULT_TOSSER_ITEMS];
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const existing = items[index];
    items[index] = {
      ...existing,
      name: data.name !== undefined ? String(data.name).trim() : existing.name,
      type: data.type !== undefined ? data.type : existing.type,
      unit: data.unit !== undefined ? String(data.unit).trim() : existing.unit,
      active: data.active !== undefined ? Boolean(data.active) : existing.active,
      barang_id: data.barang_id !== undefined ? (data.barang_id ? Number(data.barang_id) : undefined) : existing.barang_id,
    };
    db.tosser_items = items;
    saveDatabase(db);
    return items[index];
  },

  deleteTosserItem(id: number): boolean {
    const db = loadDatabase();
    const items = db.tosser_items || [...DEFAULT_TOSSER_ITEMS];
    const initLen = items.length;
    db.tosser_items = items.filter((i) => i.id !== id);
    if (db.tosser_items.length === initLen) return false;
    saveDatabase(db);
    return true;
  },

  // Expense Categories CRUD
  getExpenseCategories(): ExpenseCategoryItem[] {
    const db = loadDatabase();
    const raw = db.expense_categories || [...DEFAULT_EXPENSE_CATEGORIES];
    return raw.map((c, idx) => ({
      ...c,
      key: c.key || c.name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_') || `exp_${c.id || idx + 1}`,
    }));
  },

  createExpenseCategory(data: Partial<ExpenseCategoryItem>): ExpenseCategoryItem {
    const db = loadDatabase();
    const categories = db.expense_categories || [...DEFAULT_EXPENSE_CATEGORIES];
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama pengeluaran wajib diisi');
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const newCat: ExpenseCategoryItem = {
      id: newId,
      key: data.key || name.toLowerCase().replace(/\s+/g, '_'),
      name,
      default_amount: Math.max(0, Number(data.default_amount) || 0),
      description: data.description || '',
      active: data.active !== undefined ? Boolean(data.active) : true,
    };
    categories.push(newCat);
    db.expense_categories = categories;
    saveDatabase(db);
    return newCat;
  },

  updateExpenseCategory(id: number, data: Partial<ExpenseCategoryItem>): ExpenseCategoryItem | null {
    const db = loadDatabase();
    const categories = db.expense_categories || [...DEFAULT_EXPENSE_CATEGORIES];
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const existing = categories[index];
    categories[index] = {
      ...existing,
      name: data.name !== undefined ? String(data.name).trim() : existing.name,
      default_amount: data.default_amount !== undefined ? Math.max(0, Number(data.default_amount) || 0) : existing.default_amount,
      description: data.description !== undefined ? data.description : existing.description,
      active: data.active !== undefined ? Boolean(data.active) : existing.active,
    };
    db.expense_categories = categories;
    saveDatabase(db);
    return categories[index];
  },

  deleteExpenseCategory(id: number): boolean {
    const db = loadDatabase();
    const categories = db.expense_categories || [...DEFAULT_EXPENSE_CATEGORIES];
    const initLen = categories.length;
    db.expense_categories = categories.filter((c) => c.id !== id);
    if (db.expense_categories.length === initLen) return false;
    saveDatabase(db);
    return true;
  },

  // Ending Stock Items CRUD
  getEndingStockItems(): EndingStockMasterItem[] {
    const db = loadDatabase();
    return db.ending_stock_items || [...DEFAULT_ENDING_STOCK_ITEMS];
  },

  createEndingStockItem(data: Partial<EndingStockMasterItem>): EndingStockMasterItem {
    const db = loadDatabase();
    const items = db.ending_stock_items || [...DEFAULT_ENDING_STOCK_ITEMS];
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama item sisa stok wajib diisi');
    const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: EndingStockMasterItem = {
      id: newId,
      key: data.key || name.toLowerCase().replace(/\s+/g, '_'),
      name,
      unit: data.unit || 'pcs',
      tolerance_note: data.tolerance_note || '',
      active: data.active !== undefined ? Boolean(data.active) : true,
    };
    items.push(newItem);
    db.ending_stock_items = items;
    saveDatabase(db);
    return newItem;
  },

  updateEndingStockItem(id: number, data: Partial<EndingStockMasterItem>): EndingStockMasterItem | null {
    const db = loadDatabase();
    const items = db.ending_stock_items || [...DEFAULT_ENDING_STOCK_ITEMS];
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    const existing = items[index];
    items[index] = {
      ...existing,
      name: data.name !== undefined ? String(data.name).trim() : existing.name,
      unit: data.unit !== undefined ? String(data.unit).trim() : existing.unit,
      tolerance_note: data.tolerance_note !== undefined ? String(data.tolerance_note).trim() : existing.tolerance_note,
      active: data.active !== undefined ? Boolean(data.active) : existing.active,
    };
    db.ending_stock_items = items;
    saveDatabase(db);
    return items[index];
  },

  deleteEndingStockItem(id: number): boolean {
    const db = loadDatabase();
    const items = db.ending_stock_items || [...DEFAULT_ENDING_STOCK_ITEMS];
    const initLen = items.length;
    db.ending_stock_items = items.filter((i) => i.id !== id);
    if (db.ending_stock_items.length === initLen) return false;
    saveDatabase(db);
    return true;
  },
};
