import axios from 'axios';

export const productsApi = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

productsApi.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', response.config.url);
    return response;
  },
  (error) => {
    console.log('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
