<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\EventController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// API Routes for Category CRUD
Route::apiResource('categories', CategoryController::class);

// API Routes for Event CRUD
Route::apiResource('events', EventController::class);
