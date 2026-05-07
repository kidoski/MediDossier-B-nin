const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const consultationRoutes = require('./routes/consultations');
const utilisateurRoutes = require('./routes/utilisateurs');
const constantesRoutes = require('./routes/constantes');
const antecedentRoutes = require('./routes/antecedents');

const app = express();

db.query('SELECT 1')
  .then(() => console.log('✅ Base de données connectée !'))
  .catch(err => console.error('❌ Erreur DB :', err));

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/constantes', constantesRoutes);
app.use('/api/antecedents', antecedentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API Dossier Médical Bénin - OK ✅' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});