# Changelog

All notable changes to this project will be documented in this file.

## [alpha-51]

Codebase: alpha-50

## [alpha-50]

Codebase: alpha-49

### Fixed

#### Kode Pengiriman WhatsApp (pelanggan.js, servis.js, sparepart.js, settings.js)
- Perbaikan format nomor WhatsApp yang salah saat nomor sudah dimulai dengan "62"
- Kode lama menambahkan "62" tanpa pengecekan, sehingga "6281234567890" menjadi "626281234567890"
- Menambahkan fungsi formatWhatsAppNumber() untuk memeriksa:
  - Jika dimulai dengan "62" → tetap sesuai input
  - Jika dimulai dengan "0" → ganti "0" dengan "62" (contoh: "0812xxx" → "62812xxx")
  - Jika dimulai dengan angka lain → tambahkan "62" di depan

#### Halaman Pelanggan (pelanggan.js)
- Memperbaiki format URL WhatsApp dengan fungsi formatWhatsAppNumber() yang benar

#### Halaman Sparepart (sparepart.js - 2 lokasi)
- Memperbaiki format URL WhatsApp supplier di tabel dan modal detail
- Menggunakan fungsi formatWhatsAppNumber() yang konsisten

#### Halaman Servis (servis.js)
- Mengganti DEFAULT_WHATSAPP_NUMBER dengan getDefaultWhatsAppNumber()
- Sekarang membaca nomor WhatsApp dari settings
- Fallback ke nomor default jika settings kosong

#### Halaman Pengaturan (settings.js)
- Menambahkan formatWhatsAppNumberForStorage() sebelum menyimpan nomor
- Sekarang nomor disimpan dalam format yang benar untuk WhatsApp

## [alpha-49]

Codebase: alpha-48

### Changed

#### Halaman Sparepart (sparepart.html, sparepart.js)
- Mengubah judul kolom "Quantity" menjadi "Stok" di tabel
- Mengubah placeholder input Quantity di modal "Tambah Sparepart" menjadi "Stok"
- Mengubah placeholder input Quantity di modal "Edit Sparepart" menjadi "Edit Stok"
- Mengubah label Quantity di modal "Detail Sparepart" menjadi "Stok"
- Mengubah tipe input "Deskripsi/Keterangan Produk" dari input menjadi textarea pada modal "Tambah Sparepart" dan "Edit Sparepart"

#### Halaman Pelanggan (pelanggan.html, pelanggan.js)
- Mengubah placeholder input Nomor Polisi di modal "Tambah Pelanggan" menjadi "No. Polisi/License Plate"
- Mengubah placeholder input Nomor Polisi di modal "Edit Pelanggan" menjadi "No. Polisi/License Plate"
- Mengubah placeholder input Vehicle Name di modal "Tambah Pelanggan" menjadi "Tipe Kendaraan: Beat, Mio, Nex..."
- Mengubah placeholder input Vehicle Name di modal "Edit Pelanggan" menjadi "Tipe Kendaraan: Beat, Mio, Nex..."
- Mengubah label "Nama Kendaraan" di modal "Detail Pelanggan" menjadi "Tipe Kendaraan"
- Mengubah label "Nomor Polisi" di modal "Detail Pelanggan" menjadi "No. Polisi/License Plate"

#### Halaman Pengaturan (pengaturan.html, settings.js)
- Menambahkan informasi kapasitas Total Penyimpanan (5 MB)
- Menambahkan informasi Total Penyimpanan yang digunakan
- Menambahkan informasi Total Penyimpanan Tersedia
- Menghilangkan tampilan data session (admin_session, session_fp) dari tabel "Informasi Penyimpanan"
- Mengubah judul section "Zona Berbahaya" menjadi "Danger Zone"

## [alpha-48]

Codebase: fix-import-json-error-handling

### Fixed

