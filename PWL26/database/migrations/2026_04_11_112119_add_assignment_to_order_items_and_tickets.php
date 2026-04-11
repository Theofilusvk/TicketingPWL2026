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
        Schema::table('order_items', function (Blueprint $table) {
            $table->json('assignments')->nullable();
        });
        
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('holder_name')->nullable();
            $table->string('holder_email')->nullable();
            $table->string('holder_identity')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('assignments');
        });
        
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['holder_name', 'holder_email', 'holder_identity']);
        });
    }
};
