import axiosClient from './axiosClient';

const authApi = {
  /**
   * 使用者註冊與登入
   * @param {Object} data - { name, phone, birthday, gender }
   * @returns {Promise}
   */
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  }
};

export default authApi;
