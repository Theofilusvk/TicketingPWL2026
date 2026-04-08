<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchandise_orders', function (Blueprint $table) {
            $table->id('merch_order_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('merch_id');
            $table->integer('quantity')->default(1);
            $table->enum('payment_type', ['CREDITS', 'MONEY', 'MIXED'])->default('MONEY');
            $table->decimal('amount_credits', 12, 2)->nullable()->default(0.00);
            $table->decimal('amount_money', 10, 2)->nullable()->default(0.00);
            $table->enum('status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled'])->nullable()->default('pending');
            $table->text('shipping_address')->nullable();
            $table->string('tracking_number', 100)->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('merch_id')->references('merch_id')->on('merchandise')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchandise_orders');
    }
};
