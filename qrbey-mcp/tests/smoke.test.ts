import { generateQr, listTemplates } from '../src/index';

async function runSmokeTests() {
  console.log('--- Running QRbey MCP Smoke Tests ---');

  // Assert 1: generate_qr devuelve URL
  const qrResult = await generateQr({ text: 'https://ejemplo.com/menu', vertical: 'restaurante', style: 'vectorial' });
  if (!qrResult || typeof qrResult.qrUrl !== 'string' || !qrResult.qrUrl.startsWith('https://')) {
    throw new Error(`Smoke Test 1 Failed: Expected valid qrUrl string, got: ${JSON.stringify(qrResult)}`);
  }
  console.log('✅ Assert 1 Passed: generateQr returned valid URL ->', qrResult.qrUrl);

  // Assert 2: list_templates devuelve array
  const templates = listTemplates();
  if (!Array.isArray(templates) || templates.length === 0) {
    throw new Error(`Smoke Test 2 Failed: Expected array of templates, got: ${JSON.stringify(templates)}`);
  }
  console.log(`✅ Assert 2 Passed: listTemplates returned array of ${templates.length} templates.`);

  console.log('🎉 ALL MCP SMOKE TESTS PASSED!');
}

runSmokeTests().catch(err => {
  console.error('❌ MCP Smoke Test Error:', err);
  process.exit(1);
});
