const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const config = require('../config/env');

class GCSService {
  constructor() {
    this.envFolder = config.envFolder;
    this.bucketName = config.gcsBucketName;
    this.storage = null;
    this.bucket = null;
    this.keyPath = path.join(__dirname, '..', 'gcs-key.json');

    this.initStorage();
  }

  initStorage() {
    try {
      let credentials = null;

      if (process.env.GCS_KEY_JSON) {
        try {
          credentials = JSON.parse(process.env.GCS_KEY_JSON);
        } catch (e) {
          console.error('[GCS Error] Error al parsear GCS_KEY_JSON:', e.message);
        }
      } else if (process.env.GCS_KEY_BASE64) {
        try {
          credentials = JSON.parse(Buffer.from(process.env.GCS_KEY_BASE64, 'base64').toString('utf8'));
        } catch (e) {
          console.error('[GCS Error] Error al parsear GCS_KEY_BASE64:', e.message);
        }
      } else if (fs.existsSync(this.keyPath)) {
        credentials = JSON.parse(fs.readFileSync(this.keyPath, 'utf8'));
      }

      if (credentials) {
        this.storage = new Storage({ credentials });
        this.bucket = this.storage.bucket(this.bucketName);
        console.log(`[Google Cloud Storage] ✅ Conectado en Memoria | Entorno: '${this.envFolder.toUpperCase()}' | Bucket: '${this.bucketName}'`);
        this.ensureBucketExists();
      } else {
        console.log(`[Google Cloud Storage] ℹ️ Sin credenciales GCS. Operando en memoria temporal ('${this.envFolder}').`);
      }
    } catch (err) {
      console.warn(`[Google Cloud Storage] ⚠️ No se pudo inicializar GCS:`, err.message);
    }
  }

  isConfigured() {
    return !!this.bucket;
  }

  getEnv() {
    return this.envFolder;
  }

  async ensureBucketExists() {
    if (!this.storage || !this.bucket) return;
    try {
      const [exists] = await this.bucket.exists();
      if (!exists) {
        console.log(`[Google Cloud Storage] El bucket '${this.bucketName}' no existe. Creando en GCP...`);
        await this.storage.createBucket(this.bucketName, {
          location: 'US',
          storageClass: 'STANDARD'
        });
        console.log(`[Google Cloud Storage] ✅ Bucket '${this.bucketName}' creado exitosamente.`);
      }
    } catch (err) {
      console.warn(`[GCS Info] Verificación de bucket:`, err.message);
    }
  }

  async readJsonFromCloud(remotePath, defaultValue = {}) {
    if (!this.bucket) return defaultValue;
    try {
      const fullRemotePath = `${this.envFolder}/${remotePath}`;
      const file = this.bucket.file(fullRemotePath);
      const [exists] = await file.exists();
      if (exists) {
        const [buffer] = await file.download();
        const content = buffer.toString('utf8');
        console.log(`[GCS Read ☁️] Leído desde GCS: ${fullRemotePath}`);
        return JSON.parse(content);
      }
    } catch (err) {
      console.error(`[GCS Read Error] ${remotePath}:`, err.message);
    }
    return defaultValue;
  }

  async saveJsonToCloud(remotePath, dataObject) {
    if (!this.bucket) return false;
    try {
      const fullRemotePath = `${this.envFolder}/${remotePath}`;
      const file = this.bucket.file(fullRemotePath);
      const jsonString = JSON.stringify(dataObject, null, 2);
      await file.save(jsonString, {
        contentType: 'application/json',
        resumable: false
      });
      console.log(`[GCS Save ☁️] Guardado directo en Cloud: ${fullRemotePath}`);
      return true;
    } catch (err) {
      console.error(`[GCS Save Error] ${remotePath}:`, err.message);
      return false;
    }
  }

  async saveBufferToCloud(remotePath, buffer, contentType = 'image/png') {
    if (!this.bucket) return null;
    try {
      const fullRemotePath = `${this.envFolder}/${remotePath}`;
      const file = this.bucket.file(fullRemotePath);
      await file.save(buffer, {
        contentType: contentType,
        resumable: false
      });
      console.log(`[GCS Buffer Save 📷] Imagen subida directamente a GCS: ${fullRemotePath}`);
      return `https://storage.googleapis.com/${this.bucketName}/${fullRemotePath}`;
    } catch (err) {
      console.error(`[GCS Buffer Save Error] ${remotePath}:`, err.message);
      return null;
    }
  }

  async listFilesInCloud(folderPrefix) {
    if (!this.bucket) return [];
    try {
      const fullPrefix = `${this.envFolder}/${folderPrefix}`;
      const [files] = await this.bucket.getFiles({ prefix: fullPrefix });
      return files.map(f => f.name.replace(`${this.envFolder}/`, ''));
    } catch (err) {
      console.error(`[GCS List Error] ${folderPrefix}:`, err.message);
      return [];
    }
  }
}

module.exports = new GCSService();
