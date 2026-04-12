import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Mail, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import logo from '../assets/Logo.png';
import { useIsMobile } from '../hooks/useIsMobile';

interface Plan {
  id: string;
  name: string;
  animalLimit: number;
  priceZar: number | null;
  priceUsd: number | null;
  isSelfServe: boolean;
}

const PLANS: Plan[] = [
  { id: 'basic',        name: 'Basic',        animalLimit: 100,    priceZar: 75,   priceUsd: 5,   isSelfServe: true  },
  { id: 'intermediate', name: 'Intermediate', animalLimit: 500,    priceZar: 150,  priceUsd: 10,  isSelfServe: true  },
  { id: 'large',        name: 'Large',        animalLimit: 1000,   priceZar: 300,  priceUsd: 20,  isSelfServe: true  },
  { id: 'commercial',   name: 'Commercial',   animalLimit: 999999, priceZar: null, priceUsd: null, isSelfServe: false },
];

const FEATURES: Record<string, string[]> = {
  basic:        ['Up to 100 active animals', 'Health & weight records', 'FMD compliance logs', 'CSV import/export', '30-day free trial included'],
  intermediate: ['Up to 500 active animals', 'Everything in Basic', 'Batch health treatments', 'Camp & pasture manager', 'AI voice assistant'],
  large:        ['Up to 1,000 active animals', 'Everything in Intermediate', 'Advanced reporting', 'Multi-species support', 'Priority support'],
  commercial:   ['1,000+ animals', 'Everything in Large', 'Custom onboarding', 'Dedicated account manager', 'SLA guarantee', 'Custom pricing'],
};

