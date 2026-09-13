import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RequestCard from '../components/RequestCard';
import API from '../api/client';
import { FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';

const STATUS_FILTERS = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'in_progress', label: 'In Process' },
    { value: 'action_required', label: 'Action Required' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
];

const CustomerRequestsAdmin = ({ operators = [] }) => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [operatorFilter, setOperatorFilter] = useState('');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({});
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

    useEffect(() => { fetchRequests(); }, [statusFilter, operatorFilter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            if (operatorFilter) params.set('assignedTo', operatorFilter);
            if (search) params.set('search', search);

            const [reqRes, statsRes] = await Promise.all([
                API.get(`/customer-requests?${params.toString()}`),
                API.get('/customer-requests/stats')
            ]);
            setRequests(reqRes.data.requests || []);
            setPagination(reqRes.data.pagination || {});
            setStats(statsRes.data || {});
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchRequests();
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <div>
            {/* Stats Summary */}
            <div className="row g-3 mb-4">
                {[
                    { icon: '📨', label: 'Total', value: stats.total || 0, color: '#00b4d8' },
                    { icon: '🔄', label: 'Active', value: (stats.byStatus?.assigned || 0) + (stats.byStatus?.in_progress || 0) + (stats.byStatus?.contacted || 0), color: '#f59e0b' },
                    { icon: '✅', label: 'Completed', value: stats.byStatus?.completed || 0, color: '#22c55e' },
                    { icon: '📅', label: 'Today', value: stats.todayCount || 0, color: '#8b5cf6' },
                    { icon: '📆', label: 'This Week', value: stats.weekCount || 0, color: '#ec4899' },
                ].map(s => (
                    <div key={s.label} className="col-6 col-md">
                        <div className="stat-card" style={{ padding: '16px 14px' }}>
                            <div className="stat-icon" style={{ background: `${s.color}20`, width: 36, height: 36 }}>
                                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                            </div>
                            <div>
                                <div className="stat-value" style={{ background: `linear-gradient(135deg, ${s.color}, #7c3aed)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '1.4rem', fontWeight: 900 }}>
                                    {s.value}
                                </div>
                                <div className="stat-label" style={{ fontSize: '0.7rem' }}>{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Card */}
            <div className="admin-card">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <h5 style={{ margin: 0, fontWeight: 700 }}>
                        📋 All Customer Requests
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                            ({pagination.total})
                        </span>
                    </h5>
                    <button className="btn-edit-ag d-flex align-items-center gap-1" onClick={fetchRequests}>
                        <FiRefreshCw size={14} /> Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="d-flex gap-2 mb-4 flex-wrap">
                    <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 380, display: 'flex', alignItems: 'center' }}>
                        <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text" className="form-control-ag" value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search by Tracking ID (DS-...), name..."
                            style={{ paddingLeft: 36, paddingRight: search ? 65 : 44, fontSize: '0.85rem' }}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearch(''); setTimeout(fetchRequests, 0); }}
                                style={{ position: 'absolute', right: 42, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSearch}
                            style={{
                                position: 'absolute', right: 4, top: 4, bottom: 4,
                                background: '#00b4d8', border: 'none', borderRadius: 6,
                                color: '#fff', padding: '0 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            Go
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiFilter size={14} style={{ color: 'var(--text-muted)' }} />
                        <select className="form-control-ag" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            style={{ fontSize: '0.85rem', width: 'auto' }}>
                            {STATUS_FILTERS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </div>
                    {operators.length > 0 && (
                        <select className="form-control-ag" value={operatorFilter} onChange={e => setOperatorFilter(e.target.value)}
                            style={{ fontSize: '0.85rem', width: 'auto' }}>
                            <option value="">All Operators</option>
                            {operators.map(op => (
                                <option key={op._id} value={op._id}>{op.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Request List */}
                {loading ? (
                    <div className="spinner-container"><div className="spinner-ag" /></div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-title">No requests found</div>
                        <div className="empty-state-text">
                            {statusFilter || operatorFilter ? 'Try different filters' : 'Customer requests will appear here when submitted'}
                        </div>
                    </div>
                ) : (
                    <div className="request-list">
                        {requests.map(req => (
                            <RequestCard key={req._id} request={req} onUpdate={fetchRequests} role="admin" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerRequestsAdmin;
