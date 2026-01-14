import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Search, Layers, Info, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from './AuthProvider';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/categories', label: 'Categories', icon: Layers },
    // { path: '/search', label: 'Search', icon: Search }, // Search is prominent on home now
    { path: '/about', label: 'About', icon: Info },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${scrolled ? 'bg-black/40 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div className={`p-2 rounded-xl transition-all duration-300 ${scrolled ? 'bg-white/5' : ''}`}>
              <img src={logoImg} alt="AI Tools Tracker" className="w-8 h-8 rounded-md" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hidden sm:block">
              AI Tools Tracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant="ghost"
                    className={`relative px-4 py-2 h-10 rounded-full transition-all duration-300 group overflow-hidden ${isActive(link.path) ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <span className={`absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity ${isActive(link.path) ? 'opacity-100' : ''}`} />
                    <div className="flex items-center gap-2 relative z-10">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive(link.path) ? 'text-purple-400' : ''}`} />
                      <span className="font-medium">{link.label}</span>
                    </div>
                  </Button>
                </Link>
              );
            })}

            <Link to="/admin">
              <Button
                variant="outline"
                className="ml-4 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-purple-500/50 hover:text-white rounded-full transition-all duration-300"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden relative z-50 p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-2xl transition-all duration-500 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-6 p-4">
          {navLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`transform transition-all duration-500 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all ${isActive(link.path)
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50'
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}>
                  <Icon className={`w-6 h-6 ${isActive(link.path) ? 'text-purple-400' : 'text-gray-400'}`} />
                  <span className={`text-xl font-medium ${isActive(link.path) ? 'text-white' : 'text-gray-300'}`}>
                    {link.label}
                  </span>
                </div>
              </Link>
            );
          })}

          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            className={`transform transition-all duration-500 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 text-gray-300">
              <Settings className="w-5 h-5" />
              <span>Admin Dashboard</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;