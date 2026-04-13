# Task Division - Tim Pengembang Web Ticketing (4 Orang)

## 📋 Ringkasan Requirement
Total 13 requirement untuk perbaikan sistem ticketing yang perlu diselesaikan oleh 2 Frontend Dev + 2 Backend Dev

---

## 👥 FRONTEND - Person 1 (Admin Dashboard & Analytics)

### A. Event Management UI dengan Detail Preview
**Status:** Not Started | **Priority:** HIGH | **Est. Time:** 20 jam

#### Task A1: Event CRUD dengan Detail Preview
- [ ] Update AdminEventsPage untuk menampilkan:
  - Event detail modal dengan edit form
  - Live preview poster image (bukan banner)
  - Time range picker (start date - end date)
  - Validasi: Jangan bisa delete jika ada tiket yang sudah order
- [ ] Tambahkan:
  - Poster image upload dengan preview real-time
  - Validasi: File harus image (jpg/png), max size 2MB
  - Display event status (Active/Inactive/Past)

#### Task A2: Event Performance Analytics Dashboard
- [ ] Create new page: `/admin/analytics`
- [ ] Dashboard dengan metrik:
  - Perbandingan performa antar event (line chart)
  - Revenue per event (bar chart)
  - Tickets sold vs available (pie chart)
  - Trending events (top 5)
- [ ] Filter options:
  - Date range selector
  - Event selector (compare multiple)
  - View mode (detail/summary)

#### Task A3: Advanced Reporting & Export
- [ ] Create new page: `/admin/reports`
- [ ] Report builder dengan opsi:
  - Transaction report (filtered by event + date range)
  - Daily revenue report
  - Event-wise profit breakdown
  - Refund/cancellation report
- [ ] Export functionality:
  - Generate PDF dengan charts & tables
  - Custom date range export
  - Event-wise category export
  - Email export option

**Deadline:** Day 5

---

## 👥 FRONTEND - Person 2 (User Experience & Checkout)

### B. Profile Auto-Complete & Payment Gateway UI
**Status:** Not Started | **Priority:** HIGH | **Est. Time:** 18 jam

#### Task B1: Smart Profile Auto-Complete untuk Ticket Purchase
- [ ] Update CheckoutPage:
  - Pre-fill buyer info dari profile (nama, email, phone)
  - Untuk multiple tickets: bisa assign ke buyer sendiri atau assign individual
  - Smart validation: Tidak memerlukan NIK
  - Passenger form untuk setiap tiket (jika berbeda dengan buyer)
- [ ] Local storage untuk remember last used data
- [ ] Form validation dengan helpful error messages

#### Task B2: Midtrans Payment Gateway UI
- [ ] Integrate Midtrans sandbox environment:
  - Tampilkan payment method options (kartu kredit, e-wallet, bank transfer)
  - Implement Snap widget integration
  - Mobile-responsive payment UI
  - Payment status indicator (pending/success/failed)
- [ ] Create payment confirmation page dengan order summary
- [ ] Implement polling untuk check payment status

#### Task B3: User-Friendly Admin Dashboard UI
- [ ] Redesign AdminLayout untuk mirror user dashboard:
  - Sidebar dengan modern styling
  - Quick stats cards (pending orders, revenue, active events)
  - User-facing admin menus: Events, Transactions, Users, Reports
  - Mobile-responsive design
  - Dark theme consistency
- [ ] Add Organizer role UI support:
  - Organizer specific menu items
  - Organizer dashboard view

**Deadline:** Day 5

---

## 🔧 BACKEND - Person 1 (Event Management & Registration)

### C. Event Backend, Registration Logic & Notifications
**Status:** Not Started | **Priority:** HIGH | **Est. Time:** 18 jam

#### Task C1: Enhanced Event Model & Validation
- [ ] Update Event migration:
  - Add `starts_at` (datetime) dan `ends_at` (datetime)
  - Add `poster_url` field (varchar 255)
  - Remove/deprecate `banner_url` bila ada
  - Add `is_active` boolean
