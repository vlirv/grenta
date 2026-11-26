/* =========================================================
   home.js — home page (Mouen)
   - date picker can't choose a past day
   - search form needs a name/area or a date
   - numbers in the green band count up when they appear
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
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
