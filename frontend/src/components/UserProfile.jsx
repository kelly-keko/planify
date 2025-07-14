import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { FaArrowLeft, FaEdit, FaUser, FaEnvelope, FaCalendar, FaUserTie, FaTasks, FaProjectDiagram } from 'react-icons/fa';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '' });
  const [success, setSuccess] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        let response;
        if (userId) {
          // Profil d'un autre utilisateur
          response = await axios.get(`http://127.0.0.1:8000/api/membres/${userId}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsOwnProfile(false);
        } else {
          // Mon propre profil
          response = await axios.get('http://127.0.0.1:8000/api/profile/', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsOwnProfile(true);
        }
        
        setProfile(response.data);
        setForm({ nom: response.data.nom, email: response.data.email || '' });
      } catch (err) {
        setError('Erreur lors du chargement du profil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    const token = localStorage.getItem('token');
    try {
      await axios.patch('http://127.0.0.1:8000/api/profile/', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setEditMode(false);
      setSuccess('Profil mis à jour avec succès.');
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil.');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
        {/* Header avec bouton retour */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-3xl font-bold text-gray-900">
              {isOwnProfile ? 'Mon profil' : `Profil de ${profile?.nom}`}
            </h2>
          </div>
          {isOwnProfile && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaEdit className="mr-2" />
              Modifier
            </button>
          )}
        </div>

        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
        
        {!editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informations personnelles */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Informations personnelles</h3>
              
              <div className="flex items-center space-x-3">
                <FaUser className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Nom d'utilisateur</p>
                  <p className="font-medium">{profile.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaUser className="text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Nom affiché</p>
                  <p className="font-medium">{profile.nom}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email || 'Non renseigné'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaUserTie className="text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Rôle</p>
                  <p className="font-medium">{profile.role}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FaCalendar className="text-orange-500" />
                <div>
                  <p className="text-sm text-gray-500">Date d'inscription</p>
                  <p className="font-medium">{new Date(profile.date_creation).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Statistiques</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FaTasks className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-sm text-gray-500">Tâches accomplies</p>
                      <p className="text-2xl font-bold text-blue-600">{profile.taches_terminees || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FaProjectDiagram className="text-green-500 text-xl" />
                    <div>
                      <p className="text-sm text-gray-500">Projets créés</p>
                      <p className="text-2xl font-bold text-green-600">{profile.projets_count || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">Nom affiché</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Enregistrer</button>
              <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Annuler</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 