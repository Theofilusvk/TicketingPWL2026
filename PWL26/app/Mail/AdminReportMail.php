<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Attachment;

class AdminReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public $reportType;
    public $pdfContent;

    /**
     * Create a new message instance.
     */
    public function __construct($reportType, $pdfContent)
    {
        $this->reportType = $reportType;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[VORTEX] Report: ' . ucfirst(str_replace('-', ' ', $this->reportType)),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin_report',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfContent, 'vortex_report_' . $this->reportType . '_' . date('Ymd_His') . '.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
