const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');


const userRepository = require('../../../repositories/UserRepository');
const historyRepository = require('../../../repositories/HistoryRepository');
const statsRepository = require('../../../repositories/StatsRepository');
const auditRepository = require('../../../repositories/AuditRepository');
const config = require('../../../config/env');
const DesignLibrary = require('../config/DesignLibrary');

class CanvasGenerator {
  async generateCanvas(params) {
    const {
      url = 'QRbey',
      title = 'QRbery',
      bannerText = 'ESCANÉAME',
      designId = 'design-institucional-1',
      customColors = {},
      customDotStyle,
      customEyeStyle,
      targetWidth = 600,
      fontTitle = 'sans-serif',
      fontBanner = 'sans-serif',
      fontSizeTitle = 24,
      showIcon = true,
      showShield = true,
      iconMode = 'icon',
      iconName = 'fa-qrcode',
      iconPosition = 'center',
      iconColor = '#2563eb',
      iconBgColor = '#ffffff',
      iconBorderColor = '#2563eb',
      iconSize = 34,
      patternColor = '#475569',
      patternIntensity = 100,
      customLogoDataUrl = null,
      userEmail = null,
      isExplicitGenerate = false,
      format = 'png'
    } = params;

    let user = null;
    let planConfig = null;
    let userPlan = 'free';

    // Validación estricta y control de cuotas por generación
    if (isExplicitGenerate) {
      if (!userEmail) {
        return {
          success: false,
          authRequired: true,
          message: 'Es obligatorio iniciar sesión para generar tu código QR.'
        };
      }

      const emailKey = userEmail.toLowerCase().trim();
      user = userRepository.findByEmail(emailKey);
      if (!user) {
        user = {
          id: 'user_' + Date.now(),
          name: emailKey.split('@')[0],
          email: emailKey,
          provider: 'Registered',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emailKey)}`,
          plan: 'free',
          maxDownloads: 15,
          maxCredits: 50,
          generationsCount: 0,
          creditsUsed: 0,
          downloadsCount: 0,
          currentPeriod: new Date().toISOString().substring(0, 7),
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };
      }

      userPlan = user.plan || 'free';
      planConfig = config.getPlanConfig(userPlan);
      const maxDownloads = planConfig.maxDownloads;
      const currentGen = user.generationsCount || 0;

      if (currentGen >= maxDownloads) {
        return {
          success: false,
          limitReached: true,
          message: `Has alcanzado el límite de ${maxDownloads} códigos QR generados de tu ${planConfig.name}.`
        };
      }

      user.maxCredits = planConfig.maxCredits;
      user.maxDownloads = maxDownloads;
      user.generationsCount = currentGen + 1;
      await userRepository.saveUser(user);
      await statsRepository.incrementGenerations();
    }

    // SVG Export Mode
    if (format === 'svg') {
      try {
        const svgColor = customColors.qrColor || '#1e293b';
        const svgBg = customColors.bgColor || '#ffffff';
        const svgString = await QRCode.toString(url || 'QRbey', {
          type: 'svg',
          errorCorrectionLevel: 'H',
          margin: 2,
          color: {
            dark: svgColor,
            light: svgBg
          }
        });

        // Guardado automático y auditoría de trazabilidad de códigos QR SVG
        if (isExplicitGenerate && userEmail) {
          const emailKey = userEmail.toLowerCase().trim();
          const qrId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
          const creditsAtGen = user ? (user.creditsUsed || 0) : 0;
          const maxCredits = planConfig ? planConfig.maxCredits : 50;
          const remainingCredits = Math.max(0, maxCredits - creditsAtGen);
          const period = user ? (user.currentPeriod || new Date().toISOString().substring(0, 7)) : new Date().toISOString().substring(0, 7);
          const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;

          const historyEntry = {
            id: qrId,
            userEmail: emailKey,
            title: title || 'Código QR SVG',
            url: url || 'https://qrbey.com',
            format: 'svg',
            resolution: targetWidth || 600,
            creditsUsedAtGeneration: creditsAtGen,
            remainingCreditsAtGeneration: remainingCredits,
            planAtGeneration: userPlan,
            period: period,
            imageDataUrl: dataUrl,
            createdAt: new Date().toISOString()
          };

          await historyRepository.addHistoryEntry(emailKey, historyEntry);

          try {
            const dbService = require('../../../services/DatabaseService');
            if (dbService.isConnected()) {
              await dbService.insertQrGeneration(historyEntry);
            }
          } catch (e) {}

          await auditRepository.logAction({
            userEmail: emailKey,
            action: 'GENERATE_QR',
            creditsAtAction: creditsAtGen,
            remainingCredits: remainingCredits,
            generationsAtAction: user ? user.generationsCount : 1,
            plan: userPlan,
            period: period,
            metadata: { qrId, title: title || 'Código QR', url: url || '', format: 'svg', resolution: targetWidth || 600 }
          });
        }

        return {
          isSvg: true,
          data: svgString,
          contentType: 'image/svg+xml'
        };
      } catch (svgErr) {
        console.warn('[SVG Generation Error]:', svgErr.message);
      }
    }

    let loadedIconImg = null;
    if (customLogoDataUrl) {
      try {
        loadedIconImg = await loadImage(customLogoDataUrl);
      } catch (err) {
        console.warn('[QRGeneratorService] customLogoDataUrl loadImage fallback:', err.message);
      }
    }

    const design = DesignLibrary.designs.find(d => d.id === designId) || DesignLibrary.designs[0];
    const bgColor = params.bgColor || customColors.bgColor || design.bgColor;
    let qrSilhouetteMode = params.qrSilhouetteMode || customColors.qrSilhouetteMode || design.qrSilhouetteMode || 'none';
    if (qrSilhouetteMode === 'icon_pure') qrSilhouetteMode = 'icon_only';
    const skipWhiteCard = false;

    let primaryQrColor = params.qrColor || customColors.qrColor || design.qrColor || '#111827';
    let activeQrColor = primaryQrColor;

    const activeEyeColor = params.eyeColor || customColors.eyeColor || params.customEyeColor || primaryQrColor;
    const activeIconColor = params.iconColor || customColors.iconColor || iconColor || activeQrColor;
    const activeIconBgColor = params.iconBgColor || customColors.iconBgColor || iconBgColor || '#ffffff';
    const activeIconBorderColor = params.iconBorderColor || customColors.iconBorderColor || iconBorderColor || activeQrColor;
    const activePatternColor = params.patternColor || customColors.patternColor || design.patternColor || patternColor || '#475569';
    const activeSilhouetteColor = params.silhouetteColor || customColors.silhouetteColor || design.silhouetteColor || '#2563eb';
    const activePatternIntensity = (params.patternIntensity !== undefined && params.patternIntensity !== null)
      ? parseInt(params.patternIntensity, 10)
      : ((customColors.patternIntensity !== undefined && customColors.patternIntensity !== null)
        ? parseInt(customColors.patternIntensity, 10)
        : 100);
    const activeGradientType = params.gradientType || customColors.gradientType || 'single';
    const activeQrColor2 = params.qrColor2 || customColors.qrColor2 || null;
    const frameColor = params.frameColor || customColors.frameColor || design.frameColor;
    const textColor = params.textColor || customColors.textColor || design.textColor;
    const badgeBg = params.badgeBg || customColors.badgeBg || design.badgeBg;
    const badgeText = params.badgeText || customColors.badgeText || design.badgeText;

    const activeBannerText = (bannerText !== undefined && bannerText !== null && bannerText !== '') 
      ? String(bannerText) 
      : (design.bannerText || 'SCAN ME');

    const dotStyle = customDotStyle || params.dotStyle || design.dotStyle || 'square';
    const eyeStyle = params.customEyeStyle || params.eyeStyle || customColors.eyeStyle || customEyeStyle || design.eyeStyle || 'square';

    const qrOpts = { errorCorrectionLevel: 'H' };
    const densityVal = (params.qrDensity !== undefined && params.qrDensity !== null) ? parseInt(params.qrDensity, 10) : 50;
    let qrData;
    try {
      const probe = QRCode.create(url || 'QRbey', { errorCorrectionLevel: 'H' });
      const minVersion = probe.version;
      const targetVersion = Math.max(minVersion, Math.min(10, Math.round(minVersion + (densityVal / 100) * 3)));
      qrData = QRCode.create(url || 'QRbey', { errorCorrectionLevel: 'H', version: targetVersion });
    } catch (e) {
      qrData = QRCode.create(url || 'QRbey', { errorCorrectionLevel: 'H' });
    }
    const modules = qrData.modules;
    const size = modules.size;

    const baseW = 600;
    const baseH = 760;
    const scale = targetWidth / baseW;

    const canvasWidth = targetWidth;
    const canvasHeight = Math.round(baseH * scale);
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const isDarkBg = require('../drawing/ShapeDrawer').prototype.isDarkColor(bgColor);
    const microRatio = isDarkBg ? 0.78 : 0.76;

    const frameShape = params.frameShape || customColors.frameShape || 'rectangular';

    require('../drawing/FrameDrawer').prototype.drawFrame(ctx, design.frameStyle, canvasWidth, canvasHeight, title, activeBannerText, {
      frameColor,
      textColor,
      badgeBg,
      badgeText,
      bgColor
    }, scale, fontTitle, fontBanner, {
      fontSizeTitle,
      showIcon,
      iconMode,
      iconName,
      iconPosition,
      iconColor: activeIconColor,
      iconBgColor: activeIconBgColor,
      iconBorderColor: activeIconBorderColor,
      iconSize,
      customLogoDataUrl,
      loadedIconImg,
      frameShape,
      skipBorder: (params.skipBorder === true),
      titlePosition: params.titlePosition || 'bottom',
      titleOffsetY: parseInt(params.titleOffsetY, 10) || 0
    });

    const rawQrAreaSize = (qrSilhouetteMode !== 'none') ? (440 * scale) : (340 * scale);
    const cellSize = Math.max(2, Math.floor(rawQrAreaSize / size));
    const qrAreaSize = cellSize * size;
    const qrX = Math.round((canvasWidth - qrAreaSize) / 2);
    const qrY = Math.round(155 * scale);

    const activeEyeColor1 = params.customEyeColor || params.eyeColor || customColors.eyeColor || activeQrColor;
    const eyeGradType = params.eyeGradientType || customColors.eyeGradientType || 'single';
    const activeEyeColor2 = params.eyeColor2 || customColors.eyeColor2 || null;

    let finalEyeFill = activeEyeColor1;
    if (eyeGradType !== 'single' && activeEyeColor2) {
      let eGrad;
      if (eyeGradType === 'linear') {
        eGrad = ctx.createLinearGradient(qrX, qrY, qrX + qrAreaSize, qrY + qrAreaSize);
      } else {
        eGrad = ctx.createRadialGradient(
          qrX + qrAreaSize / 2, qrY + qrAreaSize / 2, 0,
          qrX + qrAreaSize / 2, qrY + qrAreaSize / 2, qrAreaSize / 1.3
        );
      }
      eGrad.addColorStop(0, activeEyeColor1);
      eGrad.addColorStop(1, activeEyeColor2);
      finalEyeFill = eGrad;
    }

    if (!skipWhiteCard) {
      const boxRadiusVal = (params.qrBoxRadius !== undefined ? parseInt(params.qrBoxRadius, 10) : (customColors.qrBoxRadius !== undefined ? parseInt(customColors.qrBoxRadius, 10) : 18)) * scale;
      const cardPad = Math.max(26 * scale, Math.round(3 * cellSize));
      ctx.fillStyle = '#ffffff';
      require('../drawing/ShapeDrawer').prototype.roundRect(ctx, qrX - cardPad, qrY - cardPad, qrAreaSize + cardPad * 2, qrAreaSize + cardPad * 2, boxRadiusVal);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1.5 * scale;
      require('../drawing/ShapeDrawer').prototype.roundRect(ctx, qrX - cardPad, qrY - cardPad, qrAreaSize + cardPad * 2, qrAreaSize + cardPad * 2, boxRadiusVal);
      ctx.stroke();
    }
    let alphaMask = null;
    if (qrSilhouetteMode !== 'none') {
      alphaMask = require('../silhouettes/SilhouetteMasker').createSilhouetteAlphaMask(qrSilhouetteMode, loadedIconImg, iconName);
    }

    let activeDotStyle = dotStyle || 'rounded';
    let effectiveGradientType = activeGradientType;

    if (effectiveGradientType !== 'single' && activeQrColor2) {
      const isQr1Dark = require('../drawing/ShapeDrawer').prototype.isDarkColor(activeQrColor);
      const isQr2Dark = require('../drawing/ShapeDrawer').prototype.isDarkColor(activeQrColor2);
      if (isDarkBg ? (!isQr1Dark && !isQr2Dark) : (isQr1Dark && isQr2Dark)) {
        let grad;
        if (effectiveGradientType === 'linear') {
          grad = ctx.createLinearGradient(qrX, qrY, qrX + qrAreaSize, qrY + qrAreaSize);
        } else {
          grad = ctx.createRadialGradient(
            qrX + qrAreaSize / 2, qrY + qrAreaSize / 2, 0,
            qrX + qrAreaSize / 2, qrY + qrAreaSize / 2, qrAreaSize / 1.3
          );
        }
        grad.addColorStop(0, activeQrColor);
        grad.addColorStop(1, activeQrColor2);
        activeQrColor = grad;
      }
    }

    const eyeSize = 7 * cellSize;
    const outerRadius = eyeSize;
    const innerSize = 3 * cellSize;
    const innerOffset = 2 * cellSize;

    const eyes = [
      { x: qrX, y: qrY },
      { x: qrX + (size - 7) * cellSize, y: qrY },
      { x: qrX, y: qrY + (size - 7) * cellSize }
    ];

    const safeEyeStyle = ['square', 'rounded', 'circle', 'leaf', 'diamond', 'hexagon', 'star', 'shield'].includes(eyeStyle) ? eyeStyle : 'square';
    const effectiveEyeStyle = safeEyeStyle;

    // Helper: draw the 3 finder-pattern eyes on a given context (no clip restrictions)
    const drawFinderEyes = (targetCtx, eyeFill) => {
      eyes.forEach(eye => {
        targetCtx.fillStyle = skipWhiteCard ? bgColor : '#ffffff';
        targetCtx.fillRect(eye.x - cellSize, eye.y - cellSize, 9 * cellSize, 9 * cellSize);

        // 1. Outer Box (7x7 modules)
        require('../drawing/ShapeDrawer').prototype.drawEye(targetCtx, eye.x, eye.y, outerRadius, effectiveEyeStyle, eyeFill);

        // 2. White Cutout Ring (5x5 modules)
        const whiteCutout = skipWhiteCard ? bgColor : '#ffffff';
        const cutoutSize = outerRadius - 2 * cellSize;
        if (effectiveEyeStyle === 'circle') {
          targetCtx.fillStyle = whiteCutout;
          targetCtx.beginPath();
          targetCtx.arc(eye.x + outerRadius / 2, eye.y + outerRadius / 2, cutoutSize / 2, 0, Math.PI * 2);
          targetCtx.fill();
        } else if (effectiveEyeStyle === 'rounded') {
          targetCtx.fillStyle = whiteCutout;
          require('../drawing/ShapeDrawer').prototype.roundRect(targetCtx, eye.x + cellSize, eye.y + cellSize, cutoutSize, cutoutSize, cutoutSize * 0.15);
          targetCtx.fill();
        } else if (effectiveEyeStyle === 'leaf') {
          targetCtx.fillStyle = whiteCutout;
          require('../drawing/ShapeDrawer').prototype.roundRect(targetCtx, eye.x + cellSize, eye.y + cellSize, cutoutSize, cutoutSize, { tl: cutoutSize * 0.22, tr: 0, br: cutoutSize * 0.22, bl: 0 });
          targetCtx.fill();
        } else if (effectiveEyeStyle === 'diamond') {
          require('../drawing/ShapeDrawer').prototype.drawEye(targetCtx, eye.x + cellSize, eye.y + cellSize, cutoutSize, 'diamond', whiteCutout);
        } else if (effectiveEyeStyle === 'hexagon') {
          require('../drawing/ShapeDrawer').prototype.drawEye(targetCtx, eye.x + cellSize, eye.y + cellSize, cutoutSize, 'hexagon', whiteCutout);
        } else if (effectiveEyeStyle === 'star') {
          require('../drawing/ShapeDrawer').prototype.drawEye(targetCtx, eye.x + cellSize, eye.y + cellSize, cutoutSize, 'star', whiteCutout);
        } else if (effectiveEyeStyle === 'shield') {
          require('../drawing/ShapeDrawer').prototype.drawEye(targetCtx, eye.x + cellSize, eye.y + cellSize, cutoutSize, 'shield', whiteCutout);
        } else {
          targetCtx.fillStyle = whiteCutout;
          targetCtx.fillRect(eye.x + cellSize, eye.y + cellSize, cutoutSize, cutoutSize);
        }

        // 3. Inner Pupil (3x3 modules)
        require('../drawing/ShapeDrawer').prototype.drawEye(targetCtx, eye.x + innerOffset, eye.y + innerOffset, innerSize, effectiveEyeStyle, eyeFill);
      });
    };


      const SilhouetteFactory = require('../silhouettes/SilhouetteFactory');
      const strategy = SilhouetteFactory.getStrategy(qrSilhouetteMode);
      strategy.draw({
        ctx, size, cellSize, qrX, qrY, modules, finalEyeFill, activeDotStyle, activeQrColor, primaryQrColor, isDarkBg, bgColor, canvasWidth, canvasHeight, loadedIconImg, iconName, alphaMask, qrSilhouetteMode, qrAreaSize,
        patternColor: activePatternColor,
        silhouetteColor: activeSilhouetteColor,
        patternIntensity: activePatternIntensity,
        service: require('../../QRGeneratorService'),
        activeEyeStyle: effectiveEyeStyle, activeEyeColor,
        drawFinderEyes: drawFinderEyes
      });

    const shouldDrawCenterBadge = (showIcon !== false) && (qrSilhouetteMode === 'none' || qrSilhouetteMode === 'icon_center');
    if (shouldDrawCenterBadge && iconPosition === 'center') {
      const centerBoxSize = (iconSize || 34) * 2.2 * scale;
      const centerBoxX = qrX + (qrAreaSize - centerBoxSize) / 2;
      const centerBoxY = qrY + (qrAreaSize - centerBoxSize) / 2;

      ctx.fillStyle = activeIconBgColor;
      require('../drawing/ShapeDrawer').prototype.roundRect(ctx, centerBoxX, centerBoxY, centerBoxSize, centerBoxSize, 12 * scale);
      ctx.fill();

      if (showShield) {
        ctx.strokeStyle = activeIconBorderColor;
        ctx.lineWidth = 3 * scale;
        require('../drawing/ShapeDrawer').prototype.roundRect(ctx, centerBoxX, centerBoxY, centerBoxSize, centerBoxSize, 12 * scale);
        ctx.stroke();
      }

      if (loadedIconImg) {
        const imgSize = centerBoxSize * 0.75;
        ctx.drawImage(loadedIconImg, centerBoxX + (centerBoxSize - imgSize) / 2, centerBoxY + (centerBoxSize - imgSize) / 2, imgSize, imgSize);
      } else {
        require('../drawing/IconDrawer').prototype.drawVectorIcon(ctx, iconName, centerBoxX + centerBoxSize / 2, centerBoxY + centerBoxSize / 2, centerBoxSize * 0.55, activeIconColor);
      }
    }

    const pngBuffer = canvas.toBuffer('image/png');

    // Guardado automático y auditoría de trazabilidad de códigos QR PNG generados
    if (isExplicitGenerate && userEmail) {
      const emailKey = userEmail.toLowerCase().trim();
      const qrId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const creditsAtGen = user ? (user.creditsUsed || 0) : 0;
      const maxCredits = planConfig ? planConfig.maxCredits : 50;
      const remainingCredits = Math.max(0, maxCredits - creditsAtGen);
      const period = user ? (user.currentPeriod || new Date().toISOString().substring(0, 7)) : new Date().toISOString().substring(0, 7);
      const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;

      const historyEntry = {
        id: qrId,
        userEmail: emailKey,
        title: title || 'Código QR',
        url: url || 'https://qrbey.com',
        format: 'png',
        resolution: targetWidth || 600,
        creditsUsedAtGeneration: creditsAtGen,
        remainingCreditsAtGeneration: remainingCredits,
        planAtGeneration: userPlan,
        period: period,
        imageDataUrl: dataUrl,
        createdAt: new Date().toISOString()
      };

      await historyRepository.addHistoryEntry(emailKey, historyEntry);

      try {
        const dbService = require('../../../services/DatabaseService');
        if (dbService.isConnected()) {
          await dbService.insertQrGeneration(historyEntry);
        }
      } catch (e) {}

      await auditRepository.logAction({
        userEmail: emailKey,
        action: 'GENERATE_QR',
        creditsAtAction: creditsAtGen,
        remainingCredits: remainingCredits,
        generationsAtAction: user ? user.generationsCount : 1,
        plan: userPlan,
        period: period,
        metadata: { qrId, title: title || 'Código QR', url: url || '', format: 'png', resolution: targetWidth || 600 }
      });
    }

    return pngBuffer;
  }



}
module.exports = new CanvasGenerator();