<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_transfers', function (Blueprint $table) {
            $table->id('transfer_id');
            $table->unsignedBigInteger('ticket_id');
            $table->unsignedBigInteger('from_user_id'); // penjual/pembatalkan
            $table->unsignedBigInteger('to_user_id')->nullable(); // pembeli baru (null jika cancel)
            $table->enum('type', ['transfer', 'cancellation']); // transfer ke pembeli atau cancel
            $table->decimal('transfer_price', 10, 2)->nullable();
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected', 'completed', 'expired'])->default('pending');
            $table->dateTime('expires_at')->nullable(); // offer expiry
            $table->timestamps();

            $table->foreign('ticket_id')
                  ->references('ticket_id')->on('tickets')
                  ->onDelete('cascade');

            $table->foreign('from_user_id')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');

            $table->foreign('to_user_id')
                  ->references('user_id')->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_transfers');
    }
};