- [ ] Update EventController:
  - Validate: Cannot delete event if tickets already ordered
  - Add check: `SELECT COUNT(*) FROM tickets WHERE event_id = ?`
  - Return event detail dengan full info (termasuk pending orders count)
  - Add timestamp validation: `ends_at` > `starts_at`

#### Task C2: Smart User Registration & Role Management
- [ ] Update AuthController:
  - Auto-create first user as ADMIN role
  - Validate: Jika role admin sudah exist → create as USER role instead
  - Add logic di register endpoint untuk auto role assignment
  - Send welcome notification/email
- [ ] Create registration state check:
  - Check `COUNT(*) FROM users WHERE role = 'admin'` 
  - If 0 → auto admin, else → user

#### Task C3: Notification System for Admin Actions
- [ ] Update NotificationController:
  - Add method `notifyAdminOnEventCreate()` 
  - Auto create notification ketika:
    - Event baru dibuat
    - Large order (>10 tickets) created
    - Payment successful
    - New user registered
- [ ] Create admin notification preferences (later enhancement)
- [ ] Add queue job untuk send notification async

**Deadline:** Day 5

---

## 🔧 BACKEND - Person 2 (Payment, Email & Analytics)

### D. Midtrans Integration, Email System & Analytics
**Status:** Not Started | **Priority:** HIGH | **Est. Time:** 20 jam

#### Task D1: Midtrans Payment Gateway Integration
- [ ] Install midtrans/midtrans-php package
- [ ] Create PaymentController:
  - Method `initiateMidtransPayment()`:
    - Create Snap transaction
    - Return redirect URL / token
    - Store transaction ID
  - Method `handleMidtransCallback()`:
    - Verify signature
    - Update order status berdasarkan payment status
    - Auto-update ticket status jika payment success
- [ ] Create .env config:
  - `MIDTRANS_SERVER_KEY`
  - `MIDTRANS_CLIENT_KEY`
  - `MIDTRANS_ENV=sandbox` (development)
- [ ] Handle 3 payment scenarios:
  - Success → Update order, generate ticket, trigger email
  - Pending → Show waiting message
  - Failed → Release reserved seats, show retry option

#### Task D2: Ticket & QR Code Email System
- [ ] Create TicketMailer:
  - Generate QR code dari ticket ID
  - Create email template dengan:
    - Event details
    - Ticket info (section, seat, tier)
    - QR code image
    - Download PDF button
  - Send to buyer email
- [ ] Create QrCodeGenerator helper:
  - Use `simple-qrcode` package
  - Generate dengan encryption
  - Store QR path di ticket
- [ ] Create email job:
  - Queue-based sending (tidak blocking checkout)
  - Retry logic jika email gagal
  - Log semua email sent

#### Task D3: Event Performance Analytics Backend
- [ ] Create AnalyticsController:
  - Method `getEventComparison()`:
    - Compare revenue, tickets sold, refund rate antar event
    - Return dengan trend data
  - Method `getRevenueAnalytics()`:
    - Total revenue per event
    - Daily revenue breakdown
    - Payment method breakdown
  - Method `getTransactionMetrics()`:
    - Filter by event + date range
    - Aggregate data (count, sum, avg)
- [ ] Create queries dengan proper indexing:
  - Index on `(event_id, created_at)`
  - Index on `(order_id, status)`
  - Optimize JOIN untuk large datasets
- [ ] Add caching untuk analytics (Redis):
  - Cache 24 jam untuk reports
  - Clear cache saat ada new transaction

#### Task D4: PDF Export & Reporting
- [ ] Install `barryvdh/laravel-dompdf` package
- [ ] Create ReportController:
  - Method `generateTransactionReport()`:
    - Filter by date range + event
    - Generate PDF dengan tabel
    - Include summary stats
  - Method `generateRevenueReport()`:
    - Daily breakdown
    - Category breakdown (by ticket type)
  - Method `generateDetailedAnalytics()`:
    - Comparison reports
    - Trend analysis
- [ ] Create PDF templates:
  - Header dengan branding
  - Dynamic content insertion
  - Charts integration (maybe html2canvas)
