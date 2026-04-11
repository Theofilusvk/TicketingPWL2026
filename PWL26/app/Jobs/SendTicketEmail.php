<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use App\Models\Order;
use App\Mail\TicketEmail;
use Illuminate\Support\Facades\Log;

class SendTicketEmail implements ShouldQueue
{
    use Queueable;

    public $order;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Re-load the order to ensure items and user are attached
            $this->order->load(['user', 'event', 'items']);
            
            $email = $this->order->user->email ?? null;

            if ($email) {
                Mail::to($email)->send(new TicketEmail($this->order));
            } else {
                Log::warning("Cannot send Ticket email. User email is missing for Order #{$this->order->order_id}");
            }
        } catch (\Exception $e) {
            Log::error("Failed to send ticket email: " . $e->getMessage());
            // Based on queue configurations, you might want to throw the exception to trigger retry logic
            throw $e;
        }
    }
}
