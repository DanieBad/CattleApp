import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  LifeBuoy, MessageSquare, Bug, Lightbulb, Search, 
  ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle, Mail,
  Rocket, X, ArrowRight, ArrowLeft, Settings, PlusCircle, MapPin,
  HeartPulse, BarChart2, CheckSquare
} from 'lucide-react';

const GUIDE_STEPS = [
  {
    icon: Settings,
    color: '#8b5cf6',
    bgColor: '#F5F3FF',
    title: 'Set Up Your Farm Profile',
    description:
      'Start by configuring your farm details — name, location, and default currency. This information appears throughout the app and on reports.',
    action: { label: 'Go to Farm Settings', path: '/settings' },
    tip: 'You can also set your preferred weight unit (kg or lbs) here.',
  },
  {
    icon: PlusCircle,
    color: '#16a34a',
    bgColor: '#F0FDF4',
    title: 'Add Your First Animal',
    description:
      'Register livestock individually by filling in the tag number, species, breed, date of birth, and current weight. Have a large herd? Use the CSV import to bulk-upload records.',
    action: { label: 'Add an Animal', path: '/herd/add' },
    tip: 'Importing from another system? Download the template CSV from the Import page.',
  },
  {
    icon: MapPin,
    color: '#f59e0b',
    bgColor: '#FFFBEB',
    title: 'Create Pastures & Camps',
    description:
      'Define the grazing areas on your farm. You can set a capacity for each camp, and the app will warn you when a camp is over-stocked.',
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
      "HealthyHerd auto-generates mortality, weight gain, treatment cost, and financial reports. Filter by date range or species, then export as CSV for your vet or accountant.",
    action: { label: 'View Reports', path: '/reports' },
    tip: 'Pin your most-used report filters by bookmarking the filtered URL.',
  },
  {
    icon: CheckSquare,
    color: '#16a34a',
    bgColor: '#F0FDF4',
    title: "You're All Set! 🎉",
    description:
      "You've covered all the core areas of HealthyHerd. Explore the Buy & Sell module to record livestock transactions, or dive into the batch tools for high-volume operations. If you ever need help, contact us from this page.",
    action: null,
    tip: 'Bookmark your dashboard for quick access each morning.',
  },
];

const FAQS = [
  {
    question: "How do I add my first animal?",
    answer: "Go to the 'Add Animal' page from the sidebar. Fill in the tag number, species, and weight. If you're importing a large herd, use the 'Import/Export' tool."
  },
  {
    question: "How do I manage pastures?",
    answer: "The 'Pastures & Camps' section allows you to define grazing areas. You can assign animals to specific camps within their individual profiles or via the Batch Health tool."
  },
  {
    question: "Can I use the app offline?",
    answer: "HealthyHerd is a web-based platform that requires an internet connection to sync your data with Supabase. We recommend logging in when you have a stable connection."
  },
  {
    question: "What is the Batch Health tool for?",
    answer: "The Batch Health tool allows you to log treatments (like vaccinations or dipping) for multiple animals at once, saving you time during herd processing."
  }
];

const QuickStartGuideModal = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const current = GUIDE_STEPS[step];
  const Icon = current.icon;
  const isLast = step === GUIDE_STEPS.length - 1;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
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
            onClick={onClose}
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
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}
            >
              <CheckSquare size={16} /> Close Guide
            </button>
          )}
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
  );
};

