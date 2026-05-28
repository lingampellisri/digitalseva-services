import { useTranslation } from 'react-i18next';
import { FiShield, FiCheckCircle, FiZap, FiHeadphones } from 'react-icons/fi';

const BADGES = [
    { key: 'privacy', icon: <FiShield size={22} />, colorClass: 'trust-icon-emerald' },
    { key: 'payAfter', icon: <FiCheckCircle size={22} />, colorClass: 'trust-icon-blue' },
    { key: 'verified', icon: <FiZap size={22} />, colorClass: 'trust-icon-violet' },
    { key: 'support', icon: <FiHeadphones size={22} />, colorClass: 'trust-icon-amber' },
];

const TrustBadges = () => {
    const { t } = useTranslation();

    return (
        <section className="trust-strip">
            <div className="container">
                <div className="trust-badges-grid">
                    {BADGES.map(({ key, icon, colorClass }) => (
                        <div className="trust-badge-card" key={key}>
                            <div className={`trust-badge-icon ${colorClass}`}>
                                {icon}
                            </div>
                            <div>
                                <div className="trust-badge-label">
                                    {t(`trustBadges.${key}Title`, key)}
                                </div>
                                <span className="trust-badge-sub">
                                    {t(`trustBadges.${key}Sub`, '')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustBadges;
