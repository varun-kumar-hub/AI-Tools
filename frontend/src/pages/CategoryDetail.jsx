import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { ToolsContext } from '../App';
import { toolsAPI } from '../utils/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const CategoryDetail = () => {
  const { id } = useParams();
  const { categories, loading: contextLoading } = useContext(ToolsContext);
  const [categoryName, setCategoryName] = useState('');
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryTools = async () => {
      // Find category name from ID using the context
      const cat = categories.find(c => c.id === id);

      if (cat) {
        setCategoryName(cat.name);
        try {
          setLoading(true);
          // Fetch tools filtered by this category
          const data = await toolsAPI.getAll({ category: cat.name });
          setTools(data);
        } catch (error) {
          console.error("Error fetching category tools:", error);
        } finally {
          setLoading(false);
        }
      } else if (!contextLoading && categories.length > 0) {
        // ID not found in categories list
        setLoading(false);
      }
    };

    if (!contextLoading) {
      fetchCategoryTools();
    }
  }, [id, categories, contextLoading]);

  if (loading || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Category not found</p>
          <Link to="/categories">
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">Back to All Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Link to="/categories">
        <Button variant="outline" className="mb-6 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-purple-500/30 rounded-xl">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Categories
        </Button>
      </Link>

      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-gradient">{categoryName}</span>
        </h1>
        <p className="text-xl text-gray-400">{tools.length} tools available</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
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

      {tools.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
            <Loader2 className="w-10 h-10 text-gray-600" />
          </div>
          <p className="text-gray-400 text-xl">No tools available in this category yet.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;