# 📘 TECHNICAL SPECIFICATIONS - Masing-Masing Developer

---

# FRONTEND PERSON 1: Admin Event Management & Analytics

## File Structure yang Akan Dibuat

```
src/
├── pages/admin/
│   ├── AdminEventsPage.tsx (UPDATE)
│   │   ├── Event CRUD with detail modal
│   │   ├── Poster preview functionality
│   │   └── Time range picker integration
│   ├── AdminAnalyticsPage.tsx (NEW)
│   │   ├── Event comparison charts
│   │   ├── Revenue analytics
│   │   └── Trending events widget
│   └── AdminReportsPage.tsx (NEW)
│       ├── Report builder interface
│       ├── Export to PDF generator
│       └── Email report functionality
├── components/
│   ├── EventDetailModal.tsx (NEW)
│   ├── AnalyticsCharts.tsx (NEW - reusable chart components)
│   ├── PosterUploader.tsx (NEW)
│   └── TimeRangePicker.tsx (NEW)
└── lib/
    ├── chart-utils.ts (NEW - chart configuration)
    └── report-generator.ts (NEW - PDF generation helper)
```

## Component Specification

### 1. AdminEventsPage.tsx (UPDATE)
```typescript
// Current features to enhance:
- Add modal untuk event detail
- Integrate PosterUploader component
- Add date range picker untuk event duration
- Add validation display: "Cannot delete - 5 orders exist"

// New State:
const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
const [showDetailModal, setShowDetailModal] = useState(false)

// New Handler:
const handleDeleteEvent = async (id: number) => {
  // Validate: Check if orderCount > 0
  const canDelete = await checkIfEventCanBeDeleted(id)
  if (!canDelete) {
    alert('Cannot delete event with existing orders')
    return
  }
  // Proceed with deletion
}
```

### 2. EventDetailModal.tsx (NEW)
```typescript
interface Props {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onSave: (event: Event) => Promise<void>
}

// Features:
- Editable fields: name, description, starts_at, ends_at, location, capacity
- Poster image picker + preview
- Date picker for start/end (use react-date-range or headless ui)
- Save button dengan loading state
- Validation: ends_at > starts_at
- Display: Current ticket orders count (cannot delete if > 0)
```

### 3. AnalyticsCharts.tsx (NEW)
```typescript
// Reusable chart components using Recharts:

export const EventComparisonChart = ({ data })
// Line chart: Multiple events revenue over time

export const RevenuePieChart = ({ data })
// Pie chart: Revenue distribution by event

export const TicketSalesChart = ({ data })
// Bar chart: Tickets sold vs available

export const TrendingEventsCard = ({ data })
// List: Top 5 trending events by sales
```

### 4. AdminAnalyticsPage.tsx (NEW)
```typescript
// Layout:
- Header: "Event Analytics Dashboard"
- Filter section:
  - DateRangePicker (from - to date)
  - Multi-select Event dropdown
  - View mode toggle (Detail/Summary)
- Cards grid:
  - Total Revenue: $123,456
  - Total Tickets Sold: 5,234
  - Average Occupancy: 85%
  - Pending Orders: 23
- Charts section:
  - EventComparisonChart
  - RevenuePieChart
  - TicketSalesChart
  - TrendingEventsCard

// handlers:
const handleDateRangeChange = (range) => fetchAnalyticsData(range)
const handleEventSelect = (events) => filterAndReload(events)
```

### 5. AdminReportsPage.tsx (NEW)
```typescript
// Report Builder Interface:
- Report type selector:
  - Transaction Report
  - Revenue Report
  - Event Comparison
  - Detailed Export
- Filter options:
  - Date range
  - Event selector
  - Category (optional)
- Action buttons:
  - Preview PDF
  - Download PDF
  - Send via Email

// handlers:
const generateReport = async (type, filters) => {
  // Call API endpoint: POST /api/reports/generate
  // Return PDF blob
}

const downloadPDF = (pdf) => {
  // Generate download link
  // Use FileSaver.saveAs()
}

const emailReport = async (email) => {
  // Call API: POST /api/reports/email
  // Show success toast
}
```

