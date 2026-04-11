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
    public $isMerchandise;
    public $merchandiseOrders;

    public function __construct($order, $user, $orderItems, $tickets, $pdfContent = null, $isMerchandise = false, $merchandiseOrders = null)
    {
        $this->order = $order;
        $this->user = $user;
        $this->orderItems = $orderItems;
        $this->tickets = $tickets;
        $this->pdfContent = $pdfContent;
        $this->isMerchandise = $isMerchandise;
        $this->merchandiseOrders = $merchandiseOrders;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->isMerchandise ? 'Invoice Konfirmasi - Vortex Merchandise' : 'E-Ticket Konfirmasi - Vortex Systems',
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
            $filename = $this->isMerchandise ? 'Invoice_ORD-' . $this->order->order_id . '.pdf' : 'E-Ticket_Vortex.pdf';
            $attachments[] = \Illuminate\Mail\Mailables\Attachment::fromData(fn () => $this->pdfContent, $filename)
                    ->withMime('application/pdf');
        }
        return $attachments;
    }
}
