# Hospital Management System API Guide

## Introduction

This document provides detailed information about the Hospital Management System API. The API allows for managing users, patients, doctors, appointments, services, and contact requests.

## Base URL

All API endpoints are relative to the base URL:

```
http://localhost:8000
```

## Authentication

The API uses JWT (JSON Web Token) authentication. Most endpoints require authentication.

### Getting a Token

To authenticate, you need to obtain a JWT token by sending a POST request to the login endpoint:

```
POST /api/user/login/
```

Request body:
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

Response:
```json
{
  "refresh": "your_refresh_token",
  "access": "your_access_token"
}
```

### Using the Token

Include the access token in the Authorization header for all authenticated requests:

```
Authorization: Bearer your_access_token
```

### Refreshing the Token

Access tokens expire after a certain period. Use the refresh token to get a new access token:

```
POST /api/user/token/refresh/
```

Request body:
```json
{
  "refresh": "your_refresh_token"
}
```

Response:
```json
{
  "access": "new_access_token"
}
```

### Logging Out

To log out and invalidate the refresh token:

```
POST /api/user/logout/
```

Request body:
```json
{
  "refresh": "your_refresh_token"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Different endpoints may have different rate limits. When a rate limit is exceeded, the API will return a 429 Too Many Requests response.

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: The page number (default: 1)
- `limits`: The number of items per page (default: 100, max: 1000)

Paginated responses include the following fields:

- `count`: The total number of items
- `next`: URL to the next page (null if there is no next page)
- `previous`: URL to the previous page (null if there is no previous page)
- `results`: Array of items for the current page

## Common Error Responses

- `400 Bad Request`: The request was invalid or cannot be served. The request is not processed due to client error.
- `401 Unauthorized`: Authentication is required and has failed or has not been provided.
- `403 Forbidden`: The request was valid, but the server is refusing action. The user might not have the necessary permissions.
- `404 Not Found`: The requested resource could not be found.
- `429 Too Many Requests`: The user has sent too many requests in a given amount of time.
- `500 Internal Server Error`: The server has encountered a situation it doesn't know how to handle.

## Endpoints

### Authentication

#### Register a new user

```
POST /api/user/register/
```

Creates a new user account. A UserProfile and Patient instance will be automatically created.

Request body:
```json
{
  "username": "string",
  "first_name": "string",
  "last_name": "string",
  "email": "user@example.com",
  "password": "string",
  "confirm_password": "string"
}
```

Response:
```json
{
  "message": "string",
  "tokens": {
    "refresh": "string",
    "access": "string"
  },
  "user": {
    "id": 0,
    "username": "string",
    "email": "user@example.com",
    "first_name": "string",
    "last_name": "string",
    "is_staff": false,
    "is_active": true,
    "date_joined": "2023-01-01T00:00:00Z"
  }
}
```

#### Login

```
POST /api/user/login/
```

Authenticate a user and obtain tokens.

Request body:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "refresh": "string",
  "access": "string"
}
```

#### Logout

```
POST /api/user/logout/
```

Blacklist the refresh token.

Request body:
```json
{
  "refresh": "string"
}
```

Response:
```json
{
  "message": "string"
}
```

#### Refresh Token

```
POST /api/user/token/refresh/
```

Get a new access token using a refresh token.

Request body:
```json
{
  "refresh": "string"
}
```

Response:
```json
{
  "access": "string"
}
```

### User Profiles

#### List user profiles

```
GET /api/user/profiles/
```

Get a list of user profiles. Regular users can only see their own profile.

Query parameters:
- `page`: Page number (default: 1)
- `limits`: Number of items per page (default: 100, max: 1000)
- `search`: Search term for username, email, first_name, or last_name

