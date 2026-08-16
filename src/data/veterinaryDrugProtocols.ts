export type SpeciesCategory =
  | 'Anjing'
  | 'Kucing'
  | 'Kelinci'
  | 'Rodensia'
  | 'Burung'
  | 'Reptil'
  | 'Eksotik';

export interface SpeciesPresetItem {
  id: string;
  name: string;
  scientificName: string;
  label: string;
  category: SpeciesCategory;
  emoji: string;
  badgeColor: string;
  description: string;
}

export const SPECIES_PRESETS: SpeciesPresetItem[] = [
  {
    id: 'Anjing',
    name: 'Anjing (Canine)',
    scientificName: 'Canis lupus familiaris',
    label: '🐕 Anjing (Canine / Canis familiaris)',
    category: 'Anjing',
    emoji: '🐕',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Metabolisme standar kanin, toleran terhadap sebagian besar NSAID veteriner terlisensi.'
  },
  {
    id: 'Kucing',
    name: 'Kucing (Feline)',
    scientificName: 'Felis catus',
    label: '🐈 Kucing (Feline / Felis catus)',
    category: 'Kucing',
    emoji: '🐈',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Defisiensi enzim glukuronidasi hepar; sensitif terhadap NSAID, parasetamol & fluoroquinolones.'
  },
  {
    id: 'Kelinci',
    name: 'Kelinci (Lagomorph)',
    scientificName: 'Oryctolagus cuniculus',
    label: '🐇 Kelinci (Lagomorph / Oryctolagus)',
    category: 'Kelinci',
    emoji: '🐇',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Fermentasi sekum (hindgut); KONTRAINDIKASI MUTLAK antibiotik spektrum sempit oral (PLACE).'
  },
  {
    id: 'Rodensia',
    name: 'Rodensia / Hamster / Guinea Pig',
    scientificName: 'Rodentia / Cavia porcellus',
    label: '🐹 Rodensia / Hamster / Guinea Pig (Cavia)',
    category: 'Rodensia',
    emoji: '🐹',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Laju metabolisme basal sangat tinggi; hindari antibiotik laktam oral pada caviomorph.'
  },
  {
    id: 'Burung',
    name: 'Burung & Unggas (Avian)',
    scientificName: 'Aves / Psittaciformes',
    label: '🦜 Burung & Unggas (Avian / Psittacine)',
    category: 'Burung',
    emoji: '🦜',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Metabolisme sangat cepat; ekskresi asam urat ginjal, memerlukan interval dosis lebih rapat.'
  },
  {
    id: 'Reptil',
    name: 'Reptil & Kura-kura',
    scientificName: 'Reptilia / Testudines / Squamata',
    label: '🦎 Reptil / Kura-kura / Iguana (Reptilia)',
    category: 'Reptil',
    emoji: '🦎',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Ektotermik; eliminasi obat sangat lambat bergantung POTZ (Preferred Optimal Temperature Zone).'
  },
  {
    id: 'Eksotik',
    name: 'Satwa Eksotik & Mamalia Kecil',
    scientificName: 'Exotic & Wildlife',
    label: '🐾 Satwa Eksotik / Sugar Glider / Ferret',
    category: 'Eksotik',
    emoji: '🐾',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Gunakan protokol spesifik mamalia kecil; pantau ketat efek sedasi dan status hidrasi.'
  }
];

export interface SpeciesSafetyProfile {
  minMgKg: number;
  standardMgKg: number;
  maxMgKg: number;
  maxTotalMg?: number;
  frequency: string;
  route: string;
  durationDays: number;
  contraindicated?: boolean;
  contraindicationReason?: string;
  specialWarning?: string;
  clinicalAdvice?: string;
}

export interface DrugProtocol {
  id: string;
  name: string;
  genericName: string;
  brandExamples?: string;
  category: 'Antibiotik' | 'Analgesik' | 'Antiemetik' | 'Antiparasit' | 'Kortikosteroid' | 'Lainnya';
  defaultConcentrationMgPerMl: number;
  suggestedUnit: 'tablet' | 'kapsul' | 'mL' | 'tetes';
  globalWarnings?: string[];
  speciesProfiles: Record<SpeciesCategory, SpeciesSafetyProfile>;
}

export const normalizeSpeciesToCategory = (rawSpecies?: string): SpeciesCategory => {
  if (!rawSpecies) return 'Anjing';
  const lower = rawSpecies.toLowerCase();
  if (lower.includes('kucing') || lower.includes('cat') || lower.includes('feline')) return 'Kucing';
  if (lower.includes('kelinci') || lower.includes('rabbit') || lower.includes('lagomorph')) return 'Kelinci';
  if (lower.includes('burung') || lower.includes('bird') || lower.includes('avian') || lower.includes('unggas')) return 'Burung';
  if (lower.includes('hamster') || lower.includes('rodent') || lower.includes('guinea') || lower.includes('marmut') || lower.includes('tikus')) return 'Rodensia';
  if (lower.includes('reptil') || lower.includes('reptile') || lower.includes('kura') || lower.includes('turtle') || lower.includes('iguana') || lower.includes('ular') || lower.includes('gecko')) return 'Reptil';
  if (lower.includes('anjing') || lower.includes('dog') || lower.includes('canine')) return 'Anjing';
  return 'Eksotik';
};

export const getSpeciesPresetId = (rawSpecies?: string): string => {
  if (!rawSpecies) return 'Anjing';
  const cat = normalizeSpeciesToCategory(rawSpecies);
  return cat;
};

