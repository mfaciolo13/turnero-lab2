import axios from 'axios';

export const cliente = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
});
