import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../api/client';
import LifecycleStepper from './LifecycleStepper';
import { FiSave, FiPhone, FiMail, FiMessageSquare, FiCheck, FiX, FiClock, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const STATUS_CONFIG = {
    submitted: { label: 'Submitted', color: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: '📝' },
    assigned: { label: 'Assigned', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '📨' },
    under_review: { label: 'Under Review', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '🔍' },
    in_progress: { label: 'In Process', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '🔄' },
    action_required: { label: 'Action Required', color: '#ea580c', bg: 'rgba(234,88,12,0.12)', icon: '⚠️' },
    completed: { label: 'Completed', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅' },
    rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '❌' },
    cancelled: { label: 'Cancelled', color: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: '🚫' },
    pending: { label: 'Pending Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
    contacted: { label: 'Contacted', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '📞' }
};

const STATUSES = [
    'submitted',
    'assigned',
    'under_review',
    'in_progress',
    'action_required',
    'completed',
    'rejected',
    'cancelled'
];

const RequestCard = ({
    request,
    onUpdate,
    role = 'operator',
    canUpdateStatus = true,
    canAddNotes = true
}) => {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState(request.status);
    const [statusNote, setStatusNote] = useState('');
    const [notes, setNotes] = useState(request.operatorNotes || '');
    const [message, setMessage] = useState(request.operatorMessage || '');
    const [copiedId, setCopiedId] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.submitted;
    const phone = request.customerPhone?.replace(/\D/g, '');
    const waPhone = phone ? (phone.length === 10 ? `91${phone}` : phone) : '';

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '';

    const copyTrackingId = (e) => {
        e.stopPropagation();
        if (!request.trackingId) return;
        navigator.clipboard.writeText(request.trackingId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        setErrorMsg('');
        try {
            await API.put(`/customer-requests/${request._id}`, {
                status,
                statusNote: statusNote.trim() || undefined,
                operatorNotes: notes,
                operatorMessage: message
            });
            setSaved(true);
            setStatusNote('');
            if (onUpdate) onUpdate();
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to update request');
            setTimeout(() => setErrorMsg(''), 4000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="request-card" style={{ borderLeft: `5px solid ${cfg.color}` }}>
            {/* Header - Always visible */}
            <div className="request-card-header" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
                <div className="request-card-info">
                    <div className="request-card-avatar" style={{ background: `linear-gradient(135deg, ${cfg.color}, #6366f1)` }}>
                        {request.customerName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="request-card-main">
                        <div className="request-card-title-row">
                            <span className="request-card-name">{request.customerName}</span>
                            {request.trackingId && (
                                <span className="request-tracking-pill" onClick={copyTrackingId} title="Click to copy Tracking ID">
                                    <span>{request.trackingId}</span>
                                    {copiedId ? <FiCheck size={11} color="#10b981" /> : <FiCopy size={11} />}
                                </span>
                            )}
                        </div>
                        <div className="request-card-service-row">
                            <span className="request-card-service">{request.serviceName}</span>
                            {request.serviceCategory && (
                                <span className="request-card-cat">{request.serviceCategory}</span>
                            )}
                        </div>
                        <div className="request-card-meta">
                            <span className="request-card-meta-item">
                                <FiClock size={12} /> {fmt(request.createdAt)}
                            </span>
                            {request.assignedTo && (
                                <span className="request-card-meta-item">
                                    👤 {request.assignedTo.name || 'Assigned'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="request-card-right">
                    <span className="request-status-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: `${cfg.color}40` }}>
                        <span>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                    </span>
                    <span
                        className="request-expand-btn"
                        style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
                    >
                        ▾
                    </span>
                </div>
            </div>

            {/* Expanded Detail */}
            {expanded && (
                <div className="request-card-detail" style={{ animation: 'fadeInDown 0.2s ease' }}>
                    {/* Quick Citizen Contact Action Bar */}
                    <div className="request-quick-actions-bar">
                        {waPhone && (
                            <a
                                href={`https://wa.me/${waPhone}?text=Hello%20${encodeURIComponent(request.customerName || '')},%20regarding%20your%20application%20(${request.trackingId || ''})%20for%20${encodeURIComponent(request.serviceName || '')}:`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="request-action-btn request-action-wa"
                            >
                                <FaWhatsapp size={15} /> Chat on WhatsApp
                            </a>
                        )}
                        <a href={`tel:${request.customerPhone}`} className="request-action-btn request-action-call">
                            <FiPhone size={14} /> Call Customer ({request.customerPhone})
                        </a>
                        {request.trackingId && (
                            <a
                                href={`/track/${request.trackingId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-outline-ag"
                                style={{ padding: '8px 14px', fontSize: '0.84rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                                <span>Citizen Live Track Page</span> ↗
                            </a>
                        )}
                    </div>

                    {/* Visual Lifecycle Stepper */}
                    <div className="request-card-stepper-wrap mb-3 p-3" style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                                Request Lifecycle Stepper
                            </span>
                        </div>
                        <LifecycleStepper currentStatus={request.status} statusHistory={request.statusHistory} compact={false} />
                    </div>

                    {/* Contact Info */}
                    <div className="request-detail-contacts">
                        <div className="request-detail-contact">
                            <FiPhone size={14} />
                            <a href={`tel:${request.customerPhone}`}>{request.customerPhone}</a>
                        </div>
                        {request.customerEmail && (
                            <div className="request-detail-contact">
                                <FiMail size={14} />
                                <a href={`mailto:${request.customerEmail}`}>{request.customerEmail}</a>
                            </div>
                        )}
                        {request.customerAge && (
                            <div className="request-detail-contact">
                                <span>🎂</span>
                                <span>{request.customerAge} years</span>
                            </div>
                        )}
                    </div>

                    {/* Customer Message */}
                    {request.customerMessage && (
                        <div className="request-customer-message">
                            <FiMessageSquare size={14} />
                            <span>"{request.customerMessage}"</span>
                        </div>
                    )}

                    {/* Assigned Operator (for admin view) */}
                    {role === 'admin' && request.assignedTo && (
                        <div className="request-assigned-info">
                            <span>👤 Assigned to: <strong>{request.assignedTo.name || 'Unknown'}</strong></span>
                            {request.assignedTo.phone && <span> • {request.assignedTo.phone}</span>}
                        </div>
                    )}

                    {/* Status Update & Notes */}
                    <div className="request-update-section">
                        {errorMsg && (
                            <div className="alert-ag alert-error mb-2" style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
                                {errorMsg}
                            </div>
                        )}

                        <div className="form-group-ag" style={{ marginBottom: 12 }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <label className="form-label-ag" style={{ fontSize: '0.75rem', margin: 0 }}>Update Lifecycle Stage</label>
                                {!canUpdateStatus && (
                                    <span style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 600 }}>
                                        🔒 Status change requires permission
                                    </span>
                                )}
                            </div>
                            <select
                                className="form-control-ag"
                                value={status}
                                onChange={e => setStatus(e.target.value)}
                                disabled={!canUpdateStatus}
                                style={{ fontSize: '0.85rem', opacity: canUpdateStatus ? 1 : 0.65 }}
                            >
                                {STATUSES.map(s => (
                                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                                ))}
                            </select>
                        </div>

                        {status !== request.status && (
                            <div className="form-group-ag" style={{ marginBottom: 12 }}>
                                <label className="form-label-ag" style={{ fontSize: '0.75rem' }}>Lifecycle Transition Note (Recorded in Audit Trail)</label>
                                <input
                                    type="text"
                                    className="form-control-ag"
                                    value={statusNote}
                                    onChange={e => setStatusNote(e.target.value)}
                                    placeholder="e.g. Verified Aadhaar & Income certificates with meeseva portal"
                                    style={{ fontSize: '0.82rem' }}
                                />
                            </div>
                        )}

                        <div className="form-group-ag" style={{ marginBottom: 12 }}>
                            <label className="form-label-ag" style={{ fontSize: '0.75rem' }}>Internal Operator Notes (Only you & admin see this)</label>
                            <textarea
                                className="form-control-ag" rows={2}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                disabled={!canAddNotes}
                                placeholder={canAddNotes ? "Add private notes about this request..." : "Notes locked (requires permission)"}
                                style={{ resize: 'vertical', fontSize: '0.85rem', opacity: canAddNotes ? 1 : 0.65 }}
                            />
                        </div>

                        <div className="form-group-ag" style={{ marginBottom: 12 }}>
                            <label className="form-label-ag" style={{ fontSize: '0.75rem' }}>Customer Public Guidance (Visible to Citizen in Track Status)</label>
                            <textarea
                                className="form-control-ag" rows={2}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                disabled={!canAddNotes}
                                placeholder={canAddNotes ? "Instructions or updates displayed to the customer on tracking page..." : "Message locked"}
                                style={{ resize: 'vertical', fontSize: '0.85rem', opacity: canAddNotes ? 1 : 0.65 }}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="request-actions">
                        {waPhone && (
                            <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer"
                                className="request-action-btn request-action-wa">
                                <FaWhatsapp size={16} /> WhatsApp
                            </a>
                        )}
                        <a href={`tel:${request.customerPhone}`} className="request-action-btn request-action-call">
                            <FiPhone size={14} /> Call
                        </a>
                        <button
                            className="request-action-btn request-action-save"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <span className="spinner-ag" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                : saved ? <><FiCheck size={14} /> Saved!</>
                                : <><FiSave size={14} /> Save</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestCard;
