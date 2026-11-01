/**
 * Time spent on each step of the project, also shown in the README.
 * Each text is written in both languages so the page follows the FR/EN switch.
 * minutes: null means the step is not finished yet.
 */
export const devLog = [
  {
    step: { en: 'Project setup', fr: 'Mise en place du projet' },
    details: {
      en: 'Git repository, monorepo structure, .gitignore',
      fr: 'Dépôt Git, structure du monorepo, .gitignore',
    },
    minutes: 12,
  },
  {
    step: { en: 'Database', fr: 'Base de données' },
    details: {
      en: 'MySQL 8.4 in Docker, persistent volume, CHECK constraints, sample data',
      fr: "MySQL 8.4 dans Docker, volume persistant, contraintes CHECK, données d'exemple",
    },
    minutes: 32,
  },
  {
    step: { en: 'Backend setup', fr: 'Squelette du backend' },
    details: {
      en: 'Express 5 server, MySQL pool, CORS, global error handler',
      fr: 'Serveur Express 5, pool MySQL, CORS, gestion globale des erreurs',
    },
    minutes: 54,
  },
  {
    step: { en: 'List and add items (API)', fr: 'Lister et ajouter (API)' },
    details: {
      en: 'GET and POST routes, validation middleware, Postman collection',
      fr: 'Routes GET et POST, middleware de validation, collection Postman',
    },
    minutes: 119,
  },
  {
    step: { en: 'Edit and delete items (API)', fr: 'Modifier et supprimer (API)' },
    details: {
      en: 'PUT and DELETE routes, delete the whole list, id validation',
      fr: "Routes PUT et DELETE, vider la liste, validation de l'identifiant",
    },
    minutes: 84,
  },
  {
    step: { en: 'Backend tests', fr: 'Tests du backend' },
    details: {
      en: 'Vitest + Supertest, mocked model',
      fr: 'Vitest + Supertest, modèle simulé',
    },
    minutes: 67,
  },
  {
    step: { en: 'Display the list', fr: 'Affichage de la liste' },
    details: {
      en: 'Vue 3 + Vite, composable, FR/EN translations, loading, error and empty states',
      fr: 'Vue 3 + Vite, composable, traductions FR/EN, états de chargement, erreur et liste vide',
    },
    minutes: 112,
  },
  {
    step: { en: 'Add form', fr: "Formulaire d'ajout" },
    details: {
      en: 'Validation and messages under each field, max values on both sides',
      fr: 'Validation et messages sous chaque champ, valeurs maximales des deux côtés',
    },
    minutes: 129,
  },
  {
    step: { en: 'Edit, delete, total and language', fr: 'Modifier, supprimer, total et langue' },
    details: {
      en: 'Edit in the card, confirmation dialog, total, clear the list, FR/EN button',
      fr: 'Modification dans la carte, fenêtre de confirmation, total, vider la liste, bouton FR/EN',
    },
    minutes: 117,
  },
  {
    step: { en: 'Continuous integration', fr: 'Intégration continue' },
    details: {
      en: 'GitHub Actions (tests, lint, build), protected main branch',
      fr: 'GitHub Actions (tests, lint, build), branche main protégée',
    },
    minutes: 18,
  },
  {
    step: { en: 'Cleanup', fr: 'Nettoyage du code' },
    details: {
      en: 'Unused code removed, shared button styles, missing translations',
      fr: 'Code inutile retiré, styles de boutons communs, traductions manquantes',
    },
    minutes: 60,
  },
  {
    step: { en: 'Development log page', fr: 'Page du journal de développement' },
    details: {
      en: 'Vue Router, lazy-loaded route, this table',
      fr: 'Vue Router, route chargée à la demande, ce tableau',
    },
    minutes: 82,
  },
  {
    step: { en: 'Documentation', fr: 'Documentation' },
    details: {
      en: 'README in English and French',
      fr: 'README en anglais et en français',
    },
    minutes: 29,
  },
  {
    step: { en: 'Final check', fr: 'Vérification finale' },
    details: {
      en: 'Fresh clone, following the README step by step',
      fr: 'Clone vide, en suivant le README étape par étape',
    },
    minutes: 47,
  },
]
