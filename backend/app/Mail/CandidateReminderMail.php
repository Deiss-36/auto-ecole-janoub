<?php

namespace App\Mail;

use App\Models\Candidate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CandidateReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Candidate $candidate,
        public readonly string $messageContent
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Notification Importante - Auto École Janoub',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.candidate_reminder',
            with: [
                'userName'       => $this->candidate->user->name,
                'messageContent' => $this->messageContent,
                'balance'        => $this->candidate->remaining_balance,
                'loginUrl'       => 'http://localhost:3000/login',
            ],
        );
    }
}
