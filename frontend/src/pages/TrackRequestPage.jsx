import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../api/client';
import LifecycleStepper, { STATUS_META } from '../components/LifecycleStepper';
import {
    FiSearch, FiCopy, FiCheck, FiClock, FiPhone, FiMessageSquare,
    FiShield, FiArrowRight, FiInfo, FiFileText, FiRefreshCw
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const TrackRequestPage = () => {
    const { t } = useTranslation();
    const { trackingId: urlTrackingId } = useParams();

    const [searchInput, setSearchInput] = useState(urlTrackingId || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [copiedId, setCopiedId] = useState(false);

    useEffect(() => {
        if (urlTrackingId) {
            handleSearch(urlTrackingId);
        }
    }, [urlTrackingId]);

    const handleSearch = async (queryToSearch) => {
        const query = (queryToSearch || searchInput).trim();
        if (!query) {
            setError('Please enter a valid Tracking ID (e.g., DS-2026-XXXXX)');
            return;
        }

        // If user typed a phone number instead of DS Tracking ID
        const digitsOnly = query.replace(/\D/g, '');
        if (digitsOnly.length === 10 && !query.toUpperCase().startsWith('DS')) {
            setError('Applications can only be tracked using your Tracking ID (e.g., DS-2026-XXXXX). Searching by phone number is disabled for citizen privacy & data security.');
            return;
        }

        setLoading(true);
        setError('');
        setResults([]);

        try {
            const res = await API.get(`/customer-requests/track/${encodeURIComponent(query)}`);
            if (res.data?.requests && res.data.requests.length > 0) {
                setResults(res.data.requests);
                setSelectedIndex(0);
            } else {
                setError(`No application found for Tracking ID "${query}". Please check the ID and try again.`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to find application. Please verify your Tracking ID (e.g., DS-2026-XXXXX).');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    const copyTrackingId = (id) => {
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const activeRequest = results[selectedIndex] || null;
    const meta = activeRequest ? (STATUS_META[activeRequest.status] || STATUS_META.submitted) : null;
    const assignedOp = activeRequest?.assignedOperator;
    const waPhone = assignedOp?.whatsapp ? assignedOp.whatsapp.replace(/\D/g, '') : (assignedOp?.phone ? assignedOp.phone.replace(/\D/g, '') : '');
    const fullWaPhone = waPhone ? (waPhone.length === 10 ? `91${waPhone}` : waPhone) : '';

    return (
        <div className="track-page-container">
            <div className="container py-5">
                {/* Hero Header */}
                <div className="track-hero text-center mb-5">
                    <span className="track-hero-badge">Citizen Service Portal</span>
                    <h1 className="track-hero-title">Track Application Status</h1>
                    <p className="track-hero-subtitle">
                        Monitor the real-time lifecycle progress of your citizen services request, verify document milestones, and contact your designated service officer.
                    </p>

                    {/* Search Bar Box */}
                    <div className="track-search-card">
                        <form onSubmit={handleFormSubmit} className="track-search-form">
                            <div className="track-search-input-wrap">
                                <FiSearch className="track-search-icon" size={20} />
                                <input
                                    type="text"
                                    className="track-search-input"
                                    placeholder="Enter Tracking ID (e.g., DS-2026-77009)"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary-ag track-search-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-ag" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                ) : (
                                    <>
                                        <FiSearch size={16} /> Track Status
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="track-search-hint">
                            <span>🔒 Security Notice: Requests can only be tracked with your unique Tracking ID (e.g., DS-2026-XXXXX). Searching by phone number is disabled for citizen privacy.</span>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="alert-ag alert-error mx-auto mb-4" style={{ maxWidth: 760, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FiInfo size={22} style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>
                            <strong>Application Search:</strong> {error}
                        </div>
                    </div>
                )}

                {/* Multiple Requests Switcher (if citizen searched by phone number) */}
                {results.length > 1 && (
                    <div className="track-tabs-container mb-4 mx-auto" style={{ maxWidth: 900 }}>
                        <span className="track-tabs-label">Applications found for your number ({results.length}):</span>
                        <div className="track-tabs-list">
                            {results.map((r, idx) => (
                                <button
                                    key={r._id}
                                    type="button"
                                    className={`track-tab-pill ${idx === selectedIndex ? 'active' : ''}`}
                                    onClick={() => setSelectedIndex(idx)}
                                >
                                    <span className="tab-service">{r.serviceName}</span>
                                    <span className="tab-id">({r.trackingId || `ID ${idx + 1}`})</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Request Details Card */}
                {activeRequest && (
                    <div className="track-result-card mx-auto" style={{ maxWidth: 900 }}>
                        {/* Header with Tracking ID, Service, Status Badge */}
                        <div className="track-result-header">
                            <div>
                                <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                    <span className="track-id-badge">
                                        <FiFileText size={14} />
                                        <span>{activeRequest.trackingId || 'APPLICATION'}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copyTrackingId(activeRequest.trackingId)}
                                        className="track-copy-btn"
                                        title="Copy Tracking ID"
                                    >
                                        {copiedId ? (
                                            <>
                                                <FiCheck size={12} color="#10b981" /> Copied!
                                            </>
                                        ) : (
                                            <>
                                                <FiCopy size={12} /> Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                                <h2 className="track-service-name">{activeRequest.serviceName}</h2>
                                {activeRequest.serviceCategory && (
                                    <span className="track-category-tag">{activeRequest.serviceCategory}</span>
                                )}
                            </div>

                            <div className="track-status-pill-wrap">
                                <span
                                    className="track-status-pill"
                                    style={{ background: meta.bg, color: meta.color, borderColor: meta.color }}
                                >
                                    <span>{meta.icon}</span>
                                    <span>{meta.label}</span>
                                </span>
                                <span className="track-date">
                                    <FiClock size={12} /> Submitted:{' '}
                                    {new Date(activeRequest.createdAt).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Visual Lifecycle Stepper */}
                        <div className="track-stepper-wrapper">
                            <h4 className="track-section-title">Application Lifecycle</h4>
                            <LifecycleStepper
                                currentStatus={activeRequest.status}
                                statusHistory={activeRequest.statusHistory}
                            />
                        </div>

                        {/* Customer Guidance Message (if operator left a message) */}
                        {activeRequest.operatorMessage && (
                            <div className="track-operator-msg-card">
                                <div className="track-msg-header">
                                    <FiMessageSquare size={16} />
                                    <span>Officer Guidance / Instructions</span>
                                </div>
                                <div className="track-msg-content">{activeRequest.operatorMessage}</div>
                            </div>
                        )}

                        <div className="row g-4 mt-2">
                            {/* Detailed Milestones / Audit Trail */}
                            <div className="col-lg-7">
                                <h4 className="track-section-title">Audit Trail & History</h4>
                                <div className="track-timeline">
                                    {activeRequest.statusHistory && activeRequest.statusHistory.length > 0 ? (
                                        activeRequest.statusHistory
                                            .slice()
                                            .reverse()
                                            .map((h, i) => (
                                                <div key={i} className="track-timeline-item">
                                                    <div className="track-timeline-marker" />
                                                    <div className="track-timeline-content">
                                                        <div className="track-timeline-header">
                                                            <strong className="track-timeline-title">
                                                                {h.title || h.status.replace(/_/g, ' ')}
                                                            </strong>
                                                            <span className="track-timeline-time">
                                                                {new Date(h.timestamp).toLocaleDateString('en-IN', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                        {h.note && (
                                                            <p className="track-timeline-note">{h.note}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-muted small">No history milestones recorded yet.</div>
                                    )}
                                </div>
                            </div>

                            {/* Assigned Officer / Support Card */}
                            <div className="col-lg-5">
                                <div className="track-officer-card">
                                    <div className="track-officer-header">
                                        <div className="track-officer-avatar">
                                            {assignedOp?.name?.charAt(0).toUpperCase() || 'O'}
                                        </div>
                                        <div>
                                            <div className="track-officer-role">Designated Service Officer</div>
                                            <div className="track-officer-name">
                                                {assignedOp?.name || 'Assigned Officer'}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="track-officer-desc">
                                        Our certified operator is actively managing your service request. Reach out directly for updates or document queries.
                                    </p>

                                    <div className="track-officer-actions">
                                        {fullWaPhone && (
                                            <a
                                                href={`https://wa.me/${fullWaPhone}?text=Hello,%20I%20am%20inquiring%20about%20my%20service%20application%20(Tracking%20ID:%20${activeRequest.trackingId}).`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-track-wa"
                                            >
                                                <FaWhatsapp size={16} /> WhatsApp Officer
                                            </a>
                                        )}
                                        {assignedOp?.phone && (
                                            <a href={`tel:${assignedOp.phone}`} className="btn-track-call">
                                                <FiPhone size={14} /> Call {assignedOp.phone}
                                            </a>
                                        )}
                                    </div>

                                    <div className="track-security-note">
                                        <FiShield size={14} />
                                        <span>Official government certified kiosk service. No hidden fees.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="track-result-footer">
                            <Link to="/" className="btn-track-back">
                                ← Explore Other Services
                            </Link>
                            <button
                                type="button"
                                className="btn-track-refresh"
                                onClick={() => handleSearch(activeRequest.trackingId)}
                            >
                                <FiRefreshCw size={14} /> Refresh Status
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State / How to Track Guide when no search performed */}
                {!loading && !activeRequest && !error && (
                    <div className="track-guide-grid mx-auto mt-4" style={{ maxWidth: 900 }}>
                        <div className="track-guide-card">
                            <div className="track-guide-num">1</div>
                            <h5>Instant Tracking ID</h5>
                            <p>Every time you submit an application, a unique tracking code (DS-2026-XXXXX) is generated for you.</p>
                        </div>
                        <div className="track-guide-card">
                            <div className="track-guide-num">2</div>
                            <h5>Live Lifecycle Stages</h5>
                            <p>Watch your request move from Submission to Verification, Department Processing, and Delivery.</p>
                        </div>
                        <div className="track-guide-card">
                            <div className="track-guide-num">3</div>
                            <h5>Direct Officer Support</h5>
                            <p>Get immediate WhatsApp and phone access to your assigned Digital Seva operator.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackRequestPage;
