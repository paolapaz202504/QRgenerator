const DesignLibrary = require('./qr/config/DesignLibrary');
const SilhouetteMasker = require('./qr/silhouettes/SilhouetteMasker');
const CanvasGenerator = require('./qr/core/CanvasGenerator');
const StatsTracker = require('./qr/core/StatsTracker');
const ShapeDrawer = require('./qr/drawing/ShapeDrawer');
const IconDrawer = require('./qr/drawing/IconDrawer');
const FrameDrawer = require('./qr/drawing/FrameDrawer');

class QRGeneratorService {
  constructor() {
    this.categories = DesignLibrary.categories;
    this.patterns = DesignLibrary.patterns;
    this.designs = DesignLibrary.designs;
  }

  getCategories() { return DesignLibrary.getCategories(); }
  getDesigns() { return DesignLibrary.getDesigns(); }
  getPatterns() { return DesignLibrary.getPatterns(); }
  generate600Designs() { return DesignLibrary.generate600Designs(); }

  createSilhouetteAlphaMask(silhouetteMode, loadedIconImg, iconName) {
    return SilhouetteMasker.createSilhouetteAlphaMask(silhouetteMode, loadedIconImg, iconName);
  }
  drawSilhouetteMask(ctx, silhouetteMode, loadedIconImg, iconName, qrX, qrY, qrAreaSize) {
    return SilhouetteMasker.drawSilhouetteMask(ctx, silhouetteMode, loadedIconImg, iconName, qrX, qrY, qrAreaSize);
  }
  isCellInsideSilhouette(r, c, size, cellX, cellY, cellSize, qrX, qrY, qrAreaSize, silhouetteMode, alphaMask) {
    return SilhouetteMasker.isCellInsideSilhouette(r, c, size, cellX, cellY, cellSize, qrX, qrY, qrAreaSize, silhouetteMode, alphaMask);
  }

  async generateCanvas(params) { return CanvasGenerator.generateCanvas(params); }
  async trackDownload(params) { return StatsTracker.trackDownload(params); }

  roundRect(ctx, x, y, width, height, radius) { return ShapeDrawer.prototype.roundRect(ctx, x, y, width, height, radius); }
  isDarkColor(hex) { return ShapeDrawer.prototype.isDarkColor(hex); }
  hexToRgb(hex) { return ShapeDrawer.prototype.hexToRgb(hex); }
  drawDotPattern(ctx, x, y, size, style, color) { return ShapeDrawer.prototype.drawDotPattern(ctx, x, y, size, style, color); }
  drawEye(ctx, x, y, size, style, color) { return ShapeDrawer.prototype.drawEye(ctx, x, y, size, style, color); }

  drawVectorIcon(ctx, iconName, cx, cy, size, color, isSilhouetteMask) { return IconDrawer.prototype.drawVectorIcon(ctx, iconName, cx, cy, size, color, isSilhouetteMask); }
  drawStarPath(ctx, cx, cy, spikes, outerRadius, innerRadius) { return IconDrawer.prototype.drawStarPath(ctx, cx, cy, spikes, outerRadius, innerRadius); }
  drawHeartPath(ctx, x, y, size) { return IconDrawer.prototype.drawHeartPath(ctx, x, y, size); }

  getFontStack(fontName) { return FrameDrawer.prototype.getFontStack(fontName); }
  wrapText(ctx, text, maxWidth) { return FrameDrawer.prototype.wrapText(ctx, text, maxWidth); }
  drawFrame(ctx, style, w, h, title, bannerText, colors, scale, fontTitle, fontBanner, iconOpts) { return FrameDrawer.prototype.drawFrame(ctx, style, w, h, title, bannerText, colors, scale, fontTitle, fontBanner, iconOpts); }
}

module.exports = new QRGeneratorService();