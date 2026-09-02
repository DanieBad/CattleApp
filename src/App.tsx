import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Home, List, Settings as SettingsIcon, Menu, Bell, Activity, LogOut, Tent, BarChart2, LifeBuoy, Tag } from 'lucide-react';
import './index.css';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// Each page becomes its own JS chunk, downloaded only when the user visits it.
// Named exports are unwrapped via `.then(m => ({ default: m.X }))`.

// Public routes
const Landing         = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Auth            = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Plans           = lazy(() => import('./pages/Plans').then(m => ({ default: m.Plans })));
const Signup          = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const UpdatePassword  = lazy(() => import('./pages/UpdatePassword').then(m => ({ default: m.UpdatePassword })));
const Terms           = lazy(() => import('./pages/Terms').then(m => ({ default: m.Terms })));
const Privacy         = lazy(() => import('./pages/Privacy').then(m => ({ default: m.Privacy })));

// Authenticated routes
const Dashboard       = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const HerdList        = lazy(() => import('./pages/HerdList').then(m => ({ default: m.HerdList })));
const BatchMovement   = lazy(() => import('./pages/BatchMovement').then(m => ({ default: m.BatchMovement })));
const AddAnimal       = lazy(() => import('./pages/AddAnimal').then(m => ({ default: m.AddAnimal })));
const AnimalDetail    = lazy(() => import('./pages/AnimalDetail').then(m => ({ default: m.AnimalDetail })));
const EditAnimal      = lazy(() => import('./pages/EditAnimal').then(m => ({ default: m.EditAnimal })));
const ImportData      = lazy(() => import('./pages/ImportData').then(m => ({ default: m.ImportData })));
const CampsList       = lazy(() => import('./pages/CampsList').then(m => ({ default: m.CampsList })));
const HealthWorkflow  = lazy(() => import('./pages/HealthWorkflow').then(m => ({ default: m.HealthWorkflow })));
const BatchHealth     = lazy(() => import('./pages/BatchHealth').then(m => ({ default: m.BatchHealth })));
const BuySell         = lazy(() => import('./pages/BuySell').then(m => ({ default: m.BuySell })));
const BuyingWizard    = lazy(() => import('./pages/BuyingWizard').then(m => ({ default: m.BuyingWizard })));
const SellingWizard   = lazy(() => import('./pages/SellingWizard').then(m => ({ default: m.SellingWizard })));
const Settings        = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Reports         = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Support         = lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));
const HelpGuide       = lazy(() => import('./pages/HelpGuide').then(m => ({ default: m.HelpGuide })));
const Billing         = lazy(() => import('./pages/Billing').then(m => ({ default: m.Billing })));
const Profile         = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const RecentNotes     = lazy(() => import('./pages/RecentNotes').then(m => ({ default: m.RecentNotes })));

// ─── Shell components (stay eager — part of the persistent layout) ────────────
import { AccountMenu } from './components/AccountMenu';
import { SubscriptionProvider, useSubscription } from './context/SubscriptionContext';
import { Toaster } from 'react-hot-toast';
import logo from './assets/Logo.png';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import { MicrophoneButton } from './components/VoiceAssistant/MicrophoneButton';
import { VoiceConfirmationModal } from './components/VoiceAssistant/VoiceConfirmationModal';
import { extractIntentFromText } from './services/voiceService';
import { isMobile } from './utils/deviceUtils';
import { SyncIndicator } from './components/SyncIndicator';
import { BiometricPrompt } from './components/BiometricPrompt';
import { SyncManager } from './services/syncManager';
import { PageLoader } from './components/PageLoader';

// Bell notification button — navigates to Billing & Subscription on click
const BellButton = () => {
  const navigate = useNavigate();
  return (
    <button
      className="btn btn-outline"
      style={{ border: 'none', padding: '8px', position: 'relative' }}
      onClick={() => navigate('/billing')}
      title="System notifications — go to Billing & Subscription"
    >
      <Bell size={20} />
      <span style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
    </button>
  );
};

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

