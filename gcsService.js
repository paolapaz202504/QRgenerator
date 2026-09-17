const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

// Environment Detection: Render / production => 'prod', local computer => 'dev'
const isProduction = (process.env.NODE_ENV === 'production') || (process.env.RENDER === 'true');
const ENV_FOLDER = isProduction ? 'prod' : 'dev';

const KEY_PATH = path.join(__dirname, 'gcs-key.json');
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'qr-studio-pro-bucket';

let storage = null;
let bucket = null;

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
  } else if (fs.existsSync(KEY_PATH)) {
    credentials = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  }

  if (credentials) {
    storage = new Storage({ credentials });
    bucket = storage.bucket(BUCKET_NAME);
    console.log(`[Google Cloud Storage] ✅ Conectado exitosamente | Entorno: '${ENV_FOLDER.toUpperCase()}' | Bucket: '${BUCKET_NAME}'`);
  } else {
    console.log(`[Google Cloud Storage] ℹ️ Sin credenciales GCS. Operando en modo local JSON en carpeta '${ENV_FOLDER}'.`);
  }
} catch (err) {
  console.warn(`[Google Cloud Storage] ⚠️ No se pudo inicializar GCS:`, err.message);
}

// Download file from GCS bucket
async function downloadFromCloud(remotePath, localPath) {
  if (!bucket) return false;
  try {
    const fullRemotePath = `${ENV_FOLDER}/${remotePath}`;
    const file = bucket.file(fullRemotePath);
    const [exists] = await file.exists();
    if (exists) {
      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      await file.download({ destination: localPath });
      console.log(`[GCS Sync ⬇️] Restaurado desde Cloud: ${fullRemotePath}`);
      return true;
    }
  } catch (err) {
    console.error(`[GCS Sync ❌ Error Descarga] ${remotePath}:`, err.message);
  }
  return false;
}

// Upload file to GCS bucket
async function uploadToCloud(localPath, remotePath) {
  if (!bucket || !fs.existsSync(localPath)) return false;
  try {
    const fullRemotePath = `${ENV_FOLDER}/${remotePath}`;
    await bucket.upload(localPath, {
      destination: fullRemotePath,
      resumable: false
    });
    console.log(`[GCS Sync ⬆️] Sincronizado en Cloud: ${fullRemotePath}`);
    return true;
  } catch (err) {
    console.error(`[GCS Sync ❌ Error Carga] ${remotePath}:`, err.message);
  }
  return false;
}

// Ensure bucket exists or create it
async function ensureBucketExists() {
  if (!storage || !bucket) return;
  try {
    const [exists] = await bucket.exists();
    if (!exists) {
      console.log(`[Google Cloud Storage] El bucket '${BUCKET_NAME}' no existe. Creando en GCP...`);
      await storage.createBucket(BUCKET_NAME, {
        location: 'US',
        storageClass: 'STANDARD'
      });
      console.log(`[Google Cloud Storage] ✅ Bucket '${BUCKET_NAME}' creado exitosamente.`);
    }
  } catch (err) {
    console.warn(`[GCS Info] Verificación de bucket:`, err.message);
  }
}

ensureBucketExists();

module.exports = {
  isConfigured: () => !!bucket,
  getEnv: () => ENV_FOLDER,
  downloadFromCloud,
  uploadToCloud
};
