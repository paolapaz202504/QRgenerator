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
    console.log(`[Google Cloud Storage] ✅ Conectado en Memoria | Entorno: '${ENV_FOLDER.toUpperCase()}' | Bucket: '${BUCKET_NAME}'`);
  } else {
    console.log(`[Google Cloud Storage] ℹ️ Sin credenciales GCS. Operando en memoria temporal ('${ENV_FOLDER}').`);
  }
} catch (err) {
  console.warn(`[Google Cloud Storage] ⚠️ No se pudo inicializar GCS:`, err.message);
}

// Read JSON directly from GCS into JS object (in-memory, no disk write)
async function readJsonFromCloud(remotePath, defaultValue = {}) {
  if (!bucket) return defaultValue;
  try {
    const fullRemotePath = `${ENV_FOLDER}/${remotePath}`;
    const file = bucket.file(fullRemotePath);
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

// Save JS object directly to GCS as JSON string (in-memory Buffer, no disk write)
async function saveJsonToCloud(remotePath, dataObject) {
  if (!bucket) return false;
  try {
    const fullRemotePath = `${ENV_FOLDER}/${remotePath}`;
    const file = bucket.file(fullRemotePath);
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

// Save Buffer (e.g. image PNG/SVG) directly to GCS (in-memory Buffer, no disk write)
async function saveBufferToCloud(remotePath, buffer, contentType = 'image/png') {
  if (!bucket) return null;
  try {
    const fullRemotePath = `${ENV_FOLDER}/${remotePath}`;
    const file = bucket.file(fullRemotePath);
    await file.save(buffer, {
      contentType: contentType,
      resumable: false
    });
    console.log(`[GCS Buffer Save 📷] Imagen subida directamente a GCS: ${fullRemotePath}`);
    return `https://storage.googleapis.com/${BUCKET_NAME}/${fullRemotePath}`;
  } catch (err) {
    console.error(`[GCS Buffer Save Error] ${remotePath}:`, err.message);
    return null;
  }
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

// List files matching prefix directly in GCS
async function listFilesInCloud(folderPrefix) {
  if (!bucket) return [];
  try {
    const fullPrefix = `${ENV_FOLDER}/${folderPrefix}`;
    const [files] = await bucket.getFiles({ prefix: fullPrefix });
    return files.map(f => f.name.replace(`${ENV_FOLDER}/`, ''));
  } catch (err) {
    console.error(`[GCS List Error] ${folderPrefix}:`, err.message);
    return [];
  }
}

ensureBucketExists();

module.exports = {
  isConfigured: () => !!bucket,
  getEnv: () => ENV_FOLDER,
  readJsonFromCloud,
  saveJsonToCloud,
  saveBufferToCloud,
  listFilesInCloud
};