// Trial/Grace Period Banner — renders inside SubscriptionProvider
const TrialBanner = () => {
  const { status, trialDaysRemaining } = useSubscription();
  const navigate = useNavigate();

  if (status === 'grace_period' || status === 'cancelled') {
    return (
      <div style={{
        backgroundColor: '#FEE2E2', borderBottom: '1px solid #FECACA',
        padding: '10px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px', fontSize: '0.875rem'
      }}>
        <span style={{ color: '#991B1B' }}>
          🔒 <strong>Your free trial has ended.</strong> You are in read-only mode — you cannot add new animals.
        </span>
        <button
          onClick={() => navigate('/billing')}
          style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', padding: '4px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.8rem' }}
        >
          Select a Plan →
        </button>
      </div>
    );
  }

  if (status === 'trialing' && trialDaysRemaining !== null && trialDaysRemaining <= 7) {
    return (
      <div style={{
        backgroundColor: '#FFFBEB', borderBottom: '1px solid #FDE68A',
        padding: '10px 32px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px', fontSize: '0.875rem'
      }}>
        <span style={{ color: '#92400E' }}>
          ⚠️ <strong>Trial ending:</strong> {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining.
        </span>
        <button
          onClick={() => navigate('/billing')}
          style={{ background: 'none', border: '1px solid #D97706', color: '#D97706', padding: '4px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.8rem' }}
        >
          Choose a Plan →
        </button>
      </div>
    );
  }

  return null;
};

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
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

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
    // Reset any records stuck in 'syncing' from a previous crashed session
    SyncManager.resetStuckSyncingRecords();

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch((err) => {
        console.error('[App] Failed to retrieve auth session:', err);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/update-password';
      }
      // Show biometric prompt on first sign-in on a mobile device
      if (event === 'SIGNED_IN' && isMobile() && !localStorage.getItem('biometric_prompted')) {
        setShowBiometricPrompt(true);
      }
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
      {/* Single Suspense boundary covers all lazy routes */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC ROUTES */}
          {!session ? (
            <>
              {(import.meta.env.VITE_BETA_MODE ?? '').trim() === 'true' ? (
                <>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/signup" element={<Signup />} />
                  {/* Public utility pages */}
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/plans" element={<Plans />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </>
          ) : (
            /* AUTHENTICATED ROUTES (Only accessible when LOGGED IN) */
            <Route element={
              <SubscriptionProvider session={session}>
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
                    <NavItem to="/camps" icon={Tent} label="Pastures Movement" onClick={() => setIsSidebarOpen(false)} />
                    <NavItem to="/health" icon={Activity} label="Health" onClick={() => setIsSidebarOpen(false)} />
                    <NavItem to="/buy-sell" icon={Tag} label="Buy / Sell" onClick={() => setIsSidebarOpen(false)} />
                    <NavItem to="/reports" icon={BarChart2} label="Reports" onClick={() => setIsSidebarOpen(false)} />

                    {/* Spacer pushes bottom items down */}
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
                  <TrialBanner />
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
                    <BellButton />
                    <AccountMenu session={session} onSignOut={handleSignOut} />
                  </header>

                  <main className="page-container">
                    <Routes>
                      <Route path="/update-password" element={<UpdatePassword />} />
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/recent-notes" element={<RecentNotes />} />
                      <Route path="/herd" element={<HerdList />} />
                      <Route path="/herd/batch-move" element={<BatchMovement />} />
                      <Route path="/herd/add" element={<AddAnimal />} />
                      <Route path="/herd/:id" element={<AnimalDetail />} />
                      <Route path="/herd/:id/edit" element={<EditAnimal />} />
                      <Route path="/herd/import" element={<ImportData />} />
                      <Route path="/camps" element={<CampsList />} />
                      <Route path="/health" element={<HealthWorkflow />} />
                      <Route path="/batch-health" element={<BatchHealth />} />
                      <Route path="/buy-sell" element={<BuySell />} />
                      <Route path="/buy-sell/buy" element={<BuyingWizard />} />
                      <Route path="/buy-sell/sell" element={<SellingWizard />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/help" element={<HelpGuide />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/profile" element={<Profile />} />

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

                  {/* Biometric sign-in prompt — mobile only, shown once after first login */}
                  {showBiometricPrompt && (
                    <BiometricPrompt onDismiss={() => setShowBiometricPrompt(false)} />
                  )}
                </div>
              </div>
              </SubscriptionProvider>
            }>
              <Route path="*" element={<span />} />
            </Route>
          )}
        </Routes>
      </Suspense>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
};

export default App;
