"use strict";
// ===== SÉCURITÉ =====
// Protection contre les attaques XSS
const sanitizeHTML = (str) => {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

// Validation des données
const validatePrompt = (prompt) => {
  if (!prompt || typeof prompt !== "object") return false;
  if (
    !prompt.title ||
    typeof prompt.title !== "string" ||
    prompt.title.length > 100
  )
    return false;
  if (
    prompt.description &&
    (typeof prompt.description !== "string" || prompt.description.length > 500)
  )
    return false;
  if (
    !prompt.prompt ||
    typeof prompt.prompt !== "string" ||
    prompt.prompt.length > 10000
  )
    return false;
  if (!Array.isArray(prompt.keywords)) return false;
  if (prompt.keywords.some((k) => typeof k !== "string" || k.length > 50))
    return false;
  return true;
};

// Limite de taille pour le localStorage
const STORAGE_LIMIT = 4 * 1024 * 1024; // 5MB
const checkStorageLimit = () => {
  try {
    const data = JSON.stringify(prompts);
    if (data.length > STORAGE_LIMIT) {
      throw new Error("Limite de stockage dépassée");
    }
  } catch (err) {
    console.error("Erreur de stockage:", err);
    return false;
  }
  return true;
};

// ===== UTILITAIRES =====
const $ = (id) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Élément ${id} non trouvé`);
  return element;
};

const safeUUID = () => {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id_" + Date.now().toString(36) + Math.random().toString(16).slice(2);
};

// ===== CONSTANTES ET CONFIGURATION =====
const STORAGE_KEY = "quickPrompts";
const THEME_KEY = "quickPromptsTheme";
const DEFAULT_PROMPTS = [
  {
    id: safeUUID(),
    title: "Résumé d'article",
    description: "Synthèse en 5 points",
    keywords: ["résumé", "article"],
    prompt: "Peux-tu résumer cet article en 5 points ?",
    createdAt: Date.now(),
  },
  {
    id: safeUUID(),
    title: "Image onirique",
    description: "Paysage fantastique",
    keywords: ["image", "art", "paysage"],
    prompt:
      "Crée une illustration d'un paysage fantastique au coucher du soleil, style aquarelle.",
    createdAt: Date.now() - 100000,
  },
];
const MAX_PROMPTS = 1000; // Limite de prompts

// ===== GESTION DU THÈME =====
const applyTheme = (theme) =>
  document.documentElement.setAttribute("data-theme", theme);
(function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);
})();

// ===== GESTION DU STOCKAGE =====
const loadPrompts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Validation des données chargées
    return parsed.filter((p) => validatePrompt(p)).slice(0, MAX_PROMPTS);
  } catch (err) {
    console.error("Erreur lors du chargement:", err);
    return [];
  }
};

const savePrompts = (prompts) => {
  if (!checkStorageLimit()) {
    alert("Limite de stockage dépassée. Veuillez supprimer des prompts.");
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    return true;
  } catch (err) {
    console.error("Erreur lors de la sauvegarde:", err);
    alert("Erreur lors de la sauvegarde des données");
    return false;
  }
};

// ===== ÉTAT DE L'APPLICATION =====
let prompts = loadPrompts();
if (!prompts.length) {
  prompts = DEFAULT_PROMPTS;
  savePrompts(prompts);
}

// ===== RÉFÉRENCES DOM =====
const promptForm = $("promptForm");
const promptIdInput = $("promptId");
const titleInput = $("title");
const descInput = $("description");
const kwInput = $("keywords");
const promptTextInput = $("prompt");
const cancelEditBtn = $("cancelEdit");
const searchInput = $("searchInput");
const sortSelect = $("sortSelect");
const promptList = $("promptList");
const exportSelect = $("exportSelect");
const themeToggle = $("themeToggle");
const storageModal = $("storageModal");
const storageContent = $("storageContent");
const viewStorageBtn = $("viewStorage");
const closeModal = $("closeModal");
const fileInput = $("fileInput");
const toggleFormBtn = $("toggleForm");

// ===== FONCTIONS DE RENDU =====
function renderPrompts() {
  try {
    const query = searchInput.value.toLowerCase();
    const order = sortSelect.value;

    const filtered = prompts.filter((p) =>
      [p.title, p.description, p.prompt, ...(p.keywords || [])]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );

    filtered.sort((a, b) =>
      order === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    );

    promptList.innerHTML = filtered
      .map(
        (p) => `
            <article class="card" data-id="${sanitizeHTML(p.id)}">
                <h3>${sanitizeHTML(p.title)}</h3>
                ${p.description ? `<p>${sanitizeHTML(p.description)}</p>` : ""}
                <pre>${sanitizeHTML(p.prompt)}</pre>
                <div class="tags">
                    ${(p.keywords || [])
                      .map((k) => `<span class="tag">${sanitizeHTML(k)}</span>`)
                      .join("")}
                </div>
                <footer>
                    <button class="btn btn-secondary" data-action="copy">Copier</button>
                    <button class="btn btn-primary" data-action="edit">Éditer</button>
                    <button class="btn btn-danger" data-action="delete">Supprimer</button>
                </footer>
            </article>
        `
      )
      .join("");
  } catch (err) {
    console.error("Erreur lors du rendu:", err);
    promptList.innerHTML =
      '<p class="error">Erreur lors de l\'affichage des prompts</p>';
  }
}

function resetForm() {
  promptForm.reset();
  promptIdInput.value = "";
  cancelEditBtn.style.display = "none";
  $("saveBtn").textContent = "Enregistrer";
  if (!promptForm.classList.contains("collapsed")) {
    promptForm.classList.remove("expanded");
    promptForm.classList.add("collapsed");
    toggleFormBtn.textContent = "+";
  }
}

// ===== GESTION DES PROMPTS =====
function addPrompt(prompt) {
  if (!validatePrompt(prompt)) {
    alert("Données invalides");
    return false;
  }

  if (prompts.length >= MAX_PROMPTS) {
    alert("Nombre maximum de prompts atteint");
    return false;
  }

  prompts.push(prompt);
  return savePrompts(prompts);
}

function updatePrompt(index, prompt) {
  if (!validatePrompt(prompt)) {
    alert("Données invalides");
    return false;
  }

  prompts[index] = prompt;
  return savePrompts(prompts);
}

function deletePrompt(id) {
  prompts = prompts.filter((p) => p.id !== id);
  return savePrompts(prompts);
}

// ===== GESTION DES ÉVÉNEMENTS =====
// Formulaire
function importPromptsFromFile(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const content = e.target.result;

      // Vérifie l'extension JSON uniquement
      if (!file.name.endsWith(".json")) {
        alert("Erreur : seuls les fichiers .json sont acceptés.");
        return;
      }

      let imported;
      try {
        imported = JSON.parse(content);
      } catch (err) {
        alert("Erreur : le fichier JSON est mal formé.");
        return;
      }

      if (!Array.isArray(imported)) {
        alert("Erreur : le JSON doit contenir un tableau de prompts.");
        return;
      }

      if (imported.length === 0) {
        alert("Le fichier est vide ou ne contient aucun prompt.");
        return;
      }

      let importedCount = 0;

      for (const p of imported) {
        if (!validatePrompt(p)) continue;

        // Vérifie doublon exact par titre + prompt
        const exists = prompts.find(
          (existing) =>
            existing.title === p.title && existing.prompt === p.prompt
        );

        if (exists) {
          // Fusionner les mots-clés et conserver description la plus complète
          exists.description = p.description || exists.description;
          exists.keywords = Array.from(
            new Set([...(exists.keywords || []), ...(p.keywords || [])])
          );
        } else {
          // Nouveau prompt
          p.id = safeUUID();
          p.createdAt = Date.now();
          prompts.push(p);
        }

        importedCount++;
      }

      if (importedCount === 0) {
        alert("Aucun prompt valide n’a été importé.");
        return;
      }

      savePrompts(prompts);
      renderPrompts();
      alert(`${importedCount} prompt(s) importé(s) avec succès.`);
    } catch (err) {
      console.error("Erreur d'importation :", err);
      alert("Une erreur est survenue lors de l'import.");
    }
  };

  reader.readAsText(file);
}

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    importPromptsFromFile(fileInput.files[0]);
  }
});

// Actions sur les cartes
promptList.addEventListener("click", (e) => {
  e.preventDefault();

  const action = e.target.dataset.action;
  if (!action) return;
  const card = e.target.closest(".card");
  const id = card.dataset.id;
  const prompt = prompts.find((p) => p.id === id);
  if (!prompt) return;

  switch (action) {
    case "copy":
      const text = `### ${prompt.title}\n\n${
        prompt.description ? prompt.description + "\n\n" : ""
      }${prompt.prompt}\n\nKeywords: ${prompt.keywords.join(", ")}`;
      const copyButton = e.target;
      const originalText = copyButton.textContent;

      navigator.clipboard
        ?.writeText(text)
        .then(() => {
          copyButton.textContent = "Copié !";
          setTimeout(() => {
            copyButton.textContent = originalText;
          }, 2000);
        })
        .catch(() => {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          copyButton.textContent = "Copié !";
          setTimeout(() => {
            copyButton.textContent = originalText;
          }, 2000);
        });
      break;

    case "edit":
      promptIdInput.value = prompt.id;
      titleInput.value = prompt.title;
      descInput.value = prompt.description;
      kwInput.value = (prompt.keywords || []).join(", ");
      promptTextInput.value = prompt.prompt;
      cancelEditBtn.style.display = "inline-block";
      $("saveBtn").textContent = "Mettre à jour";

      // Ouvrir le formulaire
      if (promptForm.classList.contains("collapsed")) {
        promptForm.classList.remove("collapsed");
        promptForm.classList.add("expanded");
        toggleFormBtn.textContent = "−";
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
      break;

    case "delete":
      if (confirm("Supprimer ce prompt ?")) {
        deletePrompt(id);
        renderPrompts();
      }
      break;
  }
});

// Annulation de l'édition
cancelEditBtn.addEventListener("click", resetForm);

// Recherche et tri
searchInput.addEventListener("input", renderPrompts);
sortSelect.addEventListener("change", renderPrompts);

// Export CSV
function promptsToCSV() {
  const headers = ["Titre", "Description", "Mots_cles", "Prompt", "CreatedAt"];
  const rows = prompts.map((p) => [
    p.title,
    p.description,
    (p.keywords || []).join("|"),
    p.prompt,
    new Date(p.createdAt).toISOString(),
  ]);
  return [headers, ...rows]
    .map((row) =>
      row
        .map((field) =>
          row.map(
            (field) =>
              `"${escapeCSV(field)
                .replace(/"/g, '""')
                .replace(/\r?\n/g, "\\n")}"`
          )
        )
        .join(";")
    )
    .join("\n");
}

