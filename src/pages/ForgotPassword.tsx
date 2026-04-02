import React, { useState } from 'react';
import { supabase } from '../supabase';
import logo from '../assets/Logo.png';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      
      toast.success('If an account exists, a reset link has been sent.', { duration: 4000 });
      setEmail('');
    } catch (err: any) {
      // Avoid leaking if user exists or not, but handle generic network errors
      toast.error('Unable to process the request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src={logo} alt="HealthyHerd Logo" style={{ height: '84px' }} />
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
          Reset Password
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px', fontSize: '0.95rem' }}>
          Enter your email address and we will send you a link to reset your password.
        </p>

        <form onSubmit={handleReset}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              required 
              className="form-input" 
              placeholder="farmer@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginBottom: '24px' }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/login"
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
