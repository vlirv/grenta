/* =========================================================
   search.js — find a field (Wael)
   Live search, filters, sorting, "fields near me" and map.
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("searchForm");
  const q = document.getElementById("q");
  const dateInput = document.getElementById("date");
  const city = document.getElementById("city");
  const size = document.getElementById("size");
  const sort = document.getElementById("sort");
  const maxPrice = document.getElementById("maxPrice");
  const maxPriceText = document.getElementById("maxPriceText");
  const results = document.getElementById("results");
  const resultCount = document.getElementById("resultCount");
  const mapFrame = document.getElementById("mapFrame");
  const mapText = document.getElementById("mapText");
  // Only approved fields are shown to players
  const fields = Malaab.load("fields").filter(function (f) {
    return !f.status || f.status === "active";
  });
  let myPosition = null;
  // No past dates
  dateInput.min = todayString();
  // Values sent from the home page: search.html?q=...&date=...
  const params = new URLSearchParams(location.search);
  q.value = params.get("q") || "";
  if (params.get("date")) dateInput.value = params.get("date");
  function todayString() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
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
  // Distance in km between two points (haversine formula)
  function distanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function getFiltered() {
    const text = q.value.trim().toLowerCase();
    const list = fields.filter(function (f) {
      const words = (f.name + " " + f.city + " " + f.area).toLowerCase();
      return (!text || words.includes(text)) &&
        (!city.value || f.city === city.value) &&
        (!size.value || f.size === size.value) &&
        f.price <= Number(maxPrice.value);
    });
    list.forEach(function (f) {
      f.distance = myPosition && f.lat ? distanceKm(myPosition.lat, myPosition.lng, f.lat, f.lng) : null;
    });
    list.sort(function (a, b) {
      if (sort.value === "priceAsc") return a.price - b.price;
      if (sort.value === "priceDesc") return b.price - a.price;
      if (sort.value === "distance" && a.distance !== null) return a.distance - b.distance;
      return b.rating - a.rating;
    });
    return list;
  }
  function cardHtml(f) {
    const dateParam = dateInput.value ? "&date=" + dateInput.value : "";
    const photo = f.photos && f.photos.length ? "../assets/images/" + f.photos[0]
      : "../assets/images/placeholder.svg";
    return (
      '<div class="col-sm-6">' +
        '<div class="card field-card h-100">' +
          '<img src="' + Malaab.escapeHtml(photo) + '" class="card-img-top" alt="' +
            Malaab.escapeHtml(f.name) + '">' +
          '<div class="card-body">' +
            '<h2 class="h5 card-title mb-1">' + Malaab.escapeHtml(f.name) + "</h2>" +
            '<p class="field-meta mb-1"><i class="bi bi-geo-alt"></i> ' +
              Malaab.escapeHtml(f.city + " – " + f.area) + " &middot; " + Malaab.escapeHtml(f.size) + "</p>" +
            '<p class="mb-2">' + starsHtml(f.rating) + ' <small class="text-muted-site">' +
              (f.rating ? f.rating.toFixed(1) : "New") + "</small>" +
              (f.distance !== null ? ' <span class="distance ms-2"><i class="bi bi-cursor"></i> ' +
                f.distance.toFixed(1) + " km</span>" : "") + "</p>" +
            '<p class="price-tag mb-3">' + Malaab.formatPrice(f.price) + " / hour</p>" +
            '<div class="mt-auto d-flex gap-2">' +
              '<a class="btn btn-outline-main btn-sm flex-fill" href="field.html?id=' + f.id + '">Details</a>' +
              '<a class="btn btn-main btn-sm flex-fill" href="../booking/booking.html?field=' + f.id +
                dateParam + '">Book</a>' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }
  function updateMap(list) {
    const f = list[0];
    if (!f || !f.lat) return;
    const d = 0.03;
    const bbox = (f.lng - d) + "%2C" + (f.lat - d) + "%2C" + (f.lng + d) + "%2C" + (f.lat + d);
    mapFrame.src = "https://www.openstreetmap.org/export/embed.html?bbox=" + bbox +
      "&layer=mapnik&marker=" + f.lat + "%2C" + f.lng;
    mapText.textContent = "Showing: " + f.name + " (" + f.city + ")";
  }
  function render() {
    maxPriceText.textContent = Malaab.formatPrice(maxPrice.value);
    const list = getFiltered();
    resultCount.textContent = list.length + (list.length === 1 ? " field found" : " fields found");
    if (list.length === 0) {
      results.innerHTML =
        '<div class="col-12"><div class="panel empty-state"><i class="bi bi-search"></i>' +
        '<p class="mt-2 mb-0">No fields match your search. Try another name or remove filters.</p>' +
        "</div></div>";
      return;
    }
    results.innerHTML = list.map(cardHtml).join("");
    updateMap(list);
  }
  // Live filtering
  [q, city, size, sort, maxPrice, dateInput].forEach(function (el) {
    el.addEventListener("input", render);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    render();
  });
  form.addEventListener("reset", function () {
    myPosition = null;
    setTimeout(render, 0);
  });
  // Fields near me
  document.getElementById("nearMeBtn").addEventListener("click", function () {
    if (!navigator.geolocation) {
      Malaab.showAlert("#formAlert", "Your browser does not support location.", "warning");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        myPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        sort.value = "distance";
        render();
        Malaab.showAlert("#formAlert", "Fields are sorted by distance from you.", "success");
},
function () {
Malaab.showAlert("#formAlert", "We could not get your location. Please allow location access.", "warning");
}
);
});
render();
});