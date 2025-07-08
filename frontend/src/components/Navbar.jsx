import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(response.data.role);
      } catch (error) {
        setRole(null);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('membre_id');
    localStorage.removeItem('role');
    navigate('/');
  };

  // Détermine le lien dashboard selon le rôle
  let dashboardLink = '/dashboard';
  if (role === 'CHEF_PROJET') dashboardLink = '/dashboard/chef';
  else if (role === 'MEMBRE') dashboardLink = '/dashboard/membre';

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* <h1
        onClick={() => navigate('/projets')}
        className="text-xl font-bold text-blue-600 cursor-pointer"
      >
        ProManager
      </h1> */}

      {/* Logo */}
        <img src="./public/assets/logo.png" alt="Logo ProManager" className="w-40 h-50 mx-auto mb-0" />
      <div className="flex space-x-4 items-center">
        {/* Lien Tableau de bord dynamique */}
        <button
          onClick={() => navigate(dashboardLink)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Tableau de bord
        </button>
        {(role === 'ADMIN' || role === 'CHEF_PROJET') && (
          <button
            onClick={() => navigate('/create-project')}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Nouveau projet
          </button>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
