import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ element: Component, ...rest }) => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

  return isLoggedIn ? <Component {...rest} /> : <Navigate to="/" />;
};




export const ProtectedRoute2 = ({ element: Component, ...rest }) => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  return !isLoggedIn ? <Component {...rest} /> : <Navigate to="/LoggedInHome" />;
}
