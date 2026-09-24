import { SaleItem, StockData, TosserData, ChickenConversionConfig, DEFAULT_CHICKEN_CONVERSION } from '../types.ts';

export interface TosserProductConfig {
  key: keyof TosserData;
  label: string;
  unit: string;
  placeholder: string;
  offlineProductName: string;
}

export const EMPTY_TOSSER_DATA: TosserData = {
  goreng_ayam_pb: '',
  goreng_ayam_pk: '',
  goreng_kulit: '',
  goreng_kulit_ck: '',
  nasi: '',
  s_chili_oil: '',
  s_geprek: '',
};

export const TOSSER_PRODUCTS: TosserProductConfig[] = [
  { key: 'goreng_ayam_pb', label: 'Goreng Ayam PB', unit: 'pcs', placeholder: '0', offlineProductName: 'Ayam PB' },
  { key: 'goreng_ayam_pk', label: 'Goreng Ayam PK', unit: 'pcs', placeholder: '0', offlineProductName: 'Ayam PK' },
  { key: 'goreng_kulit', label: 'Goreng Kulit', unit: 'pcs', placeholder: '0', offlineProductName: 'Kulit' },
  { key: 'goreng_kulit_ck', label: 'Goreng Kulit CK', unit: 'pcs', placeholder: '0', offlineProductName: 'Kulit CK' },
  { key: 'nasi', label: 'Nasi', unit: 'pcs', placeholder: '0', offlineProductName: 'Nasi' },
  { key: 's_chili_oil', label: 'S. Chili Oil', unit: 'pcs', placeholder: '0', offlineProductName: 'Chili Oil' },
  { key: 's_geprek', label: 'S. Geprek', unit: 'pcs', placeholder: '0', offlineProductName: 'Geprek' },
];

export type SellableStockKey =
  | 'goreng_ayam_pb'
  | 'goreng_ayam_pk'
  | 'goreng_kulit'
  | 'goreng_kulit_ck'
  | 'nasi'
  | 's_chili_oil'
  | 's_geprek';

export interface ProductStockMapping {
  productId: number;
  productName: string;
  stockKey: SellableStockKey;
  label: string;
  unit: string;
}

// Only products available in Pemasukan Offline
// Raw materials (ayam_mentah, kulit_mentah, beras) are intentionally excluded
export const PRODUCT_STOCK_MAPPINGS: ProductStockMapping[] = [
  { productId: 1, productName: 'Ayam PB', stockKey: 'goreng_ayam_pb', label: 'Goreng Ayam PB', unit: 'pcs' },
  { productId: 2, productName: 'Ayam PK', stockKey: 'goreng_ayam_pk', label: 'Goreng Ayam PK', unit: 'pcs' },
  { productId: 3, productName: 'Kulit', stockKey: 'goreng_kulit', label: 'Goreng Kulit', unit: 'pcs' },
  { productId: 7, productName: 'Kulit CK', stockKey: 'goreng_kulit_ck', label: 'Goreng Kulit CK', unit: 'pcs' },
  { productId: 4, productName: 'Nasi', stockKey: 'nasi', label: 'Nasi', unit: 'pcs' },
  { productId: 5, productName: 'Chili Oil', stockKey: 's_chili_oil', label: 'S. Chili Oil', unit: 'pcs' },
  { productId: 6, productName: 'Geprek', stockKey: 's_geprek', label: 'S. Geprek', unit: 'pcs' },
];

export const RAW_MATERIAL_KEYS: Array<{ key: keyof StockData; label: string; unit: string }> = [
  { key: 'ayam_mentah', label: 'Ayam Mentah', unit: 'kg' },
  { key: 'beras', label: 'Beras', unit: 'kg' },
];

export interface RawMaterialCalculationResult {
  key: 'ayam_mentah' | 'beras';
  label: string;
  unit: string;
  initialStock: number | null;
  usedStock: number;
  usedLabel: string;
  usedUnit: string;
  remainingQty: number;
  remainingDescription?: string;
  isCalculated: boolean;
}

export interface ChickenRemainingDetail {
  totalRemainingKg: number;
  remainingPbKg: number;
  remainingPkKg: number;
  description: string;
}

/**
 * Calculates raw chicken remaining detail:
 * 1 kg whole chicken consists of:
 * - 0.5 kg PB cut (yields 6 pcs PB)
 * - 0.5 kg PK cut (yields 4 pcs PK)
 *
 * Example:
 * If initial raw chicken = 1 kg and Goreng Ayam PB = 1 (uses 0.5 kg PB),
 * Remaining raw chicken = 0.5 kg Ayam PK!
 */
