import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import './i18n';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import OperatorRoute from './components/OperatorRoute';

import Navbar from './components/Navbar';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import OperatorLogin from './pages/OperatorLogin';
import OperatorDashboard from './pages/OperatorDashboard';
import CustomerRequestsAdmin from './pages/CustomerRequestsAdmin';
import TrackRequestPage from './pages/TrackRequestPage';

import { useTranslation } from 'react-i18next';

const PublicLayout = ({ darkMode, toggleDarkMode }) => {
    const { t } = useTranslation();
    const securityMessage = t('securityMessage');

    return (
        <>
            <div className="security-banner">
                <div className="marquee-container">
                    <div className="marquee-content">
                        <span>{securityMessage}</span>
                        <span>{securityMessage}</span>
                    </div>
                </div>
            </div>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Outlet />
        </>
    );
};

function App() {
    const [darkMode, setDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            document.documentElement.setAttribute('data-theme', !prev ? 'dark' : 'light');
            return !prev;
        });
    };

    return (
        <AuthProvider>
            <Router>
                <FloatingWhatsApp />
                <Routes>
                    {/* Admin portal routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } />
                    <Route path="/admin/requests" element={
                        <AdminRoute>
                            <CustomerRequestsAdmin />
                        </AdminRoute>
                    } />

                    {/* Operator portal routes */}
                    <Route path="/operator/login" element={<OperatorLogin />} />
                    <Route path="/operator" element={
                        <OperatorRoute>
                            <OperatorDashboard />
                        </OperatorRoute>
                    } />

                    {/* Public customer-facing routes — with Navbar */}
                    <Route element={<PublicLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/track" element={<TrackRequestPage />} />
                        <Route path="/track/:trackingId" element={<TrackRequestPage />} />
                        <Route path="/post/:id" element={<PostDetailPage />} />
                        <Route path="*" element={
                            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                                <h1 style={{ fontSize: '4rem', fontWeight: 900 }}>404</h1>
                                <p>Page not found</p>
                                <a href="/" className="btn-admin">Go Home</a>
                            </div>
                        } />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
