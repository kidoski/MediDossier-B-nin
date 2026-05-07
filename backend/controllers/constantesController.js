const db = require('../config/db');

// AJOUTER des constantes vitales
exports.ajouterConstantes = async (req, res) => {
  const { patient_id, tension, temperature, poids, pouls, saturation, observations } = req.body;
  const infirmier_id = req.utilisateur.id;
  try {
    await db.query(
      `INSERT INTO constantes_vitales (patient_id, infirmier_id, tension, temperature, poids, pouls, saturation, observations)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_id, infirmier_id, tension, temperature, poids, pouls, saturation, observations]
    );
    res.status(201).json({ message: 'Constantes vitales enregistrées avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// LISTER les constantes vitales d'un patient
exports.getConstantesPatient = async (req, res) => {
  const { patient_id } = req.params;
  try {
    const [constantes] = await db.query(
      `SELECT cv.*, 
        u.nom as infirmier_nom, u.prenom as infirmier_prenom
       FROM constantes_vitales cv
       JOIN utilisateurs u ON cv.infirmier_id = u.id
       WHERE cv.patient_id = ?
       ORDER BY cv.date_mesure DESC`,
      [patient_id]
    );
    res.json(constantes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};