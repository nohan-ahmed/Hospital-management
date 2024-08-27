from rest_framework import serializers
from .models import Pateint


class PateintSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Pateint
        fields = "__all__"
