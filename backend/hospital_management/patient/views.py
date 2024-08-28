from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, smart_str
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
# DRF
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Pateint
from .serializers import PateintSerializer, RegistrationSerializer, LoginSerializer
from .utils import get_tokens_for_user
# Create your views here.

class PateintView(viewsets.ModelViewSet):
    queryset = Pateint.objects.all()
    serializer_class = PateintSerializer

class RegistrationAPIView(APIView):
    def post(self, request, format=None):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.validated_data.setdefault('is_active', False)
        user = serializer.save()

        # Generate a password reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.id))

        verification_link = f"{request.build_absolute_uri('/patients/verify-email/')}{uid}/{token}/"
        subject = "Confirm your eamil"

        message = render_to_string('./patient/verification_mail.html',{
            'user': user,
            'verification_link': verification_link,
        })
        send_mail(subject, strip_tags(message), settings.DEFAULT_FROM_EMAIL, [user.email])

        return Response(status=status.HTTP_200_OK)

class VerityEmailAPIView(APIView):
    def get(self, request, uid, token, format=None):
        user_id = urlsafe_base64_decode(smart_str(uid))
        user = User.objects.get(pk=user_id)

        # validate the token
        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

class LoginAPIView(APIView):
    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username= serializer.validated_data.get('username')
        password= serializer.validated_data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            token = get_tokens_for_user(user)
            return Response(token, status=status.HTTP_200_OK)
        return Response({'error':'Login credentials is not valid!'}, status=status.HTTP_400_BAD_REQUEST)
    
