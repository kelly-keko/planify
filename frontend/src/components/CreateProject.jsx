import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';

const CreateProject = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Pour l'édition
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [statut, setStatut] = useState('');
  const [message, setMessage] = useState('');
  const [role, setRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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
          alert("Accès refusé : seuls les chefs de projet ou admins peuvent créer un projet.");
          navigate('/projets');
        }
      } catch (error) {
        setRole(null);
        navigate('/projets');
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      const fetchProject = async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/projets/${id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const project = response.data;
          setNom(project.nom);
          setDescription(project.description);
          setDateDebut(project.date_debut);
          setDateFin(project.date_fin);
          setStatut(project.statut);
        } catch (error) {
          alert("Erreur lors du chargement du projet.");
          navigate('/projets');
        }
      };
      fetchProject();
    }
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const membreId = localStorage.getItem('membre_id');
    
    if (!membreId) {
      setMessage("❌ Erreur: ID du membre non trouvé. Veuillez vous reconnecter.");
      return;
    }

    try {
      const projectData = {
        nom: nom,
        description: description,
        date_debut: dateDebut,
        date_fin: dateFin,
        statut: statut,
        cree_par: membreId,
      };

      if (isEditing) {
        await axios.put(`http://127.0.0.1:8000/api/projets/${id}/`, projectData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ Projet modifié avec succès !');
      } else {
        await axios.post('http://127.0.0.1:8000/api/projets/', projectData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ Projet créé avec succès !');
      }
      navigate('/projets');
    } catch (error) {
      if (error.response) {
        console.error("Erreur API:", error.response.data);
        alert("Erreur API: " + JSON.stringify(error.response.data));
      } else {
        console.error("Erreur:", error.message);
      }
      setMessage(`❌ Erreur lors de la ${isEditing ? 'modification' : 'création'} du projet.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center p-6">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-blue-600 text-center">
            {isEditing ? 'Modifier le projet' : 'Créer un projet'}
          </h2>
          <input
            type="text"
            placeholder="Nom du projet"
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
            required
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
            <option value="">Sélectionner le statut du projet</option>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
            {isEditing ? 'Modifier le projet' : 'Créer le projet'}
          </button>
          {message && <p className="text-center mt-4 text-green-600">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
