import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaProjectDiagram, FaUser, FaUsers, FaPlus, FaChevronDown, FaChevronUp, FaTasks, FaFileAlt, FaCalendarAlt, FaChartBar } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [openSections, setOpenSections] = useState({});
  
  // Ouvrir toutes les sections par défaut
  useEffect(() => {
    if (role) {
      setOpenSections(prev => {
        const newSections = {};
        if (role === 'ADMIN') {
          newSections['Administration'] = true;
          newSections['Rapports'] = true;
          newSections['Mon compte'] = true;
        } else if (role === 'CHEF_PROJET') {
          newSections['Gestion des projets'] = true;
          newSections['Gestion des tâches'] = true;
          newSections['Rapports'] = true;
          newSections['Outils'] = true;
          newSections['Mon compte'] = true;
        } else if (role === 'MEMBRE' || role === 'Membre') {
          newSections['Mon espace'] = true;
          newSections['Rapports'] = true;
          newSections['Outils'] = true;
          newSections['Mon compte'] = true;
        }
        return { ...prev, ...newSections };
      });
    }
  }, [role]);

  // Mettre à jour le rôle quand il change dans le localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newRole = localStorage.getItem('role');
      setRole(newRole);
      console.log('Rôle mis à jour dans Sidebar:', newRole);
    };

    // Écouter les changements du localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier le rôle actuel
    const currentRole = localStorage.getItem('role');
    if (currentRole !== role) {
      setRole(currentRole);
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [role]);



  // Gestion ouverture/fermeture des sections
  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  let sections = [];



  if (role === 'ADMIN') {
    sections = [
      {
        title: 'Administration',
        icon: <FaUsers className="inline mr-2" />,
        links: [
          { label: 'Tableau de bord', to: '/dashboard', icon: <FaTachometerAlt className="inline mr-2" /> },
          { label: 'Tous les projets', to: '/projets', icon: <FaProjectDiagram className="inline mr-2" /> },
          { label: 'Créer un projet', to: '/create-project', icon: <FaPlus className="inline mr-2" /> },
          { label: 'Utilisateurs', to: '/admin', icon: <FaUsers className="inline mr-2" /> },
        ],
      },
      {
        title: 'Rapports',
        icon: <FaChartBar className="inline mr-2" />,
        links: [
          { label: 'Rapport global', to: '/rapports/global', icon: <FaChartBar className="inline mr-2" /> },
          { label: 'Rapport projets', to: '/rapports/projets', icon: <FaProjectDiagram className="inline mr-2" /> },
          { label: 'Rapport utilisateurs', to: '/rapports/utilisateurs', icon: <FaUsers className="inline mr-2" /> },
          { label: 'Rapport performance', to: '/rapports/performance', icon: <FaTachometerAlt className="inline mr-2" /> },
        ],
      },
      {
        title: 'Mon compte',
        icon: <FaUser className="inline mr-2" />,
        links: [
          { label: 'Profil', to: '/profile', icon: <FaUser className="inline mr-2" /> },
        ],
      },
    ];
  } else if (role === 'CHEF_PROJET') {
    sections = [
      {
        title: 'Gestion des projets',
        icon: <FaProjectDiagram className="inline mr-2" />,
        links: [
          { label: 'Tableau de bord', to: '/dashboard/chef', icon: <FaTachometerAlt className="inline mr-2" /> },
          { label: 'Mes projets', to: '/projets', icon: <FaProjectDiagram className="inline mr-2" /> },
          { label: 'Créer un projet', to: '/create-project', icon: <FaPlus className="inline mr-2" /> },
        ],
      },
      {
        title: 'Gestion des tâches',
        icon: <FaTasks className="inline mr-2" />,
        links: [
          { label: 'Toutes les tâches', to: '/taches', icon: <FaTasks className="inline mr-2" /> },
        ],
      },
      {
        title: 'Rapports',
        icon: <FaChartBar className="inline mr-2" />,
        links: [
          { label: 'Rapport équipe', to: '/rapports/equipe', icon: <FaUsers className="inline mr-2" /> },
          { label: 'Rapport projets', to: '/rapports/projets', icon: <FaProjectDiagram className="inline mr-2" /> },
          { label: 'Rapport tâches', to: '/rapports/taches', icon: <FaTasks className="inline mr-2" /> },
          { label: 'Rapport performance', to: '/rapports/performance', icon: <FaTachometerAlt className="inline mr-2" /> },
        ],
      },
      {
        title: 'Outils',
        icon: <FaFileAlt className="inline mr-2" />,
        links: [
          { label: 'Calendrier', to: '/calendar', icon: <FaCalendarAlt className="inline mr-2" /> },
          { label: 'Fichiers partagés', to: '/fichiers', icon: <FaFileAlt className="inline mr-2" /> },
        ],
      },
      {
        title: 'Mon compte',
        icon: <FaUser className="inline mr-2" />,
        links: [
          { label: 'Profil', to: '/profile', icon: <FaUser className="inline mr-2" /> },
        ],
      },
    ];
  } else if (role === 'MEMBRE' || role === 'Membre') {
    sections = [
      {
        title: 'Mon espace',
        icon: <FaTachometerAlt className="inline mr-2" />,
        links: [
          { label: 'Tableau de bord', to: '/dashboard/membre', icon: <FaTachometerAlt className="inline mr-2" /> },
          { label: 'Mes projets', to: '/projets', icon: <FaProjectDiagram className="inline mr-2" /> },
          { label: 'Mes tâches', to: '/taches', icon: <FaTasks className="inline mr-2" /> },
        ],
      },
      {
        title: 'Rapports',
        icon: <FaChartBar className="inline mr-2" />,
        links: [
          { label: 'Mon activité', to: '/rapports/activite', icon: <FaTachometerAlt className="inline mr-2" /> },
          { label: 'Mes performances', to: '/rapports/performances', icon: <FaChartBar className="inline mr-2" /> },
        ],
      },
      {
        title: 'Outils',
        icon: <FaFileAlt className="inline mr-2" />,
        links: [
          { label: 'Calendrier', to: '/calendar', icon: <FaCalendarAlt className="inline mr-2" /> },
          { label: 'Fichiers partagés', to: '/fichiers', icon: <FaFileAlt className="inline mr-2" /> },
        ],
      },
      {
        title: 'Mon compte',
        icon: <FaUser className="inline mr-2" />,
        links: [
          { label: 'Mon profil', to: '/profile', icon: <FaUser className="inline mr-2" /> },
        ],
      },
    ];
  }

  // Debug temporaire pour voir les sections
  console.log('Sections définies pour le rôle', role, ':', sections.length, 'sections');

  return (
    <aside className="bg-white shadow-md h-[calc(100vh-8rem)] w-56 flex flex-col p-4 space-y-4 sticky top-32 overflow-y-auto">
      <div className="mb-2 text-center">
        <span className="text-xl font-bold text-blue-600">Menu</span>
      </div>
      {sections.map((section, idx) => (
        <div key={section.title} className="mb-2">
          <button
            className="flex items-center w-full text-xs font-semibold text-gray-500 uppercase mb-2 pl-2 focus:outline-none"
            onClick={() => toggleSection(section.title)}
          >
            {section.icon}
            {section.title}
            <span className="ml-auto">
              {openSections[section.title] !== false ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>
          <div className={openSections[section.title] !== false ? 'block' : 'hidden'}>
            {section.links.map((link) => (
              <button
                key={link.to}
                onClick={() => navigate(link.to)}
                className="w-full text-left px-4 py-2 rounded hover:bg-blue-100 text-gray-700 font-medium flex items-center"
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>
          {idx < sections.length - 1 && <hr className="my-3 border-gray-200" />}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar; 