## CSS Classes Needed
```typescript
// Tailwind classes untuk consistency:
"border-2 border-primary"      // Primary border
"bg-zinc-900 text-white"       // Dark background
"hover:text-hot-coral"         // Hover effect
"font-display text-2xl"        // Headings
"font-accent text-xs"          // Body text
```

## Component Imports
```typescript
import { BarChart, LineChart, PieChart, ResponsiveContainer } from 'recharts'
import { DateRangePicker } from 'react-date-range'
import { Download, Mail, Eye, ChevronRight } from 'lucide-react'
```

## API Calls Diperlukan
```
GET  /api/analytics/comparison?events=1,2,3&from=2026-01-01&to=2026-03-31
GET  /api/analytics/revenue?event_id=1&from=2026-01-01
GET  /api/analytics/metrics?event_id=1
POST /api/reports/generate (body: {type, filters})
POST /api/reports/export-pdf (body: {report_data})
POST /api/reports/email (body: {email, report_data})
```

---

# FRONTEND PERSON 2: User Experience & Admin Dashboard Redesign

## File Structure yang Akan Dibuat

```
src/
├── pages/
│   ├── CheckoutPage.tsx (UPDATE)
│   │   ├── Auto-fill profile
│   │   ├── Midtrans Snap integration
│   │   └── Multiple ticket assignment
│   ├── PaymentConfirmationPage.tsx (NEW)
│   └── admin/
│       └── AdminLayout.tsx (UPDATE)
│           ├── Modern sidebar redesign
│           ├── Quick stats cards
│           └── Organizer role support
├── components/
│   ├── ProfileAutoFill.tsx (NEW)
│   ├── MidtransPaymentWidget.tsx (NEW)
│   ├── AdminSidebar.tsx (NEW - redesigned)
│   ├── QuickStatsCards.tsx (NEW)
│   └── TicketPassengerForm.tsx (NEW)
└── lib/
    ├── midtrans.ts (NEW - Midtrans integration)
    └── payment-utils.ts (NEW - payment helpers)
```

## Component Specification

### 1. CheckoutPage.tsx (UPDATE)
```typescript
// Current: Handle merchandise & ticket checkout
// Enhance with:

// New UI sections:
- Section 1: Order Summary (existing + enhancement)
- Section 2: Buyer Information (auto-fill dari profile)
- Section 3: Ticket Assignment (jika multiple tickets)
- Section 4: Payment Method Selection
- Section 5: Confirmation

// Auto-fill logic:
const autofillProfile = () => {
  const { user } = useAuth()
  setFormData({
    buyer_name: user.displayName,
    buyer_email: user.email,
    buyer_phone: user.phone || '',
    // ... lainnya
  })
}

// Multiple ticket handler:
const handleTicketAssignment = (ticketIndex, passengerName) => {
  // Jika ada multiple tickets:
  // - Bisa assign semua ke buyer (sama nama)
  // - Atau assign individual per ticket
  setTickets(prev => 
    prev.map((t, i) => i === ticketIndex ? {...t, assignedTo: passengerName} : t)
  )
}
```

### 2. ProfileAutoFill.tsx (NEW)
```typescript
interface Props {
  onAutoFill: (data: ProfileData) => void
}

// Features:
- Display current profile data
- Edit inline jika diperlukan
- Save to localStorage (last used)
- Clear button to reset

// Validation:
- Email required
- Name required
- Phone optional (tidak perlu NIK)

// Smart behavior:
- Load last used data dari localStorage
- Pre-fill form dengan data ini
- Allow modification before checkout
```

