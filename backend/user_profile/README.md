# User Profile App

This Django app provides user profile management functionality for the Hospital Management System.

## Features

- User profile management with role-based access control
- Support for multiple user roles: Admin, Doctor, Patient, and Staff
- Custom permissions for role-based access
- API endpoints for user profile management
- Automatic profile creation for new users

## Models

### UserProfile

Extends the Django User model with additional fields:

- `user`: One-to-one relationship with Django's User model
- `role`: User role (Admin, Doctor, Patient, Staff)
- `bio`: User biography
- `address`: User address
- `date_of_birth`: User's date of birth
- `profile_picture`: User's profile image
- `created_at`: Timestamp when profile was created
- `updated_at`: Timestamp when profile was last updated

## API Endpoints

- `/api/user/profiles/`: List and manage user profiles
- `/api/user/profiles/<id>/`: Retrieve, update or delete a specific profile
- `/api/user/users/`: List all users with role information

## Permissions

The app implements custom permissions:

- `IsOwnerOrAdmin`: Allow users to edit only their own profiles (unless they're admins)
- `IsAdminUser`: Allow access only to users with admin role
- `IsDoctorUser`: Allow access only to users with doctor role
- `IsPatientUser`: Allow access only to users with patient role
- `IsStaffUser`: Allow access only to users with staff role

## Management Commands

### create_user_roles

Creates initial test users with different roles:

```bash
python manage.py create_user_roles
```

To skip the confirmation prompt:

```bash
python manage.py create_user_roles --no-input
```

This command creates the following test users:

1. Admin User (username: admin_user, password: adminpassword123)
2. Doctor User (username: doctor_user, password: doctorpassword123)
3. Patient User (username: patient_user, password: patientpassword123)
4. Staff User (username: staff_user, password: staffpassword123)

## Integration

The app automatically creates user profiles when new users are registered through Django's built-in User model, and assigns appropriate roles based on related objects or staff status.