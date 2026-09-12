/* ============================================================
   HOUSE OF DRACO — DATA FILE
   Teachers and House admins: this is the only file you should
   need to touch to update rosters and schedules. Edit the
   arrays below, commit, and the site updates for everyone.
   ============================================================ */

// ---- Homerooms (HR) in the House of Draco ----
// id: short code used internally, label: what appears on the site and must
// match the "Homeroom" dropdown options on your Google Form exactly.
// EDIT ME if your homeroom list changes.
const HOMEROOMS = [
  { id: "ledford", label: "Ledford" },
  { id: "listenbee", label: "Listenbee" },
  { id: "owens", label: "Owens" },
  { id: "vancamp", label: "VanCamp" },
];

// ---- Weekly Den Keepers: the HR on duty to tidy the hallway and ensure ----
// ---- all lockers are fully closed. Same checklist every week — only the ----
// ---- homeroom on duty changes. ----
const WEEKLY_WATCH_CHECKLIST = [
  {
    title: "Return items to their owners",
    detail:
      "Collect books, water bottles, and any labeled belongings left in the halls and deliver them to the owner's homeroom.",
  },
  {
    title: "Clear the trash",
    detail: "Pick up and properly dispose of any trash in the hallways and common areas.",
  },
  {
    title: "Send unlabeled items onward",
    detail:
      "Anything left behind without a name on it goes to the front desk or the Lost & Found.",
  },
  {
    title: "Ensure every locker is fully closed",
    detail: "Walk the full hallway and make sure all lockers are shut and latched.",
  },
];

// Explicit schedule overrides teachers can set: { weekOf: "YYYY-MM-DD" (a Monday), hrId }
// If a week isn't listed here, the site falls back to auto-rotating through HOMEROOMS
// in order, so there's always a homeroom on duty even before you assign one.
const WEEKLY_WATCH_SCHEDULE = [
  // { weekOf: "2026-09-14", hrId: "ledford" },
];

// ---- Vault Rotation: weekly locker cleanout, rotates through every HR ----
// Order in which homerooms take the weekly locker cleanout. Auto-rotates by week number;
// add explicit overrides the same way as above if you need to swap a week.
const VAULT_ROTATION_ORDER = HOMEROOMS.map((hr) => hr.id);
const VAULT_ROTATION_SCHEDULE = [
  // { weekOf: "2026-09-14", hrId: "owens" },
];

// ---- Loyalty Flame Keepers: monthly gratitude department focus ----
// One department is in the spotlight each month. Order below is the rotation;
// it repeats once it reaches the end. Add a "monthOverride": "YYYY-MM" entry
// to lock a specific department to a specific month (e.g. Nurses in flu season).
const GRATITUDE_DEPARTMENTS = [
  {
    id: "it",
    name: "IT Department",
    icon: "◈",
    description:
      "Keeps every laptop, Chromebook, projector, and Wi-Fi router on campus actually working.",
    directSupport:
      "Fixes the laptop that won't log in before your quiz, gets the classroom projector back online, and keeps the school portal running so you can see your assignments.",
    indirectSupport:
      "Maintains the servers and security behind the scenes so class time isn't lost to tech problems no one ever sees happen.",
  },
  {
    id: "dining",
    name: "Dining Services",
    icon: "◉",
    description: "Plans, cooks, and serves breakfast and lunch for the entire school, every single day.",
    directSupport:
      "Makes the food in your hand at lunch, accommodates allergies and dietary needs, and keeps the line moving so you're not late to your next class.",
    indirectSupport:
      "Manages inventory, food safety, and budgets so the cafeteria can keep running smoothly all year without students ever having to think about it.",
  },
  {
    id: "facilities",
    name: "Facilities & Housekeeping",
    icon: "◆",
    description: "Cleans, repairs, and maintains every classroom, hallway, and bathroom on campus.",
    directSupport:
      "Cleans up spills, fixes a broken chair or jammed locker, and makes sure the building is safe and comfortable to learn in.",
    indirectSupport:
      "Handles HVAC, plumbing, and long-term building upkeep — the unglamorous work that keeps the whole campus from falling apart.",
  },
  {
    id: "leadership",
    name: "Principals, Deans & Heads of School",
    icon: "◇",
    description: "Set the direction for the school and handle the decisions that affect every student.",
    directSupport:
      "Step in when you need help resolving a conflict, approve the clubs and events you care about, and greet you in the halls by name.",
    indirectSupport:
      "Manage budgets, hire great teachers, and set the policies that shape the culture of the whole school, often with no visible credit.",
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "◐",
    description: "Drives the buses and shuttles that get students to and from school safely.",
    directSupport:
      "Gets you to school on time, waits those extra thirty seconds when you're running late, and keeps the ride safe every single trip.",
    indirectSupport:
      "Handles vehicle maintenance, route planning, and early-morning schedules most students never see.",
  },
  {
    id: "landscaping",
    name: "Landscaping",
    icon: "◑",
    description: "Maintains the fields, courtyards, and grounds you walk through every day.",
    directSupport:
      "Keeps the field ready for practice, the courtyard pleasant for lunch outside, and walkways clear and safe.",
    indirectSupport:
      "Plans seasonal planting and grounds maintenance that shapes how the whole campus feels, rain or shine.",
  },
  {
    id: "family",
    name: "Friends & Family",
    icon: "◎",
    description: "The people at home who support your life outside of school hours.",
    directSupport:
      "Help with homework, show up to your games and performances, and are there on the hard days as well as the good ones.",
    indirectSupport:
      "Handle the logistics of daily life — meals, rides, bills, and quiet sacrifices — that make it possible for you to focus on school at all.",
  },
  {
    id: "teachers",
    name: "Teachers & Staff",
    icon: "◈",
    description: "Plan lessons, teach classes, and support students throughout the school day.",
    directSupport:
      "Teach your classes, answer your questions, write your recommendation letters, and notice when something's off.",
    indirectSupport:
      "Spend hours outside of class grading, planning, and meeting that students rarely see but always benefit from.",
  },
  {
    id: "health",
    name: "Nurses & Front Office Coordinators",
    icon: "✚",
    description: "Handle health, safety, and the front line of communication for the whole school.",
    directSupport:
      "Take care of you when you're sick or hurt, and are the first friendly face when you check in late or leave early.",
    indirectSupport:
      "Track health records, coordinate with families, and manage the front-office logistics that keep the school running smoothly.",
  },
];

// ---- Ways students can express gratitude (used for the goal tracker) ----
const GRATITUDE_METHODS = [
  { id: "encounter", label: "In-person encounter", detail: "A genuine face-to-face thank-you." },
  { id: "card", label: "Handwritten card", detail: "A short note that names something specific you're grateful for." },
  { id: "service", label: "Act of service", detail: "Helping out in a way that makes their job a little easier." },
  { id: "appreciation", label: "Public appreciation", detail: "A shout-out, poster, or mention that recognizes them in front of others." },
];

// ---- House Faculty & Captain ----
// Both now live in the shared Google Sheet's "Faculty" tab, not here, so
// non-technical admins can update them directly. A row's "Type" column is
// "Captain" for the House Captain and blank (or "Faculty") for everyone else.
// See sheets.js for the fallback sample data shown until that tab is
// connected, and the README for setup.
