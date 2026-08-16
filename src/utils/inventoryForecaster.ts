// AI-Driven Inventory Forecasting & Seasonal Reorder Model for Critical Veterinary Medical Supplies
import { StockItem, PurchaseOrder, StockMovement, ClinicVisit, Inpatient } from '../types';

export type ClinicalCategory =
  | 'Emergency & Resusitasi'
  | 'Anestesi & Sedasi'
  | 'Cairan & Infus IV'
  | 'Antibiotik & Farmasi'
  | 'Vaksin & Biologik'
  | 'Alat Bedah & Habis Pakai'
  | 'Reagen Diagnostik & Rapid Kit'
  | 'Makanan & Nutrisi Retail'
  | 'Pasir & Sanitasi Toko'
  | 'Vitamin & Suplemen Retail'
  | 'Aksesoris & Perawatan Toko';

export type UrgencyLevel = 'Kritis' | 'Tinggi' | 'Waspada' | 'Optimal';

export type SeasonScenario =
  | 'pancaroba_hujan' // Rainy / Transition season: spike in respiratory, dermatitis, GI parvo/gastroenteritis
  | 'liburan_boarding' // Holiday / Boarding surge: spike in vaccines, tick/flea preventatives, wellness
  | 'kemarau_normal' // Dry season / Normal baseline: typical elective surgeries & maintenance
  | 'wabah_gi_parvo'; // Outbreak alert: extreme surge in IV fluids, antiemetics, rapid test kits, broad antibiotics

export interface CriticalSupplyConfig {
  sku: string;
  name: string;
  category: ClinicalCategory;
  standardLeadTimeDays: number;
  leadTimeVarianceDays: number;
  shelfLifeMonths: number;
  minBatchOrder: number;
  criticalServiceLevel: number; // e.g. 0.98 for emergency drugs (Z = 2.05)
  defaultDailyBurn: number;
  dailyBurnVariance: number;
  seasonalMultiplier: {
    pancaroba_hujan: number;
    liburan_boarding: number;
    kemarau_normal: number;
    wabah_gi_parvo: number;
  };
  clinicalIndication: string;
  riskOfStockout: string;
  preferredSupplier: string;
  unitCost: number;
  unit: string;
}

export interface SupplyForecastMetric {
  id: string;
  sku: string;
  name: string;
  category: ClinicalCategory;
  currentStock: number;
  unit: string;
  unitPrice: number;
  supplierName: string;
  
  // Consumption & Burn Rate
  avgDailyDemand: number;
  adjustedDailyDemand: number; // after seasonality
  demandStdDev: number;
  
  // Parameters
  leadTimeDays: number;
  serviceLevel: number; // e.g. 98%
  zScore: number;
  
  // Key Model Outputs
  safetyStock: number;
  reorderPoint: number;
  suggestedReorderQty: number; // EOQ / optimal batch
  stockoutHorizonDays: number; // Days until stock depleted
  stockoutRiskPercent: number; // 0 - 100%
  urgency: UrgencyLevel;
  totalEstimatedCost: number;
  
  // Clinical Context
  clinicalIndication: string;
  riskOfStockout: string;
  seasonalityImpactDescription: string;
  
  // Historical & Projected Trajectory (Past 6 months + Next 90 days)
  historicalDemand: { dateLabel: string; actual: number; predicted: number }[];
  projectedTrajectory: {
    day: number;
    dateLabel: string;
    projectedStockWithoutPO: number;
    projectedStockWithPO: number;
    predictedDailyConsumption: number;
    ropThreshold: number;
    safetyStockLevel: number;
  }[];
}

export interface AIForecastSummary {
  totalCriticalItemsTracked: number;
  criticalStockoutAlertsCount: number;
  urgentReorderCount: number;
  watchListCount: number;
  healthyCount: number;
  estimatedTotalReorderCost: number;
  dominantSeasonScenario: SeasonScenario;
  seasonScenarioName: string;
  seasonDescription: string;
  overallStockHealthIndex: number; // 0 - 100%
  items: SupplyForecastMetric[];
}

export interface GeminiForecastingInsights {
  executiveSummary: string;
  epidemiologicalRiskFactors: string[];
  clinicalPriorityRankings: {
    sku: string;
    name: string;
    priorityReason: string;
    immediateAction: string;
  }[];
  supplierOptimizationAdvice: string[];
  budgetImpactAnalysis: string;
  preparedTimestamp: string;
}

