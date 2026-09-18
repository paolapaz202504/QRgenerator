const express = require('express');
const path = require('path');
const config = require('./config/env');
const userRepository = require('./repositories/UserRepository');
const historyRepository = require('./repositories/HistoryRepository');
const statsRepository = require('./repositories/StatsRepository');

const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const qrRoutes = require('./routes/qrRoutes');
const userRoutes = require('./routes/userRoutes');

class Server {
  constructor() {
    this.app = express();
    this.port = config.port;

    this.configureMiddleware();
    this.configureRoutes();
  }

  configureMiddleware() {
    this.app.use(express.json({ limit: '25mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '25mb' }));
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  configureRoutes() {
    this.app.use('/api/config', configRoutes);
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api', qrRoutes);
    this.app.use('/api/user', userRoutes);
  }

  async initRepositories() {
    console.log(`[GCS Cloud Sync ☁️] Inicializando capa de repositorios desde Google Cloud Storage (${config.envFolder.toUpperCase()})...`);
    await userRepository.initSync();
    await historyRepository.initSync();
    await statsRepository.initSync();
  }

  async start() {
    await this.initRepositories();

    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor QR Generator corriendo en http://localhost:${this.port}`);
    });
  }
}

const server = new Server();
server.start();
