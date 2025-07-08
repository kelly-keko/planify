import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        username,
        email,
        password
      });

      // Connexion automatique après inscription
      const loginRes = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password,
      });
      const token = loginRes.data.access;
      const membreId = loginRes.data.membre_id;
      const role = loginRes.data.role;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('membre_id', membreId);
        localStorage.setItem('role', role);
        setMessage('✅ Inscription et connexion réussies ! Redirection...');
        setTimeout(() => navigate('/dashboard/membre'), 1200);
      } else {
        setMessage('❌ Problème lors de la connexion automatique.');
      }
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      if (error.response?.data?.username) {
        setMessage("❌ Ce nom d'utilisateur est déjà pris.");
      } else if (error.response?.data?.email) {
        setMessage("❌ Cet email est déjà utilisé.");
      } else {
        setMessage('❌ Une erreur est survenue.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        {/* Logo */}
        <img src=".\public\assets\logo.png" alt="Logo ProManager" className="w-40 h-50 mx-auto mb-0" />
        <h2 className="text-2xl font-bold mb-6 text-green-600 text-center">Inscription</h2>

        <input type="text" placeholder="Nom d'utilisateur"
          value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded" required />

        <input type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded" required />

        <input type="password" placeholder="Mot de passe"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 mb-4 rounded" required />

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">
          S'inscrire
        </button>

        {message && <p className="text-sm text-center mt-4 text-green-600">{message}</p>}

        <p className="text-sm text-center mt-4">
          Déjà inscrit ?{' '}
          <a href="/login" className="text-blue-500 hover:underline">Se connecter</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
