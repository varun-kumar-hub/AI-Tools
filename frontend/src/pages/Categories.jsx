import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ToolsContext } from '../App';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';

const Categories = () => {
  const { categories, loading } = useContext(ToolsContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  const getIcon = (categoryName) => {
    // Map category names to icons
    const iconMap = {
      'Code & Development': 'Code',
      'Data Analysis': 'BarChart',
      'Productivity': 'Zap',
      'Video & Audio': 'Video',
      'Research & Education': 'BookOpen',
      'Design & Creative': 'Palette',
      'Marketing & Sales': 'Megaphone',
      'Content Writing': 'PenTool',
      'Customer Service': 'MessageCircle',
      'Other': 'Grid'
    };

    const iconName = iconMap[categoryName] || 'Grid';
    const Icon = Icons[iconName] || Icons.Grid;
    return <Icon className="w-12 h-12" />;
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 animate-fade-in-up">
        <Badge className="mb-6 px-4 py-1.5 rounded-full bg-white/5 border-white/10 text-blue-300 hover:bg-white/10 transition-colors">
          <Sparkles className="w-3 h-3 mr-2 text-blue-400" />
          Explore by Category
        </Badge>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Browse <span className="text-gradient">AI Tools</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Explore our curated collection of AI tools organized by specific use cases and industries</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.id} to={`/category/${category.id}`}>
            <div className="glass-card rounded-2xl p-8 text-center group h-full hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-white/5 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-300">
                {getIcon(category.name)}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {category.name}
              </h3>
              <Badge variant="outline" className="bg-white/5 text-gray-300 border-white/10 group-hover:border-purple-500/30 text-lg px-4 py-1 rounded-full">
                {category.count} tools
              </Badge>
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Icons.Layers className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-500 text-lg">No categories found.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;