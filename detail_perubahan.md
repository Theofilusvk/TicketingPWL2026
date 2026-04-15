# 📋 Detail Perubahan — Vortex Ticketing System (15 April 2026)

> Dokumen ini merangkum seluruh perubahan yang dilakukan pada sesi ini, termasuk alasan teknis dan file yang diubah.

---

## 1. Tanggal Event: Start Date — End Date

### 🎯 Tujuan
Menampilkan rentang tanggal event (mulai — selesai), bukan hanya tanggal mulai saja.

### 📁 File yang Diubah

#### [MODIFY] [store.tsx](file:///d:/Kampus/Tugas%20Kuliah%20Semester%204/TicketingPWL2026/vortex-web/src/lib/store.tsx)

```diff
 export type EventData = {
   id: string
   name: string
   date: string
+  endDate?: string
   category: EventCategory
   ...
 }
```

```diff
 return {
   id: e.event_id.toString(),
   name: e.title,
   date: e.start_time ? e.start_time.split(' ')[0].replace(/-/g, '_') : 'TBA',
+  endDate: e.end_time ? e.end_time.split(' ')[0].replace(/-/g, '_') : undefined,
   category: e.category ? e.category.name : 'Lainnya',
   ...
 }
```

> [!IMPORTANT]
> Field `endDate` bersifat **opsional** (`?`). Jika event tidak punya `end_time`, tampilan tetap hanya menunjukkan tanggal mulai. Ini menjamin backward compatibility.

---

#### [MODIFY] [EventsPage.tsx](file:///d:/Kampus/Tugas%20Kuliah%20Semester%204/TicketingPWL2026/vortex-web/src/pages/EventsPage.tsx)

**Sebelum:** `{e.date} // {e.venue}`

**Sesudah:** `{e.date.replace(/_/g, '-')}{e.endDate && e.endDate !== e.date ? ` — ${e.endDate.replace(/_/g, '-')}` : ''} // {e.venue}`

Contoh tampilan: `2026-04-15 — 2026-04-20 // THE FOUNDRY`

---

#### [MODIFY] [AdminEventsPage.tsx](file:///d:/Kampus/Tugas%20Kuliah%20Semester%204/TicketingPWL2026/vortex-web/src/pages/admin/AdminEventsPage.tsx)

Perubahan di 3 tempat:
1. **API Mapping (baris ~87):** Menambah `endDate: e.end_time ? e.end_time.split(' ')[0] : undefined`
2. **Tabel Events (baris ~391):** Menampilkan `start — end` di kolom Date
3. **Detail Modal (baris ~473):** Menampilkan `start — end` di card Date

---

## 2. Reporting Grafik Revenue (Real-time)

### 🎯 Tujuan
Memperbaiki grafik reporting admin agar menampilkan data penjualan tiket secara real-time.

### 🔍 Root Cause

**Masalah:** `AnalyticsController.php` menggunakan `Cache::remember()` dengan TTL **24 jam** (`86400` detik). Setelah database di-seed ulang, cache masih menyimpan data lama/kosong dan tidak pernah di-refresh sampai 24 jam kemudian.

### 📁 File yang Diubah

#### [MODIFY] [AnalyticsController.php](file:///d:/Kampus/Tugas%20Kuliah%20Semester%204/TicketingPWL2026/PWL26/app/Http/Controllers/Api/AnalyticsController.php)

| Perubahan | Sebelum | Sesudah |
|-----------|---------|---------|
| Cache TTL | `86400` (24 jam) | `0` (no cache) |
| Query wrapper | `Cache::remember($key, ...)` | IIFE `(function() { ... })()` — langsung execute |
| Transaction limit | `->limit(20)` | `->limit(200)` |

```diff
-    private const CACHE_TTL = 86400;
+    private const CACHE_TTL = 0;
```

```diff
-    $cacheKey = 'analytics:event_comparison:' . md5($request->fullUrl());
-    $data = Cache::remember($cacheKey, self::CACHE_TTL, function () use ($request) {
+    // No cache - always return real-time data for reporting
+    $data = (function () use ($request) {
         // ... query logic ...
-    });
+    })();
```

Perubahan ini diterapkan pada **3 endpoint**:
- `getEventComparison()` — `/api/admin/analytics/event-comparison`
- `getRevenueAnalytics()` — `/api/admin/analytics/revenue`
- `getTransactionMetrics()` — `/api/admin/analytics/transactions`

