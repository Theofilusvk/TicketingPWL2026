<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tiers', function (Blueprint $table) {
            $table->id('tier_id');
            $table->string('name', 20)->unique();
            $table->string('tagline', 255)->nullable();
            $table->integer('min_credits')->default(0);
            $table->decimal('discount_percent', 5, 2)->nullable()->default(0.00);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tiers');
    }
};
