const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../public/index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

const headerHtml = fs.readFileSync(path.join(__dirname, '../public/html/header.html'), 'utf8');
const heroHtml = fs.readFileSync(path.join(__dirname, '../public/html/hero-banner.html'), 'utf8');
const testHtml = fs.readFileSync(path.join(__dirname, '../public/html/testimonials-section.html'), 'utf8');
const faqHtml = fs.readFileSync(path.join(__dirname, '../public/html/faq-section.html'), 'utf8');
const footerHtml = fs.readFileSync(path.join(__dirname, '../public/html/footer.html'), 'utf8');

// Replace empty containers with populated containers
indexHtml = indexHtml.replace(
  '<div id="header-container" class="sticky top-0 z-50"></div>',
  `<div id="header-container" class="sticky top-0 z-50">\n${headerHtml}\n  </div>`
);

indexHtml = indexHtml.replace(
  '<div id="hero-banner-container"></div>',
  `<div id="hero-banner-container">\n${heroHtml}\n    </div>`
);

indexHtml = indexHtml.replace(
  '<div id="testimonials-container"></div>',
  `<div id="testimonials-container">\n${testHtml}\n    </div>`
);

indexHtml = indexHtml.replace(
  '<div id="faq-container"></div>',
  `<div id="faq-container">\n${faqHtml}\n    </div>`
);

indexHtml = indexHtml.replace(
  '<div id="footer-container"></div>',
  `<div id="footer-container">\n${footerHtml}\n  </div>`
);

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log('✅ public/index.html pre-renderizado con éxito con Header, Hero, Testimonios, FAQ y Footer.');
