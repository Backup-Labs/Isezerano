# "Isezerano" Digital Newspaper Platform

A futuristic, glassmorphic, and production-grade digital newspaper platform built with Next.js (App Router, TypeScript) and Django + Django REST Framework.

## Project Structure
- `/backend` — Django 5 REST API + PostgreSQL + Redis + Celery
- `/frontend` — Next.js 14+ frontend with Tailwind CSS (v4) and Recharts
- `docker-compose.yml` — Local database (Postgres) and cache broker (Redis) services

---

## 1. Backend Setup (Django)

### Prerequisites
- Python 3.12+ (We used the virtual environment `venv` in the workspace root)
- PostgreSQL (Active on local port `5433` via Docker Compose)
- Redis (Active on local port `6379` via Docker Compose)

### Installation
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
3. Activate the virtual environment (configured in the workspace root):
   - For Git Bash / MINGW64 (recommended):
     ```bash
     source ../venv/bin/activate
     ```
   - For Windows Command Prompt:
     ```cmd
     ..\venv\Scripts\activate.bat
     ```
   - For PowerShell:
     ```powershell
     ..\venv\Scripts\Activate.ps1
     ```

4. Initialize the database schema:
   ```bash
   python manage.py migrate
   ```
4. Seed the database with categories, tags, articles, ad campaigns, and forum comments:
   ```bash
   python manage.py seed_data
   ```
5. Run the local development server:
   ```bash
   python manage.py runserver
   ```
   The backend API will be active at `http://127.0.0.1:8000/`.

### Running Background Jobs (Celery)
To execute background dispatches and scheduled releases, spin up a Celery worker:
```bash
celery -A config worker -l info
```

---

## 2. Frontend Setup (Next.js)

### Prerequisites
- Node.js v22+
- npm v10+

### Installation
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Copy the environment variables template:
   ```bash
   cp .env.example .env.local
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The client application will be active at `http://127.0.0.1:3000/`.

---

## 3. Seeded Accounts / Credentials

The seed command creates the following default operators for testing authorization access control levels:

| Role | Username | Password |
|---|---|---|
| Admin/Superadmin | `admin` | `pulse_admin_pass` |
| Editor | `editor_alex` | `pulse_editor_pass` |
| Journalist | `writer_elena` | `pulse_writer_pass` |
| Reader | `reader_jane` | `pulse_reader_pass` |
