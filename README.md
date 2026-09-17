# QR Studio Pro — Generador de Códigos QR en Node.js

Una aplicación web moderna y profesional desarrollada en **Node.js** y **Express** para la creación y personalización de códigos QR estilo [QRFY](https://qrfy.com/).

---

## 🚀 Características principales

1. **Ingreso de URL**: Campo interactivo con formateo automático (`https://`).
2. **Título personalizable**: Agrega el nombre o mensaje en la tarjeta decorativa del código QR.
3. **12 Diseños estilo QRFY**:
   - **Clásico Elegante** (Minimalista blanco y negro)
   - **Marco Escanéame** (Etiqueta superior destacada "SCAN ME")
   - **Neón Cyberpunk** (Estilo oscuro con brillos cian/magenta)
   - **Corporativo Azul** (Tarjetón profesional para empresas)
   - **Eco Verde** (Estilo orgánico con bordes suavizados)
   - **Atardecer Gradient** (Degradado cálido alta visibilidad)
   - **Café Retro / Vintage** (Estilo pergamino y textura rústica)
   - **Ticket / Cupón** (Borde de cupón discontinuo con ofertas)
   - **Cristal & Oro** (Diseño prémium negro y dorado)
   - **Insignia Escudo** (Marco redondeado con escudo superior)
   - **Modo Oscuro Minimal** (Fondo mate nocturno con puntos brillantes)
   - **Pastel Creativo** (Tonos suaves amigables)
4. **Vista Previa en Tiempo Real**: Actualización instantánea en Canvas HTML5 mientras escribes o seleccionas diseños.
5. **Personalización Avanzada**: Selector de color para puntos, fondo, bordes, banners y forma de módulos (cuadrados, redondeados, puntos).
6. **Múltiples Opciones de Descarga**:
   - **PNG Estándar**
   - **PNG Alta Definición HD (2000x2000px)**
   - **Vector SVG** (ideal para impresión y diseño gráfico)

---

## 🛠️ Requisitos e Instalación

### 1. Requisitos
- **Node.js** v18 o superior
- **npm** v9 o superior

### 2. Instalación de Dependencias
```bash
npm install
```

### 3. Iniciar la Aplicación
```bash
npm start
```

Abre tu navegador en: **http://localhost:3030** (o `http://localhost:3000`)

---

## 📁 Estructura del Proyecto

```
QRgenerator/
├── public/
│   ├── index.html     # Interfaz gráfica moderna con Tailwind CSS
│   ├── styles.css     # Estilos y animaciones personalizadas
│   └── app.js         # Lógica frontend y vista previa en tiempo real
├── server.js          # Servidor Express y API backend de generación QR
├── package.json       # Configuración y dependencias del proyecto
└── README.md          # Guía de usuario y documentación
```
"# QRgenerator" 
