import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProjectList from './components/ProjectList';
import CreateProject from './components/CreateProject';
import ProjectDetail from './components/ProjectDetail';
import CreateTask from './components/CreateTask';
import TacheList from './components/TacheList';
import FichierList from './components/FichierList';
import CalendarPage from './components/CalendarPage';
import UserProfile from './components/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import ChefDashboard from './components/ChefDashboard';
import MembreDashboard from './components/MembreDashboard';
import AdminUsers from './components/AdminUsers';
import Layout from './components/Layout';

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
              <Layout>
                <ProjectList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/taches" element={
          <ProtectedRoute>
            <Layout>
              <TacheList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/fichiers" element={
          <ProtectedRoute>
            <Layout>
              <FichierList />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout>
              <CalendarPage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/create-project" element={
          <ProtectedRoute>  
            <Layout>
              <CreateProject />
            </Layout>
          </ProtectedRoute>
          } />
        <Route path="/edit-project/:id" element={<ProtectedRoute><Layout><CreateProject /></Layout></ProtectedRoute>} />
        <Route path="/projets/:id" element={<ProtectedRoute><Layout><ProjectDetail /></Layout></ProtectedRoute>} />
        <Route path="/projets/:projetId/taches/create" element={<ProtectedRoute><Layout><CreateTask /></Layout></ProtectedRoute>} />
        <Route path="/projets/:projetId/taches/:taskId/edit" element={<ProtectedRoute><Layout><CreateTask /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><UserProfile /></Layout></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><Layout><UserProfile /></Layout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/chef" element={<ProtectedRoute><Layout><ChefDashboard /></Layout></ProtectedRoute>} />
        <Route path="/dashboard/membre" element={<ProtectedRoute><Layout><MembreDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Layout>
              <AdminUsers />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
