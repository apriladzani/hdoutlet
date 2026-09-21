import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbService } from './src/server/db.ts';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON Body parsing
  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'HD Fried Chicken Laporan Harian Outlet' });
  });

  // Settings & PIN API
  app.get('/api/settings', (req, res) => {
    try {
      res.json(dbService.getSettings());
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Gagal mengambil pengaturan' });
    }
  });

  app.put('/api/settings/pin', (req, res) => {
    try {
      const { pin } = req.body;
      const result = dbService.updateAdminPin(pin);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal mengubah PIN' });
    }
  });

  // Outlets API
  app.get('/api/outlets', (req, res) => {
    try {
      res.json(dbService.getOutlets());
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil daftar outlet' });
    }
  });

  app.post('/api/outlets', (req, res) => {
    try {
      const outlet = dbService.createOutlet(req.body);
      res.status(201).json(outlet);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan outlet' });
    }
  });

  app.put('/api/outlets/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = dbService.updateOutlet(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Outlet tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui outlet' });
    }
  });

  app.delete('/api/outlets/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = dbService.deleteOutlet(id);
      if (!success) return res.status(404).json({ error: 'Outlet tidak ditemukan' });
      res.json({ success: true, message: 'Outlet berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus outlet' });
    }
  });

  // Master Products (Sales) API
  app.get('/api/products', (req, res) => {
    try {
      const { outlet_type } = req.query;
      const products = dbService.getProducts(outlet_type as string);
      res.json(products);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
  });

  app.post('/api/products', (req, res) => {
    try {
      const product = dbService.createProduct(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan produk' });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = dbService.updateProduct(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Produk tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui produk' });
    }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = dbService.deleteProduct(id);
      if (!success) return res.status(404).json({ error: 'Produk tidak ditemukan' });
      res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus produk' });
    }
  });

  // Master Stock Items API (Beginning Stock)
  app.get('/api/master/stock-items', (req, res) => {
    try {
      res.json(dbService.getStockItems());
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil item stok' });
    }
  });

  app.post('/api/master/stock-items', (req, res) => {
    try {
      const item = dbService.createStockItem(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan item stok' });
    }
  });

  app.put('/api/master/stock-items/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = dbService.updateStockItem(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Item stok tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui item stok' });
    }
  });

  app.delete('/api/master/stock-items/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = dbService.deleteStockItem(id);
      if (!success) return res.status(404).json({ error: 'Item stok tidak ditemukan' });
      res.json({ success: true, message: 'Item stok berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus item stok' });
    }
  });

  // Master Tosser Items API (Tosser In / Out)
  app.get('/api/master/tosser-items', (req, res) => {
    try {
      res.json(dbService.getTosserItems());
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil item tosser' });
    }
  });

  app.post('/api/master/tosser-items', (req, res) => {
    try {
      const item = dbService.createTosserItem(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan item tosser' });
    }
  });

  app.put('/api/master/tosser-items/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = dbService.updateTosserItem(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Item tosser tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui item tosser' });
    }
  });

  app.delete('/api/master/tosser-items/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = dbService.deleteTosserItem(id);
      if (!success) return res.status(404).json({ error: 'Item tosser tidak ditemukan' });
      res.json({ success: true, message: 'Item tosser berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus item tosser' });
    }
  });

  // Master Expense Categories API (Pengeluaran)
  app.get('/api/master/expense-categories', (req, res) => {
    try {
      res.json(dbService.getExpenseCategories());
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil kategori pengeluaran' });
    }
  });

  app.post('/api/master/expense-categories', (req, res) => {
    try {
      const cat = dbService.createExpenseCategory(req.body);
      res.status(201).json(cat);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan kategori pengeluaran' });
    }
  });

  app.put('/api/master/expense-categories/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = dbService.updateExpenseCategory(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Kategori pengeluaran tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui kategori pengeluaran' });
    }
  });

  app.delete('/api/master/expense-categories/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = dbService.deleteExpenseCategory(id);
      if (!success) return res.status(404).json({ error: 'Kategori pengeluaran tidak ditemukan' });
      res.json({ success: true, message: 'Kategori pengeluaran berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus kategori pengeluaran' });
    }
  });

  // Master Ending Stock Items API (Sisa Stok)
  app.get('/api/master/ending-stock-items', (req, res) => {
    try {
      res.json(dbService.getEndingStockItems());
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal mengambil item sisa stok' });
    }
  });

  app.post('/api/master/ending-stock-items', (req, res) => {
    try {
      const item = dbService.createEndingStockItem(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal menambahkan item sisa stok' });
    }
  });

  app.put('/api/master/ending-stock-items/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = dbService.updateEndingStockItem(id, req.body);
      if (!updated) return res.status(404).json({ error: 'Item sisa stok tidak ditemukan' });
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Gagal memperbarui item sisa stok' });
    }
  });

  app.delete('/api/master/ending-stock-items/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const success = dbService.deleteEndingStockItem(id);
      if (!success) return res.status(404).json({ error: 'Item sisa stok tidak ditemukan' });
      res.json({ success: true, message: 'Item sisa stok berhasil dihapus' });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal menghapus item sisa stok' });
    }
  });

  // Get Reports List
  app.get('/api/reports', (req, res) => {
    try {
      const { filter, outlet, startDate, endDate } = req.query;
      const reports = dbService.getReports({
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
  app.get('/api/reports/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID laporan tidak valid' });
      }

      const report = dbService.getReportById(id);
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
  app.post('/api/reports', (req, res) => {
    try {
      const body = req.body;
      if (!body.report_date || !body.outlet_name || !body.staff_name || !String(body.staff_name).trim()) {
        return res.status(400).json({ error: 'Tanggal laporan, nama outlet, dan nama pegawai wajib diisi' });
      }

      const newReport = dbService.createReport(body);
      res.status(201).json(newReport);
    } catch (err: any) {
      console.error('Error creating report:', err);
      res.status(500).json({ error: 'Gagal menyimpan laporan' });
    }
  });

  // Update Report
  app.put('/api/reports/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID laporan tidak valid' });
      }

      const body = req.body;
      if (!body.report_date || !body.outlet_name || !body.staff_name || !String(body.staff_name).trim()) {
        return res.status(400).json({ error: 'Tanggal laporan, nama outlet, dan nama pegawai wajib diisi' });
      }

      const updated = dbService.updateReport(id, body);
      if (!updated) {
        return res.status(404).json({ error: 'Laporan tidak ditemukan' });
      }

      res.json(updated);
    } catch (err: any) {
      console.error('Error updating report:', err);
      res.status(500).json({ error: 'Gagal memperbarui laporan' });
    }
  });

  // Delete Report
  app.delete('/api/reports/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID laporan tidak valid' });
      }

      const success = dbService.deleteReport(id);
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
    // Express 4 wildcard catch-all
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server HD Fried Chicken running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
