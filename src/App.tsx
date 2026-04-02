import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Home, List, PlusCircle, Settings as SettingsIcon, Menu, Bell, Activity, LogOut, Tent, Upload, BarChart2, Users, LifeBuoy } from 'lucide-react';
import './index.css';
import { HerdList } from './pages/HerdList';
import { BatchMovement } from './pages/BatchMovement';
import { AddAnimal } from './pages/AddAnimal';
import { AnimalDetail } from './pages/AnimalDetail';
import { EditAnimal } from './pages/EditAnimal';
import { Dashboard } from './pages/Dashboard';
import { BatchHealth } from './pages/BatchHealth';
import { CampsList } from './pages/CampsList';
import { ImportData } from './pages/ImportData';
import { Auth } from './pages/Auth';
import { Landing } from './pages/Landing';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { UserManagement } from './pages/UserManagement';
import { Support } from './pages/Support';
import { ForgotPassword } from './pages/ForgotPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { Toaster } from 'react-hot-toast';
import logo from './assets/Logo.png';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import { MicrophoneButton } from './components/VoiceAssistant/MicrophoneButton';
import { VoiceConfirmationModal } from './components/VoiceAssistant/VoiceConfirmationModal';
import { extractIntentFromText } from './services/voiceService';
import { isMobile } from './utils/deviceUtils';
import { SyncIndicator } from './components/SyncIndicator';

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

  // Global Voice Assistant State
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceParsedData, setVoiceParsedData] = useState<any | null>(null);
  const [voiceActionType, setVoiceActionType] = useState<string>('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const handleVoiceTranscript = async (text: string) => {
    setIsProcessingVoice(true);
    setVoiceTranscript(text);
    const language = localStorage.getItem('voice_language') || 'en-ZA';
    try {
      const parsed = await extractIntentFromText(text, language);
      setVoiceActionType(parsed.action);
      setVoiceParsedData(parsed.data);
      setIsVoiceModalOpen(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessingVoice(false);
    }
  };

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

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES (Only accessible when NOT logged in) */}
        {!session ? (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* Catch-all for guest users: back to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          /* AUTHENTICATED ROUTES (Only accessible when LOGGED IN) */
          <Route element={
            <div className="app-container">
              {/* Left Sidebar */}
              {isSidebarOpen && (
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header" style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                  <img src={logo} alt="HealthyHerd" style={{ height: '64px', objectFit: 'contain', filter: 'brightness(0) invert(1) opacity(0.8)' }} />
                </div>
                <nav className="sidebar-nav">
                  <NavItem to="/" icon={Home} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
                  <NavItem to="/herd" icon={List} label="My Herd" onClick={() => setIsSidebarOpen(false)} />
                  <NavItem to="/camps" icon={Tent} label="Pastures & Camps" onClick={() => setIsSidebarOpen(false)} />
                  <NavItem to="/herd/add" icon={PlusCircle} label="Add Animal" onClick={() => setIsSidebarOpen(false)} />
                  <NavItem to="/herd/import" icon={Upload} label="Import/Export" onClick={() => setIsSidebarOpen(false)} />
                  <NavItem to="/batch-health" icon={Activity} label="Batch Health" onClick={() => setIsSidebarOpen(false)} />
                  <NavItem to="/reports" icon={BarChart2} label="Reports" onClick={() => setIsSidebarOpen(false)} />
                  
                  {/* Admin Section */}
                  {session.user.email === 'djb.rsa@gmail.com' && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ padding: '0 16px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin</div>
                      <NavItem to="/admin/users" icon={Users} label="User Management" onClick={() => setIsSidebarOpen(false)} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}></div>
                  <NavItem to="/support" icon={LifeBuoy} label="Help & Support" onClick={() => setIsSidebarOpen(false)} />
                  <NavItem to="/settings" icon={SettingsIcon} label="Settings" onClick={() => setIsSidebarOpen(false)} />
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
                <header className="header">
                  <button 
                    className="btn btn-outline" 
                    style={{ border: 'none', padding: '8px' }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Menu size={24} />
                  </button>
                  <div style={{ flex: 1 }}></div>
                  <SyncIndicator />
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
                    {session.user.email?.substring(0, 2).toUpperCase() || 'DB'}
                  </div>
                </header>

                <main className="page-container">
                  <Routes>
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/herd" element={<HerdList />} />
                    <Route path="/herd/batch-move" element={<BatchMovement />} />
                    <Route path="/herd/add" element={<AddAnimal />} />
                    <Route path="/herd/:id" element={<AnimalDetail />} />
                    <Route path="/herd/:id/edit" element={<EditAnimal />} />
                    <Route path="/herd/import" element={<ImportData />} />
                    <Route path="/camps" element={<CampsList />} />
                    <Route path="/batch-health" element={<BatchHealth />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/support" element={<Support />} />
                    {session.user.email === 'djb.rsa@gmail.com' && (
                      <Route path="/admin/users" element={<UserManagement />} />
                    )}
                    {/* Catch-all for authenticated users: back to dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                {/* Global Voice Assistant Elements - Mobile Only */}
                {isMobile() && (
                  <MicrophoneButton 
                    onTranscriptComplete={handleVoiceTranscript} 
                    isProcessing={isProcessingVoice}
                  />
                )}
                <VoiceConfirmationModal 
                  isOpen={isVoiceModalOpen}
                  transcript={voiceTranscript}
                  actionType={voiceActionType}
                  parsedData={voiceParsedData}
                  onConfirm={() => {
                    setIsVoiceModalOpen(false);
                    // Reload to immediately refresh data across whichever view is active
                    window.location.reload();
                  }}
                  onCancel={() => setIsVoiceModalOpen(false)}
                />
              </div>
            </div>
          }>
            <Route path="*" element={<span />} />
          </Route>
        )}
      </Routes>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
};

export default App;