function escapeCSV(field) {
  const s = String(field).trim();
  if (/^[=+\-@]/.test(s)) {
    return `'${s}`;
  }
  return s;
}

// Export/Import
exportSelect.addEventListener("change", () => {
  const action = exportSelect.value;
  if (!action) return;

  try {
    switch (action) {
      case "export-csv":
        openPreview(promptsToCSV(), "text/csv;charset=utf-8", "prompts.csv");
        break;
      case "export-json":
        openPreview(
          JSON.stringify(prompts, null, 2),
          "application/json",
          "prompts.json"
        );
        break;
      case "export-md":
        openPreview(promptsToMarkdown(), "text/markdown", "prompts.md");
        break;
      case "import":
        fileInput.click();
        break;
    }
  } catch (err) {
    console.error("Erreur export/import:", err);
    alert("Erreur lors de l'opération");
  } finally {
    exportSelect.value = "";
  }
});

const previewModal = $("previewModal");
const previewContent = $("previewContent");
const closePreview = $("closePreview");
const confirmDownload = $("confirmDownload");

let pendingDownload = null;

function openPreview(content, type, filename) {
  previewContent.textContent = content;
  previewModal.classList.add("open");
  pendingDownload = { content, type, filename };
}

function downloadPending() {
  if (!pendingDownload) return;
  const blob = new Blob([pendingDownload.content], {
    type: pendingDownload.type,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = pendingDownload.filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
  previewModal.classList.remove("open");
  pendingDownload = null;
}

closePreview.addEventListener("click", () => {
  previewModal.classList.remove("open");
  pendingDownload = null;
});

confirmDownload.addEventListener("click", downloadPending);

// Thème
themeToggle.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.getAttribute("data-theme") || "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem(THEME_KEY, nextTheme);
  themeToggle.innerHTML =
    nextTheme === "dark" ? "🌙 Mode sombre" : "☀️ Mode clair";
});

