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
        Schema::table('events', function (Blueprint $table) {
            // Add organizer access deadline - defaults to event end_time if not specified
            $table->dateTime('organizer_access_until')->nullable()->after('end_time')
                ->comment('Deadline for organizers to scan tickets. If null, uses event end_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('organizer_access_until');
        });
    }
};
