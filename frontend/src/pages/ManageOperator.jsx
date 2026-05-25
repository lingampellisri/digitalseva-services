import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api/client';
import { FiSave, FiPlus, FiEdit2, FiTrash2, FiX, FiToggleLeft, FiToggleRight, FiPhone, FiMail } from 'react-icons/fi';

const convertDriveLink = (url) => {
    if (!url) return url;
    const driveRegex = /(?:drive\.google\.com\/file\/d\/|id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
};

const EMPTY_FORM = {
    name: '', age: '', phone: '', email: '',
    address: '', photoUrl: '', whatsapp: '', bio: '',
    isActive: true, sortOrder: 0
};

const ManageOperator = ({ operators = [], onRefresh }) => {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const openAddForm = () => {
        setForm({ ...EMPTY_FORM, sortOrder: operators.length });
        setEditingId(null);
        setShowForm(true);
    };

    const openEditForm = (op) => {
        setForm({
            name: op.name || '',
            age: op.age || '',
            phone: op.phone || '',
            email: op.email || '',
            address: op.address || '',
            photoUrl: op.photoUrl || '',
            whatsapp: op.whatsapp || '',
            bio: op.bio || '',
            isActive: op.isActive !== false,
            sortOrder: op.sortOrder || 0,
        });
        setEditingId(op._id);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await API.put(`/operators/${editingId}`, form);
                showMessage(t('admin.operatorUpdated'));
            } else {
                await API.post('/operators', form);
                showMessage(t('admin.operatorCreated'));
            }
            closeForm();
            onRefresh();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Failed to save', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`${t('admin.confirmDeleteOperator')}\n\n"${name}"`)) return;
        try {
            await API.delete(`/operators/${id}`);
            showMessage(t('admin.operatorDeleted'));
            onRefresh();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Failed to delete', 'error');
        }
    };

    const handleToggle = async (id) => {
        try {
            await API.patch(`/operators/${id}/toggle`);
            onRefresh();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Failed to toggle', 'error');
        }
    };

    const f = (field, label, placeholder, type = 'text') => (
        <div className="form-group-ag">
            <label className="form-label-ag">{label}</label>
            <input type={type} className="form-control-ag" value={form[field]}
                onChange={e => {
                    let val = e.target.value;
                    if (field === 'photoUrl') val = convertDriveLink(val);
                    setForm(p => ({ ...p, [field]: val }));
                }}
                placeholder={placeholder} />
        </div>
    );

    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <div>
            {/* Header */}
            <div className="admin-card" style={{ marginBottom: 20 }}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h5 style={{ margin: 0, fontWeight: 700 }}>👥 {t('admin.manageOperators')}</h5>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {operators.length} {operators.length === 1 ? 'operator' : 'operators'} • {operators.filter(o => o.isActive).length} active
                        </p>
                    </div>
                    <button className="btn-primary-ag" onClick={openAddForm}>
                        <FiPlus /> {t('admin.addOperator')}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`alert-ag ${message.type === 'error' ? 'alert-error' : 'alert-success'} mb-3`}
                    style={{ animation: 'fadeInDown 0.3s ease' }}>
                    {message.text}
                </div>
            )}

            {/* Form (inline card) */}
            {showForm && (
                <div className="admin-card mb-3" style={{
                    border: '2px solid var(--accent-blue)',
                    animation: 'fadeInDown 0.3s ease',
                }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 style={{ margin: 0, fontWeight: 700 }}>
                            {editingId ? `✏️ ${t('admin.editOperator')}` : `➕ ${t('admin.addOperator')}`}
                        </h5>
                        <button className="btn-darkmode" onClick={closeForm} style={{ padding: '6px 8px' }}>
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Live Preview */}
                    {form.name && (
                        <div className="d-flex align-items-center gap-3 mb-4 p-3"
                            style={{ background: 'rgba(0,180,216,0.06)', borderRadius: 12, border: '1px solid rgba(0,180,216,0.12)' }}>
                            {form.photoUrl ? (
                                form.photoUrl.includes('/preview') ? (
                                    <iframe src={form.photoUrl} title={form.name}
                                        style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', pointerEvents: 'none', overflow: 'hidden' }} />
                                ) : (
                                    <img src={form.photoUrl} alt={form.name}
                                        style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }} />
                                )
                            ) : (
                                <div style={{
                                    width: 50, height: 50, borderRadius: '50%',
                                    background: 'linear-gradient(135deg,#00b4d8,#7c3aed)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0
                                }}>
                                    {getInitials(form.name)}
                                </div>
                            )}
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{form.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{form.phone}</div>
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
                        <div className="d-flex gap-3 mt-4">
                            <button type="submit" className="btn-primary-ag" disabled={loading}>
                                {loading
                                    ? <span className="spinner-ag" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                    : <><FiSave /> {editingId ? t('admin.update') : t('admin.saveOperator')}</>
                                }
                            </button>
                            <button type="button" className="btn-darkmode" onClick={closeForm}
                                style={{ padding: '8px 20px', borderRadius: 10 }}>
                                {t('admin.cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Operators List */}
            {operators.length === 0 ? (
                <div className="admin-card">
                    <div className="empty-state">
                        <div className="empty-state-icon">👤</div>
                        <div className="empty-state-title">{t('admin.noOperators')}</div>
                        <div className="empty-state-text">Add your first operator using the button above</div>
                        <button className="btn-primary-ag mt-3" onClick={openAddForm}>
                            <FiPlus /> {t('admin.addOperator')}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {operators.map((op, idx) => (
                        <div key={op._id} className="col-12 col-md-6">
                            <div className="admin-card h-100" style={{
                                opacity: op.isActive ? 1 : 0.6,
                                border: op.isActive ? undefined : '1px dashed var(--border-color)',
                                transition: 'all 0.3s ease'
                            }}>
                                {/* Card Header */}
                                <div className="d-flex align-items-start gap-3 mb-3">
                                    {/* Avatar */}
                                    {op.photoUrl ? (
                                        op.photoUrl.includes('/preview') ? (
                                            <iframe src={op.photoUrl} title={op.name}
                                                style={{ width: 56, height: 56, borderRadius: '50%', border: 'none', pointerEvents: 'none', overflow: 'hidden', flexShrink: 0 }} />
                                        ) : (
                                            <img src={op.photoUrl} alt={op.name}
                                                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                        )
                                    ) : (
                                        <div style={{
                                            width: 56, height: 56, borderRadius: '50%',
                                            background: op.isActive
                                                ? 'linear-gradient(135deg,#00b4d8,#7c3aed)'
                                                : 'linear-gradient(135deg,#94a3b8,#64748b)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
                                        }}>
                                            {getInitials(op.name)}
                                        </div>
                                    )}

                                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <h6 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{op.name}</h6>
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                                                borderRadius: 50, textTransform: 'uppercase', letterSpacing: '0.5px',
                                                background: op.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                                color: op.isActive ? '#16a34a' : '#ef4444'
                                            }}>
                                                {op.isActive ? t('admin.operatorActive') : t('admin.operatorInactive')}
                                            </span>
                                        </div>
                                        {op.phone && (
                                            <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                <FiPhone size={12} /> {op.phone}
                                            </div>
                                        )}
                                        {op.email && (
                                            <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                                <FiMail size={12} /> {op.email}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                {op.bio && (
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12,
                                        lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis',
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {op.bio}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="d-flex gap-2 mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <button className="btn-edit-ag" title={t('admin.editOperator')}
                                        onClick={() => openEditForm(op)}
                                        style={{ padding: '6px 12px', borderRadius: 8 }}>
                                        <FiEdit2 size={14} /> <span style={{ fontSize: '0.78rem' }}>Edit</span>
                                    </button>
                                    <button
                                        title={op.isActive ? 'Deactivate' : 'Activate'}
                                        onClick={() => handleToggle(op._id)}
                                        style={{
                                            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600,
                                            background: op.isActive ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                                            color: op.isActive ? '#f59e0b' : '#16a34a',
                                            transition: 'all 0.2s ease'
                                        }}>
                                        {op.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                                        {op.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="btn-danger-ag" title={t('admin.deleteOperator')}
                                        onClick={() => handleDelete(op._id, op.name)}
                                        style={{ padding: '6px 12px', borderRadius: 8, marginLeft: 'auto' }}>
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageOperator;
