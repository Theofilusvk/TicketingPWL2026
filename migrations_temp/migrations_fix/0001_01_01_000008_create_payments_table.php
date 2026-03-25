<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('order_id')->unique(); // 1 order = 1 payment
            $table->decimal('amount', 10, 2);
            $table->string('payment_gateway', 50)->nullable(); // contoh: BCA, GoPay, OVO
            $table->string('payment_method', 50)->nullable();  // bank_transfer / e_wallet
            $table->string('payment_reference', 100)->nullable();
            $table->enum('status', ['pending', 'paid', 'failed'])->default('pending');
            $table->dateTime('payment_date')->nullable();
            $table->timestamps();

            $table->foreign('order_id')
                  ->references('order_id')->on('orders')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
