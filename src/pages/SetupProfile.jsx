import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function SetupProfile() {
  const [level, setLevel] = useState('休閒');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Setup Profile:', { level, bio, birthday, phone });
    // TODO: Connect to backend API
    alert('設定完成，歡迎加入！');
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">建立個人檔案</h1>
          <p className="login-subtitle">讓大家更認識你，輕鬆找到好球友！</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="level">自身程度</label>
            <select
              id="level"
              className="form-input"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="新手">新手</option>
              <option value="休閒">休閒</option>
              <option value="高手">高手</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="birthday">生日 (選填)</label>
            <input
              id="birthday"
              type="date"
              className="form-input"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">聯絡電話 (選填)</label>
            <input
              id="phone"
              type="tel"
              className="form-input"
              placeholder="09xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="bio">個人簡介 (選填)</label>
            <textarea
              id="bio"
              className="form-input"
              placeholder="喜歡打什麼位置？常在哪裡出沒？寫下你想對大家說的話..."
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>
          
          <button type="submit" className="login-button" style={{ marginTop: '20px' }}>
            進入大廳
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetupProfile;
