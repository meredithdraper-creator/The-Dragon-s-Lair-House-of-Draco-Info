/* ============================================================
   HOUSE OF DRACO — LIVE SHEET CONFIG
   -------------------------------------------------------------
   This is the file you edit once you've built your Google Form(s)
   and Google Sheet. Everything else (app.js) just reads from the
   URLs you paste in here.

   HOW THE LINK WORKS (once, per tab, in Google Sheets):
     File -> Share -> Publish to web
       -> under "Link", choose the specific sheet/tab (not "Entire
          Document") -> choose "Comma-separated values (.csv)"
       -> click Publish -> copy the URL it gives you.
     Repeat once per tab (Wisdom Keepers, Den Guides, Loyalty Flame
     Keepers, Gratitude Log, Schedule) and paste each URL below.

   Until you paste real URLs in, the site runs on the small sample
   rows at the bottom of this file, so the layout and features are
   visible right away.
   ============================================================ */

const SHEETS_CONFIG = {
  // Paste your five "Publish to web" CSV links here.
  wisdomKeepersUrl: "",   // Wisdom Keepers (academic peer tutoring) form responses
  denGuidesUrl: "",       // Den Guides (locker organizing volunteers) form responses
  flameKeepersUrl: "",    // Loyalty Flame Keepers sign-up/assignment responses
  gratitudeUrl: "",       // Gratitude Log form responses
  scheduleUrl: "",        // Schedule tab (teachers edit this one directly — no form)

  // Paste your four Google Form "embed" links here (Send -> <> -> copy embed src).
  // Looks like: https://docs.google.com/forms/d/e/1FAIpQ.../viewform?embedded=true
  wisdomKeepersFormEmbed: "",
  denGuidesFormEmbed: "",
  flameKeepersFormEmbed: "",
  gratitudeFormEmbed: "",

  // The normal (non-published) URL to the spreadsheet itself, for the
  // "Open the spreadsheet" link teachers use to edit the Schedule tab directly.
  // Looks like: https://docs.google.com/spreadsheets/d/1AbCdEfG.../edit
  spreadsheetEditUrl: "",

  // How often to re-check the sheets for changes, in milliseconds.
  refreshIntervalMs: 60000,
};

/* ---------- CSV fetch + parse (no dependencies) ---------- */

function parseCSV(text) {
  const rows = [];
  let row = [],
    field = "",
    inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (r[i] || "").trim()));
    return obj;
  });
}

// Fetches a published-CSV URL and returns an array of row objects keyed by header.
// Returns null (rather than throwing) if the URL is blank or the fetch fails, so
// callers can fall back to sample data.
async function fetchSheetTab(url) {
  if (!url) return null;
  try {
    const bust = (url.includes("?") ? "&" : "?") + "cachebust=" + Date.now();
    const res = await fetch(url + bust, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    return rowsToObjects(parseCSV(text));
  } catch (e) {
    console.warn("Could not load live sheet data, falling back to sample data:", e);
    return null;
  }
}

/* ============================================================
   SAMPLE DATA — shown whenever a live sheet isn't connected yet,
   so the site is fully interactive to look at from the start.
   Remove or ignore this once your real sheets are wired up above.
   ============================================================ */

const SAMPLE_WISDOM_KEEPERS = [
  { Timestamp: "9/2/2026 8:03:00", Name: "Priya Chandra", Homeroom: "HR 102", "Subject(s)": "Algebra II, Geometry", "How can you help?": "Study for classes, Review notes" },
  { Timestamp: "9/3/2026 14:22:00", Name: "Marcus Webb", Homeroom: "HR 104", "Subject(s)": "Biology", "How can you help?": "Study for classes" },
  { Timestamp: "9/5/2026 9:47:00", Name: "Elena Ford", Homeroom: "HR 101", "Subject(s)": "Spanish, French", "How can you help?": "Review notes, Organize classwork" },
];

const SAMPLE_DEN_GUIDES = [
  { Timestamp: "9/1/2026 10:00:00", Name: "Jonah Pierce", Homeroom: "HR 103" },
  { Timestamp: "9/2/2026 11:15:00", Name: "Ada Solis", Homeroom: "HR 105" },
];

const SAMPLE_FLAME_KEEPERS = [
  { Timestamp: "9/1/2026 9:10:00", Name: "Simone Okafor", Homeroom: "HR 101", "How assigned?": "Volunteer" },
  { Timestamp: "9/2/2026 8:40:00", Name: "HR 104 (whole homeroom)", Homeroom: "HR 104", "How assigned?": "Assigned by HR" },
];

const SAMPLE_GRATITUDE = [
  { Timestamp: "9/8/2026 12:10:00", Name: "Noor Aziz", Method: "Handwritten card", "What did you do?": "Left a thank-you card for the dining staff after lunch." },
  { Timestamp: "9/9/2026 15:40:00", Name: "Teo Ramos", Method: "In-person encounter", "What did you do?": "Thanked the bus driver by name this morning." },
];

const SAMPLE_SCHEDULE = [
  // Program, Week Of, Homeroom — this is exactly what the teacher-editable "Schedule" tab looks like.
  { Program: "weekly_watch", "Week Of": "2026-09-14", Homeroom: "HR 103" },
  { Program: "vault", "Week Of": "2026-09-14", Homeroom: "HR 105" },
];
