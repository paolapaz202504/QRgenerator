# Historial de Cambios — QRbey (QRgenerator)

Todas las modificaciones notables de este proyecto están documentadas en este archivo según el estándar de versionado semántico formal (`vX.Y.Z`).

---

## [v1.2.0] — 2026-11-11
### 🚀 Lanzamiento Oficial para Comercialización B2B SaaS

#### Agregado
- **Plantilla Clara Profesional (`frontAgent` & `iconAgent`):** Rediseño integral de la interfaz web con paleta SaaS moderna. Fondo claro `#F8FAFC`, tarjetas en blanco puro `#FFFFFF`, bordes sutiles `#E2E8F0`, tipografías oscuras de alto contraste `#0F172A` / `#334155` y acentos corporativos en Índigo `#4F46E5` y Cyan.
- **Exportación Vectorial SVG Real (`qrAgent`):** Generación de código SVG XML puro y escalable nativamente para imprenta, vallas, packaging y corte láser sin distorsión.
- **Monitoreo Anti-Sleep y Diagnóstico (`devOpsAgent`):** Endpoints `/api/health` y `/api/ready` con soporte para métodos `GET` y `HEAD` (UptimeRobot ping cada 5-10 min para evitar suspensión de la capa gratuita en OnRender).
- **Pasarela de Pagos Recurrente (`paymentAgent`):** Integración completa para cobros en Guatemala y Centroamérica (tarjeta de crédito/débito y transferencias bancarias en USD/GTQ), con soporte de entorno Sandbox, generación de checkouts y webhooks con verificación criptográfica e idempotencia.
- **Centralización de Planes en `.env` (`backendAgent` & `pmAgent`):** Cuotas y precios definidos formalmente en `.env` y `.env.example` para los planes `Free` (15 descargas, 50 créditos), `Pro` ($9.99/mes, 500 descargas, 2000 créditos) y `Corporate` ($29.99/mes, descargas y créditos ilimitados).
- **Ciberseguridad & DevSecOps (`securityAgent`):** Protección con cabeceras HTTP de `helmet` y limitador de tasa de peticiones con `express-rate-limit` (60 req/min para generación de QR).
- **Caché y Optimización (`cacheBdAgent`):** Cabeceras `Cache-Control: public, max-age=86400` y `ETag` para el catálogo de diseños `/api/designs` y configuración.
- **Suite de Pruebas Automatizadas (`qaAgent`):** Script `test/qa_suite.js` ejecutable vía `npm test`, validando 9 pruebas críticas (salud, SVG, escaneabilidad con jsQR, límites de cuota, seguridad y pagos).
- **Modal Interactivo de Changelog:** Acceso directo desde el Navbar mediante la insignia `v1.2.0`.

---

## [v1.1.0] — 2026-09-23
### 🎨 Suite de Siluetas y Google Cloud Storage Sync
- Sincronización automática de persistencia en Google Cloud Storage (GCS) en directorios `dev/` y `prod/`.
- Motor de siluetas temáticas personalizadas (`SilhouetteMasker.js`).
- Autenticación mediante Google Identity Services (OAuth 2.0).
- Historial interactivo de descargas y panel de administración de perfiles.

---

## [v1.0.0] — 2026-09-18
### 📱 Motor Base de Generación QR
- 600 Diseños profesionales organizados en 20 categorías estilo QRFY.
- 25 Fuentes tipográficas de Google Fonts renderizadas en tiempo real.
- Motor de Canvas con node-canvas y qrcode en Express.
- Selección de formas de módulos, bordes y esquinas de lectura.
