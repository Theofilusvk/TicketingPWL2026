<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id('ticket_id');
            $table->unsignedBigInteger('order_item_id');
            $table->string('unique_code', 50)->unique();
            $table->string('qr_code_path', 255)->nullable();
            $table->enum('status', ['available', 'used', 'cancelled'])->default('available');
            $table->timestamp('checked_in_at')->nullable();
            $table->timestamps();

            $table->foreign('order_item_id')->references('order_item_id')->on('order_items')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
