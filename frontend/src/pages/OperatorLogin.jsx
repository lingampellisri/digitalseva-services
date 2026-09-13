import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import { FiPhone, FiLock, FiLogIn } from 'react-icons/fi';

const OperatorLogin = () => {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ phone: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await API.post('/auth/operator/login', form);
            login(res.data.token, {
                id: res.data.operatorId,
                role: 'operator',
                operatorId: res.data.operatorId,
                name: res.data.name
            });
            navigate('/operator');
        } catch (err) {
            setError(err.response?.data?.message || t('admin.loginError', 'Invalid credentials'));
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
                        {t('operatorLogin.title', 'Operator Portal')}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: 6 }}>
                        {t('operatorLogin.subtitle', 'Sign in to manage your customer requests')}
                    </p>
                </div>

                {error && <div className="alert-ag alert-error mb-4">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group-ag">
                        <label className="form-label-ag" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {t('operatorLogin.phone', 'Phone Number')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiPhone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type="tel" required
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="form-control-ag"
                                style={{ paddingLeft: 42, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                                placeholder="9876543210"
                            />
                        </div>
                    </div>

                    <div className="form-group-ag">
                        <label className="form-label-ag" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {t('operatorLogin.password', 'Password')}
                        </label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                            <input
                                type="password" required
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="form-control-ag"
                                style={{ paddingLeft: 42, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'white' }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary-ag w-100 justify-content-center mt-2" disabled={loading}>
                        {loading ? <span className="spinner-ag" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><FiLogIn /> {t('operatorLogin.signIn', 'Sign In as Operator')}</>}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', margin: 0 }}>
                        {t('operatorLogin.help', 'Contact admin for your login credentials')}
                    </p>
                    <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OperatorLogin;
