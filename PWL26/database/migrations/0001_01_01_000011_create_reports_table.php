<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id('report_id');
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('generated_by'); // user_id yang generate laporan
            $table->enum('file_type', ['excel', 'pdf'])->default('pdf');
            $table->string('file_path', 255);           // path file hasil export
            $table->string('title', 200)->nullable();   // judul laporan
            $table->timestamps();

            $table->foreign('event_id')
                  ->references('event_id')->on('events')
                  ->onDelete('cascade');

            $table->foreign('generated_by')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
