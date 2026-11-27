/* =========================================================
   home.js — home page (Mouen)
   - date picker can't choose a past day
   - search form needs a name/area or a date
   - numbers in the green band count up when they appear
   - "Popular fields" cards come from the fields data
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  // 0. Popular fields: the 6 best-rated approved fields
  const esc = Malaab.escapeHtml;
  const fields = Malaab.load("fields")
    .filter(function (f) { return !f.status || f.status === "active"; })
    .sort(function (a, b) { return b.rating - a.rating; })
    .slice(0, 6);

  function stars(rating) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) html += '<i class="bi bi-star-fill"></i>';
      else if (rating >= i - 0.5) html += '<i class="bi bi-star-half"></i>';
      else html += '<i class="bi bi-star"></i>';
    }
    return '<span class="stars">' + html + "</span>";
  }

  document.getElementById("featuredFields").innerHTML = fields.map(function (f) {
    const photo = f.photos && f.photos.length ? f.photos[0] : "placeholder.svg";
    return (
      '<div class="col-sm-6 col-lg-4">' +
        '<div class="card field-card h-100">' +
          Malaab.favButton(f.id) +
          '<a href="fields/field.html?id=' + f.id + '">' +
            '<img src="assets/images/' + esc(photo) + '" class="card-img-top" alt="' + esc(f.name) + '"></a>' +
          '<div class="card-body">' +
            '<h3 class="h5 card-title mb-1">' + esc(f.name) + "</h3>" +
            '<p class="text-muted-site small mb-1"><i class="bi bi-geo-alt"></i> ' +
              esc(f.city + " – " + f.area) + " · " + esc(f.size) + "</p>" +
            '<p class="small mb-2">' + stars(f.rating) + " " + (f.rating ? f.rating.toFixed(1) : "") + "</p>" +
            '<div class="d-flex justify-content-between align-items-center">' +
              '<span class="price-tag">' + Malaab.formatPrice(f.price) + " / hour</span>" +
              '<span class="d-flex gap-2">' +
                '<a href="fields/field.html?id=' + f.id + '" class="btn btn-outline-main btn-sm">View</a>' +
                '<a href="booking/booking.html?field=' + f.id + '" class="btn btn-main btn-sm">Book</a>' +
              "</span>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }).join("");

  // Real numbers in the green band
  const allActive = Malaab.load("fields").filter(function (f) { return !f.status || f.status === "active"; });
  const cities = new Set(allActive.map(function (f) { return f.city; }));
  const band = document.querySelectorAll("#statsBand .count");
  if (band[0]) band[0].dataset.to = allActive.length;
  if (band[1]) band[1].dataset.to = cities.size;

  // 1. No past dates in the search
  const dateInput = document.getElementById("heroDate");
  const today = new Date();
  const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = todayStr;

  // 2. Search: ask for at least one value
  const form = document.getElementById("heroSearch");
  form.addEventListener("submit", function (e) {
    const q = form.elements.q.value.trim();
    if (!q && !dateInput.value) {
      e.preventDefault();
      form.elements.q.focus();
      form.elements.q.placeholder = "Type a field name or choose a date";
      form.elements.q.classList.add("is-invalid");
    }
  });
  form.elements.q.addEventListener("input", function () {
    this.classList.remove("is-invalid");
  });

  // 3. Count-up animation for the stats
  const counters = document.querySelectorAll("#statsBand .count");
  function countUp(el) {
    const end = Number(el.dataset.to);
    const start = performance.now();
    const duration = 1200;
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(end * t).toLocaleString("en-US");
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          counters.forEach(countUp);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(document.getElementById("statsBand"));
  }
});
