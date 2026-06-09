import axiosClient from './axiosClient';

const adminApi = {
  /**
   * 使用者發送回饋
   * @param {Object} data - { type, content }
   * @returns {Promise}
   */
  submitFeedback: (data) => {
    return axiosClient.post('/feedback/', data);
  },

  /**
   * 管理員取得回饋清單 (限 Admin)
   * @param {Object} params - { is_handled }
   * @returns {Promise}
   */
  getFeedbacks: (params) => {
    return axiosClient.get('/admin/feedbacks/', { params });
  },

  /**
   * 標記回饋已完成 (結案/忽略)
   * @param {number|string} feedbackId 
   * @param {Object} data - { is_handled }
   * @returns {Promise}
   */
  handleFeedback: (feedbackId, data) => {
    return axiosClient.put(`/admin/feedbacks/${feedbackId}/handle/`, data);
  },

  /**
   * 刪除使用者回饋 (限 Admin)
   * @param {number|string} feedbackId
   * @returns {Promise}
   */
  deleteFeedback: (feedbackId) => {
    return axiosClient.delete(`/feedback/${feedbackId}/`);
  },

  /**
   * 新增場地 (限 Admin)
   * @param {Object} data - { name, city, district, facilities }
   * @returns {Promise}
   */
  createVenue: (data) => {
    return axiosClient.post('/venues/', data);
  },

  /**
   * 場地管理與刪除
   * @param {number|string} venueId 
   * @returns {Promise}
   */
  deleteVenue: (venueId) => {
    return axiosClient.delete(`/admin/venues/${venueId}/`);
  },

  /**
   * 管理員發佈系統公告
   * @param {Object} data 
   * @returns {Promise}
   */
  createSystemAnnouncement: (data) => {
    return axiosClient.post('/admin/announcements/', data);
  },

  /**
   * 取得公告 (公開)
   * @returns {Promise}
   */
  getSystemAnnouncements: () => {
    return axiosClient.get('/announcements/');
  },

  /**
   * 編輯系統公告 (限 Admin)
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise}
   */
  updateSystemAnnouncement: (id, data) => {
    return axiosClient.patch(`/announcements/${id}/`, data);
  },

  /**
   * 刪除系統公告 (限 Admin)
   * @param {number|string} id 
   * @returns {Promise}
   */
  deleteSystemAnnouncement: (id) => {
    return axiosClient.delete(`/announcements/${id}/`);
  },

  /**
   * 發送系統/特定通知 (限 Admin)
   * @param {Object} data - { target, game_id, title, message }
   * @returns {Promise}
   */
  sendBroadcast: (data) => {
    return axiosClient.post('/admin/broadcast/', data);
  },

  /**
   * 管理員數據分析 (Dashboard)
   * @returns {Promise}
   */
  getAdminAnalytics: () => {
    return axiosClient.get('/admin/analytics/');
  },

  /**
   * 調整房間狀態 (Demo 工具)
   * @param {number|string} gameId 
   * @param {Object} data 
   * @returns {Promise}
   */
  updateDemoGameStatus: (gameId, data) => {
    return axiosClient.patch(`/admin/demo/games/${gameId}/status/`, data);
  },

  /**
   * 模擬氣象適合度 (Demo 工具)
   * @param {Object} data 
   * @returns {Promise}
   */
  updateDemoWeather: (data) => {
    return axiosClient.patch(`/admin/demo/weather/`, data);
  },

  /**
   * 上傳圖片至伺服器
   * @param {File} file
   * @returns {Promise}
   */
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 更新玩家信譽積分 (限 Admin)
   * @param {number|string} userId 
   * @param {number} creditPoint 
   * @returns {Promise}
   */
  updateUserReputation: (userId, creditPoint) => {
    return axiosClient.patch(`/users/${userId}/reputation/`, { credit_point: creditPoint });
  }
};

export default adminApi;
