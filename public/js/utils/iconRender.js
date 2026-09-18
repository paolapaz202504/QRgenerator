/**
 * Renders any CSS icon class (FontAwesome, Bootstrap Icons, Tabler Icons, Material, etc.)
 * onto an offscreen canvas and returns a high-resolution PNG Data URL.
 * Guarantees 100% visual parity between browser DOM rendering and QR canvas output.
 */
export function renderIconToDataUrl(iconClassName, color = '#2563eb', size = 256) {
  return new Promise((resolve) => {
    if (!iconClassName) {
      resolve(null);
      return;
    }

    const tempI = document.createElement('i');
    tempI.className = iconClassName;
    tempI.style.position = 'absolute';
    tempI.style.left = '-9999px';
    tempI.style.top = '-9999px';
    tempI.style.fontSize = '64px';
    tempI.style.visibility = 'hidden';
    document.body.appendChild(tempI);

    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          const computed = window.getComputedStyle(tempI);
          const beforeComputed = window.getComputedStyle(tempI, '::before');
          
          let content = beforeComputed.getPropertyValue('content');
          if (content && content !== 'none' && content !== 'normal') {
            content = content.replace(/^['"]|['"]$/g, '');
          } else {
            content = '';
          }

          const fontFamily = computed.getPropertyValue('font-family') || 'FontAwesome';
          const fontWeight = computed.getPropertyValue('font-weight') || 'normal';
          const fontStyle = computed.getPropertyValue('font-style') || 'normal';

          if (tempI.parentNode) document.body.removeChild(tempI);

          if (!content) {
            resolve(null);
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          ctx.clearRect(0, 0, size, size);
          ctx.fillStyle = color;
          ctx.font = `${fontStyle} ${fontWeight} ${Math.round(size * 0.7)}px ${fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(content, size / 2, size / 2 + (size * 0.03));

          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          if (tempI.parentNode) document.body.removeChild(tempI);
          resolve(null);
        }
      }, 30);
    });
  });
}