export const DRUG_PROTOCOLS: DrugProtocol[] = [
  {
    id: 'amox',
    name: 'Amoxicillin Trihydrate',
    genericName: 'Amoxicillin',
    brandExamples: 'Amoxan, Betamox, Amoxi-Tabs',
    category: 'Antibiotik',
    defaultConcentrationMgPerMl: 50,
    suggestedUnit: 'tablet',
    globalWarnings: [
      'Berikan bersama sedikit makanan bila timbul keluhan gastrointestinal ringan.',
      'Sediaan suspensi sirup harus dikocok homogen dan disimpan di kulkas (habis dlm 10-14 hari).'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 10,
        standardMgKg: 15,
        maxMgKg: 22,
        maxTotalMg: 1000,
        frequency: '2-3x sehari (q8-12h)',
        route: 'Oral (PO) / Injeksi (SC/IM)',
        durationDays: 7,
        clinicalAdvice: 'Efektif untuk infeksi sistemik, luka gigitan, ISPA & dermatitis bakterial.'
      },
      Kucing: {
        minMgKg: 10,
        standardMgKg: 12.5,
        maxMgKg: 20,
        maxTotalMg: 250,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 7,
        clinicalAdvice: 'Dosis aman 10 - 15 mg/kg. Suspensi cairan berasa dapat dicampur pakan basah.'
      },
      Kelinci: {
        minMgKg: 0,
        standardMgKg: 0,
        maxMgKg: 0,
        frequency: 'DILARANG',
        route: 'KONTRAINDIKASI MUTLAK ORAL',
        durationDays: 0,
        contraindicated: true,
        contraindicationReason: 'KONTRAINDIKASI MUTLAK ORAL: Memicu disbiose clostridial enterotoksemia akut & kematian fatal pada kelinci!',
        specialWarning: 'Dilarang keras memberikan sediaan amoksisilin oral pada kelinci (PLACE rule).'
      },
      Rodensia: {
        minMgKg: 0,
        standardMgKg: 0,
        maxMgKg: 0,
        frequency: 'DILARANG',
        route: 'KONTRAINDIKASI MUTLAK ORAL',
        durationDays: 0,
        contraindicated: true,
        contraindicationReason: 'KONTRAINDIKASI ORAL pada Guinea Pig & Hamster (Risiko enteritis toksik fatal).',
        specialWarning: 'Gunakan antibiotik alternatif seperti Enrofloxacin atau TMS.'
      },
      Burung: {
        minMgKg: 100,
        standardMgKg: 150,
        maxMgKg: 200,
        maxTotalMg: 80,
        frequency: '2-3x sehari (q8-12h)',
        route: 'Oral (PO) / Injeksi (IM)',
        durationDays: 7,
        clinicalAdvice: 'Unggas/burung membutuhkan dosis mg/kg jauh lebih tinggi karena laju ekskresi cepat.'
      },
      Reptil: {
        minMgKg: 10,
        standardMgKg: 20,
        maxMgKg: 25,
        maxTotalMg: 150,
        frequency: '1x per 24-48 jam (q24-48h)',
        route: 'Oral (PO) / Injeksi (IM cranial 1/3)',
        durationDays: 14,
        clinicalAdvice: 'Injeksi harus dilakukan di 1/3 bagian cranial tubuh (hindari renal portal system).'
      },
      Eksotik: {
        minMgKg: 10,
        standardMgKg: 15,
        maxMgKg: 20,
        maxTotalMg: 100,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 7,
        clinicalAdvice: 'Pastikan status flora usus satwa mamalia kecil sebelum pemberian.'
      }
    }
  },
  {
    id: 'clavamox',
    name: 'Amoxicillin-Clavulanate (Clavamox)',
    genericName: 'Amoxicillin + Asam Klavulanat',
    brandExamples: 'Clavamox, Synulox, Augmentin',
    category: 'Antibiotik',
    defaultConcentrationMgPerMl: 62.5,
    suggestedUnit: 'tablet',
    globalWarnings: [
      'Penyimpanan suspensi wajib di lemari pendingin (2-8°C), buang sisa setelah 10 hari.',
      'Sediaan tablet sangat higroskopis, buka blister sesaat sebelum diberikan.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 12.5,
        standardMgKg: 15,
        maxMgKg: 25,
        maxTotalMg: 1250,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 7,
        clinicalAdvice: 'Pilihan utama pyoderma resisten, infeksi saluran kemih (UTI) & abses periodontal.'
      },
      Kucing: {
        minMgKg: 12.5,
        standardMgKg: 12.5,
        maxMgKg: 20,
        maxTotalMg: 250,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Suspensi',
        durationDays: 7,
        clinicalAdvice: 'Sangat efektif untuk stomatitis feline berat, rhinitis bakterial & abses gigitan.'
      },
      Kelinci: {
        minMgKg: 0,
        standardMgKg: 0,
        maxMgKg: 0,
        frequency: 'DILARANG',
        route: 'KONTRAINDIKASI ORAL',
        durationDays: 0,
        contraindicated: true,
        contraindicationReason: 'KONTRAINDIKASI MUTLAK ORAL pada kelinci (menghancurkan mikrobioma caecum).',
        specialWarning: 'Gunakan injeksi penisilin G prokain SC atau alternatif fluorokuinolon bila terindikasi.'
      },
      Rodensia: {
        minMgKg: 0,
        standardMgKg: 0,
        maxMgKg: 0,
        frequency: 'DILARANG',
        route: 'KONTRAINDIKASI ORAL',
        durationDays: 0,
        contraindicated: true,
        contraindicationReason: 'KONTRAINDIKASI ORAL pada Hamster & Marmut (enterotoksemia clostridial).',
        specialWarning: 'Dilarang keras sediaan oral.'
      },
      Burung: {
        minMgKg: 100,
        standardMgKg: 125,
        maxMgKg: 150,
        maxTotalMg: 100,
        frequency: '2-3x sehari (q8-12h)',
        route: 'Oral (PO)',
        durationDays: 7,
        clinicalAdvice: 'Dosis avian disesuaikan bobot gram ke kg; campur formula lolohan jika perlu.'
      },
      Reptil: {
        minMgKg: 12.5,
        standardMgKg: 15,
        maxMgKg: 20,
        maxTotalMg: 150,
        frequency: '1x per 24 jam',
        route: 'Oral (PO)',
        durationDays: 14,
        clinicalAdvice: 'Pastikan temperatur kandang berada pada POTZ untuk absorpsi optimal.'
      },
      Eksotik: {
        minMgKg: 10,
        standardMgKg: 12.5,
        maxMgKg: 20,
        maxTotalMg: 80,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 7,
        clinicalAdvice: 'Gunakan sediaan tetes pediatrik dengan syringe 1 mL.'
      }
    }
  },
  {
    id: 'melox',
    name: 'Meloxicam',
    genericName: 'Meloxicam',
    brandExamples: 'Metacam, Meloxidyl, Mobic',
    category: 'Analgesik',
    defaultConcentrationMgPerMl: 1.5,
    suggestedUnit: 'mL',
    globalWarnings: [
      'Kontraindikasi keras pada pasien dehidrasi berat, hipotensi, dan gagal ginjal akut (AKI).',
      'Dilarang diberikan bersamaan dengan NSAID lain atau kortikosteroid (risiko ulkus lambung).'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 0.1,
        standardMgKg: 0.2,
        maxMgKg: 0.2,
        maxTotalMg: 15,
        frequency: '1x sehari (Loading: 0.2 mg/kg, lalu 0.1 mg/kg)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 4,
        clinicalAdvice: 'Hari ke-1 (Loading): 0.2 mg/kg, selanjutnya maintenance: 0.1 mg/kg q24h.'
      },
      Kucing: {
        minMgKg: 0.03,
        standardMgKg: 0.05,
        maxMgKg: 0.05,
        maxTotalMg: 1.5,
        frequency: '1x sehari (Single dose / Max 3 hari)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 2,
        specialWarning: '⚠️ BLACK BOX WARNING FELINE: Dosis maksimal ketat 0.05 mg/kg. Wajib status hidrasi & ginjal normal.',
        clinicalAdvice: 'Hati-hati risiko nefrotoksisitas felin; sediaan cairan 0.5 mg/mL lebih disukai untuk kucing.'
      },
      Kelinci: {
        minMgKg: 0.3,
        standardMgKg: 0.5,
        maxMgKg: 1.0,
        maxTotalMg: 5,
        frequency: '1-2x sehari (q12-24h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 5,
        clinicalAdvice: 'Metabolisme kelinci jauh lebih cepat dibanding anjing; dosis 0.3-0.6 mg/kg sangat efektif untuk ileus/pasca bedah.'
      },
      Rodensia: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 1.5,
        maxTotalMg: 2,
        frequency: '1-2x sehari (q12-24h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 4,
        clinicalAdvice: 'Analgesia bedah ortopedi dan penanganan trauma jaringan lunak pada hamster/guinea pig.'
      },
      Burung: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 2.0,
        maxTotalMg: 4,
        frequency: '1-2x sehari (q12h)',
        route: 'Oral (PO) / Injeksi (IM)',
        durationDays: 5,
        clinicalAdvice: 'Toleransi meloxicam pada avian sangat baik; dosis 1-2 mg/kg q12h umum dipakai untuk fraktur/artritis.'
      },
      Reptil: {
        minMgKg: 0.1,
        standardMgKg: 0.2,
        maxMgKg: 0.4,
        maxTotalMg: 6,
        frequency: '1x per 24-48 jam',
        route: 'Oral (PO) / Injeksi (IM/SC)',
        durationDays: 7,
        clinicalAdvice: 'Pastikan status hidrasi cairan tercukupi sebelum pemberian untuk melindungi ginjal reptil.'
      },
      Eksotik: {
        minMgKg: 0.2,
        standardMgKg: 0.4,
        maxMgKg: 0.6,
        maxTotalMg: 3,
        frequency: '1x sehari (q24h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 4,
        clinicalAdvice: 'Gunakan sediaan oral konsentrasi rendah dengan spuit mikro 0.3 mL.'
      }
    }
  },
  {
    id: 'carprofen',
    name: 'Carprofen (Rimadyl)',
    genericName: 'Carprofen',
    brandExamples: 'Rimadyl, Quellin, Carprieve',
    category: 'Analgesik',
    defaultConcentrationMgPerMl: 50,
    suggestedUnit: 'tablet',
    globalWarnings: [
      'Evaluasi profil hepar (ALT, AST) dan fungsi ginjal bila penggunaan > 14 hari.',
      'Hentikan segera bila muncul anoreksia, muntah, melena, atau letargi.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 2.2,
        standardMgKg: 4.4,
        maxMgKg: 4.4,
        maxTotalMg: 250,
        frequency: '1x sehari (4.4 mg/kg) atau dibagi 2.2 mg/kg q12h',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 5,
        clinicalAdvice: 'Standar emas penanganan osteoartritis kronis & analgesia bedah ortopedi kanin.'
      },
      Kucing: {
        minMgKg: 0,
        standardMgKg: 0,
        maxMgKg: 0,
        frequency: 'DILARANG',
        route: 'KONTRAINDIKASI MUTLAK',
        durationDays: 0,
        contraindicated: true,
        contraindicationReason: 'KONTRAINDIKASI MUTLAK PADA KUCING: Risiko toksisitas hepar dan gagal ginjal fatal akibat defisiensi glukuronidasi!',
        specialWarning: 'Gunakan Meloxicam atau Robenacoxib sebagai NSAID berlisensi feline.'
      },
      Kelinci: {
        minMgKg: 2.0,
        standardMgKg: 4.0,
        maxMgKg: 5.0,
        maxTotalMg: 20,
        frequency: '1x sehari (q24h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 4,
        clinicalAdvice: 'Dapat digunakan sebagai alternatif jika meloxicam tidak tersedia.'
      },
      Rodensia: {
        minMgKg: 3.0,
        standardMgKg: 5.0,
        maxMgKg: 5.0,
        maxTotalMg: 10,
        frequency: '1x sehari (q24h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 3,
        clinicalAdvice: 'Gunakan dosis minimum efektif.'
      },
      Burung: {
        minMgKg: 2.0,
        standardMgKg: 4.0,
        maxMgKg: 6.0,
        maxTotalMg: 10,
        frequency: '1x sehari (q24h)',
        route: 'Oral (PO) / Injeksi (IM)',
        durationDays: 4,
        clinicalAdvice: 'Meloxicam umumnya lebih direkomendasikan untuk kasus avian.'
      },
      Reptil: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 4.0,
        maxTotalMg: 15,
        frequency: '1x per 48 jam',
        route: 'Oral (PO) / Injeksi (IM)',
        durationDays: 7,
        clinicalAdvice: 'Interval panjang diperlukan karena klirens ginjal reptil lambat.'
      },
      Eksotik: {
        minMgKg: 2.0,
        standardMgKg: 4.0,
        maxMgKg: 4.4,
        maxTotalMg: 20,
        frequency: '1x sehari (q24h)',
        route: 'Oral (PO)',
        durationDays: 4,
        clinicalAdvice: 'Pantau asupan pakan dan hidrasi.'
      }
    }
  },
  {
    id: 'enro',
    name: 'Enrofloxacin (Baytril)',
    genericName: 'Enrofloxacin',
    brandExamples: 'Baytril, Enrocin, Floxabactin',
    category: 'Antibiotik',
    defaultConcentrationMgPerMl: 50,
    suggestedUnit: 'tablet',
    globalWarnings: [
      'Hindari penggunaan pada anjing ras besar fase pertumbuhan (< 1 tahun) karena risiko lesi kartilago artikular.',
      'Suntikan SC konsentrasi tinggi dapat memicu nekrosis jaringan kulit (lakukan pengenceran saline 1:1).'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 20,
        maxTotalMg: 300,
        frequency: '1x sehari (q24h) atau dibagi 2x sehari',
        route: 'Oral (PO) / Injeksi (SC/IM)',
        durationDays: 7,
        clinicalAdvice: 'Pilihan kuat untuk infeksi gram negatif saluran kemih (UTI), prostatitis & pneumonia bakterial.'
      },
      Kucing: {
        minMgKg: 2.5,
        standardMgKg: 5.0,
        maxMgKg: 5.0,
        maxTotalMg: 25,
        frequency: '1x sehari (q24h) - MAKS 5 mg/kg/hari',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 5,
        specialWarning: '⚠️ BAHAYA KEBUTAAN KUCING: Dosis > 5 mg/kg/hari memicu degenerasi retina & kebutaan permanen!',
        clinicalAdvice: 'Jangan pernah melampaui 5 mg/kg/hari pada felin. Gunakan Marbofloxacin/Pradofloxacin bila butuh dosis lebih tinggi.'
      },
      Kelinci: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 15,
        maxTotalMg: 50,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 10,
        clinicalAdvice: 'Antibiotik lini pertama teraman untuk Pasteurellosis (snuffles), abses, dan ensefalitozoonosis pada kelinci.'
      },
      Rodensia: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 20,
        maxTotalMg: 20,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 7,
        clinicalAdvice: 'Sangat aman untuk infeksi mikoplasma pernapasan pada tikus & hamster.'
      },
      Burung: {
        minMgKg: 15,
        standardMgKg: 20,
        maxMgKg: 30,
        maxTotalMg: 30,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Injeksi (IM)',
        durationDays: 7,
        clinicalAdvice: 'Antibiotik berspektrum luas untuk infeksi klamidiosis & salmonellosis avian.'
      },
      Reptil: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 10,
        maxTotalMg: 60,
        frequency: '1x per 24-48 jam (q24-48h)',
        route: 'Injeksi (IM cranial 1/3)',
        durationDays: 14,
        clinicalAdvice: 'Encerkan dengan NaCl 0.9% 1:1 sebelum injeksi IM untuk mencegah nekrosis jaringan lokal.'
      },
      Eksotik: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 15,
        maxTotalMg: 30,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 7,
        clinicalAdvice: 'Pilihan aman untuk infeksi bakterial satwa eksotik.'
      }
    }
  },
  {
    id: 'metro',
    name: 'Metronidazole',
    genericName: 'Metronidazole',
    brandExamples: 'Flagyl, Metrozine, Trichazole',
    category: 'Antibiotik',
    defaultConcentrationMgPerMl: 5,
    suggestedUnit: 'tablet',
    globalWarnings: [
      'Risiko neurotoksisitas (ataksia, nistagmus, kejang, kekakuan otot) pada akumulasi dosis tinggi.',
      'Rasa sangat pahit; jangan membelah tablet tanpa pembungkus kapsul (risiko hipersalivasi akut).'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 10,
        standardMgKg: 15,
        maxMgKg: 25,
        maxTotalMg: 750,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Infus lambat (IV)',
        durationDays: 5,
        clinicalAdvice: 'Pilihan utama penanganan Giardiasis, kolitis akut & infeksi bakteri anaerobik.'
      },
      Kucing: {
        minMgKg: 10,
        standardMgKg: 12.5,
        maxMgKg: 15,
        maxTotalMg: 100,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO kapsul)',
        durationDays: 5,
        specialWarning: 'Gunakan kapsul salut; rasa pahit memicu hipersalivasi dan penolakan pakan ekstrem pada kucing.',
        clinicalAdvice: 'Jangan melampaui 15 mg/kg q12h pada kucing untuk mencegah neurotoksisitas.'
      },
      Kelinci: {
        minMgKg: 10,
        standardMgKg: 20,
        maxMgKg: 25,
        maxTotalMg: 80,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Efektif untuk enterotoksemia anaerobik Clostridium sp. dan protozoa usus kelinci.'
      },
      Rodensia: {
        minMgKg: 10,
        standardMgKg: 20,
        maxMgKg: 30,
        maxTotalMg: 25,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Terapi giardia dan infeksi protozoa saluran pencernaan rodensia.'
      },
      Burung: {
        minMgKg: 20,
        standardMgKg: 30,
        maxMgKg: 50,
        maxTotalMg: 40,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Pilihan terapi Trichomoniasis (canker) pada merpati dan paruh bengkok.'
      },
      Reptil: {
        minMgKg: 20,
        standardMgKg: 50,
        maxMgKg: 100,
        maxTotalMg: 150,
        frequency: '1x per 48-72 jam',
        route: 'Oral (PO)',
        durationDays: 3,
        clinicalAdvice: 'Terapi amebiasis dan flagellata usus reptil.'
      },
      Eksotik: {
        minMgKg: 10,
        standardMgKg: 15,
        maxMgKg: 20,
        maxTotalMg: 50,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Pastikan dosis tepat dengan larutan suspensi pediatrik.'
      }
    }
  },
  {
    id: 'iver',
    name: 'Ivermectin',
    genericName: 'Ivermectin',
    brandExamples: 'Ivomec, Kepromec, Noromectin',
    category: 'Antiparasit',
    defaultConcentrationMgPerMl: 10,
    suggestedUnit: 'mL',
    globalWarnings: [
      'Dilarang diberikan melalui jalur Intravena (IV).',
      'Ukur volume dengan syringe 1 mL / spuit insulin (0.01 mL akurasi) karena potensi overdosis fatal.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 0.05,
        standardMgKg: 0.2,
        maxMgKg: 0.4,
        maxTotalMg: 10,
        frequency: '1x per 14 hari',
        route: 'Injeksi (SC)',
        durationDays: 1,
        specialWarning: '⚠️ KONTRAINDIKASI MUTLAK pada anjing ras mutasi MDR1 (Collie, Australian Shepherd, Sheltie).',
        clinicalAdvice: 'Lakukan tes genetik MDR1 bila merawat anjing ras herding sebelum injeksi ivermectin dosis scabies.'
      },
      Kucing: {
        minMgKg: 0.1,
        standardMgKg: 0.2,
        maxMgKg: 0.3,
        maxTotalMg: 2,
        frequency: '1x per 14 hari (ulang 1x)',
        route: 'Injeksi (SC)',
        durationDays: 1,
        clinicalAdvice: 'Sangat ampuh untuk scabies Notoedres cati dan Otodectes cynotis (ear mites).'
      },
      Kelinci: {
        minMgKg: 0.2,
        standardMgKg: 0.4,
        maxMgKg: 0.5,
        maxTotalMg: 3,
        frequency: '1x per 10-14 hari (ulang 2-3x)',
        route: 'Injeksi (SC)',
        durationDays: 1,
        clinicalAdvice: 'Pilihan standar untuk ear canker (Psoroptes cuniculi) dan fur mites (Cheyletiella).'
      },
      Rodensia: {
        minMgKg: 0.2,
        standardMgKg: 0.3,
        maxMgKg: 0.5,
        maxTotalMg: 1,
        frequency: '1x per 14 hari',
        route: 'Injeksi (SC) / Topical spot-on',
        durationDays: 1,
        clinicalAdvice: 'Pengenceran 1:10 dengan propilen glikol/minyak steril dianjurkan untuk bobot < 200g.'
      },
      Burung: {
        minMgKg: 0.1,
        standardMgKg: 0.2,
        maxMgKg: 0.4,
        maxTotalMg: 1,
        frequency: '1x per 14 hari',
        route: 'Topical spot-on / Injeksi (IM)',
        durationDays: 1,
        clinicalAdvice: 'Terapi scaly face/leg mite (Knemidocoptes pilae) pada lovebird dan kenari.'
      },
      Reptil: {
        minMgKg: 0,
        standardMgKg: 0,
        maxMgKg: 0,
        frequency: 'KONTRAINDIKASI KURA-KURA',
        route: 'DILARANG PADA TESTUDINES',
        durationDays: 0,
        contraindicated: true,
        contraindicationReason: 'KONTRAINDIKASI MUTLAK PADA KURA-KURA / PENYU (Chelonia): Menembus sawar darah otak, menyebabkan paralisis flasid fatal & kematian!',
        specialWarning: 'Jangan gunakan pada kura-kura, penyu, dan kadal indigo. Gunakan Fipronil spray terukur.'
      },
      Eksotik: {
        minMgKg: 0.1,
        standardMgKg: 0.2,
        maxMgKg: 0.3,
        maxTotalMg: 2,
        frequency: '1x per 14 hari',
        route: 'Injeksi (SC)',
        durationDays: 1,
        clinicalAdvice: 'Ukur volume dengan syringe insulin 0.3 mL.'
      }
    }
  },
  {
    id: 'dexa',
    name: 'Dexamethasone Sodium Phosphate',
    genericName: 'Dexamethasone 2 mg/mL',
    brandExamples: 'Dexa-Kel, Dexadreson, Cortidex',
    category: 'Kortikosteroid',
    defaultConcentrationMgPerMl: 2,
    suggestedUnit: 'mL',
    globalWarnings: [
      'Dilarang digabung bersamaan dengan NSAID (Meloxicam/Carprofen) - risiko perforasi lambung fatal.',
      'Hindari penggunaan pada pasien ulkus kornea, diabetes melitus aktif, dan infeksi mikosis sistemik.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 0.05,
        standardMgKg: 0.15,
        maxMgKg: 0.5,
        maxTotalMg: 20,
        frequency: '1x sehari (q24h)',
        route: 'Injeksi (IV/IM/SC)',
        durationDays: 2,
        clinicalAdvice: 'Anti-inflamasi akut: 0.1 - 0.2 mg/kg. Dosis syok anafilaksis: 1.0 - 2.0 mg/kg IV lambat.'
      },
      Kucing: {
        minMgKg: 0.05,
        standardMgKg: 0.1,
        maxMgKg: 0.3,
        maxTotalMg: 5,
        frequency: '1x sehari (q24h)',
        route: 'Injeksi (IV/SC)',
        durationDays: 2,
        clinicalAdvice: 'Efektif untuk krisis asma felin akut dan reaksi anafilaksis gigitan serangga.'
      },
      Kelinci: {
        minMgKg: 0.02,
        standardMgKg: 0.05,
        maxMgKg: 0.1,
        maxTotalMg: 1.5,
        frequency: '1x sehari (Single dose)',
        route: 'Injeksi (SC/IM)',
        durationDays: 1,
        specialWarning: 'Kelinci sangat sensitif terhadap efek imunosupresi kortikosteroid (risiko reaktivasi Encephalitozoon).',
        clinicalAdvice: 'Gunakan hanya untuk indikasi emergensi vital dengan dosis minimum.'
      },
      Rodensia: {
        minMgKg: 0.05,
        standardMgKg: 0.1,
        maxMgKg: 0.2,
        maxTotalMg: 1,
        frequency: '1x sehari',
        route: 'Injeksi (SC)',
        durationDays: 1,
        clinicalAdvice: 'Gunakan dosis tunggal bila syok atau alergi akut.'
      },
      Burung: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 2.0,
        maxTotalMg: 3,
        frequency: '1x sehari',
        route: 'Injeksi (IM/IV)',
        durationDays: 1,
        clinicalAdvice: 'Indikasi trauma kepala dan syok trauma akut pada burung.'
      },
      Reptil: {
        minMgKg: 0.05,
        standardMgKg: 0.1,
        maxMgKg: 0.25,
        maxTotalMg: 5,
        frequency: '1x per 24-48 jam',
        route: 'Injeksi (IM cranial)',
        durationDays: 2,
        clinicalAdvice: 'Hati-hati imunosupresi berat pada reptil.'
      },
      Eksotik: {
        minMgKg: 0.05,
        standardMgKg: 0.1,
        maxMgKg: 0.2,
        maxTotalMg: 2,
        frequency: '1x sehari',
        route: 'Injeksi (SC)',
        durationDays: 1,
        clinicalAdvice: 'Gunakan dosis tunggal emergensi.'
      }
    }
  },
  {
    id: 'cerenia',
    name: 'Maropitant Citrate (Cerenia)',
    genericName: 'Maropitant Citrate',
    brandExamples: 'Cerenia, Prevomax',
    category: 'Antiemetik',
    defaultConcentrationMgPerMl: 10,
    suggestedUnit: 'mL',
    globalWarnings: [
      'Simpan botol di lemari es (4°C) sebelum disuntikkan untuk mengurangi sensasi nyeri menyengat saat injeksi SC.',
      'Batas durasi pemakaian kontinu maksimal 5 hari berturut-turut.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 0.8,
        standardMgKg: 1.0,
        maxMgKg: 1.0,
        maxTotalMg: 50,
        frequency: '1x sehari (q24h)',
        route: 'Injeksi (SC/IV) / Oral (PO)',
        durationDays: 3,
        clinicalAdvice: 'Antiemetik antagonis NK-1 paling ampuh untuk parvovirus, gastroenteritis akut & mabuk perjalanan.'
      },
      Kucing: {
        minMgKg: 0.8,
        standardMgKg: 1.0,
        maxMgKg: 1.0,
        maxTotalMg: 10,
        frequency: '1x sehari (q24h)',
        route: 'Injeksi (SC/IV)',
        durationDays: 3,
        clinicalAdvice: 'Sangat efektif mengatasi emesis pada lipidosis hepatik feline, pankreatitis & penyakit ginjal kronis.'
      },
      Kelinci: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 1.0,
        maxTotalMg: 5,
        frequency: '1x sehari (q24h)',
        route: 'Injeksi (SC)',
        durationDays: 3,
        clinicalAdvice: 'Kelinci tidak bisa muntah secara fisiologis, namun Maropitant memberikan efek analgesia visceral sentral & anti-inflamasi ileus.'
      },
      Rodensia: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 1.0,
        maxTotalMg: 2,
        frequency: '1x sehari',
        route: 'Injeksi (SC)',
        durationDays: 2,
        clinicalAdvice: 'Analgesia nyeri viseral pada abdomen akut.'
      },
      Burung: {
        minMgKg: 1.0,
        standardMgKg: 1.5,
        maxMgKg: 2.0,
        maxTotalMg: 3,
        frequency: '1x sehari (q24h)',
        route: 'Injeksi (IM/SC)',
        durationDays: 3,
        clinicalAdvice: 'Mengatasi regurgitasi proventrikular dan mabuk stres transportasi.'
      },
      Reptil: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 1.0,
        maxTotalMg: 5,
        frequency: '1x per 24 jam',
        route: 'Injeksi (IM/SC)',
        durationDays: 3,
        clinicalAdvice: 'Mengatasi regurgitasi makanan pada ular dan kadal pasca stres.'
      },
      Eksotik: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 1.0,
        maxTotalMg: 5,
        frequency: '1x sehari',
        route: 'Injeksi (SC)',
        durationDays: 3,
        clinicalAdvice: 'Injeksi sediaan dingin untuk kenyamanan pasien.'
      }
    }
  },
  {
    id: 'gabapentin',
    name: 'Gabapentin',
    genericName: 'Gabapentin',
    brandExamples: 'Neurontin, Gabalept, Alpentin',
    category: 'Analgesik',
    defaultConcentrationMgPerMl: 50,
    suggestedUnit: 'kapsul',
    globalWarnings: [
      '⚠️ PERINGATAN KERAS XYLITOL: HINDARI sediaan sirup manusia yang mengandung pemanis Xylitol (sangat toksik bagi anjing/kucing).',
      'Efek sedasi dan ataksia ringan dapat muncul pada awal terapi.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 20,
        maxTotalMg: 600,
        frequency: '2-3x sehari (q8-12h)',
        route: 'Oral (PO)',
        durationDays: 7,
        clinicalAdvice: 'Analgesia nyeri neuropatik, osteoartritis kronis & terapi ajuvan antikonvulsan epilepsi.'
      },
      Kucing: {
        minMgKg: 10,
        standardMgKg: 20,
        maxMgKg: 30,
        maxTotalMg: 150,
        frequency: '1-2x sehari / Dosis tunggal pre-visit (50-100 mg per ekor)',
        route: 'Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Protokol Fear-Free: Berikan 50 - 100 mg per ekor 2 jam sebelum kunjungan klinik untuk mengurangi agresi & stres periksa.'
      },
      Kelinci: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 25,
        maxTotalMg: 50,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 7,
        clinicalAdvice: 'Analgesia nyeri kronis pada spondylosis dan pododermatitis (sore hocks) kelinci.'
      },
      Rodensia: {
        minMgKg: 10,
        standardMgKg: 20,
        maxMgKg: 30,
        maxTotalMg: 15,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Gunakan sediaan puyer racikan bebas xylitol.'
      },
      Burung: {
        minMgKg: 10,
        standardMgKg: 15,
        maxMgKg: 25,
        maxTotalMg: 20,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 7,
        clinicalAdvice: 'Terapi analgesia nyeri neuropatik dan self-mutilation (feather plucking syndrom).'
      },
      Reptil: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 20,
        maxTotalMg: 40,
        frequency: '1x per 24 jam',
        route: 'Oral (PO)',
        durationDays: 10,
        clinicalAdvice: 'Analgesia nyeri kronis pasca amputasi atau trauma cangkang kura-kura.'
      },
      Eksotik: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 20,
        maxTotalMg: 25,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Pastikan racikan bebas pemanis buatan.'
      }
    }
  },
  {
    id: 'furosemide',
    name: 'Furosemide (Lasix)',
    genericName: 'Furosemide',
    brandExamples: 'Lasix, Furovet, Uremide',
    category: 'Lainnya',
    defaultConcentrationMgPerMl: 20,
    suggestedUnit: 'mL',
    globalWarnings: [
      'Pantau ketat tanda-tanda dehidrasi akut, hipokalemia, dan azotemia prerenal.',
      'Sediakan akses air minum bebas kecuali pada fase akut edema paru dekompensasi kordis.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 4.0,
        maxTotalMg: 120,
        frequency: '2-3x sehari (q8-12h)',
        route: 'Injeksi (IV/IM) / Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Pilihan utama dekompensasi kordis kiri (CHF), edema paru kardiogenik & asites.'
      },
      Kucing: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 2.0,
        maxTotalMg: 20,
        frequency: '1-2x sehari (q12-24h)',
        route: 'Injeksi (IV/IM/SC) / Oral (PO)',
        durationDays: 5,
        clinicalAdvice: 'Kucing sangat rentan dehidrasi dan hipokalemia; gunakan dosis terendah yang efektif.'
      },
      Kelinci: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 4.0,
        maxTotalMg: 15,
        frequency: '2x sehari (q12h)',
        route: 'Injeksi (SC/IM) / Oral (PO)',
        durationDays: 4,
        clinicalAdvice: 'Penanganan kardiomiopati kongestif dan efusi pleura pada kelinci tua.'
      },
      Rodensia: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 5.0,
        maxTotalMg: 5,
        frequency: '2x sehari',
        route: 'Injeksi (SC/IM) / Oral',
        durationDays: 3,
        clinicalAdvice: 'Edema paru dan kongesti sirkulasi.'
      },
      Burung: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 4.0,
        maxTotalMg: 5,
        frequency: '1-2x sehari',
        route: 'Injeksi (IM) / Oral (PO)',
        durationDays: 3,
        clinicalAdvice: 'Asites dan penyakit jantung kronis avian.'
      },
      Reptil: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 5.0,
        maxTotalMg: 10,
        frequency: '1x per 24-48 jam',
        route: 'Injeksi (IM cranial)',
        durationDays: 5,
        clinicalAdvice: 'Efusi selomik dan anasarka pada reptil.'
      },
      Eksotik: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 3.0,
        maxTotalMg: 10,
        frequency: '1-2x sehari',
        route: 'Injeksi (SC) / Oral',
        durationDays: 4,
        clinicalAdvice: 'Evaluasi elektrolit serum berkala.'
      }
    }
  },
  {
    id: 'tramadol',
    name: 'Tramadol HCl',
    genericName: 'Tramadol HCl',
    brandExamples: 'Tramal, Ultram, Conzip',
    category: 'Analgesik',
    defaultConcentrationMgPerMl: 50,
    suggestedUnit: 'tablet',
    globalWarnings: [
      'Jangan dikombinasikan dengan Ondansetron (antagonisme reseptor 5-HT3) atau SSRI/MAOI (risiko Sindrom Serotonin fatal).',
      'Rasa sangat pahit pada sediaan cair/tablet belah; berpotensi memicu hipersalivasi akut.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 2.0,
        standardMgKg: 3.0,
        maxMgKg: 5.0,
        maxTotalMg: 200,
        frequency: '2-3x sehari (q8-12h)',
        route: 'Oral (PO) / Injeksi (IV/SC lambat)',
        durationDays: 5,
        clinicalAdvice: 'Analgesik opioid ajuvan pasca operasi ortopedi & nyeri jaringan lunak sedang.'
      },
      Kucing: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 4.0,
        maxTotalMg: 20,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO kapsul salut)',
        durationDays: 3,
        specialWarning: 'Gunakan kapsul salut; rasa pahit memicu hipersalivasi dan penolakan pakan ekstrem.',
        clinicalAdvice: 'Efikasi analgesia pada felin lebih tinggi dibanding kanin karena jalur metabolit M1 aktif.'
      },
      Kelinci: {
        minMgKg: 5.0,
        standardMgKg: 10.0,
        maxMgKg: 15.0,
        maxTotalMg: 40,
        frequency: '2-3x sehari (q8-12h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 4,
        clinicalAdvice: 'Analgesia nyeri pasca laparotomi atau fraktur pada kelinci.'
      },
      Rodensia: {
        minMgKg: 5.0,
        standardMgKg: 10.0,
        maxMgKg: 20.0,
        maxTotalMg: 10,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO) / Injeksi (SC)',
        durationDays: 3,
        clinicalAdvice: 'Analgesia pasca tindakan bedah kecil.'
      },
      Burung: {
        minMgKg: 10.0,
        standardMgKg: 15.0,
        maxMgKg: 30.0,
        maxTotalMg: 20,
        frequency: '2-3x sehari (q8-12h)',
        route: 'Oral (PO) / Injeksi (IM)',
        durationDays: 4,
        clinicalAdvice: 'Analgesia fraktur tulang panjang avian.'
      },
      Reptil: {
        minMgKg: 5.0,
        standardMgKg: 10.0,
        maxMgKg: 15.0,
        maxTotalMg: 25,
        frequency: '1x per 24-48 jam',
        route: 'Oral (PO) / Injeksi (IM)',
        durationDays: 5,
        clinicalAdvice: 'Analgesia trauma cangkang atau luka gigitan.'
      },
      Eksotik: {
        minMgKg: 2.0,
        standardMgKg: 5.0,
        maxMgKg: 10.0,
        maxTotalMg: 15,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 3,
        clinicalAdvice: 'Gunakan suspensi dengan penyamar rasa.'
      }
    }
  },
  {
    id: 'prednisolone',
    name: 'Prednisolone',
    genericName: 'Prednisolone / Prednisone',
    brandExamples: 'Prednicort, Deltasone, Solu-Delta-Cortef',
    category: 'Kortikosteroid',
    defaultConcentrationMgPerMl: 5,
    suggestedUnit: 'tablet',
    globalWarnings: [
      'Dilarang keras diberikan bersamaan dengan NSAID (Meloxicam, Carprofen) - risiko perforasi lambung & perdarahan GI.',
      'Wajib tapering-off bertahap jika penggunaan lebih dari 7-10 hari untuk mencegah insufisiensi adrenal akut.'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 2.0,
        maxTotalMg: 60,
        frequency: '1-2x sehari (q12-24h), lalu tapering',
        route: 'Oral (PO)',
        durationDays: 7,
        clinicalAdvice: 'Anti-inflamasi: 0.5-1.0 mg/kg q24h. Imunosupresi (IMHA, ITP, Pemphigus): 2.0-3.0 mg/kg/hari.'
      },
      Kucing: {
        minMgKg: 1.0,
        standardMgKg: 1.5,
        maxMgKg: 3.0,
        maxTotalMg: 15,
        frequency: '1-2x sehari (q12-24h)',
        route: 'Oral (PO)',
        durationDays: 7,
        clinicalAdvice: 'Kucing membutuhkan Prednisolone (bukan prednisone) karena bioavailabilitas konversi hepatik lebih unggul.'
      },
      Kelinci: {
        minMgKg: 0.2,
        standardMgKg: 0.5,
        maxMgKg: 1.0,
        maxTotalMg: 3,
        frequency: '1x sehari (Single dose / Singkat)',
        route: 'Oral (PO)',
        durationDays: 2,
        specialWarning: 'Gunakan sangat hati-hati; imunosupresi berisiko memicu reaktivasi ensefalitozoonosis & enterotoksemia.',
        clinicalAdvice: 'Hanya bila terindikasi inflamasi berat emergensi.'
      },
      Rodensia: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 2.0,
        maxTotalMg: 2,
        frequency: '1x sehari',
        route: 'Oral (PO)',
        durationDays: 3,
        clinicalAdvice: 'Anti-inflamasi akut jangka pendek.'
      },
      Burung: {
        minMgKg: 1.0,
        standardMgKg: 2.0,
        maxMgKg: 4.0,
        maxTotalMg: 5,
        frequency: '1x sehari',
        route: 'Oral (PO)',
        durationDays: 3,
        clinicalAdvice: 'Hanya untuk kasus trauma neurologis berat/alergi anafilaktoid.'
      },
      Reptil: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 2.0,
        maxTotalMg: 8,
        frequency: '1x per 48 jam',
        route: 'Oral (PO)',
        durationDays: 4,
        clinicalAdvice: 'Pantau ketat tanda infeksi sekunder.'
      },
      Eksotik: {
        minMgKg: 0.5,
        standardMgKg: 1.0,
        maxMgKg: 2.0,
        maxTotalMg: 5,
        frequency: '1x sehari',
        route: 'Oral (PO)',
        durationDays: 3,
        clinicalAdvice: 'Gunakan durasi minimal.'
      }
    }
  },
  {
    id: 'doxycycline',
    name: 'Doxycycline Hyclate',
    genericName: 'Doxycycline',
    brandExamples: 'Vibramycin, Doxivet, Ronaxan',
    category: 'Antibiotik',
    defaultConcentrationMgPerMl: 10,
    suggestedUnit: 'tablet',
    globalWarnings: [
      '⚠️ RISIKO STRIKTUR ESOFAGUS PADA KUCING: Wajib beri air minum minimal 5-10 mL sesudah menelan tablet/kapsul.',
      'Hindari pemberian bersamaan dengan susu, kalsium, besi, atau sukralfat (kelasi khelat).'
    ],
    speciesProfiles: {
      Anjing: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 10,
        maxTotalMg: 300,
        frequency: '1x sehari (q24h) atau 5 mg/kg q12h bersama pakan',
        route: 'Oral (PO)',
        durationDays: 28,
        clinicalAdvice: 'Pilihan utama penanganan Ehrlichiosis, Anaplasmosis, Lyme disease, Hemoplasmosis & Wolbachia pada Dirofilaria.'
      },
      Kucing: {
        minMgKg: 5,
        standardMgKg: 10,
        maxMgKg: 10,
        maxTotalMg: 50,
        frequency: '1x sehari (q24h) atau dibagi 2x sehari',
        route: 'Oral (PO suspensi berpelumas)',
        durationDays: 14,
        specialWarning: '⚠️ Wajib bilas dengan 6 mL air sesudah minum tablet untuk mencegah esophagitis ulseratif dan striktur esofagus permanen.',
        clinicalAdvice: 'Standar baku emas terapi Mycoplasma hemofelis (FIA) dan Chlamydia felis.'
      },
      Kelinci: {
        minMgKg: 2.5,
        standardMgKg: 5.0,
        maxMgKg: 10.0,
        maxTotalMg: 20,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 14,
        clinicalAdvice: 'Antibiotik aman untuk infeksi saluran napas atas (Treponema cuniculi, Mycoplasma).'
      },
      Rodensia: {
        minMgKg: 5.0,
        standardMgKg: 10.0,
        maxMgKg: 15.0,
        maxTotalMg: 10,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 14,
        clinicalAdvice: 'Terapi mikoplasmosis pernapasan kronis (CRD) pada tikus dan hamster.'
      },
      Burung: {
        minMgKg: 25.0,
        standardMgKg: 50.0,
        maxMgKg: 75.0,
        maxTotalMg: 50,
        frequency: '1-2x sehari (q12-24h)',
        route: 'Oral (PO) / Injeksi (IM)',
        durationDays: 30,
        clinicalAdvice: 'Protokol standar eradikasi Chlamydiosis (Psittacosis) selama 30-45 hari.'
      },
      Reptil: {
        minMgKg: 5.0,
        standardMgKg: 10.0,
        maxMgKg: 10.0,
        maxTotalMg: 40,
        frequency: '1x per 24 jam',
        route: 'Oral (PO)',
        durationDays: 14,
        clinicalAdvice: 'Terapi mikoplasma pernapasan kura-kura dan iguana.'
      },
      Eksotik: {
        minMgKg: 5.0,
        standardMgKg: 10.0,
        maxMgKg: 15.0,
        maxTotalMg: 20,
        frequency: '2x sehari (q12h)',
        route: 'Oral (PO)',
        durationDays: 14,
        clinicalAdvice: 'Gunakan formula suspensi cair.'
      }
    }
  }
];

