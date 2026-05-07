const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  creerConsultation,
  getConsultationsPatient,
  getConsultation,
  ajouterOrdonnance
} = require('../controllers/consultationController');

router.post('/', auth, creerConsultation);
router.get('/patient/:patient_id', auth, getConsultationsPatient);
router.get('/:id', auth, getConsultation);
router.post('/ordonnance', auth, ajouterOrdonnance);

module.exports = router;