import { useTranslation } from 'react-i18next';
import { FiTrendingUp, FiCalendar, FiAlertCircle } from 'react-icons/fi';

const WhatsNewSidebar = () => {
    const { t } = useTranslation();

    const deadlines = [
        {
            key: 'panCorrection',
            dot: 'wn-dot-red',
            urgency: 'high',
            icon: '🪪',
        },
        {
            key: 'aadhaarUpdate',
            dot: 'wn-dot-amber',
            urgency: 'medium',
            icon: '🆔',
        },
        {
            key: 'scholarship',
            dot: 'wn-dot-emerald',
            urgency: 'low',
            icon: '🎓',
        },
        {
            key: 'govtJob',
            dot: 'wn-dot-blue',
            urgency: 'low',
            icon: '💼',
        },
    ];

    return (
        <div className="whats-new-card">
            <div className="whats-new-header">
                <div className="whats-new-header-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <FiAlertCircle size={20} />
                </div>
                <h4>{t('whatsNew.title', "What's New")}</h4>
            </div>

            <div className="wn-timeline">
                {deadlines.map(({ key, dot, urgency, icon }) => (
                    <div className="wn-item" key={key}>
                        <div className={`wn-item-dot ${dot}`} />
                        <div className="wn-item-content" style={{ flex: 1 }}>
                            <h6>
                                {icon} {t(`whatsNew.${key}Title`, key)}
                            </h6>
                            <p>{t(`whatsNew.${key}Desc`, '')}</p>
                            <span className={`wn-urgency wn-urgency-${urgency}`}>
                                {t(`whatsNew.urgency${urgency.charAt(0).toUpperCase() + urgency.slice(1)}`, urgency)}
                            </span>
                        </div>
                        <div className="wn-item-date">
                            {t(`whatsNew.${key}Date`, '')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhatsNewSidebar;