### 3. MidtransPaymentWidget.tsx (NEW)
```typescript
interface Props {
  amount: number
  orderId: string
  onSuccess: () => void
  onPending: () => void
  onError: (error: string) => void
}

// Features:
- Initialize Midtrans Snap
- Display payment method options:
  - Credit Card
  - E-wallet (GCash, OVO, Gopay)
  - Bank Transfer
  - Convenience Store
- Redirect ke Midtrans hosted page OR embed Snap iframe
- Handle payment callback
- Show payment status

// Implementation:
const initializeMidtrans = async () => {
  const { token } = await fetch('/api/payment/initiate', {
    method: 'POST',
    body: JSON.stringify({ orderId, amount })
  }).then(r => r.json())
  
  window.snap.pay(token, {
    onSuccess: handlePaymentSuccess,
    onPending: handlePaymentPending,
    onError: handlePaymentError,
  })
}
```

### 4. TicketPassengerForm.tsx (NEW)
```typescript
interface Props {
  ticketNumber: number
  defaultName: string
  onAssignmentChange: (name: string) => void
  allowEdit: boolean
}

// Features:
- Jika 1 ticket: otomatis assign ke buyer name
- Jika multiple tickets:
  - Radio option: "Same as buyer" 
  - Input field: "Different name"
- Name validation (min 3 chars, no special chars kecuali -)
- Display ticket tier/section info

// UI:
[Radio] Sama dengan pembeli
       [Nama: John Doe] - disabled/readonly

[Radio] Nama berbeda
       [Input: ___________]
```

### 5. PaymentConfirmationPage.tsx (NEW)
```typescript
// URL: /payment-confirmation?order_id=xxx

// Content:
- Order summary
- Ticket details (semua ticket yang dibeli)
- Download ticket button (PDF dengan QR)
- Email status (sent to...)
- Countdown timer untuk email retry (jika belum terkirim)

// Auto-fetch order details setiap 5 detik:
const pollOrderStatus = setInterval(() => {
  fetchOrderDetails(orderId)
}, 5000)

// Business Logic:
- Jika payment pending selamanya: show "Check email" message
- Jika success: display semua ticket
- Jika failed: redirect ke checkout ulang
```

### 6. AdminSidebar.tsx (NEW - Redesigned)
```typescript
// Current: Basic sidebar
// Redesign to mirror user dashboard aesthetic

// Structure:
- Logo + Brand name (top)
- Quick Stats Cards (3 cards):
  - Pending Orders: 23
  - Today Revenue: $5,234
  - Active Events: 5
- Navigation Menu:
  - Dashboard
  - Events
  - Transactions
  - Users
  - Analytics  
  - Reports
  - Settings
- Footer:
  - Role badge (Admin / Organizer)
  - User menu
  - Logout

// Styling:
- Modern gradient blur effect
- Smooth transitions
- Icons from lucide-react
- Responsive (collapse on mobile)

// Role-based rendering:
if (userRole === 'organizer') {
  // Show: Events, Analytics, Transactions (filtered to their events)
  // Hide: Users, Settings
}
```

### 7. AdminLayout.tsx (UPDATE)
```typescript
// Replace current layout dengan modern design

// New Features:
- Top header dengan:
  - Search bar
  - Notifications
  - Settings
  - Profile dropdown
- Left sidebar (redesigned AdminSidebar)
- Main content area
- Responsive grid layout

// Add support untuk Organizer role:
const canAccessUsers = role === 'admin'
const canAccessReports = role === 'admin' || role === 'organizer'
const canManageOwnEvents = role === 'organizer'
```

## CSS Architecture
```typescript
// Use existing classes:
"border-2 border-primary"
"bg-gradient-to-b from-zinc-900 to-black"
"text-primary"
"hover:text-hot-coral"

// New utility classes needed:
"animate-slide-in-bottom"
"shadow-[0_0_20px_rgba(203,255,0,0.2)]"
"backdrop-blur-lg"
```

## Component Imports
```typescript
import { ArrowRight, Check, Loader, Bell, Menu, X } from 'lucide-react'
import Snap from 'midtrans-client'  // atau dari window.snap
```

## API Calls Diperlukan
```
POST /api/payment/initiate (body: {orderId, amount})
GET  /api/payment/status/:orderId
GET  /api/orders/:orderId
GET  /api/admin/stats (untuk quick cards)
GET  /api/admin/notifications
```

