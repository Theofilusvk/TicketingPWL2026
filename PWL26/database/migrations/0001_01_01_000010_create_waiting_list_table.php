<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waiting_list', function (Blueprint $table) {
            $table->id('list_id');
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('ticket_type_id'); // waiting untuk tipe tiket mana?
            $table->enum('status', ['waiting', 'notified', 'converted', 'expired'])->default('waiting');
            $table->timestamps();

            $table->foreign('event_id')
                  ->references('event_id')->on('events')
                  ->onDelete('cascade');

            $table->foreign('user_id')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');

            $table->foreign('ticket_type_id')
                  ->references('ticket_type_id')->on('ticket_types')
                  ->onDelete('cascade');

            // satu user tidak bisa masuk waiting list yang sama 2x
            $table->unique(['event_id', 'user_id', 'ticket_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waiting_list');
    }
};