// Master configurations for critical veterinary medical supplies
export const CRITICAL_MEDICAL_SUPPLIES_CONFIG: CriticalSupplyConfig[] = [
  {
    sku: 'MED-RL-500',
    name: 'Ringer Lactate Infusion 500ml',
    category: 'Cairan & Infus IV',
    standardLeadTimeDays: 4,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 24,
    minBatchOrder: 20,
    criticalServiceLevel: 0.99, // 99% Service level (zero stockout tolerance for IV fluid)
    defaultDailyBurn: 4.8,
    dailyBurnVariance: 1.5,
    seasonalMultiplier: {
      pancaroba_hujan: 1.45,
      liburan_boarding: 1.15,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 2.2
    },
    clinicalIndication: 'Rehidrasi emergensi pasien dehidrasi, shock hipovolemik, stabilisasi ICU, dan cairan intra-operatif bedah.',
    riskOfStockout: 'Fatal: Pasien gawat darurat ICU atau gastroenteritis tidak dapat diinfus, risiko kolaps kardiovaskular tinggi.',
    preferredSupplier: 'PharmaVet Nusantara',
    unitCost: 28000,
    unit: 'Kolf'
  },
  {
    sku: 'MED-ISO-100',
    name: 'Isoflurane Anesthetic Inhalation 100ml',
    category: 'Anestesi & Sedasi',
    standardLeadTimeDays: 7,
    leadTimeVarianceDays: 2,
    shelfLifeMonths: 36,
    minBatchOrder: 3,
    criticalServiceLevel: 0.99,
    defaultDailyBurn: 0.45, // ~1 bottle per 2-3 days of surgery
    dailyBurnVariance: 0.15,
    seasonalMultiplier: {
      pancaroba_hujan: 1.1,
      liburan_boarding: 1.35, // High elective sterilizations before boarding
      kemarau_normal: 1.0,
      wabah_gi_parvo: 0.9
    },
    clinicalIndication: 'Anestesi inhalasi utama untuk bedah mayor (laparatomi, ortopedi, sectio caesarea, steril, dental scaling).',
    riskOfStockout: 'Operasi bedah elektif & darurat harus dibatalkan/ditunda. Pasien trauma bedah tidak dapat dioperasi.',
    preferredSupplier: 'PT Medika Veteriner Utama',
    unitCost: 480000,
    unit: 'Botol'
  },
  {
    sku: 'MED-KET-10',
    name: 'Ketamine HCl 10% 10ml Injeksi',
    category: 'Anestesi & Sedasi',
    standardLeadTimeDays: 10, // Controlled drug requires special lead time
    leadTimeVarianceDays: 3,
    shelfLifeMonths: 24,
    minBatchOrder: 5,
    criticalServiceLevel: 0.98,
    defaultDailyBurn: 0.8,
    dailyBurnVariance: 0.3,
    seasonalMultiplier: {
      pancaroba_hujan: 1.15,
      liburan_boarding: 1.4,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.0
    },
    clinicalIndication: 'Induksi anestesi disosiatif, sedasi hewan agresif untuk radiologi/USG, analgesia somatik multimodal.',
    riskOfStockout: 'Sedasi prosedur darurat dan penanganan pasien fraktur/luka gigitan parah tidak dapat dilakukan.',
    preferredSupplier: 'PharmaVet Nusantara',
    unitCost: 195000,
    unit: 'Vial'
  },
  {
    sku: 'MED-MLX-10',
    name: 'Meloxicam Injeksi 5mg/ml 10ml',
    category: 'Emergency & Resusitasi',
    standardLeadTimeDays: 5,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 24,
    minBatchOrder: 6,
    criticalServiceLevel: 0.98,
    defaultDailyBurn: 1.2,
    dailyBurnVariance: 0.4,
    seasonalMultiplier: {
      pancaroba_hujan: 1.25,
      liburan_boarding: 1.2,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.5
    },
    clinicalIndication: 'Analgesik & antiinflamasi non-steroid (NSAID) untuk manajemen nyeri pasca-bedah, trauma, dan osteoartritis.',
    riskOfStockout: 'Pasien mengalami nyeri hebat paska operasi atau trauma tanpa kontrol analgetik yang memadai.',
    preferredSupplier: 'PharmaVet Nusantara',
    unitCost: 145000,
    unit: 'Vial'
  },
  {
    sku: 'MED-AMX-500',
    name: 'Amoxicillin + Clavulanate 250mg/500mg',
    category: 'Antibiotik & Farmasi',
    standardLeadTimeDays: 4,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 24,
    minBatchOrder: 30,
    criticalServiceLevel: 0.95,
    defaultDailyBurn: 6.5,
    dailyBurnVariance: 2.1,
    seasonalMultiplier: {
      pancaroba_hujan: 1.55, // Massive jump in skin/URTI bacterial infections during rain
      liburan_boarding: 1.1,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.8
    },
    clinicalIndication: 'Antibiotik spektrum luas lini pertama untuk infeksi kulit pyoderma, saluran kemih (LUTD), dan saluran napas.',
    riskOfStockout: 'Kegagalan terapi infeksi bakteri akut; resistensi meningkat jika terapi terputus.',
    preferredSupplier: 'PharmaVet Nusantara',
    unitCost: 16000,
    unit: 'Strip'
  },
  {
    sku: 'MED-ENRO-50',
    name: 'Enrofloxacin Injeksi / Tablet 50mg',
    category: 'Antibiotik & Farmasi',
    standardLeadTimeDays: 5,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 36,
    minBatchOrder: 15,
    criticalServiceLevel: 0.95,
    defaultDailyBurn: 2.8,
    dailyBurnVariance: 0.9,
    seasonalMultiplier: {
      pancaroba_hujan: 1.4,
      liburan_boarding: 1.05,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.7
    },
    clinicalIndication: 'Antibiotik fluorokuinolon bakterisidal untuk infeksi berat Gram negatif saluran cerna, urogenital, dan sepsis.',
    riskOfStockout: 'Krisis penanganan sepsis atau infeksi resisten lini pertama.',
    preferredSupplier: 'PT Medika Veteriner Utama',
    unitCost: 22000,
    unit: 'Strip'
  },
  {
    sku: 'VAC-RAB-01',
    name: 'Vaksin Rabies Defensor 3 / Rabisin',
    category: 'Vaksin & Biologik',
    standardLeadTimeDays: 6,
    leadTimeVarianceDays: 2,
    shelfLifeMonths: 18,
    minBatchOrder: 25,
    criticalServiceLevel: 0.99, // Zoonosis statutory requirement
    defaultDailyBurn: 3.5,
    dailyBurnVariance: 1.2,
    seasonalMultiplier: {
      pancaroba_hujan: 1.1,
      liburan_boarding: 1.65, // Massive surge before pet travel & hotel check-in
      kemarau_normal: 1.0,
      wabah_gi_parvo: 0.9
    },
    clinicalIndication: 'Imunisasi aktif wajib terhadap virus Rabies (Zoonosis fatal) pada anjing, kucing, dan kera.',
    riskOfStockout: 'Pelanggaran regulasi karantina veteriner hewan; penolakan reservasi pet hotel / penerbangan hewan.',
    preferredSupplier: 'PharmaVet Nusantara',
    unitCost: 95000,
    unit: 'Vial'
  },
  {
    sku: 'VAC-FEL-04',
    name: 'Vaksin Felocell 4 / Tricat (FVRCP + Chlamydia)',
    category: 'Vaksin & Biologik',
    standardLeadTimeDays: 6,
    leadTimeVarianceDays: 2,
    shelfLifeMonths: 18,
    minBatchOrder: 30,
    criticalServiceLevel: 0.98,
    defaultDailyBurn: 4.2,
    dailyBurnVariance: 1.4,
    seasonalMultiplier: {
      pancaroba_hujan: 1.3,
      liburan_boarding: 1.75, // Extreme boarding check-in surge
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.1
    },
    clinicalIndication: 'Vaksin inti kucing (Panleukopenia, Calicivirus, Herpesvirus Rhinotracheitis, Chlamydia).',
    riskOfStockout: 'Penundaan jadwal vaksinasi anak kucing (kitten protocol) dan risiko wabah panleukopenia di klinik.',
    preferredSupplier: 'PharmaVet Nusantara',
    unitCost: 140000,
    unit: 'Vial'
  },
  {
    sku: 'VAC-CAN-06',
    name: 'Vaksin Eurican 6 / Vanguard Plus (DHPPi+L)',
    category: 'Vaksin & Biologik',
    standardLeadTimeDays: 6,
    leadTimeVarianceDays: 2,
    shelfLifeMonths: 18,
    minBatchOrder: 20,
    criticalServiceLevel: 0.98,
    defaultDailyBurn: 2.6,
    dailyBurnVariance: 0.8,
    seasonalMultiplier: {
      pancaroba_hujan: 1.35, // Leptospirosis spike in rainy season
      liburan_boarding: 1.5,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.2
    },
    clinicalIndication: 'Vaksin inti anjing kombinasi Distemper, Hepatitis, Parvovirus, Parainfluenza, dan Leptospira.',
    riskOfStockout: 'Pasien anjing rentan tertular leptospirosis saat musim banjir/hujan dan distemper mematikan.',
    preferredSupplier: 'PT Medika Veteriner Utama',
    unitCost: 165000,
    unit: 'Vial'
  },
  {
    sku: 'LAB-RPD-CPV',
    name: 'Rapid Test Kit Parvo & Corona Ag (CPV/CCV)',
    category: 'Reagen Diagnostik & Rapid Kit',
    standardLeadTimeDays: 5,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 18,
    minBatchOrder: 10,
    criticalServiceLevel: 0.98,
    defaultDailyBurn: 1.5,
    dailyBurnVariance: 0.7,
    seasonalMultiplier: {
      pancaroba_hujan: 1.6, // Heavy outbreak risk
      liburan_boarding: 1.2,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 2.8 // Peak outbreak
    },
    clinicalIndication: 'Deteksi cepat antigen Parvovirus dan Coronavirus pada feses pasien muntah/diare akut berdarah.',
    riskOfStockout: 'Keterlambatan isolasi pasien infeksius; risiko penularan nosokomial ke seluruh ruang rawat inap.',
    preferredSupplier: 'CV Animalia Tools & Supply',
    unitCost: 85000,
    unit: 'Box/Kit'
  },
  {
    sku: 'SURG-IVC-24',
    name: 'IV Catheter 24G / 22G Terumo (Pediatrik & Small)',
    category: 'Alat Bedah & Habis Pakai',
    standardLeadTimeDays: 3,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 48,
    minBatchOrder: 50,
    criticalServiceLevel: 0.98,
    defaultDailyBurn: 7.5,
    dailyBurnVariance: 2.5,
    seasonalMultiplier: {
      pancaroba_hujan: 1.4,
      liburan_boarding: 1.15,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.9
    },
    clinicalIndication: 'Kanulasi pembuluh darah vena cephalica/saphena untuk akses cairan infus, obat darurat, dan anestesi.',
    riskOfStockout: 'Tidak bisa memasang jalur infus darurat pada pasien kritis atau persiapan bedah.',
    preferredSupplier: 'CV Animalia Tools & Supply',
    unitCost: 9500,
    unit: 'Pcs'
  },
  {
    sku: 'SURG-SUT-30',
    name: 'Benang Bedah PGA / Polyglactin 3-0 Taper',
    category: 'Alat Bedah & Habis Pakai',
    standardLeadTimeDays: 5,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 36,
    minBatchOrder: 24,
    criticalServiceLevel: 0.98,
    defaultDailyBurn: 2.2,
    dailyBurnVariance: 0.6,
    seasonalMultiplier: {
      pancaroba_hujan: 1.1,
      liburan_boarding: 1.45,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 0.8
    },
    clinicalIndication: 'Penjahitan linea alba, ligasi vaskular ovariohisterektomi (steril), dan penutupan luka dalam.',
    riskOfStockout: 'Bedah mayor dan tindakan emergensi luka robek/trauma tertunda.',
    preferredSupplier: 'CV Animalia Tools & Supply',
    unitCost: 45000,
    unit: 'Sachet'
  },
  {
    sku: 'MED-MAR-10',
    name: 'Cerenia (Maropitant Citrate) Injeksi 10mg/ml',
    category: 'Emergency & Resusitasi',
    standardLeadTimeDays: 7,
    leadTimeVarianceDays: 2,
    shelfLifeMonths: 24,
    minBatchOrder: 4,
    criticalServiceLevel: 0.98,
    defaultDailyBurn: 0.7,
    dailyBurnVariance: 0.3,
    seasonalMultiplier: {
      pancaroba_hujan: 1.5,
      liburan_boarding: 1.1,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 2.3
    },
    clinicalIndication: 'Antiemetik poten antagonis reseptor NK-1 untuk menghentikan muntah hebat akibat gastroenteritis & pankreatitis.',
    riskOfStockout: 'Dehidrasi dan aspirasi pneumonia pada pasien muntah tidak terkendali.',
    preferredSupplier: 'PT Medika Veteriner Utama',
    unitCost: 420000,
    unit: 'Vial'
  }
];

