const PRIMARY_URL = `${window.location.origin}/jobs.json`;
const FALLBACK_URL = `https://govt-jobs-india.pages.dev/jobs.json`;

window.addEventListener('error', (e) => {
  });

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
  waShare: document.getElementById("waShare"),
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

  const related = items.slice(0, 4).map(i => `<a href="/pages/${(i.category||'other').toLowerCase().replace(/\s+/g,'-')}-jobs.html">${i.category||'Other'} jobs</a>`).join(" · ");

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
      <div class="meta">Similar: ${related || ""}</div>
    </div>
  `}).join("");

  // Inject JobPosting schema for top items
  const top = items.slice(0, 5).map(r => {
    const item = normalize(r);
    return {
      "@type": "JobPosting",
      "title": item.title,
      "datePosted": item.posted,
      "validThrough": item.deadline,
      "employmentType": "FULL_TIME",
      "hiringOrganization": {
        "@type": "Organization",
        "name": item.sourceName || "Government"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": item.state || "All India",
          "addressCountry": "IN"
        }
      },
      "applicationContact": {"@type": "ContactPoint", "url": item.source},
      "url": item.source
    };
  });

  let schema = document.getElementById('jobposting-schema');
  if (!schema) {
    schema = document.createElement('script');
    schema.type = 'application/ld+json';
    schema.id = 'jobposting-schema';
    document.head.appendChild(schema);
  }
  schema.textContent = JSON.stringify({"@context":"https://schema.org","@graph": top});

  if (!items.length) {
    els.list.innerHTML = `<div class="muted">No results found. Try adjusting filters.</div>`;
  }
}

let loadError = null;
async function loadData() {
  try {
        let res = await fetch(PRIMARY_URL, {cache: 'no-cache'});
    if (!res.ok) throw new Error(`Primary fetch failed (${res.status})`);
    const text = await res.text();
    const json = JSON.parse(text);
    data = Array.isArray(json) ? json : [];
    window.data = data;
      } catch (e1) {
    try {
            const res2 = await fetch(FALLBACK_URL, {cache: 'no-cache'});
      if (!res2.ok) throw new Error(`Fallback fetch failed (${res2.status})`);
      const text2 = await res2.text();
      const json2 = JSON.parse(text2);
      data = Array.isArray(json2) ? json2 : [];
      window.data = data;
          } catch (e2) {
      data = [];
      loadError = e2;
          }
  }
  render();
}

[els.q, els.category, els.state, els.qualification, els.age, els.sort].forEach(el => {
  if (!el) return;
  el.addEventListener("input", render);
  el.addEventListener("change", render);
});

if (els.searchBtn) els.searchBtn.addEventListener("click", render);
if (els.apply) els.apply.addEventListener("click", render);

if (els.reset) {
  els.reset.addEventListener("click", () => {
    if (els.q) els.q.value = "";
    if (els.category) els.category.value = "";
    if (els.state) els.state.value = "";
    if (els.qualification) els.qualification.value = "";
    if (els.age) els.age.value = "";
    if (els.sort) els.sort.value = "deadline";
    render();
  });
}

if (els.subscribe) {
  els.subscribe.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    if (!name || !email) return;
    // Placeholder: store in Supabase later.
    alert("Thanks! We’ll notify you soon.");
    els.subscribe.reset();
  });
}

if (els.shareBtn) {
  els.shareBtn.addEventListener("click", async () => {
    const url = els.shareLink.value;
    if (navigator.share) {
      try { await navigator.share({ title: "Govt Jobs India", url }); } catch {}
    } else {
      els.shareLink.select();
    }
  });
}

if (els.copyLink) {
  els.copyLink.addEventListener("click", async () => {
    const url = els.shareLink.value;
    await navigator.clipboard.writeText(url);
    alert("Link copied");
  });
}

const waText = encodeURIComponent("Latest Govt Jobs in India — updated daily. Join for alerts: " + els.shareLink.value);
els.waShare.href = `https://wa.me/?text=${waText}`;

if (els.upgrade) els.upgrade.addEventListener("click", () => alert("Premium coming soon"));
if (els.buy) els.buy.addEventListener("click", () => alert("Premium coming soon"));

const stickyEmail = document.getElementById("stickyEmail");
if (stickyEmail) {
  stickyEmail.addEventListener("click", () => {
    const email = document.getElementById("email");
    if (email) email.focus();
  });
}

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

if (els.langEn) els.langEn.addEventListener("click", () => setLang("en"));
if (els.langHi) els.langHi.addEventListener("click", () => setLang("hi"));

setLang("en");

function track(type) {
  const key = `click_${type}`;
  const count = parseInt(localStorage.getItem(key) || "0", 10) + 1;
  localStorage.setItem(key, count.toString());
}

// Track key CTAs on homepage
const tg = document.getElementById('tgJoin');
const mock = document.querySelector('.sticky-cta a.btn');
const wa = document.getElementById('waShare');
[tg, mock, wa].forEach(el => {
  if (!el) return;
  el.addEventListener('click', () => track(el.id || el.textContent.trim()));
});

const exportBtn = document.getElementById('exportClicks');
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const rows = [
      ['Date','Click Type','Count'],
      ['today','Telegram', localStorage.getItem('click_tgJoin') || 0],
      ['today','MockTest', localStorage.getItem('click_Free Mock Test') || 0],
      ['today','WhatsAppShare', localStorage.getItem('click_waShare') || 0],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'clicks.csv'; a.click();
    URL.revokeObjectURL(url);
  });
}

loadData();
window.addEventListener('load', () => loadData());
setTimeout(() => loadData(), 2000);