export type SafetyEvaluationStatus =
  | 'contraindicated'
  | 'underdose'
  | 'optimal'
  | 'warning_high'
  | 'overdose_danger';

export interface SafetyEvaluationResult {
  status: SafetyEvaluationStatus;
  statusLabel: string;
  badgeClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  description: string;
  minSafeMgKg: number;
  standardMgKg: number;
  maxSafeMgKg: number;
  isCapped: boolean;
  maxCappedMg?: number;
}

// -------------------------------------------------------------
// DRUG-DRUG CONTRAINDICATION & INTERACTION KNOWLEDGE BASE
// -------------------------------------------------------------

export type DrugInteractionSeverity =
  | 'contraindicated'  // 🚨 KONTRAINDIKASI MUTLAK: Fatal / Bahaya Toksik Berat (Merah)
  | 'major_warning'    // ⚠️ PERINGATAN MAYOR: Toksisitas Organ / Antagonisme Signifikan (Oranye)
  | 'moderate_caution'; // ℹ️ PERHATIAN MODERAT: Penyesuaian Waktu / Pengawasan Ketat (Kuning)

export interface DrugInteractionRule {
  id: string;
  group1Keywords: string[];
  group2Keywords: string[];
  severity: DrugInteractionSeverity;
  title: string;
  mechanism: string;
  clinicalImpact: string;
  recommendation: string;
  washoutPeriod?: string;
  category: 'GI Toxicity' | 'Organ Failure' | 'Pharmacodynamic' | 'Pharmacokinetic' | 'CNS/Neuro';
}

