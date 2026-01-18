import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import LiveMap from './pages/LiveMap';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import Predict from "./pages/Predict";

import FuturePrediction from './pages/FuturePrediction';

import ModelPerformance from './pages/ModelPerformance';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'researcher' | 'farmer'

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? (
          userRole === 'researcher' ? <MainLayout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/farmer" replace />
        ) : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="prediction" element={<FuturePrediction />} />
          <Route path="model-performance" element={<ModelPerformance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="map" element={<LiveMap />} />
        </Route>

        {/* Farmer Routes */}
        <Route path="/farmer" element={isAuthenticated && userRole === 'farmer' ? <FarmerDashboard onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/predict" element={<Predict />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
