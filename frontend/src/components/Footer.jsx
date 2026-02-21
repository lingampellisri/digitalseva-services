import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="footer-ag">
            <div className="container">
                <div className="row g-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="col-12 col-md-4">
                        <div className="footer-logo">Digital Seva</div>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginTop: 8 }}>
                            {t('footer.tagline')}
                        </p>
                    </div>
                    <div className="col-12 col-md-4">
                        <h6 style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 16 }}>Quick Links</h6>
                        <div className="d-flex flex-column gap-2">
                            {['Job Notifications', 'PAN Card', 'Aadhaar Update', 'Scholarships'].map(l => (
                                <Link key={l} to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#00b4d8'}
                                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                                    › {l}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <h6 style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, marginBottom: 16 }}>Disclaimer</h6>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                            This is a service facilitation portal. We are not a government body.
                            All information is provided for guidance purposes only.
                        </p>
                    </div>
                </div>
                <div className="d-flex justify-content-between align-items-center pt-4 flex-wrap gap-2">
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                        {t('footer.rights')}
                    </p>
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
                        Made with ❤️ for India
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
