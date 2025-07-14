import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import TaskCalendar from './Calendar';
import { FaTachometerAlt, FaProjectDiagram, FaTasks, FaCheckCircle, FaExclamationTriangle, FaClock, FaUser, FaCalendarAlt, FaChartLine, FaStar } from 'react-icons/fa';

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

const ErrorMsg = ({ message }) => (
  <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
    <div className="text-xl font-semibold mb-2">Erreur de chargement du tableau de bord</div>
    <div className="text-sm text-gray-500">{message}</div>
  </div>
);

const StatCard = ({ icon, value, label, color, trend }) => (
  <div className={`bg-white rounded-xl shadow p-6 transition-all duration-300 hover:shadow-lg border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}% ce mois
          </p>
        )}
      </div>
      <div className="text-4xl text-gray-300">
        {icon}
      </div>
    </div>
  </div>
);

const MembreDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/membre/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        setStats(null);
        setToast({ message: 'Erreur de chargement du tableau de bord membre.', type: 'error' });
        setErrorMsg(error?.response?.data ? JSON.stringify(error.response.data) : error.message || 'Erreur inconnue');
        console.error('Erreur dashboard membre:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;
  if (!stats) return <ErrorMsg message={errorMsg} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      
      <div className="container mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FaUser className="text-blue-600" />
            Mon Tableau de Bord
          </h1>
          <p className="text-gray-600">Bienvenue ! Voici un aperçu de vos activités et projets.</p>
        </div>

        {/* Cartes statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FaProjectDiagram className="text-blue-500" />} 
            value={stats.projets_count || 0} 
            label="Mes Projets" 
            color="border-blue-400"
            trend={8}
          />
          <StatCard 
            icon={<FaTasks className="text-green-500" />} 
            value={stats.taches_total || 0} 
            label="Tâches Assignées" 
            color="border-green-400"
            trend={12}
          />
          <StatCard 
            icon={<FaCheckCircle className="text-purple-500" />} 
            value={stats.taches_terminees || 0} 
            label="Tâches Terminées" 
            color="border-purple-400"
            trend={15}
          />
          <StatCard 
            icon={<FaExclamationTriangle className="text-red-500" />} 
            value={stats.taches_retard || 0} 
            label="Tâches en Retard" 
            color="border-red-400"
            trend={-5}
          />
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
              <FaChartLine className="text-blue-500" />
              Mes Performances
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Taux de complétion</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.taches_total > 0 ? Math.round((stats.taches_terminees / stats.taches_total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.taches_total > 0 ? (stats.taches_terminees / stats.taches_total) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Projets actifs</span>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.projets ? stats.projets.filter(p => p.statut === 'En cours').length : 0}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Tâches urgentes</span>
                <span className="text-2xl font-bold text-red-600">
                  {stats.taches ? stats.taches.filter(t => t.priorite === 'Urgente').length : 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
              <FaProjectDiagram className="text-blue-500" />
              Mes Projets
            </h3>
            {stats.projets && stats.projets.length > 0 ? (
              <div className="space-y-3">
                {stats.projets.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      p.statut === 'Terminé' ? 'bg-green-500' :
                      p.statut === 'En cours' ? 'bg-blue-500' :
                      p.statut === 'En retard' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{p.nom}</span>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
                          {p.statut}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(p.date_debut).toLocaleDateString()} - {new Date(p.date_fin).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Aucun projet assigné</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6 transition-shadow hover:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
              <FaClock className="text-blue-500" />
              Tâches Prioritaires
            </h3>
            {stats.taches && stats.taches.length > 0 ? (
              <div className="space-y-3">
                {stats.taches
                  .filter(t => t.priorite === 'Urgente' || t.priorite === 'Élevée')
                  .sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin))
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <div className="inline-block bg-white rounded-full p-2 shadow">
                        <FaTasks className="text-red-500" />
                      </div>
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
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">Aucune tâche prioritaire</p>
            )}
          </div>
        </div>

        {/* Section Tâches à suivre */}
        {stats.taches && stats.taches.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-xl font-semibold mb-6 text-blue-700 flex items-center gap-2">
              <FaStar className="text-blue-500" />
              Tâches à Suivre
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.taches
                .filter(t => t.priorite === 'Élevée' || t.priorite === 'Urgente' || t.statut === 'En retard' || t.statut === 'En cours')
                .sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin))
                .slice(0, 8)
                .map((t) => (
                  <div key={t.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-4 h-4 rounded-full ${
                      t.statut === 'Terminé' ? 'bg-green-500' :
                      t.statut === 'En cours' ? 'bg-blue-500' :
                      t.statut === 'En retard' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 mb-1">{t.nom}</div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${
                          t.priorite === 'Urgente' ? 'bg-red-600 text-white' : 
                          t.priorite === 'Élevée' ? 'bg-orange-400 text-white' : 
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {t.priorite}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          t.statut === 'En retard' ? 'bg-red-200 text-red-800' : 
                          t.statut === 'En cours' ? 'bg-yellow-200 text-yellow-800' : 
                          t.statut === 'Terminé' ? 'bg-green-200 text-green-800' : 
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {t.statut}
                        </span>
                        <span className="text-xs text-gray-500">
                          Échéance : {new Date(t.date_fin).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Calendrier des tâches */}
        {stats.taches && stats.taches.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h3 className="text-xl font-semibold mb-6 text-blue-700 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              Calendrier des Tâches
            </h3>
            <TaskCalendar tasks={stats.taches} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MembreDashboard; 