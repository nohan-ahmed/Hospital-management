from django.shortcuts import render
from rest_framework import viewsets
from .models import Service
from .serializers import ServiceSerializer
# Create your views here.


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    