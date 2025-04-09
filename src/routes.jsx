import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DisastersPage from './pages/DisastersPage';
import DisasterDetailPage from './pages/DisasterDetailPage';
import CreateDisasterPage from './pages/CreateDisasterPage';
import OrganizationsPage from './pages/OrganizationsPage';
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import CreateOrganizationPage from './pages/CreateOrganizationPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import EmergencyFundPage from './pages/EmergencyFundPage';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/NotFound';
import WithdrawForm from './components/admin/WithdrawForm';
import WithdrawPage from './pages/WithdrawPage';
import AddOrganizationToDisaster from './pages/AddOrganizationToDisaster';
import LandingPage from './pages/LandingPage';
import RescuePage from './pages/RescuePage';

const AppRoutes = () => {
  return (
    
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/disasters" element={<DisastersPage />} />
        <Route path="/admin/create-disaster" element={<CreateDisasterPage />} />
        <Route path="/admin/manage-organizations" element={<CreateOrganizationPage />} />
        <Route path="/admin/withdraw" element={<WithdrawPage />} />
        <Route path="/admin/wihtdraw" element={<WithdrawForm />} />
        <Route path="/disasters/:id" element={<DisasterDetailPage />} />
        <Route path="//disasters/:id/add-organization" element={<AddOrganizationToDisaster />} />     
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/organizations/create" element={<CreateOrganizationPage />} />
        <Route path="/organizations/:address" element={<OrganizationDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/emergency-fund" element={<EmergencyFundPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/rescue" element={<RescuePage />} />
        
      </Routes>
   
  );
};

export default AppRoutes;