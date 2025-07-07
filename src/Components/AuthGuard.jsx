import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../sections/ShopContext';
import LoadingScreen from './LoadingScreen';

const AuthGuard = ({ children }) => {
    const { isAuthenticated, loading } = useContext(ShopContext);
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default AuthGuard;
