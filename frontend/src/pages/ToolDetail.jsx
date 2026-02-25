import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Tag as TagIcon, Loader2, Globe } from 'lucide-react';
import { toolsAPI } from '../utils/supabase';

const ToolDetail = () => {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    toolsAPI.getById(id)
      .then(setTool)
      .catch(() => setError('Tool not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">{error || 'Tool not found'}</p>
        <Link to="/">
          <button className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.09] text-gray-300 hover:text-white text-sm transition-all">
            Back to Home
          </button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(tool.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-violet-600/7 blur-[90px]" />
      </div>

      <div className="relative z-10 pt-20 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Main card */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-white/[0.07]">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">
                {tool.category || 'Other'}
              </span>
              {tool.source && (
                <span className="text-xs font-mono text-gray-500 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  via {tool.source}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {tool.name}
            </h1>
            <p className="text-gray-300 leading-relaxed text-[15px]">
              {tool.description}
            </p>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Tags */}
            {tool.tags?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-medium text-white">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, i) => (
                    <span key={i} className="text-xs px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Added date */}
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <Calendar className="w-4 h-4 text-gray-600" />
              Added {formattedDate}
            </div>

            {/* CTA */}
            {tool.url && (
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="block">
                <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-violet-900/25 hover:shadow-violet-900/40 hover:scale-[1.01]">
                  <Globe className="w-4 h-4" />
                  Visit Website
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ToolDetail;