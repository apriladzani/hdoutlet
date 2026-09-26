export interface TosserData {
  goreng_ayam_pb: string;
  goreng_ayam_pk: string;
  goreng_kulit: string;
  goreng_kulit_ck?: string;
  nasi: string;
  s_chili_oil: string;
  s_geprek: string;
  [key: string]: any;
}

export interface StockData {
  ayam_mentah: string;
  ayam_mentah_keterangan?: string;
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
  [key: string]: any;
}

export interface ProductIngredient {
  barang_id: number;
  qty: number;
  name?: string;
  unit?: string;
}

export interface Product {
  id: number;
  name: string;
  selling_price: number;
  active: boolean;
  outlet_type?: 'traditional' | 'modern' | 'all';
  description?: string;
  barang_id?: number;
  ingredients?: ProductIngredient[];
  items_composition?: {
    pb?: number;
    pk?: number;
    nasi?: number;
    kulit?: number;
    kulit_ck?: number;
    [key: string]: number | undefined;
  };
}

export interface SaleItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  description?: string;
  barang_id?: number;
  ingredients?: ProductIngredient[];
  items_composition?: {
    pb?: number;
    pk?: number;
    nasi?: number;
    kulit?: number;
    kulit_ck?: number;
    [key: string]: number | undefined;
  };
}

export interface ExpenseData {
  gas: number;
  galon: number;
  clean_tools?: number;
  kulit?: number;
  meal: number;
  bonus: number;
  lain_lain: number;
  lain_lain_keterangan?: string;
  total_expense?: number;
  beras?: number;
  saus?: number;
  minyak?: number;
  [key: string]: any;
}

export interface PaymentData {
  tunai: number;
  qr: number;
  tf: number;
  total_payment?: number;
}

export interface DailyReport {
  id: number;
  report_date: string;
  outlet_name: string;
  staff_name?: string;
  total_income: number;
  total_expense: number;
  promo: number;
  promo_note?: string;
  final_total: number;
  total_loss?: number;
  loss_percentage?: number;
  is_balanced: boolean;
  balance_difference: number;
  notes: string;
  stock: StockData;
  remaining_stock: StockData;
  sales: SaleItem[];
  expenses: ExpenseData;
  payments: PaymentData;
  created_at: string;
  updated_at?: string;
}

export interface ReportFormData {
  report_date: string;
  outlet_name: string;
  staff_name?: string;
  stock: StockData;
  remaining_stock: StockData;
  sales: SaleItem[];
  expenses: ExpenseData;
  promo: number;
  promo_note?: string;
  payments: PaymentData;
  total_loss?: number;
  loss_percentage?: number;
  notes: string;
}

