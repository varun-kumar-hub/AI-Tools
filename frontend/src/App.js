import React, { createContext, useEffect, useState, useCallback } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Search from "./pages/Search";
import About from "./pages/About";
import ToolDetail from "./pages/ToolDetail";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import UpdatePassword from "./pages/UpdatePassword";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { toolsAPI } from "./utils/supabase";
import PullToRefresh from "./components/PullToRefresh";
import { useBackButton } from "./hooks/useBackButton";

export const ToolsContext = createContext(null);

// ── Exit Confirmation Dialog ──────────────────────────────────────
const ExitDialog = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Sheet */}
      <div className="relative w-full sm:max-w-sm bg-[#0d0e14] border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/50 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-[15px]">Exit App?</h2>
            <p className="text-gray-500 text-xs mt-0.5">Are you sure you want to leave?</p>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-gray-300 hover:text-white text-sm font-medium transition-all"
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-lg shadow-red-900/30"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Protected Admin Route ─────────────────────────────────────────
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

// ── Back Button handler — lives inside Router so hooks work ───────
const BackButtonHandler = ({ onExitRequest }) => {
  useBackButton(onExitRequest);
  return null;
};

// ── Main App Content ──────────────────────────────────────────────
function AppContent() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [toolsData, categoriesData, statsData] = await Promise.all([
        toolsAPI.getAll(),
        toolsAPI.getCategories(),
        toolsAPI.getStats(),
      ]);
      setTools(toolsData || []);
      setCategories(categoriesData || []);
      setStats(statsData || null);
    } catch (err) {
      console.error("Failed to load data from Supabase:", err);
      setError("Could not load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleExitRequest = useCallback(() => setShowExitDialog(true), []);

  const handleExitConfirm = useCallback(async () => {
    setShowExitDialog(false);
    try {
      const { App: CapApp } = await import('@capacitor/app');
      await CapApp.exitApp();
    } catch {
      // On web, just go back to home
      window.history.go(-(window.history.length - 1));
    }
  }, []);

  const contextValue = { tools, categories, stats, loading, error, refresh: loadData };

  return (
    <ToolsContext.Provider value={contextValue}>
      <div className="min-h-screen inset-0 bg-background text-foreground relative overflow-hidden">
        {/* Subtle Dark Background with Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#070709]">
          {/* Subtle glowing orbs in corners for dark depth */}
          <div className="absolute top-[-25%] left-[-15%] w-[80%] h-[80%] rounded-full bg-violet-600/[0.04] blur-[120px] mix-blend-screen" />
          <div className="absolute bottom-[-25%] right-[-15%] w-[80%] h-[80%] rounded-full bg-blue-600/[0.04] blur-[120px] mix-blend-screen" />

          {/* Extremely subtle dust/stars texture */}
          <div className="absolute top-[20%] left-[15%] w-1 h-1 bg-white/[0.08] rounded-full blur-[1px] animate-pulse-slow" />
          <div className="absolute top-[60%] right-[25%] w-1.5 h-1.5 bg-violet-400/[0.08] rounded-full blur-[2px] animate-pulse-slow animation-delay-2000" />
          <div className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-blue-400/[0.08] rounded-full blur-[1px] animate-pulse-slow animation-delay-4000" />
        </div>

        <div className="relative z-10">
          {/* Back button handler — must be inside Router */}
          <BackButtonHandler onExitRequest={handleExitRequest} />

          <Navbar />
          <PullToRefresh onRefresh={loadData}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:id" element={<CategoryDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/about" element={<About />} />
              <Route path="/tool/:id" element={<ToolDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <Admin />
                  </ProtectedAdminRoute>
                }
              />
            </Routes>
          </PullToRefresh>

          {/* Global Footer Quote */}
          <div className="py-6 text-center">
            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">
              "AI is a tool to amplify human ingenuity." – Fei-Fei Li
            </p>
          </div>
        </div>

        <Toaster />

        {/* Exit confirmation dialog */}
        <ExitDialog
          open={showExitDialog}
          onConfirm={handleExitConfirm}
          onCancel={() => setShowExitDialog(false)}
        />
      </div>
    </ToolsContext.Provider>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </HashRouter>
  );
}

export default App;