const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Obtenir les villes favorites de l'utilisateur
router.get('/', auth, async (req, res) => {
  try {
    res.json({ cities: req.user.cities });
  } catch (error) {
    console.error('Erreur récupération villes:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des villes' });
  }
});

// Ajouter une ville aux favoris
router.post('/', auth, async (req, res) => {
  try {
    const { name, country, lat, lon } = req.body;

    if (!name || !country || lat === undefined || lon === undefined) {
      return res.status(400).json({ message: 'Données de ville incomplètes' });
    }

    // Vérifier si la ville existe déjà
    const existingCity = req.user.cities.find(city =>
      city.lat === lat && city.lon === lon
    );

    if (existingCity) {
      return res.status(400).json({ message: 'Cette ville est déjà dans vos favoris' });
    }

    // Ajouter la ville
    req.user.cities.push({ name, country, lat, lon });
    await req.user.save();

    res.status(201).json({
      message: 'Ville ajoutée aux favoris',
      cities: req.user.cities
    });

  } catch (error) {
    console.error('Erreur ajout ville:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la ville' });
  }
});

// Supprimer une ville des favoris
router.delete('/:cityId', auth, async (req, res) => {
  try {
    const { cityId } = req.params;

    // Trouver et supprimer la ville
    const cityIndex = req.user.cities.findIndex(
      city => city._id.toString() === cityId
    );

    if (cityIndex === -1) {
      return res.status(404).json({ message: 'Ville non trouvée' });
    }

    req.user.cities.splice(cityIndex, 1);
    await req.user.save();

    res.json({
      message: 'Ville supprimée des favoris',
      cities: req.user.cities
    });

  } catch (error) {
    console.error('Erreur suppression ville:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la ville' });
  }
});

module.exports = router;