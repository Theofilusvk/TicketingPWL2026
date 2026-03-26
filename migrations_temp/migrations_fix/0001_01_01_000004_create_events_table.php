<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id('event_id');
            $table->unsignedBigInteger('organizer_id');
            $table->unsignedBigInteger('category_id');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('banner_url', 255)->nullable();
            $table->string('location', 200);
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->enum('status', ['active', 'finished', 'canceled'])->default('active');
            $table->timestamps();

            $table->foreign('organizer_id')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');

            $table->foreign('category_id')
                  ->references('category_id')->on('categories')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
