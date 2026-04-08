<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id('news_id');
            $table->unsignedBigInteger('author_id')->nullable();
            $table->string('title', 255);
            $table->text('content');
            $table->string('tag', 50)->nullable()->default('SYSTEM');
            $table->enum('urgency', ['NORMAL', 'HIGH', 'CRITICAL'])->nullable()->default('NORMAL');
            $table->string('image_url', 255)->nullable();
            $table->boolean('is_published')->nullable()->default(true);
            $table->dateTime('published_at')->nullable();
            $table->timestamps();

            $table->foreign('author_id')->references('user_id')->on('users')->onDelete('set null');
            $table->index('tag');
            $table->index(['is_published', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
