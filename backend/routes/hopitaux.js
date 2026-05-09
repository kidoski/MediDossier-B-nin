const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getHopitaux,
  ajouterHopital,
  supprimerHopital
} = require('../controllers/hopitalController');

router.get('/', getHopitaux);
router.post('/', auth, ajouterHopital);
router.delete('/:id', auth, supprimerHopital);

module.exports = router;