/* =========================================================
checkout.js — confirm and pay (Musab)
Reads "cart" from booking.html, 10-minute countdown,
coupon, payment choice, demo card check, then creates the
booking(s) and opens the receipt.
========================================================= */
document.addEventListener("DOMContentLoaded", function () {
const user = Malaab.requireLogin(["player"]);
if (!user) return;
const cart = Malaab.load("cart");
if (!cart || !cart.heldUntil || cart.heldUntil < Date.now()) {
alert("Your time slot is no longer held. Please choose it again.");
Malaab.go("booking/booking.html" + (cart ? "?field=" + cart.fieldId : ""));
return;
}
const field = Malaab.load("fields").find(function (f) { return f.id === cart.fieldId; });
const form = document.getElementById("payForm");
const cardPanel = document.getElementById("cardPanel");
const cardNumber = document.getElementById("cardNumber");
const cardExpiry = document.getElementById("cardExpiry");
const weeks = cart.recurring ? 4 : 1;
const subtotal = cart.price * cart.hours * weeks;
let coupon = null;
let discount = 0;
function addDays(dateStr, days) {
const d = new Date(dateStr + "T00:00");
d.setDate(d.getDate() + days);
return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
String(d.getDate()).padStart(2, "0");
}
function payment() {
return form.querySelector("input[name=payment]:checked").value;
}
// ===== Summary =====
function amounts() {
const total = Math.max(subtotal - discount, 0);
let payNow = 0;
if (payment() === "deposit") payNow = Math.round(total * 0.3);
if (payment() === "full") payNow = total;
return { total: total, payNow: payNow, remaining: total - payNow };
}
function renderSummary() {
const a = amounts();
document.getElementById("sumField").textContent = field ? field.name : "";
document.getElementById("sumDate").textContent = cart.date + (weeks > 1 ? " (+3 weeks)" : "");
document.getElementById("sumTime").textContent = cart.time + " · " + cart.hours + "h";
document.getElementById("sumSubtotal").textContent = Malaab.formatPrice(subtotal);
document.getElementById("sumDiscount").textContent = "- " + Malaab.formatPrice(discount);
document.getElementById("sumTotal").textContent = Malaab.formatPrice(a.total);
document.getElementById("sumPayNow").textContent = Malaab.formatPrice(a.payNow);
document.getElementById("sumRemaining").textContent = Malaab.formatPrice(a.remaining);
// Card form only when paying now
const needCard = payment() !== "field";
cardPanel.classList.toggle("d-none", !needCard);
cardPanel.querySelectorAll("input").forEach(function (input) { input.disabled = !needCard; });
}
form.querySelectorAll("input[name=payment]").forEach(function (r) {
r.addEventListener("change", renderSummary);
});
// ===== Countdown =====
const countdown = document.getElementById("countdown");
const timer = setInterval(function () {
const left = cart.heldUntil - Date.now();
if (left <= 0) {
clearInterval(timer);
Malaab.save("cart", null);
alert("Time is up. The slot was released. Please choose it again.");
Malaab.go("booking/booking.html?field=" + cart.fieldId);
return;
}
const s = Math.floor(left / 1000);
countdown.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}, 1000);
// ===== Coupon =====
document.getElementById("couponBtn").addEventListener("click", function () {
const code = document.getElementById("couponInput").value.trim().toUpperCase();
const today = addDays(new Date().toISOString().slice(0, 10), 0);
const found = Malaab.load("coupons").find(function (c) { return c.code === code; });
let error = "";
if (!code) error = "Please type a coupon code.";
else if (!found) error = "This coupon does not exist.";
else if (found.expires < today) error = "This coupon has expired.";
else if (found.fieldId && found.fieldId !== cart.fieldId) error = "This coupon is not for this field.";
else if (found.maxUses && (found.used || 0) >= found.maxUses) error = "This coupon was used up.";
if (error) {
coupon = null;
discount = 0;
Malaab.showAlert("#couponAlert", error, "danger");
} else {
coupon = found;
discount = found.type === "percent" ? Math.round(subtotal * found.value / 100) : found.value;
discount = Math.min(discount, subtotal);
Malaab.showAlert("#couponAlert", "Coupon applied: -" + Malaab.formatPrice(discount), "success");
}
renderSummary();
});
// ===== Card input helpers =====
cardNumber.addEventListener("input", function () {
const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
cardNumber.value = digits.replace(/(.{4})(?=.)/g, "$1 ");
});
cardExpiry.addEventListener("input", function () {
const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
cardExpiry.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
});
function expiryOk(value) {
const p = value.split("/");
if (p.length !== 2) return false;
const end = new Date(2000 + Number(p[1]), Number(p[0]), 1); // first day after expiry month
return end > new Date();
}
// ===== Pay =====
form.addEventListener("submit", function (e) {
e.preventDefault();
const needCard = payment() !== "field";
if (needCard) {
cardExpiry.setCustomValidity(cardExpiry.value && !expiryOk(cardExpiry.value) ? "Card expired" : "");
}
if (!Malaab.validate(form)) {
Malaab.showAlert("#formAlert", "Please check the card details.", "danger");
return;
}
if (needCard && cardNumber.value.replace(/\s/g, "").endsWith("0002")) {
Malaab.showAlert("#formAlert", "Your card was declined. Please try another card.", "danger");
return;
}
const a = amounts();
const bookings = Malaab.load("bookings");
const created = [];
for (let w = 0; w < weeks; w++) {
const booking = {
id: Malaab.nextId(bookings),
userId: user.id,
fieldId: cart.fieldId,
date: addDays(cart.date, w * 7),
time: cart.time,
hours: cart.hours,
total: Math.round(a.total / weeks),
discount: Math.round(discount / weeks),
paid: Math.round(a.payNow / weeks),
payment: payment(),
coupon: coupon ? coupon.code : "",
recurring: cart.recurring,
status: "pending",
reason: "",
createdAt: new Date().toISOString()
};
bookings.push(booking);
created.push(booking);
}
Malaab.save("bookings", bookings);
// Count coupon use
if (coupon) {
const coupons = Malaab.load("coupons");
const c = coupons.find(function (x) { return x.code === coupon.code; });
c.used = (c.used || 0) + 1;
Malaab.save("coupons", coupons);
}
// Notifications for the player and the owner
const notes = Malaab.load("notifications");
notes.unshift({
id: Malaab.nextId(notes), userId: user.id, type: "booking", icon: "bi-hourglass-split",
title: "Booking request sent",
text: "Your request for " + field.name + " on " + cart.date + " at " + cart.time + " is waiting for the owner.",
time: "Just now", read: false
});
notes.unshift({
id: Malaab.nextId(notes), userId: field.ownerId, type: "booking", icon: "bi-calendar-plus",
title: "New booking request",
text: user.name + " wants " + field.name + " on " + cart.date + " at " + cart.time + ".",
time: "Just now", read: false
});
Malaab.save("notifications", notes);
clearInterval(timer);
Malaab.save("cart", null);
Malaab.go("booking/receipt.html?id=" + created[0].id);
});
renderSummary();
});