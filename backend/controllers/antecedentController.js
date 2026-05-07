const db = require('../config/db');

// AJOUTER un antécédent
exports.ajouterAntecedent = async (req, res) => {
  const { patient_id, type, description, date_signalement } = req.body;
  try {
    await db.query(
      `INSERT INTO antecedents (patient_id, type, description, date_signalement)
       VALUES (?, ?, ?, ?)`,
      [patient_id, type, description, date_signalement]
    );
    res.status(201).json({ message: 'Antécédent ajouté avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// LISTER les antécédents d'un patient
exports.getAntecedentsPatient = async (req, res) => {
  const { patient_id } = req.params;
  try {
    const [antecedents] = await db.query(
      `SELECT * FROM antecedents 
       WHERE patient_id = ? 
       ORDER BY date_signalement DESC`,
      [patient_id]
    );
    res.json(antecedents);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// SUPPRIMER un antécédent
exports.supprimerAntecedent = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM antecedents WHERE id = ?', [id]);
    res.json({ message: 'Antécédent supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};