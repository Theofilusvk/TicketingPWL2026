<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_organizers', function (Blueprint $table) {
            $table->id('event_organizer_id');
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('organizer_id');
            $table->string('referral_code', 50)->unique();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('event_id')
                  ->references('event_id')->on('events')
                  ->onDelete('cascade');

            $table->foreign('organizer_id')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');

            $table->unique(['event_id', 'organizer_id']);
            $table->index('referral_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_organizers');
    }
};
