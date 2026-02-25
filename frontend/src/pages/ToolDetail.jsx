import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Calendar, Tag as TagIcon,
  Loader2, Globe, Layers, Info, Share2, Copy, Check
} from 'lucide-react';
import { toolsAPI } from '../utils/supabase';

const categoryColors = {
  'Code & Development': 'text-blue-300 bg-blue-500/10 border-blue-500/20',
  'Data Analysis': 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
  'Productivity': 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  'Design & Creative': 'text-pink-300 bg-pink-500/10 border-pink-500/20',
  'Marketing & Sales': 'text-red-300 bg-red-500/10 border-red-500/20',
  'Content Writing': 'text-violet-300 bg-violet-500/10 border-violet-500/20',
  'Video & Audio': 'text-purple-300 bg-purple-500/10 border-purple-500/20',
  'Research & Education': 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',
  'Customer Service': 'text-teal-300 bg-teal-500/10 border-teal-500/20',
  'Other': 'text-gray-300 bg-gray-500/10 border-gray-500/20',
};

const ToolDetail = () => {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    toolsAPI.getById(id)
      .then(setTool)
      .catch(() => setError('Tool not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-2">
          <Info className="w-7 h-7 text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium">Tool not found</p>
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

  const catStyle = categoryColors[tool.category] || categoryColors['Other'];

  // Build a richer description — pad it if short
  const description = tool.description || 'No description available for this tool.';

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-violet-600/7 blur-[90px]" />
      </div>

      <div className="relative z-10 pt-20 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">

        {/* Back nav */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Main card */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in-up">

          {/* Header */}
          <div className="p-6 sm:p-8">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className={`text-xs font-semibold px-3 py-1 rounded-lg border ${catStyle}`}>
                {tool.category || 'Other'}
              </span>
              {tool.source && (
                <span className="text-xs font-mono text-gray-500 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  via {tool.source}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
              {tool.name}
            </h1>

            {/* Description — the main content */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5 mb-2">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-300 uppercase tracking-wide">About this tool</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-[14px] sm:text-[15px] whitespace-pre-wrap line-clamp-5">
                {description}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Details section */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Tags */}
            {tool.tags?.length > 0 && (
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</span>
              </div>
              <p className="text-gray-300 text-sm font-medium">{tool.category || 'Other'}</p>
            </div>

            {/* Source */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Source</span>
              </div>
              <p className="text-gray-300 text-sm font-medium">{tool.source || 'Manual'}</p>
            </div>

            {/* Date added */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Added</span>
              </div>
              <p className="text-gray-300 text-sm">{formattedDate}</p>
            </div>

          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Action buttons */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-3">
            {tool.url && (
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-violet-900/25 hover:shadow-violet-900/40 hover:scale-[1.01]">
                  <Globe className="w-4 h-4" />
                  Visit Website
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </button>
              </a>
            )}
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-gray-300 hover:text-white text-sm font-medium transition-all duration-200"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ToolDetail;