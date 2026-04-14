import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Check, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import logo from '../assets/Logo.png';
import { useIsMobile } from '../hooks/useIsMobile';

interface PlanMeta {
  id: string;
  name: string;
  animalLimit: number;
  priceZar: number | null;
  priceUsd: number | null;
}

const PLAN_META: Record<string, PlanMeta> = {
  basic:        { id: 'basic',        name: 'Basic',        animalLimit: 100,    priceZar: 75,   priceUsd: 5   },
  intermediate: { id: 'intermediate', name: 'Intermediate', animalLimit: 500,    priceZar: 150,  priceUsd: 10  },
  large:        { id: 'large',        name: 'Large',        animalLimit: 1000,   priceZar: 300,  priceUsd: 20  },
};

export const Signup = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'basic';

  const plan = PLAN_META[planId];
  useEffect(() => {
    if (!plan) navigate('/plans', { replace: true });
  }, [plan, navigate]);

  const [isSouthAfrica, setIsSouthAfrica] = useState(true);
  useEffect(() => {
    setIsSouthAfrica(Intl.DateTimeFormat().resolvedOptions().timeZone === 'Africa/Johannesburg');
  }, []);

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [agreedToBeta, setAgreedToBeta] = useState(false);

  if (!plan) return null;

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6)  return { label: 'Too short', color: '#EF4444', width: '25%' };
    if (password.length < 8)  return { label: 'Weak',      color: '#F59E0B', width: '50%' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Fair', color: '#3B82F6', width: '75%' };
    return { label: 'Strong', color: '#10B981', width: '100%' };
  };
  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!agreedToBeta) { setError('Please agree to the Beta disclaimer.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 6)    { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      const userId = data.user?.id;
      if (!userId) throw new Error('User ID not returned from sign-up.');

      const { error: rpcError } = await supabase.rpc('provision_subscription', {
        p_user_id: userId,
        p_plan_id: planId,
      });
      if (rpcError) console.warn('Subscription provision warning:', rpcError.message);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared styles ───────────────────────────────────────────────────────────
  const cardBase: React.CSSProperties = {
    backgroundColor: 'white',
    padding: isMobile ? '24px 20px' : '36px 32px',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        backgroundColor: 'white', borderBottom: '1px solid var(--border)',
        padding: isMobile ? '12px 16px' : '16px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <img src={logo} alt="HealthyHerd" style={{ height: isMobile ? '36px' : '44px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.1)', 
              color: '#3B82F6', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '0.65rem', 
              fontWeight: 800,
              border: '1px solid rgba(59, 130, 246, 0.2)',
              textTransform: 'uppercase'
            }}>
              Beta
            </span>
            <ArrowLeft size={16} />
            {isMobile ? 'Plans' : 'View all plans'}
          </div>
        </Link>
      </header>

      {/* ── Success screen ─────────────────────────────────────────────────── */}
      {success ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
          <div className="card fade-in" style={{ maxWidth: '440px', width: '100%', padding: isMobile ? '32px 24px' : '48px 40px', textAlign: 'center' }}>
            <CheckCircle2 size={isMobile ? 44 : 56} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 800, marginBottom: '12px' }}>You're in!</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '8px' }}>
              Your <strong>{plan.name}</strong> account has been created and your 30-day free trial has started.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px', fontSize: '0.9rem' }}>
              Check your email to confirm your address, then sign in.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
            >
              Go to Sign In
            </button>
          </div>
        </div>
      ) : (
        /* ── Two-pane layout — stacks on mobile ──────────────────────────── */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          maxWidth: isMobile ? '100%' : '960px',
          margin: isMobile ? '0' : '48px auto',
          width: '100%',
          padding: isMobile ? '0' : '0 20px',
          alignItems: 'stretch',
        }}>

          {/* Left — Plan summary */}
          <div style={{
            ...cardBase,
            borderRadius: isMobile ? '0' : '16px 0 0 16px',
            border: isMobile ? 'none' : '1px solid var(--border)',
            borderRight: isMobile ? 'none' : 'none',
            borderBottom: isMobile ? '1px solid var(--border)' : 'none',
            flexShrink: 0,
            width: isMobile ? '100%' : undefined,
          }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '6px' }}>
              Your plan
            </p>

            {/* Compact plan header on mobile / full on desktop */}
            {isMobile ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0 0 2px' }}>{plan.name}</h2>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Up to {plan.animalLimit.toLocaleString()} animals
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>
                    {isSouthAfrica ? `R${plan.priceZar}` : `$${plan.priceUsd}`}
                    <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>
                  </div>
                  {planId === 'basic' && (
                    <div style={{
                      display: 'inline-block', backgroundColor: 'rgba(16,185,129,0.08)',
                      color: 'var(--primary)', borderRadius: '20px', padding: '2px 10px',
                      fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      30-day free trial
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Desktop: vertical plan summary */
              <>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '4px' }}>{plan.name}</h2>
                <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Up to {plan.animalLimit.toLocaleString()} animals
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '4px' }}>
                  {isSouthAfrica ? `R${plan.priceZar}` : `$${plan.priceUsd}`}
                  <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
                </div>
                {planId === 'basic' && (
                  <div style={{
                    display: 'inline-block', backgroundColor: 'rgba(16,185,129,0.08)',
                    color: 'var(--primary)', borderRadius: '20px', padding: '4px 12px',
                    fontSize: '0.75rem', fontWeight: 600, marginBottom: '24px',
                  }}>
                    30-day free trial included
                  </div>
                )}
              </>
            )}

            {/* Feature list — condensed on mobile */}
            <ul style={{
              listStyle: 'none', padding: 0,
              margin: isMobile ? '0' : '0 0 32px',
              display: isMobile ? 'grid' : 'flex',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined,
              flexDirection: isMobile ? undefined : 'column',
              gap: isMobile ? '8px' : '10px',
            }}>
              {['No credit card required', 'Cancel anytime', 'FMD compliance built-in', 'AI voice assistant'].map((item) => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                  <Check size={13} color="var(--primary)" style={{ flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>

            {!isMobile && (
              <Link to="/plans" style={{ marginTop: '32px', fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={12} /> Change plan
              </Link>
            )}
          </div>

          {/* Right — Sign-up form */}
          <div style={{
            ...cardBase,
            borderRadius: isMobile ? '0' : '0 16px 16px 0',
            border: isMobile ? 'none' : '1px solid var(--border)',
            borderLeft: isMobile ? 'none' : '1px solid #F3F4F6',
            flex: 1,
          }}>
            <div style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.05)', 
              border: '1px solid rgba(59, 130, 246, 0.2)', 
              borderRadius: '8px', 
              padding: '12px', 
              marginBottom: '24px', 
              fontSize: '0.875rem', 
              color: '#1E40AF',
              fontWeight: 500
            }}>
              🚀 <strong>Beta Phase:</strong> No credit card required. No charges will be applicable until the official release.
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(239,68,68,0.08)', color: 'var(--danger)',
                border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
                padding: '12px 16px', marginBottom: '20px', fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email" type="email" required className="form-input"
                  placeholder="farmer@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ fontSize: isMobile ? '1rem' : undefined }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required className="form-input"
                    placeholder="Min. 6 characters"
                    style={{ paddingRight: '44px', fontSize: isMobile ? '1rem' : undefined }}
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button" onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      padding: '4px', /* larger tap target */
                    }}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {strength && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ height: '3px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'all 0.3s' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="confirmPw">Confirm Password</label>
                <input
                  id="confirmPw"
                  type={showPw ? 'text' : 'password'}
                  required className="form-input"
                  placeholder="Re-enter password"
                  value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                  style={{
                    borderColor: confirmPw && confirmPw !== password ? 'var(--danger)' : undefined,
                    fontSize: isMobile ? '1rem' : undefined,
                  }}
                />
                {confirmPw && confirmPw !== password && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Passwords don't match</span>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                padding: '16px', 
                backgroundColor: 'rgba(0,0,0,0.02)', 
                borderRadius: '8px',
                border: agreedToBeta ? '1px solid var(--primary)' : '1px solid var(--border)',
                cursor: 'pointer'
              }} onClick={() => setAgreedToBeta(!agreedToBeta)}>
                <input 
                  type="checkbox" 
                  checked={agreedToBeta} 
                  onChange={() => {}} 
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  I understand that the software is still in <strong>Beta release</strong> and I register entirely at my own risk.
                </span>
              </div>

              <button
                type="submit" className="btn btn-primary"
                disabled={loading || !agreedToBeta}
                style={{
                  justifyContent: 'center',
                  padding: isMobile ? '16px' : '14px',
                  fontSize: '1rem', marginTop: '4px',
                  minHeight: '52px', /* prevent text wrapping on small screens */
                  opacity: !agreedToBeta ? 0.6 : 1,
                }}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : planId === 'basic' ? `Start Beta — Basic` : `Get Started — ${plan.name}`}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>

            {isMobile && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Link to="/plans" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowLeft size={12} /> Change plan
                </Link>
              </div>
            )}

            <p style={{ marginTop: '20px', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
              By creating an account you agree to our{' '}
              <Link to="/terms" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
