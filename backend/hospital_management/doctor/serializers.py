from rest_framework import serializers
from .models import Doctor, AvailableTime, Designation, Specialisation, Review


class DoctorSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    designation = serializers.StringRelatedField(many=True)
    specialisation = serializers.StringRelatedField(many=True)
    available_time = serializers.StringRelatedField(many=True)

    class Meta:
        model = Doctor
        fields = "__all__"


class DesignationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designation
        fields ='__all__'
        
class SpecialisationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialisation
        fields ='__all__'
        
class AvailableTimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailableTime
        fields ='__all__'
        
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields ='__all__'