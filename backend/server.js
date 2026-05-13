const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ============================================================
// MIDDLEWARES
// ============================================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// ROUTES API
// ============================================================
const routes = require('./routes/index');
app.use('/api', routes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SGDP API is running', timestamp: new Date() });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée.' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur:', err.message);
  res.status(500).json({ message: err.message || 'Erreur serveur.' });
});

// ============================================================
// DÉMARRAGE DU SERVEUR
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Serveur SGDP démarré sur le port ${PORT}`);
  console.log(` API disponible sur http://localhost:${PORT}/api`);
  console.log(` Environnement: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;