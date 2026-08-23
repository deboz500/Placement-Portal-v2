# Placement Portal API Routes & Endpoints

## Authentication Routes

### 1. Register Student
- **Endpoint:** `POST /api/register/student`
- **Description:** Register a new student account
- **Request Body:**
  ```json
  {
    "email": "student@example.com",
    "username": "student_name",
    "password": "password123",
    "department": "CSE",
    "cgpa": 7.5,
    "year": 3
  }
  ```
- **Response:** 
  - Success: `201` - "Student registered successfully!"
  - Error: `400` - "Student already exists!"

### 2. Register Company
- **Endpoint:** `POST /api/register/company`
- **Description:** Register a new company account
- **Request Body:**
  ```json
  {
    "email": "company@example.com",
    "username": "company_name",
    "password": "password123",
    "overview": "Company overview text",
    "hr_contact": "hr@company.com",
    "website": "https://company.com"
  }
  ```
- **Response:**
  - Success: `201` - "Company registered successfully! Waiting for Approval"
  - Error: `400` - "Company already exists!"

### 3. Login
- **Endpoint:** `POST /api/login`
- **Description:** Authenticate user and get auth token
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  - Success: `200` - Returns user ID, username, auth-token, and roles
  - Error: `400` - "Incorrect Password"
  - Error: `404` - "Incorrect Email!"

### 4. Logout
- **Endpoint:** `POST /api/logout`
- **Description:** Logout user and clear cache
- **Auth Required:** Token-based authentication
- **Response:** `200` - "Logged out"

### 5. User Home
- **Endpoint:** `GET /api/home`
- **Description:** Get logged-in user information
- **Auth Required:** Token-based authentication (student, company, or admin)
- **Response:** `200` - Returns username, email, and roles

---

## Admin Routes

### 1. Admin Home
- **Endpoint:** `GET /api/admin`
- **Description:** Admin login verification endpoint
- **Auth Required:** Admin role
- **Response:** `200` - "admin logged in successfully"

### 2. Admin Dashboard
- **Endpoint:** `GET /api/admin/dashboard`
- **Description:** Get comprehensive admin dashboard with all entities
- **Auth Required:** Admin role
- **Caching:** 300 seconds
- **Response:** `200` - Returns:
  - pending_companies (list)
  - companies (list with approval and blacklist status)
  - students (list with details)
  - drives (approved list)
  - closed_drives (list)
  - pending_drives (list)
  - applications (list)

### 3. Admin Statistics
- **Endpoint:** `GET /api/admin/statistics`
- **Description:** Get placement statistics and analytics
- **Auth Required:** Admin role
- **Caching:** 120 seconds
- **Response:** `200` - Returns:
  - total_students
  - total_companies
  - total_drives
  - total_applications
  - selected (count)
  - shortlisted (count)
  - waitlisted (count)
  - rejected (count)
  - placement_rate (percentage)

### 4. Approve Company
- **Endpoint:** `PATCH /api/companies/approve/<int:c_id>`
- **Description:** Approve a company registration
- **Auth Required:** Admin role
- **Response:** `200` - "Approved"

### 5. Blacklist/Unblacklist Company
- **Endpoint:** `PATCH /api/companies/blacklist/<int:c_id>`
- **Description:** Toggle company blacklist status
- **Auth Required:** Admin role
- **Effect:** Deactivates/reactivates company account and cancels/restores active drives
- **Response:** `200` - "Blacklisted" or "Reactivated"

### 6. Blacklist/Unblacklist Student
- **Endpoint:** `PATCH /api/students/blacklist/<int:s_id>`
- **Description:** Toggle student blacklist status
- **Auth Required:** Admin role
- **Effect:** Deactivates/reactivates student account
- **Response:** `200` - "Blacklisted" or "Reactivated"

### 7. Approve Drive
- **Endpoint:** `PATCH /api/drives/approve/<int:d_id>`
- **Description:** Approve a job drive posted by company
- **Auth Required:** Admin role
- **Response:** `200` - "Approved"

### 8. Close Drive
- **Endpoint:** `PATCH /api/drives/close/<int:d_id>`
- **Description:** Close an active job drive
- **Auth Required:** Admin role
- **Response:** `200` - "Drive closed"

### 9. View Drive Details (Admin)
- **Endpoint:** `GET /api/admin/drives/<int:d_id>`
- **Description:** Get detailed information about a specific drive
- **Auth Required:** Admin role
- **Response:** `200` - Returns:
  - id, name, job_title, job_description
  - eligibility, salary, location, deadline
  - company, status
  - applicants (list with status)

### 10. Admin Search
- **Endpoint:** `GET /api/admin/search/<string:q>`
- **Description:** Search for students, companies, and drives
- **Auth Required:** Admin role
- **Response:** `200` - Returns:
  - students (matching query)
  - companies (matching query)
  - drives (matching query)

---

## Student Routes

### 1. Student Dashboard
- **Endpoint:** `GET /api/student/dashboard`
- **Description:** Get student dashboard with companies and applications
- **Auth Required:** Student role
- **Caching:** 300 seconds
- **Response:** `200` - Returns:
  - Student profile info (id, username, department, cgpa, year, blacklist status)
  - List of approved companies
  - List of applied drives with application status

### 2. View Company Details
- **Endpoint:** `GET /api/student/companies/<int:cid>`
- **Description:** Get company information and their active drives
- **Auth Required:** Student role
- **Response:** `200` - Returns:
  - Company details (id, name, overview, website)
  - List of approved drives with details

