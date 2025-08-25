from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.AppointmentAPIView, basename='appointment')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]