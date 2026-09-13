import { useState, useEffect } from 'react';
import API from '../api/client';
import MarketingAd from '../components/MarketingAd';
import {
    FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
    FiSave, FiX, FiExternalLink, FiEye, FiZap
} from 'react-icons/fi';

const MEDIA_TYPES = [
    { value: 'auto', label: '⚡ Auto Detect from URL' },
    { value: 'image', label: '🖼️ Image (JPG, JPEG, PNG, SVG, WEBP)' },
    { value: 'video', label: '🎬 Video (MP4, WebM, YouTube, Vimeo)' },
    { value: 'pdf', label: '📄 PDF Document Preview' },
    { value: 'gif', label: '✨ Animated GIF' },
    { value: 'document', label: '📁 Document / Office File' },
];

const PLACEMENTS = [
    { value: 'post_details', label: 'Post Details Page' },
    { value: 'home_sidebar', label: 'Home Page Sidebar' },
    { value: 'banner', label: 'Top / Global Banner' },
    { value: 'all', label: 'All Placements' },
];

const EMPTY_FORM = {
    title: '',
    mediaUrl: '',
    mediaType: 'auto',
    linkUrl: '',
    description: '',
    badge: 'Marketing Partner',
    placement: 'post_details',
    isActive: true,
    sortOrder: 0
};

