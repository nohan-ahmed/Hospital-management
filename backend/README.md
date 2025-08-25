# Hospital Management System

[![Python Version](https://img.shields.io/badge/python-3.10-blue)](https://www.python.org/)
[![Django Version](https://img.shields.io/badge/django-4.2-green)](https://www.djangoproject.com/)
[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

**Hospital Management System** is a comprehensive Django REST Framework (DRF)-based API for managing hospital operations, including users, doctors, patients, appointments, reviews, and services.

---

## Features

- **User Management:** Registration, authentication, and profile management  
- **Patient Management:** Patient profiles and records  
- **Doctor Management:** Doctor profiles, specializations, designations, and available times  
- **Appointment System:** Schedule and manage appointments  
- **Review System:** Patient reviews for doctors  
- **Service Management:** Hospital services information  
- **Contact Management:** Contact form submissions  

---

## Project Structure

hospital_management/
├── manage.py
├── user_profile/ # User authentication and profile management
├── patient/ # Patient management
├── doctor/ # Doctor management (profiles, specializations, availability)
├── appointment/ # Appointment scheduling and management
├── service/ # Hospital services information
├── contact_us/ # Contact form submissions
├── docs/ # API documentation files
│ ├── openapi.yaml
│ ├── api_guide.md
│ └── swagger.html
└── README.md

---

## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Moon-Luv/hospital_management.git
cd hospital_management
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py createsuperuser
python manage.py runserver
```
Backend available at: http://127.0.0.1:8000/

## API Documentation

Explore the full, interactive API documentation hosted on GitHub Pages:

[🌐View API Documentation](https://moon-luv.github.io/hospital_management/)

Includes:

OpenAPI Specification: docs/openapi.yaml

API Guide: docs/api_guide.md

Interactive Swagger UI: docs/swagger.html

Authentication

The API uses JWT (JSON Web Token) authentication.

Obtain a token via POST request to /api/user/login/

Include the token in the Authorization header for all requests:

Authorization: Bearer <your_access_token>
