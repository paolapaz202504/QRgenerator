/**
 * ApiService - Encapsulates all backend HTTP API communications.
 * Follows Single Responsibility Principle (SOLID).
 */
export class ApiService {
  static async getConfig() {
    try {
      const res = await fetch('/api/config');
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Error fetching config:', err);
      return { success: false, googleClientId: '' };
    }
  }

  static async getDesigns() {
    try {
      const res = await fetch('/api/designs');
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Error fetching designs:', err);
      return { success: false, categories: [], designs: [], patterns: [] };
    }
  }

  static async generateQR(payload) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const error = new Error(data.message || 'Error al generar código QR');
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return await res.blob();
  }

  static async trackDownload(payload) {
    const res = await fetch('/api/track-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  static async getUserHistory(email) {
    try {
      const url = email ? `/api/user/history?email=${encodeURIComponent(email)}` : '/api/user/history';
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Error fetching history:', err);
      return { success: false, history: [] };
    }
  }

  static async getUserStats(email) {
    try {
      const url = email ? `/api/user/stats?email=${encodeURIComponent(email)}` : '/api/user/stats';
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Error fetching user stats:', err);
      return { success: false, userStats: null };
    }
  }

  static async oauthLogin(provider, email, name) {
    const res = await fetch('/api/auth/oauth-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, email, name })
    });
    return await res.json();
  }
}
