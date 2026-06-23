# 📋 CHANGELOG — ForageIA

Tous les changements notables de ce projet sont documentés dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)

---

## [v1.1] — 2026-06-22

### Ajouté
- Multilangue français/anglais complet avec i18next
- Bouton de changement de langue dans la navigation (🇫🇷 FR / 🇬🇧 EN)
- Fichiers de traduction `fr.json` et `en.json` dans `/src/locales`
- Traduction de toutes les pages : Forêt, Frigo, Recette, Historique, Profil, Encyclopédie, Carte, Auth
- Calendrier saisonnier traduit avec noms de plantes en anglais
- Mois affichés dans la langue sélectionnée

---

## [v1.0] — 2026-06-17 — 🚀 MISE EN PRODUCTION

### Ajouté
- Déploiement du frontend sur **Vercel** (https://forage-ia.vercel.app)
- Déploiement du backend sur **Render** (https://forageia-backend.onrender.com)
- Configuration CORS pour autoriser les requêtes cross-origin entre Vercel et Render
- Repository GitHub public avec CI/CD automatique via git push

---

## [v0.12] — 2026-06-17

### Ajouté
- Page **Encyclopédie** avec 12 plantes comestibles du Québec prédéfinies
- Recherche IA illimitée — n'importe quelle plante du monde via Google Gemini
- Endpoint `/encyclopedie/{nom_plante}` dans le backend
- Fiche détaillée : nom latin, comestibilité, saison, habitat, conseil, sosies dangereux
- Indicateur visuel "En saison !" pour les plantes disponibles ce mois-ci

---

## [v0.11] — 2026-06-16

### Ajouté
- Interface **responsive mobile** complète
- Menu hamburger (☰) pour les écrans mobiles
- Bouton **📸 Prendre une photo** utilisant la caméra directement sur téléphone
- Attribut `capture="environment"` pour ouvrir la caméra arrière
- CSS responsive avec media queries pour écrans < 768px

---

## [v0.10] — 2026-06-16

### Ajouté
- Page **Profil utilisateur** avec statistiques (recettes sauvegardées, plantes identifiées)
- Date d'inscription de l'utilisateur
- Bouton "Changer mon mot de passe" via Firebase sendPasswordResetEmail
- Fonctionnalité **Mot de passe oublié** sur la page de connexion
- Email de réinitialisation envoyé automatiquement par Firebase

---

## [v0.9] — 2026-06-16

### Ajouté
- **Calendrier saisonnier** des plantes comestibles du Québec
- Affichage des plantes en saison ce mois-ci vs hors saison
- 12 plantes québécoises avec leurs mois de disponibilité
- Intégré directement dans la page Carte

---

## [v0.8] — 2026-06-16

### Ajouté
- Intégration de l'API **OpenWeatherMap** pour la météo en temps réel
- Endpoint `/meteo/{ville}` dans le backend
- Affichage : température, description, humidité, vitesse du vent
- Indicateur "Idéal / Pas idéal pour la cueillette" selon les conditions météo
- Icône météo dynamique selon les conditions

---

## [v0.7] — 2026-06-16

### Ajouté
- Page **Carte de cueillette** interactive avec Leaflet.js + OpenStreetMap
- Recherche par ville via API Nominatim (OpenStreetMap)
- Tentative de géolocalisation GPS (avec fallback recherche manuelle)
- 15 zones de cueillette simulées avec cercles colorés par espèce
- Popups informatifs au clic sur chaque zone
- Recentrage automatique de la carte lors d'un changement de ville

---

## [v0.6] — 2026-06-15

### Ajouté
- Export des recettes en **PDF** avec jsPDF
- Mise en page soignée : titre, histoire, ingrédients avec quantités, étapes, conseil du chef
- Gestion automatique des sauts de page pour les recettes longues
- Bouton "📄 Exporter en PDF" dans la page Recette

---

## [v0.5] — 2026-06-15

### Ajouté
- Page **Historique** des recettes sauvegardées
- Sauvegarde des recettes dans **Firebase Firestore**
- Bouton "💾 Sauvegarder cette recette" avec confirmation
- Bouton "🗑️ Supprimer" avec confirmation avant suppression
- Affichage accordéon (ouvrir/fermer) pour chaque recette
- Filtrage par utilisateur connecté (userId)

---

## [v0.4] — 2026-06-15

### Ajouté
- **Firebase Authentication** — inscription et connexion par email
- Page de connexion/inscription avec bascule entre les deux modes
- Protection des pages Forêt, Frigo, Recette, Historique — connexion obligatoire
- Affichage de l'email de l'utilisateur connecté dans la navigation
- Bouton de déconnexion

---

## [v0.3] — 2026-06-14

### Ajouté
- **Frontend React** complet avec Vite
- Navigation entre 3 pages principales : Forêt, Frigo, Recette
- Page d'accueil avec présentation du projet
- Module **Forêt** : upload photo + affichage résultat IA
- Module **Frigo** : upload photo + liste d'ingrédients détectés
- Module **Recette** : génération narrative avec plantes + ingrédients frigo
- Affichage des quantités précises dans les recettes
- Avertissement IA affiché sur chaque identification de plante
- Gestion des erreurs avec messages clairs à l'utilisateur

---

## [v0.2] — 2026-06-09

### Ajouté
- **Backend FastAPI** avec Python
- Endpoint `/identifier-plante` — identification par photo via Google Gemini Vision
- Endpoint `/analyser-frigo` — analyse du contenu du frigo par photo
- Endpoint `/generer-recette` — génération de recette narrative
- Gestion des images RGBA (conversion en JPEG avant envoi à Gemini)
- Configuration CORS pour le frontend local
- Variables d'environnement via python-dotenv

### Technique
- Migration de `google.generativeai` vers `google.genai` (nouvelle librairie)
- Modèle `gemini-2.5-flash-lite` retenu après tests de disponibilité

---

## [v0.1] — 2026-06-09

### Ajouté
- Initialisation du projet avec structure `frontend/` et `backend/`
- Installation de l'environnement : Node.js v24, Python 3.14, Git
- Configuration Git avec compte GitHub
- Environnement virtuel Python (venv)
- Fichier `.gitignore` pour exclure venv, node_modules et .env

---

*ForageIA — De la nature à l'assiette, zéro gaspillage 🌿*