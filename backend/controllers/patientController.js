const db = require('../config/db');

// Générer un NUD unique
const genererNUD = async () => {
  const annee = new Date().getFullYear();
  const [rows] = await db.query(
    'SELECT COUNT(*) as total FROM patients'
  );
  const numero = String(rows[0].total + 1).padStart(4, '0');
  return `NUD-${annee}-${numero}`;
};

// LISTER tous les patients
exports.getPatients = async (req, res) => {
  try {
    const [patients] = await db.query(
      'SELECT * FROM patients ORDER BY created_at DESC'
    );
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// AJOUTER un patient
exports.ajouterPatient = async (req, res) => {
  const { nom, prenom, date_naissance, sexe, telephone, adresse, groupe_sanguin } = req.body;

  try {
    const NUD = await genererNUD();
    await db.query(
      `INSERT INTO patients (NUD, nom, prenom, date_naissance, sexe, telephone, adresse, groupe_sanguin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [NUD, nom, prenom, date_naissance, sexe, telephone, adresse, groupe_sanguin]
    );
    res.status(201).json({ message: 'Patient ajouté avec succès', NUD });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// RECHERCHER un patient par NUD ou nom
exports.rechercherPatient = async (req, res) => {
  const { q } = req.query;
  try {
    const [patients] = await db.query(
      `SELECT * FROM patients 
       WHERE NUD LIKE ? OR nom LIKE ? OR prenom LIKE ?`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// VOIR un patient par ID
exports.getPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const [patients] = await db.query(
      'SELECT * FROM patients WHERE id = ?', [id]
    );
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    res.json(patients[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};