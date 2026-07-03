import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenantProfile, setTenantProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    
    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  
  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            
            const res = await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
              {},
              { withCredentials: true }
            );
            if (res.data.success) {
              const newToken = res.data.token;
              localStorage.setItem('token', newToken);
              setToken(newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            
            handleLogoutState();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  
  const fetchCurrentUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setTenantProfile(res.data.tenantProfile);
      } else {
        handleLogoutState();
      }
    } catch (err) {
      console.error("Fetch current user failed:", err.message);
      handleLogoutState();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const handleLogoutState = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTenantProfile(null);
  };

  
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  
  const register = async (name, email, password, phone, role) => {
    const res = await api.post('/auth/register', { name, email, password, phone, role });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error("Logout request failed on backend:", err.message);
    } finally {
      handleLogoutState();
    }
  };

  
  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      setTenantProfile(res.data.tenantProfile);
    }
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      tenantProfile,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser: fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
