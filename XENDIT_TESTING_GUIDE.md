# 🧪 Xendit Payment Testing Guide

## Overview
Guide lengkap untuk testing Xendit payment integration di aplikasi Vortex Ticketing System.

---

## 📋 Configuration

### Backend Configuration (PWL26/.env)
```env
XENDIT_SECRET_KEY=xnd_development_vyZDNkzeQnFuG4kuXsEmRkIgRN9Nx87sLSP3s5GWDKes7hfIgdZyPixIx8xHYv
XENDIT_WEBHOOK_TOKEN=Hbo6tpcy5jSJYw4Xv2ykmMQN5eIHfiPUNJyMT5LmJoWBfh2q
```

### Testing URLs
- **Frontend**: `http://127.0.0.1:5173`
- **Backend API**: `http://127.0.0.1:8000/api`
- **Xendit Staging**: https://staging.xendit.co

---

## 🔄 Payment Flow Testing

### Step 1: Initiate Checkout
1. Navigate to `/reserve/{eventId}` 
2. Select ticket type and quantity
3. Click "PROCEED TO CHECKOUT"
4. Select payment method (CARD, E-WALLET, QRIS, CRYPTO)
5. Click "PAY NOW" button

### Step 2: Payment Creation
- Backend calls `POST /api/payment/checkout`
- Creates order with status: `pending`
- Generates Xendit invoice
- Returns invoice URL for redirect

**Backend Action**:
```php
POST /api/payment/checkout
{
  "items": [...],
  "payment_method": "CARD"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "invoice_url": "https://app.xendit.co/web/invoices/...",
    "order_id": "12345",
    "xendit_invoice_id": "inv_xxx"
  }
}
```

### Step 3: Xendit Payment Page
- Browser redirects to Xendit payment page
- Frontend shows "Processing payment..." message
- User enters payment details (test card)

### Step 4: Test Payment Methods

#### **Test Card (Credit/Debit)**
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
OTP: 123456 (when prompted)
```

#### **Test E-Wallet (GoPay)**
- Amount will show in test GoPay account
- Click confirm to simulate payment

#### **Test QRIS**
- Generate QRIS code
- Scan with test app or confirm manually
- Simulate payment completion

#### **Test Crypto**
- Use test wallet address
- Simulate transaction on blockchain

### Step 5: Payment Success (Webhook)
After successful payment, Xendit sends webhook:

**Webhook Endpoint**: `POST /api/payment/xendit-webhook`

**Webhook Payload**:
```json
{
  "id": "evt_xxx",
  "status": "PAID",
  "business_id": "xxx",
  "data": {
    "id": "inv_xxx",
    "external_id": "ORD-XXXXXXXXXX",
    "user_id": "user_xxx",
    "status": "PAID",
    "paid_at": "2026-04-16T10:30:00Z",
    "amount": 250.00
  }
}
```

**Backend Processing**:
1. ✅ Verify webhook token
2. ✅ Update order status → `paid`
3. ✅ Generate tickets with QR codes
4. ✅ Award loyalty credits (10% of total)
5. ✅ Create success notification
6. ✅ Dispatch SendTicketEmail job (async)

---

## 🧪 Frontend Testing Features

### Payment Status Indicator
On success page, you'll see:
- **Status Badge**: "PAYMENT_STATUS: ✓ PAID"
- **Payment Method**: Xendit
- **Order ID**: ORD-XXXXXXXXXX
- **Total Amount**: USD amount
- **Current Status**: PAID/PENDING

### Test Xendit Status Button
```
UI Location: Success Page → "TEST XENDIT STATUS" button
Purpose: Verify payment status with backend in real-time
```

**Testing Steps**:
1. After payment redirect to success page
2. Scroll down to payment info section
3. Click "Test Xendit Status" button
4. View connection status and payment details

**Expected Output**:
```
✓ Xendit Connection OK
Payment Status: PAID
Invoice ID: inv_xxx
Timestamp: HH:MM:SS AM/PM
```

### Email Delivery Testing

#### Automatic Email (on payment success)
- ✅ Email queued automatically after payment
- ✅ Dispatched via `SendTicketEmail` job
- ✅ Includes QR codes and ticket details
- ✅ Sent to user's registered email

#### Manual Email Resend
**UI Location**: Success Page → "SEND EMAIL" button

**Testing Steps**:
1. After payment completes
2. Click "SEND EMAIL" button (highlighted in blue)
3. Modal opens with current email
4. Edit email if needed
5. Click "Send Tickets"
6. Success notification appears

**Email Details**:
- **Subject**: "E-Ticket Konfirmasi - Vortex Systems"
- **Attachments**: 
  - E-Ticket_Vortex.pdf (with QR codes)
  - Ticket details and holder information
- **Retries**: 3 attempts if delivery fails

---

## 🔍 Debugging & Testing Tips

### 1. Check Polling Status
- Success page polls `/api/orders/{orderId}` every 3 seconds
- Stops when status changes to `paid`
- If stuck on "VERIFYING_TRANSACTION...", check backend logs

### 2. Verify Webhook Handling
```bash
# Check Laravel logs for webhook processing
tail -f PWL26/storage/logs/laravel.log | grep "webhook"
```

### 3. Test Email Job
```bash
# Queue:work to process SendTicketEmail job
php artisan queue:work
```

### 4. Manual Order Inspection
```bash
# From MySQL:
SELECT * FROM orders WHERE id = '12345';
SELECT * FROM payments WHERE order_id = '12345';
SELECT * FROM tickets WHERE order_id = '12345';
```

### 5. Test Different Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| **Successful Payment** | Complete payment with test card | Status = PAID, Tickets generated, Email queued |
| **Pending Payment** | Navigate to order directly (before webhook) | Status = PENDING, "Processing..." message |
| **Failed Payment** | Use invalid card or decline payment | Webhook not sent, Order remains pending |
| **Email Resend** | Complete payment, click "Send Email", enter email | Email sent to specified address |
| **Concurrent Orders** | Submit multiple orders rapidly | Stock locked per order, no overselling |

---

## 📊 Order Status Flow

```
┌─────────────────────────────────────────────────┐
│                 USER CHECKOUT                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Order Created       │
        │ Status: pending     │
        └────────┬────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Xendit Invoice      │
        │ User redirected     │
        └────────┬────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ✅ PAID          ❌ EXPIRED/FAILED
        │                 │
        ▼                 ▼
  ┌──────────────┐  ┌──────────────┐
  │ Webhook PAID │  │ Stock Restore │
  │ Generate     │  │ Order Fails   │
  │ Tickets      │  └──────────────┘
  │ Send Email   │
  └──────────────┘