#### Dashboard - Pelanggan Baru Counter (dashboard.js, pelanggan.js)
- Fixed "Pelanggan Baru" in "Hari Ini" section not incrementing when adding new customer
- Root cause: `createdAt` field was not set when creating new customer in pelanggan.js
- Dashboard filtering logic `c.createdAt.startsWith(today)` always returned 0 because `createdAt` was undefined
- Added `createdAt` field with today's date (YYYY-MM-DD format) when creating new customer
- Now imports `getTodayString()` from utils.js in pelanggan.js

## [alpha-47]

Codebase: alpha-46

### Fixed

#### Import Data (storage.js)
- Fixed "Unexpected token 'T'... is not valid JSON" error when importing data files
- Error occurred because getStorageInfo() tried to JSON.parse() all localStorage values without error handling
- When invalid/corrupted data exists in localStorage, JSON.parse() throws error

#### Root Cause
- getStorageInfo() function used JSON.parse() directly on localStorage values without try-catch
- If any value in localStorage is not valid JSON (corrupted data or from previous imports), parsing fails

#### Solution
- Added try-catch in getStorageInfo() to safely parse JSON values
- Now handles non-JSON values gracefully - logs warning and treats as 0 items
- Added data type validation in importData() to ensure only valid data is stored

## [alpha-46]

Codebase: alpha-45

### Fixed

#### Settings Page (pengaturan.html, settings.js)
- Fixed "Save Settings" button not responding to clicks
- Fixed "Export Data" button not responding to clicks
- Fixed "Import Data" button not responding to clicks
- Fixed "Delete All Data" button not responding to clicks

#### Root Cause
- JavaScript event listeners attached with `addEventListener()` were not being triggered due to module scope isolation
- Handler functions defined in ES modules were not accessible from the global scope

#### Solution
- Added `onclick` HTML attributes directly to buttons in pengaturan.html
- Exposed handler functions to window object in settings.js for global access:
  - `window.saveSettingsHandler = saveSettingsHandler`
  - `window.exportDataHandler = exportDataHandler`
  - `window.importDataHandler = importDataHandler`
  - `window.deleteAllDataHandler = deleteAllDataHandler`

## [alpha-45]

Codebase: alpha-44

### Fixed

#### Code Organization (utils.js)
- Consolidated duplicate date utility functions that were scattered across multiple files:
  - Added `getTodayString()` function - returns today's date as YYYY-MM-DD string
  - Added `getYesterdayString()` function - returns yesterday's date as YYYY-MM-DD string
  - Added `getDateOffsetString(days)` function - returns date offset from today

#### Dashboard (dashboard.js)
- Removed duplicate `getTodayString()` and `getYesterdayString()` functions
- Now imports date utilities from utils.js
- Fixed unused `data` parameter in `renderTopSellingParts(data)` - removed unnecessary parameter
- Fixed unused `data` parameter in `renderTopSellingPartsToday(data)` - removed unnecessary parameter

#### Servis Page (servis.js)
- Removed duplicate `getTodayString()`, `getYesterdayString()`, and `getDateOffsetString()` functions
- Now imports date utilities from utils.js

#### Authentication (auth.js)
- Fixed `getCurrentUser()` function to return username string directly instead of full session object

#### Navigation (navbar.js)
- Fixed undefined username display - changed from `${user ? user.username : 'Admin'}` to `${user || 'Admin'}`

### Changed

#### Code Quality
- All JavaScript files validated for syntax - no errors
- Consolidated utility functions to single source of truth in utils.js
- Eliminated code duplication across modules

## [alpha-44]

Codebase: alpha-37

### Added

#### Pengaturan (pengaturan.html, settings.js)
- Added "Pengaturan" page with the following features:
  - Edit default WhatsApp number for sending messages to customers and suppliers
  - Edit admin username and password
  - Display storage usage information (total size and per data type)
  - Import & Export data to JSON
  - Delete all data functionality (danger zone with double confirmation)

