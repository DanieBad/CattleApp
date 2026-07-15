import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, X, ArrowRight, ArrowLeft, Settings, PlusCircle, MapPin,
  HeartPulse, BarChart2, CheckSquare
} from 'lucide-react';

export const GUIDE_STEPS = [
  {
    icon: Settings,
    color: '#8b5cf6',
    bgColor: '#F5F3FF',
    title: 'Set Up Your Farm Profile',
    description:
      'Start by configuring your farm details — name, location, and your default species. This information appears throughout the app and on your generated reports.',
    action: { label: 'Go to Farm Settings', path: '/settings' },
    tip: 'Take a moment to review all settings before adding your first animal, so your reports are accurate from the start.',
  },
  {
    icon: PlusCircle,
    color: '#16a34a',
    bgColor: '#F0FDF4',
    title: 'Add Your First Animal',
    description:
      'Register livestock individually by filling in the tag number, species, breed, date of birth, and current weight. Have a large herd? Use our import tool under Settings to upload your CSV file.',
    action: { label: 'Add an Animal', path: '/herd/add' },
    tip: 'For ease of use, we recommend performing bulk data imports on the desktop version of the app.',
  },
  {
    icon: MapPin,
    color: '#f59e0b',
    bgColor: '#FFFBEB',
    title: 'Create Pastures & Camps',
    description:
      'Define the grazing areas on your farm. You can set a maximum capacity for each camp and assign animals to them. Move animals between camps using the Pasture Movement screen.',
    action: { label: 'Manage Camps', path: '/camps' },
    tip: 'Assign animals to camps directly from their animal profile page.',
  },
  {
    icon: HeartPulse,
    color: '#ef4444',
    bgColor: '#FEF2F2',
    title: 'Log a Health Treatment',
    description:
      'Use the Health Workflow to record treatments, vaccinations, and dipping events. For processing day, the Batch Health tool lets you treat multiple animals at once.',
    action: { label: 'Open Health Workflow', path: '/health' },
    tip: 'Set quarantine periods and withdrawal dates to receive automatic alerts.',
  },
  {
    icon: BarChart2,
    color: '#0ea5e9',
    bgColor: '#F0F9FF',
    title: 'Explore Your Reports',
    description:
      "HealthyHerd generates five key reports: Weight Performance, Pasture Utilisation, Reproductive Efficiency, Health & Withdrawal Compliance, and Sales & Financials. Filter by date range or species, then export as a PDF for your vet or accountant.",
    action: { label: 'View Reports', path: '/reports' },
    tip: 'The Health & Withdrawal Compliance report is especially useful for verifying that no animals under a withdrawal period are accidentally cleared for sale.',
  },
  {
    icon: CheckSquare,
    color: '#16a34a',
    bgColor: '#F0FDF4',
    title: "You're All Set! 🎉",
    description:
      "You've covered all the core areas of HealthyHerd. Explore the Buy & Sell module to record livestock transactions, or dive into the batch tools for high-volume operations. If you ever need help, contact us from the Support page.",
    action: null,
    tip: 'Bookmark your dashboard for quick access each morning.',
  },
];

export const QuickStartGuideModal = ({ onClose }: { onClose: (permanentlyDismiss?: boolean) => void }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const current = GUIDE_STEPS[step];
  const Icon = current.icon;
  const isLast = step === GUIDE_STEPS.length - 1;

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  const handleNavigate = (path: string) => {
    handleClose();
    navigate(path);
  };

  return (
    <div
      id="quickstart-guide-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="card fade-in"
        style={{
          backgroundColor: 'white', borderRadius: '20px',
          width: '100%', maxWidth: '520px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
          overflow: 'hidden', position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Rocket size={20} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>Quick Start Guide</span>
          </div>
          <button
            onClick={() => handleClose()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', display: 'flex' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '16px 28px 0' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {GUIDE_STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                style={{
                  flex: 1, height: '4px', borderRadius: '4px', cursor: 'pointer',
                  backgroundColor: i <= step ? 'var(--primary)' : '#E2E8F0',
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Step {step + 1} of {GUIDE_STEPS.length}
          </p>
        </div>

        {/* Step content */}
        <div style={{ padding: '24px 28px' }}>
          <div
            style={{
              width: '56px', height: '56px', borderRadius: '14px',
              backgroundColor: current.bgColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <Icon size={28} color={current.color} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
            {current.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px', fontSize: '0.95rem' }}>
            {current.description}
          </p>

          {/* Tip box */}
          <div
            style={{
              backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: '10px', padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              marginBottom: '28px',
            }}
          >
            <span style={{ fontSize: '1rem' }}>💡</span>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              {current.tip}
            </p>
          </div>

          {/* CTA */}
          {current.action && (
            <button
              onClick={() => handleNavigate(current.action!.path)}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}
            >
              {current.action.label} <ArrowRight size={16} />
            </button>
          )}
          {isLast && (
            <button
              onClick={handleClose}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}
            >
              <CheckSquare size={16} /> Close Guide
            </button>
          )}
        </div>

        {/* Don't show again checkbox */}
        <div
          style={{
            padding: '12px 28px',
            display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer',
          }}
          onClick={() => setDontShowAgain(!dontShowAgain)}
        >
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={() => {}}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Don't show this guide again</span>
        </div>

        {/* Navigation footer */}
        <div
          style={{
            padding: '16px 28px', borderTop: '1px solid #F1F5F9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: step === 0 ? 'default' : 'pointer',
              color: step === 0 ? '#CBD5E1' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={16} /> Previous
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Skip button — always visible */}
            <button
              onClick={handleClose}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.85rem',
                textDecoration: 'underline', textUnderlineOffset: '2px',
              }}
            >
              Skip
            </button>

            {!isLast && (
              <button
                onClick={() => setStep(s => Math.min(GUIDE_STEPS.length - 1, s + 1))}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem',
                }}
              >
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
