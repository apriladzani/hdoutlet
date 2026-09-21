import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbService, initDatabase } from './src/server/db.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body parsing
  app.use(express.json({ limit: '10mb' }));

  // Initialize Database
  try {
    await initDatabase();
    console.log('✅ Connected to MySQL database (hd_fried_chicken)');
  } catch (dbErr: any) {
    console.error('❌ Failed to initialize MySQL database:', dbErr.message);
  }

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'HD Fried Chicken Laporan Harian Outlet', database: 'MySQL' });
  });

  // Settings & PIN API
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await dbService.getSettings();
      res.json(settings);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      res.status(500).json({ error: err.message || 'Gagal mengambil pengaturan' });
    }
  });

  app.put('/api/settings/pin', async (req, res) => {
    try {
      const { pin } = req.body;
      const result = await dbService.updateAdminPin(pin);
      res.json(result);
    } catch (err: any) {
      console.error('Error updating pin:', err);
      res.status(400).json({ error: err.message || 'Gagal mengubah PIN' });
    }
  });

  // Outlets API
  app.get('/api/outlets', async (req, res) => {
    try {
      const outlets = await dbService.getOutlets();
      res.json(outlets);
    } catch (err: any) {
      console.error('Error fetching outlets:', err);
      res.status(500).json({ error: 'Gagal mengambil daftar outlet' });
    }
  });

  app.post('/api/outlets', async (req, res) => {
    try {
      const outlet = await dbService.createOutlet(req.body);
      res.status(201).json(outlet);
    } catch (err: any) {
      console.error('Error creating outlet:', err);
      res.status(400).json({ error: err.message || 'Gagal menambahkan outlet' });
    }
  });

  app.put('/api/outlets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await dbService.updateOutlet(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Outlet tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating outlet:', err);
      res.status(400).json({ error: err.message || 'Gagal memperbarui outlet' });
    }
  });

  app.delete('/api/outlets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await dbService.deleteOutlet(id);
      if (!success) return res.status(404).json({ error: 'Outlet tidak ditemukan' });
      res.json({ success: true, message: 'Outlet berhasil dihapus' });
    } catch (err: any) {
      console.error('Error deleting outlet:', err);
      res.status(500).json({ error: 'Gagal menghapus outlet' });
    }
  });

  // Master Products (Sales) API
  app.get('/api/products', async (req, res) => {
    try {
      const { outlet_type } = req.query;
      const products = await dbService.getProducts(outlet_type as string);
      res.json(products);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
  });

  app.post('/api/products', async (req, res) => {
    try {
      const product = await dbService.createProduct(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      console.error('Error creating product:', err);
      res.status(400).json({ error: err.message || 'Gagal menambahkan produk' });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await dbService.updateProduct(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Produk tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      console.error('Error updating product:', err);
      res.status(400).json({ error: err.message || 'Gagal memperbarui produk' });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await dbService.deleteProduct(id);
      if (!success) return res.status(404).json({ error: 'Produk tidak ditemukan' });
      res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (err: any) {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: 'Gagal menghapus produk' });
    }
  });

  // Master Stock Items API (Beginning Stock)
  app.get('/api/master/stock-items', async (req, res) => {
    try {
      const items = await dbService.getStockItems();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil item stok' });
    }
  });

  app.post('/api/master/stock-items', async (req, res) => {
    try {
      const item = await dbService.createStockItem(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan item stok' });
    }
  });

  app.put('/api/master/stock-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await dbService.updateStockItem(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Item stok tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui item stok' });
    }
  });

  app.delete('/api/master/stock-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await dbService.deleteStockItem(id);
      if (!success) return res.status(404).json({ error: 'Item stok tidak ditemukan' });
      res.json({ success: true, message: 'Item stok berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus item stok' });
    }
  });

  // Master Tosser Items API (Tosser In / Out)
  app.get('/api/master/tosser-items', async (req, res) => {
    try {
      const items = await dbService.getTosserItems();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil item tosser' });
    }
  });

  app.post('/api/master/tosser-items', async (req, res) => {
    try {
      const item = await dbService.createTosserItem(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan item tosser' });
    }
  });

  app.put('/api/master/tosser-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await dbService.updateTosserItem(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Item tosser tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui item tosser' });
    }
  });

  app.delete('/api/master/tosser-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await dbService.deleteTosserItem(id);
      if (!success) return res.status(404).json({ error: 'Item tosser tidak ditemukan' });
      res.json({ success: true, message: 'Item tosser berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus item tosser' });
    }
  });

  // Master Expense Categories API (Pengeluaran)
  app.get('/api/master/expense-categories', async (req, res) => {
    try {
      const categories = await dbService.getExpenseCategories();
      res.json(categories);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil kategori pengeluaran' });
    }
  });

  app.post('/api/master/expense-categories', async (req, res) => {
    try {
      const cat = await dbService.createExpenseCategory(req.body);
      res.status(201).json(cat);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan kategori pengeluaran' });
    }
  });

  app.put('/api/master/expense-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await dbService.updateExpenseCategory(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Kategori pengeluaran tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui kategori pengeluaran' });
    }
  });

  app.delete('/api/master/expense-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await dbService.deleteExpenseCategory(id);
      if (!success) return res.status(404).json({ error: 'Kategori pengeluaran tidak ditemukan' });
      res.json({ success: true, message: 'Kategori pengeluaran berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus kategori pengeluaran' });
    }
  });

  // Master Ending Stock Items API (Sisa Stok)
  app.get('/api/master/ending-stock-items', async (req, res) => {
    try {
      const items = await dbService.getEndingStockItems();
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil item sisa stok' });
    }
  });

  app.post('/api/master/ending-stock-items', async (req, res) => {
    try {
      const item = await dbService.createEndingStockItem(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan item sisa stok' });
    }
  });

  app.put('/api/master/ending-stock-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await dbService.updateEndingStockItem(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Item sisa stok tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui item sisa stok' });
    }
  });

  app.delete('/api/master/ending-stock-items/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = await dbService.deleteEndingStockItem(id);
      if (!success) return res.status(404).json({ error: 'Item sisa stok tidak ditemukan' });
      res.json({ success: true, message: 'Item sisa stok berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus item sisa stok' });
    }
  });

  // Get Reports List
  app.get('/api/reports', async (req, res) => {
    try {
      const { filter, outlet, startDate, endDate } = req.query;
      const reports = await dbService.getReports({
        filter: filter as string,
        outlet: outlet as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.json(reports);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      res.status(500).json({ error: 'Gagal mengambil daftar laporan' });
    }
  });

  // Get Single Report by ID
  app.get('/api/reports/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID laporan tidak valid' });
      }

      const report = await dbService.getReportById(id);
      if (!report) {
        return res.status(404).json({ error: 'Laporan tidak ditemukan' });
      }

      res.json(report);
    } catch (err: any) {
      console.error('Error fetching report detail:', err);
      res.status(500).json({ error: 'Gagal mengambil detail laporan' });
    }
  });

  // Create New Report
  app.post('/api/reports', async (req, res) => {
    try {
      const body = req.body;
      if (!body.report_date || !body.outlet_name || !body.staff_name || !String(body.staff_name).trim()) {
        return res.status(400).json({ error: 'Tanggal laporan, nama outlet, dan nama pegawai wajib diisi' });
      }

      const newReport = await dbService.createReport(body);
      res.status(201).json(newReport);
    } catch (err: any) {
      console.error('Error creating report:', err);
      res.status(500).json({ error: err.message || 'Gagal menyimpan laporan' });
    }
  });

  // Update Report
  app.put('/api/reports/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID laporan tidak valid' });
      }

      const body = req.body;
      if (!body.report_date || !body.outlet_name || !body.staff_name || !String(body.staff_name).trim()) {
        return res.status(400).json({ error: 'Tanggal laporan, nama outlet, dan nama pegawai wajib diisi' });
      }

      const updated = await dbService.updateReport(id, body);
      if (!updated) {
        return res.status(404).json({ error: 'Laporan tidak ditemukan' });
      }

      res.json(updated);
    } catch (err: any) {
      console.error('Error updating report:', err);
      res.status(500).json({ error: err.message || 'Gagal memperbarui laporan' });
    }
  });

  // Delete Report
  app.delete('/api/reports/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID laporan tidak valid' });
      }

      const success = await dbService.deleteReport(id);
      if (!success) {
        return res.status(404).json({ error: 'Laporan tidak ditemukan' });
      }

      res.json({ success: true, message: 'Laporan berhasil dihapus' });
    } catch (err: any) {
      console.error('Error deleting report:', err);
      res.status(500).json({ error: 'Gagal menghapus laporan' });
    }
  });

  // Vite middleware for development or Static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server HD Fried Chicken running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
