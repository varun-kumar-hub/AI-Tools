import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { ToolsContext } from '../App';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Search = () => {
  const { tools, categories, loading } = useContext(ToolsContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredTools, setFilteredTools] = useState([]);

  useEffect(() => {
    setFilteredTools(tools);
  }, [tools]);

  useEffect(() => {
    let results = tools;

    // Filter by search query
    if (searchQuery) {
      results = results.filter(tool =>
        tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(tool => tool.category === selectedCategory);
    }

    setFilteredTools(results);
  }, [searchQuery, selectedCategory, tools]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Search <span className="text-gradient">AI Tools</span>
        </h1>
        <p className="text-xl text-gray-400">Find the perfect AI tool for your needs</p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 space-y-4 max-w-4xl mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name, description, or tags..."
            className="pl-12 pr-4 py-6 text-lg bg-white/5 border-white/10 text-white placeholder-gray-500 rounded-2xl focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="text-gray-400 w-5 h-5 shrink-0" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-64 bg-white/5 border-white/10 text-white rounded-xl py-6 text-base">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10 text-white">
                <SelectItem value="all" className="focus:bg-white/10 focus:text-white">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name} className="focus:bg-white/10 focus:text-white">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || selectedCategory !== 'all') && (
            <Button
              variant="outline"
              className="w-full sm:w-auto border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl py-6"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 max-w-4xl mx-auto">
        <p className="text-lg text-gray-400">
          Found <span className="font-bold text-purple-400">{filteredTools.length}</span> tools
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div key={tool.id} className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full border border-white/5 hover:border-purple-500/30 transition-all duration-300">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <Badge className="bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/20 rounded-lg px-3 py-1">
                  {tool.category}
                </Badge>
                {tool.source && (
                  <Badge variant="outline" className="text-xs text-gray-500 border-white/10 rounded-lg">
                    {tool.source}
                  </Badge>
                )}
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                {tool.name}
              </h3>

              <p className="text-gray-400 leading-relaxed line-clamp-3 mb-4 flex-1">
                {tool.description}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {tool.tags?.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-white/5 text-gray-400 hover:bg-white/10 border-white/5 rounded-md">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex gap-3">
              <Link to={`/tool/${tool.id}`} className="flex-1">
                <Button variant="outline" className="w-full border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-purple-500/30 rounded-xl group/btn">
                  Details
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
              {tool.url && (
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-purple-900/20">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <SearchIcon className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 text-xl font-medium">No tools found matching your criteria.</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Search;