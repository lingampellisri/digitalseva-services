import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import {
    FiPlus, FiEdit2, FiTrash2, FiLogOut, FiGrid, FiUser,
    FiFileText, FiMenu, FiX
} from 'react-icons/fi';
import PostForm from './PostForm';
import ManageOperator from './ManageOperator';

const VIEWS = {
    DASHBOARD: 'dashboard',
    ADD_POST: 'add_post',
    EDIT_POST: 'edit_post',
    MANAGE_OPERATOR: 'manage_operator',
};

const AdminDashboard = () => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState(VIEWS.DASHBOARD);
    const [posts, setPosts] = useState([]);
    const [editPost, setEditPost] = useState(null);
    const [operator, setOperator] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [p, o] = await Promise.all([API.get('/posts'), API.get('/operator')]);
            setPosts(p.data);
            setOperator(o.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this post?')) return;
        await API.delete(`/posts/${id}`);
        fetchData();
    };

    const handleEdit = (post) => {
        setEditPost(post);
        setView(VIEWS.EDIT_POST);
    };

    const handleLogout = () => { logout(); navigate('/'); };

    const navItems = [
        { key: VIEWS.DASHBOARD, icon: <FiGrid />, label: t('admin.dashboard') },
        { key: VIEWS.ADD_POST, icon: <FiPlus />, label: t('admin.addPost') },
        { key: VIEWS.MANAGE_OPERATOR, icon: <FiUser />, label: t('admin.manageOperator') },
    ];

    const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const isActive = (d) => new Date(d) > new Date();

    const activePosts = posts.filter(p => isActive(p.endDate)).length;

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="admin-sidebar" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
                <div className="sidebar-brand">
                    <div className="sidebar-logo">Digital Seva</div>
                    <div className="sidebar-tagline">Admin Panel</div>
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
                        <FiLogOut /> {t('admin.logout')}
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
                            {navItems.find(i => i.key === view)?.label || t('admin.dashboard')}
                        </h5>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Welcome, Admin 👋
                    </div>
                </div>

                <div className="admin-page">
                    {/* Dashboard overview */}
                    {view === VIEWS.DASHBOARD && (
                        <>
                            {/* Stats */}
                            <div className="row g-3 mb-4">
                                {[
                                    { icon: '📋', label: 'Total Posts', value: posts.length, color: '#00b4d8' },
                                    { icon: '✅', label: 'Active Posts', value: activePosts, color: '#22c55e' },
                                    { icon: '⌛', label: 'Expired Posts', value: posts.length - activePosts, color: '#f59e0b' },
                                    { icon: '👤', label: 'Operators', value: operator?.name ? 1 : 0, color: '#a78bfa' },
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

                            {/* Posts table */}
                            <div className="admin-card">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 style={{ margin: 0, fontWeight: 700 }}>All Posts</h5>
                                    <button className="btn-primary-ag" onClick={() => setView(VIEWS.ADD_POST)}>
                                        <FiPlus /> {t('admin.addPost')}
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="spinner-container"><div className="spinner-ag" /></div>
                                ) : posts.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📭</div>
                                        <div className="empty-state-title">No posts yet</div>
                                        <div className="empty-state-text">Add your first post using the Add Post button</div>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Title</th>
                                                    <th>Category</th>
                                                    <th>Start</th>
                                                    <th>End</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {posts.map((p, i) => (
                                                    <tr key={p._id}>
                                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                                                        <td style={{ maxWidth: 200, fontWeight: 600 }}>
                                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {p.titleEn}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{ background: 'rgba(0,180,216,0.1)', color: 'var(--accent-blue)', padding: '2px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                                                                {p.category}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '0.82rem' }}>{fmt(p.startDate)}</td>
                                                        <td style={{ fontSize: '0.82rem' }}>{fmt(p.endDate)}</td>
                                                        <td>
                                                            {isActive(p.endDate)
                                                                ? <span className="badge-active" style={{ fontSize: '0.7rem' }}>Active</span>
                                                                : <span className="badge-expired" style={{ fontSize: '0.7rem' }}>Expired</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            <button className="btn-edit-ag" onClick={() => handleEdit(p)}>
                                                                <FiEdit2 />
                                                            </button>
                                                            <button className="btn-danger-ag" onClick={() => handleDelete(p._id)}>
                                                                <FiTrash2 />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {view === VIEWS.ADD_POST && (
                        <PostForm
                            onSuccess={() => { fetchData(); setView(VIEWS.DASHBOARD); }}
                            onCancel={() => setView(VIEWS.DASHBOARD)}
                        />
                    )}

                    {view === VIEWS.EDIT_POST && editPost && (
                        <PostForm
                            post={editPost}
                            onSuccess={() => { fetchData(); setView(VIEWS.DASHBOARD); setEditPost(null); }}
                            onCancel={() => { setView(VIEWS.DASHBOARD); setEditPost(null); }}
                        />
                    )}

                    {view === VIEWS.MANAGE_OPERATOR && (
                        <ManageOperator
                            existing={operator}
                            onSuccess={(op) => { setOperator(op); }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
