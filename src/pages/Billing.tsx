import { useState, useEffect } from 'react';

import { supabase } from '../supabase';
import { useSubscription } from '../context/SubscriptionContext';
import { ArrowRight, Mail, AlertTriangle, CheckCircle2, Loader2, TrendingUp, Database, Download, Mic, Bell, MessageSquare, Trash2, RefreshCw, XCircle, AlertOctagon } from 'lucide-react';

const PLANS = [
  { id: 'basic',        name: 'Basic',        animalLimit: 100,    priceZar: 75,  priceUsd: 5,  isSelfServe: true  },
  { id: 'intermediate', name: 'Intermediate', animalLimit: 500,    priceZar: 150, priceUsd: 10, isSelfServe: true  },
  { id: 'large',        name: 'Large',        animalLimit: 1000,   priceZar: 300, priceUsd: 20, isSelfServe: true  },
  { id: 'commercial',   name: 'Commercial',   animalLimit: 999999, priceZar: null, priceUsd: null, isSelfServe: false },
];

export const Billing = () => {
  const {
    planId, planName, status, animalLimit, activeAnimalCount,
    trialEndsAt, trialDaysRemaining, cancellationEndsAt, isPendingCancellation,
    refreshSubscription
  } = useSubscription();

  const [switching, setSwitching] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [switchSuccess, setSwitchSuccess] = useState('');
  const [switchError, setSwitchError] = useState('');
  const [audioBytes, setAudioBytes] = useState<number | null>(null);
  const [exportingData, setExportingData] = useState(false);
  const [cancelStep, setCancelStep] = useState<0 | 1 | 2>(0); // 0=hidden,1=warning,2=confirm
  const [cancelling, setCancelling] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [cancelError, setCancelError] = useState('');

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

  const formatCancellationEnd = (iso?: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString('en-ZA', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Estimated end date shown in the step-2 modal before RPC is called
  const estimatedEndDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30); // TESTING_MODE: change to d.setDate(d.getDate() + 30)
    return formatCancellationEnd(d.toISOString());
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('cancel_subscription', { p_user_id: user.id });
      if (error) throw error;

      // Send cancellation email (notification to info@ + confirmation to user)
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('cancellation_ends_at')
        .eq('user_id', user.id)
        .single();

      await supabase.functions.invoke('send-cancellation-email', {
        body: {
          type: 'cancellation_initiated',
          userId: user.id,
          userEmail: user.email,
          cancellationEndsAt: sub?.cancellation_ends_at ?? new Date().toISOString(),
        },
      });

      await refreshSubscription();
      setCancelStep(0);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleResumeSubscription = async () => {
    setResuming(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.rpc('resume_subscription', { p_user_id: user.id });
      if (error) throw error;
      await refreshSubscription();
    } catch (err: any) {
      console.error('Resume failed:', err);
    } finally {
      setResuming(false);
    }
  };

  const statusBadge = () => {
    if (isPendingCancellation) {
      return <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>Cancelling</span>;
    }
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

      {/* System Messages */}
      <div className="card" style={{ padding: '20px', marginBottom: '28px', border: isPendingCancellation ? '1px solid #FECACA' : '1px solid #DBEAFE', backgroundColor: isPendingCancellation ? '#FFF5F5' : '#F0F9FF' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: isPendingCancellation ? '#DC2626' : '#1D4ED8' }}>
          <Bell size={18} />
          System Messages
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* High-priority cancellation notice */}
          {isPendingCancellation && cancellationEndsAt && (
            <div style={{ display: 'flex', gap: '12px', padding: '14px 16px', backgroundColor: 'white', borderRadius: '8px', border: '2px solid #FCA5A5', alignItems: 'flex-start' }}>
              <AlertOctagon size={18} style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '8px' }}>High Priority</span>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>Subscription Cancellation</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#7F1D1D', margin: '0 0 8px 0', fontWeight: 600 }}>
                  ⚠️ Your subscription has been cancelled. Access ends on <strong>{formatCancellationEnd(cancellationEndsAt)}</strong>.
                </p>
                <p style={{ fontSize: '0.85rem', color: '#991B1B', margin: '0 0 10px 0' }}>
                  Please export all your data before this date. All data will be permanently destroyed after 30 days.
                  You can resume your subscription at any time during this period.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={handleExportCSV} disabled={exportingData}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', border: '1px solid #FCA5A5', background: 'white', color: '#DC2626', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                    {exportingData ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Export Data
                  </button>
                  <button onClick={handleResumeSubscription} disabled={resuming}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '7px', border: 'none', background: '#10B981', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                    {resuming ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Resume Subscription
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Welcome message */}
          <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #BFDBFE', alignItems: 'flex-start' }}>
            <MessageSquare size={16} style={{ color: '#2563EB', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '2px', fontWeight: 600 }}>HealthyHerd Team · Welcome</div>
              <p style={{ fontSize: '0.875rem', color: '#1E3A5F', margin: 0 }}>
                Thank you for joining the HealthyHerd beta! We'd love your feedback — use Help &amp; Support to report any issues or suggest improvements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current plan + usage */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="card" style={{ padding: '24px', border: isPendingCancellation ? '2px solid #F87171' : undefined }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>Current Plan</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 900 }}>{planName}</span>
            {statusBadge()}
          </div>
          {isPendingCancellation && cancellationEndsAt ? (
            <>
              <p style={{ color: '#DC2626', fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>
                Access ends: <strong>{formatCancellationEnd(cancellationEndsAt)}</strong>
              </p>
              <button onClick={handleResumeSubscription} disabled={resuming}
                style={{ width: '100%', padding: '10px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: resuming ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.875rem', marginBottom: '8px' }}>
                {resuming ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Resume Subscription
              </button>
            </>
          ) : status === 'cancelled' ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Your subscription has ended. Contact us to reactivate.</p>
          ) : (
            <>
              {status === 'trialing' && trialEndsAt && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Trial ends on <strong>{formatTrialEnd()}</strong>
                  {trialDaysRemaining !== null && ` (${trialDaysRemaining} days left)`}
                </p>
              )}
              {status === 'active' && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Plan active — payment integration coming soon.</p>}
              {(status === 'active' || status === 'trialing') && (
                <button onClick={() => setCancelStep(1)}
                  style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #FCA5A5', background: 'white', color: '#DC2626', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                  <Trash2 size={14} /> Cancel Subscription
                </button>
              )}
            </>
          )}
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

      {/* ── Cancellation Modal Step 1 — Warning ─────────────────────────────── */}
      {cancelStep === 1 && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}
          onClick={() => setCancelStep(0)}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '36px', maxWidth: '460px', width: '100%' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <AlertTriangle size={26} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '12px', color: '#111827' }}>Cancel Your Subscription?</h2>
            <p style={{ color: '#4B5563', marginBottom: '14px', lineHeight: 1.6 }}>If you cancel:</p>
            <ul style={{ color: '#4B5563', paddingLeft: '20px', marginBottom: '24px', lineHeight: 2 }}>
              <li>All your data will be <strong>permanently deleted</strong> 30 days after cancellation</li>
              <li>You can <strong>resume at any time</strong> during the 30-day period to avoid any data loss</li>
            </ul>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCancelStep(0)}
                style={{ flex: 1, padding: '11px', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600 }}>
                ← Go Back
              </button>
              <button onClick={() => setCancelStep(2)}
                style={{ flex: 1, padding: '11px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', cursor: 'pointer', color: '#DC2626', fontWeight: 700 }}>
                I Understand →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancellation Modal Step 2 — Final Confirmation ───────────────────── */}
      {cancelStep === 2 && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}
          onClick={() => !cancelling && setCancelStep(0)}>
          <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '36px', maxWidth: '460px', width: '100%' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <XCircle size={26} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '12px', color: '#111827' }}>Are You Sure?</h2>
            <p style={{ color: '#4B5563', lineHeight: 1.6, marginBottom: '12px' }}>
              This will begin your 30-day cancellation period. After 30 days, your account will be deactivated and <strong>all data will be permanently deleted</strong>.
            </p>
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#991B1B', fontWeight: 600 }}>
                📅 Your access will end on: <strong>{estimatedEndDate()}</strong>
              </p>
            </div>
            {cancelError && (
              <p style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '12px' }}>{cancelError}</p>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCancelStep(1)} disabled={cancelling}
                style={{ flex: 1, padding: '11px', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', cursor: cancelling ? 'not-allowed' : 'pointer', color: 'var(--text-muted)', fontWeight: 600, opacity: cancelling ? 0.6 : 1 }}>
                ← Go Back
              </button>
              <button onClick={handleCancelSubscription} disabled={cancelling}
                style={{ flex: 1, padding: '11px', backgroundColor: '#EF4444', border: 'none', borderRadius: '10px', cursor: cancelling ? 'not-allowed' : 'pointer', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: cancelling ? 0.7 : 1 }}>
                {cancelling ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Yes, Cancel My Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