export const Support = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('contact');
  const [formType, setFormType] = useState<'Bug' | 'Feature' | 'Support'>('Support');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [guideOpen, setGuideOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to send a support request.');
      }

      const { error } = await supabase.from('support_requests').insert({
        user_id: user.id,
        type: formType,
        subject,
        description,
        status: 'Open',
        priority: formType === 'Bug' ? 'High' : 'Medium'
      });

      if (error) throw error;

      setSubmitStatus('success');
      setSubject('');
      setDescription('');
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = FAQS.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    {guideOpen && <QuickStartGuideModal onClose={() => setGuideOpen(false)} />}
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '32px', textAlign: 'center' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>How can we help?</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Find answers to common questions or reach out to our team.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px', backgroundColor: '#F1F5F9', padding: '6px', borderRadius: '12px', width: 'fit-content', margin: '0 auto 40px' }}>
        <button 
          type="button"
          onClick={() => setActiveTab('contact')}
          style={{ 
            padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600,
            backgroundColor: activeTab === 'contact' ? 'white' : 'transparent',
            color: activeTab === 'contact' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'contact' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          Contact Support
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('faq')}
          style={{ 
            padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600,
            backgroundColor: activeTab === 'faq' ? 'white' : 'transparent',
            color: activeTab === 'faq' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'faq' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          Knowledge Base (FAQ)
        </button>
      </div>

      {activeTab === 'contact' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div className="card" style={{ padding: '32px' }}>
              <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Send a Message</h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="form-label">Request Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => setFormType('Support')}
                      style={{ 
                        padding: '12px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        borderColor: formType === 'Support' ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: formType === 'Support' ? '#F0F9FF' : 'white',
                        color: formType === 'Support' ? 'var(--primary)' : 'var(--text-muted)'
                      }}
                    >
                      <MessageSquare size={18} /> Support
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormType('Bug')}
                      style={{ 
                        padding: '12px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        borderColor: formType === 'Bug' ? '#ef4444' : 'var(--border)',
                        backgroundColor: formType === 'Bug' ? '#FEF2F2' : 'white',
                        color: formType === 'Bug' ? '#ef4444' : 'var(--text-muted)'
                      }}
                    >
                      <Bug size={18} /> Bug
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFormType('Feature')}
                      style={{ 
                        padding: '12px', borderRadius: '8px', border: '1px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        borderColor: formType === 'Feature' ? '#8b5cf6' : 'var(--border)',
                        backgroundColor: formType === 'Feature' ? '#F5F3FF' : 'white',
                        color: formType === 'Feature' ? '#8b5cf6' : 'var(--text-muted)'
                      }}
                    >
                      <Lightbulb size={18} /> Feature
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label">Subject</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g., Cannot export CSV file" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-input" 
                    style={{ minHeight: '150px', resize: 'vertical' }} 
                    placeholder="Please provide as much detail as possible..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ alignSelf: 'flex-start', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <Send size={18} /> Send Request
                    </>
                  )}
                </button>

                {submitStatus === 'success' && (
                  <div style={{ backgroundColor: '#ECFDF5', color: '#065F46', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #D1FAE5' }}>
                    <CheckCircle2 size={20} />
                    <span>Thank you! Your request has been logged successfully. We'll get back to you soon.</span>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #FEE2E2' }}>
                    <AlertCircle size={20} />
                    <span>Oops! Something went wrong. Please try again or contact support directly via email.</span>
                  </div>
                )}
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px', backgroundColor: '#F8FAFC' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LifeBuoy size={18} color="var(--primary)" />
                  Direct Support
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  Typically we respond within 12-24 hours. For critical emergencies, please use the <strong>Bug</strong> report type for higher priority.
                </p>
                <a 
                  href="mailto:info@healthyherd.app" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                >
                  <Mail size={18} /> info@healthyherd.app
                </a>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Office Hours</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Monday - Friday<br />
                  08:00 - 17:00 (SAST)
                </p>
              </div>

              <div className="card" style={{ padding: '24px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
                <h3 style={{ fontSize: '1rem', color: '#0369A1', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Rocket size={18} />
                  Quick Start Guide
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#0369A1', margin: '0 0 16px 0', opacity: 0.9 }}>
                  Need a refresher? Check out our interactive walkthrough to get your farm properly set up.
                </p>
                <button 
                  onClick={() => setGuideOpen(true)} 
                  className="btn btn-outline"
                  style={{ width: '100%', borderColor: '#7DD3FC', color: '#0369A1', backgroundColor: 'white' }}
                >
                  Launch Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search help articles..." 
              style={{ paddingLeft: '48px', height: '56px', fontSize: '1.1rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
              <div 
                key={index} 
                style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}
              >
                <button 
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  style={{ 
                    width: '100%', padding: '20px 24px', border: 'none', backgroundColor: 'white', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{faq.question}</span>
                  {expandedFaq === index ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                </button>
                {expandedFaq === index && (
                  <div style={{ padding: '0 24px 20px', color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1rem' }}>
                    <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No help articles found matching "{searchQuery}". Try a different keyword or contact support.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};
