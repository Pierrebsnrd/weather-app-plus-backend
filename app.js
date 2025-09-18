require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const connectDB = require('./config/database');

// Routes
const authRouter = require('./routes/auth');
const citiesRouter = require('./routes/cities');
const weatherRouter = require('./routes/weather');

// Connexion à MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://weather-app-plus-frontend.vercel.app/']
    : ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cities', citiesRouter);
app.use('/api/weather', weatherRouter);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur interne du serveur' });
});

module.exports = app;
