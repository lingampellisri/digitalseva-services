import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';
import API from '../api/client';
import {
    FiGrid, FiInbox, FiUser, FiLogOut, FiMenu, FiX,
    FiFilter, FiSearch, FiDownload, FiShield, FiCheckCircle
} from 'react-icons/fi';

const VIEWS = {
    DASHBOARD: 'dashboard',
    QUEUE: 'queue',
    PROFILE: 'profile',
};

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
];

const OperatorDashboard = () => {
    const { t } = useTranslation();
    const { user, logout, hasPermission, isSeniorOperator, operatorRole } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState(VIEWS.DASHBOARD);
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ total: 0, assigned: 0, in_progress: 0, contacted: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profile, setProfile] = useState(null);
    const [viewAll, setViewAll] = useState(false);

    const canViewAll = hasPermission('canViewAllRequests') || isSeniorOperator;
    const canExport = hasPermission('canExportContacts') || isSeniorOperator;
    const canUpdateStatus = hasPermission('canUpdateStatus');
    const canAddNotes = hasPermission('canAddNotes');

    useEffect(() => { fetchData(); }, [statusFilter, viewAll]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (viewAll && canViewAll) params.append('viewAll', 'true');

            const query = params.toString() ? `?${params.toString()}` : '';
            const [reqRes, statsRes] = await Promise.all([
                API.get(`/customer-requests/mine${query}`),
                API.get('/customer-requests/stats')
            ]);
            setRequests(reqRes.data.requests || []);
            setStats(reqRes.data.stats || statsRes.data || {});
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!requests.length) return;
        const headers = ['Request ID', 'Customer Name', 'Phone', 'Email', 'Age', 'Service', 'Category', 'Status', 'Date'];
        const rows = requests.map(r => [
            r._id,
            `"${r.customerName || ''}"`,
            r.customerPhone || '',
            r.customerEmail || '',
            r.customerAge || '',
            `"${r.serviceName || ''}"`,
            r.serviceCategory || '',
            r.status || '',
            new Date(r.createdAt).toLocaleDateString()
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `customer_requests_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchProfile = async () => {
        try {
            const res = await API.get(`/operators/${user.operatorId || user.id}`);
            setProfile(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        if (view === VIEWS.PROFILE && !profile) fetchProfile();
    }, [view]);

    const handleLogout = () => { logout(); navigate('/'); };

    const navItems = [
        { key: VIEWS.DASHBOARD, icon: <FiGrid />, label: t('operatorDashboard.dashboard', 'Dashboard') },
        { key: VIEWS.QUEUE, icon: <FiInbox />, label: t('operatorDashboard.myQueue', 'My Queue') },
        { key: VIEWS.PROFILE, icon: <FiUser />, label: t('operatorDashboard.profile', 'Profile') },
    ];

    const filteredRequests = search
        ? requests.filter(r =>
            r.trackingId?.toLowerCase().includes(search.toLowerCase()) ||
            r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            r.customerPhone?.includes(search) ||
            r.serviceName?.toLowerCase().includes(search.toLowerCase())
        )
        : requests;

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="admin-sidebar" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
                <div className="sidebar-brand">
                    <div className="sidebar-logo">Digital Seva</div>
                    <div className="sidebar-tagline">Operator Panel</div>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button key={item.key}
                            className={`sidebar-nav-item ${view === item.key ? 'active' : ''}`}
                            onClick={() => setView(item.key)}
                        >
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-logout">
                    <button className="sidebar-nav-item w-100" onClick={handleLogout}
                        style={{ color: '#f87171' }}>
                        <FiLogOut /> {t('admin.logout', 'Logout')}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="admin-content">
                {/* Topbar */}
                <div className="admin-topbar">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn-darkmode" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            {sidebarOpen ? <FiX /> : <FiMenu />}
                        </button>
                        <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                            {navItems.find(i => i.key === view)?.label || 'Dashboard'}
                        </h5>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Welcome, <strong>{user?.name || 'Operator'}</strong>
                        </span>
                        <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50,
                            background: operatorRole === 'senior_operator' ? 'rgba(245, 158, 11, 0.15)' : operatorRole === 'trainee_operator' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: operatorRole === 'senior_operator' ? '#d97706' : operatorRole === 'trainee_operator' ? '#6366f1' : '#059669'
                        }}>
                            {operatorRole === 'senior_operator' ? '🌟 Senior Lead' : operatorRole === 'trainee_operator' ? '🔰 Trainee' : '🛡️ Standard Operator'}
                        </span>
                    </div>
                </div>

                <div className="admin-page">
                    {/* ─── Dashboard Overview ───────────────────────────── */}
                    {view === VIEWS.DASHBOARD && (
                        <>
                            <div className="row g-3 mb-4">
                                {[
                                    { icon: '📨', label: 'Total Requests', value: stats.total || 0, color: '#00b4d8' },
                                    { icon: '🔄', label: 'Active', value: (stats.assigned || 0) + (stats.in_progress || 0) + (stats.contacted || 0), color: '#f59e0b' },
                                    { icon: '✅', label: 'Completed', value: stats.completed || 0, color: '#22c55e' },
                                    { icon: '📋', label: 'Pending', value: stats.assigned || 0, color: '#a78bfa' },
                                ].map(s => (
                                    <div key={s.label} className="col-6 col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon" style={{ background: `${s.color}20` }}>
                                                <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
                                            </div>
                                            <div>
                                                <div className="stat-value" style={{ background: `linear-gradient(135deg, ${s.color}, #7c3aed)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '1.8rem', fontWeight: 900 }}>
                                                    {s.value}
                                                </div>
                                                <div className="stat-label">{s.label}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Requests */}
                            <div className="admin-card">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 style={{ margin: 0, fontWeight: 700 }}>Recent Requests</h5>
                                    <button className="btn-primary-ag" onClick={() => setView(VIEWS.QUEUE)}>
                                        <FiInbox /> View All
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="spinner-container"><div className="spinner-ag" /></div>
                                ) : requests.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📭</div>
                                        <div className="empty-state-title">No requests yet</div>
                                        <div className="empty-state-text">Customer requests assigned to you will appear here</div>
                                    </div>
                                ) : (
                                    <div className="request-list">
                                        {requests.slice(0, 5).map(req => (
                                            <RequestCard
                                                key={req._id}
                                                request={req}
                                                onUpdate={fetchData}
                                                role="operator"
                                                canUpdateStatus={canUpdateStatus}
                                                canAddNotes={canAddNotes}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* ─── Request Queue ────────────────────────────────── */}
                    {view === VIEWS.QUEUE && (
                        <div className="admin-card">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                <div>
                                    <h5 style={{ margin: 0, fontWeight: 700 }}>
                                        📋 {viewAll ? 'All Customer Requests (Senior View)' : t('operatorDashboard.myQueue', 'My Assigned Requests')}
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                                            ({filteredRequests.length})
                                        </span>
                                    </h5>
                                </div>
                                <div className="d-flex gap-2 flex-wrap">
                                    {canViewAll && (
                                        <button
                                            type="button"
                                            onClick={() => setViewAll(!viewAll)}
                                            style={{
                                                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                                fontSize: '0.8rem', fontWeight: 600,
                                                background: viewAll ? 'rgba(0,180,216,0.15)' : 'rgba(100,116,139,0.1)',
                                                color: viewAll ? 'var(--accent-blue)' : 'var(--text-muted)'
                                            }}
                                        >
                                            {viewAll ? '👁️ Showing All Queue' : '🔍 Switch to All Queue'}
                                        </button>
                                    )}
                                    {canExport && (
                                        <button
                                            type="button"
                                            className="btn-primary-ag"
                                            onClick={handleExportCSV}
                                            style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                                        >
                                            <FiDownload size={14} /> Export Contacts (CSV)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="d-flex gap-2 mb-4 flex-wrap">
                                <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360, display: 'flex', alignItems: 'center' }}>
                                    <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="text" className="form-control-ag" value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search by Tracking ID (DS-...), name..."
                                        style={{ paddingLeft: 36, paddingRight: search ? 36 : 12, fontSize: '0.85rem' }}
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
                                            title="Clear search"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FiFilter size={14} style={{ color: 'var(--text-muted)' }} />
                                    <select
                                        className="form-control-ag"
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                        style={{ fontSize: '0.85rem', width: 'auto' }}
                                    >
                                        {STATUS_FILTERS.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Request List */}
                            {loading ? (
                                <div className="spinner-container"><div className="spinner-ag" /></div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">📭</div>
                                    <div className="empty-state-title">No requests found</div>
                                    <div className="empty-state-text">
                                        {statusFilter ? 'Try a different filter' : 'Customer requests will appear here'}
                                    </div>
                                </div>
                            ) : (
                                <div className="request-list">
                                    {filteredRequests.map(req => (
                                        <RequestCard
                                            key={req._id}
                                            request={req}
                                            onUpdate={fetchData}
                                            role="operator"
                                            canUpdateStatus={canUpdateStatus}
                                            canAddNotes={canAddNotes}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── Profile ──────────────────────────────────────── */}
                    {view === VIEWS.PROFILE && (
                        <div className="admin-card">
                            <h5 style={{ margin: '0 0 24px', fontWeight: 700 }}>👤 My Profile</h5>
                            {!profile ? (
                                <div className="spinner-container"><div className="spinner-ag" /></div>
                            ) : (
                                <div className="row g-3">
                                    {[
                                        { label: 'Name', value: profile.name },
                                        { label: 'Phone', value: profile.phone },
                                        { label: 'Email', value: profile.email || '—' },
                                        { label: 'WhatsApp', value: profile.whatsapp || '—' },
                                        { label: 'Address', value: profile.address || '—' },
                                        { label: 'Status', value: profile.isActive ? '✅ Active' : '❌ Inactive' },
                                        { label: 'Total Assigned', value: profile.totalAssigned || 0 },
                                        { label: 'Total Completed', value: profile.totalCompleted || 0 },
                                    ].map(item => (
                                        <div key={item.label} className="col-12 col-md-6">
                                            <div style={{ padding: '14px 18px', background: 'var(--bg-light)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{item.label}</div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{item.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {profile.bio && (
                                        <div className="col-12">
                                            <div style={{ padding: '14px 18px', background: 'var(--bg-light)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Bio</div>
                                                <div style={{ color: 'var(--text-dark)', lineHeight: 1.6 }}>{profile.bio}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 20 }}>
                                Contact admin to update your profile information.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OperatorDashboard;
