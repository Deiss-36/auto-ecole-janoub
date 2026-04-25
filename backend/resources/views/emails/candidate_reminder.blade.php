<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notification - Auto École Janoub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; color: #333; }
        .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: #1A1A1A; padding: 36px 40px; text-align: center; }
        .logo-circle { width: 80px; height: 80px; background: #FFD700; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .logo-circle span { font-size: 0.65rem; font-weight: 800; color: #1A1A1A; text-align: center; line-height: 1.2; letter-spacing: 0.5px; }
        .header h1 { color: #FFD700; font-size: 1.5rem; font-weight: 800; letter-spacing: 2px; margin-bottom: 4px; }
        .header p { color: rgba(255,255,255,0.5); font-size: 0.8rem; letter-spacing: 1px; }
        .body { padding: 40px; }
        .greeting { font-size: 1.2rem; font-weight: 700; color: #1A1A1A; margin-bottom: 12px; }
        .intro { color: #555; line-height: 1.7; margin-bottom: 28px; font-size: 0.95rem; }
        
        .message-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 28px; }
        .message-box p { font-size: 0.95rem; color: #92400E; line-height: 1.6; white-space: pre-wrap; }

        .balance-box { display: flex; align-items: center; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
        .balance-icon { width: 48px; height: 48px; background: #FEE2E2; color: #DC2626; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-right: 16px; }
        .balance-details h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #9CA3AF; font-weight: 600; margin-bottom: 4px; }
        .balance-details .amount { font-size: 1.5rem; color: #1A1A1A; font-weight: 800; }

        .cta-btn { display: block; background: #1A1A1A; color: #FFD700; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 800; font-size: 1rem; letter-spacing: 1px; margin-bottom: 28px; transition: all 0.3s ease; }
        .cta-btn:hover { background: #333; }

        .footer { background: #F9FAFB; padding: 24px 40px; text-align: center; border-top: 1px solid #E5E7EB; }
        .footer p { font-size: 0.75rem; color: #9CA3AF; line-height: 1.8; }
        .footer strong { color: #6B7280; }
    </style>
</head>
<body>
<div class="wrapper">
    <!-- Header -->
    <div class="header">
        <div class="logo-circle">
            <span>AUTO<br>ÉCOLE<br>JANOUB</span>
        </div>
        <h1>JANOUB</h1>
        <p>SYSTÈME DE GESTION · AUTO ÉCOLE</p>
    </div>

    <!-- Body -->
    <div class="body">
        <div class="greeting">Bonjour {{ $userName }},</div>
        <p class="intro">
            L'administration d'<strong>Auto École Janoub</strong> souhaite vous communiquer le message suivant concernant votre dossier :
        </p>

        <!-- Message Content -->
        <div class="message-box">
            <p>{{ $messageContent }}</p>
        </div>

        <!-- Financial Balance (only show if there is a remaining balance) -->
        @if($balance > 0)
        <div class="balance-box">
            <div class="balance-icon">💰</div>
            <div class="balance-details">
                <h3>Reste à payer</h3>
                <div class="amount">{{ $balance }} DH</div>
            </div>
        </div>
        @endif

        <p class="intro">
            Nous vous prions de bien vouloir régulariser votre situation ou contacter l'administration dans les plus brefs délais si nécessaire.
        </p>

        <!-- CTA -->
        <a href="{{ $loginUrl }}" class="cta-btn">
            ACCÉDER À MON ESPACE
        </a>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>
            <strong>Auto École Janoub</strong> · Marrakech, Maroc<br>
            📞 0699 454 621 -·- 0660 606 536<br><br>
            Cet email a été envoyé automatiquement par le secrétariat.<br>
            © 2026 Auto École Janoub — Système de Gestion V2.0
        </p>
    </div>
</div>
</body>
</html>
