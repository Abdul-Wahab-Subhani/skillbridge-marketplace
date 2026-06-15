const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { initSocket } = require('./utils/socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();

// ------- Global Middleware -------
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ------- Health check -------
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Marketplace API is running', time: new Date() });
});

// ------- API Routes -------
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// ------- Error Handling -------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io for real-time project status updates & notifications
initSocket(server, process.env.CLIENT_URL || '*');

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