- [ ] Email reports:
  - Generate on-demand
  - Attach PDF ke email admin

**Deadline:** Day 5

---

## 🏗️ INFRASTRUCTURE & SETUP

### Backend Setup (Person 1 or 2)
```bash
# Install packages
composer require midtrans/midtrans-php
composer require simple-qrcode
composer require barryvdh/laravel-dompdf

# Run migrations
php artisan migrate

# Create jobs
php artisan make:job SendTicketEmail
php artisan make:job NotifyAdminAction
```

### Frontend Setup
```bash
# Install packages
npm install html2canvas jspdf  # For PDF export
npm install recharts            # For analytics charts
npm install date-fns            # Date range handling
```

---

## 📅 TIMELINE

| Phase | Days | Deliverable |
|-------|------|-------------|
| **Setup & Planning** | Day 1 | Database migrations, package installation |
| **Core Features** | Day 2-4 | Main functionality (payment, email, registration) |
| **UI/Polish** | Day 5 | Analytics dashboard, admin UI redesign |
| **Testing & Bug Fix** | Day 6 | QA testing, integration testing |
| **Deployment** | Day 7 | Staging deployment, documentation |

---

## ✅ DAILY STANDUP CHECKLIST

### Day 1 - Setup
- [ ] Frontend: Create page components skeleton
- [ ] Backend: Run migrations, install packages
- [ ] Together: Database review, API endpoint planning

### Day 2 - Core Development Begins
- **Frontend 1**: Event CRUD UI
- **Frontend 2**: Profile auto-complete form
- **Backend 1**: Event model update + registration logic
- **Backend 2**: Midtrans integration start

### Day 3 - Mid-Development
- **Frontend 1**: Analytics dashboard chart setup
- **Frontend 2**: Midtrans payment UI integration
- **Backend 1**: Admin notification system
- **Backend 2**: Email system + QR generation

### Day 4 - Feature Completion
- **Frontend 1**: PDF export UI + reporting page
- **Frontend 2**: Admin dashboard UI redesign
- **Backend 1**: Organizer role implementation
- **Backend 2**: PDF generation + analytics optimization

### Day 5 - Polish & Refinement
- **Frontend 1 & 2**: UI consistency, responsive fixes
- **Backend 1 & 2**: API optimization, error handling
- **All**: Integration testing, bug fixes

### Day 6 - Full Testing
- All: End-to-end testing
- QA: Bug report & fixes
- Documentation update

---

## 🔗 KEY API ENDPOINTS TO CREATE

### Backend Person 1
```
PUT    /api/events/{id}              - Update event dengan time range
POST   /api/events/{id}/poster       - Upload poster
DELETE /api/events/{id}              - Delete dengan validation
GET    /api/auth/check-role          - Check admin exist
POST   /api/auth/register            - Smart registration
GET    /api/admin/notifications      - Get admin notifications
```

### Backend Person 2
```
POST   /api/payment/initiate         - Start Midtrans payment
POST   /api/payment/callback         - Midtrans webhook
GET    /api/analytics/comparison     - Compare events
GET    /api/analytics/revenue        - Revenue analytics
GET    /api/reports/transactions     - Generate transaction report
POST   /api/reports/export-pdf       - Export to PDF
```

---

## 🎯 SUCCESS CRITERIA

✅ Event CRUD dengan semua data + validation  
✅ First user = admin, subsequent = user  
✅ Payment gateway fully integrated + tested  
✅ QR + ticket dikirim ke email  
✅ Analytics dashboard working dengan proper charts  
✅ PDF export multiple format  
✅ Admin UI mirip user + organizer role  
✅ All validation & error handling  
✅ Mobile responsive design  
✅ Performance optimized (caching, indexing)  

---

## 📝 NOTES

- Koordinasi Frontend & Backend untuk API contract definition
- Test Midtrans di sandbox environment dulu
- Gunakan Laravel Queue untuk email & notification (async)
- Implement proper error logging untuk debugging
- Create comprehensive test cases
- Documentation untuk payment flow & admin features
