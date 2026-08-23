# Placement-Portal-Application(v2)

This is an upgrade over the original version of Placement Portal where Backends Jobs have been added using celery, API Routes have been designed using Flask API and caching has been done using Redis Caching.

---

## 📋 Overview

A comprehensive web-based placement management system built with Flask, designed to streamline the placement process for students, companies, and administrators.

Placement Portal v2 is an upgraded version of the original Placement Portal with enhanced features including:
- **Asynchronous Task Processing** using Celery for background jobs
- **Redis Caching** for optimized performance
- **Multi-role Authentication** (Student, Company, Admin)
- **Email Notifications** using MailHog
- **Periodic Task Scheduling** with Celery Beat

## ✨ Key Features

### For Students
- User registration and authentication
- Browse job drives posted by companies
- Apply to job opportunities
- Track application status
- View personal dashboard with application history

### For Companies
- Company registration with approval process
- Create and manage job drives
- View student applications
- Track and manage placement status
- Bulk upload applicant data

### For Administrators
- User and company account management
- Approve/reject company registrations
- Monitor all placement activities
- View comprehensive statistics and analytics
- Blacklist students and companies when needed
- Manage job drives and applications

## 🛠️ Tech Stack

### Backend
- **Framework:** Flask (Python)
- **ORM:** SQLAlchemy
- **Database:** SQLite3
- **Authentication:** Flask-Security-Too
- **Caching:** Redis Cache
- **Task Queue:** Celery
- **Task Scheduler:** Celery Beat
- **Email Service:** MailHog

### Frontend
- **HTML/CSS/JavaScript**
- **Components:** React-based components
- **Styling:** CSS

### Additional Tools
- **CSV Processing:** For bulk data imports
- **Session Management:** Token-based authentication

## 📦 Prerequisites

- Python 3.x
- Redis Server
- MailHog (for email testing)
- Virtual Environment

## 🚀 Installation

### 1. Create Virtual Environment

**Windows:**
```bash
python -m venv .env
.env\Scripts\activate
```

**WSL/Linux/macOS:**
```bash
python3 -m venv .env
source .env/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Redis

Ensure Redis server is running:

**Windows:** Install and run Redis or use Windows Subsystem for Linux (WSL)

**Linux/macOS:**
```bash
redis-server
```

### 4. Setup Database

The application automatically creates the SQLite database on first run with:
- Default roles: `admin`, `student`, `company`
- Default admin account: `admin@gmail.com` / `admin123`

## 🏗️ Project Structure

```
.
├── app.py                          # Main Flask application
├── celery_config.py               # Celery configuration
├── flask_cache.py                 # Redis cache configuration
├── requirements.txt               # Python dependencies
├── celerybeat-schedule           # Celery Beat schedule database
├── instance/
│   └── placementdb.sqlite3       # SQLite Database
├── application/
│   ├── __init__.py
│   ├── config.py                 # Application configuration
│   ├── database.py               # Database initialization
│   ├── models.py                 # SQLAlchemy models
│   ├── routes.py                 # Flask routes
│   ├── resources.py              # API resources
│   ├── tasks.py                  # Celery tasks
│   ├── celery_init.py            # Celery initialization
│   ├── mail.py                   # Email functionality
│   └── utils.py                  # Utility functions
├── templates/
│   ├── index.html                # Main HTML template
│   ├── report.html               # Report template
│   └── test.html                 # Test template
├── static/
│   ├── script.js                 # Main JavaScript
│   ├── style.css                 # Main styles
│   └── components/
│       ├── Admin_Dashboard.js
│       ├── Company_Dashboard.js
│       ├── Home.js
│       ├── Login.js
│       ├── Navbar.js
│       ├── Register.js
│       └── Student_Dashboard.js
├── tests/
│   └── test_status_update_notification.py
└── README.md
```

## ⚙️ Configuration

### Database Configuration
Location: `application/config.py`

```python
# SQLite database path
SQLALCHEMY_DATABASE_URI = "sqlite:///instance/placementdb.sqlite3"

# Redis cache
CACHE_TYPE = "RedisCache"
CACHE_REDIS_URL = "redis://localhost:6379/2"
CACHE_DEFAULT_TIMEOUT = 300