export const DEFAULT_PRODUCTS: Product[] = [
  // Traditional Outlet Menu
  { id: 1, name: 'Ayam PB', selling_price: 9000, active: true, outlet_type: 'traditional', description: '1 pcs Dada / Paha Atas', barang_id: 1, ingredients: [{ barang_id: 1, qty: 1 }], items_composition: { pb: 1 } },
  { id: 2, name: 'Ayam PK', selling_price: 7000, active: true, outlet_type: 'traditional', description: '1 pcs Sayap / Paha Bawah', barang_id: 2, ingredients: [{ barang_id: 2, qty: 1 }], items_composition: { pk: 1 } },
  { id: 3, name: 'Kulit', selling_price: 5000, active: true, outlet_type: 'traditional', description: '1 porsi Kulit Crispy', barang_id: 4, ingredients: [{ barang_id: 4, qty: 1 }], items_composition: { kulit: 1 } },
  { id: 7, name: 'Kulit CK', selling_price: 5000, active: true, outlet_type: 'traditional', description: '1 porsi Kulit CK', barang_id: 5, ingredients: [{ barang_id: 5, qty: 1 }], items_composition: { kulit_ck: 1 } },
  { id: 4, name: 'Nasi', selling_price: 3000, active: true, outlet_type: 'traditional', description: '1 porsi Nasi Hangat', barang_id: 7, ingredients: [{ barang_id: 7, qty: 1 }], items_composition: { nasi: 1 } },
  { id: 5, name: 'Chili Oil', selling_price: 1000, active: true, outlet_type: 'traditional', description: '1 cup Sambal Chili Oil', barang_id: 9, ingredients: [{ barang_id: 9, qty: 1 }] },
  { id: 6, name: 'Geprek', selling_price: 2000, active: true, outlet_type: 'traditional', description: '1 cup Sambal Geprek', barang_id: 10, ingredients: [{ barang_id: 10, qty: 1 }] },

  // Modern Outlet Menu
  { id: 101, name: 'Hemat 1', selling_price: 20000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', barang_id: 2, ingredients: [{ barang_id: 2, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pk: 1, nasi: 1 } },
  { id: 102, name: 'Hemat 2', selling_price: 23000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', barang_id: 1, ingredients: [{ barang_id: 1, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pb: 1, nasi: 1 } },
  { id: 103, name: 'Double', selling_price: 30000, active: true, outlet_type: 'modern', description: '1 pk + 1 pb + 1 nasi', barang_id: 1, ingredients: [{ barang_id: 2, qty: 1 }, { barang_id: 1, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pk: 1, pb: 1, nasi: 1 } },
  { id: 104, name: 'Family', selling_price: 100000, active: true, outlet_type: 'modern', description: '3 pb + 2 pk + 5 nasi', barang_id: 1, ingredients: [{ barang_id: 1, qty: 3 }, { barang_id: 2, qty: 2 }, { barang_id: 7, qty: 5 }], items_composition: { pb: 3, pk: 2, nasi: 5 } },
  { id: 105, name: 'Paket Ori 1', selling_price: 20000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', barang_id: 2, ingredients: [{ barang_id: 2, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pk: 1, nasi: 1 } },
  { id: 106, name: 'Paket Ori 2', selling_price: 23000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', barang_id: 1, ingredients: [{ barang_id: 1, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pb: 1, nasi: 1 } },
  { id: 107, name: 'Paket BB 1', selling_price: 22000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', barang_id: 2, ingredients: [{ barang_id: 2, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pk: 1, nasi: 1 } },
  { id: 108, name: 'Paket BB 2', selling_price: 25000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', barang_id: 1, ingredients: [{ barang_id: 1, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pb: 1, nasi: 1 } },
  { id: 109, name: 'Paket LH 1', selling_price: 22000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', barang_id: 2, ingredients: [{ barang_id: 2, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pk: 1, nasi: 1 } },
  { id: 110, name: 'Paket LH 2', selling_price: 25000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', barang_id: 1, ingredients: [{ barang_id: 1, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pb: 1, nasi: 1 } },
  { id: 111, name: 'Paket HJ 1', selling_price: 22000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', barang_id: 2, ingredients: [{ barang_id: 2, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pk: 1, nasi: 1 } },
  { id: 112, name: 'Paket HJ 2', selling_price: 25000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', barang_id: 1, ingredients: [{ barang_id: 1, qty: 1 }, { barang_id: 7, qty: 1 }], items_composition: { pb: 1, nasi: 1 } },

  // Modern Outlet Extra & Ala Carte
  { id: 113, name: 'Mineral Water', selling_price: 5000, active: true, outlet_type: 'modern', description: 'Mineral Water', barang_id: 11, ingredients: [{ barang_id: 11, qty: 1 }] },
  { id: 117, name: 'Kulit CK', selling_price: 5000, active: true, outlet_type: 'modern', description: '1 porsi Kulit CK', barang_id: 5, ingredients: [{ barang_id: 5, qty: 1 }], items_composition: { kulit_ck: 1 } },
  { id: 114, name: 'Nasi Extra', selling_price: 3000, active: true, outlet_type: 'modern', description: '1 porsi Nasi Tambahan', barang_id: 7, ingredients: [{ barang_id: 7, qty: 1 }], items_composition: { nasi: 1 } },
  { id: 115, name: 'Chili Oil Extra', selling_price: 1000, active: true, outlet_type: 'modern', description: 'Saus Chili Oil', barang_id: 9, ingredients: [{ barang_id: 9, qty: 1 }] },
  { id: 116, name: 'Geprek Extra', selling_price: 2000, active: true, outlet_type: 'modern', description: 'Sambal Geprek', barang_id: 10, ingredients: [{ barang_id: 10, qty: 1 }] },
];

export const OUTLETS = [
  'Cisalak',
  'Cieunteung',
  'Cigeureung',
  'Ciburuyan',
  'Aboh',
  'BRP',
  'Indihiang',
  'Taman Sari',
  'Kawalu',
  'Bantar Malam',
];

export type AppTab = 'form' | 'history' | 'master';

export interface OutletItem {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
  outlet_type?: 'traditional' | 'modern';
}

export interface MasterBarangItem {
  id: number;
  code?: string;
  name: string;
  category: 'raw' | 'ready' | 'other';
  unit: string;
  description?: string;
  active: boolean;
}

export const DEFAULT_MASTER_BARANG: MasterBarangItem[] = [
  { id: 1, code: 'BRG-PB', name: 'Ayam PB (Paha Bawah / Sayap)', category: 'ready', unit: 'pcs', description: 'Potong Besar siap jual', active: true },
  { id: 2, code: 'BRG-PK', name: 'Ayam PK (Paha Atas / Dada)', category: 'ready', unit: 'pcs', description: 'Potong Kecil siap jual', active: true },
  { id: 3, code: 'BRG-AYAM-RAW', name: 'Ayam Mentah Utuh', category: 'raw', unit: 'kg', description: 'Bahan baku ayam mentah dapur', active: true },
  { id: 4, code: 'BRG-KULIT', name: 'Kulit Crispy', category: 'ready', unit: 'pcs', description: 'Kulit crispy goreng siap jual', active: true },
  { id: 5, code: 'BRG-KULIT-CK', name: 'Kulit CK', category: 'ready', unit: 'pcs', description: 'Kulit masak CK siap jual', active: true },
  { id: 6, code: 'BRG-KULIT-RAW', name: 'Kulit Mentah', category: 'raw', unit: 'kg', description: 'Bahan baku kulit mentah', active: true },
  { id: 7, code: 'BRG-NASI', name: 'Nasi Hangat', category: 'ready', unit: 'pcs', description: 'Porsi nasi siap jual', active: true },
  { id: 8, code: 'BRG-BERAS', name: 'Beras', category: 'raw', unit: 'kg', description: 'Bahan baku beras nyangu', active: true },
  { id: 9, code: 'BRG-CHILI', name: 'Sambal Chili Oil', category: 'ready', unit: 'pcs', description: 'Cup sambal chili oil', active: true },
  { id: 10, code: 'BRG-GEPREK', name: 'Sambal Geprek', category: 'ready', unit: 'pcs', description: 'Cup sambal geprek', active: true },
  { id: 11, code: 'BRG-MINERAL', name: 'Mineral Water', category: 'ready', unit: 'pcs', description: 'Air Mineral / Mineral Water', active: true },
];

export interface StockMasterItem {
  id: number;
  key: string;
  name: string;
  category: 'raw' | 'ready';
  unit: string;
  default_value?: string;
  active: boolean;
  barang_id?: number;
}

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
  { id: 14, key: 'mineral_water', name: 'Mineral Water', category: 'ready', unit: 'pcs', active: true, barang_id: 11 },
];

export interface TosserMasterItem {
  id: number;
  key: string;
  name: string;
  type: 'in' | 'out' | 'both';
  unit: string;
  active: boolean;
  barang_id?: number;
}

export const DEFAULT_TOSSER_ITEMS: TosserMasterItem[] = [
  { id: 1, key: 'goreng_ayam_pb', name: 'Goreng Ayam PB', type: 'both', unit: 'pcs', active: true, barang_id: 1 },
  { id: 2, key: 'goreng_ayam_pk', name: 'Goreng Ayam PK', type: 'both', unit: 'pcs', active: true, barang_id: 2 },
  { id: 3, key: 'goreng_kulit', name: 'Goreng Kulit', type: 'both', unit: 'pcs', active: true, barang_id: 4 },
  { id: 7, key: 'goreng_kulit_ck', name: 'Kulit CK', type: 'both', unit: 'pcs', active: true, barang_id: 5 },
  { id: 4, key: 'nasi', name: 'Nasi', type: 'both', unit: 'pcs', active: true, barang_id: 7 },
  { id: 5, key: 's_chili_oil', name: 'S. Chili Oil', type: 'both', unit: 'pcs', active: true, barang_id: 9 },
  { id: 6, key: 's_geprek', name: 'S. Geprek', type: 'both', unit: 'pcs', active: true, barang_id: 10 },
];

export interface ExpenseCategoryItem {
  id: number;
  key: string;
  name: string;
  default_amount?: number;
  description?: string;
  active: boolean;
}

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

export interface EndingStockMasterItem {
  id: number;
  key: string;
  name: string;
  unit: string;
  tolerance_note?: string;
  active: boolean;
  barang_id?: number;
}

export const DEFAULT_ENDING_STOCK_ITEMS: EndingStockMasterItem[] = [
  { id: 1, key: 'ayam_mentah', name: 'Ayam Mentah (Sisa)', unit: 'kg', tolerance_note: 'Maks 0.5 kg (masuk freezer)', active: true, barang_id: 3 },
  { id: 2, key: 'goreng_ayam_pb', name: 'Goreng Ayam PB', unit: 'pcs', tolerance_note: 'Maks 2 pcs batas wajar', active: true, barang_id: 1 },
  { id: 3, key: 'goreng_ayam_pk', name: 'Goreng Ayam PK', unit: 'pcs', tolerance_note: 'Maks 2 pcs batas wajar', active: true, barang_id: 2 },
  { id: 4, key: 'goreng_kulit', name: 'Goreng Kulit', unit: 'pcs', tolerance_note: 'Maks 3 pcs batas wajar', active: true, barang_id: 4 },
  { id: 10, key: 'goreng_kulit_ck', name: 'Kulit CK', unit: 'pcs', tolerance_note: 'Maks 3 pcs batas wajar', active: true, barang_id: 5 },
  { id: 5, key: 'nasi', name: 'Nasi Sisa', unit: 'pcs', tolerance_note: 'Maks 5 pcs', active: true, barang_id: 7 },
  { id: 6, key: 's_chili_oil', name: 'S. Chili Oil', unit: 'pcs', tolerance_note: 'Maks 3 pcs', active: true, barang_id: 9 },
  { id: 7, key: 's_geprek', name: 'S. Geprek', unit: 'pcs', tolerance_note: 'Maks 3 pcs', active: true, barang_id: 10 },
  { id: 8, key: 'kulit_mentah', name: 'Kulit Mentah', unit: 'kg', tolerance_note: 'Simpan di chiller/freezer', active: true, barang_id: 6 },
  { id: 9, key: 'beras', name: 'Beras Sisa', unit: 'kg', tolerance_note: 'Simpan tertutup', active: true, barang_id: 8 },
  { id: 11, key: 'mineral_water', name: 'Mineral Water', unit: 'pcs', tolerance_note: 'Sisa botol', active: true, barang_id: 11 },
];

export interface ChickenConversionConfig {
  pb_ratio: number; // pcs Goreng Ayam PB per olahan (default: 5)
  pk_ratio: number; // pcs Goreng Ayam PK per olahan (default: 4)
  pb_kg_weight: number; // kg ayam mentah per olahan PB (default: 0.5)
  pk_kg_weight: number; // kg ayam mentah per olahan PK (default: 0.5)
  masak_nasi_ratio?: number; // porsi nasi per 1 kg beras (default: 12)
}

export const DEFAULT_CHICKEN_CONVERSION: ChickenConversionConfig = {
  pb_ratio: 5,
  pk_ratio: 4,
  pb_kg_weight: 0.5,
  pk_kg_weight: 0.5,
  masak_nasi_ratio: 12,
};

export interface AdminSettings {
  admin_pin: string;
  conversion?: ChickenConversionConfig;
}

