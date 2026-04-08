<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('merchandise', function (Blueprint $table) {
            $table->id('merch_id');
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('image_url', 255)->nullable();
            $table->decimal('price_usd', 10, 2)->default(0.00);
            $table->decimal('price_credits', 12, 2)->default(0.00);
            $table->enum('rarity', ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'])->nullable()->default('COMMON');
            $table->integer('available_stock')->default(0);
            $table->boolean('is_limited')->nullable()->default(false);
            $table->string('required_tier', 20)->nullable()->default('PHANTOM');
            $table->enum('category', ['PHYSICAL', 'DIGITAL'])->nullable()->default('PHYSICAL');
            $table->enum('status', ['AVAILABLE', 'SOLD_OUT', 'HIDDEN'])->nullable()->default('AVAILABLE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchandise');
    }
};
