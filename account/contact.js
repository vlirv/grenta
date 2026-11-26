/* =========================================================
   contact.js — contact page (Mouen)
   Character counter, validation, saves the message and
   shows a confirmation.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const message = form.elements.message;
  const counter = document.getElementById("msgCount");

  // Fill name/email if logged in
  const user = Malaab.currentUser();
  if (user) {
    form.elements.name.value = user.name;
    form.elements.email.value = user.email;
    form.elements.phone.value = user.phone || "";
  }

  // Live character counter
  function updateCounter() {
    counter.textContent = message.value.length + " / " + message.maxLength;
  }
  message.addEventListener("input", updateCounter);
  updateCounter();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(form)) {
      Malaab.showAlert("#formAlert", "Please fill the required fields correctly.", "danger");
      return;
    }

    const messages = Malaab.load("contactMessages") || [];
    messages.push({
      id: Malaab.nextId(messages),
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      topic: form.elements.topic.value,
      message: message.value.trim(),
      date: new Date().toISOString()
    });
    Malaab.save("contactMessages", messages);

    form.reset();
    form.classList.remove("was-validated");
    updateCounter();
    Malaab.showAlert("#formAlert", "Thank you! We received your message and will reply soon.", "success");
  });
});
