-- ==============================================================================
-- Migration: 001_fix_mineral_water_relation.sql
-- Deskripsi: Perbaikan relasi produk Mineral Water ke barang_id = 11 (Bukan Kulit)
-- Sifat: 100% Backward-compatible, TIDAK MENGHAPUS / MERESET data transaksi existing
-- ==============================================================================

-- 1. Update relasi produk Mineral Water agar barang_id = 11 dan hapus items_composition kulit
UPDATE `products`
SET 
  `barang_id` = 11,
  `ingredients` = '[{"barang_id": 11, "qty": 1}]',
  `items_composition` = NULL
WHERE `product_id` = 113 OR `product_name` LIKE '%Mineral Water%';

-- 2. Pastikan Master Barang #11 (Mineral Water) terdaftar jika belum ada
-- (Catatan: Jika master_barang disimpan dalam app_master_configs, backend akan otomatis sinkron)
INSERT INTO `products` (`product_id`, `product_name`, `selling_price`, `cost_price`, `unit`, `outlet_type`, `description`, `barang_id`, `ingredients`, `items_composition`, `is_active`)
VALUES (113, 'Mineral Water', 5000.00, 0.00, 'pcs', 'modern', 'Mineral Water', 11, '[{"barang_id": 11, "qty": 1}]', NULL, 1)
ON DUPLICATE KEY UPDATE
  `barang_id` = 11,
  `ingredients` = '[{"barang_id": 11, "qty": 1}]',
  `items_composition` = NULL;

-- 3. (Opsional / Recommended) Tambahkan kolom mineral_water pada tabel stocks dan remaining_stocks
-- Query ini aman dan hanya menambahkan kolom baru tanpa memodifikasi kolom/data lama:
-- ALTER TABLE `stocks` ADD COLUMN `mineral_water` VARCHAR(50) NULL DEFAULT '';
-- ALTER TABLE `remaining_stocks` ADD COLUMN `mineral_water` VARCHAR(50) NULL DEFAULT '';
