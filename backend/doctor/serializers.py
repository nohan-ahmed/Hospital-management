from rest_framework import serializers
from .models import Doctor, AvailableTime, Designation, Specialisation, Review


class DoctorSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    designation = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    specialisation = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )


    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'profile', 'designation',
            'specialisation', 'available_time', 'fee', 'meet_link'
        ]

    def get_user(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


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
    reviewer = serializers.CharField(source='reviwer.user.first_name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'doctor', 'rating', 'body', 'created_on']
