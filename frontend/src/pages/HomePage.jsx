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

    const filtered = posts.filter(p => {
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const matchSearch = p.titleEn.toLowerCase().includes(search.toLowerCase()) ||
            (p.titleTe || '').includes(search);
        return matchCat && matchSearch;
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

                    {/* Search */}
                    <div className="d-flex justify-content-center mb-4">
                        <div style={{ position: 'relative', maxWidth: 440, width: '100%' }}>
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
