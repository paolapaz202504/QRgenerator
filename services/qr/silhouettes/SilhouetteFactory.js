const StandardSquareSilhouette = require('./StandardSquareSilhouette');
const IconOnlySilhouette = require('./IconOnlySilhouette');
const IconCenterSilhouette = require('./IconCenterSilhouette');

class SilhouetteFactory {
  static getStrategy(mode) {
    switch (mode) {
      case 'icon_only':
      case 'icon_pure': // Asociado a opción 2 (IconOnlySilhouette)
        return new IconOnlySilhouette();
      case 'icon_center':
        return new IconCenterSilhouette();
      case 'none':
      default:
        return new StandardSquareSilhouette();
    }
  }
}
module.exports = SilhouetteFactory;