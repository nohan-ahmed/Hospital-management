from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.PateintView)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]