> [!TIP]
> Untuk production, disarankan mengaktifkan kembali cache dengan TTL pendek (misalnya 60 detik) agar tidak membebani database. Untuk demo/presentasi, tanpa cache lebih baik karena menunjukkan data real-time.

---

#### [MODIFY] [AdminReportsPage.tsx](file:///d:/Kampus/Tugas%20Kuliah%20Semester%204/TicketingPWL2026/vortex-web/src/pages/admin/AdminReportsPage.tsx)

**Penambahan:** Grafik bar chart "Revenue per Event (Real-time)" pada tab **Transactions**.

Sebelumnya tab Transactions hanya menampilkan tabel. Sekarang juga menampilkan:
- Bar chart **Revenue** per event (warna ungu/indigo)
- Bar chart **Tickets Sold** per event (warna hijau emerald)
- Tooltip interaktif menampilkan detail saat hover

Chart ini menggunakan data dari endpoint `event-comparison` yang sudah tersedia di state `apiEventComparison`.

---

## 3. Fix Kursor Input (Sebelumnya)

#### [MODIFY] [index.css](file:///d:/Kampus/Tugas%20Kuliah%20Semester%204/TicketingPWL2026/vortex-web/src/index.css)

```diff
+/* Restore caret on actual input elements (override inheritance from parent) */
+input, textarea, select, [contenteditable="true"] {
+  caret-color: auto;
+}
```

**Root cause:** CSS `caret-color: transparent` pada `*` (parent) di-inherit oleh `input` child elements.

---

## 4. Penghapusan NIK (Sebelumnya)

#### [MODIFY] [PaymentController.php](file:///d:/Kampus/Tugas%20Kuliah%20Semester%204/TicketingPWL2026/PWL26/app/Http/Controllers/Api/PaymentController.php)

Menghapus `holder_identity` dari insert tickets karena field NIK sudah dihapus dari frontend.

---

## 5. Landing Page: Navbar Auth-Aware & RSVP Fix

### 🎯 Tujuan
Ketika admin mengakses Landing Page dari tombol "Site" di panel admin, tombol Login & Register harus hilang dan diganti tombol kembali ke Admin Panel. Tombol RSVP juga harus mengarah ke halaman events (bukan login lagi).

### 📁 File yang Diubah

#### [MODIFY] [LandingPage.tsx](file:///d:/Kampus/Tugas%20Kuliah%20Semester%204/TicketingPWL2026/vortex-web/src/pages/LandingPage.tsx)

**Import baru:**
```diff
+import { useAuth } from '../lib/auth'
```

**Hook baru di dalam komponen:**
```diff
+const { user, isAuthenticated } = useAuth()
```

**Logika Navbar:**

| Kondisi | Yang Ditampilkan |
|---------|------------------|
| Belum login | Tombol `Login` + `Register` (seperti sebelumnya) |
| Login sebagai Admin | Tombol **Admin Panel** → `/admin` |
| Login sebagai User biasa | Tombol **My Events** → `/events` |

**Logika RSVP NOW:**

| Kondisi | Tombol | Arah |
|---------|--------|------|
| Belum login | `RSVP NOW` | → `/login` |
| Sudah login | `BROWSE EVENTS` | → `/events` |

> [!NOTE]
> Deteksi admin menggunakan `user.isAdmin` dari `useAuth()` context (`auth.tsx`), yang sudah di-set berdasarkan `role === 'admin'` dari API backend.

---

## Ringkasan Dampak

| Area | Dampak | Resiko Bug |
|------|--------|------------|
| Event date range | Field opsional, backward compatible | ✅ Zero risk |
| Analytics cache removal | Query langsung ke DB setiap request | ⚠️ Minimal (hanya performa, bukan fungsionalitas) |
| Transaction chart baru | Komponen visual tambahan, tidak mengubah data | ✅ Zero risk |
| Navbar auth-aware | Kondisional rendering, tidak mengubah routing | ✅ Zero risk |

> [!CAUTION]
> Pastikan **MySQL** dan **Laravel backend** (`php artisan serve`) sudah berjalan sebelum presentasi. Frontend saja tidak cukup — grafik reporting membutuhkan data dari backend API.
