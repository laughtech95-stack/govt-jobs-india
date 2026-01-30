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
  shareBtn: document.getElementById("shareBtn"),
  shareLink: document.getElementById("shareLink"),
  copyLink: document.getElementById("copyLink"),
  upgrade: document.getElementById("upgrade"),
  buy: document.getElementById("buy"),
  langEn: document.getElementById("langEn"),
  langHi: document.getElementById("langHi"),
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

function daysLeft(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function render() {
  let items = data.filter(matches);
  items = sortItems(items);
  els.count.textContent = `${items.length} result(s)`;

  els.list.innerHTML = items.map(itemRaw => {
    const item = normalize(itemRaw);
    const left = daysLeft(item.deadline);
    const soon = left !== null && left <= 7;
    return `
    <div class="card">
      <div>
        <h3>${item.title}</h3>
        <div class="meta">Posted: ${item.posted} · Deadline: ${item.deadline}</div>
      </div>
      <div>
        <span class="badge">${item.category}</span>
        <span class="badge">${item.state}</span>
        ${item.qualification ? `<span class=\"badge\">${item.qualification}</span>` : ""}
        <span class="badge">Age ≤ ${item.ageMax}</span>
        ${soon ? `<span class=\"badge soon\">Closing Soon</span>` : ""}
      </div>
      <div class="meta">Source: ${item.sourceName || "Official"}</div>
      <div class="cta">
        <a href="${item.source}" target="_blank" rel="noopener">Official Link</a>
      </div>
    </div>
  `}).join("");

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

els.shareBtn.addEventListener("click", async () => {
  const url = els.shareLink.value;
  if (navigator.share) {
    try { await navigator.share({ title: "Govt Jobs India", url }); } catch {}
  } else {
    els.shareLink.select();
  }
});

els.copyLink.addEventListener("click", async () => {
  const url = els.shareLink.value;
  await navigator.clipboard.writeText(url);
  alert("Link copied");
});

els.upgrade.addEventListener("click", () => alert("Premium coming soon"));
els.buy.addEventListener("click", () => alert("Premium coming soon"));

const stickyEmail = document.getElementById("stickyEmail");
stickyEmail.addEventListener("click", () => {
  document.getElementById("email").focus();
});

const copy = (t) => {
  document.querySelectorAll('[data-i18n]')?.forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (t[k]) el.textContent = t[k];
  });
};

const i18n = {
  en: {
    tagline: "Find government job notifications based on your interests",
    heroTitle: "Daily government job updates, tailored for you",
    heroSubtitle: "Choose your state, category, qualification and age. We’ll show only what matches.",
    tgJoin: "Join Telegram Alerts",
    tgSub: "Instant alerts on Telegram (free)",
    notify: "Notify Me",
    waNote: "WhatsApp alerts will be enabled later.",
    upgrade: "Get instant alerts",
    upgradeSub: "closing soon, priority exams, and custom filters.",
    upgradeBtn: "Upgrade to Premium",
    shareTitle: "Share with friends",
    shareSub: "Help others find jobs faster. Share this site.",
    shareBtn: "Share",
    copyLink: "Copy Link",
    refer: "Refer 5 friends to unlock priority alerts.",
    pricing: "Pricing",
    free: "Free",
    freeSub: "Daily digest + basic filters",
    premium: "Premium",
    premiumSub: "Instant alerts, WhatsApp, closing‑soon",
    buy: "Start Premium",
    emailAlerts: "Get Email Alerts",
  },
  hi: {
    tagline: "अपनी रुचि के अनुसार सरकारी नौकरी सूचनाएँ पाएँ",
    heroTitle: "रोज़ाना सरकारी नौकरी अपडेट — आपके लिए",
    heroSubtitle: "राज्य, श्रेणी, योग्यता और आयु चुनें। हम वही दिखाएँगे जो मेल खाता है।",
    tgJoin: "टेलीग्राम अलर्ट जॉइन करें",
    tgSub: "टेलीग्राम पर तुरंत अलर्ट (मुफ़्त)",
    notify: "मुझे सूचित करें",
    waNote: "WhatsApp अलर्ट बाद में चालू होंगे।",
    upgrade: "तुरंत अलर्ट पाएं",
    upgradeSub: "क्लोज़िंग‑सून, प्रायोरिटी परीक्षाएँ और कस्टम फ़िल्टर।",
    upgradeBtn: "प्रीमियम में अपग्रेड करें",
    shareTitle: "दोस्तों के साथ साझा करें",
    shareSub: "दूसरों को नौकरी जल्दी मिले — इस साइट को साझा करें।",
    shareBtn: "साझा करें",
    copyLink: "लिंक कॉपी करें",
    refer: "5 दोस्तों को रेफ़र करें और प्रायोरिटी अलर्ट पाएं।",
    pricing: "प्राइसिंग",
    free: "फ्री",
    freeSub: "डेली डाइजेस्ट + बेसिक फ़िल्टर",
    premium: "प्रीमियम",
    premiumSub: "तुरंत अलर्ट, WhatsApp, क्लोज़िंग‑सून",
    buy: "प्रीमियम शुरू करें",
    emailAlerts: "ईमेल अलर्ट पाएँ",
  }
};

function setLang(lang) {
  document.documentElement.lang = lang;
  copy(i18n[lang]);
}

els.langEn.addEventListener("click", () => setLang("en"));
els.langHi.addEventListener("click", () => setLang("hi"));

setLang("en");

loadData();
