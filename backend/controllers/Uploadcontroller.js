const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.dcm'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Type de fichier non autorisé.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/imagerie — Upload image médicale
const saveImagerie = async (req, res) => {
  const { dossier_id, type_image, region_anatomique, description, compte_rendu, radiologue } = req.body;
  
  try {
    await db.execute(
      `INSERT INTO imagerie_medicale 
       (dossier_id, type_image, region_anatomique, description, compte_rendu, 
        fichier_path, fichier_nom, radiologue, saisi_par)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [dossier_id, type_image, region_anatomique, description, compte_rendu,
       req.file ? req.file.filename : null,
       req.file ? req.file.originalname : null,
       radiologue, req.user.id]
    );
    res.status(201).json({ message: 'Image médicale enregistrée.' });
  } catch (err) {
    console.error('Erreur imagerie:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/analyses — Upload analyse biomédicale
const saveAnalyse = async (req, res) => {
  const { dossier_id, type_analyse, description, resultat, interpretation, laboratoire, technicien } = req.body;
  
  try {
    await db.execute(
      `INSERT INTO analyses_biomedicales 
       (dossier_id, type_analyse, description, resultat, interpretation,
        fichier_path, fichier_nom, laboratoire, technicien)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [dossier_id, type_analyse, description, resultat, interpretation,
       req.file ? req.file.filename : null,
       req.file ? req.file.originalname : null,
       laboratoire, technicien]
    );
    res.status(201).json({ message: 'Analyse enregistrée.' });
  } catch (err) {
    console.error('Erreur analyse:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/upload — upload générique de fichier
const saveFileUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Fichier requis.' });
  }

  res.status(201).json({
    message: 'Fichier téléchargé avec succès.',
    fichier: {
      path: `/uploads/${req.file.filename}`,
      originalname: req.file.originalname
    }
  });
};

module.exports = { upload, saveImagerie, saveAnalyse, saveFileUpload };