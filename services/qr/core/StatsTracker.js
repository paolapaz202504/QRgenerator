const fs = require('fs');
const path = require('path');
const userRepository = require('../../../repositories/UserRepository');
const statsRepository = require('../../../repositories/StatsRepository');
const historyRepository = require('../../../repositories/HistoryRepository');
const gcsService = require('../../GCSService');

class StatsTracker {
  async trackDownload(params) {
    const { userEmail, title, url, format = 'png', resolution = 800, imageDataUrl } = params;

    if (!userEmail || userEmail.trim() === '' || userEmail.toLowerCase().includes('invitado@anonimo')) {
      return {
        success: false,
        authRequired: true,
        message: 'Para descargar tu código QR debes estar registrado.'
      };
    }

    const emailKey = userEmail.toLowerCase().trim();
    let user = userRepository.findByEmail(emailKey);

    if (!user) {
      user = {
        id: 'user_' + Date.now(),
        name: emailKey.split('@')[0],
        email: emailKey,
        provider: 'Registered',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emailKey)}`,
        plan: 'free',
        maxDownloads: 20,
        generationsCount: 1,
        downloadsCount: 0,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      await userRepository.saveUser(user);
    }

    const maxLimit = user.maxDownloads || 20;
    const currentDownloads = user.downloadsCount || 0;

    if (user.plan === 'free' && currentDownloads >= maxLimit) {
      return {
        success: false,
        limitReached: true,
        message: `Has alcanzado el límite gratuito de ${maxLimit} descargas. ¡Apoya con una donación o pasa a Pro para descargas ilimitadas!`
      };
    }

    let savedImagePath = null;
    const qrId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    if (imageDataUrl && imageDataUrl.startsWith('data:image')) {
      const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `${qrId}.${format === 'svg' ? 'svg' : 'png'}`;
      const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
      
      savedImagePath = await gcsService.saveBufferToCloud(`Downloaded/${emailKey}/${fileName}`, buffer, contentType);
    }

    const historyEntry = {
      id: qrId,
      userEmail: emailKey,
      title: title || 'Código QR',
      url: url || 'https://qrfy.com',
      format,
      resolution,
      imagePath: savedImagePath,
      imageDataUrl: imageDataUrl,
      createdAt: new Date().toISOString()
    };

    await historyRepository.addHistoryEntry(emailKey, historyEntry);
    await statsRepository.incrementDownloads();

    user.downloadsCount = (user.downloadsCount || 0) + 1;
    await userRepository.saveUser(user);

    return {
      success: true,
      message: 'Descarga registrada y guardada exitosamente en la nube.',
      savedQr: historyEntry,
      userStats: {
        downloadsCount: user.downloadsCount,
        generationsCount: user.generationsCount || 1,
        maxDownloads: user.maxDownloads || 20,
        remainingDownloads: Math.max(0, (user.maxDownloads || 20) - user.downloadsCount),
        plan: user.plan || 'free'
      }
    };
  }



}
module.exports = new StatsTracker();