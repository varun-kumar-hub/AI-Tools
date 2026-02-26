import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ToolsContext } from '../App';
import { Sparkles, Loader2 } from 'lucide-react';

const iconMap = {
  'Code & Development': 'Code2',
  'Data Analysis': 'BarChart3',
  'Data & Analytics': 'BarChart3',
  'AI & Machine Learning': 'Cpu',
  'Productivity': 'Zap',
  'Productivity & Automation': 'Zap',
  'Video & Audio': 'Video',
  'Research & Education': 'BookOpen',
  'Design & Creative': 'Palette',
  'Marketing & Sales': 'Megaphone',
  'Content Writing': 'PenTool',
  'Customer Service': 'MessageCircle',
  'Customer Service & Chat': 'MessageCircle',
  'Other': 'Grid3X3',
};

const categoryGradients = {
  'Code & Development': 'from-blue-500/15 to-cyan-500/10 border-blue-500/15 group-hover:border-blue-500/30',
  'Data Analysis': 'from-emerald-500/15 to-teal-500/10 border-emerald-500/15 group-hover:border-emerald-500/30',
  'Data & Analytics': 'from-emerald-500/15 to-teal-500/10 border-emerald-500/15 group-hover:border-emerald-500/30',
  'AI & Machine Learning': 'from-indigo-500/15 to-violet-500/10 border-indigo-500/15 group-hover:border-indigo-500/30',
  'Productivity': 'from-amber-500/15 to-orange-500/10 border-amber-500/15 group-hover:border-amber-500/30',
  'Productivity & Automation': 'from-amber-500/15 to-orange-500/10 border-amber-500/15 group-hover:border-amber-500/30',
  'Video & Audio': 'from-purple-500/15 to-fuchsia-500/10 border-purple-500/15 group-hover:border-purple-500/30',
  'Research & Education': 'from-indigo-500/15 to-blue-500/10 border-indigo-500/15 group-hover:border-indigo-500/30',
  'Design & Creative': 'from-pink-500/15 to-rose-500/10 border-pink-500/15 group-hover:border-pink-500/30',
  'Marketing & Sales': 'from-red-500/15 to-orange-500/10 border-red-500/15 group-hover:border-red-500/30',
  'Content Writing': 'from-violet-500/15 to-purple-500/10 border-violet-500/15 group-hover:border-violet-500/30',
  'Customer Service': 'from-teal-500/15 to-cyan-500/10 border-teal-500/15 group-hover:border-teal-500/30',
  'Customer Service & Chat': 'from-teal-500/15 to-cyan-500/10 border-teal-500/15 group-hover:border-teal-500/30',
  'Other': 'from-gray-500/15 to-slate-500/10 border-gray-500/15 group-hover:border-gray-500/30',
};

const iconColors = {
  'Code & Development': 'text-blue-400 bg-blue-500/15',
  'Data Analysis': 'text-emerald-400 bg-emerald-500/15',
  'Data & Analytics': 'text-emerald-400 bg-emerald-500/15',
  'AI & Machine Learning': 'text-indigo-400 bg-indigo-500/15',
  'Productivity': 'text-amber-400 bg-amber-500/15',
  'Productivity & Automation': 'text-amber-400 bg-amber-500/15',
  'Video & Audio': 'text-purple-400 bg-purple-500/15',
  'Research & Education': 'text-indigo-400 bg-indigo-500/15',
  'Design & Creative': 'text-pink-400 bg-pink-500/15',
  'Marketing & Sales': 'text-red-400 bg-red-500/15',
  'Content Writing': 'text-violet-400 bg-violet-500/15',
  'Customer Service': 'text-teal-400 bg-teal-500/15',
  'Customer Service & Chat': 'text-teal-400 bg-teal-500/15',
  'Other': 'text-gray-400 bg-gray-500/15',
};

const Categories = () => {
  const { categories, loading } = useContext(ToolsContext);

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
        <div className="absolute top-[-10%] right-[20%] w-[400px] h-[400px] rounded-full bg-blue-600/6 blur-[90px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 pt-24 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-5">
            <Sparkles className="w-3 h-3" />
            Explore by Category
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Browse <span className="text-gradient">AI Tools</span>
          </h1>
          <p className="text-gray-400 text-base max-w-lg mx-auto">
            Explore our curated collection organized by use case and industry
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
              <Icons.Layers className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const iconName = iconMap[category.name] || 'Grid3X3';
              const Icon = Icons[iconName] || Icons.Grid3X3;
              const gradient = categoryGradients[category.name] || categoryGradients['Other'];
              const iconStyle = iconColors[category.name] || iconColors['Other'];

              return (
                <Link key={category.id} to={`/category/${category.id}`}>
                  <div className={`group relative flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 cursor-pointer ${gradient}`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconStyle}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-[15px] leading-snug group-hover:text-violet-200 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-500 text-xs mt-0.5">{category.count} tools</p>
                    </div>

                    {/* Arrow */}
                    <Icons.ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;