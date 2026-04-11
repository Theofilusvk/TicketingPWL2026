<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id('user_achievement_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('achievement_id');
            $table->timestamp('unlocked_at')->useCurrent();

            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
            $table->foreign('achievement_id')->references('achievement_id')->on('achievements')->onDelete('cascade');
            $table->unique(['user_id', 'achievement_id'], 'uq_user_achievement');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
    }
};
