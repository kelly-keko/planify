import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProjectList from './components/ProjectList';
import CreateProject from './components/CreateProject';
import ProjectDetail from './components/ProjectDetail';
import CreateTask from './components/CreateTask';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import ChefDashboard from './components/ChefDashboard';
import MembreDashboard from './components/MembreDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/projets"
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route path="/create-project" element={
          <ProtectedRoute>  
          <CreateProject />
          </ProtectedRoute>
          } />
        <Route path="/edit-project/:id" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/projets/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/projets/:projetId/taches/create" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
        <Route path="/projets/:projetId/taches/:taskId/edit" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/chef" element={<ProtectedRoute><ChefDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/membre" element={<ProtectedRoute><MembreDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
