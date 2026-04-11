<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$controller = new \App\Http\Controllers\Api\PaymentController();
$response = $controller->getOrderDetails(14);
print_r($response->getContent());
