import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem('stiles_auth_token');
    const userData = localStorage.getItem('stiles_user_data');
    
    if (storedToken && userData) {
      try {
        setUser(JSON.parse(userData));
        setToken(storedToken);
        const isAdmin = localStorage.getItem('stiles_is_admin');
        setIsAdmin(isAdmin === 'true');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('stiles_auth_token');
        localStorage.removeItem('stiles_user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken, adminStatus) => {
    const adminValue = adminStatus === 1 || adminStatus === true;
    setUser(userData);
    setToken(authToken);
    setIsAdmin(adminValue);
    localStorage.setItem('stiles_auth_token', authToken);
    localStorage.setItem('stiles_user_data', JSON.stringify(userData));
    localStorage.setItem('stiles_is_admin', adminValue);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem('stiles_auth_token');
    localStorage.removeItem('stiles_user_data');
    localStorage.removeItem('stiles_is_admin');
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin
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