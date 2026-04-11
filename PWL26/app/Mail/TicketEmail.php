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
    public $tickets;
    public $pdfContent;

    public function __construct($order, $user, $orderItems, $tickets, $pdfContent = null)
    {
        $this->order = $order;
        $this->user = $user;
        $this->orderItems = $orderItems;
        $this->tickets = $tickets;
        $this->pdfContent = $pdfContent;
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

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];
        if ($this->pdfContent) {
            $attachments[] = \Illuminate\Mail\Mailables\Attachment::fromData(fn () => $this->pdfContent, 'E-Ticket_Vortex.pdf')
                    ->withMime('application/pdf');
        }
        return $attachments;
    }
}
