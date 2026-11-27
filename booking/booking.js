/* =========================================================
booking.js — choose a day and a time slot (Musab)
Opens with booking.html?field=FIELD_ID (optional &date=)
Uses the owner's schedule (or 16:00–23:00 by default),
blocks taken slots and saves the choice in "cart".
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
const user = Malaab.requireLogin(["player"]);
if (!user) return;
const params = new URLSearchParams(location.search);
const fieldId = Number(params.get("field"));
const field = Malaab.load("fields").find(function (f) {
return f.id === fieldId && (!f.status || f.status === "active");
});
if (!field) {
document.querySelector("main .row").innerHTML =
'<div class="col-12"><div class="panel text-center">' +
'<p>Please choose a field first.</p>' +
'<a href="../fields/search.html" class="btn btn-main">Find a field</a></div></div>';
return;
}
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const dayList = document.getElementById("dayList");
const slotGrid = document.getElementById("slotGrid");
const hoursSelect = document.getElementById("hours");
const recurring = document.getElementById("recurring");
const continueBtn = document.getElementById("continueBtn");
const allSchedules = Malaab.load("schedule") || {};
const schedule = allSchedules[field.id] || {};
const slotMinutes = schedule.slotMinutes || 60;
let selectedDate = params.get("date") || dateString(new Date());
let selectedTime = null;
// ===== Field summary =====
document.getElementById("fieldName").textContent = field.name;
document.getElementById("fieldPlace").textContent = field.city + " – " + field.area + " · " + field.size;
document.getElementById("fieldPrice").textContent = Malaab.formatPrice(field.price) + " / hour";
// ===== Date / time helpers =====
function dateString(d) {
return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
String(d.getDate()).padStart(2, "0");
}
function toMinutes(time) {
const p = time.split(":");
return Number(p[0]) * 60 + Number(p[1]);
}
function toTime(minutes) {
return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
}
function addDays(dateStr, days) {
const d = new Date(dateStr + "T00:00");
d.setDate(d.getDate() + days);
return dateString(d);
}
// Opening hours of a date: { open, close } or null if closed
function hoursFor(dateStr) {
if ((schedule.blocked || []).includes(dateStr)) return null;
const key = DAY_KEYS[new Date(dateStr + "T00:00").getDay()];
const day = schedule.days && schedule.days[key];
if (day && day.closed) return null;
return { open: day ? day.open : "16:00", close: day ? day.close : "23:00" };
}
// Is the time range [start, start + hours) free on that date?
function isFree(dateStr, time, hours) {
const start = toMinutes(time);
const end = start + hours * 60;
const open = hoursFor(dateStr);
if (!open || start < toMinutes(open.open) || end > toMinutes(open.close)) return false;
return !Malaab.load("bookings").some(function (b) {
if (b.fieldId !== field.id || b.date !== dateStr) return false;
if (b.status !== "pending" && b.status !== "confirmed") return false;
const bStart = toMinutes(b.time);
const bEnd = bStart + (b.hours || 1) * 60;
return start < bEnd && bStart < end;
});
}
// ===== Days =====
function renderDays() {
const today = dateString(new Date());
if (selectedDate < today) selectedDate = today;
let html = "";
for (let i = 0; i < 7; i++) {
const ds = addDays(today, i);
const d = new Date(ds + "T00:00");
const name = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
html += '<button type="button" class="day-btn' + (ds === selectedDate ? " active" : "") +
'" data-date="' + ds + '">' + name +
"<small>" + d.toLocaleDateString("en-US", { day: "numeric", month: "short" }) + "</small></button>";
}
dayList.innerHTML = html;
}
// ===== Slots =====
function renderSlots() {
const open = hoursFor(selectedDate);
if (!open) {
slotGrid.innerHTML = '<p class="text-muted-site mb-0">The field is closed on this day.</p>';
return;
}
const hours = Number(hoursSelect.value);
const now = new Date();
let html = "";
for (let m = toMinutes(open.open); m + slotMinutes <= toMinutes(open.close); m += slotMinutes) {
const time = toTime(m);
const past = new Date(selectedDate + "T" + time) <= now;
const free = isFree(selectedDate, time, hours);
let css = "slot";
if (past) css += " past";
else if (!free) css += " taken";
if (time === selectedTime) css += " selected";
html += '<button type="button" class="' + css + '" data-time="' + time + '"' +
(past || !free ? " disabled" : "") + ">" + time + "</button>";
}
slotGrid.innerHTML = html || '<p class="text-muted-site mb-0">No time slots on this day.</p>';
}
// ===== Price summary =====
function renderSummary() {
const hours = Number(hoursSelect.value);
const weeks = recurring.checked ? 4 : 1;
const total = field.price * hours * weeks;
document.getElementById("sumDay").textContent = selectedDate;
document.getElementById("sumTime").textContent = selectedTime
? selectedTime + " – " + toTime(toMinutes(selectedTime) + hours * 60) : "–";
document.getElementById("sumCalc").textContent =
field.price + " × " + hours + "h" + (weeks > 1 ? " × 4 weeks" : "");
document.getElementById("sumTotal").textContent = selectedTime ? Malaab.formatPrice(total) : "0 LYD";
continueBtn.disabled = !selectedTime;
}
function renderAll() {
renderDays();
renderSlots();
renderSummary();
}
// ===== Events =====
dayList.addEventListener("click", function (e) {
const btn = e.target.closest(".day-btn");
if (!btn) return;
selectedDate = btn.dataset.date;
selectedTime = null;
renderAll();
});
slotGrid.addEventListener("click", function (e) {
const btn = e.target.closest(".slot");
if (!btn || btn.disabled) return;
selectedTime = btn.dataset.time;
renderSlots();
renderSummary();
});
hoursSelect.addEventListener("change", function () {
if (selectedTime && !isFree(selectedDate, selectedTime, Number(hoursSelect.value))) {
selectedTime = null;
Malaab.showAlert("#formAlert", "That time is not free for 2 hours. Please choose again.", "warning");
}
renderSlots();
renderSummary();
});
recurring.addEventListener("change", renderSummary);
continueBtn.addEventListener("click", function () {
const hours = Number(hoursSelect.value);
if (recurring.checked) {
for (let w = 1; w < 4; w++) {
const d = addDays(selectedDate, w * 7);
if (!isFree(d, selectedTime, hours)) {
Malaab.showAlert("#formAlert", "This time is already booked on " + d +
". Turn off weekly repeat or choose another time.", "warning");
return;
}
}
}
Malaab.save("cart", {
fieldId: field.id,
date: selectedDate,
time: selectedTime,
hours: hours,
recurring: recurring.checked,
price: field.price,
heldUntil: Date.now() + 10 * 60 * 1000
});
Malaab.go("booking/checkout.html");
});
renderAll();
});