import { REGION_COLORS } from './colors';

export type JenisWilayah = 'kabupaten' | 'kota';

export type InstrumenKlik =
  | 'rapai'
  | 'gayo-bambu'
  | 'gong-alas'
  | 'petik-barat'
  | 'rebana-tamiang';

export type JenisLandmark =
  | 'rumoh-aceh'
  | 'tugu-nol'
  | 'cangkir-kopi'
  | 'gendang-rapai'
  | 'kapal-nelayan'
  | 'tapak-naga'
  | 'gelombang-smong'
  | 'padi-sigupai'
  | 'rebana-melayu'
  | 'gong-alas';

export type StatusVerifikasi = 'Terverifikasi' | 'Data sedang dilengkapi';

export interface ItemBudaya {
  judul: string;
  isi: string;
  ikon?: 'tari' | 'musik' | 'kuliner' | 'adat' | 'sejarah' | 'kriya' | 'bahasa';
}

export interface WilayahAceh {
  id: string;
  nama: string;
  jenis: JenisWilayah;
  warna: string;
  instrumenKlik: InstrumenKlik;
  landmark: JenisLandmark;
  status: StatusVerifikasi;
  catatanStatus?: string;
  budaya: ItemBudaya[];
}

export const TRADISI_LINTAS_ACEH: ItemBudaya[] = [
  {
    judul: 'Peusijuek',
    isi: 'Prosesi tepung tawar adat Aceh sebagai ungkapan syukur, doa keselamatan, dan restu pada berbagai peristiwa penting kehidupan.',
    ikon: 'adat'
  },
  {
    judul: 'Meugang',
    isi: 'Tradisi memasak dan menikmati daging bersama keluarga serta berbagi kepada sesama menjelang Ramadan, Idulfitri, dan Iduladha.',
    ikon: 'kuliner'
  },
  {
    judul: 'Kenduri Blang',
    isi: 'Syukuran masyarakat tani saat turun ke sawah yang dipimpin keujruen blang sebagai wujud harmoni manusia dengan alam.',
    ikon: 'adat'
  }
];

