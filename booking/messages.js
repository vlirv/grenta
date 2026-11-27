/* =========================================================
   messages.js — chat between player and field owner (Musab)
   One conversation per booking. Opens with
   messages.html?booking=BOOKING_ID (optional).
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const user = Malaab.requireLogin(["player", "owner"]);
  if (!user) return;

  const convList = document.getElementById("convList");
  const chatArea = document.getElementById("chatArea");
  const chatTitle = document.getElementById("chatTitle");
  const receiptLink = document.getElementById("receiptLink");
  const form = document.getElementById("sendForm");
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const esc = Malaab.escapeHtml;

  const fields = Malaab.load("fields");
  const users = Malaab.load("users");
  let currentId = Number(new URLSearchParams(location.search).get("booking")) || null;

  function fieldOf(b) {
    return fields.find(function (f) { return f.id === b.fieldId; });
  }

  // Bookings this user can chat about
  function conversations() {
    return Malaab.load("bookings").filter(function (b) {
      const f = fieldOf(b);
      return b.userId === user.id || (f && f.ownerId === user.id);
    }).sort(function (a, b) { return b.id - a.id; });
  }

  // The other person in the chat
  function otherPerson(b) {
    const f = fieldOf(b);
    const otherId = b.userId === user.id ? (f ? f.ownerId : null) : b.userId;
    return users.find(function (u) { return u.id === otherId; }) || { id: otherId, name: "User" };
  }

  function messagesOf(bookingId) {
    return (Malaab.load("messages") || []).filter(function (m) { return m.bookingId === bookingId; });
  }

  function renderList() {
    const convs = conversations();
    if (convs.length === 0) {
      convList.innerHTML = '<p class="p-3 text-muted-site mb-0">No bookings yet, so no conversations.</p>';
      return;
    }
    convList.innerHTML = convs.map(function (b) {
      const msgs = messagesOf(b.id);
      const last = msgs.length ? msgs[msgs.length - 1].text : "No messages yet";
      const f = fieldOf(b);
      return '<button type="button" class="conv-item' + (b.id === currentId ? " active" : "") +
        '" data-id="' + b.id + '">' +
        "<strong>" + esc(otherPerson(b).name) + "</strong>" +
        '<small class="d-block text-muted-site">' + esc((f ? f.name : "") + " · " + b.date) + "</small>" +
        '<small class="d-block text-truncate">' + esc(last) + "</small></button>";
    }).join("");
  }

  function renderChat() {
    const b = conversations().find(function (x) { return x.id === currentId; });
    if (!b) return;
    const f = fieldOf(b);
    chatTitle.textContent = otherPerson(b).name + " – " + (f ? f.name : "") + " (" + b.date + " " + b.time + ")";
    receiptLink.href = "receipt.html?id=" + b.id;
    receiptLink.classList.remove("d-none");
    input.disabled = false;
    sendBtn.disabled = false;

    const msgs = messagesOf(b.id);
    chatArea.innerHTML = msgs.map(function (m) {
      const mine = m.fromId === user.id;
      return '<div class="chat-bubble' + (mine ? " mine" : "") + '">' +
        "<small>" + (mine ? "You" : esc(otherPerson(b).name)) + " · " + esc(m.date) + "</small>" +
        esc(m.text) + "</div>";
    }).join("") || '<p class="text-muted-site">No messages yet. Say hello!</p>';
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  convList.addEventListener("click", function (e) {
    const item = e.target.closest(".conv-item");
    if (!item) return;
    currentId = Number(item.dataset.id);
    history.replaceState(null, "", "?booking=" + currentId);
    renderList();
    renderChat();
    input.focus();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !currentId) return;

    const b = conversations().find(function (x) { return x.id === currentId; });
    const other = otherPerson(b);
    const messages = Malaab.load("messages") || [];
    messages.push({
      id: Malaab.nextId(messages),
      bookingId: b.id,
      fieldId: b.fieldId,
      fromId: user.id,
      toId: other.id,
      text: text,
      date: new Date().toISOString().slice(0, 16).replace("T", " ")
    });
    Malaab.save("messages", messages);

    const notes = Malaab.load("notifications");
    notes.unshift({
      id: Malaab.nextId(notes), userId: other.id, type: "message", icon: "bi-chat-dots",
      title: "New message", text: user.name + ": " + text.slice(0, 60), time: "Just now", read: false
    });
    Malaab.save("notifications", notes);

    input.value = "";
    renderList();
    renderChat();
  });

  renderList();
  renderChat();
});