---

# BACKEND PERSON 1: Event Management & Registration

## Database Migrations Needed

### Event Table Enhancement
```sql
ALTER TABLE events ADD COLUMN starts_at DATETIME AFTER description;
ALTER TABLE events ADD COLUMN ends_at DATETIME AFTER starts_at;
ALTER TABLE events ADD COLUMN poster_url VARCHAR(255) NULL;
-- Remove atau deprecate banner_url jika ada
```

### Files to Create/Update

```
app/
├── Models/
│   └── Event.php (UPDATE)
│       ├── Add protected $dates = ['starts_at', 'ends_at']
│       ├── Add validation rules
│       └── Add relationshipMethods
├── Http/Controllers/Api/
│   ├── EventController.php (UPDATE)
│   │   ├── Update store() method
│   │   ├── Update update() method
│   │   ├── Add validation untuk delete
│   │   └── Add checkEventDeletion() helper
│   └── AuthController.php (UPDATE)
│       ├── Update register() - auto role assignment
│       ├── Add checkAdminExists() helper
│       └── Add notifyAdminOnRegistration()
├── Jobs/
│   └── SendAdminNotification.php (NEW)
└── database/migrations/
    └── 2026_03_25_add_event_timestamps.php (NEW)
```

## Model Updates - Event.php

```php
<?php
namespace App\Models;

class Event extends Model {
    protected $fillable = [
        'name', 'description', 'location', 'capacity',
        'starts_at', 'ends_at', 'poster_url', 'is_active'
    ];
    
    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];
    
    // Validasi
    public static function rules($id = null) {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string',
            'capacity' => 'required|integer|min:10',
            'starts_at' => 'required|date_format:Y-m-d H:i|after:now',
            'ends_at' => 'required|date_format:Y-m-d H:i|after:starts_at',
            'poster_url' => 'nullable|url',
        ];
    }
    
    // Helper method
    public function canBeDeleted() {
        $orderCount = DB::table('tickets')
            ->where('event_id', $this->event_id)
            ->count();
        return $orderCount === 0;
    }
    
    public function getOrderCount() {
        return DB::table('tickets')
            ->where('event_id', $this->event_id)
            ->count();
    }
}
```

## Controller Updates - EventController.php

```php
<?php
namespace App\Http\Controllers\Api;

class EventController extends Controller {
    // UPDATE
    public function store(Request $request) {
        $validated = $request->validate(Event::rules());
        
        // Create event
        $event = Event::create($validated);
        
        // Notify admin
        dispatch(new SendAdminNotification(
            "New Event Created: {$event->name}",
            "A new event has been created successfully."
        ));
        
        return response()->json([
            'status' => 'success',
            'data' => $event
        ], 201);
    }
    
    public function update(Request $request, Event $event) {
        $validated = $request->validate(Event::rules($event->event_id));
        $event->update($validated);
        
        dispatch(new SendAdminNotification(
            "Event Updated: {$event->name}",
            "Event information has been updated."
        ));
        
        return response()->json($event);
    }
    
    public function destroy(Event $event) {
        // Validation
        if (!$event->canBeDeleted()) {
            return response()->json([
                'status' => 'error',
                'message' => "Cannot delete event. {$event->getOrderCount()} ticket orders exist."
            ], 403);
        }
        
        $event->delete();
        
        dispatch(new SendAdminNotification(
            "Event Deleted: {$event->name}",
            "Event has been deleted from system."
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Event deleted'
        ]);
    }
}
```

## Controller Updates - AuthController.php

```php
<?php
namespace App\Http\Controllers\Api;

class AuthController extends Controller {
    public function register(Request $request) {
        $validated = $request->validate([
            'username' => 'required|string|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);
        
        // Check if admin already exists
        $adminExists = DB::table('users')
            ->where('role', 'admin')
            ->exists();
        
        // Auto-assign role
        $role = $adminExists ? 'user' : 'admin';
        
        // Create user
        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
        ]);
        
        // Send notification
        if ($role === 'admin') {
            dispatch(new SendAdminNotification(
                "Admin Account Created",
                "First user registered as admin: {$validated['username']}"
            ));
        }
        
        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'status' => 'success',
            'token' => $token,
            'data' => $this->mapUser($user)
        ], 201);
    }
}
```

