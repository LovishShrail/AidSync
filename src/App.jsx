import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes';
import PageContainer from './components/layout/PageContainer';


const App = () => {
  return (
    <Router>
      <Web3Provider>
        <NotificationProvider>
          <AuthProvider>
            <PageContainer>
              <AppRoutes />
            </PageContainer>
          </AuthProvider>
        </NotificationProvider>
      </Web3Provider>
    </Router>
  );
};

export default App;