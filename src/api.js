export const generateGeminiContent = async (prompt, schemaType, imageBase64 = null, productInfo = null) => {
  // Vite proxyを通して /api に転送 → スマホからでもMacのbackendに届く
  const endpoint = `/api/gemini?ts=${Date.now()}`;

  try {
    const payload = { prompt, schemaType };
    if (imageBase64) {
      payload.imageBase64 = imageBase64;
    }
    if (productInfo) {
      payload.productInfo = productInfo;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Password': localStorage.getItem('app_password') || ''
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'サーバーとの通信に失敗しました。');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Backend API Error:", error);
    throw error;
  }
};


