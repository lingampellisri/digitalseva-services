import { useTranslation } from 'react-i18next';
import { FiPhone, FiMail, FiMapPin, FiUser } from 'react-icons/fi';
import { FaWhatsapp, FaUsers } from 'react-icons/fa';

const OperatorCard = ({ operator }) => {
    const { t } = useTranslation();

    if (!operator || !operator.name) return null;

    const initials = operator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="operator-card mt-4">
            <h4 className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>
                🎯 {t('operator.title')}
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
                {t('operator.description')}
            </p>

            <div className="d-flex align-items-start gap-4 flex-wrap">
                {/* Photo */}
                <div className="flex-shrink-0">
                    {operator.photoUrl ? (
                        operator.photoUrl.includes('/preview') ? (
                            <iframe src={operator.photoUrl} title={operator.name} className="operator-photo" style={{ border: 'none', pointerEvents: 'none', overflow: 'hidden' }} />
                        ) : (
                            <img src={operator.photoUrl} alt={operator.name} className="operator-photo"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }} />
                        )
                    ) : null}
                    <div className="operator-photo-placeholder" style={{ display: operator.photoUrl ? 'none' : 'flex' }}>
                        {initials || <FiUser />}
                    </div>
                </div>

                {/* Info */}
                <div className="flex-grow-1">
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 4 }}>{operator.name}</h3>
                    {operator.age && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                            {t('operator.age')}: {operator.age} years
                        </p>
                    )}
                    {operator.bio && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
                            {operator.bio}
                        </p>
                    )}

                    <div className="operator-contact-item">
                        <div className="contact-icon icon-phone"><FiPhone /></div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('operator.call')}</div>
                            <a href={`tel:${operator.phone}`} style={{ color: 'var(--text-dark)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
                                {operator.phone}
                            </a>
                        </div>
                    </div>

                    {operator.email && (
                        <div className="operator-contact-item">
                            <div className="contact-icon icon-email"><FiMail /></div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('operator.email')}</div>
                                <a href={`mailto:${operator.email}`} style={{ color: 'var(--text-dark)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>
                                    {operator.email}
                                </a>
                            </div>
                        </div>
                    )}

                    {operator.address && (
                        <div className="operator-contact-item">
                            <div className="contact-icon icon-address"><FiMapPin /></div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('operator.address')}</div>
                                <span style={{ color: 'var(--text-dark)', fontWeight: 500, fontSize: '0.95rem' }}>{operator.address}</span>
                            </div>
                        </div>
                    )}

                    <div className="d-flex gap-3 mt-4 flex-wrap">
                        {(operator.whatsapp || operator.phone) && (
                            <a
                                href={`https://wa.me/${(operator.whatsapp || operator.phone).replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-whatsapp"
                            >
                                <FaWhatsapp size={18} />
                                {t('operator.whatsapp')}
                            </a>
                        )}
                        <a href={`tel:${operator.phone}`} className="btn-call">
                            <FiPhone />
                            {t('operator.call')}
                        </a>
                    </div>

                    {/* WhatsApp Group Link */}
                    <div className="mt-4 pt-4 border-top">
                        <a
                            href="https://chat.whatsapp.com/FZEX4SFVBbL8iDlpQcchbJ?mode=gi_t"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-whatsapp w-100 justify-content-center py-2"
                            style={{ background: 'linear-gradient(135deg, #25ba61, #075e54)' }}
                        >
                            <FaUsers size={20} />
                            {t('operator.joinGroup')}
                        </a>
                    </div>

                    {/* Promotional Attraction Points */}
                    <div className="promo-attraction-box mt-4 p-3 rounded" style={{ background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.08), rgba(124, 58, 237, 0.08))', borderLeft: '4px solid var(--accent-blue)' }}>
                        <div className="d-flex flex-column gap-3">
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                                {t('operator.promoHome')}
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                                {t('operator.promoTravel')}
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-violet)' }}>
                                {t('operator.promoFast')}
                            </div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#16a34a' }}>
                                {t('operator.promoPay')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatorCard;