```

---

## 🛠️ Common Issues & Solutions

### Issue 1: Payment Stuck on "Processing"
**Symptoms**: Success page shows "VERIFYING_TRANSACTION..." indefinitely

**Solutions**:
1. Check webhook logs: `tail -f storage/logs/laravel.log | grep webhook`
2. Verify `XENDIT_WEBHOOK_TOKEN` matches in `.env`
3. Check Xendit dashboard: https://dashboard.xendit.co/callbacks
4. Manually test webhook: Use Postman to POST to `/api/payment/xendit-webhook`

### Issue 2: Email Not Sent
**Symptoms**: Order marked as paid but no email received

**Solutions**:
1. Check queue:work is running: `php artisan queue:work`
2. Check job logs: `tail -f storage/logs/laravel.log | grep SendTicket`
3. Verify email configuration in `.env`
4. Check spam folder
5. Manually trigger email: `POST /api/orders/{id}/send-email` with custom email

### Issue 3: Invoice URL Not Generated
**Symptoms**: Checkout fails with "Failed to create Xendit invoice"

**Solutions**:
1. Verify `XENDIT_SECRET_KEY` is correct
2. Check Xendit API status: https://status.xendit.co
3. Verify order total is > 0
4. Check backend error logs for full error message

### Issue 4: Stock Not Reserved
**Symptoms**: Multiple users can buy same ticket

**Solutions**:
1. Verify `lockForUpdate()` in checkout logic
2. Check database transaction handling
3. Ensure `stock` column updated atomically

---

## 📱 Testing Checklist

- [ ] Test successful payment with CARD
- [ ] Test successful payment with E-WALLET
- [ ] Test payment status display on success page
- [ ] Test email automatic delivery
- [ ] Test manual email resend
- [ ] Test Xendit status button
- [ ] Test PDF download
- [ ] Test ticket viewing in My Tickets
- [ ] Test order history in My Orders
- [ ] Test concurrent order handling
- [ ] Verify webhook token validation
- [ ] Check error logging on failures
- [ ] Test with different amounts
- [ ] Test with merchandise vs tickets
- [ ] Verify loyalty credits awarded

---

## 🚀 Production Readiness

Before going to production:
1. Switch to Xendit PRODUCTION keys
2. Update webhook URL to production domain
3. Test with real payment methods
4. Monitor webhook success rate
5. Set up email delivery monitoring
6. Configure error alerting
7. Test payment failure handling
8. Implement refund process
9. Monitor Xendit API rate limits
10. Set up database backups

