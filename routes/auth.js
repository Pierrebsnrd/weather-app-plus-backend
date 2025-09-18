const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? 'Cet email est déjà utilisé'
          : 'Ce nom d\'utilisateur est déjà pris'
      });
    }

    // Créer le nouvel utilisateur
    const user = new User({ username, email, password });
    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(', ') });
    }

    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token
    const token = generateToken(user._id);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
});

// Vérifier le token
router.get('/verify', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

// Fusion des données locales avec le compte utilisateur
router.post('/merge-cities', auth, async (req, res) => {
  try {
    const { cities } = req.body;
    const user = req.user;

    if (!cities || !Array.isArray(cities)) {
      return res.status(400).json({ message: 'Données de villes invalides' });
    }

    let addedCount = 0;

    for (const cityData of cities) {
      const existingCity = user.cities.find(city =>
        city.lat === cityData.lat && city.lon === cityData.lon
      );

      if (!existingCity) {
        user.cities.push({
          name: cityData.name,
          country: cityData.country,
          lat: cityData.lat,
          lon: cityData.lon
        });
        addedCount++;
      }
    }

    if (addedCount > 0) {
      await user.save();
    }

    res.json({
      message: `${addedCount} ville(s) ajoutée(s) à vos favoris`,
      cities: user.cities
    });

  } catch (error) {
    console.error('Erreur fusion des données:', error);
    res.status(500).json({ message: 'Erreur lors de la fusion des données' });
  }
});

module.exports = router;