import { useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MapPin, Clock, ArrowLeft, Timer, DollarSign, Info, CheckCircle2, Users } from 'lucide-react';
import '../App.css';

function PartyDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const defaultParty = useMemo(() => ({
    id: id,
    title: '未知的揪團',
    type: '未知',
    level: '休閒',
    time: '未知時間',
    location: '未知地點',
    duration: '2 小時',
    price: '免費',
    facilities: ['冷氣', '飲水機', '廁所', '淋浴間'],
    currentPlayers: 1,
    maxPlayers: 4,
    currentWaitlist: 0,
    maxWaitlist: 2,
    host: '主揪人',
    description: '這是一個預設的揪團說明。大家一起開心打球，友誼第一！記得帶自己的裝備喔。',
    participants: [{ name: '主揪人', phone: '0912-345-678', line: 'host_id' }],
    waitlist: []
  }), [id]);

  const initialParty = useMemo(() => {
    const party = location.state?.party || defaultParty;
    const processedParty = { ...party };

    // 確保 participants 是物件陣列格式
    if (processedParty.participants && typeof processedParty.participants[0] === 'string') {
      processedParty.participants = processedParty.participants.map((p, idx) => ({
        name: p,
        phone: idx === 0 ? '0912-345-678' : '0911-222-333',
        line: `${p.replace(/\s+/g, '_').toLowerCase()}_line`,
        age: 20 + (idx * 2), // 固定 mock 數據避免 Math.random()
        level: ['S', 'A', 'B', 'C'][idx % 4]
      }));
    }
    if (processedParty.waitlist && typeof processedParty.waitlist[0] === 'string') {
      processedParty.waitlist = processedParty.waitlist.map((p, idx) => ({
        name: p,
        phone: '0911-222-333',
        line: `${p.replace(/\s+/g, '_').toLowerCase()}_line`,
        age: 25 + idx,
        level: ['B', 'C'][idx % 2]
      }));
    }
    return processedParty;
  }, [location.state, defaultParty]);

  const [party, setParty] = useState(initialParty);
  const [hasJoined, setHasJoined] = useState(false);
  const [joinType, setJoinType] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showListModal, setShowListModal] = useState(null); // 'participants' | 'waitlist' | null
  const [selectedMember, setSelectedMember] = useState(null); // 新增：被選擇查看資料的成員

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleJoin = () => {
    const newMember = { 
      name: '我 (使用者)', 
      phone: '0987-654-321', 
      line: 'my_id_888',
      age: 20,
      level: 'A'
    };
    if (party.currentPlayers < party.maxPlayers) {
      setParty(prev => ({
        ...prev,
        currentPlayers: prev.currentPlayers + 1,
        participants: [...prev.participants, newMember]
      }));
      setJoinType('normal');
      setHasJoined(true);
      showToast('報名成功！你已在正取名單中。');
    } else if (party.currentWaitlist < party.maxWaitlist) {
      setParty(prev => ({
        ...prev,
        currentWaitlist: prev.currentWaitlist + 1,
        waitlist: [...prev.waitlist, newMember]
      }));
      setJoinType('waitlist');
      setHasJoined(true);
      showToast('已進入候補名單！有人退出時系統會依序遞補。');
    }
  };

  const handleCancel = () => {
    if (joinType === 'normal') {
      setParty(prev => ({
        ...prev,
        currentPlayers: prev.currentPlayers - 1,
        participants: prev.participants.filter(p => p.name !== '我 (使用者)')
      }));
    } else if (joinType === 'waitlist') {
      setParty(prev => ({
        ...prev,
        currentWaitlist: prev.currentWaitlist - 1,
        waitlist: prev.waitlist.filter(p => p.name !== '我 (使用者)')
      }));
    }
    setHasJoined(false);
    setJoinType(null);
    showToast('已成功取消報名。');
  };

  const isFull = party.currentPlayers >= party.maxPlayers;
  const isWaitlistFull = party.currentWaitlist >= party.maxWaitlist;
  
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/home')}>不揪ㄛ</div>
        <div className="navbar-actions">
          <button className="btn-outline" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
            <ArrowLeft size={16} /> 返回大廳
          </button>
        </div>
      </nav>

      <main className="main-content" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
        
        <div className="detail-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
          
          {/* 標題與設施 (背景透明度調整) */}
          <div style={{ minHeight: '220px', background: 'linear-gradient(135deg, rgba(121, 149, 165, 0.85), rgba(75, 98, 114, 0.85))', padding: '60px 40px 30px 40px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="party-type" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>{party.type}</span>
              <span className="party-level" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{party.level || '休閒'}</span>
            </div>
            
            <h1 className="detail-title" style={{ color: 'white', marginTop: '16px', marginBottom: '16px' }}>{party.title}</h1>
            
            {/* 設施標籤移到標題下方 */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(party.facilities || ['冷氣', '飲水機', '廁所', '淋浴間']).map((f, i) => (
                <span key={i} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> {f}
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: '40px' }}>
            <div className="detail-info-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingBottom: '32px' }}>
              <div className="detail-info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Clock size={20} color="#7995a5" />
                <span style={{ color: '#64748b', fontWeight: '600' }}>時間：</span>
                <span style={{ fontWeight: '800' }}>{party.time}</span>
              </div>

              <div className="detail-info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <Timer size={20} color="#7995a5" />
                <span style={{ color: '#64748b', fontWeight: '600' }}>時長：</span>
                <span style={{ fontWeight: '800' }}>{party.duration || '2 小時'}</span>
              </div>

              <div className="detail-info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <MapPin size={20} color="#7995a5" />
                <span style={{ color: '#64748b', fontWeight: '600' }}>地點：</span>
                <span style={{ fontWeight: '800' }}>{party.location}</span>
              </div>

              <div className="detail-info-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <DollarSign size={20} color="#7995a5" />
                <span style={{ color: '#64748b', fontWeight: '600' }}> 價格：</span>
                <span style={{ fontWeight: '800', color: '#1e293b' }}>
                  {party.price && party.price.includes('總額分攤') ? (
                    <>
                      {party.price}
                      <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '14px' }}>
                        (${Math.ceil(parseFloat(party.price.replace(/[^0-9.]/g, '')) / party.maxPlayers)} / 人)
                      </span>
                    </>
                  ) : (
                    party.price || '免費'
                  )}
                </span>
              </div>

            </div>

            <div className="detail-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Info size={20} /> 備註與說明</h3>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p className="detail-desc" style={{ margin: 0, lineHeight: '1.6' }}>{party.description || '大家一起開心打球，友誼第一！記得帶自己的水壺與毛巾。'}</p>
              </div>
            </div>

            {/* 參與與候補名單按鈕 */}
            <div className="detail-section" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '32px', marginBottom: '32px' }}>
              <button className="btn-outline" style={{ flex: '1 1 200px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', backgroundColor: '#f8fafc' }} onClick={() => setShowListModal('participants')}>
                <Users size={20} /> 查看參與名單 ({party.currentPlayers}/{party.maxPlayers})
              </button>
              {(party.currentWaitlist > 0 || isFull) && (
                <button className="btn-outline" style={{ flex: '1 1 200px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', borderColor: '#fcd34d', color: '#d97706', backgroundColor: '#fffbeb' }} onClick={() => setShowListModal('waitlist')}>
                  ⏳ 查看候補名單 ({party.currentWaitlist}/{party.maxWaitlist})
                </button>
              )}
            </div>

            {/* 報名參加按鈕 (居中顯示於名單按鈕下方) */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {hasJoined ? (
                <button className="btn-action cancel" onClick={handleCancel}>
                  取消報名
                </button>
              ) : isFull && isWaitlistFull ? (
                <button className="btn-action disabled" disabled>
                  已完全額滿
                </button>
              ) : isFull ? (
                <button className="btn-action waitlist" style={{ width: '100%' }} onClick={handleJoin}>
                  排候補
                </button>
              ) : (
                <button className="btn-action join" style={{ width: '100%' }} onClick={handleJoin}>
                  報名參加
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 底部報名列 */}
      {/* 名單 Modal */}
      {showListModal && (
        <div className="modal-overlay" onClick={() => setShowListModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{showListModal === 'participants' ? `👥 參與名單 (${party.currentPlayers}/${party.maxPlayers})` : `⏳ 候補名單 (${party.currentWaitlist}/${party.maxWaitlist})`}</h3>
              <button className="modal-close" onClick={() => setShowListModal(null)}>&times;</button>
            </div>
            <div className="participant-list-vertical" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
              {(showListModal === 'participants' ? party.participants : party.waitlist).map((p, idx) => (
                <div key={idx} className="participant-item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="participant-avatar" style={showListModal === 'waitlist' ? { backgroundColor: '#94a3b8' } : {}}>{p.name.charAt(0)}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700' }}>
                        {p.name}
                        {showListModal === 'participants' && idx === 0 && (
                          <span style={{ marginLeft: '8px', padding: '2px 8px', backgroundColor: '#7995a5', color: 'white', fontSize: '11px', borderRadius: '4px', fontWeight: '800' }}>主揪</span>
                        )}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{p.age} 歲</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#7995a5' }}>等級: {p.level}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn-outline" 
                    style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px' }}
                    onClick={() => setSelectedMember(p)}
                  >
                    查看資料
                  </button>
                </div>
              ))}
              {showListModal === 'waitlist' && party.waitlist.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>目前無人候補</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 成員詳細資料 Modal */}
      {selectedMember && (
        <div className="modal-overlay" onClick={() => setSelectedMember(null)} style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px', textAlign: 'center' }}>
            <div className="avatar-placeholder" style={{ width: '80px', height: '80px', fontSize: '32px', marginBottom: '16px' }}>
              {selectedMember.name.charAt(0)}
            </div>
            <h3 style={{ marginBottom: '8px' }}>{selectedMember.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>成員聯繫資訊</p>
            
            <div style={{ textAlign: 'left', backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>電話號碼</span>
                <span style={{ fontWeight: '700' }}>{selectedMember.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>LINE / 通訊</span>
                <span style={{ fontWeight: '700' }}>{selectedMember.line}</span>
              </div>
            </div>
            
            <button className="login-button" onClick={() => setSelectedMember(null)}>關閉</button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast-message">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

export default PartyDetail;
