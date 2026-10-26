# Panduan File Musik Latar (`bungong-jeumpa.mp3`)

Taruh file audio instrumental **Bungong Jeumpa** di dalam folder ini dengan nama:

```
/public/audio/bungong-jeumpa.mp3
```

## Ketentuan Teknis
- **Nama file**: `bungong-jeumpa.mp3` (huruf kecil semua).
- **Format**: MP3 (disarankan 128–192 kbps, durasi bebas karena diputar otomatis secara *loop*).
- **Perilaku Aplikasi**:
  - Saat tombol **“Masuk”** diklik, aplikasi akan memutar `/audio/bungong-jeumpa.mp3` dengan *fade-in* halus selama 2 detik melewati *Master GainNode* Web Audio API.
  - Jika file `bungong-jeumpa.mp3` belum ditaruh di folder ini, aplikasi tetap berjalan normal tanpa error dan hanya menampilkan pemberitahuan (*toast*) kecil di layar, sementara efek suara klik instrumen tiap wilayah tetap berbunyi melalui sintesis Web Audio API.

