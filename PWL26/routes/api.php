<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\MerchandiseOrderController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AdminMerchandiseController;
use App\Http\Controllers\Api\AdminReportController;
use App\Http\Controllers\Api\EventOrganizerController;
use App\Http\Controllers\VenueSectionController;
use App\Http\Controllers\TicketTransferController;

// Public Auth
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/send-register-otp', [AuthController::class, 'sendRegisterOtp']);

// Forgot & Reset Password
Route::post('auth/forgot-password', [\App\Http\Controllers\Api\ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('auth/reset-password', [\App\Http\Controllers\Api\ForgotPasswordController::class, 'reset']);

// Public Read-only Event & Category
Route::apiResource('events', EventController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

// Public News & Notifications (Read-only)
Route::get('news', [NewsController::class, 'index']);
Route::get('news/recent', [NewsController::class, 'recent']);
Route::get('news/tags', [NewsController::class, 'tags']);
Route::get('news/{news}', [NewsController::class, 'show']);

// Checkout Calculation (Publicly accessible for cart simulation)
Route::post('checkout/calculate', [CheckoutController::class, 'calculate']);

// Merchandise Calculation (Publicly accessible for cart simulation)
Route::post('merchandise/calculate', [MerchandiseOrderController::class, 'calculate']);

// Payment Webhook
Route::post('payment/xendit-webhook', [\App\Http\Controllers\Api\PaymentController::class, 'webhook']);



Route::middleware('auth:sanctum')->group(function () {
    
    // Auth State Management
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Orders fetching
    Route::get('orders/{id}', [\App\Http\Controllers\Api\PaymentController::class, 'getOrderDetails']);
    Route::get('orders/{id}/download-pdf', [\App\Http\Controllers\Api\PaymentController::class, 'downloadPdf']);
    Route::post('orders/{id}/send-email', [\App\Http\Controllers\Api\PaymentController::class, 'resendEmail']);

    // User Notifications
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::get('notifications/unread', [NotificationController::class, 'unread']);
    Route::put('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);

    // Merchandise processing (instant, no queue)
    Route::post('merchandise/process', [MerchandiseOrderController::class, 'process']);

    // Checkout processing
    Route::post('checkout/process', [CheckoutController::class, 'process']);
    Route::post('payment/checkout', [\App\Http\Controllers\Api\PaymentController::class, 'checkout']);

    // Ticket Transfers
    Route::get('ticket-transfers/my', [TicketTransferController::class, 'myTransfers']);
    Route::get('ticket-transfers/pending', [TicketTransferController::class, 'pendingTransfers']);
    Route::post('ticket-transfers/create', [TicketTransferController::class, 'createTransfer']);
    Route::post('ticket-transfers/{transfer}/accept', [TicketTransferController::class, 'acceptTransfer']);
    Route::post('ticket-transfers/{transfer}/reject', [TicketTransferController::class, 'rejectTransfer']);
    Route::post('tickets/{ticket}/cancel', [TicketTransferController::class, 'cancelTicket']);

    // Waiting List
    Route::get('waiting-list/my', [\App\Http\Controllers\WaitingListController::class, 'myWaitingList']);
    Route::post('waiting-list/join', [\App\Http\Controllers\WaitingListController::class, 'joinWaitingList']);
    Route::post('waiting-list/leave', [\App\Http\Controllers\WaitingListController::class, 'leaveWaitingList']);

    // Venue Sections - Read (Public for events)
    Route::get('events/{event}/venue-map', [VenueSectionController::class, 'getVenueMap']);

    // Admin & Organizer Only Routes
    Route::middleware('role:admin,organizer')->group(function () {
        Route::apiResource('events', EventController::class)->except(['index', 'show']);
        Route::post('tickets/generate', [TicketController::class, 'generate']);
        Route::post('tickets/validate', [TicketController::class, 'validateTicket']);

        // Venue Sections Management
        Route::get('events/{event}/sections', [VenueSectionController::class, 'byEvent']);
        Route::post('venue-sections', [VenueSectionController::class, 'store']);
        Route::put('venue-sections/{section}', [VenueSectionController::class, 'update']);
        Route::delete('venue-sections/{section}', [VenueSectionController::class, 'destroy']);

        // Ticket Transfers - Admin view
        Route::get('ticket-transfers', [TicketTransferController::class, 'index']);
        Route::get('ticket-transfers/{transfer}', [TicketTransferController::class, 'show']);

        // Waiting List - Admin view
        Route::get('events/{event}/waiting-list', [\App\Http\Controllers\WaitingListController::class, 'byEvent']);
    });

    // Organizer-specific routes with access validation (limited until event ends)
    Route::middleware(['role:organizer', 'check.organizer.access'])->group(function () {
        Route::post('events/{eventId}/tickets/validate', [TicketController::class, 'validateTicket']);
    });

    // Admin Only Routes
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
        
        // Admin Notification Management
        Route::post('admin/notifications/create', [NotificationController::class, 'createAdmin']);
        Route::get('admin/notifications', [NotificationController::class, 'adminIndex']);
        
        // Admin News Management
        Route::post('admin/news/create', [NewsController::class, 'createAdmin']);
        Route::put('admin/news/{news}/update', [NewsController::class, 'updateAdmin']);
        Route::delete('admin/news/{news}', [NewsController::class, 'destroyAdmin']);
        Route::get('admin/news', [NewsController::class, 'adminIndex']);

        // Admin Analytics Routes
        Route::get('admin/analytics/event-comparison', [AnalyticsController::class, 'getEventComparison']);
        Route::get('admin/analytics/revenue', [AnalyticsController::class, 'getRevenueAnalytics']);
        Route::get('admin/analytics/transactions', [AnalyticsController::class, 'getTransactionMetrics']);

        // Admin User Management Routes
        Route::get('admin/users', [AdminUserController::class, 'index']);
        Route::put('admin/users/{id}', [AdminUserController::class, 'update']);
        Route::delete('admin/users/{id}', [AdminUserController::class, 'destroy']);

        // Admin Merchandise Management Routes
        Route::get('admin/merchandise', [AdminMerchandiseController::class, 'index']);
        Route::post('admin/merchandise', [AdminMerchandiseController::class, 'store']);
        Route::delete('admin/merchandise/{id}', [AdminMerchandiseController::class, 'destroy']);

        // Admin Reports Management
        Route::post('admin/reports/email', [AdminReportController::class, 'sendEmailReport']);

        // Event Organizer Management (Admin only)
        Route::post('admin/event-organizers/assign', [EventOrganizerController::class, 'assign']);
        Route::delete('admin/event-organizers/{eventOrganizer}', [EventOrganizerController::class, 'unassign']);
        Route::get('admin/events/{event}/organizers', [EventOrganizerController::class, 'eventAssignments']);
        Route::put('admin/event-organizers/{eventOrganizer}/regenerate-code', [EventOrganizerController::class, 'regenerateCode']);
    });

    // Organizer Routes
    Route::middleware('role:organizer')->group(function () {
        Route::get('organizer/events', [EventOrganizerController::class, 'myEvents']);
    });

    // Public route for referral code lookup (needed for QR code scanning)
    Route::get('event-organizers/code/{code}', [EventOrganizerController::class, 'getByCode']);
});
