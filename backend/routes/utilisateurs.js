const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getUtilisateurs,
  ajouterUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur
} = require('../controllers/utilisateurController');

router.get('/', auth, getUtilisateurs);
router.post('/', auth, ajouterUtilisateur);
router.put('/:id', auth, modifierUtilisateur);
router.delete('/:id', auth, supprimerUtilisateur);

module.exports = router;