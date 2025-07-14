import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const FichierList = () => {
  const [fichiers, setFichiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFichiers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/fichiers/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFichiers(response.data);
      } catch (err) {
        console.error('Error fetching fichiers:', err);
        setError('Erreur lors du chargement des fichiers.');
      } finally {
        setLoading(false);
      }
    };
    fetchFichiers();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-50"></div>
    </div>
  );

  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Fichiers partagés</h1>
                  <p className="text-gray-600 mt-1">Tous les fichiers de vos projets</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              {fichiers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📁</div>
                  <p className="text-gray-500 text-lg">Aucun fichier trouvé</p>
                  <p className="text-gray-400">Vous n'avez pas encore de fichiers partagés dans vos projets.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fichiers.map((fichier) => (
                    <div key={fichier.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{fichier.nom}</h3>
                          <p className="text-sm text-gray-500 mb-2">
                            Projet: {fichier.projet_nom || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Ajouté le {new Date(fichier.date_partage).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          {fichier.fichier ? (
                            <a
                              href={fichier.fichier}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Télécharger
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm px-3 py-1 border border-gray-200 rounded">
                              Non disponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichierList; 