const ManageAds = () => {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            setLoading(true);
            const res = await API.get('/ads/all');
            setAds(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3500);
    };

    const openAdd = () => {
        setForm({ ...EMPTY_FORM, sortOrder: ads.length });
        setEditingId(null);
        setShowForm(true);
    };

    const openEdit = (ad) => {
        setForm({
            title: ad.title || '',
            mediaUrl: ad.mediaUrl || '',
            mediaType: ad.mediaType || 'auto',
            linkUrl: ad.linkUrl || '',
            description: ad.description || '',
            badge: ad.badge || 'Marketing Partner',
            placement: ad.placement || 'post_details',
            isActive: ad.isActive !== false,
            sortOrder: ad.sortOrder || 0
        });
        setEditingId(ad._id);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.mediaUrl) {
            showMsg('Title and Media URL are required', 'error');
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await API.put(`/ads/${editingId}`, form);
                showMsg('Advertisement updated successfully!');
            } else {
                await API.post('/ads', form);
                showMsg('Advertisement created successfully!');
            }
            closeForm();
            fetchAds();
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to save advertisement', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await API.patch(`/ads/${id}/toggle`);
            fetchAds();
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to toggle status', 'error');
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete advertisement "${title}"?`)) return;
        try {
            await API.delete(`/ads/${id}`);
            showMsg('Advertisement deleted');
            fetchAds();
        } catch (err) {
            showMsg(err.response?.data?.message || 'Failed to delete advertisement', 'error');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="admin-card mb-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h5 style={{ margin: 0, fontWeight: 700 }}>📢 Marketing & Ads Management</h5>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Paste marketing URLs (Image, SVG, Video, PDF, GIF, Document) to display on Post Details and site placements.
                        </p>
                    </div>
                    <button className="btn-primary-ag" onClick={openAdd}>
                        <FiPlus /> Create New Ad
                    </button>
                </div>
            </div>

            {/* Alert Message */}
            {message.text && (
                <div className={`alert-ag ${message.type === 'error' ? 'alert-error' : 'alert-success'} mb-3`}>
                    {message.text}
                </div>
            )}

            {/* Add / Edit Form with Live Real-Time Preview */}
            {showForm && (
                <div className="admin-card mb-4" style={{ border: '2px solid var(--accent-blue)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 style={{ margin: 0, fontWeight: 700 }}>
                            {editingId ? '✏️ Edit Marketing Ad' : '➕ Create New Marketing Ad'}
                        </h5>
                        <button className="btn-darkmode" onClick={closeForm} style={{ padding: '6px 8px' }}>
                            <FiX size={18} />
                        </button>
                    </div>

                    <div className="row g-4">
                        {/* Form Inputs */}
                        <div className="col-12 col-lg-7">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group-ag mb-3">
                                    <label className="form-label-ag">Marketing Title *</label>
                                    <input
                                        type="text"
                                        className="form-control-ag"
                                        value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g. Fast Track Passport & Visa Service"
                                        required
                                    />
                                </div>

                                <div className="form-group-ag mb-3">
                                    <label className="form-label-ag">Media URL (Paste Image, SVG, Video, PDF, GIF, Doc Link) *</label>
                                    <input
                                        type="url"
                                        className="form-control-ag"
                                        value={form.mediaUrl}
                                        onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))}
                                        placeholder="https://example.com/banner.png or .mp4 or .pdf or .svg"
                                        required
                                    />
                                    <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                                        Supports JPG, JPEG, PNG, SVG, WEBP, MP4, WebM, YouTube, PDF, GIF, and Documents.
                                    </small>
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-12 col-md-6">
                                        <div className="form-group-ag">
                                            <label className="form-label-ag">Media Type</label>
                                            <select
                                                className="form-control-ag"
                                                value={form.mediaType}
                                                onChange={e => setForm(f => ({ ...f, mediaType: e.target.value }))}
                                            >
                                                {MEDIA_TYPES.map(m => (
                                                    <option key={m.value} value={m.value}>{m.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="form-group-ag">
                                            <label className="form-label-ag">Placement</label>
                                            <select
                                                className="form-control-ag"
                                                value={form.placement}
                                                onChange={e => setForm(f => ({ ...f, placement: e.target.value }))}
                                            >
                                                {PLACEMENTS.map(p => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-12 col-md-6">
                                        <div className="form-group-ag">
                                            <label className="form-label-ag">Badge Text</label>
                                            <input
                                                type="text"
                                                className="form-control-ag"
                                                value={form.badge}
                                                onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                                                placeholder="e.g. Exclusive Offer, Sponsored, Video Guide"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="form-group-ag">
                                            <label className="form-label-ag">Target / Redirect Link URL</label>
                                            <input
                                                type="url"
                                                className="form-control-ag"
                                                value={form.linkUrl}
                                                onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))}
                                                placeholder="https://wa.me/... or website link"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group-ag mb-4">
                                    <label className="form-label-ag">Description / Marketing Text</label>
                                    <textarea
                                        className="form-control-ag"
                                        rows={3}
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Special promotional notes, offers, or guidance..."
                                    />
                                </div>

                                <div className="d-flex gap-3">
                                    <button type="submit" className="btn-primary-ag" disabled={saving}>
                                        {saving ? 'Saving...' : <><FiSave /> {editingId ? 'Update Ad' : 'Save & Publish Ad'}</>}
                                    </button>
                                    <button type="button" className="btn-darkmode" onClick={closeForm}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Live Real-Time Preview Column */}
                        <div className="col-12 col-lg-5">
                            <div style={{
                                background: 'var(--bg-card)',
                                padding: 16,
                                borderRadius: 12,
                                border: '1px dashed var(--border-color)'
                            }}>
                                <div className="d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                                    <FiEye /> Live Component Preview
                                </div>
                                {form.mediaUrl ? (
                                    <MarketingAd ad={form} variant="card" />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: 8, opacity: 0.4 }}>📺</div>
                                        <p style={{ margin: 0, fontSize: '0.85rem' }}>Paste a media URL above to see the live marketing component preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ads List */}
            {loading ? (
                <div className="spinner-container"><div className="spinner-ag" /></div>
            ) : ads.length === 0 ? (
                <div className="admin-card text-center p-5">
                    <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.3 }}>📢</div>
                    <h5>No advertisements configured</h5>
                    <p style={{ color: 'var(--text-muted)' }}>Create your first marketing ad to display in post details or across the portal.</p>
                    <button className="btn-primary-ag mt-3" onClick={openAdd}>
                        <FiPlus /> Add First Advertisement
                    </button>
                </div>
            ) : (
                <div className="row g-3">
                    {ads.map((ad) => (
                        <div key={ad._id} className="col-12 col-md-6 col-lg-4">
                            <div className="admin-card h-100 d-flex flex-column" style={{
                                opacity: ad.isActive ? 1 : 0.65,
                                border: ad.isActive ? '1px solid var(--border-color)' : '1px dashed var(--border-color)'
                            }}>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50,
                                        background: 'rgba(0,180,216,0.12)', color: 'var(--accent-blue)'
                                    }}>
                                        {ad.badge || 'Marketing'}
                                    </span>
                                    <span style={{
                                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50,
                                        background: ad.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                                        color: ad.isActive ? '#16a34a' : '#ef4444'
                                    }}>
                                        {ad.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <h6 style={{ fontWeight: 700, fontSize: '0.95rem', margin: '4px 0 8px' }}>
                                    {ad.title}
                                </h6>

                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                                    <span>Type: <strong>{ad.mediaType?.toUpperCase()}</strong></span> • <span>Placement: <strong>{ad.placement}</strong></span>
                                </div>

                                {/* Mini Component Preview in Card */}
                                <div style={{ marginBottom: 16 }}>
                                    <MarketingAd ad={ad} variant="compact" />
                                </div>

                                {/* Actions */}
                                <div className="d-flex gap-2 mt-auto pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <button
                                        type="button"
                                        className="btn-edit-ag"
                                        onClick={() => openEdit(ad)}
                                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                                    >
                                        <FiEdit2 size={13} /> Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleToggle(ad._id)}
                                        style={{
                                            padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontWeight: 600,
                                            background: ad.isActive ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                                            color: ad.isActive ? '#f59e0b' : '#16a34a'
                                        }}
                                    >
                                        {ad.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                                        {ad.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-danger-ag"
                                        onClick={() => handleDelete(ad._id, ad.title)}
                                        style={{ padding: '6px 12px', marginLeft: 'auto', fontSize: '0.78rem' }}
                                    >
                                        <FiTrash2 size={13} />
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

export default ManageAds;
