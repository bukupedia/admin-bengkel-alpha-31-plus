# Changelog

All notable changes to this project will be documented in this file.

## [alpha-40]

Codebase: alpha-39

### Added

#### Halaman Pelanggan (pelanggan.html, pelanggan.js)
- Added "Jumlah Kendaraan" column in customer table to display number of vehicles owned by each customer
- Added vehicle management feature in "Detail Pelanggan" modal:
  - Added "Tambah Kendaraan" button to add new vehicle to customer
  - Added delete button (🗑) on each vehicle to remove it
  - Display all vehicles registered for the customer with police number, brand, and name
- Added new data structure to support multiple vehicles per customer:
  - Changed customer data from single vehicle fields (policeNumber, vehicleBrand, vehicleName) to vehicles array
  - Each vehicle now has its own ID, policeNumber, vehicleBrand, and vehicleName
- Added migration function to automatically convert old single-vehicle data to new vehicles array format

#### Halaman Servis (servis.html, servis.js)
- Updated customer dropdown (datalist) to display all vehicles for each customer
- Added vehicleIndex field to track which vehicle was selected when creating a service record
- Updated service table to display the correct vehicle based on saved vehicleIndex
- Updated detail view to display the correct vehicle information based on saved vehicleIndex
- Updated WhatsApp messages to use the correct vehicle information based on saved vehicleIndex

## [alpha-39]

Codebase: alpha-38

### Added

#### Dashboard (dashboard.html, dashboard.js)
- Added "Pendapatan" section with 5 cards showing income details:
  - Harian (daily income - today)
  - Mingguan (weekly income - last 7 days)
  - Bulanan (monthly income - current month)
  - Tahunan (yearly income - current year)
  - Total (total income - all time)
- Added `getWeekDateRange()` function to get last 7 days date range
- Added `getMonthDateRange()` function to get current month date range
- Added `getYearDateRange()` function to get current year date range
- Added `calculateIncomeByDateRange()` function to calculate income for a given date range
- Added `loadPendapatanData()` function to load and display all income data

## [alpha-38]

Codebase: alpha-37

### Added

#### Semua Halaman HTML (index.html, dashboard.html, pelanggan.html, servis.html, sparepart.html)
- Added noindex meta tags to prevent search engine indexing:
  - `<meta name="robots" content="noindex, nofollow">` - Untuk semua crawler
  - `<meta name="googlebot" content="noindex, nofollow">` - Untuk Google
  - `<meta name="bingbot" content="noindex, nofollow">` - Untuk Bing
  - `<meta name="yandex" content="noindex, nofollow">` - Untuk Yandex
  - `<meta name="duckduckbot" content="noindex, nofollow">` - Untuk DuckDuckGo

#### PWA (Progressive Web App)
- Added `manifest.json` - Konfigurasi PWA untuk installable web app
- Added `sw.js` - Service Worker untuk offline support dan caching
- Added `assets/icons/` - 8 ukuran ikon PWA (72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512)
- Added PWA manifest link di semua halaman HTML
- Added theme-color meta tag di semua halaman HTML
- Added apple-touch-icon di semua halaman HTML
- Added service worker registration di semua halaman HTML

### Changed

#### Semua Halaman HTML
- Updated head section untuk menyertakan PWA tags dan manifest

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
