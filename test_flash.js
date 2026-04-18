import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
async function testModel(modelId) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const req = { contents: [{ parts: [{ text: "こんにちは" }] }] };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  console.log(`${modelId}: ${res.status}`);
}
async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-flash-latest');
  await testModel('gemini-2.0-flash-exp');
  await testModel('gemini-2.0-flash-lite-preview-02-05');
}
run();
