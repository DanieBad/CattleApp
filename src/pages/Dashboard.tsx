import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Animal } from '../types';
import { calculateAge } from '../utils';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
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
