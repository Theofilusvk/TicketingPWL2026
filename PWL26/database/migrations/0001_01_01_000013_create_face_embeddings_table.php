<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * TABEL OPSIONAL — hanya buat jika fitur Face Recognition akan dikerjakan.
 * Menyimpan face embedding terpisah dari tabel users agar query user biasa
 * tidak terbebani data besar.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('face_embeddings', function (Blueprint $table) {
            $table->id('embedding_id');
            $table->unsignedBigInteger('user_id')->unique(); // 1 user = 1 embedding
            $table->longText('embedding_data');              // JSON array dari Python face_recognition
            $table->string('photo_path', 255)->nullable();   // path foto referensi
            $table->timestamps();

            $table->foreign('user_id')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('face_embeddings');
    }
};
