const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');


const userRepository = require('../../../repositories/UserRepository');
const statsRepository = require('../../../repositories/StatsRepository');
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
      customLogoDataUrl = null,
      userEmail = null,
      isExplicitGenerate = false
    } = params;

    if (userEmail && isExplicitGenerate) {
      const emailKey = userEmail.toLowerCase().trim();
      let user = userRepository.findByEmail(emailKey);
      const planConfig = config.getPlanConfig(user ? user.plan : 'free');
      const maxCredits = user ? (user.maxCredits || planConfig.maxCredits) : planConfig.maxCredits;
      const currentGen = user ? (user.generationsCount || 0) : 0;

      if (currentGen >= maxCredits) {
        return {
          success: false,
          limitReached: true,
          message: `Has alcanzado el límite de ${maxCredits} créditos de generación del Plan Gratuito.`
        };
      }

      if (user) {
        user.generationsCount = currentGen + 1;
        await userRepository.saveUser(user);
      }
    }

    if (isExplicitGenerate) {
      await statsRepository.incrementGenerations();
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
    const qrSilhouetteMode = params.qrSilhouetteMode || customColors.qrSilhouetteMode || 'none';
    const skipWhiteCard = false;

    let primaryQrColor = params.qrColor || customColors.qrColor || design.qrColor || '#111827';
    let activeQrColor = primaryQrColor;

    const activeEyeColor = params.eyeColor || customColors.eyeColor || params.customEyeColor || primaryQrColor;
    const activeGradientType = params.gradientType || customColors.gradientType || 'single';
    const activeQrColor2 = params.qrColor2 || customColors.qrColor2 || null;
    const frameColor = params.frameColor || customColors.frameColor || design.frameColor;
    const textColor = params.textColor || customColors.textColor || design.textColor;
    const badgeBg = params.badgeBg || customColors.badgeBg || design.badgeBg;
    const badgeText = params.badgeText || customColors.badgeText || design.badgeText;

    const activeBannerText = (bannerText !== undefined && bannerText !== null && bannerText !== '') 
      ? String(bannerText) 
      : (design.bannerText || 'SCAN ME');

    const dotStyle = customDotStyle || design.dotStyle || 'square';
    const eyeStyle = customEyeStyle || design.eyeStyle || 'square';

    const qrOpts = { errorCorrectionLevel: 'H' };
    const densityVal = (params.qrDensity !== undefined && params.qrDensity !== null) ? parseInt(params.qrDensity, 10) : 50;
    // Map density (1% - 100%) to version (Version 3: 29x29 to Version 7: 45x45)
    // Default at 50% density is Version 5 (37x37 modules)
    const targetVersion = Math.max(3, Math.min(7, Math.round(2 + (densityVal / 100) * 5)));
    qrOpts.version = targetVersion;

    const qrData = QRCode.create(url, qrOpts);
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
      iconColor,
      iconSize,
      customLogoDataUrl,
      loadedIconImg,
      frameShape,
      skipBorder: (qrSilhouetteMode !== 'none'),
      titlePosition: params.titlePosition || 'bottom',
      titleOffsetY: parseInt(params.titleOffsetY, 10) || 0
    });

    const rawQrAreaSize = (qrSilhouetteMode !== 'none') ? (440 * scale) : (340 * scale);
    const cellSize = Math.max(2, Math.floor(rawQrAreaSize / size));
    const qrAreaSize = cellSize * size;
    const qrX = Math.round((canvasWidth - qrAreaSize) / 2);
    const qrY = Math.round(155 * scale);

    const activeEyeColor1 = customColors.eyeColor || params.customEyeColor || activeQrColor;
    const eyeGradType = customColors.eyeGradientType || params.eyeGradientType || 'single';
    const activeEyeColor2 = customColors.eyeColor2 || params.eyeColor2 || null;

    let finalEyeFill = activeEyeColor1;
    if (eyeGradType !== 'single' && activeEyeColor2) {
      const isEye1Dark = require('../drawing/ShapeDrawer').prototype.isDarkColor(activeEyeColor1);
      const isEye2Dark = require('../drawing/ShapeDrawer').prototype.isDarkColor(activeEyeColor2);
      if (isDarkBg ? (!isEye1Dark && !isEye2Dark) : (isEye1Dark && isEye2Dark)) {
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

    if (qrSilhouetteMode !== 'none') {
      effectiveGradientType = 'single';
    }

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

    const safeEyeStyle = ['square', 'rounded', 'circle', 'leaf'].includes(eyeStyle) ? eyeStyle : 'rounded';
    const effectiveEyeStyle = (qrSilhouetteMode !== 'none') ? 'rounded' : safeEyeStyle;

    // Helper: draw the 3 finder-pattern eyes on a given context (no clip restrictions)
    const drawFinderEyes = (targetCtx, eyeFill) => {
      eyes.forEach(eye => {
        targetCtx.fillStyle = skipWhiteCard ? bgColor : '#ffffff';
        targetCtx.fillRect(eye.x - cellSize, eye.y - cellSize, 9 * cellSize, 9 * cellSize);
        require('../drawing/ShapeDrawer').prototype.drawEye(targetCtx, eye.x, eye.y, outerRadius, effectiveEyeStyle, eyeFill);
        targetCtx.fillStyle = skipWhiteCard ? bgColor : '#ffffff';
        if (effectiveEyeStyle === 'circle') {
          targetCtx.beginPath();
          targetCtx.arc(eye.x + outerRadius / 2, eye.y + outerRadius / 2, (outerRadius - 2 * cellSize) / 2, 0, Math.PI * 2);
          targetCtx.fill();
        } else if (effectiveEyeStyle === 'rounded') {
          require('../drawing/ShapeDrawer').prototype.roundRect(targetCtx, eye.x + cellSize, eye.y + cellSize, outerRadius - 2 * cellSize, outerRadius - 2 * cellSize, (outerRadius - 2 * cellSize) * 0.15);
          targetCtx.fill();
        } else if (effectiveEyeStyle === 'leaf') {
          require('../drawing/ShapeDrawer').prototype.roundRect(targetCtx, eye.x + cellSize, eye.y + cellSize, outerRadius - 2 * cellSize, outerRadius - 2 * cellSize, { tl: (outerRadius - 2 * cellSize) * 0.22, tr: 0, br: (outerRadius - 2 * cellSize) * 0.22, bl: 0 });
          targetCtx.fill();
        } else {
          targetCtx.fillRect(eye.x + cellSize, eye.y + cellSize, outerRadius - 2 * cellSize, outerRadius - 2 * cellSize);
        }
        require('../drawing/ShapeDrawer').prototype.drawEye(targetCtx, eye.x + innerOffset, eye.y + innerOffset, innerSize, effectiveEyeStyle, eyeFill);
      });
    };


      const SilhouetteFactory = require('../silhouettes/SilhouetteFactory');
      const strategy = SilhouetteFactory.getStrategy(qrSilhouetteMode);
      strategy.draw({
        ctx, size, cellSize, qrX, qrY, modules, finalEyeFill, activeDotStyle, activeQrColor, primaryQrColor, isDarkBg, bgColor, canvasWidth, canvasHeight, loadedIconImg, iconName, alphaMask, qrSilhouetteMode, qrAreaSize,
        service: require('../../QRGeneratorService'),
        activeEyeStyle: effectiveEyeStyle, activeEyeColor,
        drawFinderEyes: drawFinderEyes
      });

    const shouldDrawCenterBadge = (showIcon !== false) && (qrSilhouetteMode === 'none' || qrSilhouetteMode === 'icon_center');
    if (shouldDrawCenterBadge && iconPosition === 'center') {
      const centerBoxSize = (iconSize || 34) * 2.2 * scale;
      const centerBoxX = qrX + (qrAreaSize - centerBoxSize) / 2;
      const centerBoxY = qrY + (qrAreaSize - centerBoxSize) / 2;

      ctx.fillStyle = iconBgColor || '#ffffff';
      require('../drawing/ShapeDrawer').prototype.roundRect(ctx, centerBoxX, centerBoxY, centerBoxSize, centerBoxSize, 12 * scale);
      ctx.fill();

      if (showShield) {
        ctx.strokeStyle = iconBorderColor || qrColor;
        ctx.lineWidth = 3 * scale;
        require('../drawing/ShapeDrawer').prototype.roundRect(ctx, centerBoxX, centerBoxY, centerBoxSize, centerBoxSize, 12 * scale);
        ctx.stroke();
      }

      if (loadedIconImg) {
        const imgSize = centerBoxSize * 0.75;
        ctx.drawImage(loadedIconImg, centerBoxX + (centerBoxSize - imgSize) / 2, centerBoxY + (centerBoxSize - imgSize) / 2, imgSize, imgSize);
      } else {
        require('../drawing/IconDrawer').prototype.drawVectorIcon(ctx, iconName, centerBoxX + centerBoxSize / 2, centerBoxY + centerBoxSize / 2, centerBoxSize * 0.55, iconColor || qrColor);
      }
    }

    return canvas.toBuffer('image/png');
  }



}
module.exports = new CanvasGenerator();