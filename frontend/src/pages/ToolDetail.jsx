import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Tag as TagIcon, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toolsAPI } from '../utils/supabase';

const ToolDetail = () => {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        setLoading(true);
        const data = await toolsAPI.getById(id);
        setTool(data);
      } catch (err) {
        console.error("Failed to fetch tool:", err);
        setError("Tool not found");
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-gray-400 mb-6">{error || "Tool not found"}</p>
        <Link to="/">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <Link to="/">
        <Button variant="outline" className="mb-6 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-purple-500/30 rounded-xl">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Home
        </Button>
      </Link>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 animate-fade-in-up">
        <div className="p-8 md:p-10 border-b border-white/10">
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge className="bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/20 text-base px-4 py-1.5 rounded-lg">
              {tool.category}
            </Badge>
            {tool.source && (
              <Badge variant="outline" className="text-base text-gray-400 border-white/10 px-4 py-1.5 rounded-lg">
                {tool.source}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">{tool.name}</h1>
          <p className="text-xl text-gray-300 leading-relaxed font-light">{tool.description}</p>
        </div>

        <div className="p-8 md:p-10 bg-black/20">
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TagIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {tool.tags?.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-white/5 text-gray-300 border-white/5 text-base px-4 py-1.5 rounded-md hover:bg-white/10">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-semibold text-white">Added</h3>
              </div>
              <p className="text-gray-400 text-lg">
                {new Date(tool.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="pt-4">
              {tool.url && (
                <a href={tool.url} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-6 text-lg rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]">
                    Visit Website
                    <ExternalLink className="ml-2 w-5 h-5" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;