export function calculateChickenRemainingDetail(
  rawAyamKg: number | null,
  pbCookCount: number,
  pkCookCount: number,
  config?: Partial<ChickenConversionConfig>
): ChickenRemainingDetail {
  if (rawAyamKg === null || isNaN(rawAyamKg)) {
    return {
      totalRemainingKg: 0,
      remainingPbKg: 0,
      remainingPkKg: 0,
      description: '',
    };
  }

  const pbWeight = config?.pb_kg_weight ?? AYAM_PB_KG_WEIGHT;
  const pkWeight = config?.pk_kg_weight ?? AYAM_PK_KG_WEIGHT;
  const totalPairWeight = pbWeight + pkWeight;
  const pbRatioFraction = totalPairWeight > 0 ? pbWeight / totalPairWeight : 0.5;
  const pkRatioFraction = totalPairWeight > 0 ? pkWeight / totalPairWeight : 0.5;

  const initialPbKg = Math.round(rawAyamKg * pbRatioFraction * 100) / 100;
  const initialPkKg = Math.round(rawAyamKg * pkRatioFraction * 100) / 100;

  const usedPbKg = Math.round(Math.max(0, pbCookCount) * pbWeight * 100) / 100;
  const usedPkKg = Math.round(Math.max(0, pkCookCount) * pkWeight * 100) / 100;

  const remPbKg = Math.round(Math.max(0, initialPbKg - usedPbKg) * 100) / 100;
  const remPkKg = Math.round(Math.max(0, initialPkKg - usedPkKg) * 100) / 100;
  const totalRem = Math.round((remPbKg + remPkKg) * 100) / 100;

  let description = '';
  if (totalRem === 0 && (usedPbKg > 0 || usedPkKg > 0)) {
    description = 'Habis (0 kg)';
  } else {
    // Setiap pasangan PB + PK dihitung sebagai ayam utuh
    const pairCount = pbWeight > 0 && pkWeight > 0 ? Math.min(remPbKg / pbWeight, remPkKg / pkWeight) : 0;
    const wholeChickenKg = Math.round(pairCount * totalPairWeight * 100) / 100;
    const excessPb = Math.round(Math.max(0, remPbKg - pairCount * pbWeight) * 100) / 100;
    const excessPk = Math.round(Math.max(0, remPkKg - pairCount * pkWeight) * 100) / 100;

    if (wholeChickenKg > 0 && excessPk > 0) {
      description = `${wholeChickenKg} kg ${excessPk} Ayam PK`;
    } else if (wholeChickenKg > 0 && excessPb > 0) {
      description = `${wholeChickenKg} kg ${excessPb} Ayam PB`;
    } else if (wholeChickenKg > 0) {
      description = `${wholeChickenKg} kg`;
    } else if (excessPk > 0) {
      description = `${excessPk} Ayam PK`;
    } else if (excessPb > 0) {
      description = `${excessPb} Ayam PB`;
    } else if (totalRem > 0) {
      description = `${totalRem} kg`;
    }
  }

  return {
    totalRemainingKg: totalRem,
    remainingPbKg: remPbKg,
    remainingPkKg: remPkKg,
    description,
  };
}

/**
 * Calculates remaining stock for raw kitchen materials:
 * - Sisa Ayam Mentah = Stok Awal Ayam Mentah - Stok Awal Goreng Ayam (PB & PK)
 * - Sisa Beras = Stok Awal Beras - Stok Awal Masak Nasi
 */
export function calculateRawMaterialsRemaining(
  stock: StockData,
  config?: Partial<ChickenConversionConfig>
): Record<'ayam_mentah' | 'beras', RawMaterialCalculationResult> {
  const ayamInitial = parseStockQuantity(stock.ayam_mentah);
  const pbCount = parseStockQuantity(stock.masak_ayam_pb) || 0;
  const pkCount = parseStockQuantity(stock.masak_ayam_pk) || 0;
  const legacyGoreng = parseStockQuantity(stock.goreng_ayam);

  let ayamUsed = 0;
  let usedLabel = 'Goreng Ayam PB & PK';
  let chickenDetail: ChickenRemainingDetail = {
    totalRemainingKg: 0,
    remainingPbKg: 0,
    remainingPkKg: 0,
    description: '',
  };

  if (stock.masak_ayam_pb !== undefined || stock.masak_ayam_pk !== undefined || (pbCount > 0 || pkCount > 0)) {
    chickenDetail = calculateChickenRemainingDetail(ayamInitial, pbCount, pkCount, config);
    ayamUsed = calculateChickenTotalCookKg(pbCount, pkCount, config);
    const parts: string[] = [];
    if (pbCount > 0) parts.push(`PB: ${pbCount}`);
    if (pkCount > 0) parts.push(`PK: ${pkCount}`);
    usedLabel = parts.length > 0 ? `Goreng (${parts.join(', ')})` : 'Goreng Ayam';
  } else if (legacyGoreng !== null) {
    ayamUsed = legacyGoreng;
    usedLabel = 'Goreng Ayam';
    const pbWeight = config?.pb_kg_weight ?? AYAM_PB_KG_WEIGHT;
    const pkWeight = config?.pk_kg_weight ?? AYAM_PK_KG_WEIGHT;
    const totalPairWeight = pbWeight + pkWeight;
    const rem = ayamInitial !== null ? Math.round(Math.max(0, ayamInitial - ayamUsed) * 100) / 100 : 0;
    chickenDetail = {
      totalRemainingKg: rem,
      remainingPbKg: Math.round(rem * (pbWeight / totalPairWeight) * 100) / 100,
      remainingPkKg: Math.round(rem * (pkWeight / totalPairWeight) * 100) / 100,
      description: rem > 0 ? `${rem} kg` : 'Habis (0 kg)',
    };
  }

  const isAyamCalculated = ayamInitial !== null;
  const ayamRem = isAyamCalculated ? chickenDetail.totalRemainingKg : 0;

  const berasInitial = parseStockQuantity(stock.beras);
  const berasUsed = parseStockQuantity(stock.masak_nasi) || 0;
  const isBerasCalculated = berasInitial !== null;
  const berasRem = isBerasCalculated ? Math.round(Math.max(0, berasInitial - berasUsed) * 100) / 100 : 0;

  return {
    ayam_mentah: {
      key: 'ayam_mentah',
      label: 'Ayam Mentah',
      unit: 'kg',
      initialStock: ayamInitial,
      usedStock: ayamUsed,
      usedLabel,
      usedUnit: 'kg',
      remainingQty: ayamRem,
      remainingDescription: chickenDetail.description,
      isCalculated: isAyamCalculated,
    },
    beras: {
      key: 'beras',
      label: 'Beras',
      unit: 'kg',
      initialStock: berasInitial,
      usedStock: berasUsed,
      usedLabel: 'Masak Nasi',
      usedUnit: 'kg',
      remainingQty: berasRem,
      isCalculated: isBerasCalculated,
    },
  };
}

