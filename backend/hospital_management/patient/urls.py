from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

router = DefaultRouter()
router.register('', views.PateintView)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('register/', views.RegistrationAPIView.as_view()),
    path('verify-email/<uid>/<token>/', views.VerityEmailAPIView.as_view()),
    path('login/', views.LoginAPIView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]