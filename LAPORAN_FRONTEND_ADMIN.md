# 📋 Laporan Pengerjaan Frontend — Admin Dashboard

**Tanggal:** 11 April 2026  
**Project:** Vortex Ticketing Platform (vortex-web)  
**Scope:** Frontend only — Tidak ada perubahan backend/database  
**Tech Stack:** React 19 + TypeScript + Tailwind CSS + Recharts + jsPDF + xlsx

---

## Daftar File yang Diubah/Dibuat

| # | File | Aksi | Lokasi |
|---|------|------|--------|
| 1 | `AdminEventsPage.tsx` | **REWRITE** (total tulis ulang) | `src/pages/admin/` |
| 2 | `AdminAnalyticsPage.tsx` | **UPGRADE** (penambahan fitur besar) | `src/pages/admin/` |
| 3 | `AdminReportsPage.tsx` | **NEW** (file baru) | `src/pages/admin/` |
| 4 | `AdminLayout.tsx` | **EDIT** (+1 nav item) | `src/pages/admin/` |
| 5 | `App.tsx` | **EDIT** (+1 route + lazy import) | `src/` |

> **Catatan penting:** Tidak ada file backend (Laravel/PHP) yang diubah. Tidak ada dependency baru yang di-install — semua library yang dipakai (`recharts`, `jspdf`, `jspdf-autotable`, `xlsx`) sudah ada di `package.json`.

---

## Task A1: Event CRUD dengan Detail Preview

### File: `src/pages/admin/AdminEventsPage.tsx` (REWRITE)

File ini ditulis ulang total dari 358 baris menjadi ~400 baris dengan fitur-fitur baru berikut:

### 1. Event Detail Modal (Preview)
- Klik baris event di tabel → muncul **modal preview** dengan layout 2 kolom
- **Kolom kiri**: Poster image full-height dengan gradient overlay dan badge status
- **Kolom kanan**: Detail event (nama, venue, date, category, price, tickets sold) dalam grid cards
- Progress bar visual menampilkan persentase tiket terjual
- Tombol **Edit** dan **Delete** langsung dari modal preview

### 2. Live Preview Poster Image
- Modal Add/Edit event menggunakan layout **2 panel**:
  - **Panel kiri**: Area poster preview dengan rasio **2:3 (portrait)** — bukan banner landscape
  - **Panel kanan**: Form input
- Upload poster menggunakan **drag & drop** atau **click to browse**
- Preview poster **real-time** — langsung terlihat setelah file dipilih
- Hover pada poster yang sudah diupload menampilkan overlay "Click to change"

### 3. Time Range Picker
- **Sebelum:** Input single date saja
- **Sesudah:** Dua field date — **Start Date** dan **End Date**
- End date otomatis memiliki `min` value = start date (validasi HTML)
- Data dikirim ke backend sebagai `start_time` dan `end_time`

### 4. Validasi Delete (Block jika ada tiket yang sudah order)
- Sebelum delete, sistem cek: `ticketsSold = capacity - ticketsLeft`
- Jika `ticketsSold > 0` → delete **diblokir**, muncul **error toast** merah:
  > `Cannot delete "NEON CHAOS 2025" — 355 ticket(s) already ordered.`
- Toast otomatis hilang setelah 5 detik
- Jika tiket belum ada yang terjual → confirm dialog normal → proses delete

### 5. Validasi Upload Poster
- Hanya menerima file **JPG/PNG** (`image/jpeg`, `image/png`, `image/jpg`)
- Maksimal ukuran file: **2MB**
- Jika file tidak sesuai → muncul **error message** di bawah area upload:
  - `"File harus berformat JPG atau PNG."` (jika tipe salah)
  - `"Ukuran file maksimal 2MB."` (jika terlalu besar)

### 6. Event Status Display
Status event ditampilkan sebagai badge berwarna dengan logika otomatis:

