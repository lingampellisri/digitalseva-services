import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';

const Navbar = ({ darkMode, toggleDarkMode }) => {
    const { t, i18n } = useTranslation();
    const { isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleLang = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'te' : 'en');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar-ag">
            <div className="container">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    {/* Brand */}
                    <Link to="/" className="text-decoration-none">
                        <div className="navbar-brand-ag">
                            <span className="navbar-logo">Digital Seva</span>
                            <span className="navbar-tagline">{t('nav.tagline')}</span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="d-none d-md-flex align-items-center gap-3">
                        <Link to="/" className="nav-link" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', padding: '8px 16px', borderRadius: '8px', transition: 'all 0.3s' }}
                            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.target.style.background = 'transparent'}>
                            {t('nav.home')}
                        </Link>

                        <button className="btn-lang" onClick={toggleLang}>
                            {i18n.language === 'en' ? 'తెలుగు' : 'English'}
                        </button>

                        <button className="btn-darkmode" onClick={toggleDarkMode}>
                            {darkMode ? <FiSun /> : <FiMoon />}
                        </button>

                        {isAdmin ? (
                            <button className="btn-admin" onClick={handleLogout}>
                                {t('admin.logout')}
                            </button>
                        ) : (
                            <Link to="/admin/login" className="btn-admin">
                                {t('nav.admin')}
                            </Link>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <div className="d-flex d-md-none align-items-center gap-2">
                        <button className="btn-lang" onClick={toggleLang} style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
                            {i18n.language === 'en' ? 'తె' : 'EN'}
                        </button>
                        <button className="btn-darkmode" onClick={toggleDarkMode}>
                            {darkMode ? <FiSun /> : <FiMoon />}
                        </button>
                        <button className="btn-darkmode" onClick={() => setMenuOpen(!menuOpen)}>
                            {menuOpen ? <FiX /> : <FiMenu />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="d-md-none mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="d-flex flex-column gap-2">
                            <Link to="/" className="btn-admin text-center" onClick={() => setMenuOpen(false)}>
                                {t('nav.home')}
                            </Link>
                            {isAdmin ? (
                                <button className="btn-admin w-100" onClick={handleLogout}>{t('admin.logout')}</button>
                            ) : (
                                <Link to="/admin/login" className="btn-admin text-center" onClick={() => setMenuOpen(false)}>
                                    {t('nav.admin')}
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