export const DRUG_INTERACTION_RULES: DrugInteractionRule[] = [
  {
    id: 'nsaid_corticosteroid',
    group1Keywords: ['meloxicam', 'carprofen', 'ketoprofen', 'firocoxib', 'nsaid', 'rimadyl', 'metacam', 'mobic', 'carprieve'],
    group2Keywords: ['dexamethasone', 'prednisolone', 'prednisone', 'methylprednisolone', 'triamcinolone', 'kortikosteroid', 'steroid', 'dexa', 'cortidex', 'solu-delta'],
    severity: 'contraindicated',
    category: 'GI Toxicity',
    title: '🚨 KONTRAINDIKASI MUTLAK: NSAID + Kortikosteroid',
    mechanism: 'Inhibisi ganda enzim siklooksigenase (COX) dan fosfolipase A2 yang menekan sintesis prostaglandin pelindung mukosa lambung (PGE2 & PGI2) dan perfusi mikrovaskular ginjal secara masif.',
    clinicalImpact: 'Risiko sangat tinggi memicu ulserasi gastrointestinal masif, perforasi lambung/duodenum, hematemesis, melena, peritonitis septik akut, dan gagal ginjal akut (AKI) fatal.',
    recommendation: 'DILARANG KERAS DIBERIKAN BERSAMAAN! Wajib terapkan wash-out period minimal 5-7 hari (atau 14 hari bila steroid long-acting) sebelum memulai regimen NSAID/Steroid baru.',
    washoutPeriod: '5 - 7 Hari (Wash-out Period Wajib)'
  },
  {
    id: 'nsaid_nsaid_duplicate',
    group1Keywords: ['meloxicam', 'metacam', 'meloxidyl'],
    group2Keywords: ['carprofen', 'rimadyl', 'ketoprofen', 'firocoxib', 'tolfenamic', 'carprieve'],
    severity: 'contraindicated',
    category: 'GI Toxicity',
    title: '🚨 KONTRAINDIKASI MUTLAK: Duplikasi Polifarmasi NSAID',
    mechanism: 'Kompetisi saturasi ikatan protein plasma albumin dan beban ganda toksisitas siklooksigenase pada mikrosirkulasi renal dan barier mukosa usus.',
    clinicalImpact: 'Nekrosis papiler ginjal akut (Papillary Necrosis), penurunan drastis laju filtrasi glomerulus, tukak lambung berdarah, dan kegagalan hepar.',
    recommendation: 'Hentikan salah satu sediaan NSAID segera. Jangan pernah meresepkan lebih dari 1 jenis NSAID secara bersamaan.',
    washoutPeriod: '5 Hari'
  },
  {
    id: 'steroid_steroid_duplicate',
    group1Keywords: ['dexamethasone', 'dexa', 'cortidex', 'dexadreson'],
    group2Keywords: ['prednisolone', 'prednisone', 'methylprednisolone', 'solu-delta'],
    severity: 'major_warning',
    category: 'Organ Failure',
    title: '⚠️ PERINGATAN MAYOR: Duplikasi Kortikosteroid Sistemik',
    mechanism: 'Supresi aksis hipotalamus-hipofisis-adrenal (HPA) secara aditif dan hiperkortisolemia iatrogenik akut.',
    clinicalImpact: 'Imunosupresi berat sekunder, infeksi oportunistik masif, atrofi adrenal, hiperglikemia akut, polidipsia/poliuria ekstrem, dan kelemahan otot.',
    recommendation: 'Rasionalisasikan menjadi satu jenis kortikosteroid dengan dosis tunggal dan jadwal tapering terukur.'
  },
  {
    id: 'nsaid_furosemide',
    group1Keywords: ['meloxicam', 'carprofen', 'ketoprofen', 'nsaid', 'rimadyl', 'metacam'],
    group2Keywords: ['furosemide', 'lasix', 'uremide', 'furovet', 'diuretik'],
    severity: 'major_warning',
    category: 'Organ Failure',
    title: '⚠️ PERINGATAN MAYOR: NSAID + Diuretik Furosemide',
    mechanism: 'NSAID menghambat sintesis prostaglandin vasodilatasi ginjal, sehingga meniadakan efek natriuretik dan diuretik furosemide serta menurunkan laju filtrasi glomerulus.',
    clinicalImpact: 'Gagal kontrol dekompensasi kordis (CHF), retensi cairan paru/asites, dan lonjakan cepat azotemia prerenal (BUN & Kreatinin meningkat tajam).',
    recommendation: 'Pertimbangkan penggantian analgesik dengan Opioid (Tramadol/Butorphanol) atau Gabapentin. Jika NSAID mutlak diperlukan, pantau hidrasi dan kreatinin berkala.'
  },
  {
    id: 'tramadol_ondansetron',
    group1Keywords: ['tramadol', 'tramal', 'ultram'],
    group2Keywords: ['ondansetron', 'zofran', 'narfoz', 'invomit'],
    severity: 'major_warning',
    category: 'Pharmacodynamic',
    title: '⚠️ PERINGATAN MAYOR: Antagonisme Efek Analgesik Tramadol + Ondansetron',
    mechanism: 'Ondansetron merupakan antagonis reseptor serotonin 5-HT3 sentral yang secara kompetitif memblok jalur modulasi nyeri descending yang diperlukan tramadol untuk bekerja.',
    clinicalImpact: 'Penurunan drastis efikasi analgesia tramadol; pasien tetap mengalami nyeri pasca operasi atau trauma meski dosis tramadol dinaikkan.',
    recommendation: 'Ganti antiemetik dengan Maropitant (Cerenia) yang bekerja via antagonis reseptor NK-1 tanpa mengganggu jalur analgesia opioid/serotonergik.'
  },
  {
    id: 'tramadol_ssri_maoi',
    group1Keywords: ['tramadol', 'tramal'],
    group2Keywords: ['fluoxetine', 'amitriptyline', 'clomipramine', 'selegiline', 'maoi', 'ssri'],
    severity: 'contraindicated',
    category: 'CNS/Neuro',
    title: '🚨 KONTRAINDIKASI MUTLAK: Risiko Sindrom Serotonin Akut',
    mechanism: 'Akumulasi serotonin ekstraseluler berlebih akibat inhibisi ganda reuptake serotonin dan aktivitas agonis opioid.',
    clinicalImpact: 'Sindrom Serotonin fatal: Hipertermia maligna, rigiditas otot parah, mioklonus, kejang konvulsif, agitasi hebat, dan kolaps kardiovaskular.',
    recommendation: 'DILARANG DIBERIKAN BERSAMAAN! Berikan jarak waktu wash-out minimal 14 hari bila beralih dari terapi antidepresan/MAOI.'
  },
  {
    id: 'fluoroquinolone_cations',
    group1Keywords: ['enrofloxacin', 'baytril', 'marbofloxacin', 'ciprofloxacin'],
    group2Keywords: ['sucralfate', 'kalsium', 'calcium', 'antasida', 'antacid', 'besi', 'ferrous', 'alumunium', 'magnesium', 'inpepsa'],
    severity: 'moderate_caution',
    category: 'Pharmacokinetic',
    title: 'ℹ️ PERHATIAN MODERAT: Kelasi Fisikokimia Fluoroquinolone & Kation',
    mechanism: 'Pembentukan khelat koordinasi tak larut antara cincin kuinon antibiotik dan kation polivalen (Al, Mg, Ca, Fe).',
    clinicalImpact: 'Penurunan bioavailabilitas absorpsi oral antibiotik hingga >85%, menyebabkan kegagalan terapi infeksi dan memicu resistensi antibiotik.',
    recommendation: 'Beri jeda waktu pemberian minimal 2 - 3 jam sebelum atau sesudah sediaan sukralfat, antasida, atau suplemen mineral.'
  },
  {
    id: 'doxycycline_penicillins',
    group1Keywords: ['doxycycline', 'doxivet', 'vibramycin', 'ronaxan', 'tetrasiklin'],
    group2Keywords: ['amoxicillin', 'clavamox', 'synulox', 'ampicillin', 'penicillin', 'augmentin'],
    severity: 'moderate_caution',
    category: 'Pharmacodynamic',
    title: 'ℹ️ PERHATIAN MODERAT: Antagonisme Bakteriostatik vs Bakterisidal',
    mechanism: 'Antibiotik beta-laktam bakterisidal membutuhkan populasi bakteri yang aktif membelah untuk melisiskan dinding sel, sedangkan doksisiklin menghambat sintesis protein bakteri (bakteriostatik).',
    clinicalImpact: 'Efek bakterisidal penisilin menjadi tumpul dan menurun efektivitas pemusnahan patogen in vivo.',
    recommendation: 'Hindari kombinasi simultan untuk etiologi infeksi tunggal kecuali pada kasus infeksi polimikrobial kompleks yang terbukti kultur.'
  },
  {
    id: 'ivermectin_pgp_inhibitors',
    group1Keywords: ['ivermectin', 'ivomec', 'kepromec', 'noromectin'],
    group2Keywords: ['ketoconazole', 'itraconazole', 'spironolactone', 'cyclosporine', 'erythromycin', 'verapamil'],
    severity: 'contraindicated',
    category: 'CNS/Neuro',
    title: '🚨 KONTRAINDIKASI MUTLAK: Inhibisi P-Glikoprotein & Neurotoksisitas Ivermectin',
    mechanism: 'Inhibisi pompa efluks sawar darah otak P-glikoprotein (ABCB1) menyebabkan ivermectin menembus SSP dan berikatan masif pada reseptor GABA sentral.',
    clinicalImpact: 'Neurotoksisitas fatal: Ataksia berat, midriasis tidak responsif, tremor, depresi pernapasan, koma, dan kematian terutama pada ras rentan.',
    recommendation: 'Hindari kombinasi Ivermectin dosis sistemik dengan obat inhibitor CYP3A4 / P-gp. Gunakan antiparasit golongan isoxazoline (Fluralaner/Afoxolaner) atau Selamectin.'
  },
  {
    id: 'metronidazole_cimetidine',
    group1Keywords: ['metronidazole', 'flagyl', 'metrozine'],
    group2Keywords: ['cimetidine', 'tagamet', 'phenobarbital'],
    severity: 'major_warning',
    category: 'Pharmacokinetic',
    title: '⚠️ PERINGATAN MAYOR: Penghambatan Metabolisme Hepatik Metronidazole',
    mechanism: 'Inhibisi enzim sitokrom P450 hepar memperpanjang waktu paruh eliminasi plasma metronidazole.',
    clinicalImpact: 'Akumulasi konsentrasi obat toksik dalam sirkulasi yang meningkatkan risiko neurotoksisitas (ataksia, nistagmus vertikal, kejang).',
    recommendation: 'Gunakan Famotidine atau Omeprazole sebagai pengganti Cimetidine untuk perlindungan lambung yang aman dari interaksi CYP450.'
  },
  {
    id: 'gabapentin_cns_depressants',
    group1Keywords: ['gabapentin', 'neurontin', 'alpentin'],
    group2Keywords: ['tramadol', 'butorphanol', 'acepromazine', 'diazepam', 'alprazolam', 'sedatif'],
    severity: 'moderate_caution',
    category: 'CNS/Neuro',
    title: 'ℹ️ PERHATIAN MODERAT: Potensiasi Depresi Sistem Saraf Pusat (Sedasi Aditif)',
    mechanism: 'Efek aditif modulasi neurotransmiter penghambat (GABAergik & Opioidergik) pada susunan saraf pusat.',
    clinicalImpact: 'Sedasi dalam, letargi berkepanjangan, ataksia motorik berat, atau bradipnea ringan terutama pada pasien geriatrik/lemah.',
    recommendation: 'Mulai dengan titrasi dosis terendah. Pantau status kesadaran, laju pernapasan, dan refleks ambulasi pasien.'
  }
];