/**
 * Cooking / processing conversion ratios:
 * 1 Goreng Ayam PB -> 0.5 kg ayam mentah -> auto input 5 Goreng Ayam PB (pcs)
 * 1 Goreng Ayam PK -> 0.5 kg ayam mentah -> auto input 4 Goreng Ayam PK (pcs)
 * (1 kg ayam mentah = 5 PB + 4 PK)
 * 1 kg Beras (masak nasi) -> auto input 12 pcs Nasi
 */
export const AYAM_PB_KG_WEIGHT = 0.5; // 0.5 kg ayam mentah per 1 olahan PB
export const AYAM_PK_KG_WEIGHT = 0.5; // 0.5 kg ayam mentah per 1 olahan PK
export const GORENG_AYAM_PB_RATIO = 5; // 5 pcs PB per 0.5 kg (1 kg ayam mentah = 5 PB + 4 PK)
export const GORENG_AYAM_PK_RATIO = 4; // 4 pcs PK per 0.5 kg
export const MASAK_NASI_RATIO = 12;

export function calculateChickenPbCook(count: number, config?: Partial<ChickenConversionConfig>): { pcs: number; kg: number } {
  const safeCount = Math.max(0, isNaN(count) ? 0 : count);
  const pbRatio = config?.pb_ratio ?? GORENG_AYAM_PB_RATIO;
  const pbWeight = config?.pb_kg_weight ?? AYAM_PB_KG_WEIGHT;
  return {
    pcs: safeCount * pbRatio,
    kg: Math.round(safeCount * pbWeight * 100) / 100,
  };
}

export function calculateChickenPkCook(count: number, config?: Partial<ChickenConversionConfig>): { pcs: number; kg: number } {
  const safeCount = Math.max(0, isNaN(count) ? 0 : count);
  const pkRatio = config?.pk_ratio ?? GORENG_AYAM_PK_RATIO;
  const pkWeight = config?.pk_kg_weight ?? AYAM_PK_KG_WEIGHT;
  return {
    pcs: safeCount * pkRatio,
    kg: Math.round(safeCount * pkWeight * 100) / 100,
  };
}

export function calculateChickenTotalCookKg(pbCount: number, pkCount: number, config?: Partial<ChickenConversionConfig>): number {
  const pbWeight = config?.pb_kg_weight ?? AYAM_PB_KG_WEIGHT;
  const pkWeight = config?.pk_kg_weight ?? AYAM_PK_KG_WEIGHT;
  const pbKg = (Math.max(0, isNaN(pbCount) ? 0 : pbCount)) * pbWeight;
  const pkKg = (Math.max(0, isNaN(pkCount) ? 0 : pkCount)) * pkWeight;
  return Math.round((pbKg + pkKg) * 100) / 100;
}

export function calculateChickenBatch(ayamCount: number, config?: Partial<ChickenConversionConfig>): { pb: number; pk: number } {
  const safeCount = Math.max(0, isNaN(ayamCount) ? 0 : ayamCount);
  const pbRatio = config?.pb_ratio ?? GORENG_AYAM_PB_RATIO;
  const pkRatio = config?.pk_ratio ?? GORENG_AYAM_PK_RATIO;
  return {
    pb: safeCount * pbRatio,
    pk: safeCount * pkRatio,
  };
}

export function calculateRiceBatch(kg: number, config?: Partial<ChickenConversionConfig>): number {
  const safeKg = Math.max(0, isNaN(kg) ? 0 : kg);
  const ratio = config?.masak_nasi_ratio ?? MASAK_NASI_RATIO;
  return Math.round(safeKg * ratio);
}

/**
 * Package component requirement details
 */
export interface PackageComponentRequirement {
  stockKey: SellableStockKey;
  label: string;
  shortLabel: string;
  unit: string;
  qtyPerPackage: number;
}

export interface ComponentStockStatus {
  key: SellableStockKey;
  label: string;
  shortLabel: string;
  unit: string;
  requiredPerItem: number;
  initialStock: number | null;
  soldQty: number;
  remainingQty: number | null;
}

export interface ProductStockSummary {
  isPackage: boolean;
  components: ComponentStockStatus[];
  hasAnyStockFilled: boolean;
  hasAllStockFilled: boolean;
  maxFromInitialStock: number | null;
  maxAllowedQuantity: number;
  additionalAvailable: number;
  canAddMore: boolean;
  exhaustedComponents: string[];
  initialStockText: string;
  remainingStockText: string;
  unitLabel: string;
  isOutOfStock: boolean;
  isAtMax: boolean;
}

/**
 * Returns required stock components for any product or package
 */
