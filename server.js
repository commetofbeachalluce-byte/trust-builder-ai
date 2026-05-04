import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3020;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// フロントエンド（Vite）のビルドファイルを静的配信
app.use(express.static(path.join(__dirname, 'dist')));

const apiKey = process.env.GEMINI_API_KEY;
const appPassword = process.env.APP_PASSWORD;

// 指数バックオフとタイムアウト付きのリトライ関数
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const abortController = new AbortController();
      const id = setTimeout(() => abortController.abort(), 20000); // 20秒でタイムアウト
      
      const response = await fetch(url, { ...options, signal: abortController.signal });
      clearTimeout(id);
      
      if (response.ok) return response;
      
      const isRetryable = response.status === 503 || response.status === 429;
      if (!isRetryable || i === maxRetries) return response;
      
      const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
      console.log(`⚠️ APIエラー (${response.status})。${delay.toFixed(0)}ms 後にリトライします (${i + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      if (i === maxRetries) throw error;
      console.log(`⚠️ 通信タイムアウトまたはエラー (${error.name})。リトライします (${i + 1}/${maxRetries})...`);
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// AIの回答からJSON部分だけを抽出するユーティリティ
function cleanJsonText(text) {
  if (!text) return '{}';
  // Markdownのコードブロック（```json ... ```）を除去
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  // JSONの開始 { と終了 } の外側にある文字を削除
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
}

app.post('/api/gemini', async (req, res) => {
  try {
    // パスワード認証
    const clientPassword = req.headers['x-app-password'];
    if (appPassword && clientPassword !== appPassword) {
      return res.status(401).json({ error: '合言葉が正しくありません。' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'サーバー側にAPIキーが設定されていません。' });
    }

    const { prompt, schemaType, imageBase64, productInfo } = req.body;

    if (!prompt || !schemaType) {
      return res.status(400).json({ error: '必須パラメータが不足しています。' });
    }

    // ユーザー設定に合わせて Gemini Pro を指定
    const modelId = 'gemini-pro-latest';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    let jsonSchema = {};
    if (schemaType === 'profile') {
      jsonSchema = {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", description: "DiSC理論とアマサイ（アクティブ・マネージ・サービス・イノベーション）に基づく相手の性格タイプ（短く記載）" },
          killerPhrase: { type: "STRING", description: "商談の最初の5分で相手の心を掴む具体的なトークフレーズ" },
          landmines: { type: "ARRAY", items: { type: "STRING" }, description: "絶対にやってはいけないことのリスト" },
          challenges: { type: "ARRAY", items: { type: "STRING" }, description: "想定される相手の課題感や痛み。必ず3つ以上、具体的に。" },
          scenario: { type: "STRING", description: "理想的な商談の流れ・シナリオ案。起承転結で具体的に。" }
        },
        required: ["type", "killerPhrase", "landmines", "challenges", "scenario"]
      };
    } else if (schemaType === 'followup') {
      jsonSchema = {
        type: "OBJECT",
        properties: {
          recommendedMedium: { type: "STRING", description: "最適なフォローアップ媒体（メール/チャット/音声/動画）" },
          mediumReasoning: { type: "STRING", description: "その媒体を選んだ戦略的理由" },
          messageDraft: { type: "STRING", description: "文面や台本案" },
          nextAction: { type: "STRING", description: "次に行うべきアクション" }
        },
        required: ["recommendedMedium", "mediumReasoning", "messageDraft", "nextAction"]
      };
    }

    const promptParts = [];
    let context = '';
    if (productInfo) {
      context = `\n\n===== 【提案商材】=====\n${productInfo}\n=====`;
    }

    // プロンプトを強化
    const richPrompt = `${prompt}${context}\n\n必ず指定されたJSONスキーマに従い、全ての項目を日本語で詳細に埋めて回答してください。`;

    promptParts.push({ text: richPrompt });

    if (imageBase64) {
      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        promptParts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    const requestBody = {
      contents: [{ parts: promptParts }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: jsonSchema
      }
    };

    const response = await fetchWithRetry(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error('API Error Response:', errData);
      const statusText = response.status === 503 ? 'AIが現在混雑しています。少し時間を空けてお試しください。' : '通信エラーが発生しました。';
      return res.status(response.status).json({ error: statusText });
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts) {
       return res.status(500).json({ error: 'AIから有効な回答が得られませんでした。' });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    console.log('--- RAW AI RESPONSE START ---');
    console.log(rawText);
    console.log('--- RAW AI RESPONSE END ---');

    const cleanedJson = cleanJsonText(rawText);
    
    try {
      const parsedData = JSON.parse(cleanedJson);
      
      // バリデーション: 必須項目が空でないかチェック
      if (schemaType === 'profile') {
        const required = ['type', 'killerPhrase', 'challenges', 'scenario'];
        const missing = required.filter(key => !parsedData[key] || (Array.isArray(parsedData[key]) && parsedData[key].length === 0));
        
        if (missing.length > 0) {
          console.warn(`⚠️ 項目不足を検知 (${missing.join(', ')}). 再試行を検討してください。`);
          // ここで内部リトライを1回試みる（再帰呼び出しの代わりに、一旦エラーを返してフロントにリトライさせるか、あるいはここで再試行）
          // ユーザー体験を優先し、項目が不完全な場合はエラーとしてフロントのリトライボタンを押させる
          throw new Error('AIの回答が不完全です。');
        }
      }

      return res.json(parsedData);
    } catch (parseError) {
      console.error('JSON Parse/Validation Error:', parseError.message);
      return res.status(500).json({ error: '分析結果を完全に読み取れませんでした。もう一度「再試行」ボタンを押してください。' });
    }
  } catch (error) {
    console.error('サーバー内エラー:', error);
    res.status(500).json({ error: error.message || 'サーバー内部で予期せぬエラーが発生しました。' });
  }
});

// フロントエンドのルーティング用（API以外のすべてのリクエストをindex.htmlに送る）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Latest Stabilized Backend is checking API Key and running on port ${port}`);
});

