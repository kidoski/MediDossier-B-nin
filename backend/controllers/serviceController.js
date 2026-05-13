const db = require('../config/db');

// POST /api/services-externes
const createService = async (req, res) => {
  const { nom, type, url, description, actif } = req.body;
  if (!nom || !type) {
    return res.status(400).json({ message: 'Nom et type de service sont requis.' });
  }
  try {
    const [result] = await db.execute(
      'INSERT INTO services_externes (nom, type, url, description, actif) VALUES (?,?,?,?,?)',
      [nom, type, url || null, description || null, actif ? 1 : 0]
    );
    const [service] = await db.execute('SELECT * FROM services_externes WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Service externe créé.', service: service[0] });
  } catch (err) {
    console.error('Erreur création service externe:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/services-externes
const getServices = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services_externes ORDER BY nom');
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération services externes:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/services-externes/:id
const getService = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM services_externes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Service non trouvé.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Erreur récupération service:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/services-externes/resultats
const createServiceResult = async (req, res) => {
  const { patient_id, dossier_id, service_id, type_resultat, titre, description, data } = req.body;
  if (!patient_id || !service_id || !type_resultat) {
    return res.status(400).json({ message: 'patient_id, service_id et type_resultat sont requis.' });
  }

  try {
    await db.execute(
      `INSERT INTO services_externes_resultats
       (patient_id, dossier_id, service_id, type_resultat, titre, description, fichier_path, fichier_nom, data, envoye_par)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        patient_id,
        dossier_id || null,
        service_id,
        type_resultat,
        titre || null,
        description || null,
        req.file ? req.file.filename : null,
        req.file ? req.file.originalname : null,
        data ? JSON.stringify(data) : null,
        req.user.id
      ]
    );

    res.status(201).json({ message: 'Résultat de service externe enregistré.' });
  } catch (err) {
    console.error('Erreur enregistrement résultat service externe:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/patients/:id/services-resultats
const getPatientServiceResults = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT ser.*, se.nom AS service_nom, se.type AS service_type, u.nom AS auteur_nom, u.prenom AS auteur_prenom
       FROM services_externes_resultats ser
       JOIN services_externes se ON ser.service_id = se.id
       LEFT JOIN utilisateurs u ON ser.envoye_par = u.id
       WHERE ser.patient_id = ?
       ORDER BY ser.date_envoi DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erreur récupération résultats de service externe:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  createService,
  getServices,
  getService,
  createServiceResult,
  getPatientServiceResults
};
