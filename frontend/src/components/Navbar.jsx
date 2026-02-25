import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Search, Info, Settings, Sparkles } from 'lucide-react';
import { useAuth } from './AuthProvider';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/categories', label: 'Categories', icon: Grid3X3 },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/about', label: 'About', icon: Info },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Top Navbar (desktop) ── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${scrolled
            ? 'bg-[#0a0b0f]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl shadow-black/20'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <img src={logoImg} alt="AI Tools" className="w-5 h-5 rounded-sm object-cover" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent hidden sm:block">
                FutureTech AI
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path}>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(path)
                        ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                </Link>
              ))}

              <Link to="/admin">
                <button
                  className={`flex items-center gap-2 ml-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/admin')
                      ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-white/[0.06]'
                    }`}
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </button>
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Bottom Tab Bar (mobile only) ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-3 mb-3 rounded-2xl bg-[#0d0e14]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40">
          <div className="flex items-center justify-around px-2 py-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path} className="flex-1">
                <div
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200 ${isActive(path)
                      ? 'text-violet-300'
                      : 'text-gray-500 hover:text-gray-400'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive(path) ? 'bg-violet-500/20' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </div>
              </Link>
            ))}
            <Link to="/admin" className="flex-1">
              <div
                className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200 ${isActive('/admin') ? 'text-violet-300' : 'text-gray-500'
                  }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive('/admin') ? 'bg-violet-500/20' : ''}`}>
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium leading-none">Admin</span>
              </div>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;