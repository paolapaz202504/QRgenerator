class IconDrawer {
  drawVectorIcon(ctx, iconName, cx, cy, size, color, isSilhouetteMask = false) {
    ctx.save();

    const innerWhite = isSilhouetteMask ? color : '#ffffff';
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = isSilhouetteMask ? Math.max(14, Math.round(size / 9)) : Math.max(2, size / 10);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let rawName = (iconName || '').toLowerCase().trim();
    let name = rawName
      .replace(/fa-brands|fa-solid|fa-regular|bi-|\bti-\b|\bti\b|material:|ms-/g, '')
      .trim();
    name = name.replace(/^fa-|^bi-|^ti-/, '').trim();
    name = name.replace(/[^a-z0-9_-]/g, '').trim();

    const aliasMap = {
      'hospital': 'hospital', 'local_hospital': 'hospital', 'first-aid-kit': 'hospital', 'first_aid_kit': 'hospital',
      'building-store': 'store', 'storefront': 'store', 'shop': 'store', 'store': 'store',
      'building': 'building', 'domain': 'building',
      'heart-filled': 'heart', 'heart-fill': 'heart', 'favorite': 'heart', 'heart': 'heart',
      'star-filled': 'star', 'star-fill': 'star', 'star': 'star',
      'cart3': 'cart-shopping', 'shopping-cart': 'cart-shopping', 'shopping_cart': 'cart-shopping', 'cart': 'cart-shopping',
      'car-front': 'car', 'directions_car': 'car', 'car': 'car',
      'geo-alt': 'location-dot', 'location_on': 'location-dot', 'map-pin': 'location-dot', 'map-2': 'location-dot', 'pin': 'location-dot',
      'telephone': 'phone', 'call': 'phone', 'phone': 'phone',
      'messages': 'comments', 'chat-dots': 'comments', 'chat': 'comments', 'comment': 'comments',
      'school': 'graduation-cap', 'mortarboard': 'graduation-cap', 'cap': 'graduation-cap',
      'cup-hot': 'coffee', 'cup': 'coffee', 'local_cafe': 'coffee', 'coffee': 'coffee',
      'lightning-charge': 'bolt', 'bolt': 'bolt',
      'shield-check': 'shield-halved', 'shield': 'shield-halved',
      'movie': 'film', 'film': 'film',
      'photo_camera': 'camera', 'camera': 'camera',
      'device-gamepad': 'gamepad', 'controller': 'gamepad', 'sports_esports': 'gamepad', 'gamepad': 'gamepad',
      'device-laptop': 'laptop', 'computer': 'laptop', 'laptop': 'laptop',
      'thumb-up': 'thumbs-up', 'hand-thumbs-up': 'thumbs-up', 'thumbs-up': 'thumbs-up',
      'info-circle': 'circle-info', 'info': 'circle-info',
      'card_giftcard': 'gift', 'gift': 'gift',
      'beach_access': 'umbrella', 'umbrella': 'umbrella',
      'qr-code': 'qrcode', 'qr_code_2': 'qrcode', 'qrcode': 'qrcode',
      'dove': 'dove', 'bird': 'dove', 'twitter': 'dove', 'x-twitter': 'dove', 'brand-twitter': 'dove', 'crow': 'dove', 'kiwi-bird': 'dove',
      'fish': 'fish', 'fish-fins': 'fish', 'shrimp': 'fish',
      'horse': 'horse', 'frog': 'frog', 'dragon': 'dragon',
      'spider': 'spider', 'bugs': 'bug', 'bug': 'bug', 'worm': 'bug', 'locust': 'bug', 'mosquito': 'bug',
      'feather': 'feather', 'hippo': 'hippo', 'otter': 'otter', 'cow': 'cow',
      'tree': 'tree', 'trees': 'tree', 'plant': 'tree', 'seedling': 'tree', 'seeding': 'tree', 'leaf': 'tree', 'flower': 'tree', 'cactus': 'tree', 'clover': 'tree', 'spa': 'tree',
      'mountain': 'mountain', 'volcano': 'mountain',
      'water': 'water', 'ripple': 'water', 'tsunami': 'water', 'earth-oceania': 'water',
      'wind': 'wind', 'smog': 'wind', 'snowflake': 'snowflake', 'icicles': 'snowflake', 'cannabis': 'tree',
      'butterfly': 'butterfly', 'bone': 'bone', 'egg': 'egg'
    };

    if (aliasMap[name]) {
      name = aliasMap[name];
    }

    ctx.beginPath();
    switch (name) {
      case 'dove':
      case 'twitter':
      case 'x-twitter':
      case 'bird':
      case 'brand-twitter':
      case 'crow':
      case 'kiwi-bird':
        ctx.beginPath();
        // Tail bottom left
        ctx.moveTo(cx - size * 0.38, cy + size * 0.28);
        // Fan tail notch
        ctx.lineTo(cx - size * 0.26, cy + size * 0.18);
        // Underbelly to chest
        ctx.bezierCurveTo(cx - size * 0.1, cy + size * 0.24, cx + size * 0.12, cy + size * 0.18, cx + size * 0.24, cy + size * 0.04);
        // Beak lower edge and tip
        ctx.lineTo(cx + size * 0.44, cy - size * 0.08);
        // Beak upper edge to head
        ctx.lineTo(cx + size * 0.28, cy - size * 0.14);
        // Head crown curving to wing root
        ctx.bezierCurveTo(cx + size * 0.26, cy - size * 0.32, cx + size * 0.08, cy - size * 0.38, cx - size * 0.05, cy - size * 0.22);
        // Wing up to top left tip
        ctx.bezierCurveTo(cx - size * 0.14, cy - size * 0.44, cx - size * 0.28, cy - size * 0.42, cx - size * 0.22, cy - size * 0.22);
        ctx.bezierCurveTo(cx - size * 0.18, cy - size * 0.12, cx - size * 0.15, cy - size * 0.02, cx - size * 0.3, cy + size * 0.08);
        ctx.closePath();
        ctx.fill();
        // Eye detail
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx + size * 0.18, cy - size * 0.14, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'fish':
        ctx.moveTo(cx + size * 0.35, cy);
        ctx.quadraticCurveTo(cx, cy - size * 0.35, cx - size * 0.2, cy);
        ctx.lineTo(cx - size * 0.4, cy - size * 0.2);
        ctx.lineTo(cx - size * 0.32, cy);
        ctx.lineTo(cx - size * 0.4, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.2, cy);
        ctx.quadraticCurveTo(cx, cy + size * 0.35, cx + size * 0.35, cy);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx + size * 0.2, cy - size * 0.06, size * 0.04, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'tree':
        ctx.moveTo(cx, cy - size * 0.42);
        ctx.lineTo(cx + size * 0.35, cy + size * 0.05);
        ctx.lineTo(cx + size * 0.15, cy + size * 0.05);
        ctx.lineTo(cx + size * 0.4, cy + size * 0.25);
        ctx.lineTo(cx - size * 0.4, cy + size * 0.25);
        ctx.lineTo(cx - size * 0.15, cy + size * 0.05);
        ctx.lineTo(cx - size * 0.35, cy + size * 0.05);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(cx - size * 0.08, cy + size * 0.25, size * 0.16, size * 0.2);
        break;

      case 'feather':
        ctx.moveTo(cx - size * 0.35, cy + size * 0.4);
        ctx.lineTo(cx + size * 0.35, cy - size * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.05, size * 0.25, Math.PI * 0.25, Math.PI * 1.25);
        ctx.fill();
        break;

      case 'water':
        ctx.moveTo(cx - size * 0.4, cy - size * 0.1);
        ctx.bezierCurveTo(cx - size * 0.2, cy - size * 0.3, cx, cy + size * 0.1, cx + size * 0.2, cy - size * 0.1);
        ctx.bezierCurveTo(cx + size * 0.3, cy - size * 0.2, cx + size * 0.4, cy - size * 0.1, cx + size * 0.4, cy - size * 0.1);
        ctx.lineTo(cx + size * 0.4, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.4, cy + size * 0.2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'mountain':
        ctx.moveTo(cx - size * 0.45, cy + size * 0.35);
        ctx.lineTo(cx - size * 0.1, cy - size * 0.35);
        ctx.lineTo(cx + size * 0.15, cy + size * 0.05);
        ctx.lineTo(cx + size * 0.45, cy + size * 0.35);
        ctx.closePath();
        ctx.fill();
        break;
      case 'whatsapp':
      case 'brand-whatsapp':
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.fillStyle = innerWhite;
          ctx.beginPath();
          require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.22, cy - size * 0.22, size * 0.44, size * 0.44, size * 0.1);
          ctx.fill();
          ctx.fillStyle = color;
          ctx.font = `bold ${Math.round(size * 0.4)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('WA', cx, cy);
        }
        break;

      case 'instagram':
      case 'brand-instagram':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.4, cy - size * 0.4, size * 0.8, size * 0.8, size * 0.2);
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.strokeStyle = innerWhite;
          ctx.beginPath();
          ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx + size * 0.22, cy - size * 0.22, size * 0.05, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'tiktok':
      case 'brand-tiktok':
        ctx.moveTo(cx - size * 0.1, cy - size * 0.35);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.35);
        ctx.bezierCurveTo(cx + size * 0.05, cy - size * 0.1, cx + size * 0.25, cy - size * 0.05, cx + size * 0.35, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.35, cy + size * 0.1);
        ctx.bezierCurveTo(cx + size * 0.2, cy + size * 0.1, cx + size * 0.05, cy, cx + size * 0.05, cy - size * 0.1);
        ctx.lineTo(cx + size * 0.05, cy + size * 0.15);
        ctx.arc(cx - size * 0.12, cy + size * 0.15, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'facebook':
      case 'brand-facebook':
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.fillStyle = innerWhite;
          ctx.font = `bold ${Math.round(size * 0.6)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('f', cx + size * 0.05, cy);
        }
        break;

      case 'youtube':
      case 'brand-youtube':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.42, cy - size * 0.28, size * 0.84, size * 0.56, size * 0.12);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.1, cy - size * 0.15);
        ctx.lineTo(cx + size * 0.18, cy);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.15);
        ctx.closePath();
        ctx.fill();
        break;

      case 'paw':
      case 'dog-bowl':
        ctx.arc(cx, cy + size * 0.1, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - size * 0.25, cy - size * 0.15, size * 0.08, 0, Math.PI * 2);
        ctx.arc(cx - size * 0.1, cy - size * 0.28, size * 0.08, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.1, cy - size * 0.28, size * 0.08, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.25, cy - size * 0.15, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'dog':
      case 'cat':
        ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.25, cy - size * 0.15);
        ctx.lineTo(cx - size * 0.38, cy - size * 0.38);
        ctx.lineTo(cx - size * 0.1, cy - size * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.25, cy - size * 0.15);
        ctx.lineTo(cx + size * 0.38, cy - size * 0.38);
        ctx.lineTo(cx + size * 0.1, cy - size * 0.28);
        ctx.closePath();
        ctx.fill();
        break;

      case 'heart':
        this.drawHeartPath(ctx, cx - size / 2, cy - size / 2, size);
        ctx.fill();
        break;
      case 'star':
        this.drawStarPath(ctx, cx, cy, 5, size / 2, size / 4);
        ctx.fill();
        break;
      case 'bolt':
        ctx.moveTo(cx + size * 0.1, cy - size * 0.45);
        ctx.lineTo(cx - size * 0.3, cy + size * 0.05);
        ctx.lineTo(cx - size * 0.05, cy + size * 0.05);
        ctx.lineTo(cx - size * 0.15, cy + size * 0.45);
        ctx.lineTo(cx + size * 0.3, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.05);
        ctx.closePath();
        ctx.fill();
        break;
      case 'gem':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.45, cy - size * 0.15);
        ctx.lineTo(cx, cy + size * 0.45);
        ctx.lineTo(cx - size * 0.45, cy - size * 0.15);
        ctx.closePath();
        ctx.fill();
        break;
      case 'lock':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.35, cy - size * 0.1, size * 0.7, size * 0.55, size * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.1, size * 0.22, Math.PI, 0);
        ctx.stroke();
        break;
      case 'envelope':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.4, cy - size * 0.28, size * 0.8, size * 0.56, size * 0.08);
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.strokeStyle = innerWhite;
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.4, cy - size * 0.28);
          ctx.lineTo(cx, cy + size * 0.02);
          ctx.lineTo(cx + size * 0.4, cy - size * 0.28);
          ctx.stroke();
        }
        break;
      case 'user':
        ctx.arc(cx, cy - size * 0.18, size * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.4, size * 0.35, Math.PI, 0);
        ctx.fill();
        break;
      case 'globe':
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.strokeStyle = innerWhite;
          ctx.beginPath();
          ctx.moveTo(cx - size * 0.42, cy);
          ctx.lineTo(cx + size * 0.42, cy);
          ctx.moveTo(cx, cy - size * 0.42);
          ctx.lineTo(cx, cy + size * 0.42);
          ctx.stroke();
        }
        break;
      case 'store':
        if (isSilhouetteMask) {
          require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.42, cy - size * 0.42, size * 0.84, size * 0.84, 8);
          ctx.fill();
        } else {
          ctx.moveTo(cx - size * 0.45, cy - size * 0.15);
          ctx.lineTo(cx, cy - size * 0.4);
          ctx.lineTo(cx + size * 0.45, cy - size * 0.15);
          ctx.stroke();
          require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.38, cy - size * 0.15, size * 0.76, size * 0.55, 4);
          ctx.stroke();
        }
        break;
      case 'wifi':
        if (isSilhouetteMask) {
          ctx.arc(cx, cy, size * 0.44, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.arc(cx, cy + size * 0.3, size * 0.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, cy + size * 0.3, size * 0.3, Math.PI * 1.25, Math.PI * 1.75);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy + size * 0.3, size * 0.5, Math.PI * 1.25, Math.PI * 1.75);
          ctx.stroke();
        }
        break;
      case 'utensils':
        if (isSilhouetteMask) {
          require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.42, cy - size * 0.42, size * 0.84, size * 0.84, 8);
          ctx.fill();
        } else {
          ctx.moveTo(cx - size * 0.2, cy - size * 0.4);
          ctx.lineTo(cx - size * 0.2, cy + size * 0.4);
          ctx.moveTo(cx - size * 0.3, cy - size * 0.4);
          ctx.lineTo(cx - size * 0.3, cy - size * 0.1);
          ctx.moveTo(cx - size * 0.1, cy - size * 0.4);
          ctx.lineTo(cx - size * 0.1, cy - size * 0.1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + size * 0.2, cy + size * 0.4);
          ctx.lineTo(cx + size * 0.2, cy - size * 0.4);
          ctx.quadraticCurveTo(cx + size * 0.4, cy - size * 0.2, cx + size * 0.2, cy - size * 0.05);
          ctx.fill();
        }
        break;
      case 'car':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.4, cy - size * 0.1, size * 0.8, size * 0.3, 4);
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.25, cy - size * 0.3, size * 0.5, size * 0.22, 3);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx - size * 0.22, cy + size * 0.2, size * 0.1, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.22, cy + size * 0.2, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'briefcase':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.42, cy - size * 0.28, size * 0.84, size * 0.64, 6);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.28, size * 0.18, Math.PI, 0);
        if (isSilhouetteMask) {
          ctx.fill();
        } else {
          ctx.stroke();
        }
        break;
      case 'graduation-cap':
      case 'cap':
        ctx.moveTo(cx, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.45, cy - size * 0.1);
        ctx.lineTo(cx, cy + size * 0.15);
        ctx.lineTo(cx - size * 0.45, cy - size * 0.1);
        ctx.closePath();
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.2, cy + size * 0.1, size * 0.4, size * 0.25, 2);
        ctx.fill();
        break;
      case 'cart-shopping':
      case 'cart':
        if (isSilhouetteMask) {
          require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.42, cy - size * 0.42, size * 0.84, size * 0.84, 8);
          ctx.fill();
        } else {
          ctx.moveTo(cx - size * 0.4, cy - size * 0.3);
          ctx.lineTo(cx - size * 0.25, cy - size * 0.3);
          ctx.lineTo(cx - size * 0.1, cy + size * 0.15);
          ctx.lineTo(cx + size * 0.35, cy + size * 0.15);
          ctx.lineTo(cx + size * 0.4, cy - size * 0.2);
          ctx.lineTo(cx - size * 0.2, cy - size * 0.2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx - size * 0.05, cy + size * 0.32, size * 0.08, 0, Math.PI * 2);
          ctx.arc(cx + size * 0.28, cy + size * 0.32, size * 0.08, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      case 'phone':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.28, cy - size * 0.42, size * 0.56, size * 0.84, size * 0.08);
        ctx.fill();
        break;
      case 'gift':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.38, cy - size * 0.1, size * 0.76, size * 0.5, 3);
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.42, cy - size * 0.25, size * 0.84, size * 0.16, 2);
        ctx.fill();
        ctx.strokeRect(cx - size * 0.06, cy - size * 0.25, size * 0.12, size * 0.65);
        break;
      case 'camera':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.4, cy - size * 0.15, size * 0.8, size * 0.55, 5);
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.18, cy - size * 0.32, size * 0.36, size * 0.18, 3);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.12, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'gamepad':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.42, cy - size * 0.22, size * 0.84, size * 0.44, size * 0.18);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.fillRect(cx - size * 0.28, cy - size * 0.06, size * 0.14, size * 0.12);
        ctx.fillRect(cx - size * 0.23, cy - size * 0.12, size * 0.06, size * 0.24);
        ctx.beginPath();
        ctx.arc(cx + size * 0.25, cy - size * 0.05, size * 0.05, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.15, cy + size * 0.02, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'hospital':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.35, cy - size * 0.4, size * 0.7, size * 0.8, 4);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.fillRect(cx - size * 0.18, cy - size * 0.08, size * 0.36, size * 0.1);
        ctx.fillRect(cx - size * 0.05, cy - size * 0.21, size * 0.1, size * 0.36);
        break;
      case 'trophy':
        ctx.moveTo(cx - size * 0.3, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.3, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.2, cy + size * 0.1);
        ctx.lineTo(cx - size * 0.2, cy + size * 0.1);
        ctx.closePath();
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.25, cy + size * 0.25, size * 0.5, size * 0.15, 3);
        ctx.fill();
        break;
      case 'sun':
        ctx.arc(cx, cy, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
          const ang = (Math.PI / 4) * i;
          ctx.beginPath();
          ctx.moveTo(cx + size * 0.32 * Math.cos(ang), cy + size * 0.32 * Math.sin(ang));
          ctx.lineTo(cx + size * 0.46 * Math.cos(ang), cy + size * 0.46 * Math.sin(ang));
          ctx.stroke();
        }
        break;
      case 'moon':
        ctx.arc(cx, cy, size * 0.4, Math.PI * 0.3, Math.PI * 1.7);
        ctx.fill();
        break;
      case 'plane':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.45, cy + size * 0.2);
        ctx.lineTo(cx + size * 0.1, cy + size * 0.1);
        ctx.lineTo(cx, cy + size * 0.45);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.1);
        ctx.lineTo(cx - size * 0.45, cy + size * 0.2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'fire':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.bezierCurveTo(cx + size * 0.4, cy - size * 0.1, cx + size * 0.4, cy + size * 0.4, cx, cy + size * 0.45);
        ctx.bezierCurveTo(cx - size * 0.4, cy + size * 0.4, cx - size * 0.4, cy - size * 0.1, cx, cy - size * 0.45);
        ctx.fill();
        break;
      case 'shield-halved':
      case 'shield':
        ctx.moveTo(cx - size * 0.42, cy - size * 0.42);
        ctx.lineTo(cx + size * 0.42, cy - size * 0.42);
        ctx.lineTo(cx + size * 0.42, cy + size * 0.05);
        ctx.quadraticCurveTo(cx + size * 0.42, cy + size * 0.44, cx, cy + size * 0.45);
        ctx.quadraticCurveTo(cx - size * 0.42, cy + size * 0.44, cx - size * 0.42, cy + size * 0.05);
        ctx.closePath();
        ctx.fill();
        break;
      case 'music':
        ctx.arc(cx - size * 0.2, cy + size * 0.2, size * 0.12, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.2, cy + size * 0.1, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.08, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.08, cy - size * 0.3);
        ctx.lineTo(cx + size * 0.32, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.32, cy + size * 0.1);
        ctx.stroke();
        break;
      case 'film':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.4, cy - size * 0.3, size * 0.8, size * 0.6, 4);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.fillRect(cx - size * 0.35, cy - size * 0.22, size * 0.1, size * 0.1);
        ctx.fillRect(cx - size * 0.35, cy + size * 0.12, size * 0.1, size * 0.1);
        ctx.fillRect(cx + size * 0.25, cy - size * 0.22, size * 0.1, size * 0.1);
        ctx.fillRect(cx + size * 0.25, cy + size * 0.12, size * 0.1, size * 0.1);
        break;
      case 'location-dot':
      case 'location':
      case 'pin':
        ctx.arc(cx, cy - size * 0.12, size * 0.3, Math.PI * 0.85, Math.PI * 0.15);
        ctx.lineTo(cx, cy + size * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.12, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'building':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.32, cy - size * 0.42, size * 0.64, size * 0.84, 2);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        for (let r = -3; r <= 1; r++) {
          ctx.fillRect(cx - size * 0.2, cy + r * size * 0.12, size * 0.1, size * 0.08);
          ctx.fillRect(cx + size * 0.1, cy + r * size * 0.12, size * 0.1, size * 0.08);
        }
        break;
      case 'cloud':
        ctx.arc(cx - size * 0.15, cy, size * 0.22, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.12, cy - size * 0.05, size * 0.26, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.28, cy + size * 0.1, size * 0.16, 0, Math.PI * 2);
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.35, cy, size * 0.7, size * 0.22, 4);
        ctx.fill();
        break;
      case 'ticket':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.42, cy - size * 0.25, size * 0.84, size * 0.5, 4);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx - size * 0.42, cy, size * 0.1, 0, Math.PI * 2);
        ctx.arc(cx + size * 0.42, cy, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'coffee':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.3, cy - size * 0.15, size * 0.6, size * 0.5, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + size * 0.3, cy + size * 0.05, size * 0.16, Math.PI * 1.5, Math.PI * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.15, cy - size * 0.25);
        ctx.lineTo(cx - size * 0.15, cy - size * 0.38);
        ctx.moveTo(cx + size * 0.05, cy - size * 0.25);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.38);
        ctx.stroke();
        break;
      case 'bell':
        ctx.arc(cx, cy - size * 0.05, size * 0.3, Math.PI, 0);
        ctx.lineTo(cx + size * 0.38, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.38, cy + size * 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + size * 0.28, size * 0.09, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'thumbs-up':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.38, cy - size * 0.05, size * 0.18, size * 0.45, 3);
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.15, cy - size * 0.05, size * 0.5, size * 0.45, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.12, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.05, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.18, cy - size * 0.4);
        ctx.lineTo(cx + size * 0.12, cy - size * 0.05);
        ctx.closePath();
        ctx.fill();
        break;
      case 'circle-info':
      case 'info':
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.fill();
        if (!isSilhouetteMask) {
          ctx.fillStyle = innerWhite;
          ctx.beginPath();
          ctx.arc(cx, cy - size * 0.18, size * 0.06, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(cx - size * 0.05, cy - size * 0.05, size * 0.1, size * 0.28);
        }
        break;
      case 'laptop':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.32, cy - size * 0.32, size * 0.64, size * 0.44, 4);
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.44, cy + size * 0.15, size * 0.88, size * 0.1, 3);
        ctx.fill();
        break;
      case 'key':
        ctx.arc(cx - size * 0.18, cy - size * 0.15, size * 0.18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.02, cy - size * 0.02);
        ctx.lineTo(cx + size * 0.35, cy + size * 0.35);
        ctx.lineTo(cx + size * 0.25, cy + size * 0.42);
        ctx.stroke();
        break;
      case 'comments':
      case 'comment':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.38, cy - size * 0.35, size * 0.76, size * 0.5, 6);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - size * 0.15, cy + size * 0.15);
        ctx.lineTo(cx - size * 0.3, cy + size * 0.38);
        ctx.lineTo(cx - size * 0.05, cy + size * 0.15);
        ctx.closePath();
        ctx.fill();
        break;
      case 'tag':
        ctx.moveTo(cx - size * 0.35, cy - size * 0.1);
        ctx.lineTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.4, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.05, cy + size * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx + size * 0.15, cy - size * 0.2, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'umbrella':
      case 'beach_access':
        // Umbrella Canopy Dome
        ctx.beginPath();
        ctx.arc(cx, cy - size * 0.05, size * 0.42, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        // Umbrella Pole & Hooked Handle
        ctx.beginPath();
        ctx.moveTo(cx, cy - size * 0.05);
        ctx.lineTo(cx, cy + size * 0.38);
        ctx.arc(cx - size * 0.08, cy + size * 0.38, size * 0.08, 0, Math.PI);
        ctx.stroke();
        break;
      case 'paper-plane':
      case 'send':
        ctx.moveTo(cx - size * 0.4, cy + size * 0.2);
        ctx.lineTo(cx + size * 0.4, cy - size * 0.4);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.4);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.1);
        ctx.closePath();
        ctx.fill();
        break;
      case 'trash':
      case 'delete':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.35, cy - size * 0.15, size * 0.7, size * 0.55, 3);
        ctx.fill();
        ctx.fillRect(cx - size * 0.42, cy - size * 0.3, size * 0.84, size * 0.1);
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.15, cy - size * 0.4, size * 0.3, size * 0.1, 2);
        ctx.fill();
        break;
      case 'pen':
      case 'pencil':
      case 'edit':
        ctx.moveTo(cx - size * 0.35, cy + size * 0.35);
        ctx.lineTo(cx - size * 0.25, cy + size * 0.1);
        ctx.lineTo(cx + size * 0.2, cy - size * 0.35);
        ctx.lineTo(cx + size * 0.35, cy - size * 0.2);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.25);
        ctx.closePath();
        ctx.fill();
        break;
      case 'bookmark':
        ctx.moveTo(cx - size * 0.3, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.3, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.3, cy + size * 0.45);
        ctx.lineTo(cx, cy + size * 0.2);
        ctx.lineTo(cx - size * 0.3, cy + size * 0.45);
        ctx.closePath();
        ctx.fill();
        break;
      case 'eye':
      case 'visibility':
        ctx.moveTo(cx - size * 0.45, cy);
        ctx.quadraticCurveTo(cx, cy - size * 0.38, cx + size * 0.45, cy);
        ctx.quadraticCurveTo(cx, cy + size * 0.38, cx - size * 0.45, cy);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'lightbulb':
        ctx.arc(cx, cy - size * 0.1, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - size * 0.15, cy + size * 0.15, size * 0.3, size * 0.2);
        break;
      case 'search':
      case 'magnifying-glass':
        ctx.arc(cx - size * 0.1, cy - size * 0.1, size * 0.28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + size * 0.1, cy + size * 0.1);
        ctx.lineTo(cx + size * 0.38, cy + size * 0.38);
        ctx.stroke();
        break;
      case 'house':
      case 'home':
        ctx.moveTo(cx, cy - size * 0.45);
        ctx.lineTo(cx + size * 0.42, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.32, cy - size * 0.05);
        ctx.lineTo(cx + size * 0.32, cy + size * 0.4);
        ctx.lineTo(cx - size * 0.32, cy + size * 0.4);
        ctx.lineTo(cx - size * 0.32, cy - size * 0.05);
        ctx.lineTo(cx - size * 0.42, cy - size * 0.05);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.fillRect(cx - size * 0.1, cy + size * 0.1, size * 0.2, size * 0.3);
        break;
      case 'check':
      case 'check-square':
      case 'verified':
        ctx.moveTo(cx - size * 0.35, cy);
        ctx.lineTo(cx - size * 0.1, cy + size * 0.25);
        ctx.lineTo(cx + size * 0.38, cy - size * 0.3);
        ctx.stroke();
        break;
      case 'qrcode':
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.35, cy - size * 0.35, size * 0.3, size * 0.3, 3);
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx + size * 0.05, cy - size * 0.35, size * 0.3, size * 0.3, 3);
        ctx.fill();
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.35, cy + size * 0.05, size * 0.3, size * 0.3, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + size * 0.2, cy + size * 0.2, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        // Universal emblem fallback for any other custom icon symbol
        require('./ShapeDrawer').prototype.roundRect(ctx, cx - size * 0.38, cy - size * 0.38, size * 0.76, size * 0.76, size * 0.2);
        ctx.fill();
        ctx.fillStyle = innerWhite;
        ctx.font = `bold ${Math.round(size * 0.45)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbolChar = (name.replace(/[^a-z0-9]/gi, '')[0] || 'Q').toUpperCase();
        ctx.fillText(symbolChar, cx, cy);
        break;
    }
    ctx.restore();
  }

  drawStarPath(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  drawHeartPath(ctx, x, y, size) {
    const topCurveHeight = size * 0.22;
    ctx.moveTo(x + size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(x + size / 2, y - size * 0.04, x - size * 0.05, y - size * 0.04, x - size * 0.05, y + topCurveHeight);
    ctx.bezierCurveTo(x - size * 0.05, y + size * 0.75, x + size * 0.15, y + size * 1.05, x + size / 2, y + size * 1.02);
    ctx.bezierCurveTo(x + size * 0.85, y + size * 1.05, x + size * 1.05, y + size * 0.75, x + size * 1.05, y + topCurveHeight);
    ctx.bezierCurveTo(x + size * 1.05, y - size * 0.04, x + size / 2, y - size * 0.04, x + size / 2, y + topCurveHeight);
    ctx.closePath();
  }

}
module.exports = IconDrawer;