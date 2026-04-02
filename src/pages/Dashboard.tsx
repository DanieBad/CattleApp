import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import type { Animal, Camp, HealthLog } from '../types';
import { calculateAge } from '../utils';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  LayoutDashboard, PlusCircle, ArrowRight, ClipboardList, Info, Search, HeartPulse, ShieldAlert, LifeBuoy, FileEdit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const Dashboard = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Rapid Field Entry State
  const [fieldTag, setFieldTag] = useState('');
  const [fieldNote, setFieldNote] = useState('');
  const [isSubmittingField, setIsSubmittingField] = useState(false);
  const [tagConflicts, setTagConflicts] = useState<Animal[]>([]);
  const [selectedConflictId, setSelectedConflictId] = useState('');

  useEffect(() => {
    fetchDashboardData();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: animalsData, error: animalsError } = await supabase.from('animals').select('*');
      if (animalsError) throw animalsError;
      
      const { data: campsData, error: campsError } = await supabase.from('camps').select('*');
      if (campsError) throw campsError;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: healthData, error: healthError } = await supabase
        .from('health_logs')
        .select('*')
        .gte('date_administered', thirtyDaysAgo.toISOString().split('T')[0]);
      if (healthError && healthError.code !== '42P01') console.warn(healthError);

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
          isQuarantined: a.is_quarantined
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
      
      if (healthData) {
        setHealthLogs(healthData.map((h: any) => ({
          id: h.id,
          animalId: h.animal_id,
          treatmentType: h.treatment_type,
          dateAdministered: h.date_administered
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
  
  // Health Metrics
  const quarantinedCount = activeAnimals.filter(a => a.isQuarantined).length;
  const recentTreatmentsCount = healthLogs.length;

  // Search Logic
  const filteredSearch = searchQuery.trim() === '' ? [] : activeAnimals.filter(a => 
    a.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredSearch.length === 1) {
      navigate(`/herd/${filteredSearch[0].id}`);
    } else if (filteredSearch.length > 1) {
      navigate(`/herd/${filteredSearch[0].id}`);
    }
  };

  const handleFieldEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldTag.trim() || !fieldNote.trim()) return;
    
    setIsSubmittingField(true);
    try {
      let submitAnimalId = '';
      let submitAnimalTag = '';
      
      // If we are currently resolving a conflict
      if (tagConflicts.length > 0 && selectedConflictId) {
        submitAnimalId = selectedConflictId;
        submitAnimalTag = fieldTag;
      } else {
        // Query database
        const { data, error } = await supabase.from('animals')
          .select('*')
          .eq('tag_number', fieldTag)
          .eq('status', 'Active');
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          toast.error("Animal not found. Please check the Tag ID.");
          setIsSubmittingField(false);
          return;
        }
        
        if (data.length > 1) {
          // Conflict: exact same tag found for multiple active animals
          setTagConflicts(data);
          setSelectedConflictId(data[0].id);
          setIsSubmittingField(false);
          return;
        }
        
        // Exactly one match
        submitAnimalId = data[0].id;
        submitAnimalTag = data[0].tag_number;
      }
      
      // Submit Note
      const today = new Date().toISOString().split('T')[0];
      const { error: insertError } = await supabase.from('journal_logs').insert([{
        animal_id: submitAnimalId,
        date_recorded: today,
        note_text: fieldNote
      }]);
      
      if (insertError) {
         if (insertError.code === '42P01') {
           toast.error("Journal logs table is missing in Supabase.");
         } else {
           throw insertError;
         }
      } else {
        toast.success(`Note added to ${submitAnimalTag}`);
        setFieldTag('');
        setFieldNote('');
        setTagConflicts([]);
        setSelectedConflictId('');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('An error occurred while saving the note.');
    } finally {
      setIsSubmittingField(false);
    }
  };

  // Animal Types Calculation
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

  // Pasture Usage
  const campCounts = activeAnimals.reduce((acc, a) => {
    if (a.currentCampId) {
      acc[a.currentCampId] = (acc[a.currentCampId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const pastureChartData = Object.keys(campCounts).map(campId => {
    const camp = camps.find(c => c.id === campId);
    return {
      name: camp ? camp.name : 'Unknown',
      count: campCounts[campId],
      campId
    };
  }).sort((a, b) => b.count - a.count);

  if (animals.length === 0) {
    return (
      <div className="fade-in">
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '12px', padding: '32px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ backgroundColor: 'var(--primary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <LayoutDashboard size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: '#065F46', fontSize: '1.75rem' }}>Welcome to your Farm Dashboard!</h1>
            <p style={{ margin: '8px 0 0', color: '#064E3B', fontSize: '1.1rem' }}>Let's get your digital farm setup in 3 easy steps to unlock your herd analytics.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
          <div>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClipboardList color="var(--primary)" />
              Getting Started Checklist
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                className="card" 
                style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px' }}
                onClick={() => navigate('/settings')}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontWeight: 700 }}>1</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>Configure Farm Details</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Set your farm name, default breeds, and GS1 prefix for documents.</p>
                </div>
                <ArrowRight size={20} color="#94A3B8" />
              </div>

              <div 
                className="card" 
                style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px' }}
                onClick={() => navigate('/camps')}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontWeight: 700 }}>2</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>Register Your Pastures & Camps</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Define your camps and grazing areas to enable stocking rate tracking.</p>
                </div>
                <ArrowRight size={20} color="#94A3B8" />
              </div>

              <div 
                className="card" 
                style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '20px', border: '2px solid var(--primary-light)' }}
                onClick={() => navigate('/add-animal')}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700 }}>3</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0 }}>Add Your First Animal</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Register your cattle or sheep to see them appear in your analytics.</p>
                </div>
                <PlusCircle size={20} color="var(--primary)" />
              </div>
            </div>

            <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                <Info size={18} color="#64748B" />
                Quick Tip
              </h3>
              <p style={{ margin: '12px 0 0', color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>
                You can also use the **Import/Export** tool in the sidebar if you have your animal data in a CSV file or Excel sheet. This will populate your entire herd in seconds.
              </p>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={() => navigate('/support')} 
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <LifeBuoy size={18} /> Need more help? Visit our Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Herd Analytics Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            High-level overview of your active farming operations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Quick Start Guide moved to Support page */}
        </div>
        
        <div ref={searchRef} style={{ position: 'relative', width: '300px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Quick jump by tag..." 
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />
          </form>

          {showDropdown && filteredSearch.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid var(--border)', zIndex: 50, marginTop: '8px', overflow: 'hidden' }}>
              {filteredSearch.map(a => (
                <div 
                  key={a.id} 
                  style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background-color 0.2s' }} 
                  onClick={() => navigate(`/herd/${a.id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span style={{ fontWeight: 600 }}>{a.tagNumber}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{a.species === 'Cattle' ? '🐄' : '🐑'} {a.name || ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HEALTH METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} color="#ef4444" />
            Currently Quarantined
          </span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444' }}>{quarantinedCount}</span>
          {quarantinedCount > 0 ? (
            <button 
              onClick={() => navigate('/herd')} 
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textAlign: 'left', padding: 0, textDecoration: 'underline', fontSize: '0.875rem' }}
            >
              View Quarantined Animals
            </button>
          ) : (
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No active quarantines</span>
          )}
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HeartPulse size={16} color="#3b82f6" />
            Treatments (Last 30 Days)
          </span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6' }}>{recentTreatmentsCount}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total health records logged</span>
        </div>

        {/* RAPID FIELD ENTRY WIDGET */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileEdit size={18} color="var(--primary)" />
            Rapid Field Entry
          </h3>
          <form onSubmit={handleFieldEntrySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Tag ID (e.g. C-101)" 
                style={{ flex: 1 }}
                required
                value={fieldTag}
                onChange={(e) => {
                  setFieldTag(e.target.value);
                  if (tagConflicts.length > 0) setTagConflicts([]);
                }}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmittingField}
                style={{ whiteSpace: 'nowrap' }}
              >
                {isSubmittingField ? 'Saving...' : 'Add Note'}
              </button>
            </div>
            
            {tagConflicts.length > 0 && (
              <div style={{ backgroundColor: '#FFFBEB', padding: '12px', borderRadius: '8px', border: '1px solid #FEF3C7' }}>
                <label className="form-label" style={{ color: '#92400E', marginBottom: '8px' }}>
                  Multiple active animals found with this tag. Please select one:
                </label>
                <select 
                  className="form-input" 
                  value={selectedConflictId}
                  onChange={(e) => setSelectedConflictId(e.target.value)}
                >
                  {tagConflicts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.species} - {a.breed} - {a.sex} {a.name ? `(${a.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <textarea 
              className="form-input"
              placeholder="Observation or note..."
              style={{ flex: 1, minHeight: '80px', resize: 'none' }}
              required
              value={fieldNote}
              onChange={(e) => setFieldNote(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Animal Types Chart */}
        <div className="card" style={{ padding: '24px', height: '400px', cursor: 'pointer', transition: 'box-shadow 0.2s' }} onClick={() => navigate('/herd')} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
          <h3 style={{ marginBottom: '24px' }}>Herd Composition (Active)</h3>
          {animalTypesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={animalTypesChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
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
          <h3 style={{ marginBottom: '24px' }}>Pasture Usage</h3>
          {pastureChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pastureChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    const item = pastureChartData.find(d => d.name === payload.value);
                    return (
                      <g 
                        transform={`translate(${x},${y})`} 
                        onClick={() => item && navigate(`/herd?campId=${item.campId}`)} 
                        style={{ cursor: 'pointer' }}
                      >
                        <text x={-10} y={0} dy={4} textAnchor="end" fill="var(--text-muted)" fontSize={12} fontWeight={500}>
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <RechartsTooltip formatter={(value) => [`${value} Animals`, 'Stock Load']} />
                <Bar 
                  dataKey="count" 
                  fill="var(--primary)" 
                  radius={[0, 4, 4, 0]} 
                  style={{ cursor: 'pointer' }} 
                  onClick={(data: any) => navigate(`/herd?campId=${data.campId}`)}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No animals assigned to pastures.</p>
          )}
        </div>

      </div>
    </div>
  );
};
