# FlexFit Gym Management System

A complete, production-style gym management platform.

**Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion (dark/light mode, animations, responsive UI)
**Backend:** Python + Django + Django REST Framework + PostgreSQL (JWT auth, REST API, admin dashboard)
**Payments:** Razorpay (supports UPI, cards, netbanking, wallets) with order creation, signature verification and webhook handling

---

## ✨ Features

- Programs, Trainers (with profiles & availability), Trainer appointment booking
- Membership plans: Monthly, Quarterly, Yearly, Personal Training
- Class schedules with live available-slot tracking & class booking
- BMI Calculator (client-side, instant results)
- Customer Login/Register (JWT auth) + Customer Dashboard (memberships, appointments, class bookings, payment history)
- Razorpay payment integration with UPI support, signature verification and webhook endpoint
- Admin Dashboard (stats overview) + full Django Admin panel for managing members, trainers, programs, plans, classes, schedules, bookings and payments
- Contact form + Testimonials section
- Dark/Light mode toggle (persisted via localStorage), floating "Back to Top" button, smooth scrolling, fully responsive layout

---

## 📁 Project Structure

```
flexfit-gym/
├── backend/            # Django REST API
│   ├── gymfit/         # Project settings, root urls
│   ├── accounts/       # Custom user model, JWT auth
│   ├── gym/            # Programs, trainers, classes, memberships, bookings, appointments
│   ├── payments/       # Razorpay order/verify/webhook
│   ├── testimonials/   # Testimonials CRUD
│   ├── contactapp/     # Contact form messages
│   ├── requirements.txt
│   └── .env.example
└── frontend/            # React + Vite app
    ├── src/
    │   ├── pages/       # Home, Programs, Trainers, Classes, Membership, BMI, Login, Register, Dashboard, AdminDashboard, Contact
    │   ├── components/  # Navbar, Footer, ThemeToggle, BackToTop, ProtectedRoute...
    │   ├── context/      # Theme + Auth context
    │   └── api/          # Axios instance + API service functions
    ├── package.json
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ running locally

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# create your env file
cp .env.example .env
# edit .env: set DB credentials and (optionally) Razorpay test keys

# create the Postgres database (adjust to your Postgres setup)
psql -U postgres -c "CREATE DATABASE flexfit_db;"
psql -U postgres -c "CREATE USER flexfit_user WITH PASSWORD 'flexfit_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE flexfit_db TO flexfit_user;"

# run migrations
python manage.py makemigrations accounts gym payments testimonials contactapp
python manage.py migrate

# seed realistic demo data (programs, trainers, plans, classes, testimonials, demo accounts)
python manage.py seed_demo_data

# run the server
python manage.py runserver
```

Backend runs at **http://127.0.0.1:8000**
Django Admin: **http://127.0.0.1:8000/admin/** (login: `admin` / `Admin@1234`)
Demo customer account: `demo_member` / `Member@1234`

### 2. Frontend Setup

```bash
cd frontend
npm install

cp .env.example .env
# edit .env if your backend runs on a different URL, and add your Razorpay test Key ID

npm run dev
```

Frontend runs at **http://localhost:5173**

> Note: `VITE_API_BASE_URL` in `frontend/.env` must match your backend URL + `/api`.

### 3. Razorpay Payment Setup (optional but recommended)

1. Create a free account at https://dashboard.razorpay.com
2. Go to **Settings → API Keys** and generate **Test Mode** keys
3. Put `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env`
4. Put `VITE_RAZORPAY_KEY_ID` in `frontend/.env`
5. (Optional) Configure a webhook in the Razorpay dashboard pointing to
   `http://<your-domain>/api/payments/webhook/` and set `RAZORPAY_WEBHOOK_SECRET`

**Without Razorpay keys configured:** the checkout flow still works end-to-end in a
local **sandbox fallback mode** — the backend creates a local mock order and the
membership is activated immediately, so you can fully test the booking → payment →
dashboard flow without a live payment gateway.

---

## 🔑 Demo Accounts

| Role     | Username      | Password      |
|----------|---------------|---------------|
| Admin    | `admin`       | `Admin@1234`  |
| Customer | `demo_member` | `Member@1234` |

---

## 🧩 Key API Endpoints

```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/login/refresh/
GET    /api/auth/me/

GET    /api/programs/
GET    /api/trainers/
GET    /api/membership-plans/
GET    /api/classes/
GET    /api/class-schedules/

GET/POST   /api/appointments/            (auth)
POST       /api/appointments/{id}/cancel/
GET/POST   /api/class-bookings/          (auth)
POST       /api/class-bookings/{id}/cancel/
GET/POST   /api/memberships/             (auth)

POST   /api/payments/create_order/       (auth)
POST   /api/payments/verify/             (auth)
POST   /api/payments/webhook/            (Razorpay server-to-server)

GET/POST   /api/testimonials/
GET/POST   /api/contact/

GET    /api/admin/stats/                 (admin only)
```

---

## 🏗️ Production Notes

- Set `DJANGO_DEBUG=False` and a strong `DJANGO_SECRET_KEY` before deploying
- Serve static/media via a proper storage backend (e.g. S3) in production
- Put the frontend behind a CDN/static host (Vercel, Netlify, Nginx) and the backend
  behind Gunicorn + Nginx (or a PaaS like Render/Railway)
- Use HTTPS in production so Razorpay checkout and JWT auth are secure
- Rotate the `RAZORPAY_WEBHOOK_SECRET` and never commit real `.env` files (already gitignored)

---

## 🛠️ Tech Stack Summary

| Layer      | Technology                                             |
|------------|---------------------------------------------------------|
| Frontend   | React, Vite, Tailwind CSS, Framer Motion, Lucide Icons  |
| Backend    | Django, Django REST Framework, SimpleJWT                |
| Database   | PostgreSQL                                               |
| Payments   | Razorpay (UPI, Cards, Netbanking, Wallets)               |
| Auth       | JWT (access + refresh tokens)                            |