| Status | Badge | Warna |
|--------|-------|-------|
| `ACTIVE` | ACTIVE | 🟢 Emerald/hijau |
| `DRAFT` | DRAFT | ⚪ Abu-abu |
| `LOCKED` (tiket habis) | SOLD OUT | 🔴 Rose/merah |
| Date sudah lewat | PAST | ⚫ Zinc/gelap |
| `COMPLETED` | COMPLETED | 🔵 Sky/biru |

Auto-detect: Jika `end_date < today` dan status bukan ACTIVE → otomatis ditampilkan sebagai "PAST"

### 7. Search & Filter
- **Search bar** dengan icon — filter berdasarkan nama event atau venue
- **Filter tabs**: ALL | ACTIVE | DRAFT | SOLD OUT | PAST
- Tabs menyoroti status yang dipilih dan memfilter tabel secara real-time

### 8. Fitur Tambahan
- **Poster thumbnail** di tabel (kolom pertama, ukuran 48×64px, rounded)
- **Price column** ditambahkan ke tabel
- **Description textarea** ditambahkan ke form (backend sudah support field `description`)
- Capacity menampilkan format `sold/total` (contoh: `355/500`)

---

## Task A2: Event Performance Analytics Dashboard

### File: `src/pages/admin/AdminAnalyticsPage.tsx` (UPGRADE)

File ini di-upgrade dari 242 baris menjadi ~310 baris dengan fitur-fitur baru:

### 1. Line Chart — Perbandingan Performa Antar Event
- **Chart baru** ditambahkan di atas bar chart
- Multi-line chart dengan warna berbeda per event (maks 5 event)
- Setiap line menunjukkan simulasi revenue per bulan (Jan–Jun)
- Tooltip menampilkan nilai per event
- Legend otomatis di bawah chart

### 2. Bar Chart — Revenue per Event (Enhanced)
- Sudah ada sebelumnya, sekarang **di-enhance**:
  - Data otomatis **di-sort** dari revenue tertinggi ke terendah
  - Tooltip lebih detail (menampilkan revenue + event name)

