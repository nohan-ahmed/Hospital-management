from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.throttling import ScopedRateThrottle
from .models import ContactUs
from .serializers import ContactUsSerializer


class ContactUsViewSet(viewsets.ModelViewSet):
    queryset = ContactUs.objects.all()
    serializer_class = ContactUsSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'Auth'