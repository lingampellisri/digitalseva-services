import { useState, useRef, useEffect } from 'react';
import { FaWhatsapp, FaUsers } from 'react-icons/fa';
import { FiPhone, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/FZEX4SFVBbL8iDlpQcchbJ?mode=gi_t';
const WHATSAPP_NUMBER = '919182abortin'; // fallback number, will be overridden by operator

const FloatingWhatsApp = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="floating-wa-container" ref={menuRef}>
            {/* Popup menu */}
            <div className={`floating-wa-menu ${open ? 'floating-wa-menu-open' : ''}`}>
                {/* Group Link */}
                <a
                    href={WHATSAPP_GROUP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="floating-wa-option floating-wa-group"
                    onClick={() => setOpen(false)}
                >
                    <div className="floating-wa-option-icon floating-wa-icon-group">
                        <FaUsers size={20} />
                    </div>
                    <div className="floating-wa-option-text">
                        <span className="floating-wa-option-title">
                            {t('floatingWa.groupTitle', 'Join Our Group')}
                        </span>
                        <span className="floating-wa-option-desc">
                            {t('floatingWa.groupDesc', 'Get latest updates & messages')}
                        </span>
                    </div>
                    <span className="floating-wa-arrow">→</span>
                </a>

                {/* Direct Chat */}
                <a
                    href="https://wa.me/919491113036"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="floating-wa-option floating-wa-direct"
                    onClick={() => setOpen(false)}
                >
                    <div className="floating-wa-option-icon floating-wa-icon-direct">
                        <FiPhone size={18} />
                    </div>
                    <div className="floating-wa-option-text">
                        <span className="floating-wa-option-title">
                            {t('floatingWa.chatTitle', 'Chat with Us')}
                        </span>
                        <span className="floating-wa-option-desc">
                            {t('floatingWa.chatDesc', 'Direct message on WhatsApp')}
                        </span>
                    </div>
                    <span className="floating-wa-arrow">→</span>
                </a>
            </div>

            {/* Floating Button */}
            <button
                className={`floating-wa-btn ${open ? 'floating-wa-btn-active' : ''}`}
                onClick={() => setOpen(prev => !prev)}
                aria-label="WhatsApp"
            >
                <span className="floating-wa-btn-icon">
                    {open ? <FiX size={26} /> : <FaWhatsapp size={28} />}
                </span>
                <span className="floating-wa-pulse" />
                <span className="floating-wa-pulse floating-wa-pulse-2" />
            </button>
        </div>
    );
};

export default FloatingWhatsApp;
