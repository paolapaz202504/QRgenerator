# Estrategia de Recopilación de Reseñas Externas y Construcción de Autoridad (E-E-A-T) — QRbey

Este documento establece la hoja de ruta y procedimiento formal para la captación, verificación y publicación de reseñas externas reales para QRbey (`https://qrbey.onrender.com/`), en estricto apego a las directrices de Calidad de Google (E-E-A-T) y las mejores prácticas de GEO (Generative Engine Optimization).

---

## 1. Principio Fundamental de Integridad E-E-A-T
- **Cero Reseñas Falsas:** Bajo ninguna circunstancia se fabricarán calificaciones o testimonios artificiales.
- **Política de Schema JSON-LD:** El campo `aggregateRating` en los esquemas `SoftwareApplication` o `Product` permanecerá **estrictamente omitido** hasta que existan perfiles públicos activos con al menos una decena de reseñas verificables en plataformas de terceros independientes con URLs enlazables.
- **Transparencia Total:** Toda prueba social visible en la plataforma debe corresponder a comercios reales con consentimiento explícito.

---

## 2. Plataformas Externas Prioritarias

### A. Trustpilot (Perfil de Empresa Verificado)
1. **Registro:**
   - Crear cuenta de empresa en `business.trustpilot.com` vinculada al dominio oficial `https://qrbey.onrender.com/` y correo institucional `qrbeyconctact@gmail.com`.
2. **Configuración de Perfil:**
   - Categoría principal: *Software de Códigos QR / SaaS para Negocios*.
   - Descripción oficial: *"Generador de códigos QR dinámicos para restaurantes, salones y comercios locales. Códigos permanentes sin caducidad sorpresa."*
3. **Flujo de Invitación Automatizada:**
   - Al registrar una cuenta en Plan Profesional o realizar la 5ª descarga exitosa de un QR de negocio, enviar un correo transaccional invitando al dueño de negocio a dejar una reseña honesta en Trustpilot.
   - Enlace directo de reseña: `https://es.trustpilot.com/evaluate/qrbey.onrender.com`.

### B. Google Business Profile / Google Maps (Para Sede de Soporte y Desarrollo)
1. **Apertura de Ficha:**
   - Dar de alta el perfil de servicio digital para soporte y desarrollo local en `business.google.com`.
   - Área de servicio: Negocios locales y restauración en Centroamérica y mercados hispanohablantes.
2. **Vínculo y Verificación:**
   - Validación postal o por videollamada para obtener la insignia de negocio verificado por Google.
   - Habilitar el enlace corto directo `g.page/r/.../review` para compartir por WhatsApp de soporte con clientes que hayan recibido asistencia técnica.

### C. Plataformas Complementarias de Software (SaaS)
- **Product Hunt:** Lanzamiento programado para posicionar la suite y captar retroalimentación técnica de la comunidad de desarrolladores y creadores.
- **Capterra / Gartner Digital Markets:** Registro en la categoría de *QR Code Generators*.

---

## 3. Secuencia de Captación Post-Uso (Trigger-Based Feedback)

Para maximizar la tasa de conversión de reseñas orgánicas reales:
1. **Momento Clave #1 — Primera Impresión Exitosa:**
   - Cuando un usuario descarga su primer archivo SVG para imprenta, mostrar en el panel un modal no intrusivo:
     *"¿Te sirvió para el menú o mostrador de tu negocio? Tu opinión ayuda a otros negocios locales a modernizarse."*
2. **Momento Clave #2 — Primeros 50 Escaneos:**
   - Cuando el código QR dinámico de un restaurante o salón supera los 50 escaneos reales, enviar notificación felicitándolo por la interacción con sus clientes e invitándolo a valorar la estabilidad de QRbey en Trustpilot.

---

## 4. Activación Futura en JSON-LD (Criterio de Gatekeeper)

Únicamente cuando se cumplan las siguientes condiciones:
- Perfil de Trustpilot activo con puntuación superior a 4.5 estrellas y ≥ 15 reseñas verificadas.
- Enlace público al perfil visible en el pie de página de QRbey.

Se procederá a actualizar el script JSON-LD de `public/index.html` con la propiedad:
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "15",
  "bestRating": "5",
  "worstRating": "1"
}
```
*Hasta alcanzar dicho hito, `aggregateRating` no se incluirá para evitar penalizaciones algorítmicas por marcado no fundamentado.*
