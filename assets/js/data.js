/* =========================================================
   data.js — SHARED demo data (Mouen)
   There is no server: this is the "database" of the site.
   Everyone can READ it. Saved changes go to localStorage
   through the helpers in main.js (Malaab.load / Malaab.save).
   Ask Mouen before changing the structure.
   ========================================================= */

const MALAAB_DATA = {
  // Demo accounts — password for all: 123456
  users: [
    { id: 1, name: "Ahmed Ali", email: "user@demo.ly", phone: "0912345678", city: "Tripoli", password: "123456", role: "player", status: "active" },
    { id: 2, name: "Salem Owner", email: "owner@demo.ly", phone: "0923456789", city: "Tripoli", password: "123456", role: "owner", status: "active" },
    { id: 3, name: "Admin", email: "admin@demo.ly", phone: "0919999999", city: "Tripoli", password: "123456", role: "admin", status: "active" }
  ],

  // Fields — used by home, search, field details, booking, owner panel
  fields: [
    { id: 1, name: "Andalus Arena", city: "Tripoli", area: "Hay Al Andalus", size: "5-a-side", price: 120, rating: 4.8, ownerId: 2, lat: 32.874, lng: 13.137, facilities: ["parking", "showers", "lights", "cafe"] },
    { id: 2, name: "Green Star", city: "Tripoli", area: "Souq Al Juma", size: "7-a-side", price: 100, rating: 4.5, ownerId: 2, lat: 32.905, lng: 13.236, facilities: ["parking", "lights"] },
    { id: 3, name: "Benghazi 5-a-side", city: "Benghazi", area: "Al Fuwayhat", size: "5-a-side", price: 90, rating: 4.6, ownerId: 2, lat: 32.087, lng: 20.093, facilities: ["lights", "showers"] },
    { id: 4, name: "Misrata Stadium Mini", city: "Misrata", area: "Center", size: "7-a-side", price: 110, rating: 4.4, ownerId: 2, lat: 32.377, lng: 15.092, facilities: ["parking", "lights", "cafe"] },
    { id: 5, name: "Seaside Pitch", city: "Tripoli", area: "Gargaresh", size: "5-a-side", price: 130, rating: 4.9, ownerId: 2, lat: 32.861, lng: 13.105, facilities: ["parking", "showers", "lights"] },
    { id: 6, name: "Zawiya Sports Club", city: "Zawiya", area: "Center", size: "11-a-side", price: 80, rating: 4.2, ownerId: 2, lat: 32.757, lng: 12.727, facilities: ["parking"] }
  ],

  // Coupons — used by checkout (Musab) and owner/admin coupons (Suhayib)
  coupons: [
    { code: "WELCOME20", type: "percent", value: 20, expires: "2027-12-31" },
    { code: "ANDALUS10", type: "fixed", value: 10, fieldId: 1, expires: "2027-12-31" },
    { code: "SUMMER25", type: "percent", value: 25, expires: "2025-09-01" }
  ],

  // Notifications — used by the bell and notifications page (Mouen)
  notifications: [
    { id: 1, type: "booking", icon: "bi-check-circle", title: "Booking confirmed", text: "Andalus Arena accepted your booking for Friday 8:00 PM.", time: "5 min ago", read: false },
    { id: 2, type: "booking", icon: "bi-alarm", title: "Reminder", text: "Your match at Green Star starts in 2 hours.", time: "1 hour ago", read: false },
    { id: 3, type: "offer", icon: "bi-tag", title: "New offer", text: "WELCOME20 — 20% off your next booking.", time: "Yesterday", read: false },
    { id: 4, type: "message", icon: "bi-chat-dots", title: "New message", text: "The owner of Seaside Pitch replied to your message.", time: "2 days ago", read: true },
    { id: 5, type: "booking", icon: "bi-x-circle", title: "Booking cancelled", text: "Your booking at Zawiya Sports Club was cancelled and refunded.", time: "Last week", read: true },
    { id: 6, type: "booking", icon: "bi-star", title: "Rate your match", text: "How was Benghazi 5-a-side? Leave a review.", time: "Last week", read: true }
  ],

  // Bookings — used by booking pages (Musab) and owner/admin (Suhayib)
  bookings: [
    { id: 1001, userId: 1, fieldId: 1, date: "2026-12-04", time: "20:00", hours: 1, total: 120, paid: 40, status: "confirmed" },
    { id: 1002, userId: 1, fieldId: 2, date: "2026-12-06", time: "18:00", hours: 1, total: 100, paid: 0, status: "pending" }
  ]
};
