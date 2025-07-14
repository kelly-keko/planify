import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaProjectDiagram, FaTasks, FaCheckCircle, FaExclamationTriangle, FaUsers, FaUserTie, FaClock, FaChartLine } from 'react-icons/fa';

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}> 
    {message}
    <button className="ml-4 font-bold" onClick={onClose}>×</button>
  </div>
);

const Loader = () => (
  <div className="flex items-center justify-center bg-gray-50 py-20">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
  </div>
);

const ErrorMsg = ({ message }) => (
  <div className="flex items-center justify-center bg-gray-50 py-20">
    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow flex items-center gap-3">
      <FaExclamationTriangle className="text-2xl text-red-500" />
      <span className="font-semibold">{message}</span>
    </div>
  </div>
);

const StatCard = ({ icon, value, label, color, trend }) => (
  <div className={`flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-lg border-t-4 ${color}`}>
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">{label}</div>
    {trend && (
      <div className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend > 0 ? '+' : ''}{trend}% ce mois
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/stats/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
        setStats(null);
        setToast({ message: 'Erreur de chargement du tableau de bord.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (!stats) return <ErrorMsg message="Erreur de chargement du tableau de bord administrateur." />;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 min-h-full">
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-purple-700 mb-2 text-center drop-shadow">Tableau de bord Administrateur</h2>
        <p className="text-center text-gray-500 mb-8 text-lg">Vue d'ensemble globale de la plateforme</p>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={<FaProjectDiagram className="text-purple-500" />} 
            value={stats.projets_count || 0} 
            label="Projets actifs" 
            color="border-purple-400"
            trend={12}
          />
          <StatCard 
            icon={<FaTasks className="text-blue-500" />} 
            value={stats.taches_count || 0} 
            label="Tâches totales" 
            color="border-blue-400"
            trend={8}
          />
          <StatCard 
            icon={<FaCheckCircle className="text-green-500" />} 
            value={stats.taches_terminees || 0} 
            label="Tâches terminées" 
            color="border-green-400"
            trend={15}
          />
          <StatCard 
            icon={<FaExclamationTriangle className="text-red-500" />} 
            value={stats.taches_retard || 0} 
            label="Tâches en retard" 
            color="border-red-400"
            trend={-5}
          />
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-purple-700 flex items-center gap-2">
              <FaUsers className="text-purple-500" />
              Répartition des tâches
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Terminées</span>
                <span className="text-2xl font-bold text-green-600">{stats.taches_terminees || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">En cours</span>
                <span className="text-2xl font-bold text-yellow-600">{stats.taches_en_cours || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">En attente</span>
                <span className="text-2xl font-bold text-blue-600">{stats.taches_en_attente || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium">En retard</span>
                <span className="text-2xl font-bold text-red-600">{stats.taches_retard || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-purple-700 flex items-center gap-2">
              <FaUserTie className="text-purple-500" />
              Projets récents
            </h3>
            {stats.projets_recents && stats.projets_recents.length > 0 ? (
              <ul className="space-y-3">
                {stats.projets_recents.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 bg-purple-50 rounded p-3 shadow-sm">
                    <span className="inline-block bg-white rounded-full p-2 shadow">
                      <FaProjectDiagram className="text-purple-500" />
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{p.nom}</span>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
                          {p.statut}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(p.date_debut).toLocaleDateString()} - {new Date(p.date_fin).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">Aucun projet récent</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-purple-700 flex items-center gap-2">
              <FaClock className="text-purple-500" />
              Tâches urgentes
            </h3>
            {stats.taches_a_venir && stats.taches_a_venir.length > 0 ? (
              <ul className="space-y-3">
                {stats.taches_a_venir.slice(0, 5).map((t) => (
                  <li key={t.id} className="flex items-center gap-3 bg-red-50 rounded p-3 shadow-sm">
                    <span className="inline-block bg-white rounded-full p-2 shadow">
                      <FaTasks className="text-red-500" />
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{t.nom}</span>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          t.priorite === 'Urgente' ? 'bg-red-600 text-white' : 
                          t.priorite === 'Élevée' ? 'bg-orange-400 text-white' : 
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {t.priorite}
                        </span>
                        <span className="text-xs text-gray-500">{t.projet}</span>
                      </div>
                    </div>
                    <span className="text-xs text-red-600 font-medium">
                      {new Date(t.date_fin).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">Aucune tâche urgente</p>
            )}
          </div>
        </div>

        {/* Graphiques et métriques avancées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-700 flex items-center gap-2">
              <FaChartLine />
              Métriques de performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Taux de complétion</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.taches_count > 0 ? Math.round((stats.taches_terminees / stats.taches_count) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.taches_count > 0 ? (stats.taches_terminees / stats.taches_count) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Projets en cours</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.projets_recents ? stats.projets_recents.filter(p => p.statut === 'En cours').length : 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Tâches en retard</span>
                <span className="text-2xl font-bold text-red-600">{stats.taches_retard || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-purple-700 flex items-center gap-2">
              <FaUsers />
              Vue d'ensemble des projets
            </h3>
            <div className="space-y-4">
              {stats.projets_recents && stats.projets_recents.length > 0 ? (
                <div className="space-y-3">
                  {stats.projets_recents.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          p.statut === 'Terminé' ? 'bg-green-500' :
                          p.statut === 'En cours' ? 'bg-blue-500' :
                          p.statut === 'En retard' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></div>
                        <span className="font-medium">{p.nom}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(p.date_fin).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">Aucun projet disponible</p>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Dashboard; 