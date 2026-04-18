import { useState, useEffect } from 'react';
import './App.css';
import { generateGeminiContent } from './api';

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle', color: '#60a5fa'}}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', verticalAlign: 'middle', color: '#c084fc'}}>
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <line x1="12" x2="12" y1="9" y2="13"></line>
    <line x1="12" x2="12.01" y1="17" y2="17"></line>
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
    <circle cx="9" cy="9" r="2"></circle>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#60a5fa', marginBottom: '1rem'}}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('app_password'));
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [profileSns, setProfileSns] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileProduct, setProfileProduct] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const [isProfiling, setIsProfiling] = useState(false);
  const [profileResult, setProfileResult] = useState(null);
  const [profileError, setProfileError] = useState('');

  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpProduct, setFollowUpProduct] = useState('');
  const [followUpImage, setFollowUpImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [followUpResult, setFollowUpResult] = useState(null);
  const [followUpError, setFollowUpError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'brainhack1991') {
      localStorage.setItem('app_password', passwordInput);
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('合言葉が違います。チームのリーダーに確認してください。');
    }
  };

  const handleImageChange = (e, setBase64Func) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Func(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setBase64Func(null);
    }
  };

  const handleProfile = async () => {
    if (!profileSns.trim() && !profileRole.trim() && !profileEmail.trim() && !profileImage && !profileProduct.trim()) {
      setProfileError('何か情報を入力するか、画像を添付してください。');
      return;
    }

    setIsProfiling(true);
    setProfileResult(null);
    setProfileError('');

    const prompt = `あなたは「超・徹底準備AI」という世界最高峰の戦略家・セールスアドバイザーです。
あなたの任務は、断片的な情報からでも相手の懐に入り込むための「勝ち筋」を見つけ出すことです。
【絶対遵守のルール】
1. **全項目の完遂**: 情報不足でも、相手の役職や業界から推測してすべての項目を必ず埋めてください。
2. **コスト削減のための極限の簡潔さ**: 無駄な装飾言葉や長文を徹底的に排除し、各項目は「最も重要な要点のみ」を1〜2文で短く鋭く記載してください。全体で文字数を従来の半分以下に抑え、APIトークン消費を最小化してください。
3. **性格分類**: 「DiSC理論」と「アマサイ（アクティブ・マネージ・サービス・イノベーション）」の両軸を用いて、相手の性格タイプを分析・記載してください。
4. **具体性**: 「課題感」「キラーフレーズ」「シナリオ」は短くとも現場ですぐ使える鋭い内容にしてください。

【1. SNS・プロフィール情報】
${profileSns.trim() || '（限定的）'}

【2. 役職・企業・業界に関する情報】
${profileRole.trim() || '（一般的な傾向から分析せよ）'}

【3. 直近のやり取り文面】
${profileEmail.trim() || '（限定的）'}

【4. 今回提案する商材/サービス】
${profileProduct.trim() || '（一般的な営業スタイルで最高のアプローチを考えよ）'}

必ず指定されたJSON形式で、短く鋭い日本語で回答してください。`;

    try {
      const result = await generateGeminiContent(prompt, 'profile', profileImage, profileProduct);
      setProfileResult(result);
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('合言葉')) {
        localStorage.removeItem('app_password');
        setIsAuthenticated(false);
      }
      setProfileError(error.message);
    } finally {
      setIsProfiling(false);
    }
  };

  const handleFollowUp = async () => {
    if (!followUpInput.trim() && !followUpImage) return;

    setIsGenerating(true);
    setFollowUpResult(null);
    setFollowUpError('');

    const prompt = `あなたはトップセールスマンのゴーストライター及び戦略顧問です。
商談で相手の心を動かし、信用と紹介を勝ち取るための「非常に質の高い深い準備や気遣い」が伝わるアフターフォローを設計してください。
以下の「商談のメモ」と「提案した商材」の情報から、最適な媒体を選定し、その媒体に最適化されたメッセージ文面を作成してください。

【指示】
- 相手の性格や商談の雰囲気に合わせ、メール、チャット、音声メッセージ、動画メッセージの中から最も効果的なものを1つ選んでください。
- なぜその媒体なのか、心理学的な根拠や戦略的な狙いを「戦略的理由」に記載してください。
- APIコスト削減のため、無駄な装飾や長文を排除し、全体の文字数を極限まで少なくした「短く鋭い」内容にしてください。

【商談のメモ】
${followUpInput.trim() || '（文章の情報なし。添付画像を参考にしてください）'}

【今回の提案商材の内容】
${followUpProduct.trim() || '（記述なし。文脈から推察してください）'}

必ず指定されたJSON形式で、短く的確な日本語で回答してください。`;

    try {
      const result = await generateGeminiContent(prompt, 'followup', followUpImage, followUpProduct);
      setFollowUpResult(result);
    } catch (error) {
       if (error.message.includes('401') || error.message.includes('合言葉')) {
        localStorage.removeItem('app_password');
        setIsAuthenticated(false);
      }
      setFollowUpError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card glass-panel">
          <div className="auth-header">
            <LockIcon />
            <h2>Trust-Builder AI</h2>
            <p>このツールはチーム限定です。合言葉を入力してください。</p>
          </div>
          <form onSubmit={handleLogin} className="auth-form">
            <input
              type="password"
              className="input-field"
              placeholder="合言葉を入力してください..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            {authError && <div className="error-message" style={{textAlign: 'center'}}>{authError}</div>}
            <button type="submit" className="btn">ログイン</button>
          </form>
        </div>
      </div>
    );
  }

  const isProfileDisabled = !profileSns.trim() && !profileRole.trim() && !profileEmail.trim() && !profileImage && !profileProduct.trim();
  const isFollowUpDisabled = !followUpInput.trim() && !followUpImage;

  return (
    <div className="app-container">
      <header className="header">
        <h1>Trust-Builder AI</h1>
        <p>「量」ではなく、圧倒的な「質と信用」を生み出す営業支援ツール</p>
      </header>

      <main className="modules-grid">
        {/* Module 2: Profiling */}
        <section className="glass-panel">
          <h2 className="panel-title">
            <UserIcon /> 商談前プロファイリング
          </h2>
          
          <div style={{marginBottom: '1.5rem'}}>
            <div className="input-group" style={{marginBottom: '1rem'}}>
              <label htmlFor="profileProduct">📦 提案予定の商材・サービス</label>
              <input
                id="profileProduct"
                type="text"
                className="input-field"
                placeholder="例：AI呼報システム、月額10万円のコンサル..."
                value={profileProduct}
                onChange={(e) => setProfileProduct(e.target.value)}
                style={{borderColor: 'rgba(96, 165, 250, 0.4)'}}
              />
            </div>

            <div className="input-group" style={{marginBottom: '1rem'}}>
              <label htmlFor="profileSns">📝 1. SNS・プロフィール（ある場合）</label>
              <input
                id="profileSns"
                type="text"
                className="input-field"
                placeholder="LinkedIn等のURL、実名など..."
                value={profileSns}
                onChange={(e) => setProfileSns(e.target.value)}
              />
            </div>

            <div className="input-group" style={{marginBottom: '1rem'}}>
              <label htmlFor="profileRole">🏢 2. 役職・企業・業界（ある場合）</label>
              <input
                id="profileRole"
                type="text"
                className="input-field"
                placeholder="例：従業員50名の医療機器メーカーの営業部長"
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
              />
            </div>

            <div className="input-group" style={{marginBottom: '1rem'}}>
              <label htmlFor="profileEmail">✉️ 3. メールやチャット文面（ある場合）</label>
              <textarea
                id="profileEmail"
                className="input-field"
                rows={3}
                placeholder="日程調整時のやり取りや、言葉使いの癖など..."
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>

            <div className="input-group" style={{marginBottom: '0'}}>
              <label><ImageIcon /> 🖼️ 画像・スクショの添付（名刺やSNSなど）</label>
              <div style={{display: 'flex', alignItems: 'center', marginTop: '0.5rem'}}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, setProfileImage)} 
                  style={{fontSize: '0.85rem', color: '#cbd5e1'}}
                />
              </div>
            </div>
          </div>

          <button 
            className="btn" 
            onClick={handleProfile} 
            disabled={isProfiling || isProfileDisabled}
          >
            {isProfiling ? (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div className="loader" style={{marginRight: '10px'}}></div>
                <span>分析中（最大30秒かかる場合があります）</span>
              </div>
            ) : 'テキストと画像から攻略法を出す'}
          </button>

          {profileError && (
            <div className="error-message" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
              <span>{profileError}</span>
              <button 
                className="btn" 
                onClick={handleProfile} 
                style={{width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444'}}
              >
                🔄 再試行する
              </button>
            </div>
          )}

          {profileResult && (
            <div className="result-area">
              <div className="result-section">
                <div className="result-label">性格タイプ（推論）</div>
                <div className="result-value accent-text">{profileResult.type || '分析中...'}</div>
              </div>
              
              <div className="result-section">
                <div className="result-label">🔥 想定される課題感（痛み）</div>
                <div className="result-value">
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.95rem' }}>
                    {profileResult.challenges && Array.isArray(profileResult.challenges) ? (
                      profileResult.challenges.map((item, i) => (
                        <li key={i} style={{marginBottom: '0.5rem', color: '#e2e8f0'}}>{item}</li>
                      ))
                    ) : (
                      <li style={{color: '#94a3b8'}}>課題の再抽出を行ってください。</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="result-section">
                <div className="result-label">🎬 商談の流れ・シナリオ案</div>
                <div className="result-value" style={{fontSize: '0.95rem', lineHeight: '1.6', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #60a5fa'}}>
                  {profileResult.scenario || 'シナリオ案を作成中... 再試行してください。'}
                </div>
              </div>

              <div className="result-section">
                <div className="result-label">商談のキラーフレーズ</div>
                <div className="result-value" style={{fontWeight: 'bold', color: '#60a5fa', fontSize: '1.1rem'}}>{profileResult.killerPhrase || 'フレーズ考案中...'}</div>
              </div>

              <div className="result-section">
                <div className="result-label danger-text">
                  <AlertIcon /> 絶対に避けるべき地雷
                </div>
                <div className="result-value">
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {profileResult.landmines && Array.isArray(profileResult.landmines) ? (
                      profileResult.landmines.map((item, i) => (
                        <li key={i} className="danger-text" style={{marginBottom: '0.3rem'}}>{item}</li>
                      ))
                    ) : (
                      <li>（情報なし）</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Module 3: Follow up */}
        <section className="glass-panel">
          <h2 className="panel-title">
            <MailIcon /> 神アフターフォロー生成
          </h2>

          <div className="input-group" style={{marginBottom: '1rem'}}>
            <label htmlFor="followUpProduct">📦 今回提案した商材の内容</label>
            <input
              id="followUpProduct"
              type="text"
              className="input-field"
              placeholder="例：SmartAssist Pro（月額980円のAI日報ツール）"
              value={followUpProduct}
              onChange={(e) => setFollowUpProduct(e.target.value)}
              style={{borderColor: 'rgba(139, 92, 246, 0.4)'}}
            />
          </div>

          <div className="input-group" style={{marginBottom: '1rem'}}>
            <label htmlFor="followUpInput">商談のメモ・音声入力テキスト</label>
            <textarea
              id="followUpInput"
              className="input-field"
              rows={4}
              placeholder="今日の商談内容のメモ..."
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
            />
          </div>

          <div className="input-group" style={{marginBottom: '0', marginTop: '0.5rem'}}>
            <label><ImageIcon /> 🖼️ 手書きメモ・議事録のスクショ添付</label>
            <div style={{display: 'flex', alignItems: 'center', marginTop: '0.5rem'}}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageChange(e, setFollowUpImage)} 
                style={{fontSize: '0.85rem', color: '#cbd5e1'}}
              />
            </div>
          </div>

          <button 
            className="btn" 
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', marginTop: '1.5rem' }}
            onClick={handleFollowUp} 
            disabled={isGenerating || isFollowUpDisabled}
          >
            {isGenerating ? (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div className="loader" style={{marginRight: '10px'}}></div>
                <span>生成中（混雑時は自動リトライ中）...</span>
              </div>
            ) : '感動を生むフォローアップを作成'}
          </button>

          {followUpError && (
             <div className="error-message" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
               <span>{followUpError}</span>
               <button 
                 className="btn" 
                 onClick={handleFollowUp} 
                 style={{width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444'}}
               >
                 🔄 もう一度試す
               </button>
             </div>
          )}



          {followUpResult && (
            <div className="result-area" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
              <div className="result-section">
                <div className="result-label" style={{ color: '#c4b5fd' }}>📡 推奨フォローアップ媒体</div>
                <div className="result-value accent-text" style={{ color: '#d8b4fe', fontWeight: 'bold', fontSize: '1.1rem' }}>{followUpResult.recommendedMedium}</div>
              </div>
              <div className="result-section" style={{ marginTop: '0.8rem' }}>
                <div className="result-label" style={{ color: '#c4b5fd' }}>🎯 その媒体を選ぶ戦略的理由</div>
                <div className="result-value" style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{followUpResult.mediumReasoning}</div>
              </div>
              <div className="result-section" style={{ marginTop: '1.2rem' }}>
                <div className="result-label" style={{ color: '#c4b5fd' }}>✍️ 最適化されたメッセージ文面 / 台本案</div>
                <div className="result-value email-draft">
                  {followUpResult.messageDraft}
                </div>
              </div>
              <div className="result-section" style={{ marginTop: '1rem' }}>
                <div className="result-label" style={{ color: '#c4b5fd' }}>🚀 ネクストアクション</div>
                <div className="result-value success-text">{followUpResult.nextAction}</div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}



export default App;
