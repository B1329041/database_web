import axiosClient from './axiosClient';

const usersApi = {
  /**
   * 取得個人資料與信譽積分
   * @returns {Promise}
   */
  getUserProfile: () => {
    return axiosClient.get('/users/profile');
  },

  /**
   * 更新個人資料 (建立個人檔案)
   * @param {Object} data - { name, phone, birthday, gender, bio, avatar, levels, line_id, instagram }
   * @returns {Promise}
   */
  updateUserProfile: (data) => {
    return axiosClient.put('/users/profile', data);
  },

  /**
   * 取得所有使用者列表 (限 Admin)
   * @returns {Promise}
   */
  getAllUsers: () => {
    return axiosClient.get('/users/');
  },

  /**
   * 搜尋會員 (限 Admin) - 支援關鍵字搜尋 Email、手機、姓名
   * @param {string} query 
   * @returns {Promise}
   */
  searchUsers: (query) => {
    return axiosClient.get('/users/', { params: { search: query } });
  },

  /**
   * 取得單一會員詳細資料，含歷史創房/參團紀錄 (限 Admin)
   * @param {number|string} userId 
   * @returns {Promise}
   */
  getUserDetail: (userId) => {
    return axiosClient.get(`/users/${userId}/detail/`);
  },

  /**
   * 暫停帳號 (Ban) (限 Admin)
   * @param {number|string} userId 
   * @returns {Promise}
   */
  banUser: (userId) => {
    return axiosClient.post(`/users/${userId}/ban/`);
  },

  /**
   * 解除帳號停權 (限 Admin)
   * @param {number|string} userId 
   * @returns {Promise}
   */
  unbanUser: (userId) => {
    return axiosClient.post(`/users/${userId}/unban/`);
  },

  /**
   * 重置所有玩家信譽積分 (限 Admin)
   * @returns {Promise}
   */
  resetAllUserReputations: () => {
    return axiosClient.post('/users/reset-reputation/');
  }
};

export default usersApi;
