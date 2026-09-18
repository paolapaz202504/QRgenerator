require('dotenv').config();

class Config {
  constructor() {
    this.port = process.env.PORT || 3030;
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.isProduction = (process.env.NODE_ENV === 'production') || (process.env.RENDER === 'true');
    this.envFolder = this.isProduction ? 'prod' : 'dev';
    this.gcsBucketName = process.env.GCS_BUCKET_NAME || 'qr-studio-pro-bucket';
    this.googleClientId = process.env.GOOGLE_CLIENT_ID || '';
  }
}

module.exports = new Config();
