<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CandidateWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User   $user,
        public readonly string $password,
        public readonly string $licenseType
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎓 Bienvenue à Auto École Janoub — Votre compte est créé !',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.candidate_welcome',
            with: [
                'userName'    => $this->user->name,
                'userEmail'   => $this->user->email,
                'password'    => $this->password,
                'licenseType' => $this->licenseType,
                'loginUrl'    => config('app.frontend_url') . '/login',
            ],
        );
    }
}
