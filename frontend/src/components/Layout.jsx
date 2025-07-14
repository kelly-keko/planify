import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar en haut - fixée */}
      <Navbar />
      
      {/* Contenu principal avec sidebar - avec padding-top pour compenser la navbar */}
      <div className="flex pt-28">
        {/* Sidebar à gauche */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        {/* Contenu principal */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 