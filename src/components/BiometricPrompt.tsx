import { useState, useEffect } from 'react';
import { Fingerprint, X, Shield } from 'lucide-react';

const STORAGE_KEY = 'biometric_prompted';

interface BiometricPromptProps {
  onDismiss: () => void;
}

export const BiometricPrompt = ({ onDismiss }: BiometricPromptProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the device has a platform biometric authenticator
    if (
      typeof window !== 'undefined' &&
      window.PublicKeyCredential &&
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          if (available) {
            setIsSupported(true);
            // Animate in after a brief delay for polish
            setTimeout(() => setVisible(true), 400);
          } else {
            // Device doesn't support it — mark as prompted and dismiss silently
            localStorage.setItem(STORAGE_KEY, 'true');
            onDismiss();
          }
        })
        .catch(() => {
          localStorage.setItem(STORAGE_KEY, 'true');
          onDismiss();
        });
    } else {
      // WebAuthn not available
      localStorage.setItem(STORAGE_KEY, 'true');
      onDismiss();
    }
  }, [onDismiss]);

  const handleEnable = () => {
    // Placeholder: Full WebAuthn credential creation will be implemented
    // in a future task once the Supabase Edge Function verifier is ready.
    localStorage.setItem(STORAGE_KEY, 'enabled');
    dismiss();
  };

  const handleNotNow = () => {
    localStorage.setItem(STORAGE_KEY, 'dismissed');
    dismiss();
  };

  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // wait for slide-out animation
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleNotNow}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 900,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Bottom Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 901,
          backgroundColor: 'white',
          borderRadius: '20px 20px 0 0',
          padding: '24px 24px 40px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: '40px', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', margin: '0 auto 24px' }} />

        {/* Close button */}
        <button
          onClick={handleNotNow}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '18px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Fingerprint size={32} color="var(--primary)" />
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>
          Sign in faster with biometrics
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px', fontSize: '0.9rem' }}>
          Use Face ID or your fingerprint to sign into HealthyHerd without typing your password.
        </p>

        {/* Security note */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          backgroundColor: '#F0FDF4', borderRadius: '10px',
          padding: '10px 14px', marginBottom: '24px',
        }}>
          <Shield size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: '#065F46' }}>
            Your biometric data never leaves your device.
          </span>
        </div>

        <button
          id="biometric-enable-btn"
          onClick={handleEnable}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', marginBottom: '12px' }}
        >
          <Fingerprint size={18} style={{ marginRight: '8px' }} />
          Enable Biometrics
        </button>
        <button
          id="biometric-not-now-btn"
          onClick={handleNotNow}
          style={{
            width: '100%', background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            padding: '10px', fontSize: '0.9rem', fontWeight: 500,
          }}
        >
          Not now
        </button>
      </div>
    </>
  );
};
