import axios from "axios";
import Cookies from "js-cookie";

console.log(import.meta.env.VITE_API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.data?.detail === "Invalid or Expired Token"
    ) {
      // Remove cookies
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      Cookies.remove("user");

      // Redirect to login
      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
