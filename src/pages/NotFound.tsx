import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { FaChevronLeft, FaTriangleExclamation } from 'react-icons/fa6';

export const NotFound: React.FC = () => {
  useSEO({
    title: '404 Page Not Found',
    description: 'The requested coordinate path does not exist in our placement training matrices.',
    noIndex: true
  });

  return (
    <div className="min-h-screen bg-bg-dark text-white gradient-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neon-pink/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="glass-panel p-10 rounded-3xl border border-white/5 max-w-md w-full space-y-6 relative overflow-hidden">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-neon-pink/15 text-neon-pink border border-neon-pink/20 animate-pulse">
            <FaTriangleExclamation className="w-10 h-10" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="font-display font-black text-6xl text-white tracking-widest">404</h1>
          <h2 className="font-display font-bold text-lg text-white">Area Unexplored</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            The target coordinate path does not exist in our placement preparation database.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-neon-purple/20"
          >
            <FaChevronLeft className="w-3 h-3" />
            <span>Return to Core Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
