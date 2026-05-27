import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, X } from 'lucide-react';
import '../App.css';

function SetupProfile() {
  const [levels, setLevels] = useState({
    '籃球': 'C',
    '排球': 'C',
    '羽球': 'C',
    '桌球': 'C',
    '麻將': 'C'
  });
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const [line, setLine] = useState('');
  const [ig, setIg] = useState('');
  const [showLevelHelp, setShowLevelHelp] = useState(false);
  const navigate = useNavigate();

  const handleLevelChange = (sport, value) => {
    setLevels({ ...levels, [sport]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 手機號碼格式驗證 (台灣格式: 09xxxxxxxx)
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(phone)) {
      alert('請輸入正確的手機號碼格式 (例如: 0912345678)！');
      return;
    }

    console.log('Setup Profile:', { levels, bio, birthday, phone, line, ig });
    // TODO: Connect to backend API
    alert('設定完成，歡迎加入！');
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '700px' }}>
        <div className="login-header">
          <h1 className="login-title">建立個人檔案</h1>
          <p className="login-subtitle">讓大家更認識你，輕鬆找到好球友！</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>各項運動程度 (SABC)</h3>
              <HelpCircle 
                size={20} 
                color="#7995a5" 
                style={{ cursor: 'pointer' }} 
                onClick={() => setShowLevelHelp(true)}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {Object.keys(levels).map(sport => (
                <div key={sport} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ marginBottom: '4px', fontSize: '13px' }}>{sport}</label>
                  <select
                    className="form-input"
                    value={levels[sport]}
                    onChange={(e) => handleLevelChange(sport, e.target.value)}
                  >
                    <option value="S">S 級 (菁英)</option>
                    <option value="A">A 級 (高手)</option>
                    <option value="B">B 級 (熟練)</option>
                    <option value="C">C 級 (新手)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="birthday">生日 (必填)</label>
              <input
                id="birthday"
                type="date"
                className="form-input"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">聯絡電話 (必填)</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="09xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="line">LINE ID (選填)</label>
              <input
                id="line"
                type="text"
                className="form-input"
                placeholder="輸入 LINE ID"
                value={line}
                onChange={(e) => setLine(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ig">Instagram (選填)</label>
              <input
                id="ig"
                type="text"
                className="form-input"
                placeholder="@username"
                value={ig}
                onChange={(e) => setIg(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bio">個人簡介 (選填)</label>
            <textarea
              id="bio"
              className="form-input"
              placeholder="喜歡打什麼位置？常在哪裡出沒？寫下你想對大家說的話..."
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>
          
          <button type="submit" className="login-button" style={{ marginTop: '10px' }}>
            進入大廳
          </button>
        </form>
      </div>

      {/* 能力參考表 Modal */}
      {showLevelHelp && (
        <div className="modal-overlay" onClick={() => setShowLevelHelp(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={24} color="#7995a5" /> 能力程度參考表</h3>
              <button className="modal-close" onClick={() => setShowLevelHelp(false)}><X size={24} /></button>
            </div>
            
            <div className="help-section" style={{ marginBottom: '32px' }}>
              <h4 style={{ color: '#7995a5', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '16px' }}>🏀 球類運動 (Ball Games)</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>* 以排球為參考基準，其他球類以此類推</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <strong style={{ color: '#ef4444' }}>S 級 (菁英)：</strong>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>大專公開一、甲組等級，具備強烈跳發、精準快攻與高強度攔網的神仙打架。</span>
                </div>
                <div>
                  <strong style={{ color: '#f59e0b' }}>A 級 (高手)：</strong>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>大專一般組或校隊，能跑 5-1 戰術陣型、具備背舉與看手型重扣的流暢比賽。</span>
                </div>
                <div>
                  <strong style={{ color: '#10b981' }}>B 級 (熟練)：</strong>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>系隊主力或熱門 Play 咖，一接二傳穩定不持球，攻擊手能包球壓腕的三下組織。</span>
                </div>
                <div>
                  <strong style={{ color: '#94a3b8' }}>C 級 (新手)：</strong>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>剛入門的休閒玩家，以發球過網為目標，容易噴球、常直接送球過網的歡樂運動。</span>
                </div>
              </div>
            </div>

            <div className="help-section">
              <h4 style={{ color: '#7995a5', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '16px' }}>🀄 麻將 (Mahjong)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <strong style={{ color: '#ef4444' }}>S 級 (菁英)：</strong>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>職業賽事或頂尖老手等級，具備精準讀牌、扣死絕張與利用捨牌誘導對手放槍的神仙打架。</span>
                </div>
                <div>
                  <strong style={{ color: '#f59e0b' }}>A 級 (高手)：</strong>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>長期牌桌常客或賽事玩家，能依進牌機率迅速轉圈、具備果斷防守下車與看穿多面聽的高強度心理戰。</span>
                </div>
                <div>
                  <strong style={{ color: '#10b981' }}>B 級 (熟練)：</strong>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>週末固定牌咖或過年主力，吃碰槓反應順暢不拖台錢，具備看海底防守與穩定組出基本台數的流暢牌局。</span>
                </div>
                <div>
                  <strong style={{ color: '#94a3b8' }}>C 級 (新手)：</strong>
                  <span style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>剛入門的休閒玩家，以知道自己聽什麼牌為目標，容易相公、常問「這張可以吃嗎」的歡樂麻將。</span>
                </div>
              </div>
            </div>
            
            <button className="login-button" style={{ marginTop: '32px' }} onClick={() => setShowLevelHelp(false)}>我瞭解了</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SetupProfile;
