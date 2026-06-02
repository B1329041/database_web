import axiosClient from './axiosClient';

const gamesApi = {
  /**
   * 取得球局列表
   * @param {Object} params - Query參數 { region, sport_type, level }
   * @returns {Promise}
   */
  getGames: (params) => {
    return axiosClient.get('/games', { params });
  },

  /**
   * 主揪發起球局（開房）
   * @param {Object} data - { sport_id, venue_id, most_players, target_level, booking_date, time_slot, duration, is_free, total_price, gender_limit, description }
   * @returns {Promise}
   */
  createGame: (data) => {
    return axiosClient.post('/games', data);
  },

  /**
   * 報名參加/排候補
   * @param {number|string} gameId 
   * @returns {Promise}
   */
  joinGame: (gameId) => {
    return axiosClient.post(`/games/${gameId}/join`);
  },

  /**
   * 取消報名/退出球局
   * @param {number|string} gameId 
   * @returns {Promise}
   */
  cancelGame: (gameId) => {
    return axiosClient.delete(`/games/${gameId}/cancel`);
  },

  /**
   * 主揪回報場地狀態
   * @param {number|string} gameId 
   * @param {Object} data - { status, note }
   * @returns {Promise}
   */
  updateVenueStatus: (gameId, data) => {
    return axiosClient.patch(`/games/${gameId}/venue-status`, data);
  },

  /**
   * 取得球局佈告欄歷史紀錄
   * @param {number|string} gameId 
   * @returns {Promise}
   */
  getAnnouncements: (gameId) => {
    return axiosClient.get(`/games/${gameId}/announcements`);
  },

  /**
   * 主揪發佈新公告
   * @param {number|string} gameId 
   * @param {Object} data - { text }
   * @returns {Promise}
   */
  createAnnouncement: (gameId, data) => {
    return axiosClient.post(`/games/${gameId}/announcements`, data);
  }
};

export default gamesApi;
