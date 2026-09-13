import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { FiSun, FiMoon, FiMenu, FiX, FiShield, FiUserCheck, FiLogOut, FiSearch } from 'react-icons/fi';

const Navbar = ({ darkMode, toggleDarkMode }) => {
    const { t, i18n } = useTranslation();
    const { user, isAdmin, isOperator, logout } = useAuth();
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
                            <span className="navbar-tagline">{t('nav.tagline') || 'Government & Citizen Services'}</span>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="d-none d-md-flex align-items-center gap-3">
                        <Link to="/" className="nav-link" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', padding: '8px 14px', borderRadius: '8px', transition: 'all 0.3s' }}>
                            {t('nav.home') || 'Home'}
                        </Link>

                        <Link to="/track" className="nav-link" style={{
                            color: '#38bdf8',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(56,189,248,0.3)',
                            background: 'rgba(56,189,248,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        }}>
                            <FiSearch size={14} /> {t('nav.track') || 'Track Status'}
                        </Link>

                        <button className="btn-lang" onClick={toggleLang}>
                            {i18n.language === 'en' ? 'తెలుగు' : 'English'}
                        </button>

                        <button className="btn-darkmode" onClick={toggleDarkMode} title="Toggle Theme">
                            {darkMode ? <FiSun /> : <FiMoon />}
                        </button>

                        {/* Role-Based Portals Navigation */}
                        {isAdmin ? (
                            <div className="d-flex align-items-center gap-2">
                                <Link to="/admin" className="btn-admin" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FiShield size={14} /> Admin Panel
                                </Link>
                                <button className="btn-darkmode" onClick={handleLogout} title="Logout" style={{ padding: '8px 12px', color: '#f87171' }}>
                                    <FiLogOut size={16} />
                                </button>
                            </div>
                        ) : isOperator ? (
                            <div className="d-flex align-items-center gap-2">
                                <Link to="/operator" className="btn-admin" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#00b4d8,#0077b6)' }}>
                                    <FiUserCheck size={14} /> Operator Portal
                                </Link>
                                <button className="btn-darkmode" onClick={handleLogout} title="Logout" style={{ padding: '8px 12px', color: '#f87171' }}>
                                    <FiLogOut size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <Link to="/operator/login" style={{
                                    color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: 600,
                                    textDecoration: 'none', padding: '6px 12px', borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    Operator Login
                                </Link>
                                <Link to="/admin/login" className="btn-admin">
                                    {t('nav.admin') || 'Admin'}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <div className="d-flex d-md-none align-items-center gap-2">
                        <Link to="/track" className="btn-admin" style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#38bdf8', borderColor: '#38bdf8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                            <FiSearch size={12} /> Track
                        </Link>
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
                                {t('nav.home') || 'Home'}
                            </Link>
                            <Link to="/track" className="btn-admin text-center" onClick={() => setMenuOpen(false)} style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}>
                                🔍 {t('nav.track') || 'Track Status'}
                            </Link>
                            {isAdmin ? (
                                <>
                                    <Link to="/admin" className="btn-admin text-center" onClick={() => setMenuOpen(false)}>
                                        Admin Panel
                                    </Link>
                                    <button className="btn-admin w-100" onClick={handleLogout} style={{ color: '#f87171' }}>
                                        {t('admin.logout') || 'Logout'}
                                    </button>
                                </>
                            ) : isOperator ? (
                                <>
                                    <Link to="/operator" className="btn-admin text-center" onClick={() => setMenuOpen(false)}>
                                        Operator Portal
                                    </Link>
                                    <button className="btn-admin w-100" onClick={handleLogout} style={{ color: '#f87171' }}>
                                        {t('admin.logout') || 'Logout'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/operator/login" className="btn-admin text-center" onClick={() => setMenuOpen(false)}>
                                        Operator Login
                                    </Link>
                                    <Link to="/admin/login" className="btn-admin text-center" onClick={() => setMenuOpen(false)}>
                                        {t('nav.admin') || 'Admin'}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
