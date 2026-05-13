const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

// POST /api/auth/login
const login = async (req, res) => {
  const { email, login, mot_de_passe } = req.body;
  const identifier = email || login;

  if (!identifier || !mot_de_passe) {
    return res.status(400).json({ message: 'Login / email et mot de passe requis.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM utilisateurs WHERE email = ? OR login = ?',
      [email || '', login || '']
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!isValid) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        nom: user.nom,
        prenom: user.prenom
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        login: user.login,
        email: user.email,
        role: user.role,
        service: user.service
      }
    });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// POST /api/auth/register (Admin seulement)
const createUser = async (req, res) => {
  const { nom, prenom, login, email, mot_de_passe, role, service } = req.body;

  if (!nom || !prenom || !login || !mot_de_passe || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM utilisateurs WHERE login = ? OR email = ?', [login, email || null]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Ce login ou email existe déjà.' });
    }

    const hash = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await db.execute(
      'INSERT INTO utilisateurs (nom, prenom, login, email, mot_de_passe, role, service) VALUES (?,?,?,?,?,?,?)',
      [nom, prenom, login, email || null, hash, role, service || null]
    );

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès.', 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Erreur création utilisateur:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, nom, prenom, login, email, role, service FROM utilisateurs WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { login, createUser, getMe };