#### Storage Module (storage.js)
- Added getStorageInfo() function to calculate storage usage
- Added formatBytes() function for human-readable byte formatting
- Added exportAllData() function for JSON export
- Added importData() function for JSON import
- Added clearAllData() function for deleting all data
- Added getSettings() and saveSettings() functions
- Added getAdminCredentials() and saveAdminCredentials() functions
- Added DATA_KEYS constant for data keys

#### Authentication (auth.js)
- Updated to validate login against stored credentials from localStorage instead of hardcoded values

#### Navigation (navbar.js)
- Added "Pengaturan" menu item in navigation

#### Application (app.js)
- Added Settings page initialization

## [alpha-37]

Codebase: alpha-36

### Changed

#### Halaman Servis (servis.js)
- Changed stock display color: red for low stock (< 5), green for sufficient stock (>= 5) in "Edit Servis" modal

## [alpha-36]

Codebase: alpha-35

### Added

#### Semua Halaman (pelanggan.html, servis.html, sparepart.html, pelanggan.js, servis.js, sparepart.js)
- Added "Clear" button (✕) to all search input fields to reset search and show all data

#### Halaman Dashboard (dashboard.html, dashboard.js)
- Added "Top Customer" section showing top 3 customers with most completed services
- Added "Top Products/Spareparts (All Time)" section showing top 3 best-selling spareparts
- Added "Top Products/Spareparts (Today)" section showing top 3 best-selling spareparts today

#### Halaman Sparepart (sparepart.html, sparepart.js)
- Added warning badge (⚠️) next to product name for items with low stock (< 5)
- Added search by supplier/company name functionality

### Changed

#### Halaman Servis (servis.js)
- Changed stock display color: red for low stock (< 5), green for sufficient stock (>= 5)
- Updated WhatsApp fallback messages to include police number when vehicle brand or name is not filled:
  - Status "Menunggu": "Kendaraan Anda dengan No. Polisi [No. Polisi] akan segera kami tangani..."
  - Status "Diproses": "Pelanggan yang terhormat, Terimosih sudah menunggu. Kendaraan Anda dengan No. Polisi [No. Polisi] sedang ditangani..."
  - Status "Selesai": "Terimosih sudah menunggu. Kendaraan Anda dengan No. Polisi [No. Polisi] sudah selesai kami tangani."
  - Status "Dibatalkan": (unchanged)

#### Halaman Dashboard (dashboard.html, dashboard.js)
- Changed "Pelanggan Teratas (10 Teratas)" to "Top Customer" and limit to 3 items
- Changed "Produk/Sparepart Terlaris (Semua Waktu)" to "Top Products/Spareparts (All Time)" and limit to 3 items
- Changed "Produk/Sparepart Terlaris Hari Ini" to "Top Products/Spareparts (Today)" and limit to 3 items

#### Halaman Sparepart (sparepart.html)
- Changed search input placeholder from "Cari sparepart..." to "Cari sparepart/supplier..."

## [alpha-35]

Codebase: alpha-34

### Added

#### Dashboard (dashboard.html, dashboard.js)
- Added "Pelanggan Teratas" section showing top 10 customers with most completed services (status "Selesai")

### Changed

#### Dashboard (dashboard.js)
- Modified loadDashboardData() to call renderTopCustomers()

#### Halaman Pelanggan (pelanggan.js)
- Modified Total Servis calculation in "Detail Pelanggan" modal to count only services with status "Selesai"
- Removed service history table from "Detail Pelanggan" modal
- Fixed WhatsApp URL to use Indonesia country code (62) - format: https://wa.me/62xxxxxxxxx
- Fixed WhatsApp country code issue: now properly adds Indonesia country code (62) and removes leading zero

## [alpha-34]

Codebase: alpha-33

### Added

