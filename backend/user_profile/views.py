from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, smart_str
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.throttling import UserRateThrottle, ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from patient.models import Patient

from .models import UserProfile
from .serializers import UserProfileSerializer, UserListSerializer, RegistrationSerializer, LoginSerializer, LogoutSerializer, UserSerializer

# Utility function for generating tokens
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
from hospital_management.paginations import StandardResultsSetPagination
from hospital_management.permissions import IsOwnerOrReadOnly

class IsOwnerOrAdmin(permissions.BasePermission):
    """Custom permission to only allow owners or admins to edit."""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner or admin
        return obj.user == request.user or request.user.is_staff

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    
    def get_queryset(self):
        # Admin can see all profiles, users can only see their own
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the current user's profile"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"detail": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    def get_queryset(self):
        # Admin can see all users, regular users see limited info
        queryset = User.objects.all()
        return queryset

class RegistrationAPIView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'Auth'
    
    def post(self, request, format=None):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set user as active by default
        user = serializer.save(is_active=True)
        
        # UserProfile and Patient will be created automatically via signals
        
        # Generate tokens for immediate login
        tokens = get_tokens_for_user(user)
        
        return Response({
            'message': 'Registration successful',
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class VerityEmailAPIView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'Auth'
    def get(self, request, uid, token, format=None):
        user_id = urlsafe_base64_decode(smart_str(uid))
        user = User.objects.get(pk=user_id)

        # validate the token
        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            # create paint account
            Patient.objects.create(user=user)
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

class LoginAPIView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'Auth'
    
    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username= serializer.validated_data.get('username')
        password= serializer.validated_data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            token = get_tokens_for_user(user)
            return Response(token, status=status.HTTP_200_OK)
        return Response({'error':'Login credentials is not valid!'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutAPIView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'Auth'
    permission_classes = (IsAuthenticated,)
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            # JWT is stateless, which means that once a token is generated, it cannot be "deleted" on the server side. 
            # So if you want to logout, just blacklist the refresh token. 
            token.blacklist()

            return Response({"message": "Logout successfully!"},status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid refresh token"},status=status.HTTP_400_BAD_REQUEST)

# UsersAPIView has been replaced by UserListView