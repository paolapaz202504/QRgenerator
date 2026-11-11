const authService = require('../services/AuthService');
const oauthService = require('../services/OAuthService');

class AuthController {
  async oauthLogin(req, res) {
    try {
      const result = await authService.loginWithOAuth(req.body);
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  authorize(req, res) {
    const provider = req.params.provider;
    try {
      const authUrl = oauthService.getAuthorizationUrl(provider, req);
      return res.redirect(authUrl);
    } catch (err) {
      return res.status(400).send(`Error en autorización OAuth: ${err.message}`);
    }
  }

  async callback(req, res) {
    const provider = req.params.provider;
    const code = req.query.code;
    const error = req.query.error;

    if (error) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Cancelado</title></head>
        <body style="font-family:sans-serif; text-align:center; padding-top:40px;">
          <p style="color:#e11d48; font-weight:bold;">Inicio de sesión cancelado o denegado por el proveedor (${error}).</p>
          <script>setTimeout(function(){ window.close(); }, 2000);</script>
        </body>
        </html>
      `);
    }

    try {
      const user = await oauthService.processCallback(provider, code, req);

      const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Autenticación Exitosa</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f8fafc;
              color: #0f172a;
            }
            .card {
              background: white;
              padding: 24px 32px;
              border-radius: 16px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
              text-align: center;
            }
            .spinner {
              width: 32px;
              height: 32px;
              border: 3px solid #e2e8f0;
              border-top-color: #4f46e5;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin: 0 auto 16px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h3 style="margin:0 0 8px;">¡Identificación Exitosa!</h3>
            <p style="margin:0; font-size:13px; color:#64748b;">Retornando a QRbey y cerrando ventana...</p>
          </div>
          <script>
            try {
              const payload = {
                type: 'QRBEY_OAUTH_SUCCESS',
                provider: ${JSON.stringify(provider)},
                email: ${JSON.stringify(user.email)},
                name: ${JSON.stringify(user.name)},
                user: ${JSON.stringify(user)}
              };

              // 1. Guardar en storage local para sincronización inmediata
              localStorage.setItem('qrbey_pending_oauth', JSON.stringify(payload));
              localStorage.setItem('oauth_user', JSON.stringify(${JSON.stringify(user)}));

              // 2. Comunicar a ventana principal
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage(payload, '*');
                if (typeof window.opener.handleOAuthSuccess === 'function') {
                  window.opener.handleOAuthSuccess(payload);
                }
                setTimeout(function() { window.close(); }, 300);
              } else {
                // Fallback seguro: si el navegador desvinculó window.opener, retornar directamente al home
                setTimeout(function() { window.location.replace('/'); }, 400);
              }
            } catch (e) {
              console.error(e);
              setTimeout(function() { window.location.replace('/'); }, 500);
            }
          </script>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    } catch (err) {
      // Si falla la extracción automática, redirigir al popup oficial con los parámetros
      return res.redirect(`/auth-popup.html?provider=${encodeURIComponent(provider)}&error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = new AuthController();
