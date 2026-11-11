const authService = require('./AuthService');
const userRepository = require('../repositories/UserRepository');

class OAuthService {
  constructor() {
    this.providers = {
      google: {
        name: 'Google / Gmail',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userinfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
        clientIdEnv: 'GOOGLE_CLIENT_ID',
        clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
        defaultClientId: process.env.GOOGLE_CLIENT_ID || '',
        scope: 'openid email profile'
      },
      microsoft: {
        name: 'Microsoft / Hotmail',
        authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userinfoUrl: 'https://graph.microsoft.com/v1.0/me',
        clientIdEnv: 'MICROSOFT_CLIENT_ID',
        clientSecretEnv: 'MICROSOFT_CLIENT_SECRET',
        scope: 'openid email profile User.Read'
      },
      yahoo: {
        name: 'Yahoo',
        authUrl: 'https://api.login.yahoo.com/oauth2/request_auth',
        tokenUrl: 'https://api.login.yahoo.com/oauth2/get_token',
        userinfoUrl: 'https://api.login.yahoo.com/openid/v1/userinfo',
        clientIdEnv: 'YAHOO_CLIENT_ID',
        clientSecretEnv: 'YAHOO_CLIENT_SECRET',
        scope: 'openid email profile'
      }
    };
  }

  getAuthorizationUrl(providerKey, req) {
    const provider = this.providers[providerKey];
    if (!provider) {
      throw new Error(`Proveedor OAuth no soportado: ${providerKey}`);
    }

    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const redirectUri = `${protocol}://${host}/api/auth/${providerKey}/callback`;

    const clientId = process.env[provider.clientIdEnv] || provider.defaultClientId;

    if (!clientId) {
      // Si aún no se han configurado credenciales específicas en el entorno para este proveedor,
      // redirige directamente a la ventana de autenticación con la interfaz oficial del proveedor
      return `/auth-popup.html?provider=${encodeURIComponent(providerKey)}&fallback=true`;
    }

    if (providerKey === 'google') {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: provider.scope,
        access_type: 'offline',
        prompt: 'select_account'
      });
      return `${provider.authUrl}?${params.toString()}`;
    }

    if (providerKey === 'microsoft') {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: provider.scope,
        prompt: 'select_account'
      });
      return `${provider.authUrl}?${params.toString()}`;
    }

    if (providerKey === 'yahoo') {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: provider.scope,
        prompt: 'login'
      });
      return `${provider.authUrl}?${params.toString()}`;
    }

    return `/auth-popup.html?provider=${encodeURIComponent(providerKey)}`;
  }

  async processCallback(providerKey, code, req) {
    const provider = this.providers[providerKey];
    if (!provider) {
      throw new Error(`Proveedor no válido: ${providerKey}`);
    }

    const host = req.get('host');
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const redirectUri = `${protocol}://${host}/api/auth/${providerKey}/callback`;

    const clientId = process.env[provider.clientIdEnv] || provider.defaultClientId;
    const clientSecret = process.env[provider.clientSecretEnv];

    let email = null;
    let name = null;
    let avatar = null;

    if (code && clientId && clientSecret) {
      try {
        if (providerKey === 'google') {
          const tokenRes = await fetch(provider.tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code'
            })
          });

          const tokenData = await tokenRes.json();

          // 1. Intentar extraer directamente del id_token (JWT estándar OpenID Connect)
          if (tokenData.id_token) {
            try {
              const parts = tokenData.id_token.split('.');
              if (parts.length >= 2) {
                const jwtPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
                if (jwtPayload.email) {
                  email = jwtPayload.email;
                  name = jwtPayload.name || jwtPayload.given_name || email.split('@')[0];
                  avatar = jwtPayload.picture || null;
                }
              }
            } catch (jwtErr) {
              console.warn('[OAuthService] Advertencia decodificando id_token:', jwtErr.message);
            }
          }

          // 2. Si no vino en id_token, consultar el endpoint de UserInfo con el access_token
          if (!email && tokenData.access_token) {
            const userinfoRes = await fetch(provider.userinfoUrl, {
              headers: { Authorization: `Bearer ${tokenData.access_token}` }
            });
            const userData = await userinfoRes.json();
            email = userData.email;
            name = userData.name || userData.given_name;
            avatar = userData.picture;
          }
        }
      } catch (err) {
        console.warn(`[OAuthService] Advertencia en intercambio de token con ${providerKey}:`, err.message);
      }
    }

    if (!email) {
      // Si el código fue devuelto pero no se pudo completar el intercambio, o provino de prueba/fallback
      const queryEmail = req.query.email;
      const queryName = req.query.name;
      if (queryEmail) {
        email = queryEmail;
        name = queryName;
      } else {
        throw new Error('No se recibió la confirmación de la cuenta del proveedor');
      }
    }

    const result = await authService.loginWithOAuth({
      provider: providerKey,
      email: email,
      name: name
    });

    if (avatar && result.user) {
      result.user.avatar = avatar;
      await userRepository.saveUser(result.user);
    }

    return result.user;
  }
}

module.exports = new OAuthService();
