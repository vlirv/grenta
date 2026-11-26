/* =========================================================
   notifications.js — notifications page (Mouen)
   Shows the list, filters (all / unread / bookings / offers),
   click = mark as read, "Mark all as read" button.
   The bell number in the navbar updates automatically.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const list = document.getElementById("notifList");
  const newCount = document.getElementById("newCount");
  let filter = "all";

  function render() {
    const all = Malaab.load("notifications");
    const shown = all.filter(function (n) {
      if (filter === "unread") return !n.read;
      if (filter === "all") return true;
      return n.type === filter;
    });

    const unread = all.filter((n) => !n.read).length;
    newCount.textContent = unread + " new";
    newCount.style.display = unread ? "" : "none";
    Malaab.refreshNavbar();

    if (shown.length === 0) {
      list.innerHTML = '<p class="text-center text-muted-site p-4 mb-0">No notifications here.</p>';
      return;
    }

    list.innerHTML = shown.map(function (n) {
      return (
        '<div class="notif-item' + (n.read ? "" : " unread") + '" data-id="' + n.id + '" role="button" tabindex="0">' +
          '<i class="bi ' + Malaab.escapeHtml(n.icon) + ' notif-icon"></i>' +
          '<div class="flex-grow-1">' +
            '<div class="notif-title fw-semibold">' + Malaab.escapeHtml(n.title) + "</div>" +
            "<div>" + Malaab.escapeHtml(n.text) + "</div>" +
            '<small class="text-muted-site">' + Malaab.escapeHtml(n.time) + "</small>" +
          "</div>" +
          '<button type="button" class="btn btn-sm btn-link text-danger notif-delete" title="Delete"><i class="bi bi-trash"></i></button>' +
        "</div>"
      );
    }).join("");
  }

  function update(changeFn) {
    const all = Malaab.load("notifications");
    Malaab.save("notifications", changeFn(all));
    render();
  }

  // Click a notification: mark read; click trash: delete
  list.addEventListener("click", function (e) {
    const item = e.target.closest(".notif-item");
    if (!item) return;
    const id = Number(item.dataset.id);
    if (e.target.closest(".notif-delete")) {
      update((all) => all.filter((n) => n.id !== id));
    } else {
      update((all) => all.map((n) => (n.id === id ? Object.assign(n, { read: true }) : n)));
    }
  });
  list.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.classList.contains("notif-item")) e.target.click();
  });

  // Mark all as read
  document.getElementById("markAll").addEventListener("click", function () {
    update((all) => all.map((n) => Object.assign(n, { read: true })));
  });

  // Filter pills
  document.getElementById("notifFilters").addEventListener("click", function (e) {
    const link = e.target.closest("[data-filter]");
    if (!link) return;
    e.preventDefault();
    this.querySelectorAll(".nav-link").forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
    filter = link.dataset.filter;
    render();
  });

  render();
});