export function getProductRequirements(item: {
  product_id?: number;
  product_name?: string;
  name?: string;
  description?: string;
  items_composition?: {
    pb?: number;
    pk?: number;
    nasi?: number;
    kulit?: number;
    kulit_ck?: number;
  };
}): PackageComponentRequirement[] {
  const name = (item.product_name || item.name || '').toLowerCase().trim();
  const nameNorm = name.replace(/\s+/g, '');
  const id = item.product_id;

  // 1. If explicit items_composition is provided
  if (item.items_composition && Object.keys(item.items_composition).length > 0) {
    const reqs: PackageComponentRequirement[] = [];
    if (item.items_composition.pb) {
      reqs.push({
        stockKey: 'goreng_ayam_pb',
        label: 'Ayam PB',
        shortLabel: 'PB',
        unit: 'pcs',
        qtyPerPackage: item.items_composition.pb,
      });
    }
    if (item.items_composition.pk) {
      reqs.push({
        stockKey: 'goreng_ayam_pk',
        label: 'Ayam PK',
        shortLabel: 'PK',
        unit: 'pcs',
        qtyPerPackage: item.items_composition.pk,
      });
    }
    if (item.items_composition.nasi) {
      reqs.push({
        stockKey: 'nasi',
        label: 'Nasi',
        shortLabel: 'Nasi',
        unit: 'porsi',
        qtyPerPackage: item.items_composition.nasi,
      });
    }
    if (item.items_composition.kulit) {
      reqs.push({
        stockKey: 'goreng_kulit',
        label: 'Kulit',
        shortLabel: 'Kulit',
        unit: 'pcs',
        qtyPerPackage: item.items_composition.kulit,
      });
    }
    if (item.items_composition.kulit_ck) {
      reqs.push({
        stockKey: 'goreng_kulit_ck',
        label: 'Kulit CK',
        shortLabel: 'Kulit CK',
        unit: 'pcs',
        qtyPerPackage: item.items_composition.kulit_ck,
      });
    }
    if (reqs.length > 0) return reqs;
  }

  // 1b. Check barang_id relation if present
  const barangId = (item as any).barang_id;
  if (barangId === 1) return [{ stockKey: 'goreng_ayam_pb', label: 'Ayam PB', shortLabel: 'PB', unit: 'pcs', qtyPerPackage: 1 }];
  if (barangId === 2) return [{ stockKey: 'goreng_ayam_pk', label: 'Ayam PK', shortLabel: 'PK', unit: 'pcs', qtyPerPackage: 1 }];
  if (barangId === 4) return [{ stockKey: 'goreng_kulit', label: 'Kulit', shortLabel: 'Kulit', unit: 'pcs', qtyPerPackage: 1 }];
  if (barangId === 5) return [{ stockKey: 'goreng_kulit_ck', label: 'Kulit CK', shortLabel: 'Kulit CK', unit: 'pcs', qtyPerPackage: 1 }];
  if (barangId === 7) return [{ stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: 1 }];
  if (barangId === 9) return [{ stockKey: 's_chili_oil', label: 'Chili Oil', shortLabel: 'Chili Oil', unit: 'cup', qtyPerPackage: 1 }];
  if (barangId === 10) return [{ stockKey: 's_geprek', label: 'Geprek', shortLabel: 'Geprek', unit: 'cup', qtyPerPackage: 1 }];

  // 2. Traditional single items
  if (id === 1 || name === 'ayam pb') {
    return [{ stockKey: 'goreng_ayam_pb', label: 'Ayam PB', shortLabel: 'PB', unit: 'pcs', qtyPerPackage: 1 }];
  }
  if (id === 2 || name === 'ayam pk') {
    return [{ stockKey: 'goreng_ayam_pk', label: 'Ayam PK', shortLabel: 'PK', unit: 'pcs', qtyPerPackage: 1 }];
  }
  if (id === 3 || name === 'kulit') {
    return [{ stockKey: 'goreng_kulit', label: 'Kulit', shortLabel: 'Kulit', unit: 'pcs', qtyPerPackage: 1 }];
  }
  if (id === 7 || name === 'kulit ck' || nameNorm === 'kulitck') {
    return [{ stockKey: 'goreng_kulit_ck', label: 'Kulit CK', shortLabel: 'Kulit CK', unit: 'pcs', qtyPerPackage: 1 }];
  }
  if (id === 4 || name === 'nasi') {
    return [{ stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: 1 }];
  }
  if (id === 5 || name === 'chili oil') {
    return [{ stockKey: 's_chili_oil', label: 'Chili Oil', shortLabel: 'Chili Oil', unit: 'cup', qtyPerPackage: 1 }];
  }
  if (id === 6 || name === 'geprek') {
    return [{ stockKey: 's_geprek', label: 'Geprek', shortLabel: 'Geprek', unit: 'cup', qtyPerPackage: 1 }];
  }

  // 3. Modern Packages by ID or Name
  // Hemat 1 / Paket Ori 1 / Paket BB 1 / Paket LH 1 / Paket HJ 1: 1 pk + 1 nasi
  if (
    id === 101 ||
    id === 105 ||
    id === 107 ||
    id === 109 ||
    id === 111 ||
    nameNorm.includes('hemat1') ||
    nameNorm.includes('ori1') ||
    nameNorm.includes('bb1') ||
    nameNorm.includes('lh1') ||
    nameNorm.includes('hj1')
  ) {
    return [
      { stockKey: 'goreng_ayam_pk', label: 'Ayam PK', shortLabel: 'PK', unit: 'pcs', qtyPerPackage: 1 },
      { stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: 1 },
    ];
  }

  // Hemat 2 / Paket Ori 2 / Paket BB 2 / Paket LH 2 / Paket HJ 2: 1 pb + 1 nasi
  if (
    id === 102 ||
    id === 106 ||
    id === 108 ||
    id === 110 ||
    id === 112 ||
    nameNorm.includes('hemat2') ||
    nameNorm.includes('ori2') ||
    nameNorm.includes('bb2') ||
    nameNorm.includes('lh2') ||
    nameNorm.includes('hj2')
  ) {
    return [
      { stockKey: 'goreng_ayam_pb', label: 'Ayam PB', shortLabel: 'PB', unit: 'pcs', qtyPerPackage: 1 },
      { stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: 1 },
    ];
  }

  // Double: 1 pk + 1 pb + 1 nasi
  if (id === 103 || nameNorm.includes('double')) {
    return [
      { stockKey: 'goreng_ayam_pb', label: 'Ayam PB', shortLabel: 'PB', unit: 'pcs', qtyPerPackage: 1 },
      { stockKey: 'goreng_ayam_pk', label: 'Ayam PK', shortLabel: 'PK', unit: 'pcs', qtyPerPackage: 1 },
      { stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: 1 },
    ];
  }

  // Family: 3 pb + 2 pk + 5 nasi
  if (id === 104 || nameNorm.includes('family')) {
    return [
      { stockKey: 'goreng_ayam_pb', label: 'Ayam PB', shortLabel: 'PB', unit: 'pcs', qtyPerPackage: 3 },
      { stockKey: 'goreng_ayam_pk', label: 'Ayam PK', shortLabel: 'PK', unit: 'pcs', qtyPerPackage: 2 },
      { stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: 5 },
    ];
  }

  // Extra / Ala Carte
  if (id === 117 || nameNorm.includes('kulitck')) {
    return [{ stockKey: 'goreng_kulit_ck', label: 'Kulit CK', shortLabel: 'Kulit CK', unit: 'pcs', qtyPerPackage: 1 }];
  }
  if (id === 113 || nameNorm.includes('kulit')) {
    return [{ stockKey: 'goreng_kulit', label: 'Kulit', shortLabel: 'Kulit', unit: 'pcs', qtyPerPackage: 1 }];
  }
  if (id === 114 || nameNorm.includes('nasi')) {
    return [{ stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: 1 }];
  }
  if (id === 115 || nameNorm.includes('chilioil')) {
    return [{ stockKey: 's_chili_oil', label: 'Chili Oil', shortLabel: 'Chili Oil', unit: 'cup', qtyPerPackage: 1 }];
  }
  if (id === 116 || nameNorm.includes('geprek')) {
    return [{ stockKey: 's_geprek', label: 'Geprek', shortLabel: 'Geprek', unit: 'cup', qtyPerPackage: 1 }];
  }

  // 4. Fallback: Parse from description string
  if (item.description) {
    const desc = item.description.toLowerCase();
    const reqs: PackageComponentRequirement[] = [];

    const pbMatch = desc.match(/(\d+)\s*pb/);
    if (pbMatch) {
      reqs.push({ stockKey: 'goreng_ayam_pb', label: 'Ayam PB', shortLabel: 'PB', unit: 'pcs', qtyPerPackage: parseInt(pbMatch[1], 10) });
    } else if (desc.includes('pb')) {
      reqs.push({ stockKey: 'goreng_ayam_pb', label: 'Ayam PB', shortLabel: 'PB', unit: 'pcs', qtyPerPackage: 1 });
    }

    const pkMatch = desc.match(/(\d+)\s*pk/);
    if (pkMatch) {
      reqs.push({ stockKey: 'goreng_ayam_pk', label: 'Ayam PK', shortLabel: 'PK', unit: 'pcs', qtyPerPackage: parseInt(pkMatch[1], 10) });
    } else if (desc.includes('pk')) {
      reqs.push({ stockKey: 'goreng_ayam_pk', label: 'Ayam PK', shortLabel: 'PK', unit: 'pcs', qtyPerPackage: 1 });
    }

    const nasiMatch = desc.match(/(\d+)\s*nasi/);
    if (nasiMatch) {
      reqs.push({ stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: parseInt(nasiMatch[1], 10) });
    } else if (desc.includes('nasi')) {
      reqs.push({ stockKey: 'nasi', label: 'Nasi', shortLabel: 'Nasi', unit: 'porsi', qtyPerPackage: 1 });
    }

    const kulitMatch = desc.match(/(\d+)\s*kulit/);
    if (kulitMatch) {
      reqs.push({ stockKey: 'goreng_kulit', label: 'Kulit', shortLabel: 'Kulit', unit: 'pcs', qtyPerPackage: parseInt(kulitMatch[1], 10) });
    } else if (desc.includes('kulit')) {
      reqs.push({ stockKey: 'goreng_kulit', label: 'Kulit', shortLabel: 'Kulit', unit: 'pcs', qtyPerPackage: 1 });
    }

    if (reqs.length > 0) return reqs;
  }

  return [];
}

