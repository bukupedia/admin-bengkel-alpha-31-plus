# Changelog

All notable changes to this project will be documented in this file.

## [alpha-42]

Codebase: alpha-41

### Added

#### UI Components (assets/js/components/ui.js) - NEW FILE
- Added "Toast Notifications" system with 4 types: success, error, warning, info
- Added "Confirmation Dialog" for delete actions and important operations
- Added "Loading Overlay" for page transitions
- Added "Alert Dialog" helper function
- Added "Form Validation" helper to validate required fields
- Added "Clear Form" helper to reset form fields
- Added "Debounce" helper for search inputs
- Added "Theme Toggle" functions (initTheme, toggleTheme, getTheme)

#### New Pages
- Added **nota.html** - Print/cetak nota/kwitansi page:
  - Select servis with status "selesai" to print
  - Display shop name, phone, address from settings
  - Display customer name, police number, date, items, total
  - Print-friendly format with @media print CSS
  - Download PDF via browser print
- Added **riwayat.html** - Activity log/riwayat aktivitas page:
  - Filter by date (all, today, week, month)
  - Filter by type (servis, pelanggan, sparepart, setting)
  - Paginated activity list with timestamp
  - Icons for each activity type

#### Navigation (navbar.js)
- Added "Riwayat" link in navbar navigation
- Added "Nota" link in navbar navigation
- Added theme toggle button (🌓/☀️) for dark/light mode

#### Activity Logging
- Added activity_log key storage
- Added logActivity() function to servis.js:
  - Log servis create/update/delete actions
  - Keep last 100 activities
- Added logActivity() function to pelanggan.js:
  - Log customer create/delete actions
  - Keep last 100 activities

#### Data Management (storage.js)
- Added exportAllData() function:
  - Export all data keys to JSON with version and timestamp
  - Keys: customers, servis, parts, shop_settings, service_statuses, categories, vehicle_brands, activity_log
- Added importAllData() function:
  - Import data from JSON backup
  - Validate data format before import

### Changed

#### Dashboard (dashboard.html)
- Fixed invalid `<h3>` tag to proper heading structure
- Changed dashboard title from `<h3>` to `<h2>`

#### Style.css (assets/css/style.css)
- Added loading spinner styles (.loading-spinner, .loading-spinner.sm, .loading-spinner.lg)
- Added loading overlay (.loading-overlay) with animation
- Added skeleton loading animation styles
- Added toast notification styles (.toast-container, .toast.success, .toast.error, etc.)
- Added confirmation modal styling (.confirm-modal-body, .confirm-modal-icon)
- Added button loading state (.btn.loading)
- Added dark mode support with [data-theme="dark"] attribute
- Added status color styles (.status-menunggu, .status-servicing, etc.)
- Added stagger animation for list items
- Added responsive card grid
- Added quick action button styles

### Fixed

#### Security
- XSS Protection: All user inputs sanitized with sanitizeHTML() across all modules
- Input validation improvements for all form submissions

#### UX Improvements
- Added proper input validation with .is-invalid class styling
- Better modal scroll with max-height 70vh
- Theme preference persisted to localStorage
- Proper theme initialization on page load

#### Bug Fixes
- Fixed SyntaxError in servis.js: duplicate variable declaration (`customer`)
  - Removed duplicate `const customer = customers.find(...)` since it was already defined above
  - This was causing navbar not to render because the JavaScript failed to load

## [alpha-41]

Codebase: alpha-40

### Added

#### Halaman Pengaturan (setting.html, setting.js)
- Added new "Settings" page for editing application configurations
- Added "Informasi Toko" section:
  - Edit nama bengkel, nomor telepon, alamat, email, dan deskripsi
- Added "Status Servis" section:
  - Manage available service status options (default: Menunggu, Diproses, Selesai, Dibatalkan)
  - Add/remove custom service status with color picker
  - Protected default 4 statuses from deletion
- Added "Kategori Sparepart" section:
  - Manage sparepart categories (Oli, Ban, Bus, Aki, Kampas Rem, Busi, Filter, Sparepart Umum)
  - Add/remove categories
- Added "Merek Kendaraan" section:
  - Manage vehicle brands (Honda, Yamaha, Suzuki, Kawasaki, TVS, Benelli, BMW, Harley-Davidson)
  - Add/remove brands
- Added "Kelola Data" section:
  - Export all data to JSON file
  - Import data from JSON file
  - Reset all data with confirmation (type "RESET" to confirm)
- Added "Tentang Aplikasi" section:
  - Display app name, version, and platform information

#### Navigation (navbar.js, app.js)
- Added "Pengaturan" link in navbar navigation
- Added setting page initialization in app.js

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
