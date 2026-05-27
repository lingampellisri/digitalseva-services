import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OperatorCard from '../components/OperatorCard';
import Footer from '../components/Footer';
import API from '../api/client';
import { FiCalendar, FiArrowLeft, FiClock, FiExternalLink } from 'react-icons/fi';

const CATEGORY_META = {
    job: { emoji: '💼', color: '#3b82f6' },
    pan: { emoji: '🪪', color: '#f59e0b' },
    aadhaar: { emoji: '🆔', color: '#8b5cf6' },
    scholarship: { emoji: '🎓', color: '#10b981' },
    government: { emoji: '🏛️', color: '#6366f1' },
    private: { emoji: '🏢', color: '#ec4899' },
    other: { emoji: '📋', color: '#64748b' }
};

const isActive = (endDate) => new Date(endDate) > new Date();

const getTimeLeft = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, mins, secs };
};

const PostDetailPage = () => {
    const { id } = useParams();
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const [post, setPost] = useState(null);
    const [operator, setOperator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!post) return;
        const timer = setInterval(() => {
            setTimeLeft(getTimeLeft(post.endDate));
        }, 1000);
        setTimeLeft(getTimeLeft(post.endDate));
        return () => clearInterval(timer);
    }, [post]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [postRes, opRes] = await Promise.all([
                API.get(`/posts/${id}`),
                API.get('/operators')
            ]);
            setPost(postRes.data);
            const ops = Array.isArray(opRes.data) ? opRes.data : [];
            // Use the first active operator (sorted by sortOrder from backend)
            setOperator(ops.length > 0 ? ops[0] : null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="spinner-container" style={{ minHeight: '60vh' }}>
            <div className="spinner-ag" />
        </div>
    );

    if (!post) return (
        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
            <h2>Post not found</h2>
            <Link to="/" className="btn-admin mt-4" style={{ display: 'inline-block' }}>← Back to Home</Link>
        </div>
    );

    const title = lang === 'te' && post.titleTe ? post.titleTe : post.titleEn;
    const docs = lang === 'te' && post.requiredDocsTe?.length ? post.requiredDocsTe : post.requiredDocsEn;
    const extraInfo = lang === 'te' && post.extraInfoTe ? post.extraInfoTe : post.extraInfoEn;
    const active = isActive(post.endDate);
    const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const catMeta = CATEGORY_META[post.category] || CATEGORY_META.other;

    return (
        <>
            <div className="detail-page">
                {/* Hero Banner */}
                <div className="detail-hero">
                    <div className="detail-hero-overlay" />
                    {post.imageUrl && !post.imageUrl.includes('/preview') && (
                        <img src={post.imageUrl} alt={title} className="detail-hero-bg" />
                    )}
                    <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                        <Link to="/" className="detail-back-btn">
                            <FiArrowLeft size={18} />
                            <span>Back to Notifications</span>
                        </Link>
                        <div className="detail-hero-content">
                            <div className="detail-category-badge" style={{ '--cat-color': catMeta.color }}>
                                <span>{catMeta.emoji}</span>
                                <span>{t(`categories.${post.category || 'other'}`)}</span>
                            </div>
                            <h1 className="detail-hero-title">{title}</h1>
                            <div className="detail-hero-meta">
                                <div className="detail-meta-item">
                                    <FiCalendar size={16} />
                                    <span>{fmt(post.startDate)} — {fmt(post.endDate)}</span>
                                </div>
                                {active
                                    ? <span className="badge-active">● {t('posts.active')}</span>
                                    : <span className="badge-expired">✕ {t('posts.expired')}</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
                    <div className="row g-4">
                        {/* Left Column - Post Details */}
                        <div className="col-12 col-lg-8">
                            {/* Image/Document Preview */}
                            {post.imageUrl && post.imageUrl.includes('/preview') && (
                                <div className="detail-card mb-4">
                                    <iframe src={post.imageUrl} className="detail-doc-preview" title={title} style={{ border: 'none' }} />
                                </div>
                            )}

                            {/* Countdown Timer */}
                            {active && timeLeft ? (
                                <div className="countdown-box mb-4">
                                    <div style={{ width: '100%', textAlign: 'center', marginBottom: 16 }}>
                                        <span className="countdown-header">
                                            <FiClock size={16} />
                                            {t('detail.timeLeft')}
                                        </span>
                                    </div>
                                    {[
                                        { val: timeLeft.days, lbl: t('detail.days') },
                                        { val: timeLeft.hours, lbl: t('detail.hours') },
                                        { val: timeLeft.mins, lbl: t('detail.mins') },
                                        { val: timeLeft.secs, lbl: t('detail.secs') },
                                    ].map(({ val, lbl }) => (
                                        <div key={lbl} className="countdown-unit">
                                            <div className="countdown-value">{String(val).padStart(2, '0')}</div>
                                            <div className="countdown-label">{lbl}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : !active ? (
                                <div className="detail-expired-banner mb-4">
                                    <span className="expired-icon">🚫</span>
                                    <div>
                                        <strong>{t('detail.expired')}</strong>
                                        <p>This notification's deadline has passed on {fmt(post.endDate)}</p>
                                    </div>
                                </div>
                            ) : null}

                            {/* Official Notification Link */}
                            {post.notificationUrl && (
                                <a href={post.notificationUrl} target="_blank" rel="noopener noreferrer"
                                    className="detail-official-link mb-4">
                                    <div className="official-link-content">
                                        <FiExternalLink size={22} />
                                        <div>
                                            <strong>Official Notification</strong>
                                            <span>Click to view the official document</span>
                                        </div>
                                    </div>
                                    <span className="official-link-arrow">→</span>
                                </a>
                            )}

                            {/* Date Details Card */}
                            <div className="detail-card mb-4">
                                <div className="detail-dates-grid">
                                    <div className="detail-date-box detail-date-start">
                                        <FiCalendar size={20} />
                                        <div>
                                            <span className="date-label">{t('posts.startDate')}</span>
                                            <span className="date-value">{fmt(post.startDate)}</span>
                                        </div>
                                    </div>
                                    <div className="detail-date-divider">
                                        <span>→</span>
                                    </div>
                                    <div className={`detail-date-box ${active ? 'detail-date-end-active' : 'detail-date-end-expired'}`}>
                                        <FiCalendar size={20} />
                                        <div>
                                            <span className="date-label">{t('posts.endDate')}</span>
                                            <span className="date-value">{fmt(post.endDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Required Documents */}
                            {docs && docs.length > 0 && (
                                <div className="detail-card mb-4">
                                    <h3 className="detail-section-title">
                                        <span className="section-icon">📄</span>
                                        {t('detail.requiredDocs')}
                                    </h3>
                                    <div className="detail-docs-grid">
                                        {docs.map((doc, i) => (
                                            <div key={i} className="detail-doc-item">
                                                <div className="doc-number">{i + 1}</div>
                                                <span>{doc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Extra Info */}
                            {extraInfo && (
                                <div className="detail-card">
                                    <h3 className="detail-section-title">
                                        <span className="section-icon">ℹ️</span>
                                        {t('detail.extraInfo')}
                                    </h3>
                                    <div className="detail-extra-info">
                                        {extraInfo}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Operator */}
                        <div className="col-12 col-lg-4">
                            <div className="detail-sidebar">
                                {operator ? (
                                    <OperatorCard operator={operator} />
                                ) : (
                                    <div className="detail-card" style={{ textAlign: 'center', padding: 32 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: 12, opacity: 0.3 }}>👤</div>
                                        <p style={{ color: 'var(--text-muted)' }}>No operators available at this time.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PostDetailPage;
