import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function getModels() {
  const res = await fetch(endpoint);
  const data = await res.json();
  if (data.models) {
    const proModels = data.models.filter(m => m.name.includes('pro'));
    proModels.forEach(m => console.log(m.name, m.displayName));
  } else {
    console.log(data);
  }
}
getModels();
