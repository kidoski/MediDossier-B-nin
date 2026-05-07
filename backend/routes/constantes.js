const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  ajouterConstantes,
  getConstantesPatient
} = require('../controllers/constantesController');

router.post('/', auth, ajouterConstantes);
router.get('/patient/:patient_id', auth, getConstantesPatient);

module.exports = router;