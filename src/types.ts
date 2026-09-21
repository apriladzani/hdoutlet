export interface TosserData {
  goreng_ayam_pb: string;
  goreng_ayam_pk: string;
  goreng_kulit: string;
  goreng_kulit_ck?: string;
  nasi: string;
  s_chili_oil: string;
  s_geprek: string;
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
}

export interface Product {
  id: number;
  name: string;
  selling_price: number;
  active: boolean;
  outlet_type?: 'traditional' | 'modern' | 'all';
  description?: string;
  items_composition?: {
    pb?: number;
    pk?: number;
    nasi?: number;
    kulit?: number;
    kulit_ck?: number;
  };
}

export interface SaleItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  description?: string;
  items_composition?: {
    pb?: number;
    pk?: number;
    nasi?: number;
    kulit?: number;
    kulit_ck?: number;
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
  { id: 1, name: 'Ayam PB', selling_price: 9000, active: true, outlet_type: 'traditional', description: '1 pcs Dada / Paha Atas', items_composition: { pb: 1 } },
  { id: 2, name: 'Ayam PK', selling_price: 7000, active: true, outlet_type: 'traditional', description: '1 pcs Sayap / Paha Bawah', items_composition: { pk: 1 } },
  { id: 3, name: 'Kulit', selling_price: 5000, active: true, outlet_type: 'traditional', description: '1 porsi Kulit Crispy', items_composition: { kulit: 1 } },
  { id: 7, name: 'Kulit CK', selling_price: 5000, active: true, outlet_type: 'traditional', description: '1 porsi Kulit CK', items_composition: { kulit_ck: 1 } },
  { id: 4, name: 'Nasi', selling_price: 3000, active: true, outlet_type: 'traditional', description: '1 porsi Nasi Hangat', items_composition: { nasi: 1 } },
  { id: 5, name: 'Chili Oil', selling_price: 1000, active: true, outlet_type: 'traditional', description: '1 cup Sambal Chili Oil' },
  { id: 6, name: 'Geprek', selling_price: 2000, active: true, outlet_type: 'traditional', description: '1 cup Sambal Geprek' },

  // Modern Outlet Menu
  { id: 101, name: 'Hemat 1', selling_price: 20000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', items_composition: { pk: 1, nasi: 1 } },
  { id: 102, name: 'Hemat 2', selling_price: 23000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', items_composition: { pb: 1, nasi: 1 } },
  { id: 103, name: 'Double', selling_price: 30000, active: true, outlet_type: 'modern', description: '1 pk + 1 pb + 1 nasi', items_composition: { pk: 1, pb: 1, nasi: 1 } },
  { id: 104, name: 'Family', selling_price: 100000, active: true, outlet_type: 'modern', description: '3 pb + 2 pk + 5 nasi', items_composition: { pb: 3, pk: 2, nasi: 5 } },
  { id: 105, name: 'Paket Ori 1', selling_price: 20000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', items_composition: { pk: 1, nasi: 1 } },
  { id: 106, name: 'Paket Ori 2', selling_price: 23000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', items_composition: { pb: 1, nasi: 1 } },
  { id: 107, name: 'Paket BB 1', selling_price: 22000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', items_composition: { pk: 1, nasi: 1 } },
  { id: 108, name: 'Paket BB 2', selling_price: 25000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', items_composition: { pb: 1, nasi: 1 } },
  { id: 109, name: 'Paket LH 1', selling_price: 22000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', items_composition: { pk: 1, nasi: 1 } },
  { id: 110, name: 'Paket LH 2', selling_price: 25000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', items_composition: { pb: 1, nasi: 1 } },
  { id: 111, name: 'Paket HJ 1', selling_price: 22000, active: true, outlet_type: 'modern', description: '1 pk + 1 nasi', items_composition: { pk: 1, nasi: 1 } },
  { id: 112, name: 'Paket HJ 2', selling_price: 25000, active: true, outlet_type: 'modern', description: '1 pb + 1 nasi', items_composition: { pb: 1, nasi: 1 } },

  // Modern Outlet Extra & Ala Carte
  { id: 113, name: 'Kulit Extra', selling_price: 5000, active: true, outlet_type: 'modern', description: '1 porsi Kulit Crispy', items_composition: { kulit: 1 } },
  { id: 117, name: 'Kulit CK', selling_price: 5000, active: true, outlet_type: 'modern', description: '1 porsi Kulit CK', items_composition: { kulit_ck: 1 } },
  { id: 114, name: 'Nasi Extra', selling_price: 3000, active: true, outlet_type: 'modern', description: '1 porsi Nasi Tambahan', items_composition: { nasi: 1 } },
  { id: 115, name: 'Chili Oil Extra', selling_price: 1000, active: true, outlet_type: 'modern', description: 'Saus Chili Oil' },
  { id: 116, name: 'Geprek Extra', selling_price: 2000, active: true, outlet_type: 'modern', description: 'Sambal Geprek' },
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

export interface StockMasterItem {
  id: number;
  key: string;
  name: string;
  category: 'raw' | 'ready';
  unit: string;
  default_value?: string;
  active: boolean;
}

export interface TosserMasterItem {
  id: number;
  key: string;
  name: string;
  type: 'in' | 'out' | 'both';
  unit: string;
  active: boolean;
}

export interface ExpenseCategoryItem {
  id: number;
  key: string;
  name: string;
  default_amount?: number;
  description?: string;
  active: boolean;
}

export interface EndingStockMasterItem {
  id: number;
  key: string;
  name: string;
  unit: string;
  tolerance_note?: string;
  active: boolean;
}

export interface AdminSettings {
  admin_pin: string;
}

