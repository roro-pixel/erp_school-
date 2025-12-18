import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingComponent from '../Common/LoadingComponent';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return <LoadingComponent />;
  }

  // Rediriger vers /login si non authentifié
  if (!isAuthenticated()) {
    console.log("ProtectedRoute: Non authentifié, redirection vers /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rendre les enfants si authentifié
  return <>{children}</>;
};

export default ProtectedRoute;