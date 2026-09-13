import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('ag_token'));
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('ag_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const isAdmin = user?.role === 'admin';
    const isOperator = user?.role === 'operator';
    const operatorRole = user?.operatorRole || (isOperator ? 'operator' : null);
    const isSeniorOperator = isAdmin || operatorRole === 'senior_operator';
    const isTraineeOperator = operatorRole === 'trainee_operator';

    const hasPermission = (permissionName) => {
        if (!user) return false;
        if (isAdmin) return true; // Admin has all permissions
        return !!user?.permissions?.[permissionName];
    };

    const login = (newToken, userData) => {
        localStorage.setItem('ag_token', newToken);
        setToken(newToken);

        // Extract role and permission details
        let userInfo = userData;
        if (!userInfo) {
            try {
                const payload = JSON.parse(atob(newToken.split('.')[1]));
                userInfo = {
                    id: payload.id,
                    role: payload.role || 'admin',
                    operatorRole: payload.operatorRole || payload.role || 'operator',
                    permissions: payload.permissions || {},
                    operatorId: payload.operatorId || null,
                    name: payload.name || ''
                };
            } catch {
                userInfo = { id: null, role: 'admin' };
            }
        }
        localStorage.setItem('ag_user', JSON.stringify(userInfo));
        setUser(userInfo);
    };

    const logout = () => {
        localStorage.removeItem('ag_token');
        localStorage.removeItem('ag_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            user,
            isAdmin,
            isOperator,
            operatorRole,
            isSeniorOperator,
            isTraineeOperator,
            hasPermission,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