/**
 * Computes comprehensive stock status for any product / package row in SalesSection
 */
export function getProductStockSummary(
  item: SaleItem,
  stock: StockData,
  sales: SaleItem[]
): ProductStockSummary {
  const reqs = getProductRequirements(item);
  const isPackage = reqs.length > 1 || (reqs.length === 1 && reqs[0].qtyPerPackage > 1);
  const soldUnits = calculateSoldUnitsFromSales(sales);

  if (reqs.length === 0) {
    return {
      isPackage: false,
      components: [],
      hasAnyStockFilled: true,
      hasAllStockFilled: true,
      maxFromInitialStock: null,
      maxAllowedQuantity: 999999,
      additionalAvailable: 999999,
      canAddMore: true,
      exhaustedComponents: [],
      initialStockText: '',
      remainingStockText: '',
      unitLabel: 'pcs',
      isOutOfStock: false,
      isAtMax: false,
    };
  }

  const components: ComponentStockStatus[] = reqs.map((r) => {
    const rawVal = stock[r.stockKey];
    const initialStock = parseStockQuantity(rawVal);
    const soldQty = soldUnits[r.stockKey] || 0;
    const remainingQty = initialStock !== null ? Math.max(0, initialStock - soldQty) : null;
    return {
      key: r.stockKey,
      label: r.label,
      shortLabel: r.shortLabel,
      unit: r.unit,
      requiredPerItem: r.qtyPerPackage,
      initialStock,
      soldQty,
      remainingQty,
    };
  });

  const hasAnyStockFilled = components.some((c) => c.initialStock !== null);
  const hasAllStockFilled = components.every((c) => c.initialStock !== null);

  let maxFromInitialStock: number | null = null;
  if (hasAllStockFilled) {
    const limits = components.map((c) => Math.floor((c.initialStock || 0) / c.requiredPerItem));
    maxFromInitialStock = Math.max(0, Math.min(...limits));
  }

  const unitLabel = isPackage ? 'paket' : components[0]?.unit || 'pcs';

  let initialStockText = '';
  let remainingStockText = '';

  if (hasAllStockFilled) {
    if (!isPackage && components.length === 1) {
      initialStockText = `${components[0].initialStock} ${components[0].unit}`;
      remainingStockText = `${components[0].remainingQty} ${components[0].unit}`;
    } else {
      initialStockText = components.map((c) => `${c.initialStock} ${c.shortLabel}`).join(' • ');
      remainingStockText = components.map((c) => `${c.remainingQty} ${c.shortLabel}`).join(' • ');
    }
  } else if (hasAnyStockFilled) {
    initialStockText = components
      .map((c) => (c.initialStock !== null ? `${c.initialStock} ${c.shortLabel}` : `? ${c.shortLabel}`))
      .join(' • ');
  }

  // Calculate how many MORE units of THIS specific item can be added right now
  // Note: components[i].remainingQty already has this item's current quantity subtracted.
  let additionalAvailable = 0;
  if (hasAllStockFilled) {
    const limits = components.map((c) =>
      c.remainingQty !== null ? Math.floor(c.remainingQty / c.requiredPerItem) : 0
    );
    additionalAvailable = Math.max(0, Math.min(...limits));
  }

  const currentQty = Math.max(0, Number(item.quantity) || 0);
  const maxAllowedQuantity = hasAllStockFilled ? currentQty + additionalAvailable : 0;
  const canAddMore = hasAllStockFilled && additionalAvailable > 0;

  // Identify exhausted components that prevent adding this item
  const exhaustedComponents: string[] = [];
  if (hasAllStockFilled) {
    for (const c of components) {
      const rem = c.remainingQty ?? 0;
      if (rem < c.requiredPerItem) {
        if (rem <= 0) {
          exhaustedComponents.push(`${c.shortLabel} Habis`);
        } else {
          exhaustedComponents.push(`${c.shortLabel} sisa ${rem} (butuh ${c.requiredPerItem})`);
        }
      }
    }
  }

  // isOutOfStock: starting stock was 0 for at least one required component
  const isOutOfStock = hasAllStockFilled && maxFromInitialStock === 0;

  // isAtMax: cannot add more because available component pool is exhausted
  const isAtMax = hasAllStockFilled && !isOutOfStock && !canAddMore;

  return {
    isPackage,
    components,
    hasAnyStockFilled,
    hasAllStockFilled,
    maxFromInitialStock,
    maxAllowedQuantity,
    additionalAvailable,
    canAddMore,
    exhaustedComponents,
    initialStockText,
    remainingStockText,
    unitLabel,
    isOutOfStock,
    isAtMax,
  };
}

