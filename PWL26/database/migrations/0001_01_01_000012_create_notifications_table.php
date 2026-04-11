<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('event_id')->nullable();
            $table->enum('type', [
                'ticket_purchased',   // tiket berhasil dibeli
                'payment_success',    // pembayaran berhasil
                'payment_failed',     // pembayaran gagal
                'waiting_list_available', // slot waiting list tersedia
                'event_reminder',     // pengingat event akan mulai
                'event_canceled',     // event dibatalkan
                'admin_broadcast',    // broadcast dari admin
            ]);
            $table->string('title', 200);
            $table->text('message');
            $table->string('logo_url', 255)->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->foreign('user_id')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');
            
            $table->foreign('event_id')
                  ->references('event_id')->on('events')
                  ->onDelete('cascade');

            $table->index(['user_id', 'is_read']); // query "notif belum dibaca milik user X"
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
