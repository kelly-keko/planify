import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  // Si pas connecté, redirige vers la page de login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Sinon, affiche le contenu
  return children;
};

export default ProtectedRoute;
