import axios from "axios";
import { useLoadingStore } from "@/stores/loading";

console.log("API URL:", import.meta.env.VITE_API_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.request.use(
  (config) => {
    const loadingStore = useLoadingStore();
    loadingStore.show();
    return config;
  },
  (error) => {
    const loadingStore = useLoadingStore();
    loadingStore.hide();
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    const loadingStore = useLoadingStore();
    loadingStore.hide();
    return response;
  },
  (error) => {
    const loadingStore = useLoadingStore();
    loadingStore.hide();
    return Promise.reject(error);
  },
);

export default api;
