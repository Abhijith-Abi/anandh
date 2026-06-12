# Student Academic Performance Analytics System

An enterprise-grade, AI-powered predictive dashboard and profiling system designed for schools, universities, and colleges. The system leverages a **Random Forest Classifier** trained on academic logs to predict student outcomes, identify at-risk learners, and prescribe actionable interventions.

## Tech Stack
- **Frontend**: Next.js (App Router, Tailwind CSS v4, TypeScript, Recharts, Lucide Icons)
- **Backend**: Django REST Framework (Python, SimpleJWT Auth, PostgreSQL / SQLite Fallback)
- **Machine Learning**: Scikit-Learn (Random Forest, StandardScaler, Joblib)
- **Reports**: ReportLab PDF and Native CSV exporters
- **DevOps**: Docker, Docker Compose

---

## Quick Start (Local Run)

You can run the application directly on your host machine without needing Docker.

### 1. Backend Setup (Django & ML)
Make sure Python 3.10+ is installed:

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations analytics
python manage.py migrate

# Seed data (Creates 1000 realistic student records and default users)
# This command automatically trains the ML model first if classifier files are not found
python manage.py seed_students

# Start Backend Server
python manage.py runserver
```
The Django API will be live at `http://localhost:8000/api/`.

### 2. Frontend Setup (Next.js)
Make sure Node.js 18+ is installed:

```bash
# Navigate to frontend
cd frontend

# Install packages
npm install --legacy-peer-deps

# Start Next.js dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Running with Docker

To boot up the entire stack including a PostgreSQL database using Docker:

```bash
# Start all containers in the background
docker-compose up -d --build
```

Docker Compose spins up:
- **db**: PostgreSQL instance listening on port `5432`
- **backend**: Django API listening on port `8000` (auto-migrated and seeded on start)
- **frontend**: Next.js App listening on port `3000`

---

## Default Login Credentials

Use the following seeded accounts to login:

### 1. Admin Account
- **Username**: `admin`
- **Password**: `Password123`
- **Permissions**: Full System Administration

### 2. Teacher Account
- **Username**: `teacher`
- **Password**: `Password123`
- **Permissions**: View dashboards, simulate predictions, manage student directory, export lists

---

## System Capabilities

### 1. Machine Learning Prediction Engine
- **Algorithm**: Random Forest Classifier
- **Predictive Target (Predicted Grade)**: `Excellent`, `Good`, `Average`, `Poor`
- **Trained Model Metrics**:
  - Accuracy: **~97.9%**
  - Precision: **~98.0%**
  - Recall: **~97.9%**
  - F1 Score: **~97.9%**

### 2. Risk Profiling Matrix
Students are dynamically sorted into one of three risk cohorts:
- **Low Risk**: Attendance > 85% AND GPA > 8.0
- **Medium Risk**: Attendance between 70% and 85% OR GPA between 6.0 and 8.0
- **High Risk**: Attendance < 70% OR GPA < 6.0

### 3. Actionable Intervention Recommendations
The rule engine analyzes simulated inputs or student directories to formulate recommendations such as:
- Attendance improvement warnings (aiming for 85% threshold)
- Study hour targets (scaling to 15+ hours weekly)
- Remedial tutoring assignments and core concepts review
- Active class preparation and quiz drill instructions
