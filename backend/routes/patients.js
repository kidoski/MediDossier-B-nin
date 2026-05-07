const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getPatients,
  ajouterPatient,
  rechercherPatient,
  getPatient
} = require('../controllers/patientController');

router.get('/', auth, getPatients);
router.post('/', auth, ajouterPatient);
router.get('/recherche', auth, rechercherPatient);
router.get('/:id', auth, getPatient);

module.exports = router;