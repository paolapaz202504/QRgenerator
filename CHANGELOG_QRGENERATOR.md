# Historial de Cambios — QRbey (QRgenerator)

Todas las modificaciones notables de este proyecto están documentadas en este archivo según el estándar de versionado semántico formal (`vX.Y.Z`).

---

## [v1.4.0] — 2026-11-11
### 🚀 Anti-Caché F5 Instantáneo, 600 Plantillas Homogéneas (33/33/34), Iconografía y Verificador Óptico en Vivo

#### Añadido
- **Mecanismo Anti-Caché Instantáneo para F5 (`devOpsAgent` & `frontAgent`):**
  - Implementación de cabeceras estrictas `Cache-Control: no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate`, `Pragma: no-cache`, `Expires: 0` y `Surrogate-Control: no-store` en todas las rutas estáticas y HTML de `server.js`.
  - Inyección de metaetiquetas de control de caché en `index.html` y script inline en `<head>` que sincroniza la versión local con `localStorage` y purga automáticamente la API `caches`, forzando refresco transparente en caliente sin requerir Ctrl + Shift + F5.
  - Verificador en segundo plano en `app.js` contra `/api/health` para auto-recargar de forma transparente cuando se detecte una versión más reciente en el servidor.
- **Regeneración Homogénea de las 600 Plantillas (`qrAgent`):**
  - Reestructuración del generador en `DesignLibrary.js` garantizando la distribución exacta por cada una de las 20 categorías:
    - **33.3% Solo Ícono (200 plantillas):** `iconShow: true`, `qrSilhouetteMode: 'none'`.
    - **33.3% Ícono + Silueta (200 plantillas):** `iconShow: true`, `qrSilhouetteMode: 'icon_center'`.
    - **33.4% Solo Silueta (200 plantillas):** `iconShow: false`, `qrSilhouetteMode: 'icon_only'`.
  - Rotación homogénea de los **22 patrones de puntos**, **8 estilos de ojos** (`square`, `rounded`, `circle`, `leaf`, `diamond`, `shield`, `star`, `hexagon`) y **10 formas de marco exterior**, con paletas contrastadas y atractivas.
- **Indicador de Escaneabilidad y Legibilidad en Tiempo Real (`frontAgent` & `qaAgent`):**
  - Incorporación de `jsQR` en el cliente (`public/js/vendor/jsQR.js`) y tarjeta didáctica de escaneabilidad en `preview-download.html`.
  - Análisis óptico en tiempo real sobre los píxeles del lienzo canvas tras cada generación, alertando al usuario si la combinación de colores (matriz, fondo o silueta) no alcanza el contraste mínimo para ser reconocido por un smartphone.
- **Iconografía Contextual en Títulos (`frontAgent`):**
  - Agregado de iconos representativos en los títulos `<h2>` y `<h3>` de todos los pasos, paneles y tarjeta de vista previa en vivo.
- **Actualización de Textos de Interfaz (`frontAgent`):**
  - Sustitución de "8 Estilos de Ojos" por "8 Estilos" en el badge de cabecera del Paso 5.

---

## [v1.3.9] — 2026-11-11
### 🎨 Desacoplamiento de Entrada de Datos de Silueta e Ícono Central

