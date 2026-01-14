import React, { useState, useContext, useEffect } from 'react';
import { Plus, RefreshCw, Trash2, Edit } from 'lucide-react';
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
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gradient">Admin Dashboard</span>
          </h1>
          <p className="text-gray-400">Manage AI tools and run scraping tasks</p>
          {stats?.next_scrape_time && (
            <div className="inline-flex items-center mt-3 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              Next scrape: {new Date(stats.next_scrape_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Controls Group */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start">
            <div className="flex items-center px-3 gap-2 border-r border-white/10">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Home</span>
              <Input
                type="number"
                min="1"
                max="100"
                value={displayLimit}
                onChange={(e) => setDisplayLimit(parseInt(e.target.value) || 15)}
                className="w-12 h-6 text-center bg-transparent border-none focus-visible:ring-0 p-0 text-white"
              />
            </div>
            <div className="flex items-center px-3 gap-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Scrape</span>
              <Input
                type="number"
                min="1"
                max="50"
                value={scrapeLimit}
                onChange={(e) => setScrapeLimit(parseInt(e.target.value) || 15)}
                className="w-12 h-6 text-center bg-transparent border-none focus-visible:ring-0 p-0 text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSaveSettings}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-white/10"
              title="Save Limit Settings"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleScrape}
              disabled={isScrapingActive}
              className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 backdrop-blur-md"
            >
              <RefreshCw className={`mr-2 w-4 h-4 ${isScrapingActive ? 'animate-spin' : ''}`} />
              {isScrapingActive ? 'Scraping...' : 'Run Scraper'}
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-none shadow-lg shadow-purple-900/20">
                  <Plus className="mr-2 w-4 h-4" />
                  Add Tool
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-white/10 text-white sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Tool</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Manually add a new AI tool to the database
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Tool Name"
                    value={newTool.name}
                    onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50"
                  />
                  <Textarea
                    placeholder="Description"
                    value={newTool.description}
                    onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                    rows={4}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50"
                  />
                  <Select value={newTool.category} onValueChange={(value) => setNewTool({ ...newTool, category: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10 text-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name} className="focus:bg-white/10 focus:text-white">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Tags (comma-separated)"
                    value={newTool.tags}
                    onChange={(e) => setNewTool({ ...newTool, tags: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50"
                  />
                  <Input
                    placeholder="Website URL"
                    value={newTool.url}
                    onChange={(e) => setNewTool({ ...newTool, url: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-purple-500/50"
                  />
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-white/10 text-gray-400 hover:text-white">Cancel</Button>
                  <Button onClick={handleAddTool} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">Add Tool</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Tools Management Section */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={showDeleted ? "ghost" : "default"}
          onClick={() => setShowDeleted(false)}
          className={!showDeleted ? "bg-white/10 text-white hover:bg-white/20" : "text-gray-400 hover:text-white hover:bg-transparent"}
        >
          Active Tools
        </Button>
        <Button
          variant={showDeleted ? "default" : "ghost"}
          onClick={() => { setShowDeleted(true); fetchDeletedTools(); }}
          className={showDeleted ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : "text-gray-400 hover:text-red-400 hover:bg-transparent"}
        >
          Trash / Deleted
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showDeleted ? (
          deletedTools.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <Trash2 className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-500">Trash is empty</p>
            </div>
          ) : (
            deletedTools.map((tool) => (
              <div key={tool.id} className="glass-card rounded-xl p-6 opacity-60 hover:opacity-100 transition-opacity border-red-500/20">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-300 line-through decoration-red-500/50">{tool.name}</h3>
                  <Button
                    size="sm"
                    onClick={() => handleRestoreTool(tool.id)}
                    className="h-8 bg-green-500/10 text-green-400 hover:bg-green-500/20 border-none"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Restore
                  </Button>
                </div>
              </div>
            ))
          )
        ) : (
          tools.slice(0, displayLimit).map((tool) => (
            <div key={tool.id} className="glass-card rounded-xl p-6 group">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/20">
                  {tool.category}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                    onClick={() => handleDeleteTool(tool.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{tool.description}</p>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(tool.created_at || Date.now()).toLocaleDateString()}</span>
                <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400">{tool.source}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-center py-12 mt-8 border-t border-white/5">
        <p className="text-gray-500">
          Head over to the <a href="/" className="text-purple-400 hover:text-purple-300 transition-colors">Home Page</a> to view all tools.
        </p>
      </div>

      <AlertDialog open={!!toolToDelete} onOpenChange={() => setToolToDelete(null)}>
        <AlertDialogContent className="bg-black/90 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action will move the tool to the trash. You can restore it later from the "Trash / Deleted" section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
            <Button onClick={confirmDelete} className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!toolToRestore} onOpenChange={() => setToolToRestore(null)}>
        <AlertDialogContent className="bg-black/90 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this tool?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action will move the tool back to the "Active Tools" list and make it visible on the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
            <Button onClick={confirmRestore} className="bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/30">
              Restore
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;