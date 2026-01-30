const DEMO_FALLBACK_URL = "./jobs.json";

const els = {
  q: document.getElementById("q"),
  searchBtn: document.getElementById("searchBtn"),
  category: document.getElementById("category"),
  state: document.getElementById("state"),
  qualification: document.getElementById("qualification"),
  age: document.getElementById("age"),
  sort: document.getElementById("sort"),
  apply: document.getElementById("apply"),
  reset: document.getElementById("reset"),
  list: document.getElementById("list"),
  count: document.getElementById("count"),
  subscribe: document.getElementById("subscribe"),
};

let data = [];

function normalize(item) {
  return {
    ...item,
    title: item.title || "",
    category: item.category || "Other",
    state: item.state || "All India",
    qualification: item.qualification || "",
    ageMax: Number(item.ageMax || 60),
    tags: item.tags || [],
    sourceName: item.sourceName || "Official",
  };
}

function matches(itemRaw) {
  const item = normalize(itemRaw);
  const q = els.q.value.trim().toLowerCase();
  if (q) {
    const hay = `${item.title} ${item.category} ${item.state} ${item.qualification} ${item.sourceName} ${item.tags.join(" ")}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }

  // Case-insensitive matching; if field missing, don't block the item
  if (els.category.value && item.category && item.category.toLowerCase() !== els.category.value.toLowerCase()) return false;
  if (els.state.value && item.state && item.state.toLowerCase() !== els.state.value.toLowerCase()) return false;
  if (els.qualification.value && item.qualification) {
    if (item.qualification.toLowerCase() !== els.qualification.value.toLowerCase()) return false;
  }

  if (els.age.value) {
    const age = parseInt(els.age.value, 10);
    if (item.ageMax < age) return false;
  }
  return true;
}

function sortItems(items) {
  const s = els.sort.value;
  return items.sort((a, b) => {
    if (s === "deadline") return new Date(a.deadline) - new Date(b.deadline);
    return new Date(b.posted) - new Date(a.posted);
  });
}

function render() {
  let items = data.filter(matches);
  items = sortItems(items);
  els.count.textContent = `${items.length} result(s)`;

  els.list.innerHTML = items.map(item => `
    <div class="card">
      <div>
        <h3>${item.title}</h3>
        <div class="meta">Posted: ${item.posted} · Deadline: ${item.deadline}</div>
      </div>
      <div>
        <span class="badge">${item.category}</span>
        <span class="badge">${item.state}</span>
        <span class="badge">${item.qualification}</span>
        <span class="badge">Age ≤ ${item.ageMax}</span>
      </div>
      <div class="meta">Source: ${item.sourceName || "Official"}</div>
      <div class="cta">
        <a href="${item.source}" target="_blank" rel="noopener">Official Link</a>
      </div>
    </div>
  `).join("");

  if (!items.length) {
    els.list.innerHTML = `<div class="muted">No results found. Try adjusting filters.</div>`;
  }
}

async function loadData() {
  const res = await fetch(DEMO_FALLBACK_URL);
  data = await res.json();
  render();
}

[els.q, els.category, els.state, els.qualification, els.age, els.sort].forEach(el => {
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

els.searchBtn.addEventListener("click", render);
els.apply.addEventListener("click", render);

els.reset.addEventListener("click", () => {
  els.q.value = "";
  els.category.value = "";
  els.state.value = "";
  els.qualification.value = "";
  els.age.value = "";
  els.sort.value = "deadline";
  render();
});

els.subscribe.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  if (!name || !email) return;
  // Placeholder: store in Supabase later.
  alert("Thanks! We’ll notify you soon.");
  els.subscribe.reset();
});

loadData();