// Master configurations for fast-moving retail pet shop supplies
export const CRITICAL_RETAIL_SUPPLIES_CONFIG: CriticalSupplyConfig[] = [
  {
    sku: 'PET-RC-KIT2K',
    name: 'Royal Canin Kitten Dry Food 2kg',
    category: 'Makanan & Nutrisi Retail',
    standardLeadTimeDays: 3,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 18,
    minBatchOrder: 12,
    criticalServiceLevel: 0.95,
    defaultDailyBurn: 3.5,
    dailyBurnVariance: 1.0,
    seasonalMultiplier: {
      pancaroba_hujan: 1.1,
      liburan_boarding: 1.45,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 0.9
    },
    clinicalIndication: 'Pakan nutrisi esensial kitten (1-12 bulan) dengan antibodi kompleks & protein tinggi.',
    riskOfStockout: 'Penurunan kepuasan pelanggan toko & hilangnya repeat buyer member pet shop.',
    preferredSupplier: 'PT Pet Wholesale Indonesia',
    unitCost: 265000,
    unit: 'Bag'
  },
  {
    sku: 'PET-PRO-DOG3K',
    name: 'Pro Plan Adult Dog Medium Salmon 2.5kg',
    category: 'Makanan & Nutrisi Retail',
    standardLeadTimeDays: 4,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 18,
    minBatchOrder: 8,
    criticalServiceLevel: 0.95,
    defaultDailyBurn: 2.2,
    dailyBurnVariance: 0.8,
    seasonalMultiplier: {
      pancaroba_hujan: 1.05,
      liburan_boarding: 1.35,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 0.95
    },
    clinicalIndication: 'Pakan hipoalergenik kulit sensitif anjing dewasa dengan salmon murni & omega 3.',
    riskOfStockout: 'Pelanggan beralih belanja ke toko retail kompetitor.',
    preferredSupplier: 'PT Pet Wholesale Indonesia',
    unitCost: 310000,
    unit: 'Bag'
  },
  {
    sku: 'PET-SAND-LEM',
    name: 'Pasir Kucing Bentonite Lemon Wangi 10L',
    category: 'Pasir & Sanitasi Toko',
    standardLeadTimeDays: 3,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 36,
    minBatchOrder: 25,
    criticalServiceLevel: 0.95,
    defaultDailyBurn: 6.0,
    dailyBurnVariance: 1.8,
    seasonalMultiplier: {
      pancaroba_hujan: 1.4,
      liburan_boarding: 1.5,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.1
    },
    clinicalIndication: 'Pasir gumpal wangi penyerap bau & kontrol higienitas toilet anabul harian.',
    riskOfStockout: 'Barang fast-moving terlaris kosong, mengganggu omzet harian kasir POS.',
    preferredSupplier: 'CV Animalia Tools & Supply',
    unitCost: 52000,
    unit: 'Bag'
  },
  {
    sku: 'PET-GIM-VIT',
    name: 'GimCat Multi-Vitamin Paste Extra 50g',
    category: 'Vitamin & Suplemen Retail',
    standardLeadTimeDays: 5,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 24,
    minBatchOrder: 15,
    criticalServiceLevel: 0.92,
    defaultDailyBurn: 1.8,
    dailyBurnVariance: 0.5,
    seasonalMultiplier: {
      pancaroba_hujan: 1.35,
      liburan_boarding: 1.2,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.2
    },
    clinicalIndication: 'Pasta suplemen daya tahan tubuh kucing dengan 12 vitamin esensial & beta-glukan.',
    riskOfStockout: 'Penurunan penjualan produk suplemen margin tinggi.',
    preferredSupplier: 'PT Pet Wholesale Indonesia',
    unitCost: 78000,
    unit: 'Tube'
  },
  {
    sku: 'PET-CHURU-TUN',
    name: 'Inaba Ciao Churu Cat Treats Tuna 4x14g',
    category: 'Makanan & Nutrisi Retail',
    standardLeadTimeDays: 3,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 24,
    minBatchOrder: 40,
    criticalServiceLevel: 0.92,
    defaultDailyBurn: 8.5,
    dailyBurnVariance: 2.5,
    seasonalMultiplier: {
      pancaroba_hujan: 1.15,
      liburan_boarding: 1.6,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 1.0
    },
    clinicalIndication: 'Cemilan basah kucing nomor 1 untuk reward & penambah nafsu makan.',
    riskOfStockout: 'Impulse-buying di kasir POS menurun signifikan.',
    preferredSupplier: 'PT Pet Wholesale Indonesia',
    unitCost: 21000,
    unit: 'Pack'
  },
  {
    sku: 'PET-SHAM-TICK',
    name: 'Bioline Flea & Tick Cat/Dog Shampoo 250ml',
    category: 'Aksesoris & Perawatan Toko',
    standardLeadTimeDays: 4,
    leadTimeVarianceDays: 1,
    shelfLifeMonths: 36,
    minBatchOrder: 10,
    criticalServiceLevel: 0.90,
    defaultDailyBurn: 1.4,
    dailyBurnVariance: 0.4,
    seasonalMultiplier: {
      pancaroba_hujan: 1.3,
      liburan_boarding: 1.4,
      kemarau_normal: 1.0,
      wabah_gi_parvo: 0.9
    },
    clinicalIndication: 'Shampoo anti kutu & jamur dengan ekstrak margosa untuk kebersihan bulu.',
    riskOfStockout: 'Pelanggan salon & retail mencari produk alternatif.',
    preferredSupplier: 'CV Animalia Tools & Supply',
    unitCost: 48000,
    unit: 'Botol'
  }
];

