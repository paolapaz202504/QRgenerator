const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Read components
const headerHtml = fs.readFileSync(path.join(__dirname, '../public/html/header.html'), 'utf8');
const heroHtml = fs.readFileSync(path.join(__dirname, '../public/html/hero.html'), 'utf8');
const comoFuncionaHtml = fs.readFileSync(path.join(__dirname, '../public/html/como-funciona.html'), 'utf8');
const verticalesHtml = fs.readFileSync(path.join(__dirname, '../public/html/verticales.html'), 'utf8');
const testimoniosHtml = fs.readFileSync(path.join(__dirname, '../public/html/testimonios.html'), 'utf8');
const planesHtml = fs.readFileSync(path.join(__dirname, '../public/html/planes.html'), 'utf8');
const faqHtml = fs.readFileSync(path.join(__dirname, '../public/html/faq.html'), 'utf8');
const footerHtml = fs.readFileSync(path.join(__dirname, '../public/html/footer.html'), 'utf8');

// Extract the editor content from indexHtml or step partials
let editorInner = '';
const editorMatch = indexHtml.match(/<section id="editor"[^>]*>([\s\S]*?)<\/section>/);
if (editorMatch) {
  // Extract inner grid
  const inner = editorMatch[1];
  const gridStart = inner.indexOf('<div class="grid grid-cols-1 lg:grid-cols-12');
  if (gridStart !== -1) {
    editorInner = inner.slice(gridStart).trim();
  } else {
    editorInner = inner.trim();
  }
}

const editorHeader = `
<section id="editor" class="space-y-4 pt-2">
  <div class="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    <div>
      <h2 class="text-xl sm:text-2xl font-bold font-['Outfit'] text-slate-900 tracking-tight flex items-center gap-2">
        <i class="fa-solid fa-sliders text-indigo-600"></i>
        <span>Pruébalo ahora: diseña tu QR en 2 minutos</span>
      </h2>
      <p class="text-xs text-slate-500">Personaliza cada detalle, visualiza en tiempo real y descarga sin marcas de agua.</p>
    </div>
  </div>
  ${editorInner}
</section>
`;

// Construct new <main>
const newMain = `
  <!-- Main Content Layout (100% Responsivo: Teléfonos, Tablets/iPad y Computadoras) -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
    ${heroHtml}
    ${comoFuncionaHtml}
    ${verticalesHtml}
    ${editorHeader.trim()}
    ${testimoniosHtml}
    ${planesHtml}
    ${faqHtml}
    ${footerHtml}
  </main>
`;

indexHtml = indexHtml.replace(/<main[\s\S]*?<\/main>/, newMain.trim());

// Header container replacement
indexHtml = indexHtml.replace(
  /<div id="header-container"[\s\S]*?<\/header>\s*<\/div>/,
  `<div id="header-container" class="sticky top-0 z-50">\n${headerHtml}\n  </div>`
);

// Remove orphan footer-container if outside main
indexHtml = indexHtml.replace(/<!-- Footer Component Container -->\s*<div id="footer-container">[\s\S]*?<\/footer>\s*<\/div>/, '');

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ public/index.html pre-renderizado con éxito respetando el orden DOM estricto de las 8 secciones.');
