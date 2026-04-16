import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Terms = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', padding: '60px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '24px', padding: 0, fontWeight: 600 }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--primary-dark)' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Effective Date: April 2026</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.6 }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>1. Acceptance of Terms</h2>
            <p>By accessing or using the HealthyHerd web application ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>2. Description of Service</h2>
            <p>HealthyHerd provides a livestock management software-as-a-service (SaaS) platform, allowing users to track herd health, movements, weights, and lifecycle events, including offline synchronization capabilities.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>3. Account Registration & Security</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>4. Subscriptions and Payments</h2>
            <p>We offer various subscription tiers, including a 30-day free trial. Continued use after the trial requires a paid subscription. Fees are billed in advance on a recurring monthly basis. Prices are subject to change with prior notice.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>5. User Data and Responsibilities</h2>
            <p>You retain all rights to the agricultural and livestock data you input into HealthyHerd. You are solely responsible for the accuracy of the data entered. HealthyHerd is not responsible for losses arising from inaccurate weight, health, or movement tracking. While we offer offline capabilities, it is your responsibility to ensure your device eventually connects to the internet to sync local data to the cloud.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>6. Limitation of Liability</h2>
            <p>HealthyHerd is a management tool, not a substitute for professional veterinary advice or certified financial auditing. To the maximum extent permitted by South African law, HealthyHerd shall not be liable for any indirect, incidental, or consequential damages, including but not limited to loss of livestock, loss of profits, or data loss arising from the use or inability to use the Service.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>7. Termination</h2>
            <p>We may suspend or terminate your access to the Service at any time, for any reason, including violation of these Terms. You may cancel your subscription at any time.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>8. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of the Republic of South Africa.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>9. Contact</h2>
            <p>For any questions regarding these Terms, contact us at <a href="mailto:support@healthyherd.app" style={{ color: 'var(--primary)' }}>support@healthyherd.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
