import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import {
  Users, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, XCircle, Search, RefreshCw, Edit3, X, Save,
  Loader2, BarChart3
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface UserRow {
  user_id: string;
  email: string;
  display_name: string | null;
  joined_at: string;
  last_sign_in: string | null;
  plan_id: string;
  plan_name: string;
  sub_status: string;
  trial_ends_at: string | null;
  activated_at: string | null;
  animal_count: number;
}

interface OverrideForm {
  userId: string;
  email: string;
  planId: string;
  status: string;
  trialEndsAt: string;
}

const PLANS = ['basic', 'intermediate', 'large', 'commercial'];
const STATUSES = ['trialing', 'active', 'grace_period', 'cancelled'];

const statusMeta: Record<string, { label: string; bg: string; color: string; icon: any }> = {
  trialing:        { label: 'Trialing',    bg: '#DBEAFE', color: '#1D4ED8', icon: Clock },
  active:          { label: 'Active',      bg: '#D1FAE5', color: '#065F46', icon: CheckCircle2 },
  grace_period:    { label: 'Expired',     bg: '#FEE2E2', color: '#991B1B', icon: AlertTriangle },
  cancelled:       { label: 'Cancelled',   bg: '#F3F4F6', color: '#6B7280', icon: XCircle },
  no_subscription: { label: 'No Sub',      bg: '#FEF9C3', color: '#92400E', icon: AlertTriangle },
};

const fmt = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Component ──────────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions'>('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editRow, setEditRow] = useState<OverrideForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.rpc('get_admin_user_overview');
      setUsers((userData as UserRow[]) ?? []);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = {
    total:       users.length,
    trialing:    users.filter(u => u.sub_status === 'trialing').length,
    active:      users.filter(u => u.sub_status === 'active').length,
    expired:     users.filter(u => ['grace_period', 'cancelled'].includes(u.sub_status)).length,
    totalAnimals: users.reduce((s, u) => s + (u.animal_count ?? 0), 0),
  };

  const recentSignups = [...users]
    .sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())
    .slice(0, 8);

  const planDist = PLANS.map(p => ({
    id: p,
    name: p.charAt(0).toUpperCase() + p.slice(1),
    count: users.filter(u => u.plan_id === p).length,
  }));
  const maxPlanCount = Math.max(...planDist.map(p => p.count), 1);

  // ── Filtered subscription table ───────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.display_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.sub_status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Override handler ──────────────────────────────────────────────────────
  const openEdit = (u: UserRow) => {
    setEditRow({
      userId: u.user_id,
      email: u.email,
      planId: u.plan_id === 'none' ? 'basic' : u.plan_id,
      status: u.sub_status === 'no_subscription' ? 'trialing' : u.sub_status,
      trialEndsAt: u.trial_ends_at ? u.trial_ends_at.split('T')[0] : '',
    });
  };

  const handleSaveOverride = async () => {
    if (!editRow) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const { error } = await supabase.rpc('admin_update_subscription', {
        p_user_id:       editRow.userId,
        p_plan_id:       editRow.planId,
        p_status:        editRow.status,
        p_trial_ends_at: editRow.trialEndsAt ? new Date(editRow.trialEndsAt).toISOString() : null,
      });
      if (error) throw error;
      setSaveMsg('Saved!');
      setTimeout(() => setEditRow(null), 1000);
      await fetchAll();
    } catch (err: any) {
      setSaveMsg(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const th: React.CSSProperties = {
    textAlign: 'left', padding: '10px 16px',
    fontSize: '0.72rem', fontWeight: 700,
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.06em', whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = { padding: '13px 16px', fontSize: '0.875rem', verticalAlign: 'middle' };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
      <Loader2 className="animate-spin" size={24} /> Loading admin data...
    </div>
  );

  return (
    <div className="fade-in">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck color="var(--primary)" size={26} /> Admin Console
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Subscriptions and activity overview.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={fetchAll}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total Users',    value: kpis.total,        icon: Users,        color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Trialing',       value: kpis.trialing,     icon: Clock,        color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Paid Active',    value: kpis.active,       icon: CheckCircle2, color: '#059669', bg: '#D1FAE5' },
          { label: 'Expired/Lapsed', value: kpis.expired,      icon: AlertTriangle,color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Total Animals',  value: kpis.totalAnimals, icon: BarChart3,    color: '#D97706', bg: '#FEF3C7' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: bg, padding: '10px', borderRadius: '10px', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.2 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {(['overview', 'subscriptions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              marginBottom: '-1px', transition: 'all 0.15s', textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ────────────────────── TAB: OVERVIEW ────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Recent Signups */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', gridColumn: '1' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="var(--primary)" /> Recent Signups
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest {recentSignups.length}</span>
            </div>
            <div>
              {recentSignups.map((u) => {
                const sm = statusMeta[u.sub_status] ?? statusMeta.no_subscription;
                return (
                  <div key={u.user_id} style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Avatar */}
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                      {(u.display_name || u.email).substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.display_name || u.email.split('@')[0]}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span style={{ backgroundColor: sm.bg, color: sm.color, padding: '2px 8px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 700 }}>
                        {u.plan_name}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{fmt(u.joined_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--primary)" /> Plan Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {planDist.map(p => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{p.count} user{p.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: '7px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(p.count / maxPlanCount) * 100}%`, backgroundColor: 'var(--primary)', borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                Status Breakdown
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {Object.entries(statusMeta).map(([key, meta]) => {
                  const count = users.filter(u => u.sub_status === key).length;
                  if (count === 0) return null;
                  const Icon = meta.icon;
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: meta.bg, color: meta.color, padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                      <Icon size={12} /> {meta.label} · {count}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── TAB: SUBSCRIPTIONS ──────────────────────────── */}
      {activeTab === 'subscriptions' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#F8FAFC' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="form-input"
                placeholder="Search email or name..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '32px', height: '38px', backgroundColor: 'white' }}
              />
            </div>
            <select
              className="form-input"
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ width: 'auto', height: '38px', paddingRight: '32px' }}
            >
              <option value="all">All statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{statusMeta[s]?.label ?? s}</option>)}
            </select>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {filteredUsers.length} of {users.length}
            </span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F1F5F9' }}>
                <tr>
                  {['User', 'Plan', 'Status', 'Animals', 'Trial Ends', 'Joined', ''].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...td, textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No users match your filter.</td></tr>
                ) : filteredUsers.map(u => {
                  const sm = statusMeta[u.sub_status] ?? statusMeta.no_subscription;
                  const StatusIcon = sm.icon;
                  return (
                    <tr key={u.user_id} style={{ borderBottom: '1px solid #F1F5F9' }}
                      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                      onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={td}>
                        <div style={{ fontWeight: 600 }}>{u.display_name || u.email.split('@')[0]}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={td}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{u.plan_name}</span>
                      </td>
                      <td style={td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: sm.bg, color: sm.color, padding: '3px 9px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                          <StatusIcon size={11} /> {sm.label}
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{u.animal_count}</td>
                      <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{fmt(u.trial_ends_at)}</td>
                      <td style={{ ...td, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{fmt(u.joined_at)}</td>
                      <td style={td}>
                        <button
                          onClick={() => openEdit(u)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border)', borderRadius: '6px', background: 'white', padding: '5px 10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', transition: 'all 0.15s' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Override Modal ───────────────────────────────────────────────── */}
      {editRow && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
          onClick={() => setEditRow(null)}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={17} color="var(--primary)" /> Override Subscription
              </h3>
              <button onClick={() => setEditRow(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', padding: '8px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px' }}>
              🛡️ <strong>{editRow.email}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Plan</label>
                <select className="form-input" value={editRow.planId} onChange={e => setEditRow({ ...editRow, planId: e.target.value })}>
                  {PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select className="form-input" value={editRow.status} onChange={e => setEditRow({ ...editRow, status: e.target.value })}>
                  {STATUSES.map(s => <option key={s} value={s}>{statusMeta[s]?.label ?? s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Trial Ends At <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                <input type="date" className="form-input" value={editRow.trialEndsAt} onChange={e => setEditRow({ ...editRow, trialEndsAt: e.target.value })} />
              </div>
            </div>

            {saveMsg && (
              <div style={{ marginTop: '12px', fontSize: '0.82rem', color: saveMsg === 'Saved!' ? '#059669' : 'var(--danger)', padding: '8px 12px', borderRadius: '6px', backgroundColor: saveMsg === 'Saved!' ? '#ECFDF5' : '#FEF2F2' }}>
                {saveMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditRow(null)} style={{ flex: 1, padding: '11px', border: '1px solid var(--border)', borderRadius: '8px', background: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}>
                Cancel
              </button>
              <button onClick={handleSaveOverride} disabled={saving} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '11px' }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={15} /> Save Override</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
