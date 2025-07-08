import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password,
      });

      const token = response.data.access;
      const membreId = response.data.membre_id;
      const role = response.data.role;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('membre_id', membreId);
        localStorage.setItem('role', role);
        setMessage('✅ Connexion réussie !');
        let redirect = '/projets';
        if (role === 'ADMIN') redirect = '/dashboard';
        else if (role === 'CHEF_PROJET') redirect = '/dashboard/chef';
        else if (role === 'MEMBRE') redirect = '/dashboard/membre';
        setTimeout(() => navigate(redirect), 1000);
      } else {
        setMessage('❌ Token manquant dans la réponse.');
      }
    } catch (error) {
      setMessage('❌ Identifiants incorrects ou serveur indisponible.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {/* Logo */}
        <img src=".\public\assets\logo.png" alt="Logo ProManager" className="w-40 h-50 mx-auto mb-0" />

        <h2 className="text-2xl font-bold mb-6 text-blue-600 text-center">Connexion</h2>

        <input type="text" placeholder="Nom d'utilisateur"
          value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded" required />

        <input type="password" placeholder="Mot de passe"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded" required />

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
          Se connecter
        </button>

        {message && <p className="text-sm text-center mt-4 text-red-600">{message}</p>}

        <p className="text-sm text-center mt-4">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-blue-500 hover:underline">S'inscrire</a>
        </p>
      </form>
    </div>
  );
};

export default Login;