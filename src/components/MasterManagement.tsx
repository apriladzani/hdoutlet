import React, { useState, useEffect } from 'react';
import {
  Store,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingBag,
  Clock,
  DollarSign,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  RotateCcw,
  Save,
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  Scale,
  Flame,
  Minus,
  Boxes,
} from 'lucide-react';
import {
  ChickenConversionConfig,
  DEFAULT_CHICKEN_CONVERSION,
  DEFAULT_MASTER_BARANG,
  EndingStockMasterItem,
  ExpenseCategoryItem,
  MasterBarangItem,
  OutletItem,
  Product,
  ProductIngredient,
  StockMasterItem,
  TosserMasterItem,
} from '../types.ts';
import { formatRupiah, parseNumber } from '../utils/formatters.ts';

interface MasterManagementProps {
  currentPin: string;
  onPinChangeSuccess: (newPin: string) => void;
  outlets: OutletItem[];
  setOutlets: React.Dispatch<React.SetStateAction<OutletItem[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast: (text: string, type?: 'success' | 'error') => void;
  onLockAdmin?: () => void;
  conversion: ChickenConversionConfig;
  onConversionChange: (newConversion: ChickenConversionConfig) => void;
  expenseCategories?: ExpenseCategoryItem[];
  onExpenseCategoriesChange?: (categories: ExpenseCategoryItem[]) => void;
  stockItems?: StockMasterItem[];
  setStockItems?: React.Dispatch<React.SetStateAction<StockMasterItem[]>>;
  tosserItems?: TosserMasterItem[];
  setTosserItems?: React.Dispatch<React.SetStateAction<TosserMasterItem[]>>;
  endingStockItems?: EndingStockMasterItem[];
  setEndingStockItems?: React.Dispatch<React.SetStateAction<EndingStockMasterItem[]>>;
}

type SubTab =
  | 'barang'
  | 'outlets'
  | 'stock'
  | 'tosser_in'
  | 'tosser_out'
  | 'sales'
  | 'ending_stock'
  | 'expenses'
  | 'conversion'
  | 'security';

export const MasterManagement: React.FC<MasterManagementProps> = ({
  currentPin,
  onPinChangeSuccess,
  outlets,
  setOutlets,
  products,
  setProducts,
  showToast,
  onLockAdmin,
  conversion,
  onConversionChange,
  expenseCategories: propExpenseCategories,
  onExpenseCategoriesChange,
  stockItems: propStockItems,
  setStockItems: propSetStockItems,
  tosserItems: propTosserItems,
  setTosserItems: propSetTosserItems,
  endingStockItems: propEndingStockItems,
  setEndingStockItems: propSetEndingStockItems,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('barang');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Conversion Form State
  const [conversionForm, setConversionForm] = useState<ChickenConversionConfig>(() => ({
    pb_ratio: conversion?.pb_ratio ?? 5,
    pk_ratio: conversion?.pk_ratio ?? 4,
    pb_kg_weight: conversion?.pb_kg_weight ?? 0.5,
    pk_kg_weight: conversion?.pk_kg_weight ?? 0.5,
    masak_nasi_ratio: conversion?.masak_nasi_ratio ?? 12,
  }));
  const [savingConversion, setSavingConversion] = useState<boolean>(false);

  useEffect(() => {
    if (conversion) {
      setConversionForm({
        pb_ratio: conversion.pb_ratio ?? 5,
        pk_ratio: conversion.pk_ratio ?? 4,
        pb_kg_weight: conversion.pb_kg_weight ?? 0.5,
        pk_kg_weight: conversion.pk_kg_weight ?? 0.5,
        masak_nasi_ratio: conversion.masak_nasi_ratio ?? 12,
      });
    }
  }, [conversion]);

  const handleSaveConversion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingConversion(true);
    try {
      const payload: ChickenConversionConfig = {
        pb_ratio: Math.max(1, Number(conversionForm.pb_ratio) || 5),
        pk_ratio: Math.max(1, Number(conversionForm.pk_ratio) || 4),
        pb_kg_weight: Math.max(0.1, Math.round((Number(conversionForm.pb_kg_weight) || 0.5) * 100) / 100),
        pk_kg_weight: Math.max(0.1, Math.round((Number(conversionForm.pk_kg_weight) || 0.5) * 100) / 100),
        masak_nasi_ratio: Math.max(1, Number(conversionForm.masak_nasi_ratio) || 12),
      };

      const res = await fetch('/api/settings/conversion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Gagal menyimpan pengaturan konversi');
      }

      const resData = await res.json();
      const updated = resData.conversion || payload;
      onConversionChange(updated);
      try {
        localStorage.setItem('hd_chicken_conversion', JSON.stringify(updated));
      } catch {}
      showToast('Pengaturan konversi 1kg ayam mentah berhasil diperbarui!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengaturan konversi', 'error');
    } finally {
      setSavingConversion(false);
    }
  };

  const handleResetConversionToDefault = (pb: number = 5, pk: number = 4) => {
    setConversionForm({
      pb_ratio: pb,
      pk_ratio: pk,
      pb_kg_weight: 0.5,
      pk_kg_weight: 0.5,
      masak_nasi_ratio: 12,
    });
  };

