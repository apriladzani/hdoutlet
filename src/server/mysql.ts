import mysql, { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import {
  AdminSettings,
  ChickenConversionConfig,
  DailyReport,
  DEFAULT_CHICKEN_CONVERSION,
  DEFAULT_MASTER_BARANG,
  DEFAULT_PRODUCTS,
  EndingStockMasterItem,
  ExpenseCategoryItem,
  ExpenseData,
  MasterBarangItem,
  OutletItem,
  OUTLETS,
  PaymentData,
  Product,
  ReportFormData,
  SaleItem,
  StockData,
  StockMasterItem,
  TosserData,
  TosserMasterItem,
} from '../types.ts';

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

export function calculateTotals(
  sales: SaleItem[] = [],
  expenses: { gas?: number; galon?: number; clean_tools?: number; kulit?: number; meal?: number; bonus?: number; lain_lain?: number; beras?: number; saus?: number; minyak?: number } = {},
  promo: number = 0,
  payments: { tunai?: number; qr?: number; tf?: number } = {}
) {
  const safeSales = Array.isArray(sales) ? sales : [];
  const safeExpenses = expenses || {};
  const safePayments = payments || {};

  const total_income = safeSales.reduce((acc, item) => {
    const qty = Math.max(0, Number(item?.quantity) || 0);
    const price = Math.max(0, Number(item?.price) || 0);
    return acc + qty * price;
  }, 0);

  const total_expense = Object.entries(safeExpenses).reduce((acc, [k, v]) => {
    if (k === 'total_expense' || k === 'lain_lain_keterangan') return acc;
    const num = Number(v);
    return isNaN(num) ? acc : acc + Math.max(0, num);
  }, 0);

  const validPromo = Math.max(0, Number(promo) || 0);
  const final_total = total_income - (total_expense + validPromo);

  const tunai = Math.max(0, Number(safePayments.tunai) || 0);
  const qr = Math.max(0, Number(safePayments.qr) || 0);
  const tf = Math.max(0, Number(safePayments.tf) || 0);
  const total_payment = tunai + qr + tf;

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

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const host = process.env.DB_HOST || '127.0.0.1';
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'hd_fried_chicken';

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      dateStrings: true,
    });
  }
  return pool;
}

