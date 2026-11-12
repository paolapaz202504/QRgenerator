const fs = require('fs');
const path = require('path');
const http = require('http');

const metricsDir = path.join(__dirname, '../metrics');
if (!fs.existsSync(metricsDir)) {
  fs.mkdirSync(metricsDir, { recursive: true });
}

const csvPath = path.join(metricsDir, 'kpis.csv');

// Header if not exists
if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, 'date,url,http_status,h1_count,ld_json_count,canonical_present,faq_page_present,aggregate_rating_present,external_reviews_linked\n', 'utf8');
}

async function checkLocalUrl(urlPath) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3030${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const h1Count = (data.match(/<h1\b/gi) || []).length;
        const ldCount = (data.match(/application\/ld\+json/g) || []).length;
        const canonical = data.includes('rel="canonical"');
        const faqPage = data.includes('"FAQPage"');
        const aggRating = data.includes('aggregateRating');
        const extReviews = /<a href="[^"]+"[^>]*>Ver en/i.test(data);

        resolve({
          status: res.statusCode,
          h1Count,
          ldCount,
          canonical,
          faqPage,
          aggRating,
          extReviews
        });
      });
    }).on('error', () => {
      resolve({
        status: 0,
        h1Count: 0,
        ldCount: 0,
        canonical: false,
        faqPage: false,
        aggRating: false,
        extReviews: false
      });
    });
  });
}

async function collectKpis() {
  const date = new Date().toISOString().split('T')[0];
  const urls = [
    { name: 'https://qrbey.onrender.com/', path: '/' },
    { name: 'https://qrbey.onrender.com/restaurantes', path: '/restaurantes' },
    { name: 'https://qrbey.onrender.com/salones-belleza', path: '/salones-belleza' },
    { name: 'https://qrbey.onrender.com/comercios', path: '/comercios' },
    { name: 'https://qrbey.onrender.com/sobre-nosotros', path: '/sobre-nosotros' },
    { name: 'https://qrbey.onrender.com/api', path: '/api' }
  ];

  for (const item of urls) {
    const res = await checkLocalUrl(item.path);
    const row = `${date},${item.name},${res.status},${res.h1Count},${res.ldCount},${res.canonical},${res.faqPage},${res.aggRating},${res.extReviews}\n`;
    fs.appendFileSync(csvPath, row, 'utf8');
    console.log(`KPI recorded for ${item.name}: Status ${res.status}, H1: ${res.h1Count}, LD: ${res.ldCount}`);
  }
}

collectKpis().then(() => console.log('✅ KPIs collected successfully in metrics/kpis.csv'));
