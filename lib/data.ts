export type EraId = 'smp' | 'smk' | 'kuliah';

export interface EducationEra {
  id: EraId;
  index: number;
  numberLabel: string;
  shortLabel: string;
  outfitTitle: string;
  meshKey: 'outfit_smp' | 'outfit_smk' | 'outfit_kuliah';
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  institusi: string;
  periode: string;
  yearStart: number;
  yearEnd: number;
  yearNote?: string;
  jurusan?: string;
  peran?: string;
  poinOrganisasi: string[];
  deskripsi: string;
  tags: string[];
  xp: number;
  xpLabel: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  chordNotes: number[];
  chordMode: 'arpeggio-smp' | 'arpeggio-smk' | 'chord-kuliah';
}

export const CONFIG = {
  colors: {
    bg: '#05080a',
    neon: '#a8ff60',
    neonHex: 0xa8ff60,
    teal: '#38bdf8',
    skin: '#d69c75',
    hair: '#17191e'
  },
  timings: {
    introDuration: 3.5,
    morphDuration: 1.05,
    autoDemoIdleMs: 12000,
    orbitResumeMs: 3000,
    glitchMinMs: 4000,
    glitchMaxMs: 9000
  },
  modelPath: '/models/avatar.glb',
  audioPaths: {
    ambient: '/audio/ambient.mp3',
    hover: '/audio/hover.mp3',
    click: '/audio/click.mp3',
    morph: '/audio/morph.mp3',
    glitch: '/audio/glitch.mp3'
  }
} as const;

export const EDUCATION_ERAS: EducationEra[] = [
  {
    id: 'smp',
    index: 0,
    numberLabel: '01',
    shortLabel: 'SMP',
    outfitTitle: 'Putih Biru',
    meshKey: 'outfit_smp',
    badge: 'SMP · 2018',
    heroTitle: 'SMP ERA',
    heroSubtitle: '// EDUCATION JOURNEY · 01 / 03 · SMP',
    institusi: 'SMPN 1 Peureulak',
    periode: '2018 – 2020',
    yearStart: 2018,
    yearEnd: 2020,
    deskripsi:
      'Masa pembentukan karakter, kedisiplinan, dan rasa ingin tahu; mulai mengenal organisasi sekolah dan membangun kebiasaan belajar konsisten.',
    poinOrganisasi: [],
    tags: ['Dasar Akademik', 'Karakter', 'Disiplin'],
    xp: 68,
    xpLabel: 'CHARACTER & DISCIPLINE XP',
    primaryColor: '#f3f5f8',
    secondaryColor: '#1e3a8a',
    accentColor: '#3b82f6',
    chordNotes: [261.63, 329.63, 392.0], // C - E - G
    chordMode: 'arpeggio-smp'
  },
  {
    id: 'smk',
    index: 1,
    numberLabel: '02',
    shortLabel: 'SMK',
    outfitTitle: 'Putih Abu-abu',
    meshKey: 'outfit_smk',
    badge: 'SMK · 2019',
    heroTitle: 'SMK ERA',
    heroSubtitle: '// EDUCATION JOURNEY · 02 / 03 · SMK',
    institusi: 'SMKN Taman Fajar',
    periode: '2019 – 2022',
    yearStart: 2019,
    yearEnd: 2022,
    peran: 'Ketua OSIS',
    deskripsi:
      'Memimpin organisasi siswa, mengoordinasi program kerja dan kegiatan sekolah, melatih kepemimpinan, komunikasi, dan tanggung jawab.',
    poinOrganisasi: [
      'Ketua OSIS',
      'Koordinator program kerja & kegiatan kesiswaan'
    ],
    tags: ['Ketua OSIS', 'Kepemimpinan', 'Keahlian Kejuruan'],
    xp: 85,
    xpLabel: 'LEADERSHIP & VOCATIONAL XP',
    primaryColor: '#f3f5f8',
    secondaryColor: '#6b7280',
    accentColor: '#fbbf24',
    chordNotes: [293.66, 369.99, 440.0], // D - F# - A
    chordMode: 'arpeggio-smk'
  },
  {
    id: 'kuliah',
    index: 2,
    numberLabel: '03',
    shortLabel: 'KULIAH',
    outfitTitle: 'Almamater Hijau',
    meshKey: 'outfit_kuliah',
    badge: 'UNIMAL · TI',
    heroTitle: 'UNIVERSITY ERA',
    heroSubtitle: '// EDUCATION JOURNEY · 03 / 03 · KULIAH',
    institusi: 'Universitas Malikussaleh (Unimal)',
    periode: '2022 – Sekarang',
    yearStart: 2022,
    yearEnd: 2026,
    yearNote: 'Aktif',
    jurusan: 'Teknik Informatika',
    peran: 'Aktif Organisasi Himpunan & BEM Unimal',
    poinOrganisasi: [
      'Anggota Humas',
      'Wakil Ketua Umum Himpunan Mahasiswa Teknik Informatika',
      'Staff Kominfo BEM Unimal'
    ],
    deskripsi:
      'Mengembangkan kemampuan teknis informatika sekaligus kepemimpinan organisasi, komunikasi publik, dan manajemen informasi.',
    tags: ['Teknik Informatika', 'Humas', 'Kominfo', 'Wakil Ketua Umum'],
    xp: 96,
    xpLabel: 'INFORMATICS & ORGANIZATION XP',
    primaryColor: '#166534',
    secondaryColor: '#d6c4a0',
    accentColor: '#a8ff60',
    chordNotes: [329.63, 415.3, 493.88, 659.25], // E - G# - B - E tinggi
    chordMode: 'chord-kuliah'
  }
];

