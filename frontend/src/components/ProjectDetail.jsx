import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Commentaires from './Commentaires';
import FichiersProjet from './FichiersProjet';

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

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [role, setRole] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [openComments, setOpenComments] = useState({});
  const membreId = localStorage.getItem('membre_id');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(response.data.role);
      } catch (error) {
        setRole(null);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        console.log('Fetching project with ID:', id);
        const response = await axios.get(`http://127.0.0.1:8000/api/projets/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Project data:', response.data);
        setProject(response.data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Erreur lors du chargement du projet.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    const fetchAvailableMembers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/projets/available_members/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAvailableMembers(response.data);
      } catch (err) {
        console.error('Error fetching available members:', err);
      }
    };
    fetchAvailableMembers();
  }, []);

  const handleAddMember = async () => {
    if (!selectedMember) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://127.0.0.1:8000/api/projets/${id}/add_member/`, 
        { membre_id: selectedMember },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await axios.get(`http://127.0.0.1:8000/api/projets/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data);
      setSelectedMember('');
      setToast({ message: 'Membre ajouté avec succès !', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erreur lors de l\'ajout du membre.', type: 'error' });
    }
  };

  const handleRemoveMember = async (membreId) => {
    if (!window.confirm('Voulez-vous vraiment retirer ce membre du projet ?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://127.0.0.1:8000/api/projets/${id}/remove_member/`, 
        { membre_id: membreId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await axios.get(`http://127.0.0.1:8000/api/projets/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data);
      setToast({ message: 'Membre retiré avec succès !', type: 'success' });
    } catch (err) {
      setToast({ message: 'Erreur lors du retrait du membre.', type: 'error' });
    }
  };

  const handleChangeTaskStatus = async (taskId) => {
    const statuts = ['En attente', 'En cours', 'Terminé', 'Annulé'];
    const nouveauStatut = prompt('Choisir le nouveau statut:\n1. En attente\n2. En cours\n3. Terminé\n4. Annulé\n\nEntrez le numéro (1-4):');
    if (!nouveauStatut || nouveauStatut < 1 || nouveauStatut > 4) return;
    const statutChoisi = statuts[parseInt(nouveauStatut) - 1];
    const token = localStorage.getItem('token');
    try {
      await axios.post(`http://127.0.0.1:8000/api/taches/${taskId}/change_status/`, 
        { statut: statutChoisi },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await axios.get(`http://127.0.0.1:8000/api/projets/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data);
      setToast({ message: `Statut changé à: ${statutChoisi}`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Erreur lors du changement de statut.', type: 'error' });
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1">
          <div className="max-w-2xl mx-auto bg-white rounded shadow p-8 mt-8">
            <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Détail du projet</h2>
            <div className="mb-4">
              <span className="font-semibold">Nom :</span> {project.nom}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Description :</span> {project.description}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Dates :</span> {new Date(project.date_debut).toLocaleDateString()} - {new Date(project.date_fin).toLocaleDateString()}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Statut :</span> {project.statut}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Créé par :</span> {typeof project.cree_par === 'object' ? project.cree_par.nom : project.cree_par}
            </div>
            <div className="mb-6">
              <span className="font-semibold">Membres du projet :</span>
              <ul className="list-disc ml-6 mt-2">
                {project.membres && project.membres.length > 0 ? (
                  project.membres.map((m) => (
                    <li key={m.id} className="flex justify-between items-center">
                      <span>{m.nom} ({m.role})</span>
                      {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
                        <button
                          onClick={() => handleRemoveMember(m.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm ml-2"
                        >
                          Retirer
                        </button>
                      )}
                    </li>
                  ))
                ) : (
                  <li>Aucun membre associé</li>
                )}
              </ul>
              {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
                <div className="mt-4 flex space-x-2">
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="border px-3 py-2 rounded flex-1"
                  >
                    <option value="">Sélectionner un membre à ajouter</option>
                    {availableMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.nom} ({member.role})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddMember}
                    disabled={!selectedMember}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  >
                    Ajouter
                  </button>
                </div>
              )}
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Tâches du projet :</span>
                {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
                  <button
                    onClick={() => navigate(`/projets/${id}/taches/create`)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    + Nouvelle tâche
                  </button>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded">
                {project.taches && project.taches.length > 0 ? (
                  <div className="space-y-3">
                    {project.taches.map((tache) => (
                      <div key={tache.id} className="bg-white p-3 rounded border flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium">{tache.nom}</div>
                          <div className="text-sm text-gray-600">
                            {tache.description && <span>{tache.description} • </span>}
                            <span>Du {new Date(tache.date_debut).toLocaleDateString()} au {new Date(tache.date_fin).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs ${
                              tache.statut === 'Terminé' ? 'bg-green-100 text-green-800' :
                              tache.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
                              tache.statut === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {tache.statut}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              tache.priorite === 'Urgente' ? 'bg-red-100 text-red-800' :
                              tache.priorite === 'Élevée' ? 'bg-orange-100 text-orange-800' :
                              tache.priorite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {tache.priorite}
                            </span>
                            {tache.assignee_nom && (
                              <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                Assigné à: {tache.assignee_nom}
                              </span>
                            )}
                          </div>
                        </div>
                        {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => navigate(`/projets/${id}/taches/${tache.id}/edit`)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Éditer
                            </button>
                            <button
                              onClick={() => handleChangeTaskStatus(tache.id)}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs"
                            >
                              Statut
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aucune tâche associée</p>
                )}
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">Tâches du projet</h3>
              {project.taches && project.taches.length > 0 ? (
                <ul>
                  {project.taches.map((t) => (
                    <li key={t.id} className="mb-4 bg-gray-50 p-4 rounded shadow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <span className="font-medium">{t.nom}</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${t.priorite === 'Urgente' ? 'bg-red-600 text-white' : t.priorite === 'Élevée' ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-700'}`}>{t.priorite}</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded ${t.statut === 'En retard' ? 'bg-red-200 text-red-800' : t.statut === 'En cours' ? 'bg-yellow-200 text-yellow-800' : t.statut === 'Terminé' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{t.statut}</span>
                          <span className="ml-2 text-xs text-gray-500">Échéance : {new Date(t.date_fin).toLocaleDateString()}</span>
                        </div>
                        <button
                          className="mt-2 md:mt-0 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
                          onClick={() => setOpenComments({ ...openComments, [t.id]: !openComments[t.id] })}
                        >
                          {openComments[t.id] ? 'Masquer les commentaires' : 'Voir les commentaires'}
                        </button>
                      </div>
                      {openComments[t.id] && (
                        <Commentaires tacheId={t.id} membreId={membreId} />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Aucune tâche pour ce projet.</p>
              )}
            </div>
            <FichiersProjet projetId={project.id} />
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => navigate('/projets')}
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 