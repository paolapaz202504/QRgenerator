const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const userRepository = require('./repositories/UserRepository');
const historyRepository = require('./repositories/HistoryRepository');
const statsRepository = require('./repositories/StatsRepository');
const auditRepository = require('./repositories/AuditRepository');
const databaseService = require('./services/DatabaseService');

const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const qrRoutes = require('./routes/qrRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

class Server {
  constructor() {
    this.app = express();
    this.port = config.port;

    this.configureMiddleware();
    this.configureRoutes();
  }

  configureMiddleware() {
    // 1. Security Headers with Helmet (permite CDNs de Tailwind, Fonts, Google Identity)
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));

    // 2. Rate Limiting for API protection
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 300, // 300 peticiones por ventana por IP
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: 'Demasiadas peticiones. Por favor inténtalo más tarde.' }
    });

    const qrGenerateLimiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 60, // 60 generaciones por minuto
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: 'Límite de generación por minuto excedido.' }
    });

    this.app.use('/api/', apiLimiter);
    this.app.use('/api/generate', qrGenerateLimiter);

    // 3. Body Parsing
    this.app.use(express.json({ limit: '25mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '25mb' }));

    // 4. Static Assets with Cache Control & Instant Version Revalidation
    this.app.get(['/', '/index.html'], (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // SEO Endpoints explícitos para Googlebot, Bingbot y rastreadores
    this.app.get('/robots.txt', (req, res) => {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
    });

    this.app.get('/sitemap.xml', (req, res) => {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
    });

    // Landing Pages Verticales (GEO / SEO Nichos de Mercado)
    this.app.get('/restaurantes', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'restaurantes.html'));
    });

    this.app.get('/salones-belleza', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'salones-belleza.html'));
    });

    this.app.get('/comercios', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'comercios.html'));
    });

    // Página Sobre Nosotros y Transparencia (E-E-A-T)
    this.app.get('/sobre-nosotros', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'sobre-nosotros.html'));
    });

    this.app.get('/nosotros', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'nosotros.html'));
    });

    // Documentación API para Desarrolladores y Agentes de IA (MCP)
    this.app.get('/api', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'api.html'));
    });

    this.app.use(express.static(path.join(__dirname, 'public'), {
      maxAge: '0',
      etag: true,
      setHeaders: (res, filePath) => {
        // Enforce anti-cache headers for all web assets to guarantee instant update on regular F5
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
      }
    }));
  }

  configureRoutes() {
    // Endpoints de salud y diagnóstico (UptimeRobot & Render)
    this.app.use('/api', healthRoutes);
    
    // Configuración y Autenticación
    this.app.use('/api/config', configRoutes);
    this.app.use('/api/auth', authRoutes);
    
    // Generación y descarga de códigos QR
    this.app.use('/api', qrRoutes);
    
    // Perfil de usuario y estadísticas
    this.app.use('/api/user', userRoutes);
    this.app.use('/api/users', userRoutes);
    
    // Pasarela de Pagos Recurrente
    this.app.use('/api/payment', paymentRoutes);
  }

  async initRepositories() {
    console.log(`[GCS Cloud Sync ☁️] Inicializando capa de repositorios desde Google Cloud Storage (${config.envFolder.toUpperCase()})...`);
    await databaseService.initialize();
    await userRepository.initSync();
    await historyRepository.initSync();
    await statsRepository.initSync();
    await auditRepository.initSync();
  }

  async start() {
    // Iniciar escucha HTTP inmediatamente para disponibilidad instantánea (<50ms)
    this.server = this.app.listen(this.port, () => {
      console.log(`🚀 Servidor QR Generator corriendo en http://localhost:${this.port}`);
      console.log(`🩺 Health check disponible en http://localhost:${this.port}/api/health`);
    });

    // Sincronizar capa de persistencia en caliente sin bloquear el arranque del puerto
    try {
      await this.initRepositories();
      console.log('✅ Capa de persistencia y repositorios sincronizados exitosamente.');
    } catch (err) {
      console.error('❌ Error inicializando persistencia en segundo plano:', err.message);
    }
  }
}

const server = new Server();
server.start();
