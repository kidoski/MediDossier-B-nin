const db = require('../config/db');
const bcrypt = require('bcryptjs');

// LISTER tous les utilisateurs
exports.getUtilisateurs = async (req, res) => {
  try {
    const [utilisateurs] = await db.query(
      'SELECT id, nom, prenom, email, role, telephone, created_at FROM utilisateurs ORDER BY created_at DESC'
    );
    res.json(utilisateurs);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// AJOUTER un utilisateur
exports.ajouterUtilisateur = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role, telephone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    await db.query(
      `INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, telephone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, hashedPassword, role, telephone]
    );
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cet email existe déjà' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// MODIFIER un utilisateur (nom, prenom, mot de passe)
exports.modifierUtilisateur = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, mot_de_passe } = req.body;
  try {
    if (mot_de_passe && mot_de_passe.trim() !== '') {
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
      await db.query(
        'UPDATE utilisateurs SET nom = ?, prenom = ?, mot_de_passe = ? WHERE id = ?',
        [nom, prenom, hashedPassword, id]
      );
    } else {
      await db.query(
        'UPDATE utilisateurs SET nom = ?, prenom = ? WHERE id = ?',
        [nom, prenom, id]
      );
    }
    res.json({ message: 'Utilisateur modifié avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// SUPPRIMER un utilisateur
exports.supprimerUtilisateur = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM utilisateurs WHERE id = ?', [id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};