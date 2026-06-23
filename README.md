# 🌿 ForageIA — De la nature à l'assiette, zéro gaspillage

ForageIA est une application web intelligente qui accompagne les utilisateurs de la forêt jusqu'à la table. Développée dans le cadre d'un projet de fin d'études en intégration de l'intelligence artificielle, elle répond à un besoin concret des **Scouts de Larouche (Saguenay–Lac-Saint-Jean, Québec)** : identifier les plantes sauvages comestibles lors de leurs sorties en nature, tout en aidant le grand public à valoriser leurs récoltes en cuisine et à réduire le gaspillage alimentaire.

**Application en ligne :** https://forage-ia.vercel.app

---

## 🏗️ Architecture

```
Utilisateur (téléphone / ordinateur)
        │
        ▼
┌─────────────────────────┐
│  Frontend — Vercel      │
│  React.js + Vite        │
│  i18next (FR / EN)      │
└────────────┬────────────┘
             │ API REST (HTTPS)
             ▼
┌─────────────────────────┐
│  Backend — Render       │
│  Python + FastAPI       │
└──┬──────────┬───────────┘
   │          │          │
   ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌──────────────┐
│Gemini  │ │Firebase│ │OpenWeatherMap│
│IA + IA │ │Auth+DB │ │Météo         │
└────────┘ └────────┘ └──────────────┘
                │
                ▼
     ┌─────────────────────┐
     │ OpenStreetMap       │
     │ Leaflet.js — Carte  │
     └─────────────────────┘
```

---

## ✅ Prérequis

- Python 3.10+
- Node.js 18+
- Un compte Google AI Studio (clé API Gemini)
- Un compte OpenWeatherMap (clé API gratuite)
- Un projet Firebase (Authentication + Firestore)

---

## 🚀 Installation

```bash
# 1. Cloner le repository
git clone https://github.com/duchesne626-sketch/forageIA.git
cd forageIA

# 2. Configurer le backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt

# 3. Créer le fichier .env dans le dossier backend
# Copier et remplir les variables suivantes :
# GOOGLE_API_KEY=votre_clé_gemini
# OPENWEATHER_API_KEY=votre_clé_openweather

# 4. Lancer le backend
uvicorn main:app --reload

# 5. Dans un nouveau terminal, configurer le frontend
cd frontend
npm install
npm run dev
```

L'application sera accessible sur **http://localhost:5173**

---

## 📖 Utilisation

1. **S'inscrire** avec une adresse courriel sur la page de connexion
2. **🌲 Forêt** — Prendre ou uploader une photo d'une plante pour l'identifier
3. **🧊 Frigo** — Prendre ou uploader une photo de son frigo pour lister les ingrédients
4. **🍽️ Recette** — Générer une recette narrative unique combinant les deux
5. **🗺️ Carte** — Trouver les zones de cueillette et consulter la météo
6. **📚 Encyclopédie** — Rechercher n'importe quelle plante par son nom
7. **📖 Historique** — Consulter, sauvegarder et exporter ses recettes en PDF

Pour le guide d'utilisation complet avec captures d'écran, consulter le document **Guide_Utilisation.docx** dans le dossier `/docs`.

---

## 📁 Structure du code

```
forageIA/
├── backend/                  # Serveur Python FastAPI
│   ├── main.py               # Endpoints API (identifier-plante, analyser-frigo, etc.)
│   ├── requirements.txt      # Dépendances Python
│   └── .env                  # Variables d'environnement (non inclus dans Git)
├── frontend/                 # Interface React.js
│   ├── src/
│   │   ├── App.jsx           # Composante principale et toutes les pages
│   │   ├── firebase.js       # Configuration Firebase
│   │   ├── i18n.js           # Configuration multilangue
│   │   ├── index.css         # Styles globaux et responsive
│   │   └── locales/
│   │       ├── fr.json       # Traductions françaises
│   │       └── en.json       # Traductions anglaises
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🔧 Choix techniques

Les décisions d'architecture, la comparaison des options envisagées et les justifications détaillées sont disponibles dans le document **Documentation_Technique.docx**.

En résumé :
- **Google Gemini API** — seul modèle couvrant vision + génération en un seul appel
- **React.js + Vite** — structure claire et composantes réutilisables
- **Python + FastAPI** — recommandé unanimement pour les projets IA
- **Firebase** — plan gratuit suffisant, conforme Loi 25 (aucune donnée enfant)
- **Vercel + Render** — plateformes maîtrisées, déploiement automatique via GitHub

---

## ⚠️ Limites connues

- **Clé API gratuite Gemini** — lors des tests avec le plan gratuit, les quotas quotidiens étaient rapidement épuisés. Une carte de crédit et un crédit prépayé d'environ 20$ CAD ont été nécessaires pour un usage fluide
- **Carte de cueillette simplifiée** — une première version utilisait une carte statique avec des zones prédéfinies, qui était trop limitée géographiquement. Leaflet.js avec OpenStreetMap a été adopté pour offrir une carte mondiale dynamique
- **Backend en veille sur Render (plan gratuit)** — le premier appel après une période d'inactivité peut prendre 30 à 50 secondes le temps que le serveur se réveille
- **Pas de mode hors ligne** — une connexion internet est requise pour toutes les fonctionnalités
- **Identification imparfaite** — l'IA peut se tromper, particulièrement pour des photos floues ou mal éclairées. Un avertissement est toujours affiché

---

## 🚀 Évolutions prévues (V2)

- **Carte avec données iNaturalist** — intégration de l'API iNaturalist pour afficher les vraies observations de plantes géolocalisées par des naturalistes, remplaçant les zones simulées actuelles par des données réelles et précises pour chaque région
- **Multilangue étendu** — l'application supporte actuellement le français et l'anglais. L'objectif V2 est d'ajouter l'espagnol, le portugais et d'autres langues pour rejoindre un public international, mais cela représentait un volume de travail trop important pour le délai du projet
- **Mode hors ligne** — mise en cache des résultats d'identification pour les zones sans connexion cellulaire en forêt
- **Application mobile native** — version iOS et Android pour une meilleure expérience en forêt avec accès direct à la caméra
- **Monétisation** — intégration d'un plan d'abonnement pour accéder à des fonctionnalités avancées (historique illimité, identification prioritaire, recettes premium)

---

## 👩‍💻 Auteure et licence

**Jennifer Duchesne**
Étudiante — AEC Intelligence Artificielle Appliquée
Projet de fin d'études — 25 juin 2026

Client : Scouts de Larouche, Saguenay–Lac-Saint-Jean, Québec

---

Distribué sous licence **MIT**.

> Permission est accordée, gratuitement, à toute personne obtenant une copie de ce logiciel, de l'utiliser, le copier, le modifier et le distribuer sans restriction, sous réserve que la mention de l'auteure originale soit conservée.

---

*ForageIA — De la nature à l'assiette, zéro gaspillage 🌿*