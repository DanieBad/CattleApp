import { useState, useEffect } from 'react';

import { supabase } from '../supabase';
import { useSubscription } from '../context/SubscriptionContext';
import { ArrowRight, Mail, AlertTriangle, CheckCircle2, Loader2, TrendingUp, Database, Download, Mic } from 'lucide-react';

const PLANS = [
  { id: 'basic',        name: 'Basic',        animalLimit: 100,    priceZar: 75,  priceUsd: 5,  isSelfServe: true  },
  { id: 'intermediate', name: 'Intermediate', animalLimit: 500,    priceZar: 150, priceUsd: 10, isSelfServe: true  },
  { id: 'large',        name: 'Large',        animalLimit: 1000,   priceZar: 300, priceUsd: 20, isSelfServe: true  },
  { id: 'commercial',   name: 'Commercial',   animalLimit: 999999, priceZar: null, priceUsd: null, isSelfServe: false },
];

export const Billing = () => {
  const {
    planId, planName, status, animalLimit, activeAnimalCount,
    trialEndsAt, trialDaysRemaining, refreshSubscription
  } = useSubscription();

  const [switching, setSwitching] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState('');
  const [switchError, setSwitchError] = useState('');
  const [audioBytes, setAudioBytes] = useState<number | null>(null);
  const [exportingData, setExportingData] = useState(false);

  // Load audio storage usage from farm_settings
  useEffect(() => {
    const fetchStorage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('farm_settings')
        .select('audio_used_bytes')
        .eq('user_id', user.id)
        .single();
      setAudioBytes(data?.audio_used_bytes ?? 0);
    };
    fetchStorage();
  }, []);

  const usagePercent = animalLimit > 0 ? Math.min(100, (activeAnimalCount / animalLimit) * 100) : 0;
  const usageColor = usagePercent >= 90 ? '#EF4444' : usagePercent >= 70 ? '#F59E0B' : '#10B981';

  const handleSwitchPlan = async (newPlanId: string) => {
    if (newPlanId === planId) return;
    setSwitching(newPlanId);
    setSwitchError('');
    setSwitchSuccess('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: newPlanId,
          status: 'active',
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshSubscription();
      setSwitchSuccess(`Switched to ${PLANS.find(p => p.id === newPlanId)?.name} plan successfully.`);
      setTimeout(() => setSwitchSuccess(''), 4000);
    } catch (err: any) {
      setSwitchError(err.message || 'Failed to switch plans. Please try again.');
    } finally {
      setSwitching(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleExportCSV = async () => {
    setExportingData(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: animals } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!animals || animals.length === 0) { alert('No animal data to export.'); return; }

      // Build CSV
      const headers = Object.keys(animals[0]).join(',');
      const rows = animals.map(a =>
        Object.values(a).map(v => {
          const s = String(v ?? '');
          return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(',')
      );
      const csv = [headers, ...rows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healthyherd-animals-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingData(false);
    }
  };

  const formatTrialEnd = () => {
    if (!trialEndsAt) return '';
    return new Date(trialEndsAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const statusBadge = () => {
    const map: Record<string, { label: string; bg: string; color: string }> = {
      trialing:     { label: 'Free Trial', bg: '#DBEAFE', color: '#1D4ED8' },
      active:       { label: 'Active',     bg: '#D1FAE5', color: '#065F46' },
      grace_period: { label: 'Expired',    bg: '#FEE2E2', color: '#991B1B' },
      cancelled:    { label: 'Cancelled',  bg: '#F3F4F6', color: '#374151' },
    };
    const s = map[status ?? ''] ?? { label: status ?? '—', bg: '#F3F4F6', color: '#374151' };
    return (
      <span style={{ backgroundColor: s.bg, color: s.color, padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Billing & Subscription</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your plan and track your herd usage.</p>
      </div>

      {/* Status banners */}
      {status === 'grace_period' && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} color="#EF4444" />
          <div>
            <strong style={{ color: '#991B1B' }}>Your free trial has ended.</strong>
            <span style={{ color: '#B91C1C', marginLeft: '6px', fontSize: '0.9rem' }}>Select a plan below to continue adding animals.</span>
          </div>
        </div>
      )}
      {status === 'trialing' && trialDaysRemaining !== null && trialDaysRemaining <= 7 && (
        <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} color="#D97706" />
          <span style={{ color: '#92400E' }}>
            <strong>Trial ending soon:</strong> {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining (expires {formatTrialEnd()}).
          </span>
        </div>
      )}
      {switchSuccess && (
        <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span style={{ color: '#065F46', fontWeight: 500 }}>{switchSuccess}</span>
        </div>
      )}
      {switchError && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px 20px', marginBottom: '24px' }}>
          <span style={{ color: '#991B1B' }}>{switchError}</span>
        </div>
      )}

      {/* Current plan + usage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>Current Plan</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900 }}>{planName}</span>
            {statusBadge()}
          </div>
          {status === 'trialing' && trialEndsAt && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Trial ends on <strong>{formatTrialEnd()}</strong>
              {trialDaysRemaining !== null && ` (${trialDaysRemaining} days left)`}
            </p>
          )}
          {status === 'active' && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Plan active — payment integration coming soon.</p>}
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Herd Usage
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900 }}>{activeAnimalCount}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ {animalLimit >= 999999 ? 'Unlimited' : animalLimit.toLocaleString()} active animals</span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ height: '100%', width: `${usagePercent}%`, backgroundColor: usageColor, borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
          <p style={{ fontSize: '0.8rem', color: usageColor, fontWeight: 600 }}>
            {usagePercent >= 90 ? '⚠️ Near limit — consider upgrading' :
             usagePercent >= 70 ? '📈 Over 70% used' :
             `${animalLimit - activeAnimalCount} slots available`}
          </p>
        </div>
      </div>

      {/* Plan cards */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={20} color="var(--primary)" /> Available Plans
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {PLANS.map((plan) => {
          const isCurrent = plan.id === planId;
          const isLoading = switching === plan.id;

          return (
            <div
              key={plan.id}
              className="card"
              style={{
                padding: '24px',
                border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: isCurrent ? '0 4px 16px rgba(16,185,129,0.12)' : undefined,
                display: 'flex', flexDirection: 'column',
              }}
            >
              {isCurrent && (
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '6px' }}>
                  ✓ Current Plan
                </div>
              )}
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{plan.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
                {plan.id === 'commercial' ? '1,000+ animals' : `Up to ${plan.animalLimit.toLocaleString()} animals`}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px' }}>
                {plan.isSelfServe ? `R${plan.priceZar}` : 'Contact Us'}
                {plan.isSelfServe && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>}
              </div>

              {isCurrent ? (
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                  <CheckCircle2 size={16} /> Active plan
                </div>
              ) : plan.isSelfServe ? (
                <button
                  onClick={() => handleSwitchPlan(plan.id)}
                  disabled={!!switching}
                  style={{
                    marginTop: 'auto', width: '100%', padding: '10px',
                    backgroundColor: 'var(--primary)', color: 'white',
                    border: 'none', borderRadius: '8px', fontWeight: 600,
                    cursor: switching ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    fontSize: '0.875rem', opacity: switching ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><span>Switch Plan</span><ArrowRight size={14} /></>}
                </button>
              ) : (
                <button
                  onClick={() => setShowContactModal(true)}
                  style={{
                    marginTop: 'auto', width: '100%', padding: '10px',
                    backgroundColor: 'transparent', color: 'var(--primary)',
                    border: '1px solid var(--primary)', borderRadius: '8px',
                    fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <Mail size={14} /> Contact Sales
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Data & Storage */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={18} color="var(--primary)" /> Data & Storage
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {/* Animal records */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>🐄 Animal Records</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {activeAnimalCount.toLocaleString()} / {animalLimit >= 999999 ? 'Unlimited' : animalLimit.toLocaleString()}
              </span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (activeAnimalCount / Math.max(animalLimit, 1)) * 100)}%`,
                backgroundColor: usageColor, borderRadius: '3px', transition: 'width 0.5s'
              }} />
            </div>
          </div>

          {/* Audio notes */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                <Mic size={14} color="var(--text-muted)" /> Audio Notes
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {audioBytes !== null ? formatBytes(audioBytes) : '—'}
              </span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: audioBytes ? `${Math.min(100, (audioBytes / (50 * 1024 * 1024)) * 100)}%` : '0%',
                backgroundColor: '#6366F1', borderRadius: '3px', transition: 'width 0.5s'
              }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>50 MB included on all plans</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>Download Data Backup</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Export all animal records as a CSV file.</p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={exportingData}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'white',
              cursor: exportingData ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { if (!exportingData) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-main)'; }}
          >
            {exportingData ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Invoice placeholder */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Invoice History</h3>
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
          <p style={{ marginBottom: '8px' }}>No invoices yet.</p>
          <p style={{ fontSize: '0.85rem' }}>Payment integration coming soon — invoices will appear here.</p>
        </div>
      </div>

      {/* Commercial Modal */}
      {showContactModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}
          onClick={() => setShowContactModal(false)}
        >
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', maxWidth: '440px', width: '100%' }}>
            <Mail size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>Commercial Plan Enquiry</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              Designed for 1,000+ animals. We'll build a custom quote and walk you through onboarding personally.
            </p>
            <a
              href="mailto:info@healthyherd.app?subject=Commercial%20Plan%20Enquiry"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '13px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', marginBottom: '12px' }}
            >
              <Mail size={16} /> Email info@healthyherd.app
            </a>
            <button onClick={() => setShowContactModal(false)} style={{ width: '100%', padding: '11px', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