// Helper: Standard Normal Z-Score for a given service level
export function getZScore(serviceLevel: number): number {
  if (serviceLevel >= 0.999) return 3.09;
  if (serviceLevel >= 0.99) return 2.33;
  if (serviceLevel >= 0.98) return 2.05;
  if (serviceLevel >= 0.95) return 1.65;
  if (serviceLevel >= 0.90) return 1.28;
  return 1.65; // default 95%
}

// Compute comprehensive AI forecasting metric for each critical item
export function calculateSupplyForecast(
  config: CriticalSupplyConfig,
  currentStock: number,
  scenario: SeasonScenario = 'pancaroba_hujan',
  leadTimeBufferDays: number = 0,
  targetServiceLevel?: number
): SupplyForecastMetric {
  const serviceLevel = targetServiceLevel ?? config.criticalServiceLevel;
  const zScore = getZScore(serviceLevel);

  // 1. Seasonality & Daily Demand Calculation
  const seasonFactor = config.seasonalMultiplier[scenario] || 1.0;
  const avgDailyDemand = config.defaultDailyBurn;
  const adjustedDailyDemand = Number((avgDailyDemand * seasonFactor).toFixed(2));
  const demandStdDev = config.dailyBurnVariance;

  // 2. Lead Time & Variance
  const effectiveLeadTime = config.standardLeadTimeDays + leadTimeBufferDays;
  const leadTimeStdDev = config.leadTimeVarianceDays;

  // 3. Safety Stock (SS) Calculation (considering both demand & lead time variance)
  // SS = Z * sqrt( (L * sigma_d^2) + (d_avg^2 * sigma_L^2) )
  const varianceTerm =
    effectiveLeadTime * Math.pow(demandStdDev * seasonFactor, 2) +
    Math.pow(adjustedDailyDemand, 2) * Math.pow(leadTimeStdDev, 2);
  const safetyStock = Math.max(1, Math.round(zScore * Math.sqrt(varianceTerm)));

  // 4. Reorder Point (ROP) = (Adjusted Daily Demand * Lead Time) + Safety Stock
  const leadTimeDemand = adjustedDailyDemand * effectiveLeadTime;
  const reorderPoint = Math.round(leadTimeDemand + safetyStock);

  // 5. Suggested Reorder Quantity (Economic Order Quantity & Minimum Batch Constraints)
  // EOQ approximation = sqrt((2 * AnnualDemand * OrderCost) / HoldingCost)
  const annualDemand = adjustedDailyDemand * 365;
  const estimatedOrderCost = 50000; // Rp 50.000 administrative & shipping cost
  const holdingCostPerUnit = Math.max(1000, config.unitCost * 0.15); // 15% holding cost per year
  const rawEOQ = Math.sqrt((2 * annualDemand * estimatedOrderCost) / holdingCostPerUnit);
  
  // Suggested order should cover at least cycle stock + safety stock target
  const cycleStockCoverage = Math.round(adjustedDailyDemand * 21); // 3 weeks cycle coverage
  const suggestedReorderQty = Math.max(
    config.minBatchOrder,
    Math.ceil(Math.max(rawEOQ, cycleStockCoverage) / config.minBatchOrder) * config.minBatchOrder
  );

  // 6. Stockout Horizon (Days Left of Inventory)
  const stockoutHorizonDays =
    adjustedDailyDemand > 0 ? Number((currentStock / adjustedDailyDemand).toFixed(1)) : 999;

  // 7. Stockout Risk Probability (0 - 100%)
  let stockoutRiskPercent = 0;
  if (currentStock <= safetyStock) {
    stockoutRiskPercent = Math.min(99, Math.round(85 + (1 - currentStock / Math.max(1, safetyStock)) * 14));
  } else if (currentStock <= reorderPoint) {
    const ratio = (reorderPoint - currentStock) / Math.max(1, reorderPoint - safetyStock);
    stockoutRiskPercent = Math.round(45 + ratio * 35);
  } else {
    const surplusRatio = currentStock / reorderPoint;
    stockoutRiskPercent = Math.max(2, Math.round(25 / surplusRatio));
  }

  // 8. Urgency Level Categorization
  let urgency: UrgencyLevel = 'Optimal';
  if (stockoutHorizonDays <= effectiveLeadTime || currentStock <= safetyStock) {
    urgency = 'Kritis';
  } else if (currentStock <= reorderPoint || stockoutHorizonDays <= effectiveLeadTime + 4) {
    urgency = 'Tinggi';
  } else if (stockoutHorizonDays <= effectiveLeadTime + 10) {
    urgency = 'Waspada';
  }

  const totalEstimatedCost = suggestedReorderQty * config.unitCost;

  // 9. Generate Historical 6-Month Demand Data & Future 90-Day Trajectory
  const monthLabels = ['Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt'];
  const historicalDemand = monthLabels.map((m, idx) => {
    const trendBase = avgDailyDemand * 30;
    const noise = (Math.sin(idx * 1.5) * 0.15 + 1) * trendBase;
    const seasonalFact = idx >= 4 ? seasonFactor : 1.0;
    const actual = Math.round(noise * seasonalFact);
    const predicted = Math.round(trendBase * seasonalFact);
    return { dateLabel: `${m} 2026`, actual, predicted };
  });

  // Future 90-Day Trajectory with/without PO
  const projectedTrajectory = [];
  let simulatedStockNoPO = currentStock;
  let simulatedStockWithPO = currentStock;
  const poArrivalDay = effectiveLeadTime + 1;

  for (let d = 1; d <= 90; d += 5) {
    const consumptionInStep = adjustedDailyDemand * 5;
    simulatedStockNoPO = Math.max(0, Number((simulatedStockNoPO - consumptionInStep).toFixed(1)));
    
    simulatedStockWithPO = simulatedStockWithPO - consumptionInStep;
    if (d >= poArrivalDay && d - 5 < poArrivalDay) {
      simulatedStockWithPO += suggestedReorderQty;
    }
    simulatedStockWithPO = Math.max(0, Number(simulatedStockWithPO.toFixed(1)));

    projectedTrajectory.push({
      day: d,
      dateLabel: `H+${d}`,
      projectedStockWithoutPO: simulatedStockNoPO,
      projectedStockWithPO: simulatedStockWithPO,
      predictedDailyConsumption: adjustedDailyDemand,
      ropThreshold: reorderPoint,
      safetyStockLevel: safetyStock
    });
  }

  let seasonalityImpactDescription = 'Pola konsumsi stabil pada baseline normal.';
  if (scenario === 'pancaroba_hujan') {
    seasonalityImpactDescription = `Lonjakan konsumsi +${Math.round((seasonFactor - 1) * 100)}% akibat tingginya kelembaban, infeksi kulit sekunder, dan insiden infeksi pencernaan musiman.`;
  } else if (scenario === 'liburan_boarding') {
    seasonalityImpactDescription = `Peningkatan kebutuhan +${Math.round((seasonFactor - 1) * 100)}% didorong syarat wajib vaksinasi boarding dan sterilisasi elektif masa liburan.`;
  } else if (scenario === 'wabah_gi_parvo') {
    seasonalityImpactDescription = `Lonjakan ekstrem +${Math.round((seasonFactor - 1) * 100)}% akibat lonjakan kasus wabah gastroenteritis & parvo viral di area sekitar klinik.`;
  }

  return {
    id: config.sku,
    sku: config.sku,
    name: config.name,
    category: config.category,
    currentStock,
    unit: config.unit,
    unitPrice: config.unitCost,
    supplierName: config.preferredSupplier,
    avgDailyDemand,
    adjustedDailyDemand,
    demandStdDev,
    leadTimeDays: effectiveLeadTime,
    serviceLevel,
    zScore,
    safetyStock,
    reorderPoint,
    suggestedReorderQty,
    stockoutHorizonDays,
    stockoutRiskPercent,
    urgency,
    totalEstimatedCost,
    clinicalIndication: config.clinicalIndication,
    riskOfStockout: config.riskOfStockout,
    seasonalityImpactDescription,
    historicalDemand,
    projectedTrajectory
  };
}

