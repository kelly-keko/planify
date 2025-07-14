import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FichiersProjet = ({ projetId }) => {
  const [fichiers, setFichiers] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchFichiers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/fichiers/?projet=${projetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fichiers reçus:', res.data);
      res.data.forEach((fichier, index) => {
        console.log(`Fichier ${index + 1}:`, fichier);
        console.log(`  - nom: ${fichier.nom}`);
        console.log(`  - fichier: ${fichier.fichier}`);
        console.log(`  - date_partage: ${fichier.date_partage}`);
      });
      setFichiers(res.data);
    } catch (err) {
      setToast({ message: 'Erreur lors du chargement des fichiers.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projetId) fetchFichiers();
    // eslint-disable-next-line
  }, [projetId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('nom', file.name);
    formData.append('date_partage', new Date().toISOString().slice(0, 10));
    formData.append('projet', projetId);
    formData.append('fichier', file); // Upload réel du fichier
    try {
      await axios.post('http://127.0.0.1:8000/api/fichiers/', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ message: 'Fichier ajouté !', type: 'success' });
      setFile(null);
      fetchFichiers();
    } catch (err) {
      setToast({ message: 'Erreur lors de l\'upload.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce fichier ?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/fichiers/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ message: 'Fichier supprimé.', type: 'success' });
      fetchFichiers();
    } catch (err) {
      setToast({ message: 'Erreur lors de la suppression.', type: 'error' });
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-blue-700">Fichiers du projet</h3>
      {toast.message && (
        <div className={`mb-4 px-4 py-2 rounded text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}
      <form onSubmit={handleUpload} className="flex gap-2 mb-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="flex-1 border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Ajouter</button>
      </form>
      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : (
        <ul className="space-y-2">
          {fichiers.length === 0 ? (
            <li className="text-gray-500">Aucun fichier pour ce projet.</li>
          ) : (
            fichiers.map((f) => (
              <li key={f.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-medium">{f.nom}</span>
                  <span className="ml-2 text-xs text-gray-500">{f.date_partage}</span>
                </div>
                <div className="flex items-center gap-2">
                  {f.fichier ? (
                    <a
                      href={f.fichier}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs px-2 py-1 border border-blue-200 rounded"
                      onClick={() => console.log('Fichier URL:', f.fichier)}
                    >
                      Télécharger
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs px-2 py-1 border border-gray-200 rounded">
                      Fichier non disponible
                    </span>
                  )}
                  <button onClick={() => handleDelete(f.id)} className="text-xs text-red-600 hover:underline">Supprimer</button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default FichiersProjet; 