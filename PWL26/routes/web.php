<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\WaitingListController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/apps', function () {
    return view('apps', [
        'users' => \App\Models\User::all(),
        'categories' => \App\Models\Category::all(),
        'events' => \App\Models\Event::all(),
        'orders' => \App\Models\Order::all(),
        'items' => \App\Models\OrderItem::all(),
        'payments' => \App\Models\Payment::all(),
        'waitingLists' => \App\Models\WaitingList::all(),
        'reports' => \App\Models\Report::all(),
    ]);
})->name('apps');

/*
|--------------------------------------------------------------------------
| Dashboard (Semua user login)
|--------------------------------------------------------------------------
*/

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:admin'])->group(function () {

    Route::get('/admin', function () {
        return view('admin.dashboard');
    })->name('admin.dashboard');

    // Admin full akses
    Route::resource('users', UserController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('events', EventController::class);
    Route::resource('reports', ReportController::class);
});

/*
|--------------------------------------------------------------------------
| ORGANIZER ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:organizer'])->group(function () {

    Route::get('/organizer', function () {
        return view('organizer.dashboard');
    })->name('organizer.dashboard');

    // Organizer bisa kelola event & lihat order
    Route::resource('events', EventController::class);
    Route::resource('orders', OrderController::class)->only(['index', 'show']);
});

/*
|--------------------------------------------------------------------------
| USER ROUTES (PEMBELI TIKET)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'role:user'])->group(function () {

    Route::get('/user', function () {
        return view('user.dashboard');
    })->name('user.dashboard');

    Route::post('/checkout', [OrderController::class, 'checkout'])->name('checkout');

    // User beli tiket
    Route::resource('orders', OrderController::class);
    Route::resource('order-items', OrderItemController::class);
    Route::resource('payments', PaymentController::class);
    Route::resource('waiting-lists', WaitingListController::class);
});

/*
|--------------------------------------------------------------------------
| PROFILE (SEMUA USER LOGIN)
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';
