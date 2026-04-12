import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { PackagePlus, PackageMinus, ChevronRight, ChevronDown, ChevronUp, Edit2, Loader2, Save, X, ExternalLink } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────
interface SaleRecord {
  id: string;
  transaction_type: string;
  party_name: string | null;
  farm_name: string | null;
  party_gln: string | null;
  gln_certificate_url: string | null;
  gps_coordinates: string | null;
  permit_number: string | null;
  permit_url: string | null;
  transaction_date: string | null;
  created_at: string;
  animal_count: number;
  total_value: number;
}

interface EditForm {
  party_name: string;
  farm_name: string;
  party_gln: string;
  gps_coordinates: string;
  permit_number: string;
  transaction_date: string;
}

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtCurrency = (v: number) =>
  v > 0 ? `R ${v.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : '—';

export const BuySell = () => {
  const navigate = useNavigate();

  const [records, setRecords]     = useState<SaleRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<SaleRecord | null>(null);
  const [editForm, setEditForm]   = useState<EditForm | null>(null);
  const [isSaving, setIsSaving]   = useState(false);

  // ── Fetch transactions ────────────────────────────────────
  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const { data, error } = await supabase
        .from('sale_records')
        .select('*, animal_sale_links(sale_price)')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      const mapped: SaleRecord[] = (data || []).map((r: any) => ({
        id: r.id,
        transaction_type: r.transaction_type,
        party_name: r.party_name,
        farm_name: r.farm_name,
        party_gln: r.party_gln,
        gln_certificate_url: r.gln_certificate_url,
        gps_coordinates: r.gps_coordinates,
        permit_number: r.permit_number,
        permit_url: r.permit_url,
        transaction_date: r.transaction_date,
        created_at: r.created_at,
        animal_count: r.animal_sale_links?.length ?? 0,
        // Sum sale_price for Sell records; for Buy records prices come from the animal record
        total_value: (r.animal_sale_links || []).reduce((s: number, l: any) => s + (l.sale_price || 0), 0),
      }));

      setRecords(mapped);
    } catch (err) {
      console.error('Failed to load sale records:', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  // ── Edit helpers ──────────────────────────────────────────
  const openEdit = (rec: SaleRecord) => {
    setEditingRecord(rec);
    setEditForm({
      party_name: rec.party_name || '',
      farm_name: rec.farm_name || '',
      party_gln: rec.party_gln || '',
      gps_coordinates: rec.gps_coordinates || '',
      permit_number: rec.permit_number || '',
      transaction_date: rec.transaction_date || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRecord || !editForm) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('sale_records').update({
        party_name: editForm.party_name || null,
        farm_name: editForm.farm_name || null,
        party_gln: editForm.party_gln || null,
        gps_coordinates: editForm.gps_coordinates || null,
        permit_number: editForm.permit_number || null,
        transaction_date: editForm.transaction_date || null,
      }).eq('id', editingRecord.id);

      if (error) throw error;
      setEditingRecord(null);
      setEditForm(null);
      await fetchRecords();
    } catch (err: any) {
      alert(`Failed to update: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isBuy = (r: SaleRecord) => r.transaction_type === 'Buy';

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Buy / Sell</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Record animal purchases or sales with full traceability documentation.
          </p>
        </div>
      </div>

      {/* ── Option cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '780px', marginBottom: '48px' }}>
        {/* Buying card */}
        <button onClick={() => navigate('/buy-sell/buy')} className="card"
          style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', border: '2px solid transparent', textAlign: 'left', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', transition: 'all 0.2s', width: '100%' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(16,185,129,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <PackagePlus size={28} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#065F46', marginBottom: '6px' }}>① Buying Animals</div>
            <div style={{ color: '#047857', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Capture seller traceability info, register new animals and link them to the purchase record.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px' }}>
            Start Buying <ChevronRight size={16} />
          </div>
        </button>

        {/* Selling card */}
        <button onClick={() => navigate('/buy-sell/sell')} className="card"
          style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', cursor: 'pointer', border: '2px solid transparent', textAlign: 'left', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', transition: 'all 0.2s', width: '100%' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(59,130,246,0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <PackageMinus size={28} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#1e40af', marginBottom: '6px' }}>② Selling Animals</div>
            <div style={{ color: '#1d4ed8', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Capture buyer traceability info, select animals from your herd, set per-animal price and mark as Sold.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px' }}>
            Start Selling <ChevronRight size={16} />
          </div>
        </button>
      </div>

      {/* ── Previous Transactions ── */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Previous Transactions
          {!loadingRecords && <span style={{ backgroundColor: '#F1F5F9', color: 'var(--text-muted)', borderRadius: '12px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 600 }}>{records.length}</span>}
        </h2>

        {loadingRecords ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Loader2 size={20} /> Loading transactions…
          </div>
        ) : records.length === 0 ? (
          <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No transactions recorded yet. Use the cards above to start.
          </div>
        ) : (
          <div className="card">
            <div className="table-container">
              <table className="herd-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Party / Farm</th>
                    <th>Animals</th>
                    <th>Total Value</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(rec => (
                    <>
                      {/* Main row */}
                      <tr key={rec.id} className="table-row-hover" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{fmtDate(rec.transaction_date || rec.created_at)}</td>
                        <td>
                          <span style={{
                            backgroundColor: isBuy(rec) ? '#D1FAE5' : '#DBEAFE',
                            color: isBuy(rec) ? '#065F46' : '#1e40af',
                            borderRadius: '12px', padding: '3px 10px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap',
                          }}>
                            {isBuy(rec) ? '📥 Buy' : '📤 Sell'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{rec.party_name || '—'}</div>
                          {rec.farm_name && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rec.farm_name}</div>}
                        </td>
                        <td style={{ fontWeight: 600 }}>{rec.animal_count}</td>
                        <td style={{ fontWeight: 600, color: isBuy(rec) ? 'var(--primary)' : '#2563eb' }}>
                          {fmtCurrency(rec.total_value)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                            <button
                              title="Edit party info"
                              onClick={() => openEdit(rec)}
                              style={{ background: 'var(--bg-off)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', transition: 'all 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E2E8F0'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-off)'}
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              title={expandedId === rec.id ? 'Collapse' : 'View details'}
                              onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                              style={{ background: 'var(--bg-off)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              {expandedId === rec.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Details
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {expandedId === rec.id && (
                        <tr key={`${rec.id}-expand`}>
                          <td colSpan={6} style={{ padding: 0, backgroundColor: '#F8FAFC', borderBottom: '2px solid var(--border)' }}>
                            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                              {[
                                ['Party Name', rec.party_name],
                                ['Farm Name', rec.farm_name],
                                ['GLN', rec.party_gln],
                                ['GPS Coordinates', rec.gps_coordinates],
                                ['Permit No', rec.permit_number],
                                ['Transaction Date', fmtDate(rec.transaction_date)],
                              ].map(([label, val]) => val && (
                                <div key={label as string}>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{label}</div>
                                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{val}</div>
                                </div>
                              ))}
                              {rec.gln_certificate_url && (
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>GLN Certificate</div>
                                  <a href={rec.gln_certificate_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View File <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}
                              {rec.permit_url && (
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>Permit Document</div>
                                  <a href={rec.permit_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    View File <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingRecord && editForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '520px', backgroundColor: 'white', padding: '28px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => { setEditingRecord(null); setEditForm(null); }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={22} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.4rem' }}>{isBuy(editingRecord) ? '📥' : '📤'}</span>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Edit Transaction</h2>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {isBuy(editingRecord) ? 'Seller' : 'Buyer'} Info · {fmtDate(editingRecord.transaction_date || editingRecord.created_at)}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {([
                ['party_name', 'Name / Company Name', 'text', 'e.g. Smith Farms (Pty) Ltd'],
                ['farm_name', 'Farm Name', 'text', 'e.g. Rooiwater Plaas'],
                ['party_gln', 'Legal Entity GLN', 'text', 'e.g. 6001234567890'],
                ['gps_coordinates', 'GPS Coordinates', 'text', '-29.1234, 26.5678'],
                ['permit_number', 'Permit No (FMD / Red Cross)', 'text', 'e.g. FMD-2026-00123'],
                ['transaction_date', isBuy(editingRecord) ? 'Date of Arrival' : 'Date Leaving Farm', 'date', ''],
              ] as [keyof EditForm, string, string, string][]).map(([field, label, type, placeholder]) => (
                <div key={field} className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    className="form-input"
                    placeholder={placeholder}
                    value={editForm[field]}
                    onChange={e => setEditForm(prev => prev ? { ...prev, [field]: e.target.value } : prev)}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <button className="btn btn-outline" onClick={() => { setEditingRecord(null); setEditForm(null); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveEdit} disabled={isSaving}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSaving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
