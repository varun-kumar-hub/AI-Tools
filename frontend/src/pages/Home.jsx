import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, Layers, Tag, ArrowRight, ExternalLink, Trash2 } from 'lucide-react';
import { ToolsContext } from '../App';
import { useAuth } from '../components/AuthProvider';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import config from '../config';

const BACKEND_URL = config.BACKEND_URL;

const Home = () => {
  const { tools, stats, loading, refresh } = useContext(ToolsContext);
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit] = useState(() => parseInt(localStorage.getItem('home_display_limit')) || 15);
  const [toolToDelete, setToolToDelete] = useState(null);

  const confirmDelete = async (e) => {
    if (e) e.preventDefault();
    if (!toolToDelete) return;

    try {
      const res = await fetch(`${BACKEND_URL}/tools/${toolToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete tool");

      toast.success('Tool deleted successfully');
      refresh();
      setToolToDelete(null);
    } catch (error) {
      toast.error('Failed to delete tool');
      console.error(error);
      setToolToDelete(null);
    }
  };

  const handleDelete = (e, id) => {
    e.preventDefault();
    setToolToDelete(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  const filteredTools = tools.filter(tool =>
    tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fallback stats
  const displayStats = stats || {
    totalTools: tools.length,
    addedToday: 0,
    tagsTracked: 0,
    categories: 0
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="relative text-center mb-16 animate-fade-in-up">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-purple-500/20 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <Badge className="mb-6 px-4 py-1.5 rounded-full bg-white/5 border-white/10 text-purple-300 hover:bg-white/10 transition-colors">
            <Sparkles className="w-3 h-3 mr-2 text-purple-400" />
            Discover the Future
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            Discover Fresh <br />
            <span className="text-gradient">AI Tools Daily</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Your centralized hub for discovering newly released AI tools from
            <span className="text-purple-400 mx-1">Product Hunt</span>,
            <span className="text-blue-400 mx-1">Hacker News</span>, and
            <span className="text-cyan-400 mx-1">Dev.to</span>.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2 transition-all group-focus-within:border-purple-500/50">
              <Search className="w-6 h-6 text-gray-500 ml-3" />
              <input
                type="text"
                placeholder="Search tools, categories, or features..."
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-lg py-3 px-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid - Mobile Optimized (2x2) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
        {[
          { label: 'Total Tools', value: displayStats.totalTools ?? displayStats.total_tools ?? 0, icon: Layers, color: 'text-purple-400' },
          { label: 'Categories', value: `${displayStats.categories ?? 0}+`, icon: Layers, color: 'text-blue-400' },
          { label: 'Added Today', value: displayStats.addedToday ?? displayStats.added_today ?? 0, icon: TrendingUp, color: 'text-cyan-400' },
          { label: 'Tags Tracked', value: `${displayStats.tagsTracked ?? displayStats.tags_tracked ?? 0}+`, icon: Tag, color: 'text-emerald-400' }
        ].map((stat, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 text-center group hover:-translate-y-1 transition-transform">
            <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-gray-400">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Tools Grid */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Latest Arrivals</h2>
            <p className="text-gray-400">Freshly scraped from top platforms</p>
          </div>
          <Link to="/search">
            <Button variant="ghost" className="hidden sm:flex text-purple-400 hover:text-purple-300 hover:bg-purple-400/10">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.slice(0, displayLimit).map((tool) => (
            <div key={tool.id} className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full border border-white/5 hover:border-purple-500/30">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/20 backdrop-blur-md">
                    {tool.category}
                  </Badge>
                  {tool.source && (
                    <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                      {tool.source}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-1">
                  {tool.name}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                  {tool.description}
                </p>

                <div className="mt-auto flex flex-wrap gap-2">
                  {tool.tags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex gap-3">
                <Link to={`/tool/${tool.id}`} className="flex-1">
                  <Button className="w-full bg-white/5 hover:bg-white/10 text-white border-none">
                    Details
                  </Button>
                </Link>
                {tool.url && (
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-none shadow-lg shadow-purple-900/20">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                {isAdmin && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={(e) => handleDelete(e, tool.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTools.length > displayLimit && (
          <div className="flex justify-center mt-12">
            <Link to="/search">
              <Button size="lg" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full px-8 backdrop-blur-md">
                Load More Tools <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">No tools found matching your search.</p>
          </div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!toolToDelete} onOpenChange={() => setToolToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tool?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the tool from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Cancel</AlertDialogCancel>
            <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 border-none text-white">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;