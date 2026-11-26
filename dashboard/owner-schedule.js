/* =========================================================
   owner-schedule.js — opening hours, blocked dates and the
   weekly bookings calendar (Suhayib)
   Saved in "schedule" (used by booking/booking.js).
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const owner = Malaab.requireLogin(["owner"]);
  if (!owner) return;

  const DAYS = [
    ["sat", "Saturday"],
    ["sun", "Sunday"],
    ["mon", "Monday"],
    ["tue", "Tuesday"],
    ["wed", "Wednesday"],
    ["thu", "Thursday"],
    ["fri", "Friday"]
  ];

  const fieldSelect = document.getElementById("fieldSelect");
  const slotSelect = document.getElementById("slotMinutes");
  const hoursRows = document.getElementById("hoursRows");
  const blockDate = document.getElementById("blockDate");
  const esc = Malaab.escapeHtml;

  let weekOffset = 0;

  const myFields = Malaab.load("fields").filter(function (f) {
    return f.ownerId === owner.id;
  });

  if (myFields.length === 0) {
    Malaab.showAlert("#formAlert", 'Add a field first in "My fields".', "info");
    return;
  }

  fieldSelect.innerHTML = myFields.map(function (f) {
    return '<option value="' + f.id + '">' + esc(f.name) + "</option>";
  }).join("");

  function dateString(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  blockDate.min = dateString(new Date());

  function fieldId() {
    return Number(fieldSelect.value);
  }

  // Schedule of the selected field (default values if none saved)
  function getSchedule() {
    const all = Malaab.load("schedule") || {};
    const s = all[fieldId()] || {};
    const days = {};
    DAYS.forEach(function (d) {
      days[d[0]] = (s.days && s.days[d[0]]) || { open: "16:00", close: "23:00", closed: false };
    });
    return {
      slotMinutes: s.slotMinutes || 60,
      blocked: s.blocked || [],
      days: days
    };
  }

  function saveSchedule(s) {
    const all = Malaab.load("schedule") || {};
    all[fieldId()] = s;
    Malaab.save("schedule", all);
  }

  function renderHours() {
    const s = getSchedule();
    slotSelect.value = String(s.slotMinutes);
    hoursRows.innerHTML = DAYS.map(function (d) {
      const day = s.days[d[0]];
      return (
        '<tr data-day="' + d[0] + '">' +
          "<td>" + d[1] + "</td>" +
          '<td><input type="time" class="form-control form-control-sm open" value="' + day.open + '" required></td>' +
          '<td><input type="time" class="form-control form-control-sm close" value="' + day.close + '" required></td>' +
          '<td><input type="checkbox" class="form-check-input closed"' + (day.closed ? " checked" : "") +
            ' aria-label="Closed on ' + d[1] + '"></td>' +
        "</tr>"
      );
    }).join("");
  }

  function renderBlocked() {
    const s = getSchedule();
    document.getElementById("blockedList").innerHTML = s.blocked.slice().sort().map(function (d) {
      return (
        '<li class="list-group-item d-flex justify-content-between align-items-center">' +
          esc(d) +
          '<button type="button" class="btn btn-sm btn-outline-danger" data-remove="' + esc(d) + '">' +
            '<i class="bi bi-x-lg"></i>' +
          "</button>" +
        "</li>"
      );
    }).join("") || '<li class="list-group-item text-muted-site">No blocked dates.</li>';
  }

  function renderWeek() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 1) % 7) + weekOffset * 7); // week starts Saturday

    const today = dateString(new Date());
    const users = Malaab.load("users");
    const bookings = Malaab.load("bookings").filter(function (b) {
      return b.fieldId === fieldId() && (b.status === "confirmed" || b.status === "pending");
    });

    let html = "";
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const ds = dateString(d);

      const items = bookings
        .filter(function (b) { return b.date === ds; })
        .sort(function (a, b) { return a.time.localeCompare(b.time); })
        .map(function (b) {
          const p = users.find(function (u) { return u.id === b.userId; });
          return (
            '<div class="week-booking' + (b.status === "pending" ? " pending" : "") + '">' +
              esc(b.time) + " · " + esc(p ? p.name : "") +
            "</div>"
          );
        })
        .join("");

      html +=
        '<div class="week-day' + (ds === today ? " today" : "") + '">' +
          "<h3>" + d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }) + "</h3>" +
          (items || '<small class="text-muted-site">Free</small>') +
        "</div>";
    }

    document.getElementById("weekGrid").innerHTML = html;
    document.getElementById("weekTitle").textContent = weekOffset === 0
      ? "This week"
      : (weekOffset > 0 ? "+" : "") + weekOffset + " week(s)";
  }

  function renderAll() {
    renderHours();
    renderBlocked();
    renderWeek();
  }

  // Save opening hours
  document.getElementById("hoursForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const s = getSchedule();
    let error = "";

    hoursRows.querySelectorAll("tr").forEach(function (row) {
      const open = row.querySelector(".open").value;
      const close = row.querySelector(".close").value;
      const closed = row.querySelector(".closed").checked;
      if (!closed && (!open || !close || open >= close)) {
        error = "Close time must be after open time.";
      }
      s.days[row.dataset.day] = { open: open, close: close, closed: closed };
    });

    if (error) {
      Malaab.showAlert("#formAlert", error, "danger");
      return;
    }

    s.slotMinutes = Number(slotSelect.value);
    saveSchedule(s);
    Malaab.showAlert("#formAlert", "Schedule saved.", "success");
  });

  // Blocked dates
  document.getElementById("blockForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(this)) return;
    const s = getSchedule();
    if (!s.blocked.includes(blockDate.value)) {
      s.blocked.push(blockDate.value);
    }
    saveSchedule(s);
    this.reset();
    this.classList.remove("was-validated");
    renderBlocked();
  });

  document.getElementById("blockedList").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    const s = getSchedule();
    s.blocked = s.blocked.filter(function (d) { return d !== btn.dataset.remove; });
    saveSchedule(s);
    renderBlocked();
  });

  fieldSelect.addEventListener("change", renderAll);

  document.getElementById("prevWeek").addEventListener("click", function () {
    weekOffset--;
    renderWeek();
  });

  document.getElementById("nextWeek").addEventListener("click", function () {
    weekOffset++;
    renderWeek();
  });

  renderAll();
});