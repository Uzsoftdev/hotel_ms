import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on init
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const loginUser = (newToken) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  const logoutUser = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: !!token,
      isLoading,
      loginUser,
      logoutUser,
    }),
    [token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
