import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Users, Building2, MapPin, Calendar, Activity, ChevronRight, Search, ShieldCheck } from 'lucide-react';
import { } from 'react-router-dom';

interface UserProfile {
  user_id: string;
  farm_name: string | null;
  district: string | null;
  created_at: string;
  updated_at: string;
}

export const UserManagement = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, totalFarms: 0 });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all farm settings. Note: RLS will still apply unless the admin policy is set.
      const { data, error } = await supabase
        .from('farm_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProfiles(data.map(p => ({
          user_id: p.user_id,
          farm_name: p.farm_name,
          district: p.district,
          created_at: p.created_at,
          updated_at: p.updated_at
        })));
        setStats({
          totalUsers: data.length,
          totalFarms: data.filter(p => p.farm_name).length
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    (p.farm_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.user_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Activity className="animate-spin" style={{ margin: '0 auto 16px' }} />
        <p>Loading Registered Users...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users color="var(--primary)" />
            User Management
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Monitor registered farms and application growth.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator</div>
                <div style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ShieldCheck size={16} />
                    djb.rsa@gmail.com
                </div>
            </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--primary)' }}>
                <Users size={24} />
            </div>
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Users</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalUsers}</div>
            </div>
        </div>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', color: '#3b82f6' }}>
                <Building2 size={24} />
            </div>
            <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Registered Farms</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalFarms}</div>
            </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Search by farm or district..." 
                    style={{ paddingLeft: '40px', backgroundColor: 'white' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button className="btn btn-outline" onClick={fetchUsers} style={{ fontSize: '0.875rem' }}>Refresh List</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F1F5F9' }}>
                    <tr>
                        <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Farm Name</th>
                        <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>District</th>
                        <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>User ID</th>
                        <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Joined Date</th>
                        <th style={{ textAlign: 'right', padding: '12px 20px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProfiles.length > 0 ? (
                        filteredProfiles.map((p) => (
                            <tr key={p.user_id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.farm_name || 'Unnamed Farm'}</div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <MapPin size={14} />
                                        {p.district || '--'}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                                        {p.user_id.substring(0, 8)}...
                                    </code>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <Calendar size={14} />
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                    <ChevronRight size={18} color="var(--border)" />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No users found matching your search.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '20px', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} />
              Admin Security Active
          </h3>
          <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: '#1E40AF', opacity: 0.8 }}>
              This page is only visible to <strong>djb.rsa@gmail.com</strong>. All data visibility is subject to Supabase Row Level Security policies.
          </p>
      </div>
    </div>
  );
};
