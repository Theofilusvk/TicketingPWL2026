<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('venue_sections', function (Blueprint $table) {
            $table->id('section_id');
            $table->unsignedBigInteger('event_id');
            $table->string('section_name', 100); // VIP_WEST, GEN_ALPHA, etc
            $table->integer('capacity')->unsigned();
            $table->decimal('price', 10, 2);
            $table->integer('sold_tickets')->unsigned()->default(0);
            $table->json('map_position')->nullable(); // coordinates for map display
            $table->enum('status', ['active', 'inactive', 'hidden'])->default('active');
            $table->timestamps();

            $table->foreign('event_id')
                  ->references('event_id')->on('events')
                  ->onDelete('cascade');

            $table->unique(['event_id', 'section_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('venue_sections');
    }
};
