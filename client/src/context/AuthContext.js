import API_BASE from '../config';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = useCallback(async () => {
    if (!user || !user.token) return;
    try {
      const res = await fetch(`${API_BASE}/api/auth/favorites`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.token) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user, fetchFavorites]);

  const login = async (name, pass) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pass })
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, pass) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pass })
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    setUser(null);
    setFavorites([]);
    localStorage.removeItem('userInfo');
  };

  const toggleFavorite = async (productId) => {
    if (!user) return { success: false, message: 'Please login to add favorites' };
    try {
      const res = await fetch(`${API_BASE}/api/auth/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        await fetchFavorites(); // Refresh favorites list
        return { success: true };
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    return { success: false };
  };

  return (
    <AuthContext.Provider value={{ user, favorites, login, register, logout, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

