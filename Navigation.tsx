
import React from 'react';

interface NavigationProps {
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 px-8 py-5 flex justify-around items-center z-40 max-w-lg mx-auto rounded-t-3xl">
      <button className="text-2xl hover:text-[#ffd700] transition-all" title="Home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fa-solid fa-house"></i>
      </button>
      <button className="text-2xl text-white/40 hover:text-[#ffd700] transition-all" title="Notifications">
        <i className="fa-solid fa-bell"></i>
      </button>
      <button className="text-2xl text-white/40 hover:text-[#ffd700] transition-all" title="Messages">
        <i className="fa-solid fa-comment-dots"></i>
      </button>
      <button 
        className="text-2xl text-white/40 hover:text-red-500 transition-all" 
        title="Logout"
        onClick={() => {
          if (confirm('Exit the Golden Universe?')) onLogout();
        }}
      >
        <i className="fa-solid fa-right-from-bracket"></i>
      </button>
    </nav>
  );
};

export default Navigation;
