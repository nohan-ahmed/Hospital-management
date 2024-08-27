from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from . models import Appointment
from .serializers import AppointmentSerializer
# Create your views here.

class AppointmentAPIView(ModelViewSet):
    queryset= Appointment.objects.all()
    serializer_class = AppointmentSerializer

    # You can customize your queryset using get_queryset(self) method.
    def get_queryset(self): 
        queryset= super().get_queryset()
        # What is query parameters?
        # Query params basically আমরা URL এর মধ্যে query করার জন্য যে parameters গুলো পাঠাই সেটাকে Query_params বলে and you cna pass multiple Query_params using & symbol
        # example: https: http://127.0.0.1:8000/appointments/?patient_id=1
    
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            queryset = queryset.filter(patient=patient_id)
            
        doctor_id = self.request.query_params.get('doctor_id')
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
            
        return queryset
    
    def perform_create(self, serializer):
        """
        perform_create Method: This method is a hook provided by Django REST Framework's ModelViewSet. 
        It allows you to customize the creation of a model instance without completely overriding the create method.
        """
        
        """
        Setting the pateint: By calling serializer.save(author=self.request.user.pateint), you automatically set the author field to the currently authenticated user when a post is created.
        This ensures that the pateint is set correctly and prevents users from tampering with the field.
        """
        serializer.save(pateint=self.request.user.pateint)