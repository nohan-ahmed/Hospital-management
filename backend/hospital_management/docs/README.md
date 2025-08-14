# Hospital Management System API Documentation

This directory contains comprehensive API documentation for the **Hospital Management System** project.

---

## Documentation Files

### 1. OpenAPI Specification (`openapi.yaml`)
A complete OpenAPI 3.0 specification that defines:

- All API endpoints
- Request/response structures
- Authentication methods
- Data models and schemas
- Error responses

> This file serves as the source of truth for the API and can be used with various tools to generate client libraries, server stubs, or interactive documentation.

[View `openapi.yaml`](./openapi.yaml)

---

### 2. API Guide (`api_guide.md`)
A detailed Markdown document providing:

- Explanations of all endpoints
- Authentication information
- Rate limiting and pagination details
- Request and response examples
- Common error responses

> This guide is organized by resource type for easy navigation and intended for developers who need to understand how to use the API.

[Read the API Guide](./api_guide.md)

---

### 3. Interactive Documentation (`swagger.html`)
An HTML interface using **Swagger UI** that:

- Loads the OpenAPI specification
- Provides an interactive way to explore the API
- Allows testing API calls directly from the browser
- Displays request/response schemas in a user-friendly format

[Open Swagger UI](./swagger.html)

---

## How to Use

1. **View OpenAPI Specification**: Open `openapi.yaml` in a text editor or OpenAPI viewer  
2. **Read API Guide**: Open `api_guide.md` in a Markdown viewer or browser  
3. **Interactive Documentation**: Open `swagger.html` in a web browser to explore the API interactively

---

## API Overview

The **Hospital Management System API** provides endpoints for managing:

- **Users and Authentication**: Registration, login, logout, token refresh  
- **User Profiles**: User information and profile management  
- **Patients**: Patient registration and management  
- **Doctors**: Profiles, specializations, designations, available times  
- **Reviews**: Patient reviews for doctors  
- **Appointments**: Scheduling and managing appointments  
- **Services**: Hospital services information  
- **Contacts**: Contact form submissions

---

## Authentication

The API uses **JWT (JSON Web Token) authentication**.  
Most endpoints require a valid access token in the `Authorization` header:

```http
Authorization: Bearer your_access_token
