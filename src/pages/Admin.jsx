import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPinned, Bell, Plus, Trash2, Pencil, ArrowLeft, TrendingUp, BarChart3, MessageSquarePlus, MessageSquareText, Wrench, RefreshCcw, UserCircle, CloudRain, CheckCircle, XCircle, Search, Filter, Users, ShieldBan, Eye, ChevronRight } from 'lucide-react';
import adminApi from '../api/admin';
import venuesApi from '../api/venues';
import gamesApi from '../api/games';
import usersApi from '../api/users';
import SafeImage from '../components/SafeImage';
import '../App.css';

const getSportBadgeStyle = (sportName) => {
  switch (sportName) {
    case '羽球':
      return { backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' };
    case '籃球':
      return { backgroundColor: '#ffedd5', color: '#c2410c', borderColor: '#fed7aa' };
    case '網球':
      return { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' };
    case '桌球':
      return { backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' };
    case '排球':
      return { backgroundColor: '#faf5ff', color: '#6b21a8', borderColor: '#f3e8ff' };
    default:
      return { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' };
  }
};

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  // 場地、揪團、公告狀態改為連線載入
  const [venues, setVenues] = useState([]);
  const [parties, setParties] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // 真實 API 資料
  const [feedbacks, setFeedbacks] = useState([]);
  const [analytics, setAnalytics] = useState({ 
    active_users: 0, 
    active_games: 0, 
    system_messages: 0,
    daily_activity: [],
    popular_sports: []
  });

  // 使用者與篩選狀態 (已提升宣告位置，防止 Temporal Dead Zone 錯誤)
  const [newVenue, setNewVenue] = useState({ name: '', city: '桃園市', district: '', street_line: '', sport_id: '', court_count: 1, facilities: [] });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', photo: [] });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editFiles, setEditFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState('pending'); // 'pending' or 'handled'
  const [replyingFeedbackId, setReplyingFeedbackId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingGameTimeId, setEditingGameTimeId] = useState(null);
  const [editGameDate, setEditGameDate] = useState('');
  const [editGameTimeSlot, setEditGameTimeSlot] = useState('');
  const [demoSearchQuery, setDemoSearchQuery] = useState('');
  const [demoSportFilter, setDemoSportFilter] = useState('全部');
  const [filterCity, setFilterCity] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [weatherIndex, setWeatherIndex] = useState(80);

  // 會員管理 (User Management) 專用狀態
  const [umSearchQuery, setUmSearchQuery] = useState('');
  const [umUsers, setUmUsers] = useState([]);
  const [umSelectedUser, setUmSelectedUser] = useState(null);
  const [umSelectedUserDetail, setUmSelectedUserDetail] = useState(null);
  const [umLoadingDetail, setUmLoadingDetail] = useState(false);
  const [umEditScore, setUmEditScore] = useState('');
  const [umIsLoadingUsers, setUmIsLoadingUsers] = useState(false);
  const [allVenuesForFiltering, setAllVenuesForFiltering] = useState([]);
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [filterSport, setFilterSport] = useState('');
  const [sportsList, setSportsList] = useState([]);

  // 載入真實運動種類供篩選選單使用
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const sportsData = await gamesApi.getSports();
        setSportsList(sportsData || []);
      } catch (error) {
        console.error('Fetch sports error:', error);
      }
    };
    fetchSports();
  }, []);

  // 動態衍生篩選選單選項
  const cityOptions = [...new Set(allVenuesForFiltering.map(v => v.city).filter(Boolean))];
  const districtOptions = filterCity
    ? [...new Set(
        allVenuesForFiltering
          .filter(v => v.city === filterCity)
          .map(v => v.district)
          .filter(Boolean)
      )]
    : [];

  const hasActiveFilter = !!(filterCity || filterDistrict || filterSport);

  // 載入真實場地資料，當篩選條件（縣市/區域/球類）改變時重新向後端抓取
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const params = {};
        if (filterCity) params.city = filterCity;
        if (filterDistrict) params.district = filterDistrict;
        if (filterSport) params.sport_id = filterSport;
        
        const venuesData = await venuesApi.getVenues(params);
        const rawVenues = Array.isArray(venuesData) ? venuesData : (venuesData.results || []);
        let mappedVenues = rawVenues.map(v => ({
          id: v.id,
          name: v.name,
          city: v.address_detail?.city || '',
          district: v.address_detail?.district || '',
          address: v.address_detail?.street_line || '',
          facilities: v.facilities || [],
          opening_hours: v.opening_hours || null,
          court_count: v.court_count || 0,
          sports: v.sports || []
        }));

        // 如果目前沒有篩選條件，代表這是完整的場地列表，儲存下來用於動態生成篩選選單
        if (!filterCity && !filterDistrict) {
          setAllVenuesForFiltering(mappedVenues);
        }

        // 前端安全防呆篩選：如果後端 API 尚未實現過濾，前端進行二次過濾
        if (filterCity) {
          mappedVenues = mappedVenues.filter(v => v.city === filterCity);
        }
        if (filterDistrict) {
          mappedVenues = mappedVenues.filter(v => v.district.includes(filterDistrict));
        }
        if (filterSport) {
          const selectedSportObj = sportsList.find(s => String(s.id) === String(filterSport));
          if (selectedSportObj) {
            const sportName = selectedSportObj.name;
            mappedVenues = mappedVenues.filter(v => 
              v.opening_hours?.opening?.some(o => o.category?.includes(sportName))
            );
          }
        }

        // 新需求：若使用者未提供任何篩選條件，則不顯示列表資料，避免頁面一打開太凌亂
        if (!filterCity && !filterDistrict && !filterSport) {
          setVenues([]);
        } else {
          setVenues(mappedVenues);
        }
      } catch (error) {
        console.error('Fetch venues error:', error);
      }
    };
    fetchVenues();
  }, [filterCity, filterDistrict, filterSport, sportsList]);

  // 載入後台資料 (採獨立 try-catch，防止單一 API 壞掉導致整頁空白)
  useEffect(() => {
    const fetchAdminData = async () => {

      // 2. 獨立載入數據分析
      try {
        const analyticsData = await adminApi.getAdminAnalytics();
        const mappedAnalytics = {
          active_users: analyticsData.active_users_today || 0,
          active_games: analyticsData.ongoing_games_count || 0,
          system_messages: 0,
          daily_activity: [],
          popular_sports: []
        };

        if (analyticsData.activity_trend) {
          const reversedTrend = [...analyticsData.activity_trend].reverse();
          const maxCount = Math.max(...reversedTrend.map(x => x.count), 1);
          mappedAnalytics.daily_activity = reversedTrend.map(x => (x.count / maxCount) * 100);
        } else {
          mappedAnalytics.daily_activity = [0, 0, 0, 0, 0, 0, 0];
        }

        if (analyticsData.sports_ratio) {
          const totalGames = Object.values(analyticsData.sports_ratio).reduce((sum, val) => sum + val, 0);
          mappedAnalytics.popular_sports = Object.entries(analyticsData.sports_ratio)
            .map(([name, count]) => {
              const pctVal = totalGames > 0 ? (count / totalGames) * 100 : 0;
              return [name, `${Math.round(pctVal)}%`, pctVal];
            })
            .sort((a, b) => b[2] - a[2])
            .map(([name, pct]) => [name, pct]);
        } else {
          mappedAnalytics.popular_sports = [['無資料', '0%']];
        }
        setAnalytics(mappedAnalytics);
      } catch (error) {
        console.error('Fetch analytics error:', error);
      }

      // 3. 獨立載入使用者回饋
      try {
        const feedbacksData = await adminApi.getFeedbacks();
        setFeedbacks(feedbacksData || []);
      } catch (error) {
        console.error('Fetch feedbacks error:', error);
      }

      // 4. 獨立載入真實公告
      try {
        const announcementsData = await adminApi.getSystemAnnouncements();
        const rawAnnouncements = Array.isArray(announcementsData) ? announcementsData : (announcementsData.results || []);
        const mappedAnnouncements = rawAnnouncements.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          photo: a.photo || [],
          date: a.created_at ? new Date(a.created_at).toLocaleDateString() : ''
        }));
        setAnnouncements(mappedAnnouncements);
      } catch (error) {
        console.error('Fetch announcements error:', error);
      }

      // 5. 獨立載入真實球局 (Demo 工具用)
      try {
        let sportsListForMapping = sportsList;
        if (sportsListForMapping.length === 0) {
          try {
            const sportsData = await gamesApi.getSports();
            sportsListForMapping = sportsData || [];
            setSportsList(sportsListForMapping);
          } catch (err) {
            console.error('Fetch sports in games load error:', err);
          }
        }

        const gamesData = await gamesApi.getGames();
        const rawGames = Array.isArray(gamesData) ? gamesData : (gamesData.results || []);
        console.log('Demo Tool - rawGames:', rawGames);
        const mappedParties = rawGames.map(g => {
          const sObj = sportsListForMapping.find(s => String(s.id) === String(g.sport_id));
          const nameVal = sObj ? sObj.name : (g.sport_name || '未分類');
          return {
            id: g.id,
            title: g.game_name || g.title || '無標題',
            status: g.match_status || '招募中',
            time: `${g.booking_date || ''} ${g.time_slot || ''}`,
            location: g.venue_name || '未指定地點',
            sportName: nameVal
          };
        });
        console.log('Demo Tool - mappedParties:', mappedParties);
        setParties(mappedParties);
      } catch (error) {
        console.error('Fetch games error:', error);
      }

      // 6. 獨立載入真實用戶 (Demo 工具用)
      try {
        const usersData = await usersApi.getAllUsers();
        const rawUsers = Array.isArray(usersData) ? usersData : (usersData.results || []);
        const mappedUsers = rawUsers.map(u => ({
          id: u.id,
          name: u.name || u.email || `User #${u.id}`,
          reputation: u.credit_point ?? 100
        }));
        setUsers(mappedUsers);
        if (mappedUsers.length > 0) {
          setSelectedUser(mappedUsers[0]);
        }
      } catch (error) {
        console.error('Fetch users error:', error);
      }
    };
    fetchAdminData();
  }, []);

  // 載入會員管理列表
  const handleFetchUmUsers = async (query = '') => {
    setUmIsLoadingUsers(true);
    try {
      let data;
      if (query.trim()) {
        data = await usersApi.searchUsers(query);
      } else {
        data = await usersApi.getAllUsers();
      }
      const rawUsers = Array.isArray(data) ? data : (data.results || []);
      setUmUsers(rawUsers);
    } catch (error) {
      console.error('Fetch user list error:', error);
    } finally {
      setUmIsLoadingUsers(false);
    }
  };

  const handleUmSearchSubmit = (e) => {
    e.preventDefault();
    handleFetchUmUsers(umSearchQuery);
  };

  // 當切換到會員管理分頁時，自動載入全部使用者
  useEffect(() => {
    if (activeTab === 'user_management') {
      handleFetchUmUsers(umSearchQuery);
    }
  }, [activeTab]);

  const handleSelectUmUser = async (user) => {
    setUmSelectedUser(user);
    setUmLoadingDetail(true);
    setUmEditScore(user.credit_point ?? 90);
    try {
      const detail = await usersApi.getUserDetail(user.id);
      setUmSelectedUserDetail(detail);
    } catch (error) {
      console.error('Fetch user detail error:', error);
      // Fallback in case API is not fully set up on backend or returns error
      setUmSelectedUserDetail({
        ...user,
        gender: user.gender || '男',
        birthday: user.birthday || '未設定',
        line_id: user.line_id || '無',
        instagram: user.instagram || '無',
        bio: user.bio || '未設定',
        hosted_matches: [],
        joined_matches: []
      });
    } finally {
      setUmLoadingDetail(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('確定要暫停此會員的帳號權限嗎？')) return;
    try {
      await usersApi.banUser(userId);
      alert('已成功暫停該帳號 (Ban)');
      // 更新狀態
      if (umSelectedUser && umSelectedUser.id === userId) {
        setUmSelectedUser(prev => ({ ...prev, is_active: false }));
        if (umSelectedUserDetail) {
          setUmSelectedUserDetail(prev => ({ ...prev, is_active: false }));
        }
      }
      setUmUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: false } : u));
    } catch (error) {
      console.error('Ban user error:', error);
      alert(error.response?.data?.detail || '暫停帳號失敗，請稍後再試。');
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm('確定要恢復此會員的帳號權限嗎？')) return;
    try {
      await usersApi.unbanUser(userId);
      alert('已成功恢復該帳號權限');
      // 更新狀態
      if (umSelectedUser && umSelectedUser.id === userId) {
        setUmSelectedUser(prev => ({ ...prev, is_active: true }));
        if (umSelectedUserDetail) {
          setUmSelectedUserDetail(prev => ({ ...prev, is_active: true }));
        }
      }
      setUmUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: true } : u));
    } catch (error) {
      console.error('Unban user error:', error);
      alert(error.response?.data?.detail || '恢復帳號權限失敗，請稍後再試。');
    }
  };

  const handleUpdateUmReputation = async (userId, score) => {
    const intScore = parseInt(score, 10);
    if (isNaN(intScore) || intScore < 0 || intScore > 100) {
      alert('信譽積分必須在 0 到 100 之間。');
      return;
    }
    try {
      await adminApi.updateUserReputation(userId, intScore);
      alert(`已將該會員的信譽積分調整為：${intScore}`);
      // 更新狀態
      if (umSelectedUser && umSelectedUser.id === userId) {
        setUmSelectedUser(prev => ({ ...prev, credit_point: intScore }));
        if (umSelectedUserDetail) {
          setUmSelectedUserDetail(prev => ({ ...prev, credit_point: intScore }));
        }
      }
      setUmUsers(prev => prev.map(u => u.id === userId ? { ...u, credit_point: intScore } : u));
      // 同步更新 Demo 工具箱的 users 狀態，以防資料不同步
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, reputation: intScore } : u));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, reputation: intScore }));
      }
    } catch (error) {
      console.error('Update reputation error:', error);
      alert(error.response?.data?.detail || '調整信譽積分失敗，請稍後再試。');
    }
  };

  // Demo 工具相關邏輯 (串接真實 API)
  const handleUpdateReputation = async (score) => {
    if (!selectedUser) return;
    try {
      await adminApi.updateUserReputation(selectedUser.id, score);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, reputation: score } : u));
      setSelectedUser({ ...selectedUser, reputation: score });
      
      // 同步更新會員管理狀態中的分數
      setUmUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, credit_point: score } : u));
      if (umSelectedUser && umSelectedUser.id === selectedUser.id) {
        setUmSelectedUser(prev => ({ ...prev, credit_point: score }));
        if (umSelectedUserDetail) {
          setUmSelectedUserDetail(prev => ({ ...prev, credit_point: score }));
        }
      }
      alert(`玩家 ${selectedUser.name} 的信譽積分已調整為：${score}`);
    } catch (error) {
      console.error('Update reputation error:', error);
      alert('調整信譽積分失敗，請確認伺服器狀態。');
    }
  };

  const handleUpdatePartyStatus = async (id, newStatus, newTime) => {
    const statusMap = {
      '即將開始': 'recruiting',
      '已開始': 'playing',
      '已結束': 'closed',
      '招募中': 'recruiting'
    };
    const backendStatus = statusMap[newStatus] || newStatus;
    try {
      await adminApi.updateDemoGameStatus(id, { status: backendStatus });
      setParties(parties.map(p => p.id === id ? { ...p, status: newStatus, time: newTime || p.time } : p));
      alert(`房間狀態已變更為：${newStatus}`);
    } catch (error) {
      console.error('Update party status error:', error);
      alert('狀態更新失敗，請確認伺服器狀態。');
    }
  };

  const getReputationStatus = (score) => {
    if (score <= 40) return { label: '永久停權 (Ban Forever)', color: '#ef4444' };
    if (score <= 50) return { label: '觀察中 (重回 65, +0.5d 懲罰)', color: '#f59e0b' };
    if (score <= 60) return { label: '警告 (禁開房間)', color: '#fcd34d' };
    return { label: '狀態良好', color: '#10b981' };
  };

  const handleStartEdit = (venue) => {
    setEditingVenueId(venue.id);
    const firstSportName = venue.sports?.[0];
    const sportObj = sportsList.find(s => s.name === firstSportName);
    setNewVenue({
      name: venue.name,
      city: venue.city,
      district: venue.district,
      street_line: venue.address,
      sport_id: sportObj ? String(sportObj.id) : '',
      court_count: venue.court_count || 1,
      facilities: venue.facilities || []
    });
    document.getElementById('add-venue-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingVenueId(null);
    setNewVenue({ name: '', city: '桃園市', district: '', street_line: '', sport_id: '', court_count: 1, facilities: [] });
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    if (!newVenue.name) return;

    // 後端 Venue 規格包含 address 外鍵，但此處亦傳送縣市/區域/地址與球場數量資訊
    const payload = {
      name: newVenue.name,
      city: newVenue.city,
      district: newVenue.district,
      street_line: newVenue.street_line,
      sport_id: newVenue.sport_id ? parseInt(newVenue.sport_id, 10) : null,
      court_count: newVenue.court_count || 1,
      opening_hours: { weekdays: "08:00-22:00", weekends: "08:00-22:00" },
      types: "indoor",
      latitude: 25.0116,
      longitude: 121.4617,
      facilities: newVenue.facilities
    };

    try {
      if (editingVenueId) {
        // 編輯模式
        const response = await venuesApi.updateVenue(editingVenueId, payload);
        const updatedV = {
          id: editingVenueId,
          name: response.name || newVenue.name,
          city: response.address_detail?.city || newVenue.city,
          district: response.address_detail?.district || newVenue.district,
          address: response.address_detail?.street_line || newVenue.street_line,
          facilities: response.facilities && response.facilities.length > 0 ? response.facilities : newVenue.facilities,
          court_count: response.court_count || newVenue.court_count,
          sports: response.sports || (newVenue.sport_id ? [sportsList.find(s => String(s.id) === String(newVenue.sport_id))?.name] : [])
        };
        setVenues(venues.map(v => v.id === editingVenueId ? updatedV : v));
        setAllVenuesForFiltering(allVenuesForFiltering.map(v => v.id === editingVenueId ? updatedV : v));
        setEditingVenueId(null);
        setNewVenue({ name: '', city: '桃園市', district: '', street_line: '', sport_id: '', court_count: 1, facilities: [] });
        alert('場地已更新完成！');
      } else {
        // 新增模式
        const response = await venuesApi.createVenue(payload);
        const newV = {
          id: response.id || Date.now(),
          name: response.name || newVenue.name,
          city: response.address_detail?.city || newVenue.city,
          district: response.address_detail?.district || newVenue.district,
          address: response.address_detail?.street_line || newVenue.street_line,
          facilities: response.facilities && response.facilities.length > 0 ? response.facilities : newVenue.facilities,
          court_count: response.court_count || newVenue.court_count,
          sports: response.sports || (newVenue.sport_id ? [sportsList.find(s => String(s.id) === String(newVenue.sport_id))?.name] : [])
        };
        setVenues([...venues, newV]);
        setAllVenuesForFiltering([...allVenuesForFiltering, newV]);
        setNewVenue({ name: '', city: '桃園市', district: '', street_line: '', sport_id: '', court_count: 1, facilities: [] });
        alert('場地已新增至後端！');
      }
    } catch (error) {
      console.error('Save venue error:', error);
      alert('儲存場地資料失敗，請確認後端 API 設定！');
    }
  };

  const handleDeleteVenue = async (id) => {
    const venueToDelete = venues.find(v => v.id === id);
    if (!venueToDelete) return;

    if (window.confirm(`確定要刪除場地「${venueToDelete.name}」嗎？`)) {
      if (window.confirm('請再次確認，刪除後將無法復原！確定要刪除嗎？')) {
        try {
          await adminApi.deleteVenue(id);
          setVenues(venues.filter(v => v.id !== id));
          alert('場地已成功刪除。');
        } catch (error) {
          console.error('Delete venue error:', error);
          const errorDetail = error.response?.data?.detail || '刪除場地失敗，請確認該場地是否被使用中。';
          alert(errorDetail);
        }
      }
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title) return;
    setIsSubmitting(true);
    try {
      // 1. 先把選取的本機檔案上傳到後端
      const uploadedUrls = [];
      for (const item of selectedFiles) {
        const res = await adminApi.uploadImage(item.file);
        if (res && res.url) {
          uploadedUrls.push(res.url);
        }
      }

      // 2. 發佈公告 JSON，帶入剛才上傳完成的網址陣列
      const payload = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        photo: uploadedUrls
      };
      const response = await adminApi.createSystemAnnouncement(payload);
      
      const announcement = {
        id: response.id || Date.now(),
        title: response.title || newAnnouncement.title,
        content: response.content || newAnnouncement.content,
        photo: response.photo || uploadedUrls,
        date: response.created_at ? new Date(response.created_at).toLocaleDateString() : new Date().toLocaleDateString()
      };
      setAnnouncements([announcement, ...announcements]);
      setNewAnnouncement({ title: '', content: '', photo: [] });
      setSelectedFiles([]);
      alert('公告已發佈！');
    } catch (error) {
      console.error('Create announcement error:', error);
      alert('發佈失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('確定要刪除此公告嗎？')) {
      try {
        await adminApi.deleteSystemAnnouncement(id);
        setAnnouncements(announcements.filter(a => a.id !== id));
        alert('公告已成功刪除！');
      } catch (error) {
        console.error('Delete announcement error:', error);
        alert('刪除公告失敗，請稍後再試。');
      }
    }
  };

  const handleCompleteFeedback = async (id) => {
    if (!replyText.trim()) {
      alert('請輸入給使用者的回覆內容！');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.handleFeedback(id, { is_handled: true, admin_reply: replyText });
      setFeedbacks(feedbacks.map(fb => fb.id === id ? { ...fb, is_handled: true, admin_reply: replyText } : fb));
      setReplyingFeedbackId(null);
      setReplyText('');
      alert('回饋標記完成並已通知使用者！');
    } catch (error) {
      console.error('Handle feedback error:', error);
      alert('處理失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm('確定要刪除此回饋建議嗎？')) {
      setIsSubmitting(true);
      try {
        await adminApi.deleteFeedback(id);
        setFeedbacks(feedbacks.filter(fb => fb.id !== id));
        alert('回饋已刪除。');
      } catch (error) {
        console.error('Delete feedback error:', error);
        alert('刪除失敗，請稍後再試。');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateGameTime = async (id) => {
    if (!editGameDate || !editGameTimeSlot.trim()) {
      alert('請填寫日期與時段！');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminApi.updateDemoGameStatus(id, { 
        booking_date: editGameDate, 
        time_slot: editGameTimeSlot 
      });
      setParties(parties.map(p => p.id === id ? { ...p, time: `${editGameDate} ${editGameTimeSlot}` } : p));
      setEditingGameTimeId(null);
      alert('球局時間已成功修改！');
    } catch (error) {
      console.error('Update game time error:', error);
      alert('修改時間失敗，請確認伺服器狀態。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetTimeBefore30Min = async (id) => {
    setIsSubmitting(true);
    try {
      const targetTime = new Date(Date.now() + 30 * 60 * 1000);
      const year = targetTime.getFullYear();
      const month = String(targetTime.getMonth() + 1).padStart(2, '0');
      const day = String(targetTime.getDate()).padStart(2, '0');
      const bookingDate = `${year}-${month}-${day}`;

      const startHours = String(targetTime.getHours()).padStart(2, '0');
      const startMinutes = String(targetTime.getMinutes()).padStart(2, '0');

      const endTargetTime = new Date(targetTime.getTime() + 2 * 60 * 60 * 1000);
      const endHours = String(endTargetTime.getHours()).padStart(2, '0');
      const endMinutes = String(endTargetTime.getMinutes()).padStart(2, '0');

      const timeSlot = `${startHours}:${startMinutes}-${endHours}:${endMinutes}`;

      await adminApi.updateDemoGameStatus(id, { 
        booking_date: bookingDate, 
        time_slot: timeSlot 
      });
      setParties(parties.map(p => p.id === id ? { ...p, time: `${bookingDate} ${timeSlot}` } : p));
      alert(`已成功設定球局時間為開局前 30 分鐘 (${bookingDate} ${timeSlot})！`);
    } catch (error) {
      console.error('Set time before 30min error:', error);
      alert('設定開局前 30 分鐘失敗，請確認伺服器狀態。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!editingAnnouncement.title) return;
    setIsSubmitting(true);
    try {
      const finalUrls = [];
      
      // 保留原有圖片網址，並上傳新選取的本機檔案
      for (const item of editFiles) {
        if (item.type === 'existing') {
          finalUrls.push(item.url);
        } else if (item.type === 'new') {
          const res = await adminApi.uploadImage(item.file);
          if (res && res.url) {
            finalUrls.push(res.url);
          }
        }
      }

      const payload = {
        title: editingAnnouncement.title,
        content: editingAnnouncement.content,
        photo: finalUrls
      };
      await adminApi.updateSystemAnnouncement(editingAnnouncement.id, payload);
      
      setAnnouncements(announcements.map(a => 
        a.id === editingAnnouncement.id 
          ? { 
              ...a, 
              title: editingAnnouncement.title, 
              content: editingAnnouncement.content, 
              photo: finalUrls 
            } 
          : a
      ));
      setEditingAnnouncement(null);
      setEditFiles([]);
      alert('公告修改成功！');
    } catch (error) {
      console.error('Update announcement error:', error);
      alert('修改失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 從現有場館中萃取所有設施，若為空則提供預設值
  const uniqueFacilities = [...new Set(
    allVenuesForFiltering.flatMap(v => v.facilities || []).filter(Boolean)
  )];
  const defaultFacilities = uniqueFacilities.length > 0 
    ? uniqueFacilities 
    : ["免費車位", "熱水淋浴間", "自動販賣機", "冷氣機", "廁所"];

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
          <button 
            className={`admin-nav-btn ${activeTab === 'feedbacks' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedbacks')}
          >
            <MessageSquareText size={20} /> 使用者回饋
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'user_management' ? 'active' : ''}`}
            onClick={() => setActiveTab('user_management')}
          >
            <Users size={20} /> 會員管理
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'demo_games' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo_games')}
          >
            <Wrench size={20} /> 房間狀態調整
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'demo_reputation' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo_reputation')}
          >
            <TrendingUp size={20} /> 信譽積分調整
          </button>
        </nav>

        <button 
          onClick={() => navigate('/home')}
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
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>{analytics.active_users}</div>
                <div style={{ color: '#10b981', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>即時更新中</div>
              </div>
              <div className="stat-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={16} color="#10b981" /> 進行中揪團
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>{analytics.active_games}</div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>即時更新中</div>
              </div>
              <div className="stat-card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#f59e0b" /> 系統訊息
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b' }}>{analytics.system_messages}</div>
                <div style={{ color: '#f59e0b', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>即時更新中</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ marginBottom: '20px' }}>近期活動熱度</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
                  {(analytics.daily_activity && analytics.daily_activity.length > 0 ? analytics.daily_activity : [0,0,0,0,0,0,0]).map((h, i) => (
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
                  {(analytics.popular_sports && analytics.popular_sports.length > 0 ? analytics.popular_sports : [['無資料', '0%']]).map(([name, pct], i) => (
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

            {/* 縣市/區域 篩選查詢 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', backgroundColor: 'white', padding: '16px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>篩選縣市：</span>
                <select 
                  className="form-input" 
                  style={{ width: '150px', margin: 0 }}
                  value={filterCity} 
                  onChange={(e) => {
                    setFilterCity(e.target.value);
                    setFilterDistrict(''); // 切換縣市時重置區域
                  }}
                >
                  <option value="">全部縣市</option>
                  {cityOptions.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>篩選區域：</span>
                <select 
                  className="form-input" 
                  style={{ width: '180px', margin: 0 }}
                  value={filterDistrict} 
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  disabled={!filterCity}
                >
                  <option value="">{filterCity ? "全部區域" : "請先選擇縣市"}</option>
                  {districtOptions.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#64748b' }}>篩選運動：</span>
                <select 
                  className="form-input" 
                  style={{ width: '150px', margin: 0 }}
                  value={filterSport} 
                  onChange={(e) => setFilterSport(e.target.value)}
                >
                  <option value="">全部運動</option>
                  {sportsList.map(sport => (
                    <option key={sport.id} value={sport.id}>{sport.name}</option>
                  ))}
                </select>
              </div>

              <button 
                className="btn-outline" 
                style={{ marginLeft: 'auto', padding: '8px 16px' }}
                onClick={() => {
                  setFilterCity('');
                  setFilterDistrict('');
                  setFilterSport('');
                }}
              >
                重置篩選
              </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '16px' }}>場地名稱</th>
                    <th style={{ padding: '16px' }}>詳細地址</th>
                    <th style={{ padding: '16px' }}>數量</th>
                    <th style={{ padding: '16px' }}>設施</th>
                    <th style={{ padding: '16px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map(v => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px', fontWeight: '700' }}>{v.name}</td>
                      <td style={{ padding: '16px' }}>{v.address}</td>
                      <td style={{ padding: '16px', fontWeight: '600' }}>
                        {v.court_count ? `${v.court_count} 個球場` : '0 個球場'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {v.facilities.map((f, i) => (
                            <span key={i} style={{ fontSize: '11px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{f}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button onClick={() => handleStartEdit(v)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px' }} title="編輯場地">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDeleteVenue(v.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }} title="刪除場地">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {venues.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                        {hasActiveFilter ? "目前無符合條件的場地。" : "請選擇縣市、區域或球類篩選條件以查詢場地。"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div id="add-venue-form" style={{ marginTop: '40px', backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '24px' }}>{editingVenueId ? "編輯場地資料" : "新增場地資料"}</h3>
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
                  <label className="form-label">詳細地址</label>
                  <input required type="text" className="form-input" placeholder="例如：雙十路二段100號" value={newVenue.street_line} onChange={e => setNewVenue({...newVenue, street_line: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">主要運動球類</label>
                  <select required className="form-input" value={newVenue.sport_id} onChange={e => setNewVenue({...newVenue, sport_id: e.target.value})}>
                    <option value="">請選擇球類</option>
                    {sportsList.map(sport => (
                      <option key={sport.id} value={sport.id}>{sport.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">場地/球場數量</label>
                  <input required type="number" min="1" className="form-input" placeholder="例如：3" value={newVenue.court_count} onChange={e => setNewVenue({...newVenue, court_count: parseInt(e.target.value, 10) || 1})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>設施 (複選)</label>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    {defaultFacilities.map((fac) => (
                      <label key={fac} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500', color: '#334155', userSelect: 'none' }}>
                        <input 
                          type="checkbox" 
                          checked={newVenue.facilities.includes(fac)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewVenue({ ...newVenue, facilities: [...newVenue.facilities, fac] });
                            } else {
                              setNewVenue({ ...newVenue, facilities: newVenue.facilities.filter(f => f !== fac) });
                            }
                          }}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' }}
                        />
                        {fac}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button type="submit" className="login-button" style={{ width: '200px' }}>
                    {editingVenueId ? "儲存修改場地" : "確認新增場地"}
                  </button>
                  {editingVenueId && (
                    <button type="button" className="btn-outline" onClick={handleCancelEdit} style={{ margin: 0 }}>
                      取消編輯
                    </button>
                  )}
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
                  <div className="form-group">
                    <label className="form-label">公告圖片 (最多 3 張，可從裝置上傳)</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                      {/* 本機已選取圖片預覽 */}
                      {selectedFiles.map((fileItem) => (
                        <div key={fileItem.id} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                          <img src={fileItem.previewUrl} alt="upload-preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFiles(selectedFiles.filter(item => item.id !== fileItem.id));
                            }}
                            style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      
                      {/* 上傳按鈕 */}
                      {selectedFiles.length < 3 && (
                        <label style={{ width: '80px', height: '80px', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#64748b' }}>
                          <Plus size={20} />
                          <span style={{ fontSize: '11px', marginTop: '4px' }}>選擇檔案</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (selectedFiles.length >= 3) {
                                alert('最多只能選擇 3 張圖片。');
                                return;
                              }
                              const previewUrl = URL.createObjectURL(file);
                              setSelectedFiles(prev => [...prev, { id: Date.now().toString(), file, previewUrl }]);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      )}
                    </div>
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
                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5', paddingRight: '60px' }}>{a.content}</p>
                    
                    {a.photo && a.photo.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                        {a.photo.map((p, idx) => (
                          <SafeImage key={idx} src={p} alt={`Photo ${idx+1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        ))}
                      </div>
                    )}

                    <div style={{ position: 'absolute', right: '20px', top: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button 
                        onClick={() => {
                          setEditingAnnouncement(a);
                          setEditFiles((a.photo || []).map((url, idx) => ({
                            id: `existing-${idx}`,
                            type: 'existing',
                            url: url
                          })));
                        }}
                        style={{ color: '#0284c7', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                        title="編輯公告"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                        title="刪除公告"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 使用者回饋 Tab */}
        {activeTab === 'feedbacks' && (
          <div>
            <h2 style={{ marginBottom: '24px' }}>使用者建議與回饋</h2>
            
            {/* 待處理 vs 已處理 分頁選擇 */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button 
                onClick={() => setFeedbackFilter('pending')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  border: '1px solid #cbd5e1', 
                  backgroundColor: feedbackFilter === 'pending' ? '#7995a5' : 'white', 
                  color: feedbackFilter === 'pending' ? 'white' : '#475569',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                待處理 ({feedbacks.filter(f => !f.is_handled).length})
              </button>
              <button 
                onClick={() => setFeedbackFilter('handled')}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  border: '1px solid #cbd5e1', 
                  backgroundColor: feedbackFilter === 'handled' ? '#7995a5' : 'white', 
                  color: feedbackFilter === 'handled' ? 'white' : '#475569',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
              >
                已完成 ({feedbacks.filter(f => f.is_handled).length})
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {feedbacks.filter(f => feedbackFilter === 'pending' ? !f.is_handled : f.is_handled).map(f => (
                <div key={f.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#7995a5' }}>
                        {(f.user_name || '').charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '15px' }}>{f.user_name || `User #${f.user}`}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>回報日期：{f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}</div>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      padding: '4px 10px', 
                      borderRadius: '6px',
                      backgroundColor: f.type === '錯誤' ? '#fee2e2' : (f.type === '場地' ? '#fef3c7' : '#e0f2fe'),
                      color: f.type === '錯誤' ? '#ef4444' : (f.type === '場地' ? '#d97706' : '#0284c7')
                    }}>
                      {f.type}
                    </span>
                  </div>
                  
                  <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.6', paddingLeft: '52px' }}>
                    {f.content}
                  </p>

                  {/* 如果是已處理，顯示回覆內容 */}
                  {f.is_handled && (
                    <div style={{ marginTop: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981', paddingLeft: '20px', marginLeft: '52px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b', marginBottom: '4px' }}>管理者的回覆：</div>
                      <div style={{ fontSize: '14px', color: '#475569', whiteSpace: 'pre-wrap' }}>{f.admin_reply || '無回覆內容。'}</div>
                    </div>
                  )}

                  {/* 填寫回覆區塊 (待處理時展開) */}
                  {replyingFeedbackId === f.id && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '52px' }}>
                      <textarea 
                        placeholder="請輸入給使用者的回覆內容（送出後會自動發送通知給使用者）..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{ width: '100%', minHeight: '80px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'none', fontFamily: 'inherit' }}
                      />
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => { setReplyingFeedbackId(null); setReplyText(''); }} 
                          style={{ padding: '6px 14px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', color: '#475569' }}
                        >
                          取消
                        </button>
                        <button 
                          onClick={() => handleCompleteFeedback(f.id)} 
                          style={{ padding: '6px 14px', border: 'none', background: '#10b981', color: 'white', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          確認送出並完成
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 控制按鈕區 */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '16px', alignItems: 'center' }}>
                    {!f.is_handled && replyingFeedbackId !== f.id && (
                      <button 
                        style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }} 
                        onClick={() => { setReplyingFeedbackId(f.id); setReplyText(''); }}
                      >
                        <MessageSquareText size={18} /> 回覆
                      </button>
                    )}
                    <button 
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }} 
                      onClick={() => handleDeleteFeedback(f.id)}
                    >
                      <Trash2 size={18} /> 刪除
                    </button>
                  </div>
                </div>
              ))}
              
              {feedbacks.filter(f => feedbackFilter === 'pending' ? !f.is_handled : f.is_handled).length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
                  {feedbackFilter === 'pending' ? '目前沒有待處理的回饋。' : '目前沒有已完成的回饋。'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 會員管理 Tab */}
        {activeTab === 'user_management' && (
          <div className="admin-content">
            <h2 style={{ marginBottom: '8px', color: '#1e293b' }}>👥 會員帳號管理 (User Management)</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>提供關鍵字搜尋會員，查看每位會員的詳細個人檔案、歷史創房/參團紀錄，並具備「暫停帳號 (Ban)」或「調整信譽積分」的權限。</p>

            {/* 搜尋列 */}
            <form onSubmit={handleUmSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="搜尋 Email、手機、姓名..."
                  value={umSearchQuery}
                  onChange={(e) => setUmSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} /> 搜尋
              </button>
              {umSearchQuery && (
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setUmSearchQuery('');
                    handleFetchUmUsers('');
                  }}
                  style={{ padding: '0 16px', borderRadius: '12px' }}
                >
                  清除
                </button>
              )}
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px', alignItems: 'start' }}>
              
              {/* 左側：會員清單 */}
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Users size={20} color="#7995a5" /> 會員清單 ({umUsers.length} 人)
                  </h3>
                </div>

                {umIsLoadingUsers ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                    <div className="upload-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
                  </div>
                ) : (
                  <div className="demo-parties-list" style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                    {umUsers.map((u) => {
                      const isBanned = u.is_active === false;
                      const repStatus = getReputationStatus(u.credit_point ?? 90);
                      const isSelected = umSelectedUser && umSelectedUser.id === u.id;

                      return (
                        <div
                          key={u.id}
                          onClick={() => handleSelectUmUser(u)}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: isSelected ? '#7995a5' : '#e2e8f0',
                            backgroundColor: isSelected ? '#f8fafc' : '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          className="user-list-item"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                            <div style={{ position: 'relative' }}>
                              {u.avatar_url ? (
                                <SafeImage src={u.avatar_url} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
                                  <UserCircle size={24} />
                                </div>
                              )}
                              {isBanned && (
                                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid white' }}>
                                  <ShieldBan size={10} />
                                </div>
                              )}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {u.name || u.email?.split('@')[0] || `會員 #${u.id}`}
                                {isBanned && (
                                  <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>已停權</span>
                                )}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {u.email}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '13px', fontWeight: '800', color: repStatus.color }}>
                                {u.credit_point ?? 90} 分
                              </div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                {repStatus.label.split(' ')[0]}
                              </div>
                            </div>
                            <ChevronRight size={16} color="#cbd5e1" />
                          </div>
                        </div>
                      );
                    })}

                    {umUsers.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                        找不到符合條件的會員。
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 右側：會員詳細檔案與紀錄 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {umSelectedUser ? (
                  <div style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {umSelectedUser.avatar_url ? (
                          <SafeImage src={umSelectedUser.avatar_url} alt="avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                        ) : (
                          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', border: '2px solid #e2e8f0' }}>
                            <UserCircle size={36} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {umSelectedUser.name || '未填寫姓名'}
                            {umSelectedUser.is_active === false && (
                              <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '4px' }}>帳號暫停中</span>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>會員 ID: #{umSelectedUser.id}</div>
                        </div>
                      </div>

                      {/* 停權與解除停權按鈕 */}
                      <div>
                        {umSelectedUser.is_active === false ? (
                          <button
                            onClick={() => handleUnbanUser(umSelectedUser.id)}
                            className="btn-outline"
                            style={{ borderColor: '#10b981', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
                          >
                            <CheckCircle size={16} /> 恢復帳號權限
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(umSelectedUser.id)}
                            className="btn-outline"
                            style={{ borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
                          >
                            <ShieldBan size={16} /> 暫停帳號 (Ban)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 基本資料列表 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>電子信箱</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '700', marginTop: '2px', wordBreak: 'break-all' }}>{umSelectedUser.email}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>聯絡電話</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '700', marginTop: '2px' }}>{umSelectedUser.phone || '未填寫'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>性別</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '700', marginTop: '2px' }}>{umSelectedUserDetail?.gender || '未填寫'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>生日</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '700', marginTop: '2px' }}>{umSelectedUserDetail?.birthday || '未填寫'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Line ID</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '700', marginTop: '2px' }}>{umSelectedUserDetail?.line_id || '未填寫'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Instagram</div>
                        <div style={{ fontSize: '14px', color: '#334155', fontWeight: '700', marginTop: '2px' }}>{umSelectedUserDetail?.instagram || '未填寫'}</div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>個人簡介</div>
                        <div style={{ fontSize: '14px', color: '#475569', marginTop: '4px', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}>
                          {umSelectedUserDetail?.bio || '這個會員很懶，還沒有寫個人簡介。'}
                        </div>
                      </div>
                    </div>

                    {/* 信譽評分管理 */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={16} /> 調整信譽積分
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>目前信譽分數</div>
                          <div style={{ fontSize: '24px', fontWeight: '800', color: getReputationStatus(umSelectedUser.credit_point ?? 90).color }}>
                            {umSelectedUser.credit_point ?? 90}
                          </div>
                        </div>
                        <div style={{ borderLeft: '1px solid #cbd5e1', height: '40px', margin: '0 8px' }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={umEditScore}
                              onChange={(e) => setUmEditScore(e.target.value)}
                              style={{ width: '80px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '14px', fontWeight: '800' }}
                            />
                            <button
                              onClick={() => handleUpdateUmReputation(umSelectedUser.id, umEditScore)}
                              className="btn-primary"
                              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
                            >
                              變更分數
                            </button>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            信譽狀況：<span style={{ fontWeight: '700', color: getReputationStatus(umSelectedUser.credit_point ?? 90).color }}>{getReputationStatus(umSelectedUser.credit_point ?? 90).label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 歷史揪團與參團紀錄 */}
                    <div>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                        歷史揪團與參團紀錄
                      </h4>
                      {umLoadingDetail ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                          <div className="upload-spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          
                          {/* 創房紀錄 (Hosted) */}
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>
                              🏠 創立的房間 ({umSelectedUserDetail?.hosted_matches?.length || 0})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }} className="demo-parties-list">
                              {(umSelectedUserDetail?.hosted_matches || []).map((m) => (
                                <div
                                  key={m.id}
                                  onClick={() => navigate(`/party/${m.id}`)}
                                  style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #f1f5f9',
                                    backgroundColor: '#faf5ff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s'
                                  }}
                                  className="match-history-item"
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <span style={{
                                      fontSize: '11px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid',
                                      ...getSportBadgeStyle(m.sport_name)
                                    }}>
                                      {m.sport_name || '其他'}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {m.title || m.game_name}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>
                                    {m.booking_date} {m.time_slot}
                                  </div>
                                </div>
                              ))}
                              {(umSelectedUserDetail?.hosted_matches || []).length === 0 && (
                                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '12px', fontStyle: 'italic' }}>
                                  尚無創立房間紀錄
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 參團紀錄 (Joined) */}
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', marginBottom: '8px' }}>
                              🙋 參加的房間 ({umSelectedUserDetail?.joined_matches?.length || 0})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }} className="demo-parties-list">
                              {(umSelectedUserDetail?.joined_matches || []).map((m) => (
                                <div
                                  key={m.id}
                                  onClick={() => navigate(`/party/${m.id}`)}
                                  style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #f1f5f9',
                                    backgroundColor: '#f0fdf4',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background-color 0.2s'
                                  }}
                                  className="match-history-item"
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <span style={{
                                      fontSize: '11px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid',
                                      ...getSportBadgeStyle(m.sport_name)
                                    }}>
                                      {m.sport_name || '其他'}
                                    </span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {m.title || m.game_name}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>
                                    {m.booking_date} {m.time_slot}
                                  </div>
                                </div>
                              ))}
                              {(umSelectedUserDetail?.joined_matches || []).length === 0 && (
                                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', padding: '12px', fontStyle: 'italic' }}>
                                  尚無參團紀錄
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ backgroundColor: 'white', padding: '60px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
                    <Users size={48} style={{ margin: '0 auto 16px auto', display: 'block', color: '#cbd5e1' }} />
                    <div style={{ fontSize: '16px', fontWeight: '700' }}>請從左側會員清單選擇一位會員</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>即可查看詳細個人檔案及揪團歷史紀錄、並進行帳號管理動作。</div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 房間狀態調整 Tab */}
        {activeTab === 'demo_games' && (
          <div className="admin-content">
            <h2 style={{ marginBottom: '8px', color: '#1e293b' }}>🛠️ 房間狀態調整 (Room Status Tool)</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>此為開發調測工具，提供即時搜尋球局，並能強制作為招募中、進行中或已關閉狀態，亦支援微調時間與前推模擬。</p>

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              {/* 搜尋與篩選列 */}
              <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* 搜尋框 */}
                <div style={{ display: 'flex', position: 'relative', alignItems: 'center', flex: 1, minWidth: '200px' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                  <input 
                    type="text" 
                    placeholder="搜尋房間名稱或場地..." 
                    value={demoSearchQuery}
                    onChange={e => setDemoSearchQuery(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px 10px 36px', 
                      borderRadius: '8px', 
                      border: '1px solid #cbd5e1', 
                      fontSize: '13px', 
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>

                {/* 球類分類選擇器 */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginRight: '4px' }}>球類篩選:</span>
                  {['全部', ...sportsList.map(sport => sport.name).filter(Boolean)].map(sport => (
                    <button
                      key={sport}
                      onClick={() => setNewParty(prev => ({ ...prev, type: sport })) || setDemoSportFilter(sport)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid',
                        backgroundColor: demoSportFilter === sport ? '#7995a5' : '#f1f5f9',
                        color: demoSportFilter === sport ? 'white' : '#475569',
                        borderColor: demoSportFilter === sport ? '#7995a5' : '#e2e8f0',
                      }}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              {/* 房間列表 */}
              <div 
                className="demo-parties-list"
                style={{ 
                  maxHeight: '650px', 
                  overflowY: 'auto', 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '16px', 
                  paddingRight: '6px',
                  scrollbarWidth: 'thin'
                }}
              >
                {parties
                  .filter(p => {
                    const matchesSport = demoSportFilter === '全部' || p.sportName === demoSportFilter;
                    const matchesSearch = p.title.toLowerCase().includes(demoSearchQuery.toLowerCase()) || 
                                          p.location.toLowerCase().includes(demoSearchQuery.toLowerCase());
                    return matchesSport && matchesSearch;
                  })
                  .map(p => {
                    const badgeStyle = getSportBadgeStyle(p.sportName);
                    return (
                      <div 
                        key={p.id} 
                        style={{ 
                          padding: '20px', 
                          backgroundColor: '#ffffff', 
                          borderRadius: '12px', 
                          border: '1px solid #e2e8f0',
                          borderLeft: `4px solid ${badgeStyle.borderColor || '#cbd5e1'}`,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px', gap: '8px' }}>
                            <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', lineHeight: '1.4' }}>{p.title}</div>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              fontSize: '10px', 
                              fontWeight: '700',
                              border: '1px solid',
                              whiteSpace: 'nowrap',
                              ...badgeStyle
                            }}>
                              {p.sportName}
                            </span>
                          </div>
                          
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                              <span>📍 {p.location}</span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                              <span>狀態：</span>
                              <span style={{ 
                                fontWeight: '800', 
                                color: p.status === '已結束' ? '#ef4444' : p.status === '已開始' ? '#10b981' : '#f59e0b',
                                backgroundColor: p.status === '已結束' ? '#fef2f2' : p.status === '已開始' ? '#f0fdf4' : '#fffbeb',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '11px'
                              }}>
                                {p.status}
                              </span>
                              <span style={{ marginLeft: '4px', color: '#94a3b8' }}>({p.time})</span>
                              {editingGameTimeId !== p.id && (
                                <button 
                                  onClick={() => {
                                    setEditingGameTimeId(p.id);
                                    const parts = p.time.split(' ');
                                    setEditGameDate(parts[0] || '');
                                    setEditGameTimeSlot(parts[1] || '');
                                  }}
                                  style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '11px', padding: 0, marginLeft: '8px', textDecoration: 'underline' }}
                                >
                                  修改時間
                                </button>
                              )}
                            </div>

                            {/* 修改時間輸入區 */}
                            {editingGameTimeId === p.id && (
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <input 
                                  type="date" 
                                  value={editGameDate} 
                                  onChange={e => setEditGameDate(e.target.value)} 
                                  style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', outline: 'none' }}
                                />
                                <input 
                                  type="text" 
                                  value={editGameTimeSlot} 
                                  placeholder="例如 14:00-16:00"
                                  onChange={e => setEditGameTimeSlot(e.target.value)} 
                                  style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', width: '110px', outline: 'none' }}
                                />
                                <button 
                                  onClick={() => handleUpdateGameTime(p.id)}
                                  style={{ padding: '4px 8px', backgroundColor: '#7995a5', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  儲存
                                </button>
                                <button 
                                  onClick={() => setEditingGameTimeId(null)}
                                  style={{ padding: '4px 8px', backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                                >
                                  取消
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                          <button className="btn-outline" style={{ fontSize: '11px', padding: '4px 8px', borderColor: '#fcd34d', borderRadius: '6px', flex: 1 }} onClick={() => handleUpdatePartyStatus(p.id, '即將開始', '10 分鐘後')}>
                            招募中
                          </button>
                          <button className="btn-outline" style={{ fontSize: '11px', padding: '4px 8px', borderColor: '#fcd34d', borderRadius: '6px', flex: 1 }} onClick={() => handleUpdatePartyStatus(p.id, '已開始', '進行中')}>
                            已開始
                          </button>
                          <button className="btn-outline" style={{ fontSize: '11px', padding: '4px 8px', borderColor: '#fcd34d', borderRadius: '6px', flex: 1 }} onClick={() => handleUpdatePartyStatus(p.id, '已結束', '昨天')}>
                            已結束
                          </button>
                          <button className="btn-outline" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', flex: 1 }} onClick={() => handleUpdatePartyStatus(p.id, '招募中', '今日 20:00')}>
                            還原
                          </button>
                          <button className="btn-outline" style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', borderColor: '#cbd5e1', color: '#64748b', flex: '1 1 100%', marginTop: '4px' }} onClick={() => handleSetTimeBefore30Min(p.id)}>
                            B4 30MIN (時間前推 30 分鐘)
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {parties.filter(p => {
                  const matchesSport = demoSportFilter === '全部' || p.sportName === demoSportFilter;
                  const matchesSearch = p.title.toLowerCase().includes(demoSearchQuery.toLowerCase()) || 
                                        p.location.toLowerCase().includes(demoSearchQuery.toLowerCase());
                  return matchesSport && matchesSearch;
                }).length === 0 && (
                  <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '13px' }}>
                    沒有符合搜尋與篩選條件的房間。
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 信譽積分調整 Tab */}
        {activeTab === 'demo_reputation' && (
          <div className="admin-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '8px', color: '#1e293b' }}>📈 信譽積分模擬 (Reputation Simulator)</h2>
            <p style={{ color: '#64748b', marginBottom: '32px' }}>此為開發調測工具，可直接強制調整選定會員的信譽評分，以利測試不同信用門檻的阻擋邏輯。</p>

            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.02)' }}>
              <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <UserCircle size={24} color="#7995a5" /> 模擬玩家信譽設定
              </h3>
              
              {selectedUser ? (
                <>
                  {/* 玩家選擇 */}
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" style={{ fontSize: '14px', fontWeight: '700', color: '#475569' }}>選擇目標玩家</label>
                    <select 
                      className="form-input" 
                      value={selectedUser.id} 
                      onChange={(e) => {
                        const user = users.find(u => u.id === parseInt(e.target.value, 10));
                        setSelectedUser(user);
                      }}
                      style={{ height: '44px', borderRadius: '10px', fontSize: '14px' }}
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} (現有積分: {u.reputation})</option>
                      ))}
                    </select>
                  </div>

                  {/* 狀態預覽卡 */}
                  <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>目前選擇玩家</div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginTop: '4px' }}>{selectedUser.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>設定信譽積分</div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: getReputationStatus(selectedUser.reputation).color, marginTop: '2px' }}>
                          {selectedUser.reputation} 分
                        </div>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '14px', paddingTop: '10px', fontSize: '13px', fontWeight: '700', color: getReputationStatus(selectedUser.reputation).color }}>
                      系統判定狀態：{getReputationStatus(selectedUser.reputation).label}
                    </div>
                  </div>

                  {/* 分數快速切換按鈕 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <button className="btn-outline" style={{ padding: '12px', fontSize: '13px', borderColor: '#ef4444', color: '#ef4444', borderRadius: '10px' }} onClick={() => handleUpdateReputation(40)}>
                      40 (Ban 永久停權)
                    </button>
                    <button className="btn-outline" style={{ padding: '12px', fontSize: '13px', borderColor: '#f59e0b', color: '#f59e0b', borderRadius: '10px' }} onClick={() => handleUpdateReputation(50)}>
                      50 (懲罰觀察期)
                    </button>
                    <button className="btn-outline" style={{ padding: '12px', fontSize: '13px', borderColor: '#fcd34d', color: '#b45309', borderRadius: '10px' }} onClick={() => handleUpdateReputation(60)}>
                      60 (警告/禁創房)
                    </button>
                    <button className="btn-outline" style={{ padding: '12px', fontSize: '13px', borderColor: '#10b981', color: '#10b981', borderRadius: '10px' }} onClick={() => handleUpdateReputation(90)}>
                      90 (恢復正常積分)
                    </button>
                  </div>

                  {/* 一鍵重置數據 */}
                  <button 
                    className="btn-outline" 
                    style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderColor: '#64748b', color: '#64748b', borderRadius: '10px', fontWeight: '700' }} 
                    onClick={async () => {
                      if (!window.confirm('確定要將所有玩家的信譽積分重置回 90 分嗎？')) return;
                      try {
                        await usersApi.resetAllUserReputations();
                        setUsers(users.map(u => ({ ...u, reputation: 90 })));
                        if (selectedUser) {
                          setSelectedUser({ ...selectedUser, reputation: 90 });
                        }
                        setUmUsers(prev => prev.map(u => ({ ...u, credit_point: 90 })));
                        if (umSelectedUser) {
                          setUmSelectedUser(prev => ({ ...prev, credit_point: 90 }));
                        }
                        alert('已成功重置所有玩家的信譽積分為 90 分。');
                      } catch (error) {
                        console.error('Reset error:', error);
                        alert('重置失敗，請確認伺服器狀態。');
                      }
                    }}
                  >
                    <RefreshCcw size={16} /> 一鍵重置所有玩家信譽 (90分)
                  </button>
                </>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
                  目前無可用的玩家資料以利模擬
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 編輯系統公告 Modal */}
      {editingAnnouncement && (
        <div className="modal-overlay" onClick={() => setEditingAnnouncement(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={20} /> 編輯系統公告
              </h3>
              <button className="modal-close" onClick={() => setEditingAnnouncement(null)}>×</button>
            </div>
            <form onSubmit={handleEditAnnouncementSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">公告標題</label>
                <input 
                  required 
                  type="text" 
                  className="form-input" 
                  value={editingAnnouncement.title} 
                  onChange={e => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">內容</label>
                <textarea 
                  required 
                  className="form-input" 
                  rows="4" 
                  value={editingAnnouncement.content} 
                  onChange={e => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                  style={{ resize: 'none' }}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">公告圖片 (最多 3 張，可從裝置上傳)</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                  {/* 預覽現有圖片或本機新選取圖片 */}
                  {editFiles.map((item) => (
                    <div key={item.id} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <SafeImage 
                        src={item.type === 'existing' ? item.url : item.previewUrl} 
                        alt="upload-preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditFiles(editFiles.filter(f => f.id !== item.id));
                        }}
                        style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  
                  {/* 上傳按鈕 */}
                  {editFiles.length < 3 && (
                    <label style={{ width: '80px', height: '80px', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#64748b' }}>
                      <Plus size={20} />
                      <span style={{ fontSize: '11px', marginTop: '4px' }}>選擇檔案</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (editFiles.length >= 3) {
                            alert('最多只能選擇 3 張圖片。');
                            return;
                          }
                          const previewUrl = URL.createObjectURL(file);
                          setEditFiles(prev => [...prev, {
                            id: Date.now().toString(),
                            type: 'new',
                            file,
                            previewUrl
                          }]);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <button type="button" className="btn-outline" style={{ flex: 1, padding: '12px', borderRadius: '12px' }} onClick={() => setEditingAnnouncement(null)}>取消</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px' }}>儲存修改</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* 全域提交中遮罩 */}
      {isSubmitting && (
        <div className="modal-overlay" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
            <div className="upload-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', marginBottom: '16px' }}></div>
            <span style={{ fontSize: '16px', fontWeight: '700' }}>正在上傳圖片並發佈公告，請稍候...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
