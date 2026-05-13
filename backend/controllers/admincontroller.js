const db = require('../config/db');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [[totalPatients]] = await db.execute('SELECT COUNT(*) as total FROM patients');
    const [[enAttente]] = await db.execute('SELECT COUNT(*) as total FROM patients WHERE statut = "En attente"');
    const [[enConsult]] = await db.execute('SELECT COUNT(*) as total FROM patients WHERE statut = "En consultation"');
    const [[hospitalises]] = await db.execute('SELECT COUNT(*) as total FROM patients WHERE statut = "Hospitalisé"');
    const [[totalDossiers]] = await db.execute('SELECT COUNT(*) as total FROM dossiers_medicaux');
    const [[dossiersClotures]] = await db.execute('SELECT COUNT(*) as total FROM dossiers_medicaux WHERE statut = "Clôturé"');

    const [parType] = await db.execute(
      'SELECT type_passage, COUNT(*) as total FROM dossiers_medicaux GROUP BY type_passage'
    );
    
    const [diagnosticsTop] = await db.execute(
      `SELECT dr.code, dr.libelle, COUNT(c.id) as count 
       FROM consultations c 
       JOIN diagnostics_references dr ON c.code_cim10 = dr.code 
       GROUP BY dr.code, dr.libelle 
       ORDER BY count DESC LIMIT 10`
    );

    // Dossiers par mois (6 derniers mois)
    const [parMois] = await db.execute(
      `SELECT DATE_FORMAT(date_ouverture, '%Y-%m') as mois, COUNT(*) as total 
       FROM dossiers_medicaux 
       WHERE date_ouverture >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY mois ORDER BY mois`
    );

    res.json({
      patients: {
        total: totalPatients.total,
        en_attente: enAttente.total,
        en_consultation: enConsult.total,
        hospitalises: hospitalises.total
      },
      dossiers: {
        total: totalDossiers.total,
        clotures: dossiersClotures.total,
        par_type: parType
      },
      diagnostics_top: diagnosticsTop,
      activite_mensuelle: parMois
    });
  } catch (err) {
    console.error('Erreur stats:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/admin/utilisateurs
const getUtilisateurs = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, nom, prenom, login, role, service, actif, date_creation FROM utilisateurs ORDER BY date_creation DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// PATCH /api/admin/utilisateurs/:id
const updateUtilisateur = async (req, res) => {
  const { nom, prenom, role, service, actif } = req.body;
  try {
    await db.execute(
      'UPDATE utilisateurs SET nom=?, prenom=?, role=?, service=?, actif=? WHERE id=?',
      [nom, prenom, role, service, actif, req.params.id]
    );
    res.json({ message: 'Utilisateur mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// DELETE /api/admin/utilisateurs/:id
const deleteUtilisateur = async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM utilisateurs WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    console.error('Erreur suppression utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/hopitaux
const getHopitaux = async (req, res) => {
  try {
    const hopitaux = [
      { id: 1, nom: 'CNHU Hubert Maga', ville: 'Cotonou' },
      { id: 2, nom: 'CHD', ville: 'Porto-Novo' },
      { id: 3, nom: 'Centre de Référence', ville: 'Parakou' }
    ];
    res.json(hopitaux);
  } catch (err) {
    console.error('Erreur hopitaux:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/admin/dossiers — Tous les dossiers avec info patient
const getAllDossiers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await db.execute(
      `SELECT dm.*, p.nom, p.prenom, p.numero_piece, p.statut as statut_patient
       FROM dossiers_medicaux dm
       JOIN patients p ON dm.patient_id = p.id
       ORDER BY dm.date_ouverture DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[count]] = await db.execute('SELECT COUNT(*) as total FROM dossiers_medicaux');
    res.json({ dossiers: rows, total: count.total, page, limit });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getStats, getUtilisateurs, updateUtilisateur, deleteUtilisateur, getHopitaux, getAllDossiers };