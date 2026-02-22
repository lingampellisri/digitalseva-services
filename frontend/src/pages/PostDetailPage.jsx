import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import OperatorCard from '../components/OperatorCard';
import Footer from '../components/Footer';
import API from '../api/client';
import { FiCalendar, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

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
                API.get('/operator')
            ]);
            setPost(postRes.data);
            setOperator(opRes.data);
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

    return (
        <>
            <div style={{ background: 'var(--bg-light)', minHeight: '100vh', paddingBottom: 60 }}>
                <div className="container" style={{ paddingTop: 40 }}>
                    {/* Back button */}
                    <Link to="/" className="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none"
                        style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
                        <FiArrowLeft /> Back to Notifications
                    </Link>

                    <div className="row g-4">
                        {/* Main content */}
                        <div className="col-12 col-lg-8">
                            {/* Banner image */}
                            {post.imageUrl ? (
                                post.imageUrl.includes('/preview') ? (
                                    <iframe src={post.imageUrl} className="post-detail-banner mb-4" style={{ border: 'none' }} title={title} />
                                ) : (
                                    <img src={post.imageUrl} alt={title} className="post-detail-banner mb-4" />
                                )
                            ) : (
                                <div className="post-detail-banner-placeholder mb-4">
                                    <span>📋</span>
                                </div>
                            )}

                            {/* Title card */}
                            <div className="detail-card mb-4 text-center">
                                <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-3 text-start">
                                    <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 800, lineHeight: 1.3 }}>
                                        {title}
                                    </h1>
                                    {active
                                        ? <span className="badge-active">● {t('posts.active')}</span>
                                        : <span className="badge-expired">✕ {t('posts.expired')}</span>
                                    }
                                </div>

                                <div className="row g-3 mb-4">
                                    <div className="col-6">
                                        <div style={{ padding: '12px 16px', background: 'rgba(0,180,216,0.07)', borderRadius: 10, border: '1px solid rgba(0,180,216,0.15)' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                                {t('posts.startDate')}
                                            </div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{fmt(post.startDate)}</div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div style={{ padding: '12px 16px', background: active ? 'rgba(239,68,68,0.07)' : 'rgba(100,116,139,0.07)', borderRadius: 10, border: `1px solid ${active ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)'}` }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                                {t('posts.endDate')}
                                            </div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{fmt(post.endDate)}</div>
                                        </div>
                                    </div>
                                </div>

                                {post.notificationUrl && (
                                    <a href={post.notificationUrl} target="_blank" rel="noopener noreferrer"
                                        className="btn-primary-ag w-100 py-3 shadow-lg d-flex align-items-center justify-content-center gap-2"
                                        style={{ borderRadius: 12, fontSize: '1.05rem', textDecoration: 'none' }}>
                                        🌐 Click Here for Official Notification
                                    </a>
                                )}
                            </div>

                            {/* Countdown timer */}
                            {active && timeLeft ? (
                                <div className="countdown-box mb-4">
                                    <div style={{ width: '100%', textAlign: 'center', marginBottom: 16 }}>
                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                                            ⏳ {t('detail.timeLeft')}
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
                                <div className="alert-ag alert-error mb-4" style={{ textAlign: 'center', padding: '16px' }}>
                                    🚫 {t('detail.expired')}
                                </div>
                            ) : null}

                            {/* Required docs */}
                            {docs && docs.length > 0 && (
                                <div className="detail-card mb-4">
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-dark)' }}>
                                        📄 {t('detail.requiredDocs')}
                                    </h3>
                                    <ul className="docs-list">
                                        {docs.map((doc, i) => (
                                            <li key={i}>
                                                <FiCheckCircle className="doc-icon" />
                                                <span>{doc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Extra info */}
                            {extraInfo && (
                                <div className="detail-card">
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-dark)' }}>
                                        ℹ️ {t('detail.extraInfo')}
                                    </h3>
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                        {extraInfo}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="col-12 col-lg-4">
                            <div style={{ position: 'sticky', top: 80 }}>
                                <OperatorCard operator={operator} />
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
