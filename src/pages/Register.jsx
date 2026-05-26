import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function Register() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('兩次密碼輸入不一致喔！');
      return;
    }
    console.log('Register attempt:', { nickname, email, password });
    // TODO: Connect to backend API
    alert('註冊成功！');
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">加入不揪ㄛ</h1>
          <p className="login-subtitle">註冊新帳號，開始你的第一局！</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="nickname">暱稱</label>
            <input
              id="nickname"
              type="text"
              className="form-input"
              placeholder="大家怎麼稱呼你？"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">電子信箱 / 帳號</label>
            <input
              id="email"
              type="text"
              className="form-input"
              placeholder="輸入你的信箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">密碼</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="設定密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">確認密碼</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="再次輸入密碼"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="login-button" style={{ marginTop: '10px' }}>
            完成註冊
          </button>
        </form>

        <div className="register-link">
          已經有帳號了？
          <Link to="/">返回登入</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
