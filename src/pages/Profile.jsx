import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cake, MapPin, Clock } from 'lucide-react';
import '../App.css';

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    nickname: '運動愛好者',
    email: 'user@example.com',
    birthday: '1998-05-20',
    bio: '喜歡週末到處打球，偶爾打打衛生麻將。',
    region: '桃園市'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('個人資料已更新！');
  };

  return (
    <div className="home-container">
      {/* 導覽列 */}
      <nav className="navbar">
        <div className="navbar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>不揪ㄛ</div>
        <div className="navbar-actions">
          <button className="btn-outline" onClick={() => navigate('/home')}>返回大廳</button>
        </div>
      </nav>

      <main className="main-content">
        <div className="profile-layout">
          {/* 左側：個人資料與信譽積分 */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="avatar-placeholder">
                {userInfo.nickname.charAt(0)}
              </div>
              
              {!isEditing ? (
                <>
                  <h2 className="profile-name">{userInfo.nickname}</h2>
                  <p className="profile-email">{userInfo.email}</p>
                  <p className="profile-email" style={{ marginTop: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Cake size={16} /> {userInfo.birthday}
                  </p>
                  <p className="profile-bio">{userInfo.bio}</p>
                  
                  <div className="reputation-box">
                    <div className="reputation-title">信譽積分</div>
                    <div className="reputation-score">98<span>/100</span></div>
                    <p className="reputation-desc">優良玩家，從不爽約！</p>
                  </div>

                  <button className="btn-outline" style={{ width: '100%', marginTop: '20px' }} onClick={() => setIsEditing(true)}>
                    編輯個人資料
                  </button>
                </>
              ) : (
                <form onSubmit={handleSave} className="edit-profile-form">
                  <div className="form-group">
                    <label className="form-label">暱稱</label>
                    <input type="text" className="form-input" value={userInfo.nickname} onChange={e => setUserInfo({...userInfo, nickname: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">生日</label>
                    <input type="date" className="form-input" value={userInfo.birthday} onChange={e => setUserInfo({...userInfo, birthday: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">常駐地區</label>
                    <select className="form-input" value={userInfo.region} onChange={e => setUserInfo({...userInfo, region: e.target.value})}>
                      <option value="桃園市">桃園市</option>
                      <option value="台北市">台北市</option>
                      <option value="新北市">新北市</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">個人簡介</label>
                    <textarea className="form-input" rows="3" value={userInfo.bio} onChange={e => setUserInfo({...userInfo, bio: e.target.value})}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>取消</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>儲存</button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* 右側：揪團紀錄 */}
          <div className="profile-content">
            <div className="content-header">
              <h2>我的揪團紀錄</h2>
            </div>
            
            <div className="party-grid">
              <div className="party-card">
                <div className="party-card-header">
                  <span className="party-type">籃球</span>
                  <span className="party-status" style={{ color: '#10b981' }}>已結束</span>
                </div>
                <h3 className="party-title">昨晚的巨蛋熱血籃球</h3>
                <div className="party-info">
                  <p style={{ gap: '6px' }}><MapPin size={16} /> 桃園巨蛋室外籃球場</p>
                  <p style={{ gap: '6px' }}><Clock size={16} /> 昨天 19:00</p>
                </div>
              </div>

              <div className="party-card">
                <div className="party-card-header">
                  <span className="party-type">麻將</span>
                  <span className="party-status" style={{ color: '#10b981' }}>已結束</span>
                </div>
                <h3 className="party-title">歡樂衛生麻將局</h3>
                <div className="party-info">
                  <p style={{ gap: '6px' }}><MapPin size={16} /> 中壢桌遊店</p>
                  <p style={{ gap: '6px' }}><Clock size={16} /> 上週五 20:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
