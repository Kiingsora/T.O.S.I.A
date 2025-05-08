# Prompstocker

Une application web légère pour gérer, éditer, importer et exporter des prompts pour modèle de langage.

## Fonctionnalités

- ✅ Création, édition et suppression de prompts
- ✅ Import de fichiers `.json` et `.csv`
- ✅ Export vers `.json`, `.csv` et `.md` (Markdown)
- ✅ Mode sombre / clair (Je ne suis pas un barbare)
- ✅ Prévisualisation avant export
- ✅ Stockage local via `localStorage` (pas de serveur requis, pour vous sécuriser, pensez à exporter ;)


## Dossier

STOCKTONPROMPT/
├── index.html
├── scripts/
│   └── promptstocker.js
├── styles/
│   └── style.css
├── data/
│   └── prompts.json
├── assets/
│   └── prompt_favicon.ico
├── _headers         ✅ Sécurité CSP, anti-XSS
├── _redirects       ✅ Redirection SPA
└── README.md


---

## 🛡 Sécurité

Cette application est pensée pour **éviter les failles les plus fréquentes** dans les applications web manipulant du contenu texte.

| Type d’attaque              | Statut     | Détail |
|----------------------------|------------|--------|
| **XSS (injection HTML/JS)**| ✅ Protégé | via `sanitizeHTML()` sur toutes les données utilisateur |
| **Injection CSV (Excel)**  | ✅ Protégé | les champs commencant par `=`, `+`, `@`, `-` sont automatiquement échappés |
| **Clickjacking**           | ✅ Protégé | via directive CSP : `frame-ancestors 'none'` |
| **Surcharge JSON**         | ✅ Protégé | validation stricte (`validatePrompt()`) et limite de taille locale |
| **Sauts de ligne / `;` CSV**| ✅ Protégé | gestion correcte des guillemets et retours dans `promptsToCSV()` |

---

## 🧾 Content Security Policy (CSP)

Le fichier HTML contient deux versions de la directive CSP :

Mode strict (à activer en ligne) 

<!-- <meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self';">
-->

Mode souple pour développement local 
<!-- <meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">-->


## Lancement

Ouvrir `index.html` dans le navigateur.
