import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { ClipboardList, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getAnimalIcon } from '../utils';

/** Maximum number of journal notes displayed per page */
const PAGE_SIZE = 20;

export const RecentNotes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const daysParam = searchParams.get('days') || '7'; // Default to 7 days
  const isAll = daysParam === 'all';
  const days = isAll ? null : parseInt(daysParam, 10);
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Reset to page 1 when the date filter changes
    setPage(1);
  }, [daysParam]);

  useEffect(() => {
    fetchRecentNotes();
  }, [days, isAll, page]);

  const fetchRecentNotes = async () => {
    setLoading(true);
    try {
      // Calculate pagination range
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Build the base query
      let query = supabase
        .from('journal_logs')
        .select(`
          id,
          note_text,
          date_recorded,
          animal_id,
          animals ( id, tag_number, name, species, breed, sex )
        `, { count: 'exact' })
        .order('date_recorded', { ascending: false })
        .range(from, to);

      // Apply date filter unless "all" is selected
      if (!isAll && days !== null) {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);
        const isoDate = fromDate.toISOString().split('T')[0];
        query = query.gte('date_recorded', isoDate);
      }

      const { data, error, count } = await query;

      if (error) {
        if (error.code !== '42P01') throw error;
      }
      setLogs(data || []);
      setTotalCount(count ?? 0);
    } catch (err) {
      console.error('Error fetching recent notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  /** Human-readable description of the current filter */
  const filterLabel = isAll
    ? 'all time'
    : `the last ${days} ${days === 1 ? 'day' : 'days'}`;

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
            Showing notes recorded in {filterLabel}.
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
                      <p style={{ margin: 0, fontWeight: 500 }}>
                        {isAll
                          ? 'No journal notes recorded yet.'
                          : `No notes recorded in the last ${days} days.`}
                      </p>
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

        {/* Pagination controls */}
        {!loading && totalCount > PAGE_SIZE && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px', borderTop: '1px solid var(--border)',
          }}>
            <button
              className="btn btn-outline"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', fontSize: '0.875rem',
                opacity: page <= 1 ? 0.5 : 1,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Page {page} of {totalPages}
            </span>

            <button
              className="btn btn-outline"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', fontSize: '0.875rem',
                opacity: page >= totalPages ? 0.5 : 1,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
