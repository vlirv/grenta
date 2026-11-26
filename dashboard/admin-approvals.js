/* =========================================================
   admin-approvals.js — approve owners and fields (Suhayib)
   Pending owners/fields come from account/register-owner.html
   (Mouen) and dashboard/owner-fields.html.
   Approve only after every checklist box is ticked.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const admin = Malaab.requireLogin(["admin"]);
  if (!admin) return;

  const esc = Malaab.escapeHtml;
  const panel = document.getElementById("reviewPanel");

  let selected = null; // { kind: "owner" | "field", id }

  const CHECKS = {
    owner: [
      "Name and phone look real",
      "Email is valid",
      "Ownership document checked"
    ],
    field: [
      "Ownership document checked",
      "Photos are OK",
      "Address is OK",
      "Price is reasonable"
    ]
  };

  function pendingOwners() {
    return Malaab.load("users").filter(function (u) {
      return u.role === "owner" && u.status === "pending";
    });
  }

  function pendingFields() {
    return Malaab.load("fields").filter(function (f) {
      return f.status === "pending";
    });
  }

  function renderLists() {
    const owners = pendingOwners();
    const fields = pendingFields();

    document.getElementById("countOwners").textContent = owners.length;
    document.getElementById("countFields").textContent = fields.length;

    function item(kind, id, title, sub) {
      const active = selected && selected.kind === kind && selected.id === id;
      return (
        '<button type="button" class="list-group-item list-group-item-action approval-item' +
          (active ? " active" : "") + '" data-kind="' + kind + '" data-id="' + id + '">' +
          "<strong>" + esc(title) + "</strong>" +
          '<small class="d-block text-muted-site">' + esc(sub) + "</small>" +
        "</button>"
      );
    }

    document.getElementById("ownerList").innerHTML = owners.map(function (u) {
      return item("owner", u.id, u.name, u.email + " · " + u.city);
    }).join("") || '<p class="text-muted-site mb-0">No owners waiting.</p>';

    document.getElementById("fieldList").innerHTML = fields.map(function (f) {
      return item("field", f.id, f.name, f.city + " – " + f.area);
    }).join("") || '<p class="text-muted-site mb-0">No fields waiting.</p>';
  }

  function renderReview() {
    if (!selected) {
      panel.innerHTML = '<p class="text-muted-site mb-0">Choose an owner or a field on the left to review it.</p>';
      return;
    }

    const users = Malaab.load("users");
    const fields = Malaab.load("fields");
    let details = "";

    if (selected.kind === "owner") {
      const u = users.find(function (x) { return x.id === selected.id; });
      if (!u) {
        selected = null;
        panel.innerHTML = '<p class="text-muted-site mb-0">Choose an owner or a field on the left to review it.</p>';
        return;
      }
      const f = fields.find(function (x) { return x.ownerId === u.id && x.status === "pending"; });
      details =
        '<h2 class="h5">Owner: ' + esc(u.name) + "</h2>" +
        '<p class="mb-1"><i class="bi bi-envelope"></i> ' + esc(u.email) + "</p>" +
        '<p class="mb-1"><i class="bi bi-telephone"></i> ' + esc(u.phone) + "</p>" +
        '<p class="mb-3"><i class="bi bi-geo-alt"></i> ' + esc(u.city) + "</p>" +
        (f
          ? '<p class="mb-3">Field: <strong>' + esc(f.name) + "</strong> – " + esc(f.area) +
              " · document: <em>" + esc(f.document || "none") + "</em><br>" +
              '<small class="text-muted-site">The field is approved together with the owner.</small></p>'
          : "");
    } else {
      const f = fields.find(function (x) { return x.id === selected.id; });
      if (!f) {
        selected = null;
        panel.innerHTML = '<p class="text-muted-site mb-0">Choose an owner or a field on the left to review it.</p>';
        return;
      }
      const o = users.find(function (x) { return x.id === f.ownerId; });
      details =
        '<h2 class="h5">Field: ' + esc(f.name) + "</h2>" +
        '<p class="mb-1">' + esc(f.city + " – " + f.area) + " · " + esc(f.size) + "</p>" +
        '<p class="mb-1">Price: ' + Malaab.formatPrice(f.price) + " / hour</p>" +
        '<p class="mb-1">Owner: ' + esc(o ? o.name : "-") + "</p>" +
        '<p class="mb-3">Document: <em>' + esc(f.document || "none") + "</em> · Photos: " +
          ((f.photos || []).length) + "</p>";
    }

    const checks = CHECKS[selected.kind].map(function (text, i) {
      return (
        '<div class="form-check">' +
          '<input class="form-check-input check" type="checkbox" id="chk' + i + '">' +
          '<label class="form-check-label" for="chk' + i + '">' + esc(text) + "</label>" +
        "</div>"
      );
    }).join("");

    panel.innerHTML =
      details +
      '<h3 class="h6 fw-bold">Acceptance checklist</h3>' +
      '<div class="checklist mb-3">' + checks + "</div>" +
      '<label for="rejectReason" class="form-label">Reason (only if you reject)</label>' +
      '<textarea class="form-control mb-3" id="rejectReason" rows="2"></textarea>' +
      '<div class="d-flex gap-2">' +
        '<button type="button" class="btn btn-main" id="approveBtn" disabled>' +
          '<i class="bi bi-check-lg"></i> Approve' +
        "</button>" +
        '<button type="button" class="btn btn-outline-danger" id="rejectBtn">' +
          '<i class="bi bi-x-lg"></i> Reject' +
        "</button>" +
      "</div>";
  }

  function notify(userId, icon, title, text) {
    const notes = Malaab.load("notifications");
    notes.unshift({
      id: Malaab.nextId(notes),
      userId: userId,
      type: "booking",
      icon: icon,
      title: title,
      text: text,
      time: "Just now",
      read: false
    });
    Malaab.save("notifications", notes);
  }

  function decide(approve) {
    if (!selected) return;

    const users = Malaab.load("users");
    const fields = Malaab.load("fields");
    const reason = document.getElementById("rejectReason").value.trim();
    const status = approve ? "active" : "rejected";
    let ownerId, name;

    if (selected.kind === "owner") {
      const u = users.find(function (x) { return x.id === selected.id; });
      if (!u) return;
      u.status = status;
      fields.forEach(function (f) {
        if (f.ownerId === u.id && f.status === "pending") {
          f.status = status;
        }
      });
      ownerId = u.id;
      name = "Your owner account";
    } else {
      const f = fields.find(function (x) { return x.id === selected.id; });
      if (!f) return;
      f.status = status;
      ownerId = f.ownerId;
      name = "Your field " + f.name;
    }

    Malaab.save("users", users);
    Malaab.save("fields", fields);

    notify(
      ownerId,
      approve ? "bi-patch-check" : "bi-x-circle",
      approve ? "Approved" : "Not approved",
      name + (approve ? " was approved. Welcome to Malaab!" : " was rejected. Reason: " + reason)
    );

    Malaab.showAlert("#formAlert", approve ? "Approved." : "Rejected.", approve ? "success" : "info");
    selected = null;
    renderLists();
    renderReview();
  }

  // Click a pending item
  document.querySelector("main").addEventListener("click", function (e) {
    const item = e.target.closest(".approval-item");
    if (item) {
      selected = { kind: item.dataset.kind, id: Number(item.dataset.id) };
      renderLists();
      renderReview();
      return;
    }

    if (e.target.closest("#approveBtn")) {
      decide(true);
    }

    if (e.target.closest("#rejectBtn")) {
      const reasonEl = document.getElementById("rejectReason");
      if (!reasonEl || !reasonEl.value.trim()) {
        Malaab.showAlert("#formAlert", "Please write a reason before rejecting.", "warning");
        return;
      }
      if (confirm("Reject this request?")) {
        decide(false);
      }
    }
  });

  // Approve button only when all boxes are ticked
  panel.addEventListener("change", function () {
    const boxes = panel.querySelectorAll(".check");
    const approveBtn = document.getElementById("approveBtn");
    if (!approveBtn) return;
    const allChecked = Array.from(boxes).every(function (b) { return b.checked; });
    approveBtn.disabled = !allChecked;
  });

  renderLists();
  renderReview();
});