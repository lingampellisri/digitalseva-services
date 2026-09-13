import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { token, isAdmin } = useAuth();
    if (!token || !isAdmin) return <Navigate to="/admin/login" replace />;
    return children;
};

export default AdminRoute;
