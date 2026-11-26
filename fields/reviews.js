/* =========================================================
   reviews.js — ratings and reviews (Wael)
   Opens with reviews.html?field=FIELD_ID
   A player can review only a match that was played
   (confirmed/completed and in the past), once per booking.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const fieldId = Number(new URLSearchParams(location.search).get("field")) || 1;
  const field = Malaab.load("fields").find(function (f) { return f.id === fieldId; });
  const form = document.getElementById("reviewForm");
  const bookingSelect = document.getElementById("bookingSelect");
  const starButtons = document.querySelectorAll("#starPicker button");
  const esc = Malaab.escapeHtml;
  let chosenStars = 0;
  if (field) {
    document.getElementById("fieldName").textContent = "– " + field.name;
    document.getElementById("backLink").href = "field.html?id=" + field.id;
  }
  function starsHtml(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) html += '<i class="bi bi-star-fill"></i>';
      else if (rating >= i - 0.5) html += '<i class="bi bi-star-half"></i>';
      else html += '<i class="bi bi-star"></i>';
    }
    return '<span class="stars">' + html + "</span>";
  }
  function isPlayed(b) {
    const start = new Date(b.date + "T" + b.time);
    return b.status === "completed" || (b.status === "confirmed" && start < new Date());
  }
  function fieldReviews() {
    return (Malaab.load("reviews") || []).filter(function (r) {
      return r.fieldId === fieldId && !r.hidden;
    });
  }
  // ===== Summary and list =====
  function renderReviews() {
    const reviews = fieldReviews().sort(function (a, b) { return b.date.localeCompare(a.date); });
    const users = Malaab.load("users");
    const avg = reviews.length
      ? reviews.reduce(function (s, r) { return s + r.stars; }, 0) / reviews.length : 0;
    document.getElementById("avgRating").textContent = avg.toFixed(1);
    document.getElementById("avgStars").innerHTML = starsHtml(avg);
    document.getElementById("reviewCount").textContent =
      reviews.length + (reviews.length === 1 ? " review" : " reviews");
    let bars = "";
    for (let s = 5; s >= 1; s--) {
      const count = reviews.filter(function (r) { return r.stars === s; }).length;
      const pct = reviews.length ? Math.round(count / reviews.length * 100) : 0;
      bars +=
        '<div class="d-flex align-items-center gap-2 mb-1">' +
          '<small class="text-nowrap">' + s + ' <i class="bi bi-star-fill stars"></i></small>' +
          '<div class="progress rating-bar flex-grow-1" role="progressbar" aria-valuenow="' + pct +
            '" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width: ' + pct +
            '%"></div></div>' +
          '<small class="text-muted-site">' + count + "</small>" +
        "</div>";
    }
    document.getElementById("ratingBars").innerHTML = bars;
    document.getElementById("reviewList").innerHTML = reviews.map(function (r) {
      const user = users.find(function (u) { return u.id === r.userId; });
      return '<div class="review-item">' +
        '<div class="d-flex justify-content-between flex-wrap gap-2">' +
          "<strong>" + esc(user ? user.name : "Player") + "</strong>" + starsHtml(r.stars) + "</div>" +
        '<p class="mb-1 mt-1">' + esc(r.comment) + "</p>" +
        '<small class="text-muted-site">' + esc(r.date) + "</small></div>";
    }).join("") ||
      '<div class="empty-state"><i class="bi bi-chat-square-text"></i>' +
      '<p class="mt-2 mb-0">No reviews yet for this field.</p></div>';
  }
  // ===== Which matches can the user review? =====
  function setupForm() {
    const user = Malaab.currentUser();
    const reviewed = (Malaab.load("reviews") || []).map(function (r) { return r.bookingId; });
    let message = "";
    if (!user) {
      message = "Log in as a player to write a review.";
    } else if (user.role !== "player") {
      message = "Only players can write reviews.";
    }
    const options = user ? Malaab.load("bookings").filter(function (b) {
      return b.userId === user.id && b.fieldId === fieldId && isPlayed(b) && !reviewed.includes(b.id);
    }) : [];
    if (!message && options.length === 0) {
      message = "You can review this field after you play a booked match here.";
    }
    if (message) {
      form.querySelectorAll("input, select, textarea, button").forEach(function (el) {
        el.disabled = true;
      });
      bookingSelect.innerHTML = "<option>No match to review</option>";
      Malaab.showAlert("#formAlert", message, "info");
      return;
    }
    bookingSelect.innerHTML = options.map(function (b) {
      return '<option value="' + b.id + '">' + esc(b.date + " at " + b.time) + "</option>";
    }).join("");
  }
  // ===== Star picker =====
  function paintStars(n) {
    starButtons.forEach(function (btn) {
      btn.classList.toggle("on", Number(btn.dataset.star) <= n);
    });
  }
  starButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      chosenStars = Number(btn.dataset.star);
      paintStars(chosenStars);
    });
    btn.addEventListener("mouseenter", function () { paintStars(Number(btn.dataset.star)); });
    btn.addEventListener("mouseleave", function () { paintStars(chosenStars); });
  });
  // ===== Save review =====
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(form)) return;
    if (!chosenStars) {
      Malaab.showAlert("#formAlert", "Please choose a rating (1 to 5 stars).", "warning");
      return;
    }
    const user = Malaab.currentUser();
    const reviews = Malaab.load("reviews") || [];
    reviews.push({
      id: Malaab.nextId(reviews),
      fieldId: fieldId,
      userId: user.id,
      bookingId: Number(bookingSelect.value),
      stars: chosenStars,
      comment: document.getElementById("comment").value.trim(),
      date: new Date().toISOString().slice(0, 10),
      hidden: false
    });
    Malaab.save("reviews", reviews);
    // Update the field's average rating
    const visible = reviews.filter(function (r) { return r.fieldId === fieldId && !r.hidden; });
    const avg = visible.reduce(function (s, r) { return s + r.stars; }, 0) / visible.length;
    const fields = Malaab.load("fields");
    const f = fields.find(function (x) { return x.id === fieldId; });
    if (f) {
      f.rating = Math.round(avg * 10) / 10;
      Malaab.save("fields", fields);
    }
form.reset();
form.classList.remove("was-validated");
chosenStars = 0;
paintStars(0);
renderReviews();
setupForm();
Malaab.showAlert("#formAlert", "Thank you! Your review was published.", "success");
});
renderReviews();
setupForm();
});