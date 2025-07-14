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
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
      {/* <h1
        onClick={() => navigate('/projets')}
        className="text-xl font-bold text-blue-600 cursor-pointer"
      >
        ProManager
      </h1> */}

      {/* Logo à gauche */}
      <img src="/assets/logo.png" alt="Logo ProManager" className="w-40 h-50 mb-0" />
      <div className="flex space-x-4 items-center">
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
