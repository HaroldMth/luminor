import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gift, Trophy, Plus, Home } from 'lucide-react';
import ChannelJoinPopup from './ChannelJoinPopup';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <ChannelJoinPopup />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Gift className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Luminora
                </h1>
                <p className="text-xs text-gray-500">by HANS TECH</p>
              </div>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  isActive('/') 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Home size={20} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              
              <Link
                to="/create"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  isActive('/create')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create</span>
              </Link>
              
              <Link
                to="/giveaways"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                  isActive('/giveaways')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Trophy size={20} />
                <span className="hidden sm:inline">Giveaways</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-md border-t border-purple-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              © 2025 Luminora by HANS TECH. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Built with ❤️ for amazing giveaway experiences
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;