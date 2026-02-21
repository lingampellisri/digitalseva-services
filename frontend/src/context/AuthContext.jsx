import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('ag_token'));
    const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('ag_token'));

    const login = (newToken) => {
        localStorage.setItem('ag_token', newToken);
        setToken(newToken);
        setIsAdmin(true);
    };

    const logout = () => {
        localStorage.removeItem('ag_token');
        setToken(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