/**
 * Computes consumed stock units from both Traditional & Modern package sales
 */
export function calculateSoldUnitsFromSales(sales: SaleItem[]): Record<SellableStockKey, number> {
  const units: Record<SellableStockKey, number> = {
    goreng_ayam_pb: 0,
    goreng_ayam_pk: 0,
    goreng_kulit: 0,
    goreng_kulit_ck: 0,
    nasi: 0,
    s_chili_oil: 0,
    s_geprek: 0,
  };

  if (!Array.isArray(sales)) return units;

  for (const item of sales) {
    const qty = Math.max(0, Number(item.quantity) || 0);
    if (qty <= 0) continue;

    const reqs = getProductRequirements(item);
    for (const req of reqs) {
      units[req.stockKey] += req.qtyPerPackage * qty;
    }
  }

  return units;
}

/**
 * Ensures sales items strictly fit within the total available stock in Section 1.
 * If total sold of any component exceeds initial stock, excess quantities are clamped safely.
 */
export function clampSalesToStock(
  sales: SaleItem[],
  stock: StockData
): { clampedSales: SaleItem[]; hasChanges: boolean } {
  if (!Array.isArray(sales) || sales.length === 0) {
    return { clampedSales: sales, hasChanges: false };
  }

  const availableStock: Record<SellableStockKey, number | null> = {
    goreng_ayam_pb: parseStockQuantity(stock.goreng_ayam_pb),
    goreng_ayam_pk: parseStockQuantity(stock.goreng_ayam_pk),
    goreng_kulit: parseStockQuantity(stock.goreng_kulit),
    goreng_kulit_ck: parseStockQuantity(stock.goreng_kulit_ck),
    nasi: parseStockQuantity(stock.nasi),
    s_chili_oil: parseStockQuantity(stock.s_chili_oil),
    s_geprek: parseStockQuantity(stock.s_geprek),
  };

  const runningRemaining: Record<SellableStockKey, number> = {
    goreng_ayam_pb: availableStock.goreng_ayam_pb ?? 0,
    goreng_ayam_pk: availableStock.goreng_ayam_pk ?? 0,
    goreng_kulit: availableStock.goreng_kulit ?? 0,
    goreng_kulit_ck: availableStock.goreng_kulit_ck ?? 0,
    nasi: availableStock.nasi ?? 0,
    s_chili_oil: availableStock.s_chili_oil ?? 0,
    s_geprek: availableStock.s_geprek ?? 0,
  };

  let hasChanges = false;
  const clampedSales = sales.map((item) => {
    const reqs = getProductRequirements(item);
    if (reqs.length === 0) return item;

    const hasUnfilledStock = reqs.some((r) => availableStock[r.stockKey] === null);
    if (hasUnfilledStock) {
      if (item.quantity !== 0) {
        hasChanges = true;
        return { ...item, quantity: 0, subtotal: 0 };
      }
      return item;
    }

    const limits = reqs.map((r) => Math.floor(runningRemaining[r.stockKey] / r.qtyPerPackage));
    const maxPossible = Math.max(0, Math.min(...limits));

    const safeQty = Math.max(0, Math.min(item.quantity, maxPossible));
    if (safeQty !== item.quantity) {
      hasChanges = true;
    }

    for (const r of reqs) {
      runningRemaining[r.stockKey] = Math.max(0, runningRemaining[r.stockKey] - safeQty * r.qtyPerPackage);
    }

    if (safeQty !== item.quantity) {
      return {
        ...item,
        quantity: safeQty,
        subtotal: safeQty * item.price,
      };
    }

    return item;
  });

  return { clampedSales, hasChanges };
}

