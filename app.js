/* ============================================================
   HOUSE OF DRACO — APP LOGIC
   Static config (homerooms, checklist wording, department info,
   faculty, captain) comes from data.js. Anything students or
   teachers add over time — sign-ups, gratitude log entries,
   week-by-week duty assignments, monthly department picks —
   comes live from Google Sheets via sheets.js.
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
  function currentMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
  function deptByIdOrName(str) {
    const s = (str || "").trim().toLowerCase();
    return GRATITUDE_DEPARTMENTS.find((d) => d.id.toLowerCase() === s || d.name.toLowerCase() === s) || null;
  }
  function scheduledHR(weekMonday, overrides, order) {
    const wISO = isoDate(weekMonday);
    const override = overrides.find((o) => o.weekOf === wISO);
    if (override) return override.hrId;
    const idx = ((weekIndexSince(weekMonday) % order.length) + order.length) % order.length;
    return order[idx];
  }
  function initials(name) {
    return (name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }
  function avatarHTML(name, photo, size) {
    const s = size || 64;
    if (photo) {
      return `<img src="${photo}" alt="${name}" style="width:${s}px;height:${s}px;border-radius:50%;object-fit:cover;display:block;">`;
    }
    return `<div style="width:${s}px;height:${s}px;border-radius:50%;background:linear-gradient(135deg, var(--violet-deep), var(--magenta));color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:600;font-size:${Math.round(
      s * 0.36
    )}px;flex:none;">${initials(name)}</div>`;
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

  // ---------- Gratitude department of the month ----------
  function currentMonthIndex(date) {
    const epoch = new Date("2026-01-01T00:00:00");
    return (date.getFullYear() - epoch.getFullYear()) * 12 + (date.getMonth() - epoch.getMonth());
  }
  function rotationDeptForMonth(date) {
    const idx = currentMonthIndex(date);
    const n = GRATITUDE_DEPARTMENTS.length;
    return GRATITUDE_DEPARTMENTS[((idx % n) + n) % n];
  }

  document.getElementById("dept-grid").innerHTML = GRATITUDE_DEPARTMENTS.map(
    (d) => `
    <div class="dept-card" data-dept-id="${d.id}">
      <div class="icon">${d.icon}</div>
      <h4>${d.name}</h4>
      <p>${d.description}</p>
    </div>`
  ).join("");

  function renderDeptSpotlight(dept) {
    document.getElementById("home-dept").textContent = dept.name;
    document.getElementById("flame-icon").textContent = dept.icon;
    document.getElementById("flame-name").textContent = dept.name;
    document.getElementById("flame-desc").textContent = dept.description;
    document.getElementById("flame-detail-name").textContent = `How ${dept.name} supports students`;
    document.getElementById("flame-direct").textContent = dept.directSupport;
    document.getElementById("flame-indirect").textContent = dept.indirectSupport;
    document.querySelectorAll(".dept-card").forEach((card) => {
      card.classList.toggle("current", card.dataset.deptId === dept.id);
    });
  }
  // Render the rotation-only pick immediately so the page isn't empty while sheets load.
  renderDeptSpotlight(rotationDeptForMonth(today));

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
  // WEEKLY DEN KEEPERS + VAULT ROTATION + MONTHLY FLAME DEPARTMENT
  // (all three come from the teacher-editable "Schedule" tab;
  // fall back to data.js defaults / rotation if not set)
  // ============================================================
  async function loadSchedule() {
    const rows = (await fetchSheetTab(SHEETS_CONFIG.scheduleUrl)) || SAMPLE_SCHEDULE;
    const isLive = !!SHEETS_CONFIG.scheduleUrl;
    const parsed = rows.map((r) => ({
      program: (r.Program || "").trim().toLowerCase(),
      weekOf: (r["Week Of"] || "").trim(),
      homeroom: (r.Homeroom || "").trim(),
    }));

    const watchOverrides = parsed
      .filter((r) => r.program === "weekly_watch")
      .map((r) => ({ weekOf: r.weekOf, hrId: hrIdFromLabel(r.homeroom) }))
      .filter((r) => r.weekOf && r.hrId)
      .concat(WEEKLY_WATCH_SCHEDULE);
    const vaultOverrides = parsed
      .filter((r) => r.program === "vault")
      .map((r) => ({ weekOf: r.weekOf, hrId: hrIdFromLabel(r.homeroom) }))
      .filter((r) => r.weekOf && r.hrId)
      .concat(VAULT_ROTATION_SCHEDULE);
    const order = HOMEROOMS.map((h) => h.id);

    const watchHRThisWeek = scheduledHR(thisMonday, watchOverrides, order);
    const vaultHRThisWeek = scheduledHR(thisMonday, vaultOverrides, VAULT_ROTATION_ORDER);
    document.getElementById("home-watch-hr").textContent = hrLabel(watchHRThisWeek);
    document.getElementById("home-vault-hr").textContent = hrLabel(vaultHRThisWeek);

    // Monthly Loyalty Flame department override
    const monthKey = currentMonthKey(today);
    const flameOverrideRow = parsed.find((r) => {
      if (r.program !== "flame_department" || !r.weekOf) return false;
      const parts = r.weekOf.split("-");
      return parts.length >= 2 && `${parts[0]}-${parts[1]}` === monthKey;
    });
    const overrideDept = flameOverrideRow ? deptByIdOrName(flameOverrideRow.homeroom) : null;
    renderDeptSpotlight(overrideDept || rotationDeptForMonth(today));

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
  // DRACO DUTIES — one shared form/tab covers both Den Guides
  // and Wisdom Keepers; filtered client-side into two rosters.
  // ============================================================
  let wisdomRows = [];
  function dutiesOf(row) {
    return (row["Which duties are you volunteering for?"] || "")
      .split(",")
      .map((s) => s.trim().toLowerCase());
  }
  async function loadDracoDuties() {
    mountForm("den-guide-form-embed", SHEETS_CONFIG.dracoDutiesFormEmbed);
    mountForm("wisdom-form-embed", SHEETS_CONFIG.dracoDutiesFormEmbed);

    const rows = await fetchSheetTab(SHEETS_CONFIG.dracoDutiesUrl);
    const isLive = !!SHEETS_CONFIG.dracoDutiesUrl && rows;
    const data = rows || SAMPLE_DRACO_DUTIES;

    const denGuides = data.filter((r) => dutiesOf(r).includes("den guide"));
    const guideEl = document.getElementById("den-guide-roster");
    if (!denGuides.length) {
      guideEl.innerHTML = `<li><span class="meta">No Den Guides signed up yet.</span></li>`;
    } else {
      guideEl.innerHTML = denGuides
        .map((k) => `<li><span class="who">${k.Name}</span><span class="meta">${k.Homeroom}</span></li>`)
        .join("");
    }
    connectionNote(guideEl, isLive);

    wisdomRows = data.filter((r) => dutiesOf(r).includes("wisdom keeper"));
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

  // ============================================================
  // DRAGON'S LAIR — House Leadership page (static, from data.js)
  // ============================================================
  function renderLeadership() {
    const facultyEl = document.getElementById("faculty-grid");
    if (facultyEl) {
      facultyEl.innerHTML = HOUSE_FACULTY.map(
        (f) => `
        <div class="faculty-card">
          ${avatarHTML(f.name, f.photo, 72)}
          <div class="faculty-info">
            <h4>${f.name}</h4>
            <p class="faculty-role">${f.role}</p>
            <p class="faculty-classes">${f.classes.join(", ")}</p>
            <p class="faculty-room">Room ${f.room}</p>
          </div>
        </div>`
      ).join("");
    }
    const captainEl = document.getElementById("captain-spotlight");
    if (captainEl) {
      captainEl.innerHTML = `
        ${avatarHTML(HOUSE_CAPTAIN.name, HOUSE_CAPTAIN.photo, 120)}
        <div>
          <div class="eyebrow" style="color:var(--magenta);">House Captain, ${HOUSE_CAPTAIN.year}</div>
          <h3 style="margin:0;">${HOUSE_CAPTAIN.name}</h3>
        </div>`;
    }
  }
  renderLeadership();

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
    loadDracoDuties();
    loadFlameKeepers();
    loadGratitudeLog();
  }
  loadAll();
  setInterval(loadAll, SHEETS_CONFIG.refreshIntervalMs);
})();
