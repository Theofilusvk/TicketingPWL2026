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

// Public Auth
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

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



Route::middleware('auth:sanctum')->group(function () {
    
    // Auth State Management
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

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

    // Admin & Organizer Only Routes
    Route::middleware('role:admin,organizer')->group(function () {
        Route::apiResource('events', EventController::class)->except(['index', 'show']);
        Route::post('tickets/generate', [TicketController::class, 'generate']);
        Route::post('tickets/validate', [TicketController::class, 'validateTicket']);
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
    });

});
