import { useTranslation } from 'react-i18next';
import { FiPhone, FiMail, FiMapPin, FiUser, FiShield, FiStar } from 'react-icons/fi';
import { FaWhatsapp, FaUsers } from 'react-icons/fa';

const OperatorCard = ({ operator, compact = false }) => {
    const { t } = useTranslation();

    if (!operator || !operator.name) return null;

    const initials = operator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const waNumber = (operator.whatsapp || operator.phone || '').replace(/\D/g, '');

    return (
        <div className="operator-card-v2">
            {/* Verified Header */}
            <div className="operator-header">
                <div className="operator-verified-badge">
                    <FiShield size={14} />
                    <span>{t('operator.verified')}</span>
                </div>
                <div className="operator-rating">
                    <FiStar size={14} />
                    <span>{t('operator.experience')}</span>
                </div>
            </div>

            {/* Profile Section */}
            <div className="operator-profile">
                <div className="operator-avatar-wrapper">
                    {operator.photoUrl ? (
                        operator.photoUrl.includes('/preview') ? (
                            <iframe src={operator.photoUrl} title={operator.name} className="operator-avatar-img" style={{ border: 'none', pointerEvents: 'none' }} />
                        ) : (
                            <img src={operator.photoUrl} alt={operator.name} className="operator-avatar-img"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }} />
                        )
                    ) : null}
                    <div className="operator-avatar-placeholder" style={{ display: operator.photoUrl ? 'none' : 'flex' }}>
                        {initials || <FiUser />}
                    </div>
                    <div className="operator-online-dot" />
                </div>
                <div className="operator-info">
                    <h3 className="operator-name">{operator.name}</h3>
                    {operator.age && (
                        <span className="operator-age">{t('operator.age')}: {operator.age} years</span>
                    )}
                    {operator.bio && (
                        <p className="operator-bio">{operator.bio}</p>
                    )}
                </div>
            </div>

            {/* Contact Details */}
            <div className="operator-contacts">
                <div className="operator-contact-row">
                    <div className="contact-icon icon-phone"><FiPhone size={16} /></div>
                    <div className="contact-detail">
                        <span className="contact-label">{t('operator.call')}</span>
                        <a href={`tel:${operator.phone}`} className="contact-value">{operator.phone}</a>
                    </div>
                </div>

                {operator.email && (
                    <div className="operator-contact-row">
                        <div className="contact-icon icon-email"><FiMail size={16} /></div>
                        <div className="contact-detail">
                            <span className="contact-label">{t('operator.email')}</span>
                            <a href={`mailto:${operator.email}`} className="contact-value">{operator.email}</a>
                        </div>
                    </div>
                )}

                {operator.address && (
                    <div className="operator-contact-row">
                        <div className="contact-icon icon-address"><FiMapPin size={16} /></div>
                        <div className="contact-detail">
                            <span className="contact-label">{t('operator.address')}</span>
                            <span className="contact-value">{operator.address}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="operator-actions">
                {waNumber && (
                    <a href={`https://wa.me/${waNumber}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-whatsapp-v2">
                        <FaWhatsapp size={20} />
                        <span>{t('operator.whatsapp')}</span>
                    </a>
                )}
                <a href={`tel:${operator.phone}`} className="btn-call-v2">
                    <FiPhone size={18} />
                    <span>{t('operator.call')}</span>
                </a>
            </div>

            {/* WhatsApp Group Link - DYNAMIC from operator data */}
            {operator.whatsappGroupLink && (
                <div className="operator-group-link">
                    <a href={operator.whatsappGroupLink}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-group-join">
                        <FaUsers size={18} />
                        <span>{t('operator.joinGroup')}</span>
                        <span className="group-arrow">→</span>
                    </a>
                </div>
            )}

            {/* Why Choose Us */}
            {!compact && (
                <div className="operator-promo">
                    <h5 className="promo-title">{t('operator.whyChooseUs')}</h5>
                    <div className="promo-items">
                        <div className="promo-item">{t('operator.promoHome')}</div>
                        <div className="promo-item">{t('operator.promoTravel')}</div>
                        <div className="promo-item promo-highlight">{t('operator.promoFast')}</div>
                        <div className="promo-item promo-success">{t('operator.promoPay')}</div>
                    </div>
                </div>
            )}

            {/* Service Guarantee */}
            {!compact && (
                <div className="operator-guarantee">
                    <div className="guarantee-icon">🛡️</div>
                    <div>
                        <strong>{t('operator.serviceGuarantee')}</strong>
                        <p>{t('operator.guaranteeText')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperatorCard;
