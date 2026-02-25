import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Sparkles, TrendingUp, Layers, Tag, ArrowRight, ExternalLink, Trash2, Zap
} from 'lucide-react';
import { ToolsContext } from '../App';
import { useAuth } from '../components/AuthProvider';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../components/ui/alert-dialog';
import config from '../config';

const BACKEND_URL = config.BACKEND_URL;

const categoryColors = {
  'Code & Development': 'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-300',
  'Data Analysis': 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 text-emerald-300',
  'Productivity': 'from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-300',
  'Design & Creative': 'from-pink-500/20 to-rose-500/20 border-pink-500/20 text-pink-300',
  'Marketing & Sales': 'from-red-500/20 to-orange-500/20 border-red-500/20 text-red-300',
  'Content Writing': 'from-violet-500/20 to-purple-500/20 border-violet-500/20 text-violet-300',
  'Video & Audio': 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/20 text-purple-300',
  'Research & Education': 'from-indigo-500/20 to-blue-500/20 border-indigo-500/20 text-indigo-300',
  'Customer Service': 'from-teal-500/20 to-cyan-500/20 border-teal-500/20 text-teal-300',
  'Other': 'from-gray-500/20 to-slate-500/20 border-gray-500/20 text-gray-300',
};

const getCategoryStyle = (cat) => categoryColors[cat] || categoryColors['Other'];

const ToolCard = ({ tool, isAdmin, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const catStyle = getCategoryStyle(tool.category);

  return (
    <div className="tool-card group">
      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gradient-to-r border ${catStyle} shrink-0`}>
            {tool.category || 'Other'}
          </span>
          {tool.source && (
            <span className="text-[10px] font-mono text-gray-600 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06] shrink-0">
              {tool.source}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
          {tool.name}
        </h3>

        {/* Description */}
        <div
          className="flex-1 cursor-pointer group/desc"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <p className={`text-gray-400 text-[13px] leading-relaxed transition-all duration-300 ${isExpanded ? 'line-clamp-5' : 'line-clamp-1'}`}>
            {tool.description}
          </p>
        </div>

        {/* Tags */}
        {tool.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {tool.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-gray-500 border border-white/[0.05]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3.5 border-t border-white/[0.06] bg-black/20 flex items-center gap-2">
        <Link to={`/tool/${tool.id}`} className="flex-1">
          <button className="w-full h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 hover:text-white text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1.5">
            View Details <ArrowRight className="w-3 h-3" />
          </button>
        </Link>
        {tool.url && (
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            <button className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 flex items-center justify-center text-white transition-all duration-200 shadow-lg shadow-violet-900/30">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </a>
        )}
        {isAdmin && (
          <button
            onClick={(e) => { e.preventDefault(); onDelete(tool.id); }}
            className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-all duration-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

const Home = () => {
  const { tools, stats, loading, refresh } = useContext(ToolsContext);
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit] = useState(() => parseInt(localStorage.getItem('home_display_limit')) || 18);
  const [toolToDelete, setToolToDelete] = useState(null);

  const confirmDelete = async () => {
    if (!toolToDelete) return;
    try {
      const res = await fetch(`${BACKEND_URL}/tools/${toolToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      toast.success('Tool deleted');
      refresh();
      setToolToDelete(null);
    } catch {
      toast.error('Failed to delete tool');
      setToolToDelete(null);
    }
  };

  const filteredTools = tools.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayStats = stats || { totalTools: tools.length, addedToday: 0, tagsTracked: 0, categories: 0 };

  const statItems = [
    { label: 'Total Tools', value: displayStats.totalTools ?? displayStats.total_tools ?? tools.length, icon: Layers, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Categories', value: `${displayStats.categories ?? 0}+`, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Added Today', value: displayStats.addedToday ?? displayStats.added_today ?? 0, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Tags Tracked', value: `${displayStats.tagsTracked ?? displayStats.tags_tracked ?? 0}+`, icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <p className="text-gray-500 text-sm">Loading AI tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative z-10 pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* ── Hero ── */}
        <section className="text-center mb-14 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Updated hourly from top platforms
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 leading-[1.1] tracking-tight">
            Discover the Best<br />
            <span className="text-gradient">AI Tools Daily</span>
          </h1>

          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Your hub for the latest AI tools, curated from{' '}
            <span className="text-orange-400 font-medium">Product Hunt</span>,{' '}
            <span className="text-amber-400 font-medium">Hacker News</span>, and{' '}
            <span className="text-teal-400 font-medium">Dev.to</span>.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 blur-xl opacity-60" />
            <div className="relative flex items-center bg-white/[0.04] border border-white/[0.09] rounded-2xl px-4 py-1 focus-within:border-violet-500/50 focus-within:bg-white/[0.06] transition-all duration-200">
              <Search className="w-5 h-5 text-gray-500 shrink-0" />
              <input
                type="text"
                placeholder="Search tools, categories, features..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-[15px] py-3.5 px-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-gray-300 text-xs transition-colors">
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {statItems.map((s, i) => (
            <div key={i} className="stat-card group">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
              <div className="text-[11px] text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ── Tools Grid ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Latest Arrivals</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                {searchQuery ? `${filteredTools.length} results` : 'Freshly scraped from top platforms'}
              </p>
            </div>
            <Link to="/search">
              <button className="hidden sm:flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {filteredTools.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No tools found</p>
              <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.slice(0, displayLimit).map((tool) => (
                <ToolCard key={tool.id} tool={tool} isAdmin={isAdmin} onDelete={setToolToDelete} />
              ))}
            </div>
          )}

          {filteredTools.length > displayLimit && (
            <div className="flex justify-center mt-10">
              <Link to="/search">
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-gray-300 hover:text-white text-sm font-medium transition-all duration-200">
                  Load More Tools <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!toolToDelete} onOpenChange={() => setToolToDelete(null)}>
        <AlertDialogContent className="bg-[#0d0e14] border-white/10 text-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tool?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will permanently remove the tool. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-xl">Cancel</AlertDialogCancel>
            <button onClick={confirmDelete} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
              Delete
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;