function toMySqlTimestamp(isoStr?: string): string {
  if (!isoStr) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

export async function initDatabase(): Promise<void> {
  const p = getPool();

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`settings\` (
      \`setting_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`admin_pin\` VARCHAR(20) NOT NULL DEFAULT '0825',
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`setting_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`app_master_configs\` (
      \`config_key\` VARCHAR(50) NOT NULL,
      \`config_value\` JSON NOT NULL,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`config_key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`outlets\` (
      \`outlet_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`outlet_name\` VARCHAR(100) NOT NULL,
      \`address\` VARCHAR(255) NULL,
      \`phone\` VARCHAR(20) NULL,
      \`outlet_type\` VARCHAR(20) NOT NULL DEFAULT 'traditional',
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`outlet_id\`),
      UNIQUE KEY \`uq_outlet_name\` (\`outlet_name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try {
    await p.query(`ALTER TABLE \`outlets\` ADD COLUMN \`outlet_type\` VARCHAR(20) NOT NULL DEFAULT 'traditional'`);
  } catch { }

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`products\` (
      \`product_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`product_name\` VARCHAR(100) NOT NULL,
      \`selling_price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`cost_price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`unit\` VARCHAR(20) NOT NULL DEFAULT 'pcs',
      \`outlet_type\` VARCHAR(20) NOT NULL DEFAULT 'all',
      \`description\` VARCHAR(255) NULL,
      \`items_composition\` JSON NULL,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`product_id\`),
      UNIQUE KEY \`uq_product_name\` (\`product_name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try {
    await p.query(`ALTER TABLE \`products\` ADD COLUMN \`outlet_type\` VARCHAR(20) NOT NULL DEFAULT 'all'`);
  } catch { }
  try {
    await p.query(`ALTER TABLE \`products\` ADD COLUMN \`description\` VARCHAR(255) NULL`);
  } catch { }
  try {
    await p.query(`ALTER TABLE \`products\` ADD COLUMN \`items_composition\` JSON NULL`);
  } catch { }
  try {
    await p.query(`ALTER TABLE \`products\` ADD COLUMN \`barang_id\` INT UNSIGNED NULL`);
  } catch { }

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`reports\` (
      \`report_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`report_date\` DATE NOT NULL,
      \`outlet_id\` INT UNSIGNED NULL,
      \`outlet_name\` VARCHAR(100) NOT NULL,
      \`staff_name\` VARCHAR(100) NOT NULL DEFAULT '',
      \`total_income\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`total_expense\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`promo\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`promo_note\` VARCHAR(255) NULL,
      \`final_total\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`total_loss\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`loss_percentage\` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
      \`is_balanced\` TINYINT(1) NOT NULL DEFAULT 0,
      \`balance_difference\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`notes\` TEXT NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`report_id\`),
      INDEX \`idx_reports_date\` (\`report_date\`),
      INDEX \`idx_reports_outlet_name\` (\`outlet_name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`stocks\` (
      \`stock_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`report_id\` INT UNSIGNED NOT NULL,
      \`ayam_mentah\` VARCHAR(50) NOT NULL DEFAULT '',
      \`ayam_mentah_keterangan\` VARCHAR(255) NULL,
      \`goreng_ayam\` VARCHAR(50) NULL DEFAULT '',
      \`masak_ayam_pb\` VARCHAR(50) NULL DEFAULT '',
      \`masak_ayam_pk\` VARCHAR(50) NULL DEFAULT '',
      \`kulit_mentah\` VARCHAR(50) NOT NULL DEFAULT '',
      \`masak_kulit_ck\` VARCHAR(50) NULL DEFAULT '',
      \`beras\` VARCHAR(50) NOT NULL DEFAULT '',
      \`masak_nasi\` VARCHAR(50) NULL DEFAULT '',
      \`goreng_ayam_pb\` VARCHAR(50) NOT NULL DEFAULT '',
      \`goreng_ayam_pk\` VARCHAR(50) NOT NULL DEFAULT '',
      \`goreng_kulit\` VARCHAR(50) NOT NULL DEFAULT '',
      \`goreng_kulit_ck\` VARCHAR(50) NULL DEFAULT '',
      \`nasi\` VARCHAR(50) NOT NULL DEFAULT '',
      \`s_chili_oil\` VARCHAR(50) NOT NULL DEFAULT '',
      \`s_geprek\` VARCHAR(50) NOT NULL DEFAULT '',
      \`tosser_in\` JSON NULL,
      \`tosser_out\` JSON NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`stock_id\`),
      UNIQUE KEY \`uq_stocks_report_id\` (\`report_id\`),
      CONSTRAINT \`fk_stocks_report\` FOREIGN KEY (\`report_id\`) REFERENCES \`reports\` (\`report_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try {
    await p.query(`ALTER TABLE \`stocks\` ADD COLUMN \`masak_kulit_ck\` VARCHAR(50) NULL DEFAULT ''`);
  } catch { }
  try {
    await p.query(`ALTER TABLE \`stocks\` ADD COLUMN \`goreng_kulit_ck\` VARCHAR(50) NULL DEFAULT ''`);
  } catch { }

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`remaining_stocks\` (
      \`remaining_stock_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`report_id\` INT UNSIGNED NOT NULL,
      \`ayam_mentah\` VARCHAR(50) NOT NULL DEFAULT '',
      \`ayam_mentah_keterangan\` VARCHAR(255) NULL,
      \`goreng_ayam\` VARCHAR(50) NULL DEFAULT '',
      \`kulit_mentah\` VARCHAR(50) NOT NULL DEFAULT '',
      \`beras\` VARCHAR(50) NOT NULL DEFAULT '',
      \`masak_nasi\` VARCHAR(50) NULL DEFAULT '',
      \`goreng_ayam_pb\` VARCHAR(50) NOT NULL DEFAULT '',
      \`goreng_ayam_pk\` VARCHAR(50) NOT NULL DEFAULT '',
      \`goreng_kulit\` VARCHAR(50) NOT NULL DEFAULT '',
      \`goreng_kulit_ck\` VARCHAR(50) NULL DEFAULT '',
      \`nasi\` VARCHAR(50) NOT NULL DEFAULT '',
      \`s_chili_oil\` VARCHAR(50) NOT NULL DEFAULT '',
      \`s_geprek\` VARCHAR(50) NOT NULL DEFAULT '',
      \`tosser_in\` JSON NULL,
      \`tosser_out\` JSON NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`remaining_stock_id\`),
      UNIQUE KEY \`uq_remaining_stocks_report_id\` (\`report_id\`),
      CONSTRAINT \`fk_remaining_stocks_report\` FOREIGN KEY (\`report_id\`) REFERENCES \`reports\` (\`report_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try {
    await p.query(`ALTER TABLE \`remaining_stocks\` ADD COLUMN \`goreng_kulit_ck\` VARCHAR(50) NULL DEFAULT ''`);
  } catch { }

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`sales\` (
      \`sale_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`report_id\` INT UNSIGNED NOT NULL,
      \`product_id\` INT UNSIGNED NULL,
      \`product_name\` VARCHAR(100) NOT NULL,
      \`price\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`quantity\` INT NOT NULL DEFAULT 0,
      \`subtotal\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`items_composition\` JSON NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`sale_id\`),
      INDEX \`idx_sales_report_id\` (\`report_id\`),
      INDEX \`idx_sales_product_id\` (\`product_id\`),
      CONSTRAINT \`fk_sales_report\` FOREIGN KEY (\`report_id\`) REFERENCES \`reports\` (\`report_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try {
    await p.query(`ALTER TABLE \`sales\` ADD COLUMN \`items_composition\` JSON NULL`);
  } catch { }

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`expenses\` (
      \`expense_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`report_id\` INT UNSIGNED NOT NULL,
      \`gas\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`galon\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`clean_tools\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`kulit\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`meal\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`bonus\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`beras\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`saus\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`minyak\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`lain_lain\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`lain_lain_keterangan\` TEXT NULL,
      \`total_expense\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`custom_expenses\` JSON NULL,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`expense_id\`),
      UNIQUE KEY \`uq_expenses_report_id\` (\`report_id\`),
      CONSTRAINT \`fk_expenses_report\` FOREIGN KEY (\`report_id\`) REFERENCES \`reports\` (\`report_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  try {
    await p.query('ALTER TABLE `expenses` ADD COLUMN `custom_expenses` JSON NULL');
  } catch {
    // Column already exists
  }

  await p.query(`
    CREATE TABLE IF NOT EXISTS \`payments\` (
      \`payment_id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      \`report_id\` INT UNSIGNED NOT NULL,
      \`tunai\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`qr\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`tf\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`total_payment\` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`payment_id\`),
      UNIQUE KEY \`uq_payments_report_id\` (\`report_id\`),
      CONSTRAINT \`fk_payments_report\` FOREIGN KEY (\`report_id\`) REFERENCES \`reports\` (\`report_id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Ensure default master configs exist if empty
  await ensureDefaultMasterConfigs(p);
}

async function ensureDefaultMasterConfigs(p: Pool): Promise<void> {
  const configs = [
    { key: 'master_barang', val: DEFAULT_MASTER_BARANG },
    { key: 'stock_items', val: DEFAULT_STOCK_ITEMS },
    { key: 'tosser_items', val: DEFAULT_TOSSER_ITEMS },
    { key: 'expense_categories', val: DEFAULT_EXPENSE_CATEGORIES },
    { key: 'ending_stock_items', val: DEFAULT_ENDING_STOCK_ITEMS },
  ];
  for (const c of configs) {
    await p.query(
      'INSERT INTO `app_master_configs` (`config_key`, `config_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `config_key` = `config_key`',
      [c.key, JSON.stringify(c.val)]
    );
  }
}

