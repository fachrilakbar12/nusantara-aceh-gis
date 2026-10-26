# Nusantara Aceh: 23 Negeri, Satu Tanah Rencong

Nusantara Aceh adalah platform ensiklopedia geospasial interaktif tiga dimensi (3D) berbasis web yang mendokumentasikan kekayaan budaya, sejarah kesultanan, seni pertunjukan, kuliner khas, instrumen musik tradisional, serta ragam motif hias dari 23 kabupaten dan kota di Provinsi Aceh (18 kabupaten dan 5 kota administratif).

Aplikasi ini menggabungkan data batas wilayah geospasial GeoJSON resmi dengan visualisasi 3D bergaya diorama kertas (papercut), tata cahaya maket miniatur dinamis, dan sistem audio interaktif berbasis Web Audio API.

---

## 1. Konsep Visual dan Desain Diorama

### Gaya Kerajinan Kertas (Papercut Diorama)
Seluruh batas wilayah kabupaten dan kota diekstrusi menjadi tiga lapisan kertas bertingkat (lapisan dasar, tengah, dan atas) dengan ketebalan fisik dan jarak elevasi nyata. Kedalaman visual dihasilkan murni dari bayangan jatuh directional light dan sudut elevasi bevel, tanpa menggunakan gradasi warna artifisial.

### Efek Optik Miniatur (Tilt-Shift)
Lapisan blur optik diterapkan pada area atas dan bawah layar untuk menghadirkan atmosfer maket miniatur pameran arsitektur yang hidup.

### Lanskap Topografi dan Maritim
- Pegunungan Bukit Barisan: Bentang topografi pegunungan kertas yang mencakup Seulawah Agam, Burni Telong, Gunung Leuser, dan Pegunungan Tangse.
- Danau Laut Tawar: Cekungan danau dataran tinggi di Kabupaten Aceh Tengah.
- Laut Hidup: Simulasi permukaan samudra dengan buih pantai datar, 6 perahu cadik nelayan tradisional yang berlayar mengelilingi perairan Aceh, serta gelombang kearifan lokal Smong di Kepulauan Simeulue.

### Tata Cahaya Tiga Suasana
Pengguna dapat mengubah suasana pencahayaan peta secara real-time:
- Mode Malam: Latar gelap dengan sorotan lampu pameran kontras tinggi.
- Mode Senja: Sudut datang cahaya rendah berwarna hangat untuk bayangan jatuh memanjang.
- Mode Siang: Pencahayaan merata dengan visibilitas tinggi di seluruh daratan.

---

## 2. Landmark Arsitektur dan Ikon Budaya

Aplikasi menampilkan model 3D bergaya low-poly kertas untuk landmark representatif di berbagai wilayah:
- Kubah Masjid Raya Baiturrahman (Kota Banda Aceh)
- Rumoh Aceh Tradisional dengan struktur tiang panggung (Kabupaten Aceh Besar)
- Tugu Titik Nol Kilometer Indonesia (Kota Sabang, Pulau Weh)
- Replika Naga Tapaktuan (Kabupaten Aceh Selatan)
- Cangkir Kopi Gayo (Kabupaten Aceh Tengah)
- Gelombang Smong Pengingat Tsunami (Kabupaten Simeulue)

---

## 3. Ragam Motif Tradisional Aceh

Setiap wilayah dipadukan dengan motif ukiran tradisional khas Aceh yang memiliki landasan filosofis mendalam:
- Pucok Reubong: Perlambang tunas bambu yang bermakna regenerasi, keteguhan hati, dan kemanfaatan hidup.
- Bungong Jeumpa: Bunga cempaka kuning khas Aceh yang melambangkan keindahan, kesucian, dan keharuman budi pekerti.
- Kerawang Gayo Emun Berangkat: Awan berarak khas dataran tinggi Gayo yang bermakna kesatuan masyarakat dan ketenteraman.
- Pinto Aceh: Ragam hias terinspirasi pintu gerbang monumen peninggalan Sultan Iskandar Muda yang melambangkan keramahan dan keterbukaan dalam bingkai kesopanan.
- Bungong Seulanga: Motif bunga kenanga pesisir yang melambangkan keharmonisan keluarga dan perlindungan adat.

---

## 4. Sistem Audio Interaktif

