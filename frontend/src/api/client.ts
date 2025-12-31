import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ACCESS_TOKEN_KEY = 'grimoire_access_token';
const REFRESH_TOKEN_KEY = 'grimoire_refresh_token';

export type LoginResponse = {
  user: { id: string; email: string; role: string };
  accessToken: string;
  refreshToken: string;
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const client = axios.create({
  baseURL: API_BASE,
});

let isRefreshing = false;
let pendingQueue: { resolve: (token?: string) => void; reject: (err: unknown) => void; config: AxiosRequestConfig }[] = [];

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry && getRefreshToken()) {
      (originalRequest as any)._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;
      try {
        const data = await refresh();
        pendingQueue.forEach(({ resolve }) => resolve(data.accessToken));
        pendingQueue = [];
        return client(originalRequest);
      } catch (refreshErr) {
        pendingQueue.forEach(({ reject }) => reject(refreshErr));
        pendingQueue = [];
        await logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export async function login(email: string, password: string) {
  const res = await client.post<LoginResponse>('/api/auth/login', { email, password });
  setTokens(res.data.accessToken, res.data.refreshToken);
  return res.data;
}

export async function register(email: string, password: string) {
  const res = await client.post<LoginResponse>('/api/auth/register', { email, password });
  setTokens(res.data.accessToken, res.data.refreshToken);
  return res.data;
}

export async function refresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Missing refresh token');

  const res = await client.post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
    refreshToken,
  });
  setTokens(res.data.accessToken, res.data.refreshToken);
  return res.data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await client.post('/api/auth/logout', { refreshToken }).catch(() => {
      // ignore network/logout errors for client-side cleanup
    });
  }
  clearTokens();
}

export async function fetchMe() {
  const res = await client.get<{ user: { id: string; email: string; role: string } }>('/api/auth/me');
  return res.data.user;
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;
    if (data?.error) {
      return data.error;
    }
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}
