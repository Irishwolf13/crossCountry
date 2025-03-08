// PrivateRoute.tsx

import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const { user } = useAuth();

  return (
    <Route
    {...rest}
    render={(props) =>
        user ? <Component {...props} /> : <Redirect to="/login" />
    }
    />
  );
};

export default PrivateRoute;
