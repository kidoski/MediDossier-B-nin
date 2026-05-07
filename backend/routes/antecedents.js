const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  ajouterAntecedent,
  getAntecedentsPatient,
  supprimerAntecedent
} = require('../controllers/antecedentController');

router.post('/', auth, ajouterAntecedent);
router.get('/patient/:patient_id', auth, getAntecedentsPatient);
router.delete('/:id', auth, supprimerAntecedent);

module.exports = router;