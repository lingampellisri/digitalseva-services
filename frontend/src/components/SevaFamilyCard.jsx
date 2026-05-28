import { useTranslation } from 'react-i18next';
import { FaWhatsapp } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

const SevaFamilyCard = () => {
    const { t } = useTranslation();

    const benefits = [
        t('sevaCard.benefit1', '🏠 Door-step service'),
        t('sevaCard.benefit2', '⚡ Priority processing'),
        t('sevaCard.benefit3', '📞 Dedicated support'),
        t('sevaCard.benefit4', '🤝 Trusted community'),
    ];

    return (
        <section className="seva-banner">
            <div className="container">
                <div className="seva-card-banner" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="seva-content">
                        <div className="seva-badge">
                            ✦ {t('sevaCard.badge', 'Exclusive Membership')}
                        </div>
                        <h2 className="seva-title">
                            {t('sevaCard.title', 'Seva Family Card')}
                        </h2>
                        <p className="seva-desc">
                            {t('sevaCard.desc', 'Join our Seva Family for priority processing, dedicated support, and hassle-free handling of all your document & application needs.')}
                        </p>

                        <div className="seva-benefits">
                            {benefits.map((b, i) => (
                                <span className="seva-benefit" key={i}>{b}</span>
                            ))}
                        </div>

                        <div className="seva-cta-group">
                            <a
                                href="https://chat.whatsapp.com/FZEX4SFVBbL8iDlpQcchbJ?mode=gi_t"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="seva-cta-primary"
                            >
                                <FaWhatsapp size={18} />
                                {t('sevaCard.ctaPrimary', 'Join Now')}
                            </a>
                            <button
                                className="seva-cta-secondary"
                                onClick={() => document.getElementById('posts-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                {t('sevaCard.ctaSecondary', 'Explore Services')}
                                <FiArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SevaFamilyCard;
