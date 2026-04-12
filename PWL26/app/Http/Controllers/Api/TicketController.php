<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Ticket;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    /**
     * Generate tickets & QR Codes for a specific Order Item
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'order_item_id' => 'required|exists:order_items,order_item_id'
        ]);

        $orderItem = OrderItem::with('order.event')->find($validated['order_item_id']);
        
        $generatedTickets = [];

        // Formatting folder hierarchy: qrcodes/{Event Name}/{Ticket Type}
        $eventName = 'undetermined-event';
        if ($orderItem->order && $orderItem->order->event && $orderItem->order->event->title) {
            $eventName = Str::slug($orderItem->order->event->title);
        }
        
        $ticketType = Str::slug($orderItem->ticket_type ?? 'regular');
        $directoryPath = 'qrcodes/' . $eventName . '/' . $ticketType;

        // Determine how many tickets to print based on quantity bought
        for ($i = 0; $i < $orderItem->quantity; $i++) {
            // 1. Create unique code
            $uniqueCode = 'TKT-' . strtoupper(Str::random(6)) . '-' . rand(100, 999);
            
            // 2. Generate the QR Code SVG string
            $qrContent = QrCode::format('svg')->size(300)->generate($uniqueCode);
            
            // 3. Save the SVG file to organized public storage
            $fileName = $directoryPath . '/' . $uniqueCode . '.svg';
            Storage::disk('public')->put($fileName, $qrContent);

            // 4. Save to Database
            $ticket = Ticket::create([
                'order_item_id' => $orderItem->order_item_id,
                'unique_code'   => $uniqueCode,
                'qr_code_path'  => '/storage/' . $fileName,
                'status'        => 'available', // available, used, cancelled
            ]);

            $generatedTickets[] = $ticket;
        }

        return response()->json([
            'message' => 'Tiket dan QR Code berhasil di-generate secara otomatis!',
            'data' => $generatedTickets
        ], 201);
    }

    /**
     * Scanner validation endpoint
     */
    public function validateTicket(Request $request)
    {
        $validated = $request->validate([
            'unique_code' => 'required|string'
        ]);

        $rawCode = $validated['unique_code'];

        // If the code is a Laravel encrypted payload (typical base64 JSON containing iv, value, mac)
        try {
            if (str_starts_with($rawCode, 'eyJpdiI') || strlen($rawCode) > 100) {
                $rawCode = \Illuminate\Support\Facades\Crypt::decryptString($rawCode);
            }
        } catch (\Exception $e) {
            // Not an encrypted payload or failed to decrypt; assume it's raw text
        }

        $ticket = Ticket::where('unique_code', $rawCode)->first();

        if (!$ticket) {
            return response()->json([
                'status' => 'error',
                'message' => 'KODE TIKET TIDAK DITEMUKAN / PALSU!'
            ], 404);
        }

        if ($ticket->status === 'used') {
            return response()->json([
                'status' => 'error',
                'message' => 'TIKET SUDAH TERPAKAI pada ' . $ticket->checked_in_at
            ], 400);
        }

        if ($ticket->status === 'cancelled') {
            return response()->json([
                'status' => 'error',
                'message' => 'TIKET INI SUDAH DIBATALKAN.'
            ], 400);
        }

        // If ticket is valid and available
        $ticket->update([
            'status' => 'used',
            'checked_in_at' => now()
        ]);

        // Get rich data
        $richData = $ticket->toArray();
        $orderItem = \Illuminate\Support\Facades\DB::table('order_items')->where('order_item_id', $ticket->order_item_id)->first();
        if ($orderItem) {
            $ticketType = \Illuminate\Support\Facades\DB::table('ticket_types')->where('ticket_type_id', $orderItem->ticket_type_id)->first();
            $richData['ticket_name'] = $ticketType ? $ticketType->name : 'PREMIUM';
            $richData['order_id'] = $orderItem->order_id;
            
            $order = \Illuminate\Support\Facades\DB::table('orders')->where('order_id', $orderItem->order_id)->first();
            if ($order) {
                $user = \Illuminate\Support\Facades\DB::table('users')->where('user_id', $order->user_id)->first();
                if ($user) {
                    $richData['user'] = ['username' => $user->username];
                }
                
                $event = \Illuminate\Support\Facades\DB::table('events')->where('event_id', $order->event_id)->first();
                if ($event) {
                    $richData['event'] = ['title' => $event->title];
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'TIKET VALID! Pintu dibuka.',
            'data' => $richData
        ]);
    }
}
