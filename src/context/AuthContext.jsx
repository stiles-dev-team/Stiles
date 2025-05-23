import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem('stiles_auth_token');
    const userData = localStorage.getItem('stiles_user_data');
    
    if (storedToken && userData) {
      try {
        setUser(JSON.parse(userData));
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('stiles_auth_token');
        localStorage.removeItem('stiles_user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('stiles_auth_token', authToken);
    localStorage.setItem('stiles_user_data', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('stiles_auth_token');
    localStorage.removeItem('stiles_user_data');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 