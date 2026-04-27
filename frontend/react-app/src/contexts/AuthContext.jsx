import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

async function fetchProfile() {
  try {
    const res = await api.get('/user/profile/');
    return res.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken]     = useState(null);
  const [jwtData, setJwtData] = useState(null);  // decoded JWT (role, user_id, etc.)
  const [profile, setProfile] = useState(null);  // full profile from API (full_name, email, phone)
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore token + load profile
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      setJwtData(decodeJwt(storedToken));
      fetchProfile().then(setProfile).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginUser = useCallback(async (newToken) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    setJwtData(decodeJwt(newToken));
    // Fetch full profile so full_name/email are available immediately
    const p = await fetchProfile();
    setProfile(p);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setJwtData(null);
    setProfile(null);
  }, []);

  // Merge JWT fields + profile fields into a single `user` object
  const user = useMemo(() => {
    if (!jwtData) return null;
    return {
      ...jwtData,          // user_id, role, hotel_id, exp
      ...(profile || {}),  // full_name, email, phone, created_at
    };
  }, [jwtData, profile]);

  const value = useMemo(
    () => ({
      token,
      user,
      role: user?.role ?? null,
      isAuthenticated: !!token,
      isLoading,
      loginUser,
      logoutUser,
      // Expose refresh so components can re-fetch profile after update
      refreshProfile: () => fetchProfile().then(setProfile),
    }),
    [token, user, isLoading, loginUser, logoutUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
