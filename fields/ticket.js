/* =========================================================
   ticket.js — one support ticket (Wael)
   Opens with ticket.html?id=TICKET_ID
   The ticket's owner or the admin can read and reply.
   An admin reply = "support" and the status becomes "answered".
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const user = Malaab.requireLogin();
  if (!user) return;
  const id = Number(new URLSearchParams(location.search).get("id"));
  const panel = document.getElementById("ticketPanel");
  const chatBox = document.getElementById("chatBox");
  const replyForm = document.getElementById("replyForm");
  const closeBtn = document.getElementById("closeBtn");
  const esc = Malaab.escapeHtml;
  const STATUS = {
    open: { css: "status-pending", label: "Open" },
    answered: { css: "status-confirmed", label: "Answered" },
    closed: { css: "status-cancelled", label: "Closed" }
  };
  function getTickets() {
    return Malaab.load("tickets") || [];
  }
  const first = getTickets().find(function (t) { return t.id === id; });
  if (!first || (user.role !== "admin" && first.userId !== user.id)) {
    panel.innerHTML = '<div class="empty-state"><i class="bi bi-exclamation-circle"></i>' +
      '<p class="mt-2 mb-0">Ticket not found.</p></div>';
    return;
  }
  function bubble(from, text, date) {
    // "mine" = written by the person looking at the page
    const mine = (from === "support") === (user.role === "admin");
    return '<div class="chat-bubble' + (mine ? " mine" : "") + '">' +
      "<small>" + (from === "support" ? "Support" : "Player") + " · " + esc(date) + "</small>" +
      esc(text).replace(/\n/g, "<br>") + "</div>";
  }
  function render() {
    const t = getTickets().find(function (x) { return x.id === id; });
    const s = STATUS[t.status] || STATUS.open;
    document.getElementById("ticketTitle").textContent = "#" + t.id + " – " + t.subject;
    document.getElementById("ticketMeta").textContent = t.category + " · opened " + t.date;
    const badge = document.getElementById("ticketStatus");
    badge.className = "status " + s.css;
    badge.textContent = s.label;
    chatBox.innerHTML = bubble("user", t.message, t.date) +
      t.replies.map(function (r) { return bubble(r.from, r.text, r.date); }).join("");
    chatBox.scrollTop = chatBox.scrollHeight;
    const closed = t.status === "closed";
    replyForm.classList.toggle("d-none", closed);
    closeBtn.classList.toggle("d-none", closed);
  }
  function updateTicket(change) {
    const tickets = getTickets();
    const t = tickets.find(function (x) { return x.id === id; });
    change(t);
    Malaab.save("tickets", tickets);
    return t;
  }
  replyForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(replyForm)) return;
    const text = document.getElementById("reply").value.trim();
    const isAdmin = user.role === "admin";
    const t = updateTicket(function (ticket) {
      ticket.replies.push({
        from: isAdmin ? "support" : "user",
        text: text,
        date: new Date().toISOString().slice(0, 16).replace("T", " ")
      });
      ticket.status = isAdmin ? "answered" : "open";
    });
    // Tell the player that support answered
    if (isAdmin) {
      const notes = Malaab.load("notifications");
      notes.unshift({
        id: Malaab.nextId(notes), userId: t.userId, type: "support", icon: "bi-headset",
        title: "Support replied", text: "New reply on ticket #" + t.id + ": " + t.subject,
        time: "Just now", read: false
      });
      Malaab.save("notifications", notes);
      Malaab.refreshNavbar();
    }
    replyForm.reset();
    replyForm.classList.remove("was-validated");
    render();
  });
  closeBtn.addEventListener("click", function () {
    if (!confirm("Close this ticket?")) return;
    updateTicket(function (ticket) { ticket.status = "closed"; });
    render();
    Malaab.showAlert("#formAlert", "The ticket is closed.", "info");
  });
  render();
});