export interface RemainingStockCalculationResult {
  productId: number;
  productName: string;
  stockKey: SellableStockKey;
  unit: string;
  stockNum: number;
  soldQty: number;
  remainingQty: number;
  isCalculated: boolean;
}

/**
 * Calculates remaining stock automatically:
 * Sisa Stock = Stock Awal - Jumlah Penjualan Offline (Support Traditional & Modern Packages)
 */
export function calculateAllRemainingStock(
  stock: StockData,
  sales: SaleItem[]
): Record<SellableStockKey, RemainingStockCalculationResult | null> {
  const result: Partial<Record<SellableStockKey, RemainingStockCalculationResult | null>> = {};
  const soldUnits = calculateSoldUnitsFromSales(sales);

  for (const mapping of PRODUCT_STOCK_MAPPINGS) {
    const stockVal = stock[mapping.stockKey];
    const stockNum = parseStockQuantity(stockVal);
    const soldQty = soldUnits[mapping.stockKey] || 0;

    if (stockNum !== null) {
      const remainingQty = Math.max(0, stockNum - soldQty);
      result[mapping.stockKey] = {
        productId: mapping.productId,
        productName: mapping.productName,
        stockKey: mapping.stockKey,
        unit: mapping.unit,
        stockNum,
        soldQty,
        remainingQty,
        isCalculated: true,
      };
    } else {
      result[mapping.stockKey] = null;
    }
  }

  return result as Record<SellableStockKey, RemainingStockCalculationResult | null>;
}

/**
 * Generates updated remaining stock data based on (Stok Awal - Pemasukan Offline)
 */
export function generateRemainingStockFromSales(
  stock: StockData,
  sales: SaleItem[],
  currentRemainingStock: StockData,
  config?: Partial<ChickenConversionConfig>
): StockData {
  const diffs = calculateAllRemainingStock(stock, sales);
  const updated: StockData = { ...currentRemainingStock };

  // 1. Ready-to-sell products: Stok Awal - Penjualan Offline
  for (const mapping of PRODUCT_STOCK_MAPPINGS) {
    const calc = diffs[mapping.stockKey];
    if (calc && calc.isCalculated) {
      updated[mapping.stockKey] = calc.remainingQty.toString();
    }
  }

  // 2. Bahan Baku Dapur:
  // Ayam Mentah = Stok Awal Ayam Mentah - (Goreng PB + Goreng PK)
  const ayamInitial = parseStockQuantity(stock.ayam_mentah);
  const pbOlahan = parseStockQuantity(stock.masak_ayam_pb);
  const pkOlahan = parseStockQuantity(stock.masak_ayam_pk);
  const ayamGorengLegacy = parseStockQuantity(stock.goreng_ayam) || 0;

  let totalAyamGoreng = 0;
  if (pbOlahan !== null || pkOlahan !== null) {
    totalAyamGoreng = calculateChickenTotalCookKg(pbOlahan || 0, pkOlahan || 0, config);
  } else {
    totalAyamGoreng = ayamGorengLegacy;
  }

  if (ayamInitial !== null) {
    const chickenDetail = calculateChickenRemainingDetail(ayamInitial, pbOlahan || 0, pkOlahan || 0, config);
    updated.ayam_mentah = chickenDetail.totalRemainingKg.toString();
    if (chickenDetail.description) {
      updated.ayam_mentah_keterangan = chickenDetail.description;
    }
  }

  // Beras = Stok Awal Beras - Stok Awal Masak Nasi
  const berasInitial = parseStockQuantity(stock.beras);
  const masakNasi = parseStockQuantity(stock.masak_nasi) || 0;
  if (berasInitial !== null) {
    updated.beras = (Math.round(Math.max(0, berasInitial - masakNasi) * 100) / 100).toString();
  }

  return updated;
}

/**
 * Parses numeric quantity from input string (e.g. "25", "25 pcs", "0", "40 porsi", "0.5", "0,5 kg")
 * Supports integers as well as decimals with dot or comma separator.
 * Returns null if the string is empty or undefined.
 */
export function parseStockQuantity(val: unknown): number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (typeof val !== 'string') return null;
  const str = val.trim();
  if (str === '') return null;
  // Support both comma (Indonesian format e.g. "0,5") and dot as decimal separator
  const normalized = str.replace(',', '.');
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

export interface StockCalculationResult {
  productId: number;
  productName: string;
  stockKey: SellableStockKey;
  stockNum: number | null;
  remainingNum: number | null;
  calculatedQty: number;
  isCalculated: boolean;
}

