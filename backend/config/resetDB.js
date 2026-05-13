require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('./db');

async function resetDB() {
  try {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE ordonnances');
    await db.query('TRUNCATE TABLE constantes_vitales');
    await db.query('TRUNCATE TABLE antecedents');
    await db.query('TRUNCATE TABLE consultations');
    await db.query('TRUNCATE TABLE patients');
    await db.query('TRUNCATE TABLE utilisateurs');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // Recréer l'admin
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    await db.query(
      'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
      ['Admin', 'System', 'admin@hopital.bj', hash, 'admin']
    );

    console.log('✅ Base de données réinitialisée !');
    console.log('✅ Admin recréé — Email: toffa@admin.com / MDP: toffa');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
}

resetDB();