export interface ActivePrescriptionItem {
  drugName: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  source?: string;
  date?: string;
  doctorName?: string;
  notes?: string;
}

export interface DetectedContraindication {
  ruleId: string;
  severity: DrugInteractionSeverity;
  severityLabel: string;
  title: string;
  currentDrugName: string;
  conflictingDrugName: string;
  conflictingSource: string;
  conflictingDetails?: string;
  mechanism: string;
  clinicalImpact: string;
  recommendation: string;
  washoutPeriod?: string;
  badgeClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  isFatalContraindication: boolean;
  category: string;
}

/**
 * Normalizes drug text and determines whether a given text matches any keyword from a group.
 */
function matchesKeywords(text: string, keywords: string[]): boolean {
  if (!text) return false;
  const clean = text.toLowerCase();
  return keywords.some((kw) => {
    const k = kw.toLowerCase();
    return clean.includes(k) || k.includes(clean);
  });
}

/**
 * Real-time Contraindication & Drug-Drug Interaction Detection Engine
 * Compares the target calculated drug against all medications logged in the patient's active EMR prescriptions.
 */
export function detectDrugContraindications(
  targetProtocol: DrugProtocol,
  activePrescriptions: ActivePrescriptionItem[]
): DetectedContraindication[] {
  if (!targetProtocol || !activePrescriptions || activePrescriptions.length === 0) {
    return [];
  }

  // Construct target text identity
  const targetText = [
    targetProtocol.id,
    targetProtocol.name,
    targetProtocol.genericName,
    targetProtocol.category,
    targetProtocol.brandExamples || ''
  ].join(' ').toLowerCase();

  const results: DetectedContraindication[] = [];
  const processedRuleKeys = new Set<string>();

  for (const rule of DRUG_INTERACTION_RULES) {
    // Check if targetProtocol matches group 1 or group 2
    const targetMatchesGroup1 = matchesKeywords(targetText, rule.group1Keywords);
    const targetMatchesGroup2 = matchesKeywords(targetText, rule.group2Keywords);

    if (!targetMatchesGroup1 && !targetMatchesGroup2) {
      continue;
    }

    // Determine which keywords the conflicting active prescription should match
    const conflictingKeywords = targetMatchesGroup1 ? rule.group2Keywords : rule.group1Keywords;

    for (const rx of activePrescriptions) {
      const rxText = [rx.drugName, rx.notes || '', rx.dosage || ''].join(' ').toLowerCase();

      // Avoid self-matching the exact same calculation entry if names are identical
      const isExactSameInstance =
        rx.drugName.trim().toLowerCase() === targetProtocol.name.trim().toLowerCase() &&
        rx.source === 'calculator_draft';

      if (isExactSameInstance) {
        continue;
      }

      if (matchesKeywords(rxText, conflictingKeywords)) {
        const uniqueKey = `${rule.id}__${rx.drugName}`;
        if (processedRuleKeys.has(uniqueKey)) continue;
        processedRuleKeys.add(uniqueKey);

        const isFatal = rule.severity === 'contraindicated';

        let severityLabel = 'ℹ️ PERHATIAN KLINIS';
        let badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
        let bgClass = 'bg-amber-50/90';
        let borderClass = 'border-amber-300';
        let textClass = 'text-amber-900';

        if (rule.severity === 'contraindicated') {
          severityLabel = '🚨 KONTRAINDIKASI MUTLAK';
          badgeClass = 'bg-rose-600 text-white font-black animate-pulse';
          bgClass = 'bg-rose-50 border-rose-300';
          borderClass = 'border-rose-400 ring-2 ring-rose-300/60';
          textClass = 'text-rose-950';
        } else if (rule.severity === 'major_warning') {
          severityLabel = '⚠️ PERINGATAN MAYOR';
          badgeClass = 'bg-orange-600 text-white font-bold';
          bgClass = 'bg-orange-50 border-orange-300';
          borderClass = 'border-orange-400';
          textClass = 'text-orange-950';
        }

        results.push({
          ruleId: rule.id,
          severity: rule.severity,
          severityLabel,
          title: rule.title,
          currentDrugName: targetProtocol.name,
          conflictingDrugName: rx.drugName,
          conflictingSource: rx.source || 'Resep EMR Pasien',
          conflictingDetails: [rx.dosage, rx.frequency, rx.date ? `Tgl: ${rx.date}` : '', rx.doctorName ? `drh. ${rx.doctorName}` : ''].filter(Boolean).join(' • '),
          mechanism: rule.mechanism,
          clinicalImpact: rule.clinicalImpact,
          recommendation: rule.recommendation,
          washoutPeriod: rule.washoutPeriod,
          badgeClass,
          bgClass,
          borderClass,
          textClass,
          isFatalContraindication: isFatal,
          category: rule.category
        });
      }
    }
  }

  // Sort: contraindicated first, then major_warning, then moderate_caution
  return results.sort((a, b) => {
    const score = (s: DrugInteractionSeverity) => (s === 'contraindicated' ? 3 : s === 'major_warning' ? 2 : 1);
    return score(b.severity) - score(a.severity);
  });
}

