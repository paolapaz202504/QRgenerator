/**
 * Servidor MCP Oficial de QRbey
 * Implementación de tools: generate_qr y list_templates
 */

export interface GenerateQrInput {
  text: string;
  vertical?: 'restaurante' | 'salon' | 'comercio' | 'generico';
  style?: 'default' | 'con-logo' | 'vectorial';
}

export interface QrTemplate {
  id: string;
  name: string;
  vertical: string;
  defaultColors: { background: string; modules: string };
  recommendedFrame: string;
}

export const QR_TEMPLATES: QrTemplate[] = [
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

export async function generateQr(input: GenerateQrInput): Promise<{ success: boolean; qrUrl: string; format: string }> {
  if (!input.text) {
    throw new Error('Param "text" is required for QR generation.');
  }

  const vertical = input.vertical || 'generico';
  const format = input.style === 'vectorial' ? 'svg' : 'png';
  
  // URL canónica del generador QRbey
  const qrUrl = `https://qrbey.onrender.com/api/generate?text=${encodeURIComponent(input.text)}&vertical=${vertical}&format=${format}`;
  
  return {
    success: true,
    qrUrl,
    format
  };
}

export function listTemplates(vertical?: string): QrTemplate[] {
  if (!vertical || vertical === 'all') {
    return QR_TEMPLATES;
  }
  return QR_TEMPLATES.filter(t => t.vertical === vertical);
}

// Tool definitions schema according to MCP standard
export const MCP_TOOLS = [
  {
    name: "generate_qr",
    description: "Genera un código QR para un negocio de barrio (restaurante, salón, comercio). Devuelve la URL de la imagen.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "URL o texto a codificar" },
        vertical: { type: "string", enum: ["restaurante", "salon", "comercio", "generico"] },
        style: { type: "string", enum: ["default", "con-logo", "vectorial"] }
      },
      required: ["text"]
    }
  },
  {
    name: "list_templates",
    description: "Lista las plantillas de diseño de códigos QR optimizadas por industria.",
    inputSchema: {
      type: "object",
      properties: {
        vertical: { type: "string", enum: ["restaurante", "salon", "comercio", "all"] }
      }
    }
  }
];
