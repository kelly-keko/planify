import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
      active 
        ? 'bg-white text-blue-600 border-b-2 border-blue-600' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
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
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'tasks', 'members', 'files'
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

  const renderInfoTab = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-gray-700">Nom :</span>
            <p className="text-gray-900">{project.nom}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Statut :</span>
            <span className={`px-2 py-1 rounded text-sm ${
              project.statut === 'Terminé' ? 'bg-green-100 text-green-800' :
              project.statut === 'En cours' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {project.statut}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Date de début :</span>
            <p className="text-gray-900">{new Date(project.date_debut).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Date de fin :</span>
            <p className="text-gray-900">{new Date(project.date_fin).toLocaleDateString()}</p>
          </div>
          <div className="md:col-span-2">
            <span className="font-semibold text-gray-700">Description :</span>
            <p className="text-gray-900 mt-1">{project.description}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Créé par :</span>
            <p className="text-gray-900">{typeof project.cree_par === 'object' ? project.cree_par.nom : project.cree_par}</p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Statistiques du projet</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {project.membres ? project.membres.length : 0}
            </div>
            <div className="text-sm text-gray-600">Membres</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {project.taches ? project.taches.filter(t => t.statut === 'Terminé').length : 0}
            </div>
            <div className="text-sm text-gray-600">Tâches terminées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {project.taches ? project.taches.filter(t => t.statut === 'En cours').length : 0}
            </div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {project.taches ? project.taches.filter(t => t.statut === 'En attente').length : 0}
            </div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>
            </div>
                </div>
            </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Tâches du projet</h3>
                {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
                  <button
                    onClick={() => navigate(`/projets/${id}/taches/create`)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
            <span>+</span> Nouvelle tâche
                  </button>
                )}
              </div>
      
                {project.taches && project.taches.length > 0 ? (
                  <div className="space-y-3">
                    {project.taches.map((tache) => (
            <div key={tache.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                        <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-2">{tache.nom}</div>
                  {tache.description && (
                    <div className="text-sm text-gray-600 mb-2">{tache.description}</div>
                  )}
                  <div className="text-xs text-gray-500 mb-3">
                    Du {new Date(tache.date_debut).toLocaleDateString()} au {new Date(tache.date_fin).toLocaleDateString()}
                          </div>
                  <div className="flex flex-wrap gap-2">
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
                <div className="flex gap-2 ml-4">
                  <button
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
                    onClick={() => setOpenComments({ ...openComments, [tache.id]: !openComments[tache.id] })}
                  >
                    {openComments[tache.id] ? 'Masquer' : 'Commentaires'}
                  </button>
                        {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
              {openComments[tache.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Commentaires tacheId={tache.id} membreId={membreId} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg">Aucune tâche associée à ce projet</p>
          {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
            <button
              onClick={() => navigate(`/projets/${id}/taches/create`)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Créer la première tâche
            </button>
                )}
              </div>
      )}
            </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Membres du projet</h3>
        
        {project.membres && project.membres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.membres.map((membre) => (
              <div key={membre.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                        <div>
                    <div className="font-medium text-gray-900">{membre.nom}</div>
                    <div className="text-sm text-gray-600">{membre.email}</div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                      membre.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      membre.role === 'CHEF_PROJET' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {membre.role}
                    </span>
                        </div>
                  {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
                        <button
                      onClick={() => handleRemoveMember(membre.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                      Retirer
                        </button>
                  )}
                </div>
                      </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <p className="text-gray-500">Aucun membre associé à ce projet</p>
          </div>
        )}

        {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Ajouter un membre</h4>
            <div className="flex space-x-2">
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
          </div>
        )}
      </div>
    </div>
  );

  const renderFilesTab = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">Fichiers du projet</h3>
            <FichiersProjet projetId={project.id} />
    </div>
  );

  if (loading) return <Loader />;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      <div className="flex flex-1">
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{project.nom}</h1>
                  <p className="text-gray-600 mt-1">Projet • {project.statut}</p>
                </div>
            <button
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              onClick={() => navigate('/projets')}
            >
                  ← Retour à la liste
            </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-1 p-4">
                  <TabButton 
                    active={activeTab === 'info'} 
                    onClick={() => setActiveTab('info')}
                  >
                    📋 Informations
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'tasks'} 
                    onClick={() => setActiveTab('tasks')}
                  >
                    ✅ Tâches ({project.taches ? project.taches.length : 0})
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'members'} 
                    onClick={() => setActiveTab('members')}
                  >
                    👥 Membres ({project.membres ? project.membres.length : 0})
                  </TabButton>
                  <TabButton 
                    active={activeTab === 'files'} 
                    onClick={() => setActiveTab('files')}
                  >
                    📁 Fichiers
                  </TabButton>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'info' && renderInfoTab()}
                {activeTab === 'tasks' && renderTasksTab()}
                {activeTab === 'members' && renderMembersTab()}
                {activeTab === 'files' && renderFilesTab()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 