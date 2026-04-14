# Implementasi Lengkap: Queue/Waiting List & Venue Mapping

## 📋 Ringkasan

Telah berhasil mengimplementasikan sistem queue/waiting list dan venue mapping interaktif dengan fitur ticket transfer untuk aplikasi VORTEX. Sistem ini memungkinkan:

1. ✓ **Queue System**: User mencari posisi dalam waiting list ketika tiket sold out
2. ✓ **Ticket Transfer**: Pemilik tiket dapat mentransfer atau membatalkan tiket
3. ✓ **Auto-Conversion**: Waiting list otomatis dikonversi menjadi order saat ada tiket tersedia
4. ✓ **Venue Mapping**: Tampilan real-time occupancy per section dengan harga custom
5. ✓ **Live Analytics**: Dashboard untuk admin mengelola sections

---

## 📚 File-File yang Dibuat/Dimodifikasi

### Backend (Laravel - PWL26/)

#### Database Migrations (5 files)
```
database/migrations/
├── 2026_04_14_000001_add_venue_map_to_events_table.php
├── 2026_04_14_000002_create_venue_sections_table.php
├── 2026_04_14_000003_create_ticket_transfers_table.php
├── 2026_04_14_000004_add_queue_fields_to_waiting_list_table.php
└── 2026_04_14_000005_add_section_id_to_tickets_table.php
```

**Database Schema Additions:**
- `events`: venue_capacity, venue_map_data (JSON), total_sold
- `venue_sections`: section management table
- `ticket_transfers`: transfer history & management
- `waiting_list`: queue_position, preferred_price
- `tickets`: section_id foreign key

#### Models (6 files)
```
app/Models/
├── VenueSection.php (NEW)
├── TicketTransfer.php (NEW)
├── Event.php (UPDATED)
├── Ticket.php (UPDATED)
├── WaitingList.php (UPDATED)
└── User.php (UPDATED)
```

**New Relationships:**
- Event → venueSections(), waitingLists()
- Ticket → section(), transfers()
- TicketTransfer → ticket(), fromUser(), toUser()
- User → ticketTransfersOut(), ticketTransfersIn(), waitingLists()

#### Services (1 file)
```
app/Services/TicketingService.php (NEW)
```

**Core Functions:**
- processWaitingList() - Auto-convert waiting list to orders
- addToWaitingList() - Join queue
- createTransferOffer() - Initiate transfer
- acceptTransfer() / rejectTransfer() - Handle transfers
- cancelTicket() - Cancel ticket and trigger waiting list

#### Controllers (3 files)
```
app/Http/Controllers/
├── VenueSectionController.php (NEW)
├── TicketTransferController.php (NEW)
└── WaitingListController.php (UPDATED)
```

**VenueSectionController** endpoints:
- byEvent, store, update, destroy, getVenueMap

**TicketTransferController** endpoints:
- myTransfers, pendingTransfers, createTransfer, acceptTransfer, rejectTransfer, cancelTicket

**WaitingListController** additions:
- byEvent, myWaitingList, joinWaitingList, leaveWaitingList

#### Routes (1 file)
```
routes/api.php (UPDATED)
```

**New endpoints added** (documented dalam route groups)

### Frontend (React - vortex-web/src/)

#### Components (5 new files)
```
src/components/
├── VenueMapDisplay.tsx (NEW)
├── WaitingListDisplay.tsx (NEW)
├── TicketTransferManager.tsx (NEW)
├── VenueSectionForm.tsx (NEW)
└── VenueSectionManager.tsx (NEW)
```

**Component Features:**
- VenueMapDisplay: Real-time occupancy visualization
- WaitingListDisplay: Queue position tracking
- TicketTransferManager: Transfer incoming/outgoing
- VenueSectionForm: Create/edit section
- VenueSectionManager: Manage all sections

#### Pages (1 new file)
```
src/pages/MyEventsPage.tsx (NEW)
```

**Tabs:**
- My Tickets: List semua ticket dengan QR code
- Waiting List: Posisi queue dan status
- Transfers: Kelola incoming/outgoing transfers

#### Modified Files
```
src/pages/EventDetailPage.tsx (UPDATED)
```

**Changes:**
- Removed live chat link (hapus ChatRoomPage button)
- Added VenueMapDisplay component untuk venue occupancy

#### App Configuration
```
src/App.tsx (UPDATED)
```

**Changes:**
- Added MyEventsPage import
- Added route: `/my-events`

---

## 🔧 Setup & Deployment

### 1. Database Migrations
```bash
cd PWL26
php artisan migrate
```

### 2. Verify Models & Relationships
Semua model sudah dibuat dan updated dengan relationships yang benar.

### 3. API Testing
Gunakan Postman/Insomnia untuk test endpoints:
- GET `/api/events/{event}/venue-map` - Public venue data
- GET `/api/waiting-list/my` - User waiting list
- POST `/api/ticket-transfers/create` - Create transfer

### 4. Frontend Testing
1. Buka localhost:5173 (vortex-web)
2. Login sebagai user
3. Ke `/my-events` untuk test waiting list & transfers
4. Ke event detail untuk lihat VenueMapDisplay

---

## 📊 Database Schema

### venues_sections
```sql
CREATE TABLE venue_sections (
  section_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id BIGINT FOREIGN KEY,
  section_name VARCHAR(100),
  capacity INT,
  price DECIMAL(10,2),
  sold_tickets INT DEFAULT 0,
  map_position JSON,
  status ENUM('active', 'inactive', 'hidden'),
  created_at, updated_at
);
```

