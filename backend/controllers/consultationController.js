const db = require('../config/db');

// CRÉER une consultation
exports.creerConsultation = async (req, res) => {
  const { patient_id, motif, diagnostic, traitement, observations } = req.body;
  const medecin_id = req.utilisateur.id;

  try {
    const [result] = await db.query(
      `INSERT INTO consultations (patient_id, medecin_id, motif, diagnostic, traitement, observations)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [patient_id, medecin_id, motif, diagnostic, traitement, observations]
    );
    res.status(201).json({ message: 'Consultation créée avec succès', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// LISTER les consultations d'un patient
exports.getConsultationsPatient = async (req, res) => {
  const { patient_id } = req.params;
  try {
    const [consultations] = await db.query(
      `SELECT c.*, 
        u.nom as medecin_nom, u.prenom as medecin_prenom,
        p.nom as patient_nom, p.prenom as patient_prenom, p.NUD
       FROM consultations c
       JOIN utilisateurs u ON c.medecin_id = u.id
       JOIN patients p ON c.patient_id = p.id
       WHERE c.patient_id = ?
       ORDER BY c.date_consultation DESC`,
      [patient_id]
    );
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// VOIR une consultation avec ses ordonnances
exports.getConsultation = async (req, res) => {
  const { id } = req.params;
  try {
    const [consultations] = await db.query(
      `SELECT c.*, 
        u.nom as medecin_nom, u.prenom as medecin_prenom,
        p.nom as patient_nom, p.prenom as patient_prenom, p.NUD
       FROM consultations c
       JOIN utilisateurs u ON c.medecin_id = u.id
       JOIN patients p ON c.patient_id = p.id
       WHERE c.id = ?`,
      [id]
    );

    if (consultations.length === 0) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }

    const [ordonnances] = await db.query(
      'SELECT * FROM ordonnances WHERE consultation_id = ?', [id]
    );

    res.json({ ...consultations[0], ordonnances });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// AJOUTER une ordonnance
exports.ajouterOrdonnance = async (req, res) => {
  const { consultation_id, medicament, dosage, duree, instructions } = req.body;
  try {
    await db.query(
      `INSERT INTO ordonnances (consultation_id, medicament, dosage, duree, instructions)
       VALUES (?, ?, ?, ?, ?)`,
      [consultation_id, medicament, dosage, duree, instructions]
    );
    res.status(201).json({ message: 'Ordonnance ajoutée avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};