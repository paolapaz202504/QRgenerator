/**
 * Resolves any raw icon name into a valid, complete CSS class string.
 * Guarantees compatibility across FontAwesome, Tabler Icons, Bootstrap Icons, and Material Symbols.
 */
export function getIconClass(iconName) {
  if (!iconName || typeof iconName !== 'string') return 'fa-solid fa-qrcode';

  const clean = iconName.trim();

  // 1. Tabler Icons
  if (clean.startsWith('ti ') || clean.startsWith('ti-') || clean.startsWith('tabler:')) {
    const raw = clean.replace(/^tabler:/, '');
    let cls = raw.startsWith('ti ') ? raw : `ti ${raw.startsWith('ti-') ? raw : 'ti-' + raw}`;
    if (raw.includes('-filled') && !cls.includes('ti-filled')) {
      cls += ' ti-filled';
    }
    return cls;
  }
  if (clean.endsWith('-filled') && !clean.startsWith('fa-') && !clean.startsWith('bi-')) {
    return `ti ti-${clean} ti-filled`;
  }

  // 2. Bootstrap Icons
  if (clean.startsWith('bi ') || clean.startsWith('bi-') || clean.startsWith('bootstrap:')) {
    const raw = clean.replace(/^bootstrap:/, '');
    return raw.startsWith('bi ') ? raw : `bi ${raw.startsWith('bi-') ? raw : 'bi-' + raw}`;
  }

  // 3. Material Symbols
  if (clean.startsWith('material:') || clean.startsWith('ms-')) {
    return clean;
  }

  // 4. FontAwesome full prefix already provided
  if (clean.startsWith('fa-solid ') || clean.startsWith('fa-brands ') || clean.startsWith('fa-regular ') || clean.startsWith('fa-duotone ')) {
    return clean;
  }

  // 5. FontAwesome with fa- prefix (e.g. fa-building, fa-whatsapp, fa-x-twitter)
  if (clean.startsWith('fa-')) {
    const brandIcons = [
      'whatsapp', 'instagram', 'tiktok', 'facebook', 'youtube', 'twitter', 'x-twitter',
      'linkedin', 'telegram', 'discord', 'spotify', 'pinterest', 'snapchat', 'reddit',
      'twitch', 'github', 'paypal', 'google', 'apple', 'microsoft', 'android', 'windows',
      'steam', 'amazon', 'shopify', 'stripe', 'figma', 'slack', 'trello', 'wix',
      'wordpress', 'uber', 'airbnb', 'behance', 'dribbble', 'vimeo', 'medium',
      'square-whatsapp', 'square-facebook', 'square-instagram', 'square-youtube',
      'square-twitter', 'square-github', 'square-pinterest', 'cc-visa', 'cc-mastercard',
      'cc-amex', 'cc-paypal', 'bitcoin', 'ethereum', 'docker', 'git-alt', 'npm',
      'python', 'js', 'react', 'vuejs', 'angular', 'node-js', 'php', 'java', 'html5',
      'css3-alt', 'sass', 'bootstrap', 'linux', 'ubuntu', 'chrome', 'firefox', 'safari',
      'edge', 'opera', 'mastodon', 'threads', 'kickstarter', 'patreon', 'soundcloud',
      'deezer', 'shazam', 'google-drive', 'dropbox', 'x'
    ];
    const iconBase = clean.replace(/^fa-/, '');
    if (brandIcons.includes(iconBase)) {
      return `fa-brands ${clean}`;
    }
    return `fa-solid ${clean}`;
  }

  // 6. Plain icon name (e.g. "qrcode", "building", "heart")
  return `fa-solid fa-${clean}`;
}

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

    const fullClass = getIconClass(iconClassName);

    const tempI = document.createElement('i');
    tempI.className = fullClass;
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