# Security settings
SECRET_KEY = 'application-secretkey'
SECURITY_PASSWORD_HASH = 'bcrypt'
SECURITY_PASSWORD_SALT = 'This is a password-salt'
```

### Email Configuration
MailHog is used for email testing in development:
- **SMTP:** localhost:1025
- **Web UI:** http://localhost:8025/

## 🏃 Running the Application

The application requires multiple services running simultaneously. Follow these steps:

### Terminal 1: Start Redis Server
```bash
redis-server
```

### Terminal 2: Start Celery Worker
```bash
.env\Scripts\activate  # Windows
celery -A app.celery worker --loglevel INFO
```

### Terminal 3: Start Celery Beat (Optional - for scheduled tasks)
```bash
.env\Scripts\activate  # Windows
celery -A app.celery beat --loglevel INFO
```

### Terminal 4: Start Flask Application
```bash
.env\Scripts\activate  # Windows
python app.py
```

### Terminal 5: Start MailHog (Optional - for email testing)
```bash
MailHog
```
Access at: `http://localhost:8025/`

The application will be available at: `http://localhost:5000/`

## 📊 Database Models

### User Model
- User account with authentication
- Email, username, password, roles
- Relationships with Student and Company profiles

### Role Model
- User roles: `admin`, `student`, `company`
- Access control based on roles

### Student Model
- Department, CGPA, year
- Application history
- Blacklist status

### Company Model
- Company overview, HR contact, website
- Approval status (pending/approved)
- Blacklist status
- Job drives

### Drive Model
- Job title, description, eligibility criteria
- Salary, location, deadline
- Status (pending/approved/closed)
- Applications

### Application Model
- Student-Drive association
- Application status (applied/selected/rejected)
- Remarks and feedback

## 🔌 API Endpoints

### Authentication Routes
- `POST /api/register/student` - Register student account
- `POST /api/register/company` - Register company account
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/home` - Get logged-in user info

### Admin Routes
- `GET /api/admin` - Admin verification
- `GET /api/admin/dashboard` - Admin dashboard (cached 300s)
- `GET /api/admin/statistics` - Placement statistics (cached 120s)

### Additional API endpoints for:
- Student management
- Company management
- Drive management
- Application processing
- Report generation

## 🎯 Background Tasks (Celery)

The application uses Celery for asynchronous tasks:
- Email notifications for application status updates
- Periodic analytics computations
- Bulk CSV processing
- Scheduled report generation

## 📝 Usage Examples

### Register as Student
```bash
POST /api/register/student
{
  "email": "student@example.com",
  "username": "john_doe",
  "password": "secure_password",
  "department": "CSE",
  "cgpa": 8.5,
  "year": 3
}
```

### Register as Company
```bash
POST /api/register/company
{
  "email": "hr@company.com",
  "username": "tech_company",
  "password": "secure_password",
  "overview": "Leading tech company",
  "hr_contact": "hr@company.com",
  "website": "https://company.com"
}
```

### Login
```bash
POST /api/login
{
  "email": "user@example.com",
  "password": "password"
}
```

## 🧹 Database Management

### Clear Database
```bash
# Windows
Remove-Item -Path "instance\placementdb.sqlite3" -Force
Remove-Item -Path "instance" -Recurse -Force

# Linux/macOS
rm instance/placementdb.sqlite3
rm -rf instance/
```

### Reset Celery Schedule
```bash
# Windows
Remove-Item -Path "celerybeat-schedule" -Force

# Linux/macOS
rm celerybeat-schedule
```

## 🐛 Troubleshooting

### Redis Connection Error
- Ensure Redis server is running on port 6379
- Check Redis configuration in `application/config.py`

### Celery Tasks Not Processing
- Verify Celery worker is running
- Check Celery logs for errors
- Ensure Redis is accessible

### Email Not Sending
- Start MailHog server
- Check SMTP configuration
- View emails at http://localhost:8025/

### Database Lock Issues
- Stop all running instances
- Delete `instance/placementdb.sqlite3`
- Restart the application

## 📚 Testing

Run tests with:
```bash
pytest tests/
```

Current test coverage:
- Status update notifications
- Additional tests can be added in `tests/` directory

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

## 📄 License

This project is part of the Placement Cell Management System.