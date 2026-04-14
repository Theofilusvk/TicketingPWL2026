# Queue & Waiting List + Venue Mapping Implementation Guide

## Overview
Implementasi sistem queue/waiting list dan venue mapping interaktif untuk aplikasi ticketing VORTEX.

---

## Database Setup

### 1. Run Migrations
```bash
cd PWL26
php artisan migrate
```

Migrations yang dijalankan:
- `2026_04_14_000001_add_venue_map_to_events_table` - Add venue fields to events
- `2026_04_14_000002_create_venue_sections_table` - Create sections table
- `2026_04_14_000003_create_ticket_transfers_table` - Track ticket transfers
- `2026_04_14_000004_add_queue_fields_to_waiting_list_table` - Add queue position
- `2026_04_14_000005_add_section_id_to_tickets_table` - Link tickets to sections

---

## Backend Setup (Laravel)

### 1. Service Class
File: `app/Services/TicketingService.php`

**Key Methods:**
```php
// Auto-process waiting list when ticket becomes available
$service->processWaitingList($event);

// Add user to waiting list
$service->addToWaitingList($userId, $eventId, $ticketTypeId, $preferredPrice);

// Create transfer offer (48 hour default)
$service->createTransferOffer($ticket, $fromUserId, $toUserId, $price);

// Accept/reject transfers
$service->acceptTransfer($transfer);
$service->rejectTransfer($transfer, $reason);

// Cancel ticket (triggers waiting list processing)
$service->cancelTicket($ticket, $userId, $reason);
```

### 2. Controllers

#### VenueSectionController
- `byEvent($event)` - List sections for event
- `store()` - Create new section
- `update()` - Update section details
- `destroy()` - Delete section
- `getVenueMap($event)` - Get venue data with occupancy

#### TicketTransferController
- `myTransfers()` - User's transfers (sent & received)
- `pendingTransfers()` - Awaiting user's decision
- `createTransfer()` - Initiate transfer
- `acceptTransfer()` - Accept incoming transfer
- `rejectTransfer()` - Reject with reason
- `cancelTicket()` - Owner cancels ticket

#### WaitingListController
- `myWaitingList()` - User's waiting list entries
- `joinWaitingList()` - Add to queue
- `leaveWaitingList()` - Remove from queue
- `byEvent($event)` - View event queue status

### 3. Models & Relationships

```php
// Event model
$event->venueSections();  // Get all sections
$event->waitingLists();   // Get queue
$event->isSoldOut();      // Boolean
$event->available_capacity; // Remaining slots

// Ticket model
$ticket->section;         // Venue section
$ticket->transfers;       // Transfer history

// User model
$user->ticketTransfersOut;  // Transfers user sent
$user->ticketTransfersIn;   // Transfers user received
$user->waitingLists;        // Queue entries
```

### 4. API Endpoints

**Public Endpoints:**
```
GET /api/events/{event}/venue-map
```

**User Authenticated:**
```
GET    /api/waiting-list/my
POST   /api/waiting-list/join
POST   /api/waiting-list/leave
GET    /api/ticket-transfers/my
GET    /api/ticket-transfers/pending
POST   /api/ticket-transfers/create
POST   /api/ticket-transfers/{id}/accept
POST   /api/ticket-transfers/{id}/reject
POST   /api/tickets/{ticket}/cancel
```

**Admin/Organizer:**
```
GET    /api/events/{event}/sections
POST   /api/venue-sections
PUT    /api/venue-sections/{section}
DELETE /api/venue-sections/{section}
GET    /api/events/{event}/waiting-list
GET    /api/ticket-transfers
GET    /api/ticket-transfers/{transfer}
```

---

## Frontend Setup (React)

### 1. New Components

#### VenueMapDisplay
Displays venue sections with real-time occupancy analytics.

```tsx
import { VenueMapDisplay } from '../components/VenueMapDisplay'

<VenueMapDisplay />  // Auto-fetches current event from useParams
```

Features:
- Color-coded occupancy (0-50% green, 50-75% blue, 75-99% yellow, 100% red)
- Real-time sold ticket count per section
- Available slots calculation
- Price display per section
- Legend for status interpretation

#### WaitingListDisplay
Shows user's waiting list entries with queue position.

```tsx
import { WaitingListDisplay } from '../components/WaitingListDisplay'

<WaitingListDisplay />
```

Features:
- Queue position indicator
- Status tracking (waiting/converted/expired)
- Leave waiting list functionality
- Auto-refresh when converted to order

#### TicketTransferManager
Manage incoming and outgoing ticket transfers.

```tsx
import { TicketTransferManager } from '../components/TicketTransferManager'

<TicketTransferManager />
```

Features:
- Separate tabs for incoming/outgoing transfers
- Accept/reject transfers with expiry countdown
- Transfer price tracking
- Transfer reason display

#### VenueSectionForm & VenueSectionManager
Admin forms for creating/editing venue sections.

```tsx
import { VenueSectionManager } from '../components/VenueSectionManager'

<VenueSectionManager eventId={eventId} />
```

### 2. New Pages

#### MyEventsPage
Centralized hub for user's event-related activities.

```tsx
import { MyEventsPage } from '../pages/MyEventsPage'

// Route: /my-events
```

Tabs:
1. **My Tickets** - List all user's tickets with QR codes and check-in status
2. **Waiting List** - Show queue position and status
3. **Transfers** - Manage incoming/outgoing ticket transfers

### 3. Integration Points

**EventDetailPage:**
- Removed: Live chat link
- Added: VenueMapDisplay component to show real-time venue occupancy
- Impact: Users can see section availability before purchasing

