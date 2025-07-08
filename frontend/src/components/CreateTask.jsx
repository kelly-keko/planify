import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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

const CreateTask = () => {
  const navigate = useNavigate();
  const { projetId, taskId } = useParams(); // Pour l'édition
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [statut, setStatut] = useState('');
  const [priorite, setPriorite] = useState('');
  const [assignee, setAssignee] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [projetMembres, setProjetMembres] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(response.data.role);
        if (response.data.role !== 'ADMIN' && response.data.role !== 'CHEF_PROJET') {
          setToast({ message: "Accès refusé : seuls les chefs de projet ou admins peuvent créer une tâche.", type: 'error' });
          navigate(`/projets/${projetId}`);
        }
      } catch (error) {
        setRole(null);
        navigate(`/projets/${projetId}`);
      }
    };
    fetchProfile();
  }, [navigate, projetId]);

  useEffect(() => {
    const fetchProjetMembres = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/projets/${projetId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjetMembres(response.data.membres || []);
      } catch (error) {
        console.error('Erreur lors du chargement des membres du projet:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjetMembres();
  }, [projetId]);

  useEffect(() => {
    if (taskId) {
      setIsEditing(true);
      setLoading(true);
      const fetchTask = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/taches/${taskId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const task = response.data;
          setNom(task.nom);
          setDescription(task.description || '');
          setDateDebut(task.date_debut);
          setDateFin(task.date_fin);
          setStatut(task.statut);
          setPriorite(task.priorite);
          setAssignee(task.assignee ? task.assignee.id : '');
        } catch (error) {
          setToast({ message: "Erreur lors du chargement de la tâche.", type: 'error' });
          navigate(`/projets/${projetId}`);
        } finally {
          setLoading(false);
        }
      };
      fetchTask();
    }
  }, [taskId, navigate, projetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const taskData = {
        nom: nom,
        description: description,
        date_debut: dateDebut,
        date_fin: dateFin,
        statut: statut,
        priorite: priorite,
        projet: projetId,
        assignee: assignee || null,
      };
      if (isEditing) {
        await axios.put(`http://127.0.0.1:8000/api/taches/${taskId}/`, taskData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToast({ message: 'Tâche modifiée avec succès !', type: 'success' });
      } else {
        await axios.post('http://127.0.0.1:8000/api/taches/', taskData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToast({ message: 'Tâche créée avec succès !', type: 'success' });
      }
      setTimeout(() => navigate(`/projets/${projetId}`), 1000);
    } catch (error) {
      if (error.response) {
        setToast({ message: "Erreur API: " + JSON.stringify(error.response.data), type: 'error' });
      } else {
        setToast({ message: "Erreur: " + error.message, type: 'error' });
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />}
      <div className="flex justify-center items-center p-6">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-600 text-center">
            {isEditing ? 'Modifier la tâche' : 'Créer une tâche'}
          </h2>
          <input
            type="text"
            placeholder="Nom de la tâche"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full border px-3 py-2 mb-4 rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 mb-4 rounded"
            rows="3"
          ></textarea>
          <input
            placeholder='Date de début' 
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="w-full border px-3 py-2 mb-4 rounded"
            required
          />
          <input
            placeholder='Date de fin'
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="w-full border px-3 py-2 mb-4 rounded"
            required
          />
          <select
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            className="w-full border px-3 py-2 mb-4 rounded"
            required
          >
            <option value="">Sélectionner le statut</option>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
          </select>
          <select
            value={priorite}
            onChange={(e) => setPriorite(e.target.value)}
            className="w-full border px-3 py-2 mb-4 rounded"
            required
          >
            <option value="">Sélectionner la priorité</option>
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Élevée">Élevée</option>
            <option value="Urgente">Urgente</option>
          </select>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full border px-3 py-2 mb-4 rounded"
          >
            <option value="">Aucun assigné</option>
            {projetMembres.map((membre) => (
              <option key={membre.id} value={membre.id}>
                {membre.nom} ({membre.role})
              </option>
            ))}
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            {isEditing ? 'Modifier la tâche' : 'Créer la tâche'}
          </button>
          {message && <p className="text-center mt-4 text-green-600">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateTask; 