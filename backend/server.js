require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const operatorRoutes = require('./routes/operator');

connectDB();

console.log('--- Environment Check ---');
console.log('PORT:', process.env.PORT);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('-------------------------');

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        // Normalize URLs: Trim whitespace and remove trailing slashes
        const normalizedOrigin = origin.trim().replace(/\/$/, "");
        const normalizedAllowed = allowedOrigins.map(url => url.trim().replace(/\/$/, ""));

        console.log(`CORS Check: Origin "${normalizedOrigin}" against [${normalizedAllowed.join(', ')}]`);

        if (normalizedAllowed.includes(normalizedOrigin)) {
            callback(null, true);
        } else {
            console.error(`❌ CORS BLOCKED!`);
            console.error(`Incoming: "${normalizedOrigin}"`);
            console.error(`Allowed:  "${normalizedAllowed.join('", "')}"`);
            callback(null, false);
        }
    },
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/operator', operatorRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'ANTIGRAVITY API running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
