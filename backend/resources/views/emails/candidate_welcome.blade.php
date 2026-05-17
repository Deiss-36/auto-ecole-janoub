<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue à Auto École Janoub</title>
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
        .license-badge { display: inline-block; background: #FEF3C7; color: #92400E; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; margin-bottom: 28px; border: 1px solid #FCD34D; }
        .credentials-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; margin-bottom: 28px; }
        .credentials-box h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #9CA3AF; font-weight: 600; margin-bottom: 16px; }
        .cred-row { display: flex; align-items: center; margin-bottom: 12px; }
        .cred-row:last-child { margin-bottom: 0; }
        .cred-icon { width: 36px; height: 36px; background: #1A1A1A; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 14px; flex-shrink: 0; font-size: 0.9rem; }
        .cred-label { font-size: 0.75rem; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .cred-value { font-size: 0.95rem; color: #1A1A1A; font-weight: 700; font-family: 'Courier New', monospace; }
        .cta-btn { display: block; background: #FFD700; color: #1A1A1A; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-weight: 800; font-size: 1rem; letter-spacing: 1px; margin-bottom: 28px; }
        .info-row { display: flex; gap: 12px; margin-bottom: 28px; }
        .info-item { flex: 1; background: #F9FAFB; border-radius: 10px; padding: 14px 16px; border: 1px solid #E5E7EB; }
        .info-item .icon { font-size: 1.2rem; margin-bottom: 6px; }
        .info-item .label { font-size: 0.7rem; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .info-item .val { font-size: 0.85rem; color: #1A1A1A; font-weight: 700; }
        .warning-box { background: #FEF3C7; border-left: 4px solid #FFD700; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 28px; }
        .warning-box p { font-size: 0.85rem; color: #92400E; line-height: 1.6; }
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
        <div class="greeting">Bonjour {{ $userName }} 👋</div>
        <p class="intro">
            Votre inscription à <strong>Auto École Janoub</strong> a été enregistrée avec succès. 
            Vous pouvez dès maintenant accéder à votre espace personnel et suivre votre progression vers l'obtention du permis de conduire.
        </p>

        <!-- Badge permis -->
        <div>
            <span class="license-badge">📋 Permis {{ $licenseType }} inscrit</span>
        </div>

        <!-- Credentials -->
        <div class="credentials-box">
            <h3>🔐 Vos identifiants de connexion</h3>
            <div class="cred-row">
                <div class="cred-icon">✉️</div>
                <div>
                    <div class="cred-label">Email</div>
                    <div class="cred-value">{{ $userEmail }}</div>
                </div>
            </div>

        </div>

        <!-- CTA -->
        <a href="{{ $loginUrl }}" class="cta-btn">
            🚀 ACCÉDER À MON ESPACE CANDIDAT
        </a>

        <!-- Info items -->
        <div class="info-row">
            <div class="info-item">
                <div class="icon">📅</div>
                <div class="label">Horaires</div>
                <div class="val">Lun – Sam · 8h – 20h</div>
            </div>
            <div class="info-item">
                <div class="icon">📍</div>
                <div class="label">Adresse</div>
                <div class="val">Marrakech, Maroc</div>
            </div>
            <div class="info-item">
                <div class="icon">📞</div>
                <div class="label">Contact</div>
                <div class="val">0699 454 621</div>
            </div>
        </div>

        <!-- Warning -->
        <div class="warning-box">
            <p>
                ⚠️ <strong>Sécurité :</strong> Nous vous recommandons de changer votre mot de passe lors de votre première connexion. 
                Ne partagez jamais vos identifiants avec quelqu'un d'autre.
            </p>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>
            <strong>Auto École Janoub</strong> · Marrakech, Maroc<br>
            📞 0699 454 621 -·- 0660 606 536<br><br>
            Cet email a été envoyé automatiquement. Merci de ne pas y répondre.<br>
            © 2026 Auto École Janoub — Système de Gestion V2.0
        </p>
    </div>
</div>
</body>
</html>
