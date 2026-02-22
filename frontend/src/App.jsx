import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import './i18n';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const PublicLayout = ({ darkMode, toggleDarkMode }) => {
    const securityMessage = "🛡️ Cyber Security Alert: DigitalSeva never asks for unauthorized OTPs or bank details. Be careful with cyber frauds! Stay safe! • DigitalSeva never calls for personal sensitive info • Keep your OTPs private • Report suspicious links";

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
                <Routes>
                    {/* Admin routes — no Navbar */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Public routes — with Navbar */}
                    <Route element={<PublicLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
                        <Route path="/" element={<HomePage />} />
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
