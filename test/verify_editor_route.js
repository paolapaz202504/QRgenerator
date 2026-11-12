const http = require('http');

http.get('http://localhost:3030/editor', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status code:', res.statusCode);
    console.log('Has #editor:', data.includes('id="editor"'));
    console.log('Has #step1-container:', data.includes('id="step1-container"'));
    console.log('Has #step2-container:', data.includes('id="step2-container"'));
    console.log('Has #step3-container:', data.includes('id="step3-container"'));
    console.log('Has #step4-container:', data.includes('id="step4-container"'));
    console.log('Has #step5-finders-container:', data.includes('id="step5-finders-container"'));
    console.log('Has #step6-frame-container:', data.includes('id="step6-frame-container"'));
    console.log('Has #preview-download-container:', data.includes('id="preview-download-container"'));
    if (res.statusCode === 200 && data.includes('id="editor"')) {
      console.log('✅ /editor route verified successfully!');
      process.exit(0);
    } else {
      console.error('❌ /editor route check failed');
      process.exit(1);
    }
  });
}).on('error', err => {
  console.error('Connection error:', err);
  process.exit(1);
});
