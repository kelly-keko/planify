import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const TacheList = () => {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

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
    const fetchTaches = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/taches/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTaches(response.data);
      } catch (err) {
        console.error('Error fetching taches:', err);
        setError('Erreur lors du chargement des tâches.');
      } finally {
        setLoading(false);
      }
    };
    fetchTaches();
  }, []);

  const handleChangeStatus = async (taskId) => {
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
      // Recharger les tâches
      const response = await axios.get('http://127.0.0.1:8000/api/taches/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaches(response.data);
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-50"></div>
    </div>
  );

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Mes tâches</h1>
                  <p className="text-gray-600 mt-1">Gestion de vos tâches assignées</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              {taches.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <p className="text-gray-500 text-lg">Aucune tâche trouvée</p>
                  <p className="text-gray-400">Vous n'avez pas encore de tâches assignées.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {taches.map((tache) => (
                    <div key={tache.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{tache.nom}</h3>
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
                          </div>
                          {tache.description && (
                            <p className="text-gray-600 mb-2">{tache.description}</p>
                          )}
                          <div className="text-sm text-gray-500">
                            <span>Projet: {tache.projet_nom || 'N/A'}</span>
                            <span className="mx-2">•</span>
                            <span>Du {new Date(tache.date_debut).toLocaleDateString()} au {new Date(tache.date_fin).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => navigate(`/projets/${tache.projet}/taches/${tache.id}/edit`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Voir détails
                          </button>
                          <button
                            onClick={() => handleChangeStatus(tache.id)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Changer statut
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TacheList; 