export const Plans = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSouthAfrica, setIsSouthAfrica] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  // On mobile: track which card has features expanded
  const [expandedPlan, setExpandedPlan] = useState<string | null>('intermediate');

  useEffect(() => {
    setIsSouthAfrica(Intl.DateTimeFormat().resolvedOptions().timeZone === 'Africa/Johannesburg');
  }, []);

  const handlePlanSelect = (plan: Plan) => {
    if (!plan.isSelfServe) { setShowContactModal(true); return; }
    navigate(`/signup?plan=${plan.id}`);
  };

  const formatPrice = (plan: Plan) => {
    if (!plan.isSelfServe) return 'Contact Us';
    return isSouthAfrica ? `R${plan.priceZar}` : `$${plan.priceUsd}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{
        backgroundColor: 'white', borderBottom: '1px solid var(--border)',
        padding: isMobile ? '12px 16px' : '16px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={logo} alt="HealthyHerd" style={{ height: isMobile ? '36px' : '44px' }} />
          {!isMobile && <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>HealthyHerd</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px' }}>
          {!isMobile && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Already have an account?</span>}
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: '1px solid var(--primary)',
              color: 'var(--primary)', padding: isMobile ? '8px 14px' : '8px 20px',
              borderRadius: '6px', fontWeight: 600, cursor: 'pointer',
              fontSize: '0.875rem', transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: isMobile ? '36px 20px 24px' : '64px 20px 48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--primary)',
          padding: '5px 14px', borderRadius: '20px',
          fontSize: '0.78rem', fontWeight: 600, marginBottom: '16px',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <Zap size={13} /> Basic plan includes a 30-day free trial
        </div>
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em',
          marginBottom: '12px', lineHeight: 1.15,
        }}>
          Simple, transparent pricing
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '0.95rem' : '1.1rem', maxWidth: '480px', margin: '0 auto' }}>
          Pick the plan that fits your operation. No hidden fees. Cancel anytime.
        </p>
      </div>

      {/* ── Pricing — Desktop grid / Mobile accordion ──────────────────────── */}
      {isMobile ? (
        /* ── MOBILE: Accordion-style cards ─────────────────────────────── */
        <div style={{ padding: '0 12px 48px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {PLANS.map((plan) => {
            const isPopular = plan.id === 'intermediate';
            const isExpanded = expandedPlan === plan.id;

            return (
              <div
                key={plan.id}
                style={{
                  backgroundColor: 'white', borderRadius: '14px',
                  border: isPopular ? '2px solid var(--primary)' : '1px solid var(--border)',
                  boxShadow: isPopular ? '0 4px 20px rgba(16,185,129,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                {/* Card header — always visible, tap to expand */}
                <button
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '18px 20px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '12px', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {isPopular && (
                      <span style={{
                        backgroundColor: 'var(--primary)', color: 'white',
                        padding: '2px 10px', borderRadius: '12px',
                        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                      }}>
                        POPULAR
                      </span>
                    )}
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.2 }}>{plan.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {plan.id === 'commercial' ? '1,000+ animals' : `Up to ${plan.animalLimit.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                        {formatPrice(plan)}
                      </span>
                      {plan.isSelfServe && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>/mo</span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                      {FEATURES[plan.id].map((feature) => (
                        <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          <Check size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '10px',
                        border: plan.isSelfServe ? 'none' : '1px solid var(--primary)',
                        backgroundColor: plan.isSelfServe ? 'var(--primary)' : 'transparent',
                        color: plan.isSelfServe ? 'white' : 'var(--primary)',
                        fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      }}
                    >
                      {plan.id === 'basic'
                        ? <><span>Start Free Trial</span><ArrowRight size={16} /></>
                        : plan.isSelfServe
                          ? <><span>Get Started</span><ArrowRight size={16} /></>
                          : <><Mail size={15} /><span>Contact Sales</span></>
                      }
                    </button>
                    {plan.id === 'basic' && (
                      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        30-day free trial · No credit card required
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── DESKTOP: Grid cards ─────────────────────────────────────────── */
        <div style={{
          maxWidth: '1100px', margin: '0 auto', padding: '0 20px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px', alignItems: 'start',
        }}>
          {PLANS.map((plan) => {
            const isPopular = plan.id === 'intermediate';
            const isHovered = hoveredPlan === plan.id;

            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  backgroundColor: 'white', borderRadius: '16px', padding: '32px 28px',
                  border: isPopular ? '2px solid var(--primary)' : '1px solid var(--border)',
                  boxShadow: isPopular ? '0 8px 32px rgba(16,185,129,0.15)'
                    : isHovered ? '0 8px 24px rgba(0,0,0,0.08)' : 'var(--shadow-sm)',
                  transform: isPopular ? 'scale(1.03)' : isHovered ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.2s ease', position: 'relative',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {isPopular && (
                  <div style={{
                    position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: 'var(--primary)', color: 'white',
                    padding: '4px 20px', borderRadius: '20px',
                    fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '0.05em',
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ marginBottom: '4px', marginTop: isPopular ? '8px' : '0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: isPopular ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {plan.name}
                  </span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  {plan.isSelfServe ? (
                    <>
                      <span style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>
                        {formatPrice(plan)}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '4px' }}>/month</span>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
                        {isSouthAfrica ? `$${plan.priceUsd} / month` : `R${plan.priceZar} / month`}
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Contact Us</span>
                  )}
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                  {plan.id === 'commercial' ? 'More than 1,000 animals' : `Up to ${plan.animalLimit.toLocaleString()} active animals`}
                </p>

                <ul style={{ listStyle: 'none', margin: '0 0 32px', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {FEATURES[plan.id].map((feature) => (
                    <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      <Check size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  style={{
                    width: '100%', padding: '13px', borderRadius: '10px',
                    border: plan.isSelfServe ? 'none' : '1px solid var(--primary)',
                    backgroundColor: plan.isSelfServe ? 'var(--primary)' : 'transparent',
                    color: plan.isSelfServe ? 'white' : 'var(--primary)',
                    fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { plan.isSelfServe ? (e.currentTarget.style.backgroundColor = 'var(--primary-dark)') : (e.currentTarget.style.backgroundColor = 'var(--primary)', e.currentTarget.style.color = 'white'); }}
                  onMouseOut={e => { plan.isSelfServe ? (e.currentTarget.style.backgroundColor = 'var(--primary)') : (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--primary)'); }}
                >
                  {plan.id === 'basic'
                    ? <><span>Start Free Trial</span><ArrowRight size={16} /></>
                    : plan.isSelfServe
                      ? <><span>Get Started</span><ArrowRight size={16} /></>
                      : <><Mail size={16} /><span>Contact Sales</span></>
                  }
                </button>

                {plan.id === 'basic' && (
                  <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                    30-day free trial · No credit card required
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div style={{ textAlign: 'center', paddingBottom: '40px', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0 20px 40px' }}>
        Basic plan includes a 30-day free trial. 🇿🇦 Proudly developed in South Africa.
      </div>

      {/* Commercial Contact Modal */}
      {showContactModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}
          onClick={() => setShowContactModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '28px 24px' : '40px', maxWidth: '460px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Mail size={26} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', fontWeight: 800, marginBottom: '10px' }}>Let's talk Commercial</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px', fontSize: '0.9rem' }}>
              The Commercial plan is designed for operations with 1,000+ animals. We'll put together a custom quote and walk you through onboarding personally.
            </p>
            <a
              href="mailto:info@healthyherd.app?subject=Commercial%20Plan%20Enquiry&body=Hi%2C%20I%20would%20like%20to%20enquire%20about%20the%20Commercial%20plan%20for%20my%20operation."
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', padding: '14px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', marginBottom: '10px', fontSize: '0.95rem' }}
            >
              <Mail size={17} /> Email info@healthyherd.app
            </a>
            <button
              onClick={() => setShowContactModal(false)}
              style={{ width: '100%', padding: '12px', background: 'none', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 500 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