export const mySqlService = {
  // --- Settings ---
  async getSettings(): Promise<AdminSettings> {
    const p = getPool();
    let admin_pin = DEFAULT_SETTINGS.admin_pin;
    try {
      const [rows] = await p.query<RowDataPacket[]>('SELECT admin_pin FROM `settings` ORDER BY setting_id DESC LIMIT 1');
      if (rows.length > 0 && rows[0].admin_pin) {
        admin_pin = rows[0].admin_pin;
      }
    } catch {
      // fallback
    }
    const conversion = await this.getConversionConfig();
    return {
      admin_pin,
      conversion,
    };
  },

  async updateAdminPin(pin: string): Promise<{ success: boolean; message: string }> {
    const p = getPool();
    const cleanPin = String(pin).trim();
    if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
      throw new Error('PIN harus terdiri dari 4 digit angka');
    }
    const [rows] = await p.query<RowDataPacket[]>('SELECT setting_id FROM `settings` LIMIT 1');
    if (rows.length > 0) {
      await p.query('UPDATE `settings` SET admin_pin = ? WHERE setting_id = ?', [cleanPin, rows[0].setting_id]);
    } else {
      await p.query('INSERT INTO `settings` (admin_pin) VALUES (?)', [cleanPin]);
    }
    return { success: true, message: 'PIN Admin berhasil diperbarui' };
  },

  async getConversionConfig(): Promise<ChickenConversionConfig> {
    return this.getMasterConfig('chicken_conversion', DEFAULT_CHICKEN_CONVERSION);
  },

  async updateConversionConfig(cfg: Partial<ChickenConversionConfig>): Promise<ChickenConversionConfig> {
    const current = await this.getConversionConfig();
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
    await this.saveMasterConfig('chicken_conversion', updated);
    return updated;
  },

  // --- Outlets ---
  async getOutlets(): Promise<OutletItem[]> {
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>(
      'SELECT outlet_id as id, outlet_name as name, address, phone, outlet_type, is_active FROM `outlets` ORDER BY outlet_id ASC'
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address || '',
      phone: r.phone || '',
      outlet_type: r.outlet_type || 'traditional',
      active: Boolean(r.is_active),
    }));
  },

  async createOutlet(data: Partial<OutletItem>): Promise<OutletItem> {
    const p = getPool();
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama outlet wajib diisi');

    const [res] = await p.query<ResultSetHeader>(
      'INSERT INTO `outlets` (outlet_name, address, phone, outlet_type, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, data.address || null, data.phone || null, data.outlet_type || 'traditional', data.active !== false ? 1 : 0]
    );

    return {
      id: res.insertId,
      name,
      address: data.address || '',
      phone: data.phone || '',
      outlet_type: data.outlet_type || 'traditional',
      active: data.active !== false,
    };
  },

  async updateOutlet(id: number, data: Partial<OutletItem>): Promise<OutletItem | null> {
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>('SELECT * FROM `outlets` WHERE outlet_id = ?', [id]);
    if (rows.length === 0) return null;

    const current = rows[0];
    const name = data.name !== undefined ? String(data.name).trim() : current.outlet_name;
    const address = data.address !== undefined ? data.address : current.address;
    const phone = data.phone !== undefined ? data.phone : current.phone;
    const outlet_type = data.outlet_type !== undefined ? data.outlet_type : current.outlet_type;
    const is_active = data.active !== undefined ? (data.active ? 1 : 0) : current.is_active;

    await p.query(
      'UPDATE `outlets` SET outlet_name = ?, address = ?, phone = ?, outlet_type = ?, is_active = ? WHERE outlet_id = ?',
      [name, address, phone, outlet_type, is_active, id]
    );

    return {
      id,
      name,
      address: address || '',
      phone: phone || '',
      outlet_type: outlet_type || 'traditional',
      active: Boolean(is_active),
    };
  },

  async deleteOutlet(id: number): Promise<boolean> {
    const p = getPool();
    const [res] = await p.query<ResultSetHeader>('DELETE FROM `outlets` WHERE outlet_id = ?', [id]);
    return res.affectedRows > 0;
  },

  // --- Products ---
  async getProducts(outletType?: string): Promise<Product[]> {
    const p = getPool();
    let query = 'SELECT product_id as id, product_name as name, selling_price, outlet_type, description, items_composition, barang_id, is_active FROM `products`';
    const params: any[] = [];

    if (outletType && outletType !== 'all') {
      query += ' WHERE (outlet_type = ? OR outlet_type = "all" OR outlet_type IS NULL OR outlet_type = "")';
      params.push(outletType);
    }
    query += ' ORDER BY product_id ASC';

    const [rows] = await p.query<RowDataPacket[]>(query, params);
    return rows.map((r) => {
      const defaultMatch = DEFAULT_PRODUCTS.find((p) => p.id === r.id || p.name.toLowerCase() === r.name?.toLowerCase());
      const resolvedBarangId = r.barang_id !== null && r.barang_id !== undefined ? Number(r.barang_id) : (defaultMatch?.barang_id || undefined);
      return {
        id: r.id,
        name: r.name,
        selling_price: Number(r.selling_price) || 0,
        active: Boolean(r.is_active),
        outlet_type: r.outlet_type || 'all',
        description: r.description || '',
        items_composition: typeof r.items_composition === 'string' ? JSON.parse(r.items_composition) : r.items_composition || undefined,
        barang_id: resolvedBarangId,
      };
    });
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    const p = getPool();
    const name = String(data.name || '').trim();
    if (!name) throw new Error('Nama produk wajib diisi');

    const barang_id = data.barang_id ? Number(data.barang_id) : null;

    const [res] = await p.query<ResultSetHeader>(
      'INSERT INTO `products` (product_name, selling_price, cost_price, unit, outlet_type, description, items_composition, barang_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        Number(data.selling_price) || 0,
        0,
        'pcs',
        data.outlet_type || 'all',
        data.description || null,
        data.items_composition ? JSON.stringify(data.items_composition) : null,
        barang_id,
        data.active !== false ? 1 : 0,
      ]
    );

    return {
      id: res.insertId,
      name,
      selling_price: Number(data.selling_price) || 0,
      active: data.active !== false,
      outlet_type: data.outlet_type || 'all',
      description: data.description || '',
      items_composition: data.items_composition,
      barang_id: barang_id ? Number(barang_id) : undefined,
    };
  },

  async updateProduct(id: number, data: Partial<Product>): Promise<Product | null> {
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>('SELECT * FROM `products` WHERE product_id = ?', [id]);
    if (rows.length === 0) return null;

    const current = rows[0];
    const name = data.name !== undefined ? String(data.name).trim() : current.product_name;
    const selling_price = data.selling_price !== undefined ? Number(data.selling_price) : Number(current.selling_price);
    const outlet_type = data.outlet_type !== undefined ? data.outlet_type : current.outlet_type;
    const description = data.description !== undefined ? data.description : current.description;
    const items_composition = data.items_composition !== undefined ? data.items_composition : current.items_composition;
    const is_active = data.active !== undefined ? (data.active ? 1 : 0) : current.is_active;
    const barang_id = data.barang_id !== undefined ? (data.barang_id ? Number(data.barang_id) : null) : (current.barang_id ?? null);

    await p.query(
      'UPDATE `products` SET product_name = ?, selling_price = ?, outlet_type = ?, description = ?, items_composition = ?, barang_id = ?, is_active = ? WHERE product_id = ?',
      [
        name,
        selling_price,
        outlet_type,
        description,
        items_composition ? JSON.stringify(items_composition) : null,
        barang_id,
        is_active,
        id,
      ]
    );

    return {
      id,
      name,
      selling_price,
      active: Boolean(is_active),
      outlet_type: outlet_type || 'all',
      description: description || '',
      items_composition: typeof items_composition === 'string' ? JSON.parse(items_composition) : items_composition,
      barang_id: barang_id ? Number(barang_id) : undefined,
    };
  },

  async deleteProduct(id: number): Promise<boolean> {
    const p = getPool();
    const [res] = await p.query<ResultSetHeader>('DELETE FROM `products` WHERE product_id = ?', [id]);
    return res.affectedRows > 0;
  },

  // --- Master Config Helpers (stock_items, tosser_items, expense_categories, ending_stock_items) ---
  async getMasterConfig<T>(key: string, defaultValue: T): Promise<T> {
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>('SELECT config_value FROM `app_master_configs` WHERE config_key = ?', [key]);
    if (rows.length > 0 && rows[0].config_value) {
      return typeof rows[0].config_value === 'string' ? JSON.parse(rows[0].config_value) : rows[0].config_value;
    }
    return defaultValue;
  },

  async saveMasterConfig<T>(key: string, value: T): Promise<void> {
    const p = getPool();
    await p.query(
      'INSERT INTO `app_master_configs` (`config_key`, `config_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`)',
      [key, JSON.stringify(value)]
    );
  },

  // --- Master Barang CRUD ---
  async getMasterBarang(): Promise<MasterBarangItem[]> {
    return this.getMasterConfig('master_barang', DEFAULT_MASTER_BARANG);
  },
  async createMasterBarang(item: Omit<MasterBarangItem, 'id'>): Promise<MasterBarangItem> {
    const items = await this.getMasterBarang();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: MasterBarangItem = { ...item, id: nextId };
    items.push(newItem);
    await this.saveMasterConfig('master_barang', items);
    return newItem;
  },
  async updateMasterBarang(id: number, item: Partial<MasterBarangItem>): Promise<MasterBarangItem | null> {
    const items = await this.getMasterBarang();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...item };
    await this.saveMasterConfig('master_barang', items);
    return items[idx];
  },
  async deleteMasterBarang(id: number): Promise<boolean> {
    const items = await this.getMasterBarang();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.saveMasterConfig('master_barang', filtered);
    return true;
  },

  async getStockItems(): Promise<StockMasterItem[]> {
    const items = await this.getMasterConfig('stock_items', DEFAULT_STOCK_ITEMS);
    return items.map((item) => {
      if (item.barang_id) return item;
      const def = DEFAULT_STOCK_ITEMS.find((d) => d.key === item.key || d.name.toLowerCase() === item.name.toLowerCase());
      return def?.barang_id ? { ...item, barang_id: def.barang_id } : item;
    });
  },
  async createStockItem(item: Omit<StockMasterItem, 'id'>): Promise<StockMasterItem> {
    const items = await this.getStockItems();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const cleanKey = item.key || item.name.toLowerCase().replace(/[^a-z0-9_]/gi, '_').replace(/^_+|_+$/g, '') || `stock_${nextId}`;
    const newItem = { ...item, key: cleanKey, id: nextId };
    items.push(newItem);
    await this.saveMasterConfig('stock_items', items);
    return newItem;
  },
  async updateStockItem(id: number, item: Partial<StockMasterItem>): Promise<StockMasterItem | null> {
    const items = await this.getStockItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...item };
    await this.saveMasterConfig('stock_items', items);
    return items[idx];
  },
  async deleteStockItem(id: number): Promise<boolean> {
    const items = await this.getStockItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.saveMasterConfig('stock_items', filtered);
    return true;
  },

  async getTosserItems(): Promise<TosserMasterItem[]> {
    const items = await this.getMasterConfig('tosser_items', DEFAULT_TOSSER_ITEMS);
    return items.map((item) => {
      if (item.barang_id) return item;
      const def = DEFAULT_TOSSER_ITEMS.find((d) => d.key === item.key || d.name.toLowerCase() === item.name.toLowerCase());
      return def?.barang_id ? { ...item, barang_id: def.barang_id } : item;
    });
  },
  async createTosserItem(item: Omit<TosserMasterItem, 'id'>): Promise<TosserMasterItem> {
    const items = await this.getTosserItems();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const cleanKey = item.key || item.name.toLowerCase().replace(/[^a-z0-9_]/gi, '_').replace(/^_+|_+$/g, '') || `tosser_${nextId}`;
    const newItem = { ...item, key: cleanKey, id: nextId };
    items.push(newItem);
    await this.saveMasterConfig('tosser_items', items);
    return newItem;
  },
  async updateTosserItem(id: number, item: Partial<TosserMasterItem>): Promise<TosserMasterItem | null> {
    const items = await this.getTosserItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...item };
    await this.saveMasterConfig('tosser_items', items);
    return items[idx];
  },
  async deleteTosserItem(id: number): Promise<boolean> {
    const items = await this.getTosserItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.saveMasterConfig('tosser_items', filtered);
    return true;
  },

  async getExpenseCategories(): Promise<ExpenseCategoryItem[]> {
    const items = await this.getMasterConfig('expense_categories', DEFAULT_EXPENSE_CATEGORIES);
    return items.map((item, idx) => ({
      ...item,
      key: item.key || item.name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_') || `exp_${item.id || idx + 1}`,
    }));
  },
  async createExpenseCategory(cat: Omit<ExpenseCategoryItem, 'id'>): Promise<ExpenseCategoryItem> {
    const items = await this.getExpenseCategories();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const key = cat.key || cat.name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_') || `exp_${nextId}`;
    const newItem: ExpenseCategoryItem = { ...cat, key, id: nextId };
    items.push(newItem);
    await this.saveMasterConfig('expense_categories', items);
    return newItem;
  },
  async updateExpenseCategory(id: number, cat: Partial<ExpenseCategoryItem>): Promise<ExpenseCategoryItem | null> {
    const items = await this.getExpenseCategories();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    const existing = items[idx];
    const key = cat.key || existing.key || (cat.name || existing.name).toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_');
    items[idx] = { ...existing, ...cat, key };
    await this.saveMasterConfig('expense_categories', items);
    return items[idx];
  },
  async deleteExpenseCategory(id: number): Promise<boolean> {
    const items = await this.getExpenseCategories();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.saveMasterConfig('expense_categories', filtered);
    return true;
  },

  async getEndingStockItems(): Promise<EndingStockMasterItem[]> {
    return this.getMasterConfig('ending_stock_items', DEFAULT_ENDING_STOCK_ITEMS);
  },
  async createEndingStockItem(item: Omit<EndingStockMasterItem, 'id'>): Promise<EndingStockMasterItem> {
    const items = await this.getEndingStockItems();
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem = { ...item, id: nextId };
    items.push(newItem);
    await this.saveMasterConfig('ending_stock_items', items);
    return newItem;
  },
  async updateEndingStockItem(id: number, item: Partial<EndingStockMasterItem>): Promise<EndingStockMasterItem | null> {
    const items = await this.getEndingStockItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...item };
    await this.saveMasterConfig('ending_stock_items', items);
    return items[idx];
  },
  async deleteEndingStockItem(id: number): Promise<boolean> {
    const items = await this.getEndingStockItems();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.saveMasterConfig('ending_stock_items', filtered);
    return true;
  },

  // --- Reports (Full CRUD directly to MySQL) ---
  async getReports(query?: { filter?: string; outlet?: string; startDate?: string; endDate?: string }): Promise<DailyReport[]> {
    const p = getPool();
    let sql = 'SELECT * FROM `reports` WHERE 1=1';
    const params: any[] = [];

    if (query?.outlet && query.outlet !== 'Semua') {
      sql += ' AND LOWER(outlet_name) = LOWER(?)';
      params.push(query.outlet);
    }

    if (query?.filter === 'today') {
      sql += ' AND report_date = CURDATE()';
    } else if (query?.filter === 'week') {
      sql += ' AND report_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    } else if (query?.filter === 'month') {
      sql += ' AND report_date >= DATE_FORMAT(CURDATE(), "%Y-%m-01")';
    } else if (query?.startDate && query?.endDate) {
      sql += ' AND report_date BETWEEN ? AND ?';
      params.push(query.startDate, query.endDate);
    }

    sql += ' ORDER BY report_date DESC, report_id DESC';

    const [reportRows] = await p.query<RowDataPacket[]>(sql, params);
    if (reportRows.length === 0) return [];

    const reportIds = reportRows.map((r) => r.report_id);

    // Fetch child tables in parallel
    const [stocksRows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM \`stocks\` WHERE report_id IN (${reportIds.map(() => '?').join(',')})`,
      reportIds
    );
    const [remStocksRows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM \`remaining_stocks\` WHERE report_id IN (${reportIds.map(() => '?').join(',')})`,
      reportIds
    );
    const [salesRows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM \`sales\` WHERE report_id IN (${reportIds.map(() => '?').join(',')}) ORDER BY sale_id ASC`,
      reportIds
    );
    const [expensesRows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM \`expenses\` WHERE report_id IN (${reportIds.map(() => '?').join(',')})`,
      reportIds
    );
    const [paymentsRows] = await p.query<RowDataPacket[]>(
      `SELECT * FROM \`payments\` WHERE report_id IN (${reportIds.map(() => '?').join(',')})`,
      reportIds
    );

    const parseJson = (val: any) => (typeof val === 'string' ? JSON.parse(val) : val);

    return reportRows.map((r) => {
      const st = stocksRows.find((s) => s.report_id === r.report_id);
      const rs = remStocksRows.find((s) => s.report_id === r.report_id);
      const sl = salesRows.filter((s) => s.report_id === r.report_id);
      const exp = expensesRows.find((e) => e.report_id === r.report_id);
      const pay = paymentsRows.find((p_item) => p_item.report_id === r.report_id);

      return {
        id: r.report_id,
        report_date: r.report_date,
        outlet_name: r.outlet_name,
        staff_name: r.staff_name || '',
        total_income: Number(r.total_income) || 0,
        total_expense: Number(r.total_expense) || 0,
        promo: Number(r.promo) || 0,
        promo_note: r.promo_note || '',
        final_total: Number(r.final_total) || 0,
        total_loss: Number(r.total_loss) || 0,
        loss_percentage: Number(r.loss_percentage) || 0,
        is_balanced: Boolean(r.is_balanced),
        balance_difference: Number(r.balance_difference) || 0,
        notes: r.notes || '',
        created_at: r.created_at,
        stock: {
          ayam_mentah: st?.ayam_mentah || '',
          ayam_mentah_keterangan: st?.ayam_mentah_keterangan || '',
          goreng_ayam: st?.goreng_ayam || '',
          masak_ayam_pb: st?.masak_ayam_pb || '',
          masak_ayam_pk: st?.masak_ayam_pk || '',
          kulit_mentah: st?.kulit_mentah || '',
          masak_kulit_ck: st?.masak_kulit_ck || '',
          beras: st?.beras || '',
          masak_nasi: st?.masak_nasi || '',
          tosser_in: parseJson(st?.tosser_in) || { ...DEFAULT_TOSSER },
          tosser_out: parseJson(st?.tosser_out) || { ...DEFAULT_TOSSER },
          goreng_ayam_pb: st?.goreng_ayam_pb || '',
          goreng_ayam_pk: st?.goreng_ayam_pk || '',
          goreng_kulit: st?.goreng_kulit || '',
          goreng_kulit_ck: st?.goreng_kulit_ck || '',
          nasi: st?.nasi || '',
          s_chili_oil: st?.s_chili_oil || '',
          s_geprek: st?.s_geprek || '',
        },
        remaining_stock: {
          ayam_mentah: rs?.ayam_mentah || '',
          ayam_mentah_keterangan: rs?.ayam_mentah_keterangan || '',
          goreng_ayam: rs?.goreng_ayam || '',
          kulit_mentah: rs?.kulit_mentah || '',
          beras: rs?.beras || '',
          masak_nasi: rs?.masak_nasi || '',
          goreng_ayam_pb: rs?.goreng_ayam_pb || '',
          goreng_ayam_pk: rs?.goreng_ayam_pk || '',
          goreng_kulit: rs?.goreng_kulit || '',
          goreng_kulit_ck: rs?.goreng_kulit_ck || '',
          nasi: rs?.nasi || '',
          s_chili_oil: rs?.s_chili_oil || '',
          s_geprek: rs?.s_geprek || '',
        },
        sales: sl.map((s) => ({
          product_id: s.product_id,
          product_name: s.product_name,
          price: Number(s.price) || 0,
          quantity: Number(s.quantity) || 0,
          subtotal: Number(s.subtotal) || 0,
          items_composition: parseJson(s.items_composition),
        })),
        expenses: {
          gas: Number(exp?.gas) || 0,
          galon: Number(exp?.galon) || 0,
          clean_tools: Number(exp?.clean_tools) || 0,
          kulit: Number(exp?.kulit) || 0,
          meal: Number(exp?.meal) || 0,
          bonus: Number(exp?.bonus) || 0,
          beras: Number(exp?.beras) || 0,
          saus: Number(exp?.saus) || 0,
          minyak: Number(exp?.minyak) || 0,
          lain_lain: Number(exp?.lain_lain) || 0,
          lain_lain_keterangan: exp?.lain_lain_keterangan || '',
          total_expense: Number(exp?.total_expense) || 0,
          ...(parseJson(exp?.custom_expenses) || {}),
        },
        payments: {
          tunai: Number(pay?.tunai) || 0,
          qr: Number(pay?.qr) || 0,
          tf: Number(pay?.tf) || 0,
          total_payment: Number(pay?.total_payment) || 0,
        },
      };
    });
  },

  async getReportById(id: number): Promise<DailyReport | null> {
    const p = getPool();
    const [rows] = await p.query<RowDataPacket[]>('SELECT * FROM `reports` WHERE report_id = ?', [id]);
    if (rows.length === 0) return null;

    const r = rows[0];
    const [stRows] = await p.query<RowDataPacket[]>('SELECT * FROM `stocks` WHERE report_id = ?', [id]);
    const [rsRows] = await p.query<RowDataPacket[]>('SELECT * FROM `remaining_stocks` WHERE report_id = ?', [id]);
    const [slRows] = await p.query<RowDataPacket[]>('SELECT * FROM `sales` WHERE report_id = ? ORDER BY sale_id ASC', [id]);
    const [expRows] = await p.query<RowDataPacket[]>('SELECT * FROM `expenses` WHERE report_id = ?', [id]);
    const [payRows] = await p.query<RowDataPacket[]>('SELECT * FROM `payments` WHERE report_id = ?', [id]);

    const parseJson = (val: any) => (typeof val === 'string' ? JSON.parse(val) : val);
    const st = stRows[0];
    const rs = rsRows[0];
    const exp = expRows[0];
    const pay = payRows[0];

    return {
      id: r.report_id,
      report_date: r.report_date,
      outlet_name: r.outlet_name,
      staff_name: r.staff_name || '',
      total_income: Number(r.total_income) || 0,
      total_expense: Number(r.total_expense) || 0,
      promo: Number(r.promo) || 0,
      promo_note: r.promo_note || '',
      final_total: Number(r.final_total) || 0,
      total_loss: Number(r.total_loss) || 0,
      loss_percentage: Number(r.loss_percentage) || 0,
      is_balanced: Boolean(r.is_balanced),
      balance_difference: Number(r.balance_difference) || 0,
      notes: r.notes || '',
      created_at: r.created_at,
      stock: {
        ayam_mentah: st?.ayam_mentah || '',
        ayam_mentah_keterangan: st?.ayam_mentah_keterangan || '',
        goreng_ayam: st?.goreng_ayam || '',
        masak_ayam_pb: st?.masak_ayam_pb || '',
        masak_ayam_pk: st?.masak_ayam_pk || '',
        kulit_mentah: st?.kulit_mentah || '',
        masak_kulit_ck: st?.masak_kulit_ck || '',
        beras: st?.beras || '',
        masak_nasi: st?.masak_nasi || '',
        tosser_in: parseJson(st?.tosser_in) || { ...DEFAULT_TOSSER },
        tosser_out: parseJson(st?.tosser_out) || { ...DEFAULT_TOSSER },
        goreng_ayam_pb: st?.goreng_ayam_pb || '',
        goreng_ayam_pk: st?.goreng_ayam_pk || '',
        goreng_kulit: st?.goreng_kulit || '',
        goreng_kulit_ck: st?.goreng_kulit_ck || '',
        nasi: st?.nasi || '',
        s_chili_oil: st?.s_chili_oil || '',
        s_geprek: st?.s_geprek || '',
      },
      remaining_stock: {
        ayam_mentah: rs?.ayam_mentah || '',
        ayam_mentah_keterangan: rs?.ayam_mentah_keterangan || '',
        goreng_ayam: rs?.goreng_ayam || '',
        kulit_mentah: rs?.kulit_mentah || '',
        beras: rs?.beras || '',
        masak_nasi: rs?.masak_nasi || '',
        goreng_ayam_pb: rs?.goreng_ayam_pb || '',
        goreng_ayam_pk: rs?.goreng_ayam_pk || '',
        goreng_kulit: rs?.goreng_kulit || '',
        goreng_kulit_ck: rs?.goreng_kulit_ck || '',
        nasi: rs?.nasi || '',
        s_chili_oil: rs?.s_chili_oil || '',
        s_geprek: rs?.s_geprek || '',
      },
      sales: slRows.map((s) => ({
        product_id: s.product_id,
        product_name: s.product_name,
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 0,
        subtotal: Number(s.subtotal) || 0,
        items_composition: parseJson(s.items_composition),
      })),
      expenses: {
        gas: Number(exp?.gas) || 0,
        galon: Number(exp?.galon) || 0,
        clean_tools: Number(exp?.clean_tools) || 0,
        kulit: Number(exp?.kulit) || 0,
        meal: Number(exp?.meal) || 0,
        bonus: Number(exp?.bonus) || 0,
        beras: Number(exp?.beras) || 0,
        saus: Number(exp?.saus) || 0,
        minyak: Number(exp?.minyak) || 0,
        lain_lain: Number(exp?.lain_lain) || 0,
        lain_lain_keterangan: exp?.lain_lain_keterangan || '',
        total_expense: Number(exp?.total_expense) || 0,
        ...(parseJson(exp?.custom_expenses) || {}),
      },
      payments: {
        tunai: Number(pay?.tunai) || 0,
        qr: Number(pay?.qr) || 0,
        tf: Number(pay?.tf) || 0,
        total_payment: Number(pay?.total_payment) || 0,
      },
    };
  },

  async createReport(data: ReportFormData): Promise<DailyReport> {
    const p = getPool();
    const totals = calculateTotals(data.sales, data.expenses, data.promo, data.payments);
    const reportDate = data.report_date || new Date().toISOString().split('T')[0];
    const outletName = data.outlet_name || 'Cisalak';
    const staffName = data.staff_name || '';

    // Insert into reports
    const [res] = await p.query<ResultSetHeader>(
      `INSERT INTO \`reports\` 
       (\`report_date\`, \`outlet_name\`, \`staff_name\`, \`total_income\`, \`total_expense\`, \`promo\`, \`promo_note\`, \`final_total\`, \`total_loss\`, \`loss_percentage\`, \`is_balanced\`, \`balance_difference\`, \`notes\`, \`created_at\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        reportDate,
        outletName,
        staffName,
        totals.total_income,
        totals.total_expense,
        totals.promo,
        data.promo_note || '',
        totals.final_total,
        data.total_loss !== undefined ? data.total_loss : 0,
        data.loss_percentage !== undefined ? data.loss_percentage : 0,
        totals.is_balanced ? 1 : 0,
        totals.balance_difference,
        data.notes || '',
      ]
    );

    const reportId = res.insertId;

    // Insert into stocks
    await p.query(
      `INSERT INTO \`stocks\`
       (\`report_id\`, \`ayam_mentah\`, \`ayam_mentah_keterangan\`, \`goreng_ayam\`, \`masak_ayam_pb\`, \`masak_ayam_pk\`, \`kulit_mentah\`, \`masak_kulit_ck\`, \`beras\`, \`masak_nasi\`, \`goreng_ayam_pb\`, \`goreng_ayam_pk\`, \`goreng_kulit\`, \`goreng_kulit_ck\`, \`nasi\`, \`s_chili_oil\`, \`s_geprek\`, \`tosser_in\`, \`tosser_out\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reportId,
        data.stock?.ayam_mentah || '',
        data.stock?.ayam_mentah_keterangan || '',
        data.stock?.goreng_ayam || '',
        data.stock?.masak_ayam_pb || '',
        data.stock?.masak_ayam_pk || '',
        data.stock?.kulit_mentah || '',
        data.stock?.masak_kulit_ck || '',
        data.stock?.beras || '',
        data.stock?.masak_nasi || '',
        data.stock?.goreng_ayam_pb || '',
        data.stock?.goreng_ayam_pk || '',
        data.stock?.goreng_kulit || '',
        data.stock?.goreng_kulit_ck || '',
        data.stock?.nasi || '',
        data.stock?.s_chili_oil || '',
        data.stock?.s_geprek || '',
        data.stock?.tosser_in ? JSON.stringify(data.stock.tosser_in) : JSON.stringify(DEFAULT_TOSSER),
        data.stock?.tosser_out ? JSON.stringify(data.stock.tosser_out) : JSON.stringify(DEFAULT_TOSSER),
      ]
    );

    // Insert into remaining_stocks
    await p.query(
      `INSERT INTO \`remaining_stocks\`
       (\`report_id\`, \`ayam_mentah\`, \`ayam_mentah_keterangan\`, \`goreng_ayam\`, \`kulit_mentah\`, \`beras\`, \`masak_nasi\`, \`goreng_ayam_pb\`, \`goreng_ayam_pk\`, \`goreng_kulit\`, \`goreng_kulit_ck\`, \`nasi\`, \`s_chili_oil\`, \`s_geprek\`, \`tosser_in\`, \`tosser_out\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reportId,
        data.remaining_stock?.ayam_mentah || '',
        data.remaining_stock?.ayam_mentah_keterangan || '',
        data.remaining_stock?.goreng_ayam || '',
        data.remaining_stock?.kulit_mentah || '',
        data.remaining_stock?.beras || '',
        data.remaining_stock?.masak_nasi || '',
        data.remaining_stock?.goreng_ayam_pb || '',
        data.remaining_stock?.goreng_ayam_pk || '',
        data.remaining_stock?.goreng_kulit || '',
        data.remaining_stock?.goreng_kulit_ck || '',
        data.remaining_stock?.nasi || '',
        data.remaining_stock?.s_chili_oil || '',
        data.remaining_stock?.s_geprek || '',
        null,
        null,
      ]
    );

    // Insert into sales
    if (Array.isArray(data.sales) && data.sales.length > 0) {
      for (const s of data.sales) {
        await p.query(
          `INSERT INTO \`sales\`
           (\`report_id\`, \`product_id\`, \`product_name\`, \`price\`, \`quantity\`, \`subtotal\`, \`items_composition\`)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            reportId,
            s.product_id || null,
            s.product_name,
            Number(s.price) || 0,
            Number(s.quantity) || 0,
            Number(s.subtotal) || 0,
            s.items_composition ? JSON.stringify(s.items_composition) : null,
          ]
        );
      }
    }

    // Insert into expenses
    const standardExpenseCols = new Set([
      'gas', 'galon', 'clean_tools', 'kulit', 'meal', 'bonus', 'beras', 'saus', 'minyak', 'lain_lain', 'lain_lain_keterangan', 'total_expense'
    ]);
    const customExpensesObj: Record<string, any> = {};
    if (data.expenses) {
      for (const [k, v] of Object.entries(data.expenses)) {
        if (!standardExpenseCols.has(k) && v !== undefined && v !== null && v !== 0 && v !== '') {
          customExpensesObj[k] = v;
        }
      }
    }
    const customExpensesJson = Object.keys(customExpensesObj).length > 0 ? JSON.stringify(customExpensesObj) : null;

    try {
      await p.query(
        `INSERT INTO \`expenses\`
         (\`report_id\`, \`gas\`, \`galon\`, \`clean_tools\`, \`kulit\`, \`meal\`, \`bonus\`, \`beras\`, \`saus\`, \`minyak\`, \`lain_lain\`, \`lain_lain_keterangan\`, \`total_expense\`, \`custom_expenses\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reportId,
          Number(data.expenses?.gas) || 0,
          Number(data.expenses?.galon) || 0,
          Number(data.expenses?.clean_tools) || 0,
          Number(data.expenses?.kulit) || 0,
          Number(data.expenses?.meal) || 0,
          Number(data.expenses?.bonus) || 0,
          Number(data.expenses?.beras) || 0,
          Number(data.expenses?.saus) || 0,
          Number(data.expenses?.minyak) || 0,
          Number(data.expenses?.lain_lain) || 0,
          data.expenses?.lain_lain_keterangan || '',
          totals.total_expense,
          customExpensesJson,
        ]
      );
    } catch {
      await p.query(
        `INSERT INTO \`expenses\`
         (\`report_id\`, \`gas\`, \`galon\`, \`clean_tools\`, \`kulit\`, \`meal\`, \`bonus\`, \`beras\`, \`saus\`, \`minyak\`, \`lain_lain\`, \`lain_lain_keterangan\`, \`total_expense\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reportId,
          Number(data.expenses?.gas) || 0,
          Number(data.expenses?.galon) || 0,
          Number(data.expenses?.clean_tools) || 0,
          Number(data.expenses?.kulit) || 0,
          Number(data.expenses?.meal) || 0,
          Number(data.expenses?.bonus) || 0,
          Number(data.expenses?.beras) || 0,
          Number(data.expenses?.saus) || 0,
          Number(data.expenses?.minyak) || 0,
          Number(data.expenses?.lain_lain) || 0,
          data.expenses?.lain_lain_keterangan || '',
          totals.total_expense,
        ]
      );
    }

    // Insert into payments
    await p.query(
      `INSERT INTO \`payments\`
       (\`report_id\`, \`tunai\`, \`qr\`, \`tf\`, \`total_payment\`)
       VALUES (?, ?, ?, ?, ?)`,
      [
        reportId,
        Number(data.payments?.tunai) || 0,
        Number(data.payments?.qr) || 0,
        Number(data.payments?.tf) || 0,
        totals.total_payment,
      ]
    );

    const saved = await this.getReportById(reportId);
    return saved!;
  },

  async updateReport(id: number, data: ReportFormData): Promise<DailyReport | null> {
    const p = getPool();
    const existing = await this.getReportById(id);
    if (!existing) return null;

    const totals = calculateTotals(data.sales, data.expenses, data.promo, data.payments);
    const reportDate = data.report_date || existing.report_date;
    const outletName = data.outlet_name || existing.outlet_name;
    const staffName = data.staff_name !== undefined ? data.staff_name : existing.staff_name;

    await p.query(
      `UPDATE \`reports\` SET
       \`report_date\` = ?,
       \`outlet_name\` = ?,
       \`staff_name\` = ?,
       \`total_income\` = ?,
       \`total_expense\` = ?,
       \`promo\` = ?,
       \`promo_note\` = ?,
       \`final_total\` = ?,
       \`total_loss\` = ?,
       \`loss_percentage\` = ?,
       \`is_balanced\` = ?,
       \`balance_difference\` = ?,
       \`notes\` = ?
       WHERE \`report_id\` = ?`,
      [
        reportDate,
        outletName,
        staffName,
        totals.total_income,
        totals.total_expense,
        totals.promo,
        data.promo_note || '',
        totals.final_total,
        data.total_loss !== undefined ? data.total_loss : 0,
        data.loss_percentage !== undefined ? data.loss_percentage : 0,
        totals.is_balanced ? 1 : 0,
        totals.balance_difference,
        data.notes || '',
        id,
      ]
    );

    // Update stocks
    await p.query(
      `UPDATE \`stocks\` SET
       \`ayam_mentah\` = ?,
       \`ayam_mentah_keterangan\` = ?,
       \`goreng_ayam\` = ?,
       \`masak_ayam_pb\` = ?,
       \`masak_ayam_pk\` = ?,
       \`kulit_mentah\` = ?,
       \`masak_kulit_ck\` = ?,
       \`beras\` = ?,
       \`masak_nasi\` = ?,
       \`goreng_ayam_pb\` = ?,
       \`goreng_ayam_pk\` = ?,
       \`goreng_kulit\` = ?,
       \`goreng_kulit_ck\` = ?,
       \`nasi\` = ?,
       \`s_chili_oil\` = ?,
       \`s_geprek\` = ?,
       \`tosser_in\` = ?,
       \`tosser_out\` = ?
       WHERE \`report_id\` = ?`,
      [
        data.stock?.ayam_mentah || '',
        data.stock?.ayam_mentah_keterangan || '',
        data.stock?.goreng_ayam || '',
        data.stock?.masak_ayam_pb || '',
        data.stock?.masak_ayam_pk || '',
        data.stock?.kulit_mentah || '',
        data.stock?.masak_kulit_ck || '',
        data.stock?.beras || '',
        data.stock?.masak_nasi || '',
        data.stock?.goreng_ayam_pb || '',
        data.stock?.goreng_ayam_pk || '',
        data.stock?.goreng_kulit || '',
        data.stock?.goreng_kulit_ck || '',
        data.stock?.nasi || '',
        data.stock?.s_chili_oil || '',
        data.stock?.s_geprek || '',
        data.stock?.tosser_in ? JSON.stringify(data.stock.tosser_in) : JSON.stringify(DEFAULT_TOSSER),
        data.stock?.tosser_out ? JSON.stringify(data.stock.tosser_out) : JSON.stringify(DEFAULT_TOSSER),
        id,
      ]
    );

    // Update remaining_stocks
    await p.query(
      `UPDATE \`remaining_stocks\` SET
       \`ayam_mentah\` = ?,
       \`ayam_mentah_keterangan\` = ?,
       \`goreng_ayam\` = ?,
       \`kulit_mentah\` = ?,
       \`beras\` = ?,
       \`masak_nasi\` = ?,
       \`goreng_ayam_pb\` = ?,
       \`goreng_ayam_pk\` = ?,
       \`goreng_kulit\` = ?,
       \`goreng_kulit_ck\` = ?,
       \`nasi\` = ?,
       \`s_chili_oil\` = ?,
       \`s_geprek\` = ?
       WHERE \`report_id\` = ?`,
      [
        data.remaining_stock?.ayam_mentah || '',
        data.remaining_stock?.ayam_mentah_keterangan || '',
        data.remaining_stock?.goreng_ayam || '',
        data.remaining_stock?.kulit_mentah || '',
        data.remaining_stock?.beras || '',
        data.remaining_stock?.masak_nasi || '',
        data.remaining_stock?.goreng_ayam_pb || '',
        data.remaining_stock?.goreng_ayam_pk || '',
        data.remaining_stock?.goreng_kulit || '',
        data.remaining_stock?.goreng_kulit_ck || '',
        data.remaining_stock?.nasi || '',
        data.remaining_stock?.s_chili_oil || '',
        data.remaining_stock?.s_geprek || '',
        id,
      ]
    );

    // Re-insert sales
    await p.query('DELETE FROM `sales` WHERE report_id = ?', [id]);
    if (Array.isArray(data.sales) && data.sales.length > 0) {
      for (const s of data.sales) {
        await p.query(
          `INSERT INTO \`sales\`
           (\`report_id\`, \`product_id\`, \`product_name\`, \`price\`, \`quantity\`, \`subtotal\`, \`items_composition\`)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            s.product_id || null,
            s.product_name,
            Number(s.price) || 0,
            Number(s.quantity) || 0,
            Number(s.subtotal) || 0,
            s.items_composition ? JSON.stringify(s.items_composition) : null,
          ]
        );
      }
    }

    // Update expenses
    const standardExpenseCols = new Set([
      'gas', 'galon', 'clean_tools', 'kulit', 'meal', 'bonus', 'beras', 'saus', 'minyak', 'lain_lain', 'lain_lain_keterangan', 'total_expense'
    ]);
    const customExpensesObj: Record<string, any> = {};
    if (data.expenses) {
      for (const [k, v] of Object.entries(data.expenses)) {
        if (!standardExpenseCols.has(k) && v !== undefined && v !== null && v !== 0 && v !== '') {
          customExpensesObj[k] = v;
        }
      }
    }
    const customExpensesJson = Object.keys(customExpensesObj).length > 0 ? JSON.stringify(customExpensesObj) : null;

    try {
      await p.query(
        `UPDATE \`expenses\` SET
         \`gas\` = ?,
         \`galon\` = ?,
         \`clean_tools\` = ?,
         \`kulit\` = ?,
         \`meal\` = ?,
         \`bonus\` = ?,
         \`beras\` = ?,
         \`saus\` = ?,
         \`minyak\` = ?,
         \`lain_lain\` = ?,
         \`lain_lain_keterangan\` = ?,
         \`total_expense\` = ?,
         \`custom_expenses\` = ?
         WHERE \`report_id\` = ?`,
        [
          Number(data.expenses?.gas) || 0,
          Number(data.expenses?.galon) || 0,
          Number(data.expenses?.clean_tools) || 0,
          Number(data.expenses?.kulit) || 0,
          Number(data.expenses?.meal) || 0,
          Number(data.expenses?.bonus) || 0,
          Number(data.expenses?.beras) || 0,
          Number(data.expenses?.saus) || 0,
          Number(data.expenses?.minyak) || 0,
          Number(data.expenses?.lain_lain) || 0,
          data.expenses?.lain_lain_keterangan || '',
          totals.total_expense,
          customExpensesJson,
          id,
        ]
      );
    } catch {
      await p.query(
        `UPDATE \`expenses\` SET
         \`gas\` = ?,
         \`galon\` = ?,
         \`clean_tools\` = ?,
         \`kulit\` = ?,
         \`meal\` = ?,
         \`bonus\` = ?,
         \`beras\` = ?,
         \`saus\` = ?,
         \`minyak\` = ?,
         \`lain_lain\` = ?,
         \`lain_lain_keterangan\` = ?,
         \`total_expense\` = ?
         WHERE \`report_id\` = ?`,
        [
          Number(data.expenses?.gas) || 0,
          Number(data.expenses?.galon) || 0,
          Number(data.expenses?.clean_tools) || 0,
          Number(data.expenses?.kulit) || 0,
          Number(data.expenses?.meal) || 0,
          Number(data.expenses?.bonus) || 0,
          Number(data.expenses?.beras) || 0,
          Number(data.expenses?.saus) || 0,
          Number(data.expenses?.minyak) || 0,
          Number(data.expenses?.lain_lain) || 0,
          data.expenses?.lain_lain_keterangan || '',
          totals.total_expense,
          id,
        ]
      );
    }

    // Update payments
    await p.query(
      `UPDATE \`payments\` SET
       \`tunai\` = ?,
       \`qr\` = ?,
       \`tf\` = ?,
       \`total_payment\` = ?
       WHERE \`report_id\` = ?`,
      [
        Number(data.payments?.tunai) || 0,
        Number(data.payments?.qr) || 0,
        Number(data.payments?.tf) || 0,
        totals.total_payment,
        id,
      ]
    );

    return this.getReportById(id);
  },

  async deleteReport(id: number): Promise<boolean> {
    const p = getPool();
    const [res] = await p.query<ResultSetHeader>('DELETE FROM `reports` WHERE report_id = ?', [id]);
    return res.affectedRows > 0;
  },
};