export function evaluateDoseSafety(
  protocol: DrugProtocol,
  species: SpeciesCategory,
  currentDoseMgKg: number,
  totalDoseMg: number
): SafetyEvaluationResult {
  const profile = protocol.speciesProfiles[species] || protocol.speciesProfiles['Anjing'];

  if (profile.contraindicated) {
    return {
      status: 'contraindicated',
      statusLabel: '⛔ KONTRAINDIKASI MUTLAK SPESIES',
      badgeClass: 'bg-rose-600 text-white font-black',
      textClass: 'text-rose-300',
      bgClass: 'bg-rose-950/80',
      borderClass: 'border-rose-500',
      description: profile.contraindicationReason || `Obat ini dilarang keras untuk spesies ${species}.`,
      minSafeMgKg: 0,
      standardMgKg: 0,
      maxSafeMgKg: 0,
      isCapped: false
    };
  }

  const isCapped = Boolean(profile.maxTotalMg && totalDoseMg > profile.maxTotalMg);
  const minSafe = profile.minMgKg;
  const standard = profile.standardMgKg;
  const maxSafe = profile.maxMgKg;

  if (currentDoseMgKg < minSafe) {
    return {
      status: 'underdose',
      statusLabel: '⚠️ SUB-TERAPEUTIK (Underdose)',
      badgeClass: 'bg-amber-500 text-slate-950 font-black',
      textClass: 'text-amber-300',
      bgClass: 'bg-amber-950/50',
      borderClass: 'border-amber-500/60',
      description: `Dosis ${currentDoseMgKg} mg/kg berada di bawah rentang terapeutik minimum (${minSafe} mg/kg). Berisiko tidak efektif atau memicu resistensi obat.`,
      minSafeMgKg: minSafe,
      standardMgKg: standard,
      maxSafeMgKg: maxSafe,
      isCapped
    };
  }

  if (currentDoseMgKg >= minSafe && currentDoseMgKg <= maxSafe) {
    return {
      status: 'optimal',
      statusLabel: '✅ AMAN & OPTIMAL (Therapeutic Window)',
      badgeClass: 'bg-emerald-500 text-slate-950 font-black',
      textClass: 'text-emerald-300',
      bgClass: 'bg-emerald-950/50',
      borderClass: 'border-emerald-500/60',
      description: `Dosis ${currentDoseMgKg} mg/kg berada tepat di dalam jendela terapeutik yang direkomendasikan (${minSafe} - ${maxSafe} mg/kg) untuk spesies ${species}.`,
      minSafeMgKg: minSafe,
      standardMgKg: standard,
      maxSafeMgKg: maxSafe,
      isCapped,
      maxCappedMg: profile.maxTotalMg
    };
  }

  if (currentDoseMgKg > maxSafe && currentDoseMgKg <= maxSafe * 1.5) {
    return {
      status: 'warning_high',
      statusLabel: '⚠️ PERINGATAN: DOSIS TINGGI',
      badgeClass: 'bg-orange-500 text-slate-950 font-black',
      textClass: 'text-orange-300',
      bgClass: 'bg-orange-950/60',
      borderClass: 'border-orange-500',
      description: `Dosis ${currentDoseMgKg} mg/kg melebihi batas standar atas (${maxSafe} mg/kg) untuk ${species}. Pastikan pengawasan ketat tanda toksisitas organ dan fungsi ginjal/hepar.`,
      minSafeMgKg: minSafe,
      standardMgKg: standard,
      maxSafeMgKg: maxSafe,
      isCapped,
      maxCappedMg: profile.maxTotalMg
    };
  }

  return {
    status: 'overdose_danger',
    statusLabel: '🚨 BAHAYA: RISIKO OVERDOSIS TOKSIK',
    badgeClass: 'bg-red-600 text-white font-black animate-pulse',
    textClass: 'text-rose-300',
    bgClass: 'bg-rose-950/90',
    borderClass: 'border-red-500 ring-2 ring-red-500/50',
    description: `Dosis ${currentDoseMgKg} mg/kg melampaui batas keamanan maksimal (> ${maxSafe} mg/kg) untuk ${species}! Berisiko menimbulkan keracunan organ berat atau efek samping fatal.`,
    minSafeMgKg: minSafe,
    standardMgKg: standard,
    maxSafeMgKg: maxSafe,
    isCapped,
    maxCappedMg: profile.maxTotalMg
  };
}