// Generate the complete forecast summary across critical supplies tailored to business role profile
export function generateAllCriticalSuppliesForecast(
  stockItems: StockItem[],
  scenario: SeasonScenario = 'pancaroba_hujan',
  leadTimeBufferDays: number = 0,
  targetServiceLevel?: number,
  roleProfile?: string
): AIForecastSummary {
  // Determine which config list to use based on profile
  let targetConfigs: CriticalSupplyConfig[] = CRITICAL_MEDICAL_SUPPLIES_CONFIG;
  if (roleProfile === 'owner_petshop') {
    targetConfigs = CRITICAL_RETAIL_SUPPLIES_CONFIG;
  } else if (roleProfile === 'owner_petcare') {
    targetConfigs = [...CRITICAL_MEDICAL_SUPPLIES_CONFIG, ...CRITICAL_RETAIL_SUPPLIES_CONFIG];
  }

  const items: SupplyForecastMetric[] = targetConfigs.map((config) => {
    // Find matching stock item or create a simulated realistic initial value
    const matchedStock = stockItems.find(
      (s) =>
        s.sku.toLowerCase() === config.sku.toLowerCase() ||
        s.name.toLowerCase().includes(config.name.toLowerCase().slice(0, 10))
    );

    // Initial stock: use actual ERP stock if found, or realistic mock level
    let currentStock = matchedStock ? matchedStock.stock : 14;
    // Specific realistic seeds for critical demonstration
    if (config.sku === 'MED-RL-500') currentStock = matchedStock?.stock ?? 18;
    if (config.sku === 'MED-ISO-100') currentStock = matchedStock?.stock ?? 2;
    if (config.sku === 'MED-KET-10') currentStock = matchedStock?.stock ?? 3;
    if (config.sku === 'VAC-RAB-01') currentStock = matchedStock?.stock ?? 8;
    if (config.sku === 'LAB-RPD-CPV') currentStock = matchedStock?.stock ?? 4;
    if (config.sku === 'MED-AMX-500') currentStock = matchedStock?.stock ?? 35;
    if (config.sku === 'PET-RC-KIT2K') currentStock = matchedStock?.stock ?? 6;
    if (config.sku === 'PET-SAND-LEM') currentStock = matchedStock?.stock ?? 12;
    if (config.sku === 'PET-CHURU-TUN') currentStock = matchedStock?.stock ?? 18;

    return calculateSupplyForecast(config, currentStock, scenario, leadTimeBufferDays, targetServiceLevel);
  });

  const criticalAlerts = items.filter((i) => i.urgency === 'Kritis').length;
  const urgentReorder = items.filter((i) => i.urgency === 'Tinggi').length;
  const watchList = items.filter((i) => i.urgency === 'Waspada').length;
  const healthy = items.filter((i) => i.urgency === 'Optimal').length;

  const estimatedTotalReorderCost = items
    .filter((i) => i.urgency === 'Kritis' || i.urgency === 'Tinggi')
    .reduce((sum, i) => sum + i.totalEstimatedCost, 0);

  const scenarioNames: Record<SeasonScenario, { name: string; desc: string }> = {
    pancaroba_hujan: {
      name: 'Musim Pancaroba & Musim Hujan (Q3-Q4)',
      desc: 'Kelembaban tinggi memicu lonjakan infeksi bakteri kulit (Pyoderma), Otitis, serta kasus Gastroenteritis/Parvo akut.'
    },
    liburan_boarding: {
      name: 'Musim Liburan & Lonjakan Pet Boarding (Peak Season)',
      desc: 'Lonjakan reservasi penitipan hewan menuntut kelengkapan vaksinasi inti (Rabies, Felocell, Eurican) dan sterilisasi elektif.'
    },
    kemarau_normal: {
      name: 'Musim Kemarau & Operasional Normal (Baseline)',
      desc: 'Aktivitas klinik berada pada beban standar tanpa anomali iklim cuaca ekstrem.'
    },
    wabah_gi_parvo: {
      name: 'Simulasi Waspada Wabah Gastroenteritis & Parvo Viral',
      desc: 'Lonjakan ekstrem permintaan cairan infus Ringer Lactate, Antiemetik Maropitant, antibiotik injeksi, dan rapid test kit.'
    }
  };

  const healthScore = Math.max(
    10,
    Math.round(100 - (criticalAlerts * 20 + urgentReorder * 10 + watchList * 4))
  );

  return {
    totalCriticalItemsTracked: items.length,
    criticalStockoutAlertsCount: criticalAlerts,
    urgentReorderCount: urgentReorder,
    watchListCount: watchList,
    healthyCount: healthy,
    estimatedTotalReorderCost,
    dominantSeasonScenario: scenario,
    seasonScenarioName: scenarioNames[scenario].name,
    seasonDescription: scenarioNames[scenario].desc,
    overallStockHealthIndex: healthScore,
    items
  };
}

// Convert Forecast recommendations into real PurchaseOrder items ready to submit
export function createPurchaseOrderFromForecast(
  forecastItems: SupplyForecastMetric[],
  supplierName: string = 'PharmaVet Nusantara'
): {
  supplierName: string;
  items: { itemName: string; quantity: number; unit: string; unitPrice: number; total: number }[];
  totalAmount: number;
  notes: string;
} {
  const targetItems = forecastItems.filter(
    (i) => i.urgency === 'Kritis' || i.urgency === 'Tinggi'
  );

  const poLineItems = targetItems.map((item) => ({
    itemName: `${item.name} [${item.sku}]`,
    quantity: item.suggestedReorderQty,
    unit: item.unit,
    unitPrice: item.unitPrice,
    total: item.suggestedReorderQty * item.unitPrice
  }));

  const totalAmount = poLineItems.reduce((acc, curr) => acc + curr.total, 0);

  return {
    supplierName,
    items: poLineItems,
    totalAmount,
    notes: `[AI-GENERATED PO] Otomatisasi pemesanan ulang berdasarkan analisis peramalan konsumsi historis, ROP dinamis & faktor musiman (${targetItems.length} item kritis).`
  };
}
