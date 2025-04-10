# 📂 Task Manager App - React Native + Expo

Une application mobile de gestion de tâches personnelle, conçue pour t’aider à organiser tes projets, recevoir des rappels et suivre ta productivité au quotidien.

---

## 📱 Fonctionnalités principales

- 🔐 **Authentification utilisateur**
- ✅ **Ajout / modification / suppression de tâches**
- 🖓 **Détection des tâches en retard (affichées en rouge)**
- ⏰ **Notifications quotidiennes à 9h (Expo Notifications)**
- 🔎 **Recherche et filtres dynamiques**
- 🎯 **Marquage des tâches comme faites / à faire**
- ✨ **Animations fluides (Reanimated)**

---

## ⚙️ Installation

```bash
git clone https://github.com/ton-utilisateur/task-manager-app.git
cd task-manager-app
npm install
```

### ▶️ Lancer l'application

```bash
npx expo start
```

> L'app est compatible avec Expo  EAS Workflows Android

---

## 🧠 Utilisation

### 🔐 Connexion

- Authentification via API.
- Stockage sécurisé du token.
- Redirection vers l’écran principal.

### 📝 Gérer une tâche

- Créer : bouton “+ Nouvelle tâche”
- Modifier : bouton “✏️”
- Supprimer : bouton “🗑️”
- Marquer comme faite : bouton “✅”
- Les tâches passées non faites = rouges

### 🔔 Notifications

- Planifiées tous les jours à **9h**
- Utilise `expo-notifications`
- Rappelle les tâches non complétées

### 🔍 Filtres & recherche

- Recherche en temps réel (titre ou description)
- Filtres : “Toutes”, “À faire”, “Complétées”
- Tri par date croissante/décroissante

---

## 📆 Technologies

| Techno             | Usage                   |
| ------------------ | ----------------------- |
| React Native       | Base de l'app mobile    |
| Expo               | Développement rapide    |
| Axios              | Requêtes API            |
| AsyncStorage       | Stockage local (token)  |
| React Navigation   | Navigation entre écrans |
| Expo Notifications | Envoi de rappels        |
| Reanimated         | Animations fluides      |
| TypeScript         | Typage sécurisé         |

---

## 🧪 À venir

- 📋 Pièces jointes par tâche
- 📊 Statistiques de productivité
- 🌙 Dark mode
- 🔗 Partage de projets entre utilisateurs
- 🔐 Auth via OAuth (Google / Apple)

---

## 🧑‍💻 Auteur

Développé avec ❤️ par [Ton Nom]

> [Portfolio](https\://yuniel241.github.io/Portfolio/) · [Linkedin](http://www.linkedin.com/in/axel-yuniel)

---

## 📄 Licence

Ce projet est sous licence MIT — libre à toi de le modifier et de le redistribuer.

