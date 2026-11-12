const QR_TEMPLATES = [
  {
    id: 'restaurante-menu',
    name: 'Menú Digital Restaurante',
    vertical: 'restaurante',
    defaultColors: { background: '#ffffff', modules: '#78350f' },
    recommendedFrame: 'Escanear Menú'
  },
  {
    id: 'salon-citas',
    name: 'Citas WhatsApp Salón',
    vertical: 'salon',
    defaultColors: { background: '#ffffff', modules: '#831843' },
    recommendedFrame: 'Pedir Cita'
  },
  {
    id: 'comercio-wifi',
    name: 'Conexión WiFi Tienda',
    vertical: 'comercio',
    defaultColors: { background: '#ffffff', modules: '#065f46' },
    recommendedFrame: 'Conectar WiFi'
  }
];

async function generateQr(input) {
  if (!input || !input.text) {
    throw new Error('Param "text" is required for QR generation.');
  }

  const vertical = input.vertical || 'generico';
  const format = input.style === 'vectorial' ? 'svg' : 'png';
  const qrUrl = `https://qrbey.onrender.com/api/generate?text=${encodeURIComponent(input.text)}&vertical=${vertical}&format=${format}`;
  
  return {
    success: true,
    qrUrl,
    format
  };
}

function listTemplates(vertical) {
  if (!vertical || vertical === 'all') {
    return QR_TEMPLATES;
  }
  return QR_TEMPLATES.filter(t => t.vertical === vertical);
}

module.exports = {
  generateQr,
  listTemplates,
  QR_TEMPLATES
};
