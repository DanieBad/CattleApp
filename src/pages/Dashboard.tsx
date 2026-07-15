import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Animal, Camp } from '../types';
import { calculateAge, getAnimalIcon } from '../utils';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  LayoutDashboard, ArrowRight, ClipboardList, Info, ShieldAlert,
  LifeBuoy, NotebookPen, Baby, ChevronRight, Search, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BirthWorkflowModal } from '../components/BirthWorkflowModal';
import { QuickStartGuideModal } from '../components/QuickStartGuide';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const Dashboard = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasConfiguredSettings, setHasConfiguredSettings] = useState(false);

  // Notes modal (animal picker → navigate to journal tab)
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesSearch, setNotesSearch] = useState('');
  const [notesResults, setNotesResults] = useState<any[]>([]);
  const [isSearchingNotes, setIsSearchingNotes] = useState(false);

  // Birth workflow modal
  const [isBirthOpen, setIsBirthOpen] = useState(false);

  // Quick Start Guide
  const [showGuide, setShowGuide] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    
    // Check if user should see the Quick Start Guide
    const hasSeenGuide = localStorage.getItem('has_viewed_quickstart_guide');
    const permanentlyDismissed = localStorage.getItem('quickstart_permanently_dismissed');
    if (!hasSeenGuide && !permanentlyDismissed) {
      // Small delay to let the dashboard render first
      const timer = setTimeout(() => setShowGuide(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Debounced notes search
  useEffect(() => {
    if (!notesSearch.trim()) { setNotesResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearchingNotes(true);
      try {
        const { data } = await supabase.from('animals')
          .select('id, tag_number, name, species, breed, sex')
          .eq('status', 'Active')
          .or(`tag_number.ilike.${notesSearch}%,name.ilike.${notesSearch}%`)
          .limit(8);
        setNotesResults(data || []);
      } finally {
        setIsSearchingNotes(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [notesSearch]);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: settingsData } = await supabase.from('farm_settings').select('farm_name').eq('user_id', user.id).single();
        if (settingsData && settingsData.farm_name) {
          setHasConfiguredSettings(true);
        }
      }

      const { data: animalsData, error: animalsError } = await supabase.from('animals').select('*');
      if (animalsError) throw animalsError;
      
      const { data: campsData, error: campsError } = await supabase.from('camps').select('*');
      if (campsError) throw campsError;

      if (animalsData) {
        setAnimals(animalsData.map(a => ({
          id: a.id,
          species: a.species || 'Cattle',
          tagNumber: a.tag_number,
          name: a.name,
          breed: a.breed,
          sex: a.sex,
          dateOfBirth: a.date_of_birth,
          status: a.status,
          sireId: a.sire_id,
          damId: a.dam_id,
          weight: a.weight,
          currentCampId: a.current_camp_id,
          isQuarantined: a.is_quarantined,
        })));
      }
      
      if (campsData) {
        setCamps(campsData.map(c => ({
          id: c.id,
          userId: c.user_id,
          name: c.name,
          sizeHectares: c.size_hectares,
          notes: c.notes,
          createdAt: c.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;
  }

  const activeAnimals = animals.filter(a => a.status === 'Active');
  const quarantinedCount = activeAnimals.filter(a => a.isQuarantined).length;

  // ── Empty state (Checklist) ──────────────────────────────────────────────
  if (animals.length === 0 && !hasConfiguredSettings) {
    return (
      <div className="fade-in">
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '12px', padding: '32px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ backgroundColor: 'var(--primary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <LayoutDashboard size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: '#065F46', fontSize: '1.75rem' }}>Welcome to HealthyHerd!</h1>
            <p style={{ margin: '8px 0 0', color: '#064E3B', fontSize: '1.1rem' }}>Let's get your digital farm setup to unlock your herd analytics.</p>
          </div>
        </div>

        <div className="responsive-grid-sidebar">
          <div>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClipboardList color="var(--primary)" />
              Getting Started
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card" style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px', border: '2px solid var(--primary-light)' }} onClick={() => navigate('/settings')}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700 }}>1</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>Configure Farm Details</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>The best place to start! Head to Settings to set your farm name, and choose your default animal breeds so they're auto-selected later.</p>
                </div>
                <ArrowRight size={20} color="var(--primary)" />
              </div>
            </div>

            <h2 style={{ margin: '32px 0 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Info color="var(--primary)" />
              Getting to know the menu
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#3b82f6' }}>
                        <LayoutDashboard size={18} />
                        <h4 style={{ margin: 0, color: 'var(--text)' }}>Dashboard</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>High-level overview, charts, and quick-access journal notes.</p>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#10b981' }}>
                        <ClipboardList size={18} />
                        <h4 style={{ margin: 0, color: 'var(--text)' }}>My Herd</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your full animal ledger. Import, export, or add individual animals.</p>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f59e0b' }}>
                        <Info size={18} />
                        <h4 style={{ margin: 0, color: 'var(--text)' }}>Pastures</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track where your animals are grazing to prevent overstocking.</p>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ef4444' }}>
                        <ShieldAlert size={18} />
                        <h4 style={{ margin: 0, color: 'var(--text)' }}>Health</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Record vaccinations, dipping, and track quarantines.</p>
              </div>
            </div>

            <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <LifeBuoy size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Need more help?</h3>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.9rem' }}>
                  You can always access our detailed <strong onClick={() => navigate('/support')} style={{ cursor: 'pointer', textDecoration: 'underline', color: 'var(--primary)' }}>Quick Start Guide</strong> from the Help & Support menu anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Computed chart data ───────────────────────────────────────────────────
  const animalTypesCounts = activeAnimals.reduce((acc, a) => {
    let type = 'Other';
    const age = calculateAge(a.dateOfBirth);
    const months = age.totalMonths ?? 0;
    if (a.species === 'Cattle') {
      if (months < 9) type = 'Calf';
      else if (a.sex === 'Female') type = 'Cow';
      else type = 'Bull';
    } else if (a.species === 'Sheep') {
      if (months < 9) type = 'Lamb';
      else if (a.sex === 'Female') type = 'Ewe';
      else type = 'Ram';
    }
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const animalTypesChartData = Object.keys(animalTypesCounts).map(type => ({
    name: type,
    value: animalTypesCounts[type]
  })).sort((a, b) => b.value - a.value);

  const campCounts = activeAnimals.reduce((acc, a) => {
    if (a.currentCampId) acc[a.currentCampId] = (acc[a.currentCampId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pastureChartData = Object.keys(campCounts).map(campId => {
    const camp = camps.find(c => c.id === campId);
    return { name: camp ? camp.name : 'Unknown', count: campCounts[campId], campId };
  }).sort((a, b) => b.count - a.count);

  return (
    <div>
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Herd Analytics Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>High-level overview of your active farming operations.</p>
        </div>
      </div>

      {/* ── ACTION TILES ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Notes tile */}
        <button
          id="dashboard-notes-btn"
          onClick={() => { setIsNotesOpen(true); setNotesSearch(''); setNotesResults([]); }}
          className="card"
          style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', textAlign: 'left', width: '100%' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(16,185,129,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <NotebookPen size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#065F46', marginBottom: '4px' }}>Notes</div>
            <div style={{ color: '#047857', fontSize: '0.875rem' }}>Add a journal note to any animal</div>
          </div>
          <ChevronRight size={20} color="#059669" />
        </button>

        {/* Births tile */}
        <button
          id="dashboard-births-btn"
          onClick={() => setIsBirthOpen(true)}
          className="card"
          style={{ padding: '28px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', textAlign: 'left', width: '100%' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(245,158,11,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
        >
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <Baby size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#78350f', marginBottom: '4px' }}>Births</div>
            <div style={{ color: '#92400e', fontSize: '0.875rem' }}>Register a new calf or lamb</div>
          </div>
          <ChevronRight size={20} color="#d97706" />
        </button>
      </div>

      {/* ── VIEW / INFO TILES ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>

        {/* Herd Composition Chart */}
        <div className="card" style={{ padding: '24px', height: '400px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
          onClick={() => navigate('/herd')}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
          <h3 style={{ marginBottom: '4px' }}>Herd Composition</h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{activeAnimals.length} active animals</p>
          {animalTypesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={animalTypesChartData}
                  cx="50%" cy="45%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={5} dataKey="value"
                  label={({ name, value }) => `${name} ${value}`}
                >
                  {animalTypesChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No active animals to display.</p>
          )}
        </div>

        {/* Pasture Usage Chart */}
        <div className="card" style={{ padding: '24px', height: '400px' }}>
          <h3 style={{ marginBottom: '4px' }}>Pasture Usage</h3>
          <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Animals per camp</p>
          {pastureChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={pastureChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100}
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    const item = pastureChartData.find(d => d.name === payload.value);
                    return (
                      <g transform={`translate(${x},${y})`} onClick={() => item && navigate(`/herd?campId=${item.campId}`)} style={{ cursor: 'pointer' }}>
                        <text x={-10} y={0} dy={4} textAnchor="end" fill="var(--text-muted)" fontSize={12} fontWeight={500}>{payload.value}</text>
                      </g>
                    );
                  }}
                />
                <RechartsTooltip formatter={(value) => [`${value} Animals`, 'Stock Load']} />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} style={{ cursor: 'pointer' }} onClick={(data: any) => navigate(`/herd?campId=${data.campId}`)} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No animals assigned to pastures.</p>
          )}
        </div>

        {/* View Journal */}
        <div className="card fade-in" style={{ padding: '24px', backgroundColor: '#059669', color: 'white', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClipboardList size={26} />
              View Journal
            </h2>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
              Review notes and observations recorded across your herd.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[['1', 'Last 24 Hours'], ['7', 'Last 7 Days'], ['30', 'Last 30 Days'], ['all', 'All']].map(([days, label]) => (
              <button key={days} className="btn"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem' }}
                onClick={() => navigate(`/recent-notes?days=${days}`)}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Currently Quarantined */}
        <div className="card"
          style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '4px solid #ef4444', cursor: quarantinedCount > 0 ? 'pointer' : 'default', transition: 'box-shadow 0.2s' }}
          onClick={() => quarantinedCount > 0 && navigate('/herd?quarantined=true')}
          onMouseEnter={e => { if (quarantinedCount > 0) (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(239,68,68,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} color="#ef4444" />
            Currently Quarantined
          </span>
          <span style={{ fontSize: '3rem', fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>{quarantinedCount}</span>
          {quarantinedCount > 0 ? (
            <span style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View quarantined animals <ChevronRight size={14} />
            </span>
          ) : (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No active quarantines</span>
          )}
        </div>
      </div>

      {/* ── NOTES MODAL (animal picker) ────────────────────────────────────── */}
      {isNotesOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '520px', backgroundColor: 'white', padding: '28px', position: 'relative' }}>
            <button onClick={() => setIsNotesOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <NotebookPen size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Add Journal Note</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Search for an animal to open its journal</p>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Type tag number or name..."
                style={{ paddingLeft: '44px', fontSize: '1rem' }}
                value={notesSearch}
                onChange={e => setNotesSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ marginTop: '12px', minHeight: '60px' }}>
              {isSearchingNotes && <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Searching...</div>}
              {!isSearchingNotes && notesSearch.trim() && notesResults.length === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active animals found for "{notesSearch}"</div>
              )}
              {notesResults.map(a => (
                <div key={a.id}
                  onClick={() => { setIsNotesOpen(false); navigate(`/herd/${a.id}`, { state: { tab: 'journal' } }); }}
                  style={{ padding: '14px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '4px', transition: 'background-color 0.15s', border: '1px solid var(--border)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{getAnimalIcon(a.species, a.breed, a.sex)}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{a.tag_number}</div>
                      {a.name && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.name}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.breed}</span>
                    <ChevronRight size={16} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BIRTH WORKFLOW MODAL ───────────────────────────────────────────── */}
      {isBirthOpen && <BirthWorkflowModal onClose={() => { setIsBirthOpen(false); fetchDashboardData(); }} />}

      {/* ── QUICK START GUIDE MODAL ────────────────────────────────────────── */}
      {showGuide && (
        <QuickStartGuideModal 
          onClose={(permanentlyDismiss) => {
            setShowGuide(false);
            localStorage.setItem('has_viewed_quickstart_guide', 'true');
            if (permanentlyDismiss) {
              localStorage.setItem('quickstart_permanently_dismissed', 'true');
            }
          }} 
        />
      )}
    </div>
  );
};
