from django.shortcuts import render
from .models import ContactUs
from rest_framework import viewsets
from .serializers import ContactUsSerializer


class ContactUsViewSet(viewsets.ModelViewSet):
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer