import React, { createContext, useEffect, useState } from "react";
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

export const ToolsContext = createContext(null);

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    loadData();
  }, []);

  const contextValue = {
    tools,
    categories,
    stats,
    loading,
    error,
    refresh: loadData,
  };

  return (
    <ToolsContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10">
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
        </div>
        <Toaster />
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