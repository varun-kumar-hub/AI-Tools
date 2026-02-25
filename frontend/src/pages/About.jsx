import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Globe, Zap, Shield, Github, ExternalLink, ArrowLeft } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Multi-Source Scraping',
    description: 'Automatically aggregates AI tools from Product Hunt, Hacker News, and Dev.to so you never miss a launch.',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Hourly Updates',
    description: 'GitHub Actions runs our scrapers every hour, keeping the database fresh with the latest AI innovations.',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Sparkles,
    title: 'Smart Categorization',
    description: 'Tools are automatically categorized and tagged for effortless discovery across any use case.',
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: Shield,
    title: 'Quality Curated',
    description: 'Deduplication and admin controls ensure every tool in the database is unique and high quality.',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
];

const sources = [
  { name: 'Product Hunt', color: 'text-orange-400', desc: 'Newly launched products' },
  { name: 'Hacker News', color: 'text-amber-400', desc: 'Show HN AI tools' },
  { name: 'Dev.to', color: 'text-teal-400', desc: 'Developer AI tools' },
];

const About = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-[90px] animate-pulse-slow" />
        <div className="absolute bottom-[-5%] right-[0%] w-[300px] h-[300px] rounded-full bg-blue-600/5 blur-[80px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10 pt-20 pb-28 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

        {/* Back nav */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6">
            <Sparkles className="w-3 h-3" />
            Our Mission
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5">
            About <span className="text-gradient">AI Tools Hub</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Your centralized platform for discovering the latest AI tools from across the internet —
            scraped, categorized, and always up to date.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card p-6 rounded-2xl group">
                <div className={`w-10 h-10 rounded-xl ${f.color} border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-[15px] mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>

        {/* Sources */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-white text-[15px] mb-4">Data Sources</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            {sources.map((s, i) => (
              <div key={i} className="flex-1 flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-2 h-2 rounded-full bg-current shrink-0" style={{ color: 'inherit' }} />
                <div>
                  <p className={`font-semibold text-sm ${s.color}`}>{s.name}</p>
                  <p className="text-gray-500 text-xs">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission CTA */}
        <div className="relative overflow-hidden rounded-2xl p-8 text-center bg-gradient-to-br from-violet-900/20 to-blue-900/15 border border-violet-500/15">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-blue-500/5" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-3">Why We Built This</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl mx-auto">
              We believe in democratizing access to AI tools. Our mission is to help developers, creators,
              and businesses discover the perfect tools by providing a centralized, always-fresh directory
              of the latest AI innovations — fully automated.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;