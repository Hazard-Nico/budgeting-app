# 💰 Okane Kakeibo — Budgeting App

A full-stack personal budgeting app inspired by the Japanese **Kakeibo** methodology.
Track income, expenses, budgets, savings goals, debts, loans, and subscriptions — all in one place.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Django 5 · Django REST Framework · SimpleJWT   |
| Database | PostgreSQL                                      |
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| State    | Zustand                                         |
| Charts   | Recharts                                        |
| Animations | Framer Motion                                 |

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

- Python 3.11+
- PostgreSQL 15+
- Node.js 18+ & npm
- (Optional) `virtualenv` or `venv`

---

## Backend Setup (Django)

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create and activate a virtual environment

```bash
$ python -m venv venv

# macOS / Linux
$ source venv/bin/activate

# Windows
$ venv\Scripts\activate
```

### 3. Install Python dependencies

```bash
$ pip install -r requirements.txt
```

### 4. Configure environment variables

```py
SECRET_KEY=django-insecure-8(0n_%h7h$8hn+$fn@=e&$-&s+u-va%=xt4ozh=s(t*fw*tt*d
DEBUG=True
SQL_ENGINE=django.db.backends.postgresql
SQL_DATABASE=budgeting_app
SQL_USER=your_pg_username
SQL_PASSWORD=your_pg_password
SQL_HOST=localhost
SQL_PORT=5432
REDIS_URL=redis://localhost:6379/0
SITE_URL=http://localhost:8000
```

### 5. Create the PostgreSQL database

```sql
Create the PostgreSQL database

/* or */

/* createdb budgeting_app */ 

```

### 6. Run migrations

```bash
$ cd okane_backend
$ python manage.py migrate
```

### 7. (Optional) Create a superuser

```bash
$ python manage.py createsuperuser
```

### 8. Start the Django development server

```bash
$ python manage.py runserver
```

The API will be available at: http://localhost:8000

API documentation (Swagger): http://localhost:8000/api/schema/swagger-ui/

## Frontend Setup (Next.js)

### 1. Navigate to the frontend directory

```bash
$ cd frontend/okane-frontend
```

### 2. Install dependencies

```bash
$ npm install
```

### 3. Configure environment variables

```py
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Start the development server

```bash
$ npm run dev
```

The app will be available at: http://localhost:3000

## Project Structure

```sh
budgeting-app/
├── backend/
│   ├── .env                        # Backend environment variables
│   ├── requirements.txt
│   └── okane_backend/
│       ├── manage.py
│       ├── accounts/               # Auth, user profile, balance
│       ├── transactions/           # Income & expense entries
│       ├── budgets/                # Monthly budget management
│       ├── trackers/               # Savings, debts, loans, subscriptions
│       ├── reports/                # Analytics & reports
│       └── okane_backend/          # Django project config (settings, urls)
│
└── frontend/
    └── okane-frontend/
        ├── src/
        │   ├── app/
        │   │   ├── (auth)/         # Login & register pages
        │   │   └── (dashboard)/    # All dashboard pages
        │   ├── components/         # Reusable UI components
        │   ├── store/              # Zustand state stores
        │   ├── lib/                # Axios API client
        │   └── i18n/               # Translations (EN, ID, JA)
        ├── package.json
        └── tailwind.config.ts
```

## Features
* Authentication — Register, login, JWT with auto-refresh
* In-App Tutorial — Auto-starts on first login after registration (11-step guided tour)
* Dashboard — Balance overview, monthly income/expense summary, charts
* Transactions — Log income & expenses with categories, filters, and search
* Budgets — Set monthly budgets per category, track spending vs. plan
* Trackers
* Savings Goals — Track progress toward financial goals
* Debt Tracker — Log and pay off debts
* Loan Tracker — Manage loans with start/end dates
* Subscription Tracker — Monitor recurring subscriptions and renewal dates
* Reports — Visual analytics with charts and breakdowns
* Multi-language — English, Bahasa Indonesia, Japanese
* Multi-currency — IDR, USD, EUR, JPY

## Common Issues
connection refused on port 5432 Make sure PostgreSQL is running: sudo service postgresql start (Linux) or start via pgAdmin / Postgres.app (macOS).

relation "token_blacklist_outstandingtoken" does not exist Run python manage.py migrate — the rest_framework_simplejwt.token_blacklist tables are missing.

localStorage is not defined This only affects server-side rendering. All tutorial/auth store usage is inside "use client" components, so this should not occur in normal usage.

CORS errors in browser Ensure the Django server is running on port 8000 and Next.js on port 3000. The CORS config in settings.py already allows http://localhost:3000.

## Development Notes
* The .env file in backend/ is read by python-decouple — never commit it to version control.
* JWT access tokens expire in 1 hour; refresh tokens last 7 days.
* The tutorial auto-starts once for new users via localStorage flags (okane_tutorial_pending, okane_tutorial_done). To replay it, click the Tutorial button in the dashboard header.