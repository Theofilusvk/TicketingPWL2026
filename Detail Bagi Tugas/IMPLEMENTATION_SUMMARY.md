# Ticketing PWL2026 - Queue & Merchandise Implementation Summary

## Overview
Implemented a complete queue system for ticket purchases and instant merchandise checkout with automatic stock management.

## Changes Made

### 1. Queue System for Tickets ✅
**File**: `vortex-web/src/pages/CheckoutPage.tsx`
- Added logic to **only show LiveQueue for tickets** (items with `ticketId`)
- Merchandise checkout automatically skips the queue by setting `queuePassed = true`
- Conditional rendering: `{isTicketCheckout && !queuePassed && <LiveQueue ... />}`

**Key Logic**:
```typescript
const isTicketCheckout = checkoutItems.every(item => item.ticketId && item.eventId)
const isMerchandiseCheckout = checkoutItems.every(item => item.image && !item.ticketId)

// Skip queue for merchandise
useEffect(() => {
  if (isMerchandiseCheckout) {
    setQueuePassed(true)
  }
}, [isMerchandiseCheckout])
```

### 2. Instant Merchandise Checkout ✅
**File**: `PWL26/app/Http/Controllers/Api/MerchandiseOrderController.php` (NEW)
- Created brand new controller for merchandise orders
- **No queue** - merches go straight to payment
- **Instant stock decrease** using database transactions and locks
- Supports lookup by both `merch_id` and product `title`
- Two endpoints:
  - `POST /api/merchandise/calculate` - Calculate total with fees
  - `POST /api/merchandise/process` - Process instant payment

**Key Features**:
- Database locks (`lockForUpdate()`) prevent race conditions
- Stock immediately decreased on order
- Payment marked as 'paid' instantly
- Lower service fee: $5.00 (vs $12.50 for tickets)
- Credits earned: 10% of subtotal

### 3. Frontend Merchandise Checkout ✅
**File**: `vortex-web/src/pages/CheckoutPage.tsx`
- Separate payment flow for merchandise
- Sends items with product title for backend lookup
- Proper error handling and user feedback
- Push notifications for merchandise orders
- No visible queue for merchandise users

### 4. Database Models ✅
**Files Created**:
- `PWL26/app/Models/Merchandise.php` - Merchandise model
- `PWL26/app/Models/MerchandiseOrder.php` - Merchandise order model

### 5. API Routes ✅
**File**: `PWL26/routes/api.php`
```php
Route::post('merchandise/calculate', [MerchandiseOrderController::class, 'calculate']);
Route::post('merchandise/process', [MerchandiseOrderController::class, 'process']); // Authenticated
```

### 6. Database Seeding ✅
**File**: `PWL26/database/seeders/DatabaseSeeder.php`
- Updated merchandise seeder with 3 products:
  1. HOLO VER 3.0 JACKET ($150, 48 stock, LEGENDARY)
  2. LED SOUND RESPONSIVE MASK ($50, 187 stock, EPIC)
  3. AR SYNTH SHADES ($25, 500 stock, RARE)
- All products have PHYSICAL category and AVAILABLE status

## Payment Flow Differences

### TICKETS (WITH QUEUE) 🎟️
1. User enters checkout
2. **VORTEX_QUEUE shows** with position counting down (8-12 seconds)
3. User selects payment method (QRIS, CARD, E-WALLET, CRYPTO)
4. POST to `/api/checkout/process`
5. Order created with status: 'paid'
6. Virtual tickets generated and returned
7. Redirect to success page with tickets

### MERCHANDISE (INSTANT) 📦
1. User enters checkout
2. **NO QUEUE** - shown immediately
3. User selects payment method
4. POST to `/api/merchandise/process` with product titles
5. Backend looks up merchandise by title
6. Stock decreased immediately (transactional)
7. Merchandise order created with status: 'paid'
8. Redirect to success page with order confirmation

## Validation & Error Handling
Both endpoints validate:
- Items array required and not empty
- Product exists (ticket_type_id or merch_id/title)
- Sufficient stock available
- Valid quantity (min 1)
- Proper transaction rollback on errors

## Key Differences from Tickets

| Feature | Tickets | Merchandise |
|---------|---------|-------------|
| Queue | ✅ YES (8-12 sec) | ❌ NO |
| Stock Management | ✓ Decreased per tab | ✓ Decreased instantly |
| Service Fee | $12.50 | $5.00 |
| Payment Method | All 4 options | All 4 options |
| Order Type | events-based | merchandise-based |
| Stock Lock | During transaction | During transaction |

## Testing Checklist
- [x] Queue shows only for tickets
- [x] Merchandise skips queue automatically
- [x] Merchandise stock decreases on purchase
- [x] Payment processing works for both types
- [x] Error handling for insufficient stock
- [x] Product lookup by title works
- [x] Transaction rollback on failure
- [x] Credits earned correctly (10% of subtotal)
- [x] Notifications sent appropriately
- [x] Seeded merchandise matches store defaults

## Frontend Components Affected
1. **CheckoutPage.tsx** - Main checkout logic, handles both flows
2. **LiveQueue.tsx** - Only shown for ticket checkouts (no changes needed)
3. **CartPage.tsx** - Item separation already working

## Backend Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/checkout/calculate` | Calculate ticket checkout totals |
| POST | `/api/checkout/process` | Process ticket purchase with queue |
| POST | `/api/merchandise/calculate` | Calculate merchandise totals |
| POST | `/api/merchandise/process` | Process instant merchandise purchase |

## Next Steps (Optional)
- Add merchandise tracking/shipment updates
- Implement merchandise category filtering
- Add inventory management dashboard
- Create merchandise return/refund flow
- Add merchandise recommendations based on user tier
