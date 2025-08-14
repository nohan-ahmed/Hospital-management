from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Instance must have an attribute named `owner`.
        return obj.user == request.user
    
class IsAdminUserOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return True if request.user.is_staff else False

class IsAdminUser(permissions.BasePermission):
    """Allow access only to admin users."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsDoctorUser(permissions.BasePermission):
    """Allow access only to users with doctor role."""
    
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'profile') and request.user.profile.role == 'doctor'

class IsPatientUser(permissions.BasePermission):
    """Allow access only to users with patient role."""
    
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'profile') and request.user.profile.role == 'patient'

class IsStaffUser(permissions.BasePermission):
    """Allow access only to users with staff role."""
    
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'profile') and request.user.profile.role == 'staff'
        
        