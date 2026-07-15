import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  LifeBuoy, MessageSquare, Bug, Lightbulb, Search, 
  ChevronDown, ChevronUp, Send, CheckCircle2, AlertCircle, Mail,
  Rocket, ArrowRight
} from 'lucide-react';
import { QuickStartGuideModal } from '../components/QuickStartGuide';


const FAQS = [
  {
    question: "How do I add my first animal?",
    answer: "Navigate to 'My Herd' and click on 'Add Animal' on the My Herd page. Fill in the tag number, species, and weight. If you're importing a large herd, use the 'Import/Export' tool."
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

export const Support = () => {
  const navigate = useNavigate();
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
      // 1. Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to send a support request. Please sign in and try again.');
      }

      // 2. Insert the support request into the database
      // The trigger 'on_support_request_created' will handle sending the email notification
      const { error } = await supabase.from('support_requests').insert({
        user_id: user.id,
        type: formType,
        subject,
        description,
        status: 'Open',
        priority: formType === 'Bug' ? 'High' : 'Medium'
      });

      if (error) {
        // Log the specific Supabase error for debugging
        console.error('Supabase insert error details:', error);
        throw new Error(`Database error: ${error.message} (${error.code})`);
      }

      // 3. Update UI state on success
      setSubmitStatus('success');
      setSubject('');
      setDescription('');
      
    } catch (err: any) {
      // Log the full error for developers to see in the console
      console.error('Support submission failure:', err);
      
      // Update UI to show error state
      setSubmitStatus('error');
      
      // OPTIONAL: We could set a specific error message state here if needed
      // but the UI currently uses a generic error block.
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

      {/* Quick Start Guide Banner — positioned first, at top of page */}
      <div style={{ marginBottom: '24px', padding: '24px', backgroundColor: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1' }}>
            <Rocket size={20} />
            Quick Start Guide
          </h3>
          <p style={{ color: '#0369A1', margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>
            Need a refresher? Check out our interactive walkthrough to get your farm properly set up.
          </p>
        </div>
        <button 
          onClick={() => setGuideOpen(true)}
          className="btn btn-primary"
          style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          Launch Guide <ArrowRight size={18} />
        </button>
      </div>

      {/* Comprehensive Help Guide Banner */}
      <div style={{ marginBottom: '24px', padding: '24px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <Rocket size={20} color="var(--primary)" />
            Comprehensive Help Guide
          </h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Looking for detailed instructions on specific app features? Read our full Help Guide.
          </p>
        </div>
        <button 
          onClick={() => navigate('/help')}
          className="btn btn-primary"
          style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
        >
          Open Help Guide <ArrowRight size={18} />
        </button>
      </div>

      {/* FAQ Section — styled as a prominent action block */}
      <div style={{ marginBottom: '40px', padding: '28px', backgroundColor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E' }}>
          <LifeBuoy size={20} />
          Frequently Asked Questions
        </h3>
        <p style={{ color: '#A16207', margin: '0 0 20px 0', fontSize: '0.95rem' }}>
          Quick answers to the most common questions about HealthyHerd.
        </p>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={20} color="#A16207" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search help articles..." 
            style={{ paddingLeft: '48px', height: '50px', fontSize: '1rem', backgroundColor: 'white', borderColor: '#FDE68A' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
            <div 
              key={index} 
              style={{ border: '1px solid #FDE68A', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white' }}
            >
              <button 
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                style={{ 
                  width: '100%', padding: '18px 22px', border: 'none', backgroundColor: 'white', 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#78350F' }}>{faq.question}</span>
                {expandedFaq === index ? <ChevronUp size={20} color="#A16207" /> : <ChevronDown size={20} color="#A16207" />}
              </button>
              {expandedFaq === index && (
                <div style={{ padding: '0 22px 18px', color: '#92400E', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  <div style={{ paddingTop: '12px', borderTop: '1px solid #FEF3C7' }}>
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '32px', color: '#A16207', backgroundColor: 'white', borderRadius: '10px' }}>
              No help articles found matching "{searchQuery}". Try a different keyword or contact us below.
            </div>
          )}
        </div>
      </div>

      {/* Contact Section — single unified layout, no tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
        {/* Contact form */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Contact Us</h2>
          
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

        {/* Email Contact sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px', backgroundColor: '#F8FAFC' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color="var(--primary)" />
              Email Contact
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '16px' }}>
              Please feel free to email us:
            </p>
            <a 
              href="mailto:info@healthyherd.app" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
            >
              <Mail size={18} /> info@healthyherd.app
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
