[English](README.md) | **Français**

# Liste d'épicerie

[![CI](https://github.com/FelixPepin/grocery-list/actions/workflows/ci.yml/badge.svg)](https://github.com/FelixPepin/grocery-list/actions/workflows/ci.yml)

Une application web full-stack pour gérer une liste d'épicerie : ajouter, modifier et retirer des articles, voir le total, et retrouver la liste après un redémarrage.

Réalisée dans le cadre du test technique pour le stage chez OVA.

**Technologies :** Vue 3 + Vite · Node.js + Express 5 · MySQL 8.4 (Docker) · Vitest

---

## Fonctionnalités

**Demandées**
- Ajouter, modifier et retirer un article (nom, quantité, prix unitaire), et voir la liste au complet
- Validation des deux côtés, avec un retour visuel : chaque erreur s'affiche sous son champ
- Données sauvegardées dans MySQL : la liste est toujours là après un redémarrage

**Ajoutées**
- Total de la liste, mis à jour après chaque changement
- Vider la liste au complet
- Fenêtre de confirmation avant chaque suppression
- Choix de la langue, anglais ou français (textes, messages d'erreur et format des prix)
- Tests automatisés (backend et frontend) et intégration continue avec GitHub Actions
- Une page **Journal de développement** avec le temps consacré à chaque étape (voir [Temps consacré](#temps-consacré))
- Une collection Postman avec des tests automatisés sur chaque requête (cas valides, erreurs et cas limites)

---

## Prérequis

| Outil | Version | Remarques |
|---|---|---|
| [Node.js](https://nodejs.org) | 22.18 ou plus récent | Testé avec la 26.13 (et la 24 dans la CI) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Une version récente | **Doit être démarré** avant de lancer la base de données |
| Git | N'importe laquelle | |
| [Postman](https://www.postman.com/downloads/) | Facultatif | Pour essayer l'API avec la collection fournie |

Les ports **3000** (API), **3307** (MySQL) et **5173** (frontend) doivent être libres.

---

## Démarrage

Les commandes ci-dessous sont pour PowerShell (Windows). Sur macOS ou Linux, remplacez `Copy-Item` par `cp`.

### 1. Cloner le dépôt

```powershell
git clone https://github.com/FelixPepin/grocery-list.git
cd grocery-list
```

### 2. Démarrer la base de données

```powershell
docker compose up -d
```

Cette commande démarre MySQL dans un conteneur, crée la table `grocery_items` et ajoute 4 articles d'exemple. Attendez environ 20 secondes, jusqu'à ce que l'état soit `healthy` :

```powershell
docker compose ps
```

Aucune configuration n'est nécessaire : `docker-compose.yml` contient des valeurs par défaut qui correspondent à `backend/.env.example`.

### 3. Démarrer le backend (API)

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Vous devriez voir `MySQL connected` et `Server running on http://localhost:3000`.

### 4. Démarrer le frontend

Dans un **deuxième terminal**, à partir de la racine du projet :

```powershell
cd FrontEnd
Copy-Item .env.example .env
npm install
npm run dev
```

Ouvrez **http://localhost:5173**.

### Tout arrêter

`Ctrl + C` dans les deux terminaux, puis `docker compose down`. Les données sont conservées dans un volume Docker, et seront toujours là la prochaine fois.

---

## Tests

| Partie | Commande | Ce qui est testé |
|---|---|---|
| Backend | `cd backend`, puis `npm test` | Les middlewares de validation (tests unitaires) et chaque route avec Supertest. Le modèle est simulé : **aucune base de données nécessaire** |
| Frontend | `cd FrontEnd`, puis `npm test` | La validation, le composable, les composants, la navigation et les traductions. `fetch` est simulé : **aucun backend nécessaire** |
| API (manuel) | Postman | Importez `postman/grocery-list.postman_collection.json` |

**Postman :** avec le backend démarré, faites un clic droit sur le dossier **grocery_list**, puis **Run folder** : chaque requête a ses propres tests. Le dossier **Destructive** supprime tous les articles, et il doit être lancé séparément. Pour retrouver les données d'exemple : `docker compose down -v`, puis `docker compose up -d`.

La **CI** (GitHub Actions) lance les tests du backend, le lint du frontend, les tests du frontend et le build à chaque push sur `main` et à chaque pull request. La branche `main` est protégée : une pull request ne peut être fusionnée que si la CI passe.

---

## API

URL de base : `http://localhost:3000`. Le corps des requêtes est en JSON.

| Méthode | Route | Succès | Erreurs |
|---|---|---|---|
| `GET` | `/grocery_list` | **200** avec tous les articles (du plus récent au plus ancien) | |
| `POST` | `/grocery_list` | **201** avec l'article créé et un en-tête `Location` | 400, 422 |
| `PUT` | `/grocery_list/:id` | **200** avec l'article tel qu'enregistré | 400, 404, 422 |
| `DELETE` | `/grocery_list/:id` | **204** (sans corps) | 400, 404 |
| `DELETE` | `/grocery_list` | **204**, supprime tous les articles | |

**Article :** `{ "name": "Apple", "quantity": 3, "unit_price": 1.5 }`

| Champ | Règles |
|---|---|
| `name` | Obligatoire, du texte, non vide, 50 caractères au maximum (les espaces autour sont retirés) |
| `quantity` | Obligatoire, un nombre entier, de 1 à 10 000 |
| `unit_price` | Obligatoire, un nombre, supérieur à 0 et jusqu'à 100 000 (enregistré avec 2 décimales) |

**Format des réponses**

```jsonc
// Succès
{ "status": 201, "message": "Item created successfully", "data": { ... }, "path": "/grocery_list", "timestamp": "..." }

// Erreur
{ "status": 422, "error": "Unprocessable Entity", "message": "Quantity must be at least 1", "code": "QUANTITY_TOO_LOW", "path": "/grocery_list", "timestamp": "..." }
```

- **400** : un champ est absent, le JSON est mal formé, ou l'`id` dans l'URL n'est pas un entier positif
- **422** : un champ est présent, mais invalide
- **404** : l'article ou la route n'existe pas
- **500** : erreur inattendue. Les détails sont affichés dans la console du serveur, mais jamais envoyés au client

Le frontend se sert du champ `code` comme d'une clé pour aller chercher le message correspondant dans `messages.js`, dans la langue choisie (par exemple, `QUANTITY_TOO_LOW` → « La quantité doit être d'au moins 1. »).

---

## Structure du projet

```
grocery-list/
├── .github/workflows/ci.yml     CI : tests, lint et build
├── docker-compose.yml           MySQL 8.4 avec un volume persistant
├── database/init/               Création de la table et données d'exemple
├── postman/                     Collection Postman avec ses tests
├── backend/
│   ├── app.mjs                  Application Express (CORS, routes, gestion des erreurs)
│   ├── db.mjs                   Pool de connexions MySQL
│   ├── routes/                  URL → validation → contrôleur
│   ├── middlewares/             Validation des requêtes
│   ├── controllers/             Traitement des requêtes et réponses
│   ├── models/                  Requêtes SQL
│   ├── utils/                   Création des erreurs HTTP
│   └── tests/
└── FrontEnd/
    ├── src/
    │   ├── views/               Les deux pages (la liste et le journal de développement)
    │   ├── components/          Formulaire, liste, article, fenêtre de confirmation, choix de la langue...
    │   ├── composables/         useGroceryList : appels à l'API et état partagé
    │   ├── i18n/                Textes en anglais et en français
    │   ├── utils/               Validation d'un article (mêmes règles que l'API)
    │   ├── router/              Vue Router
    │   └── data/                Données du journal de développement
    └── tests/
```

---

## Choix techniques

**Technologies.** J'ai utilisé les mêmes technologies que pour mon projet intégrateur au cégep, une application de fidélité réalisée pour un vrai client (Vue 3, Express, MySQL, Vitest), et j'ai repris ses conventions : routes → middleware de validation → contrôleur → modèle, et le même format de réponse JSON.

**Validation à 3 niveaux.**
1. **Le frontend**, pour l'utilisateur : un retour immédiat sous chaque champ.
2. **L'API**, pour la sécurité : on peut appeler l'API sans passer par le frontend (Postman, curl...). Elle répond **400** quand un champ est absent et **422** quand il est invalide, avec un `code` que le frontend traduit.
3. **La base de données**, comme dernier filet de sécurité : des contraintes `CHECK` sur la table.

Le frontend et l'API utilisent les mêmes règles et les mêmes codes d'erreur. Les messages sont donc identiques des deux côtés.

**Express 5.** Il transmet automatiquement les erreurs des fonctions `async` au middleware d'erreurs. Les contrôleurs n'ont donc pas de `try/catch` qui ne feraient qu'appeler `next(err)`. Toutes les erreurs passent par un seul gestionnaire, qui produit le même format JSON et cache les détails internes en cas d'erreur 500.

**Les prix.** `DECIMAL(10,2)` plutôt que `FLOAT`, pour éviter les erreurs d'arrondi avec de l'argent. Le pool `mysql2` les retourne sous forme de nombres (`decimalNumbers: true`), ce qui permet de calculer le total directement.

**La connexion à la base de données.** Le pool est dans son propre fichier (`db.mjs`) plutôt que dans `app.mjs`, pour éviter un import circulaire (app → routes → contrôleurs → modèles → app).

**CORS.** Seule l'URL du frontend est autorisée (`FRONTEND_URL`), et non `*`.

**La gestion de l'état.** Un composable (`useGroceryList`) contient la liste et les appels à l'API, et il est partagé par tous les composants. J'utilise habituellement Pinia, mais pour une seule ressource, il apporterait peu.

**Les traductions.** Un petit système de traduction maison, sans bibliothèque : chaque texte passe par `t()`, les messages d'erreur sont traduits à partir du `code` de l'API, et les prix sont formatés avec `Intl.NumberFormat` (`$1.50` / `1,50 $`). La langue choisie est mémorisée.

**La fenêtre de confirmation.** La balise native `<dialog>` : le fond s'assombrit, le focus reste à l'intérieur, `Échap` annule, et le focus est sur **Non** par défaut, pour qu'une touche Entrée accidentelle ne supprime jamais rien.

**L'accessibilité.** Des libellés reliés à leur champ, des erreurs annoncées par les lecteurs d'écran (`aria-invalid`, `aria-describedby`, `role="alert"`), le focus placé sur le premier champ invalide, et des boutons qui portent le nom de leur article (`Supprimer Apple`).

**Docker.** Seul MySQL tourne dans Docker. Le port est limité à `127.0.0.1:3307` : il n'entre pas en conflit avec un MySQL installé localement, et il n'est pas accessible depuis le réseau. Les valeurs de `.env.example` sont **seulement des valeurs de développement local**, les mêmes que les valeurs par défaut de `docker-compose.yml`, pour que le projet fonctionne sans aucune configuration. Les vrais secrets ne vont jamais dans ces fichiers.

**Les tests.** Les tests du backend simulent le modèle, et ceux du frontend simulent `fetch`. Aucun des deux n'a donc besoin d'une base de données ni d'un serveur démarré. C'est ce qui leur permet de tourner dans la CI.

**Petites décisions**
- Le champ de la quantité commence à **1** : c'est la valeur la plus courante, et le minimum. Le prix commence vide, puisque n'importe quelle valeur par défaut serait inventée.
- **Les valeurs maximales** (quantité de 10 000, prix de 100 000) : un problème trouvé en testant le formulaire. Un nombre énorme, comme `1.23e21`, passait la validation, et MySQL renvoyait une erreur 500. La limite est maintenant vérifiée des deux côtés.
- Les tests du frontend désactivent le `localStorage` intégré à Node (`--no-experimental-webstorage`) : depuis Node 25, il cache celui de jsdom pendant les tests.

---

## Temps consacré

Environ **X heures** au total, avec le détail ci-dessous.

Le même tableau est aussi disponible **directement dans l'application**, sur la page **Journal de développement** (lien dans l'en-tête). Cette page ne fait pas partie de la liste d'épicerie elle-même, et c'est voulu : j'aime vraiment travailler avec **Vue Router**, et comme l'application n'avait besoin que d'une seule page, je ne voulais pas laisser le routage de côté. Ajouter une deuxième page était une façon simple de le montrer, avec une route chargée à la demande, un style pour le lien actif et des tests, sans toucher à la liste d'épicerie elle-même.

| Étape | Détails | Temps |
|---|---|---|
| Mise en place du projet | Dépôt Git, structure du monorepo, `.gitignore` | 12 min |
| Base de données | MySQL 8.4 dans Docker, volume persistant, contraintes `CHECK`, données d'exemple | 32 min |
| Squelette du backend | Serveur Express 5, pool MySQL, CORS, gestion globale des erreurs | 54 min |
| Lister et ajouter (API) | Routes `GET` et `POST`, middleware de validation, collection Postman | 1 h 59 |
| Modifier et supprimer (API) | Routes `PUT` et `DELETE`, vider la liste, validation de l'identifiant | 1 h 24 |
| Tests du backend | Vitest + Supertest, modèle simulé | 1 h 07 |
| Affichage de la liste | Vue 3 + Vite, composable, traductions FR/EN, états de chargement, d'erreur et de liste vide | 1 h 52 |
| Formulaire d'ajout | Validation et messages sous chaque champ, valeurs maximales des deux côtés | 2 h 09 |
| Modifier, supprimer, total et langue | Modification dans la carte, fenêtre de confirmation, total, vider la liste, choix de la langue | 1 h 57 |
| Intégration continue | GitHub Actions (tests, lint, build), branche `main` protégée | 18 min |
| Nettoyage du code | Code inutile retiré, styles de boutons communs, traductions manquantes | 1 h 00 |
| Page du journal de développement | Vue Router, route chargée à la demande, ce tableau | 1 h 22 |
| Documentation | README en anglais et en français | 29 min |
| Vérification finale | Clone vide, en suivant ce README étape par étape | X |
| **Total** | | **X** |

---

## Avec plus de temps

Quelques idées que j'aurais aimé ajouter avec plus de temps, ou si c'était un projet personnel :

- **Des comptes utilisateurs**, pour que chaque personne ait sa propre liste.
- **Déployer l'application** avec une livraison continue, comme je l'ai fait pour mon projet intégrateur sur Render.
- **Des filtres et des tris**, pour trier la liste par nom, par prix ou par quantité, ou retrouver rapidement un article dans une longue liste.