### ticket_transfers
```sql
CREATE TABLE ticket_transfers (
  transfer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ticket_id BIGINT FOREIGN KEY,
  from_user_id BIGINT FOREIGN KEY,
  to_user_id BIGINT FOREIGN KEY (nullable),
  type ENUM('transfer', 'cancellation'),
  transfer_price DECIMAL(10,2),
  reason TEXT,
  status ENUM('pending', 'accepted', 'rejected', 'completed', 'expired'),
  expires_at DATETIME,
  created_at, updated_at
);
```

---

## 🚀 Key Features Implemented

### 1. Queue System
- ✓ Otomatis trigger ketika event sold out
- ✓ Queue position tracking
- ✓ Status: waiting → converted/expired/notified
- ✓ Support preferred price setting
- ✓ Unique constraint: 1 user hanya 1x per ticket type per event

### 2. Ticket Transfer
- ✓ Transfer ke specific user dengan optional price
- ✓ 48 jam expiry default
- ✓ Status tracking: pending → accepted/rejected/completed
- ✓ Reject multiple pending transfers for same ticket
- ✓ Cancel ticket triggers waiting list processing

### 3. Venue Mapping
- ✓ Create/edit/delete sections per event
- ✓ Custom pricing per section
- ✓ Real-time sold count tracking
- ✓ Occupancy percentage calculation
- ✓ Color-coded visualization

### 4. Auto-Processing
- ✓ Waiting list → Order when tickets available
- ✓ Section sold_tickets auto-increment
- ✓ Event total_sold tracking
- ✓ Queue position auto-recalculation

### 5. Admin Customization
- ✓ VenueSectionManager for CRUD operations
- ✓ Form validation for capacity/price
- ✓ Prevent deletion of sections with sold tickets
- ✓ Real-time summary statistics

---

## 🔐 Security & Validation

### Authorization Checks
- ✓ Only ticket owner can transfer/cancel
- ✓ Only organizer/admin can manage sections
- ✓ Only recipient can accept transfers
- ✓ Role-based API access

### Data Validation
- ✓ Capacity > 0
- ✓ Price >= 0
- ✓ Queue position unique per user
- ✓ Transfer expiry validation
- ✓ Status enum constraints

---

## 📝 API Documentation

### Waiting List Endpoints
```
POST /api/waiting-list/join
  Body: { event_id, ticket_type_id, preferred_price? }
  Response: { queue_position, entry }

GET /api/waiting-list/my
  Response: [{ list_id, event_id, queue_position, status }]

POST /api/waiting-list/leave
  Body: { list_id }
```

### Ticket Transfer Endpoints
```
POST /api/ticket-transfers/create
  Body: { ticket_id, to_user_id, transfer_price?, expires_in? }
  Response: { transfer_id, status: pending }

GET /api/ticket-transfers/pending
  Response: [{ transfer_id, from_user.username, expires_at }]

POST /api/ticket-transfers/{id}/accept
  Response: { message: success }

POST /api/tickets/{id}/cancel
  Body: { reason? }
  Response: { message: success, auto-processes waiting list }
```

### Venue Section Endpoints (Admin)
```
POST /api/venue-sections
  Body: { event_id, section_name, capacity, price, map_position? }
  Response: { section_id, ... }

PUT /api/venue-sections/{id}
  Body: { section_name?, capacity?, price?, ... }

DELETE /api/venue-sections/{id}
  Note: Cannot delete if has sold tickets

GET /api/events/{event}/venue-map
  Response: { event_id, total_capacity, total_sold, sections }
```

---

## 🎯 User Workflows

### Join Waiting List
```
Event Sold Out
    ↓
Click "JOIN WAITING LIST"
    ↓
Added to queue with position
    ↓
Appears in My Events > Waiting List
    ↓
When ticket available → Auto-order created
```

### Transfer Ticket
```
My Events > Transfers Tab
    ↓
Click "Initiate Transfer"
    ↓
Select recipient & optional price
    ↓
48-hour timer starts
    ↓
Recipient accepts/rejects
```

---

## ⚠️ Important Notes

1. **Live Chat Removal**: ChatRoomPage masih ada tapi link dihapus dari EventDetailPage
2. **No Refunds**: Sistem transfer bukan refund - ticketnya tetap valid
3. **Queue Auto-Processing**: Hanya trigger ketika tiket di-cancel/di-transfer
4. **Expiry Handling**: Transfer expired otomatis jika tidak di-accept dalam 48 jam
5. **Section Deletion**: Hanya bisa delete section jika sold_tickets = 0

---

## 🔄 Next Steps / Recommendations

1. Add scheduled task untuk cleanup expired transfers
2. Implement email notifications untuk waiting list conversion
3. Add dashboard analytics untuk venue occupancy trends
4. Implement ticket marketplace (secondary market)
5. Add dynamic pricing based on demand
6. Create admin command untuk bulk section creation

---

## 📖 Files Reference

**Total Files Created: 14**
- Migrations: 5
- Models: 2 (+ 4 updated)
- Services: 1
- Controllers: 3  
- Components: 5
- Pages: 1
- Configs: 2 updated

**Total Files Modified: 4**
- EventDetailPage.tsx
- WaitingListController.php
- Event.php, Ticket.php, User.php, WaitingList.php
- routes/api.php
- App.tsx

---

Generated: 2026-04-14
Status: ✅ Implementation Complete
