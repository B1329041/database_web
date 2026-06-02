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
   * 更新個人資料
   * @param {Object} data - { name, phone, bio, avatar, levels }
   * @returns {Promise}
   */
  updateUserProfile: (data) => {
    return axiosClient.put('/users/profile', data);
  }
};

export default usersApi;
