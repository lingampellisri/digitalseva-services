import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';

const AdminLogin = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/auth/login', form);
            login(res.data.token);
            navigate('/admin');
        } catch {
            setError(t('admin.loginError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            {/* Background orbs */}
            <div className="hero-orb hero-orb-1" />
            <div className="hero-orb hero-orb-2" />

            <div className="admin-login-card" style={{ position: 'relative', zIndex: 2 }}>
                <div className="text-center mb-5">
                    <div className="navbar-logo mb-2" style={{ fontSize: '2rem' }}>Digital Seva</div>
                    <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                        {t('admin.login')}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: 6 }}>
                        Secure admin access
                    </p>
                </div>

                {error && <div className="alert-ag alert-error mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group-ag">
                        <label className="form-label-ag" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {t('admin.username')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type="text"
                                required
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="form-control-ag"
                                style={{ paddingLeft: 42, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                                placeholder="admin"
                            />
                        </div>
                    </div>

                    <div className="form-group-ag">
                        <label className="form-label-ag" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {t('admin.password')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="form-control-ag"
                                style={{ paddingLeft: 42, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary-ag w-100 justify-content-center mt-2" disabled={loading}>
                        {loading ? <span className="spinner-ag" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><FiLogIn /> {t('admin.loginBtn')}</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
