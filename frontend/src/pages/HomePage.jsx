import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import HeroSection from '../components/HeroSection';
import PostCard from '../components/PostCard';
import Footer from '../components/Footer';
import API from '../api/client';
import { FiSearch } from 'react-icons/fi';

const CATEGORIES = ['all', 'job', 'pan', 'aadhaar', 'scholarship', 'government', 'private', 'other'];

const HomePage = () => {
    const { t } = useTranslation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [view, setView] = useState('all'); // 'all' or 'active'

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await API.get('/posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const whatsNew = sortedPosts.slice(0, 4);

    const filtered = posts.filter(p => {
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const matchSearch = p.titleEn.toLowerCase().includes(search.toLowerCase()) ||
            (p.titleTe || '').includes(search);
        const matchView = view === 'all' || new Date(p.endDate) > new Date();
        return matchCat && matchSearch && matchView;
    });

    return (
        <>
            <HeroSection />

            <section id="posts-section" style={{ padding: '80px 0', background: 'var(--bg-light)' }}>
                <div className="container">
                    {/* Section header */}
                    <div className="text-center mb-5 animate-fadeInUp">
                        <h2 className="section-title">{t('posts.title')}</h2>
                        <div className="section-line mx-auto" />
                        <p className="section-subtitle mt-2">{t('posts.subtitle')}</p>
                    </div>

                    {/* What's New Section */}
                    {whatsNew.length > 0 && !search && activeCategory === 'all' && (
                        <div className="mb-5">
                            <h4 className="mb-3 d-flex align-items-center gap-2" style={{ fontWeight: 700 }}>
                                🆕 What's New
                            </h4>
                            <div className="row g-3">
                                {whatsNew.map((post, i) => (
                                    <div key={`new-${post._id}`} className="col-12 col-sm-6 col-md-3">
                                        <PostCard post={post} delay={i * 0.1} />
                                    </div>
                                ))}
                            </div>
                            <div className="section-line mt-5 mb-5 opacity-25" />
                        </div>
                    )}

                    {/* Search and Tabs */}
                    <div className="d-flex flex-column align-items-center mb-4">
                        <div style={{ position: 'relative', maxWidth: 440, width: '100%', marginBottom: 20 }}>
                            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search notifications..."
                                className="form-control-ag"
                                style={{ paddingLeft: 42, width: '100%' }}
                            />
                        </div>

                        <div className="d-flex gap-2 p-1 bg-white rounded-pill shadow-sm mb-2" style={{ border: '1px solid #eee' }}>
                            <button
                                className={`btn-category m-0 py-2 px-4 rounded-pill ${view === 'all' ? 'active shadow-sm' : ''}`}
                                onClick={() => setView('all')}
                                style={{ borderRadius: '50px' }}
                            >
                                All Notifications
                            </button>
                            <button
                                className={`btn-category m-0 py-2 px-4 rounded-pill ${view === 'active' ? 'active shadow-sm' : ''}`}
                                onClick={() => setView('active')}
                                style={{ borderRadius: '50px' }}
                            >
                                🔥 Active Only
                            </button>
                        </div>
                    </div>

                    {/* Category filter */}
                    <div className="category-filter">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`btn-category ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {t(`categories.${cat}`)}
                            </button>
                        ))}
                    </div>

                    {/* Posts grid */}
                    {loading ? (
                        <div className="spinner-container">
                            <div className="spinner-ag" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-title">{t('posts.noPosts')}</div>
                            <div className="empty-state-text">No posts match your search or filter.</div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filtered.map((post, i) => (
                                <div key={post._id} className="col-12 col-sm-6 col-lg-4">
                                    <PostCard post={post} delay={Math.min(i * 0.1, 0.6)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </>
    );
};

export default HomePage;
