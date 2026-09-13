import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api/client';
import {
    FiSave, FiPlus, FiEdit2, FiTrash2, FiX, FiToggleLeft,
    FiToggleRight, FiPhone, FiMail, FiKey, FiCheck, FiShield, FiUser
} from 'react-icons/fi';

const convertDriveLink = (url) => {
    if (!url) return url;
    const driveRegex = /(?:drive\.google\.com\/file\/d\/|id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
};

const OPERATOR_ROLES = [
    {
        value: 'senior_operator',
        label: '🌟 Senior Lead Operator',
        desc: 'Full queue visibility, contact export, all updates',
        defaultPerms: {
            canUpdateStatus: true,
            canAddNotes: true,
            canViewAllRequests: true,
            canExportContacts: true,
            canEditProfile: true
        }
    },
    {
        value: 'operator',
        label: '🛡️ Standard Operator',
        desc: 'Assigned customer queue, status updates & messaging',
        defaultPerms: {
            canUpdateStatus: true,
            canAddNotes: true,
            canViewAllRequests: false,
            canExportContacts: false,
            canEditProfile: true
        }
    },
    {
        value: 'trainee_operator',
        label: '🔰 Trainee / Junior Operator',
        desc: 'Read-only on status, customer notes only',
        defaultPerms: {
            canUpdateStatus: false,
            canAddNotes: true,
            canViewAllRequests: false,
            canExportContacts: false,
            canEditProfile: false
        }
    }
];

const DEFAULT_PERMISSIONS = {
    canUpdateStatus: true,
    canAddNotes: true,
    canViewAllRequests: false,
    canExportContacts: false,
    canEditProfile: true
};

const EMPTY_FORM = {
    name: '', age: '', phone: '', email: '', password: '',
    address: '', photoUrl: '', whatsapp: '', whatsappGroupLink: '', bio: '',
    role: 'operator',
    permissions: { ...DEFAULT_PERMISSIONS },
    isActive: true, sortOrder: 0
};

const ManageOperator = ({ operators = [], onRefresh }) => {
    const { t } = useTranslation();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [resetPwId, setResetPwId] = useState(null);
    const [newPw, setNewPw] = useState('');

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    };

    const openAddForm = () => {
        setForm({ ...EMPTY_FORM, sortOrder: operators.length, password: 'Operator@123' });
        setEditingId(null);
        setShowForm(true);
    };

    const openEditForm = (op) => {
        setForm({
            name: op.name || '',
            age: op.age || '',
            phone: op.phone || '',
            email: op.email || '',
            password: '', // blank on edit, use reset-pw
            address: op.address || '',
            photoUrl: op.photoUrl || '',
            whatsapp: op.whatsapp || '',
            whatsappGroupLink: op.whatsappGroupLink || '',
            bio: op.bio || '',
            role: op.role || 'operator',
            permissions: {
                ...DEFAULT_PERMISSIONS,
                ...(op.permissions || {})
            },
            isActive: op.isActive !== false,
            sortOrder: op.sortOrder || 0,
        });
        setEditingId(op._id);
        setShowForm(true);
    };

    const handleRoleChange = (selectedRole) => {
        const roleObj = OPERATOR_ROLES.find(r => r.value === selectedRole);
        setForm(p => ({
            ...p,
            role: selectedRole,
            permissions: roleObj ? { ...roleObj.defaultPerms } : p.permissions
        }));
    };

    const handlePermissionToggle = (permKey) => {
        setForm(p => ({
            ...p,
            permissions: {
                ...p.permissions,
                [permKey]: !p.permissions[permKey]
            }
        }));
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
                showMessage(t('admin.operatorUpdated') || 'Operator updated successfully!');
            } else {
                await API.post('/operators', form);
                showMessage(t('admin.operatorCreated') || 'Operator created successfully!');
            }
            closeForm();
            onRefresh();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Failed to save operator', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`${t('admin.confirmDeleteOperator') || 'Delete operator?'}\n\n"${name}"`)) return;
        try {
            await API.delete(`/operators/${id}`);
            showMessage(t('admin.operatorDeleted') || 'Operator deleted');
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

    const handleResetPassword = async (id) => {
        if (!newPw || newPw.length < 4) {
            showMessage('Password must be at least 4 characters', 'error');
            return;
        }
        try {
            await API.patch(`/operators/${id}/reset-password`, { newPassword: newPw });
            showMessage('Password reset successfully!');
            setResetPwId(null);
            setNewPw('');
        } catch (err) {
            showMessage(err.response?.data?.message || 'Failed to reset password', 'error');
        }
    };

    const f = (field, label, placeholder, type = 'text') => (
        <div className="form-group-ag">
            <label className="form-label-ag">{label}</label>
            <input
                type={type}
                className="form-control-ag"
                value={form[field]}
                onChange={e => {
                    let val = e.target.value;
                    if (field === 'photoUrl') val = convertDriveLink(val);
                    setForm(p => ({ ...p, [field]: val }));
                }}
                placeholder={placeholder}
            />
        </div>
    );

    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    const getRoleMeta = (role) => {
        switch (role) {
            case 'senior_operator':
                return { label: 'Senior Lead', bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706', icon: '🌟' };
            case 'trainee_operator':
                return { label: 'Trainee', bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', icon: '🔰' };
            case 'operator':
            default:
                return { label: 'Standard Op', bg: 'rgba(16, 185, 129, 0.15)', color: '#059669', icon: '🛡️' };
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="admin-card" style={{ marginBottom: 20 }}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h5 style={{ margin: 0, fontWeight: 700 }}>👥 {t('admin.manageOperators') || 'Operator Management & Access Roles'}</h5>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {operators.length} operators • Manage operator roles (Senior Lead, Standard, Trainee) and granular permissions.
                        </p>
                    </div>
                    <button className="btn-primary-ag" onClick={openAddForm}>
                        <FiPlus /> {t('admin.addOperator') || 'Add Operator'}
                    </button>
                </div>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`alert-ag ${message.type === 'error' ? 'alert-error' : 'alert-success'} mb-3`}>
                    {message.text}
                </div>
            )}

            {/* Add / Edit Form */}
            {showForm && (
                <div className="admin-card mb-4" style={{ border: '2px solid var(--accent-blue)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 style={{ margin: 0, fontWeight: 700 }}>
                            {editingId ? `✏️ ${t('admin.editOperator') || 'Edit Operator & Permissions'}` : `➕ ${t('admin.addOperator') || 'Create New Operator'}`}
                        </h5>
                        <button className="btn-darkmode" onClick={closeForm} style={{ padding: '6px 8px' }}>
                            <FiX size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            {/* Basic Info */}
                            <div className="col-12 col-md-6">{f('name', (t('admin.name') || 'Name') + ' *', 'e.g. Ramesh Varma')}</div>
                            <div className="col-12 col-md-6">{f('phone', (t('admin.phone') || 'Phone (Login ID)') + ' *', '9876543210', 'tel')}</div>

                            {!editingId && (
                                <div className="col-12 col-md-6">
                                    <div className="form-group-ag">
                                        <label className="form-label-ag">Initial Login Password *</label>
                                        <input
                                            type="text"
                                            className="form-control-ag"
                                            value={form.password}
                                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                            placeholder="Operator@123"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="col-12 col-md-6">{f('email', t('admin.email') || 'Email', 'email@example.com', 'email')}</div>
                            <div className="col-12 col-md-6">{f('age', (t('admin.age') || 'Age') + ' (years)', '30', 'number')}</div>
                            <div className="col-12 col-md-6">{f('whatsapp', t('admin.whatsapp') || 'WhatsApp Phone', '9876543210', 'tel')}</div>
                            <div className="col-12 col-md-6">{f('photoUrl', t('admin.photoUrl') || 'Photo URL', 'https://example.com/photo.jpg', 'url')}</div>
                            <div className="col-12 col-md-6">{f('whatsappGroupLink', 'WhatsApp Group Link', 'https://chat.whatsapp.com/...', 'url')}</div>
                            <div className="col-12">{f('address', t('admin.address') || 'Service Center Address', 'Main Road, Hanamkonda, Warangal')}</div>

                            {/* ROLE & PERMISSION SECTION */}
                            <div className="col-12 mt-4">
                                <div style={{
                                    padding: 20,
                                    borderRadius: 12,
                                    background: 'rgba(0,180,216,0.05)',
                                    border: '1px solid rgba(0,180,216,0.2)'
                                }}>
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <FiShield style={{ color: 'var(--accent-blue)' }} />
                                        <h6 style={{ margin: 0, fontWeight: 700, color: 'var(--text-dark)' }}>
                                            Role & Access Permissions (Admin Managed)
                                        </h6>
                                    </div>

                                    {/* Role Selector */}
                                    <div className="form-group-ag mb-3">
                                        <label className="form-label-ag">Select Operator Role Tier</label>
                                        <select
                                            className="form-control-ag"
                                            value={form.role}
                                            onChange={e => handleRoleChange(e.target.value)}
                                        >
                                            {OPERATOR_ROLES.map(r => (
                                                <option key={r.value} value={r.value}>
                                                    {r.label} — {r.desc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Granular Permissions Checkboxes */}
                                    <label className="form-label-ag mb-2">Granular Permissions Assigned</label>
                                    <div className="row g-2">
                                        {[
                                            { key: 'canUpdateStatus', label: 'Update Request Status (In Progress, Completed, Rejected)' },
                                            { key: 'canAddNotes', label: 'Add Internal Notes & Send Customer Messages' },
                                            { key: 'canViewAllRequests', label: 'View All Requests Queue (Senior Multi-Operator View)' },
                                            { key: 'canExportContacts', label: 'Export Customer Contact Numbers / CSV' },
                                            { key: 'canEditProfile', label: 'Update Profile, Bio & Photo' },
                                        ].map(perm => (
                                            <div key={perm.key} className="col-12 col-md-6">
                                                <label style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    padding: '8px 12px',
                                                    borderRadius: 8,
                                                    background: form.permissions?.[perm.key] ? 'rgba(34, 197, 94, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                                                    border: `1px solid ${form.permissions?.[perm.key] ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-color)'}`,
                                                    cursor: 'pointer',
                                                    fontSize: '0.82rem',
                                                    margin: 0
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!form.permissions?.[perm.key]}
                                                        onChange={() => handlePermissionToggle(perm.key)}
                                                    />
                                                    <span style={{ fontWeight: form.permissions?.[perm.key] ? 600 : 400 }}>
                                                        {perm.label}
                                                    </span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="col-12 mt-3">
                                <div className="form-group-ag">
                                    <label className="form-label-ag">{t('admin.bio') || 'Operator Bio / Specialty'}</label>
                                    <textarea
                                        className="form-control-ag"
                                        rows={2}
                                        value={form.bio}
                                        onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                        placeholder="Specialist in Passport, PAN Card & Government Schemes..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-3 mt-4">
                            <button type="submit" className="btn-primary-ag" disabled={loading}>
                                {loading ? 'Saving...' : <><FiSave /> {editingId ? (t('admin.update') || 'Update Operator') : (t('admin.saveOperator') || 'Save Operator')}</>}
                            </button>
                            <button type="button" className="btn-darkmode" onClick={closeForm}>
                                {t('admin.cancel') || 'Cancel'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Password Reset Modal */}
            {resetPwId && (
                <div className="ad-modal-backdrop" onClick={() => setResetPwId(null)}>
                    <div className="ad-modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                        <div className="ad-modal-header">
                            <h5>🔑 Reset Operator Password</h5>
                            <button type="button" className="ad-modal-close" onClick={() => setResetPwId(null)}>
                                <FiX size={18} />
                            </button>
                        </div>
                        <div className="ad-modal-body">
                            <div className="form-group-ag">
                                <label className="form-label-ag">New Password (minimum 4 characters)</label>
                                <input
                                    type="password"
                                    className="form-control-ag"
                                    value={newPw}
                                    onChange={e => setNewPw(e.target.value)}
                                    placeholder="Enter new secure password"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="ad-modal-footer d-flex gap-2">
                            <button className="btn-primary-ag" onClick={() => handleResetPassword(resetPwId)}>
                                Set Password
                            </button>
                            <button className="btn-darkmode" onClick={() => setResetPwId(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Operators List Cards */}
            {operators.length === 0 ? (
                <div className="admin-card text-center p-5">
                    <h5>No operators registered</h5>
                    <button className="btn-primary-ag mt-3" onClick={openAddForm}>
                        <FiPlus /> Add First Operator
                    </button>
                </div>
            ) : (
                <div className="row g-3">
                    {operators.map((op) => {
                        const roleMeta = getRoleMeta(op.role);
                        return (
                            <div key={op._id} className="col-12 col-md-6 col-lg-4">
                                <div className="admin-card h-100 d-flex flex-column" style={{
                                    opacity: op.isActive ? 1 : 0.65,
                                    border: op.isActive ? '1px solid var(--border-color)' : '1px dashed var(--border-color)'
                                }}>
                                    <div className="d-flex align-items-start gap-3 mb-3">
                                        {/* Avatar */}
                                        <div style={{
                                            width: 52, height: 52, borderRadius: '50%',
                                            background: 'linear-gradient(135deg,#00b4d8,#7c3aed)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0
                                        }}>
                                            {getInitials(op.name)}
                                        </div>

                                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                            <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                                                <h6 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{op.name}</h6>
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                                                    borderRadius: 50, background: roleMeta.bg, color: roleMeta.color
                                                }}>
                                                    {roleMeta.icon} {roleMeta.label}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                📞 {op.phone}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Permissions Badges */}
                                    <div className="d-flex flex-wrap gap-1 mb-3">
                                        {op.permissions?.canViewAllRequests && (
                                            <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(0,180,216,0.1)', color: 'var(--accent-blue)' }}>
                                                👁️ View All Queue
                                            </span>
                                        )}
                                        {op.permissions?.canUpdateStatus && (
                                            <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                                                ✓ Status Update
                                            </span>
                                        )}
                                        {op.permissions?.canExportContacts && (
                                            <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.1)', color: '#9333ea' }}>
                                                📥 Export Contacts
                                            </span>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="d-flex justify-content-between p-2 rounded mb-3" style={{ background: 'rgba(0,0,0,0.03)', fontSize: '0.78rem' }}>
                                        <span>Assigned: <strong>{op.totalAssigned || 0}</strong></span>
                                        <span>Completed: <strong>{op.totalCompleted || 0}</strong></span>
                                        <span>Status: <strong style={{ color: op.isActive ? '#16a34a' : '#ef4444' }}>{op.isActive ? 'Active' : 'Inactive'}</strong></span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2 mt-auto pt-2" style={{ borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                                        <button
                                            type="button"
                                            className="btn-edit-ag"
                                            onClick={() => openEditForm(op)}
                                            style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                                        >
                                            <FiEdit2 size={12} /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-darkmode"
                                            onClick={() => setResetPwId(op._id)}
                                            style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: 8 }}
                                            title="Change Password"
                                        >
                                            <FiKey size={12} /> Password
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(op._id)}
                                            style={{
                                                padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                                fontSize: '0.75rem', fontWeight: 600,
                                                background: op.isActive ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                                                color: op.isActive ? '#f59e0b' : '#16a34a'
                                            }}
                                        >
                                            {op.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-danger-ag"
                                            onClick={() => handleDelete(op._id, op.name)}
                                            style={{ padding: '5px 10px', marginLeft: 'auto', fontSize: '0.75rem' }}
                                        >
                                            <FiTrash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ManageOperator;
