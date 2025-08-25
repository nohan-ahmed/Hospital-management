from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('doctors', views.DoctorViewSet, basename='doctors')
router.register('available-time', views.AvailableTimeViewSet, basename='available_time')
router.register('reviews', views.ReviewViewSet, basename='reviews')
router.register('designations', views.DesignationViewSet, basename='designations')
router.register('specialisations', views.SpecialisationViewSet, basename='specialisations')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]