import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { ClipboardList, ChevronLeft, Calendar } from 'lucide-react';
import { getAnimalIcon } from '../utils';

export const RecentNotes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const daysParam = searchParams.get('days') || '7'; // Default to 7 days
  const days = parseInt(daysParam, 10);
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentNotes();
  }, [days]);

  const fetchRecentNotes = async () => {
    setLoading(true);
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      const isoDate = fromDate.toISOString().split('T')[0];

      // Fetch logs and the associated animal information
      const { data, error } = await supabase
        .from('journal_logs')
        .select(`
          id,
          note_text,
          date_recorded,
          animal_id,
          animals ( id, tag_number, name, species, breed, sex )
        `)
        .gte('date_recorded', isoDate)
        .order('date_recorded', { ascending: false });

      if (error) {
        if (error.code !== '42P01') throw error;
      }
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching recent notes:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <button 
            className="btn btn-outline" 
            style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.875rem' }}
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ClipboardList color="var(--primary)" /> 
            Recent Notes
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Showing notes recorded in the last {days} {days === 1 ? 'day' : 'days'}.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="herd-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Date</th>
                <th style={{ width: '150px' }}>Animal Tag</th>
                <th>Journal Note</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="loading-spinner"></div>
                      Loading notes...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '12px', display: 'inline-block' }}>
                      <ClipboardList size={48} color="#CBD5E1" style={{ marginBottom: '12px' }} />
                      <p style={{ margin: 0, fontWeight: 500 }}>No notes recorded in the last {days} days.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="table-row-hover">
                    <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {log.date_recorded}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {log.animals ? (
                        <span 
                          onClick={() => navigate(`/herd/${log.animal_id}`, { state: { tab: 'journal' } })}
                          style={{ cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                          className="hover-underline"
                        >
                          {getAnimalIcon(log.animals.species, log.animals.breed, log.animals.sex)} {log.animals.tag_number}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Unknown Animal</span>
                      )}
                    </td>
                    <td style={{ lineHeight: 1.5 }}>
                      {log.note_text}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
