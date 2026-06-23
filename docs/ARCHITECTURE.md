# 🏗️ Architecture détaillée — ForageIA

## Vue d'ensemble

ForageIA est une application web full-stack composée d'un frontend React, d'un backend Python FastAPI, et de plusieurs services cloud externes. L'architecture suit un modèle client-serveur classique avec une couche IA centralisée côté backend.

---

## Schéma d'architecture

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEUR                          │
│              Téléphone / Ordinateur                     │
│         (navigateur web — Chrome, Safari, etc.)         │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────────────────┐
│                FRONTEND — Vercel                        │
│                                                         │
│  React.js + Vite                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Forêt   │ │  Frigo   │ │ Recette  │ │  Carte   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Historique│ │ Profil   │ │Encyclopé.│ │   Auth   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                         │
│  i18next (FR / EN)    Leaflet.js    jsPDF               │
│  URL : https://forage-ia.vercel.app                     │
└─────────────────────┬───────────────────────────────────┘
                      │ API REST (HTTPS / JSON)
                      │ FormData pour les photos
                      ▼
┌─────────────────────────────────────────────────────────┐
│                BACKEND — Render                         │
│                                                         │
│  Python 3.14 + FastAPI + Uvicorn                        │
│                                                         │
│  Endpoints :                                            │
│  POST /identifier-plante   → Vision IA (photo)          │
│  POST /analyser-frigo      → Vision IA (photo)          │
│  POST /generer-recette     → Génération texte           │
│  GET  /meteo/{ville}       → Météo temps réel           │
│  GET  /encyclopedie/{nom}  → Fiche plante IA            │
│                                                         │
│  Librairies : Pillow (images), requests, python-dotenv  │
│  URL : https://forageia-backend.onrender.com            │
└──────┬───────────────┬──────────────────┬───────────────┘
       │               │                  │
       ▼               ▼                  ▼
┌────────────┐  ┌─────────────┐  ┌──────────────────┐
│Google      │  │  Firebase   │  │ OpenWeatherMap   │
│Gemini API  │  │  (Google)   │  │ API              │
│            │  │             │  │                  │
│Vision IA : │  │Auth:        │  │Météo en temps    │
│- Plantes   │  │- Email/Pass │  │réel par ville    │
│- Frigo     │  │             │  │Température,      │
│            │  │Firestore:   │  │humidité, vent,   │
│Génération :│  │- Recettes   │  │conditions        │
│- Recettes  │  │  sauvegard. │  │                  │
│- Fiches    │  │- Profils    │  │                  │
│  plantes   │  │  utilisat.  │  │                  │
│            │  │             │  │                  │
│Modèle :    │  │Plan : Spark │  │Plan : Gratuit    │
│gemini-2.5- │  │(gratuit)    │  │                  │
│flash-lite  │  │             │  │                  │
└────────────┘  └─────────────┘  └──────────────────┘

┌─────────────────────────────────────────────────────────┐
│          CARTOGRAPHIE (côté Frontend)                   │
│                                                         │
│  Leaflet.js + OpenStreetMap (tiles)                     │
│  Nominatim API (géocodage ville → coordonnées)          │
│  Cercles colorés par espèce de plante                   │
│  Carte mondiale interactive, gratuite                   │
└─────────────────────────────────────────────────────────┘
```

---

## Composantes détaillées

### Frontend (React.js + Vite)

| Fichier | Rôle |
|---------|------|
| `App.jsx` | Composante principale, routage entre les pages, état global |
| `firebase.js` | Configuration Firebase (auth + Firestore) |
| `i18n.js` | Configuration i18next pour le multilangue FR/EN |
| `index.css` | Styles globaux, animations, responsive mobile |
| `locales/fr.json` | Traductions françaises |
| `locales/en.json` | Traductions anglaises |

**Librairies principales :**
- `react` + `vite` — framework et bundler
- `axios` — requêtes HTTP vers le backend
- `firebase` — authentification + base de données
- `react-leaflet` + `leaflet` — carte interactive
- `jspdf` — export PDF des recettes
- `react-i18next` + `i18next` — multilangue

### Backend (Python + FastAPI)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/` | GET | Vérification que le serveur tourne |
| `/identifier-plante` | POST | Identification d'une plante par photo |
| `/analyser-frigo` | POST | Analyse du contenu du frigo par photo |
| `/generer-recette` | POST | Génération d'une recette narrative |
| `/meteo/{ville}` | GET | Météo en temps réel pour une ville |
| `/encyclopedie/{nom}` | GET | Fiche complète d'une plante via IA |

**Librairies principales :**
- `fastapi` + `uvicorn` — serveur web
- `google-genai` — client Google Gemini API
- `Pillow` — traitement des images (conversion RGBA → JPEG)
- `requests` — appels HTTP vers OpenWeatherMap
- `python-dotenv` — variables d'environnement

---

## Flux de données

### Identification d'une plante
```
Utilisateur prend photo
        │
        ▼
Frontend envoie FormData (photo) → POST /identifier-plante
        │
        ▼
Backend reçoit photo → Pillow convertit en JPEG
        │
        ▼
Gemini Vision analyse l'image
        │
        ▼
Retourne JSON : {nom_commun, nom_latin, comestible,
                 niveau_confiance, description, conseil,
                 sosies_dangereux}
        │
        ▼
Frontend affiche le résultat avec badge comestibilité
```

### Génération de recette
```
Utilisateur clique "Générer ma recette"
        │
        ▼
Frontend envoie JSON : {plantes: [...], ingredients_frigo: [...]}
        │
        ▼
Backend construit le prompt avec les deux listes
        │
        ▼
Gemini génère une recette narrative en JSON structuré
        │
        ▼
Retourne JSON : {titre, histoire, temps_preparation,
                 difficulte, portions, ingredients,
                 etapes, conseil_chef, impact_environnemental}
        │
        ▼
Frontend affiche la recette + boutons Sauvegarder/PDF
```

---

## Sécurité

- **CORS** configuré pour n'accepter que les requêtes de `forage-ia.vercel.app` et `localhost:5173`
- **Variables d'environnement** — les clés API ne sont jamais dans le code source
- **Firebase Authentication** — mots de passe hashés par Google, jamais stockés en clair
- **Loi 25** — aucune donnée personnelle des enfants scouts collectée
- **Avertissement IA** — affiché sur chaque identification de plante

---

## Déploiement

| Composante | Service | URL |
|-----------|---------|-----|
| Frontend | Vercel (Hobby — gratuit) | https://forage-ia.vercel.app |
| Backend | Render (Free — gratuit) | https://forageia-backend.onrender.com |
| Base de données | Firebase Firestore (Spark — gratuit) | Console Firebase |
| Authentification | Firebase Auth (Spark — gratuit) | Console Firebase |

**CI/CD :** Chaque `git push` sur la branche `main` déclenche automatiquement un redéploiement sur Vercel et Render.

---

*ForageIA — De la nature à l'assiette, zéro gaspillage 🌿*