import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Trash2, Edit, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { toast } from 'sonner';
import { ToolsContext } from '../App';
import { toolsAPI } from '../utils/supabase';

import config from '../config';

const BACKEND_URL = config.BACKEND_URL;

// GitHub Actions cron: '0 0,2,4,6,8,10,12,14,16,18,20,22 * * *' (UTC)
const SCRAPE_HOURS_UTC = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

const getNextScrapeTime = () => {
  const now = new Date();
  const nowUTC = new Date(now.getTime()); // already UTC from Date
  const currentUTCHour = nowUTC.getUTCHours();
  const currentUTCMinute = nowUTC.getUTCMinutes();

  // Find next scheduled hour in UTC
  let nextHour = SCRAPE_HOURS_UTC.find(h => h > currentUTCHour || (h === currentUTCHour && currentUTCMinute < 1));
  let dayOffset = 0;
  if (nextHour === undefined) {
    nextHour = SCRAPE_HOURS_UTC[0]; // wrap to midnight
    dayOffset = 1;
  }

  const next = new Date(nowUTC);
  next.setUTCDate(next.getUTCDate() + dayOffset);
  next.setUTCHours(nextHour, 0, 0, 0);
  return next;
};

const formatCountdown = (ms) => {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
};

const NextScrapeWidget = () => {
  const [countdown, setCountdown] = useState('');
  const [nextTime, setNextTime] = useState(null);

  const tick = useCallback(() => {
    const next = getNextScrapeTime();
    setNextTime(next);
    const diff = next.getTime() - Date.now();
    setCountdown(formatCountdown(diff));
  }, []);

  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  if (!nextTime) return null;

  const localTime = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const localDate = nextTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 mb-6">
      {/* Icon + label */}
      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
        <Clock className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-emerald-500 font-semibold uppercase tracking-wide mb-1">Next Auto-Scrape</p>
        <div className="flex flex-wrap items-baseline gap-3">
          {/* Countdown */}
          <span className="text-xl font-mono font-bold text-white tracking-tight">{countdown}</span>
          {/* Local time */}
          <span className="text-sm text-gray-400">
            at <span className="text-gray-300 font-medium">{localTime}</span>
            <span className="text-gray-600 mx-1">·</span>
            <span className="text-gray-500">{localDate}</span>
          </span>
        </div>
        <p className="text-[11px] text-gray-600 mt-1">GitHub Actions runs every 2 hours (UTC schedule)</p>
      </div>
      {/* Schedule pills */}
      <div className="hidden md:flex flex-wrap gap-1 max-w-[220px] justify-end shrink-0">
        {SCRAPE_HOURS_UTC.map(h => {
          const label = `${String(h).padStart(2, '0')}:00`;
          const isNext = new Date().getUTCHours() === h || (nextTime && nextTime.getUTCHours() === h);
          return (
            <span key={h} className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${nextTime && nextTime.getUTCHours() === h
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-white/[0.04] text-gray-600 border border-white/[0.05]'
              }`}>{label}</span>
          );
        })}
        <span className="text-[9px] text-gray-700 w-full text-right mt-0.5">UTC times</span>
      </div>
    </div>
  );
};

const Admin = () => {
  const { tools, categories, refresh, stats } = useContext(ToolsContext);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapeLimit, setScrapeLimit] = useState(() => parseInt(localStorage.getItem('admin_scrape_limit')) || 15);
  const [displayLimit, setDisplayLimit] = useState(() => parseInt(localStorage.getItem('home_display_limit')) || 15);
  const [deletedTools, setDeletedTools] = useState([]);
  const [showDeleted, setShowDeleted] = useState(() => localStorage.getItem('admin_show_deleted') === 'true');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    url: ''
  });

  // Fetch deleted tools when toggled
  const fetchDeletedTools = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/tools/deleted/all`);
      if (res.ok) {
        const data = await res.json();
        setDeletedTools(data);
      }
    } catch (error) {
      console.error("Failed to fetch deleted tools:", error);
      toast.error("Error", { description: "Failed to fetch deleted tools." });
    }
  };

  useEffect(() => {
    localStorage.setItem('admin_show_deleted', showDeleted);
    if (showDeleted) {
      fetchDeletedTools();
    }
  }, [showDeleted]);


  const handleSaveSettings = () => {
    localStorage.setItem('admin_scrape_limit', scrapeLimit);
    localStorage.setItem('home_display_limit', displayLimit);
    toast.success("Settings Saved", {
      description: `Scrape Limit: ${scrapeLimit}, Display Limit: ${displayLimit}`
    });
  };

  const handleScrape = async () => {
    setIsScrapingActive(true);
    toast.info("Scraping started", {
      description: `Fetching ${scrapeLimit} new AI tools from Product Hunt, Hacker News, and Dev.to...`,
    });

    try {
      const res = await fetch(`${BACKEND_URL}/scraper/run?limit=${scrapeLimit}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error("Failed to start scraper");

      toast.success("Scraping task started", {
        description: "Tools will appear as they are found. Refreshing list...",
      });

      // Poll or just refresh after a delay
      setTimeout(() => {
        refresh();
        setIsScrapingActive(false);
      }, 5000);
    } catch (error) {
      console.error(error);
      toast.error("Scraping failed", { description: error.message });
      setIsScrapingActive(false);
    }
  };

  const handleAddTool = async () => {
    if (!newTool.name || !newTool.description || !newTool.category) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      await toolsAPI.create({
        ...newTool,
        tags: newTool.tags.split(',').map(t => t.trim()).filter(Boolean),
        created_at: new Date().toISOString()
      });

      toast.success("Success", {
        description: "Tool added successfully!",
      });

      setIsDialogOpen(false);
      setNewTool({ name: '', description: '', category: '', tags: '', url: '' });
      refresh();
    } catch (error) {
      toast.error("Error", { description: error.message });
    }
  };

  const [toolToDelete, setToolToDelete] = useState(null);

  const confirmDelete = async (e) => {
    if (e) e.preventDefault();
    if (!toolToDelete) return;

    try {
      const res = await fetch(`${BACKEND_URL}/tools/${toolToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete tool");

      toast.success("Success", { description: "Tool moved to trash" });
      refresh();
      if (showDeleted) fetchDeletedTools();

      // Close dialog only after success
      setToolToDelete(null);
    } catch (error) {
      toast.error("Error", { description: error.message });
      // Close dialog on error too, or keep open? Let's close.
      setToolToDelete(null);
    }
  };

  const handleDeleteTool = (id) => {
    setToolToDelete(id);
  };

  const [toolToRestore, setToolToRestore] = useState(null);

  const confirmRestore = async () => {
    if (!toolToRestore) return;
    try {
      const res = await fetch(`${BACKEND_URL}/tools/${toolToRestore}/restore`, { method: 'POST' });
      if (!res.ok) throw new Error("Failed to restore");

      toast.success("Success", { description: "Tool restored successfully" });
      refresh();
      fetchDeletedTools();
      setToolToRestore(null);
    } catch (error) {
      toast.error("Error", { description: error.message });
      setToolToRestore(null);
    }
  };

  const handleRestoreTool = (id) => {
    setToolToRestore(id);
  };

  return (
    <div className="pt-24 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6 animate-fade-in-up">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            <span className="text-gradient">Admin Dashboard</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage AI tools and run scraping tasks</p>
        </div>

        <div className="flex flex-col w-full md:w-auto gap-4">
          {/* Limits Controls */}
          <div className="flex bg-white/[0.03] p-1.5 rounded-xl border border-white/[0.08] w-full sm:w-auto">
            <div className="flex items-center justify-center flex-1 px-3 gap-2 border-r border-white/10">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Home</span>
              <Input
                type="number"
                min="1"
                max="100"
                value={displayLimit}
                onChange={(e) => setDisplayLimit(parseInt(e.target.value) || 15)}
                className="w-12 h-7 text-center bg-black/40 border border-white/10 rounded-lg focus-visible:ring-1 focus-visible:ring-purple-500/50 p-0 text-white text-xs font-medium"
              />
            </div>
            <div className="flex items-center justify-center flex-1 px-3 gap-2">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Scrape</span>
              <Input
                type="number"
                min="1"
                max="50"
                value={scrapeLimit}
                onChange={(e) => setScrapeLimit(parseInt(e.target.value) || 15)}
                className="w-12 h-7 text-center bg-black/40 border border-white/10 rounded-lg focus-visible:ring-1 focus-visible:ring-purple-500/50 p-0 text-white text-xs font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 lg:flex gap-2.5 w-full md:w-auto">
            <Button
              onClick={handleSaveSettings}
              variant="outline"
              className="col-span-1 border-white/10 bg-white/[0.02] text-gray-300 hover:text-white hover:bg-white/[0.06] rounded-xl font-medium"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="text-xs sm:text-sm">Save</span>
            </Button>

            <Button
              onClick={handleScrape}
              disabled={isScrapingActive}
              className="col-span-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-medium"
            >
              <RefreshCw className={`mr-2 w-4 h-4 ${isScrapingActive ? 'animate-spin' : ''}`} />
              <span className="text-xs sm:text-sm">{isScrapingActive ? 'Scraping...' : 'Scrape'}</span>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="col-span-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-none shadow-lg shadow-purple-900/20 rounded-xl font-medium">
                  <Plus className="mr-2 w-4 h-4" />
                  Add New Tool
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0d0e14] border-white/10 text-white sm:max-w-[500px] rounded-2xl w-[90vw] max-w-[95vw]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Add New Tool</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Manually add a new AI tool to the database
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Tool Name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 rounded-xl px-4 py-3 h-auto"
                  />
                  <Textarea
                    placeholder="Description"
                    value={newTool.description}
                    onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                    rows={4}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 rounded-xl p-4 resize-none"
                  />
                  <Select value={newTool.category} onValueChange={(value) => setNewTool({ ...newTool, category: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl px-4 py-3 h-auto">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d0e14] border-white/10 text-white rounded-xl">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name} className="focus:bg-white/10 focus:text-white cursor-pointer rounded-lg m-1">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={newTool.tags}
                    onChange={(e) => setNewTool({ ...newTool, tags: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 rounded-xl px-4 py-3 h-auto"
                  />
                  <Input
                    placeholder="Website URL"
                    value={newTool.url}
                    onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50 rounded-xl px-4 py-3 h-auto"
                  />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10 text-gray-400 hover:text-white rounded-xl">Cancel</Button>
                  <Button onClick={handleAddTool} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl">Add Tool</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Next Scrape Widget */}
      <NextScrapeWidget />

      {/* Tools Management Section */}
      <div className="flex p-1.5 bg-black/40 border border-white/10 rounded-2xl mb-8 w-full sm:w-fit">
        <Button
          variant="ghost"
          onClick={() => setShowDeleted(false)}
          className={`flex-1 sm:flex-none rounded-xl text-sm font-medium transition-colors ${!showDeleted ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
        >
          Active Tools
        </Button>
        <Button
          variant="ghost"
          onClick={() => { setShowDeleted(true); fetchDeletedTools(); }}
          className={`flex-1 sm:flex-none rounded-xl text-sm font-medium transition-colors ${showDeleted ? "bg-red-500/20 text-red-400" : "text-gray-400 hover:text-red-400 hover:bg-white/5"}`}
        >
          Trash / Deleted
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {showDeleted ? (
          deletedTools.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-3xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.05] mb-4">
                <Trash2 className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">Trash is empty</p>
            </div>
          ) : (
            deletedTools.map((tool) => (
              <div key={tool.id} className="bg-[#0d0e14] border border-red-500/20 rounded-2xl p-5 flex flex-col h-full opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <h3 className="text-[16px] font-bold text-gray-300 line-through decoration-red-500/50 leading-snug line-clamp-2">{tool.name}</h3>
                </div>
                <p className="text-gray-500 text-[13px] line-clamp-2 mb-4">{tool.description}</p>
                <div className="mt-auto pt-4 border-t border-red-500/10 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleRestoreTool(tool.id)}
                    className="bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 border-none rounded-xl text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Restore Tool
                  </Button>
                </div>
              </div>
            ))
          )
        ) : (
          tools.slice(0, displayLimit).map((tool) => (
            <div key={tool.id} className="bg-[#0d0e14] border border-white/[0.06] hover:border-violet-500/30 rounded-2xl p-5 group flex flex-col h-full transition-colors shadow-lg shadow-black/20">
              <div className="flex justify-between items-start mb-4 gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 text-purple-300 shrink-0">
                  {tool.category || 'Other'}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg shrink-0">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg shrink-0"
                    onClick={() => handleDeleteTool(tool.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <h3 className="text-[16px] font-bold text-white mb-2 leading-tight group-hover:text-violet-400 transition-colors">{tool.name}</h3>
              <p className="text-gray-400 text-[13px] leading-relaxed line-clamp-2 flex-1">{tool.description}</p>

              <div className="mt-5 pt-4 border-t border-white/[0.06] flex justify-between items-center">
                <p className="text-[10px] text-gray-500 font-mono tracking-wider">
                  {new Date(tool.created_at || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <span className="bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05] text-gray-400 text-[10px] uppercase font-mono tracking-wider">
                  {tool.source || 'Manual'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-center py-12 mt-8 border-t border-white/[0.05]">
        <p className="text-gray-500 text-sm">
          Head over to the <Link to="/" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Home Page</Link> to view all tools.
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!toolToDelete} onOpenChange={() => setToolToDelete(null)}>
        <AlertDialogContent className="bg-[#0d0e14] border border-white/10 text-white rounded-2xl max-w-[90vw] sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action will move the tool to the trash. You can restore it later from the "Trash / Deleted" section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl">Cancel</AlertDialogCancel>
            <Button onClick={confirmDelete} className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 rounded-xl">
              Delete Tool
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!toolToRestore} onOpenChange={() => setToolToRestore(null)}>
        <AlertDialogContent className="bg-[#0d0e14] border border-white/10 text-white rounded-2xl max-w-[90vw] sm:max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Restore this tool?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action will move the tool back to the "Active Tools" list and make it visible on the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl">Cancel</AlertDialogCancel>
            <Button onClick={confirmRestore} className="bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30 rounded-xl">
              Restore Tool
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;