### 3. View Drive Details (Student)
- **Endpoint:** `GET /api/student/drives/view/<int:did>`
- **Description:** Get detailed information about a drive with eligibility check
- **Auth Required:** Student role
- **Response:** `200` - Returns:
  - Drive details (id, name, job_title, job_description)
  - eligibility, salary, location, deadline
  - company_name
  - already_applied (boolean)
  - eligible (boolean)

### 4. Apply to Drive
- **Endpoint:** `POST /api/student/drives/apply/<int:did>`
- **Description:** Submit application for a job drive
- **Auth Required:** Student role
- **Response:** `200` - "Applied Successfully!"

### 5. Student Search
- **Endpoint:** `GET /api/student/search/<string:q>`
- **Description:** Search for drives and companies
- **Auth Required:** Student role
- **Response:** `200` - Returns:
  - drives (matching query)
  - companies (matching query)

### 6. Update Student Profile
- **Endpoint:** `PATCH /api/student/profile`
- **Description:** Update student profile information
- **Auth Required:** Student role
- **Request Body:**
  ```json
  {
    "name": "new_name",
    "department": "new_department",
    "cgpa": 7.8,
    "year": 4
  }
  ```
- **Response:** `200` - "Profile updated!"

### 7. Student Application History
- **Endpoint:** `GET /api/student/history`
- **Description:** Get all applications and their statuses
- **Auth Required:** Student role
- **Response:** `200` - Returns:
  - student_name, department
  - history (list of all applications with details and remarks)

---

## Company Routes

### 1. Company Dashboard
- **Endpoint:** `GET /api/company/dashboard`
- **Description:** Get company dashboard with drives and statistics
- **Auth Required:** Company role
- **Response:** `200` - Returns:
  - Company profile (id, username, roles, blacklist, approval status)
  - current_drives (approved/pending)
  - closed_drives

### 2. Create Drive
- **Endpoint:** `POST /api/company/drives/create/<int:cid>`
- **Description:** Create a new job drive
- **Auth Required:** Company role
- **Request Body:**
  ```json
  {
    "drive_name": "Drive Name",
    "job_title": "Software Engineer",
    "job_description": "Job description here",
    "eligibility": "8.0 CGPA, 3rd/4th year",
    "salary": "8-12 LPA",
    "location": "City, Country",
    "deadline": "2026-07-31"
  }
  ```
- **Response:** `200` - "Drive created! Waiting for Approval."

### 3. Close Drive (Company)
- **Endpoint:** `PATCH /api/company/drives/close/<int:d_id>`
- **Description:** Close a drive posted by the company
- **Auth Required:** Company role
- **Response:** `200` - "Drive closed"

### 4. View Applicants
- **Endpoint:** `PATCH /api/company/applications/view/<int:did>`
- **Description:** Get list of applicants for a specific drive
- **Auth Required:** Company role
- **Response:** `200` - Returns:
  - Drive name and job_title
  - applicants (list with id, name, department, cgpa, status)

### 5. Get Application Details
- **Endpoint:** `GET /api/company/applications/get/<int:aid>`
- **Description:** Get detailed information about a specific application
- **Auth Required:** Company role
- **Response:** `200` - Returns:
  - id, student_name, department
  - drive_name, job_title
  - status, remarks

### 6. Update Application Status (Review)
- **Endpoint:** `PATCH /api/company/applications/review/<int:aid>`
- **Description:** Update application status with remarks and trigger email notification
- **Auth Required:** Company role
- **Request Body:**
  ```json
  {
    "status": "selected/shortlisted/rejected/waitlisted",
    "remarks": "optional remarks"
  }
  ```
- **Response:** `200` - "Application marked as [status]"
- **Side Effect:** Sends email notification to student via Celery task

### 7. Company Profile
- **Endpoint:** `GET /api/company/profile`
- **Description:** Get company profile and their posted drives
- **Auth Required:** Company role
- **Response:** `200` - Returns:
  - Company details (id, name, overview, hr_contact, website, approval)
  - List of drives with application counts

---

## Export & Report Triggers

### 1. Export CSV Report
- **Endpoint:** `GET /api/export/<string:id>`
- **Description:** Trigger async CSV export job
- **Auth Required:** No (but typically admin)
- **Response:** `200` - Returns:
  - Job ID
  - Result (filename when ready)

### 2. Get CSV Result
- **Endpoint:** `GET /api/csv_result/<id>`
- **Description:** Download the generated CSV file
- **Parameter:** id (Celery task ID from export endpoint)
- **Response:** `200` - CSV file download

### 3. Send Monthly Reports
- **Endpoint:** `GET /api/mail`
- **Description:** Trigger async monthly report generation and email
- **Auth Required:** No (but typically admin)
- **Response:** `200` - Returns result status

---

## Authentication & Authorization

- **Token-based:** Most endpoints require `auth_required('token')`
- **Role-based:** Endpoints enforce role requirements:
  - `@roles_required('admin')` - Admin only
  - `@roles_required('student')` - Student only
  - `@roles_required('company')` - Company only
  - `@roles_accepted('student','company','admin')` - Multiple roles

---

## Caching Strategy

- **Admin Dashboard:** 300 seconds
- **Admin Statistics:** 120 seconds
- **Student Dashboard:** 300 seconds
- **Cache Invalidation:** Triggered on profile updates, application changes, and status updates

---

## Error Handling

- **400:** Bad Request / Validation Error
- **200:** Success
- **201:** Created (Registration)
- **404:** Not Found
- **401:** Unauthorized (Invalid token)
- **403:** Forbidden (Insufficient permissions)