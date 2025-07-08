import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaProjectDiagram, FaUser, FaUsers, FaPlus, FaChevronDown, FaChevronUp, FaTasks, FaFileAlt, FaCalendarAlt } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [openSections, setOpenSections] = useState({});

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
        title: 'Gestion',
        icon: <FaProjectDiagram className="inline mr-2" />,
        links: [
          { label: 'Tableau de bord', to: '/dashboard/chef', icon: <FaTachometerAlt className="inline mr-2" /> },
          { label: 'Mes projets', to: '/projets', icon: <FaProjectDiagram className="inline mr-2" /> },
          { label: 'Créer un projet', to: '/create-project', icon: <FaPlus className="inline mr-2" /> },
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
  } else if (role === 'MEMBRE') {
    sections = [
      {
        title: 'Espace membre',
        icon: <FaUser className="inline mr-2" />,
        links: [
          { label: 'Mon tableau de bord', to: '/dashboard/membre', icon: <FaTachometerAlt className="inline mr-2" /> },
          { label: 'Mes projets', to: '/projets', icon: <FaProjectDiagram className="inline mr-2" /> },
          { label: 'Mon calendrier', to: '/calendar', icon: <FaCalendarAlt className="inline mr-2" /> },
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

  return (
    <aside className="bg-white shadow-md h-full min-h-screen w-56 flex flex-col p-4 space-y-4">
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
          <div className={openSections[section.title] !== false ? '' : 'hidden'}>
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