/* =========================================================
   field.js — field details (Wael)
   Opens with field.html?id=FIELD_ID
   Gallery, info, facilities, rules, contact, book button,
   latest reviews.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const page = document.getElementById("fieldPage");
  const id = Number(new URLSearchParams(location.search).get("id"));
  const field = Malaab.load("fields").find(function (f) {
    return f.id === id && (!f.status || f.status === "active");
  });
  const FACILITIES = {
    parking: { icon: "bi-p-square", label: "Parking" },
    showers: { icon: "bi-droplet", label: "Showers" },
    lights: { icon: "bi-lightbulb", label: "Night lights" },
    cafe: { icon: "bi-cup-hot", label: "Café" }
  };
  const esc = Malaab.escapeHtml;
  if (!field) {
    page.innerHTML =
      '<div class="panel empty-state"><i class="bi bi-exclamation-circle"></i>' +
      '<h1 class="h4 mt-2">Field not found</h1>' +
      '<p>This field does not exist or is not available.</p>' +
      '<a href="search.html" class="btn btn-main">Back to search</a></div>';
    return;
  }
  document.title = field.name + " | Malaab";
  function starsHtml(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) html += '<i class="bi bi-star-fill"></i>';
      else if (rating >= i - 0.5) html += '<i class="bi bi-star-half"></i>';
      else html += '<i class="bi bi-star"></i>';
    }
    return '<span class="stars">' + html + "</span>";
  }
  // ===== Gallery =====
  const photos = field.photos && field.photos.length
    ? field.photos.map(function (p) { return "../assets/images/" + p; })
    : ["../assets/images/placeholder.svg", "../assets/images/placeholder.svg"];
  const slides = photos.map(function (src, i) {
    return '<div class="carousel-item' + (i === 0 ? " active" : "") + '">' +
      '<img src="' + esc(src) + '" class="d-block w-100" alt="' + esc(field.name) + " photo " + (i + 1) + '">' +
      "</div>";
  }).join("");
  // ===== Facilities and rules =====
  const facilities = (field.facilities || []).map(function (key) {
    const f = FACILITIES[key];
    return f ? '<span class="facility"><i class="bi ' + f.icon + '"></i> ' + f.label + "</span>" : "";
  }).join("") || '<p class="text-muted-site mb-0">No facilities listed.</p>';
  const rules = (field.rules && field.rules.length ? field.rules : [
    "Arrive 10 minutes before your time.",
    "Football shoes only (no metal studs).",
    "Cancel at least 24 hours before to get a refund."
  ]).map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("");
  // ===== Contact =====
  const phone = field.phone || "0910000000";
  const whatsapp = "218" + phone.replace(/^0/, "");
  // ===== Reviews =====
  const users = Malaab.load("users");
  const reviews = (Malaab.load("reviews") || [])
    .filter(function (r) { return r.fieldId === field.id && !r.hidden; })
    .sort(function (a, b) { return b.date.localeCompare(a.date); });
  const latest = reviews.slice(0, 3).map(function (r) {
    const user = users.find(function (u) { return u.id === r.userId; });
    return '<div class="review-item">' +
      '<div class="d-flex justify-content-between"><strong>' + esc(user ? user.name : "Player") +
      "</strong>" + starsHtml(r.stars) + "</div>" +
      '<p class="mb-1">' + esc(r.comment) + "</p>" +
      '<small class="text-muted-site">' + esc(r.date) + "</small></div>";
  }).join("") || '<p class="text-muted-site mb-0">No reviews yet. Be the first after your match!</p>';
  page.innerHTML =
    '<nav aria-label="breadcrumb"><ol class="breadcrumb">' +
      '<li class="breadcrumb-item"><a href="search.html">Fields</a></li>' +
      '<li class="breadcrumb-item active" aria-current="page">' + esc(field.name) + "</li></ol></nav>" +
    '<div class="row g-4">' +
      '<div class="col-lg-8">' +
        '<div id="gallery" class="carousel slide field-gallery mb-4" data-bs-ride="carousel">' +
          '<div class="carousel-inner">' + slides + "</div>" +
          '<button class="carousel-control-prev" type="button" data-bs-target="#gallery" data-bs-slide="prev">' +
            '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
            '<span class="visually-hidden">Previous</span></button>' +
          '<button class="carousel-control-next" type="button" data-bs-target="#gallery" data-bs-slide="next">' +
            '<span class="carousel-control-next-icon" aria-hidden="true"></span>' +
            '<span class="visually-hidden">Next</span></button>' +
        "</div>" +
        '<div class="d-flex align-items-center gap-3 mb-1"><h1 class="section-title mb-0">' + esc(field.name) +
          "</h1>" + Malaab.favButton(field.id).replace("fav-btn", "fav-btn inline") + "</div>" +
        '<p class="field-meta"><i class="bi bi-geo-alt"></i> ' + esc(field.city + " – " + field.area) +
          " &middot; " + esc(field.size) + "</p>" +
        '<p>' + starsHtml(field.rating) + " <strong>" + (field.rating ? field.rating.toFixed(1) : "New") +
          '</strong> <a href="reviews.html?field=' + field.id + '">(' + reviews.length + " reviews)</a></p>" +
        '<p>' + esc(field.description || "A well-kept football field with artificial grass, " +
          "ready for your team every evening.") + "</p>" +
        '<div class="panel mb-4"><h2 class="h5">Facilities</h2>' + facilities + "</div>" +
        '<div class="panel mb-4"><h2 class="h5">Rules</h2><ul class="mb-0">' + rules + "</ul></div>" +
        '<div class="panel"><div class="d-flex justify-content-between align-items-center">' +
          '<h2 class="h5 mb-0">Latest reviews</h2>' +
          '<a href="reviews.html?field=' + field.id + '" class="btn btn-outline-main btn-sm">All reviews</a>' +
          "</div>" + latest + "</div>" +
      "</div>" +
      '<div class="col-lg-4">' +
        '<div class="panel book-box sticky-lg-top">' +
          '<p class="mb-0 text-muted-site">Price per hour</p>' +
          '<p class="big-price mb-3">' + Malaab.formatPrice(field.price) + "</p>" +
          '<a href="../booking/booking.html?field=' + field.id + '" class="btn btn-main w-100 mb-3">' +
            '<i class="bi bi-calendar-check"></i> Book now</a>' +
          '<div class="d-flex gap-2">' +
            '<a href="tel:' + esc(phone) + '" class="btn btn-outline-main flex-fill">' +
              '<i class="bi bi-telephone"></i> Call</a>' +
            '<a href="https://wa.me/' + esc(whatsapp) + '" target="_blank" rel="noopener" ' +
              'class="btn btn-outline-main flex-fill"><i class="bi bi-whatsapp"></i> WhatsApp</a>' +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
  // If a photo file is missing, show the placeholder
  page.querySelectorAll(".carousel-item img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.src = "../assets/images/placeholder.svg";
    }, { once: true });
  });
});