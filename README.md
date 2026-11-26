# ⚽ Malaab – Football Field Booking Website — موقع حجز الملاعب

A football field booking website built with **HTML, CSS and Bootstrap 5**. Team of 4.
Players find a field, pick a time slot and book; owners manage their fields; the admin runs the platform.

## Folder structure — each person has their own folder

```
grenta/
├── index.html                 Home page                              (Mouen)
├── assets/                    SHARED – owned by Mouen
│   ├── css/style.css          Colors, fonts, buttons, cards, badges
│   ├── css/navbar.css         Navbar
│   ├── css/responsive.css     Mobile / desktop
│   ├── css/home.css           Home page
│   ├── js/data.js             Demo data: users, fields, bookings, coupons, notifications
│   ├── js/main.js             Shared helpers (Malaab.load/save, login, alerts …)
│   ├── js/home.js             Home page JS
│   └── images/                Put ALL photos here (everyone)
│
├── account/                   👤 MOUEN – accounts & core
│   ├── login.html             Login (player / owner / admin)
│   ├── register.html          Player sign-up
│   ├── register-owner.html    Field owner sign-up (waits for admin approval)
│   ├── profile.html           Profile + change password
│   ├── notifications.html     Notifications
│   ├── contact.html           Contact form + map
│   └── account.css
│
├── fields/                    🔎 WAEL – field discovery, reviews, support
│   ├── search.html            Search + filters + map
│   ├── field.html             Field details
│   ├── reviews.html           Ratings & reviews
│   ├── support.html           FAQ + open ticket + my tickets
│   ├── ticket.html            One ticket with replies
│   └── fields.css
│
├── booking/                   📅 MUSAB – booking, checkout, payment
│   ├── booking.html           Day + time slot picker
│   ├── checkout.html          Coupon + payment (demo)
│   ├── receipt.html           Printable receipt
│   ├── my-bookings.html       My bookings
│   ├── messages.html          Chat with the owner
│   └── booking.css
│
└── dashboard/                 🛠️ SUHAYIB – owner panel & admin panel
    ├── owner.html             Owner dashboard
    ├── owner-fields.html      My fields + add/edit field
    ├── owner-schedule.html    Weekly schedule + blocked dates
    ├── owner-requests.html    Accept / reject bookings + coupons
    ├── admin.html             Admin dashboard
    ├── admin-approvals.html   Approve owners & fields
    ├── admin-users.html       Users / owners / fields / reviews
    └── dashboard.css
```

**Every page has its own JS file** with the same name, in the same folder
(`login.html` → `login.js`, `booking.html` → `booking.js`). Each page loads
`data.js` + `main.js` first, then its own file. The yellow **TODO** list at the top of each
partner's JS file says what to build.

**Links inside a folder:** CSS is `../assets/css/style.css`, images are `../assets/images/x.jpg`,
another page in the same folder is just `page.html`, a page in another folder is `../booking/booking.html`.

Every page already has the shared **navbar** and **footer** and the right CSS links.
Pages that still need work show a yellow **"Under construction"** box with the list of what to build.
Replace the box with your content.

## JavaScript — how data works

There is no server. `assets/js/data.js` holds the demo data, and changes are saved in the
browser's `localStorage` through the shared helpers in `main.js`:

```js
const fields = Malaab.load("fields");          // read
fields.push(newField);
Malaab.save("fields", fields);                 // save

const user = Malaab.currentUser();             // logged-in user or null
Malaab.requireLogin(["owner"]);                // protect a page (owner / admin / player)
Malaab.showAlert("#formAlert", "Saved!", "success");
Malaab.validate(form);                         // Bootstrap validation, true if OK
Malaab.go("booking/receipt.html?id=1001");     // path from the project root
```

Demo accounts (password `123456`): player `user@demo.ly`, owner `owner@demo.ly`, admin `admin@demo.ly`.
To reset the demo data: open the browser console and run `localStorage.clear()`.

**Already working (Mouen):** login with role check and redirect, sign-up (password match, unique
email), owner sign-up (saved as *pending* for the admin approvals page), profile edit + change
password + logout, page protection, notifications (filters, mark as read, delete, bell count),
contact form with counter, home search check and animated numbers.

## Task distribution — توزيع المهام

| # | Member | Folder | Responsibility |
|---|---|---|---|
| 1 | **Mouen** (team lead) | `account/`, `assets/`, `index.html` | Repo, shared CSS + shared JS, navbar/footer, home, login, register, owner register, profile, notifications, contact, responsive, GitHub Pages ✅ **done** |
| 2 | **Wael** | `fields/` | Search + filters + map, field details, reviews, FAQ & support tickets (HTML + CSS + JS) |
| 3 | **Musab** | `booking/` | Slot calendar, checkout with coupon & payment (demo), 10-min countdown, receipt + print, my bookings, messages (HTML + CSS + JS) |
| 4 | **Suhayib** | `dashboard/` | Owner panel (fields, schedule, requests, coupons) and admin panel (stats, approvals, users, reviews) (HTML + CSS + JS) |

**Rule:** work only inside your own folder. Use the shared classes from `style.css`
(`btn-main`, `btn-outline-main`, `panel`, `field-card`, `price-tag`, `status status-confirmed / -pending / -booked / -cancelled`).
If you need to change anything in `assets/` or the navbar/footer, tell Mouen first.

---

## AI prompts for each member

`docs/ai-prompts/` has a PDF (and a .txt for easy copying) for each person with a prompt to paste
into your AI, so everyone's AI follows the same rules, design and data formats:
`Mouen-AI-prompt.pdf`, `Wael-AI-prompt.pdf`, `Musab-AI-prompt.pdf`, `Suhayib-AI-prompt.pdf`.

---

## How to join and work together — طريقة الانضمام والعمل

### 1. Get access (one time)
1. Create a free account on [github.com](https://github.com).
2. Send your GitHub username to Mouen.
3. Mouen adds you: **Settings → Collaborators → Add people**.
4. Accept the invitation email.

### 2. Download the project (one time)
```bash
git clone https://github.com/vlirv/grenta.git
cd grenta
```

### 3. Every time you work
```bash
git pull origin main          # 1. get the team's latest work FIRST
# ... edit files in YOUR folder ...
git add .
git commit -m "Add search filters"
git pull origin main          # 2. pull again in case someone pushed meanwhile
git push origin main          # 3. upload your work
```

### Tips
- Always `git pull` **before** you start.
- Commit small and often, with clear messages.
- Image names: lowercase, no spaces (e.g. `andalus-arena.jpg`).
- Preview: use VS Code **Live Server** (recommended), or open the `.html` file in your browser.
- Open the browser console (F12) to see JS errors and the starter `console.log` output.

## Publishing (Mouen, at the end)
**Settings → Pages → Source: Deploy from a branch → `main` / root → Save.**
The site will be at `https://vlirv.github.io/grenta/`.
