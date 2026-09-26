-- =======================================================
-- HD Fried Chicken - Database Schema (MySQL Workbench)
-- Sistem Manajemen Laporan Harian & Penjualan Outlet
-- =======================================================

CREATE DATABASE IF NOT EXISTS `hd_fried_chicken`
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `hd_fried_chicken`;

-- Nonaktifkan pengecekan foreign key sementara saat setup ulang
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `sales`;
DROP TABLE IF EXISTS `remaining_stocks`;
DROP TABLE IF EXISTS `stocks`;
DROP TABLE IF EXISTS `reports`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `outlets`;

SET FOREIGN_KEY_CHECKS = 1;

-- =======================================================
-- 1. TABEL MASTER OUTLET (outlets)
-- Primary Key: outlet_id
-- =======================================================
CREATE TABLE `outlets` (
    `outlet_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `outlet_name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`outlet_id`),
    UNIQUE KEY `uq_outlet_name` (`outlet_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 2. TABEL MASTER PRODUK (products)
-- Primary Key: product_id
-- =======================================================
CREATE TABLE `products` (
    `product_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(100) NOT NULL,
    `selling_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `cost_price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `unit` VARCHAR(20) NOT NULL DEFAULT 'pcs',
    `outlet_type` VARCHAR(20) NOT NULL DEFAULT 'all',
    `description` VARCHAR(255) NULL,
    `barang_id` INT UNSIGNED NULL,
    `ingredients` JSON NULL,
    `items_composition` JSON NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`product_id`),
    UNIQUE KEY `uq_product_name` (`product_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 3. TABEL UTAMA LAPORAN HARIAN (reports)
-- Primary Key: report_id
-- =======================================================
CREATE TABLE `reports` (
    `report_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `report_date` DATE NOT NULL,
    `outlet_id` INT UNSIGNED NULL,
    `outlet_name` VARCHAR(100) NOT NULL,
    `staff_name` VARCHAR(100) NOT NULL DEFAULT '',
    `total_income` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_expense` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `promo` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `promo_note` VARCHAR(255) NULL,
    `final_total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_loss` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `loss_percentage` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `is_balanced` TINYINT(1) NOT NULL DEFAULT 0,
    `balance_difference` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`report_id`),
    INDEX `idx_reports_date` (`report_date`),
    INDEX `idx_reports_outlet_id` (`outlet_id`),
    INDEX `idx_reports_outlet_name` (`outlet_name`),
    CONSTRAINT `fk_reports_outlet` 
        FOREIGN KEY (`outlet_id`) 
        REFERENCES `outlets` (`outlet_id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 4. TABEL STOK AWAL & PRODUKSI (stocks)
-- Primary Key: stock_id
-- =======================================================
CREATE TABLE `stocks` (
    `stock_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `report_id` INT UNSIGNED NOT NULL,
    `ayam_mentah` VARCHAR(50) NOT NULL DEFAULT '',
    `ayam_mentah_keterangan` VARCHAR(255) NULL,
    `goreng_ayam` VARCHAR(50) NULL DEFAULT '',
    `masak_ayam_pb` VARCHAR(50) NULL DEFAULT '',
    `masak_ayam_pk` VARCHAR(50) NULL DEFAULT '',
    `kulit_mentah` VARCHAR(50) NOT NULL DEFAULT '',
    `beras` VARCHAR(50) NOT NULL DEFAULT '',
    `masak_nasi` VARCHAR(50) NULL DEFAULT '',
    `goreng_ayam_pb` VARCHAR(50) NOT NULL DEFAULT '',
    `goreng_ayam_pk` VARCHAR(50) NOT NULL DEFAULT '',
    `goreng_kulit` VARCHAR(50) NOT NULL DEFAULT '',
    `nasi` VARCHAR(50) NOT NULL DEFAULT '',
    `s_chili_oil` VARCHAR(50) NOT NULL DEFAULT '',
    `s_geprek` VARCHAR(50) NOT NULL DEFAULT '',
    -- Detail Tosser Masuk / Keluar (JSON untuk fleksibilitas form harian)
    `tosser_in` JSON NULL,
    `tosser_out` JSON NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`stock_id`),
    UNIQUE KEY `uq_stocks_report_id` (`report_id`),
    CONSTRAINT `fk_stocks_report` 
        FOREIGN KEY (`report_id`) 
        REFERENCES `reports` (`report_id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 5. TABEL SISA STOK (remaining_stocks)
-- Primary Key: remaining_stock_id
-- =======================================================
CREATE TABLE `remaining_stocks` (
    `remaining_stock_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `report_id` INT UNSIGNED NOT NULL,
    `ayam_mentah` VARCHAR(50) NOT NULL DEFAULT '',
    `ayam_mentah_keterangan` VARCHAR(255) NULL,
    `goreng_ayam` VARCHAR(50) NULL DEFAULT '',
    `kulit_mentah` VARCHAR(50) NOT NULL DEFAULT '',
    `beras` VARCHAR(50) NOT NULL DEFAULT '',
    `masak_nasi` VARCHAR(50) NULL DEFAULT '',
    `goreng_ayam_pb` VARCHAR(50) NOT NULL DEFAULT '',
    `goreng_ayam_pk` VARCHAR(50) NOT NULL DEFAULT '',
    `goreng_kulit` VARCHAR(50) NOT NULL DEFAULT '',
    `nasi` VARCHAR(50) NOT NULL DEFAULT '',
    `s_chili_oil` VARCHAR(50) NOT NULL DEFAULT '',
    `s_geprek` VARCHAR(50) NOT NULL DEFAULT '',
    `tosser_in` JSON NULL,
    `tosser_out` JSON NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`remaining_stock_id`),
    UNIQUE KEY `uq_remaining_stocks_report_id` (`report_id`),
    CONSTRAINT `fk_remaining_stocks_report` 
        FOREIGN KEY (`report_id`) 
        REFERENCES `reports` (`report_id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 6. TABEL DETAIL PENJUALAN OFFLINE (sales)
-- Primary Key: sale_id
-- =======================================================
CREATE TABLE `sales` (
    `sale_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `report_id` INT UNSIGNED NOT NULL,
    `product_id` INT UNSIGNED NULL,
    `product_name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `quantity` INT NOT NULL DEFAULT 0,
    `subtotal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`sale_id`),
    INDEX `idx_sales_report_id` (`report_id`),
    INDEX `idx_sales_product_id` (`product_id`),
    CONSTRAINT `fk_sales_report` 
        FOREIGN KEY (`report_id`) 
        REFERENCES `reports` (`report_id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT `fk_sales_product` 
        FOREIGN KEY (`product_id`) 
        REFERENCES `products` (`product_id`) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 7. TABEL PENGELUARAN OPERASIONAL (expenses)
-- Primary Key: expense_id
-- =======================================================
CREATE TABLE `expenses` (
    `expense_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `report_id` INT UNSIGNED NOT NULL,
    `gas` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `galon` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `clean_tools` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `kulit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `meal` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `bonus` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `beras` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `saus` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `minyak` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `lain_lain` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `lain_lain_keterangan` TEXT NULL,
    `total_expense` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`expense_id`),
    UNIQUE KEY `uq_expenses_report_id` (`report_id`),
    CONSTRAINT `fk_expenses_report` 
        FOREIGN KEY (`report_id`) 
        REFERENCES `reports` (`report_id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- 8. TABEL METODE PEMBAYARAN (payments)
-- Primary Key: payment_id
-- =======================================================
CREATE TABLE `payments` (
    `payment_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `report_id` INT UNSIGNED NOT NULL,
    `tunai` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `qr` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `tf` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_payment` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`payment_id`),
    UNIQUE KEY `uq_payments_report_id` (`report_id`),
    CONSTRAINT `fk_payments_report` 
        FOREIGN KEY (`report_id`) 
        REFERENCES `reports` (`report_id`) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================================================
-- SEED DATA DEFAULT (MASTER DATA)
-- =======================================================

-- 1. Insert Data Master Outlets
INSERT INTO `outlets` (`outlet_name`, `is_active`) VALUES
('Cisalak', 1),
('Cieunteung', 1),
('Cigeureung', 1),
('Ciburuyan', 1),
('Aboh', 1),
('BRP', 1),
('Indihiang', 1),
('Taman Sari', 1),
('Kawalu', 1),
('Bantar Malam', 1)
ON DUPLICATE KEY UPDATE `is_active` = VALUES(`is_active`);

-- 2. Insert Data Master Products
INSERT INTO `products` (`product_name`, `selling_price`, `cost_price`, `unit`, `is_active`) VALUES
('Ayam PB', 9000.00, 7000.00, 'pcs', 1),
('Ayam PK', 7000.00, 5500.00, 'pcs', 1),
('Kulit', 5000.00, 3500.00, 'pcs', 1),
('Nasi', 3000.00, 1500.00, 'porsi', 1),
('Chili Oil', 1000.00, 500.00, 'cup', 1),
('Geprek', 2000.00, 1000.00, 'cup', 1)
ON DUPLICATE KEY UPDATE 
    `selling_price` = VALUES(`selling_price`),
    `is_active` = VALUES(`is_active`);

-- =======================================================
-- HELPER VIEW: Rekap Laporan Lengkap untuk Dashboard/Query
-- =======================================================
CREATE OR REPLACE VIEW `v_daily_reports_summary` AS
SELECT 
    r.`report_id`,
    r.`report_date`,
    r.`outlet_name`,
    r.`staff_name`,
    r.`total_income`,
    r.`total_expense`,
    r.`promo`,
    r.`final_total`,
    p.`tunai`,
    p.`qr`,
    p.`tf`,
    p.`total_payment`,
    r.`is_balanced`,
    r.`balance_difference`,
    r.`total_loss`,
    r.`loss_percentage`,
    r.`created_at`
FROM `reports` r
LEFT JOIN `payments` p ON r.`report_id` = p.`report_id`;
