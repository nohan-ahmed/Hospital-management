from django.shortcuts import render
from rest_framework import viewsets
from . import serializers
from .models import Doctor, AvailableTime, Designation, Specialisation, Review
# Create your views here.

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = serializers.DoctorSerializer

class AvailableTimeViewSet(viewsets.ModelViewSet):
    queryset = AvailableTime.objects.all()
    serializer_class = serializers.AvailableTimeSerializer

class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = serializers.DesignationSerializer

class SpecialisationViewSet(viewsets.ModelViewSet):
    queryset = Specialisation.objects.all()
    serializer_class = serializers.SpecialisationSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = serializers.ReviewSerializer

