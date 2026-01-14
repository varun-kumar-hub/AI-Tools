import React from 'react';
import { Sparkles, Globe, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const About = () => {
  const features = [
    {
      icon: Globe,
      title: 'Multi-Source Scraping',
      description: 'We automatically scrape and aggregate AI tools from Product Hunt, Hacker News, and Dev.to to keep you updated.'
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Get instant access to newly released AI tools as soon as they are discovered and verified.'
    },
    {
      icon: Sparkles,
      title: 'Smart Categorization',
      description: 'Tools are automatically categorized and tagged for easy discovery and exploration.'
    },
    {
      icon: Shield,
      title: 'Quality Curated',
      description: 'Every tool is reviewed and verified before being added to our database.'
    }
  ];

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 animate-fade-in-up">
        <Badge className="mb-6 px-4 py-1.5 rounded-full bg-white/5 border-white/10 text-purple-300 hover:bg-white/10 transition-colors">
          <Sparkles className="w-3 h-3 mr-2 text-purple-400" />
          Our Mission
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          About <span className="text-gradient">AI Tools Hub</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Your centralized platform for discovering the latest AI tools from across the internet.
          We scrape, categorize, and present the newest AI innovations so you don't have to search everywhere.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="glass-card p-8 rounded-2xl hover:bg-white/10 border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-white/5 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-300">
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-lg">{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/10 to-blue-900/10 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Why We Built This</h2>
        <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
          We believe in democratizing access to AI tools. Our mission is to help developers, creators,
          and businesses discover the perfect AI tools for their needs by providing a centralized,
          up-to-date directory that's always fresh with the latest innovations.
        </p>
      </div>
    </div>
  );
};

export default About;