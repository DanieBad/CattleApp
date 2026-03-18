import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, List, PlusCircle, Settings, Menu, Bell, Activity, LogOut, Tent, Upload } from 'lucide-react';
import './index.css';
import { HerdList } from './pages/HerdList';
import { AddAnimal } from './pages/AddAnimal';
import { AnimalDetail } from './pages/AnimalDetail';
import { EditAnimal } from './pages/EditAnimal';
import { Dashboard } from './pages/Dashboard';
import { BatchHealth } from './pages/BatchHealth';
import { CampsList } from './pages/CampsList';
import { ImportData } from './pages/ImportData';
import { Auth } from './pages/Auth';
import { Landing } from './pages/Landing';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

// Sidebar Navigation Item Component
const NavItem = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

// Main App Layout Structure
const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Prevent flashing the login screen while checking existing sessions
  if (isAuthLoading) {
    return <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 600 }}>Loading CattleApp...</div>;
  }

  // If no user is logged in, securely lock down the app and strictly render the Public Routes
  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          {/* Catch-all redirect to the landing page */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        
        {/* Left Sidebar */}
        {isSidebarOpen && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <span>CattleApp</span>
          </div>
          <nav className="sidebar-nav">
            <NavItem to="/" icon={Home} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
            <NavItem to="/herd" icon={List} label="My Herd" onClick={() => setIsSidebarOpen(false)} />
            <NavItem to="/camps" icon={Tent} label="Pastures & Camps" onClick={() => setIsSidebarOpen(false)} />
            <NavItem to="/herd/add" icon={PlusCircle} label="Add Animal" onClick={() => setIsSidebarOpen(false)} />
            <NavItem to="/herd/import" icon={Upload} label="Import CSV" onClick={() => setIsSidebarOpen(false)} />
            <NavItem to="/batch-health" icon={Activity} label="Batch Health" onClick={() => setIsSidebarOpen(false)} />
            <div style={{ flex: 1 }}></div>
            <NavItem to="/settings" icon={Settings} label="Settings" onClick={() => setIsSidebarOpen(false)} />
            <button 
              onClick={handleSignOut}
              className="nav-item" 
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--danger)', marginTop: '8px' }}
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="main-content">
          
          {/* Top Header */}
          <header className="header">
            <button 
              className="btn btn-outline" 
              style={{ border: 'none', padding: '8px' }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <div style={{ flex: 1 }}></div>
            <button className="btn btn-outline" style={{ border: 'none', padding: '8px', position: 'relative' }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
            </button>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', 
              backgroundColor: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600, marginLeft: '16px'
            }}>
              DB
            </div>
          </header>

          {/* Page Routing */}
          <main className="page-container">
            <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/herd" element={<HerdList />} />
                  <Route path="/herd/add" element={<AddAnimal />} />
                  <Route path="/herd/:id" element={<AnimalDetail />} />
                  <Route path="/herd/:id/edit" element={<EditAnimal />} />
                  <Route path="/herd/import" element={<ImportData />} />
                  <Route path="/camps" element={<CampsList />} />
                  <Route path="/batch-health" element={<BatchHealth />} />
                </Routes>
          </main>
          
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
