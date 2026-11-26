/* =========================================================
   owner-fields.js — the owner's fields (Suhayib)
   List, add, edit and delete fields.
   New fields wait for admin approval (status "pending").
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const owner = Malaab.requireLogin(["owner"]);
  if (!owner) return;

  const rows = document.getElementById("fieldRows");
  const form = document.getElementById("fieldForm");
  const photosInput = document.getElementById("photos");
  const preview = document.getElementById("photoPreview");
  const docInput = document.getElementById("doc");
  const esc = Malaab.escapeHtml;

  const STATUS = {
    active: ["status-confirmed", "Active"],
    pending: ["status-pending", "Waiting approval"],
    rejected: ["status-cancelled", "Rejected"],
    suspended: ["status-cancelled", "Suspended"]
  };

  function myFields() {
    return Malaab.load("fields").filter(function (f) {
      return f.ownerId === owner.id;
    });
  }

  function render() {
    const list = myFields();
    rows.innerHTML = list.map(function (f) {
      const s = STATUS[f.status || "active"] || STATUS.active;
      return (
        "<tr>" +
          "<td><strong>" + esc(f.name) + "</strong></td>" +
          "<td>" + esc(f.city) + "</td>" +
          "<td>" + esc(f.size) + "</td>" +
          "<td>" + Malaab.formatPrice(f.price) + "</td>" +
          '<td><span class="status ' + s[0] + '">' + s[1] + "</span></td>" +
          '<td class="text-end text-nowrap">' +
            '<button type="button" class="btn btn-outline-main btn-sm" data-edit="' + f.id + '">' +
              '<i class="bi bi-pencil"></i> Edit' +
            "</button> " +
            '<button type="button" class="btn btn-outline-danger btn-sm" data-delete="' + f.id + '">' +
              '<i class="bi bi-trash"></i>' +
            "</button>" +
          "</td>" +
        "</tr>"
      );
    }).join("") || '<tr><td colspan="6" class="text-muted-site">You have no fields yet.</td></tr>';
  }

  function openForm(field) {
    form.reset();
    form.classList.remove("was-validated");
    form.classList.remove("d-none");
    preview.innerHTML = "";

    document.getElementById("formTitle").textContent = field ? "Edit " + field.name : "Add a field";
    document.getElementById("fieldId").value = field ? field.id : "";
    docInput.required = !field;
    document.getElementById("docText").textContent = field
      ? (field.document ? "Current: " + field.document : "Optional when editing.")
      : "Required for a new field.";

    if (field) {
      ["name", "city", "area", "phone", "size", "price", "description"].forEach(function (key) {
        document.getElementById(key).value = field[key] || "";
      });
      document.getElementById("rules").value = (field.rules || []).join("\n");
      form.querySelectorAll(".facility").forEach(function (box) {
        box.checked = (field.facilities || []).includes(box.value);
      });
      preview.innerHTML = (field.photos || []).map(function (p) {
        return '<img src="../assets/images/' + esc(p) + '" alt="">';
      }).join("");
    }

    form.scrollIntoView({ behavior: "smooth" });
  }

  document.getElementById("addBtn").addEventListener("click", function () {
    openForm(null);
  });

  document.getElementById("cancelBtn").addEventListener("click", function () {
    form.classList.add("d-none");
  });

  // Photo preview
  photosInput.addEventListener("change", function () {
    preview.innerHTML = "";
    Array.from(photosInput.files).forEach(function (file) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      preview.appendChild(img);
    });
  });

  // Edit / delete buttons
  rows.addEventListener("click", function (e) {
    const editBtn = e.target.closest("[data-edit]");
    const deleteBtn = e.target.closest("[data-delete]");

    if (editBtn) {
      openForm(myFields().find(function (f) {
        return f.id === Number(editBtn.dataset.edit);
      }));
    }

    if (deleteBtn) {
      const id = Number(deleteBtn.dataset.delete);
      const now = new Date();
      const hasFuture = Malaab.load("bookings").some(function (b) {
        return b.fieldId === id && b.status === "confirmed" && new Date(b.date + "T" + b.time) > now;
      });

      if (hasFuture) {
        Malaab.showAlert("#formAlert", "This field has upcoming confirmed bookings. It cannot be deleted.", "warning");
        return;
      }

      if (!confirm("Delete this field?")) return;

      Malaab.save("fields", Malaab.load("fields").filter(function (f) {
        return f.id !== id;
      }));
      render();
      Malaab.showAlert("#formAlert", "The field was deleted.", "success");
    }
  });

  // Save
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!Malaab.validate(form)) return;

    const fields = Malaab.load("fields");
    const id = Number(document.getElementById("fieldId").value);
    let field = fields.find(function (f) {
      return f.id === id && f.ownerId === owner.id;
    });

    const isNew = !field;
    if (isNew) {
      field = {
        id: Malaab.nextId(fields),
        ownerId: owner.id,
        rating: 0,
        status: "pending",
        photos: []
      };
      fields.push(field);
    }

    field.name = document.getElementById("name").value.trim();
    field.city = document.getElementById("city").value;
    field.area = document.getElementById("area").value.trim();
    field.phone = document.getElementById("phone").value.trim();
    field.size = document.getElementById("size").value;
    field.price = Number(document.getElementById("price").value);
    field.description = document.getElementById("description").value.trim();
    field.rules = document.getElementById("rules").value
      .split("\n")
      .map(function (r) { return r.trim(); })
      .filter(Boolean);
    field.facilities = Array.from(form.querySelectorAll(".facility:checked")).map(function (box) {
      return box.value;
    });

    if (photosInput.files.length) {
      field.photos = Array.from(photosInput.files).map(function (f) { return f.name; });
    }
    if (docInput.files.length) {
      field.document = docInput.files[0].name;
    }

    Malaab.save("fields", fields);
    form.classList.add("d-none");
    render();
    Malaab.showAlert(
      "#formAlert",
      isNew
        ? "Field added. It will be visible to players after the admin approves it."
        : "Field updated.",
      "success"
    );
  });

  render();
});