import React, { useState } from 'react';
import { supabase } from '../supabase';
import logo from '../assets/Logo.png';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { validatePassword, getPasswordStrength } from '../utils/passwordStrength';

export const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = getPasswordStrength(newPassword);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { valid, error: pwError } = validatePassword(newPassword);
    if (!valid) {
      toast.error(pwError!);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

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
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '40px', backgroundColor: 'white', zIndex: 101, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src={logo} alt="HealthyHerd Logo" style={{ height: '84px' }} />
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', color: 'var(--text-main)' }}>
          Set New Password
        </h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px', fontSize: '0.95rem' }}>
          Please enter a strong new password below.
        </p>

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* New Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="newPassword"
                type={showPw ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="Min. 8 characters, upper & lowercase, 1 digit"
                style={{ paddingRight: '44px' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px',
                }}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Strength bar */}
            {strength && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ height: '3px', backgroundColor: '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600 }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type={showPw ? 'text' : 'password'}
              required
              className="form-input"
              placeholder="Re-enter password"
              style={{
                borderColor: confirmPassword && confirmPassword !== newPassword ? 'var(--danger)' : undefined,
              }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Passwords don't match</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
