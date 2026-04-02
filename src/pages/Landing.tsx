import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Scale, ArrowRight, ClipboardList, WifiOff, HeartHandshake } from 'lucide-react';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#pricing" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-main)'}>Pricing</a>
          <button 
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            Sign In
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center', background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg-main) 100%)' }}>
        <h1 className="fade-in" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, color: 'var(--primary-dark)', maxWidth: '900px', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
          Digitize Your Herd. <br/><span style={{ color: 'var(--primary)' }}>Maximize Your Profit.</span>
        </h1>
        <p className="fade-in" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--text-muted)', maxWidth: '700px', marginBottom: '48px', lineHeight: 1.6, animationDelay: '0.1s', animationFillMode: 'both' }}>
          The ultimate farm management software built by farmers, for modern farmers. Track health, movement, and weights in seconds. Ditch the clipboard forever.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn btn-primary fade-in" 
            onClick={() => navigate('/login')}
            style={{ fontSize: '1.2rem', padding: '16px 40px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            Start Your Free Trial <ArrowRight size={24} />
          </button>
          <span className="fade-in" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', animationDelay: '0.3s', animationFillMode: 'both' }}>No credit card required</span>
        </div>
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

      {/* ADDITIONAL FEATURES */}
      <section style={{ padding: '0 40px 80px', backgroundColor: 'var(--surface)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {/* Feature 4 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.6s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <ClipboardList size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Lifecycle & Inventory</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Easily log births, purchases, sales, and mortalities. Maintain an accurate, real-time head count and history for every animal in your operation.</p>
            </div>

            {/* Feature 5 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.7s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <WifiOff size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Work Anywhere, Offline</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>No signal in the kraal? No problem. Record data directly in the field. The app syncs automatically the moment you are back online.</p>
            </div>

            {/* Feature 6 */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', transition: 'transform 0.3s', animationDelay: '0.8s', animationFillMode: 'both' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                <HeartHandshake size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Built for the Farmer</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>An intuitive, frustration-free interface designed to be used in the sun, dirt, and dust. No steep learning curve—just open and go.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" style={{ padding: '80px 40px', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 700, marginBottom: '64px', color: 'var(--primary-dark)' }}>Simple, Transparent Pricing</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px' }}>
            {/* Basic Plan */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px 12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>30-day free trial</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', marginTop: '24px' }}>Basic</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Up to 100 animals</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>R75<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / pm</span></div>
              <button style={{ marginTop: 'auto', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', width: '100%' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>Start Trial</button>
            </div>

            {/* Intermediate Plan */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'var(--primary)', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)', transform: 'scale(1.05)', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', marginTop: '16px' }}>Intermediate</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Up to 500 animals</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>R150<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / pm</span></div>
              <button style={{ marginTop: 'auto', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', width: '100%' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>Choose Plan</button>
            </div>

            {/* Large Plan */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', marginTop: '24px' }}>Large</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Up to 1000 animals</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px' }}>R300<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}> / pm</span></div>
              <button style={{ marginTop: 'auto', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', width: '100%' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>Choose Plan</button>
            </div>

            {/* Commercial Plan */}
            <div className="card fade-in" style={{ padding: '40px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)', marginTop: '24px' }}>Commercial</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>More than 1000 animals</p>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '32px', paddingTop: '6px' }}>Contact Us</div>
              <button style={{ marginTop: 'auto', backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}>Contact Sales</button>
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
