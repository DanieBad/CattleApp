import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Scale, ArrowRight } from 'lucide-react';
import logo from '../assets/Logo.png';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <header style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="HealthyHerd Logo" style={{ height: '70px' }} />
        </div>
        <button 
          onClick={() => navigate('/login')}
          style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
        >
          Sign In
        </button>
      </header>

      {/* HERO SECTION */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center', background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg-main) 100%)' }}>
        <h1 className="fade-in" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, color: 'var(--primary-dark)', maxWidth: '900px', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          Digitize Your Herd. <br/><span style={{ color: 'var(--primary)' }}>Maximize Your Profit.</span>
        </h1>
        <p className="fade-in" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '48px', lineHeight: 1.6, animationDelay: '0.1s', animationFillMode: 'both' }}>
          The ultimate farm management software built by farmers, for modern farmers. Track health, movement, and weights in seconds. Ditch the clipboard forever.
        </p>
        
        <button 
          className="btn btn-primary fade-in" 
          onClick={() => navigate('/login')}
          style={{ fontSize: '1.2rem', padding: '16px 40px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          Start Your Free Trial <ArrowRight size={24} />
        </button>
      </section>

      {/* FEATURES MATRIX */}
      <section style={{ padding: '80px 40px', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '64px', color: 'var(--primary-dark)' }}>Everything you need to scale</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {/* Feature 1 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.3s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <Activity size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Batch Health Tracking</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Vaccinate and treat your entire herd in one click with ultra-fast batch logging. Maintain impeccable veterinary records instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.4s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <MapPin size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Movement Traceability</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>State-vet compliant movement ledgers. Instantly track origin, destination, and establish hard safeguards on quarantined cattle.</p>
            </div>

            {/* Feature 3 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.5s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <Scale size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Weight Analytics</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Track growth metrics effortlessly and instantly know exactly when your livestock are ready for auction to maximize margins.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)' }}>
        <p>&copy; {new Date().getFullYear()} HealthyHerd SaaS Platform. All rights reserved.</p>
        <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>Designed for modern livestock management.</p>
      </footer>
    </div>
  );
};
