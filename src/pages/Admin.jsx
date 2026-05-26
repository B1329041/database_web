import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPinned, Bell, Plus, Trash2, ArrowLeft, TrendingUp, BarChart3, MessageSquarePlus } from 'lucide-react';
import '../App.css';

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // 模擬場地資料庫
  const [venues, setVenues] = useState([
    { id: 1, name: '桃園國民運動中心', city: '桃園市', district: '桃園區', facilities: ['冷氣', '飲水機', '廁所', '淋浴間'] },
    { id: 2, name: '桃園巨蛋室外籃球場', city: '桃園市', district: '桃園區', facilities: ['飲水機', '廁所'] },
    { id: 3, name: '台大體育館', city: '台北市', district: '大安區', facilities: ['冷氣', '飲水機', '廁所'] },
  ]);

  // 模擬公告資料
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: '系統維護通知', content: '我們將於週日凌晨進行系統更新。', date: '2026-05-24' },
    { id: 2, title: '新場地上線！', content: '現在可以選擇「台中洲際棒球場」進行揪團囉。', date: '2026-05-20' },
  ]);

  const [newVenue, setNewVenue] = useState({ name: '', city: '桃園市', district: '', facilities: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  const handleAddVenue = (e) => {
    e.preventDefault();
    if (!newVenue.name) return;
    const venue = {
      id: Date.now(),
      name: newVenue.name,
      city: newVenue.city,
      district: newVenue.district,
      facilities: newVenue.facilities.split(',').map(f => f.trim())
    };
    setVenues([...venues, venue]);
    setNewVenue({ name: '', city: '桃園市', district: '', facilities: '' });
    alert('場地已新增！');
  };

  const handleDeleteVenue = (id) => {
    if (window.confirm('確定要刪除此場地嗎？')) {
      setVenues(venues.filter(v => v.id !== id));
    }
  };

  const handleAddAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnouncement.title) return;
    const announcement = {
      id: Date.now(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement({ title: '', content: '' });
    alert('公告已發佈！');
  };

  const handleDeleteAnnouncement = (id) => {
    if (window.confirm('確定要刪除此公告嗎？')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  return (
    <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* 側邊欄 */}
      <aside style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#7995a5', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>不</div>
          <span style={{ fontSize: '20px', fontWeight: '800' }}>管理後台</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} /> 數據分析
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'venues' ? 'active' : ''}`}
            onClick={() => setActiveTab('venues')}
          >
            <MapPinned size={20} /> 場地管理
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <Bell size={20} /> 系統公告
          </button>
        </nav>

        <button 
          onClick={() => navigate('/')}
          style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '12px' }}
        >
          <ArrowLeft size={18} /> 退出管理員
        </button>
      </aside>

      {/* 主內容區 */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* 數據分析 Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: '32px' }}>揪團數據統計</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
              <div className="stat-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} color="#7995a5" /> 今日活躍人數
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>1,284</div>
                <div style={{ color: '#10b981', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>↑ 12% 較昨日增長</div>
              </div>
              <div className="stat-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={16} color="#10b981" /> 進行中揪團
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>42</div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>目前最受歡迎：籃球</div>
              </div>
              <div className="stat-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#f59e0b" /> 系統訊息
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>5</div>
                <div style={{ color: '#f59e0b', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>有 3 條建議回饋</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '20px' }}>近期活動熱度</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} style={{ flex: 1, backgroundColor: '#f1f5f9', borderRadius: '4px', height: '100%', position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#7995a5', height: `${h}%`, borderRadius: '4px' }}></div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '12px' }}>
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '20px' }}>熱門運動比例</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[['籃球', '45%'], ['麻將', '25%'], ['羽球', '15%'], ['其他', '15%']].map(([name, pct], i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px' }}>
                        <span>{name}</span><span>{pct}</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                        <div style={{ height: '100%', backgroundColor: '#7995a5', width: pct, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 場地管理 Tab */}
        {activeTab === 'venues' && (
          <div className="admin-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0 }}>場地管理</h2>
              <button className="btn-primary" onClick={() => document.getElementById('add-venue-form').scrollIntoView({ behavior: 'smooth' })}>
                <Plus size={18} /> 新增場地
              </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '16px' }}>場地名稱</th>
                    <th style={{ padding: '16px' }}>縣市/區域</th>
                    <th style={{ padding: '16px' }}>設施</th>
                    <th style={{ padding: '16px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px', fontWeight: '700' }}>{v.name}</td>
                      <td style={{ padding: '16px' }}>{v.city} {v.district}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {v.facilities.map((f, i) => (
                            <span key={i} style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{f}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button onClick={() => handleDeleteVenue(v.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="add-venue-form" style={{ marginTop: '40px', backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '24px' }}>新增場地資料</h3>
              <form onSubmit={handleAddVenue} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label">場地名稱</label>
                  <input required type="text" className="form-input" placeholder="例如：板橋第二運動場" value={newVenue.name} onChange={e => setNewVenue({...newVenue, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">縣市</label>
                  <select className="form-input" value={newVenue.city} onChange={e => setNewVenue({...newVenue, city: e.target.value})}>
                    <option value="桃園市">桃園市</option>
                    <option value="台北市">台北市</option>
                    <option value="新北市">新北市</option>
                    <option value="台中市">台中市</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">區域</label>
                  <input required type="text" className="form-input" placeholder="例如：板橋區" value={newVenue.district} onChange={e => setNewVenue({...newVenue, district: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">設施 (以逗號分隔)</label>
                  <input required type="text" className="form-input" placeholder="例如：冷氣, 飲水機, 廁所" value={newVenue.facilities} onChange={e => setNewVenue({...newVenue, facilities: e.target.value})} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <button type="submit" className="login-button" style={{ width: '200px' }}>確認新增場地</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 系統公告 Tab */}
        {activeTab === 'announcements' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ margin: 0 }}>系統公告管理</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
              {/* 發佈公告表單 */}
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquarePlus size={20} /> 發佈新公告</h3>
                <form onSubmit={handleAddAnnouncement}>
                  <div className="form-group">
                    <label className="form-label">公告標題</label>
                    <input required type="text" className="form-input" placeholder="輸入標題" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">內容</label>
                    <textarea required className="form-input" rows="4" placeholder="輸入公告詳細內容..." value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} style={{ resize: 'none' }}></textarea>
                  </div>
                  <button type="submit" className="login-button">發佈公告</button>
                </form>
              </div>

              {/* 已發佈公告列表 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ marginBottom: '4px' }}>已發佈公告</h3>
                {announcements.map(a => (
                  <div key={a.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '16px' }}>{a.title}</span>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{a.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5', paddingRight: '40px' }}>{a.content}</p>
                    <button 
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      style={{ position: 'absolute', right: '20px', top: '20px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
