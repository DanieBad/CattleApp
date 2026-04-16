import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Privacy = () => {
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
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', color: 'var(--primary-dark)' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Effective Date: April 2026</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.6 }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>1. Introduction</h2>
            <p>HealthyHerd ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information in compliance with the Protection of Personal Information Act (POPIA) and other applicable data protection laws.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>2. Information We Collect</h2>
            <p>We collect Personal Information (name, email address, phone number, and payment details), Farm & Herd Data (information regarding your farm operations, livestock numbers, health records, and movement ledgers), and Technical Data (IP address, browser type, device information, and usage metrics).</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>3. How We Use Your Information</h2>
            <p>We use the collected information to provide, maintain, and improve the HealthyHerd platform (including offline sync functionality); process subscription payments; communicate with you regarding updates, support, and billing; and ensure state-vet movement compliance (if explicitly configured by you).</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>4. Data Sharing and Disclosure</h2>
            <p>We do not sell your personal or farm data. We may share information only with trusted third-party service providers (e.g., payment processors, cloud hosting) who are bound by strict data protection agreements, or if required by law, legal process, or governmental request.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data against unauthorized access, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>6. Your Data Rights</h2>
            <p>In accordance with POPIA, you have the right to access the personal information we hold about you, request correction of inaccurate data, request deletion of your data (subject to legal and operational retention requirements), and object to the processing of your personal information.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>7. Cookies</h2>
            <p>We use cookies to enhance your experience, maintain your session, and analyze platform usage. You can control cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on our site or via email.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>9. Contact Us</h2>
            <p>If you have any questions or requests regarding your data, please contact our Information Officer at <a href="mailto:support@healthyherd.app" style={{ color: 'var(--primary)' }}>support@healthyherd.app</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
