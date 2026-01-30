// Placeholder ingestion script
// Connect NCS/data.gov.in APIs here and write normalized results to web/jobs.json or Supabase

const fs = require("fs");
const path = require("path");

const outPath = path.join(__dirname, "..", "web", "jobs.json");

const demo = [
  {
    id: 1,
    title: "SSC CGL 2026",
    category: "SSC",
    state: "All India",
    qualification: "Graduate",
    ageMax: 30,
    posted: "2026-01-20",
    deadline: "2026-02-25",
    source: "https://ssc.nic.in/",
    sourceName: "SSC",
    tags: ["Tier-1", "General"],
  },
];

fs.writeFileSync(outPath, JSON.stringify(demo, null, 2));
console.log("jobs.json updated");
