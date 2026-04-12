import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useSubscription } from '../context/SubscriptionContext';
import {
  User, Mail, Home, Save, Loader2, CheckCircle2,
  Eye, EyeOff, Lock, ArrowRight, KeyRound, AlertCircle
} from 'lucide-react';

export const Profile = () => {
  const navigate = useNavigate();
  const { planName, status, trialEndsAt } = useSubscription();

  // ── Identity state ──────────────────────────────────────────────────────────
  const [email, setEmail]           = useState('');
  const [displayName, setDisplayName] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [farmName, setFarmName]     = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg]       = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Password state ──────────────────────────────────────────────────────────
  const [showPwSection, setShowPwSection]   = useState(false);
  const [currentPw, setCurrentPw]           = useState('');
  const [newPw, setNewPw]                   = useState('');
  const [confirmPw, setConfirmPw]           = useState('');
  const [showPw, setShowPw]               = useState(false);
  const [savingPw, setSavingPw]             = useState(false);
  const [pwMsg, setPwMsg]                   = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ── Load user data ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? '');
      setMemberSince(
        new Date(user.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
      );

      // Display name: user_metadata first, fallback to email prefix
      const meta = user.user_metadata?.display_name;
      setDisplayName(meta || user.email?.split('@')[0] || '');

      // Farm name from farm_settings
      const { data: farm } = await supabase
        .from('farm_settings')
        .select('farm_name')
        .eq('user_id', user.id)
        .single();
      setFarmName(farm?.farm_name ?? '—');
    };
    load();
  }, []);

  // ── Save display name ───────────────────────────────────────────────────────
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSavingName(true);
    setNameMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName.trim() },
      });
      if (error) throw error;
      setNameMsg({ type: 'success', text: 'Display name updated.' });
    } catch (err: any) {
      setNameMsg({ type: 'error', text: err.message || 'Failed to update name.' });
    } finally {
      setSavingName(false);
      setTimeout(() => setNameMsg(null), 4000);
    }
  };

  // ── Change password ─────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPw.length < 6)  { setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' }); return; }
    if (newPw !== confirmPw) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }

    setSavingPw(true);
    try {
      // Step 1: Re-authenticate with current password to verify identity
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPw,
      });
      if (signInErr) {
        setPwMsg({ type: 'error', text: 'Current password is incorrect.' });
        return;
      }

      // Step 2: Update to new password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPw });
      if (updateErr) throw updateErr;

      setPwMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowPwSection(false);
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setSavingPw(false);
    }
  };

  const strengthOf = (pw: string) => {
    if (pw.length === 0) return null;
    if (pw.length < 6)  return { label: 'Too short', color: '#EF4444', w: '25%' };
    if (pw.length < 8)  return { label: 'Weak',      color: '#F59E0B', w: '50%' };
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Fair', color: '#3B82F6', w: '75%' };
    return { label: 'Strong', color: '#10B981', w: '100%' };
  };
  const strength = strengthOf(newPw);

  const statusLabel: Record<string, string> = {
    trialing:     'Free Trial',
    active:       'Active',
    grace_period: 'Expired',
    cancelled:    'Cancelled',
  };

  return (
    <div className="fade-in" style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your personal information and account security.</p>
      </div>

      {/* ── Identity Card ─────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="var(--primary)" /> Identity
        </h2>

        <form onSubmit={handleSaveName}>
          {/* Display name */}
          <div className="form-group">
            <label className="form-label" htmlFor="displayName">Display Name</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <input
                id="displayName"
                className="form-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your name"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingName}
                style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}
              >
                {savingName ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} /> Save</>}
              </button>
            </div>
            {nameMsg && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: nameMsg.type === 'success' ? '#059669' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {nameMsg.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {nameMsg.text}
              </div>
            )}
          </div>

          {/* Email — read-only */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="email"
                className="form-input"
                value={email}
                readOnly
                style={{ paddingLeft: '36px', backgroundColor: '#F9FAFB', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Email cannot be changed directly. Contact support if needed.</p>
          </div>
        </form>

        {/* Farm — read-only */}
        <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
          <label className="form-label">Farm</label>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px 14px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Home size={15} color="var(--text-muted)" />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{farmName}</span>
            </div>
            <button
              onClick={() => navigate('/settings')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              Edit in Settings <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Password Card ─────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--primary)" /> Password & Security
          </h2>
          <button
            onClick={() => { setShowPwSection(s => !s); setPwMsg(null); }}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px', padding: '7px 14px',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--text-main)', transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <KeyRound size={14} />
            {showPwSection ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {!showPwSection && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '12px' }}>
            Your password was last set when you created your account. Click "Change Password" to update it.
          </p>
        )}

        {showPwSection && (
          <form onSubmit={handleChangePassword} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pwMsg && (
              <div style={{
                padding: '12px 16px', borderRadius: '8px', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: pwMsg.type === 'success' ? '#ECFDF5' : 'rgba(239,68,68,0.06)',
                color: pwMsg.type === 'success' ? '#065F46' : 'var(--danger)',
                border: `1px solid ${pwMsg.type === 'success' ? '#A7F3D0' : 'rgba(239,68,68,0.2)'}`,
              }}>
                {pwMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                {pwMsg.text}
              </div>
            )}

            {/* Current password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="currentPw">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="currentPw" type={showPw ? 'text' : 'password'}
                  className="form-input" required
                  placeholder="Enter current password"
                  style={{ paddingRight: '44px' }}
                  value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="newPw">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="newPw" type={showPw ? 'text' : 'password'}
                  className="form-input" required
                  placeholder="Min. 6 characters"
                  style={{ paddingRight: '44px' }}
                  value={newPw} onChange={e => setNewPw(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: '5px' }}>
                  <div style={{ height: '3px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.w, backgroundColor: strength.color, transition: 'all 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm new password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="confirmPw">Confirm New Password</label>
              <input
                id="confirmPw" type={showPw ? 'text' : 'password'}
                className="form-input" required
                placeholder="Re-enter new password"
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                style={{ borderColor: confirmPw && confirmPw !== newPw ? 'var(--danger)' : undefined }}
              />
              {confirmPw && confirmPw !== newPw && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Passwords don't match</span>
              )}
            </div>

            <button
              type="submit" className="btn btn-primary"
              disabled={savingPw}
              style={{ justifyContent: 'center', padding: '12px', marginTop: '4px' }}
            >
              {savingPw ? <Loader2 size={17} className="animate-spin" /> : <><Lock size={15} /> Update Password</>}
            </button>
          </form>
        )}
      </div>

      {/* ── Account Info Card ─────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Account Info</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <InfoRow label="Member since" value={memberSince} />
          <InfoRow label="Plan" value={`${planName} · ${statusLabel[status ?? ''] ?? '—'}`} />
          {trialEndsAt && status === 'trialing' && (
            <InfoRow label="Trial ends" value={new Date(trialEndsAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })} />
          )}
          <div style={{ paddingTop: '4px' }}>
            <button
              onClick={() => navigate('/billing')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
            >
              Manage plan & billing <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{value}</span>
  </div>
);
