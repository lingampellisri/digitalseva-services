import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/client';
import { FiSend, FiCheck, FiAlertCircle, FiShield, FiCopy, FiExternalLink, FiUserCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const CustomerApplicationForm = ({ postId, serviceName, serviceCategory }) => {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        customerName: '',
        customerAge: '',
        customerPhone: '',
        customerEmail: '',
        customerMessage: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [submittedData, setSubmittedData] = useState(null);
    const [copiedId, setCopiedId] = useState(false);
    const [error, setError] = useState('');

    const handleField = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const validate = () => {
        if (!form.customerName.trim() || form.customerName.trim().length < 2) {
            setError(t('applicationForm.errorName', 'Please enter your full name (min 2 characters)'));
            return false;
        }
        const phone = form.customerPhone.replace(/\D/g, '');
        if (phone.length < 10) {
            setError(t('applicationForm.errorPhone', 'Please enter a valid 10-digit phone number'));
            return false;
        }
        if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
            setError(t('applicationForm.errorEmail', 'Please enter a valid email address'));
            return false;
        }
        return true;
    };

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmittedData(null);
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await API.post('/customer-requests', {
                ...form,
                customerAge: form.customerAge ? parseInt(form.customerAge) : undefined,
                postId
            });
            setSuccess(res.data.message || t('applicationForm.success', 'Application submitted successfully!'));
            if (res.data.request) {
                setSubmittedData(res.data.request);
            }
            setForm({ customerName: '', customerAge: '', customerPhone: '', customerEmail: '', customerMessage: '' });
        } catch (err) {
            setError(err.response?.data?.message || t('applicationForm.error', 'Failed to submit. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSuccess('');
        setSubmittedData(null);
        setError('');
    };

    return (
        <div className="application-form-card">
            <div className="application-form-header">
                <div className="application-form-icon">📝</div>
                <div>
                    <h4 className="application-form-title">
                        {t('applicationForm.title', 'Apply for This Service')}
                    </h4>
                    <p className="application-form-subtitle">
                        {t('applicationForm.subtitle', 'Fill in your details and our operator will contact you')}
                    </p>
                </div>
            </div>

            {success && (
                <div className="application-success-box" style={{ animation: 'fadeInDown 0.3s ease' }}>
                    <div className="success-icon-wrap">
                        <FiCheck size={28} />
                    </div>
                    <h5 className="success-title">Application Submitted!</h5>
                    <p className="success-desc">{success}</p>

                    {submittedData?.trackingId && (
                        <div className="tracking-id-showcase">
                            <span className="tracking-showcase-label">Your Application Tracking ID</span>
                            <div className="tracking-showcase-box">
                                <span className="tracking-number">{submittedData.trackingId}</span>
                                <button
                                    type="button"
                                    className="btn-copy-tracking"
                                    onClick={() => handleCopy(submittedData.trackingId)}
                                    title="Copy Tracking ID"
                                >
                                    {copiedId ? <><FiCheck size={15} color="#10b981" /> Copied!</> : <><FiCopy size={15} /> Copy ID</>}
                                </button>
                            </div>

                            {/* Prominent Security & Save Disclaimer Notice */}
                            <div className="tracking-disclaimer-banner">
                                <span className="tracking-disclaimer-icon">⚠️</span>
                                <div className="tracking-disclaimer-text">
                                    <strong>IMPORTANT: Please Note or Save Your Tracking ID</strong>
                                    Please copy, screenshot, or note down your Tracking ID (<strong>{submittedData.trackingId}</strong>). For citizen privacy and data security, application status can <u>ONLY</u> be tracked using this unique DS number. Tracking by phone number is not permitted.
                                </div>
                            </div>
                        </div>
                    )}

                    {submittedData?.assignedOperator && (
                        <div className="assigned-op-preview">
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <FiUserCheck size={16} color="#00b4d8" />
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Designated Service Officer:</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                {submittedData.assignedOperator.name}
                            </div>
                        </div>
                    )}

                    <div className="d-flex gap-2 mt-3 flex-wrap">
                        {submittedData?.trackingId && (
                            <Link
                                to={`/track/${submittedData.trackingId}`}
                                className="btn-primary-ag flex-grow-1 text-center justify-content-center"
                                style={{ textDecoration: 'none' }}
                            >
                                <FiExternalLink size={16} /> Track Status Now
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={resetForm}
                            className="btn-outline-ag"
                            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                        >
                            Apply Another
                        </button>
                    </div>
                </div>
            )}
            {error && (
                <div className="alert-ag alert-error" style={{ animation: 'fadeInDown 0.3s ease' }}>
                    <FiAlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                </div>
            )}

            {!success && (
                <form onSubmit={handleSubmit}>
                    <div className="application-form-service">
                        <span className="application-form-service-label">{t('applicationForm.service', 'Service')}:</span>
                        <span className="application-form-service-name">{serviceName}</span>
                    </div>

                    <div className="form-group-ag">
                        <label className="form-label-ag">{t('applicationForm.name', 'Full Name')} *</label>
                        <input
                            type="text" required className="form-control-ag"
                            value={form.customerName}
                            onChange={e => handleField('customerName', e.target.value)}
                            placeholder="Enter your full name"
                            minLength={2}
                        />
                    </div>

                    <div className="row g-2">
                        <div className="col-6">
                            <div className="form-group-ag">
                                <label className="form-label-ag">{t('applicationForm.age', 'Age')}</label>
                                <input
                                    type="number" className="form-control-ag"
                                    value={form.customerAge}
                                    onChange={e => handleField('customerAge', e.target.value)}
                                    placeholder="Age" min={1} max={150}
                                />
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="form-group-ag">
                                <label className="form-label-ag">{t('applicationForm.phone', 'Phone')} *</label>
                                <input
                                    type="tel" required className="form-control-ag"
                                    value={form.customerPhone}
                                    onChange={e => handleField('customerPhone', e.target.value)}
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group-ag">
                        <label className="form-label-ag">{t('applicationForm.email', 'Email')}</label>
                        <input
                            type="email" className="form-control-ag"
                            value={form.customerEmail}
                            onChange={e => handleField('customerEmail', e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="form-group-ag">
                        <label className="form-label-ag">{t('applicationForm.message', 'Message (Optional)')}</label>
                        <textarea
                            className="form-control-ag" rows={3}
                            value={form.customerMessage}
                            onChange={e => handleField('customerMessage', e.target.value)}
                            placeholder="Any specific requirements or questions..."
                            maxLength={1000}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <button type="submit" className="btn-primary-ag w-100 justify-content-center" disabled={loading}>
                        {loading
                            ? <span className="spinner-ag" style={{ width: 18, height: 18, borderWidth: 2 }} />
                            : <><FiSend size={16} /> {t('applicationForm.submit', 'Submit Application')}</>
                        }
                    </button>

                    <div className="application-form-privacy">
                        <FiShield size={14} />
                        <span>{t('applicationForm.privacy', 'Your information is secure & private')}</span>
                    </div>
                </form>
            )}
        </div>
    );
};

export default CustomerApplicationForm;
