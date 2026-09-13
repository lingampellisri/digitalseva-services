import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api/client';
import { FiPlus, FiX, FiSave, FiEye } from 'react-icons/fi';
import MarketingAd from '../components/MarketingAd';

const CATEGORIES = ['job', 'pan', 'aadhaar', 'scholarship', 'government', 'private', 'other'];

const emptyForm = () => ({
    titleEn: '', titleTe: '',
    imageUrl: '',
    startDate: '', endDate: '',
    requiredDocsEn: [''],
    requiredDocsTe: [''],
    extraInfoEn: '', extraInfoTe: '',
    category: 'other',
    notificationUrl: '',
    // Marketing Ad Fields
    adMediaUrl: '',
    adMediaType: 'auto',
    adTitle: '',
    adLinkUrl: '',
    adDescription: '',
    adBadge: 'Featured Promotion'
});

const convertDriveLink = (url) => {
    if (!url) return url;
    // Match either file/d/ID or ?id=ID format
    const driveRegex = /(?:drive\.google\.com\/file\/d\/|id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
};

const PostForm = ({ post, onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const isEdit = !!post;
    const toDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

    const [form, setForm] = useState(post ? {
        ...post,
        startDate: toDate(post.startDate),
        endDate: toDate(post.endDate),
        requiredDocsEn: post.requiredDocsEn?.length ? post.requiredDocsEn : [''],
        requiredDocsTe: post.requiredDocsTe?.length ? post.requiredDocsTe : [''],
    } : emptyForm());

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleField = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleDocEn = (i, val) => {
        const docs = [...form.requiredDocsEn];
        docs[i] = val;
        setForm(f => ({ ...f, requiredDocsEn: docs }));
    };
    const handleDocTe = (i, val) => {
        const docs = [...form.requiredDocsTe];
        docs[i] = val;
        setForm(f => ({ ...f, requiredDocsTe: docs }));
    };
    const addDoc = () => setForm(f => ({
        ...f,
        requiredDocsEn: [...f.requiredDocsEn, ''],
        requiredDocsTe: [...f.requiredDocsTe, '']
    }));
    const removeDoc = (i) => setForm(f => ({
        ...f,
        requiredDocsEn: f.requiredDocsEn.filter((_, idx) => idx !== i),
        requiredDocsTe: f.requiredDocsTe.filter((_, idx) => idx !== i)
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setLoading(true);
        try {
            const convertedImage = convertDriveLink(form.imageUrl);
            const payload = {
                ...form,
                imageUrl: convertedImage,
                requiredDocsEn: form.requiredDocsEn.filter(d => d.trim()),
                requiredDocsTe: form.requiredDocsTe.filter(d => d.trim())
            };
            if (isEdit) await API.put(`/posts/${post._id}`, payload);
            else await API.post('/posts', payload);
            setSuccess(isEdit ? 'Post updated!' : 'Post created!');
            setTimeout(onSuccess, 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "form-control-ag";

    return (
        <div className="admin-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 style={{ margin: 0, fontWeight: 700 }}>
                    {isEdit ? `✏️ ${t('admin.editPost')}` : `➕ ${t('admin.addPost')}`}
                </h5>
                <button className="btn-darkmode" onClick={onCancel}><FiX /></button>
            </div>

            {error && <div className="alert-ag alert-error">{error}</div>}
            {success && <div className="alert-ag alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    {/* Title EN */}
                    <div className="col-12 col-md-6">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.titleEn')} *</label>
                            <input type="text" required className={inputCls}
                                value={form.titleEn} onChange={e => handleField('titleEn', e.target.value)}
                                placeholder="e.g. APPSC Group 1 Notification 2026" />
                        </div>
                    </div>
                    {/* Title TE */}
                    <div className="col-12 col-md-6">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.titleTe')}</label>
                            <input type="text" className={inputCls}
                                value={form.titleTe} onChange={e => handleField('titleTe', e.target.value)}
                                placeholder="తెలుగు శీర్షిక" />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="col-12 col-md-4">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.category')} *</label>
                            <select className={inputCls} value={form.category} onChange={e => handleField('category', e.target.value)}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="col-12 col-md-6">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.imageUrl')}</label>
                            <input type="url" className={inputCls}
                                value={form.imageUrl}
                                onChange={e => {
                                    const val = e.target.value;
                                    const converted = convertDriveLink(val);
                                    handleField('imageUrl', converted);
                                }}
                                placeholder="https://example.com/image.jpg or Google Drive Link" />
                        </div>
                    </div>

                    {/* Notification Link */}
                    <div className="col-12 col-md-6">
                        <div className="form-group-ag">
                            <label className="form-label-ag">Notification Link (Official/More Info)</label>
                            <input type="url" className={inputCls}
                                value={form.notificationUrl}
                                onChange={e => handleField('notificationUrl', e.target.value)}
                                placeholder="https://example.com/notification-details" />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="col-6">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.startDate')} *</label>
                            <input type="date" required className={inputCls}
                                value={form.startDate} onChange={e => handleField('startDate', e.target.value)} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.endDate')} *</label>
                            <input type="date" required className={inputCls}
                                value={form.endDate} onChange={e => handleField('endDate', e.target.value)} />
                        </div>
                    </div>

                    {/* Required docs */}
                    <div className="col-12">
                        <div className="form-group-ag">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label-ag" style={{ margin: 0 }}>📄 Required Documents</label>
                                <button type="button" className="btn-edit-ag d-flex align-items-center gap-1" onClick={addDoc}>
                                    <FiPlus size={12} /> {t('admin.addDoc')}
                                </button>
                            </div>
                            {form.requiredDocsEn.map((doc, i) => (
                                <div key={i} className="d-flex gap-2 mb-2 align-items-center">
                                    <div className="d-flex gap-2 flex-grow-1">
                                        <input type="text" className={inputCls} value={doc} onChange={e => handleDocEn(i, e.target.value)}
                                            placeholder={`Document ${i + 1} (English)`} />
                                        <input type="text" className={inputCls} value={form.requiredDocsTe[i] || ''} onChange={e => handleDocTe(i, e.target.value)}
                                            placeholder={`పత్రం ${i + 1} (తెలుగు)`} />
                                    </div>
                                    {form.requiredDocsEn.length > 1 && (
                                        <button type="button" className="btn-danger-ag" onClick={() => removeDoc(i)}>
                                            <FiX />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Extra info */}
                    <div className="col-12 col-md-6">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.extraInfoEn')}</label>
                            <textarea className={inputCls} rows={4}
                                value={form.extraInfoEn} onChange={e => handleField('extraInfoEn', e.target.value)}
                                placeholder="Additional information in English..." style={{ resize: 'vertical' }} />
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="form-group-ag">
                            <label className="form-label-ag">{t('admin.extraInfoTe')}</label>
                            <textarea className={inputCls} rows={4}
                                value={form.extraInfoTe} onChange={e => handleField('extraInfoTe', e.target.value)}
                                placeholder="అదనపు సమాచారం తెలుగులో..." style={{ resize: 'vertical' }} />
                        </div>
                    </div>

                    {/* Marketing Ad Section for this Post */}
                    <div className="col-12 mt-4">
                        <div style={{
                            padding: 20,
                            borderRadius: 12,
                            background: 'rgba(0,180,216,0.04)',
                            border: '1px solid rgba(0,180,216,0.2)'
                        }}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h6 style={{ margin: 0, fontWeight: 700, color: 'var(--accent-blue)' }}>
                                        📢 Post Marketing Advertisement (Optional)
                                    </h6>
                                    <small style={{ color: 'var(--text-muted)' }}>
                                        Paste an image, video, pdf, gif, or document link to showcase in the post details marketing component.
                                    </small>
                                </div>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50,
                                    background: 'rgba(0,180,216,0.12)', color: 'var(--accent-blue)'
                                }}>
                                    Multi-format
                                </span>
                            </div>

                            <div className="row g-3">
                                <div className="col-12 col-md-8">
                                    <div className="form-group-ag">
                                        <label className="form-label-ag">Ad Media URL (Image, SVG, Video, PDF, GIF, Doc)</label>
                                        <input
                                            type="url"
                                            className={inputCls}
                                            value={form.adMediaUrl || ''}
                                            onChange={e => handleField('adMediaUrl', e.target.value)}
                                            placeholder="https://example.com/banner.png or .mp4 or .pdf or .svg"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="form-group-ag">
                                        <label className="form-label-ag">Media Format</label>
                                        <select
                                            className={inputCls}
                                            value={form.adMediaType || 'auto'}
                                            onChange={e => handleField('adMediaType', e.target.value)}
                                        >
                                            <option value="auto">⚡ Auto-detect format</option>
                                            <option value="image">🖼️ Image (JPG, JPEG, PNG, SVG)</option>
                                            <option value="video">🎬 Video (MP4, YouTube, Vimeo)</option>
                                            <option value="pdf">📄 PDF Document</option>
                                            <option value="gif">✨ Animated GIF</option>
                                            <option value="document">📁 Office Document</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="form-group-ag">
                                        <label className="form-label-ag">Ad Title</label>
                                        <input
                                            type="text"
                                            className={inputCls}
                                            value={form.adTitle || ''}
                                            onChange={e => handleField('adTitle', e.target.value)}
                                            placeholder="e.g. Special Assistance & Verification"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="form-group-ag">
                                        <label className="form-label-ag">Ad Badge</label>
                                        <input
                                            type="text"
                                            className={inputCls}
                                            value={form.adBadge || ''}
                                            onChange={e => handleField('adBadge', e.target.value)}
                                            placeholder="e.g. Featured Promotion"
                                        />
                                    </div>
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="form-group-ag">
                                        <label className="form-label-ag">Action / Redirect URL</label>
                                        <input
                                            type="url"
                                            className={inputCls}
                                            value={form.adLinkUrl || ''}
                                            onChange={e => handleField('adLinkUrl', e.target.value)}
                                            placeholder="https://wa.me/... or official link"
                                        />
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="form-group-ag">
                                        <label className="form-label-ag">Ad Marketing Description</label>
                                        <textarea
                                            className={inputCls}
                                            rows={2}
                                            value={form.adDescription || ''}
                                            onChange={e => handleField('adDescription', e.target.value)}
                                            placeholder="Short marketing message, discount, or guidance note..."
                                        />
                                    </div>
                                </div>

                                {form.adMediaUrl && (
                                    <div className="col-12 mt-2">
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 8 }}>
                                            <FiEye /> Marketing Ad Live Preview:
                                        </div>
                                        <MarketingAd
                                            ad={{
                                                title: form.adTitle || form.titleEn || 'Featured Promotion',
                                                mediaUrl: form.adMediaUrl,
                                                mediaType: form.adMediaType || 'auto',
                                                linkUrl: form.adLinkUrl,
                                                description: form.adDescription,
                                                badge: form.adBadge || 'Featured Promotion'
                                            }}
                                            variant="card"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                    <button type="submit" className="btn-primary-ag" disabled={loading}>
                        {loading ? <span className="spinner-ag" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <><FiSave /> {isEdit ? t('admin.update') : t('admin.save')}</>}
                    </button>
                    <button type="button" className="btn-edit-ag" onClick={onCancel}>
                        {t('admin.cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PostForm;
