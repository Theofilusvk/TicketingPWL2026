<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Order;
use App\Models\Ticket;
use App\Mail\TicketEmail;

class SendTicketEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

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

        $isMerchandise = ($order->event_id === null);
        $orderItems = collect();
        $tickets = collect();
        $merchandiseOrders = collect();

        if ($isMerchandise) {
            $merchandiseOrders = DB::table('merchandise_orders')
                ->join('merchandise', 'merchandise_orders.merch_id', '=', 'merchandise.merch_id')
                ->where('order_id', $order->order_id)
                ->select('merchandise_orders.*', 'merchandise.title')
                ->get();
        } else {
            // Fetch tickets with QR path
            $orderItems = DB::table('order_items')
                ->join('ticket_types', 'order_items.ticket_type_id', '=', 'ticket_types.ticket_type_id')
                ->where('order_items.order_id', $order->order_id)
                ->select('order_items.*', 'ticket_types.name as ticket_name')
                ->get();
                
            $tickets = DB::table('tickets')
                ->whereIn('order_item_id', $orderItems->pluck('order_item_id'))
                ->get();
        }

        // Generate PDF
        try {
            $pdfContent = Pdf::loadView('pdf.ticket', [
                'order' => $order,
                'user' => $user,
                'orderItems' => $orderItems,
                'tickets' => $tickets,
                'isMerchandise' => $isMerchandise,
                'merchandiseOrders' => $merchandiseOrders
            ])->output();
        } catch (\Exception $e) {
            Log::error("Failed to generate PDF for Order ID: {$this->orderId}. Error: " . $e->getMessage());
            throw $e;
        }

        try {
            if ($isMerchandise) {
                Log::info("Sending Invoice email for Merchandise Order ID: {$this->orderId} to {$user->email}");
            } else {
                Log::info("Sending E-Ticket email for Event Order ID: {$this->orderId} to {$user->email}");
            }
            
            Mail::to($user->email)->send(new TicketEmail($order, $user, $orderItems, $tickets, $pdfContent, $isMerchandise, $merchandiseOrders));
            
            if ($isMerchandise) {
                Log::info("Successfully sent Invoice email for Merchandise Order ID: {$this->orderId}");
            } else {
                Log::info("Successfully sent E-Ticket email for Event Order ID: {$this->orderId}");
            }
        } catch (\Exception $e) {
            Log::error("Failed to send email for Order ID: {$this->orderId}. Error: " . $e->getMessage());
            throw $e; // Trigger retry
        }
    }
}
