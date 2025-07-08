import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}> 
    {message}
    <button className="ml-4 font-bold" onClick={onClose}>×</button>
  </div>
);

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-50"></div>
  </div>
);

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  useEffect(() => {
    const fetchProfileAndProjects = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        // Récupère le rôle
        const profileRes = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(profileRes.data.role);
        // Récupère les projets
        const response = await axios.get('http://127.0.0.1:8000/api/projets/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des projets ou du profil:", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndProjects();
  }, [navigate]);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce projet ?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/projets/${projectId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(projects.filter((p) => p.id !== projectId));
      setToast({ message: 'Projet supprimé avec succès.', type: 'success' });
    } catch (error) {
      setToast({ message: 'Erreur lors de la suppression du projet.', type: 'error' });
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      <main className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 Liste des projets</h2>
        <div className="bg-white rounded shadow divide-y">
          {projects.length === 0 ? (
            <p className="text-gray-600 p-4">Aucun projet trouvé.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-700">{project.nom}</h3>
                  <p className="text-gray-600">{project.description}</p>
                  <p className="text-sm text-gray-500">
                    Début : {new Date(project.date_debut).toLocaleDateString()} – Fin : {new Date(project.date_fin).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">Statut : {project.statut}</p>
                </div>
                {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/edit-project/${project.id}`)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => navigate(`/projets/${project.id}`)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Voir le détail
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectList;
