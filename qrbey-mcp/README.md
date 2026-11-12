# @qrbey/mcp — Servidor Model Context Protocol Oficial

Servidor oficial de integración MCP (Model Context Protocol) para **QRbey**, la plataforma de códigos QR dinámicos para restaurantes, salones y comercios de barrio.

Permite a modelos de lenguaje (Claude Desktop, Cursor, Smithery, mcp.so) generar y consultar códigos QR vectoriales y plantillas sin esfuerzo.

## Herramientas Expuestas (Tools)

### 1. `generate_qr`
Genera un código QR dinámico de alta definición sin marcas de agua.
- `text` (string, requerido): URL o texto a codificar.
- `vertical` (enum): `restaurante`, `salon`, `comercio`, `generico`.
- `style` (enum): `default`, `con-logo`, `vectorial`.

### 2. `list_templates`
Devuelve la lista de plantillas de diseño y estilos preconfigurados según el vertical.

## Instalación & Uso en Claude Desktop

Agrega la siguiente configuración a tu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qrbey": {
      "command": "node",
      "args": ["path/to/qrbey-mcp/dist/index.js"]
    }
  }
}
```

## Pruebas de Humo

```bash
node tests/smoke.test.js
```
