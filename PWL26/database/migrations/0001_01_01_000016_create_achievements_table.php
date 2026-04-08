<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id('achievement_id');
            $table->string('code', 50)->unique();
            $table->string('icon', 50)->nullable()->default('emoji_events');
            $table->string('title', 100);
            $table->string('description', 255)->nullable();
            $table->enum('rarity', ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'])->nullable()->default('COMMON');
            $table->integer('required_tickets')->nullable();
            $table->integer('required_orders')->nullable();
            $table->integer('required_credits')->nullable();
            $table->decimal('required_total_spent', 10, 2)->nullable();
            $table->string('required_tier', 20)->nullable();
            $table->decimal('reward_credits', 10, 2)->nullable()->default(0.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
