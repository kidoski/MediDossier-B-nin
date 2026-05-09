const db = require('../config/db');

const genererNUD = async () => {
  const annee = new Date().getFullYear();
  const [rows] = await db.query('SELECT COUNT(*) as total FROM patients');
  const numero = String(rows[0].total + 1).padStart(4, '0');
  return `NUD-${annee}-${numero}`;
};

exports.getPatients = async (req, res) => {
  const hopital_id = req.utilisateur.hopital_id;
  try {
    let patients;
    if (!hopital_id) {
      const [rows] = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
      patients = rows;
    } else {
      const [rows] = await db.query(
        `SELECT DISTINCT p.* FROM patients p
         WHERE p.id IN (
           SELECT patient_id FROM consultations WHERE hopital_id = ?
           UNION
           SELECT patient_id FROM constantes_vitales WHERE hopital_id = ?
         )
         ORDER BY p.created_at DESC`,
        [hopital_id, hopital_id]
      );
      patients = rows;
    }
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

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

exports.rechercherPatient = async (req, res) => {
  const { q } = req.query;
  try {
    const [patients] = await db.query(
      `SELECT * FROM patients WHERE NUD LIKE ? OR nom LIKE ? OR prenom LIKE ?`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

exports.getPatient = async (req, res) => {
  const { id } = req.params;
  try {
    const [patients] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);
    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient non trouvé' });
    }
    res.json(patients[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};