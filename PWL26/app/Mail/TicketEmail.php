<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TicketEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $user;
    public $orderItems;
    public $ticketCodes;

    public function __construct($order, $user, $orderItems, $ticketCodes)
    {
        $this->order = $order;
        $this->user = $user;
        $this->orderItems = $orderItems;
        $this->ticketCodes = $ticketCodes;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'E-Ticket Konfirmasi - Vortex Systems',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.ticket',
        );
    }
}
