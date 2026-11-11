import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api", timeout: 10000 });
api.interceptors.response.use(r=>r, e=>{
  e.userMessage = e.response?.data?.message || (e.response ? "The server rejected the request." : "Cannot connect to backend. Check that server is running.");
  return Promise.reject(e);
});
export default api;
