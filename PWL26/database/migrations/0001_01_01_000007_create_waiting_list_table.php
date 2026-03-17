<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('waiting_list', function (Blueprint $table) {
            $table->id('list_id');
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('user_id');
            $table->string('status', 50)->default('waiting');
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('event_id')->references('event_id')->on('events')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waiting_list');
    }
};
