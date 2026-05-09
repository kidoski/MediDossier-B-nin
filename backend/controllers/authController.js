const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, mot_de_passe } = req.body;
  try {
    const [rows] = await db.query(
      `SELECT u.*, h.nom as hopital_nom 
       FROM utilisateurs u
       LEFT JOIN hopitaux h ON u.hopital_id = h.id
       WHERE u.email = ?`,
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const utilisateur = rows[0];
    const validPassword = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role, hopital_id: utilisateur.hopital_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
        hopital_id: utilisateur.hopital_id,
        hopital_nom: utilisateur.hopital_nom
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};