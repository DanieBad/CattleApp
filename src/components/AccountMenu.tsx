import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useSubscription } from '../context/SubscriptionContext';

interface Props {
  session: Session;
  onSignOut: () => void;
}

export const AccountMenu = ({ session, onSignOut }: Props) => {
  const navigate = useNavigate();
  const { planName, activeAnimalCount, animalLimit, status } = useSubscription();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Derive display name — user_metadata first, then email prefix, then fallback
  const email = session.user.email ?? '';
  const displayName: string =
    session.user.user_metadata?.display_name ||
    (email.split('@')[0] ?? 'User');

  const initials = displayName
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('') || email.substring(0, 2).toUpperCase();

  const go = (path: string) => { setOpen(false); navigate(path); };

  const statusLabel: Record<string, string> = {
    trialing:     'Free Trial',
    active:       'Active',
    grace_period: 'Expired',
    cancelled:    'Cancelled',
  };

  return (
    <div ref={ref} style={{ position: 'relative', marginLeft: '12px' }}>

      {/* ── Avatar trigger ──────────────────────────────────────────────── */}
      <button
        id="account-menu-trigger"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
          borderRadius: '8px', transition: 'background 0.15s',
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        aria-label="Open account menu"
        aria-expanded={open}
      >
        {/* Initials circle */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          backgroundColor: 'var(--primary)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
          boxShadow: open ? '0 0 0 3px rgba(16,185,129,0.25)' : 'none',
          transition: 'box-shadow 0.15s',
        }}>
          {initials}
        </div>
        <ChevronDown
          size={14}
          color="var(--text-muted)"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────────── */}
      {open && (
        <div
          id="account-menu-dropdown"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: '248px', backgroundColor: 'white',
            borderRadius: '12px', border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            zIndex: 9999, overflow: 'hidden',
            animation: 'dropdownFadeIn 0.12s ease',
          }}
        >
          {/* Identity header */}
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>
              {email}
            </div>
            {/* Plan pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                backgroundColor: status === 'grace_period' ? '#FEE2E2' : 'rgba(16,185,129,0.08)',
                color: status === 'grace_period' ? '#991B1B' : 'var(--primary)',
                border: `1px solid ${status === 'grace_period' ? '#FECACA' : 'rgba(16,185,129,0.2)'}`,
                borderRadius: '10px', padding: '2px 8px',
                fontSize: '0.7rem', fontWeight: 700,
              }}>
                {planName} · {statusLabel[status ?? ''] ?? status}
              </span>
              {status !== 'grace_period' && animalLimit < 999999 && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {activeAnimalCount}/{animalLimit} animals
                </span>
              )}
            </div>
          </div>

          {/* Nav items */}
          <div style={{ padding: '6px' }}>
            <MenuRow icon={User} label="Profile" onClick={() => go('/profile')} />
            <MenuRow icon={CreditCard} label="Billing & Account" onClick={() => go('/billing')} />
          </div>

          {/* Sign out */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '6px' }}>
            <MenuRow
              icon={LogOut}
              label="Sign Out"
              onClick={() => { setOpen(false); onSignOut(); }}
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Small helper row component
const MenuRow = ({
  icon: Icon, label, onClick, danger = false,
}: {
  icon: any; label: string; onClick: () => void; danger?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 10px', borderRadius: '8px', border: 'none',
      background: 'none', cursor: 'pointer', textAlign: 'left',
      color: danger ? 'var(--danger)' : 'var(--text-main)',
      fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.12s',
    }}
    onMouseOver={e => e.currentTarget.style.backgroundColor = danger ? 'rgba(239,68,68,0.06)' : 'var(--bg-color)'}
    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
  >
    <Icon size={16} style={{ flexShrink: 0, color: danger ? 'var(--danger)' : 'var(--text-muted)' }} />
    {label}
  </button>
);