Response:
```json
{
  "count": 0,
  "next": "string",
  "previous": "string",
  "results": [
    {
      "id": 0,
      "user": {
        "id": 0,
        "username": "string",
        "email": "user@example.com",
        "first_name": "string",
        "last_name": "string",
        "is_staff": false,
        "is_active": true,
        "date_joined": "2023-01-01T00:00:00Z"
      },
      "bio": "string",
      "address": "string",
      "date_of_birth": "2023-01-01",
      "profile_picture": "string",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### Create a user profile

```
POST /api/user/profiles/
```

Create a new user profile.

Request body (multipart/form-data):
- `username`: string
- `email`: string (email)
- `first_name`: string
- `last_name`: string
- `bio`: string
- `address`: string
- `date_of_birth`: string (date)
- `profile_picture`: file

Response:
```json
{
  "id": 0,
  "user": {
    "id": 0,
    "username": "string",
    "email": "user@example.com",
    "first_name": "string",
    "last_name": "string",
    "is_staff": false,
    "is_active": true,
    "date_joined": "2023-01-01T00:00:00Z"
  },
  "bio": "string",
  "address": "string",
  "date_of_birth": "2023-01-01",
  "profile_picture": "string",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Get a user profile

```
GET /api/user/profiles/{id}/
```

Get a specific user profile by ID.

Response:
```json
{
  "id": 0,
  "user": {
    "id": 0,
    "username": "string",
    "email": "user@example.com",
    "first_name": "string",
    "last_name": "string",
    "is_staff": false,
    "is_active": true,
    "date_joined": "2023-01-01T00:00:00Z"
  },
  "bio": "string",
  "address": "string",
  "date_of_birth": "2023-01-01",
  "profile_picture": "string",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Update a user profile

```
PUT /api/user/profiles/{id}/
```

Update a specific user profile by ID.

Request body (multipart/form-data):
- `username`: string
- `email`: string (email)
- `first_name`: string
- `last_name`: string
- `bio`: string
- `address`: string
- `date_of_birth`: string (date)
- `profile_picture`: file

Response: Same as Get a user profile.

#### Partially update a user profile

```
PATCH /api/user/profiles/{id}/
```

Partially update a specific user profile by ID.

Request body (multipart/form-data): Same as Update a user profile, but all fields are optional.

Response: Same as Get a user profile.

#### Delete a user profile

```
DELETE /api/user/profiles/{id}/
```

Delete a specific user profile by ID.

Response: 204 No Content

#### Get current user's profile

```
GET /api/user/profiles/me/
```

Get the profile of the currently authenticated user.

Response: Same as Get a user profile.

### Patients

#### List patients

```
GET /patients/
```

Get a list of patients.

Query parameters:
- `page`: Page number (default: 1)
- `limits`: Number of items per page (default: 100, max: 1000)
- `search`: Search term for id, user, or phone
- `phone`: Filter by phone number

Response:
```json
{
  "count": 0,
  "next": "string",
  "previous": "string",
  "results": [
    {
      "id": 0,
      "user": "string",
      "profile": "string",
      "phone": "string"
    }
  ]
}
```

#### Create a patient

```
POST /patients/
```

Create a new patient. The user field is automatically set to the authenticated user.

Request body (multipart/form-data):
- `profile`: file
- `phone`: string

Response:
```json
{
  "id": 0,
  "user": "string",
  "profile": "string",
  "phone": "string"
}
```

#### Get a patient

```
GET /patients/{id}/
```

Get a specific patient by ID.

Response:
```json
{
  "id": 0,
  "user": "string",
  "profile": "string",
  "phone": "string"
}
```

#### Update a patient

```
PUT /patients/{id}/
```

Update a specific patient by ID.

Request body (multipart/form-data):
- `profile`: file
- `phone`: string

Response: Same as Get a patient.

#### Partially update a patient

```
PATCH /patients/{id}/
```

Partially update a specific patient by ID.

Request body (multipart/form-data): Same as Update a patient, but all fields are optional.

Response: Same as Get a patient.

#### Delete a patient

```
DELETE /patients/{id}/
```

Delete a specific patient by ID.

Response: 204 No Content

### Doctors

#### List doctors

```
GET /doctors/
```

Get a list of doctors.

Query parameters:
- `page`: Page number (default: 1)
- `limits`: Number of items per page (default: 100, max: 1000)
- `specialisation`: Filter by specialisation ID
- `designation`: Filter by designation ID
- `fee`: Filter by fee
- `available_time`: Filter by available time ID

Response:
```json
{
  "count": 0,
  "next": "string",
  "previous": "string",
  "results": [
    {
      "id": 0,
      "user": "string",
      "profile": "string",
      "designation": ["string"],
      "specialisation": ["string"],
      "available_time": [0],
      "fee": 0,
      "meet_link": "string"
    }
  ]
}
```

#### Create a doctor

```
POST /doctors/
```

Create a new doctor. The user field is automatically set to the authenticated user.

Request body (multipart/form-data):
- `profile`: file
- `designation`: array of integers
- `specialisation`: array of integers
- `available_time`: array of integers
- `fee`: integer
- `meet_link`: string

Response:
```json
{
  "id": 0,
  "user": "string",
  "profile": "string",
  "designation": ["string"],
  "specialisation": ["string"],
  "available_time": [0],
  "fee": 0,
  "meet_link": "string"
}
```

#### Get a doctor

```
GET /doctors/{id}/
```

Get a specific doctor by ID.

Response:
```json
{
  "id": 0,
  "user": "string",
  "profile": "string",
  "designation": ["string"],
  "specialisation": ["string"],
  "available_time": [0],
  "fee": 0,
  "meet_link": "string"
}
```

#### Update a doctor

```
PUT /doctors/{id}/
```

Update a specific doctor by ID.

Request body (multipart/form-data):
- `profile`: file
- `designation`: array of integers
- `specialisation`: array of integers
- `available_time`: array of integers
- `fee`: integer
- `meet_link`: string

Response: Same as Get a doctor.

#### Partially update a doctor

```
PATCH /doctors/{id}/
```

Partially update a specific doctor by ID.

Request body (multipart/form-data): Same as Update a doctor, but all fields are optional.

Response: Same as Get a doctor.

#### Delete a doctor

```
DELETE /doctors/{id}/
```

Delete a specific doctor by ID.

Response: 204 No Content

### Designations

#### List designations

```
GET /designations/
```

Get a list of designations.

Response:
```json
[
  {
    "id": 0,
    "name": "string",
    "slug": "string"
  }
]
```

#### Create a designation

```
POST /designations/
```

Create a new designation (admin only).

Request body:
```json
{
  "name": "string",
  "slug": "string"
}
```

Response:
```json
{
  "id": 0,
  "name": "string",
  "slug": "string"
}
```

### Specialisations

#### List specialisations

```
GET /specialisations/
```

Get a list of specialisations.

Response:
```json
[
  {
    "id": 0,
    "name": "string",
    "slug": "string"
  }
]
```

#### Create a specialisation

```
POST /specialisations/
```

Create a new specialisation (admin only).

Request body:
```json
{
  "name": "string",
  "slug": "string"
}
```

Response:
```json
{
  "id": 0,
  "name": "string",
  "slug": "string"
}
```

### Available Times

#### List available times

```
GET /available-time/
```

Get a list of available times.

Query parameters:
- `id`: Filter by ID

Response:
```json
[
  {
    "id": 0,
    "time": "string"
  }
]
```

#### Create an available time

```
POST /available-time/
```

Create a new available time (admin only).

Request body:
```json
{
  "time": "string"
}
```

Response:
```json
{
  "id": 0,
  "time": "string"
}
```

### Reviews

#### List reviews

```
GET /reviews/
```

Get a list of reviews.

Query parameters:
- `page`: Page number (default: 1)
- `limits`: Number of items per page (default: 100, max: 1000)
- `doctor`: Filter by doctor ID
- `reviwer`: Filter by reviewer ID
- `rating`: Filter by rating
- `search`: Search term for doctor or reviewer

Response:
```json
{
  "count": 0,
  "next": "string",
  "previous": "string",
  "results": [
    {
      "id": 0,
      "reviewer": "string",
      "doctor_name": "string",
      "body": "string",
      "created_on": "2023-01-01",
      "rating": "⭐⭐⭐⭐⭐"
    }
  ]
}
```

#### Create a review

```
POST /reviews/
```

Create a new review.

Request body:
```json
{
  "doctor": 0,
  "body": "string",
  "rating": "⭐⭐⭐⭐⭐"
}
```

Response:
```json
{
  "id": 0,
  "reviewer": "string",
  "doctor_name": "string",
  "body": "string",
  "created_on": "2023-01-01",
  "rating": "⭐⭐⭐⭐⭐"
}
```

#### Get a review

```
GET /reviews/{id}/
```

Get a specific review by ID.

Response:
```json
{
  "id": 0,
  "reviewer": "string",
  "doctor_name": "string",
  "body": "string",
  "created_on": "2023-01-01",
  "rating": "⭐⭐⭐⭐⭐"
}
```

#### Update a review

```
PUT /reviews/{id}/
```

Update a specific review by ID.

Request body:
```json
{
  "doctor": 0,
  "body": "string",
  "rating": "⭐⭐⭐⭐⭐"
}
```

Response: Same as Get a review.

#### Partially update a review

```
PATCH /reviews/{id}/
```

Partially update a specific review by ID.

Request body: Same as Update a review, but all fields are optional.

Response: Same as Get a review.

#### Delete a review

```
DELETE /reviews/{id}/
```

Delete a specific review by ID.

Response: 204 No Content

### Appointments

#### List appointments

```
GET /appointments/
```

Get a list of appointments.

Query parameters:
- `page`: Page number (default: 1)
- `limits`: Number of items per page (default: 100, max: 1000)
- `patient_id`: Filter by patient ID
- `doctor_id`: Filter by doctor ID

Response:
```json
{
  "count": 0,
  "next": "string",
  "previous": "string",
  "results": [
    {
      "id": 0,
      "patient": 0,
      "doctor": 0,
      "appointment_type": "Online",
      "appointment_status": "Pendding",
      "symptoms": "string",
      "time": 0,
      "cancel": false
    }
  ]
}
```

#### Create an appointment

```
POST /appointments/
```

Create a new appointment. The patient field is automatically set to the authenticated user.

Request body:
```json
{
  "doctor": 0,
  "appointment_type": "Online",
  "symptoms": "string",
  "time": 0,
  "cancel": false
}
```

Response:
```json
{
  "id": 0,
  "patient": 0,
  "doctor": 0,
  "appointment_type": "Online",
  "appointment_status": "Pendding",
  "symptoms": "string",
  "time": 0,
  "cancel": false
}
```

#### Get an appointment

```
GET /appointments/{id}/
```

Get a specific appointment by ID.

Response:
```json
{
  "id": 0,
  "patient": 0,
  "doctor": 0,
  "appointment_type": "Online",
  "appointment_status": "Pendding",
  "symptoms": "string",
  "time": 0,
  "cancel": false
}
```

#### Update an appointment

```
PUT /appointments/{id}/
```

Update a specific appointment by ID.

Request body:
```json
{
  "doctor": 0,
  "appointment_type": "Online",
  "symptoms": "string",
  "time": 0,
  "cancel": false
}
```

Response: Same as Get an appointment.

#### Partially update an appointment

```
PATCH /appointments/{id}/
```

Partially update a specific appointment by ID.

Request body: Same as Update an appointment, but all fields are optional.

Response: Same as Get an appointment.

#### Delete an appointment

```
DELETE /appointments/{id}/
```

Delete a specific appointment by ID.

Response: 204 No Content

### Services

#### List services

```
GET /services/
```

Get a list of services.

Response:
```json
[
  {
    "id": 0,
    "image": "string",
    "name": "string",
    "description": "string"
  }
]
```

#### Create a service

```
POST /services/
```

Create a new service.

Request body (multipart/form-data):
- `image`: file
- `name`: string
- `description`: string

Response:
```json
{
  "id": 0,
  "image": "string",
  "name": "string",
  "description": "string"
}
```

#### Get a service

```
GET /services/{id}/
```

Get a specific service by ID.

Response:
```json
{
  "id": 0,
  "image": "string",
  "name": "string",
  "description": "string"
}
```

#### Update a service

```
PUT /services/{id}/
```

Update a specific service by ID.

Request body (multipart/form-data):
- `image`: file
- `name`: string
- `description`: string

Response: Same as Get a service.

#### Partially update a service

```
PATCH /services/{id}/
```

Partially update a specific service by ID.

Request body (multipart/form-data): Same as Update a service, but all fields are optional.

Response: Same as Get a service.

#### Delete a service

```
DELETE /services/{id}/
```

Delete a specific service by ID.

Response: 204 No Content

### Contacts

#### List contacts

```
GET /contacts/
```

Get a list of contacts.

Response:
```json
[
  {
    "id": 0,
    "name": "string",
    "phone": "string",
    "massage": "string"
  }
]
```

#### Create a contact

```
POST /contacts/
```

Create a new contact.

Request body:
```json
{
  "name": "string",
  "phone": "string",
  "massage": "string"
}
```

Response:
```json
{
  "id": 0,
  "name": "string",
  "phone": "string",
  "massage": "string"
}
```

#### Get a contact

```
GET /contacts/{id}/
```

Get a specific contact by ID.

Response:
```json
{
  "id": 0,
  "name": "string",
  "phone": "string",
  "massage": "string"
}
```

#### Update a contact

```
PUT /contacts/{id}/
```

Update a specific contact by ID.

Request body:
```json
{
  "name": "string",
  "phone": "string",
  "massage": "string"
}
```

Response: Same as Get a contact.

#### Partially update a contact

```
PATCH /contacts/{id}/
```

Partially update a specific contact by ID.

Request body: Same as Update a contact, but all fields are optional.

Response: Same as Get a contact.

#### Delete a contact

```
DELETE /contacts/{id}/
```

Delete a specific contact by ID.

Response: 204 No Content