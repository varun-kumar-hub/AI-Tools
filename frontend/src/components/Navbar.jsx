import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Search, Info, Settings, Sparkles, Menu, ChevronDown, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { ToolsContext } from '../App';
import logoImg from '../assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { refresh, loading } = useContext(ToolsContext) || {};

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
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 pt-[env(safe-area-inset-top)] ${scrolled
          ? 'bg-[#0a0b0f]/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-xl shadow-black/20'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <img src={logoImg} alt="AI Tools" className="w-5 h-5 rounded-sm object-cover" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">
                FutureTech AI
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/')
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5 ${['/categories', '/search', '/about'].includes(location.pathname) ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20' : ''}`}
                  >
                    <Menu className="w-4 h-4" />
                    Explore
                    <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-[#0d0e14] border border-white/[0.08] text-gray-300 rounded-xl shadow-xl shadow-black/50 overflow-hidden" align="start" sideOffset={8}>
                  {navLinks.filter(l => l.path !== '/').map(({ path, label, icon: Icon }) => (
                    <DropdownMenuItem key={path} asChild className="p-0 border-0 focus:bg-transparent">
                      <Link to={path} className={`flex items-center gap-2 cursor-pointer py-2.5 px-3 m-1 rounded-lg transition-colors outline-none focus:outline-none focus:ring-0 ${isActive(path) ? 'text-violet-300 bg-violet-500/15' : 'hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white'}`}>
                        <Icon className="w-4 h-4" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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
              <button
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2 ml-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh page"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Mobile Dropdown Menu (on the right) */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={refresh}
                disabled={loading}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-gray-300 hover:text-white transition-colors focus:outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-gray-300 hover:text-white transition-colors focus:outline-none shadow-sm">
                    <Menu className="w-5 h-5" />
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-[#0a0b0f]"></div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="w-56 p-1.5 bg-[#12131a]/95 backdrop-blur-3xl border border-white/[0.1] text-gray-300 rounded-2xl shadow-2xl shadow-black/60 animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95 overflow-hidden"
                >
                  <div className="px-3 py-2 border-b border-white/[0.05] mb-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Navigation</p>
                  </div>

                  {[...navLinks, { path: '/admin', label: 'Admin', icon: Settings }].map(({ path, label, icon: Icon }) => {
                    const active = isActive(path) || (path !== '/' && path !== '/admin' && location.pathname === path);
                    return (
                      <DropdownMenuItem key={path} asChild className="p-0 border-0 focus:bg-transparent">
                        <Link
                          to={path}
                          className={`flex items-center gap-3 cursor-pointer py-3 px-3 m-0.5 rounded-xl transition-all font-medium outline-none focus:outline-none focus:ring-0 ${active
                            ? 'text-violet-300 bg-violet-500/15 border-l-2 border-l-violet-400'
                            : 'hover:bg-white/5 hover:text-white focus:bg-white/5 focus:text-white border-l-2 border-l-transparent text-gray-400'
                            }`}
                        >
                          <div className={`p-1.5 rounded-lg ${active ? 'bg-violet-500/20' : 'bg-white/[0.03]'}`}>
                            <Icon className={`w-4 h-4 ${active ? 'text-violet-400' : 'text-gray-400'}`} />
                          </div>
                          <span className="text-[14px]">{label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;