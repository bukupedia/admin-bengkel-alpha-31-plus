# Admin Bengkel Alpha 31+

Sistem manajemen bengkel sederhana berbasis web menggunakan LocalStorage untuk menyimpan data.

## Fitur

### Halaman Dashboard
- Ringkasan total pelanggan, servis, dan sparepart
- Grafik servis berdasarkan status
- Servis terbaru

### Halaman Pelanggan
- Tambah, edit, dan hapus data pelanggan
- Data pelanggan: Nama, Nomor HP, Alamat, Nomor Polisi, Merek Kendaraan, Nama Kendaraan
- Pencarian pelanggan

### Halaman Servis
- Tambah dan kelola data servis
- Filter berdasarkan tanggal dan status
- Detail servis dengan informasi kendaraan
- Kirim status via WhatsApp otomatis
- Update status: Menunggu → Diproses → Selesai / Dibatalkan
- Manajemen item sparepart

### Halaman Sparepart
- Tambah, edit, dan hapus data sparepart
- Informasi stok dan harga
- Pengurangan stok otomatis saat servis selesai

## Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.3
- **Storage**: LocalStorage (browser)
- **Icons**: Bootstrap Icons

## Cara Menggunakan

1. Buka `index.html` di browser
2. Data akan tersimpan secara otomatis di LocalStorage browser
3. Untuk mengatur nomor WhatsApp tujuan, lihat di `assets/js/modules/servis.js`

## Struktur File

```
admin-bengkel-alpha-31-plus/
├── index.html          # Dashboard
├── pelanggan.html      # Data Pelanggan
├── servis.html         # Data Servis
├── sparepart.html      # Data Sparepart
├── dashboard.html      # Halaman Dashboard
├── assets/
│   ├── css/
│   │   └── style.css   # Custom styles
│   └── js/
│       ├── app.js             # Main application
│       ├── storage.js         # LocalStorage handler
│       ├── utils.js           # Utility functions
│       ├── components/
│       │   └── navbar.js      # Navbar component
│       └── modules/
│           ├── auth.js        # Authentication
│           ├── dashboard.js   # Dashboard logic
│           ├── pelanggan.js   # Pelanggan page
│           ├── servis.js      # Servis page
│           └── sparepart.js   # Sparepart page
├── CHANGELOG.md        # Riwayat perubahan
└── README.md           # Dokumentasi ini
```

## Lisensi

MIT License

