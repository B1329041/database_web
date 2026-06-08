import axiosClient from './axiosClient';

const venuesApi = {
  getVenues: async (params) => {
    try {
      const response = await axiosClient.get('/venues/', { params });
      return response;
    } catch (error) {
      console.error('取得場館列表失敗:', error);
      throw error;
    }
  },
  getCourts: async () => {
    try {
      const response = await axiosClient.get('/courts/');
      return response;
    } catch (error) {
      console.error('取得球場列表失敗:', error);
      throw error;
    }
  },
  createVenue: async (data) => {
    try {
      const response = await axiosClient.post('/venues/', data);
      return response;
    } catch (error) {
      console.error('新增場館失敗:', error);
      throw error;
    }
  },
  updateVenue: async (id, data) => {
    try {
      const response = await axiosClient.patch(`/venues/${id}/`, data);
      return response;
    } catch (error) {
      console.error('更新場館失敗:', error);
      throw error;
    }
  }
};

export default venuesApi;
