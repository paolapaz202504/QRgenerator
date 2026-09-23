const StandardSquareSilhouette = require('./StandardSquareSilhouette');
const IconOnlySilhouette = require('./IconOnlySilhouette');
const IconCenterSilhouette = require('./IconCenterSilhouette');
const IconPureSilhouette = require('./IconPureSilhouette');

class SilhouetteFactory {
  static getStrategy(mode) {
    switch (mode) {
      case 'icon_only': return new IconOnlySilhouette();
      case 'icon_center': return new IconCenterSilhouette();
      case 'icon_pure': return new IconPureSilhouette();
      case 'none':
      default:
        return new StandardSquareSilhouette();
    }
  }
}
module.exports = SilhouetteFactory;