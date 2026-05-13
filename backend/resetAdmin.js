// resetAdmin.js — À placer dans backend/
// Appelé au démarrage du serveur pour configurer l'admin

const bcrypt = require('bcryptjs');

async function resetAdmin(db) {
  try {
    const hash = await bcrypt.hash('admin', 10);

    // Vérifier si admin@gmail.com existe déjà
    const [existing] = await db.execute(
      'SELECT id FROM utilisateurs WHERE email = ?',
      ['admin@gmail.com']
    );

    if (existing.length > 0) {
      console.log('✅ Admin admin@gmail.com déjà configuré.');
      return;
    }

    // Mettre à jour l'admin existant
    const [result] = await db.execute(
      `UPDATE utilisateurs SET email = ?, login = ?, mot_de_passe = ? WHERE role = 'Admin'`,
      ['admin@gmail.com', 'admin@gmail.com', hash]
    );

    if (result.affectedRows === 0) {
      await db.execute(
        `INSERT INTO utilisateurs (nom, prenom, login, email, mot_de_passe, role) VALUES (?,?,?,?,?,?)`,
        ['Administrateur', 'Système', 'admin@gmail.com', 'admin@gmail.com', hash, 'Admin']
      );
      console.log('✅ Admin créé : admin@gmail.com / admin');
    } else {
      console.log('✅ Admin mis à jour : admin@gmail.com / admin');
    }

  } catch (err) {
    console.error('❌ Erreur resetAdmin:', err.message);
  }
}

module.exports = resetAdmin;