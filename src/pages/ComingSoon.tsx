import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, CheckCircle, ArrowRight, Loader2, Award, Shield, Zap } from 'lucide-react';
import heroImage from '../assets/ComingSoon_Hero.png';
import logo from '../assets/Logo.png';

export const ComingSoon = () => {
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: supabaseError } = await supabase
        .from('waitlist')
        .insert([{ email, primary_focus: focus || null }]);

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
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0a', 
      color: '#ffffff',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background Hero with Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.3,
        zIndex: 0
      }} />
      
      {/* Gradient Overlay for Readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(10, 10, 10, 0.8) 70%, #0a0a0a 100%)',
        zIndex: 1
      }} />

      {/* Header */}
      <header style={{ 
        position: 'relative', 
        zIndex: 10, 
        padding: '32px 5%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logo} alt="HealthyHerd" style={{ height: '50px', filter: 'brightness(1.5)' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #10B981, #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HealthyHerd
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        position: 'relative', 
        zIndex: 10, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '0 20px 80px',
        textAlign: 'center'
      }}>
        <div className="fade-in" style={{ maxWidth: '800px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'rgba(16, 185, 129, 0.1)', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            color: '#10B981', 
            fontSize: '0.875rem', 
            fontWeight: 600,
            marginBottom: '32px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <Zap size={16} /> Beta Launch Coming Soon
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            fontWeight: 900, 
            lineHeight: 1.1, 
            marginBottom: '24px',
            letterSpacing: '-0.04em'
          }}>
            Smart livestock management <br/>
            <span style={{ color: '#10B981' }}>is on the way.</span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', 
            color: '#9ca3af', 
            maxWidth: '600px', 
            margin: '0 auto 48px',
            lineHeight: 1.6
          }}>
            Digitise your herd, track health records, and maximise your operation's efficiency from anywhere. Join the priority waitlist for early beta access.
          </p>

          {!submitted ? (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              padding: '40px',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#d1d5db' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} size={20} />
                    <input 
                      type="email" 
                      required
                      placeholder="farmer@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#10B981'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', color: '#d1d5db' }}>
                    Primary Focus (Optional)
                  </label>
                  <select 
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#10B981'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    <option value="" style={{ backgroundColor: '#1a1a1a' }}>Select focus...</option>
                    <option value="Cattle" style={{ backgroundColor: '#1a1a1a' }}>Cattle</option>
                    <option value="Sheep" style={{ backgroundColor: '#1a1a1a' }}>Sheep</option>
                    <option value="Mixed" style={{ backgroundColor: '#1a1a1a' }}>Mixed / Other</option>
                  </select>
                </div>

                {error && (
                  <div style={{ color: '#ef4444', fontSize: '0.875rem', textAlign: 'left' }}>
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    backgroundColor: '#10B981',
                    color: 'white',
                    padding: '16px',
                    borderRadius: '12px',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginTop: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#059669'; }}
                  onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#10B981'; }}
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
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '60px 40px',
              borderRadius: '24px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <CheckCircle size={64} color="#10B981" style={{ marginBottom: '24px' }} />
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>You're on the list!</h2>
              <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>
                Thank you for your interest in HealthyHerd. We'll notify you as soon as the beta is ready for your farm.
              </p>
            </div>
          )}

          {/* Social Proof / Pillars */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '40px', 
            marginTop: '80px',
            color: '#6b7280'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} /> <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Advanced Analytics</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} /> <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Bank-Grade Security</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} /> <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Instant Syncing</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        position: 'relative', 
        zIndex: 10, 
        padding: '32px 5%', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        fontSize: '0.875rem',
        color: '#4b5563'
      }}>
        <div>&copy; {new Date().getFullYear()} HealthyHerd. All rights reserved.</div>
        <div>🇿🇦 Proudly developed in South Africa</div>
      </footer>
    </div>
  );
};
