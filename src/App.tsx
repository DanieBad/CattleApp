import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, List, PlusCircle, Settings, Menu, Bell } from 'lucide-react';
import './index.css';
import { HerdList } from './pages/HerdList';
import { AddAnimal } from './pages/AddAnimal';
import { AnimalDetail } from './pages/AnimalDetail';
import { EditAnimal } from './pages/EditAnimal';
import { Dashboard } from './pages/Dashboard';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
            <NavItem to="/herd/add" icon={PlusCircle} label="Add Animal" onClick={() => setIsSidebarOpen(false)} />
            <div style={{ flex: 1 }}></div>
            <NavItem to="/settings" icon={Settings} label="Settings" onClick={() => setIsSidebarOpen(false)} />
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
                </Routes>
          </main>
          
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
