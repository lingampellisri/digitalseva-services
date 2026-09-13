import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OperatorRoute = ({ children }) => {
    const { token, isOperator } = useAuth();
    if (!token || !isOperator) return <Navigate to="/operator/login" replace />;
    return children;
};

export default OperatorRoute;
