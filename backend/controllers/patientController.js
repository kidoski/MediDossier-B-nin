const db = require('../config/db');

// GET /api/patients/search?numero_piece=xxx or /api/patients/search?q=xxx
const searchByPiece = async (req, res) => {
  const numero_piece = req.query.numero_piece || req.query.q;
  if (!numero_piece) return res.status(400).json({ message: 'Numéro de pièce requis.' });

  try {
    const [rows] = await db.execute(
      'SELECT * FROM patients WHERE numero_piece = ?',
      [numero_piece.trim()]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé.', found: false });
    }
    res.json({ found: true, patient: rows[0] });
  } catch (err) {
    console.error('Erreur recherche patient:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/patients
const createPatient = async (req, res) => {
  const {
    type_piece, numero_piece, nom, prenom, date_naissance, lieu_naissance,
    sexe, profession, situation_matrimoniale, religion,
    ville, arrondissement, quartier, carre,
    telephone, contact_urgence_nom, contact_urgence_telephone
  } = req.body;

  if (!type_piece || !numero_piece || !nom || !prenom || !date_naissance || !sexe) {
    return res.status(400).json({ message: 'Champs obligatoires manquants.' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM patients WHERE numero_piece = ?', [numero_piece]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Un patient avec ce numéro de pièce existe déjà.' });
    }

    const [result] = await db.execute(
      `INSERT INTO patients 
       (type_piece, numero_piece, nom, prenom, date_naissance, lieu_naissance,
        sexe, profession, situation_matrimoniale, religion,
        ville, arrondissement, quartier, carre,
        telephone, contact_urgence_nom, contact_urgence_telephone, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [type_piece, numero_piece.trim(), nom, prenom, date_naissance, lieu_naissance,
       sexe, profession, situation_matrimoniale, religion,
       ville, arrondissement, quartier, carre,
       telephone, contact_urgence_nom, contact_urgence_telephone, req.user.id]
    );

    const [newPatient] = await db.execute('SELECT * FROM patients WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Patient créé avec succès.', patient: newPatient[0] });
  } catch (err) {
    console.error('Erreur création patient:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/patients/:id
const getPatient = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Patient non trouvé.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PUT /api/patients/:id
const updatePatient = async (req, res) => {
  const {
    telephone, contact_urgence_nom, contact_urgence_telephone,
    ville, arrondissement, quartier, carre, profession,
    situation_matrimoniale, religion
  } = req.body;

  try {
    await db.execute(
      `UPDATE patients SET 
       telephone=?, contact_urgence_nom=?, contact_urgence_telephone=?,
       ville=?, arrondissement=?, quartier=?, carre=?,
       profession=?, situation_matrimoniale=?, religion=?
       WHERE id=?`,
      [telephone, contact_urgence_nom, contact_urgence_telephone,
       ville, arrondissement, quartier, carre,
       profession, situation_matrimoniale, religion, req.params.id]
    );
    res.json({ message: 'Patient mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/patients/:id/complet — Dossier unifié complet
const getDossierComplet = async (req, res) => {
  const patientId = req.params.id;
  try {
    // Patient
    const [patients] = await db.execute('SELECT * FROM patients WHERE id = ?', [patientId]);
    if (patients.length === 0) return res.status(404).json({ message: 'Patient non trouvé.' });

    // Dossiers médicaux
    const [dossiers] = await db.execute(
      'SELECT * FROM dossiers_medicaux WHERE patient_id = ? ORDER BY date_ouverture DESC',
      [patientId]
    );

    // Pour chaque dossier, récupérer toutes les données associées
    for (let dossier of dossiers) {
      const id = dossier.id;

      const [[vitaux]] = await db.execute('SELECT * FROM parametres_vitaux WHERE dossier_id = ? ORDER BY date_saisie DESC LIMIT 1', [id]);
      dossier.vitaux = vitaux || null;

      const [enquete] = await db.execute('SELECT * FROM enquete_sociale WHERE dossier_id = ?', [id]);
      dossier.enquete_sociale = enquete[0] || null;

      const [consultations] = await db.execute('SELECT * FROM consultations WHERE dossier_id = ?', [id]);
      dossier.consultation = consultations[0] || null;

      const [urgences] = await db.execute('SELECT * FROM urgences WHERE dossier_id = ?', [id]);
      dossier.urgence = urgences[0] || null;

      const [admissions] = await db.execute('SELECT * FROM admissions WHERE dossier_id = ?', [id]);
      dossier.admission = admissions[0] || null;

      const [pansements] = await db.execute('SELECT * FROM pansements WHERE dossier_id = ? ORDER BY date_soin DESC', [id]);
      dossier.pansements = pansements;

      const [analyses] = await db.execute('SELECT * FROM analyses_biomedicales WHERE dossier_id = ? ORDER BY date_resultat DESC', [id]);
      dossier.analyses = analyses;

      const [imagerie] = await db.execute('SELECT * FROM imagerie_medicale WHERE dossier_id = ? ORDER BY date_examen DESC', [id]);
      dossier.imagerie = imagerie;

      const [prescriptions] = await db.execute('SELECT * FROM prescriptions WHERE dossier_id = ? ORDER BY date_prescription DESC', [id]);
      dossier.prescriptions = prescriptions;
    }

    const [serviceResults] = await db.execute(
      `SELECT ser.*, se.nom AS service_nom, se.type AS service_type
       FROM services_externes_resultats ser
       LEFT JOIN services_externes se ON ser.service_id = se.id
       WHERE ser.patient_id = ?
       ORDER BY ser.date_envoi DESC`,
      [patientId]
    );

    res.json({ patient: patients[0], dossiers, service_results: serviceResults });
  } catch (err) {
    console.error('Erreur dossier complet:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/patients — Liste tous les patients (avec pagination)
const getAllPatients = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let query = 'SELECT * FROM patients';
    let countQuery = 'SELECT COUNT(*) as total FROM patients';
    let params = [];

    if (search) {
      query += ' WHERE nom LIKE ? OR prenom LIKE ? OR numero_piece LIKE ?';
      countQuery += ' WHERE nom LIKE ? OR prenom LIKE ? OR numero_piece LIKE ?';
      const s = `%${search}%`;
      params = [s, s, s];
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [patients] = await db.execute(query, [...params, limit, offset]);
    const [count] = await db.execute(countQuery, params);

    res.json({ patients, total: count[0].total, page, limit });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/consultations/patient/:id
const getConsultationsByPatient = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*, dm.patient_id, u.nom AS medecin_nom, u.prenom AS medecin_prenom
       FROM consultations c
       JOIN dossiers_medicaux dm ON c.dossier_id = dm.id
       LEFT JOIN utilisateurs u ON c.medecin_id = u.id
       WHERE dm.patient_id = ?
       ORDER BY c.date_consultation DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération consultations:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/constantes/patient/:id
const getConstantesByPatient = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT pv.*, dm.patient_id, u.nom AS infirmier_nom, u.prenom AS infirmier_prenom
       FROM parametres_vitaux pv
       JOIN dossiers_medicaux dm ON pv.dossier_id = dm.id
       LEFT JOIN utilisateurs u ON pv.saisi_par = u.id
       WHERE dm.patient_id = ?
       ORDER BY pv.date_saisie DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération constantes:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/antecedents/patient/:id
const getAntecedentsByPatient = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM antecedents WHERE patient_id = ? ORDER BY date_signalement DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération antécédents:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/antecedents
const createAntecedent = async (req, res) => {
  const { patient_id, type, description, date_signalement } = req.body;
  if (!patient_id || !type || !description) {
    return res.status(400).json({ message: 'patient_id, type et description sont requis.' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO antecedents (patient_id, type, description, date_signalement, cree_par)
       VALUES (?,?,?,?,?)`,
      [patient_id, type, description, date_signalement || null, req.user.id]
    );
    const [rows] = await db.execute('SELECT * FROM antecedents WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Antécédent ajouté.', antecedent: rows[0] });
  } catch (err) {
    console.error('Erreur création antécédent:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/antecedents/:id
const deleteAntecedent = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM antecedents WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Antécédent introuvable.' });
    }
    res.json({ message: 'Antécédent supprimé.' });
  } catch (err) {
    console.error('Erreur suppression antécédent:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PATCH /api/patients/:id/statut
const updateStatut = async (req, res) => {
  const { statut } = req.body;
  const validStatuts = ['En attente', 'En consultation', 'Hospitalisé', 'Libre'];
  if (!validStatuts.includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide.' });
  }
  try {
    await db.execute('UPDATE patients SET statut = ? WHERE id = ?', [statut, req.params.id]);
    res.json({ message: 'Statut mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { 
  searchByPiece, createPatient, getPatient, updatePatient, 
  getDossierComplet, getAllPatients, updateStatut,
  getConsultationsByPatient, getConstantesByPatient,
  getAntecedentsByPatient, createAntecedent, deleteAntecedent
};