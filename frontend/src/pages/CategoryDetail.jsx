import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { ToolsContext } from '../App';
import { toolsAPI } from '../utils/supabase';

const CategoryDetail = () => {
  const { id } = useParams();
  const { categories, loading: contextLoading } = useContext(ToolsContext);
  const [categoryName, setCategoryName] = useState('');
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contextLoading) return;
    const cat = categories.find(c => c.id === id);
    if (!cat) { setLoading(false); return; }

    setCategoryName(cat.name);
    toolsAPI.getAll({ category: cat.name })
      .then(setTools)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, categories, contextLoading]);

  if (loading || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">Category not found</p>
        <Link to="/categories">
          <button className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] text-gray-300 hover:text-white text-sm transition-all">
            Back to Categories
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[10%] w-[350px] h-[350px] rounded-full bg-violet-600/6 blur-[90px]" />
      </div>

      <div className="relative z-10 pt-20 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Back */}
        <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          All Categories
        </Link>

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            <span className="text-gradient">{categoryName}</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {tools.length} tool{tools.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Tools grid */}
        {tools.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No tools in this category yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <div key={tool.id} className="tool-card group">
                <div className="p-5 flex-1 flex flex-col gap-3">
                  {tool.source && (
                    <span className="self-start text-[10px] font-mono text-gray-600 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.05]">
                      {tool.source}
                    </span>
                  )}
                  <h3 className="text-[15px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-400 text-[13px] leading-relaxed line-clamp-3 flex-1">
                    {tool.description}
                  </p>
                  {tool.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
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

export default CategoryDetail;