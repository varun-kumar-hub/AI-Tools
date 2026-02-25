import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, ExternalLink, ArrowRight, X, Loader2, ArrowLeft } from 'lucide-react';
import { ToolsContext } from '../App';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Search = () => {
  const navigate = useNavigate();
  const { tools, categories, loading } = useContext(ToolsContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredTools, setFilteredTools] = useState([]);

  useEffect(() => { setFilteredTools(tools); }, [tools]);

  useEffect(() => {
    let results = tools;
    if (searchQuery) {
      results = results.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedCategory !== 'all') {
      results = results.filter(t => t.category === selectedCategory);
    }
    setFilteredTools(results);
  }, [searchQuery, selectedCategory, tools]);

  const hasFilters = searchQuery || selectedCategory !== 'all';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[30%] w-[350px] h-[350px] rounded-full bg-violet-600/6 blur-[80px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 pt-20 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Search <span className="text-gradient">AI Tools</span>
          </h1>
          <p className="text-gray-400 text-base">Find the perfect AI tool for your needs</p>
        </div>

        {/* Search + Filters */}
        <div className="max-w-3xl mx-auto mb-8 space-y-3">
          {/* Search input */}
          <div className="relative flex items-center bg-white/[0.04] border border-white/[0.09] rounded-2xl px-4 focus-within:border-violet-500/50 focus-within:bg-white/[0.06] transition-all duration-200">
            <SearchIcon className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, description, or tags..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-[15px] py-3.5 px-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1">
              <Filter className="w-4 h-4 text-gray-500 shrink-0" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1 bg-white/[0.04] border-white/[0.09] text-white rounded-xl h-11 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d0e14] border-white/10 text-white rounded-xl">
                  <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className="focus:bg-white/10 focus:text-white">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="h-11 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.09] text-gray-400 hover:text-white text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-500">
            Found <span className="text-violet-400 font-semibold">{filteredTools.length}</span> tools
          </p>
        </div>

        {/* Results */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No tools found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="tool-card group">
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">
                      {tool.category || 'Other'}
                    </span>
                    {tool.source && (
                      <span className="text-[10px] font-mono text-gray-600 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.05]">
                        {tool.source}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-400 text-[13px] leading-relaxed line-clamp-3 flex-1">
                    {tool.description}
                  </p>
                  {tool.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                      {tool.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-gray-500 border border-white/[0.05]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-5 py-3.5 border-t border-white/[0.06] bg-black/20 flex items-center gap-2">
                  <Link to={`/tool/${tool.id}`} className="flex-1">
                    <button className="w-full h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] text-gray-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5">
                      Details <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                  {tool.url && (
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      <button className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 flex items-center justify-center text-white transition-all shadow-lg shadow-violet-900/30">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;