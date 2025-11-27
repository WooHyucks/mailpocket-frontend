import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: "https://yvmmtuerztonskkxaiuf.supabase.co/functions/v1",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("authToken");
    if (token) {
      // 토큰의 앞뒤 공백 제거
      const trimmedToken = typeof token === 'string' ? token.trim() : token;
      if (trimmedToken) {
        config.headers.Authorization = `Bearer ${trimmedToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
