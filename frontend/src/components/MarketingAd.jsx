import { useState } from 'react';
import {
    FiExternalLink, FiMaximize2, FiX, FiFileText,
    FiDownload, FiPlayCircle, FiImage, FiCheckCircle
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

// Helper to determine media type from URL extension or pattern if not specified or set to 'auto'
export const detectMediaType = (url, explicitType) => {
    if (explicitType && explicitType !== 'auto') return explicitType.toLowerCase();
    if (!url) return 'image';

    const cleanUrl = url.split('?')[0].toLowerCase();

    if (cleanUrl.endsWith('.gif') || url.includes('giphy.com') || url.includes('tenor.com')) {
        return 'gif';
    }
    if (
        cleanUrl.endsWith('.mp4') ||
        cleanUrl.endsWith('.webm') ||
        cleanUrl.endsWith('.ogg') ||
        cleanUrl.endsWith('.mov') ||
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('vimeo.com')
    ) {
        return 'video';
    }
    if (cleanUrl.endsWith('.pdf')) {
        return 'pdf';
    }
    if (
        cleanUrl.endsWith('.doc') ||
        cleanUrl.endsWith('.docx') ||
        cleanUrl.endsWith('.xls') ||
        cleanUrl.endsWith('.xlsx') ||
        cleanUrl.endsWith('.ppt') ||
        cleanUrl.endsWith('.pptx') ||
        cleanUrl.endsWith('.txt') ||
        cleanUrl.endsWith('.csv')
    ) {
        return 'document';
    }
    // Default image formats: jpg, jpeg, png, svg, webp, bmp, avif
    return 'image';
};

// Helper for video embed conversion
const getEmbedUrl = (url) => {
    if (!url) return url;
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch && ytMatch[1]) {
        return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return null;
};

const MarketingAd = ({ ad, variant = 'card', showDismiss = false, onDismiss }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [imgError, setImgError] = useState(false);

    if (!ad || !ad.mediaUrl) return null;

    const mediaType = detectMediaType(ad.mediaUrl, ad.mediaType);
    const embedUrl = mediaType === 'video' ? getEmbedUrl(ad.mediaUrl) : null;
    const isWhatsApp = ad.linkUrl && (ad.linkUrl.includes('wa.me') || ad.linkUrl.includes('whatsapp.com'));

    const renderMedia = () => {
        switch (mediaType) {
            case 'video':
                if (embedUrl) {
                    return (
                        <div className="ad-video-wrapper">
                            <iframe
                                src={embedUrl}
                                title={ad.title || 'Marketing Video'}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="ad-video-frame"
                            />
                        </div>
                    );
                }
                return (
                    <div className="ad-video-wrapper">
                        <video
                            src={ad.mediaUrl}
                            controls
                            playsInline
                            preload="metadata"
                            className="ad-video-player"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                );

            case 'pdf':
                return (
                    <div className="ad-pdf-wrapper">
                        <iframe
                            src={ad.mediaUrl}
                            title={ad.title || 'PDF Document'}
                            className="ad-pdf-frame"
                        />
                        <div className="ad-pdf-overlay-bar">
                            <span className="ad-pdf-tag">📄 PDF Document Preview</span>
                            <a
                                href={ad.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ad-pdf-btn"
                            >
                                <FiExternalLink size={14} /> Full View
                            </a>
                        </div>
                    </div>
                );

            case 'document':
                return (
                    <div className="ad-document-box">
                        <div className="ad-doc-icon-wrapper">
                            <FiFileText size={38} className="ad-doc-icon" />
                        </div>
                        <div className="ad-doc-content">
                            <div className="ad-doc-badge">Official Attachment</div>
                            <div className="ad-doc-name">{ad.title || 'Informational Document'}</div>
                            <div className="ad-doc-meta">Click below to view or download the complete document</div>
                        </div>
                        <a
                            href={ad.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ad-doc-download-btn"
                        >
                            <FiDownload size={14} /> View File
                        </a>
                    </div>
                );

            case 'gif':
                return (
                    <div className="ad-image-wrapper">
                        <div className="ad-gif-badge">⚡ GIF SPECIAL</div>
                        <img
                            src={ad.mediaUrl}
                            alt={ad.title || 'Promotional Offer'}
                            className="ad-image-content"
                            loading="lazy"
                        />
                    </div>
                );

            case 'image':
            default:
                // Supports JPG, JPEG, PNG, SVG, WEBP
                return (
                    <div className="ad-image-wrapper">
                        {!imgError ? (
                            <img
                                src={ad.mediaUrl}
                                alt={ad.title || 'Advertisement'}
                                className="ad-image-content"
                                loading="lazy"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="ad-image-fallback">
                                <FiImage size={32} />
                                <span>Image Preview</span>
                            </div>
                        )}
                        <button
                            type="button"
                            className="ad-zoom-btn"
                            title="Expand Media"
                            onClick={() => setModalOpen(true)}
                        >
                            <FiMaximize2 size={14} />
                        </button>
                    </div>
                );
        }
    };

    return (
        <>
            <div className={`marketing-ad-card marketing-ad-${variant}`}>
                {/* Header / Badge */}
                <div className="ad-header-row">
                    <div className="ad-badge-pill">
                        <span className="ad-badge-dot" />
                        <span>{ad.badge || 'Marketing Partner'}</span>
                    </div>
                    {showDismiss && onDismiss && (
                        <button
                            type="button"
                            className="ad-dismiss-btn"
                            onClick={onDismiss}
                            title="Dismiss"
                        >
                            <FiX size={14} />
                        </button>
                    )}
                </div>

                {/* Media Container */}
                <div className="ad-media-container">
                    {renderMedia()}
                </div>

                {/* Content & Action */}
                <div className="ad-body-content">
                    {ad.title && <h4 className="ad-title">{ad.title}</h4>}
                    {ad.description && <p className="ad-description">{ad.description}</p>}

                    {ad.linkUrl && (
                        <a
                            href={ad.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`ad-action-btn ${isWhatsApp ? 'ad-action-wa' : 'ad-action-primary'}`}
                        >
                            {isWhatsApp ? (
                                <>
                                    <FaWhatsapp size={16} /> Contact via WhatsApp
                                </>
                            ) : (
                                <>
                                    <span>Learn More / Apply</span>
                                    <FiExternalLink size={15} />
                                </>
                            )}
                        </a>
                    )}
                </div>
            </div>

            {/* Lightbox / Fullscreen Modal */}
            {modalOpen && (
                <div className="ad-modal-backdrop" onClick={() => setModalOpen(false)}>
                    <div className="ad-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="ad-modal-header">
                            <h5>{ad.title || 'Marketing Media Preview'}</h5>
                            <button
                                type="button"
                                className="ad-modal-close"
                                onClick={() => setModalOpen(false)}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div className="ad-modal-body">
                            {mediaType === 'image' || mediaType === 'gif' ? (
                                <img
                                    src={ad.mediaUrl}
                                    alt={ad.title}
                                    style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 8, objectFit: 'contain' }}
                                />
                            ) : (
                                renderMedia()
                            )}
                        </div>
                        {ad.linkUrl && (
                            <div className="ad-modal-footer">
                                <a
                                    href={ad.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary-ag"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                >
                                    Visit Sponsored Website <FiExternalLink />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default MarketingAd;