### Musik Instrumental Bungong Jeumpa
Aplikasi dilengkapi pengiring musik instrumental Bungong Jeumpa. Musik diputar otomatis secara sinkron saat pengguna memasuki peta, dan otomatis berhenti serta mereset durasi kembali ke awal melodi ketika pengguna menekan tombol Keluar.

### Sintesis Instrumen Tradisional (Web Audio API)
Setiap kali wilayah dipilih, sistem membunyikan sintesis suara instrumen tradisional sesuai rumpun budayanya:
- Pesisir Utara dan Timur: Gendang Rapa'i
- Dataran Tinggi Gayo: Bambu Gayo (Didong)
- Rumpun Alas: Gong Alas
- Barat-Selatan: Petik Gambus Barat
- Wilayah Tamiang: Rebana Tradisional

---

## 5. Fitur Utama dan Navigasi

- Navigasi Bebas 3D: Kontrol rotasi, zoom, dan kemiringan sudut pandang kamera dengan pembatasan sudut yang nyaman.
- Tur Sinematik 23 Negeri: Mode tur otomatis yang menerbangkan kamera secara berurutan mengunjungi seluruh 23 kabupaten dan kota.
- Filter Rumpun Budaya: Bilah dermaga navigasi di bagian bawah layar untuk menyaring wilayah berdasarkan sabuk budaya: Semua, Pesisir Utara-Timur, Gayo-Alas, Barat-Selatan, dan Kepulauan.
- Drawer Pencarian: Pencarian cepat berdasarkan nama kabupaten/kota, jenis wilayah, dan nama tradisi budaya.
- Panel Informasi Wilayah: Menampilkan profil budaya, kategori seni tari, warisan takbenda, instrumen musik, dan ragam motif tiap daerah.
- Tombol Keluar (Exit): Tersedia di desktop maupun mobile untuk kembali ke tampilan sambutan awal secara mulus.

---

## 6. Kompatibilitas Perangkat Bergerak (Mobile Support)

- Responsivitas Rasio Layar: Kamera Three.js secara adaptif menyesuaikan posisi mundur dan sudut pandang (Field of View) saat dibuka di layar vertikal smartphone agar seluruh pulau tetap terlihat penuh.
- Bottom Sheet Drawer: Panel informasi wilayah otomatis beralih menjadi laci sentuh bawah (bottom sheet) pada smartphone.
- Dukungan Multi-Touch: Deteksi gestur ketukan (touch event) tanpa delay pada tombol interaksi.
- Dukungan Akses Jaringan Lokal: Konfigurasi host jaringan lokal (0.0.0.0) sehingga dapat langsung diakses dari perangkat ponsel yang terhubung pada jaringan Wi-Fi yang sama.

---

## 7. Tumpukan Teknologi (Tech Stack)

- Framework: Next.js 14 (App Router)
- Bahasa Pemrograman: TypeScript (Strict Type Checking)
- Render Tiga Dimensi: Three.js, React Three Fiber, React Three Drei
- Tata Letak dan Tampilan: Tailwind CSS
- Animasi Transisi: GSAP (GreenSock Animation Platform)
- Manajemen Status: Zustand
- Mesin Audio: Web Audio API & HTML5 Audio Element
- Data Geospasial: GeoJSON Batas Administrasi Kabupaten/Kota Provinsi Aceh

---

## 8. Petunjuk Instalasi dan Menjalankan Proyek

### Prasyarat
- Node.js versi 18.17.0 atau yang lebih baru
- npm versi 9 atau yang lebih baru

### Langkah Pemasangan
1. Klon repositori ini ke komputer lokal:
   git clone https://github.com/fachrilakbar12/nusantara-aceh-gis.git
   cd nusantara-aceh-gis

2. Pasang semua dependensi proyek:
   npm install

3. Jalankan server pengembangan lokal:
   npm run dev

4. Buka tautan berikut di browser:
   - Akses dari komputer lokal: http://localhost:3000
   - Akses dari ponsel di jaringan Wi-Fi yang sama: http://[ALAMAT-IP-KOMPUTER]:3000

### Pengecekan Kode dan Build Produksi
- Menjalankan pemeriksaan linting kode:
  npm run lint

- Menjalankan validasi tipe TypeScript:
  npm run typecheck

- Mengompilasi bundle produksi:
  npm run build

- Menjalankan server versi produksi:
  npm run start
