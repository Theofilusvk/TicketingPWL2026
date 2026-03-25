<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class TicketMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $qr;

    /**
     * Create a new message instance.
     */
    public function __construct($order, $qr)
    {
        $this->order = $order;
        $this->qr = base64_encode($qr); // penting untuk ditampilkan di blade
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'E-Ticket Anda'
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket',
            with: [
                'order' => $this->order,
                'qr' => $this->qr
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
