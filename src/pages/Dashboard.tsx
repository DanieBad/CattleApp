import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Animal } from '../types';
import { calculateAge } from '../utils';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  LayoutDashboard, Map, PlusCircle, Settings, ArrowRight, ShieldCheck, ClipboardList, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const Dashboard = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase.from('animals').select('*');
      if (error) throw error;
      
      if (data) {
        setAnimals(data.map(a => ({
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
          weight: a.weight
        })));
      }
    } catch (error) {
      console.error('Error fetching animals for dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Dashboard...</div>;
  }

  // --- CALCULATIONS ---
  const activeAnimals = animals.filter(a => a.status === 'Active');
  
  // Weights
  const animalsWithWeight = activeAnimals.filter(a => a.weight && a.weight > 0);
  const avgWeight = animalsWithWeight.length > 0 
    ? Math.round(animalsWithWeight.reduce((sum, a) => sum + (a.weight || 0), 0) / animalsWithWeight.length) 
    : 0;

  // Weaners (6 to 9 months)
  const weaners = activeAnimals.filter(a => {
    const age = calculateAge(a.dateOfBirth);
    return (age.totalMonths ?? 0) >= 6 && (age.totalMonths ?? 0) <= 9;
  });

  // Breed Data for Chart
  const breedCounts = activeAnimals.reduce((acc, a) => {
    acc[a.breed] = (acc[a.breed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const breedChartData = Object.keys(breedCounts).map(breed => ({
    name: breed,
    value: breedCounts[breed]
  })).sort((a, b) => b.value - a.value);

  // Sex Data for Chart
  const sexCounts = activeAnimals.reduce((acc, a) => {
    acc[a.sex] = (acc[a.sex] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const sexChartData = [
    { name: 'Female (Cows/Heifers)', count: sexCounts['Female'] || 0 },
    { name: 'Male (Bulls/Steers)', count: sexCounts['Male'] || 0 }
  ];

  // --- DEMO DATA FOR EMPTY STATE ---
  const DEMO_BREED_DATA = [
    { name: 'Bonsmara', value: 45 },
    { name: 'Brahman', value: 30 },
    { name: 'Drakensberger', value: 15 },
    { name: 'Other', value: 10 }
  ];

  const DEMO_SEX_DATA = [
    { name: 'Female (Cows/Heifers)', count: 65 },
    { name: 'Male (Bulls/Steers)', count: 35 }
  ];

  if (animals.length === 0) {
    return (
      <div className="fade-in">
        <div style={{ backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '32px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ backgroundColor: '#0EA5E9', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <LayoutDashboard size={32} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: '#0369A1', fontSize: '1.75rem' }}>Welcome to your Farm Dashboard!</h1>
            <p style={{ margin: '8px 0 0', color: '#0C4A6E', fontSize: '1.1rem' }}>Let's get your digital farm setup in 3 easy steps to unlock your herd analytics.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
          <div>
            <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClipboardList color="var(--primary)" />
              Getting Started Checklist
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* STEP 1 */}
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

              {/* STEP 2 */}
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

              {/* STEP 3 */}
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
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dashboard Preview</h3>
              <span className="badge" style={{ backgroundColor: '#E2E8F0', color: '#64748B' }}>Demo Data</span>
            </div>
            
            <div style={{ position: 'relative', opacity: 0.5, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, transparent 60%, var(--background) 100%)' }}></div>
              
              <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 16px' }}>Breed Performance</h4>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DEMO_BREED_DATA} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                        {DEMO_BREED_DATA.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ margin: '0 0 16px' }}>Stock Distribution</h4>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DEMO_SEX_DATA} layout="vertical">
                      <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Herd Analytics Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        High-level overview of your active farming operations.
      </p>

      {/* KEY METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Herd</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{activeAnimals.length}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>out of {animals.length} total records</span>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Weaner Calves (6-9 Mos)</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b' }}>{weaners.length}</span>
          {weaners.length > 0 ? (
             <button 
               onClick={() => navigate('/herd')} 
               style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textAlign: 'left', padding: 0, textDecoration: 'underline', fontSize: '0.875rem' }}
             >
               View Herd List
             </button>
          ) : (
             <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No calves ready for weaning</span>
          )}
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Weight (Active)</span>
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{avgWeight > 0 ? `${avgWeight} kg` : '-'}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>across {animalsWithWeight.length} weighed animals</span>
        </div>

      </div>

      {/* CHARTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        <div className="card" style={{ padding: '24px', height: '400px' }}>
          <h3 style={{ marginBottom: '24px' }}>Breed Distribution (Active)</h3>
          {breedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breedChartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {breedChartData.map((_entry, index) => (
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

        <div className="card" style={{ padding: '24px', height: '400px' }}>
          <h3 style={{ marginBottom: '24px' }}>Sex Distribution (Active)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sexChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
              <RechartsTooltip />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};
