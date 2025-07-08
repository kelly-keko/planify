import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Commentaires = ({ tacheId, membreId }) => {
  const [commentaires, setCommentaires] = useState([]);
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });

  const fetchCommentaires = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/commentaires/?tache=${tacheId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentaires(res.data);
    } catch (err) {
      setError('Erreur lors du chargement des commentaires.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tacheId) fetchCommentaires();
    // eslint-disable-next-line
  }, [tacheId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!contenu.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://127.0.0.1:8000/api/commentaires/', {
        contenu,
        tache: tacheId,
        auteur: membreId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContenu('');
      setToast({ message: 'Commentaire ajouté !', type: 'success' });
      fetchCommentaires();
    } catch (err) {
      setToast({ message: 'Erreur lors de l\'ajout du commentaire.', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce commentaire ?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/commentaires/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ message: 'Commentaire supprimé.', type: 'success' });
      fetchCommentaires();
    } catch (err) {
      setToast({ message: 'Erreur lors de la suppression.', type: 'error' });
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-blue-700">Commentaires</h3>
      {toast.message && (
        <div className={`mb-4 px-4 py-2 rounded text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}
      {loading ? (
        <div className="text-gray-500">Chargement...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <ul className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {commentaires.length === 0 ? (
            <li className="text-gray-500">Aucun commentaire.</li>
          ) : (
            commentaires.map((c) => (
              <li key={c.id} className="flex justify-between items-start bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-semibold text-blue-600">{c.auteur_nom || 'Utilisateur'}</span>
                  <span className="ml-2 text-xs text-gray-400">{new Date(c.date).toLocaleString()}</span>
                  <div className="mt-1">{c.contenu}</div>
                </div>
                {c.auteur === membreId && (
                  <button onClick={() => handleDelete(c.id)} className="ml-2 text-xs text-red-600 hover:underline">Supprimer</button>
                )}
              </li>
            ))
          )}
        </ul>
      )}
      <form onSubmit={handleAdd} className="flex gap-2 mt-2">
        <input
          type="text"
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
      </form>
    </div>
  );
};

export default Commentaires; 