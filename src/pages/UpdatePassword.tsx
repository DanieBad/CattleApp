import React, { useState } from 'react';
import { supabase } from '../supabase';
import logo from '../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success('Password updated successfully', { duration: 4000 });
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Unable to update password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      {/* We use absolutely positioned full screen container here so it overlaps the dashboard layout 
          since this route might render inside the authenticated layout. */}
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px', backgroundColor: 'white', zIndex: 101, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src={logo} alt="HealthyHerd Logo" style={{ height: '84px' }} />
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
          Set New Password
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px', fontSize: '0.95rem' }}>
          Please enter your new password below.
        </p>

        <form onSubmit={handleUpdate}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input 
              id="newPassword"
              type="password" 
              required 
              className="form-input" 
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
