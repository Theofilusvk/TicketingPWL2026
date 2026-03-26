<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_types', function (Blueprint $table) {
            $table->id('ticket_type_id');
            $table->unsignedBigInteger('event_id');
            $table->string('name', 100);           // contoh: VIP, Regular, Early Bird
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('available_stock');
            $table->timestamps();

            $table->foreign('event_id')
                  ->references('event_id')->on('events')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_types');
    }
};
