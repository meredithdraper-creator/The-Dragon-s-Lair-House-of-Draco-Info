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
     Repeat once per tab (Draco Duties, Loyalty Flame Keepers,
     Gratitude Log, Schedule) and paste each URL below.

   Until you paste real URLs in, the site runs on the small sample
   rows at the bottom of this file, so the layout and features are
   visible right away.
   ============================================================ */

const SHEETS_CONFIG = {
  // Paste your four "Publish to web" CSV links here.
  facultyUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZIT_g6oEpucUtxuyYUeffTuPZkHQnSyS9QxSTE-UzXEF65ElK6MmpKdZqO7L4yhE0J6azemNWHbAz/pub?gid=1000012180&single=true&output=csv",        // House Leaders tab (teachers/admins edit this one directly — no form)
  dutySignupsUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZIT_g6oEpucUtxuyYUeffTuPZkHQnSyS9QxSTE-UzXEF65ElK6MmpKdZqO7L4yhE0J6azemNWHbAz/pub?gid=2130038648&single=true&output=csv",    // Dragon Duty Signup form responses (Den Guide + Wisdom Keeper + Loyalty Flame Keeper — one shared tab)
  gratitudeUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZIT_g6oEpucUtxuyYUeffTuPZkHQnSyS9QxSTE-UzXEF65ElK6MmpKdZqO7L4yhE0J6azemNWHbAz/pub?gid=859687409&single=true&output=csv",      // Gratitude Log form responses
  scheduleUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZIT_g6oEpucUtxuyYUeffTuPZkHQnSyS9QxSTE-UzXEF65ElK6MmpKdZqO7L4yhE0J6azemNWHbAz/pub?gid=1616678462&single=true&output=csv",       // Schedule tab (teachers edit this one directly — no form)

  // Paste your two Google Form "embed" links here (Send -> <> -> copy embed src).
  // Looks like: https://docs.google.com/forms/d/e/1FAIpQ.../viewform?embedded=true
  dutySignupsFormEmbed: "https://docs.google.com/forms/d/e/1FAIpQLSdiWvqyLztCkdO8tbNDTbrdoJCPomaDwMrbmbr3iqkL4FrH7Q/viewform?embedded=true",  // shown on the Vault Rotation, Wisdom Keepers, AND Loyalty Flame Keepers pages
  gratitudeFormEmbed: "",

  // The normal (non-published) URL to the spreadsheet itself. No longer
  // linked to from the site, but kept here in case you want it for your
  // own reference or a future teacher-facing page.
  // Looks like: https://docs.google.com/spreadsheets/d/1AbCdEfG.../edit
  spreadsheetEditUrl: "https://docs.google.com/spreadsheets/d/1TMTRglVa_vAiHf-z8-kqIhz30MEKXThiSMlq7iuGyKI/edit",

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

// One shared "Duty Signups" tab. In your real spreadsheet this tab is built
// with formulas that pull from the raw "Form Responses 1" tab (three separate
// checkbox questions: Den Guide, Wisdom Keeper, Loyalty Flame Keeper) and
// combine them into one "Which duties are you signing up for?" column — see
// the README for the exact formulas. "Subject area(s)" only applies to the
// Wisdom Keeper duty.
const SAMPLE_DUTY_SIGNUPS = [
  {
    Timestamp: "9/1/2026 10:00:00",
    "First Name": "Jonah",
    "Last Name": "Pierce",
    Homeroom: "Owens",
    "Which duties are you signing up for?": "Den Guide",
    "Subject area(s)": "",
  },
  {
    Timestamp: "9/2/2026 8:03:00",
    "First Name": "Priya",
    "Last Name": "Chandra",
    Homeroom: "Listenbee",
    "Which duties are you signing up for?": "Wisdom Keeper",
    "Subject area(s)": "Math, Science",
  },
  {
    Timestamp: "9/3/2026 14:22:00",
    "First Name": "Marcus",
    "Last Name": "Webb",
    Homeroom: "VanCamp",
    "Which duties are you signing up for?": "Den Guide, Wisdom Keeper",
    "Subject area(s)": "Science",
  },
  {
    Timestamp: "9/4/2026 9:10:00",
    "First Name": "Simone",
    "Last Name": "Okafor",
    Homeroom: "Ledford",
    "Which duties are you signing up for?": "Loyalty Flame Keeper",
    "Subject area(s)": "",
  },
];

const SAMPLE_GRATITUDE = [
  { Timestamp: "9/8/2026 12:10:00", Name: "Noor Aziz", Method: "Handwritten card", "What did you do?": "Left a thank-you card for the dining staff after lunch." },
  { Timestamp: "9/9/2026 15:40:00", Name: "Teo Ramos", Method: "In-person encounter", "What did you do?": "Thanked the bus driver by name this morning." },
];

const SAMPLE_SCHEDULE = [
  // Program, Week Of, Homeroom — this is exactly what the teacher-editable "Schedule" tab looks like.
  { Program: "weekly_watch", "Week Of": "2026-09-14", Homeroom: "Owens" },
  { Program: "vault", "Week Of": "2026-09-14", Homeroom: "VanCamp" },
  // "flame_department" rows pick which department is recognized in a given month.
  // "Week Of" holds the 1st of that month; "Homeroom" holds the department id or name
  // from GRATITUDE_DEPARTMENTS in data.js (e.g. "dining" or "Dining Services").
  { Program: "flame_department", "Week Of": "2026-09-01", Homeroom: "dining" },
];

// The "Faculty" tab: Name, Role, Classes, Room, Photo, Type, Year — this is
// exactly what that teacher-editable tab looks like. "Classes" is comma-
// separated. "Photo" can be a path like "assets/faculty/alden.jpg" or any
// direct image URL; leave it blank to show an automatic initials avatar
// instead. "Type" is blank (or "Faculty") for teachers/staff, and "Captain"
// for the one row that's this year's student House Captain — that row uses
// "Year" instead of "Classes"/"Room".
const SAMPLE_FACULTY = [
  { Name: "Ms. Ledford", Role: "Homeroom Teacher, Ledford", Classes: "Algebra II, Geometry", Room: "204", Photo: "", Type: "Faculty", Year: "" },
  { Name: "Mr. Listenbee", Role: "Homeroom Teacher, Listenbee", Classes: "English 10, AP English Language", Room: "118", Photo: "", Type: "Faculty", Year: "" },
  { Name: "Ms. Owens", Role: "Homeroom Teacher, Owens", Classes: "Biology, Environmental Science", Room: "231", Photo: "", Type: "Faculty", Year: "" },
  { Name: "Mr. VanCamp", Role: "Homeroom Teacher, VanCamp", Classes: "World History, AP U.S. History", Room: "112", Photo: "", Type: "Faculty", Year: "" },
  { Name: "Add your House Captain's name", Role: "", Classes: "", Room: "", Photo: "", Type: "Captain", Year: "2026–27" },
];
