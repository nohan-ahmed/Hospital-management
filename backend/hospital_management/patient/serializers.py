from rest_framework import serializers
from .models import Pateint
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError

class PateintSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Pateint
        fields = "__all__"

class RegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(style={'input_type': 'password'}, write_only=True,  required=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'confirm_password']
        extra_kwargs = {'password':{'write_only':True}}

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password =attrs.pop('confirm_password')
        if password != confirm_password:
            raise serializers.ValidationError("Password and confirm_password don't match")
        try:
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})

        return attrs

    # To create a new user instance you need to override the create() method for the RegisterSerializer class.
    def create(self, validated_data):
        # Remove the password from validated_data and use set_password to hash it.
        password = validated_data.pop("password")

        # Create a new user instance without saving to the database yet.
        user = User(**validated_data)

        # Set the password which automatically hashes it.
        user.set_password(password)

        # Now save the user with the hashed password.
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    password = serializers.CharField(style={'input_type':'password'})
