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

---


## CE PROJET FAIS PARTIE DU PROJET TOSIA (Toolkits Open Source for Interactive Applications)

## ✨ À propos du projet TOSIA

> **TOSIA** est un laboratoire communautaire d’outils.

> Il est né d’une envie simple : coder sans pression, expérimenter ensemble, et voir jusqu’où on peut aller… juste avec du fun et du partage.

---

## 🧭 Un mot important

Je suis ravi d’ouvrir ce projet à la communauté, mais je tiens à préciser :

* Je fais ça **par passion**, sur mon temps libre.
* Je lirai vos contributions et idées **à mon rythme**, sans promesse de réponse immédiate.
* Le projet restera un espace bienveillant, libre et humain avant tout.

🙌 Merci de respecter ce rythme, et de contribuer dans la bonne humeur.

---

## 🧪 Contribuer à TOSIA

> Tu veux tester une idée ? Ajouter un outil, une animation, une fonctionnalité ?
> Tu es libre de forker, proposer une pull request, ou même inventer ton propre module.
> Ce projet te parle et tu veux faire partie de la modération pour m'aider dans cette tâche ? Alors n'hésite pas à me contacter sur linkedIn : 

https://www.linkedin.com/in/hichem-mansouri/

🎯 L’important n’est pas la perfection, mais la curiosité, la créativité, et le plaisir de faire ensemble.


## Auteur
@kiingsora