## Job Class - SendAdminNotification.php

```php
<?php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Notification;
use App\Models\User;

class SendAdminNotification implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    protected $title;
    protected $message;
    
    public function __construct($title, $message) {
        $this->title = $title;
        $this->message = $message;
    }
    
    public function handle() {
        // Get all admin users
        $admins = User::where('role', 'admin')->get();
        
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->user_id,
                'type' => 'admin_broadcast',
                'title' => $this->title,
                'message' => $this->message,
                'is_read' => false,
            ]);
        }
    }
}
```

## API Routes Update

```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:admin,organizer')->group(function () {
        Route::post('events', [EventController::class, 'store']);
        Route::put('events/{event}', [EventController::class, 'update']);
        Route::delete('events/{event}', [EventController::class, 'destroy']);
    });
});
```

---

# BACKEND PERSON 2: Payment Gateway, Email & Analytics

## Packages Installation

```bash
composer require midtrans/midtrans-php
composer require simple-qrcode
composer require barryvdh/laravel-dompdf
composer require sendgrid/sendgrid  # or use native Laravel mail
```

## Files to Create

```
app/
├── Models/
│   └── Payment.php (UPDATE)
├── Http/Controllers/Api/
│   ├── PaymentController.php (NEW)
│   ├── AnalyticsController.php (NEW)
│   └── ReportController.php (NEW)
├── Mail/
│   ├── TicketQrMail.php (NEW)
│   └── ReportMail.php (NEW)
├── Jobs/
│   ├── SendTicketEmail.php (NEW)
│   ├── GenerateTicketQr.php (NEW)
│   └── SendReportEmail.php (NEW)
├── Services/
│   ├── MidtransService.php (NEW)
│   ├── QrCodeService.php (NEW)
│   └── AnalyticsService.php (NEW)
└── database/migrations/
    └── 2026_03_25_add_payment_fields.php (NEW)
```

## Configuration - .env

```
MIDTRANS_SERVER_KEY=your_server_key_here
MIDTRANS_CLIENT_KEY=your_client_key_here
MIDTRANS_ENV=sandbox

MAIL_FROM_ADDRESS=noreply@vortex.com
MAIL_FROM_NAME="Vortex Ticketing"
```

## Service Class - MidtransService.php

```php
<?php
namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;

class MidtransService {
    public function __construct() {
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.env') === 'production';
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }
    
    public function createSnapshot($orderId, $amount, $customerEmail, $customerName) {
        $transactionDetails = [
            'order_id' => $orderId,
            'gross_amount' => $amount,
        ];
        
        $customerDetails = [
            'email' => $customerEmail,
            'first_name' => $customerName,
        ];
        
        $payload = [
            'transaction_details' => $transactionDetails,
            'customer_details' => $customerDetails,
        ];
        
        $snapToken = Snap::getSnapToken($payload);
        return $snapToken;
    }
    
    public function handleCallback($orderId, $transactionStatus) {
        // Map transaction status
        $orderStatus = match ($transactionStatus) {
            'capture', 'settlement' => 'paid',
            'pending' => 'pending',
            'deny', 'cancel', 'expire' => 'failed',
            default => 'unknown'
        };
        
        return $orderStatus;
    }
}
```

## Service Class - QrCodeService.php

```php
<?php
namespace App\Services;

use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class QrCodeService {
    public function generateTicketQr($ticketId) {
        // Generate QR code data
        $qrData = "TICKET:{$ticketId}";
        
        // Generate QR code image
        $qrImage = QrCode::format('png')
            ->size(300)
            ->generate($qrData);
        
        // Store in storage
        $path = "qr-codes/ticket-{$ticketId}.png";
        Storage::disk('public')->put($path, $qrImage);
        
        return Storage::url($path);
    }
}
```

