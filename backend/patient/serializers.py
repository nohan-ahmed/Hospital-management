from rest_framework import serializers
from .models import Patient
from django.contrib.auth.models import User

class PateintSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Patient
        fields = "__all__"
        
    def create(self, validated_data):
        # Create a Patient instance without a user assigned yet
        patient = Patient(**validated_data) 
        # Assign the currently authenticated user
        patient.user = self.context.get('request').user  
        # Save the Patient instance to the database
        patient.save()
        return patient
    
# No authentication-related serializers needed here anymore
        