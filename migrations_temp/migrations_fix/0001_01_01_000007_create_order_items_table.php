<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id('order_item_id');
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('ticket_type_id');   // DIPERBAIKI: sebelumnya salah ke category_id
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 10, 2);           // harga saat transaksi (snapshot harga)
            $table->timestamps();

            $table->foreign('order_id')
                  ->references('order_id')->on('orders')
                  ->onDelete('cascade');

            $table->foreign('ticket_type_id')
                  ->references('ticket_type_id')->on('ticket_types')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
