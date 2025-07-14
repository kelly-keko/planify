import React, { useState, useEffect } from 'react';
import TaskCalendar from './Calendar';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:8000/api/taches/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des tâches');
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Calendrier des tâches</h1>
            </div>
            <div className="text-sm text-gray-500">
              {tasks.length} tâche{tasks.length > 1 ? 's' : ''} au total
              {(() => {
                const projets = [...new Set(tasks.map(t => t.projet_nom))];
                return projets.length > 0 ? ` • ${projets.length} projet${projets.length > 1 ? 's' : ''}` : '';
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TaskCalendar tasks={tasks} />
        
        {/* Résumé par projet */}
        {tasks.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé par projet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const projets = {};
                tasks.forEach(task => {
                  const projetNom = task.projet_nom || 'Projet non spécifié';
                  if (!projets[projetNom]) {
                    projets[projetNom] = {
                      total: 0,
                      enCours: 0,
                      termine: 0,
                      enRetard: 0,
                      urgentes: 0
                    };
                  }
                  projets[projetNom].total++;
                  if (task.statut === 'En cours') projets[projetNom].enCours++;
                  if (task.statut === 'Terminé') projets[projetNom].termine++;
                  if (task.statut === 'En retard') projets[projetNom].enRetard++;
                  if (task.priorite === 'Urgente') projets[projetNom].urgentes++;
                });
                
                return Object.entries(projets).map(([projetNom, stats]) => (
                  <div key={projetNom} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium text-blue-600 mb-2">📁 {projetNom}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total :</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>En cours :</span>
                        <span className="text-yellow-600">{stats.enCours}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Terminées :</span>
                        <span className="text-green-600">{stats.termine}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>En retard :</span>
                        <span className="text-red-600">{stats.enRetard}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Urgentes :</span>
                        <span className="text-red-600">{stats.urgentes}</span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage; 