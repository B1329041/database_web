import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudSun, MapPin, Clock } from 'lucide-react';
import '../App.css';

function Home() {
  const navigate = useNavigate();

  // 模擬大廳假資料
  const [parties, setParties] = useState([
    { id: 1, title: '今晚巨蛋鬥牛', type: '籃球', level: '高手', time: '今晚 20:00', location: '桃園巨蛋室外籃球場', currentPlayers: 5, maxPlayers: 6, currentWaitlist: 0, maxWaitlist: 2, participants: ['阿傑', '小明', '老王', '建國', '阿翔'], waitlist: [] },
    { id: 2, title: '假日缺一咖打牌', type: '麻將', level: '休閒', time: '本週六 14:00', location: '中壢車站附近桌遊店', currentPlayers: 4, maxPlayers: 4, currentWaitlist: 1, maxWaitlist: 2, participants: ['主揪A', '玩家B', '玩家C', '玩家D'], waitlist: ['候補仔'] },
    { id: 3, title: '下班輕鬆打羽球', type: '羽球', level: '新手', time: '明天 19:00', location: '桃園國民運動中心', currentPlayers: 2, maxPlayers: 4, currentWaitlist: 0, maxWaitlist: 2, participants: ['羽球控', '小白'], waitlist: [] },
    { id: 4, title: '週末休閒打桌球', type: '桌球', level: '休閒', time: '週日 10:00', location: '平鎮國民運動中心', currentPlayers: 1, maxPlayers: 2, currentWaitlist: 0, maxWaitlist: 2, participants: ['桌球大師'], waitlist: [] },
    { id: 5, title: '虎頭山排球友誼賽', type: '排球', level: '休閒', time: '週六 16:00', location: '桃園虎頭山公園', currentPlayers: 12, maxPlayers: 12, currentWaitlist: 2, maxWaitlist: 2, participants: ['P1','P2','P3','P4','P5','P6','P7','P8','P9','P10','P11','P12'], waitlist: ['W1', 'W2'] },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newParty, setNewParty] = useState({ title: '', type: '籃球', level: '休閒', location: '', time: '', maxPlayers: 4 });

  const handleLogout = () => {
    navigate('/');
  };

  const handleCreateParty = (e) => {
    e.preventDefault();
    const party = {
      id: Date.now(),
      title: newParty.title,
      type: newParty.type,
      level: newParty.level,
      time: newParty.time.replace('T', ' '),
      location: newParty.location,
      currentPlayers: 1, // 發起人自己
      maxPlayers: parseInt(newParty.maxPlayers, 10),
      currentWaitlist: 0,
      maxWaitlist: 2,
      participants: ['我 (主揪)'],
      waitlist: [],
      description: '這是我剛發起的揪團，歡迎大家來玩！'
    };
    setParties([party, ...parties]);
    setIsModalOpen(false);
    setNewParty({ title: '', type: '籃球', level: '休閒', location: '', time: '', maxPlayers: 4 });
  };

  return (
    <div className="home-container">
      {/* 導覽列 */}
      <nav className="navbar">
        <div className="navbar-logo">不揪ㄛ</div>
        <div className="navbar-actions">
          <button className="btn-primary" onClick={() => navigate('/profile')}>個人</button>
          <button className="btn-outline" onClick={handleLogout}>登出</button>
        </div>
      </nav>

      {/* 內容區塊 */}
      <main className="main-content">
        <div className="content-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ marginBottom: 0 }}>揪團大廳</h2>
            <div className="weather-widget">
              <span className="weather-icon" style={{ display: 'flex' }}><CloudSun size={18} /></span>
              <span>桃園市 26°C 適合運動的好天氣</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="region-select">
              <option value="all">所有地區</option>
              <option value="taoyuan">桃園市</option>
              <option value="taipei">台北市</option>
              <option value="new_taipei">新北市</option>
            </select>
            <div className="filter-chips">
              <span className="chip active">全部</span>
              <span className="chip">籃球</span>
              <span className="chip">麻將</span>
              <span className="chip">桌球</span>
              <span className="chip">羽球</span>
              <span className="chip">排球</span>
            </div>
          </div>
        </div>

        {/* 卡片列表 */}
        <div className="party-grid">
          {parties.map(party => {
            const isFull = party.currentPlayers >= party.maxPlayers;
            const isWaitlistFull = party.currentWaitlist >= party.maxWaitlist;
            let statusText = `缺 ${party.maxPlayers - party.currentPlayers} 人`;
            let statusColor = '#ef4444'; // Red

            if (isFull && isWaitlistFull) {
              statusText = '已完全額滿';
              statusColor = '#94a3b8'; // Gray
            } else if (isFull) {
              statusText = `候補 ${party.currentWaitlist}/${party.maxWaitlist}`;
              statusColor = '#f59e0b'; // Orange
            }

            return (
              <div key={party.id} className="party-card clickable-card" onClick={() => navigate(`/party/${party.id}`, { state: { party } })}>
                <div className="party-card-header">
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="party-type">{party.type}</span>
                    <span className="party-level">{party.level}</span>
                  </div>
                  <span className="party-status" style={{ color: statusColor }}>{statusText}</span>
                </div>
                <h3 className="party-title">{party.title}</h3>
                <div className="party-info">
                  <p style={{ gap: '6px' }}><MapPin size={16} /> {party.location}</p>
                  <p style={{ gap: '6px' }}><Clock size={16} /> {party.time}</p>
                </div>
                <div className="party-card-footer">
                  <span className="player-count">目前人數: {party.currentPlayers} / {party.maxPlayers}</span>
                  <button className="btn-join" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/party/${party.id}`, { state: { party } });
                  }}>
                    {isFull && isWaitlistFull ? '查看詳情' : isFull ? '排候補' : '報名參加'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 右下角浮動發起按鈕 */}
      <div className="fab-container">
        <button className="fab-btn" onClick={() => setIsModalOpen(true)}>
          <span className="fab-icon">+</span>
          發起揪團
        </button>
      </div>

      {/* 發起揪團 Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>發起新揪團</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateParty}>
              <div className="form-group">
                <label className="form-label">揪團標題</label>
                <input required type="text" className="form-input" placeholder="例如：今晚巨蛋鬥牛缺二" value={newParty.title} onChange={e => setNewParty({...newParty, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">活動類型</label>
                <select className="form-input" value={newParty.type} onChange={e => setNewParty({...newParty, type: e.target.value})}>
                  <option value="籃球">籃球</option>
                  <option value="麻將">麻將</option>
                  <option value="桌球">桌球</option>
                  <option value="羽球">羽球</option>
                  <option value="排球">排球</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">地點</label>
                <input type="text" className="form-input" placeholder="例如：桃園巨蛋室外場" value={newParty.location} onChange={e => setNewParty({...newParty, location: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">程度</label>
                <select className="form-input" value={newParty.level} onChange={e => setNewParty({...newParty, level: e.target.value})}>
                  <option value="新手">新手</option>
                  <option value="休閒">休閒</option>
                  <option value="高手">高手</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">時間</label>
                <input type="datetime-local" className="form-input" value={newParty.time} onChange={e => setNewParty({...newParty, time: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">人數需求</label>
                <input required type="number" min="2" max="20" className="form-input" value={newParty.maxPlayers} onChange={e => setNewParty({...newParty, maxPlayers: e.target.value})} />
              </div>
              <button type="submit" className="login-button" style={{ marginTop: '10px' }}>確認發起</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
