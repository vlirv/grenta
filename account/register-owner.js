/* =========================================================
   register-owner.js — field owner sign-up (Mouen)
   Saves the owner with status "pending" and the field with
   status "pending" so the admin can approve them
   (dashboard/admin-approvals.html – Suhayib).
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("ownerForm");
  const docInput = form.elements.doc;
  const MAX_MB = 5;

  // Document: max 5 MB
  docInput.addEventListener("change", function () {
    const file = docInput.files[0];
    if (file && file.size > MAX_MB * 1024 * 1024) {
      docInput.setCustomValidity("File is larger than " + MAX_MB + " MB");
      Malaab.showAlert("#formAlert", "The document must be smaller than " + MAX_MB + " MB.", "warning");
    } else {
      docInput.setCustomValidity("");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(form)) return;

    const users = Malaab.load("users");
    const email = form.elements.email.value.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) {
      Malaab.showAlert("#formAlert", "This email is already registered.", "warning");
      return;
    }

    const owner = {
      id: Malaab.nextId(users),
      name: form.elements.name.value.trim(),
      email: email,
      phone: form.elements.phone.value.trim(),
      city: form.elements.city.value,
      password: form.elements.password.value,
      role: "owner",
      status: "pending"
    };
    users.push(owner);
    Malaab.save("users", users);

    const fields = Malaab.load("fields");
    fields.push({
      id: Malaab.nextId(fields),
      name: form.elements.field.value.trim(),
      city: form.elements.city.value,
      area: form.elements.address.value.trim(),
      size: form.elements.size.value,
      price: Number(form.elements.price.value),
      rating: 0,
      ownerId: owner.id,
      facilities: [],
      document: docInput.files[0] ? docInput.files[0].name : "",
      status: "pending"
    });
    Malaab.save("fields", fields);

    form.reset();
    form.classList.remove("was-validated");
    Malaab.showAlert("#formAlert",
      "Thank you! Your request was sent. The admin will review your field and you can log in after approval.",
      "success");
  });
});