#### Halaman Sparepart (sparepart.html, sparepart.js)
- Added "Deskripsi/Keterangan Produk" input field (optional)
- Added "Nama Supplier/Sales Person" input field (required)
- Added "Nama Perusahaan Supplier" input field (optional)
- Added "Nomor Telepon Supplier" input field (required)
- Added pagination with 10 records per page
- Added "Detail" button (👁️) to view sparepart details
- Added "WhatsApp" button (📱) to send WhatsApp message to supplier
- Added "Detail Sparepart" modal to display complete sparepart information
- Added required attribute to supplier and phone input fields in HTML

### Changed

#### Halaman Sparepart (sparepart.js)
- Modified renderTable() to support pagination
- Modified search functionality to reset to first page on new search
- Updated clearForm() and clearEditForm() to reset validation classes for all required fields
- Added new table columns: Supplier, Telepon
- Added view detail modal functionality

## [alpha-33]

Codebase: alpha-32

### Added

#### Halaman Pelanggan (pelanggan.html, pelanggan.js)
- Added required field validation for Nama, No. HP, and Nomor Polisi Kendaraan in "Tambah Pelanggan" modal
- Added pagination with 10 records per page
- Added "Detail" button (👁️) to view customer details
- Added "WhatsApp" button (💬) to send WhatsApp message to customer
- Added "Detail Pelanggan" modal to display complete customer information including servis history
- Added required attribute to Nama, No. HP, and Nomor Polisi input fields in HTML

### Changed

#### Halaman Pelanggan (pelanggan.js)
- Modified renderTable() to support pagination
- Modified search functionality to reset to first page on new search
- Updated clearForm() and clearEditForm() to reset validation classes for all required fields

## [alpha-32]

Codebase: alpha-31

### Added

- Menambahkan informasi tentang dynamic WhatsApp messages berdasarkan ketersediaan info kendaraan
- Menambahkan perubahan pada WhatsApp auto messages dengan informasi kendaraan (Merek, Nama, No. Polisi)
- Menambahkan fallback messages ketika vehicle brand atau name tidak diisi
- Menambahkan fixed item untuk "Fixed WhatsApp message variable naming conflict"

## [alpha-31]

Codebase: alpha-30

### Added

#### Halaman Servis (servis.html)
- Added "Batal" button in "Tambah Servis" modal
- Added "Merek Kendaraan" information in Detail Servis modal
- Added "Nama Kendaraan" information in Detail Servis modal

#### Halaman Pelanggan (pelanggan.html)
- Added new "Edit Pelanggan" modal with "Batal" button
- Added "Vehicle Brand" input field with placeholder "Merek Kendaraan: Honda, Yamaha, Suzuki..."
- Added "Vehicle Name" input field with placeholder "Nama Kendaraan: Beat, Mio, Nex..."
- Added "Batal" button in "Tambah Pelanggan" modal

#### Halaman Sparepart (sparepart.html)
- Added "Batal" button in "Tambah Sparepart" modal
- Added new "Edit Sparepart" modal with "Batal" button

### Changed

#### Halaman Servis (servis.html, servis.js)
- Updated Detail Servis modal to display vehicle brand and vehicle name from customer data
- Updated placeholders for vehicle input fields in Pelanggan modals

#### Halaman Pelanggan (pelanggan.html, pelanggan.js)
- Modified pelanggan.js to handle vehicle fields (vehicleBrand, vehicleName)
- Modified edit function to use separate edit modal instead of reusing same modal
- Updated clearForm and clearEditForm functions for new fields

#### Halaman Sparepart (sparepart.js)
- Modified sparepart.js to handle separate edit modal
- Updated clearForm and clearEditForm functions for edit modal

### Removed

#### Halaman Servis (servis.html, servis.js)
- Removed "Pratinjau" button from "Tambah Servis" modal
- Removed entire "Pratinjau Servis" modal (modalPreview)
- Removed showPreview() function from servis.js
- Removed preview-related event listeners and variables

### Fixed

#### General
- Fixed modal structure to properly separate edit and add forms
- Fixed JavaScript to properly handle new vehicle fields
