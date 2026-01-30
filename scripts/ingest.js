// Ingestion script (data.gov.in + scraping placeholders)
// Writes normalized results to web/jobs.json

const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "web", "jobs.json");
const sourcesPath = path.join(__dirname, "..", "sources.json");

const API_KEY = process.env.DATA_GOV_API_KEY || "";
const sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function ingestDataGov() {
  const items = [];
  if (!API_KEY) return items;
  for (const s of sources.dataGovResources || []) {
    if (!s.resource_id) continue;
    const url = `https://api.data.gov.in/resource/${s.resource_id}?api-key=${API_KEY}&format=json&limit=100`;
    const data = await fetchJson(url);
    const records = data.records || [];
    for (const r of records) {
      items.push({
        id: `${s.resource_id}:${r._id || r.id || Math.random()}`,
        title: r.title || s.title || "Government Recruitment",
        category: s.category || "Other",
        state: r.state || s.state || "All India",
        qualification: r.qualification || "",
        ageMax: parseInt(r.age_max || 0) || 60,
        posted: r.posted_date || r.date || new Date().toISOString().slice(0, 10),
        deadline: r.deadline || r.last_date || new Date().toISOString().slice(0, 10),
        source: s.sourceUrl || "https://data.gov.in/",
        sourceName: s.sourceName || "data.gov.in",
        tags: ["data.gov.in"],
      });
    }
  }
  return items;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractLinks(html, baseUrl) {
  const links = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1];
    const text = stripTags(m[2]);
    if (!text) continue;
    if (href.startsWith("/")) href = new URL(href, baseUrl).toString();
    if (!href.startsWith("http")) continue;
    links.push({ href, text });
  }
  return links;
}

async function ingestScrapePlaceholders() {
  const items = [];
  const today = new Date().toISOString().slice(0, 10);
  for (const s of sources.scrapeSources || []) {
    try {
      const res = await fetch(s.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const links = extractLinks(html, s.url);
      const kws = (s.keywords || []).map(k => k.toLowerCase());
      for (const l of links) {
        const t = l.text.toLowerCase();
        if (!kws.some(k => t.includes(k.toLowerCase()))) continue;
        items.push({
          id: `${s.name}:${l.href}`,
          title: l.text,
          category: s.name,
          state: "All India",
          qualification: "",
          ageMax: 60,
          posted: today,
          deadline: today,
          source: l.href,
          sourceName: s.name,
          tags: ["scraped"],
        });
      }
    } catch (e) {
      // ignore
    }
  }
  return items;
}

(async () => {
  try {
    const items = [
      ...(await ingestDataGov()),
      ...(await ingestScrapePlaceholders()),
    ];

    if (!items.length) {
      console.warn("No real data pulled yet; keeping existing demo data.");
      return;
    }

    fs.writeFileSync(outPath, JSON.stringify(items, null, 2));
    console.log(`jobs.json updated (${items.length} items)`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
