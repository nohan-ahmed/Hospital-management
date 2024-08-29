from rest_framework import serializers
from . import models


class AppointmentSerializer(serializers.ModelSerializer):
    # time = serializers.StringRelatedField(many=False)
    # pateint = serializers.StringRelatedField(many=False)
    # doctor = serializers.StringRelatedField(many=False)
    class Meta:
        model = models.Appointment
        fields = "__all__"
        extra_kwargs = {
            "patient": {"read_only": True},
            "appointment_status": {"read_only": True},
        }
