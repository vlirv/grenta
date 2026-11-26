/* =========================================================
   support.js — help & support (Wael)
   FAQ search, open a ticket, list of my tickets.
   Admin sees all tickets.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const faqSearch = document.getElementById("faqSearch");
  const faqItems = document.querySelectorAll(".faq-item");
  const form = document.getElementById("ticketForm");
  const rows = document.getElementById("ticketRows");
  const esc = Malaab.escapeHtml;
  const STATUS = {
    open: { css: "status-pending", label: "Open" },
    answered: { css: "status-confirmed", label: "Answered" },
    closed: { css: "status-cancelled", label: "Closed" }
  };
  // ===== FAQ search =====
  faqSearch.addEventListener("input", function () {
    const text = faqSearch.value.trim().toLowerCase();
    let shown = 0;
    faqItems.forEach(function (item) {
      const match = item.textContent.toLowerCase().includes(text);
      item.classList.toggle("d-none", !match);
      if (match) shown++;
    });
    document.getElementById("faqEmpty").classList.toggle("d-none", shown > 0);
  });
  // ===== My tickets =====
  function renderTickets() {
    const user = Malaab.currentUser();
    if (!user) {
      rows.innerHTML = '<tr><td colspan="5" class="text-muted-site">' +
        '<a href="../account/login.html">Log in</a> to see your tickets.</td></tr>';
      return;
    }
    const tickets = (Malaab.load("tickets") || [])
      .filter(function (t) { return user.role === "admin" || t.userId === user.id; })
      .sort(function (a, b) { return b.id - a.id; });
    if (tickets.length === 0) {
      rows.innerHTML = '<tr><td colspan="5" class="text-muted-site">You have no tickets yet.</td></tr>';
      return;
    }
    rows.innerHTML = tickets.map(function (t) {
      const s = STATUS[t.status] || STATUS.open;
      return '<tr class="ticket-row" data-id="' + t.id + '" tabindex="0">' +
        "<td>#" + t.id + "</td>" +
        '<td><a href="ticket.html?id=' + t.id + '">' + esc(t.subject) + "</a></td>" +
        "<td>" + esc(t.category) + "</td>" +
        '<td><span class="status ' + s.css + '">' + s.label + "</span></td>" +
        "<td>" + esc(t.date) + "</td></tr>";
    }).join("");
  }
  rows.addEventListener("click", function (e) {
    const row = e.target.closest(".ticket-row");
    if (row) location.href = "ticket.html?id=" + row.dataset.id;
  });
  rows.addEventListener("keydown", function (e) {
    const row = e.target.closest(".ticket-row");
    if (row && e.key === "Enter") location.href = "ticket.html?id=" + row.dataset.id;
  });
  // ===== Open a ticket =====
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(form)) return;
    const user = Malaab.requireLogin();
    if (!user) return;
    const tickets = Malaab.load("tickets") || [];
    const ticket = {
      id: Malaab.nextId(tickets),
userId: user.id,
subject: document.getElementById("subject").value.trim(),
category: document.getElementById("category").value,
message: document.getElementById("message").value.trim(),
status: "open",
date: new Date().toISOString().slice(0, 10),
replies: []
};
tickets.push(ticket);
Malaab.save("tickets", tickets);
form.reset();
form.classList.remove("was-validated");
renderTickets();
Malaab.showAlert("#formAlert", "Ticket #" + ticket.id + " was sent. We will reply soon.", "success");
});
renderTickets();
});