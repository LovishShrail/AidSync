import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes';
import PageContainer from './components/layout/PageContainer';

const AppWrapper = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isRescuePage = location.pathname === '/rescue';

  return (
    <>
      {isLandingPage || isRescuePage ? (
        <AppRoutes />
      ) : (
        <PageContainer>
          <AppRoutes />
        </PageContainer>
      )}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Web3Provider>
        <NotificationProvider>
          <AuthProvider>
            <AppWrapper />
          </AuthProvider>
        </NotificationProvider>
      </Web3Provider>
    </Router>
  );
};

export default App;
