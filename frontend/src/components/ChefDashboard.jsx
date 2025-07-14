import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TaskCalendar from './Calendar';
import { FaProjectDiagram, FaTasks, FaCheckCircle, FaExclamationTriangle, FaUser, FaUserTie } from 'react-icons/fa';

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

const StatCard = ({ icon, value, label, color }) => (
  <div className={`flex flex-col items-center justify-center bg-white rounded-xl shadow-md p-6 transition-transform duration-200 hover:scale-105 hover:shadow-lg border-t-4 ${color}`}>
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">{label}</div>
  </div>
);

const ChefDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/chef/', {
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
  if (!stats) return <ErrorMsg message="Erreur de chargement du tableau de bord chef de projet." />;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-full">
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-8 py-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-2 text-center drop-shadow">Tableau de bord Chef de Projet</h2>
        <p className="text-center text-gray-500 mb-8 text-lg">Vue d'ensemble de vos projets et tâches</p>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<FaProjectDiagram className="text-blue-500" />} value={stats.projets_count || 0} label="Projets gérés" color="border-blue-400" />
          <StatCard icon={<FaTasks className="text-green-500" />} value={stats.taches_total || 0} label="Tâches totales" color="border-green-400" />
          <StatCard icon={<FaCheckCircle className="text-purple-500" />} value={stats.taches_terminees || 0} label="Tâches terminées" color="border-purple-400" />
          <StatCard icon={<FaExclamationTriangle className="text-red-500" />} value={stats.taches_retard || 0} label="Tâches en retard" color="border-red-400" />
        </div>

        {/* Répartition des tâches (sans graphique) */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row items-center gap-8 transition-shadow hover:shadow-lg">
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Répartition des tâches</h3>
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Terminées</span>
                <span className="text-2xl font-bold text-green-600">{stats.taches_terminees || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">En cours</span>
                <span className="text-2xl font-bold text-yellow-600">{stats.taches_en_cours || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium">En retard</span>
                <span className="text-2xl font-bold text-red-600">{stats.taches_retard || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">En attente</span>
                <span className="text-2xl font-bold text-blue-600">
                  {Math.max(0, (stats.taches_total || 0) - (stats.taches_terminees || 0) - (stats.taches_en_cours || 0) - (stats.taches_retard || 0))}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">Membres du projet</h3>
            {stats.membres && stats.membres.length > 0 ? (
              <ul className="w-full space-y-3">
                {stats.membres.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 bg-blue-50 rounded p-3 shadow-sm">
                    <span className="inline-block bg-white rounded-full p-2 shadow">
                      <FaUser className={m.role === 'CHEF_PROJET' ? 'text-blue-500' : 'text-green-500'} />
                    </span>
                    <span className="font-semibold text-gray-800">{m.nom}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
                      {m.role === 'CHEF_PROJET' ? 'Chef de projet' : m.role === 'ADMIN' ? 'Administrateur' : 'Membre'}
                    </span>
                    <span className="ml-auto text-sm text-gray-500">{m.taches} tâche{m.taches > 1 ? 's' : ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center">Aucun membre dans vos projets</p>
            )}
          </div>
        </div>

        {/* Timeline des activités */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Dernières activités</h3>
          {stats.activites && stats.activites.length > 0 ? (
            <ul className="space-y-3">
              {stats.activites.map((a, idx) => (
                <li key={idx} className="flex items-center gap-3 text-gray-700">
                  <span className="inline-block bg-blue-100 rounded-full p-2">
                    {a.type === 'tache' ? <FaTasks className="text-blue-500" /> : <FaProjectDiagram className="text-green-500" />}
                  </span>
                  <span className="font-medium">{a.user}</span>
                  <span className="text-sm">a {a.action} {a.type === 'tache' ? 'la tâche' : 'le projet'}</span>
                  <span className="font-semibold">{a.nom}</span>
                  {a.projet && <span className="text-xs text-gray-400">({a.projet})</span>}
                  <span className="ml-auto text-xs text-gray-400">{a.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">Aucune activité récente</p>
          )}
        </div>

        {/* Projets gérés */}
        {stats.projets && stats.projets.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8 transition-shadow hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2"><FaProjectDiagram /> Projets gérés</h3>
            <ul className="divide-y divide-gray-100">
              {stats.projets.map((p) => (
                <li key={p.id} className="py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <span className="font-medium text-gray-800">{p.nom}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">{p.statut}</span>
                  <span className="text-xs text-gray-500">{new Date(p.date_debut).toLocaleDateString()} - {new Date(p.date_fin).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Message si aucun projet */}
        {(!stats.projets || stats.projets.length === 0) && (
          <div className="bg-white rounded-xl shadow p-6 mb-8 text-center">
            <h3 className="text-xl font-semibold mb-4 text-blue-700 flex items-center justify-center gap-2"><FaProjectDiagram /> Projets gérés</h3>
            <p className="text-gray-500">Aucun projet géré pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefDashboard; 