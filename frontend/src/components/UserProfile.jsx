import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '' });
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
        setForm({ nom: response.data.nom, email: response.data.email });
      } catch (err) {
        setError('Erreur lors du chargement du profil.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
      <div className="max-w-md mx-auto bg-white rounded shadow p-8 mt-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Mon profil</h2>
        {success && <div className="text-green-600 text-center mb-4">{success}</div>}
        {!editMode ? (
          <>
            <div className="mb-4">
              <span className="font-semibold">Nom d'utilisateur :</span> {profile.username}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Email :</span> {profile.email}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Nom affiché :</span> {profile.nom}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Rôle :</span> {profile.role}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Date d'inscription :</span> {new Date(profile.date_creation).toLocaleDateString()}
            </div>
            <div className="mt-6">
              <span className="font-semibold">Statistiques :</span>
              <ul className="list-disc ml-6 mt-2">
                <li>Tâches accomplies : {profile.taches_terminees}</li>
                <li>Projets créés : {profile.projets_count}</li>
              </ul>
            </div>
            <button
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded"
              onClick={() => setEditMode(true)}
            >
              Modifier mon profil
            </button>
          </>
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