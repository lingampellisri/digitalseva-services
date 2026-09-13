import React from 'react';
import { FiCheck, FiClock, FiAlertTriangle, FiX, FiFileText, FiUserCheck, FiSearch, FiCpu, FiCheckCircle } from 'react-icons/fi';

const MAIN_STEPS = [
    { key: 'submitted', label: 'Submitted', desc: 'Application Received', icon: FiFileText },
    { key: 'assigned', label: 'Assigned', desc: 'Officer Designated', icon: FiUserCheck },
    { key: 'under_review', label: 'Under Review', desc: 'Document Verification', icon: FiSearch },
    { key: 'in_progress', label: 'In Process', desc: 'Portal Processing', icon: FiCpu },
    { key: 'completed', label: 'Completed', desc: 'Service Delivered', icon: FiCheckCircle }
];

// Map legacy or alternative status keys to main progress index
const STATUS_INDEX_MAP = {
    submitted: 0,
    assigned: 1,
    pending: 1,
    contacted: 2,
    under_review: 2,
    in_progress: 3,
    action_required: 3,
    completed: 4,
    rejected: 4,
    cancelled: 4
};

export const STATUS_META = {
    submitted: { label: 'Submitted', badgeClass: 'badge-submitted', color: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: '📝' },
    assigned: { label: 'Assigned', badgeClass: 'badge-assigned', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '📨' },
    under_review: { label: 'Under Review', badgeClass: 'badge-review', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '🔍' },
    in_progress: { label: 'In Process', badgeClass: 'badge-progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: '🔄' },
    action_required: { label: 'Action Required', badgeClass: 'badge-warning', color: '#ea580c', bg: 'rgba(234,88,12,0.12)', icon: '⚠️' },
    completed: { label: 'Completed', badgeClass: 'badge-completed', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '✅' },
    rejected: { label: 'Rejected', badgeClass: 'badge-rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: '❌' },
    cancelled: { label: 'Cancelled', badgeClass: 'badge-cancelled', color: '#64748b', bg: 'rgba(100,116,139,0.12)', icon: '🚫' },
    pending: { label: 'Pending Review', badgeClass: 'badge-assigned', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏳' },
    contacted: { label: 'Contacted', badgeClass: 'badge-review', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '📞' }
};

const LifecycleStepper = ({ currentStatus = 'submitted', statusHistory = [], compact = false }) => {
    const isRejected = currentStatus === 'rejected';
    const isCancelled = currentStatus === 'cancelled';
    const isActionRequired = currentStatus === 'action_required';

    const currentStepIndex = STATUS_INDEX_MAP[currentStatus] ?? 0;

    // Find timestamp for each step if present in history
    const getStepTimestamp = (key) => {
        if (!statusHistory || !statusHistory.length) return null;
        const entry = statusHistory.slice().reverse().find(h => {
            if (h.status === key) return true;
            if (key === 'assigned' && h.status === 'pending') return true;
            if (key === 'under_review' && h.status === 'contacted') return true;
            return false;
        });
        return entry?.timestamp ? new Date(entry.timestamp).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        }) : null;
    };

    if (compact) {
        return (
            <div className="lifecycle-stepper-compact">
                <div className="stepper-compact-track">
                    {MAIN_STEPS.map((step, idx) => {
                        const isDone = !isRejected && !isCancelled && idx < currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                            <div key={step.key} className="stepper-compact-step">
                                <div
                                    className={`stepper-compact-dot ${isDone ? 'done' : ''} ${isCurrent ? (isRejected ? 'rejected' : isActionRequired ? 'action' : 'active') : ''}`}
                                    title={`${step.label}: ${step.desc}`}
                                />
                                {idx < MAIN_STEPS.length - 1 && (
                                    <div className={`stepper-compact-line ${idx < currentStepIndex && !isRejected ? 'filled' : ''}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="lifecycle-stepper-container">
            {/* Action Required Banner */}
            {isActionRequired && (
                <div className="stepper-alert-banner alert-warning-ag">
                    <FiAlertTriangle size={18} />
                    <div>
                        <strong>Action Needed:</strong> The designated operator has requested clarification or additional documentation to proceed.
                    </div>
                </div>
            )}

            {/* Rejected / Cancelled Alert */}
            {isRejected && (
                <div className="stepper-alert-banner alert-danger-ag">
                    <FiX size={18} />
                    <div>
                        <strong>Application Rejected:</strong> This request could not be fulfilled. Please check the review notes below.
                    </div>
                </div>
            )}
            {isCancelled && (
                <div className="stepper-alert-banner alert-neutral-ag">
                    <FiX size={18} />
                    <div>
                        <strong>Application Cancelled:</strong> This service request has been cancelled.
                    </div>
                </div>
            )}

            <div className="stepper-grid">
                {MAIN_STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = !isRejected && !isCancelled && idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex && !isRejected && !isCancelled;
                    const isStepRejected = isRejected && idx === currentStepIndex;
                    const isPending = idx > currentStepIndex;
                    const time = getStepTimestamp(step.key);

                    return (
                        <div
                            key={step.key}
                            className={`stepper-node ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''} ${isStepRejected ? 'is-rejected' : ''} ${isPending ? 'is-pending' : ''}`}
                        >
                            {/* Connector Line to next node */}
                            {idx < MAIN_STEPS.length - 1 && (
                                <div className={`stepper-connector ${idx < currentStepIndex && !isRejected ? 'is-filled' : ''}`} />
                            )}

                            {/* Node Circle */}
                            <div className="stepper-circle">
                                {isDone ? (
                                    <FiCheck size={16} className="stepper-icon-done" />
                                ) : isStepRejected ? (
                                    <FiX size={16} className="stepper-icon-rejected" />
                                ) : isCurrent && isActionRequired ? (
                                    <FiAlertTriangle size={16} className="stepper-icon-action" />
                                ) : (
                                    <StepIcon size={16} />
                                )}
                            </div>

                            {/* Node Labels */}
                            <div className="stepper-text">
                                <span className="stepper-title">{step.label}</span>
                                <span className="stepper-desc">{step.desc}</span>
                                {time && <span className="stepper-time"><FiClock size={11} /> {time}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LifecycleStepper;
