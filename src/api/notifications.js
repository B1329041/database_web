import axiosClient from './axiosClient';

const notificationsApi = {
  /**
   * 取得使用者的通知清單
   * @returns {Promise}
   */
  getNotifications: () => {
    return axiosClient.get('/notifications/');
  },

  /**
   * 標記通知為已讀
   * @param {number|string} notificationId 
   * @returns {Promise}
   */
  markAsRead: (notificationId) => {
    return axiosClient.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * 刪除通知
   * @param {number|string} notificationId 
   * @returns {Promise}
   */
  deleteNotification: (notificationId) => {
    return axiosClient.delete(`/notifications/${notificationId}/`);
  }
};

export default notificationsApi;
