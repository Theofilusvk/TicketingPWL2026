<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Models\Order;
use App\Mail\TicketEmail;

class SendTicketEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;

    public function __construct($orderId)
    {
        $this->orderId = $orderId;
    }

    public function handle()
    {
        // Load order with basic relations to pass to mailable
        // We assume basic relations like user and event exist
        $order = Order::with(['event'])->find($this->orderId);
        
        if (!$order) {
            return;
        }
        
        // Fetch user from DB since relation might not be mapped perfectly yet
        $user = DB::table('users')->where('user_id', $order->user_id)->first();
        if (!$user) {
            return;
        }

        // Fetch tickets
        $orderItems = DB::table('order_items')
            ->join('ticket_types', 'order_items.ticket_type_id', '=', 'ticket_types.ticket_type_id')
            ->where('order_items.order_id', $order->order_id)
            ->select('order_items.*', 'ticket_types.name as ticket_name')
            ->get();
            
        $ticketCodes = DB::table('tickets')
            ->whereIn('order_item_id', $orderItems->pluck('order_item_id'))
            ->pluck('unique_code')
            ->toArray();

        Mail::to($user->email)->send(new TicketEmail($order, $user, $orderItems, $ticketCodes));
    }
}
