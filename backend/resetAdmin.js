// resetAdmin.js — Réinitialise le compte administrateur
// Usage : node resetAdmin.js

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAdmin() {
  let conn;
  try {
    console.log('🔌 Connexion à la base de données...');
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Connecté !');

    // Vérifier les utilisateurs existants
    const [users] = await conn.execute('SELECT id, nom, email, login, role FROM utilisateurs');
    console.log('\n📋 Utilisateurs actuels :');
    console.table(users);

    // Hasher le nouveau mot de passe
    const hash = await bcrypt.hash('admin', 10);

    // Mettre à jour l'admin
    const [result] = await conn.execute(
      `UPDATE utilisateurs 
       SET email = ?, login = ?, mot_de_passe = ? 
       WHERE id = 1 OR role = 'Admin'`,
      ['admin@gmail.com', 'admin@gmail.com', hash]
    );

    if (result.affectedRows === 0) {
      // Admin n'existe pas, on le crée
      console.log('\n⚠️  Aucun admin trouvé, création en cours...');
      await conn.execute(
        `INSERT INTO utilisateurs (nom, prenom, login, email, mot_de_passe, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['Administrateur', 'Système', 'admin@gmail.com', 'admin@gmail.com', hash, 'Admin']
      );
      console.log('✅ Admin créé !');
    } else {
      console.log(`\n✅ Admin mis à jour (${result.affectedRows} ligne(s) modifiée(s))`);
    }

    // Vérification finale
    const [check] = await conn.execute(
      'SELECT id, nom, email, login, role FROM utilisateurs WHERE email = ?',
      ['admin@gmail.com']
    );
    console.log('\n✅ Vérification :');
    console.table(check);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Identifiants de connexion :');
    console.log('   Email    : admin@gmail.com');
    console.log('   Password : admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ ERREUR :', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

resetAdmin(); 