// --- Navigation entre pages ---
function showPage(nom) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById("page-" + nom).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.page === nom)
  );
  if (nom === "stats") majStats();
}

// --- Streak ---
let streakData = JSON.parse(localStorage.getItem("streakData")) || {
  start: new Date().toISOString(),
  best: 0,
};

function joursDepuis(dateISO) {
  const debut = new Date(dateISO);
  const maintenant = new Date();
  const diffMs = maintenant.setHours(0,0,0,0) - debut.setHours(0,0,0,0);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function afficher() {
  const jours = joursDepuis(streakData.start);
  document.getElementById("streak-number").textContent = jours;
  document.getElementById("streak-best").textContent = streakData.best;

  const perimetre = 597;
  const progres = Math.min(jours / 30, 1);
  document.getElementById("ring-fg").style.strokeDashoffset = perimetre - progres * perimetre;
}

function signalerRechute() {
  const joursActuels = joursDepuis(streakData.start);
  if (joursActuels > streakData.best) streakData.best = joursActuels;
  streakData.start = new Date().toISOString();
  localStorage.setItem("streakData", JSON.stringify(streakData));
  afficher();
}

// --- Bouton urgence ---
let breathInterval, timerInterval;
const phases = ["Inspire", "Retiens", "Expire"];
let phaseIndex = 0;

function ouvrirUrgence() {
  document.getElementById("urgence-overlay").classList.remove("hidden");
  phaseIndex = 0;
  majPhase();
  breathInterval = setInterval(majPhase, 4000);

  let secondes = 120;
  document.getElementById("timer").textContent = formatTemps(secondes);
  timerInterval = setInterval(() => {
    secondes--;
    document.getElementById("timer").textContent = formatTemps(secondes);
    if (secondes <= 0) clearInterval(timerInterval);
  }, 1000);
}
function majPhase() {
  const cercle = document.getElementById("breath-circle");
  cercle.textContent = phases[phaseIndex];
  cercle.style.transform = phaseIndex === 2 ? "scale(0.8)" : "scale(1.2)";
  phaseIndex = (phaseIndex + 1) % phases.length;
}
function formatTemps(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + String(sec).padStart(2, "0");
}
function fermerUrgence() {
  clearInterval(breathInterval);
  clearInterval(timerInterval);
  document.getElementById("urgence-overlay").classList.add("hidden");
}

// --- Journal ---
let entrees = JSON.parse(localStorage.getItem("entrees")) || [];
let niveauChoisi = null;
let declencheursChoisis = [];
const listeDeclencheurs = ["Ennui", "Stress", "Réseaux sociaux", "Fatigue", "Soirée / seul"];

function construireFormulaire() {
  document.getElementById("scale-row").innerHTML = [1,2,3,4,5].map(n =>
    `<div class="scale-dot" onclick="choisirNiveau(${n})" id="dot-${n}">${n}</div>`
  ).join("");
  document.getElementById("chip-row").innerHTML = listeDeclencheurs.map(t =>
    `<div class="chip" onclick="toggleDeclencheur('${t}')" id="chip-${t}">${t}</div>`
  ).join("");
}
function choisirNiveau(n) {
  niveauChoisi = n;
  [1,2,3,4,5].forEach(i => document.getElementById("dot-" + i).classList.toggle("selected", i === n));
}
function toggleDeclencheur(t) {
  declencheursChoisis = declencheursChoisis.includes(t)
    ? declencheursChoisis.filter(d => d !== t)
    : [...declencheursChoisis, t];
  document.getElementById("chip-" + t).classList.toggle("selected");
}
function enregistrerEntree() {
  if (niveauChoisi === null) { alert("Choisis un niveau de tentation."); return; }
  entrees.unshift({ date: new Date().toISOString(), niveau: niveauChoisi, declencheurs: declencheursChoisis });
  localStorage.setItem("entrees", JSON.stringify(entrees));
  niveauChoisi = null;
  declencheursChoisis = [];
  construireFormulaire();
  afficherEntrees();
}
function afficherEntrees() {
  const conteneur = document.getElementById("liste-entrees");
  if (entrees.length === 0) {
    conteneur.innerHTML = "<p style='color:#8B95A1; font-size:13px;'>Aucune entrée pour l'instant.</p>";
    return;
  }
  conteneur.innerHTML = entrees.map(e => {
    const d = new Date(e.date).toLocaleDateString("fr-FR");
    return `<div class="entree"><b>${d}</b> — Tentation ${e.niveau}/5<br><span style="color:#8B95A1;">${e.declencheurs.join(", ") || "—"}</span></div>`;
  }).join("");
}

// --- Stats ---
function majStats() {
  const total = entrees.length ? joursDepuis(streakData.start) + streakData.best : joursDepuis(streakData.start);
  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-best").textContent = streakData.best;

  const insight = document.getElementById("stat-insight");
  if (entrees.length === 0) {
    insight.textContent = "Ajoute des entrées de journal pour voir tes tendances.";
  } else {
    const soir = entrees.filter(e => e.declencheurs.includes("Soirée / seul")).length;
    const pct = Math.round((soir / entrees.length) * 100);
    insight.innerHTML = `Environ <b style="color:#D9A05B;">${pct}%</b> de tes entrées mentionnent une soirée seul comme déclencheur.`;
  }
}

// --- Initialisation ---
afficher();
construireFormulaire();
afficherEntrees();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}