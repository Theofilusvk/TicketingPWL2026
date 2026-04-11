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
    public $csvContent;

    /**
     * Create a new message instance.
     */
    public function __construct($reportType, $csvContent)
    {
        $this->reportType = $reportType;
        $this->csvContent = $csvContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Vortex Admin Report: ' . ucfirst(str_replace('-', ' ', $this->reportType)),
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
            Attachment::fromData(fn () => $this->csvContent, 'vortex_report_' . $this->reportType . '_' . date('Ymd_His') . '.csv')
                ->withMime('text/csv'),
        ];
    }
}
