<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->integer('venue_capacity')->unsigned()->nullable()->after('location');
            $table->json('venue_map_data')->nullable()->after('venue_capacity'); // stores custom venue map structure
            $table->integer('total_sold')->unsigned()->default(0)->after('venue_map_data'); // track total sold tickets
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['venue_capacity', 'venue_map_data', 'total_sold']);
        });
    }
};
