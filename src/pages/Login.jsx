import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [level, setLevel] = useState('休閒');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, role, level });
    // TODO: Connect to backend API
    // 模擬登入成功後跳轉到首頁
    navigate('/home');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">不揪ㄛ</h1>
          <p className="login-subtitle">尋找你的球友與牌咖，隨時開局！</p>
        </div>
        
        <div className="role-toggle">
          <button 
            className={`role-btn ${role === 'user' ? 'active' : ''}`}
            onClick={() => setRole('user')}
            type="button"
          >
            使用者
          </button>
          <button 
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
            type="button"
          >
            管理員
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">電子信箱 / 帳號</label>
            <input
              id="email"
              type="text"
              className="form-input"
              placeholder="輸入你的信箱或帳號"
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
              placeholder="輸入密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="level">自身程度 (登入後可更改)</label>
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

          <div className="forgot-password">
            <a href="#forgot">忘記密碼？</a>
          </div>
          
          <button type="submit" className="login-button">
            登入
          </button>
        </form>

        <div className="register-link">
          還沒有帳號嗎？
          <Link to="/register">立即註冊</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
