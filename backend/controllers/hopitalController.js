const db = require('../config/db');

// LISTER tous les hôpitaux
exports.getHopitaux = async (req, res) => {
  try {
    const [hopitaux] = await db.query(
      'SELECT * FROM hopitaux ORDER BY nom'
    );
    res.json(hopitaux);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// AJOUTER un hôpital
exports.ajouterHopital = async (req, res) => {
  const { nom, ville, adresse, telephone } = req.body;
  try {
    await db.query(
      'INSERT INTO hopitaux (nom, ville, adresse, telephone) VALUES (?, ?, ?, ?)',
      [nom, ville, adresse, telephone]
    );
    res.status(201).json({ message: 'Hôpital ajouté avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// SUPPRIMER un hôpital
exports.supprimerHopital = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM hopitaux WHERE id = ?', [id]);
    res.json({ message: 'Hôpital supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};