import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';

const HeroSection = ({ onSearch }) => {
    const { t } = useTranslation();
    const [searchVal, setSearchVal] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchVal);
        document.getElementById('posts-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const quickTags = ['PAN Card', 'Aadhaar', 'Jobs', 'Scholarships', 'Passport', 'Certificates'];

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

                    {/* Search Bar */}
                    <div className="hero-search-wrapper">
                        <form className="hero-search-bar" onSubmit={handleSearch}>
                            <FiSearch size={20} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginRight: 12 }} />
                            <input
                                type="text"
                                className="hero-search-input"
                                placeholder={t('hero.searchPlaceholder', 'Search PAN, Aadhaar, Jobs, Scholarships...')}
                                value={searchVal}
                                onChange={e => setSearchVal(e.target.value)}
                                id="hero-search-input"
                            />
                            <button type="submit" className="hero-search-btn" aria-label="Search">
                                <FiSearch size={18} />
                            </button>
                        </form>

                        <p className="hero-subheadline">
                            {t('hero.subheadline', 'PAN, Aadhaar, Jobs, Scholarships, Government Forms — All accepted here')}
                        </p>

                        <div className="hero-quick-tags">
                            {quickTags.map(tag => (
                                <button
                                    key={tag}
                                    className="hero-quick-tag"
                                    onClick={() => {
                                        setSearchVal(tag);
                                        if (onSearch) onSearch(tag);
                                        document.getElementById('posts-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="d-flex gap-4 justify-content-center mt-4 flex-wrap" style={{ animation: 'fadeInUp 1s ease forwards 0.6s', opacity: 0 }}>
                        {[
                            { n: '1,420+', l: t('hero.statProcessed', 'Processed') },
                            { n: '500+', l: t('hero.statPosts', 'Job Posts') },
                            { n: '24/7', l: t('hero.statSupport', 'Support') },
                            { n: '100%', l: t('hero.statFree', 'Free to Browse') },
                        ].map(({ n, l }) => (
                            <div key={l} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 900, background: 'linear-gradient(135deg,#10b981,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{n}</div>
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
