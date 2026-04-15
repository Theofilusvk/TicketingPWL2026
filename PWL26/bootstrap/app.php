<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // CORS middleware for API requests
        $middleware->api(prepend: [
            // Enable CORS for API routes
        ]);
        
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'check.organizer.access' => \App\Http\Middleware\CheckOrganizerEventAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
