<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\CheckoutController;

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Public Auth
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);

// Public Read-only Event & Category
Route::apiResource('events', EventController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

// Checkout Calculation (Publicly accessible for cart simulation)
Route::post('checkout/calculate', [CheckoutController::class, 'calculate']);


// ==========================================
// PROTECTED ROUTES (Require Login)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth State Management
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Admin & Organizer Only Routes
    Route::middleware('role:admin,organizer')->group(function () {
        Route::apiResource('events', EventController::class)->except(['index', 'show']);
        Route::post('tickets/generate', [TicketController::class, 'generate']);
        Route::post('tickets/validate', [TicketController::class, 'validateTicket']);
    });

    // Admin Only Routes
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);
    });

});
