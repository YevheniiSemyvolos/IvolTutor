import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Створюємо axios instance з токеном
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Додаємо токен до всіх запитів
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обробляємо помилки автентифікації
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен невалідний або закінчився
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Не перезавантажуємо сайт, щоб не очищалась консоль
      // window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ініціалізація: перевіряємо, чи є токен в localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (email, password, name) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.post('/auth/signup', {
        email,
        password,
        name,
      });

      const { access_token } = response.data;
      
      // Спочатку зберігаємо токен
      localStorage.setItem('access_token', access_token);
      setToken(access_token);

      // Отримуємо дані про користувача з новим токеном
      const userResponse = await apiClient.get('/auth/me');

      const userData = userResponse.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Помилка реєстрації';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      console.log('Спроба входу з email:', email);

      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      console.log('Відповідь від сервера:', response.data);

      const { access_token } = response.data;
      
      // Спочатку зберігаємо токен
      localStorage.setItem('access_token', access_token);
      setToken(access_token);

      // Отримуємо дані про користувача з новим токеном
      const userResponse = await apiClient.get('/auth/me');

      console.log('Дані користувача:', userResponse.data);

      const userData = userResponse.data;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      console.log('Вхід успішний');
      return true;
    } catch (err) {
      console.error('Помилка входу:', err);
      const errorMessage = err.response?.data?.detail || 'Помилка входу';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    signup,
    login,
    logout,
    apiClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
