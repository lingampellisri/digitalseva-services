import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api/client';
import { FiSave } from 'react-icons/fi';

const convertDriveLink = (url) => {
    if (!url) return url;
    const driveRegex = /(?:drive\.google\.com\/file\/d\/|id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
};

const ManageOperator = ({ existing, onSuccess }) => {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        name: existing?.name || '',
        age: existing?.age || '',
        phone: existing?.phone || '',
        email: existing?.email || '',
        address: existing?.address || '',
        photoUrl: existing?.photoUrl || '',
        whatsapp: existing?.whatsapp || '',
        bio: existing?.bio || '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await API.post('/operator', form);
            onSuccess(res.data);
            setMessage('Operator saved successfully!');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const f = (field, label, placeholder, type = 'text') => (
        <div className="form-group-ag">
            <label className="form-label-ag">{label}</label>
            <input type={type} className="form-control-ag" value={form[field]}
                onChange={e => {
                    let val = e.target.value;
                    if (field === 'photoUrl') {
                        val = convertDriveLink(val);
                    }
                    setForm(p => ({ ...p, [field]: val }));
                }}
                placeholder={placeholder} />
        </div>
    );

    return (
        <div className="admin-card">
            <h5 className="mb-4" style={{ fontWeight: 700 }}>👤 {t('admin.manageOperator')}</h5>

            {message && <div className={`alert-ag ${message.includes('success') ? 'alert-success' : 'alert-error'} mb-4`}>{message}</div>}

            {/* Preview */}
            {form.name && (
                <div className="d-flex align-items-center gap-3 mb-4 p-3" style={{ background: 'rgba(0,180,216,0.06)', borderRadius: 12, border: '1px solid rgba(0,180,216,0.12)' }}>
                    {form.photoUrl ? (
                        form.photoUrl.includes('/preview') ? (
                            <iframe src={form.photoUrl} title={form.name} style={{ width: 60, height: 60, borderRadius: '50%', border: 'none', objectFit: 'cover', pointerEvents: 'none', overflow: 'hidden' }} />
                        ) : (
                            <img src={form.photoUrl} alt={form.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
                        )
                    ) : (
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#00b4d8,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
                            {form.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{form.name}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{form.phone}</div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-12 col-md-6">{f('name', t('admin.name') + ' *', 'Operator Name')}</div>
                    <div className="col-12 col-md-6">{f('age', t('admin.age') + ' (years)', '30', 'number')}</div>
                    <div className="col-12 col-md-6">{f('phone', t('admin.phone') + ' *', '+91 9876543210', 'tel')}</div>
                    <div className="col-12 col-md-6">{f('whatsapp', t('admin.whatsapp'), '+91 9876543210', 'tel')}</div>
                    <div className="col-12 col-md-6">{f('email', t('admin.email'), 'email@example.com', 'email')}</div>
                    <div className="col-12 col-md-6">{f('photoUrl', t('admin.photoUrl'), 'https://example.com/photo.jpg', 'url')}</div>
                    <div className="col-12">{f('address', t('admin.address'), 'Plot 12, Hyderabad, Telangana')}</div>
                    <div className="col-12">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.bio')}</label>
                            <textarea className="form-control-ag" rows={3}
                                value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                placeholder="Brief bio about the operator..." style={{ resize: 'vertical' }} />
                        </div>
                    </div>
                </div>
                <button type="submit" className="btn-primary-ag mt-4" disabled={loading}>
                    {loading ? <span className="spinner-ag" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><FiSave /> {t('admin.saveOperator')}</>}
                </button>
            </form>
        </div>
    );
};

export default ManageOperator;
