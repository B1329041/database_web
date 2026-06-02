import axiosClient from './axiosClient';

const authApi = {
  /**
   * 使用者註冊
   * @param {Object} data - { name, phone, birthday, gender }
   * @returns {Promise}
   */
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },

  /**
   * 使用者登入
   * @param {Object} data - { phone }
   * @returns {Promise}
   */
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  }
};

export default authApi;
