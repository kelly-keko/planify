import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaArchive, FaUser, FaUsers, FaUserTie, FaUserCog, FaTimes, FaSave, FaUndo } from 'react-icons/fa';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [archiveModal, setArchiveModal] = useState({ open: false, user: null });
  const [unarchiveModal, setUnarchiveModal] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ nom: '', role: '', email: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/membres/?show_archived=true', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des utilisateurs');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.user && user.user.email && user.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArchived = showArchived ? true : user.is_active;
    return matchesRole && matchesSearch && matchesArchived;
  });

  // Statistiques
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    chef: users.filter(u => u.role === 'CHEF_PROJET').length,
    membre: users.filter(u => u.role === 'MEMBRE' || u.role === 'Membre').length,
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN': return <FaUserCog className="text-red-500" />;
      case 'CHEF_PROJET': return <FaUserTie className="text-blue-500" />;
      case 'MEMBRE': return <FaUser className="text-green-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-800',
      'CHEF_PROJET': 'bg-blue-100 text-blue-800',
      'MEMBRE': 'bg-green-100 text-green-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`;
  };

  const handleViewProfile = (userId) => {
    // Navigation vers le profil de l'utilisateur
    navigate(`/profile/${userId}`);
  };

  const handleEditUser = (user) => {
    setEditForm({
      nom: user.nom,
      role: user.role,
      email: user.user ? user.user.email : ''
    });
    setEditModal({ open: true, user });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/membres/${editModal.user.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: editForm.nom,
          role: editForm.role
        })
      });

      if (response.ok) {
        // Mettre à jour la liste des utilisateurs
        const updatedUsers = users.map(user => 
          user.id === editModal.user.id 
            ? { ...user, nom: editForm.nom, role: editForm.role }
            : user
        );
        setUsers(updatedUsers);
        setEditModal({ open: false, user: null });
        alert('Utilisateur modifié avec succès !');
      } else {
        throw new Error('Erreur lors de la modification');
      }
    } catch (error) {
      alert('Erreur lors de la modification : ' + error.message);
    }
  };

  const handleArchiveUser = (user) => {
    setArchiveModal({ open: true, user });
  };

  const confirmArchive = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/membres/${archiveModal.user.id}/archive/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Mettre à jour l'utilisateur dans la liste pour refléter son statut archivé
        const updatedUsers = users.map(user => 
          user.id === archiveModal.user.id 
            ? { ...user, is_active: false, archived_at: new Date().toISOString() }
            : user
        );
        setUsers(updatedUsers);
        setArchiveModal({ open: false, user: null });
        alert(result.message || 'Utilisateur archivé avec succès !');
      } else {
        let errorMessage = 'Erreur lors de l\'archivage';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      alert('Erreur lors de l\'archivage : ' + error.message);
    }
  };

  const handleUnarchiveUser = (user) => {
    setUnarchiveModal({ open: true, user });
  };

  const confirmUnarchive = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/membres/${unarchiveModal.user.id}/unarchive/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Mettre à jour l'utilisateur dans la liste pour refléter son statut actif
        const updatedUsers = users.map(user => 
          user.id === unarchiveModal.user.id 
            ? { ...user, is_active: true, archived_at: null }
            : user
        );
        setUsers(updatedUsers);
        setUnarchiveModal({ open: false, user: null });
        alert(result.message || 'Utilisateur réactivé avec succès !');
      } else {
        let errorMessage = 'Erreur lors de la réactivation';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      alert('Erreur lors de la réactivation : ' + error.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erreur</p>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des utilisateurs</h1>
          <p className="text-gray-600">Gérez les membres de votre équipe et leurs permissions</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUsers className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUserCog className="text-red-500 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Administrateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admin}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUserTie className="text-blue-500 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Chefs de projet</p>
                <p className="text-2xl font-bold text-gray-900">{stats.chef}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUser className="text-green-500 text-2xl mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Membres</p>
                <p className="text-2xl font-bold text-gray-900">{stats.membre}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par rôle</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="ADMIN">Administrateurs</option>
                <option value="CHEF_PROJET">Chefs de projet</option>
                <option value="MEMBRE">Membres</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Afficher les utilisateurs archivés</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Liste des utilisateurs ({filteredUsers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nom}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getRoleBadge(user.role)}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.user && user.user.email ? user.user.email : 'Non renseigné'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Archivé
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProfile(user.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Voir le profil"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        {user.is_active ? (
                          <button
                            onClick={() => handleArchiveUser(user)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Archiver"
                          >
                            <FaArchive />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnarchiveUser(user)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Réactiver"
                          >
                            <FaUndo />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Modifier l'utilisateur</h3>
              <button
                onClick={() => setEditModal({ open: false, user: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={editForm.nom}
                  onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MEMBRE">Membre</option>
                  <option value="CHEF_PROJET">Chef de projet</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié ici</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModal({ open: false, user: null })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <FaSave className="mr-2" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation d'archivage */}
      {archiveModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-red-600">Confirmer l'archivage</h3>
              <button
                onClick={() => setArchiveModal({ open: false, user: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir archiver l'utilisateur <strong>{archiveModal.user?.nom}</strong> ?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Cette action désactivera temporairement le compte de l'utilisateur.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setArchiveModal({ open: false, user: null })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmArchive}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <FaArchive className="mr-2" />
                Archiver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de réactivation */}
      {unarchiveModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-green-600">Confirmer la réactivation</h3>
              <button
                onClick={() => setUnarchiveModal({ open: false, user: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir réactiver l'utilisateur <strong>{unarchiveModal.user?.nom}</strong> ?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Cette action réactivera le compte de l'utilisateur.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setUnarchiveModal({ open: false, user: null })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmUnarchive}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <FaUndo className="mr-2" />
                Réactiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers; 