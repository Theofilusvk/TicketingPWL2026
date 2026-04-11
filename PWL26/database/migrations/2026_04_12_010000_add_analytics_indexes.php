<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add composite indexes to optimize analytics queries.
     * - (event_id, created_at) on orders for event-based date filtering
     * - (order_id, status) on orders for order lookup by status
     * - (event_id) on orders (index for JOINs)
     * - (status, created_at) on orders for filtered aggregation
     * - (order_id, status) on payments for payment lookup
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['event_id', 'created_at'], 'idx_orders_event_created');
            $table->index(['status', 'created_at'], 'idx_orders_status_created');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['status', 'payment_method'], 'idx_payments_status_method');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index(['order_id', 'ticket_type_id'], 'idx_order_items_order_ticket');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('idx_orders_event_created');
            $table->dropIndex('idx_orders_status_created');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_status_method');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropIndex('idx_order_items_order_ticket');
        });
    }
};
