<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('waiting_list', function (Blueprint $table) {
            $table->integer('queue_position')->unsigned()->nullable()->after('ticket_type_id'); // posisi dalam queue
            $table->decimal('preferred_price', 10, 2)->nullable()->after('status'); // max price yang user bersedia bayar
        });
    }

    public function down(): void
    {
        Schema::table('waiting_list', function (Blueprint $table) {
            $table->dropColumn(['queue_position', 'preferred_price']);
        });
    }
};
