import axios from 'axios';

// Central place your API base URL lives. Change this one line if your
// backend ever runs on a different port/host — nothing else should
// hardcode "localhost:3000".
const client = axios.create({
  baseURL: 'http://localhost:3000',
});

// Attach the JWT automatically to every outgoing request, if one exists.
// This is the "interceptor" pattern mentioned earlier — you write the
// header-attaching logic once here, instead of on every single request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;