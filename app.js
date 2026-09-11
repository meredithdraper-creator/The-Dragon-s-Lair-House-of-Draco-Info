/* ============================================================
   HOUSE OF DRACO — APP LOGIC
   Static config (homerooms, checklist wording, department info)
   comes from data.js. Anything students or teachers add over
   time — sign-ups, gratitude log entries, week-by-week duty
   assignments — comes live from Google Sheets via sheets.js.
   ============================================================ */

(function () {
  "use strict";

  // ---------- Date / rotation helpers ----------
  function mondayOf(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  function isoDate(d) {
    return d.toISOString().slice(0, 10);
  }
  function addWeeks(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n * 7);
    return d;
  }
  const ROTATION_EPOCH = mondayOf(new Date("2026-01-05T00:00:00"));
  function weekIndexSince(monday) {
    const ms = mondayOf(monday) - ROTATION_EPOCH;
    return Math.round(ms / (7 * 24 * 3600 * 1000));
  }
  function hrLabel(hrId) {
    const hr = HOMEROOMS.find((h) => h.id === hrId);
    return hr ? `${hr.label} (${hr.teacher})` : hrId;
  }
  function hrIdFromLabel(label) {
    const l = (label || "").trim().toLowerCase();
    const hr = HOMEROOMS.find((h) => h.label.trim().toLowerCase() === l);
    return hr ? hr.id : null;
  }
  function scheduledHR(weekMonday, overrides, order) {
    const wISO = isoDate(weekMonday);
    const override = overrides.find((o) => o.weekOf === wISO);
    if (override) return override.hrId;
    const idx = ((weekIndexSince(weekMonday) % order.length) + order.length) % order.length;
    return order[idx];
  }

  // ---------- Tabs ----------
  const tabButtons = document.querySelectorAll("nav.tabs button");
  const pages = document.querySelectorAll("section.page");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      pages.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("page-" + btn.dataset.page).classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  const today = new Date();
  const thisMonday = mondayOf(today);

  // ---------- Gratitude department of the month (static rotation, data.js) ----------
  function currentMonthIndex(date) {
    const epoch = new Date("2026-01-01T00:00:00");
    return (date.getFullYear() - epoch.getFullYear()) * 12 + (date.getMonth() - epoch.getMonth());
  }
  function deptForMonth(date) {
    const idx = currentMonthIndex(date);
    const n = GRATITUDE_DEPARTMENTS.length;
    return GRATITUDE_DEPARTMENTS[((idx % n) + n) % n];
  }
  const currentDept = deptForMonth(today);
  document.getElementById("home-dept").textContent = currentDept.name;
  document.getElementById("flame-icon").textContent = currentDept.icon;
  document.getElementById("flame-name").textContent = currentDept.name;
  document.getElementById("flame-desc").textContent = currentDept.description;
  document.getElementById("flame-detail-name").textContent = `How ${currentDept.name} supports students`;
  document.getElementById("flame-direct").textContent = currentDept.directSupport;
  document.getElementById("flame-indirect").textContent = currentDept.indirectSupport;

  document.getElementById("dept-grid").innerHTML = GRATITUDE_DEPARTMENTS.map(
    (d) => `
    <div class="dept-card">
      <div class="icon">${d.icon}</div>
      <h4>${d.name}</h4>
      <p>${d.description}</p>
    </div>`
  ).join("");

  // ---------- Live-data banner helper ----------
  function connectionNote(el, isLive) {
    if (isLive) return;
    const note = document.createElement("p");
    note.className = "note";
    note.innerHTML =
      "Showing sample rows &mdash; connect a Google Sheet in <code>sheets.js</code> to make this live.";
    el.parentNode.insertBefore(note, el);
  }

  // ---------- Form embeds ----------
  function mountForm(containerId, embedUrl) {
    const el = document.getElementById(containerId);
    if (embedUrl) {
      el.innerHTML = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0">Loading form&hellip;</iframe>`;
    } else {
      el.innerHTML = `<div class="panel"><h3>Sign-up form not connected yet</h3><p style="font-size:.9rem;">Paste this form's embed link into <code>sheets.js</code> to show it here. Until then, here's a placeholder so you can see the layout.</p></div>`;
    }
  }

  // ============================================================
  // WEEKLY DEN KEEPERS + VAULT ROTATION (schedule comes from the
  // teacher-editable "Schedule" tab; falls back to data.js
  // defaults + auto-rotation if a week has no entry)
  // ============================================================
  async function loadSchedule() {
    const rows = (await fetchSheetTab(SHEETS_CONFIG.scheduleUrl)) || SAMPLE_SCHEDULE;
    const isLive = !!SHEETS_CONFIG.scheduleUrl;
    const parsed = rows
      .map((r) => ({
        program: (r.Program || "").trim().toLowerCase(),
        weekOf: (r["Week Of"] || "").trim(),
        hrId: hrIdFromLabel(r.Homeroom),
      }))
      .filter((r) => r.weekOf && r.hrId);

    const watchOverrides = parsed.filter((r) => r.program === "weekly_watch").concat(WEEKLY_WATCH_SCHEDULE);
    const vaultOverrides = parsed.filter((r) => r.program === "vault").concat(VAULT_ROTATION_SCHEDULE);
    const order = HOMEROOMS.map((h) => h.id);

    const watchHRThisWeek = scheduledHR(thisMonday, watchOverrides, order);
    const vaultHRThisWeek = scheduledHR(thisMonday, vaultOverrides, VAULT_ROTATION_ORDER);
    document.getElementById("home-watch-hr").textContent = hrLabel(watchHRThisWeek);
    document.getElementById("home-vault-hr").textContent = hrLabel(vaultHRThisWeek);

    const checklistEl = document.getElementById("watch-checklist");
    checklistEl.innerHTML = WEEKLY_WATCH_CHECKLIST.map(
      (item, i) => `
      <li>
        <div class="num">${String(i + 1).padStart(2, "0")}</div>
        <div><h4>${item.title}</h4><p>${item.detail}</p></div>
      </li>`
    ).join("");

    function renderRotaTable(tbodyId, overrides, ord, weeksBack, weeksForward) {
      const tbody = document.getElementById(tbodyId);
      const rowsOut = [];
      for (let i = -weeksBack; i <= weeksForward; i++) {
        const wk = addWeeks(thisMonday, i);
        const hr = scheduledHR(wk, overrides, ord);
        const isCurrent = i === 0;
        rowsOut.push(
          `<tr class="${isCurrent ? "current" : ""}"><td>${isoDate(wk)}${isCurrent ? " (this week)" : ""}</td><td>${hrLabel(hr)}</td></tr>`
        );
      }
      tbody.innerHTML = rowsOut.join("");
    }
    renderRotaTable("watch-table", watchOverrides, order, 1, 5);
    renderRotaTable("vault-table", vaultOverrides, VAULT_ROTATION_ORDER, 1, 5);

    connectionNote(document.getElementById("watch-table"), isLive);
  }

  // ============================================================
  // DEN GUIDES (from the "Den Guides" form-responses tab)
  // ============================================================
  async function loadDenGuides() {
    mountForm("den-guide-form-embed", SHEETS_CONFIG.denGuidesFormEmbed);
    const rows = await fetchSheetTab(SHEETS_CONFIG.denGuidesUrl);
    const isLive = !!SHEETS_CONFIG.denGuidesUrl && rows;
    const data = rows || SAMPLE_DEN_GUIDES;
    const el = document.getElementById("den-guide-roster");
    if (!data.length) {
      el.innerHTML = `<li><span class="meta">No Den Guides signed up yet.</span></li>`;
    } else {
      el.innerHTML = data
        .map((k) => `<li><span class="who">${k.Name}</span><span class="meta">${k.Homeroom}</span></li>`)
        .join("");
    }
    connectionNote(el, isLive);
  }

  // ============================================================
  // WISDOM KEEPERS (from the "Wisdom Keepers" form-responses tab)
  // ============================================================
  let wisdomRows = [];
  async function loadWisdomKeepers() {
    mountForm("wisdom-form-embed", SHEETS_CONFIG.wisdomKeepersFormEmbed);
    const rows = await fetchSheetTab(SHEETS_CONFIG.wisdomKeepersUrl);
    const isLive = !!SHEETS_CONFIG.wisdomKeepersUrl && rows;
    wisdomRows = rows || SAMPLE_WISDOM_KEEPERS;
    renderWisdomKeepers(document.getElementById("wisdom-filter").value);
    connectionNote(document.getElementById("wisdom-roster"), isLive);
  }
  function renderWisdomKeepers(filter) {
    const f = (filter || "").toLowerCase().trim();
    const subj = (t) => t["Subject(s)"] || "";
    const shown = f ? wisdomRows.filter((t) => subj(t).toLowerCase().includes(f)) : wisdomRows;
    const el = document.getElementById("wisdom-roster");
    if (!shown.length) {
      el.innerHTML = `<li><span class="meta">${wisdomRows.length ? "No Wisdom Keepers match that subject yet." : "No Wisdom Keepers signed up yet."}</span></li>`;
      return;
    }
    el.innerHTML = shown
      .map((t) => {
        const help = (t["How can you help?"] || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        return `<li>
          <div>
            <span class="who">${t.Name}</span>
            <div class="meta">${t.Homeroom} &middot; ${subj(t)}</div>
          </div>
          <div>${help.map((h) => `<span class="pill">${h}</span>`).join("")}</div>
        </li>`;
      })
      .join("");
  }
  document.getElementById("wisdom-filter").addEventListener("input", (e) => renderWisdomKeepers(e.target.value));

  // ============================================================
  // LOYALTY FLAME KEEPERS — roster (from "Loyalty Flame Keepers" tab)
  // plus the gratitude action log (from "Gratitude Log" tab)
  // ============================================================
  async function loadFlameKeepers() {
    mountForm("flame-keeper-form-embed", SHEETS_CONFIG.flameKeepersFormEmbed);
    const rows = await fetchSheetTab(SHEETS_CONFIG.flameKeepersUrl);
    const isLive = !!SHEETS_CONFIG.flameKeepersUrl && rows;
    const data = rows || SAMPLE_FLAME_KEEPERS;
    const el = document.getElementById("flame-keeper-roster");
    if (!data.length) {
      el.innerHTML = `<li><span class="meta">No Loyalty Flame Keepers assigned or signed up yet this month.</span></li>`;
    } else {
      el.innerHTML = data
        .map(
          (k) =>
            `<li><span class="who">${k.Name}</span><span class="meta">${k.Homeroom}${k["How assigned?"] ? " &middot; " + k["How assigned?"] : ""}</span></li>`
        )
        .join("");
    }
    connectionNote(el, isLive);
  }

  function currentMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  async function loadGratitudeLog() {
    mountForm("gratitude-form-embed", SHEETS_CONFIG.gratitudeFormEmbed);
    const rows = await fetchSheetTab(SHEETS_CONFIG.gratitudeUrl);
    const isLive = !!SHEETS_CONFIG.gratitudeUrl && rows;
    const data = rows || SAMPLE_GRATITUDE;
    const key = currentMonthKey(today);
    const entries = data.filter((e) => {
      const ts = new Date(e.Timestamp);
      return !isNaN(ts) && currentMonthKey(ts) === key;
    });
    document.getElementById("goal-count").textContent = `${entries.length} logged this month`;
    const el = document.getElementById("goal-log");
    if (!entries.length) {
      el.innerHTML = `<li><span class="meta">Nothing logged yet this month.</span></li>`;
    } else {
      el.innerHTML = entries
        .slice()
        .reverse()
        .map(
          (e) =>
            `<li><span class="pill">${e.Method}</span><div><strong>${e.Name}</strong> &mdash; ${e["What did you do?"]}</div></li>`
        )
        .join("");
    }
    connectionNote(el, isLive);
  }

  // ---------- Teacher "open the spreadsheet" link ----------
  const sheetLink = document.getElementById("watch-sheet-link");
  if (SHEETS_CONFIG.spreadsheetEditUrl) {
    sheetLink.href = SHEETS_CONFIG.spreadsheetEditUrl;
  } else {
    sheetLink.textContent = "Add spreadsheetEditUrl in sheets.js to link here";
    sheetLink.style.pointerEvents = "none";
    sheetLink.style.opacity = ".6";
  }

  // ---------- Load everything, then refresh on an interval ----------
  function loadAll() {
    loadSchedule();
    loadDenGuides();
    loadWisdomKeepers();
    loadFlameKeepers();
    loadGratitudeLog();
  }
  loadAll();
  setInterval(loadAll, SHEETS_CONFIG.refreshIntervalMs);
})();
