const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Middleware d'authentification
const verifyToken = authMiddleware;
const requireRole = (...roles) => (req, res, next) => {
  if (!req.utilisateur) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  if (!roles.includes(req.utilisateur.role)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
};

// Controllers
const authCtrl = require('../controllers/authController');
const patientCtrl = require('../controllers/patientController');
const dossierCtrl = require('../controllers/dossierController');
const uploadCtrl = require('../controllers/uploadController');
const adminCtrl = require('../controllers/adminController');
const serviceCtrl = require('../controllers/serviceController');

// ============================================================
// AUTH ROUTES
// ============================================================
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', verifyToken, authCtrl.getMe);
router.post('/auth/register', verifyToken, requireRole('Admin'), authCtrl.createUser);

// ============================================================
// PATIENT ROUTES
// ============================================================
router.get('/patients', verifyToken, patientCtrl.getAllPatients);
router.get('/patients/search', verifyToken, patientCtrl.searchByPiece);
router.post('/patients', verifyToken, requireRole('Accueil', 'Admin'), patientCtrl.createPatient);
router.get('/patients/:id', verifyToken, patientCtrl.getPatient);
router.put('/patients/:id', verifyToken, requireRole('Accueil', 'Admin'), patientCtrl.updatePatient);
router.get('/patients/:id/complet', verifyToken, patientCtrl.getDossierComplet);
router.patch('/patients/:id/statut', verifyToken, patientCtrl.updateStatut);

// ============================================================
// DOSSIERS MEDICAUX ROUTES
// ============================================================
router.post('/dossiers', verifyToken, dossierCtrl.ouvrirDossier);
router.get('/dossiers/:id', verifyToken, dossierCtrl.getDossier);
router.post('/dossiers/:id/cloturer', verifyToken, requireRole('Médecin', 'Admin'), dossierCtrl.cloturerDossier);

// Paramètres vitaux (Infirmier ou Médecin)
router.post('/vitaux', verifyToken, requireRole('Infirmier', 'Médecin', 'Admin'), dossierCtrl.saveVitaux);
router.get('/constantes/patient/:id', verifyToken, requireRole('Infirmier', 'Médecin', 'Admin'), patientCtrl.getConstantesByPatient);

// Enquête sociale (Infirmier)
router.post('/enquete-sociale', verifyToken, requireRole('Infirmier', 'Admin'), dossierCtrl.saveEnqueteSociale);

// Consultation médicale (Médecin)
router.post('/consultations', verifyToken, requireRole('Médecin', 'Admin'), dossierCtrl.saveConsultation);
router.get('/consultations/patient/:id', verifyToken, requireRole('Médecin', 'Admin'), patientCtrl.getConsultationsByPatient);

// Pansements (Infirmier)
router.post('/pansements', verifyToken, requireRole('Infirmier', 'Médecin', 'Admin'), dossierCtrl.savePansement);

// Prescriptions (Médecin ou Infirmier)
router.post('/prescriptions', verifyToken, requireRole('Médecin', 'Infirmier', 'Admin'), dossierCtrl.savePrescription);

// Antécédents
router.get('/antecedents/patient/:id', verifyToken, requireRole('Médecin', 'Infirmier', 'Admin'), patientCtrl.getAntecedentsByPatient);
router.post('/antecedents', verifyToken, requireRole('Médecin', 'Infirmier', 'Admin'), patientCtrl.createAntecedent);
router.delete('/antecedents/:id', verifyToken, requireRole('Médecin', 'Infirmier', 'Admin'), patientCtrl.deleteAntecedent);

// Liste diagnostics CIM-10
router.get('/diagnostics', verifyToken, dossierCtrl.getDiagnostics);

// ============================================================
// SERVICES EXTERNES ROUTES
// ============================================================
router.post('/services-externes', verifyToken, requireRole('Admin'), serviceCtrl.createService);
router.get('/services-externes', verifyToken, requireRole('Admin', 'Médecin', 'Infirmier'), serviceCtrl.getServices);
router.get('/services-externes/:id', verifyToken, requireRole('Admin', 'Médecin', 'Infirmier'), serviceCtrl.getService);
router.post('/services-externes/resultats',
  verifyToken,
  requireRole('Admin', 'Médecin', 'Infirmier'),
  uploadCtrl.upload.single('fichier'),
  serviceCtrl.createServiceResult
);
router.get('/patients/:id/services-resultats', verifyToken, serviceCtrl.getPatientServiceResults);

// ============================================================
// UPLOAD ROUTES
// ============================================================
router.post('/upload',
  verifyToken,
  requireRole('Infirmier', 'Médecin', 'Admin'),
  uploadCtrl.upload.single('file'),
  uploadCtrl.saveFileUpload
);
router.post('/imagerie',
  verifyToken,
  requireRole('Infirmier', 'Médecin', 'Admin'),
  uploadCtrl.upload.single('fichier'),
  uploadCtrl.saveImagerie
);

router.post('/analyses',
  verifyToken,
  requireRole('Infirmier', 'Médecin', 'Admin'),
  uploadCtrl.upload.single('fichier'),
  uploadCtrl.saveAnalyse
);

// ============================================================
// ADMIN ROUTES
// ============================================================
router.get('/admin/stats', verifyToken, requireRole('Admin'), adminCtrl.getStats);
router.get('/admin/utilisateurs', verifyToken, requireRole('Admin'), adminCtrl.getUtilisateurs);
router.post('/admin/utilisateurs', verifyToken, requireRole('Admin'), authCtrl.createUser);
router.patch('/admin/utilisateurs/:id', verifyToken, requireRole('Admin'), adminCtrl.updateUtilisateur);
router.delete('/admin/utilisateurs/:id', verifyToken, requireRole('Admin'), adminCtrl.deleteUtilisateur);
router.get('/admin/dossiers', verifyToken, requireRole('Admin', 'Médecin'), adminCtrl.getAllDossiers);

// UTILISATEURS ROUTES (frontend compatibility)
router.get('/utilisateurs', verifyToken, requireRole('Admin'), adminCtrl.getUtilisateurs);
router.post('/utilisateurs', verifyToken, requireRole('Admin'), authCtrl.createUser);
router.put('/utilisateurs/:id', verifyToken, requireRole('Admin'), adminCtrl.updateUtilisateur);
router.delete('/utilisateurs/:id', verifyToken, requireRole('Admin'), adminCtrl.deleteUtilisateur);

// HOPITAUX
router.get('/hopitaux', verifyToken, adminCtrl.getHopitaux);

module.exports = router;