// Modal de stockage
viewStorageBtn.addEventListener("click", () => {
  storageContent.textContent = JSON.stringify(
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"),
    null,
    2
  );
  storageModal.classList.add("open");
});

closeModal.addEventListener("click", () =>
  storageModal.classList.remove("open")
);

// ===== GESTION DU FORMULAIRE =====
toggleFormBtn.addEventListener("click", () => {
  if (promptForm.classList.contains("collapsed")) {
    promptForm.classList.remove("collapsed");
    promptForm.classList.add("expanded");
    toggleFormBtn.textContent = "Close";
    toggleFormBtn.position = "right";
  } else {
    promptForm.classList.remove("expanded");
    promptForm.classList.add("collapsed");
    toggleFormBtn.textContent = "Add";
    resetForm();
  }
});

promptForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = promptIdInput.value || safeUUID();
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const keywords = kwInput.value
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const promptText = promptTextInput.value.trim();

  const newPrompt = {
    id,
    title,
    description,
    keywords,
    prompt: promptText,
    createdAt: Date.now(),
  };

  if (!validatePrompt(newPrompt)) {
    alert("Certains champs sont invalides ou manquants.");
    return;
  }

  if (promptIdInput.value) {
    const index = prompts.findIndex((p) => p.id === id);
    if (index !== -1) updatePrompt(index, newPrompt);
  } else {
    addPrompt(newPrompt);
  }

  renderPrompts();
  resetForm();
});

function promptsToMarkdown() {
  return prompts
    .map((p) => {
      return `### ${p.title}
${p.description ? `**Description :** ${p.description}\n` : ""}
**Mots-clés :** ${p.keywords.join(", ")}

\`\`\`
${p.prompt}
\`\`\`

*Créé le : ${new Date(p.createdAt).toLocaleString()}*
`;
    })
    .join("\n\n---\n\n");
}

// ===== INITIALISATION =====
try {
  prompts = loadPrompts();
  if (!prompts.length) {
    prompts = DEFAULT_PROMPTS;
    savePrompts(prompts);
  }
  renderPrompts();
} catch (err) {
  console.error("Erreur lors de l'initialisation:", err);
  alert("Erreur lors du chargement de l'application");
}