### 3. Pie Chart — Tickets Sold vs Available
- **Chart baru** menggantikan "Category Distribution" yang sebelumnya
- Donut chart menampilkan **total tickets sold vs total available** secara agregat
- Warna: Indigo (#818cf8) untuk Sold, Dark (#1e293b) untuk Available
- Legend di bawah chart menampilkan jumlah masing-masing

### 4. Trending Events (Top 5)
- **Section baru** di bagian bawah halaman
- Menampilkan **5 event dengan occupancy tertinggi** sebagai card horizontal
- Setiap card menampilkan:
  - **Rank badge** (#1, #2, dst)
  - **Event image** dengan hover zoom effect
  - **Nama event**
  - **Revenue** (CRD format)
  - **Occupancy percentage** (warna dinamis: hijau/kuning/merah)
  - **Progress bar** gradient sesuai occupancy level

### 5. Filter Options

#### Date Range Selector
- **From Date** dan **To Date** input field
- Filter event berdasarkan tanggal event
- Semua chart dan metric cards otomatis update sesuai filter

#### Event Multi-Select
- Dropdown dengan **checkbox per event**
- Bisa pilih beberapa event sekaligus untuk dibandingkan
- Tombol "Clear All Filters" di dalam dropdown
- Badge di button: "All Events" atau "3 selected"

#### View Mode Toggle
- Toggle button **DETAIL** | **SUMMARY** di header
- **Detail mode**: Menampilkan semua chart (line, bar, pie) + trending events
- **Summary mode**: Menampilkan tabel ringkasan event (nama, kategori, sold, revenue, occupancy, status)

### 6. Metric Cards Update
- **Occupancy Rate** menggantikan "Conversion Rate" yang sebelumnya random
- Semua metric sekarang **reactive** terhadap filter yang dipilih
- Tombol **Reset** muncul ketika ada filter aktif

---

## Task A3: Advanced Reporting & Export

### File: `src/pages/admin/AdminReportsPage.tsx` (NEW)

File baru, ~600 baris, tersedia di route `/admin/reports`.

### 1. Report Builder — 4 Tipe Report

#### a. Transaction Report
- Menampilkan semua transaksi (order history) + data simulasi
- Kolom: Order ID, Date, Items, Total, Credits, Status
- Status ditandai warna: Completed (🟢), Refunded (🟡), Cancelled (🔴)
- Filter by event name dan date range

#### b. Daily Revenue Report
- Agregasi revenue per hari dari transaksi yang Completed
- Tabel + **bar chart** visual di atas tabel
- Chart menggunakan warna indigo (#818cf8)

#### c. Event Profit Breakdown
- Menampilkan profit per event dengan kalkulasi:
  - `Revenue = ticketsSold × price`
  - `Operational Cost = 15% revenue`
  - `Platform Fee = 8% revenue`
  - `Profit = Revenue - Cost - Fee`
  - `Margin = (Profit / Revenue) × 100%`
- Tabel + **stacked bar chart** (Revenue vs Profit)
- Chart menggunakan indigo untuk Revenue, emerald untuk Profit

#### d. Refund/Cancellation Report
- Filter hanya transaksi dengan status Refunded atau Cancelled
- Summary cards menampilkan jumlah refund dan cancellation

### 2. Export Functionality

#### PDF Export (jsPDF + jspdf-autotable)
- Klik **Export → Export as PDF**
- Generate PDF dengan:
  - Header: "Vortex — [Report Type] Report"
  - Timestamp: tanggal generate
  - Period: dari filter date range (jika ada)
  - Tabel data lengkap dengan header berwarna indigo
  - Summary footer (total revenue / total profit)
- File otomatis di-download: `vortex-[type]-report.pdf`

#### Excel Export (xlsx)
- Klik **Export → Export as Excel**
- Generate file .xlsx dengan worksheet sesuai report type
- Kolom mengikuti header tabel
- File otomatis di-download: `vortex-[type]-report.xlsx`

#### Email Export (Simulasi Frontend)
- Klik **Export → Send via Email**
- Modal muncul dengan:
  - Input field email penerima
  - Report details summary (type, records, format)
- Klik **Send Report** →
  1. **Spinner animasi** 2 detik ("Sending Report... Delivering to xxx@email.com")
  2. **Success state** dengan checkmark hijau ("Report Sent! Successfully sent to xxx@email.com")
  3. Auto-close setelah 2.5 detik
- **Ini adalah simulasi murni** — tidak benar-benar mengirim email (butuh backend SMTP)

### 3. Filter Options
- **Date range**: From Date dan To Date
- **Event filter**: dropdown pilih event spesifik
- **Clear Filters** button muncul saat filter aktif
- Semua filter reactive — tabel dan chart auto-update

### 4. Summary Cards
Setiap report type memiliki summary cards tersendiri:
- **Transaction**: Total Transactions, Total Revenue, Credits Distributed
- **Event Profit**: Total Revenue, Total Profit, Avg Margin
- **Refund**: Total Refunds, Total Cancellations

---

## Perubahan di File Lain (Phase 1)

### File: `src/pages/admin/AdminLayout.tsx` (EDIT)

Perubahan minimal — hanya menambahkan 1 item navigasi:

```diff
  { to: '/admin/analytics', icon: 'analytics', label: 'Analytics' },
+ { to: '/admin/reports', icon: 'summarize', label: 'Reports' },
  { to: '/admin/scanner', icon: 'document_scanner', label: 'Validation' },
```

Reports muncul di sidebar antara Analytics dan Validation.

### File: `src/App.tsx` (EDIT)

Perubahan minimal — menambahkan lazy import dan route:

```diff
  const AdminAnalyticsPage = lazy(...)
+ const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage').then(module => ({ default: module.AdminReportsPage })))
```

```diff
  <Route path="analytics" element={<AdminAnalyticsPage />} />
+ <Route path="reports" element={<AdminReportsPage />} />
```

---
---

# 📋 Laporan Pengerjaan Frontend — Phase 2 (User Experience)

**Tanggal:** 11 April 2026  
**Scope:** Frontend only — Backend tidak diubah, fitur yang butuh backend disimulasi di frontend  
**Total File Diubah:** 2 file

---

## Daftar File yang Diubah (Phase 2)

| # | File | Aksi | Lokasi |
|---|------|------|--------|
| 1 | `CheckoutPage.tsx` | **REWRITE** (total tulis ulang) | `src/pages/` |
| 2 | `AdminLayout.tsx` | **REWRITE** (total tulis ulang) | `src/pages/admin/` |

> **Catatan:** `AdminLayout.tsx` sebelumnya sudah di-edit minor di Phase 1 (tambah nav item). Di Phase 2 ini file tersebut ditulis ulang total untuk redesign sidebar.

---

## Task B1: Smart Profile Auto-Complete untuk Ticket Purchase

### File: `src/pages/CheckoutPage.tsx` (REWRITE)

File ditulis ulang total dari 485 baris menjadi ~420 baris dengan arsitektur baru **2-step checkout flow**.

### 1. Two-Step Checkout Flow
Sebelumnya checkout langsung ke halaman payment. Sekarang dibagi menjadi 2 langkah:

| Step | Nama | Isi |
|------|------|-----|
| **Step 1** | BUYER_INFO | Form isian data buyer + assignment tiket per penumpang |
| **Step 2** | PAYMENT | Order summary + payment method selection + execute payment |

Progress indicator visual di atas halaman menampilkan step aktif dengan animasi progress bar.

### 2. Pre-fill Buyer Info dari Profile
Saat user masuk ke halaman checkout, data otomatis diisi dari 2 sumber (prioritas):

1. **LocalStorage** (sesi sebelumnya) — jika user pernah checkout sebelumnya
2. **User profile** (dari auth context) — nama dan email dari akun yang login

Field yang di-auto-fill:
- **Full Name** → dari `user.displayName`
- **Email** → dari `user.email`
- **Phone Number** → dari localStorage (jika ada)

Jika data berasal dari sesi sebelumnya, muncul indicator hijau:
> `🔄 AUTO-FILLED FROM PREVIOUS SESSION`

### 3. LocalStorage Remember Last Used Data
- Setiap kali user klik **CONTINUE_TO_PAYMENT**, data buyer otomatis disimpan ke `localStorage`
- Key: `vortex.checkout.buyer`
- Data yang disimpan: `{ name, email, phone }`
- Saat checkout berikutnya, data langsung terisi dari localStorage tanpa perlu ketik ulang

### 4. Passenger Assignment per Tiket
Untuk setiap tiket di keranjang, user bisa memilih:

- **✅ ASSIGN_TO_BUYER** (default) — tiket atas nama buyer sendiri
- **❌ Uncheck** → muncul form terpisah untuk data penumpang lain:
  - `PASSENGER_NAME` (required)
  - `PASSENGER_EMAIL` (required, validasi format)
  - `PASSENGER_PHONE` (optional)

Setiap tiket memiliki label "TICKET 01", "TICKET 02", dst. dengan nama event dan tier.

### 5. Smart Validation (No NIK)
Validasi form **tanpa NIK** — hanya field yang penting:

| Field | Validasi | Error Message |
|-------|----------|---------------|
| Buyer Name | Required | "Nama buyer harus diisi" |
| Buyer Email | Required + format email | "Email harus diisi" / "Format email tidak valid" |
| Buyer Phone | Required + min 10 digit | "Nomor telepon harus diisi" / "Nomor telepon minimal 10 digit" |
| Passenger Name | Required (jika tidak use buyer) | "Nama penumpang harus diisi" |
| Passenger Email | Required + format (jika tidak use buyer) | "Email harus diisi" / "Format email tidak valid" |

Error ditampilkan langsung di samping label field dengan warna merah, dan field yang error mendapat border merah + glow effect.

### 6. Order Summary di Step 2
Setelah step 1 selesai, step 2 menampilkan ringkasan lengkap:
- **Buyer Details** — nama, email, phone + tombol EDIT_INFO untuk kembali
- **Items List** — setiap tiket/merchandise dengan assigned name
- **Totals** — subtotal, tax & service, total payable

---

## Task B2: Midtrans Payment Gateway UI

### File: `src/pages/CheckoutPage.tsx` (bagian dari rewrite yang sama)

### 1. Payment Method Options
4 metode pembayaran yang tersedia (menggantikan CRYPTO dengan BANK):

| Method | Icon | UI |
|--------|------|-----|
| **QRIS** | `qr_code_2` | QR code visual dengan corner markers + timer "EXPIRES IN: 14:59" |
| **CARD** | `credit_card` | Form: Card Number, Expiry (MM/YY), CVV |
| **E-WALLET** | `account_balance_wallet` | Pilihan GoPay / OVO / DANA + input phone number |
| **BANK** | `account_balance` | **BARU** — Pilihan BCA / BNI / BRI / Mandiri + Virtual Account number |

### 2. Bank Transfer UI (Baru)
Menggantikan "CRYPTO" yang sebelumnya. Menampilkan:
- Grid 2x2 pilihan bank (BCA, BNI, BRI, Mandiri)
- **Virtual Account Number** display: `8800 1234 5678 9012`
- Timer merah: "EXPIRES IN: 23:59:59"
- Ini adalah **simulasi** — tidak terhubung ke payment gateway asli

### 3. Payment Status Indicator
Ditambahkan **feedback visual** saat proses pembayaran berlangsung:

| Status | Warna | Icon | Teks |
|--------|-------|------|------|
| `pending` | 🟡 Amber | Spinner | "INITIATING_PAYMENT..." |
| `processing` | 🔵 Sky | Spinner | "PROCESSING_TRANSACTION..." |
| `success` | 🟢 Emerald | ✅ Check | "PAYMENT_CONFIRMED" |
| `failed` | 🔴 Red | ❌ Error | "PAYMENT_FAILED — RETRY" |

Flow animasi: idle → pending (0.8s) → processing (API call) → success/failed

### 4. Mobile-Responsive Design
- Layout 2 kolom di desktop, 1 kolom di mobile
- Payment method grid menyesuaikan layar
- Step progress indicator responsif

---

## Task B3: User-Friendly Admin Dashboard UI

### File: `src/pages/admin/AdminLayout.tsx` (REWRITE)

File ditulis ulang total dari 108 baris menjadi ~200 baris.

### 1. Sidebar Redesign — Quick Stats Cards
Di bagian atas sidebar (di bawah logo), ditambahkan **3 card metric mini**:

| Card | Data | Warna |
|------|------|-------|
| **Pending** | Jumlah order pending | 🟡 Amber |
| **Revenue** | Total revenue (format: "145k") | 🟣 Indigo |
| **Events** | Jumlah event aktif | 🟢 Emerald |

Data diambil langsung dari store (reactive).

### 2. Sectioned Navigation
Navigasi sidebar sekarang dikelompokkan menjadi 3 section dengan heading:

```
📊 OVERVIEW
   Dashboard
   Analytics
   Reports

⚙️ MANAGE
   Events
   Venues
   Validation
   Users (hidden untuk Organizer)

📝 CONTENT
   Merchandise
   Broadcasts
   Notifications (badge: 3)
```

Setiap section memiliki heading abu-abu kecil dengan tracking lebar.

### 3. Mobile Responsive — Slide-Out Drawer
**Sebelum:** Mobile header dengan tombol logout saja, tanpa navigasi.

**Sesudah:**
- **Hamburger menu** (☰) di kiri header mobile
- Klik → **slide-out drawer** dari kiri dengan overlay gelap
- Drawer berisi seluruh sidebar content (logo, stats, nav, user profile)
- Klik di luar drawer → otomatis close
- Animasi: `slide-in-from-left` 300ms

### 4. Mobile Header Enhancement
Header mobile sekarang menampilkan:
- **Hamburger menu** (kiri)
- **Logo + "Vortex Console"** (tengah)
- **Notification bell** dengan badge merah (kanan)
- **Logout button** (kanan)

### 5. Organizer Role UI Support
Jika user yang login memiliki `role === 'organizer'`:

- Logo subtitle berubah dari "Console" menjadi **"Organizer"**
- Menu **Users** disembunyikan dari sidebar (organizer tidak boleh manage user)
- Muncul **badge khusus** di bawah navigasi:
  ```
  ✅ Organizer Mode
     Limited access panel
  ```
  Dengan border dan background indigo transparan

### 6. Site/Exit Split Buttons
**Sebelum:** Satu tombol "Exit Console" saja.

**Sesudah:** Dua tombol berdampingan:

| Button | Icon | Fungsi |
|--------|------|--------|
| **Site** | 🏠 home | Kembali ke halaman utama (`/`) tanpa logout |
| **Exit** | 🚪 logout | Logout + redirect ke landing page |

Tombol "Exit" berubah warna merah saat hover.

### 7. Dark Theme Consistency
- Seluruh sidebar menggunakan palette `#050505` / `#0a0a0a`
- Background glow effects (indigo, purple, sky) di main content area dipertahankan
- Glassmorphism: `backdrop-blur-[40px]` + `bg-white/[0.02]`
- Border: `border-white/[0.08]`

---

## Cara Menjalankan

1. Pastikan berada di folder `vortex-web`
2. Jalankan `npm run dev`
3. Login sebagai admin:
   - Email: `admin@vortex.com`
   - Password: `vortexadmin`
4. Login sebagai user:
   - Username: `asep` / Password: `password123`
   - Username: `budi` / Password: `budi12345`
5. Akses halaman:
   - **Events**: `http://localhost:5173/admin/events`
   - **Analytics**: `http://localhost:5173/admin/analytics`
   - **Reports**: `http://localhost:5173/admin/reports`
   - **Checkout**: Login sebagai user → pilih event → reserve → cart → checkout

---

## Catatan untuk Tim

1. **File backend yang diubah:** Hanya `AuthController.php` (hapus `Hash::make()` dari register method — fix bug double hashing)
2. **File frontend yang diubah:** `auth.tsx` (fix login field email/username), `CheckoutPage.tsx`, `AdminLayout.tsx`, `AdminEventsPage.tsx`, `AdminAnalyticsPage.tsx`, `AdminReportsPage.tsx`, `App.tsx`
3. **Tidak ada dependency baru** — semua library sudah ada di `package.json`
4. **Email export adalah simulasi** — untuk kirim email asli, backend perlu endpoint SMTP
5. **Payment gateway adalah simulasi** — untuk integrasi Midtrans asli, backend perlu Midtrans API key + Snap token endpoint
6. **Bank transfer VA number adalah dummy** — tidak terhubung ke real VA
7. **Data report sebagian simulasi** — beberapa data transaksi adalah mock/dummy untuk demo
8. **TypeScript build clean** — `npx tsc --noEmit` menghasilkan 0 error
9. **Organizer role** — untuk test, ubah role user di database menjadi `organizer` dan login

---

## Daftar Lengkap Semua File yang Diubah (Phase 1 + Phase 2)

| # | File | Phase | Aksi |
|---|------|-------|------|
| 1 | `src/pages/admin/AdminEventsPage.tsx` | A1 | REWRITE |
| 2 | `src/pages/admin/AdminAnalyticsPage.tsx` | A2 | UPGRADE |
| 3 | `src/pages/admin/AdminReportsPage.tsx` | A3 | NEW |
| 4 | `src/pages/admin/AdminLayout.tsx` | A3 + B3 | EDIT → REWRITE |
| 5 | `src/App.tsx` | A3 | EDIT |
| 6 | `src/pages/CheckoutPage.tsx` | B1 + B2 | REWRITE |
| 7 | `src/lib/auth.tsx` | Bug Fix | EDIT (login field) |
| 8 | `PWL26/app/Http/Controllers/Api/AuthController.php` | Bug Fix | EDIT (double hash) |

