import axios from 'axios';

// 建立 Axios 實體
const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api', // 改成後端的完整網址 (請確認後端 Port 是否為 3000)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超時
});

// 請求攔截器 (Interceptor)
// 我們可以在這裡統一處理 Token 或是加入其他設定
axiosClient.interceptors.request.use(
  (config) => {
    // 例如：const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器 (Interceptor)
// 我們可以在這裡統一處理錯誤，例如 401 未授權、500 伺服器錯誤
axiosClient.interceptors.response.use(
  (response) => {
    // 通常 axios 會把資料包裝在 response.data 裡面
    return response.data;
  },
  (error) => {
    // 可以集中處理各種錯誤代碼
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
