import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

// ─── Helpers ────────────────────────────────────────────────────────────────
function getTokenExpiry(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // Convert to ms
    } catch {
        return null;
    }
}

function isTokenExpired(token) {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    return Date.now() >= expiry;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('ag_token'));
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('ag_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const expiryTimerRef = useRef(null);
    const inactivityTimerRef = useRef(null);

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

    // ─── Logout Function ────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem('ag_token');
        localStorage.removeItem('ag_user');
        setToken(null);
        setUser(null);

        // Clear timers
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
        }
    }, []);

    // ─── Auto-Logout on Token Expiry ────────────────────────────────────────
    useEffect(() => {
        if (!token) return;

        // Check if already expired
        if (isTokenExpired(token)) {
            console.warn('🔒 Token expired — logging out');
            logout();
            return;
        }

        // Schedule auto-logout when token expires
        const expiry = getTokenExpiry(token);
        if (expiry) {
            const msUntilExpiry = expiry - Date.now();
            expiryTimerRef.current = setTimeout(() => {
                console.warn('🔒 Token expired — auto-logging out');
                logout();
            }, msUntilExpiry);
        }

        return () => {
            if (expiryTimerRef.current) {
                clearTimeout(expiryTimerRef.current);
            }
        };
    }, [token, logout]);

    // ─── Inactivity Timeout (Admin/Operator only) ───────────────────────────
    useEffect(() => {
        if (!token || !user || (!isAdmin && !isOperator)) return;

        const resetInactivityTimer = () => {
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
            inactivityTimerRef.current = setTimeout(() => {
                console.warn('🔒 Session timed out due to inactivity');
                logout();
            }, SESSION_TIMEOUT_MS);
        };

        // Activity events to watch
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        activityEvents.forEach(event =>
            window.addEventListener(event, resetInactivityTimer, { passive: true })
        );

        // Start the initial timer
        resetInactivityTimer();

        return () => {
            activityEvents.forEach(event =>
                window.removeEventListener(event, resetInactivityTimer)
            );
            if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
            }
        };
    }, [token, user, isAdmin, isOperator, logout]);

    // ─── Login Function ─────────────────────────────────────────────────────
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

