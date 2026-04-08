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
            $table->string('unique_code', 100)->unique(); // kode unik per tiket
            $table->string('qr_code', 255)->nullable();   // string konten QR
            $table->string('qr_code_path', 255)->nullable(); // path file gambar QR
            $table->enum('status', ['available', 'used', 'cancelled'])->default('available');
            $table->dateTime('checked_in_at')->nullable(); // waktu scan/check-in
            $table->timestamps();

            $table->foreign('order_item_id')
                  ->references('order_item_id')->on('order_items')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
