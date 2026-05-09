require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('./db');

async function updateDB() {
  try {
    // Créer la table hopitaux d'abord
    await db.query(`
      CREATE TABLE IF NOT EXISTS hopitaux (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(200) NOT NULL,
        ville VARCHAR(100) NOT NULL,
        adresse TEXT,
        telephone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table hopitaux créée !');

    // Insérer les hôpitaux
    await db.query(`
      INSERT IGNORE INTO hopitaux (nom, ville, adresse, telephone) VALUES
      ('CHU Hubert Koutoukou Maga', 'Cotonou', 'Boulevard Saint Michel, Cotonou', '21-30-01-55'),
      ('Hôpital de Zone de Calavi', 'Abomey-Calavi', 'Abomey-Calavi', '21-36-00-12'),
      ('Centre Hospitalier Départemental Borgou', 'Parakou', 'Parakou', '23-61-08-45'),
      ('Hôpital de Zone de Ouidah', 'Ouidah', 'Ouidah', '21-34-10-22')
    `);
    console.log('✅ Hôpitaux insérés !');

    // Ajouter hopital_id dans utilisateurs
    await db.query(`ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS hopital_id INT`)
      .catch(() => console.log('hopital_id déjà dans utilisateurs'));

    // Ajouter hopital_id dans consultations
    await db.query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS hopital_id INT`)
      .catch(() => console.log('hopital_id déjà dans consultations'));

    // Ajouter hopital_id dans constantes_vitales
    await db.query(`ALTER TABLE constantes_vitales ADD COLUMN IF NOT EXISTS hopital_id INT`)
      .catch(() => console.log('hopital_id déjà dans constantes_vitales'));

    // Ajouter hopital_id dans antecedents
    await db.query(`ALTER TABLE antecedents ADD COLUMN IF NOT EXISTS hopital_id INT`)
      .catch(() => console.log('hopital_id déjà dans antecedents'));

    console.log('✅ Base de données mise à jour avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message);
    process.exit(1);
  }
}

updateDB();