## Controller - PaymentController.php

```php
<?php
namespace App\Http\Controllers\Api;

use App\Services\MidtransService;
use App\Jobs\SendTicketEmail;

class PaymentController extends Controller {
    protected $midtransService;
    
    public function __construct(MidtransService $midtransService) {
        $this->midtransService = $midtransService;
    }
    
    public function initiate(Request $request) {
        $validated = $request->validate([
            'order_id' => 'required|string',
            'amount' => 'required|integer|min:1000',
            'email' => 'required|email',
            'name' => 'required|string',
        ]);
        
        try {
            $snapToken = $this->midtransService->createSnapshot(
                $validated['order_id'],
                $validated['amount'],
                $validated['email'],
                $validated['name']
            );
            
            return response()->json([
                'status' => 'success',
                'token' => $snapToken,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 400);
        }
    }
    
    public function callback(Request $request) {
        // Verify signature
        $key = config('midtrans.server_key');
        $orderId = $request->order_id;
        $statusCode = $request->status_code;
        $grossAmount = $request->gross_amount;
        
        $signatureKey = $request->signature_key;
        $mySignatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . $key);
        
        if ($signatureKey !== $mySignatureKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid signature'
            ], 403);
        }
        
        $transactionStatus = $request->transaction_status;
        $orderStatus = $this->midtransService->handleCallback($orderId, $transactionStatus);
        
        // Update order status
        $order = Order::find($orderId);
        $order->update(['status' => $orderStatus]);
        
        // Generate & send tickets if successful
        if ($orderStatus === 'paid') {
            $tickets = Ticket::where('order_id', $orderId)->get();
            foreach ($tickets as $ticket) {
                dispatch(new SendTicketEmail($ticket));
            }
        }
        
        return response()->json(['status' => 'success']);
    }
}
```

## Job - SendTicketEmail.php

```php
<?php
namespace App\Jobs;

use App\Models\Ticket;
use App\Mail\TicketQrMail;
use App\Services\QrCodeService;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;

class SendTicketEmail implements ShouldQueue {
    use Queueable;
    
    protected $ticket;
    
    public function __construct(Ticket $ticket) {
        $this->ticket = $ticket;
    }
    
    public function handle() {
        $qrService = new QrCodeService();
        $qrPath = $qrService->generateTicketQr($this->ticket->ticket_id);
        
        $user = $this->ticket->order->user;
        
        Mail::to($user->email)->send(
            new TicketQrMail($this->ticket, $qrPath)
        );
    }
}
```

## Mailable Class - TicketQrMail.php

```php
<?php
namespace App\Mail;

use Illuminate\Mail\Mailable;

class TicketQrMail extends Mailable {
    public $ticket;
    public $qrPath;
    
    public function __construct($ticket, $qrPath) {
        $this->ticket = $ticket;
        $this->qrPath = $qrPath;
    }
    
    public function build() {
        return $this->subject("Your Ticket for {$this->ticket->event->name}")
                    ->view('emails.ticket-qr')
                    ->attach($this->qrPath)
                    ->with([
                        'ticket' => $this->ticket,
                        'qrPath' => $this->qrPath,
                    ]);
    }
}
```

## Controller - AnalyticsController.php

