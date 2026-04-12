import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, ArrowRight, ClipboardList, WifiOff, Mail, CheckCircle, Loader2, Zap, ShieldCheck, Move, Upload } from 'lucide-react';
import { supabase } from '../supabase';
import logo from '../assets/Logo.png';

export const Landing = () => {
  const navigate = useNavigate();
  const [isSouthAfrica, setIsSouthAfrica] = useState<boolean>(true);
  
  // Beta Mode State
  const isBetaMode = (import.meta.env.VITE_BETA_MODE ?? '').trim() === 'true';
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState('');
  const [herdSize, setHerdSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const herdSizeOptions = [
    { id: 'under-100',    label: 'Under 100',    desc: 'Basic' },
    { id: '100-500',      label: '100 - 500',    desc: 'Intermediate' },
    { id: '500-1000',     label: '500 - 1000',   desc: 'Large' },
    { id: '1000-plus',     label: '1000+',        desc: 'Commercial' }
  ];

  useEffect(() => {
    setIsSouthAfrica(Intl.DateTimeFormat().resolvedOptions().timeZone === 'Africa/Johannesburg');
  }, []);

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: supabaseError } = await supabase
        .from('waitlist')
        .insert([{ 
          email, 
          primary_focus: focus || null,
          herd_size: herdSize || null
        }]);

      if (supabaseError) {
        if (supabaseError.code === '23505') {
          setError('You are already on the waitlist! We will be in touch soon.');
        } else {
          throw supabaseError;
        }
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error('Waitlist error:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="HealthyHerd Logo" style={{ height: '70px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#pricing" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-main)'}>Pricing</a>
          <button 
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center', background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg-main) 100%)' }}>
        <h1 className="fade-in" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, color: 'var(--primary-dark)', maxWidth: '900px', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          Digitise Your Herd. <br/><span style={{ color: 'var(--primary)' }}>Maximise Your Profit.</span>
        </h1>
        <p className="fade-in" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '48px', lineHeight: 1.6, animationDelay: '0.1s', animationFillMode: 'both' }}>
          Smart herd management made simple. Track health, weights, and inventory in seconds, whether you're in the office or out in the field.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn btn-primary fade-in" 
            onClick={() => isBetaMode ? document.getElementById('beta-signup')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/signup?plan=basic')}
            style={{ fontSize: '1.2rem', padding: '16px 40px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            {isBetaMode ? 'Join the Beta Phase' : 'Start Your Free Trial'} <ArrowRight size={24} />
          </button>
          <span className="fade-in" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', animationDelay: '0.3s', animationFillMode: 'both' }}>
            {isBetaMode ? 'Priority access for early adopters' : 'No credit card required'}
          </span>
        </div>
      </section>

      {/* FEATURES MATRIX */}
      <section id="features" style={{ padding: '80px 40px', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '64px', color: 'var(--primary-dark)' }}>Everything you need to scale</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {/* Feature 1 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.3s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Smart Medication</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Precise dosage verification calculated instantly from each animal's weight and metrics. Minimise waste and ensure superior care.</p>
            </div>

            {/* Feature 2 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.4s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <Move size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Pasture Management</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Optimise grazing cycles with detailed pasture movement logs. State-vet compliant ledgers with established safeguards for quarantined cattle.</p>
            </div>

            {/* Feature 3 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.5s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <Scale size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Weight Analytics</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Track growth metrics effortlessly and instantly know exactly when your livestock are ready for auction to maximize margins.</p>
            </div>

            {/* Feature 4 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.6s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <ClipboardList size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Lifecycle & Inventory</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Easily log births, purchases, sales, and mortalities. Maintain an accurate, real-time head count and history for every animal in your operation.</p>
            </div>

            {/* Feature 5 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.7s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <WifiOff size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Work Anywhere, Offline</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>No signal in the kraal? No problem. Record data directly in the field. The app syncs automatically the moment you are back online.</p>
            </div>

            {/* Feature 6 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.8s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <Upload size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Seamless Data Import</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Bring your existing operation with you. Bulk import your historical Excel or CSV data in seconds and never lose a day of records.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" style={{ padding: '80px 40px', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '64px', color: 'var(--primary-dark)' }}>Simple, Transparent Pricing</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', paddingTop: '16px' }}>
            {/* Basic Plan */}
            <div className="card fade-in" style={{ overflow: 'visible', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>30-day free trial</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', marginTop: '24px' }}>Basic</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Up to 100 animals</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>{isSouthAfrica ? 'R75' : '$5'}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / pm</span></div>
              <button 
                onClick={() => isBetaMode ? document.getElementById('beta-signup')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/signup?plan=basic')} 
                style={{ marginTop: 'auto', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', width: '100%' }} 
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} 
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                {isBetaMode ? 'Join Beta' : 'Start Free Trial'}
              </button>
            </div>

            {/* Intermediate Plan */}
            <div className="card fade-in" style={{ overflow: 'visible', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'var(--primary)', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)', transform: 'scale(1.05)', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', marginTop: '16px' }}>Intermediate</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Up to 500 animals</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>{isSouthAfrica ? 'R150' : '$10'}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / pm</span></div>
              <button 
                onClick={() => isBetaMode ? document.getElementById('beta-signup')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/signup?plan=intermediate')} 
                style={{ marginTop: 'auto', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', width: '100%' }} 
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} 
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                {isBetaMode ? 'Join Beta' : 'Get Started'}
              </button>
            </div>

            {/* Large Plan */}
            <div className="card fade-in" style={{ overflow: 'visible', padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', marginTop: '24px' }}>Large</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Up to 1000 animals</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>{isSouthAfrica ? 'R300' : '$20'}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / pm</span></div>
              <button 
                onClick={() => isBetaMode ? document.getElementById('beta-signup')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/signup?plan=large')} 
                style={{ marginTop: 'auto', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', width: '100%' }} 
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} 
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                {isBetaMode ? 'Join Beta' : 'Get Started'}
              </button>
            </div>

            {/* Commercial Plan */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', marginTop: '24px' }}>Commercial</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>More than 1000 animals</p>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px', paddingTop: '6px' }}>Contact Us</div>
              <button 
                onClick={() => isBetaMode ? document.getElementById('beta-signup')?.scrollIntoView({ behavior: 'smooth' }) : navigate('/plans')} 
                style={{ marginTop: 'auto', backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} 
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }} 
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
              >
                {isBetaMode ? 'Join Beta' : 'Contact Sales'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BETA SIGNUP SECTION */}
      {isBetaMode && (
        <section id="beta-signup" style={{ padding: '100px 20px', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          <div className="fade-in" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              padding: '8px 16px', 
              borderRadius: '20px', 
              color: 'var(--primary)', 
              fontSize: '0.875rem', 
              fontWeight: 600,
              marginBottom: '32px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <Zap size={16} /> Beta Testing registration open
            </div>
            
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', color: 'var(--primary-dark)' }}>
              Join the Beta Today
            </h2>
            
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '48px', lineHeight: 1.6 }}>
              Be among the first to digitise your herd with HealthyHerd. Secure your spot on the priority waitlist for early access.
            </p>

            {!submitted ? (
              <div style={{
                backgroundColor: 'var(--surface)',
                padding: '40px',
                borderRadius: '24px',
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                margin: '0 auto'
              }}>
                <form onSubmit={handleWaitlistSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                      <input 
                        type="email" 
                        required
                        placeholder="farmer@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px 16px 14px 48px',
                          backgroundColor: 'var(--bg-main)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          color: 'var(--text-main)',
                          fontSize: '1rem',
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  </div>

                    <div style={{ textAlign: 'left' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                        Approximate Herd Size
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        {herdSizeOptions.map((opt) => (
                          <div 
                            key={opt.id}
                            onClick={() => setHerdSize(opt.id)}
                            style={{
                              padding: '12px',
                              borderRadius: '12px',
                              border: `2px solid ${herdSize === opt.id ? 'var(--primary)' : 'var(--border)'}`,
                              backgroundColor: herdSize === opt.id ? 'rgba(34, 197, 94, 0.05)' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              textAlign: 'center'
                            }}
                          >
                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{opt.label}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{opt.desc}</div>
                          </div>
                        ))}
                      </div>

                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                        Primary Focus (Optional)
                      </label>
                    </div>
                    <select 
                      value={focus}
                      onChange={(e) => setFocus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        outline: 'none',
                        appearance: 'none',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <option value="">Select focus...</option>
                      <option value="Cattle">Cattle</option>
                      <option value="Sheep">Sheep</option>
                      <option value="Mixed">Mixed / Other</option>
                    </select>

                  {error && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'left' }}>
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn btn-primary"
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      marginTop: '8px'
                    }}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>Join Priority Waitlist <ArrowRight size={20} /></>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="fade-in" style={{
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                padding: '60px 40px',
                borderRadius: '24px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                margin: '0 auto'
              }}>
                <CheckCircle size={64} color="var(--primary)" style={{ marginBottom: '24px' }} />
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', color: 'var(--primary-dark)' }}>You're on the list!</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Thank you for your interest in HealthyHerd. We'll notify you {email} as soon as the beta is ready for your farm.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
      <footer style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <img src={logo} alt="HealthyHerd Logo" style={{ height: '40px', objectFit: 'contain', alignSelf: 'flex-start' }} />
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>Smart herd management made simple.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>Product</h4>
              <a href="#features" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>Features</a>
              <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>Pricing</a>
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer' }}>Sign In</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>Support</h4>
              <Link to="/support" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>Contact Us</Link>
              <Link to="/support" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>Help Center</Link>
              <a href="mailto:support@healthyherd.app" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>support@healthyherd.app</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>Legal</h4>
              <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>Terms of Service</Link>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--border)', fontSize: '0.875rem' }}>
            <div>&copy; {new Date().getFullYear()} HealthyHerd. All rights reserved.</div>
            <div>🇿🇦 Proudly developed in South Africa</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
