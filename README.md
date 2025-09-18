# WeatherApp+ Backend 🔧

API REST moderne et sécurisée pour WeatherApp+, développée avec Node.js, Express et MongoDB.

## ✨ Fonctionnalités

### 🔐 Authentification sécurisée
- **Inscription/Connexion** : Système complet avec JWT
- **Hachage de mots de passe** : Sécurisation avec bcryptjs
- **Middleware d'authentification** : Protection des routes privées
- **Fusion des données** : Migration localStorage vers compte utilisateur

### 🌍 Intégration météo
- **API OpenWeatherMap** : Données météo temps réel
- **Géocodage** : Recherche de villes par nom
- **Météo actuelle** : Température, humidité, vent, pression
- **Gestion d'erreurs** : Fallback et retry automatique

### 📊 Gestion des données
- **MongoDB Atlas** : Base de données cloud
- **Modèles Mongoose** : Schémas structurés et validés
- **CRUD complet** : Opérations sur les villes favorites
- **Gestion des utilisateurs** : Profils et préférences

### 🛡️ Sécurité et performance
- **CORS configuré** : Accès contrôlé depuis le frontend
- **Variables d'environnement** : Configuration sécurisée
- **Validation des données** : Contrôles d'intégrité
- **Logging** : Monitoring et débogage

## 🛠️ Technologies utilisées

- **Node.js** : Runtime JavaScript côté serveur
- **Express.js** : Framework web minimaliste et flexible
- **MongoDB** : Base de données NoSQL avec Mongoose ODM
- **JWT** : Tokens d'authentification sécurisés
- **bcryptjs** : Hachage de mots de passe
- **Axios** : Client HTTP pour l'API OpenWeatherMap
- **CORS** : Gestion des requêtes cross-origin
- **dotenv** : Gestion des variables d'environnement

## 📦 Installation

### Prérequis
- Node.js 18+
- MongoDB Atlas compte (ou instance locale)
- Clé API OpenWeatherMap

### Configuration

1. **Cloner le projet**
```bash
git clone <repository-url>
cd WeatherAppPlus/backend
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Variables d'environnement**
Créez un fichier `.env` :
```env
# Base de données
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/weatherapp

# JWT Secret (générer une clé sécurisée)
JWT_SECRET=your-super-secret-jwt-key-here

# OpenWeatherMap API
OPENWEATHERMAP_API_KEY=your-api-key-here

# Environnement
NODE_ENV=development
```

## 🚀 Lancement

### Développement
```bash
npm run dev
# ou
yarn dev
```

Le serveur sera disponible sur [http://localhost:3000](http://localhost:3000)

### Production
```bash
npm start
# ou
yarn start
```

## 📁 Structure du projet

```
backend/
├── bin/
│   └── www                # Point d'entrée du serveur
├── config/
│   └── database.js        # Configuration MongoDB
├── middleware/
│   └── auth.js           # Middleware d'authentification JWT
├── models/
│   └── User.js           # Modèle utilisateur avec villes
├── routes/
│   ├── auth.js          # Routes d'authentification
│   ├── cities.js        # Gestion des villes favorites
│   └── weather.js       # Intégration API météo
├── .env                 # Variables d'environnement
├── app.js               # Configuration Express
└── package.json         # Dépendances et scripts
```

## 🔌 API Endpoints

### 🔐 Authentification (`/api/auth`)

#### POST `/api/auth/register`
Inscription d'un nouvel utilisateur
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### POST `/api/auth/login`
Connexion utilisateur
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### GET `/api/auth/verify`
Vérification du token JWT (protégée)

#### POST `/api/auth/merge-cities`
Fusion des villes localStorage vers le compte (protégée)
```json
{
  "cities": [
    {
      "name": "Paris",
      "country": "FR",
      "lat": 48.8566,
      "lon": 2.3522
    }
  ]
}
```

### ⭐ Villes favorites (`/api/cities`)

#### GET `/api/cities`
Récupération des villes favorites (protégée)

#### POST `/api/cities`
Ajout d'une ville aux favoris (protégée)
```json
{
  "name": "Londres",
  "country": "GB",
  "lat": 51.5074,
  "lon": -0.1278
}
```

#### DELETE `/api/cities/:cityId`
Suppression d'une ville des favoris (protégée)

### 🌍 Météo (`/api/weather`)

#### GET `/api/weather/search/:cityName`
Recherche de villes par nom
```
GET /api/weather/search/Paris
```

#### GET `/api/weather/current/:lat/:lon`
Météo actuelle pour des coordonnées
```
GET /api/weather/current/48.8566/2.3522
```

#### GET `/api/weather/forecast/:lat/:lon`
Prévisions météo (5 jours)
```
GET /api/weather/forecast/48.8566/2.3522
```

## 🗄️ Modèles de données

### Utilisateur (User)
```javascript
{
  username: String,      // Nom d'utilisateur unique
  email: String,         // Email unique
  password: String,      // Mot de passe haché
  cities: [{             // Villes favorites embarquées
    name: String,
    country: String,
    lat: Number,
    lon: Number,
    addedAt: Date
  }],
  createdAt: Date
}
```

## 🔒 Sécurité

### Authentification JWT
- **Génération** : Token signé avec secret sécurisé
- **Expiration** : Token valide 24h
- **Middleware** : Vérification automatique des routes protégées
- **Headers** : `Authorization: Bearer <token>`

### Hachage des mots de passe
- **bcryptjs** : Salt rounds = 10
- **Validation** : Longueur minimale 6 caractères
- **Comparaison** : Méthode sécurisée dans le modèle

### CORS et sécurité
- **Origins autorisées** : Frontend localhost en développement
- **Credentials** : Support des cookies sécurisés
- **Headers** : Content-Type et Authorization

## 🌐 Intégration OpenWeatherMap

### Configuration
1. Créer un compte sur [OpenWeatherMap](https://openweathermap.org/api)
2. Générer une clé API gratuite
3. Ajouter la clé dans `.env`

### Endpoints utilisés
- **Geocoding API** : Recherche de villes
- **Current Weather API** : Météo actuelle
- **5 Day Weather Forecast** : Prévisions

### Gestion d'erreurs
- Retry automatique en cas d'échec
- Messages d'erreur explicites
- Fallback graceful

## 🔧 Configuration avancée

### MongoDB
```javascript
// Exemple de connexion
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

### CORS personnalisé
```javascript
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true
}));
```

## 📊 Monitoring et logs

### Développement
- **morgan** : Logging des requêtes HTTP
- **Console logs** : Erreurs et informations debug

### Production
- Logs structurés recommandés
- Monitoring des performances
- Alertes sur les erreurs critiques

## 🧪 Tests

```bash
# Lancer les tests (à implémenter)
npm test

# Tests d'intégration
npm run test:integration
```

## 🚀 Déploiement

### Préparation production
1. **Variables d'environnement** : Configuration serveur
2. **Base de données** : MongoDB Atlas configuré
3. **Domaines** : CORS mis à jour avec domaines production

### Plateformes recommandées
- **Heroku** : Déploiement simple avec MongoDB Atlas
- **Vercel** : Avec MongoDB Atlas
- **Railway** : Alternative moderne à Heroku
- **DigitalOcean** : VPS avec plus de contrôle

**WeatherApp+ Backend** - API robuste pour données météo 🔧