export const REGIONS_ACEH: WilayahAceh[] = [
  {
    id: 'banda-aceh',
    nama: 'Banda Aceh',
    jenis: 'kota',
    warna: REGION_COLORS['banda-aceh'],
    instrumenKlik: 'rapai',
    landmark: 'rumoh-aceh',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Pusat Kesenian Aceh',
        isi: 'Pusat kesenian Aceh tempat berbagai kesenian dari kabupaten dan kota lain tampil serta berjumpa.',
        ikon: 'adat'
      },
      {
        judul: 'Tari Ranub Lampuan',
        isi: 'Tari penyambutan tamu kehormatan yang diciptakan oleh seniman Yuslizar sekitar tahun 1962.',
        ikon: 'tari'
      }
    ]
  },
  {
    id: 'sabang',
    nama: 'Sabang',
    jenis: 'kota',
    warna: REGION_COLORS['sabang'],
    instrumenKlik: 'rapai',
    landmark: 'tugu-nol',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Titik Nol Kilometer & Panglima Laot',
        isi: 'Penanda geografis ujung barat Indonesia di Pulau Weh serta lembaga adat Panglima Laot sebagai pengelola hukum adat laut.',
        ikon: 'adat'
      },
      {
        judul: 'Sabang Marine Festival',
        isi: 'Perayaan bahari yang menampilkan pawai nelayan tradisional dan gemuruh tabuhan rapai.',
        ikon: 'musik'
      },
      {
        judul: 'Kuliner Khas Pulau Weh',
        isi: 'Hidangan khas sie kari bak eumpeuk, eungkot geurapee, serta kudapan manis wajik cengkeh.',
        ikon: 'kuliner'
      },
      {
        judul: 'Tradisi Eh Leuho',
        isi: 'Kebiasaan masyarakat pesisir untuk beristirahat sejenak pada waktu siang hari.',
        ikon: 'adat'
      }
    ]
  },
  {
    id: 'aceh-besar',
    nama: 'Aceh Besar',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-besar'],
    instrumenKlik: 'rapai',
    landmark: 'rumoh-aceh',
    // status: sebagian
    status: 'Data sedang dilengkapi',
    catatanStatus: 'Sebagian data terverifikasi',
    budaya: [
      {
        judul: 'Tradisi Woet Ie Bu Peudah',
        isi: 'Tradisi memasak dan membagikan bubur rempah khas Aceh Besar yang dilestarikan di Gampong Limpok.',
        ikon: 'kuliner'
      }
      // TODO verifikasi Likok Pulo dari Pulo Aceh. status: sebagian.
    ]
  },
  {
    id: 'pidie',
    nama: 'Pidie',
    jenis: 'kabupaten',
    warna: REGION_COLORS['pidie'],
    instrumenKlik: 'rapai',
    landmark: 'rumoh-aceh',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Tari Laweut',
        isi: 'Tarian tradisional yang berasal dari Pidie; namanya berakar dari kata “shalawat” yang mengiringi gerak penari.',
        ikon: 'tari'
      },
      {
        judul: 'Seni Bela Diri Geudeu-Geudeu',
        isi: 'Pertunjukan ketangkasan dan bela diri tradisional khas Pidie yang kini berstatus terancam punah.',
        ikon: 'adat'
      },
      {
        judul: 'Emping Melinjo & Putu Ie Leubeu',
        isi: 'Emping melinjo sebagai identitas kuliner daerah serta kudapan tradisional putu ie leubeu dari Kembang Tanjong.',
        ikon: 'kuliner'
      }
    ]
  },
  {
    id: 'pidie-jaya',
    nama: 'Pidie Jaya',
    jenis: 'kabupaten',
    warna: REGION_COLORS['pidie-jaya'],
    instrumenKlik: 'rapai',
    landmark: 'rumoh-aceh',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Tari Seudati',
        isi: 'Banyak syeh Seudati ternama berasal dari wilayah ini; ditetapkan sebagai Warisan Budaya Nasional pada tahun 2014.',
        ikon: 'tari'
      },
      {
        judul: 'Kuliner Beuleukat Teutet',
        isi: 'Olahan ketan panggang yang disajikan hangat bersama selai srikaya tradisional.',
        ikon: 'kuliner'
      },
      {
        judul: 'Seni Dike / Meudike',
        isi: 'Lantunan zikir berirama yang dibawakan secara berjamaah dalam peringatan Maulid Nabi.',
        ikon: 'musik'
      }
    ]
  },
  {
    id: 'bireuen',
    nama: 'Bireuen',
    jenis: 'kabupaten',
    warna: REGION_COLORS['bireuen'],
    instrumenKlik: 'rapai',
    landmark: 'gendang-rapai',
    status: 'Data sedang dilengkapi',
    budaya: [
      {
        judul: 'Kesenian Rapa’i & Rapa’i Geleng Inong',
        isi: 'Pertunjukan perkusi rapa’i sebagai ciri khas kesenian daerah Bireuen, termasuk repertoar Rapa’i Geleng Inong.',
        ikon: 'musik'
      }
      // TODO verifikasi hubungan Kerajaan Jeumpa dengan Bireuen sebelum ditampilkan.
    ]
  },
  {
    id: 'aceh-utara',
    nama: 'Aceh Utara',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-utara'],
    instrumenKlik: 'rapai',
    landmark: 'gendang-rapai',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Warisan Kesultanan Samudera Pasai',
        isi: 'Kerajaan Islam yang disebut tertua di Asia Tenggara (abad ke-13) dengan kompleks makam sultan di Kecamatan Samudera.',
        ikon: 'sejarah'
      },
      {
        judul: 'Seni Rapai Uroh',
        isi: 'Tradisi tabuhan rapai bertempo kuat yang dipertunjukkan secara berkelompok oleh para seniman gampong.',
        ikon: 'musik'
      }
    ]
  },
  {
    id: 'lhokseumawe',
    nama: 'Lhokseumawe',
    jenis: 'kota',
    warna: REGION_COLORS['lhokseumawe'],
    instrumenKlik: 'rapai',
    landmark: 'gendang-rapai',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Tari Tarek Pukat',
        isi: 'Menggambarkan semangat kebersamaan kehidupan nelayan dengan iringan serune kalee, gendrang, dan rapa’i.',
        ikon: 'tari'
      },
      {
        judul: 'Rapai Uroh & Sanggar Tradisi',
        isi: 'Tabuhan Rapai Uroh di meunasah serta peran aktif sanggar Pocut Meurah Intan dan sanggar Unimal dalam menjaga tari tradisi.',
        ikon: 'musik'
      }
    ]
  },
  {
    id: 'aceh-timur',
    nama: 'Aceh Timur',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-timur'],
    instrumenKlik: 'rapai',
    landmark: 'gendang-rapai',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Jejak Kesultanan Peureulak',
        isi: 'Salah satu kerajaan Islam paling awal (abad ke-9; catatan: periode dan statusnya masih menjadi kajian sejarah).',
        ikon: 'sejarah'
      },
      {
        judul: 'Zawiyah Cot Kala di Bayeun',
        isi: 'Dikenal dalam tradisi sejarah lokal sebagai lembaga pendidikan Islam awal di pesisir timur Aceh.',
        ikon: 'sejarah'
      }
    ]
  },
  {
    id: 'langsa',
    nama: 'Langsa',
    jenis: 'kota',
    warna: REGION_COLORS['langsa'],
    instrumenKlik: 'rapai',
    landmark: 'kapal-nelayan',
    status: 'Data sedang dilengkapi',
    budaya: [
      {
        judul: 'Pertunjukan Wayang Kulit & Penutur Melayu Tamiang',
        isi: 'Tradisi wayang kulit yang dibawa oleh warga keturunan Jawa serta keberadaan komunitas penutur bahasa Melayu Tamiang.',
        ikon: 'adat'
      }
      // TODO riset budaya khas Langsa.
    ]
  },
  {
    id: 'aceh-tamiang',
    nama: 'Aceh Tamiang',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-tamiang'],
    instrumenKlik: 'rebana-tamiang',
    landmark: 'rebana-melayu',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Adat & Pantun Melayu Tamiang',
        isi: 'Budaya Melayu Tamiang dengan tradisi berbalas pantun dalam prosesi pernikahan serta pakaian adat bernuansa Melayu.',
        ikon: 'adat'
      },
      {
        judul: 'Tari Sekapur Sirih, Ine, & Patam-Patam',
        isi: 'Ragam seni pertunjukan tari Sekapur Sirih, tari Ine, gerak patam-patam, serta atraksi silat penyambutan.',
        ikon: 'tari'
      }
    ]
  },
  {
    id: 'aceh-tengah',
    nama: 'Aceh Tengah',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-tengah'],
    instrumenKlik: 'gayo-bambu',
    landmark: 'cangkir-kopi',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Tari Guel, Munalo, Tuak Kukur, & Didong',
        isi: 'Kekayaan seni pertunjukan dataran tinggi Gayo meliputi Tari Guel, Tari Munalo, Tari Tuak Kukur, serta seni bertutur Didong.',
        ikon: 'tari'
      },
      {
        judul: 'Kopi Arabika Gayo & Danau Laut Tawar',
        isi: 'Takengon dan dataran tinggi Gayo sebagai penghasil kopi arabika Gayo yang berdampingan dengan lanskap budaya Danau Laut Tawar.',
        ikon: 'kuliner'
      }
    ]
  },
  {
    id: 'bener-meriah',
    nama: 'Bener Meriah',
    jenis: 'kabupaten',
    warna: REGION_COLORS['bener-meriah'],
    instrumenKlik: 'gayo-bambu',
    landmark: 'cangkir-kopi',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Pusat Produksi Kopi Arabika Gayo',
        isi: 'Wilayah perkebunan vulkanik dataran tinggi yang menjadi salah satu pusat produksi utama kopi arabika Gayo.',
        ikon: 'kuliner'
      },
      {
        judul: 'Saman Gaya Gayo Lot & Pernikahan Adat',
        isi: 'Tradisi pertunjukan Saman bergaya Gayo Lot serta tata cara prosesi pernikahan adat masyarakat Gayo.',
        ikon: 'tari'
      }
    ]
  },
  {
    id: 'gayo-lues',
    nama: 'Gayo Lues',
    jenis: 'kabupaten',
    warna: REGION_COLORS['gayo-lues'],
    instrumenKlik: 'gayo-bambu',
    landmark: 'cangkir-kopi',
    status: 'Data sedang dilengkapi',
    budaya: [
      {
        judul: 'Tari Saman Gayo',
        isi: 'Tari duduk-tepuk berirama cepat yang menjadi simbol identitas masyarakat Gayo dan diakui UNESCO pada tahun 2011.',
        ikon: 'tari'
      }
      // TODO verifikasi daftar UNESCO yang tepat (perlindungan mendesak atau daftar representatif).
    ]
  },
  {
    id: 'aceh-tenggara',
    nama: 'Aceh Tenggara',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-tenggara'],
    instrumenKlik: 'gong-alas',
    landmark: 'gong-alas',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Budaya Suku Alas di Kutacane',
        isi: 'Pusat kehidupan masyarakat suku Alas di lembah Kutacane dengan adat kekerabatan yang khas.',
        ikon: 'adat'
      },
      {
        judul: 'Tari Peleubat',
        isi: 'Tarian tradisional yang mengiringi prosesi hantaran dalam upacara pernikahan adat masyarakat Alas.',
        ikon: 'tari'
      }
    ]
  },
  {
    id: 'aceh-singkil',
    nama: 'Aceh Singkil',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-singkil'],
    instrumenKlik: 'gong-alas',
    landmark: 'gong-alas',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Takhi Dampeng Suku Singkil',
        isi: 'Seni tari dan nyanyian penyambutan khas suku Singkil yang menghadirkan suasana hangat dan khidmat.',
        ikon: 'tari'
      },
      {
        judul: 'Busana Jubah Merah & Pakaian Adat Batabu',
        isi: 'Pakaian adat jubah merah untuk pesta perkawinan serta busana tradisional Batabu.',
        ikon: 'kriya'
      }
    ]
  },
  {
    id: 'subulussalam',
    nama: 'Subulussalam',
    jenis: 'kota',
    warna: REGION_COLORS['subulussalam'],
    instrumenKlik: 'gong-alas',
    landmark: 'gong-alas',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Tradisi Membuka Obon-Obon',
        isi: 'Rangkaian ritual membuka obon-obon dalam prosesi adat pernikahan masyarakat setempat.',
        ikon: 'adat'
      },
      {
        judul: 'Takhi Dampeng & Harmoni Aceh–Pakpak',
        isi: 'Pelestarian Takhi Dampeng di Kecamatan Rundeng serta perpaduan unsur budaya Aceh dan Pakpak.',
        ikon: 'tari'
      }
    ]
  },
  {
    id: 'aceh-selatan',
    nama: 'Aceh Selatan',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-selatan'],
    instrumenKlik: 'petik-barat',
    landmark: 'tapak-naga',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Legenda Tuan Tapa & Putri Naga',
        isi: 'Kisah rakyat asal-usul nama Tapaktuan dan julukan Kota Naga dengan situs tapak kaki raksasa di tebing karang.',
        ikon: 'sejarah'
      },
      {
        judul: 'Tari Ratoh Bantai, Jalateh, & Toet Leumang',
        isi: 'Seni Tari Ratoh Bantai, tradisi Jalateh (tolak bala), serta tradisi membakar lemang (Toet Leumang) menyambut Ramadan.',
        ikon: 'tari'
      }
    ]
  },
  {
    id: 'aceh-barat-daya',
    nama: 'Aceh Barat Daya',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-barat-daya'],
    instrumenKlik: 'petik-barat',
    landmark: 'padi-sigupai',
    // status: sebagian
    status: 'Data sedang dilengkapi',
    catatanStatus: 'Sebagian data terverifikasi',
    budaya: [
      {
        judul: 'Padi Lokal Breuh Sigupai',
        isi: 'Varietas padi lokal harum kebanggaan daerah yang melahirkan julukan “Bumoe Breuh Sigupai”.',
        ikon: 'kuliner'
      },
      {
        judul: 'Mie Kocok Blangpidie & Gulai Ikan Keurling',
        isi: 'Sajian kuliner mie kocok khas Blangpidie serta olahan gulai ikan sungai keurling.',
        ikon: 'kuliner'
      }
      // TODO verifikasi tari dan ritual (sumber lemah).
    ]
  },
  {
    id: 'nagan-raya',
    nama: 'Nagan Raya',
    jenis: 'kabupaten',
    warna: REGION_COLORS['nagan-raya'],
    instrumenKlik: 'petik-barat',
    landmark: 'rumoh-aceh',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Tari Rateb Meuseukat',
        isi: 'Tari rakyat bernafaskan syair keagamaan yang tumbuh dan berkembang pesat di wilayah Nagan Raya.',
        ikon: 'tari'
      },
      {
        judul: 'Tradisi Toet Leumang & Kenduri Mak Meugang',
        isi: 'Kebersamaan warga dalam memasak lemang bambu (Toet Leumang) dan merayakan kenduri Mak Meugang.',
        ikon: 'adat'
      }
    ]
  },
  {
    id: 'aceh-barat',
    nama: 'Aceh Barat',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-barat'],
    instrumenKlik: 'petik-barat',
    landmark: 'cangkir-kopi',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Kupi Khop Meulaboh',
        isi: 'Cara khas menyajikan kopi dalam gelas terbalik di atas piring kecil; ditetapkan sebagai warisan budaya takbenda kabupaten tahun 2019.',
        ikon: 'kuliner'
      },
      {
        judul: 'Jejak Teuku Umar & Cut Nyak Dhien',
        isi: 'Tanah kelahiran pahlawan nasional Teuku Umar di Meulaboh dengan peringatan haul, tugu Kupiah Meuketop, serta jejak perjuangan Cut Nyak Dhien.',
        ikon: 'sejarah'
      }
    ]
  },
  {
    id: 'aceh-jaya',
    nama: 'Aceh Jaya',
    jenis: 'kabupaten',
    warna: REGION_COLORS['aceh-jaya'],
    instrumenKlik: 'petik-barat',
    landmark: 'kapal-nelayan',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Adat Seumeuleung di Lamno',
        isi: 'Prosesi adat menyuapi raja pada 10 Dzulhijjah yang dilestarikan oleh keturunan Istana Meureudom Daya di Lamno.',
        ikon: 'adat'
      },
      {
        judul: 'Kerajinan Cinkhui & Kenduri Blang',
        isi: 'Kerajinan Cinkhui (Warisan Budaya Takbenda Indonesia 2025) serta tradisi turun sawah kenduri blang.',
        ikon: 'kriya'
      }
    ]
  },
  {
    id: 'simeulue',
    nama: 'Simeulue',
    jenis: 'kabupaten',
    warna: REGION_COLORS['simeulue'],
    instrumenKlik: 'petik-barat',
    landmark: 'gelombang-smong',
    status: 'Terverifikasi',
    budaya: [
      {
        judul: 'Tradisi Lisan Nandong & Pengetahuan Smong',
        isi: 'Seni tutur nandong yang paling berpengaruh serta kearifan lokal smong—pengetahuan penyelamatan diri dari tsunami yang diwariskan lewat cerita, nandong, dan nyanyian.',
        ikon: 'musik'
      },
      {
        judul: 'Bahasa Devayan & Aneuk Jamee',
        isi: 'Keberagaman tutur masyarakat kepulauan Simeulue yang menggunakan bahasa Devayan dan bahasa Aneuk Jamee.',
        ikon: 'bahasa'
      }
    ]
  }
];

export const REGION_BY_ID: Record<string, WilayahAceh> = Object.fromEntries(
  REGIONS_ACEH.map((r) => [r.id, r])
);