  // Master States
  const [masterBarang, setMasterBarang] = useState<MasterBarangItem[]>([]);
  const [stockItems, setStockItems] = useState<StockMasterItem[]>(() => propStockItems || []);
  const [tosserItems, setTosserItems] = useState<TosserMasterItem[]>(() => propTosserItems || []);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryItem[]>(() => propExpenseCategories || []);
  const [endingStockItems, setEndingStockItems] = useState<EndingStockMasterItem[]>(() => propEndingStockItems || []);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (propStockItems && propStockItems.length > 0) {
      setStockItems(propStockItems);
    }
  }, [propStockItems]);

  useEffect(() => {
    if (propTosserItems && propTosserItems.length > 0) {
      setTosserItems(propTosserItems);
    }
  }, [propTosserItems]);

  useEffect(() => {
    if (propEndingStockItems && propEndingStockItems.length > 0) {
      setEndingStockItems(propEndingStockItems);
    }
  }, [propEndingStockItems]);

  useEffect(() => {
    if (propExpenseCategories && propExpenseCategories.length > 0) {
      setExpenseCategories(propExpenseCategories);
    }
  }, [propExpenseCategories]);

  // Sub-filter states
  const [outletTypeFilter, setOutletTypeFilter] = useState<'all' | 'traditional' | 'modern'>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<'all' | 'traditional' | 'modern'>('all');

  // Modal State for CRUD
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);

  // Form Fields for Master Barang Modal
  const [barangForm, setBarangForm] = useState<{
    code: string;
    name: string;
    category: 'raw' | 'ready' | 'other';
    unit: string;
    description: string;
    active: boolean;
  }>({ code: '', name: '', category: 'ready', unit: 'pcs', description: '', active: true });

  // Form Fields for Outlet Modal
  const [outletForm, setOutletForm] = useState<{
    name: string;
    address: string;
    phone: string;
    active: boolean;
    outlet_type: 'traditional' | 'modern';
  }>({ name: '', address: '', phone: '', active: true, outlet_type: 'traditional' });

  // Form Fields for Product Modal (Sales)
  const [productForm, setProductForm] = useState<{
    name: string;
    selling_price: number;
    active: boolean;
    outlet_type: 'traditional' | 'modern' | 'all';
    description: string;
    barang_id: number | '';
    ingredients: Array<{ barang_id: number | ''; qty: number }>;
  }>({ name: '', selling_price: 0, active: true, outlet_type: 'all', description: '', barang_id: '', ingredients: [] });

  // Form Fields for Stock Item Modal (Beginning Stock)
  const [stockForm, setStockForm] = useState<{
    name: string;
    category: 'raw' | 'ready';
    unit: string;
    default_value: string;
    active: boolean;
    barang_id: number | '';
  }>({ name: '', category: 'raw', unit: 'kg', default_value: '', active: true, barang_id: '' });

  // Form Fields for Tosser Item Modal (In / Out)
  const [tosserForm, setTosserForm] = useState<{
    name: string;
    type: 'in' | 'out' | 'both';
    unit: string;
    active: boolean;
    barang_id: number | '';
  }>({ name: '', type: 'both', unit: 'pcs', active: true, barang_id: '' });

  // Form Fields for Expense Category Modal
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    default_amount: 0,
    description: '',
    active: true,
  });

  // Form Fields for Ending Stock Item Modal
  const [endingStockForm, setEndingStockForm] = useState({
    name: '',
    unit: 'pcs',
    tolerance_note: '',
    active: true,
  });

  // PIN Form State
  const [oldPin, setOldPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showOldPin, setShowOldPin] = useState<boolean>(false);
  const [showNewPin, setShowNewPin] = useState<boolean>(false);
  const [isPinSaving, setIsPinSaving] = useState<boolean>(false);

  // Load all master datasets
  const fetchAllMasterData = async () => {
    setLoading(true);
    try {
      const [barangRes, outletsRes, productsRes, stockRes, tosserRes, expenseRes, endingRes] = await Promise.all([
        fetch('/api/master/barang').catch(() => null),
        fetch('/api/outlets').catch(() => null),
        fetch('/api/products').catch(() => null),
        fetch('/api/master/stock-items').catch(() => null),
        fetch('/api/master/tosser-items').catch(() => null),
        fetch('/api/master/expense-categories').catch(() => null),
        fetch('/api/master/ending-stock-items').catch(() => null),
      ]);

      if (barangRes?.ok) {
        const data = await barangRes.json();
        setMasterBarang(data);
      }
      if (outletsRes?.ok) {
        const data = await outletsRes.json();
        setOutlets(data);
      }
      if (productsRes?.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }
      if (stockRes?.ok) {
        const data = await stockRes.json();
        setStockItems(data);
        propSetStockItems?.(data);
      }
      if (tosserRes?.ok) {
        const data = await tosserRes.json();
        setTosserItems(data);
        propSetTosserItems?.(data);
      }
      if (expenseRes?.ok) {
        const data = await expenseRes.json();
        setExpenseCategories(data);
        onExpenseCategoriesChange?.(data);
      }
      if (endingRes?.ok) {
        const data = await endingRes.json();
        setEndingStockItems(data);
        propSetEndingStockItems?.(data);
      }
    } catch (err) {
      console.warn('Gagal memuat beberapa data master:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMasterData();
  }, []);

  // Filter items by search
  const filterBySearch = (name: string, extra?: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || (extra && extra.toLowerCase().includes(q));
  };

  // Helper lookup nama barang dari ID
  const getBarangName = (id?: number) => {
    if (!id) return null;
    const b = masterBarang.find((item) => item.id === id);
    return b ? b.name : `Barang #${id}`;
  };

  const getBarangItem = (id?: number) => {
    if (!id) return null;
    return masterBarang.find((item) => item.id === id);
  };

  // ----------------------------------------------------
  // PIN CHANGE HANDLER
  // ----------------------------------------------------
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin !== currentPin) {
      showToast('PIN Lama salah! Silakan periksa kembali.', 'error');
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      showToast('PIN Baru harus terdiri dari tepat 4 angka (0-9).', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      showToast('Konfirmasi PIN Baru tidak cocok!', 'error');
      return;
    }
    if (newPin === oldPin) {
      showToast('PIN Baru tidak boleh sama dengan PIN Lama.', 'error');
      return;
    }

    setIsPinSaving(true);
    try {
      const res = await fetch('/api/settings/pin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal mengubah PIN');
      }

      onPinChangeSuccess(newPin);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      showToast('PIN Admin berhasil diperbarui menjadi ' + newPin, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal mengubah PIN', 'error');
    } finally {
      setIsPinSaving(false);
    }
  };

  // ----------------------------------------------------
  // OUTLET CRUD
  // ----------------------------------------------------
  const handleOpenOutletModal = (item?: OutletItem) => {
    if (item) {
      setModalMode('edit');
      setCurrentEditItem(item);
      setOutletForm({
        name: item.name,
        address: item.address || '',
        phone: item.phone || '',
        active: item.active,
        outlet_type: item.outlet_type || 'traditional',
      });
    } else {
      setModalMode('create');
      setCurrentEditItem(null);
      setOutletForm({ name: '', address: '', phone: '', active: true, outlet_type: 'traditional' });
    }
    setModalOpen(true);
  };

  const handleSaveOutlet = async () => {
    if (!outletForm.name.trim()) {
      showToast('Nama outlet wajib diisi!', 'error');
      return;
    }
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/outlets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outletForm),
        });
        if (!res.ok) throw new Error('Gagal menambah outlet');
        const created = await res.json();
        setOutlets((prev) => [...prev, created]);
        showToast(`Outlet "${created.name}" berhasil ditambahkan!`, 'success');
      } else {
        const res = await fetch(`/api/outlets/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(outletForm),
        });
        if (!res.ok) throw new Error('Gagal memperbarui outlet');
        const updated = await res.json();
        setOutlets((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        showToast(`Outlet "${updated.name}" berhasil diperbarui!`, 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operasi gagal', 'error');
    }
  };

  const handleDeleteOutlet = async (item: OutletItem) => {
    if (!window.confirm(`Yakin ingin menghapus outlet "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/outlets/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus outlet');
      setOutlets((prev) => prev.filter((o) => o.id !== item.id));
      showToast(`Outlet "${item.name}" berhasil dihapus!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  const handleToggleOutletActive = async (item: OutletItem) => {
    try {
      const res = await fetch(`/api/outlets/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status outlet');
      const updated = await res.json();
      setOutlets((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(`Status outlet "${updated.name}" berhasil diubah.`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // DATA BARANG (MASTER BARANG) CRUD
  // ----------------------------------------------------
  const handleOpenBarangModal = (item?: MasterBarangItem) => {
    if (item) {
      setModalMode('edit');
      setCurrentEditItem(item);
      setBarangForm({
        code: item.code || '',
        name: item.name,
        category: item.category || 'ready',
        unit: item.unit || 'pcs',
        description: item.description || '',
        active: item.active,
      });
    } else {
      setModalMode('create');
      setCurrentEditItem(null);
      setBarangForm({
        code: '',
        name: '',
        category: 'ready',
        unit: 'pcs',
        description: '',
        active: true,
      });
    }
    setModalOpen(true);
  };

  const handleSaveBarang = async () => {
    if (!barangForm.name.trim()) {
      showToast('Nama barang wajib diisi!', 'error');
      return;
    }
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/master/barang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(barangForm),
        });
        if (!res.ok) throw new Error('Gagal menambah data barang');
        const created = await res.json();
        setMasterBarang((prev) => [...prev, created]);
        showToast(`Barang "${created.name}" berhasil ditambahkan!`, 'success');
      } else {
        const res = await fetch(`/api/master/barang/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(barangForm),
        });
        if (!res.ok) throw new Error('Gagal memperbarui data barang');
        const updated = await res.json();
        setMasterBarang((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        showToast(`Barang "${updated.name}" berhasil diperbarui!`, 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operasi gagal', 'error');
    }
  };

  const handleDeleteBarang = async (item: MasterBarangItem) => {
    const usedInStock = stockItems.filter((s) => s.barang_id === item.id);
    const usedInTosser = tosserItems.filter((t) => t.barang_id === item.id);
    const usedInSales = products.filter((p) => p.barang_id === item.id);
    const totalRelations = usedInStock.length + usedInTosser.length + usedInSales.length;

    let confirmMsg = `Yakin ingin menghapus master barang "${item.name}" (ID #${item.id})?`;
    if (totalRelations > 0) {
      confirmMsg += `\n\nPERINGATAN: Barang ini saat ini terhubung dengan:
- ${usedInStock.length} Item Stok Awal
- ${usedInTosser.length} Item Tosser In/Out
- ${usedInSales.length} Menu Sales
Data transaksi akan tetap ada, tetapi relasi barang ini akan terputus.`;
    }

    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/master/barang/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus barang');
      setMasterBarang((prev) => prev.filter((b) => b.id !== item.id));
      showToast(`Barang "${item.name}" berhasil dihapus!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  const handleToggleBarangStatus = async (item: MasterBarangItem) => {
    try {
      const res = await fetch(`/api/master/barang/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status barang');
      const updated = await res.json();
      setMasterBarang((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      showToast(`Status barang "${updated.name}" berhasil diubah.`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // ----------------------------------------------------
  // PRODUCT (SALES) CRUD
  // ----------------------------------------------------
  const handleOpenProductModal = (item?: Product) => {
    if (item) {
      setModalMode('edit');
      setCurrentEditItem(item);
      let initialIngredients: Array<{ barang_id: number | ''; qty: number }> = [];
      if (Array.isArray(item.ingredients) && item.ingredients.length > 0) {
        initialIngredients = item.ingredients.map((ing) => ({
          barang_id: ing.barang_id,
          qty: Math.max(1, Number(ing.qty) || 1),
        }));
      } else if (item.barang_id) {
        initialIngredients = [{ barang_id: item.barang_id, qty: 1 }];
      } else if (item.name && (item.name.toLowerCase().includes('mineral') || item.name.toLowerCase().includes('air mineral'))) {
        initialIngredients = [{ barang_id: 11, qty: 1 }];
      } else if (item.items_composition) {
        const comp = item.items_composition;
        if (comp.pb) initialIngredients.push({ barang_id: 1, qty: comp.pb });
        if (comp.pk) initialIngredients.push({ barang_id: 2, qty: comp.pk });
        if (comp.nasi) initialIngredients.push({ barang_id: 7, qty: comp.nasi });
        if (comp.kulit) initialIngredients.push({ barang_id: 4, qty: comp.kulit });
        if (comp.kulit_ck) initialIngredients.push({ barang_id: 5, qty: comp.kulit_ck });
      }

      setProductForm({
        name: item.name,
        selling_price: item.selling_price,
        active: item.active,
        outlet_type: item.outlet_type || 'traditional',
        description: item.description || '',
        barang_id: item.barang_id ?? (initialIngredients[0]?.barang_id || ''),
        ingredients: initialIngredients.length > 0 ? initialIngredients : [{ barang_id: '', qty: 1 }],
      });
    } else {
      setModalMode('create');
      setCurrentEditItem(null);
      setProductForm({
        name: '',
        selling_price: 0,
        active: true,
        outlet_type: 'traditional',
        description: '',
        barang_id: '',
        ingredients: [{ barang_id: '', qty: 1 }],
      });
    }
    setModalOpen(true);
  };

  const handleAddProductIngredient = () => {
    setProductForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { barang_id: '', qty: 1 }],
    }));
  };

  const handleRemoveProductIngredient = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleProductIngredientChange = (
    index: number,
    field: 'barang_id' | 'qty',
    value: any
  ) => {
    setProductForm((prev) => {
      const next = [...prev.ingredients];
      if (field === 'qty') {
        next[index] = { ...next[index], qty: Math.max(1, parseInt(value, 10) || 1) };
      } else {
        next[index] = { ...next[index], barang_id: value ? Number(value) : '' };
      }
      return { ...prev, ingredients: next };
    });
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      showToast('Nama produk wajib diisi!', 'error');
      return;
    }

    const validIngredients = productForm.ingredients
      .filter((ing) => ing.barang_id !== '' && Number(ing.barang_id) > 0)
      .map((ing) => {
        const b = masterBarang.find((item) => item.id === Number(ing.barang_id));
        return {
          barang_id: Number(ing.barang_id),
          qty: Math.max(1, Number(ing.qty) || 1),
          name: b?.name,
          unit: b?.unit,
        };
      });

    // Derive items_composition for backward compatibility
    const items_composition: Record<string, number> = {};
    for (const ing of validIngredients) {
      if (ing.barang_id === 1) items_composition.pb = (items_composition.pb || 0) + ing.qty;
      else if (ing.barang_id === 2) items_composition.pk = (items_composition.pk || 0) + ing.qty;
      else if (ing.barang_id === 7) items_composition.nasi = (items_composition.nasi || 0) + ing.qty;
      else if (ing.barang_id === 4) items_composition.kulit = (items_composition.kulit || 0) + ing.qty;
      else if (ing.barang_id === 5) items_composition.kulit_ck = (items_composition.kulit_ck || 0) + ing.qty;
    }

    try {
      const payload = {
        name: productForm.name,
        selling_price: productForm.selling_price,
        active: productForm.active,
        outlet_type: productForm.outlet_type,
        description: productForm.description,
        barang_id: validIngredients[0]?.barang_id || (productForm.barang_id ? Number(productForm.barang_id) : undefined),
        ingredients: validIngredients,
        items_composition: Object.keys(items_composition).length > 0 ? items_composition : undefined,
      };
      if (modalMode === 'create') {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal menambah produk');
        const created = await res.json();
        setProducts((prev) => [...prev, created]);
        showToast(`Produk "${created.name}" berhasil ditambahkan!`, 'success');
      } else {
        const res = await fetch(`/api/products/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal memperbarui produk');
        const updated = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast(`Produk "${updated.name}" berhasil diperbarui!`, 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operasi gagal', 'error');
    }
  };

  const handleDeleteProduct = async (item: Product) => {
    if (!window.confirm(`Yakin ingin menghapus menu produk "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus produk');
      setProducts((prev) => prev.filter((p) => p.id !== item.id));
      showToast(`Produk "${item.name}" berhasil dihapus!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  // ----------------------------------------------------
  // BEGINNING STOCK ITEMS CRUD
  // ----------------------------------------------------
  const handleOpenStockModal = (item?: StockMasterItem) => {
    if (item) {
      setModalMode('edit');
      setCurrentEditItem(item);
      setStockForm({
        name: item.name,
        category: item.category,
        unit: item.unit,
        default_value: item.default_value || '',
        active: item.active,
        barang_id: item.barang_id ?? '',
      });
    } else {
      setModalMode('create');
      setCurrentEditItem(null);
      setStockForm({ name: '', category: 'raw', unit: 'kg', default_value: '', active: true, barang_id: '' });
    }
    setModalOpen(true);
  };

  const handleSaveStockItem = async () => {
    if (!stockForm.name.trim()) {
      showToast('Nama item stok wajib diisi!', 'error');
      return;
    }
    try {
      const cleanKey = stockForm.name.toLowerCase().replace(/[^a-z0-9_]/gi, '_').replace(/^_+|_+$/g, '') || `stock_${Date.now()}`;
      const payload = {
        ...stockForm,
        key: currentEditItem?.key || cleanKey,
        barang_id: stockForm.barang_id ? Number(stockForm.barang_id) : undefined,
      };
      if (modalMode === 'create') {
        const res = await fetch('/api/master/stock-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal menambah item stok');
        const created = await res.json();
        setStockItems((prev) => {
          const next = [...prev, created];
          propSetStockItems?.(next);
          return next;
        });
        showToast(`Item stok "${created.name}" berhasil ditambahkan!`, 'success');
      } else {
        const res = await fetch(`/api/master/stock-items/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal memperbarui item stok');
        const updated = await res.json();
        setStockItems((prev) => {
          const next = prev.map((s) => (s.id === updated.id ? updated : s));
          propSetStockItems?.(next);
          return next;
        });
        showToast(`Item stok "${updated.name}" berhasil diperbarui!`, 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operasi gagal', 'error');
    }
  };

  const handleDeleteStockItem = async (item: StockMasterItem) => {
    if (!window.confirm(`Yakin ingin menghapus item stok "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/master/stock-items/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus item');
      setStockItems((prev) => {
        const next = prev.filter((s) => s.id !== item.id);
        propSetStockItems?.(next);
        return next;
      });
      showToast(`Item stok "${item.name}" berhasil dihapus!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  // ----------------------------------------------------
  // TOSSER IN / OUT CRUD
  // ----------------------------------------------------
  const handleOpenTosserModal = (item?: TosserMasterItem, defaultType: 'in' | 'out' = 'in') => {
    if (item) {
      setModalMode('edit');
      setCurrentEditItem(item);
      setTosserForm({
        name: item.name,
        type: item.type,
        unit: item.unit,
        active: item.active,
        barang_id: item.barang_id ?? '',
      });
    } else {
      setModalMode('create');
      setCurrentEditItem(null);
      setTosserForm({
        name: '',
        type: defaultType,
        unit: 'pcs',
        active: true,
        barang_id: '',
      });
    }
    setModalOpen(true);
  };

  const handleSaveTosserItem = async () => {
    if (!tosserForm.name.trim()) {
      showToast('Nama item tosser wajib diisi!', 'error');
      return;
    }
    try {
      const cleanKey = tosserForm.name.toLowerCase().replace(/[^a-z0-9_]/gi, '_').replace(/^_+|_+$/g, '') || `tosser_${Date.now()}`;
      const payload = {
        ...tosserForm,
        key: currentEditItem?.key || cleanKey,
        barang_id: tosserForm.barang_id ? Number(tosserForm.barang_id) : undefined,
      };
      if (modalMode === 'create') {
        const res = await fetch('/api/master/tosser-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal menambah item tosser');
        const created = await res.json();
        setTosserItems((prev) => {
          const next = [...prev, created];
          propSetTosserItems?.(next);
          return next;
        });
        showToast(`Item tosser "${created.name}" berhasil ditambahkan!`, 'success');
      } else {
        const res = await fetch(`/api/master/tosser-items/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal memperbarui item tosser');
        const updated = await res.json();
        setTosserItems((prev) => {
          const next = prev.map((t) => (t.id === updated.id ? updated : t));
          propSetTosserItems?.(next);
          return next;
        });
        showToast(`Item tosser "${updated.name}" berhasil diperbarui!`, 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operasi gagal', 'error');
    }
  };

  const handleDeleteTosserItem = async (item: TosserMasterItem) => {
    if (!window.confirm(`Yakin ingin menghapus item tosser "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/master/tosser-items/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus item');
      setTosserItems((prev) => {
        const next = prev.filter((t) => t.id !== item.id);
        propSetTosserItems?.(next);
        return next;
      });
      showToast(`Item tosser "${item.name}" berhasil dihapus!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  // ----------------------------------------------------
  // ENDING STOCK CRUD
  // ----------------------------------------------------
  const handleOpenEndingStockModal = (item?: EndingStockMasterItem) => {
    if (item) {
      setModalMode('edit');
      setCurrentEditItem(item);
      setEndingStockForm({
        name: item.name,
        unit: item.unit,
        tolerance_note: item.tolerance_note || '',
        active: item.active,
      });
    } else {
      setModalMode('create');
      setCurrentEditItem(null);
      setEndingStockForm({ name: '', unit: 'pcs', tolerance_note: '', active: true });
    }
    setModalOpen(true);
  };

  const handleSaveEndingStockItem = async () => {
    if (!endingStockForm.name.trim()) {
      showToast('Nama item sisa stok wajib diisi!', 'error');
      return;
    }
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/master/ending-stock-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(endingStockForm),
        });
        if (!res.ok) throw new Error('Gagal menambah item sisa stok');
        const created = await res.json();
        setEndingStockItems((prev) => {
          const next = [...prev, created];
          propSetEndingStockItems?.(next);
          return next;
        });
        showToast(`Item sisa stok "${created.name}" berhasil ditambahkan!`, 'success');
      } else {
        const res = await fetch(`/api/master/ending-stock-items/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(endingStockForm),
        });
        if (!res.ok) throw new Error('Gagal memperbarui item');
        const updated = await res.json();
        setEndingStockItems((prev) => {
          const next = prev.map((e) => (e.id === updated.id ? updated : e));
          propSetEndingStockItems?.(next);
          return next;
        });
        showToast(`Item sisa stok "${updated.name}" berhasil diperbarui!`, 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operasi gagal', 'error');
    }
  };

  const handleDeleteEndingStockItem = async (item: EndingStockMasterItem) => {
    if (!window.confirm(`Yakin ingin menghapus item sisa stok "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/master/ending-stock-items/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus item');
      setEndingStockItems((prev) => {
        const next = prev.filter((e) => e.id !== item.id);
        propSetEndingStockItems?.(next);
        return next;
      });
      showToast(`Item sisa stok "${item.name}" berhasil dihapus!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  // ----------------------------------------------------
  // EXPENSE CATEGORIES CRUD
  // ----------------------------------------------------
  const handleOpenExpenseModal = (item?: ExpenseCategoryItem) => {
    if (item) {
      setModalMode('edit');
      setCurrentEditItem(item);
      setExpenseForm({
        name: item.name,
        default_amount: item.default_amount || 0,
        description: item.description || '',
        active: item.active,
      });
    } else {
      setModalMode('create');
      setCurrentEditItem(null);
      setExpenseForm({ name: '', default_amount: 0, description: '', active: true });
    }
    setModalOpen(true);
  };

  const handleSaveExpenseCategory = async () => {
    if (!expenseForm.name.trim()) {
      showToast('Nama pengeluaran wajib diisi!', 'error');
      return;
    }
    try {
      const generatedKey =
        currentEditItem?.key ||
        expenseForm.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/_+/g, '_') ||
        `exp_${Date.now()}`;
      const payload = { ...expenseForm, key: generatedKey };

      if (modalMode === 'create') {
        const res = await fetch('/api/master/expense-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal menambah kategori pengeluaran');
        const created = await res.json();
        setExpenseCategories((prev) => {
          const next = [...prev, created];
          onExpenseCategoriesChange?.(next);
          return next;
        });
        showToast(`Pengeluaran "${created.name}" berhasil ditambahkan!`, 'success');
      } else {
        const res = await fetch(`/api/master/expense-categories/${currentEditItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Gagal memperbarui pengeluaran');
        const updated = await res.json();
        setExpenseCategories((prev) => {
          const next = prev.map((e) => (e.id === updated.id ? updated : e));
          onExpenseCategoriesChange?.(next);
          return next;
        });
        showToast(`Pengeluaran "${updated.name}" berhasil diperbarui!`, 'success');
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Operasi gagal', 'error');
    }
  };

  const handleDeleteExpenseCategory = async (item: ExpenseCategoryItem) => {
    if (!window.confirm(`Yakin ingin menghapus pos pengeluaran "${item.name}"?`)) return;
    try {
      const res = await fetch(`/api/master/expense-categories/${item.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      setExpenseCategories((prev) => {
        const next = prev.filter((e) => e.id !== item.id);
        onExpenseCategoriesChange?.(next);
        return next;
      });
      showToast(`Pengeluaran "${item.name}" berhasil dihapus!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  // Sub tabs definition
  const subTabs = [
    { id: 'barang', label: 'Data Barang', icon: Boxes, count: masterBarang.length },
    { id: 'stock', label: 'Beginning Stock', icon: Package, count: stockItems.length },
    { id: 'tosser_in', label: 'Tosser In', icon: ArrowDownToLine, count: tosserItems.filter(t => t.type === 'in' || t.type === 'both').length },
    { id: 'tosser_out', label: 'Tosser Out', icon: ArrowUpFromLine, count: tosserItems.filter(t => t.type === 'out' || t.type === 'both').length },
    { id: 'sales', label: 'Sales', icon: ShoppingBag, count: products.length },
    { id: 'outlets', label: 'Outlet', icon: Store, count: outlets.length },
    { id: 'ending_stock', label: 'Ending Stock', icon: Clock, count: endingStockItems.length },
    { id: 'expenses', label: 'Pengeluaran', icon: DollarSign, count: expenseCategories.length },
    { id: 'conversion', label: 'Konversi Ayam', icon: Scale },
    { id: 'security', label: 'Ubah PIN', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-150">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-4 sm:p-6 shadow-md border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E4002B] text-white text-[10px] font-black uppercase tracking-wider">
              ADMIN CONTROL PANEL
            </span>
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> PIN Terverifikasi ({currentPin})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Kelola Master Data & Konfigurasi
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Manajemen lengkap Outlet, Stok Awal, Tosser In/Out, Menu Penjualan, Sisa Stok, Pos Pengeluaran, dan Keamanan PIN.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchAllMasterData}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
            title="Muat Ulang Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>
          {onLockAdmin && (
            <button
              type="button"
              onClick={onLockAdmin}
              className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-rose-800/80 cursor-pointer"
              title="Kunci Akses Admin"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>Kunci Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Pill Bar */}
      <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`subtab-${tab.id}`}
                onClick={() => {
                  setActiveSubTab(tab.id as SubTab);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#E4002B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-[#90001a] text-red-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Action Bar (for CRUD tabs) */}
      {activeSubTab !== 'security' && activeSubTab !== 'conversion' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari di ${subTabs.find((t) => t.id === activeSubTab)?.label}...`}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B] transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'barang' && (
              <button
                type="button"
                id="btn-add-barang"
                onClick={() => handleOpenBarangModal()}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Data Barang</span>
              </button>
            )}
            {activeSubTab === 'outlets' && (
              <button
                type="button"
                id="btn-add-outlet"
                onClick={() => handleOpenOutletModal()}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Outlet Baru</span>
              </button>
            )}
            {activeSubTab === 'stock' && (
              <button
                type="button"
                id="btn-add-stock"
                onClick={() => handleOpenStockModal()}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item Stok</span>
              </button>
            )}
            {activeSubTab === 'tosser_in' && (
              <button
                type="button"
                id="btn-add-tosser-in"
                onClick={() => handleOpenTosserModal(undefined, 'in')}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item Tosser In</span>
              </button>
            )}
            {activeSubTab === 'tosser_out' && (
              <button
                type="button"
                id="btn-add-tosser-out"
                onClick={() => handleOpenTosserModal(undefined, 'out')}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item Tosser Out</span>
              </button>
            )}
            {activeSubTab === 'sales' && (
              <button
                type="button"
                id="btn-add-product"
                onClick={() => handleOpenProductModal()}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu Baru</span>
              </button>
            )}
            {activeSubTab === 'ending_stock' && (
              <button
                type="button"
                id="btn-add-ending-stock"
                onClick={() => handleOpenEndingStockModal()}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item Sisa Stok</span>
              </button>
            )}
            {activeSubTab === 'expenses' && (
              <button
                type="button"
                id="btn-add-expense"
                onClick={() => handleOpenExpenseModal()}
                className="px-4 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer min-h-[38px] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pos Pengeluaran</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 0: MASTER DATA BARANG CRUD                  */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'barang' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-purple-600" />
                Master Data Barang ({masterBarang.length} Item)
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Pusat referensi ID barang untuk relasi Beginning Stock, Tosser In, Tosser Out, dan Sales
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-200 font-bold">
              <span>Semua transaksi terikat ke ID Barang unik</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {masterBarang.filter((b) => filterBySearch(b.name, `${b.code} ${b.description}`)).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Tidak ada data barang yang cocok dengan pencarian "{searchQuery}"
              </div>
            ) : (
              masterBarang
                .filter((b) => filterBySearch(b.name, `${b.code} ${b.description}`))
                .map((item) => {
                  const stockCount = stockItems.filter((s) => s.barang_id === item.id).length;
                  const tosserCount = tosserItems.filter((t) => t.barang_id === item.id).length;
                  const salesCount = products.filter((p) => p.barang_id === item.id).length;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            item.category === 'raw'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : item.category === 'ready'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          <span className="text-[11px]">#{item.id}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-slate-900 truncate">
                              {item.name}
                            </h4>
                            {item.code && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {item.code}
                              </span>
                            )}
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                item.category === 'raw'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.category === 'ready'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {item.category === 'raw' ? 'Bahan Mentah' : item.category === 'ready' ? 'Siap Jual' : 'Lainnya'}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.active ? 'Aktif' : 'Non-aktif'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-500">
                            <span>Satuan: <strong className="text-slate-700">{item.unit}</strong></span>
                            {item.description && <span>• {item.description}</span>}
                            <span className="inline-flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold border border-purple-200/60">
                              🔗 Relasi: {stockCount} Stok Awal • {tosserCount} Tosser • {salesCount} Sales
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleBarangStatus(item)}
                          className={`p-2 rounded-xl transition-all cursor-pointer border ${
                            item.active
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                              : 'text-slate-500 bg-slate-100 hover:bg-slate-200 border-slate-200'
                          }`}
                          title={item.active ? 'Non-aktifkan Barang' : 'Aktifkan Barang'}
                        >
                          {item.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenBarangModal(item)}
                          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200"
                          title="Edit Barang"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBarang(item)}
                          className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/70"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 1: OUTLETS CRUD                             */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'outlets' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-700">
                Daftar Outlet HD Fried Chicken ({outlets.length} Outlet Terdaftar)
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Outlet aktif akan muncul otomatis pada opsi formulir harian
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe:</span>
              <button
                type="button"
                onClick={() => setOutletTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  outletTypeFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua ({outlets.length})
              </button>
              <button
                type="button"
                onClick={() => setOutletTypeFilter('traditional')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  outletTypeFilter === 'traditional'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                🏛️ Tradisional ({outlets.filter((o) => (o.outlet_type || 'traditional') === 'traditional').length})
              </button>
              <button
                type="button"
                onClick={() => setOutletTypeFilter('modern')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  outletTypeFilter === 'modern'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                🏬 Modern ({outlets.filter((o) => o.outlet_type === 'modern').length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {outlets
              .filter((o) => (outletTypeFilter === 'all' ? true : (o.outlet_type || 'traditional') === outletTypeFilter))
              .filter((o) => filterBySearch(o.name, o.address)).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Tidak ada outlet yang cocok dengan kriteria filter "{outletTypeFilter}" atau pencarian "{searchQuery}"
              </div>
            ) : (
              outlets
                .filter((o) => (outletTypeFilter === 'all' ? true : (o.outlet_type || 'traditional') === outletTypeFilter))
                .filter((o) => filterBySearch(o.name, o.address))
                .map((outlet, index) => (
                  <div
                    key={outlet.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/20 text-[#E4002B] flex items-center justify-center font-black text-sm shrink-0 border border-red-200/50">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-slate-900 truncate">
                            {outlet.name}
                          </h4>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              (outlet.outlet_type || 'traditional') === 'modern'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {(outlet.outlet_type || 'traditional') === 'modern' ? '🏬 Modern Outlet' : '🏛️ Traditional Outlet'}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              outlet.active
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {outlet.active ? 'Aktif' : 'Non-aktif'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {outlet.address || 'Alamat belum diatur'} {outlet.phone && `• Telp: ${outlet.phone}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleOutletActive(outlet)}
                        className={`p-2 rounded-xl transition-all cursor-pointer text-xs font-bold flex items-center gap-1 border ${
                          outlet.active
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200'
                        }`}
                        title={outlet.active ? 'Nonaktifkan Outlet' : 'Aktifkan Outlet'}
                      >
                        {outlet.active ? (
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="hidden sm:inline">{outlet.active ? 'Aktif' : 'Off'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenOutletModal(outlet)}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200"
                        title="Edit Outlet"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteOutlet(outlet)}
                        className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/70"
                        title="Hapus Outlet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 2: BEGINNING STOCK (STOK AWAL) CRUD        */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'stock' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Master Item Stok Awal ({stockItems.length} Item)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Bahan baku mentah & stok siap jual awal operasional
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {stockItems.filter((s) => filterBySearch(s.name, s.category)).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Tidak ada item stok yang cocok
              </div>
            ) : (
              stockItems
                .filter((s) => filterBySearch(s.name, s.category))
                .map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                          item.category === 'raw'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {item.unit}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              item.category === 'raw'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.category === 'raw' ? 'Bahan Mentah' : 'Siap Jual'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-xs text-slate-500">
                            Satuan: <span className="font-semibold text-slate-700">{item.unit}</span>
                            {item.default_value && ` • Default: ${item.default_value}`}
                          </p>
                          {item.barang_id ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              <Boxes className="w-3 h-3 text-purple-600" />
                              Relasi: <strong>{getBarangName(item.barang_id)}</strong> (ID #{item.barang_id})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              ⚠️ Belum terhubung barang
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenStockModal(item)}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200"
                        title="Edit Item Stok"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStockItem(item)}
                        className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/70"
                        title="Hapus Item Stok"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 3 & 4: TOSSER IN / TOSSER OUT CRUD          */}
      {/* ---------------------------------------------------- */}
      {(activeSubTab === 'tosser_in' || activeSubTab === 'tosser_out') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Master Item {activeSubTab === 'tosser_in' ? 'Tosser In (Transfer Masuk)' : 'Tosser Out (Transfer Keluar)'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Daftar item serah terima stok siap saji antar-outlet & dapur tosser
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {tosserItems
              .filter((t) =>
                activeSubTab === 'tosser_in'
                  ? t.type === 'in' || t.type === 'both'
                  : t.type === 'out' || t.type === 'both'
              )
              .filter((t) => filterBySearch(t.name))
              .map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                        activeSubTab === 'tosser_in'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {activeSubTab === 'tosser_in' ? (
                        <ArrowDownToLine className="w-4 h-4" />
                      ) : (
                        <ArrowUpFromLine className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {item.type === 'both' ? 'In & Out' : item.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-slate-500">
                          Satuan: <span className="font-semibold text-slate-700">{item.unit}</span>
                        </p>
                        {item.barang_id ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                            <Boxes className="w-3 h-3 text-purple-600" />
                            Relasi: <strong>{getBarangName(item.barang_id)}</strong> (ID #{item.barang_id})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                            ⚠️ Belum terhubung barang
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenTosserModal(item, activeSubTab === 'tosser_in' ? 'in' : 'out')
                      }
                      className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200"
                      title="Edit Item Tosser"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTosserItem(item)}
                      className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/70"
                      title="Hapus Item Tosser"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 5: SALES (PRODUK & MENU) CRUD               */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-700">
                Master Produk Penjualan & Daftar Menu ({products.length} Menu)
              </span>
              <p className="text-[11px] text-slate-500 font-medium">
                Pilih menu Traditional vs Modern Outlet untuk formulir kasir
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe Menu:</span>
              <button
                type="button"
                onClick={() => setProductTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productTypeFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setProductTypeFilter('traditional')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productTypeFilter === 'traditional'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                🏛️ Traditional ({products.filter((p) => (p.outlet_type || 'traditional') === 'traditional').length})
              </button>
              <button
                type="button"
                onClick={() => setProductTypeFilter('modern')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  productTypeFilter === 'modern'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                🏬 Modern Paket ({products.filter((p) => p.outlet_type === 'modern').length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {products
              .filter((p) =>
                productTypeFilter === 'all'
                  ? true
                  : (p.outlet_type || 'traditional') === productTypeFilter || p.outlet_type === 'all'
              )
              .filter((p) => filterBySearch(p.name, p.description)).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Tidak ada menu yang cocok dengan kriteria filter "{productTypeFilter}" atau pencarian "{searchQuery}"
              </div>
            ) : (
              products
                .filter((p) =>
                  productTypeFilter === 'all'
                    ? true
                    : (p.outlet_type || 'traditional') === productTypeFilter || p.outlet_type === 'all'
                )
                .filter((p) => filterBySearch(p.name, p.description))
                .map((product) => (
                  <div
                    key={product.id}
                    className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E4002B] flex items-center justify-center font-black text-sm shrink-0 border border-red-200/50">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-slate-900 truncate">
                            {product.name}
                          </h4>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              product.outlet_type === 'modern'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : product.outlet_type === 'traditional'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {product.outlet_type === 'modern'
                              ? '🏬 Modern'
                              : product.outlet_type === 'traditional'
                              ? '🏛️ Traditional'
                              : '🌐 Semua Outlet'}
                          </span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              product.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {product.active ? 'Aktif' : 'Non-aktif'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-xs font-bold text-[#E4002B]">
                            {formatRupiah(product.selling_price)}
                          </p>
                          {product.description && (
                            <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium border border-slate-200/60">
                              {product.description}
                            </span>
                          )}
                          {Array.isArray(product.ingredients) && product.ingredients.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Boxes className="w-3 h-3 text-purple-600" />
                                <span>Komposisi Bahan:</span>
                              </span>
                              {product.ingredients.map((ing, iIdx) => (
                                <span
                                  key={iIdx}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200"
                                >
                                  <strong>{ing.qty}×</strong> {getBarangName(ing.barang_id)} (ID #{ing.barang_id})
                                </span>
                              ))}
                            </div>
                          ) : product.barang_id ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              <Boxes className="w-3 h-3 text-purple-600" />
                              Relasi: <strong>1× {getBarangName(product.barang_id)}</strong> (ID #{product.barang_id})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                              ⚠️ Belum terhubung barang
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenProductModal(product)}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200"
                        title="Edit Menu"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/70"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 6: ENDING STOCK (SISA STOK) CRUD            */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'ending_stock' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Master Item Sisa Stok & Toleransi ({endingStockItems.length} Item)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Konfigurasi sisa stok penutupan outlet dan batas toleransi wajar
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {endingStockItems.filter((e) => filterBySearch(e.name, e.tolerance_note)).map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                    {item.unit}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {item.unit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {item.tolerance_note || 'Belum ada catatan toleransi'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEndingStockModal(item)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Edit Item"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEndingStockItem(item)}
                    className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/70"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 7: PENGELUARAN (EXPENSES) CRUD              */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/90 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Master Pos Pengeluaran Operasional ({expenseCategories.length} Pos)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Kategori pengeluaran harian outlet
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {expenseCategories.filter((e) => filterBySearch(e.name, e.description)).map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 sm:p-4 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-black text-sm shrink-0 border border-rose-200/60">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {cat.name}
                      </h4>
                      {cat.default_amount ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200/50">
                          Default: {formatRupiah(cat.default_amount)}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {cat.description || 'Pengeluaran operasional outlet'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenExpenseModal(cat)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200"
                    title="Edit Pos Pengeluaran"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExpenseCategory(cat)}
                    className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer border border-rose-200/70"
                    title="Hapus Pos Pengeluaran"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 8: KONVERSI 1KG AYAM MENTAH & DAPUR        */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'conversion' && (
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-red-900/60 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#E4002B]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E4002B] to-[#b30022] flex items-center justify-center shadow-lg shrink-0">
                  <Scale className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-500/30">
                      STANDAR DAPUR OUTLET
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Konversi Aktif
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    Pengaturan Konversi 1 kg Ayam Mentah
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed max-w-xl">
                    Tentukan standar potongan 1 kg ayam mentah menjadi olahan siap jual (PB & PK), rasio bobot masak dapur, dan porsi nasi. Nilai ini otomatis menyinkronkan perhitungan stok operasional.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/15 shrink-0 text-center sm:text-right">
                <span className="text-[10px] text-slate-300 font-medium block">Formula 1 kg Saat Ini:</span>
                <span className="text-base font-black text-amber-400">
                  {conversionForm.pb_ratio} PB + {conversionForm.pk_ratio} PK
                </span>
                <span className="text-[10px] text-slate-300 block font-bold">
                  ({Number(conversionForm.pb_ratio) + Number(conversionForm.pk_ratio)} Potong Ayam / kg)
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-300">Pilihan Cepat Standar:</span>
              <button
                type="button"
                onClick={() => handleResetConversionToDefault(5, 4)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  conversionForm.pb_ratio === 5 && conversionForm.pk_ratio === 4
                    ? 'bg-[#E4002B] text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>5 PB + 4 PK (9 Potong)</span>
                <span className="text-[9px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-full">Standar Baru</span>
              </button>
              <button
                type="button"
                onClick={() => handleResetConversionToDefault(6, 4)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  conversionForm.pb_ratio === 6 && conversionForm.pk_ratio === 4
                    ? 'bg-[#E4002B] text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <span>6 PB + 4 PK (10 Potong)</span>
                <span className="text-[9px] bg-slate-700 text-slate-300 font-medium px-1.5 py-0.2 rounded-full">Standar Lama</span>
              </button>
              <button
                type="button"
                onClick={() => handleResetConversionToDefault(6, 6)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  conversionForm.pb_ratio === 6 && conversionForm.pk_ratio === 6
                    ? 'bg-[#E4002B] text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                6 PB + 6 PK (12 Potong)
              </button>
            </div>
          </div>

          {/* Form Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Goreng Ayam PB */}
            <div className="bg-white rounded-2xl border border-red-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-100 text-[#E4002B]">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Olahan Goreng Ayam PB
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Paha Bawah / Sayap
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                    Bagian PB
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {/* Potongan per Olahan */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Potongan Siap Jual (pcs) per 1 Olahan:</span>
                      <span className="text-[#E4002B] font-mono text-sm font-black">{conversionForm.pb_ratio} pcs</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConversionForm(p => ({ ...p, pb_ratio: Math.max(1, (Number(p.pb_ratio) || 0) - 1) }))}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={conversionForm.pb_ratio}
                        onChange={(e) => setConversionForm(p => ({ ...p, pb_ratio: Number(e.target.value) || 0 }))}
                        className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                      />
                      <button
                        type="button"
                        onClick={() => setConversionForm(p => ({ ...p, pb_ratio: Math.min(30, (Number(p.pb_ratio) || 0) + 1) }))}
                        className="w-9 h-9 rounded-xl bg-[#E4002B] hover:bg-[#c40024] text-white font-bold flex items-center justify-center transition-all cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10.5px] text-slate-500 block mt-1">
                      Setiap 1 kali goreng olahan PB akan otomatis menambah <strong>{conversionForm.pb_ratio} pcs</strong> stok siap jual PB.
                    </span>
                  </div>

                  {/* Bobot Mentah per Olahan */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Bobot Ayam Mentah per 1 Olahan (kg):</span>
                      <span className="text-slate-800 font-mono text-sm font-black">{conversionForm.pb_kg_weight} kg</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min={0.1}
                      max={5}
                      value={conversionForm.pb_kg_weight}
                      onChange={(e) => setConversionForm(p => ({ ...p, pb_kg_weight: parseFloat(e.target.value) || 0.5 }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                    <span className="text-[10.5px] text-slate-500 block mt-1">
                      Standar: <strong>0.5 kg</strong> ayam mentah per 1 olahan PB.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 bg-red-50/50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 rounded-b-2xl flex items-center justify-between text-[11px] text-red-950 font-bold">
                <span>Rasio Olahan PB:</span>
                <span className="text-[#E4002B]">
                  1 Olahan = {conversionForm.pb_ratio} pcs ({conversionForm.pb_kg_weight} kg)
                </span>
              </div>
            </div>

            {/* Card 2: Goreng Ayam PK */}
            <div className="bg-white rounded-2xl border border-red-200/80 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-100 text-[#E4002B]">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        Olahan Goreng Ayam PK
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Paha Atas / Dada
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                    Bagian PK
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {/* Potongan per Olahan */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Potongan Siap Jual (pcs) per 1 Olahan:</span>
                      <span className="text-[#E4002B] font-mono text-sm font-black">{conversionForm.pk_ratio} pcs</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConversionForm(p => ({ ...p, pk_ratio: Math.max(1, (Number(p.pk_ratio) || 0) - 1) }))}
                        className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={conversionForm.pk_ratio}
                        onChange={(e) => setConversionForm(p => ({ ...p, pk_ratio: Number(e.target.value) || 0 }))}
                        className="w-full text-center py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                      />
                      <button
                        type="button"
                        onClick={() => setConversionForm(p => ({ ...p, pk_ratio: Math.min(30, (Number(p.pk_ratio) || 0) + 1) }))}
                        className="w-9 h-9 rounded-xl bg-[#E4002B] hover:bg-[#c40024] text-white font-bold flex items-center justify-center transition-all cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-[10.5px] text-slate-500 block mt-1">
                      Setiap 1 kali goreng olahan PK akan otomatis menambah <strong>{conversionForm.pk_ratio} pcs</strong> stok siap jual PK.
                    </span>
                  </div>

                  {/* Bobot Mentah per Olahan */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Bobot Ayam Mentah per 1 Olahan (kg):</span>
                      <span className="text-slate-800 font-mono text-sm font-black">{conversionForm.pk_kg_weight} kg</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min={0.1}
                      max={5}
                      value={conversionForm.pk_kg_weight}
                      onChange={(e) => setConversionForm(p => ({ ...p, pk_kg_weight: parseFloat(e.target.value) || 0.5 }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                    <span className="text-[10.5px] text-slate-500 block mt-1">
                      Standar: <strong>0.5 kg</strong> ayam mentah per 1 olahan PK.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 bg-red-50/50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-3 rounded-b-2xl flex items-center justify-between text-[11px] text-red-950 font-bold">
                <span>Rasio Olahan PK:</span>
                <span className="text-[#E4002B]">
                  1 Olahan = {conversionForm.pk_ratio} pcs ({conversionForm.pk_kg_weight} kg)
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Konversi Masak Nasi */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="text-amber-500">🍚</span> Konversi Masak Nasi (Beras)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Berapa porsi nasi siap jual yang dihasilkan dari setiap 1 kg beras dimasak.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-600">Porsi per 1 kg Beras:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setConversionForm(p => ({ ...p, masak_nasi_ratio: Math.max(1, (Number(p.masak_nasi_ratio) || 12) - 1) }))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={conversionForm.masak_nasi_ratio ?? 12}
                    onChange={(e) => setConversionForm(p => ({ ...p, masak_nasi_ratio: Number(e.target.value) || 12 }))}
                    className="w-16 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                  />
                  <button
                    type="button"
                    onClick={() => setConversionForm(p => ({ ...p, masak_nasi_ratio: Math.min(30, (Number(p.masak_nasi_ratio) || 12) + 1) }))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-500">porsi</span>
              </div>
            </div>
          </div>

          {/* Interactive Simulation / Live Breakdown Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Simulasi Perhitungan 1 kg Ayam Mentah
              </span>
              <span className="text-[10px] text-slate-300 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                Otomatisasi Sistem
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">Bahan Baku Utama</span>
                <span className="text-lg font-black text-white block mt-0.5">1 kg</span>
                <span className="text-[10px] text-red-300 font-bold">Ayam Mentah Utuh</span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">Pembagian Dapur</span>
                <span className="text-lg font-black text-amber-300 block mt-0.5">
                  {conversionForm.pb_ratio} PB + {conversionForm.pk_ratio} PK
                </span>
                <span className="text-[10px] text-slate-300 font-bold">
                  ({conversionForm.pb_kg_weight} kg PB + {conversionForm.pk_kg_weight} kg PK)
                </span>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-center">
                <span className="text-[10px] text-emerald-300 block font-medium">Total Potongan Siap Jual</span>
                <span className="text-lg font-black text-emerald-400 block mt-0.5">
                  {Number(conversionForm.pb_ratio) + Number(conversionForm.pk_ratio)} Potong
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">per 1 kg ayam mentah</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 bg-black/30 p-2.5 rounded-xl border border-white/5 leading-relaxed">
              💡 <strong>Alur Otomatis di Form Operasional:</strong> Saat staf memasukkan <em>Goreng Ayam PB: 1</em>, sistem otomatis mengisi <strong>+{conversionForm.pb_ratio} pcs</strong> stok siap jual PB dan mengurangi <strong>{conversionForm.pb_kg_weight} kg</strong> ayam mentah. Demikian juga dengan PK bertambah <strong>+{conversionForm.pk_ratio} pcs</strong> dan mengurangi <strong>{conversionForm.pk_kg_weight} kg</strong> ayam mentah.
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <button
              type="button"
              onClick={() => handleResetConversionToDefault(5, 4)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Standar (5 PB + 4 PK)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveConversion()}
              disabled={savingConversion}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E4002B] hover:bg-[#c40024] disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {savingConversion ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Konversi</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-VIEW 9: KEAMANAN & UBAH PIN ADMIN               */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'security' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
          <div className="bg-slate-900 p-6 text-white text-center relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E4002B] to-[#b30022] mx-auto flex items-center justify-center shadow-lg mb-3">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Ubah Kode PIN Admin
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
              PIN ini digunakan untuk mengamankan halaman Riwayat Laporan dan Kelola Master Data.
            </p>
          </div>

          <form onSubmit={handleSavePin} className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                PIN aktif saat ini:{' '}
                <strong className="font-mono bg-amber-200 px-1.5 py-0.5 rounded text-amber-950">
                  {currentPin}
                </strong>
              </span>
            </div>

            {/* Input PIN Lama */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Masukkan PIN Lama <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showOldPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="PIN lama (misal: 0825)"
                  required
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPin(!showOldPin)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showOldPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Input PIN Baru */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Masukkan 4 Digit PIN Baru <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNewPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Contoh: 1234"
                  required
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Harus tepat 4 angka (misal: 0825, 1234, 5678).
              </span>
            </div>

            {/* Konfirmasi PIN Baru */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Konfirmasi PIN Baru <span className="text-red-500">*</span>
              </label>
              <input
                type={showNewPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Ulangi 4 digit PIN baru"
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                id="btn-save-new-pin"
                disabled={isPinSaving || newPin.length !== 4 || confirmPin.length !== 4}
                className="w-full py-3 px-4 bg-[#E4002B] hover:bg-[#c40024] active:bg-[#a0001e] disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
              >
                <Save className="w-4 h-4" />
                <span>{isPinSaving ? 'Menyimpan...' : 'SIMPAN PIN BARU'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* UNIVERSAL CRUD MODAL FOR MASTER ITEMS                */}
      {/* ==================================================== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {modalMode === 'create' ? 'Tambah ' : 'Edit '}
                  {activeSubTab === 'barang' && 'Data Barang'}
                  {activeSubTab === 'outlets' && 'Outlet'}
                  {activeSubTab === 'stock' && 'Item Stok Awal'}
                  {activeSubTab === 'tosser_in' && 'Item Tosser In'}
                  {activeSubTab === 'tosser_out' && 'Item Tosser Out'}
                  {activeSubTab === 'sales' && 'Menu Produk'}
                  {activeSubTab === 'ending_stock' && 'Item Sisa Stok'}
                  {activeSubTab === 'expenses' && 'Pos Pengeluaran'}
                </h3>
                <p className="text-xs text-slate-300">Lengkapi formulir di bawah ini</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Master Barang Form */}
              {activeSubTab === 'barang' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Barang <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={barangForm.name}
                      onChange={(e) => setBarangForm({ ...barangForm, name: e.target.value })}
                      placeholder="Contoh: Ayam PB, Beras, Minyak Goreng"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kode Barang</label>
                      <input
                        type="text"
                        value={barangForm.code}
                        onChange={(e) => setBarangForm({ ...barangForm, code: e.target.value })}
                        placeholder="Contoh: BRG-PB"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Satuan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={barangForm.unit}
                        onChange={(e) => setBarangForm({ ...barangForm, unit: e.target.value })}
                        placeholder="pcs, kg, porsi, cup"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Barang</label>
                    <select
                      value={barangForm.category}
                      onChange={(e) =>
                        setBarangForm({
                          ...barangForm,
                          category: e.target.value as 'raw' | 'ready' | 'other',
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    >
                      <option value="ready">🍗 Barang Siap Jual (Goreng Ayam PB, PK, Nasi, Sambal)</option>
                      <option value="raw">📦 Bahan Mentah / Dapur (Ayam Mentah, Beras, Kulit Mentah)</option>
                      <option value="other">🛠️ Lainnya / Logistik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Catatan</label>
                    <input
                      type="text"
                      value={barangForm.description}
                      onChange={(e) => setBarangForm({ ...barangForm, description: e.target.value })}
                      placeholder="Catatan tambahan spesifikasi barang"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                </>
              )}

              {/* Outlet Form */}
              {activeSubTab === 'outlets' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Outlet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={outletForm.name}
                      onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })}
                      placeholder="Contoh: Cisalak, Kawalu, BRP, dll."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori / Tipe Outlet <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={outletForm.outlet_type}
                      onChange={(e) =>
                        setOutletForm({
                          ...outletForm,
                          outlet_type: e.target.value as 'traditional' | 'modern',
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    >
                      <option value="traditional">🏛️ Traditional Outlet (Menu Satuan Biasa)</option>
                      <option value="modern">🏬 Modern Outlet (Menu Paket: Hemat, Double, Family dll.)</option>
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Jika <strong>Traditional Outlet</strong>, formulir kasir menampilkan menu satuan biasa. Jika <strong>Modern Outlet</strong>, menampilkan menu paket.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat</label>
                    <input
                      type="text"
                      value={outletForm.address}
                      onChange={(e) => setOutletForm({ ...outletForm, address: e.target.value })}
                      placeholder="Alamat lengkap outlet"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor Telepon / Kontak
                    </label>
                    <input
                      type="text"
                      value={outletForm.phone}
                      onChange={(e) => setOutletForm({ ...outletForm, phone: e.target.value })}
                      placeholder="0812..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                </>
              )}

              {/* Product Form */}
              {activeSubTab === 'sales' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Menu / Produk <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Contoh: Ayam PB, Hemat 1, Family"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Harga Jual (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={productForm.selling_price || ''}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          selling_price: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      placeholder="Contoh: 20000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori / Tipe Outlet untuk Menu Ini
                    </label>
                    <select
                      value={productForm.outlet_type}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          outlet_type: e.target.value as 'traditional' | 'modern' | 'all',
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    >
                      <option value="traditional">🏛️ Traditional Outlet Saja</option>
                      <option value="modern">🏬 Modern Outlet Saja</option>
                      <option value="all">🌐 Semua Tipe Outlet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Keterangan / Komposisi Isi Paket
                    </label>
                    <input
                      type="text"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Contoh: 1 pk + 1 nasi, 3 pb + 2 pk + 5 nasi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Komposisi paket (seperti "1 pk + 1 nasi") akan digunakan untuk kalkulasi otomatis pengurangan sisa stok.
                    </p>
                  </div>
                  {/* Relasi Bahan & Stok (One-to-Many Multi-Ingredient) */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-800">
                          Relasi Bahan Baku & Stok <span className="text-[#E4002B]">*</span>
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Satu menu dapat memiliki beberapa bahan sekaligus (Format: <strong>Nama Bahan + Qty Pemakaian</strong>).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddProductIngredient}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#E4002B] rounded-lg text-xs font-bold transition-all flex items-center gap-1 border border-red-200 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Bahan</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto p-0.5">
                      {productForm.ingredients.length === 0 ? (
                        <div className="p-3 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500">
                          Belum ada relasi bahan. Klik <strong>"+ Tambah Bahan"</strong> untuk menambahkan komponen bahan (misal: Ayam PK, Nasi, dll).
                        </div>
                      ) : (
                        productForm.ingredients.map((ing, idx) => {
                          const selectedB = masterBarang.find((b) => b.id === Number(ing.barang_id));
                          return (
                            <div
                              key={idx}
                              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 transition-all hover:border-slate-300"
                            >
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>

                              {/* Barang Dropdown */}
                              <div className="flex-1 min-w-0">
                                <select
                                  value={ing.barang_id}
                                  onChange={(e) => handleProductIngredientChange(idx, 'barang_id', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E4002B]"
                                >
                                  <option value="">-- Pilih Bahan Baku / Stok --</option>
                                  {masterBarang.map((b) => (
                                    <option key={b.id} value={b.id}>
                                      [ID #{b.id}] {b.name} ({b.unit})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Qty Pemakaian Input */}
                              <div className="w-28 shrink-0 flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-slate-400">Qty:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={ing.qty || 1}
                                  onChange={(e) => handleProductIngredientChange(idx, 'qty', e.target.value)}
                                  className="w-14 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-[#E4002B]"
                                  title="Jumlah pemakaian bahan per 1 menu terjual"
                                />
                                <span className="text-[11px] font-bold text-slate-500 truncate">
                                  {selectedB?.unit || 'pcs'}
                                </span>
                              </div>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveProductIngredient(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                                title="Hapus bahan ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {productForm.ingredients.length > 0 && productForm.ingredients.some((i) => i.barang_id) && (
                      <div className="mt-2.5 p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-800 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Perhitungan Pengurangan Stok:</strong>
                          <div className="text-slate-700 mt-0.5">
                            Setiap 1 {productForm.name || 'menu'} terjual, memotong:{' '}
                            <span className="font-bold text-[#E4002B]">
                              {productForm.ingredients
                                .filter((i) => i.barang_id)
                                .map((i) => {
                                  const b = masterBarang.find((mb) => mb.id === Number(i.barang_id));
                                  return `${i.qty}× ${b?.name || `ID #${i.barang_id}`}`;
                                })
                                .join(' dan ')}
                            </span>.
                          </div>
                          <div className="text-slate-500 text-[10px] italic mt-0.5">
                            Formula: Stok Berkurang = Qty Sales × Qty Pemakaian Bahan
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Stock Item Form */}
              {activeSubTab === 'stock' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Item Stok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={stockForm.name}
                      onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                      placeholder="Contoh: Ayam Mentah, Nasi, Kulit Mentah"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={stockForm.category}
                        onChange={(e) =>
                          setStockForm({ ...stockForm, category: e.target.value as 'raw' | 'ready' })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      >
                        <option value="raw">Bahan Mentah</option>
                        <option value="ready">Siap Jual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Satuan</label>
                      <input
                        type="text"
                        value={stockForm.unit}
                        onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })}
                        placeholder="kg, pcs, dll"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      >
                      </input>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relasi ke Data Barang (ID Barang) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={stockForm.barang_id ?? ''}
                      onChange={(e) =>
                        setStockForm({
                          ...stockForm,
                          barang_id: e.target.value ? Number(e.target.value) : '',
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    >
                      <option value="">-- Pilih Barang Terkait --</option>
                      {masterBarang.map((b) => (
                        <option key={b.id} value={b.id}>
                          [ID #{b.id}] {b.name} ({b.unit}) {b.code ? `[${b.code}]` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Stok awal akan terhubung langsung ke ID barang yang dipilih.
                    </p>
                  </div>
                </>
              )}

              {/* Tosser Item Form */}
              {(activeSubTab === 'tosser_in' || activeSubTab === 'tosser_out') && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Item Tosser <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tosserForm.name}
                      onChange={(e) => setTosserForm({ ...tosserForm, name: e.target.value })}
                      placeholder="Contoh: Goreng Ayam PB, S. Chili Oil"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Tosser</label>
                      <select
                        value={tosserForm.type}
                        onChange={(e) =>
                          setTosserForm({ ...tosserForm, type: e.target.value as 'in' | 'out' | 'both' })
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      >
                        <option value="both">In & Out</option>
                        <option value="in">Hanya Masuk (In)</option>
                        <option value="out">Hanya Keluar (Out)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Satuan</label>
                      <input
                        type="text"
                        value={tosserForm.unit}
                        onChange={(e) => setTosserForm({ ...tosserForm, unit: e.target.value })}
                        placeholder="pcs, porsi, botol"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relasi ke Data Barang (ID Barang) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tosserForm.barang_id ?? ''}
                      onChange={(e) =>
                        setTosserForm({
                          ...tosserForm,
                          barang_id: e.target.value ? Number(e.target.value) : '',
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    >
                      <option value="">-- Pilih Barang Terkait --</option>
                      {masterBarang.map((b) => (
                        <option key={b.id} value={b.id}>
                          [ID #{b.id}] {b.name} ({b.unit}) {b.code ? `[${b.code}]` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Contoh: Tosser "PB" terhubung ke ID Barang Ayam PB. Jika nama barang diedit, transaksi tetap terhubung.
                    </p>
                  </div>
                </>
              )}

              {/* Ending Stock Form */}
              {activeSubTab === 'ending_stock' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Item Sisa Stok <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={endingStockForm.name}
                      onChange={(e) => setEndingStockForm({ ...endingStockForm, name: e.target.value })}
                      placeholder="Contoh: Goreng Ayam PB, Beras Sisa"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Satuan</label>
                    <input
                      type="text"
                      value={endingStockForm.unit}
                      onChange={(e) => setEndingStockForm({ ...endingStockForm, unit: e.target.value })}
                      placeholder="pcs, kg, porsi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Catatan Batas Toleransi / Wajar
                    </label>
                    <input
                      type="text"
                      value={endingStockForm.tolerance_note}
                      onChange={(e) =>
                        setEndingStockForm({ ...endingStockForm, tolerance_note: e.target.value })
                      }
                      placeholder="Contoh: Maks 2 pcs batas wajar saat tutup"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </>
              )}

              {/* Expense Category Form */}
              {activeSubTab === 'expenses' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Pos Pengeluaran <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expenseForm.name}
                      onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                      placeholder="Contoh: Gas LPG, Sabun Cuci, Air Galon"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nominal Standar / Default (Rp)
                    </label>
                    <input
                      type="number"
                      value={expenseForm.default_amount || ''}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          default_amount: Math.max(0, parseInt(e.target.value, 10) || 0),
                        })
                      }
                      placeholder="Contoh: 8000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#E4002B]/20 focus:border-[#E4002B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Deskripsi</label>
                    <input
                      type="text"
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      placeholder="Deskripsi pos pengeluaran"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-save-master-item"
                onClick={() => {
                  if (activeSubTab === 'barang') handleSaveBarang();
                  else if (activeSubTab === 'outlets') handleSaveOutlet();
                  else if (activeSubTab === 'sales') handleSaveProduct();
                  else if (activeSubTab === 'stock') handleSaveStockItem();
                  else if (activeSubTab === 'tosser_in' || activeSubTab === 'tosser_out')
                    handleSaveTosserItem();
                  else if (activeSubTab === 'ending_stock') handleSaveEndingStockItem();
                  else if (activeSubTab === 'expenses') handleSaveExpenseCategory();
                }}
                className="px-5 py-2 bg-[#E4002B] hover:bg-[#c40024] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
