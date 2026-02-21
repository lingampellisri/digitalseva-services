import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className="hero-section" id="hero">
            {/* Animated orbs */}
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />
            <div className="hero-orb hero-orb-3" />

            <div className="container hero-content w-100">
                <div style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
                    {/* Badge */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="hero-badge">
                            <span className="hero-badge-dot" />
                            Online Services Portal — India
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="hero-title">{t('hero.title')}</h1>

                    {/* Subtitle */}
                    <p className="hero-subtitle">{t('hero.subtitle')}</p>

                    {/* Services chips */}
                    <div className="d-flex flex-wrap gap-2 justify-content-center mb-4" style={{ animation: 'fadeInUp 1s ease forwards 0.2s', opacity: 0 }}>
                        {['Job Notifications', 'PAN Card', 'Aadhaar', 'Scholarships', 'Government Services'].map(s => (
                            <span key={s} style={{
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: 'rgba(255,255,255,0.75)',
                                padding: '6px 16px',
                                borderRadius: '50px',
                                fontSize: '0.78rem',
                                fontWeight: 500,
                                backdropFilter: 'blur(10px)'
                            }}>{s}</span>
                        ))}
                    </div>

                    {/* CTA */}
                    <div style={{ animation: 'fadeInUp 1s ease forwards 0.4s', opacity: 0 }}>
                        <button
                            className="btn-hero"
                            onClick={() => document.getElementById('posts-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span>✦ {t('hero.cta')}</span>
                        </button>
                    </div>

                    {/* Stats strip */}
                    <div className="d-flex gap-4 justify-content-center mt-5 flex-wrap" style={{ animation: 'fadeInUp 1s ease forwards 0.6s', opacity: 0 }}>
                        {[
                            { n: '500+', l: 'Job Postings' },
                            { n: '10K+', l: 'Applications' },
                            { n: '24/7', l: 'Support' },
                            { n: '100%', l: 'Free to Use' },
                        ].map(({ n, l }) => (
                            <div key={l} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, background: 'linear-gradient(135deg,#00b4d8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{n}</div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginTop: '2px' }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="scroll-indicator">
                <div className="scroll-mouse"><div className="scroll-wheel" /></div>
                <span>Scroll</span>
            </div>
        </section>
    );
};

export default HeroSection;
