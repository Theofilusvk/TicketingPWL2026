<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tier_benefits', function (Blueprint $table) {
            $table->id('benefit_id');
            $table->unsignedBigInteger('tier_id');
            $table->string('benefit_text', 255);
            $table->string('icon', 50)->nullable()->default('check_circle');
            $table->integer('sort_order')->nullable()->default(0);

            $table->foreign('tier_id')->references('tier_id')->on('tiers')
                  ->onDelete('cascade')->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tier_benefits');
    }
};
