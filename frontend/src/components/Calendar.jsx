import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../index.css'; // Pour l'intégration Tailwind

// Exemple de fonction pour colorer les jours avec tâches
function getTileClassName({ date, tasks }) {
  const dayTasks = tasks.filter(
    (t) => new Date(t.date_fin).toDateString() === date.toDateString()
  );
  if (dayTasks.length === 0) return '';
  if (dayTasks.some((t) => t.priorite === 'Urgente' || t.statut === 'En retard')) return 'bg-red-200 text-red-800 font-bold';
  if (dayTasks.some((t) => t.priorite === 'Élevée')) return 'bg-orange-200 text-orange-800 font-bold';
  if (dayTasks.some((t) => t.statut === 'En cours')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
}

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow text-white ${type === 'warning' ? 'bg-orange-500' : 'bg-red-600'}`}> 
    {message}
    <button className="ml-4 font-bold" onClick={onClose}>×</button>
  </div>
);

const TaskCalendar = ({ tasks = [] }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasksForDay, setTasksForDay] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    const today = new Date();
    setTasksForDay(
      tasks.filter(
        (t) => new Date(t.date_fin).toDateString() === selectedDate.toDateString()
      )
    );
    // Notification si tâche en retard ou proche échéance
    const tasksToday = tasks.filter(
      (t) => new Date(t.date_fin).toDateString() === selectedDate.toDateString()
    );
    const lateTasks = tasksToday.filter((t) => t.statut === 'En retard');
    const soonTasks = tasksToday.filter((t) => {
      const diff = (new Date(t.date_fin) - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 2 && t.statut !== 'Terminé' && t.statut !== 'En retard';
    });
    if (lateTasks.length > 0) {
      setToast({ message: `⚠️ ${lateTasks.length} tâche(s) en retard aujourd'hui !`, type: 'danger' });
    } else if (soonTasks.length > 0) {
      setToast({ message: `⏰ ${soonTasks.length} tâche(s) proche(s) de l'échéance aujourd'hui !`, type: 'warning' });
    } else {
      setToast({ message: '', type: '' });
    }
  }, [selectedDate, tasks]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Calendrier des tâches</h2>
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      <div className="bg-white rounded shadow p-6 flex flex-col md:flex-row gap-8">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={({ date }) => getTileClassName({ date, tasks })}
          className="border-none"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-blue-600">Tâches du {selectedDate.toLocaleDateString()}</h3>
          {tasksForDay.length === 0 ? (
            <p className="text-gray-500">Aucune tâche pour ce jour.</p>
          ) : (
            <ul>
              {tasksForDay.map((t) => (
                <li key={t.id} className="mb-2 p-2 rounded shadow flex flex-col md:flex-row md:justify-between md:items-center bg-gray-50">
                  <span className="font-medium">{t.nom}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${t.priorite === 'Urgente' ? 'bg-red-600 text-white' : t.priorite === 'Élevée' ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-700'}`}>{t.priorite}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${t.statut === 'En retard' ? 'bg-red-200 text-red-800' : t.statut === 'En cours' ? 'bg-yellow-200 text-yellow-800' : t.statut === 'Terminé' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{t.statut}</span>
                  <span className="ml-2 text-xs text-gray-500">Échéance : {new Date(t.date_fin).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Prévu pour intégration future des rappels/notifications */}
    </div>
  );
};

export default TaskCalendar; 