**App.tsx Routes:**
- Added: `<Route path="/my-events" element={<RequireAuth><MyEventsPage /></RequireAuth>} />`

---

## User Workflows

### Workflow 1: Buy Ticket (Normal)
1. User browses event at `/events/{id}`
2. Sees VenueMapDisplay with available sections
3. Clicks "GET ACCESS" → reserve page
4. Checkout → Payment
5. Ticket appears in `/my-events` "My Tickets" tab

### Workflow 2: Queue When Sold Out
1. Event reaches max capacity (event.total_sold >= event.venue_capacity)
2. "GET ACCESS" button becomes "JOIN WAITING LIST"
3. User clicks, gets added to queue with position
4. Appears in `/my-events` "Waiting List" tab
5. When ticket cancelled/transferred, waiting list auto-processes
6. User receives notification and order created automatically

### Workflow 3: Transfer Ticket
1. User goes to `/my-events` "Transfers" tab
2. Clicks ticket → "Transfer / Cancel" button
3. Options:
   - Transfer to friend → enter destination user ID + optional price
   - Cancel ticket → triggers waiting list processing
4. If transfer:
   - Recipient gets notification in "Transfers" tab
   - 48 hour expiry timer starts
   - Recipient can accept/reject
5. On accept, ticket transferred to new owner

### Workflow 4: Admin Create Event with Venue Sections
1. Admin goes to `/admin/events`
2. Creates new event
3. Clicks "Edit Sections" → VenueSectionManager shows
4. Clicks "Add Section"
5. Form pops up with:
   - Section name (e.g., VIP_WEST, GEN_ALPHA)
   - Capacity (e.g., 100)
   - Price (e.g., $150)
6. Click "Save Section"
7. Repeat for each section
8. Total capacity auto-calculated and displayed

---

## Data Flow Diagrams

### Ticket Purchase → Waiting List → Auto-Conversion
```
User attempts purchase
    ↓
Event sold out? YES → Add to waiting_list
                        ↓
                        User in queue
                        ↓
Other user cancels ticket
                        ↓
TicketingService.processWaitingList()
                        ↓
Auto-create Order + Ticket for next in queue
                        ↓
Update waiting_list status to "converted"
                        ↓
User notified
```

### Ticket Transfer Flow
```
Ticket Owner initiates transfer
    ↓
Create TicketTransfer record → status: "pending"
    ↓
Set expires_at = now + 48 hours
    ↓
Recipient gets notification
    ↓
Recipient accepts?
    YES → Transfer status: "completed"
            Update ticket.order_item_id
            Final status: "active"
            Reject other pending offers
    NO  → Transfer status: "rejected"
```

---

## Performance Considerations

### Database Indexes
Auto-created by migrations:
- `venue_sections.event_id` (foreign key)
- `waiting_list.event_id, user_id, ticket_type_id` (unique constraint)
- `ticket_transfers.ticket_id, from_user_id, to_user_id`

### Query Optimization
- VenueMapDisplay loads once per event view
- WaitingListDisplay queries only user's entries
- TicketTransferManager uses two parallel queries (incoming/outgoing)

### Caching Recommendations (Future)
- Cache venue map data (invalidate on section update)
- Cache event capacity status (invalidate on order/cancellation)
- Cache waiting list queue position (invalidate on processing)

---

## Common Issues & Solutions

### Issue: Waiting list not auto-converting
**Solution:** Ensure `TicketingService.processWaitingList()` is called:
- On ticket cancellation
- After payment confirmation
- Manual trigger via admin command (if needed)

```php
// Example: Add to OrderController after order confirmation
event(new OrderCompleted($order));

// In listener, update section sold count and process waiting list
```

### Issue: Transfer expires but not auto-rejected
**Solution:** Add a scheduled task to clean up expired transfers:

```php
// In Console/Kernel.php
$schedule->command('transfers:cleanup-expired')->hourly();
```

### Issue: Venue sections not synced with capacity
**Solution:** Ensure sections are created before selling tickets. Total capacity must be set:

```php
// In Event model
public function boot()
{
    static::updating(function ($event) {
        if ($event->venueSections()->exists()) {
            $event->venue_capacity = $event->venueSections()->sum('capacity');
        }
    });
}
```

---

## Testing

### Test Cases to Implement

1. **Waiting List Tests**
   - User joins queue when event full
   - Queue position calculated correctly
   - User removed from queue on leaving
   - Auto-convert triggers and creates order

2. **Transfer Tests**
   - Transfer created with correct data
   - Transfer expires after 48 hours
   - Accept transfer updates ticket owner
   - Reject removes pending transfer
   - Multiple transfers on same ticket handled

3. **Venue Section Tests**
   - Sections created with correct capacity
   - Sold count increments on purchase
   - Occupancy percentage calculated correctly
   - Sections deleted only if no sold tickets

---

## Deployment Checklist

- [ ] Run migrations: `php artisan migrate`
- [ ] Verify API endpoints working
- [ ] Test waiting list queue on test environment
- [ ] Test transfer workflow end-to-end
- [ ] Test venue sections display
- [ ] Verify no regression in existing ticketing
- [ ] Clear route cache: `php artisan route:clear`
- [ ] Clear config cache: `php artisan config:clear`

---

## Notes for Future Enhancement

1. **Ticket Marketplace**: Implement secondary market for tickets
2. **Dynamic Pricing**: Adjust section prices based on demand
3. **Queue Priority**: VIP members get higher position
4. **Waitlist Notifications**: Email/SMS when position reached
5. **Refund Integration**: Integrate refunds (currently disabled)
6. **Analytics Dashboard**: Real-time sales data per section