```php
<?php
namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller {
    public function getEventComparison(Request $request) {
        $events = $request->input('events', []);
        $from = $request->input('from');
        $to = $request->input('to');
        
        $cacheKey = "analytics:comparison:" . implode(',', $events) . ":$from:$to";
        
        return Cache::remember($cacheKey, 86400, function () use ($events, $from, $to) {
            $data = DB::table('events as e')
                ->leftJoin('tickets as t', 'e.event_id', '=', 't.event_id')
                ->leftJoin('payments as p', 't.order_id', '=', 'p.order_id')
                ->select(
                    'e.event_id',
                    'e.name',
                    DB::raw('COUNT(DISTINCT t.ticket_id) as tickets_sold'),
                    DB::raw('SUM(p.amount) as total_revenue'),
                    DB::raw('AVG(p.amount) as avg_ticket_price')
                )
                ->whereIn('e.event_id', $events)
                ->whereBetween('t.created_at', [$from, $to])
                ->groupBy('e.event_id', 'e.name')
                ->get();
            
            return response()->json(['data' => $data]);
        });
    }
    
    public function getRevenueAnalytics(Request $request) {
        $eventId = $request->input('event_id');
        $from = $request->input('from');
        $to = $request->input('to');
        
        $dailyRevenue = DB::table('payments as p')
            ->leftJoin('tickets as t', 'p.order_id', '=', 't.order_id')
            ->select(
                DB::raw('DATE(p.payment_date) as date'),
                DB::raw('SUM(p.amount) as revenue'),
                DB::raw('COUNT(DISTINCT p.payment_id) as transaction_count')
            )
            ->where('t.event_id', $eventId)
            ->whereBetween('p.payment_date', [$from, $to])
            ->groupBy(DB::raw('DATE(p.payment_date)'))
            ->get();
        
        return response()->json(['data' => $dailyRevenue]);
    }
}
```

## Controller - ReportController.php

```php
<?php
namespace App\Http\Controllers\Api;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Jobs\SendReportEmail;

class ReportController extends Controller {
    public function generateTransactionReport(Request $request) {
        $validated = $request->validate([
            'from' => 'required|date',
            'to' => 'required|date',
            'event_id' => 'nullable|integer',
        ]);
        
        // Fetch transactions
        $transactions = DB::table('orders as o')
            ->leftJoin('payments as p', 'o.order_id', '=', 'p.order_id')
            ->leftJoin('events as e', 'o.event_id', '=', 'e.event_id')
            ->select('o.*', 'p.*', 'e.name as event_name')
            ->whereBetween('p.payment_date', [$validated['from'], $validated['to']])
            ->when($validated['event_id'], function ($q) use ($validated) {
                return $q->where('o.event_id', $validated['event_id']);
            })
            ->get();
        
        // Generate PDF
        $pdf = Pdf::loadView('reports.transactions', [
            'transactions' => $transactions,
            'from' => $validated['from'],
            'to' => $validated['to'],
        ]);
        
        return $pdf->download("transaction-report-{$validated['from']}-to-{$validated['to']}.pdf");
    }
    
    public function emailReport(Request $request) {
        $validated = $request->validate([
            'email' => 'required|email',
            'report_type' => 'required|string',
        ]);
        
        dispatch(new SendReportEmail(
            $validated['email'],
            $validated['report_type']
        ));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Report will be sent to your email'
        ]);
    }
}
```

## Database Indexes untuk Performance

```php
// migration file
Schema::table('payments', function (Blueprint $table) {
    $table->index(['order_id']);
    $table->index(['payment_date']);
});

Schema::table('tickets', function (Blueprint $table) {
    $table->index(['event_id']);
    $table->index(['order_id']);
    $table->index(['created_at']);
});

Schema::table('orders', function (Blueprint $table) {
    $table->index(['event_id']);
    $table->index(['user_id']);
    $table->index(['created_at']);
});
```

---

## Summary

**Frontend Person 1 (20 hours):**
- Admin event CRUD dengan poster preview - 8 hours
- Analytics dashboard - 8 hours
- PDF export/reporting UI - 4 hours

**Frontend Person 2 (18 hours):**
- Profile auto-fill - 5 hours
- Midtrans payment integration - 8 hours
- Admin UI redesign - 5 hours

**Backend Person 1 (18 hours):**
- Event model & migrations - 5 hours
- Smart registration logic - 5 hours
- Admin notification system - 8 hours

**Backend Person 2 (20 hours):**
- Midtrans integration - 8 hours
- Email system + QR codes - 8 hours
- Analytics & reporting - 4 hours

**Total: 76 jam kerja = ~2 minggu dengan 4 orang**
