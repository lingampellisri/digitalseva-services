import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiCalendar, FiChevronRight } from 'react-icons/fi';

const isActive = (endDate) => new Date(endDate) > new Date();

const categoryEmoji = {
    job: '💼', pan: '🪪', aadhaar: '🆔', scholarship: '🎓',
    government: '🏛️', private: '🏢', other: '📋'
};

const PostCard = ({ post, delay = 0 }) => {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const title = lang === 'te' && post.titleTe ? post.titleTe : post.titleEn;
    const active = isActive(post.endDate);

    const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div
            className="post-card animate-fadeInUp"
            style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}
        >
            {/* Image */}
            {post.imageUrl ? (
                post.imageUrl.includes('/preview') ? (
                    <iframe src={post.imageUrl} className="post-card-img" style={{ border: 'none', pointerEvents: 'none' }} title={title}
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                ) : (
                    <img src={post.imageUrl} alt={title} className="post-card-img"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                )
            ) : null}
            <div className="post-card-img-placeholder" style={{ display: post.imageUrl ? 'none' : 'flex' }}>
                <span style={{ fontSize: '3rem' }}>{categoryEmoji[post.category] || '📋'}</span>
            </div>

            <div className="post-card-body">
                {/* Badge */}
                <div className="mb-2">
                    {active
                        ? <span className="badge-active">● {t('posts.active')}</span>
                        : <span className="badge-expired">✕ {t('posts.expired')}</span>
                    }
                </div>

                {/* Title */}
                <h3 className="post-card-title">{title}</h3>

                {/* Dates */}
                <div className="post-card-dates">
                    <div className="date-item">
                        <FiCalendar className="date-icon" />
                        <span><strong>{t('posts.startDate')}:</strong> {fmt(post.startDate)}</span>
                    </div>
                    <div className="date-item">
                        <FiCalendar className="date-icon" style={{ color: active ? '#ef4444' : '#64748b' }} />
                        <span><strong>{t('posts.endDate')}:</strong> {fmt(post.endDate)}</span>
                    </div>
                </div>

                {/* CTA */}
                <div className="d-flex gap-2 flex-wrap">
                    <Link to={`/post/${post._id}`} className="btn-view flex-grow-1">
                        {t('posts.viewDetails')} <FiChevronRight style={{ marginLeft: 4 }} />
                    </Link>
                    {post.notificationUrl && (
                        <a href={post.notificationUrl} target="_blank" rel="noopener noreferrer"
                            className="btn-edit-ag d-flex align-items-center justify-content-center p-2"
                            onClick={(e) => e.stopPropagation()} title="Open Notification Link">
                            🔗
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard;
