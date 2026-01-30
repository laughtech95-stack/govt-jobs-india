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

async function ingestScrapePlaceholders() {
  // Placeholder: real scraping to be implemented per site
  return [];
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