/**
 * Calculates (Stock Awal - Sisa Stock) for all mapped offline products
 */
export function calculateAllStockDiffs(
  stock: StockData,
  remainingStock: StockData
): Record<number, StockCalculationResult> {
  const result: Record<number, StockCalculationResult> = {};

  for (const mapping of PRODUCT_STOCK_MAPPINGS) {
    const stockVal = stock[mapping.stockKey];
    const remVal = remainingStock[mapping.stockKey];

    const stockNum = parseStockQuantity(stockVal);
    const remainingNum = parseStockQuantity(remVal);

    if (stockNum !== null && remainingNum !== null) {
      const calculatedQty = Math.max(0, stockNum - remainingNum);
      result[mapping.productId] = {
        productId: mapping.productId,
        productName: mapping.productName,
        stockKey: mapping.stockKey,
        stockNum,
        remainingNum,
        calculatedQty,
        isCalculated: true,
      };
    } else {
      result[mapping.productId] = {
        productId: mapping.productId,
        productName: mapping.productName,
        stockKey: mapping.stockKey,
        stockNum,
        remainingNum,
        calculatedQty: 0,
        isCalculated: false,
      };
    }
  }

  return result;
}

/**
 * Checks if stock has any values entered
 */
export function hasStockData(stock: StockData): boolean {
  return Object.values(stock).some((val) => {
    if (typeof val === 'string') {
      return val.trim() !== '';
    }
    if (typeof val === 'object' && val !== null) {
      return Object.values(val).some((subVal) => typeof subVal === 'string' && subVal.trim() !== '');
    }
    return false;
  });
}

/**
 * Loss (Kerugian) rates for unsold items at closing:
 * - Sisa Goreng Ayam PB = quantity * Rp 5.500
 * - Sisa Goreng Ayam PK = quantity * Rp 5.500
 * - Sisa Nasi = quantity * Rp 1.500
 */
export const LOSS_RATES = {
  goreng_ayam_pb: 5500,
  goreng_ayam_pk: 5500,
  nasi: 1500,
} as const;

export interface LossItemDetail {
  key: 'goreng_ayam_pb' | 'goreng_ayam_pk' | 'nasi';
  name: string;
  unit: string;
  qty: number;
  rate: number;
  loss: number;
}

export interface LossCalculationResult {
  items: LossItemDetail[];
  pbQty: number;
  pbLoss: number;
  pkQty: number;
  pkLoss: number;
  nasiQty: number;
  nasiLoss: number;
  totalLoss: number;
}

export function calculateLoss(remainingStock?: Partial<StockData> | null): LossCalculationResult {
  if (!remainingStock) {
    return {
      items: [
        { key: 'goreng_ayam_pb', name: 'Goreng Ayam PB', unit: 'pcs', qty: 0, rate: LOSS_RATES.goreng_ayam_pb, loss: 0 },
        { key: 'goreng_ayam_pk', name: 'Goreng Ayam PK', unit: 'pcs', qty: 0, rate: LOSS_RATES.goreng_ayam_pk, loss: 0 },
        { key: 'nasi', name: 'Nasi', unit: 'pcs', qty: 0, rate: LOSS_RATES.nasi, loss: 0 },
      ],
      pbQty: 0,
      pbLoss: 0,
      pkQty: 0,
      pkLoss: 0,
      nasiQty: 0,
      nasiLoss: 0,
      totalLoss: 0,
    };
  }

  const pbQty = parseStockQuantity(remainingStock.goreng_ayam_pb) || 0;
  const pkQty = parseStockQuantity(remainingStock.goreng_ayam_pk) || 0;
  const nasiQty = parseStockQuantity(remainingStock.nasi) || 0;

  const pbLoss = pbQty * LOSS_RATES.goreng_ayam_pb;
  const pkLoss = pkQty * LOSS_RATES.goreng_ayam_pk;
  const nasiLoss = nasiQty * LOSS_RATES.nasi;
  const totalLoss = pbLoss + pkLoss + nasiLoss;

  return {
    items: [
      { key: 'goreng_ayam_pb', name: 'Goreng Ayam PB', unit: 'pcs', qty: pbQty, rate: LOSS_RATES.goreng_ayam_pb, loss: pbLoss },
      { key: 'goreng_ayam_pk', name: 'Goreng Ayam PK', unit: 'pcs', qty: pkQty, rate: LOSS_RATES.goreng_ayam_pk, loss: pkLoss },
      { key: 'nasi', name: 'Nasi', unit: 'pcs', qty: nasiQty, rate: LOSS_RATES.nasi, loss: nasiLoss },
    ],
    pbQty,
    pbLoss,
    pkQty,
    pkLoss,
    nasiQty,
    nasiLoss,
    totalLoss,
  };
}

/**
 * Calculates loss percentage relative to total income (Total Pemasukan):
 * Formula = (Loss / Total Pemasukan) * 100%
 */
export function calculateLossPercentage(totalLoss: number, totalIncome: number): number {
  if (!totalIncome || totalIncome <= 0) return 0;
  return (totalLoss / totalIncome) * 100;
}

/**
 * Calculates expense percentage relative to total income:
 * Formula = (Total Pengeluaran / Total Pemasukan) * 100%
 */
export function calculateExpensePercentage(totalExpense: number, totalIncome: number): number {
  if (!totalIncome || totalIncome <= 0) return 0;
  return (totalExpense / totalIncome) * 100;
}

export function formatPercentage(percentage: number, decimals: number = 1): string {
  return `${percentage.toFixed(decimals)}%`;
}