#### Corregido
- **Corrección de Entrada de Figura para Silueta Independiente (`frontAgent` & `qrAgent`):**
  - En [`public/js/components/QRPreview.js`](file:///C:/Users/genaro/Documents/Repositorios/QRgenerator/public/js/components/QRPreview.js), se desacopló `customLogoDataUrl` de la condición `isIconChecked`. Anteriormente, si el usuario desactivaba *Mostrar ícono en el centro del QR*, `customLogoDataUrl` se enviaba como `null`, privando al motor Canvas de la imagen o ícono seleccionado en el Paso 3 para generar la silueta temática de fondo y provocando que cayera en un recuadro genérico.
  - Ahora `customLogoDataUrl` siempre transmite la figura seleccionada o cargada; el switch de ícono central solo gobierna el parámetro `showIcon`, permitiendo que el motor proyecte la silueta artística fidedigna de fondo sin dibujar el medallón central.
- **Blindaje de Calidad con Prueba #14 (`qaAgent`):**
  - Se incorporó la prueba automatizada **#14** a [`test/qa_suite.js`](file:///C:/Users/genaro/Documents/Repositorios/QRgenerator/test/qa_suite.js), verificando la generación y decodificación óptica (`jsQR`) para códigos con silueta activa (`icon_only`) e ícono central desactivado (`showIcon: false`).

---

## [v1.3.8] — 2026-11-11
### 🐛 Corrección de Cierre Sintáctico en IconPicker y Blindaje del Pipeline de Calidad

#### Corregido
- **Corrección de SyntaxError en Google Chrome (`frontAgent`):**
  - Se removió una llave de cierre duplicada (`}`) en la línea 559 de [`public/js/components/IconPicker.js`](file:///C:/Users/genaro/Documents/Repositorios/QRgenerator/public/js/components/IconPicker.js) dentro de `render()`, resolviendo el fallo `Uncaught SyntaxError: Unexpected token '}'` reportado en la consola del navegador.
- **Blindaje del Pipeline de Calidad (`qaAgent`):**
  - Se incorporó la prueba automatizada **#13** a [`test/qa_suite.js`](file:///C:/Users/genaro/Documents/Repositorios/QRgenerator/test/qa_suite.js): `Verificación de Integridad Sintáctica de Módulos Frontend (public/js)`.
  - Esta prueba compila y valida la sintaxis de todos los archivos `.js` mediante el motor V8 (`vm.SourceTextModule`), garantizando que ningún archivo con errores de sintaxis pueda pasar las pruebas o ser desplegado.

---

## [v1.3.7] — 2026-11-11
### 🎨 Desacoplamiento Total de Figura/Silueta, Corrección de Hover y Despliegue Inmediato OnRender

#### Añadido
- **Desacoplamiento Estructural Figura vs. Ícono Central (`frontAgent` & `qrAgent`):**
  - La selección de la figura tematica (más de 5,000 íconos vectoriales en 4 librerías o carga de logotipos propios) ahora permanece **SIEMPRE VISIBLE Y DISPONIBLE** en el Paso 3.
  - El switch `#qr-icon-show` pasa a controlar exclusivamente la manifestación física del medallón central: si está activo, muestra el ícono en el centro del QR y sus ajustes de color/recuadro/tamaño; si está inactivo, oculta el medallón central pero **la figura sigue seleccionada**.
  - En el Paso 4, el switch `#qr-silhouette-show` puede activarse de forma completamente independiente para proyectar la figura del Paso 3 como silueta artística de fondo, permitiendo configurar libremente siluetas puras (`icon_only`) sin que dependan de tener el ícono central encendido.

#### Corregido
- **Corrección de Texto Blanco en Hover sobre Fondos Claros (`frontAgent`):**
  - Se eliminaron las clases heredadas `hover:text-white` y fondos oscuros (`bg-slate-900`, `bg-slate-950/80`) en botones de pestañas, modal de iconos y tarjetas interactivas de `IconPicker.js` y `step2-icon.html`.
  - Todos los elementos interactivos ahora utilizan textos oscuros de alto contraste (`text-slate-700 hover:text-slate-900 hover:bg-slate-100 / hover:bg-slate-200`) sobre fondos claros.
- **Refresco Inmediato de Versión en OnRender (Cache-Busting) (`devOpsAgent` & `backendAgent`):**
  - Se corrigió la política de caché estática de Express en `server.js`: los archivos `.html` se sirven con `Cache-Control: no-cache, no-store, must-revalidate` (eliminando la retención de 24 horas que causaba que el navegador mostrara versiones antiguas).
  - Se integró el parámetro de versión `?v=1.3.7` en `ComponentLoader.js` para todos los parciales HTML y en `index.html` para `app.js`.

---

## [v1.3.6] — 2026-11-11
### 🛠️ Unificación y Corrección de Acordeones en los 6 Pasos

#### Corregido
- **Colapso del Panel 4 ("4. Matriz de Puntos, Patrones y Silueta") (`frontAgent`):**
  - Se identificó y resolvió una colisión de listeners de eventos: `app.js` y `ColorCustomizer.js` tenían ambos registrado un listener para `toggle-step4`. Al hacer clic, ambos ejecutaban `panel.classList.toggle('hidden')` en el mismo frame (añadiendo y quitando la clase inmediatamente), cancelando el efecto de colapso.
  - Se eliminaron los listeners redundantes de acordeones dentro de `ColorCustomizer.js`.
- **Centralización Universal de Acordeones (`frontAgent`):**
  - `app.js` ahora centraliza la gestión de colapso y rotación de flechas (`rotate-180`) para los 6 pasos:
    1. `toggle-step3` -> `panel-step3` (Paso 1: Diseños).
    2. `toggle-step1` -> `panel-step1` (Paso 2: Información y Tipografía).
    3. `toggle-step2` -> `panel-step2` (Paso 3: Ícono Central).
    4. `toggle-step4` -> `panel-step4` (Paso 4: Matriz, Patrones y Silueta).
    5. `toggle-step5-finders` -> `panel-step5-finders` (Paso 5: Ojos de Detección).
    6. `toggle-step6-frame` -> `panel-step6-frame` (Paso 6: Marco y Fondo del Póster).
- **Protección contra Clics en Controles Internos (`frontAgent`):**
  - Se añadió la guarda `if (e.target.closest('input, label, select')) return;` para evitar que interactuar con controles o switches en la cabecera colapse accidentalmente el acordeón.

---

## [v1.3.5] — 2026-11-11
### 🧩 Arquitectura Modular por Elementos del QR, Toggles Complementarios y Muestras Visuales

#### Añadido
- **Filosofía de Opciones Complementarias (Toggles Independientes) (`frontAgent` & `qrAgent`):**
  - Eliminación del dropdown ambiguo que mezclaba términos conceptuales ("1. Matriz...", "2. Silueta...", "3. Silueta + ...").
  - Sustitución por dos interruptores complementarios e independientes:
    - **Ícono/Imagen** (toggle activo/inactivo, por defecto activo).
    - **Silueta Temática de Fondo** (toggle activo/inactivo, por defecto inactivo).
  - Si ambos están activos, se complementan armónicamente (`icon_center`). Si el usuario desactiva el ícono y deja la silueta, queda la silueta pura (`icon_only`). Si desactiva la silueta y deja el ícono, opera el QR tradicional con ícono (`none` con `showIcon = true`). Si apaga ambos, genera un QR puro clásico (`none` con `showIcon = false`).
- **Muestras Visuales Interactivas (Preview Cards) (`frontAgent`):**
  - **Ojos de Detección (Step 5):** Rejilla de tarjetas interactivas con renderizado vectorial SVG para previsualizar y seleccionar al instante los 8 estilos geométricos de ojos (cuadradas, redondeadas, círculos, rombos, hexágonos, hoja/gota, estrella 8 puntas, escudo protegido).
  - **Marco y Forma del Póster (Step 6):** Rejilla de tarjetas interactivas con esquemas visuales para las 10 siluetas de corte exterior (rectangular, cuadrado, cápsula, circular, escudo, ticket/cupón, hexagonal, biseles diagonales, insignia octágono, esquinas invertidas).
- **Reorganización Estructural Anatómica en 6 Pasos con Guías Didácticas (`frontAgent` & `pmAgent`):**
  - Cada sección corresponde directamente a un elemento físico y funcional del código QR, incorporando una tarjeta didáctica explicativa:
    - **Paso 1: Plantillas y Diseños Preestablecidos** (`step3-design.html`).
    - **Paso 2: Contenido y Tipografía del QR** (`step1-info.html` — URL, Título, Banner, 25 Fuentes tipográficas).
    - **Paso 3: Ícono o Logotipo Central** (`step2-icon.html` — Selección, subida y personalización cromática/espacial completa en una sola vista).
    - **Paso 4: Matriz de Puntos, Patrones y Silueta** (`step4-patterns.html` — Colores de matriz, degradados, slider de densidad, 22 patrones y toggle de silueta temática).
    - **Paso 5: Ojos de Detección (Finders)** (`step5-finders.html` — Tarjetas visuales de estilos de ojos, colores primario y secundario, y degradados).
    - **Paso 6: Marco, Fondo y Forma del Póster** (`step6-frame.html` — Tarjetas visuales de siluetas de marco, color de lienzo, color de marco y slider de curvatura de tarjeta blanca).
- **Certificación de Calidad Exhaustiva (`qaAgent`):**
  - Verificación exitosa de los 12 casos de prueba de la suite principal (`test/qa_suite.js`) y las 201 combinaciones visuales de la matriz óptica (`test/qa_visual_matrix.js`) con 100% de tasa de decodificación óptica con `jsQR`.

---

## [v1.3.4] — 2026-11-11
### 👁️ Reparación de Estilo y Color de Ojos en Siluetas y Despliegue de Colores en Opción 2

#### Corregido
- **Estilo y Color de Ojos en Siluetas Temáticas (`qrAgent` & `frontAgent`):**
  - Se corrigió el orden de renderizado en `IconBaseSilhouette.js` e `IconOnlySilhouette.js`: `drawFinderEyes` ahora se dibuja inmediatamente después del fondo de silueta y antes del trazado de módulos de datos, eliminando la sobrescritura accidental por el tinte de la silueta.
  - Preservación estricta de los módulos de información de formato (`r <= 8 && c <= 8`) y líneas de timing (`r === 6`, `c === 6`) en color QR principal de alto contraste, garantizando decodificación óptica instantánea.
  - Sincronización del estado reactivo `customEyeStyle` en `ColorCustomizer.js` y `DesignPicker.js`, asegurando que cualquier cambio de estilo (cuadradas, redondeadas, círculos, rombos, hexágonos, hoja, estrella, escudo) se transmita de forma inmutable a la generación del canvas.
- **Despliegue de Colores de Silueta en Opción 2 (`frontAgent`):**
  - El sub-bloque *"Colores de la Silueta de Fondo y Patrón"* ahora se muestra tanto para la opción **"2. Silueta de Ícono/Imagen"** como para **"3. Silueta + Ícono/Imagen"**.
  - `IconOnlySilhouette` hereda de `IconBaseSilhouette`, proyectando la silueta y patrón seleccionados sin el recuadro central (emblem badge).
- **Renombrado de Opciones (`frontAgent`):**
  - Opción 1 renombrada a **`"1. Ícono/Imagen"`**.
  - Opción 3 renombrada a **`"3. Silueta + Ícono/Imagen"`**.
  - Actualización de textos en selectores HTML, `ColorCustomizer.js` y `DesignPicker.js`.

---

## [v1.3.3] — 2026-11-11
### 🎨 Reorganización Ergonómica de Controles por Responsabilidad y Renombrado de Siluetas

#### Modificado
- **Reorganización Integral del Panel 5 ("5. Personalizar Colores") (`frontAgent`):**
  - Se agrupó toda la personalización visual y cromática en 5 subcategorías claras y ordenadas:
    1. **Subcategoría 1: Silueta Temática del QR:** Selector de siluetas con descripción dinámica y contenedor condicional de colores de silueta y patrón (activo exclusivamente para la opción 3).
    2. **Subcategoría 2: Colores de Matriz y Puntos QR:** Color de puntos QR, tipo de degradado (sólido, lineal, radial) y segundo color de degradado.
    3. **Subcategoría 3: Estilo y Colores de Ojos (Finders):** 8 estilos de ojos, color primario, tipo de degradado de ojos y segundo color.
    4. **Subcategoría 4: Colores y Ajustes del Ícono:** Color del ícono vectorial, fondo del recuadro, borde del recuadro, tamaño del ícono (slider 16-80px) y ubicación (centro, arriba, abajo, izquierda, derecha).
    5. **Subcategoría 5: Colores de Fondo, Marco y Forma del Póster:** Color de fondo del póster, color de marco, 10 formas geométricas de póster y radio de curvatura de esquinas de la tarjeta blanca del QR.
- **Depuración del Panel 3 ("3. Personalización del ícono o Logotipo Imagen") (`frontAgent`):**
  - Se retiraron del Panel 3 los controles de color de ícono, fondo de recuadro, borde, tamaño y ubicación, trasladándolos al Panel 5.
  - El Panel 3 ahora se enfoca de manera limpia y exclusiva en la selección del ícono vectorial (4 fuentes, 40 populares por fuente y modal de 120+) o subida de imagen/logotipo personalizado.
- **Renombrado Intuitivo de Opciones de Silueta (`frontAgent` & `qrAgent`):**
  - Opción `"1. Matriz Cuadrada Estándar"` renombrada a **`"1. Ícono"`**.
  - Opción `"3. Silueta + Ícono al Centro"` renombrada a **`"3. Silueta + Ícono"`**.
  - Opción 2 se mantiene como `"2. Silueta de Ícono/Imagen"`.
  - Actualización de textos descriptivos y ayudas visuales en `ColorCustomizer.js` y `DesignPicker.js`.

---

## [v1.3.2] — 2026-11-11
### 🔬 Plan Riguroso de QA, Regla de Oro de Generación y Depuración de Siluetas

#### Añadido
- **Suite Combinatoria Exhaustiva de Opciones Visuales (`qaAgent`):** Script automatizado `test/qa_visual_matrix.js` que evalúa 201 combinaciones:
  - 176 pruebas: 22 patrones de puntos x 8 estilos de ojos (`square`, `rounded`, `circle`, `leaf`, `diamond`, `hexagon`, `star`, `shield`).
  - 9 pruebas: 3 siluetas temáticas (`none`, `icon_only`, `icon_center`) x 3 tipos de degradado (`single`, `linear`, `radial`).
  - 10 pruebas: 10 formas de marco del póster.
  - 5 pruebas: Espectro de densidades (1%, 20%, 50%, 80%, 100%).
  - 1 prueba: Renderizado y decodificación en Alta Definición (HD / 1200px).
  - Tasa de aprobación certificada: **201 / 201 (100% exitosas)** mediante decodificación óptica con `jsQR`.
- **Suite de Regresión de Densidades (`qaAgent`):** Script `test/test_densities_all_patterns.js` validando los 22 patrones en 7 niveles de densidad (154 combinaciones con 0 fallos).

#### Corregido
- **Soporte Fidedigno de los 8 Estilos y Colores de Ojos (`qrAgent` & `frontAgent`):**
  - Soporte completo de los 8 estilos de ojos (`square`, `rounded`, `circle`, `leaf`, `diamond`, `hexagon`, `star`, `shield`) con trazado geométrico y recortes concéntricos en `CanvasGenerator.js` y `ShapeDrawer.js`.
  - Extracción confiable de valores directamente del DOM en `getPayload()` para color de ojos (`custom-eye-color`), estilo (`custom-eye-style`), tipo de degradado (`custom-eye-gradient-type`) y segundo color (`custom-eye-color2`).
  - Eliminación de la sobreescritura accidental de color de ojos en `IconBaseSilhouette.js`.
- **Aislamiento del Grupo 3 y Control Puro en Opción 2 (`frontAgent` & `qrAgent`):**
  - El Grupo 3 ("3. Color de la Silueta y Color del Patrón") ahora se habilita **exclusivamente** al seleccionar "3. Silueta + Ícono al Centro" (`icon_center`), que es la única opción que proyecta una silueta tintada de fondo.
  - Al seleccionar "2. Silueta de Ícono/Imagen" (`icon_only`), el Grupo 3 permanece oculto y los puntos de la matriz QR son gobernados al 100% por el Grupo 2 ("2. COLOR DE MATRIZ Y PUNTOS QR"), permitiendo aplicar cualquier color sólido o degradado sin interferencias.
- **Cumplimiento Estricto de la Regla de Oro de Generación y Créditos (`frontAgent` & `pmAgent`):**
  - Al hacer clic en cualquier plantilla (`CHANGE_DESIGN` / `INIT_DATA`), se renderiza de inmediato en el canvas sin consumir créditos (`isExplicit = false`).
  - Al modificar cualquier otra opción visual (patrón, densidad, colores, ojos, silueta, marco o textos), **no** se regenera automáticamente el QR para evitar consumo no intencionado.
  - Para regenerar el código QR con las nuevas opciones y descontar/incrementar el conteo de generación del plan, el usuario debe pulsar obligatoriamente el botón **"Generar código qr"** (`generateNow(true)`).
- **Eliminación Definitiva de la Opción "4. Silueta Pura (Estilo Flotante)" (`qrAgent` & `frontAgent`):**
  - Se eliminó la opción `icon_pure` de la interfaz y del motor gráfico por redundancia con `icon_only` (`2. Silueta de Ícono/Imagen`).
  - Eliminación de la clase `IconPureSilhouette.js` y actualización de `SilhouetteFactory.js`, `CanvasGenerator.js`, `ColorCustomizer.js` y `DesignPicker.js`, asociando cualquier plantilla o referencia previa directamente a la opción 2 (`icon_only`).
- **Calibración de Densidad y Radio de Ojos (`qrAgent` & `qaAgent`):**
  - Calibración del radio exterior de ojos en `ShapeDrawer.prototype.drawEye` de `size * 0.30` a `size * 0.14`. A bajas densidades (1% a 15%), el radio previo recortaba las esquinas del borde cuadrado de 1 módulo del patrón de detección (finder eye), arruinando la proporción 1:1:3:1:1. Con `0.14`, todos los niveles de densidad (1% al 100%) escanean instantáneamente.
  - Refuerzo de centro sólido en geometrías de módulos: corrección de huecos centrales en `clover`, `ring`, `sparkle` y `hexagon` en `ShapeDrawer.js`, garantizando que el punto central de muestreo óptico siempre registre un bit oscuro (1) sin errores de ráfaga.
- **Desbloqueo y Compatibilidad de Siluetas Temáticas (`qrAgent` & `frontAgent`):**
  - Eliminación de la restricción que forzaba los ojos a `rounded` cuando se activaba una silueta temática en `CanvasGenerator.js`, permitiendo que el usuario seleccione libremente cualquier estilo de ojos.
  - Eliminación de la restricción que anulaba los degradados lineales o radiales al activar siluetas temáticas, permitiendo degradados completos y scannables dentro de siluetas.

---

## [v1.3.1] — 2026-11-11
### 🚀 Activación Oficial de Cuenta Pro, Cache-Bust y Despliegue Garantizado de 22 Patrones

#### Corregido
- **Activación de Cuenta Pro paolapaz202504@gmail.com (`backendAgent`):** Actualización de la cuenta a Plan Pro (2,000 créditos de edición, 500 descargas HD) en persistencia local y Google Cloud Storage (DEV y PROD). Se añade la insignia interactiva `Plan Pro` en el Navbar.
- **Cache-Busting y Renderizado Forzado de los 22 Patrones (`frontAgent` & `cacheBdAgent`):** Inclusión de `DEFAULT_PATTERNS` embebido en `AppState.js` y `DesignPicker.js` para renderizar los 22 patrones inmediatamente sin depender de caché de navegador. Ajuste de cabecera de `/api/designs` a `max-age=60, must-revalidate` y adición de cache-bust `?v=1.3.1` en `index.html`.

---

## [v1.3.0] — 2026-11-11
### 🛡️ Calibración de Créditos por Plan, 22 Patrones y 600 Diseños Claros Certificados

#### Corregido
- **Sincronización Dinámica de Créditos por Plan (`backendAgent` & `pmAgent`):** Corrección del mensaje y límite de créditos para usuarios del plan "Pro / Creadores". Los límites de créditos (Free: 50, Pro: 2,000, Corp: 999,999) y descargas (Free: 15, Pro: 500, Corp: 999,999) se calculan y sincronizan ahora 100% dinámicamente desde `config.getPlanConfig(user.plan)` en `CanvasGenerator.js`, `StatsTracker.js`, `UserRepository.js`, `UserController.js`, `QRPreview.js` y `UserModal.js`.
- **Selector de Categorías con Paleta Clara (`frontAgent` & `iconAgent`):** Eliminación completa de fondos negros/oscuros (`bg-slate-950/80`) en las píldoras e iconos de "Selecciona el diseño por categoría", adoptando diseño SaaS en blanco puro, bordes suaves `border-slate-200`, sombras sutiles e iconografía contextual en índigo corporativo.
- **Regeneración de los 600 Diseños con Fondos Claros (`qrAgent`):** Eliminación de fondos oscuros (`#0f172a`, `#1e293b`, `#090d16`, `#1e1b4b`) en las tarjetas y previsualizaciones de la biblioteca de 600 diseños, reemplazándolos por una paleta clara y luminosa (`#ffffff`, `#f8fafc`, `#f1f5f9`, `#f0fdf4`, `#eff6ff`, `#f5f3ff`, `#faf5ff`, `#fff7ed`, `#fdf2f8`, `#f0f9ff`) con módulos QR en colores profundos y contrastados.
- **Resolución de Fallos de Escaneabilidad Óptica (`qaAgent` & `qrAgent`):** Corrección en `CanvasGenerator.js` del dimensionamiento automático de versión en `QRCode.create` para evitar desbordamientos de datos (*Minimum version required*), y calibración de las 22 geometrías de módulos en `ShapeDrawer.js` (incluyendo cobertura de relleno en `star`, `sparkle`, `flower`, `diamond`, `ring`), alcanzando una tasa de decodificación óptica de 100% con `jsQR`.
- **Despliegue de los 22 Patrones de Puntos (`frontAgent` & `qrAgent`):** Exposición de la totalidad de los 22 patrones de puntos en `DesignLibrary.js` y `DesignPicker.js`, con tarjetas de estilo claro `bg-white`, bordes elegantes y tipografía de alto contraste `text-slate-800`.
- **Suite de Pruebas Ampliada a 12 Casos (`qaAgent`):** Adición de pruebas automatizadas para verificación de cuotas dinámicas de plan, 22 patrones en API y validación de ausencia de fondos oscuros obsoletos en `test/qa_suite.js`.

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
