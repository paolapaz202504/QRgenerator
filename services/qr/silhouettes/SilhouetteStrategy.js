const { createCanvas } = require('canvas');

class SilhouetteStrategy {
  draw(params) {
    throw new Error('Method not implemented.');
  }
  
  drawFinderEyes(ctx, finalEyeFill, drawEyeFunc) {
    // Common finder eyes logic copied from original
    const size = finalEyeFill.length;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (finalEyeFill[r][c]) drawEyeFunc(ctx, c, r);
      }
    }
    for (let r = 0; r < 7; r++) {
      for (let c = size - 7; c < size; c++) {
        if (finalEyeFill[r][c]) drawEyeFunc(ctx, c, r);
      }
    }
    for (let r = size - 7; r < size; r++) {
      for (let c = 0; c < 7; c++) {
        if (finalEyeFill[r][c]) drawEyeFunc(ctx, c, r);
      }
    }
  }
}
module.exports = SilhouetteStrategy;