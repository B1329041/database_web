import { useState } from 'react';
import authApi from '../api/auth';
import usersApi from '../api/users';
import gamesApi from '../api/games';
import reportsApi from '../api/reports';
import notificationsApi from '../api/notifications';
import weatherApi from '../api/weather';
import adminApi from '../api/admin';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApiTester() {
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  const addLog = (title, request, response) => {
    setLogs(prev => [{ id: Date.now(), title, request, response }, ...prev]);
  };

  const handleTest = async (title, apiCall, ...args) => {
    try {
      addLog(title, `Call with args: ${JSON.stringify(args)}`, 'Requesting...');
      const res = await apiCall(...args);
      setLogs(prev => prev.map(log => log.title === title ? { ...log, response: JSON.stringify(res, null, 2) } : log));
    } catch (error) {
      setLogs(prev => prev.map(log => log.title === title ? { ...log, response: `Error: ${error.message}\n(This is expected if backend is offline. Check Network tab for details.)` } : log));
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <ArrowLeft size={16} /> 返回首頁
      </button>
      <h1 style={{ marginBottom: '24px' }}>API Tester (V1.3)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3>Auth & Users</h3>
          <button onClick={() => handleTest('Register', authApi.register, { name: 'Test', email: 'test@example.com', password: 'password123' })}>POST /auth/register</button>
          <button onClick={() => handleTest('Login', authApi.login, { email: 'test@example.com', password: 'password123' })}>POST /auth/login</button>
          <button onClick={() => handleTest('Get Profile', usersApi.getUserProfile)}>GET /users/profile</button>
          <button onClick={() => handleTest('Setup Profile', usersApi.updateUserProfile, { phone: '0912345678', birthday: '2000-01-01', gender: '男', levels: { 籃球: 'C' } })}>PUT /users/profile</button>

          <h3>Games</h3>
          <button onClick={() => handleTest('Get Games', gamesApi.getGames, { region: '台北' })}>GET /games</button>
          <button onClick={() => handleTest('Create Game', gamesApi.createGame, { sport_id: 1, total_price: 100 })}>POST /games</button>
          <button onClick={() => handleTest('Join Game', gamesApi.joinGame, 152)}>POST /games/152/join</button>
          <button onClick={() => handleTest('Cancel Game', gamesApi.cancelGame, 152)}>DELETE /games/152/cancel</button>
          <button onClick={() => handleTest('Update Venue', gamesApi.updateVenueStatus, 152, { status: '已佔到' })}>PATCH /games/152/venue-status</button>
          <button onClick={() => handleTest('Get Announcements', gamesApi.getAnnouncements, 152)}>GET /games/152/announcements</button>
          <button onClick={() => handleTest('Create Announcement', gamesApi.createAnnouncement, 152, { text: 'Hello' })}>POST /games/152/announcements</button>

          <h3>Reports & Notifications</h3>
          <button onClick={() => handleTest('Submit Report', reportsApi.submitReport, { game_id: 152, reason: 'Test' })}>POST /reports</button>
          <button onClick={() => handleTest('Get Notifications', notificationsApi.getNotifications)}>GET /notifications</button>
          <button onClick={() => handleTest('Mark Read', notificationsApi.markAsRead, 99)}>PATCH /notifications/99/read</button>
          <button onClick={() => handleTest('Get Weather', weatherApi.getWeatherAqi)}>GET /weather/aqi</button>
          
          <h3>Admin & Feedback</h3>
          <button onClick={() => handleTest('Submit Feedback', adminApi.submitFeedback, { type: '建議', content: '123' })}>POST /feedback</button>
          <button onClick={() => handleTest('Get Feedbacks', adminApi.getFeedbacks, { is_handled: false })}>GET /admin/feedbacks</button>
          <button onClick={() => handleTest('Handle Feedback', adminApi.handleFeedback, 5, { is_handled: true })}>PUT /admin/feedbacks/5/handle</button>
          <button onClick={() => handleTest('Delete Venue', adminApi.deleteVenue, 10)}>DELETE /admin/venues/10</button>
          <button onClick={() => handleTest('Create Sys Announce', adminApi.createSystemAnnouncement, { text: 'Hi' })}>POST /admin/announcements</button>
          <button onClick={() => handleTest('Get Sys Announce', adminApi.getSystemAnnouncements)}>GET /announcements</button>
          <button onClick={() => handleTest('Get Analytics', adminApi.getAdminAnalytics)}>GET /admin/analytics</button>
          <button onClick={() => handleTest('Demo Update Game Status', adminApi.updateDemoGameStatus, 152, { status: '強制進行中' })}>PATCH /admin/demo/games/... (Demo)</button>
          <button onClick={() => handleTest('Demo Update Weather', adminApi.updateDemoWeather, { weather: '大雨' })}>PATCH /admin/demo/weather (Demo)</button>
        </div>

        <div style={{ backgroundColor: '#1e293b', color: '#10b981', padding: '16px', borderRadius: '8px', overflowY: 'auto', maxHeight: '80vh' }}>
          <h3 style={{ marginTop: 0, color: 'white' }}>Response Logs</h3>
          {logs.map(log => (
            <div key={log.id} style={{ marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 'bold' }}>{log.title}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>{log.request}</div>
              <pre style={{ marginTop: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{log.response}</pre>
            </div>
          ))}
          {logs.length === 0 && <div style={{ color: '#64748b' }}>Click a button to test...</div>}
        </div>
      </div>
    </div>
  );
}
