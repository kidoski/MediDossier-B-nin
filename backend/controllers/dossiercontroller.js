const db = require('../config/db');

// POST /api/dossiers — Ouvrir un nouveau dossier
const ouvrirDossier = async (req, res) => {
  const { patient_id, type_passage, motif_admission } = req.body;

  if (!patient_id || !type_passage) {
    return res.status(400).json({ message: 'patient_id et type_passage sont requis.' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO dossiers_medicaux (patient_id, type_passage, motif_admission, ouvert_par) VALUES (?,?,?,?)',
      [patient_id, type_passage, motif_admission, req.user.id]
    );

    // Mettre à jour le statut patient selon le type
    let statut = 'En consultation';
    if (type_passage === 'Admission') statut = 'Hospitalisé';
    await db.execute('UPDATE patients SET statut = ? WHERE id = ?', [statut, patient_id]);

    const [dossier] = await db.execute('SELECT * FROM dossiers_medicaux WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Dossier ouvert.', dossier: dossier[0] });
  } catch (err) {
    console.error('Erreur ouverture dossier:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/dossiers/:id — Détails d'un dossier
const getDossier = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM dossiers_medicaux WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Dossier non trouvé.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/dossiers/:id/cloturer — Clôturer un dossier (archive)
const cloturerDossier = async (req, res) => {
  const { id } = req.params;
  try {
    const [dossier] = await db.execute('SELECT * FROM dossiers_medicaux WHERE id = ?', [id]);
    if (dossier.length === 0) return res.status(404).json({ message: 'Dossier non trouvé.' });
    if (dossier[0].statut === 'Clôturé') {
      return res.status(400).json({ message: 'Dossier déjà clôturé.' });
    }

    await db.execute(
      'UPDATE dossiers_medicaux SET statut = "Clôturé", date_cloture = NOW(), clos_par = ?, archive = TRUE WHERE id = ?',
      [req.user.id, id]
    );

    // Remettre patient en statut Libre si plus de dossier ouvert
    const patientId = dossier[0].patient_id;
    const [ouverts] = await db.execute(
      'SELECT id FROM dossiers_medicaux WHERE patient_id = ? AND statut = "Ouvert"',
      [patientId]
    );
    if (ouverts.length === 0) {
      await db.execute('UPDATE patients SET statut = "Libre" WHERE id = ?', [patientId]);
    }

    res.json({ message: 'Dossier clôturé et archivé avec succès.' });
  } catch (err) {
    console.error('Erreur clôture:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ============================================================
// PARAMÈTRES VITAUX
// ============================================================
const saveVitaux = async (req, res) => {
  const { dossier_id, tension_systolique, tension_diastolique, pouls,
          frequence_respiratoire, sao2, temperature, douleur_score, poids, taille } = req.body;
  try {
    await db.execute(
      `INSERT INTO parametres_vitaux 
       (dossier_id, tension_systolique, tension_diastolique, pouls,
        frequence_respiratoire, sao2, temperature, douleur_score, poids, taille, saisi_par)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [dossier_id, tension_systolique, tension_diastolique, pouls,
       frequence_respiratoire, sao2, temperature, douleur_score, poids, taille, req.user.id]
    );
    res.status(201).json({ message: 'Paramètres vitaux enregistrés.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ============================================================
// ENQUÊTE SOCIALE
// ============================================================
const saveEnqueteSociale = async (req, res) => {
  const { dossier_id, prise_en_charge, nom_assurance, numero_assurance, alcool, tabagisme, autres_addictions, notes } = req.body;
  try {
    await db.execute(
      `INSERT INTO enquete_sociale 
       (dossier_id, prise_en_charge, nom_assurance, numero_assurance, alcool, tabagisme, autres_addictions, notes, saisi_par)
       VALUES (?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE prise_en_charge=VALUES(prise_en_charge), alcool=VALUES(alcool),
       tabagisme=VALUES(tabagisme), notes=VALUES(notes)`,
      [dossier_id, prise_en_charge, nom_assurance, numero_assurance, alcool, tabagisme, autres_addictions, notes, req.user.id]
    );
    res.status(201).json({ message: 'Enquête sociale enregistrée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ============================================================
// CONSULTATION MÉDICALE
// ============================================================
const saveConsultation = async (req, res) => {
  const {
    dossier_id, symptomes, dialogue_patient, ressenti_patient, medicaments_deja_pris,
    antecedents_medicaux, antecedents_chirurgicaux, antecedents_familiaux, histoire_maladie,
    etat_general, examen_neurologique, glasgow_score, pupilles, motricite,
    examen_locomoteur, examen_thorax, examen_abdomen, examen_urologique, autres_examens,
    resume_syndromique, hypotheses_diagnostiques, diagnostic_retenu, code_cim10,
    traitement_preventif, traitement_curatif, traitement_chirurgical,
    surveillance, evolution, conclusion
  } = req.body;

  try {
    const [existing] = await db.execute('SELECT id FROM consultations WHERE dossier_id = ?', [dossier_id]);

    if (existing.length > 0) {
      // Update
      await db.execute(
        `UPDATE consultations SET
         symptomes=?, dialogue_patient=?, ressenti_patient=?, medicaments_deja_pris=?,
         antecedents_medicaux=?, antecedents_chirurgicaux=?, antecedents_familiaux=?, histoire_maladie=?,
         etat_general=?, examen_neurologique=?, glasgow_score=?, pupilles=?, motricite=?,
         examen_locomoteur=?, examen_thorax=?, examen_abdomen=?, examen_urologique=?, autres_examens=?,
         resume_syndromique=?, hypotheses_diagnostiques=?, diagnostic_retenu=?, code_cim10=?,
         traitement_preventif=?, traitement_curatif=?, traitement_chirurgical=?,
         surveillance=?, evolution=?, conclusion=?, medecin_id=?
         WHERE dossier_id=?`,
        [symptomes, dialogue_patient, ressenti_patient, medicaments_deja_pris,
         antecedents_medicaux, antecedents_chirurgicaux, antecedents_familiaux, histoire_maladie,
         etat_general, examen_neurologique, glasgow_score, pupilles, motricite,
         examen_locomoteur, examen_thorax, examen_abdomen, examen_urologique, autres_examens,
         resume_syndromique, hypotheses_diagnostiques, diagnostic_retenu, code_cim10,
         traitement_preventif, traitement_curatif, traitement_chirurgical,
         surveillance, evolution, conclusion, req.user.id, dossier_id]
      );
    } else {
      // Insert
      await db.execute(
        `INSERT INTO consultations 
         (dossier_id, symptomes, dialogue_patient, ressenti_patient, medicaments_deja_pris,
          antecedents_medicaux, antecedents_chirurgicaux, antecedents_familiaux, histoire_maladie,
          etat_general, examen_neurologique, glasgow_score, pupilles, motricite,
          examen_locomoteur, examen_thorax, examen_abdomen, examen_urologique, autres_examens,
          resume_syndromique, hypotheses_diagnostiques, diagnostic_retenu, code_cim10,
          traitement_preventif, traitement_curatif, traitement_chirurgical,
          surveillance, evolution, conclusion, medecin_id)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [dossier_id, symptomes, dialogue_patient, ressenti_patient, medicaments_deja_pris,
         antecedents_medicaux, antecedents_chirurgicaux, antecedents_familiaux, histoire_maladie,
         etat_general, examen_neurologique, glasgow_score, pupilles, motricite,
         examen_locomoteur, examen_thorax, examen_abdomen, examen_urologique, autres_examens,
         resume_syndromique, hypotheses_diagnostiques, diagnostic_retenu, code_cim10,
         traitement_preventif, traitement_curatif, traitement_chirurgical,
         surveillance, evolution, conclusion, req.user.id]
      );

      // Incrémenter fréquence du diagnostic
      if (code_cim10) {
        await db.execute(
          'UPDATE diagnostics_references SET frequence_utilisation = frequence_utilisation + 1 WHERE code = ?',
          [code_cim10]
        );
      }
    }

    res.status(201).json({ message: 'Consultation enregistrée.' });
  } catch (err) {
    console.error('Erreur consultation:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ============================================================
// PANSEMENTS
// ============================================================
const savePansement = async (req, res) => {
  const { dossier_id, type_plaie, localisation, description, materiel_utilise, technique, observation, ordonnance, prochain_rdv } = req.body;
  try {
    await db.execute(
      `INSERT INTO pansements (dossier_id, type_plaie, localisation, description, materiel_utilise, technique, observation, ordonnance, prochain_rdv, infirmier_id)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [dossier_id, type_plaie, localisation, description, materiel_utilise, technique, observation, ordonnance, prochain_rdv, req.user.id]
    );
    res.status(201).json({ message: 'Pansement enregistré.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ============================================================
// PRESCRIPTIONS
// ============================================================
const savePrescription = async (req, res) => {
  const { dossier_id, medicaments, posologie, duree_traitement, instructions_speciales, renouvellement } = req.body;
  try {
    await db.execute(
      `INSERT INTO prescriptions (dossier_id, medicaments, posologie, duree_traitement, instructions_speciales, renouvellement, prescripteur_id)
       VALUES (?,?,?,?,?,?,?)`,
      [dossier_id, JSON.stringify(medicaments), posologie, duree_traitement, instructions_speciales, renouvellement, req.user.id]
    );
    res.status(201).json({ message: 'Prescription enregistrée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// ============================================================
// DIAGNOSTICS RÉFÉRENCES (liste CIM-10)
// ============================================================
const getDiagnostics = async (req, res) => {
  const { q } = req.query;
  try {
    let query = 'SELECT * FROM diagnostics_references';
    let params = [];
    if (q) {
      query += ' WHERE libelle LIKE ? OR code LIKE ?';
      params = [`%${q}%`, `%${q}%`];
    }
    query += ' ORDER BY frequence_utilisation DESC LIMIT 50';
    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  ouvrirDossier, getDossier, cloturerDossier,
  saveVitaux, saveEnqueteSociale, saveConsultation,
  savePansement, savePrescription, getDiagnostics
};