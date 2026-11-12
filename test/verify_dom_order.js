const fs = require('fs');

function verifyDomOrder(html) {
  // Extract main contents
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (!mainMatch) return { pass: false, error: 'No main tag' };

  const mainContent = mainMatch[1];
  
  // Find top-level children of main: section or footer
  // Simple regex parser for top-level direct children
  const directChildren = [];
  const tagRegex = /<(section|footer)\b([^>]*)>/gi;
  let match;
  while ((match = tagRegex.exec(mainContent)) !== null) {
    const tagName = match[1].toLowerCase();
    const attrs = match[2];
    const idMatch = attrs.match(/\bid=['"]([^'"]+)['"]/i);
    const id = idMatch ? idMatch[1] : tagName;
    directChildren.push(id);
  }

  const expected = ['hero', 'como-funciona', 'verticales', 'editor', 'testimonios', 'planes', 'faq', 'footer'];
  console.log('Detected order:', directChildren);
  console.log('Expected order:', expected);
  
  const matches = JSON.stringify(directChildren) === JSON.stringify(expected);
  return { pass: matches, detected: directChildren, expected };
}

module.exports = { verifyDomOrder };

if (require.main === module) {
  const html = fs.readFileSync('public/index.html', 'utf8');
  const res = verifyDomOrder(html);
  console.log('Result:', res.pass ? 'PASS' : 'FAIL');
}
