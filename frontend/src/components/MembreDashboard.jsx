import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import TaskCalendar from './Calendar';

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
  if (!stats) return <div className="min-h-screen flex flex-col items-center justify-center text-red-600"><div>Erreur de chargement du tableau de bord membre.</div>{errorMsg && <div className="mt-2 text-xs text-gray-500">{errorMsg}</div>}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 max-w-4xl mx-auto p-8">
          <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">Tableau de bord Membre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.projets_count}</div>
              <div className="text-gray-600">Projets</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.taches_total}</div>
              <div className="text-gray-600">Tâches assignées</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.taches_terminees}</div>
              <div className="text-gray-600">Tâches terminées</div>
            </div>
            <div className="bg-white rounded shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.taches_retard}</div>
              <div className="text-gray-600">Tâches en retard</div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">Mes projets</h3>
            <ul>
              {stats.projets.map((p) => (
                <li key={p.id} className="mb-2 flex justify-between items-center">
                  <span className="font-medium">{p.nom}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100">{p.statut}</span>
                  <span className="text-xs text-gray-500">{new Date(p.date_debut).toLocaleDateString()} - {new Date(p.date_fin).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Section Tâches à suivre */}
          {stats.taches && stats.taches.length > 0 && (
            <div className="bg-white rounded shadow p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">Tâches à suivre</h3>
              <ul>
                {stats.taches
                  .filter(t => t.priorite === 'Élevée' || t.priorite === 'Urgente' || t.statut === 'En retard' || t.statut === 'En cours')
                  .sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin))
                  .slice(0, 8)
                  .map((t) => (
                    <li key={t.id} className="mb-2 flex flex-col md:flex-row md:justify-between md:items-center border-b pb-2 last:border-b-0">
                      <div>
                        <span className="font-medium">{t.nom}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${t.priorite === 'Urgente' ? 'bg-red-600 text-white' : t.priorite === 'Élevée' ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-700'}`}>{t.priorite}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${t.statut === 'En retard' ? 'bg-red-200 text-red-800' : t.statut === 'En cours' ? 'bg-yellow-200 text-yellow-800' : t.statut === 'Terminé' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{t.statut}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 md:mt-0">Échéance : {new Date(t.date_fin).toLocaleDateString()}</div>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          {/* Calendrier des tâches */}
          {stats.taches && stats.taches.length > 0 && (
            <div className="mb-8">
              <TaskCalendar tasks={stats.taches} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembreDashboard; 