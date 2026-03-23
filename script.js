
const STORAGE_KEY = "calendrier_examens_2026";
const EXAM_DATE = new Date("2026-06-01T00:00:00");
const state = loadState();

const daysGrid = document.getElementById("daysGrid");
const template = document.getElementById("dayCardTemplate");
const doneCountEl = document.getElementById("doneCount");
const remainingCountEl = document.getElementById("remainingCount");
const remainingWeeksEl = document.getElementById("remainingWeeks");
const daysUntilExamEl = document.getElementById("daysUntilExam");
const weeksUntilExamEl = document.getElementById("weeksUntilExam");
const progressFillEl = document.getElementById("progressFill");
const progressTextEl = document.getElementById("progressText");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");

let activeFilter = "all";

renderAll();
updateTopSummary();
updateCountdown();

searchInput.addEventListener("input", applyFilters);
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateTopSummary();
  updateCountdown();
}

function getEntry(iso) {
  if (!state[iso]) {
    state[iso] = {
      done: false,
      general: "",
      good: "",
      bad: "",
      improve: ""
    };
  }
  return state[iso];
}

function renderAll() {
  daysGrid.innerHTML = "";
  DAYS.forEach((day) => {
    const entry = getEntry(day.iso);
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".day-card");
    const badge = clone.querySelector(".date-badge");
    const title = clone.querySelector(".date-title");
    const countInline = clone.querySelector(".count-inline");
    const checkbox = clone.querySelector(".done-checkbox");
    const general = clone.querySelector(".note-general");
    const good = clone.querySelector(".note-good");
    const bad = clone.querySelector(".note-bad");
    const improve = clone.querySelector(".note-improve");
    const clearBtn = clone.querySelector(".clear-btn");

    card.dataset.date = day.iso;
    badge.textContent = day.label;
    title.textContent = `${day.weekday} ${day.day} ${day.month}`;
    countInline.textContent = day.days_left === 1
      ? "Il reste 1 jour avant les examens."
      : `Il reste ${day.days_left} jours avant les examens.`;

    checkbox.checked = entry.done;
    general.value = entry.general;
    good.value = entry.good;
    bad.value = entry.bad;
    improve.value = entry.improve;

    if (entry.done) card.classList.add("done");

    checkbox.addEventListener("change", () => {
      entry.done = checkbox.checked;
      card.classList.toggle("done", entry.done);
      saveState();
      applyFilters();
    });

    [general, good, bad, improve].forEach((field) => {
      field.addEventListener("input", () => {
        entry.general = general.value;
        entry.good = good.value;
        entry.bad = bad.value;
        entry.improve = improve.value;
        saveState();
      });
    });

    clearBtn.addEventListener("click", () => {
      entry.done = false;
      entry.general = "";
      entry.good = "";
      entry.bad = "";
      entry.improve = "";
      checkbox.checked = false;
      general.value = "";
      good.value = "";
      bad.value = "";
      improve.value = "";
      card.classList.remove("done");
      saveState();
      applyFilters();
    });

    daysGrid.appendChild(clone);
  });

  applyFilters();
}

function applyFilters() {
  const search = searchInput.value.trim().toLowerCase();
  const cards = [...document.querySelectorAll(".day-card")];

  cards.forEach((card) => {
    const iso = card.dataset.date;
    const entry = getEntry(iso);
    const day = DAYS.find((d) => d.iso === iso);

    const textBlob = [
      day.label,
      day.weekday,
      day.month,
      entry.general,
      entry.good,
      entry.bad,
      entry.improve
    ].join(" ").toLowerCase();

    const matchesSearch = !search || textBlob.includes(search);
    const matchesFilter =
      (activeFilter === "all" && !entry.done) ||
      (activeFilter === "done" && entry.done) ||
      (activeFilter === "pending" && !entry.done);

    card.classList.toggle("hidden", !(matchesSearch && matchesFilter));
  });
}

function updateTopSummary() {
  const entries = DAYS.map((day) => getEntry(day.iso));
  const doneCount = entries.filter((entry) => entry.done).length;
  const total = DAYS.length;
  const remaining = total - doneCount;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((EXAM_DATE - today) / (1000 * 60 * 60 * 24));
  const remainingWeeks = diff > 0 ? Math.ceil(diff / 7) : 0;
  const percent = Math.round((doneCount / total) * 100);

  doneCountEl.textContent = doneCount;
  remainingCountEl.textContent = remaining;
  remainingWeeksEl.textContent = remainingWeeks;
  progressFillEl.style.width = `${percent}%`;
  progressTextEl.textContent = `${percent}% complété`;
}

function updateCountdown() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((EXAM_DATE - today) / (1000 * 60 * 60 * 24));
  const weeks = diff > 0 ? Math.ceil(diff / 7) : 0;
  daysUntilExamEl.style.fontSize = "";

  if (diff > 0) {
    daysUntilExamEl.textContent = diff;
    weeksUntilExamEl.textContent = weeks;
  } else if (diff === 0) {
    daysUntilExamEl.textContent = "0";
    weeksUntilExamEl.textContent = "0";
  } else {
    daysUntilExamEl.textContent = "Examens commencés";
    daysUntilExamEl.style.fontSize = "2rem";
    weeksUntilExamEl.textContent = "0";
  }
}
